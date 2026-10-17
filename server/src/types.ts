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
  upcloudPlan: string; // e.g. "1xCPU-1GB", "2xCPU-2GB", "2xCPU-4GB", "4xCPU-8GB"
}

export interface VpsZone {
  id: string;
  code: string; // fi-hel1, sg-sin1, de-fra1, uk-lon1, us-nyc1, etc.
  name: string;
  city: string;
  country: string;
  flag: string;
  pingMs: number;
  available: boolean;
}

export interface VpsTemplate {
  id: string;
  uuid: string; // UpCloud storage UUID
  name: string;
  distro: 'ubuntu' | 'debian' | 'rocky' | 'almalinux' | 'centos' | 'fedora' | 'windows' | 'alpine' | 'arch' | 'opensuse' | 'freebsd' | string;
  version: string;
  icon: string;
  minDiskGb: number;
  tier: 'maxiops' | 'standard';
  description?: string;
  isLatest?: boolean;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
export type VpsStatus = 'PENDING_PAYMENT' | 'PROVISIONING' | 'ACTIVE' | 'ERROR' | 'STOPPED' | 'TERMINATED';

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
  totalAmountIdr: number; // total after unique code / discount
  amountUniq?: number;
  adminFee?: number;
  paymentStatus: PaymentStatus;
  vpsStatus: VpsStatus;
  
  // BuatQRIS Data
  qrisTransactionId?: string;
  qrisMethod?: string;
  qrUrl?: string;
  qrisImage?: string;
  paymentUrl?: string;
  expiredAt?: string;
  paidAt?: string;

  // UpCloud Server Data
  serverUuid?: string;
  serverIp?: string;
  serverIpv6?: string;
  serverState?: 'started' | 'stopped' | 'maintenance' | 'error';
  errorMessage?: string;
  isAdminTest?: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface UpCloudTokenEntry {
  key: string;
  value: string;
}

export interface AppSettings {
  // UpCloud
  upcloudApiToken: string; // Bearer token (ucat_...) - primary / backward compatible
  upcloudApiTokens?: UpCloudTokenEntry[]; // Multi-token failover pool
  upcloudUsername: string; // Or Basic Auth user
  upcloudPassword: string; // Or Basic Auth pass
  useTokenAuth: boolean;

  // BuatQRIS
  buatqrisAccountId: string;
  buatqrisSecretToken: string;
  buatqrisSigningSecret: string;
  buatqrisMethod: 'qris_one' | 'qris_two' | 'qris_three' | 'qris_four';
  buatqrisFeeBy: 'user' | 'buyer';
  isSandbox: boolean; // test=1

  // Webstore config
  storeName: string;
  storeTagline: string;
  supportEmail: string;
  supportWhatsapp: string;

  // Admin and Auth
  adminEmails: string[];
  adminDailyTestLimit?: number;
}

export interface ChangelogItem {
  id: string;
  title: string;
  type: 'feature' | 'improvement' | 'fix';
  date: string;
  description?: string;
}
