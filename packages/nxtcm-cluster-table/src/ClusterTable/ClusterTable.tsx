import { type ReactElement, type ReactNode, useId, useMemo, useState } from 'react';

import { Alert, AlertVariant } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { Button, ButtonVariant } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Checkbox } from '@patternfly/react-core/dist/dynamic/components/Checkbox';
import {
  DataList,
  DataListCell,
  DataListItemCells,
} from '@patternfly/react-core/dist/dynamic/components/DataList';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import {
  ExpandableSection,
  ExpandableSectionToggle,
} from '@patternfly/react-core/dist/dynamic/components/ExpandableSection';
import {
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core/dist/dynamic/components/Pagination';
import { SearchInput } from '@patternfly/react-core/dist/dynamic/components/SearchInput';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core/dist/dynamic/components/Toolbar';
import { Stack, StackItem } from '@patternfly/react-core/dist/dynamic/layouts/Stack';
import { DragDropSort } from '@patternfly/react-drag-drop';
import {
  InnerScrollContainer,
  Table,
  TableGridBreakpoint,
  TableVariant,
  Tbody,
  Td,
  Thead,
  Tr,
} from '@patternfly/react-table/dist/dynamic/components/Table';

import { ClusterTableHeader } from '../ClusterTableHeader';
import { ColumnDragProvider } from '../ColumnDragProvider';
import {
  buildClusterTableModel,
  formatClusterValue,
  inferClusterColumns,
  reorderClusterColumns,
} from '../engine/clusterTableEngine';
import type { ClusterColumn, ClusterTableState } from '../engine/types';
import type { ClusterTablePersistence } from '../persistence/clusterTablePersistence';
import { useClusterTableState } from '../persistence/useClusterTableState';

export interface ClusterTableColumn<T extends object> extends ClusterColumn<T> {
  /** optional cell presentation; sorting and filtering still use the raw accessor */
  cell?: (value: unknown, row: T) => ReactNode;
}

export interface ClusterTableProps<T extends object> {
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

export const ClusterTable = <T extends object>({
  data,
  getRowId,
  columns: providedColumns,
  ariaLabel = 'Clusters',
  initialState,
  state: controlledState,
  onStateChange,
  persistence,
  isLoading = false,
  error,
  isCompact = false,
  hasDraggableHeaders = false,
}: ClusterTableProps<T>): ReactElement => {
  const id = useId();
  const [requestedState, setLocalState] = useClusterTableState(
    initialState,
    controlledState,
    persistence
  );
  const [announcement, setAnnouncement] = useState('');
  const [isColumnsExpanded, setColumnsExpanded] = useState(false);
  const columns: readonly ClusterTableColumn<T>[] = useMemo(
    () => providedColumns ?? inferClusterColumns(data),
    [providedColumns, data]
  );
  const model = useMemo(
    () => buildClusterTableModel(data, columns, requestedState),
    [data, columns, requestedState]
  );
  const state = model.state;
  const displayColumns = new Map(columns.map((column) => [column.id, column]));
  const dragIds = new Map(
    columns.map((column) => [column.id, `${id}-column-${encodeURIComponent(column.id)}`])
  );
  const columnsByDragId = new Map(columns.map((column) => [dragIds.get(column.id), column.id]));
  // PatternFly retains the active overlay ID. Reset its context if an item disappears
  // or its ID changes, so the overlay cannot look up an item from an obsolete schema.
  const dragSchemaKey = JSON.stringify([...dragIds.values()].sort());
  const update = (patch: Partial<ClusterTableState>): void => {
    const next = { ...state, ...patch };
    if (controlledState === undefined) setLocalState(next);
    onStateChange?.(next);
  };
  const headerColumns = model.visibleColumns.map((column) => ({
    id: `${id}-header-${encodeURIComponent(column.id)}`,
    header: column.header,
    columnId: column.id,
  }));
  // Remount the drag context when its available targets change, cancelling an active drag safely.
  const headerDragSchemaKey = JSON.stringify([
    hasDraggableHeaders,
    ...headerColumns.map((column) => column.id).sort(),
  ]);
  const moveHeader = (sourceId: string, targetId: string): void => {
    const source = headerColumns.find((column) => column.id === sourceId);
    const target = headerColumns.find((column) => column.id === targetId);
    if (!source || !target || source.id === target.id) return;
    update({
      columnOrder: reorderClusterColumns(state.columnOrder, source.columnId, target.columnId),
    });
    setAnnouncement(`${source.header} column moved.`);
  };
  const clearFilters = (): void => update({ search: '', filters: {}, page: 1 });
  const filterCount = Object.keys(state.filters).length;
  const hasFilters = Boolean(state.search || filterCount);

  if (error)
    return (
      <Alert isInline variant={AlertVariant.danger} title="Unable to load clusters">
        {error}
      </Alert>
    );
  if (isLoading)
    return (
      <EmptyState
        headingLevel="h2"
        titleText="Loading clusters"
        icon={Spinner}
        variant={EmptyStateVariant.sm}
      />
    );

  const empty = (
    <EmptyState
      headingLevel="h2"
      variant={EmptyStateVariant.sm}
      titleText={
        data.length === 0
          ? 'No clusters'
          : model.visibleColumns.length === 0
            ? 'No visible columns'
            : 'No matching clusters'
      }
    >
      <EmptyStateBody>
        {data.length === 0
          ? 'Clusters will appear here when data is available.'
          : model.visibleColumns.length === 0
            ? 'Use Manage columns to show a column.'
            : 'Adjust your search or column filters to see results.'}
      </EmptyStateBody>
    </EmptyState>
  );

  return (
    <Stack hasGutter>
      <StackItem>
        <Toolbar id={`${id}-toolbar`}>
          <ToolbarContent>
            <ToolbarItem>
              <SearchInput
                aria-label="Search clusters"
                placeholder="Search clusters"
                value={state.search}
                onChange={(_event, search): void => update({ search, page: 1 })}
                onClear={(): void => update({ search: '', page: 1 })}
              />
            </ToolbarItem>
            <ToolbarItem>
              <ExpandableSectionToggle
                isDetached
                isExpanded={isColumnsExpanded}
                onToggle={setColumnsExpanded}
                toggleId={`${id}-columns-toggle`}
                contentId={`${id}-columns-content`}
              >
                Manage columns
              </ExpandableSectionToggle>
            </ToolbarItem>
            <ToolbarItem>
              <Button variant={ButtonVariant.link} isDisabled={!hasFilters} onClick={clearFilters}>
                Clear filters
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <span role="status">
                {model.filteredCount} of {data.length} clusters
              </span>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </StackItem>
      <StackItem hidden={!isColumnsExpanded}>
        <ExpandableSection
          isDetached
          isExpanded={isColumnsExpanded}
          toggleId={`${id}-columns-toggle`}
          contentId={`${id}-columns-content`}
        >
          <Stack hasGutter>
            <StackItem>
              Drag a column by its handle. With the keyboard, press Space to pick up, use the arrow
              keys to move, and press Space to drop.
            </StackItem>
            <StackItem>
              <DragDropSort
                key={dragSchemaKey}
                id={`${id}-columns`}
                variant="DataList"
                items={model.columns.map((column, index) => ({
                  id: dragIds.get(column.id) ?? column.id,
                  props: { 'aria-label': `${column.header} column` },
                  content: (
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key={column.id}>
                          <Checkbox
                            id={`${id}-visible-${index}`}
                            label={column.header}
                            aria-label={`Show ${column.header}`}
                            isChecked={!state.hiddenColumnIds.includes(column.id)}
                            onChange={(_event, checked): void =>
                              update({
                                hiddenColumnIds: checked
                                  ? state.hiddenColumnIds.filter((hidden) => hidden !== column.id)
                                  : [...state.hiddenColumnIds, column.id],
                              })
                            }
                          />
                        </DataListCell>,
                      ]}
                    />
                  ),
                }))}
                onDrop={(_event, items): void => {
                  update({
                    columnOrder: items.flatMap((item) => {
                      const columnId = columnsByDragId.get(String(item.id));
                      return columnId === undefined ? [] : [columnId];
                    }),
                  });
                  setAnnouncement('Column order updated.');
                }}
              >
                <DataList aria-label="Column order and visibility" isCompact />
              </DragDropSort>
            </StackItem>
            <StackItem>
              <span role="status">{announcement}</span>
            </StackItem>
          </Stack>
        </ExpandableSection>
      </StackItem>
      <StackItem>
        {model.visibleColumns.length === 0 ? (
          empty
        ) : (
          <ColumnDragProvider key={headerDragSchemaKey} columns={headerColumns} onMove={moveHeader}>
            <InnerScrollContainer
              role="region"
              aria-label={`${ariaLabel} table scroll area`}
              tabIndex={0}
            >
              <Table
                aria-label={ariaLabel}
                variant={isCompact ? TableVariant.compact : undefined}
                gridBreakPoint={TableGridBreakpoint.none}
              >
                <Thead noWrap>
                  <Tr>
                    {model.visibleColumns.map((column) => {
                      const direction =
                        state.sort?.columnId === column.id ? state.sort.direction : undefined;
                      return (
                        <ClusterTableHeader
                          key={column.id}
                          column={column}
                          direction={direction}
                          filterValue={
                            Object.prototype.hasOwnProperty.call(state.filters, column.id)
                              ? state.filters[column.id]
                              : ''
                          }
                          isDraggable={hasDraggableHeaders}
                          dragId={`${id}-header-${encodeURIComponent(column.id)}`}
                          onSort={(): void =>
                            update({
                              sort: {
                                columnId: column.id,
                                direction: direction === 'asc' ? 'desc' : 'asc',
                              },
                              page: 1,
                            })
                          }
                          onFilter={(value): void =>
                            update({ filters: { ...state.filters, [column.id]: value }, page: 1 })
                          }
                        />
                      );
                    })}
                  </Tr>
                </Thead>
                <Tbody>
                  {model.rows.map((row) => (
                    <Tr key={getRowId(row)}>
                      {model.visibleColumns.map((column) => {
                        const value = column.accessor(row);
                        const cell = displayColumns.get(column.id)?.cell;
                        return (
                          <Td key={column.id} dataLabel={column.header}>
                            {cell ? cell(value, row) : formatClusterValue(value) || '—'}
                          </Td>
                        );
                      })}
                    </Tr>
                  ))}
                  {model.rows.length === 0 && (
                    <Tr>
                      <Td colSpan={model.visibleColumns.length}>{empty}</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </InnerScrollContainer>
          </ColumnDragProvider>
        )}
      </StackItem>
      <StackItem>
        <Pagination
          itemCount={model.filteredCount}
          page={state.page}
          perPage={state.perPage}
          variant={PaginationVariant.bottom}
          isStatic
          onSetPage={(_event, page): void => update({ page })}
          onPerPageSelect={(_event, perPage): void => update({ perPage, page: 1 })}
        />
      </StackItem>
    </Stack>
  );
};
