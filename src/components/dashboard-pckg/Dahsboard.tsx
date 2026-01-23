import React from 'react';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '@patternfly/patternfly/patternfly-charts.css';

import ReactGridLayout, { Layout, useContainerWidth } from 'react-grid-layout';
import { Button, Checkbox } from '@patternfly/react-core';

export interface GridItem {
  /** Unique identifier for the grid item */
  i: string;
  /** X position in grid units */
  x: number;
  /** Y position in grid units */
  y: number;
  /** Width in grid units */
  w: number;
  /** Height in grid units */
  h: number;
  /** If true, the item cannot be moved or resized */
  static?: boolean;
  /** Minimum width */
  minW?: number;
  /** Maximum width */
  maxW?: number;
  /** Minimum height */
  minH?: number;
  /** Maximum height */
  maxH?: number;
}

export interface DashboardGridProps {
  /** Layout configuration for grid items */
  layout?: GridItem[];
  /** Number of columns in the grid */
  cols?: number;
  /** Height of a single row in pixels */
  rowHeight?: number;
  /** Children to render in the grid (must have key prop matching layout item's i) */
  children?: React.ReactNode[];
}

const defaultLayout: GridItem[] = [
  {
    i: 'chart',
    x: 1,
    y: 0,
    w: 3,
    h: 2,
  },
  { i: 'a', x: 0, y: 0, w: 1, h: 2, static: true },
  { i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
  { i: 'c', x: 4, y: 0, w: 1, h: 2 },
];

/**
 * DashboardGrid - A responsive grid layout component using react-grid-layout.
 * Allows creating draggable and resizable dashboard layouts.
 */
export function DashboardGrid({
  layout = defaultLayout,
  cols = 12,
  rowHeight = 30,
  children,
}: DashboardGridProps) {
  const { width, containerRef, mounted } = useContainerWidth();

  const [currentLayout, setCurrentLayout] = React.useState<Layout>(layout);
  // 1. Store ONLY the IDs of the items we want to show
  // We initialize it with all the IDs from the layout prop
  const [visibleKeys, setVisibleKeys] = React.useState<string[]>(layout.map((item) => item.i));

  const onLayoutChange = (newLayout: Layout) => {
    // We update currentLayout, but we must be careful:
    // RGL only sends the VISIBLE items in 'newLayout'.
    // We merge them back into currentLayout to preserve hidden items' positions.
    setCurrentLayout((prev) => {
      const updated = prev.map((oldItem) => {
        const match = newLayout.find((n) => n.i === oldItem.i);
        return match ? { ...oldItem, ...match } : oldItem;
      });
      return updated;
    });
  };

  // 2. Handle the toggle logic
  const handleCheckboxChange = (
    _event: React.FormEvent<HTMLInputElement>,
    checked: boolean,
    id: string
  ) => {
    if (checked) {
      setVisibleKeys((prev) => [...prev, id]);
    } else {
      setVisibleKeys((prev) => prev.filter((key) => key !== id));
    }
  };

  // 3. Filter layout and children based on visibleKeys
  // useMemo ensures we don't recalculate this unless keys or layout change
  const filteredLayout = React.useMemo(
    () => currentLayout.filter((item) => visibleKeys.includes(item.i)),
    [currentLayout, visibleKeys]
  );

  const filteredChildren = React.useMemo(
    () => children?.filter((child: any) => visibleKeys.includes(child.key)),
    [children, visibleKeys]
  );

  const saveLayout = () => {
    localStorage.setItem('layout', JSON.stringify(filteredLayout));
    localStorage.setItem('keys', JSON.stringify(visibleKeys));
  };

  const loadLayout = () => {
    const savedLayout = localStorage.getItem('layout');
    const savedKeys = localStorage.getItem('keys');
    if (savedLayout && savedKeys) {
      setCurrentLayout(JSON.parse(savedLayout));
      setVisibleKeys(JSON.parse(savedKeys));
    }
  };

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {children?.map((child: any) => (
        <Checkbox
          key={child.key}
          id={child.key}
          label={`Show ${child.key}`}
          // 4. Tell the checkbox if it should look checked
          isChecked={visibleKeys.includes(child.key)}
          onChange={(event, checked) => handleCheckboxChange(event, checked, child.key)}
        />
      ))}
      <Button onClick={saveLayout}>Save layout</Button>

      <Button onClick={loadLayout}>Load layout</Button>
      {mounted && (
        <ReactGridLayout
          onLayoutChange={onLayoutChange}
          layout={filteredLayout}
          width={width}
          gridConfig={{ cols, rowHeight }}
        >
          {filteredChildren}
        </ReactGridLayout>
      )}
    </div>
  );
}

/** @deprecated Use DashboardGrid instead */
export const MyGrid = DashboardGrid;
