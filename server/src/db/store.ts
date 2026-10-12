import fs from 'fs';
import path from 'path';
import { Order, AppSettings, VpsPlan, VpsZone, VpsTemplate } from '../types';

const DATA_DIR = path.join(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Default initial plans
export const DEFAULT_PLANS: VpsPlan[] = [
  {
    id: 'starter',
    name: 'Starter Cloud',
    slug: 'starter-1c-1g',
    coreNumber: 1,
    memoryAmountMb: 1024,
    storageSizeGb: 25,
    bandwidthTb: 1,
    pricePerMonthIdr: 75000,
    pricePerMonthUsd: 5,
    upcloudPlan: '1xCPU-1GB',
    features: [
      '1 vCPU Core (High Performance)',
      '1 GB MaxIOPS RAM',
      '25 GB MaxIOPS Ultra-Fast Storage',
      '1 TB Transfer Kuota / Bulan',
      '1 Gbps Public Port',
      'DDoS Protection Included',
      'Root Access & Cloud-Init'
    ]
  },
  {
    id: 'developer',
    name: 'Pro Developer',
    slug: 'developer-2c-2g',
    coreNumber: 2,
    memoryAmountMb: 2048,
    storageSizeGb: 50,
    bandwidthTb: 2,
    pricePerMonthIdr: 150000,
    pricePerMonthUsd: 10,
    popular: true,
    upcloudPlan: '2xCPU-2GB',
    features: [
      '2 vCPU Cores',
      '2 GB MaxIOPS RAM',
      '50 GB MaxIOPS Ultra-Fast Storage',
      '2 TB Transfer Kuota / Bulan',
      '1 Gbps Public Port',
      'Automated Daily Backups Ready',
      'DDoS Protection Included',
      'Instant Auto-Provisioning'
    ]
  },
  {
    id: 'business',
    name: 'Business Cloud',
    slug: 'business-2c-4g',
    coreNumber: 2,
    memoryAmountMb: 4096,
    storageSizeGb: 80,
    bandwidthTb: 4,
    pricePerMonthIdr: 295000,
    pricePerMonthUsd: 20,
    upcloudPlan: '2xCPU-4GB',
    features: [
      '2 vCPU Cores (Dedicated Power)',
      '4 GB MaxIOPS RAM',
      '80 GB MaxIOPS Ultra-Fast Storage',
      '4 TB Transfer Kuota / Bulan',
      '1 Gbps Public Port',
      'High Priority I/O Bandwidth',
      'Full SLA 100% Uptime Promise',
      'Dedicated IPv4 & IPv6'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Power',
    slug: 'enterprise-4c-8g',
    coreNumber: 4,
    memoryAmountMb: 8192,
    storageSizeGb: 160,
    bandwidthTb: 8,
    pricePerMonthIdr: 580000,
    pricePerMonthUsd: 40,
    upcloudPlan: '4xCPU-8GB',
    features: [
      '4 vCPU Cores',
      '8 GB MaxIOPS RAM',
      '160 GB MaxIOPS Storage',
      '8 TB Transfer Kuota / Bulan',
      '1 Gbps Public Port',
      'Enterprise SLA Guarantee',
      'Dedicated 24/7 Priority Support'
    ]
  }
];

// UpCloud supported zones
export const DEFAULT_ZONES: VpsZone[] = [
  {
    id: 'sg-sin1',
    code: 'sg-sin1',
    name: 'Singapore #1 (Equinix SG3)',
    city: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    pingMs: 15,
    available: true
  },
  {
    id: 'de-fra1',
    code: 'de-fra1',
    name: 'Frankfurt #1 (Interxion)',
    city: 'Frankfurt',
    country: 'Germany',
    flag: '🇩🇪',
    pingMs: 160,
    available: true
  },
  {
    id: 'fi-hel1',
    code: 'fi-hel1',
    name: 'Helsinki #1',
    city: 'Helsinki',
    country: 'Finland',
    flag: '🇫🇮',
    pingMs: 180,
    available: true
  },
  {
    id: 'uk-lon1',
    code: 'uk-lon1',
    name: 'London #1',
    city: 'London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    pingMs: 175,
    available: true
  },
  {
    id: 'us-nyc1',
    code: 'us-nyc1',
    name: 'New York #1',
    city: 'New York',
    country: 'United States',
    flag: '🇺🇸',
    pingMs: 220,
    available: true
  },
  {
    id: 'us-chi1',
    code: 'us-chi1',
    name: 'Chicago #1',
    city: 'Chicago',
    country: 'United States',
    flag: '🇺🇸',
    pingMs: 235,
    available: true
  },
  {
    id: 'au-syd1',
    code: 'au-syd1',
    name: 'Sydney #1',
    city: 'Sydney',
    country: 'Australia',
    flag: '🇦🇺',
    pingMs: 95,
    available: true
  },
  {
    id: 'nl-ams1',
    code: 'nl-ams1',
    name: 'Amsterdam #1',
    city: 'Amsterdam',
    country: 'Netherlands',
    flag: '🇳🇱',
    pingMs: 168,
    available: true
  }
];

// UpCloud public OS templates (Verified live from UpCloud API /1.3/storage/template)
export const DEFAULT_TEMPLATES: VpsTemplate[] = [
  // Ubuntu
  {
    id: 'ubuntu-24-04',
    uuid: '01000000-0000-4000-8000-000030240200',
    name: 'Ubuntu Server 24.04 LTS (Noble Numbat)',
    distro: 'ubuntu',
    version: '24.04 LTS',
    icon: 'ubuntu',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Versi LTS terbaru dengan dukungan jangka panjang',
    isLatest: true
  },
  {
    id: 'ubuntu-22-04',
    uuid: '01000000-0000-4000-8000-000030220200',
    name: 'Ubuntu Server 22.04 LTS (Jammy Jellyfish)',
    distro: 'ubuntu',
    version: '22.04 LTS',
    icon: 'ubuntu',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Stabil & kompatibilitas aplikasi luas'
  },
  {
    id: 'ubuntu-24-04-cuda',
    uuid: '01000000-0000-4000-8000-000030700200',
    name: 'Ubuntu Server 24.04 LTS (NVIDIA & CUDA)',
    distro: 'ubuntu',
    version: '24.04 CUDA',
    icon: 'ubuntu',
    minDiskGb: 20,
    tier: 'maxiops',
    description: 'Driver NVIDIA & Toolkit CUDA pre-installed'
  },
  {
    id: 'ubuntu-26-04',
    uuid: '01000000-0000-4000-8000-000030260200',
    name: 'Ubuntu Server 26.04 LTS (Resolute Raccoon)',
    distro: 'ubuntu',
    version: '26.04 LTS',
    icon: 'ubuntu',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Next-gen kernel & fitur terbaru'
  },

  // Debian
  {
    id: 'debian-12',
    uuid: '01000000-0000-4000-8000-000020070100',
    name: 'Debian GNU/Linux 12 (Bookworm)',
    distro: 'debian',
    version: '12 (Bookworm)',
    icon: 'debian',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Ultra-stabil, ringan, dan handal untuk server produksi',
    isLatest: true
  },
  {
    id: 'debian-11',
    uuid: '01000000-0000-4000-8000-000020060100',
    name: 'Debian GNU/Linux 11 (Bullseye)',
    distro: 'debian',
    version: '11 (Bullseye)',
    icon: 'debian',
    minDiskGb: 5,
    tier: 'maxiops',
    description: 'Versi LTS teruji hemat resource'
  },
  {
    id: 'debian-13',
    uuid: '01000000-0000-4000-8000-000020080100',
    name: 'Debian GNU/Linux 13 (Trixie)',
    distro: 'debian',
    version: '13 (Trixie)',
    icon: 'debian',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Debian generasi berikutnya (Testing channel)'
  },

  // AlmaLinux
  {
    id: 'almalinux-9',
    uuid: '01000000-0000-4000-8000-000140020100',
    name: 'AlmaLinux 9',
    distro: 'almalinux',
    version: '9',
    icon: 'almalinux',
    minDiskGb: 10,
    tier: 'maxiops',
    description: '100% 1:1 Binary Compatible Red Hat Enterprise Linux 9',
    isLatest: true
  },
  {
    id: 'almalinux-8',
    uuid: '01000000-0000-4000-8000-000140010100',
    name: 'AlmaLinux 8',
    distro: 'almalinux',
    version: '8',
    icon: 'almalinux',
    minDiskGb: 5,
    tier: 'maxiops',
    description: 'Kompatibel RHEL 8 untuk aplikasi enterprise'
  },
  {
    id: 'almalinux-10',
    uuid: '01000000-0000-4000-8000-000141000200',
    name: 'AlmaLinux 10',
    distro: 'almalinux',
    version: '10',
    icon: 'almalinux',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Generasi terbaru platform enterprise AlmaLinux'
  },

  // Rocky Linux
  {
    id: 'rocky-9',
    uuid: '01000000-0000-4000-8000-000150020100',
    name: 'Rocky Linux 9',
    distro: 'rocky',
    version: '9',
    icon: 'rocky',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Enterprise OS alternatif CentOS oleh pendiri CentOS asli',
    isLatest: true
  },
  {
    id: 'rocky-8',
    uuid: '01000000-0000-4000-8000-000150010100',
    name: 'Rocky Linux 8',
    distro: 'rocky',
    version: '8',
    icon: 'rocky',
    minDiskGb: 5,
    tier: 'maxiops',
    description: 'Kompatibilitas RHEL 8 yang tangguh'
  },
  {
    id: 'rocky-10',
    uuid: '01000000-0000-4000-8000-000151000200',
    name: 'Rocky Linux 10',
    distro: 'rocky',
    version: '10',
    icon: 'rocky',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Generasi baru Rocky Linux'
  },

  // CentOS Stream
  {
    id: 'centos-9',
    uuid: '01000000-0000-4000-8000-000050010600',
    name: 'CentOS Stream 9',
    distro: 'centos',
    version: 'Stream 9',
    icon: 'centos',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Upstream resmi Red Hat Enterprise Linux',
    isLatest: true
  },
  {
    id: 'centos-10',
    uuid: '01000000-0000-4000-8000-000050010700',
    name: 'CentOS Stream 10',
    distro: 'centos',
    version: 'Stream 10',
    icon: 'centos',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Platform pengembangan Red Hat Enterprise Linux generasi baru'
  },

  // Fedora
  {
    id: 'fedora-43',
    uuid: '01000000-0000-4000-8000-000044204700',
    name: 'Fedora 43 Cloud',
    distro: 'fedora',
    version: '43 Cloud',
    icon: 'fedora',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Fitur Linux paling mutakhir, kernel modern & inovatif',
    isLatest: true
  },
  {
    id: 'fedora-42',
    uuid: '01000000-0000-4000-8000-000044203700',
    name: 'Fedora 42 Cloud',
    distro: 'fedora',
    version: '42 Cloud',
    icon: 'fedora',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Stabil & modern untuk cloud developer'
  },

  // Windows Server
  {
    id: 'windows-2025',
    uuid: '01000000-0000-4000-8000-000010090300',
    name: 'Windows Server 2025 Standard',
    distro: 'windows',
    version: '2025 Standard',
    icon: 'windows',
    minDiskGb: 25,
    tier: 'maxiops',
    description: 'Edisi Windows Server terbaru dengan keamanan AI & SMB over QUIC',
    isLatest: true
  },
  {
    id: 'windows-2022',
    uuid: '01000000-0000-4000-8000-000010080300',
    name: 'Windows Server 2022 Standard',
    distro: 'windows',
    version: '2022 Standard',
    icon: 'windows',
    minDiskGb: 20,
    tier: 'maxiops',
    description: 'Pilihan terpopuler dengan RDP & ekosistem .NET'
  },
  {
    id: 'windows-2019',
    uuid: '01000000-0000-4000-8000-000010070300',
    name: 'Windows Server 2019 Standard',
    distro: 'windows',
    version: '2019 Standard',
    icon: 'windows',
    minDiskGb: 25,
    tier: 'maxiops',
    description: 'Kompatibilitas legacy aplikasi Windows Server'
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  upcloudApiToken: process.env.UPCLOUD_API_TOKEN || '',
  upcloudApiTokens: process.env.UPCLOUD_API_TOKEN 
    ? [{ key: 'UPCLOUD_API_TOKEN_1', value: process.env.UPCLOUD_API_TOKEN }]
    : [],
  upcloudUsername: process.env.UPCLOUD_USERNAME || '',
  upcloudPassword: process.env.UPCLOUD_PASSWORD || '',
  useTokenAuth: true,
  buatqrisAccountId: process.env.BUATQRIS_ACCOUNT_ID || '',
  buatqrisSecretToken: process.env.BUATQRIS_SECRET_TOKEN || '',
  buatqrisSigningSecret: process.env.BUATQRIS_SIGNING_SECRET || '',
  buatqrisMethod: 'qris_two',
  buatqrisFeeBy: 'user',
  isSandbox: false,
  storeName: 'NexVps Cloud',
  storeTagline: 'Ultra-Fast Cloud VPS with Instant QRIS Activation',
  supportEmail: 'support@nexvps.cloud',
  supportWhatsapp: '6281234567890',
  adminEmails: ['sanzzydev@gmail.com']
};

interface StoreSchema {
  settings: AppSettings;
  plans: VpsPlan[];
  zones: VpsZone[];
  templates: VpsTemplate[];
  orders: Order[];
}

class Store {
  private data: StoreSchema;

  constructor() {
    this.ensureDir();
    this.data = this.load();
  }

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): StoreSchema {
    if (fs.existsSync(STORE_FILE)) {
      try {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const loadedSettings: AppSettings = { ...DEFAULT_SETTINGS, ...parsed.settings };
        if (!loadedSettings.upcloudApiTokens || loadedSettings.upcloudApiTokens.length === 0) {
          if (loadedSettings.upcloudApiToken) {
            loadedSettings.upcloudApiTokens = [
              { key: 'UPCLOUD_API_TOKEN_1', value: loadedSettings.upcloudApiToken }
            ];
          } else {
            loadedSettings.upcloudApiTokens = [];
          }
        }
        return {
          settings: loadedSettings,
          plans: parsed.plans || DEFAULT_PLANS,
          zones: parsed.zones || DEFAULT_ZONES,
          templates: parsed.templates || DEFAULT_TEMPLATES,
          orders: parsed.orders || []
        };
      } catch (e) {
        console.error('Error loading store, using defaults:', e);
      }
    }
    const initial: StoreSchema = {
      settings: DEFAULT_SETTINGS,
      plans: DEFAULT_PLANS,
      zones: DEFAULT_ZONES,
      templates: DEFAULT_TEMPLATES,
      orders: []
    };
    this.save(initial);
    return initial;
  }

  private save(data?: StoreSchema) {
    this.ensureDir();
    const toSave = data || this.data;
    fs.writeFileSync(STORE_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
  }

  getSettings(): AppSettings {
    return { ...this.data.settings };
  }

  updateSettings(partial: Partial<AppSettings>): AppSettings {
    const nextSettings = { ...this.data.settings, ...partial };
    // Synchronize primary token and failover list
    if (partial.upcloudApiTokens && partial.upcloudApiTokens.length > 0) {
      nextSettings.upcloudApiToken = partial.upcloudApiTokens[0]?.value || '';
    } else if (partial.upcloudApiToken && (!partial.upcloudApiTokens || partial.upcloudApiTokens.length === 0)) {
      nextSettings.upcloudApiTokens = [{ key: 'UPCLOUD_API_TOKEN_1', value: partial.upcloudApiToken }];
    }
    this.data.settings = nextSettings;
    this.save();
    return this.getSettings();
  }

  getPlans(): VpsPlan[] {
    return this.data.plans;
  }

  addPlan(plan: VpsPlan): VpsPlan {
    this.data.plans.push(plan);
    this.save();
    return plan;
  }

  updatePlan(id: string, updates: Partial<VpsPlan>): VpsPlan | undefined {
    const idx = this.data.plans.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.plans[idx] = {
      ...this.data.plans[idx],
      ...updates
    };
    this.save();
    return this.data.plans[idx];
  }

  deletePlan(id: string): boolean {
    const idx = this.data.plans.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.plans.splice(idx, 1);
    this.save();
    return true;
  }

  getZones(): VpsZone[] {
    return this.data.zones;
  }

  getTemplates(): VpsTemplate[] {
    return this.data.templates;
  }

  getOrders(): Order[] {
    return this.data.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  getOrderByQrisTransactionId(txId: string): Order | undefined {
    return this.data.orders.find(o => o.qrisTransactionId === txId);
  }

  addOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const idx = this.data.orders.findIndex(o => o.id === id || o.orderNumber === id);
    if (idx === -1) return undefined;
    this.data.orders[idx] = {
      ...this.data.orders[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.orders[idx];
  }
}

export const store = new Store();
