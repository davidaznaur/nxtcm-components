import { createClusterTableState } from '../engine/clusterTableEngine';
import {
  readClusterTablePreferences,
  writeClusterTablePreferences,
} from './clusterTablePersistence';

const persistence = { key: 'inventory' };
const storageKey = 'nxtcm-cluster-table:inventory';
const preferences = {
  search: 'production',
  filters: { status: 'Ready' },
  columnOrder: ['status', 'name', 'region'],
  hiddenColumnIds: ['region'],
};

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(() => jest.restoreAllMocks());

it('defaults to local storage and saves only filters, search and column preferences', () => {
  writeClusterTablePreferences(
    persistence,
    createClusterTableState({
      ...preferences,
      sort: { columnId: 'name', direction: 'desc' },
      page: 4,
      perPage: 50,
    })
  );
  expect(window.localStorage.getItem(storageKey)).toBe(
    JSON.stringify({ version: 1, ...preferences })
  );
  expect(window.sessionStorage.getItem(storageKey)).toBeNull();
  expect(readClusterTablePreferences(persistence)).toEqual(preferences);
});

it('isolates table keys and session storage from local storage', () => {
  writeClusterTablePreferences(persistence, createClusterTableState(preferences));
  writeClusterTablePreferences(
    { ...persistence, storage: 'session' },
    createClusterTableState({ search: 'session' })
  );
  writeClusterTablePreferences(
    { key: 'other-table' },
    createClusterTableState({ search: 'other' })
  );
  expect(readClusterTablePreferences(persistence)?.search).toBe('production');
  expect(readClusterTablePreferences({ ...persistence, storage: 'session' })?.search).toBe(
    'session'
  );
  expect(readClusterTablePreferences({ key: 'other-table' })?.search).toBe('other');
});

it('persists clearing filters without resetting managed columns', () => {
  writeClusterTablePreferences(persistence, createClusterTableState(preferences));
  writeClusterTablePreferences(
    persistence,
    createClusterTableState({ ...preferences, search: '', filters: {} })
  );
  expect(readClusterTablePreferences(persistence)).toEqual({
    ...preferences,
    search: '',
    filters: {},
  });
});

it.each([
  'invalid JSON',
  'null',
  '[]',
  '{}',
  JSON.stringify({ version: 2, ...preferences }),
  JSON.stringify({ version: 1, ...preferences, search: 42 }),
  JSON.stringify({ version: 1, ...preferences, filters: null }),
  JSON.stringify({ version: 1, ...preferences, filters: [] }),
  JSON.stringify({ version: 1, ...preferences, filters: { status: false } }),
  JSON.stringify({ version: 1, ...preferences, columnOrder: 'name' }),
  JSON.stringify({ version: 1, ...preferences, hiddenColumnIds: [42] }),
])('ignores malformed or incompatible preferences: %s', (serialized) => {
  window.localStorage.setItem(storageKey, serialized);
  expect(readClusterTablePreferences(persistence)).toBeUndefined();
});

it('whitelists restored fields and treats special column IDs as data', () => {
  window.localStorage.setItem(
    storageKey,
    '{"version":1,"search":"","filters":{"__proto__":"safe","constructor":"value"},"columnOrder":[],"hiddenColumnIds":[],"page":99,"sort":{"columnId":"name","direction":"desc"}}'
  );
  const restored = readClusterTablePreferences(persistence);
  expect(restored?.filters.__proto__).toBe('safe');
  expect(restored?.filters.constructor).toBe('value');
  expect(restored).not.toHaveProperty('page');
  expect(restored).not.toHaveProperty('sort');
});

it('ignores an absent value or blank key without touching unrelated storage', () => {
  expect(readClusterTablePreferences(persistence)).toBeUndefined();
  window.localStorage.setItem('unrelated', 'keep');
  const read = jest.spyOn(Storage.prototype, 'getItem');
  const write = jest.spyOn(Storage.prototype, 'setItem');
  expect(readClusterTablePreferences({ key: ' ' })).toBeUndefined();
  writeClusterTablePreferences({ key: '' }, createClusterTableState());
  expect(read).not.toHaveBeenCalled();
  expect(write).not.toHaveBeenCalled();
  expect(window.localStorage.getItem('unrelated')).toBe('keep');
});

it('tolerates browsers denying access to storage', () => {
  jest.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
    throw new DOMException('Storage is blocked', 'SecurityError');
  });
  expect(readClusterTablePreferences(persistence)).toBeUndefined();
  expect(() => writeClusterTablePreferences(persistence, createClusterTableState())).not.toThrow();
});

it('tolerates read failures and quota errors', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Read failed');
  });
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Storage is full', 'QuotaExceededError');
  });
  expect(readClusterTablePreferences(persistence)).toBeUndefined();
  expect(() => writeClusterTablePreferences(persistence, createClusterTableState())).not.toThrow();
});
