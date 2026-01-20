import { FormikValues } from "formik";
import { FieldId } from "./constants";

export const initialValues: () => FormikValues = (
) => ({
  // static for ROSA, shouldn't change



  // other fields
  [FieldId.ClusterName]: '',
  [FieldId.ConfigureProxy]: false,
  [FieldId.CustomerManagedKey]: 'false',
  [FieldId.EtcdEncryption]: false,
  [FieldId.EtcdKeyArn]: '',
  [FieldId.KmsKeyArn]: '',
  [FieldId.SelectedVpc]: { id: '', name: '' },
  // Optional fields based on whether Hypershift is selected or not
});