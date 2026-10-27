import { useMemo, useState, useSyncExternalStore } from 'react';

import { createClusterTableState } from '../engine/clusterTableEngine';
import type { ClusterTableState } from '../engine/types';
import type { ClusterTablePersistence } from './clusterTablePersistence';
import { createClusterTableStore } from './clusterTableStore';

/** Keep controlled state authoritative and reset uncontrolled preferences when the key changes. */
export const useClusterTableState = (
  initialState?: Partial<ClusterTableState>,
  controlledState?: ClusterTableState,
  persistence?: ClusterTablePersistence
): readonly [ClusterTableState, (state: ClusterTableState) => void] => {
  const [initial] = useState(() => createClusterTableState(initialState));
  const key = controlledState === undefined ? persistence?.key : undefined;
  const storage = persistence?.storage ?? 'local';
  const store = useMemo(
    () => createClusterTableStore(initial, key ? { key, storage } : undefined),
    [initial, key, storage]
  );
  const localState = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
  return [controlledState ?? localState, store.setState];
};
