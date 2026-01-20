import { Formik } from 'formik';
import { RosaHCPWizard } from './RosaHCPWizard';
import { initialValues } from './initialValues';

interface RosaHCPWizardProps {
  onSubmit: (values: any) => void;
  track: any;
  onClose: () => void;
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

export const RosaHCPWizardComponent = (props: RosaHCPWizardProps) => {
//   const {
//     onSubmit,
//     track,
//     canCreateManagedCluster,
//     areAwsResourcesLoading,
//     currentStepId,
//     accountAndRolesStepId,
//     getUserRoleResponse,
//     userRoleInfoValue,
//   } = props;
const {onSubmit} = props;

  return (
    <Formik
      initialValues={initialValues()}
      onSubmit={(formikValues) => {
        onSubmit(formikValues);
      }}
    >
      <RosaHCPWizard
        // canCreateManagedCluster={canCreateManagedCluster}
        // areAwsResourcesLoading={areAwsResourcesLoading}
        // currentStepId={currentStepId}
        // accountAndRolesStepId={accountAndRolesStepId}
        // getUserRoleResponse={getUserRoleResponse}
        // userRoleInfoValue={userRoleInfoValue}
        {...props}
      />
    </Formik>
  );
};
