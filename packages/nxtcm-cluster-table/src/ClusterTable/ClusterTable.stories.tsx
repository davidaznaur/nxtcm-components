import { type ReactElement, useState } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Label, LabelColor } from '@patternfly/react-core/dist/dynamic/components/Label';
import { Stack, StackItem } from '@patternfly/react-core/dist/dynamic/layouts/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { createClusterTableState } from '../engine/clusterTableEngine';
import { ClusterTable, type ClusterTableColumn, type ClusterTableProps } from './ClusterTable';
import {
  getMockClusterId,
  largeMockClusters,
  type MockCluster,
  mockClusters,
} from './ClusterTable.fixtures';

const meta: Meta<typeof ClusterTable<MockCluster>> = {
  title: 'Components/ClusterTable/ClusterTable',
  component: ClusterTable<MockCluster>,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A PatternFly table with a client-side engine. Pass any cluster records and stable row IDs to infer columns from every row, or supply typed column definitions. Open Manage columns to drag, reorder with the keyboard, and show or hide fields. Each column header has a filter button that opens a text filter; active filters are highlighted. Global search and column filters combine across the full supplied data set.',
      },
    },
  },
  args: {
    data: mockClusters,
    getRowId: getMockClusterId,
    ariaLabel: 'Cluster inventory',
    initialState: { hiddenColumnIds: ['id'] },
  },
  argTypes: {
    hasDraggableHeaders: { control: 'boolean' },
    isCompact: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    error: { control: 'text' },
    ariaLabel: { control: 'text' },
    getRowId: { control: false },
    columns: { control: false },
    state: { control: false },
    onStateChange: { control: false },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DraggableHeaders: Story = {
  args: {
    hasDraggableHeaders: true,
    persistence: { key: 'storybook-cluster-inventory-draggable-headers' },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Drag a column by its header handle onto another header. For keyboard reordering, focus a handle, press Space, use the left/right arrows, and press Space again; Escape cancels. Manage columns still supports its draggable list. Both controls share the same saved order, while sorting and filters remain independent.',
      },
    },
  },
};

const customColumns: ClusterTableColumn<MockCluster>[] = [
  { id: 'name', header: 'Cluster name', accessor: (row) => row.name },
  { id: 'type', header: 'Cluster type', accessor: (row) => row.type },
  {
    id: 'status',
    header: 'Status',
    accessor: (row) => row.status,
    cell: (_value, row) => (
      <Label
        color={
          row.status === 'Ready'
            ? LabelColor.green
            : row.status === 'Degraded'
              ? LabelColor.red
              : LabelColor.blue
        }
      >
        {row.status}
      </Label>
    ),
  },
  { id: 'region', header: 'Region', accessor: (row) => row.region },
  { id: 'nodes', header: 'Worker nodes', accessor: (row) => row.nodes },
  { id: 'version', header: 'OpenShift version', accessor: (row) => row.version },
];

export const CustomColumns: Story = { args: { columns: customColumns } };
export const Paginated: Story = {
  args: { data: largeMockClusters, columns: customColumns, initialState: { perPage: 10 } },
};
export const FilteredAndSorted: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The highlighted Status filter starts with Ready. Open it to edit or clear the filter. Sorting by worker count remains independent of filtering.',
      },
    },
  },
  args: {
    columns: customColumns,
    initialState: { filters: { status: 'Ready' }, sort: { columnId: 'nodes', direction: 'desc' } },
  },
};
export const Compact: Story = { args: { columns: customColumns, isCompact: true } };
export const Loading: Story = { args: { data: [], isLoading: true } };
export const Error: Story = {
  args: {
    error: 'The cluster inventory could not be loaded. Try refreshing the host application.',
  },
};
export const Empty: Story = { args: { data: [], columns: customColumns } };
export const NoMatches: Story = { args: { initialState: { search: 'no-matching-cluster' } } };

interface NestedCluster {
  metadata: { uid: string; name: string };
  spec: { platform: string };
  status: { workers: number };
}

const nestedClusters: NestedCluster[] = [
  {
    metadata: { uid: 'managed-1', name: 'managed-production' },
    spec: { platform: 'AWS' },
    status: { workers: 12 },
  },
  {
    metadata: { uid: 'managed-2', name: 'managed-development' },
    spec: { platform: 'Azure' },
    status: { workers: 3 },
  },
];

export const NestedData: Story = {
  render: (): ReactElement => (
    <ClusterTable
      data={nestedClusters}
      getRowId={(row) => row.metadata.uid}
      ariaLabel="Managed clusters"
      columns={[
        { id: 'name', header: 'Cluster name', accessor: (row) => row.metadata.name },
        { id: 'platform', header: 'Cloud provider', accessor: (row) => row.spec.platform },
        { id: 'workers', header: 'Worker nodes', accessor: (row) => row.status.workers },
      ]}
    />
  ),
};

const ControlledExample = (props: ClusterTableProps<MockCluster>): ReactElement => {
  const [state, setState] = useState(() => createClusterTableState({ hiddenColumnIds: ['id'] }));
  return (
    <Stack hasGutter>
      <StackItem>
        <Button
          variant={ButtonVariant.secondary}
          onClick={(): void => setState(createClusterTableState({ hiddenColumnIds: ['id'] }))}
        >
          Reset table preferences
        </Button>
      </StackItem>
      <StackItem>
        <ClusterTable {...props} state={state} onStateChange={setState} />
      </StackItem>
    </Stack>
  );
};

export const Controlled: Story = {
  render: (args): ReactElement => <ControlledExample {...args} />,
};

const PersistenceExample = (props: ClusterTableProps<MockCluster>): ReactElement => {
  const [instance, setInstance] = useState(0);
  return (
    <Stack hasGutter>
      <StackItem>
        <Button
          variant={ButtonVariant.secondary}
          onClick={(): void => setInstance((value) => value + 1)}
        >
          Remount table
        </Button>
      </StackItem>
      <StackItem>
        <ClusterTable key={instance} {...props} />
      </StackItem>
    </Stack>
  );
};

export const PersistedPreferences: Story = {
  args: { persistence: { key: 'storybook-cluster-inventory' } },
  render: (args): ReactElement => <PersistenceExample {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          'Search, filter a column, and reorder or hide columns. Remount the table or reload the page to restore those preferences. This example uses local storage, so preferences also survive closing and reopening the browser. Clear filters resets the saved search and filters while keeping column preferences.',
      },
    },
  },
};

export const SessionPreferences: Story = {
  args: { persistence: { key: 'storybook-cluster-inventory', storage: 'session' } },
  render: (args): ReactElement => <PersistenceExample {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          'Uses session storage instead: preferences survive remounts and reloads in this tab, but end with its page session. Local and session storage entries are independent.',
      },
    },
  },
};
