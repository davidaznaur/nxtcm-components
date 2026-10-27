import { type ReactElement, StrictMode, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';

import { createClusterTableState } from '../engine/clusterTableEngine';
import type { ClusterTableState } from '../engine/types';
import {
  type ClusterTablePersistence,
  readClusterTablePreferences,
  writeClusterTablePreferences,
} from './clusterTablePersistence';
import { useClusterTableState } from './useClusterTableState';

interface ProbeProps {
  initialState?: Partial<ClusterTableState>;
  state?: ClusterTableState;
  persistence?: ClusterTablePersistence;
}

let root: Root;
let current: ReturnType<typeof useClusterTableState> | undefined;

const Probe = ({ initialState, state, persistence }: ProbeProps): ReactElement => {
  const result = useClusterTableState(initialState, state, persistence);
  useLayoutEffect(() => {
    current = result;
  }, [result]);
  return <output>{result[0].search}</output>;
};

const renderProbe = (props: ProbeProps): ReturnType<typeof useClusterTableState> => {
  flushSync(() =>
    root.render(
      <StrictMode>
        <Probe {...props} />
      </StrictMode>
    )
  );
  if (!current) throw new Error('State probe did not render');
  return current;
};

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  current = undefined;
  root = createRoot(document.createElement('div'));
});

afterEach(() => {
  flushSync(() => root.unmount());
  jest.restoreAllMocks();
});

it('restores in StrictMode without overwriting saved preferences and ignores fresh config objects', () => {
  writeClusterTablePreferences({ key: 'first' }, createClusterTableState({ search: 'saved' }));
  const write = jest.spyOn(Storage.prototype, 'setItem');
  const first = renderProbe({
    persistence: { key: 'first' },
    initialState: { search: 'fallback' },
  });
  expect(first[0].search).toBe('saved');
  expect(write).not.toHaveBeenCalled();
  flushSync(() => first[1]({ ...first[0], search: 'updated' }));
  const rerender = renderProbe({
    persistence: { key: 'first' },
    initialState: { search: 'new default' },
  });
  expect(rerender[0].search).toBe('updated');
  expect(readClusterTablePreferences({ key: 'first' })?.search).toBe('updated');
});

it('switches keys and storage areas without carrying one table preferences into another', () => {
  const first = renderProbe({ persistence: { key: 'first' } });
  flushSync(() => first[1]({ ...first[0], search: 'first table' }));
  const second = renderProbe({ persistence: { key: 'second' } });
  expect(second[0].search).toBe('');
  flushSync(() => second[1]({ ...second[0], search: 'second table' }));
  expect(renderProbe({ persistence: { key: 'first' } })[0].search).toBe('first table');
  const session = renderProbe({ persistence: { key: 'first', storage: 'session' } });
  expect(session[0].search).toBe('');
  flushSync(() => session[1]({ ...session[0], search: 'session table' }));
  expect(renderProbe({ persistence: { key: 'first' } })[0].search).toBe('first table');
  expect(readClusterTablePreferences({ key: 'second' })?.search).toBe('second table');
  expect(readClusterTablePreferences({ key: 'first', storage: 'session' })?.search).toBe(
    'session table'
  );
});

it('uses controlled state without reading or writing built-in storage', () => {
  writeClusterTablePreferences({ key: 'controlled' }, createClusterTableState({ search: 'saved' }));
  const read = jest.spyOn(Storage.prototype, 'getItem');
  const write = jest.spyOn(Storage.prototype, 'setItem');
  const state = createClusterTableState({ search: 'controlled' });
  expect(renderProbe({ state, persistence: { key: 'controlled' } })[0]).toBe(state);
  const changed = { ...state, search: 'host update' };
  expect(renderProbe({ state: changed, persistence: { key: 'controlled' } })[0]).toBe(changed);
  expect(read).not.toHaveBeenCalled();
  expect(write).not.toHaveBeenCalled();
});
