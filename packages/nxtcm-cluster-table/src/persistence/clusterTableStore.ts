import type { ClusterTableState } from '../engine/types';
import {
  type ClusterTablePersistence,
  readClusterTablePreferences,
  writeClusterTablePreferences,
} from './clusterTablePersistence';

interface ClusterTableStore {
  getSnapshot: () => ClusterTableState;
  getServerSnapshot: () => ClusterTableState;
  subscribe: (listener: () => void) => () => void;
  setState: (state: ClusterTableState) => void;
}

/** One table's in-memory state, initialized from storage once without writing during render. */
export const createClusterTableStore = (
  initialState: ClusterTableState,
  persistence?: ClusterTablePersistence
): ClusterTableStore => {
  let snapshot: ClusterTableState | undefined;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: (): ClusterTableState => {
      if (snapshot === undefined) {
        const saved = persistence ? readClusterTablePreferences(persistence) : undefined;
        snapshot = saved ? { ...initialState, ...saved, page: 1 } : initialState;
      }
      return snapshot;
    },
    // Hydration starts with the same initial state that was rendered on the server.
    getServerSnapshot: (): ClusterTableState => initialState,
    subscribe: (listener): (() => void) => {
      listeners.add(listener);
      return (): void => {
        listeners.delete(listener);
      };
    },
    setState: (state): void => {
      snapshot = state;
      if (persistence) writeClusterTablePreferences(persistence, state);
      listeners.forEach((listener) => listener());
    },
  };
};
