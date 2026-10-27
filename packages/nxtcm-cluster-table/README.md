# Cluster table

`@redhat-cloud-services/nxtcm-cluster-table` provides a generic PatternFly v6 table and a reusable, framework-independent client-side engine.

## Quick start

Install this package alongside React 18 or 19, React DOM, and its PatternFly peers: `@patternfly/react-core`, `@patternfly/react-icons`, `@patternfly/react-table`, and `@patternfly/react-drag-drop`. Load PatternFly base styles once in the host application.

```tsx
import '@patternfly/react-core/dist/styles/base.css';
import { ClusterTable } from '@redhat-cloud-services/nxtcm-cluster-table';

const clusters = [
  { id: 'rosa-1', name: 'production', type: 'ROSA HCP', nodes: 12 },
  { id: 'acm-1', name: 'edge', type: 'Imported', nodes: 2, managedBy: 'ACM' },
];

<ClusterTable
  data={clusters}
  getRowId={(cluster) => cluster.id}
  ariaLabel="Cluster inventory"
  initialState={{ hiddenColumnIds: ['id'], perPage: 10 }}
/>;
```

Columns are inferred from the union of own, enumerable top-level keys across **all** supplied rows, in first-seen order. Headers split camelCase, underscores, and hyphens. Missing values display `—`. Arrays and objects display as JSON; nested objects are not automatically flattened. Empty data has no inferred schema; provide `columns` to keep headings visible when no rows exist.

Inference includes every field. Supply explicit columns when only selected fields should be displayed or searched. Replace the data array when records change.

## Explicit columns and nested data

```tsx
import { ClusterTable, type ClusterTableColumn } from '@redhat-cloud-services/nxtcm-cluster-table';

interface ManagedCluster {
  metadata: { uid: string; name: string };
  status: { workers: number };
}

const columns: ClusterTableColumn<ManagedCluster>[] = [
  { id: 'name', header: 'Cluster name', accessor: (row) => row.metadata.name },
  { id: 'workers', header: 'Worker nodes', accessor: (row) => row.status.workers },
];

// data: ManagedCluster[] supplied by the host
<ClusterTable data={data} columns={columns} getRowId={(row) => row.metadata.uid} />;
```

Each column requires a unique, stable `id`, a string `header`, and an `accessor`. Optional `cell(value, row)` customizes rendering; `compare(leftRow, rightRow)` customizes ascending sort order; `filterText(row)` customizes searchable text. `sortable: false` and `filterable: false` disable those features. Filtering and sorting use raw values, independent of custom cell markup.

## Interactions and state

- Click a heading to sort; click again to reverse direction. Numbers, booleans, and Date objects sort by value. Strings sort naturally (`cluster-2` before `cluster-10`). Missing values stay last, and ties preserve input order.
- Search matches any filterable column. Use the filter button beside a column heading to open its text filter. Filters apply as you type, use case-insensitive substring matching, and combine with AND. Active filters have highlighted buttons. Clear an individual filter in its popover, or use **Clear filters** in the toolbar to reset search and all filters, including hidden columns. Escape closes the popover and returns focus to its button. Hidden columns still participate in filtering and sorting.
- **Manage columns** controls visibility and ordering. Drag by the handle, use Space/arrow keys/Space on a handle. Reordering preserves filters and sorting by column ID.
- Set `hasDraggableHeaders` to add drag handles directly to column headers. Drag a handle onto another header to move the column, or press Space/Enter, use the left/right arrow keys, and press Space/Enter again. Escape or dropping outside the headers cancels. Header dragging and **Manage columns** both update the same order; the draggable management list remains available. Sorting and filtering have separate controls. Hidden columns retain their relative order, and header changes are saved when persistence is enabled.
- Pagination applies after filtering and sorting. Search, filter, and page-size changes return to page one. The effective page is clamped when rows disappear.
- Column headings always retain their full names on one line. When the columns exceed the container width, the table scrolls horizontally; the toolbar and pagination stay outside the scroll area. The scroll region is keyboard focusable.

`initialState` initializes uncontrolled preferences once. For host-owned preferences, pass a complete `state` and accept updates through `onStateChange`:

```tsx
const [state, setState] = useState(() => createClusterTableState({ perPage: 20 }));

<ClusterTable data={clusters} getRowId={(row) => row.id} state={state} onStateChange={setState} />;
```

State contains `search`, `filters`, `sort`, `columnOrder`, `hiddenColumnIds`, `page`, and `perPage`. Unknown column IDs are ignored and new columns are appended. Rendering normalizes state without firing callbacks; `onStateChange` fires only for user actions and includes the effective current state. Consumers can persist this serializable state in their own storage. Choose either controlled or uncontrolled usage for a component's lifetime.

`isLoading`, `error`, and `isCompact` control display states. The host owns fetching, errors, retries, and row identity. The component makes no HTTP calls.

## Persistent filters and columns

Enable built-in persistence with a stable key unique to this table:

```tsx
<ClusterTable
  data={clusters}
  getRowId={(row) => row.id}
  persistence={{ key: 'cluster-inventory' }}
/>;
```

Local storage is the default, so preferences survive reloads and browser restarts. For tab-scoped preferences, use `persistence={{ key: 'cluster-inventory', storage: 'session' }}`. Omit `persistence` to keep state only in memory. The configuration type is exported as `ClusterTablePersistence`.

- Saves global search, column filters, column order, and hidden column IDs. Cluster records, sorting, pagination, and open popovers are not saved.
- Restores saved preferences over `initialState`, with the first page selected. Initial sorting and page size still apply. Unknown column IDs are ignored and new columns are appended by the engine.
- **Clear filters** also clears the saved search and filters while preserving managed columns.
- Changing the key or storage option loads that configuration's preferences, falling back to the original `initialState` if none exist. Use keys that include user/workspace identity when those preferences should be separate. Keys are stored as `nxtcm-cluster-table:<key>` under the application's origin.
- Malformed entries, unsupported saved versions, disabled storage, and quota errors fall back to in-memory behavior. Rendering and asynchronous data loading do not overwrite saved preferences. Server rendering uses `initialState`; browser hydration then restores saved preferences.
- Preferences are read when the table mounts or its key/storage option changes and written on user interactions. Open tables do not synchronize live across tabs or table instances.

Built-in persistence applies to **uncontrolled tables**. When `state` is supplied, the host remains the source of truth and owns storage through `state` / `onStateChange`; the `persistence` option is ignored. Restoring preferences does not call `onStateChange`.

Storybook's **Persisted Preferences** and **Session Preferences** examples include a **Remount table** button to demonstrate restoration without reloading the page.

## Headless engine

`inferClusterColumns(data)`, `createClusterTableState(overrides)`, `buildClusterTableModel(data, columns, state)`, `reorderClusterColumns(order, sourceId, targetId)`, and `formatClusterValue(value)` are public helpers. `buildClusterTableModel` returns ordered columns, visible columns, page rows, filtered count, and normalized state without mutating input. Import the engine types as `ClusterColumn`, `ClusterTableState`, `ClusterTableSort`, and `ClusterTableModel`.

## Storybook and validation

Run `npm run storybook` at the repository root and open **Components → ClusterTable → ClusterTable**. Examples cover heterogeneous cluster data, explicit/custom cells, nested fields, pagination, controlled state, compact spacing, and all loading/empty/error states. **Draggable Headers** enables header handles alongside the draggable Manage columns list and persists their shared order.

```sh
npm test -- packages/nxtcm-cluster-table
npm run test:ct -- packages/nxtcm-cluster-table
npm run build -w @redhat-cloud-services/nxtcm-cluster-table
```

This initial engine handles the complete in-memory data set supplied to it. It does not provide backend pagination, virtualization, editing, selection, grouping, resizing, or AG Grid API compatibility. The implementation plan is in [docs/cluster-table-plan.md](../../docs/cluster-table-plan.md).
