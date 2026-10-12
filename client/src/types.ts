export interface VpsPlan {
  id: string;
  name: string;
  slug: string;
  coreNumber: number;
  memoryAmountMb: number;
  storageSizeGb: number;
  bandwidthTb: number;
  pricePerMonthIdr: number;
  pricePerMonthUsd: number;
  popular?: boolean;
  features: string[];
  upcloudPlan: string;
}

export interface VpsZone {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  pingMs: number;
  available: boolean;
}

export interface VpsTemplate {
  id: string;
  uuid: string;
  name: string;
  distro: 'ubuntu' | 'debian' | 'rocky' | 'almalinux' | 'centos' | 'fedora' | 'windows' | string;
  version: string;
  icon: string;
  minDiskGb: number;
  tier: 'maxiops' | 'standard';
  description?: string;
  isLatest?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  planId: string;
  zoneCode: string;
  templateUuid: string;
  templateName: string;
  hostname: string;
  rootPassword: string;
  sshKey?: string;
  billingCycle: 'monthly' | 'quarterly' | 'annually';
  baseAmountIdr: number;
  totalAmountIdr: number;
  amountUniq?: number;
  adminFee?: number;
  paymentStatus: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
  vpsStatus: 'PENDING_PAYMENT' | 'PROVISIONING' | 'ACTIVE' | 'ERROR' | 'STOPPED' | 'TERMINATED';
  qrisTransactionId?: string;
  qrisMethod?: string;
  qrUrl?: string;
  qrisImage?: string;
  paymentUrl?: string;
  expiredAt?: string;
  paidAt?: string;
  serverUuid?: string;
  serverIp?: string;
  serverIpv6?: string;
  serverState?: 'started' | 'stopped' | 'maintenance' | 'error';
  errorMessage?: string;
  coreNumber?: number;
  memoryAmountMb?: number;
  storageSizeGb?: number;
  bandwidthTb?: number;
  planName?: string;
  zoneName?: string;
  zoneFlag?: string;
  zoneCity?: string;
  zoneCountry?: string;
  templateIcon?: string;
  templateDistro?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogData {
  plans: VpsPlan[];
  zones: VpsZone[];
  templates: VpsTemplate[];
  store: {
    name: string;
    tagline: string;
    supportEmail: string;
    supportWhatsapp: string;
    isSandbox: boolean;
  };
}

export interface AdminMetrics {
  totalOrders: number;
  paidOrdersCount: number;
  activeServersCount: number;
  pendingOrdersCount: number;
  totalRevenueIdr: number;
}

export interface UpCloudTokenEntry {
  key: string;
  value: string;
}

export interface UpCloudTokenTestResult {
  key: string;
  maskedToken: string;
  status: 'valid' | 'invalid' | 'rate_limited' | 'error';
  username?: string;
  credits?: number;
  error?: string;
}

export interface AdminSettings {
  upcloudApiToken: string;
  upcloudApiTokens?: UpCloudTokenEntry[];
  upcloudUsername: string;
  upcloudPassword: string;
  useTokenAuth: boolean;
  hasUpCloudToken: boolean;
  hasUpCloudBasic: boolean;
  buatqrisAccountId: string;
  buatqrisSecretToken: string;
  buatqrisSigningSecret: string;
  hasBuatQrisCreds: boolean;
  buatqrisMethod: 'qris_one' | 'qris_two' | 'qris_three' | 'qris_four';
  buatqrisFeeBy: 'user' | 'buyer';
  isSandbox: boolean;
  storeName: string;
  storeTagline: string;
  supportEmail: string;
  supportWhatsapp: string;
  adminEmails: string[];
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin: boolean;
}
