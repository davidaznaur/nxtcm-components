import { FormikErrors, FormikValues } from 'formik';
import { MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH, OPERATOR_ROLES_HASH_LENGTH } from '../constants';
import semver from 'semver';
/**
 * Scroll to and focus on the first field found in the record of IDs.
 * @param ids List of element IDs. An ID can be partial.
 * @param focusSelector Used to discover element to focus on, defaults to form elements;
 * input, select, textarea
 * @return true if a field was found to scroll to, false otherwise.
 */
export const scrollToFirstField = (
  ids: string[],
  focusSelector: string = 'input,select,textarea,button'
) => {
  if (!ids?.length) {
    return false;
  }

  // Use all error selectors, where the first matching element in the document is returned.
  // CSS.escape since it's possible for the id to be something like 'machinePoolsSubnets[0].privateSubnetId'
  // which needs to be escaped to use querySelector on it
  const selectorsExact = ids.map((id) => `[id="${CSS.escape(id)}"]`).join(',');
  const selectorsWildcard = ids.map((id) => `[id*="${CSS.escape(id)}"]`).join(',');
  const scrollElement =
    document.querySelector(selectorsExact) || document.querySelector(selectorsWildcard);

  if (scrollElement instanceof HTMLElement) {
    let focusElement: HTMLElement | null = scrollElement;

    // Find the element to focus on if the focusSelector does not include the element to scroll to.
    if (!focusSelector.includes(scrollElement.tagName.toLowerCase())) {
      focusElement = scrollElement?.querySelector(focusSelector);
    }

    // Scroll and focus
    setTimeout(() => scrollElement.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    focusElement?.focus({ preventScroll: true });

    return true;
  }

  return false;
};

export const getScrollErrorIds = (errors: FormikErrors<FormikValues>, arraySyntax?: boolean) =>
  Object.entries(errors).reduce((acc: string[], [fieldName, value]) => {
    // If the error value is an array, accumulate IDs based on Formik's
    // FieldArray format, which is an array of objects with key/value pairs.
    if (Array.isArray(value)) {
      value.forEach((field, index) => {
        Object.keys(field || {}).forEach((fieldKey) => {
          if (arraySyntax) {
            acc.push(`${fieldName}[${index}].${fieldKey}`);
          } else {
            acc.push(`${fieldName}.${index}.${fieldKey}`);
          }
        });
      });
    } else {
      acc.push(fieldName);
    }

    return acc;
  }, []);

export const isUserRoleForSelectedAWSAccount = (users: any[] | undefined, awsAcctId: any) =>
  users?.some((user: { aws_id: any }) => user.aws_id === awsAcctId);

/**
 * Generates cryptographically secure number within small range
 * there's a slight bias towards the lower end of the range.
 * @param min minimum range including min
 * @param max maximum range including max
 * @returns returns a cryptographically secure number within provided small range
 */
const secureRandomValueInRange = (min: number, max: number) => {
  const uints = new Uint32Array(1);
  crypto.getRandomValues(uints);
  const randomNumber = uints[0] / (0xffffffff + 1);
  const minNum = Math.ceil(min);
  const maxNum = Math.floor(max);
  return Math.floor(randomNumber * (maxNum - minNum + 1)) + minNum;
};

export const createOperatorRolesHash = () => {
  // random 4 alphanumeric hash
  const prefixArray = Array.from(
    crypto.getRandomValues(new Uint8Array(OPERATOR_ROLES_HASH_LENGTH))
  ).map((value) => (value % 36).toString(36));
  // cannot start with a number
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const randomCharacter = alphabet[secureRandomValueInRange(0, 25)];
  prefixArray[0] = randomCharacter;
  return prefixArray.join('');
};

export const createOperatorRolesPrefix = (clusterName: string) => {
  // increment allowedLength by 1 due to '-' character prepended to hash
  const allowedLength = MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH - (OPERATOR_ROLES_HASH_LENGTH + 1);
  const operatorRolesClusterName = clusterName.slice(0, allowedLength);

  return `${operatorRolesClusterName}-${createOperatorRolesHash()}`;
};

/**
 * determine if a version's major.minor level is <= maxMinorVerison's major.minor level.
 * we exclude the patch version of maxMinorVersion here even though ocpVersion can have a patch version.
 * this works because a <=major.minor semver range ignores patch versions, e.g. 4.11.13 satisfies the range <=4.11.
 * @param {string} version version to test (major.minor.patch or major.minor)
 * @param {string} maxMinorVersion version to compare with (major.minor.patch or major.minor)
 */
export const isSupportedMinorVersion = (version: string, maxMinorVersion: string) => {
  const parsedMaxMinorVersion = maxMinorVersion ? semver.coerce(maxMinorVersion) : null;
  const parsedVersion = semver.coerce(version)?.version || '';
  return parsedMaxMinorVersion
    ? semver.satisfies(
        parsedVersion,
        `<=${semver.major(parsedMaxMinorVersion)}.${semver.minor(parsedMaxMinorVersion)}`,
      )
    : false;
};

export const versionRegEx =
  /(?<major>\d+).(?<minor>\d+).(?<revision>\d+)(?:-(rc|fc).(?<patch>\d+))?/;

export const versionComparator = (v1: string, v2: string): number => {
  const g1 = versionRegEx.exec(v1)?.groups;
  const g2 = versionRegEx.exec(v2)?.groups;
  if (g1 && g2) {
    if (g1.major !== g2.major) {
      return parseInt(g1.major, 10) > parseInt(g2.major, 10) ? 1 : -1;
    }
    if (g1.minor !== g2.minor) {
      return parseInt(g1.minor, 10) > parseInt(g2.minor, 10) ? 1 : -1;
    }
    if (g1.revision !== g2.revision) {
      return parseInt(g1.revision, 10) > parseInt(g2.revision, 10) ? 1 : -1;
    }
    if (g1.patch !== g2.patch) {
      // e.g. 4.6.0 is later than 4.6.0-rc.4
      if (g1.patch === undefined) {
        return 1;
      }
      if (g2.patch === undefined) {
        return -1;
      }
      return parseInt(g1.patch, 10) > parseInt(g2.patch, 10) ? 1 : -1;
    }
  }
  return 0;
};
