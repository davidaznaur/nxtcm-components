export interface MockCluster {
  id: string;
  name: string;
  type: 'ROSA HCP' | 'OpenShift' | 'Imported';
  status: 'Ready' | 'Installing' | 'Degraded';
  region: string;
  nodes: number;
  version: string;
  hostedControlPlane?: boolean;
  managedBy?: string;
}

export const mockClusters: MockCluster[] = [
  {
    id: 'rosa-1',
    name: 'production-east',
    type: 'ROSA HCP',
    status: 'Ready',
    region: 'us-east-1',
    nodes: 12,
    version: '4.18.12',
    hostedControlPlane: true,
  },
  {
    id: 'ocp-1',
    name: 'development-west',
    type: 'OpenShift',
    status: 'Ready',
    region: 'us-west-2',
    nodes: 3,
    version: '4.18.10',
  },
  {
    id: 'acm-1',
    name: 'edge-london',
    type: 'Imported',
    status: 'Degraded',
    region: 'eu-west-2',
    nodes: 2,
    version: '4.17.24',
    managedBy: 'ACM hub europe',
  },
  {
    id: 'rosa-2',
    name: 'staging-europe',
    type: 'ROSA HCP',
    status: 'Installing',
    region: 'eu-central-1',
    nodes: 6,
    version: '4.18.12',
    hostedControlPlane: true,
  },
  {
    id: 'ocp-2',
    name: 'analytics-central',
    type: 'OpenShift',
    status: 'Ready',
    region: 'us-central-1',
    nodes: 24,
    version: '4.18.12',
  },
  {
    id: 'acm-2',
    name: 'edge-tokyo',
    type: 'Imported',
    status: 'Ready',
    region: 'ap-northeast-1',
    nodes: 2,
    version: '4.17.24',
    managedBy: 'ACM hub asia',
  },
  {
    id: 'rosa-3',
    name: 'production-west',
    type: 'ROSA HCP',
    status: 'Ready',
    region: 'us-west-2',
    nodes: 10,
    version: '4.18.12',
    hostedControlPlane: true,
  },
];

export const largeMockClusters: MockCluster[] = Array.from({ length: 250 }, (_, index) => ({
  ...mockClusters[index % mockClusters.length],
  id: `cluster-${index + 1}`,
  name: `${mockClusters[index % mockClusters.length].name}-${index + 1}`,
}));

export const getMockClusterId = (row: MockCluster): string => row.id;
