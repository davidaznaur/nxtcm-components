import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import { mockClusters } from './ClusterTable.fixtures';
import type { ClusterTableStory } from './ClusterTable.story';

const story = 'nxtcm-cluster-table/ClusterTable/ClusterTable/ClusterTableStory';

test('infers columns from different cluster types and displays missing values', async ({
  mount,
}) => {
  const component = await mount<typeof ClusterTableStory>(story);
  await expect(component.getByRole('columnheader', { name: 'Managed By' })).toBeVisible();
  await expect(component.getByRole('row', { name: /edge-london/ })).toContainText('ACM hub europe');
  await expect(component.getByRole('row', { name: /development-west/ })).toContainText('—');
  await expect(
    component.getByRole('button', { name: 'Move Name column', exact: true })
  ).toHaveCount(0);
});

test('drags headers, persists their order and keeps Manage columns draggable', async ({
  mount,
  page,
}) => {
  const component = await mount<typeof ClusterTableStory>(story, {
    hasDraggableHeaders: true,
    persistence: { key: 'ct-header-order' },
    initialState: {
      hiddenColumnIds: ['region'],
      filters: { status: 'Ready' },
      sort: { columnId: 'nodes', direction: 'desc' },
    },
  });
  const source = await component
    .getByRole('button', { name: 'Move Name column', exact: true })
    .evaluate((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    });
  const target = await component
    .getByRole('columnheader', { name: 'Id', exact: true })
    .evaluate((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    });
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(source.x + source.width / 2 - 12, source.y + source.height / 2, {
    steps: 5,
  });
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect(component.getByRole('columnheader').first()).toHaveText('Name');
  await expect(component.getByRole('row').nth(1).getByRole('cell').first()).toHaveText(
    'analytics-central'
  );
  await expect(component.getByRole('columnheader', { name: 'Nodes', exact: true })).toHaveAttribute(
    'aria-sort',
    'descending'
  );
  await expect(
    component.getByRole('button', { name: 'Filter Status (active)', exact: true })
  ).toBeVisible();
  await expect(component.getByRole('columnheader', { name: 'Region', exact: true })).toHaveCount(0);

  await component.update({ instance: 1 });
  await expect(component.getByRole('columnheader').first()).toHaveText('Name');
  await component.getByRole('button', { name: 'Manage columns', exact: true }).click();
  const list = component.getByRole('list', { name: 'Column order and visibility', exact: true });
  await expect(list.getByRole('listitem').first()).toHaveAccessibleName('Name column');
  const handle = list
    .getByRole('listitem', { name: 'Id column', exact: true })
    .getByRole('button', { name: 'Drag button', exact: true });
  await handle.focus();
  await handle.press('Space');
  await handle.press('ArrowUp');
  await handle.press('Space');
  await expect(component.getByRole('columnheader').first()).toHaveText('Id');
});

test('reorders headers with the keyboard and supports cancellation', async ({ mount }) => {
  const component = await mount<typeof ClusterTableStory>(story, {
    hasDraggableHeaders: true,
    controlled: true,
  });
  const handle = component.getByRole('button', { name: 'Move Name column', exact: true });
  await handle.focus();
  await handle.press('Space');
  await handle.press('ArrowLeft');
  await handle.press('Escape');
  await expect(component.getByRole('columnheader').first()).toHaveText('Id');
  await expect(handle).toBeFocused();
  await handle.press('Space');
  await handle.press('ArrowLeft');
  await handle.press('Space');
  await expect(component.getByRole('columnheader').first()).toHaveText('Name');
  await expect(handle).toBeFocused();
  await expect(component.getByTestId('table-state')).toHaveValue(/"columnOrder":\["name","id"/);
});

test('cancels a header drag dropped outside the headers', async ({ mount, page }) => {
  const component = await mount<typeof ClusterTableStory>(story, { hasDraggableHeaders: true });
  const source = await component
    .getByRole('button', { name: 'Move Name column', exact: true })
    .evaluate((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    });
  const outside = await component
    .getByRole('textbox', { name: 'Search clusters' })
    .evaluate((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    });
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(outside.x + outside.width / 2, outside.y + outside.height / 2, {
    steps: 10,
  });
  await page.mouse.up();
  await expect(component.getByRole('columnheader').first()).toHaveText('Id');
  await expect(
    component.getByRole('button', { name: 'Move Name column', exact: true })
  ).toHaveAttribute('aria-pressed', 'false');
});

test('sorts and filters independently of header drag handles', async ({ mount, page }) => {
  const component = await mount<typeof ClusterTableStory>(story, { hasDraggableHeaders: true });
  await component.getByRole('button', { name: 'Sort by Nodes', exact: true }).click();
  await component.getByRole('button', { name: 'Filter Status', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Filter Status', exact: true });
  await dialog.getByRole('textbox', { name: 'Filter Status', exact: true }).fill('Ready');
  await dialog.getByRole('button', { name: 'Close Status filter', exact: true }).click();
  await expect(component.getByRole('row').nth(1)).toContainText('edge-tokyo');
  await expect(component.getByRole('columnheader').first()).toHaveText('Id');
  await expect(component.getByRole('columnheader', { name: 'Nodes', exact: true })).toHaveAttribute(
    'aria-sort',
    'ascending'
  );
  await checkAccessibility({ component });
});

test('cancels a header drag when its column disappears', async ({ mount, page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const component = await mount<typeof ClusterTableStory>(story, { hasDraggableHeaders: true });
  const handle = component.getByRole('button', { name: 'Move Managed By column', exact: true });
  await handle.focus();
  await handle.press('Space');
  await expect(handle).toHaveAttribute('aria-pressed', 'true');
  await component.update({ data: [mockClusters[1]] });
  await expect(
    component.getByRole('columnheader', { name: 'Managed By', exact: true })
  ).toHaveCount(0);
  await component.getByRole('button', { name: 'Sort by Name', exact: true }).click();
  await expect(component.getByRole('columnheader', { name: 'Name', exact: true })).toHaveAttribute(
    'aria-sort',
    'ascending'
  );
  expect(errors).toEqual([]);
});

test('sorts numeric values in both directions and exposes aria-sort', async ({ mount }) => {
  const component = await mount<typeof ClusterTableStory>(story);
  const header = component.getByRole('columnheader', { name: 'Nodes', exact: true });
  await header.getByRole('button', { name: 'Sort by Nodes', exact: true }).click();
  await expect(header).toHaveAttribute('aria-sort', 'ascending');
  await expect(component.getByRole('row').nth(1)).toContainText('edge-london');
  await header.getByRole('button', { name: 'Sort by Nodes', exact: true }).click();
  await expect(header).toHaveAttribute('aria-sort', 'descending');
  await expect(component.getByRole('row').nth(1)).toContainText('analytics-central');
});

test('combines search and header filters, then clears one filter or all filters', async ({
  mount,
  page,
}) => {
  const component = await mount<typeof ClusterTableStory>(story);
  await component.getByRole('textbox', { name: 'Search clusters' }).fill('ROSA');
  await component.getByRole('button', { name: 'Filter Status', exact: true }).click();
  const statusFilter = page.getByRole('dialog', { name: 'Filter Status', exact: true });
  await statusFilter.getByRole('textbox', { name: 'Filter Status', exact: true }).fill('Ready');
  await statusFilter.getByRole('button', { name: 'Close Status filter', exact: true }).click();
  await expect(
    component.getByRole('button', { name: 'Filter Status (active)', exact: true })
  ).toBeVisible();
  await expect(component.getByRole('row')).toHaveCount(3);
  await expect(component.getByText('2 of 7 clusters')).toBeVisible();
  await component.getByRole('button', { name: 'Filter Region', exact: true }).click();
  const regionFilter = page.getByRole('dialog', { name: 'Filter Region', exact: true });
  await regionFilter.getByRole('textbox', { name: 'Filter Region', exact: true }).fill('unknown');
  await expect(component.getByRole('heading', { name: 'No matching clusters' })).toBeVisible();
  await regionFilter.getByRole('button', { name: 'Clear Region filter', exact: true }).click();
  await regionFilter.getByRole('button', { name: 'Close Region filter', exact: true }).click();
  await expect(component.getByText('2 of 7 clusters')).toBeVisible();
  await expect(component.getByRole('button', { name: 'Filter Region', exact: true })).toBeVisible();
  await component.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(component.getByRole('row')).toHaveCount(8);
  await expect(component.getByRole('button', { name: 'Filter Status', exact: true })).toBeVisible();
});

test('filters from the keyboard, resets pagination and preserves sorting', async ({
  mount,
  page,
}) => {
  const component = await mount<typeof ClusterTableStory>(story, {
    initialState: { perPage: 2, page: 3, sort: { columnId: 'nodes', direction: 'desc' } },
  });
  const header = component.getByRole('columnheader', { name: 'Status', exact: true });
  await header.getByRole('button', { name: 'Filter Status', exact: true }).focus();
  await header.getByRole('button', { name: 'Filter Status', exact: true }).press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Filter Status', exact: true });
  const input = dialog.getByRole('textbox', { name: 'Filter Status', exact: true });
  await expect(input).toBeFocused();
  await input.fill('Ready');
  await input.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(
    header.getByRole('button', { name: 'Filter Status (active)', exact: true })
  ).toBeFocused();
  await expect(component.getByRole('columnheader', { name: 'Nodes', exact: true })).toHaveAttribute(
    'aria-sort',
    'descending'
  );
  await expect(component.getByRole('row').nth(1)).toContainText('analytics-central');
  await expect(component.getByTestId('table-state')).toHaveValue(/"page":1/);
});

test('supports keyboard reordering without losing the active sort and supports visibility', async ({
  mount,
}) => {
  const component = await mount<typeof ClusterTableStory>(story);
  await component
    .getByRole('columnheader', { name: 'Name', exact: true })
    .getByRole('button', { name: 'Sort by Name', exact: true })
    .click();
  await component.getByRole('button', { name: 'Manage columns', exact: true }).click();
  const handle = component
    .getByRole('listitem', { name: 'Name column', exact: true })
    .getByRole('button', { name: 'Drag button', exact: true });
  await handle.focus();
  await handle.press('Space');
  await handle.press('ArrowUp');
  await handle.press('Space');
  await expect(component.getByRole('columnheader').first()).toHaveText('Name');
  await expect(component.getByRole('columnheader').first()).toHaveAttribute(
    'aria-sort',
    'ascending'
  );
  await component.getByRole('checkbox', { name: 'Show Region', exact: true }).uncheck();
  await expect(component.getByRole('columnheader', { name: 'Region', exact: true })).toHaveCount(0);
  await component.getByRole('checkbox', { name: 'Show Region', exact: true }).check();
  await expect(component.getByRole('columnheader', { name: 'Region', exact: true })).toBeVisible();
});

test('reorders columns using a pointer drag handle', async ({ mount, page }) => {
  const component = await mount<typeof ClusterTableStory>(story);
  await component.getByRole('button', { name: 'Manage columns', exact: true }).click();
  await component.evaluate(async (element) => {
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(
      element.getAnimations({ subtree: true }).map((animation) => animation.finished)
    );
  });
  const source = await component
    .getByRole('listitem', { name: 'Id column', exact: true })
    .getByRole('button', { name: 'Drag button', exact: true })
    .evaluate((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    });
  const target = await component
    .getByRole('listitem', { name: 'Name column', exact: true })
    .getByRole('button', { name: 'Drag button', exact: true })
    .evaluate((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    });
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(source.x + source.width / 2 + 10, source.y + source.height / 2, {
    steps: 5,
  });
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect(component.getByRole('columnheader').first()).toHaveText('Name');
});

test('paginates and resets the page when searching', async ({ mount }) => {
  const component = await mount<typeof ClusterTableStory>(story, { initialState: { perPage: 2 } });
  await component.getByRole('button', { name: 'Go to next page' }).click();
  await expect(component.getByRole('row').nth(1)).toContainText('edge-london');
  await component.getByRole('textbox', { name: 'Search clusters' }).fill('production-east');
  await expect(component.getByRole('row')).toHaveCount(2);
  await expect(component.getByRole('row').nth(1)).toContainText('production-east');
});

test('accepts controlled state and reports user changes', async ({ mount, page }) => {
  const component = await mount<typeof ClusterTableStory>(story, { controlled: true });
  await component.getByRole('textbox', { name: 'Search clusters' }).fill('edge');
  await expect(component.getByRole('row')).toHaveCount(3);
  await expect(component.getByTestId('table-state')).toHaveValue(/"search":"edge"/);
  await component.getByRole('button', { name: 'Filter Status', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Filter Status', exact: true })
    .getByRole('textbox', { name: 'Filter Status', exact: true })
    .fill('Ready');
  await expect(component.getByTestId('table-state')).toHaveValue(/"filters":\{"status":"Ready"\}/);
  await expect(component.getByRole('row')).toHaveCount(2);
});

for (const storage of ['local', 'session'] as const) {
  test(`restores search, filters and managed columns from ${storage} storage`, async ({
    mount,
    page,
  }) => {
    const component = await mount<typeof ClusterTableStory>(story, {
      persistence: { key: `ct-preferences-${storage}`, storage },
    });
    await component.getByRole('textbox', { name: 'Search clusters' }).fill('ROSA');
    await component.getByRole('button', { name: 'Filter Status', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Filter Status', exact: true });
    await dialog.getByRole('textbox', { name: 'Filter Status', exact: true }).fill('Ready');
    await dialog.getByRole('button', { name: 'Close Status filter', exact: true }).click();
    await component.getByRole('button', { name: 'Manage columns', exact: true }).click();
    await component.getByRole('checkbox', { name: 'Show Region', exact: true }).uncheck();
    const handle = component
      .getByRole('listitem', { name: 'Name column', exact: true })
      .getByRole('button', { name: 'Drag button', exact: true });
    await handle.focus();
    await handle.press('Space');
    await handle.press('ArrowUp');
    await handle.press('Space');

    await component.update({ instance: 1 });
    await expect(component.getByRole('textbox', { name: 'Search clusters' })).toHaveValue('ROSA');
    await expect(
      component.getByRole('button', { name: 'Filter Status (active)', exact: true })
    ).toBeVisible();
    await expect(component.getByText('2 of 7 clusters')).toBeVisible();
    await expect(component.getByRole('columnheader').first()).toHaveText('Name');
    await expect(component.getByRole('columnheader', { name: 'Region', exact: true })).toHaveCount(
      0
    );

    await component.getByRole('button', { name: 'Clear filters', exact: true }).click();
    await component.update({ instance: 2 });
    await expect(component.getByRole('textbox', { name: 'Search clusters' })).toHaveValue('');
    await expect(
      component.getByRole('button', { name: 'Filter Status', exact: true })
    ).toBeVisible();
    await expect(component.getByText('7 of 7 clusters')).toBeVisible();
    await expect(component.getByRole('columnheader').first()).toHaveText('Name');
    await expect(component.getByRole('columnheader', { name: 'Region', exact: true })).toHaveCount(
      0
    );
  });
}

test('isolates preferences when switching table keys', async ({ mount }) => {
  const component = await mount<typeof ClusterTableStory>(story, {
    persistence: { key: 'first-inventory' },
  });
  await component.getByRole('textbox', { name: 'Search clusters' }).fill('ROSA');
  await component.update({ persistence: { key: 'second-inventory' } });
  await expect(component.getByRole('textbox', { name: 'Search clusters' })).toHaveValue('');
  await component.getByRole('textbox', { name: 'Search clusters' }).fill('edge');
  await component.update({ persistence: { key: 'first-inventory' } });
  await expect(component.getByRole('textbox', { name: 'Search clusters' })).toHaveValue('ROSA');
  await component.update({ persistence: { key: 'second-inventory' } });
  await expect(component.getByRole('textbox', { name: 'Search clusters' })).toHaveValue('edge');
});

test('restores preferences when cluster data arrives after mounting', async ({ mount }) => {
  const component = await mount<typeof ClusterTableStory>(story, {
    persistence: { key: 'delayed-inventory' },
  });
  await component.getByRole('button', { name: 'Manage columns', exact: true }).click();
  await component.getByRole('checkbox', { name: 'Show Region', exact: true }).uncheck();
  await component.getByRole('textbox', { name: 'Search clusters' }).fill('ROSA');
  await component.update({ instance: 1, data: [], isLoading: true });
  await component.update({ data: mockClusters, isLoading: false });
  await expect(component.getByRole('textbox', { name: 'Search clusters' })).toHaveValue('ROSA');
  await expect(component.getByRole('columnheader', { name: 'Region', exact: true })).toHaveCount(0);
  await expect(component.getByText('3 of 7 clusters')).toBeVisible();
});

test('keeps controlled state authoritative and leaves stored preferences untouched', async ({
  mount,
}) => {
  const component = await mount<typeof ClusterTableStory>(story, {
    persistence: { key: 'controlled-inventory' },
  });
  await component.getByRole('textbox', { name: 'Search clusters' }).fill('ROSA');
  await component.update({
    instance: 1,
    state: {
      search: 'edge',
      filters: {},
      columnOrder: [],
      hiddenColumnIds: [],
      sort: null,
      page: 1,
      perPage: 10,
    },
  });
  await expect(component.getByRole('textbox', { name: 'Search clusters' })).toHaveValue('edge');
  await component.getByRole('textbox', { name: 'Search clusters' }).fill('attempted change');
  await component.update({ instance: 2, state: undefined });
  await expect(component.getByRole('textbox', { name: 'Search clusters' })).toHaveValue('ROSA');
});

test('reconciles new data and columns without remounting', async ({ mount }) => {
  const component = await mount<typeof ClusterTableStory>(story, {
    initialState: { page: 4, perPage: 2 },
  });
  await component.update({ data: [mockClusters[1]] });
  await expect(component.getByRole('row')).toHaveCount(2);
  await expect(component.getByRole('row').nth(1)).toContainText('development-west');
  await expect(component.getByRole('columnheader', { name: 'Managed By' })).toHaveCount(0);
});

test('cancels an active drag when its column disappears from the data', async ({ mount, page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const component = await mount<typeof ClusterTableStory>(story);
  await component.getByRole('button', { name: 'Manage columns', exact: true }).click();
  const handle = component
    .getByRole('list', { name: 'Column order and visibility', exact: true })
    .getByRole('listitem', { name: 'Managed By column', exact: true })
    .getByRole('button', { name: 'Drag button', exact: true });
  await handle.focus();
  await handle.press('Space');
  await expect(page.getByRole('list', { name: 'draggable overlay', exact: true })).toBeVisible();
  await component.update({ data: [mockClusters[1]] });
  await expect(component.getByRole('table', { name: 'Clusters', exact: true })).toBeVisible();
  await expect(page.getByRole('list', { name: 'draggable overlay', exact: true })).toHaveCount(0);
  await expect(component.getByRole('columnheader', { name: 'Managed By' })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('renders loading, error, empty and no-match states', async ({ mount }) => {
  const component = await mount<typeof ClusterTableStory>(story, { isLoading: true });
  await expect(component.getByRole('heading', { name: 'Loading clusters' })).toBeVisible();
  await component.update({ error: 'Service unavailable', isLoading: false });
  await expect(component.getByText('Service unavailable')).toBeVisible();
  await component.update({ error: undefined, data: [] });
  await expect(component.getByRole('heading', { name: 'No clusters', exact: true })).toBeVisible();
  await component.update({ data: mockClusters });
  await component.getByRole('textbox', { name: 'Search clusters' }).fill('not-found');
  await expect(component.getByRole('heading', { name: 'No matching clusters' })).toBeVisible();
});

test('passes accessibility checks for the table', async ({ mount }) => {
  const component = await mount<typeof ClusterTableStory>(story);
  await checkAccessibility({ component });
});

test('passes accessibility checks for column controls', async ({ mount }) => {
  const component = await mount<typeof ClusterTableStory>(story);
  await component.getByRole('button', { name: 'Manage columns', exact: true }).click();
  await component.evaluate(async (element) => {
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(
      element.getAnimations({ subtree: true }).map((animation) => animation.finished)
    );
  });
  await checkAccessibility({ component });
});

test('passes accessibility checks for the column filter popover', async ({ mount, page }) => {
  const component = await mount<typeof ClusterTableStory>(story);
  await component.getByRole('button', { name: 'Filter Status', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Filter Status', exact: true });
  await expect(dialog.getByRole('textbox', { name: 'Filter Status', exact: true })).toBeFocused();
  await dialog.evaluate(async (element) => {
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(
      element.getAnimations({ subtree: true }).map((animation) => animation.finished)
    );
  });
  await checkAccessibility({ component: dialog });
});
