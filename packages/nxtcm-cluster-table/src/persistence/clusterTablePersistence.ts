import type { ClusterTableState } from '../engine/types';

export interface ClusterTablePersistence {
  /** unique table key; include user or workspace identity when preferences should be separate */
  key: string;
  /** browser storage to use; defaults to local storage */
  storage?: 'local' | 'session';
}

type ClusterTablePreferences = Pick<
  ClusterTableState,
  'search' | 'filters' | 'columnOrder' | 'hiddenColumnIds'
>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item: unknown) => typeof item === 'string');

const isStringRecord = (value: unknown): value is Record<string, string> =>
  isRecord(value) && Object.values(value).every((item) => typeof item === 'string');

const getStorage = ({ storage }: ClusterTablePersistence): Storage | undefined => {
  if (typeof window === 'undefined') return undefined;
  return storage === 'session' ? window.sessionStorage : window.localStorage;
};

/** Read only the supported preferences; malformed or incompatible entries are ignored. */
export const readClusterTablePreferences = (
  persistence: ClusterTablePersistence
): ClusterTablePreferences | undefined => {
  if (!persistence.key.trim()) return undefined;
  try {
    const serialized = getStorage(persistence)?.getItem(`nxtcm-cluster-table:${persistence.key}`);
    if (!serialized) return undefined;
    const value: unknown = JSON.parse(serialized);
    if (
      !isRecord(value) ||
      value.version !== 1 ||
      typeof value.search !== 'string' ||
      !isStringRecord(value.filters) ||
      !isStringArray(value.columnOrder) ||
      !isStringArray(value.hiddenColumnIds)
    ) {
      return undefined;
    }
    return {
      search: value.search,
      filters: value.filters,
      columnOrder: value.columnOrder,
      hiddenColumnIds: value.hiddenColumnIds,
    };
  } catch {
    // Browser storage can be disabled, inaccessible, or contain invalid JSON.
    return undefined;
  }
};

/** Persist preferences only; storage failure must not interrupt in-memory interactions. */
export const writeClusterTablePreferences = (
  persistence: ClusterTablePersistence,
  { search, filters, columnOrder, hiddenColumnIds }: ClusterTableState
): void => {
  if (!persistence.key.trim()) return;
  try {
    getStorage(persistence)?.setItem(
      `nxtcm-cluster-table:${persistence.key}`,
      JSON.stringify({ version: 1, search, filters, columnOrder, hiddenColumnIds })
    );
  } catch {
    // Keep the table usable when storage is unavailable or its quota is exhausted.
  }
};
