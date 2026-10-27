import { ReactElement } from 'react';
import { ReactNode } from 'react';

/** Derive a client-side row model. Inputs and row objects are never mutated. */
export declare const buildClusterTableModel: <T extends object>(data: readonly T[], columns: readonly ClusterColumn<T>[], requestedState?: ClusterTableState) => ClusterTableModel<T>;

export declare interface ClusterColumn<T extends object> {
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

export declare const ClusterTable: <T extends object>({ data, getRowId, columns: providedColumns, ariaLabel, initialState, state: controlledState, onStateChange, persistence, isLoading, error, isCompact, hasDraggableHeaders, }: ClusterTableProps<T>) => ReactElement;

export declare interface ClusterTableColumn<T extends object> extends ClusterColumn<T> {
    /** optional cell presentation; sorting and filtering still use the raw accessor */
    cell?: (value: unknown, row: T) => ReactNode;
}

export declare interface ClusterTableModel<T extends object> {
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

export declare interface ClusterTablePersistence {
    /** unique table key; include user or workspace identity when preferences should be separate */
    key: string;
    /** browser storage to use; defaults to local storage */
    storage?: 'local' | 'session';
}

export declare interface ClusterTableProps<T extends object> {
    /** complete client-side data set; replace the array when data changes */
    data: readonly T[];
    /** stable unique row identifier; never use a visible row index */
    getRowId: (row: T) => string;
    /** explicit schema; when omitted, infer the union of top-level keys */
    columns?: readonly ClusterTableColumn<T>[];
    /** accessible table name */
    ariaLabel?: string;
    /** initial uncontrolled state, read once on mount */
    initialState?: Partial<ClusterTableState>;
    /** controlled state; supply onStateChange to accept user changes */
    state?: ClusterTableState;
    /** next state after a user interaction, suitable for persistence */
    onStateChange?: (state: ClusterTableState) => void;
    /** opt-in storage for uncontrolled search, filters and column preferences; defaults to local */
    persistence?: ClusterTablePersistence;
    /** display a loading state */
    isLoading?: boolean;
    /** host-provided loading error */
    error?: string;
    /** use compact row spacing */
    isCompact?: boolean;
    /** add header drag handles; Manage columns keeps its draggable list */
    hasDraggableHeaders?: boolean;
}

export declare interface ClusterTableSort {
    /** column identifier to sort */
    columnId: string;
    /** ascending or descending order */
    direction: 'asc' | 'desc';
}

export declare interface ClusterTableState {
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

/** Create an independent state object suitable for controlled or uncontrolled tables. */
export declare const createClusterTableState: (overrides?: Partial<ClusterTableState>) => ClusterTableState;

/** Format raw values consistently without rendering arbitrary objects as React children. */
export declare const formatClusterValue: (value: unknown) => string;

/** Infer first-seen top-level keys across every row, without requiring an index signature. */
export declare const inferClusterColumns: <T extends object>(data: readonly T[]) => ClusterColumn<T>[];

/** Move a column to another column's position; invalid IDs leave the order unchanged. */
export declare const reorderClusterColumns: (order: readonly string[], sourceId: string, targetId: string) => string[];

export { }
