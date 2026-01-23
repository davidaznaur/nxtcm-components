import type { Meta, StoryObj } from '@storybook/react';
import { DashboardGrid, GridItem } from './Dahsboard';
import { BarChart } from './widgets/BarChart';
import { DonutChart } from './widgets/DonutChart';
import { PieChart } from './widgets/PieChart';
import { CVECard, CVEData } from '../dashboard/CVECard';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { AreaChart } from './widgets/AreaChart';

// Mock layout with space for chart widget
const mockLayout: GridItem[] = [
  { i: 'users', x: 0, y: 0, w: 3, h: 2 },
  { i: 'revenue', x: 3, y: 0, w: 3, h: 2 },
  { i: 'orders', x: 6, y: 0, w: 3, h: 2 },
  { i: 'errors', x: 9, y: 0, w: 3, h: 2 },
  { i: 'chart', x: 0, y: 2, w: 6, h: 6, minW: 6, minH: 6 },
  { i: 'donutchart', x: 0, y: 2, w: 6, h: 6, minW: 6, minH: 6 },
  { i: 'piechart', x: 12, y: 4, w: 6, h: 6, minW: 6, minH: 6 },
  { i: 'activity', x: 6, y: 2, w: 6, h: 6, minW: 6, minH: 6 },
  { i: 'cveCard', x: 6, y: 2, w: 6, h: 6, minW: 6, minH: 6 },
  { i: 'areaChart', x: 6, y: 2, w: 6, h: 6, minW: 6, minH: 6 },
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

const defaultCVEData: CVEData[] = [
  {
    severity: 'critical',
    count: 24,
    label: 'Critical severity CVEs on your associated',
    onViewClick: () => console.log('View critical CVEs clicked'),
    viewLinkText: 'View critical CVEs',
  },
  {
    severity: 'important',
    count: 147,
    label: 'Important severity CVEs on your associated',
    onViewClick: () => console.log('View important CVEs clicked'),
    viewLinkText: 'View important CVEs',
  },
];

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
      <div
        key="donutchart"
        className="testclassname"
        style={{ background: 'white', padding: '16px', border: '1px solid #e2e8f0' }}
      >
        <div style={{ height: '100%', width: '100%' }}>
          <DonutChart />
        </div>
      </div>

      <div
        key="piechart"
        className="testclassname"
        style={{ background: 'white', padding: '16px', border: '1px solid #e2e8f0' }}
      >
        <div style={{ height: '100%', width: '100%' }}>
          <PieChart />
        </div>
      </div>

      <div key="activity">
        <ActivityFeed />
      </div>

      <div key="areaChart">
        <AreaChart />
      </div>

      <Card key="cveCard">
        <CardTitle>CVE Card</CardTitle>
        <CardBody>
          <CVECard cveData={defaultCVEData} />
        </CardBody>
      </Card>
    </DashboardGrid>
  ),
};
