import { type ReactElement, type ReactNode, useId, useState } from 'react';

import {
  closestCenter,
  type CollisionDetection,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Label } from '@patternfly/react-core/dist/dynamic/components/Label';
import GripVerticalIcon from '@patternfly/react-icons/dist/esm/icons/grip-vertical-icon';

export interface DraggableColumn {
  /** stable drag identifier, distinct from the data field ID */
  id: string;
  /** visible column heading for feedback and announcements */
  header: string;
}

export interface ColumnDragProviderProps {
  /** visible columns in their current order */
  columns: readonly DraggableColumn[];
  /** table and scroll container */
  children: ReactNode;
  /** commit a completed move using drag identifiers */
  onMove: (sourceId: string, targetId: string) => void;
}

// Pointer drops must land on a header; keyboard moves use the nearest header center.
const headerCollision: CollisionDetection = (args) =>
  args.pointerCoordinates ? pointerWithin(args) : closestCenter(args);

export const ColumnDragProvider = ({
  columns,
  children,
  onMove,
}: ColumnDragProviderProps): ReactElement => {
  const id = useId();
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeColumn = columns.find((column) => column.id === activeId);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const heading = (dragId: string | number): string =>
    columns.find((column) => column.id === dragId)?.header ?? 'Column';

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={headerCollision}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            'To move a column, press Space or Enter to pick it up, use the left and right arrow keys to choose its position, and press Space or Enter to drop. Press Escape to cancel.',
        },
        announcements: {
          onDragStart: ({ active }): string => `Picked up ${heading(active.id)} column.`,
          onDragOver: ({ active, over }): string =>
            over
              ? `${heading(active.id)} column over ${heading(over.id)} column, position ${columns.findIndex((column) => column.id === over.id) + 1} of ${columns.length}.`
              : 'Outside the column headers. Drop here to cancel.',
          onDragEnd: ({ active, over }): string =>
            over
              ? `${heading(active.id)} column dropped at position ${columns.findIndex((column) => column.id === over.id) + 1} of ${columns.length}.`
              : 'Column move cancelled.',
          onDragCancel: (): string => 'Column move cancelled.',
        },
      }}
      onDragStart={({ active }): void => setActiveId(String(active.id))}
      onDragCancel={(): void => setActiveId(null)}
      onDragEnd={({ active, over }): void => {
        setActiveId(null);
        if (over && active.id !== over.id) onMove(String(active.id), String(over.id));
      }}
    >
      <SortableContext
        items={columns.map((column) => column.id)}
        strategy={horizontalListSortingStrategy}
      >
        {children}
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeColumn && (
          <Label icon={<GripVerticalIcon />} aria-hidden="true">
            {activeColumn.header}
          </Label>
        )}
      </DragOverlay>
    </DndContext>
  );
};
