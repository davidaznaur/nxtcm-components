
const lowercaseAlphaNumericCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
const DNS_LABEL_REGEXP = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
const DNS_ONLY_ALPHANUMERIC_HYPHEN = /^[-a-z0-9]+$/;
const DNS_START_ALPHA = /^[a-z]/;
const DNS_END_ALPHANUMERIC = /[a-z0-9]$/;
const MAX_CLUSTER_NAME_LENGTH = 54;

export const checkObjectNameValidation = (
  value: string | undefined,
  objectName: string,
  maxLen: number,
) => [
  {
    text: `1 - ${maxLen} characters`,
    validated: !!value?.length && value?.length <= maxLen,
  },
  {
    text: 'Consist of lower-case alphanumeric characters, or hyphen (-)',
    validated: !!value && DNS_ONLY_ALPHANUMERIC_HYPHEN.test(value),
  },
  {
    text: 'Start with a lower-case alphabetic character',
    validated: !!value && DNS_START_ALPHA.test(value),
  },
  {
    text: 'End with a lower-case alphanumeric character',
    validated: !!value && DNS_END_ALPHANUMERIC.test(value),
  },
];

export const checkObjectNameAsyncValidation = (
  value?: string,
  isExistingRegionalClusterName?: boolean,
) => [
  {
    text: 'Globally unique name in your organization',
    validator: async () => {
      if (!value?.length) {
        return false;
      }

      return isExistingRegionalClusterName !== undefined ? !isExistingRegionalClusterName : true;
    },
  },
];

export function validateClusterName(value: string, _item: unknown, t?: any) {
  t = t ? t : (value: any) => value;
  if (!value) return undefined;
  if (value.length > 253) return `${t('This value can contain at most 253 characters')}`;
  for (const char of value) {
    if (!lowercaseAlphaNumericCharacters.includes(char) && char !== '-' && char !== '.')
      return `${t("This value can only contain lowercase alphanumeric characters or '-' or '.'")}`;
  }
  if (!lowercaseAlphaNumericCharacters.includes(value[0]))
    return `${t('This value must start with an alphanumeric character')}`;
  if (!lowercaseAlphaNumericCharacters.includes(value[value.length - 1]))
    return `${t('This value must end with an alphanumeric character')}`;
  return undefined;
}
export const clusterNameValidation = (value?: string, maxLen?: number) =>
  checkObjectNameValidation(value, 'Cluster', maxLen || MAX_CLUSTER_NAME_LENGTH);

export const clusterNameAsyncValidation = (value?: string, isExistingRegionalClusterName?: boolean) =>
  checkObjectNameAsyncValidation(value, isExistingRegionalClusterName);