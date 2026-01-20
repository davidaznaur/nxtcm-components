export enum StepId {
  BasicSetup = 'basic-setup',
  Details = 'details',
  RolesAndPolicies = 'roles-and-policies',
  Networking = 'networking',
  AdditionalSetup = 'additional-setup',
  Encryption = 'encryption-optional',
  NetworkingOptional = 'networking-optional',
  ClusterWideProxy = 'cluster-wide-proxy',
  ClusterUpdates = 'cluster-updates-optional',
  Review = 'review',
}

export enum StepName {
  BasicSetup = 'Basic setup',
  Details = 'Details',
  RolesAndPolicies = 'Roles and policies',
  Networking = 'Networking',
  AdditionalSetup = 'Additional setup',
  Encryption = 'Encryption (optional)',
  NetworkingOptional = 'Networking (optional)',
  ClusterWideProxy = 'Cluster-wide proxy (optional)',
  ClusterUpdates = 'Cluster updates (optional)',
  Review = 'Review and create',
}

export enum FieldId {
  ClusterName = 'name',
  ClusterVersion = 'cluster_version',
  AssociatedAwsId = 'associated_aws_id',
  BillingAccountId = 'billint_account_id',
  Region = 'region',
  InstallerRoleArn = 'installer_role_arn',
  SupportRoleArn = 'support_role_arn',
  WorkerRoleArn = 'worker_role_arn',
  ByoOidcConfigId = 'byo_oidc_config_id',
  SelectedVpc = 'selected_vpc',
  MachineType = 'machine_type',
  ClusterAutoscaling = 'cluster_autoscaling',
  MaxReplicas = 'max_replicas',
  MinReplicas = 'min_replicas',
  MachinePoolsSubnets = 'machinePoolsSubnets',
  ClusterPrivacy = 'cluster_privacy',
  ClusterPrivacyPublicSubnetId = 'cluster_privacy_public_subnet_id',
  EtcdEncryption = 'etcd_encryption',
  EtcdKeyArn = 'etcd_key_arn',
  CustomerManagedKey = 'customer_managed_key',
  KmsKeyArn = 'kms_key_arn',
  ConfigureProxy = 'configure_proxy',
  NetworkHostPrefix = 'network_host_prefix',
  NetworkMachineCidr = 'network_machine_cidr',
  NetworkPodCidr = 'network_pod_cidr',
  NetworkServiceCidr = 'network_service_cidr',
  HttpProxyUrl = 'http_proxy_url',
  HttpsProxyUrl = 'https_proxy_url',
  NoProxyDomains = 'no_proxy_domains',
  AdditionalTrustBundle = 'additional_trust_bundle',
  UpgradePolicy = 'upgrade_policy',
  CustomOperatorRolesPrefix = 'custom_operator_roles_prefix',
}

export const stepId = {
  ACCOUNTS_AND_ROLES_AS_FIRST_STEP: 5,
  CONTROL_PLANE: 10,
  ACCOUNTS_AND_ROLES_AS_SECOND_STEP: 15, // This is no longer used
  CLUSTER_SETTINGS: 20,
  CLUSTER_SETTINGS__DETAILS: 21,
  CLUSTER_SETTINGS__MACHINE_POOL: 23,
  NETWORKING: 30,
  NETWORKING__CONFIGURATION: 31,
  NETWORKING__VPC_SETTINGS: 32,
  NETWORKING__CLUSTER_WIDE_PROXY: 33,
  NETWORKING__CIDR_RANGES: 34,
  CLUSTER_ROLES_AND_POLICIES: 40,
  CLUSTER_UPDATES: 50,
  REVIEW_AND_CREATE: 60,
};

export const hasLoadingState = (wizardStepId: number | string) =>
  wizardStepId !== stepId.CONTROL_PLANE;

export const stepNameById = {
  [stepId.ACCOUNTS_AND_ROLES_AS_FIRST_STEP]: 'Accounts and roles',
  [stepId.ACCOUNTS_AND_ROLES_AS_SECOND_STEP]: 'Accounts and roles',
  [stepId.CONTROL_PLANE]: 'Control plane',
  [stepId.CLUSTER_SETTINGS]: 'Cluster settings',
  [stepId.CLUSTER_SETTINGS__DETAILS]: 'Details',
  [stepId.CLUSTER_SETTINGS__MACHINE_POOL]: 'Machine pool',
  [stepId.NETWORKING]: 'Networking',
  [stepId.NETWORKING__CONFIGURATION]: 'Configuration',
  [stepId.NETWORKING__VPC_SETTINGS]: 'VPC settings',
  [stepId.NETWORKING__CLUSTER_WIDE_PROXY]: 'Cluster-wide proxy',
  [stepId.NETWORKING__CIDR_RANGES]: 'CIDR ranges',
  [stepId.CLUSTER_ROLES_AND_POLICIES]: 'Cluster roles and policies',
  [stepId.CLUSTER_UPDATES]: 'Cluster updates',
  [stepId.REVIEW_AND_CREATE]: 'Review and create',
};

export const MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH = 32;
export const OPERATOR_ROLES_HASH_LENGTH = 4;
