export interface ClusterColumn<T extends object> {
  /** stable unique column identifier */
  id: string;
  /** visible column heading */
  header: string;
  /** raw value used for display, sorting and filtering */
  accessor: (row: T) => unknown;
  /** allow sorting; defaults to true */
  sortable?: boolean;
  /** allow global and column filtering; defaults to true */
  filterable?: boolean;
  /** optional domain-specific ascending comparison */
  compare?: (left: T, right: T) => number;
  /** optional text used by both global and column filtering */
  filterText?: (row: T) => string;
}

export interface ClusterTableSort {
  /** column identifier to sort */
  columnId: string;
  /** ascending or descending order */
  direction: 'asc' | 'desc';
}

export interface ClusterTableState {
  /** global case-insensitive search */
  search: string;
  /** case-insensitive substring filters keyed by column identifier */
  filters: Readonly<Record<string, string>>;
  /** active sort, or null for input order */
  sort: ClusterTableSort | null;
  /** ordered column identifiers; omitted columns are appended */
  columnOrder: readonly string[];
  /** identifiers of columns hidden from the table */
  hiddenColumnIds: readonly string[];
  /** one-based requested page */
  page: number;
  /** number of rows per page */
  perPage: number;
}

export interface ClusterTableModel<T extends object> {
  /** all columns in the resolved order, including hidden columns */
  columns: readonly ClusterColumn<T>[];
  /** visible columns in the resolved order */
  visibleColumns: readonly ClusterColumn<T>[];
  /** filtered and sorted rows on the effective page */
  rows: readonly T[];
  /** number of rows after filtering and before pagination */
  filteredCount: number;
  /** normalized state with stale column references removed and page clamped */
  state: ClusterTableState;
}
