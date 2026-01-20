import { Form, Grid, GridItem, TextInput } from '@patternfly/react-core';
import { Field } from 'formik';
import { FieldId } from '../../constants';
import { useFormState } from '../../hooks/useFormState';
import { createOperatorRolesPrefix } from '../../helpers/helpers';
import { TextInputField } from '../../components/TextInputField/TextInputField';
import { clusterNameAsyncValidation, clusterNameValidation, validateClusterName } from '../../validators/validators';
import { RichInputField } from '../../components/RichTextInputField/RichTextInputField';
import { helperHints } from '../../components/constants';

interface DetailsStepProps {
    hasExistingRegionalClusterName: boolean;
}

export const DetailsStep = (props: DetailsStepProps) => {
    const {hasExistingRegionalClusterName} = props;
  const {
    values: {
      [FieldId.Region]: region,
      [FieldId.MachinePoolsSubnets]: machinePoolsSubnets,
      [FieldId.ClusterPrivacy]: clusterPrivacy,
      [FieldId.InstallerRoleArn]: installerRoleArn,
      [FieldId.ClusterName]: clusterName,
      [FieldId.ClusterVersion]: selectedVersion,
    },
    errors,
    getFieldProps,
    setFieldValue,
    setFieldTouched,
    validateForm,
    values
  } = useFormState();

  console.log("cluster name", values)
   const clusterNameMaxLength = 54;
  return (
    <Form
      onSubmit={(event: any) => {
        event.preventDefault();
        return false;
      }}
    >
      <Grid hasGutter>
        <GridItem md={6}>
          <Field
            component={RichInputField}
            name={FieldId.ClusterName}
            label="Cluster name"
            type="text"
            isRequired
            validate={validateClusterName}
            validation={(value: string) => clusterNameValidation(value, clusterNameMaxLength)}
            asyncValidation={(value: string) =>
              clusterNameAsyncValidation(value, hasExistingRegionalClusterName)
            }
            extendedHelpText={helperHints.clusterNameHint}
            input={{
              ...getFieldProps(FieldId.ClusterName),
              onChange: async (event: React.FormEvent<HTMLInputElement>) => {
                const value = (event.target as HTMLInputElement).value;
                setFieldValue(
                  FieldId.CustomOperatorRolesPrefix,
                  createOperatorRolesPrefix(value),
                  false
                );
              },
            }}
          />
          {/* <TextInput id="textInput-with-dropdown" aria-label="input with dropdown and button" /> */}
        </GridItem>
      </Grid>
    </Form>
  );
};
