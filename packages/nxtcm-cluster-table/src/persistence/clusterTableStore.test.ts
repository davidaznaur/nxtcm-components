import {
  buildClusterTableModel,
  createClusterTableState,
  inferClusterColumns,
} from '../engine/clusterTableEngine';
import {
  readClusterTablePreferences,
  writeClusterTablePreferences,
} from './clusterTablePersistence';
import { createClusterTableStore } from './clusterTableStore';

const persistence = { key: 'store-test' };
const preferences = {
  search: 'production',
  filters: { status: 'Ready' },
  columnOrder: ['status', 'name'],
  hiddenColumnIds: ['region'],
};

beforeEach(() => window.localStorage.clear());
afterEach(() => jest.restoreAllMocks());

it('restores preferences over initial state, retains initial sort/page size, and starts on page one', () => {
  writeClusterTablePreferences(persistence, createClusterTableState(preferences));
  const initial = createClusterTableState({
    search: 'fallback',
    page: 4,
    perPage: 20,
    sort: { columnId: 'name', direction: 'asc' },
  });
  const write = jest.spyOn(Storage.prototype, 'setItem');
  const store = createClusterTableStore(initial, persistence);
  expect(store.getSnapshot()).toEqual({ ...initial, ...preferences, page: 1 });
  expect(store.getSnapshot()).toBe(store.getSnapshot());
  expect(write).not.toHaveBeenCalled();
});

it('does not access storage for server rendering or when persistence is disabled', () => {
  const read = jest.spyOn(Storage.prototype, 'getItem');
  const write = jest.spyOn(Storage.prototype, 'setItem');
  const initial = createClusterTableState({ search: 'initial' });
  expect(createClusterTableStore(initial, persistence).getServerSnapshot()).toBe(initial);
  const store = createClusterTableStore(initial);
  expect(store.getSnapshot()).toBe(initial);
  store.setState(createClusterTableState({ search: 'changed' }));
  expect(store.getSnapshot().search).toBe('changed');
  expect(read).not.toHaveBeenCalled();
  expect(write).not.toHaveBeenCalled();
});

it('falls back to initial preferences when the saved value is invalid', () => {
  window.localStorage.setItem('nxtcm-cluster-table:store-test', 'broken');
  const initial = createClusterTableState({ hiddenColumnIds: ['id'] });
  expect(createClusterTableStore(initial, persistence).getSnapshot()).toBe(initial);
});

it('saves changes, notifies subscribers, and restores them in a new table instance', () => {
  const store = createClusterTableStore(createClusterTableState(), persistence);
  const listener = jest.fn();
  const unsubscribe = store.subscribe(listener);
  const next = createClusterTableState(preferences);
  store.setState(next);
  expect(store.getSnapshot()).toBe(next);
  expect(listener).toHaveBeenCalledTimes(1);
  expect(createClusterTableStore(createClusterTableState(), persistence).getSnapshot()).toEqual(
    next
  );
  unsubscribe();
  store.setState(createClusterTableState());
  expect(listener).toHaveBeenCalledTimes(1);
});

it('keeps in-memory changes and notifications when persistence fails', () => {
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage unavailable');
  });
  const store = createClusterTableStore(createClusterTableState(), persistence);
  const listener = jest.fn();
  store.subscribe(listener);
  store.setState(createClusterTableState(preferences));
  expect(store.getSnapshot().filters).toEqual({ status: 'Ready' });
  expect(listener).toHaveBeenCalledTimes(1);
});

it('retains saved preferences while data loads and ignores missing columns when rendering', () => {
  writeClusterTablePreferences(
    persistence,
    createClusterTableState({
      ...preferences,
      filters: { status: 'Ready', removed: 'old' },
      columnOrder: ['removed', 'status', 'name'],
    })
  );
  const store = createClusterTableStore(createClusterTableState(), persistence);
  const write = jest.spyOn(Storage.prototype, 'setItem');
  buildClusterTableModel([], [], store.getSnapshot());
  const data = [{ name: 'production', status: 'Ready', region: 'east', newField: 'new' }];
  const loaded = buildClusterTableModel(data, inferClusterColumns(data), store.getSnapshot());
  expect(loaded.rows).toEqual(data);
  expect(loaded.visibleColumns.map((column) => column.id)).toEqual(['status', 'name', 'newField']);
  expect(loaded.state.filters).toEqual({ status: 'Ready' });
  expect(readClusterTablePreferences(persistence)?.filters).toEqual({
    status: 'Ready',
    removed: 'old',
  });
  expect(write).not.toHaveBeenCalled();
});
