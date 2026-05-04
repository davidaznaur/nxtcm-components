import { Alert } from '@patternfly/react-core';
import links from '../../../../links';
import { useRosaHcpWizardStrings } from '../../../../stringsProvider/RosaHcpWizardStringsContext';
import ExternalLink from '../../../../components/ExternalLink';

const SecurityGroupsNoEditAlert = () => {
  const sg = useRosaHcpWizardStrings().securityGroups;

  return (
    <Alert
      variant="info"
      isInline
      title={sg.noEditTitle}
      actionLinks={
        <>
          <ExternalLink noIcon href={links.ROSA_SECURITY_GROUPS} className="pf-v6-u-pr-sm">
            {sg.noEditViewMoreInfo}
          </ExternalLink>
          <ExternalLink noIcon href={links.AWS_CONSOLE_SECURITY_GROUPS}>
            {sg.noEditAwsConsoleLink}
          </ExternalLink>
        </>
      }
    />
  );
};

export default SecurityGroupsNoEditAlert;
