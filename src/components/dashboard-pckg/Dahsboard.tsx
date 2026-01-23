import React from 'react';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '@patternfly/patternfly/patternfly-charts.css';

import ReactGridLayout, { useContainerWidth } from 'react-grid-layout';
import { BarChart } from './widgets/BarChart';

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
  children?: React.ReactNode;
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

  const defaultChildren = (
    <>
      <div key="chart">
        <BarChart />
      </div>

      <div
        key="a"
        style={{ background: '#f0f0f0', border: '1px solid #ccc', padding: '8px' }}
      ></div>
      <div key="b" style={{ background: '#e8f4f8', border: '1px solid #0066cc', padding: '8px' }}>
        Panel B (Resizable)
      </div>
      <div key="c" style={{ background: '#f0f8e8', border: '1px solid #00cc66', padding: '8px' }}>
        Panel C
      </div>
    </>
  );

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {mounted && (
        <ReactGridLayout layout={layout} width={width} gridConfig={{ cols, rowHeight }}>
          {children || defaultChildren}
        </ReactGridLayout>
      )}
    </div>
  );
}

/** @deprecated Use DashboardGrid instead */
export const MyGrid = DashboardGrid;
