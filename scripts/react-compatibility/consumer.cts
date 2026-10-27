import { createElement, type ComponentProps } from 'react';
import clusterTable = require('@redhat-cloud-services/nxtcm-cluster-table');
import dashboard = require('@redhat-cloud-services/nxtcm-dashboard');
import wizard = require('@redhat-cloud-services/nxtcm-rosa-hcp-wizard');

// Check the require condition's declarations against the consumer's React types.
declare const wizardProps: ComponentProps<typeof wizard.RosaHCPWizard>;
createElement(dashboard.TotalClusters, { data: { total: 23 } });
createElement(wizard.RosaHCPWizard, wizardProps);

createElement(clusterTable.ClusterTable<{ id: string }>, {
  data: [{ id: 'cluster' }],
  getRowId: (row) => row.id,
  persistence: { key: 'compatibility-clusters' },
  hasDraggableHeaders: true,
});
