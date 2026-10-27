import { type ReactElement, useId, useLayoutEffect, useRef } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { Button, ButtonVariant } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Form, FormGroup } from '@patternfly/react-core/dist/dynamic/components/Form';
import { Popover, PopoverPosition } from '@patternfly/react-core/dist/dynamic/components/Popover';
import { SearchInput } from '@patternfly/react-core/dist/dynamic/components/SearchInput';
import { Flex, FlexItem } from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import ArrowsAltVIcon from '@patternfly/react-icons/dist/esm/icons/arrows-alt-v-icon';
import FilterIcon from '@patternfly/react-icons/dist/esm/icons/filter-icon';
import GripVerticalIcon from '@patternfly/react-icons/dist/esm/icons/grip-vertical-icon';
import LongArrowAltDownIcon from '@patternfly/react-icons/dist/esm/icons/long-arrow-alt-down-icon';
import LongArrowAltUpIcon from '@patternfly/react-icons/dist/esm/icons/long-arrow-alt-up-icon';
import { Th } from '@patternfly/react-table/dist/dynamic/components/Table';

import type { ClusterColumn, ClusterTableSort } from '../engine/types';

export interface ClusterTableHeaderProps {
  /** column identity, label and allowed interactions */
  column: Pick<ClusterColumn<object>, 'id' | 'header' | 'sortable' | 'filterable'>;
  /** current sort direction, absent for an unsorted column */
  direction?: ClusterTableSort['direction'];
  /** current column filter */
  filterValue: string;
  /** toggle sorting for this column */
  onSort: () => void;
  /** set or clear this column filter */
  onFilter: (value: string) => void;
  /** enable the header drag handle */
  isDraggable: boolean;
  /** stable identifier within the header drag context */
  dragId: string;
}

export const ClusterTableHeader = ({
  column,
  direction,
  filterValue,
  onSort,
  onFilter,
  isDraggable,
  dragId,
}: ClusterTableHeaderProps): ReactElement => {
  const fieldId = useId();
  const filterLabel = `Filter ${column.header}${filterValue ? ' (active)' : ''}`;
  // Keep headers aligned with their cells until the drop; the provider renders a drag overlay.
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging, isOver } =
    useSortable({ id: dragId, disabled: !isDraggable });
  const headerRef = useRef<HTMLTableCellElement>(null);
  // PatternFly measures Th through an object ref. Register that same cell with
  // dnd-kit before paint instead of passing its callback ref to Th.
  useLayoutEffect(() => {
    setNodeRef(headerRef.current);
    return (): void => setNodeRef(null);
  }, [setNodeRef]);

  return (
    <Th
      ref={headerRef}
      aria-label={column.header}
      aria-sort={
        direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : undefined
      }
    >
      <Flex
        flexWrap={{ default: 'nowrap' }}
        alignItems={{ default: 'alignItemsCenter' }}
        columnGap={{ default: 'columnGapSm' }}
      >
        {isDraggable && (
          <FlexItem>
            <Button
              ref={setActivatorNodeRef}
              variant={ButtonVariant.plain}
              isClicked={isDragging || isOver}
              icon={<GripVerticalIcon />}
              {...attributes}
              {...listeners}
              aria-label={`Move ${column.header} column`}
              title={`Move ${column.header} column`}
              // PatternFly has no header drag handle. dnd-kit requires touch-action
              // on its activator so touch dragging does not scroll the table.
              style={{ touchAction: 'none' }}
            />
          </FlexItem>
        )}
        <FlexItem>
          {column.sortable === false ? (
            column.header
          ) : (
            // Separate buttons keep the filter out of the sortable heading's button.
            <Button
              variant={ButtonVariant.plain}
              hasNoPadding
              aria-label={`Sort by ${column.header}`}
              iconPosition="end"
              icon={
                direction === 'asc' ? (
                  <LongArrowAltUpIcon />
                ) : direction === 'desc' ? (
                  <LongArrowAltDownIcon />
                ) : (
                  <ArrowsAltVIcon />
                )
              }
              onClick={onSort}
            >
              {column.header}
            </Button>
          )}
        </FlexItem>
        {column.filterable !== false && (
          <FlexItem>
            <Popover
              headerContent={`Filter ${column.header}`}
              headerComponent="h2"
              closeBtnAriaLabel={`Close ${column.header} filter`}
              position={PopoverPosition.bottomStart}
              withFocusTrap
              elementToFocus={`[id="${fieldId}"]`}
              bodyContent={
                <Form onSubmit={(event): void => event.preventDefault()}>
                  <FormGroup label={column.header} fieldId={fieldId}>
                    <SearchInput
                      searchInputId={fieldId}
                      aria-label={`Filter ${column.header}`}
                      placeholder="Contains…"
                      value={filterValue}
                      resetButtonLabel={`Clear ${column.header} filter`}
                      onChange={(_event, value): void => onFilter(value)}
                      onClear={(): void => onFilter('')}
                    />
                  </FormGroup>
                </Form>
              }
            >
              <Button
                variant={filterValue ? ButtonVariant.secondary : ButtonVariant.plain}
                aria-label={filterLabel}
                aria-haspopup="dialog"
                title={filterValue ? `${filterLabel}: ${filterValue}` : filterLabel}
                icon={<FilterIcon />}
              />
            </Popover>
          </FlexItem>
        )}
      </Flex>
    </Th>
  );
};
