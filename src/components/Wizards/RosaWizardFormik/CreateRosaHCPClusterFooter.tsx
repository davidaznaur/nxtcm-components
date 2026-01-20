import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  ButtonProps,
  useWizardContext,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import { FieldId, hasLoadingState, StepId } from './constants';
import { useFormState } from './hooks/useFormState';
import React from 'react';
import { setNestedObjectValues } from 'formik';
import {
  getScrollErrorIds,
  isUserRoleForSelectedAWSAccount,
  scrollToFirstField,
} from './helpers/helpers';

interface CreateRosaHCPClusterFooterProps {
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

export const CreateRosaHCPClusterFooter = (props: CreateRosaHCPClusterFooterProps) => {
  const {
    canCreateManagedCluster,
    areAwsResourcesLoading,
    currentStepId,
    accountAndRolesStepId,
    getUserRoleResponse,
    userRoleInfoValue,
  } = props;
  const { goToNextStep, goToPrevStep, close, activeStep, steps, setStep, goToStepById } =
    useWizardContext();
  const { values, validateForm, setTouched, isValidating, submitForm } = useFormState();

  const [isNextDeferred, setIsNextDeferred] = React.useState(false);

  const isButtonLoading = isValidating || areAwsResourcesLoading;
  const isButtonDisabled = isNextDeferred || areAwsResourcesLoading;

  const onValidateNext = async () => {
    // defer execution until any ongoing validation is done
    if (isValidating) {
      if (!isNextDeferred) {
        setIsNextDeferred(true);
      }
      return;
    }

    const errors = await validateForm(values);

    if (Object.keys(errors || {}).length > 0) {
      setTouched(setNestedObjectValues(errors, true));
      scrollToFirstField(getScrollErrorIds(errors, true));
      return;
    }

    // when navigating back to step 1 from link in no user-role error messages on review screen.
    // if (currentStepId === accountAndRolesStepId && !getUserRoleResponse?.fulfilled) {
    //   const gotoNextStep = isUserRoleForSelectedAWSAccount(
    //     userRoleInfoValue,
    //     values[FieldId.AssociatedAwsId],
    //   );
    //   if (!gotoNextStep) {
    //     return;
    //   }
    // }

    goToNextStep();
  };

  React.useEffect(() => {
    // if "next" invocation was deferred due to earlier ongoing validation,
    // revive the invocation when the validation is done.
    if (isNextDeferred && isValidating === false) {
      setIsNextDeferred(false);
      onValidateNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidating, isNextDeferred]);

  const primaryBtnCommonProps: ButtonProps = {
    variant: 'primary',
    className: canCreateManagedCluster ? '' : 'pf-v6-u-mr-md',
  };
  const primaryBtn =
    activeStep.id === StepId.Review ? (
      <Button
        data-testid="wizard-next-button"
        {...primaryBtnCommonProps}
        onClick={() => submitForm()}
        isDisabled={!canCreateManagedCluster}
      >
        Create cluster
      </Button>
    ) : (
      <Button
        {...primaryBtnCommonProps}
        data-testid="wizard-next-button"
        onClick={onValidateNext}
        isLoading={hasLoadingState(activeStep.id) && isButtonLoading}
        isDisabled={
          !canCreateManagedCluster || (hasLoadingState(activeStep.id) && isButtonDisabled)
        }
      >
        Next
      </Button>
    );

  console.log('activeStep', activeStep);

  return (
    <WizardFooterWrapper>
      <ActionList>
        <ActionListGroup>
          {primaryBtn}

          <ActionListItem>
            <Button
              variant="secondary"
              data-testid="wizard-back-button"
              onClick={goToPrevStep}
              isDisabled={steps.indexOf(activeStep) === 1}
            >
              Back
            </Button>
          </ActionListItem>
        </ActionListGroup>
        <ActionListGroup>
          <ActionListItem>
            <Button variant="link" data-testid="wizard-cancel-button" onClick={close}>
              Cancel
            </Button>
          </ActionListItem>
        </ActionListGroup>
      </ActionList>
    </WizardFooterWrapper>
  );
};
