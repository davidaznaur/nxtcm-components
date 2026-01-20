import { Wizard, WizardStep } from '@patternfly/react-core';
import { FieldId, StepId, StepName } from './constants';
import { PageHeader } from '@patternfly/react-component-groups';
import { CreateRosaHCPClusterFooter } from './CreateRosaHCPClusterFooter';
import { ReviewStepData } from '../RosaWizard/Steps/ReviewStepData';
import { ReviewAndCreateStep } from './Steps/ReviewAndCreateStep/ReviewAndCreateStep';
import { DetailsStep } from './Steps/DetailsStep/DetailsStep';
import { useFormState } from './hooks/useFormState';

interface RosaHCPWizardProps {
  canCreateManagedCluster: boolean;
  areAwsResourcesLoading: boolean;
  currentStepId: number | string;
  accountAndRolesStepId: number | string;
  getUserRoleResponse: {
    error: boolean;
    pending: boolean;
    fulfilled: boolean;
  };
  userRoleInfoValue: any;
}

export const RosaHCPWizard = (props: RosaHCPWizardProps) => {
  const {
    canCreateManagedCluster = true,
    areAwsResourcesLoading = false,
    currentStepId,
    accountAndRolesStepId,
    getUserRoleResponse,
    userRoleInfoValue,
  } = props;

   const {
    values: {
      [FieldId.ConfigureProxy]: configureProxySelected,
      [FieldId.AssociatedAwsId]: selectedAWSAccountID,
    },
    values,
    isValidating,
    isValid,
    resetForm,
  } = useFormState();

  console.log("VALUES", values)

  return (
    <>
      <PageHeader title="Create a ROSA HCP Cluster" />
      <Wizard
        id="rosa-hcp-wizard"
        style={{ minHeight: '60vh' }}
        className="pf-v6-u-flex-1"
        footer={
          <CreateRosaHCPClusterFooter
            canCreateManagedCluster={canCreateManagedCluster}
            areAwsResourcesLoading={areAwsResourcesLoading}
            currentStepId={currentStepId}
            accountAndRolesStepId={accountAndRolesStepId}
            getUserRoleResponse={getUserRoleResponse}
            userRoleInfoValue={userRoleInfoValue}
          />
        }
      >
        <WizardStep
          name={StepName.BasicSetup}
          id={StepId.BasicSetup}
          isExpandable
          steps={[
            <WizardStep name={StepName.Details} id={StepId.Details}>
              <DetailsStep />
            </WizardStep>,
            <WizardStep name={StepName.RolesAndPolicies} id={StepId.RolesAndPolicies}>
              Roles and policies
            </WizardStep>,
            <WizardStep name={StepName.Networking} id={StepId.Networking}>
              Networking
            </WizardStep>,
          ]}
        />

        <WizardStep
          name={StepName.AdditionalSetup}
          id={StepId.AdditionalSetup}
          isExpandable
          steps={[
            <WizardStep name={StepName.Encryption} id={StepId.Encryption}>
              Encryption (optional)
            </WizardStep>,
            <WizardStep name={StepName.NetworkingOptional} id={StepId.NetworkingOptional}>
              Networking (optional)
            </WizardStep>,
            <WizardStep name={StepName.ClusterWideProxy} id={StepId.ClusterWideProxy}>
              Cluster-wide proxy
            </WizardStep>,
            <WizardStep name={StepName.ClusterUpdates} id={StepId.ClusterUpdates}>
              Cluster updates (optional)
            </WizardStep>,
          ]}
        />

        <WizardStep name={StepName.Review} id={StepId.Review}>
          <ReviewAndCreateStep />
        </WizardStep>
      </Wizard>
    </>
  );
};
