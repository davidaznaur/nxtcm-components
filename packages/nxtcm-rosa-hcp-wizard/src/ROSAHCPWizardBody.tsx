import React, {
  lazy,
  Suspense,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import { Wizard, WizardStep } from '@patternfly/react-core/dist/dynamic/components/Wizard';
import { useFormContext, useWatch } from 'react-hook-form';

import { FIELD_NAME, STEP_IDS } from './constants';
import { useWizardFieldMetaChangeEffects } from './fieldMetaChangeEffects/useWizardFieldMetaChangeEffects';
import { createRosaHcpWizardFooter } from './Footer/RosaHcpWizardFooter';
import { RosaHcpYamlEditorFooter } from './Footer/RosaHcpYamlEditorFooter';
import { useRosaHcpWizardSubmit } from './Footer/useRosaHcpWizardSubmit';
import { RosaWizardSubmitError } from './RosaWizardSubmitError';
import { RosaWizardSubmittingState } from './RosaWizardSubmittingState';
import { ClusterWideProxy } from './Steps/BasicSetup/ClusterWideProxy/ClusterWideProxy';
import { Details } from './Steps/BasicSetup/Details/Details';
import { MachinePools } from './Steps/BasicSetup/MachinePools/MachinePools';
import { Networking } from './Steps/BasicSetup/Networking/Networking';
import { RolesAndPolicies } from './Steps/BasicSetup/RolesAndPolicies/RolesAndPolicies';
import { ClusterUpdates } from './Steps/OptionalSetup/ClusterUpdates/ClusterUpdates';
import { Encryption } from './Steps/OptionalSetup/Encryption/Encryption';
import { Review } from './Steps/Review/Review';
import type { YamlEditorHandle } from './Steps/YamlEditor/RosaHcpYamlEditorStep';
import { useRosaHcpWizardStrings } from './stringsProvider/RosaHcpWizardStringsContext';
import type { ROSAHCPCluster, RosaHCPWizardProps } from './types';
import { useIsStepHidden } from './WizardConfigContext';

import './ROSAHCPWizardBody.css';
// Eager load so layout applies during Suspense fallback before the lazy step chunk loads.
import './Steps/YamlEditor/RosaHcpYamlEditorStep.css';

const RosaHcpYamlEditorStep = lazy(() =>
  import('./Steps/YamlEditor/RosaHcpYamlEditorStep').then((module) => ({
    default: module.RosaHcpYamlEditorStep,
  }))
);

type FinalStepView = 'review' | 'yaml' | 'submitting' | 'error';

export const ROSAHCPWizardBody = (props: RosaHCPWizardProps) => {
  const {
    wizardData,
    onSubmit,
    onCancel,
    onSubmitError,
    onBackToReviewStep,
    resourceGenerator,
    product,
    selectedSecret,
    enableAllWizardNavSteps = false,
  } = props;

  const { getValues } = useFormContext<Partial<ROSAHCPCluster>>();
  const [isNavigatingToReview, setIsNavigatingToReview] = useState(false);
  const [isYamlEditorOpen, setIsYamlEditorOpen] = useState(false);
  const [yamlDraft, setYamlDraft] = useState<string | undefined>(undefined);
  const yamlEditorRef = useRef<YamlEditorHandle>(null);
  const wizardViewRef = useRef<HTMLDivElement>(null);
  const yamlViewRef = useRef<HTMLDivElement>(null);
  const replacementViewRef = useRef<HTMLElement>(null);
  const editYamlButtonRef = useRef<HTMLButtonElement>(null);
  const submitErrorTitleId = useId();
  const submitErrorMessageId = useId();
  const createClusterTitleId = useId();

  const getFormYaml = useCallback(
    () => resourceGenerator.renderYaml(getValues()),
    [getValues, resourceGenerator]
  );
  const getSubmissionYaml = useCallback((): string => {
    if (!isYamlEditorOpen) return getFormYaml();

    const yaml = yamlEditorRef.current?.getYaml() ?? '';
    setYamlDraft(yaml);
    return yaml;
  }, [getFormYaml, isYamlEditorOpen]);
  const { isSubmitting, submitWizard } = useRosaHcpWizardSubmit({
    onSubmit,
    getYaml: getSubmissionYaml,
    skipFormValidation: isYamlEditorOpen,
  });

  const handleBackToReviewStep = useCallback(async () => {
    if (!onBackToReviewStep) return;
    setIsNavigatingToReview(true);
    try {
      await onBackToReviewStep();
    } finally {
      setIsNavigatingToReview(false);
    }
  }, [onBackToReviewStep]);

  const handleCloseYamlEditor = useCallback(() => {
    setYamlDraft(undefined);
    setIsYamlEditorOpen(false);
  }, []);
  const openYamlEditor = useCallback(() => {
    setYamlDraft(undefined);
    setIsYamlEditorOpen(true);
  }, []);

  const handleWizardStepChange = useCallback<
    NonNullable<React.ComponentProps<typeof Wizard>['onStepChange']>
  >(
    (_event, newStep) => {
      if (isYamlEditorOpen && newStep?.id !== STEP_IDS.REVIEW) {
        setYamlDraft(undefined);
        setIsYamlEditorOpen(false);
      }
    },
    [isYamlEditorOpen]
  );

  const footer = useMemo(
    () => createRosaHcpWizardFooter(isSubmitting, submitWizard, enableAllWizardNavSteps),
    [enableAllWizardNavSteps, isSubmitting, submitWizard]
  );

  useWizardFieldMetaChangeEffects(wizardData);

  const clusterWideProxySelected = useWatch<ROSAHCPCluster, typeof FIELD_NAME.CONFIGURE_PROXY>({
    name: FIELD_NAME.CONFIGURE_PROXY,
  });

  const isClusterWideProxyHidden = useIsStepHidden(STEP_IDS.CLUSTER_WIDE_PROXY);
  const isClusterUpdatesHidden = useIsStepHidden(STEP_IDS.CLUSTER_UPDATES);

  const rosaStrings = useRosaHcpWizardStrings();
  const { wizard, yamlEditor: yamlStrings } = rosaStrings;
  const sl = wizard.stepLabels;
  const finalStepView: FinalStepView = isSubmitting
    ? 'submitting'
    : onSubmitError
      ? 'error'
      : isYamlEditorOpen
        ? 'yaml'
        : 'review';
  const previousFinalStepViewRef = useRef<FinalStepView>(finalStepView);
  const focusReplacementView = useCallback((node: HTMLElement | null): void => {
    replacementViewRef.current = node;
    node?.focus();
  }, []);

  useLayoutEffect(() => {
    if (finalStepView === 'submitting' || finalStepView === 'error') {
      replacementViewRef.current?.focus();
    } else if (finalStepView === 'yaml') {
      yamlViewRef.current?.focus();
    } else if (finalStepView === 'review' && previousFinalStepViewRef.current !== 'review') {
      const focusTimer = window.setTimeout(() => {
        if (editYamlButtonRef.current) {
          editYamlButtonRef.current.focus();
        } else {
          wizardViewRef.current
            ?.querySelector<HTMLButtonElement>('button[aria-current="step"]')
            ?.focus();
        }
      }, 0);
      previousFinalStepViewRef.current = finalStepView;
      return () => window.clearTimeout(focusTimer);
    }
    previousFinalStepViewRef.current = finalStepView;
  }, [finalStepView]);

  const yamlEditorFooter = useMemo(
    () => (
      <RosaHcpYamlEditorFooter
        editorRef={yamlEditorRef}
        onClose={handleCloseYamlEditor}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitWizard={submitWizard}
      />
    ),

    [handleCloseYamlEditor, isSubmitting, onCancel, submitWizard]
  );

  const isFinishedView = finalStepView === 'submitting' || finalStepView === 'error';

  return (
    <div
      ref={wizardViewRef}
      className={`rosa-hcp-wizard${finalStepView === 'yaml' ? ' rosa-hcp-wizard--yaml-editor-open' : ''}`}
    >
      <Wizard
        data-testid="rosa-hcp-wizard-view"
        className={isFinishedView ? 'pf-m-finished' : undefined}
        footer={footer}
        onClose={onCancel}
        onStepChange={handleWizardStepChange}
        isVisitRequired={!enableAllWizardNavSteps}
      >
        <WizardStep
          isExpandable
          name={sl.basicSetup}
          id={STEP_IDS.BASIC_SETUP}
          steps={[
            <WizardStep name={sl.details} id={STEP_IDS.DETAILS} key={STEP_IDS.DETAILS}>
              <Details {...wizardData} product={product} />
            </WizardStep>,
            <WizardStep
              name={sl.rolesAndPolicies}
              id={STEP_IDS.ROLES_AND_POLICIES}
              key={STEP_IDS.ROLES_AND_POLICIES}
            >
              <RolesAndPolicies {...wizardData} product={product} selectedSecret={selectedSecret} />
            </WizardStep>,
            <WizardStep
              name={sl.machinePools}
              id={STEP_IDS.MACHINE_POOLS}
              key={STEP_IDS.MACHINE_POOLS}
            >
              <MachinePools {...wizardData} />
            </WizardStep>,
            <WizardStep name={sl.networking} id={STEP_IDS.NETWORKING} key={STEP_IDS.NETWORKING}>
              <Networking {...wizardData} />
            </WizardStep>,
            ...(clusterWideProxySelected && !isClusterWideProxyHidden
              ? [
                  <WizardStep
                    name={sl.clusterWideProxy}
                    id={STEP_IDS.CLUSTER_WIDE_PROXY}
                    key={STEP_IDS.CLUSTER_WIDE_PROXY}
                  >
                    <ClusterWideProxy />
                  </WizardStep>,
                ]
              : []),
          ]}
        />
        <WizardStep
          isExpandable
          name={sl.additionalSetup}
          id={STEP_IDS.OPTIONAL_SETUP}
          steps={[
            <WizardStep
              name={sl.encryptionOptional}
              id={STEP_IDS.ENCRYPTION}
              key={STEP_IDS.ENCRYPTION}
            >
              <Encryption />
            </WizardStep>,
            ...(!isClusterUpdatesHidden
              ? [
                  <WizardStep
                    name={sl.clusterUpdatesOptional}
                    id={STEP_IDS.CLUSTER_UPDATES}
                    key={STEP_IDS.CLUSTER_UPDATES}
                  >
                    <ClusterUpdates />
                  </WizardStep>,
                ]
              : []),
          ]}
        />

        <WizardStep
          name={sl.review}
          id={STEP_IDS.REVIEW}
          key={STEP_IDS.REVIEW}
          footer={isYamlEditorOpen ? yamlEditorFooter : undefined}
          body={
            finalStepView === 'yaml'
              ? { className: 'rosa-hcp-yaml-editor-wizard-main', hasNoPadding: true }
              : undefined
          }
        >
          {finalStepView === 'submitting' ? (
            <section
              ref={focusReplacementView}
              tabIndex={-1}
              role="status"
              aria-labelledby={createClusterTitleId}
              aria-label={wizard.createCluster}
            >
              <RosaWizardSubmittingState createClusterTitleId={createClusterTitleId} />
            </section>
          ) : finalStepView === 'error' ? (
            <section
              ref={focusReplacementView}
              tabIndex={-1}
              aria-labelledby={submitErrorTitleId}
              aria-describedby={
                typeof onSubmitError === 'string' && onSubmitError.length > 0
                  ? submitErrorMessageId
                  : undefined
              }
            >
              <RosaWizardSubmitError
                titleId={submitErrorTitleId}
                messageId={submitErrorMessageId}
                onSubmitError={onSubmitError ?? false}
                onBackToReviewStep={onBackToReviewStep ? handleBackToReviewStep : undefined}
                isNavigatingToReview={isNavigatingToReview}
                onCancel={onCancel}
              />
            </section>
          ) : finalStepView === 'yaml' ? (
            <div
              ref={yamlViewRef}
              className="rosa-hcp-yaml-editor-view"
              role="region"
              aria-label={yamlStrings.title}
              tabIndex={-1}
            >
              <Suspense
                fallback={
                  <div className="pf-v6-u-p-lg pf-v6-u-text-align-center">
                    <Spinner size="lg" aria-label={yamlStrings.title} />
                  </div>
                }
              >
                <RosaHcpYamlEditorStep
                  ref={yamlEditorRef}
                  initialYaml={yamlDraft}
                  onClose={handleCloseYamlEditor}
                  onCancel={onCancel}
                  resourceGenerator={resourceGenerator}
                />
              </Suspense>
            </div>
          ) : (
            <Review
              vpcList={wizardData.vpcList}
              onOpenYamlEditor={openYamlEditor}
              editInYamlButtonRef={editYamlButtonRef}
            />
          )}
        </WizardStep>
      </Wizard>
    </div>
  );
};
