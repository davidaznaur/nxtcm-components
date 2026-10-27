import { type ReactElement, useState } from 'react';

import { createClusterTableState } from '../engine/clusterTableEngine';
import { ClusterTable, type ClusterTableProps } from './ClusterTable';
import { getMockClusterId, type MockCluster, mockClusters } from './ClusterTable.fixtures';

interface ClusterTableStoryProps extends Omit<
  ClusterTableProps<MockCluster>,
  'data' | 'getRowId' | 'columns' | 'onStateChange'
> {
  /** optional mock records */
  data?: MockCluster[];
  /** exercise the controlled contract */
  controlled?: boolean;
  /** remount the table to exercise persisted preferences */
  instance?: number;
}

export const ClusterTableStory = ({
  data = mockClusters,
  controlled = false,
  instance = 0,
  ...props
}: ClusterTableStoryProps): ReactElement => {
  const [state, setState] = useState(() => createClusterTableState(props.initialState));
  return (
    <>
      <ClusterTable
        key={instance}
        {...props}
        data={data}
        getRowId={getMockClusterId}
        state={controlled ? state : props.state}
        onStateChange={setState}
      />
      <input type="hidden" readOnly data-testid="table-state" value={JSON.stringify(state)} />
    </>
  );
};
