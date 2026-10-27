import {
  buildClusterTableModel,
  createClusterTableState,
  formatClusterValue,
  inferClusterColumns,
  reorderClusterColumns,
} from './clusterTableEngine';
import type { ClusterColumn } from './types';

const data = [
  { id: 'rosa', clusterName: 'cluster-10', nodes: 10, ready: true, region: 'us-east-1' },
  { id: 'acm', clusterName: 'cluster-2', nodes: 2, ready: false, distribution: 'OpenShift' },
  { id: 'ocp', clusterName: 'cluster-1', nodes: null, ready: true },
  { id: 'other', clusterName: 'cluster-2', nodes: 2, ready: true },
];
const columns = inferClusterColumns(data);

describe('cluster table engine', () => {
  it('infers the union of keys in first-seen order and humanizes labels', () => {
    expect(columns.map(({ id }) => id)).toEqual([
      'id',
      'clusterName',
      'nodes',
      'ready',
      'region',
      'distribution',
    ]);
    expect(columns[1].header).toBe('Cluster Name');
    expect(columns[4].accessor(data[1])).toBeUndefined();
    expect(
      inferClusterColumns([{ APIEndpoint: '', aws_region: '', 'cluster-type': '' }]).map(
        (c) => c.header
      )
    ).toEqual(['API Endpoint', 'Aws region', 'Cluster type']);
    expect(inferClusterColumns([])).toEqual([]);
  });

  it.each(['asc', 'desc'] as const)('sorts numbers with nulls last in %s order', (direction) => {
    const model = buildClusterTableModel(
      data,
      columns,
      createClusterTableState({ sort: { columnId: 'nodes', direction } })
    );
    expect(model.rows.map(({ id }) => id)).toEqual(
      direction === 'asc' ? ['acm', 'other', 'rosa', 'ocp'] : ['rosa', 'acm', 'other', 'ocp']
    );
    expect(data.map(({ id }) => id)).toEqual(['rosa', 'acm', 'ocp', 'other']);
  });

  it('sorts strings naturally and retains input order for ties', () => {
    expect(
      buildClusterTableModel(
        data,
        columns,
        createClusterTableState({ sort: { columnId: 'clusterName', direction: 'asc' } })
      ).rows.map(({ id }) => id)
    ).toEqual(['ocp', 'acm', 'other', 'rosa']);
  });

  it('sorts booleans and dates by value', () => {
    expect(
      buildClusterTableModel(
        data,
        columns,
        createClusterTableState({ sort: { columnId: 'ready', direction: 'asc' } })
      ).rows[0].id
    ).toBe('acm');
    const dates = [
      { date: new Date('2026-10-02') },
      { date: new Date('2026-09-03') },
      { date: new Date('invalid') },
    ];
    expect(
      buildClusterTableModel(
        dates,
        inferClusterColumns(dates),
        createClusterTableState({ sort: { columnId: 'date', direction: 'asc' } })
      ).rows
    ).toEqual([dates[1], dates[0], dates[2]]);
  });

  it('combines global search and column filters before paginating, including hidden fields', () => {
    const model = buildClusterTableModel(
      data,
      columns,
      createClusterTableState({
        search: ' CLUSTER ',
        filters: { clusterName: '-2', ready: 'TRUE' },
        hiddenColumnIds: ['ready'],
        page: 99,
        perPage: 1,
      })
    );
    expect(model.rows.map(({ id }) => id)).toEqual(['other']);
    expect(model.filteredCount).toBe(1);
    expect(model.state.page).toBe(1);
    expect(model.visibleColumns.map(({ id }) => id)).not.toContain('ready');
  });

  it('supports nested accessors, custom filter text and domain comparison', () => {
    const rows = [
      { metadata: { name: 'one' }, rank: 1 },
      { metadata: { name: 'two' }, rank: 2 },
    ];
    const custom: ClusterColumn<(typeof rows)[number]>[] = [
      {
        id: 'name',
        header: 'Name',
        accessor: (row) => row.metadata.name,
        filterText: (row) => `cluster ${row.metadata.name}`,
        compare: (left, right) => right.rank - left.rank,
      },
    ];
    expect(
      buildClusterTableModel(
        rows,
        custom,
        createClusterTableState({ search: 'cluster', sort: { columnId: 'name', direction: 'asc' } })
      ).rows
    ).toEqual([rows[1], rows[0]]);
  });

  it('reconciles stale state without duplicating columns, filtering removed fields, or retaining invalid sorts', () => {
    const model = buildClusterTableModel(
      data,
      columns,
      createClusterTableState({
        columnOrder: ['nodes', 'nodes', 'removed'],
        filters: { removed: 'x' },
        hiddenColumnIds: ['removed'],
        sort: { columnId: 'removed', direction: 'asc' },
        page: Infinity,
        perPage: NaN,
      })
    );
    expect(model.columns[0].id).toBe('nodes');
    expect(model.columns).toHaveLength(columns.length);
    expect(model.rows).toEqual(data);
    expect(model.state).toMatchObject({
      sort: null,
      filters: {},
      hiddenColumnIds: [],
      page: 1,
      perPage: 10,
    });
  });

  it('respects disabled sorting/filtering and clamps pages after data shrinks', () => {
    const restricted = columns.map((column) => ({ ...column, sortable: false, filterable: false }));
    const model = buildClusterTableModel(
      data,
      restricted,
      createClusterTableState({
        filters: { id: 'rosa' },
        sort: { columnId: 'id', direction: 'desc' },
        page: 100,
        perPage: 3,
      })
    );
    expect(model.rows).toEqual([data[3]]);
    expect(model.state.page).toBe(2);
    expect(model.state.sort).toBeNull();
    expect(buildClusterTableModel([], columns, model.state).state.page).toBe(1);
  });

  it('moves columns in either direction without mutating the original order', () => {
    const order = ['a', 'b', 'c'];
    expect(reorderClusterColumns(order, 'a', 'c')).toEqual(['b', 'c', 'a']);
    expect(reorderClusterColumns(order, 'c', 'a')).toEqual(['c', 'a', 'b']);
    expect(reorderClusterColumns(order, 'missing', 'c')).toEqual(order);
    expect(order).toEqual(['a', 'b', 'c']);
  });

  it('handles special object keys as data and rejects duplicate column IDs', () => {
    const rows = [JSON.parse('{"__proto__":"safe","constructor":"value"}') as object];
    const inferred = inferClusterColumns(rows);
    expect(buildClusterTableModel(rows, inferred).rows).toHaveLength(1);
    expect(
      buildClusterTableModel(
        rows,
        inferred,
        createClusterTableState({ filters: { constructor: 'value' } })
      ).rows
    ).toHaveLength(1);
    expect(() => buildClusterTableModel(data, [columns[0], columns[0]])).toThrow('unique');
  });

  it('formats arrays, objects, falsy values and circular data safely', () => {
    expect(
      [0, false, null, undefined, ['a', 'b'], { region: 'east' }].map(formatClusterValue)
    ).toEqual(['0', 'false', '', '', '["a","b"]', '{"region":"east"}']);
    const circular: { self?: object } = {};
    circular.self = circular;
    expect(formatClusterValue(circular)).toBe('[Complex value]');
  });
});
