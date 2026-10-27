import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';

import { Table, Thead, Tr } from '@patternfly/react-table/dist/dynamic/components/Table';

import { ColumnDragProvider } from '../ColumnDragProvider';
import type { ClusterTableSort } from '../engine/types';
import { ClusterTableHeader } from './ClusterTableHeader';

let root: Root;
let container: HTMLDivElement;

const renderHeader = (isDraggable: boolean, direction?: ClusterTableSort['direction']): void => {
  flushSync(() =>
    root.render(
      <StrictMode>
        <ColumnDragProvider columns={[{ id: 'name', header: 'Name' }]} onMove={jest.fn()}>
          <Table aria-label="Clusters">
            <Thead>
              <Tr>
                <ClusterTableHeader
                  column={{ id: 'name', header: 'Name' }}
                  dragId="name"
                  isDraggable={isDraggable}
                  direction={direction}
                  filterValue=""
                  onSort={jest.fn()}
                  onFilter={jest.fn()}
                />
              </Tr>
            </Thead>
          </Table>
        </ColumnDragProvider>
      </StrictMode>
    )
  );
};

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  flushSync(() => root.unmount());
  container.remove();
});

it.each([false, true])(
  'mounts and updates a real PatternFly header (draggable: %s)',
  (draggable) => {
    // Use the real Th: its width measurement must receive an object ref, even with dragging disabled.
    renderHeader(draggable);
    expect(container.querySelector('th')).toHaveTextContent('Name');

    renderHeader(draggable, 'asc');
    expect(container.querySelector('th')).toHaveAttribute('aria-sort', 'ascending');

    flushSync(() => root.render(null));
    renderHeader(draggable, 'desc');
    expect(container.querySelector('th')).toHaveAttribute('aria-sort', 'descending');
  }
);

it('registers the header with the drag engine so its keyboard handle can pick it up', () => {
  renderHeader(true);
  const handle = container.querySelector('button[aria-label="Move Name column"]');
  if (!(handle instanceof HTMLButtonElement)) throw new Error('Missing column drag handle');

  handle.focus();
  flushSync(() => {
    handle.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true }));
  });

  expect(handle).toHaveAttribute('aria-pressed', 'true');
  expect(document.body).toHaveTextContent('Name column over Name column, position 1 of 1.');
});
