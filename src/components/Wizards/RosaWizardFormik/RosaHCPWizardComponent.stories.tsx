import { Meta, StoryObj } from '@storybook/react';
import { RosaHCPWizardComponent } from './RosaHCPWizardComponent';
import { StepId } from './constants';

const meta: Meta<typeof RosaHCPWizardComponent> = {
  title: 'Wizards/RosaHCPWizardComponent',
  component: RosaHCPWizardComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'ROSA HCP (Red Hat OpenShift Service on AWS - Hosted Control Plane) Wizard component for creating ROSA HCP clusters with a step-by-step interface using Formik for form management.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: {
      description: 'Callback function called when the wizard is submitted with form values',
      action: 'submitted',
    },
    onClose: {
      description: 'Callback function called when the wizard is cancelled or closed',
      action: 'closed',
    },
    track: {
      description: 'Analytics tracking function',
    },
    canCreateManagedCluster: {
      description: 'Whether the user has permission to create a managed cluster',
      control: 'boolean',
    },
    areAwsResourcesLoading: {
      description: 'Whether AWS resources are currently being loaded',
      control: 'boolean',
    },
    currentStepId: {
      description: 'The current step ID in the wizard',
      control: 'text',
    },
    accountAndRolesStepId: {
      description: 'The step ID for the accounts and roles step',
      control: 'text',
    },
    getUserRoleResponse: {
      description: 'Response object from the getUserRole API call',
    },
    userRoleInfoValue: {
      description: 'User role information value',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RosaHCPWizardComponent>;

/**
 * Default story with all required data populated
 */
export const Default: Story = {
  args: {
    onSubmit: (data: any) => {
      console.log('Wizard submitted with data:', data);
    },
    onClose: () => {
      console.log('Wizard closed');
    },
    track: (event: string, data?: any) => {
      console.log('Track event:', event, data);
    },
    canCreateManagedCluster: true,
    areAwsResourcesLoading: false,
    currentStepId: StepId.Details,
    accountAndRolesStepId: StepId.RolesAndPolicies,
    getUserRoleResponse: {
      error: false,
      pending: false,
      fulfilled: true,
    },
    userRoleInfoValue: {},
  },
};

/**
 * Story showing the wizard in a loading state
 */
export const Loading: Story = {
  args: {
    ...Default.args,
    areAwsResourcesLoading: true,
    getUserRoleResponse: {
      error: false,
      pending: true,
      fulfilled: false,
    },
  },
};

/**
 * Story showing the wizard when user cannot create managed clusters
 */
export const NoPermission: Story = {
  args: {
    ...Default.args,
    canCreateManagedCluster: false,
  },
};

/**
 * Story showing the wizard with an error state
 */
export const WithError: Story = {
  args: {
    ...Default.args,
    getUserRoleResponse: {
      error: true,
      pending: false,
      fulfilled: false,
    },
  },
};
