import { FormikValues, useFormikContext } from 'formik';

export const useFormState = useFormikContext<FormikValues>;
