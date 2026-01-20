
export type SupportStatus = (typeof supportStatuses)[keyof typeof supportStatuses];

export type SupportMap = {
  [version: string]: SupportStatus;
};

export type Version = {
      kind?: string;
      id?: string;
      href?: string;
      gcp_marketplace_enabled?: boolean;
      rosa_enabled?: boolean;
      available_upgrades?: string[];
      channel_group?: string;
      default?: boolean;
      enabled?: boolean;
      end_of_life_timestamp?: string;
      hosted_control_plane_default?: boolean;
      hosted_control_plane_enabled?: boolean;
      raw_id?: string;
      release_image?: string;
      wif_enabled?: boolean;
}

export type FuzzyEntryType = {
  groupId?: string;
  entryId: string;
  label: string;
  description?: string;
  disabled?: boolean;
};
export type FuzzyEntryGroup = Record<string, FuzzyEntryType[]>;
export type FuzzyDataType = FuzzyEntryType[] | FuzzyEntryGroup;