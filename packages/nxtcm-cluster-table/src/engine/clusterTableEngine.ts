import type { ClusterColumn, ClusterTableModel, ClusterTableState } from './types';

/** Create an independent state object suitable for controlled or uncontrolled tables. */
export const createClusterTableState = (
  overrides: Partial<ClusterTableState> = {}
): ClusterTableState => ({
  search: '',
  filters: {},
  sort: null,
  columnOrder: [],
  hiddenColumnIds: [],
  page: 1,
  perPage: 10,
  ...overrides,
});

const humanize = (key: string): string => {
  const words = key
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
  return words ? words[0].toUpperCase() + words.slice(1) : key || 'Column';
};

/** Infer first-seen top-level keys across every row, without requiring an index signature. */
export const inferClusterColumns = <T extends object>(data: readonly T[]): ClusterColumn<T>[] => {
  const keys = new Set(data.flatMap((row) => Object.keys(row)));
  return Array.from(keys, (key) => ({
    id: key,
    header: humanize(key),
    accessor: (row: T): unknown =>
      Object.prototype.hasOwnProperty.call(row, key) ? Reflect.get(row, key) : undefined,
  }));
};

/** Format raw values consistently without rendering arbitrary objects as React children. */
export const formatClusterValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  if (typeof value === 'boolean' || typeof value === 'bigint') return String(value);
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value) ?? '';
    } catch {
      return '[Complex value]';
    }
  }
  return '';
};

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
const isMissing = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === 'number' && !Number.isFinite(value)) ||
  (value instanceof Date && Number.isNaN(value.getTime()));

const compareValues = (left: unknown, right: unknown): number => {
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  if (typeof left === 'boolean' && typeof right === 'boolean') return Number(left) - Number(right);
  if (left instanceof Date && right instanceof Date) return left.getTime() - right.getTime();
  return collator.compare(formatClusterValue(left), formatClusterValue(right));
};

/** Move a column to another column's position; invalid IDs leave the order unchanged. */
export const reorderClusterColumns = (
  order: readonly string[],
  sourceId: string,
  targetId: string
): string[] => {
  const next = [...order];
  const from = next.indexOf(sourceId);
  const to = next.indexOf(targetId);
  if (from < 0 || to < 0 || from === to) return next;
  next.splice(from, 1);
  next.splice(to, 0, sourceId);
  return next;
};

const positiveInteger = (value: number, fallback: number): number =>
  Number.isFinite(value) ? Math.max(1, Math.floor(value)) : fallback;

/** Derive a client-side row model. Inputs and row objects are never mutated. */
export const buildClusterTableModel = <T extends object>(
  data: readonly T[],
  columns: readonly ClusterColumn<T>[],
  requestedState: ClusterTableState = createClusterTableState()
): ClusterTableModel<T> => {
  const byId = new Map(columns.map((column) => [column.id, column]));
  if (byId.size !== columns.length) throw new Error('Cluster table column IDs must be unique.');
  const orderedIds = [...new Set([...requestedState.columnOrder, ...byId.keys()])].filter((id) =>
    byId.has(id)
  );
  const orderedColumns = orderedIds.flatMap((id) => {
    const column = byId.get(id);
    return column ? [column] : [];
  });
  const filterColumns = orderedColumns.filter((column) => column.filterable !== false);
  const filters = Object.fromEntries(
    filterColumns.flatMap((column) => {
      const text = Object.prototype.hasOwnProperty.call(requestedState.filters, column.id)
        ? requestedState.filters[column.id]
        : '';
      return text?.trim() ? [[column.id, text]] : [];
    })
  );
  const search = requestedState.search.trim().toLocaleLowerCase();
  const getText = (column: ClusterColumn<T>, row: T): string =>
    (column.filterText?.(row) ?? formatClusterValue(column.accessor(row))).toLocaleLowerCase();
  const filtered = data.filter(
    (row) =>
      (!search || filterColumns.some((column) => getText(column, row).includes(search))) &&
      filterColumns.every(
        (column) =>
          !Object.prototype.hasOwnProperty.call(filters, column.id) ||
          getText(column, row).includes(filters[column.id].trim().toLocaleLowerCase())
      )
  );
  const sortColumn = requestedState.sort ? byId.get(requestedState.sort.columnId) : undefined;
  const sort = sortColumn && sortColumn.sortable !== false ? requestedState.sort : null;
  if (sort && sortColumn) {
    filtered.sort((left, right) => {
      const leftValue = sortColumn.accessor(left);
      const rightValue = sortColumn.accessor(right);
      const leftMissing = isMissing(leftValue);
      const rightMissing = isMissing(rightValue);
      if (leftMissing || rightMissing) return Number(leftMissing) - Number(rightMissing);
      const comparison = sortColumn.compare?.(left, right) ?? compareValues(leftValue, rightValue);
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }
  const perPage = positiveInteger(requestedState.perPage, 10);
  const page = Math.min(
    positiveInteger(requestedState.page, 1),
    Math.max(1, Math.ceil(filtered.length / perPage))
  );
  const hiddenColumnIds = [...new Set(requestedState.hiddenColumnIds)].filter((id) => byId.has(id));
  return {
    columns: orderedColumns,
    visibleColumns: orderedColumns.filter((column) => !hiddenColumnIds.includes(column.id)),
    rows: filtered.slice((page - 1) * perPage, page * perPage),
    filteredCount: filtered.length,
    state: {
      ...requestedState,
      filters,
      sort,
      columnOrder: orderedIds,
      hiddenColumnIds,
      page,
      perPage,
    },
  };
};
