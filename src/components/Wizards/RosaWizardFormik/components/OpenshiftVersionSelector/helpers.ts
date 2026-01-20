
import { channelGroups, supportStatuses } from "./constants";
import { FuzzyEntryType, SupportMap, Version } from "./types";
import semver from 'semver';

export const getVersionsData = (
  versions: Version[],
  unstableVersionsIncluded?: boolean,
  supportVersionMap?: SupportMap,
  channelGroupSelected?: string,
  isEUSChannelEnabled?: boolean,
) => {
  const fullSupport: FuzzyEntryType[] = [];
  const maintenanceSupport: FuzzyEntryType[] = [];

  const candidate: FuzzyEntryType[] = [];
  const nightly: FuzzyEntryType[] = [];
  const fast: FuzzyEntryType[] = [];
  const eus: FuzzyEntryType[] = [];

  versions.forEach((version: Version) => {
    const { raw_id: versionRawId, id: versionId, channel_group: channelGroup } = version;
    if (versionRawId && versionId) {
      if (
        (!unstableVersionsIncluded && channelGroup !== channelGroups.EUS) ||
        channelGroup === channelGroups.STABLE
      ) {
        const createMajorMinorVersion = (rawId: string) => {
          const versionObject = semver.parse(rawId);

          return versionObject
            ? versionObject.major.toString().concat('.', versionObject.minor.toString())
            : '';
        };

        const majorMinorVersion = createMajorMinorVersion(versionRawId);

        const hasFullSupport = supportVersionMap?.[majorMinorVersion] === supportStatuses.FULL;

        const versionEntry = {
          entryId: versionId,
          label: versionRawId,
          groupKey: hasFullSupport ? supportStatuses.FULL : supportStatuses.MAINTENANCE,
        };

        if (hasFullSupport) {
          fullSupport.push(versionEntry);
        } else {
          maintenanceSupport.push(versionEntry);
        }
        return;
      }

      if (unstableVersionsIncluded) {
        const versionEntry = {
          entryId: versionId,
          label: `${versionRawId} (${channelGroup})`,
          groupKey: channelGroup,
        };

        switch (channelGroup) {
          case channelGroups.CANDIDATE:
            candidate.push(versionEntry);
            break;
          case channelGroups.NIGHTLY:
            nightly.push(versionEntry);
            break;
          case channelGroups.FAST:
            fast.push(versionEntry);
            break;
          case channelGroups.EUS:
            eus.push(versionEntry);
            break;
          default:
            break;
        }
      } else {
        const versionEntry = {
          entryId: versionId,
          label: `${versionRawId} (${channelGroup})`,
          groupKey: channelGroup,
        };

        switch (channelGroup) {
          case channelGroups.EUS:
            eus.push(versionEntry);
            break;
          default:
            break;
        }
      }
    }
  });

  const stableVersions = {
    'Full support': fullSupport,
    'Maintenance support': maintenanceSupport,
  };

  if (isEUSChannelEnabled) {
    switch (channelGroupSelected) {
      case channelGroups.CANDIDATE:
        return candidate;

      case channelGroups.NIGHTLY:
        return nightly;

      case channelGroups.FAST:
        return fast;

      case channelGroups.EUS:
        return eus;

      default:
        return stableVersions;
    }
  }

  return unstableVersionsIncluded
    ? {
        ...stableVersions,
        Candidate: candidate,
        Nightly: nightly,
        Fast: fast,
        EUS: eus,
      }
    : stableVersions;
};