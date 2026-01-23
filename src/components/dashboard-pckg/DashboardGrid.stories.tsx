import type { Meta, StoryObj } from '@storybook/react';
import { DashboardGrid, GridItem } from './Dahsboard';
import { BarChart } from './widgets/BarChart';

// Mock layout with space for chart widget
const mockLayout: GridItem[] = [
  { i: 'users', x: 0, y: 0, w: 3, h: 2 },
  { i: 'revenue', x: 3, y: 0, w: 3, h: 2 },
  { i: 'orders', x: 6, y: 0, w: 3, h: 2 },
  { i: 'errors', x: 9, y: 0, w: 3, h: 2 },
  { i: 'chart', x: 0, y: 2, w: 6, h: 6, minW: 4 },
  { i: 'activity', x: 6, y: 2, w: 6, h: 6 },
];

// Metric tile component
const MetricTile = ({ label, value, bg }: { label: string; value: string; bg: string }) => (
  <div
    style={{
      background: bg,
      color: 'white',
      padding: '16px',
      height: '100%',
      boxSizing: 'border-box',
    }}
  >
    <div style={{ fontSize: '12px', opacity: 0.9 }}>{label}</div>
    <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>{value}</div>
  </div>
);

// Activity feed component
const ActivityFeed = () => (
  <div
    style={{
      background: 'white',
      padding: '16px',
      height: '100%',
      boxSizing: 'border-box',
      border: '1px solid #e2e8f0',
    }}
  >
    <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#1a202c' }}>
      Recent Activity
    </div>
    {[
      'User signup - 2m ago',
      'Order placed - 5m ago',
      'Payment received - 8m ago',
      'New comment - 12m ago',
    ].map((item, i) => (
      <div
        key={i}
        style={{
          padding: '8px 0',
          borderBottom: '1px solid #edf2f7',
          fontSize: '14px',
          color: '#4a5568',
        }}
      >
        {item}
      </div>
    ))}
  </div>
);

const meta: Meta<typeof DashboardGrid> = {
  title: 'Components/DashboardGrid',
  component: DashboardGrid,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    layout: { control: 'object' },
    cols: { control: { type: 'number', min: 1, max: 24 } },
    rowHeight: { control: { type: 'number', min: 10, max: 100 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    layout: mockLayout,
    cols: 12,
    rowHeight: 50,
  },
  render: (args) => (
    <DashboardGrid {...args}>
      <div key="users">
        <MetricTile label="Users" value="12,847" bg="#4299e1" />
      </div>
      <div key="revenue">
        <MetricTile label="Revenue" value="$54,321" bg="#48bb78" />
      </div>
      <div key="orders">
        <MetricTile label="Orders" value="1,234" bg="#ed8936" />
      </div>
      <div key="errors">
        <MetricTile label="Errors" value="23" bg="#f56565" />
      </div>
      <div
        key="chart"
        style={{ background: 'white', padding: '16px', border: '1px solid #e2e8f0' }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1a202c' }}>
          Pet Adoption Trends
        </div>
        <div style={{ height: '100%', width: '100%' }}>
          <BarChart />
        </div>
      </div>
      <div key="activity">
        <ActivityFeed />
      </div>
    </DashboardGrid>
  ),
};
