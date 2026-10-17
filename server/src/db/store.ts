import fs from 'fs';
import path from 'path';
import { Order, AppSettings, VpsPlan, VpsZone, VpsTemplate, ChangelogItem } from '../types';
import { INITIAL_CHANGELOG_UPDATES } from './initialChangelog';

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
    description: 'Versi LTS terbaru dengan dukungan jangka panjang 5 tahun',
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
    id: 'ubuntu-20-04',
    uuid: '01000000-0000-4000-8000-000030200200',
    name: 'Ubuntu Server 20.04 LTS (Focal Fossa)',
    distro: 'ubuntu',
    version: '20.04 LTS',
    icon: 'ubuntu',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Versi LTS mature untuk aplikasi legacy enterprise'
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
    description: 'Driver NVIDIA & Toolkit CUDA pre-installed untuk AI/ML'
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
    description: 'Next-gen kernel & fitur cloud computing mutakhir'
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
    description: 'Versi LTS teruji hemat resource memori'
  },
  {
    id: 'debian-10',
    uuid: '01000000-0000-4000-8000-000020050100',
    name: 'Debian GNU/Linux 10 (Buster)',
    distro: 'debian',
    version: '10 (Buster)',
    icon: 'debian',
    minDiskGb: 5,
    tier: 'maxiops',
    description: 'Dukungan extended LTS untuk workload warisan'
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

  // Alpine Linux (Ultra-lightweight container & microVM OS)
  {
    id: 'alpine-3-21',
    uuid: '01000000-0000-4000-8000-000070032100',
    name: 'Alpine Linux 3.21 (Cloud-Init)',
    distro: 'alpine',
    version: '3.21',
    icon: 'alpine',
    minDiskGb: 5,
    tier: 'maxiops',
    description: 'Ultra-ringan (<50MB RAM), berorientasi keamanan, ideal untuk Docker & microservices',
    isLatest: true
  },
  {
    id: 'alpine-3-20',
    uuid: '01000000-0000-4000-8000-000070032000',
    name: 'Alpine Linux 3.20',
    distro: 'alpine',
    version: '3.20',
    icon: 'alpine',
    minDiskGb: 5,
    tier: 'maxiops',
    description: 'Distribusi minimalis berbasis musl libc & busybox'
  },
  {
    id: 'alpine-3-19',
    uuid: '01000000-0000-4000-8000-000070031900',
    name: 'Alpine Linux 3.19',
    distro: 'alpine',
    version: '3.19',
    icon: 'alpine',
    minDiskGb: 5,
    tier: 'maxiops',
    description: 'Versi stabil teruji dengan paket APK cepat & ringan'
  },

  // Arch Linux (Bleeding Edge Rolling Release)
  {
    id: 'arch-rolling',
    uuid: '01000000-0000-4000-8000-000060010100',
    name: 'Arch Linux (Rolling Release)',
    distro: 'arch',
    version: 'Rolling (Latest)',
    icon: 'arch',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Bleeding-edge, pacman package manager, kernel Linux mutakhir',
    isLatest: true
  },
  {
    id: 'arch-lts',
    uuid: '01000000-0000-4000-8000-000060010200',
    name: 'Arch Linux (LTS Kernel)',
    distro: 'arch',
    version: 'LTS Kernel',
    icon: 'arch',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Arch Linux dengan kernel Long Term Support untuk stabilitas ekstra'
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
    id: 'centos-8',
    uuid: '01000000-0000-4000-8000-000050010500',
    name: 'CentOS Stream 8',
    distro: 'centos',
    version: 'Stream 8',
    icon: 'centos',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Platform CentOS Stream stabil untuk aplikasi lawas'
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
    id: 'fedora-41',
    uuid: '01000000-0000-4000-8000-000044203700',
    name: 'Fedora 41 Cloud',
    distro: 'fedora',
    version: '41 Cloud',
    icon: 'fedora',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Fitur Linux paling mutakhir, kernel modern & inovatif',
    isLatest: true
  },
  {
    id: 'fedora-40',
    uuid: '01000000-0000-4000-8000-000044202700',
    name: 'Fedora 40 Cloud',
    distro: 'fedora',
    version: '40 Cloud',
    icon: 'fedora',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Stabil & modern untuk cloud developer'
  },
  {
    id: 'fedora-42',
    uuid: '01000000-0000-4000-8000-000044204700',
    name: 'Fedora 42 Cloud',
    distro: 'fedora',
    version: '42 Cloud',
    icon: 'fedora',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Next-gen Fedora Cloud environment'
  },

  // openSUSE (Enterprise Linux with YaST & Btrfs)
  {
    id: 'opensuse-15-6',
    uuid: '01000000-0000-4000-8000-000090150600',
    name: 'openSUSE Leap 15.6',
    distro: 'opensuse',
    version: 'Leap 15.6',
    icon: 'opensuse',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Distribusi enterprise Jerman dengan YaST & snapshot Btrfs otomatis',
    isLatest: true
  },
  {
    id: 'opensuse-15-5',
    uuid: '01000000-0000-4000-8000-000090150500',
    name: 'openSUSE Leap 15.5',
    distro: 'opensuse',
    version: 'Leap 15.5',
    icon: 'opensuse',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Stabilitas tinggi berbasis source code SUSE Linux Enterprise (SLE)'
  },
  {
    id: 'opensuse-tumbleweed',
    uuid: '01000000-0000-4000-8000-000090200100',
    name: 'openSUSE Tumbleweed',
    distro: 'opensuse',
    version: 'Tumbleweed',
    icon: 'opensuse',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Versi rolling release dengan paket perangkat lunak paling mutakhir'
  },

  // FreeBSD (Advanced Unix System)
  {
    id: 'freebsd-14-1',
    uuid: '01000000-0000-4000-8000-000120140100',
    name: 'FreeBSD 14.1-RELEASE',
    distro: 'freebsd',
    version: '14.1-RELEASE',
    icon: 'freebsd',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Sistem operasi Unix canggih dengan ZFS native & Jails containerization',
    isLatest: true
  },
  {
    id: 'freebsd-13-3',
    uuid: '01000000-0000-4000-8000-000120130300',
    name: 'FreeBSD 13.3-RELEASE',
    distro: 'freebsd',
    version: '13.3-RELEASE',
    icon: 'freebsd',
    minDiskGb: 10,
    tier: 'maxiops',
    description: 'Rilisan stabil branch 13 dengan performa network stack legendaris'
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
  },
  {
    id: 'windows-2016',
    uuid: '01000000-0000-4000-8000-000010060300',
    name: 'Windows Server 2016 Standard',
    distro: 'windows',
    version: '2016 Standard',
    icon: 'windows',
    minDiskGb: 25,
    tier: 'maxiops',
    description: 'Dukungan stabil jangka panjang untuk sistem enterprise lawas'
  }
];

export const getEnvTokens = (): { key: string; value: string }[] => {
  const tokens: { key: string; value: string }[] = [];
  if (process.env.UPCLOUD_API_TOKEN?.trim()) {
    tokens.push({ key: 'UPCLOUD_API_TOKEN_PRIMARY', value: process.env.UPCLOUD_API_TOKEN.trim() });
  }
  for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith('UPCLOUD_API_TOKEN_') && v?.trim() && !tokens.some(t => t.key === k)) {
      tokens.push({ key: k, value: v.trim() });
    }
  }
  return tokens;
};

export const DEFAULT_SETTINGS: AppSettings = {
  upcloudApiToken: process.env.UPCLOUD_API_TOKEN || '',
  upcloudApiTokens: getEnvTokens(),
  upcloudUsername: process.env.UPCLOUD_USERNAME || '',
  upcloudPassword: process.env.UPCLOUD_PASSWORD || '',
  useTokenAuth: true,
  buatqrisAccountId: process.env.BUATQRIS_ACCOUNT_ID || '',
  buatqrisSecretToken: process.env.BUATQRIS_SECRET_TOKEN || '',
  buatqrisSigningSecret: process.env.BUATQRIS_SIGNING_SECRET || '',
  buatqrisMethod: (process.env.BUATQRIS_METHOD as any) || 'qris_two',
  buatqrisFeeBy: (process.env.BUATQRIS_FEE_BY as any) || 'user',
  isSandbox: process.env.IS_SANDBOX === 'true',
  storeName: 'NexVps Cloud',
  storeTagline: 'Ultra-Fast Cloud VPS with Instant QRIS Activation',
  supportEmail: 'support@nexvps.cloud',
  supportWhatsapp: '6281234567890',
  adminEmails: ['sanzzydev@gmail.com'],
  adminDailyTestLimit: 5
};

interface StoreSchema {
  settings: AppSettings;
  plans: VpsPlan[];
  zones: VpsZone[];
  templates: VpsTemplate[];
  orders: Order[];
  changelogs?: ChangelogItem[];
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

  private syncToEnv(settings: AppSettings) {
    try {
      const serverEnvPath = path.resolve(__dirname, '../../.env');
      const rootEnvPath = path.resolve(__dirname, '../../../.env');
      const targetPaths = [serverEnvPath];
      if (fs.existsSync(rootEnvPath)) targetPaths.push(rootEnvPath);

      for (const target of targetPaths) {
        let content = fs.existsSync(target) ? fs.readFileSync(target, 'utf-8') : '';

        const setOrUpdateVar = (key: string, value: string) => {
          const regex = new RegExp(`^${key}=.*$`, 'm');
          if (regex.test(content)) {
            content = content.replace(regex, `${key}=${value}`);
          } else {
            content += (content.endsWith('\n') ? '' : '\n') + `${key}=${value}\n`;
          }
          process.env[key] = value;
        };

        if (settings.upcloudApiToken && !settings.upcloudApiToken.includes('••••')) {
          setOrUpdateVar('UPCLOUD_API_TOKEN', settings.upcloudApiToken);
        }
        if (settings.upcloudUsername !== undefined) {
          setOrUpdateVar('UPCLOUD_USERNAME', settings.upcloudUsername);
        }
        if (settings.upcloudPassword !== undefined && !settings.upcloudPassword.includes('••••')) {
          setOrUpdateVar('UPCLOUD_PASSWORD', settings.upcloudPassword);
        }
        if (settings.buatqrisAccountId !== undefined) {
          setOrUpdateVar('BUATQRIS_ACCOUNT_ID', settings.buatqrisAccountId);
        }
        if (settings.buatqrisSecretToken !== undefined && !settings.buatqrisSecretToken.includes('••••')) {
          setOrUpdateVar('BUATQRIS_SECRET_TOKEN', settings.buatqrisSecretToken);
        }
        if (settings.buatqrisSigningSecret !== undefined && !settings.buatqrisSigningSecret.includes('••••')) {
          setOrUpdateVar('BUATQRIS_SIGNING_SECRET', settings.buatqrisSigningSecret);
        }
        if (settings.buatqrisMethod !== undefined) {
          setOrUpdateVar('BUATQRIS_METHOD', settings.buatqrisMethod);
        }
        if (settings.buatqrisFeeBy !== undefined) {
          setOrUpdateVar('BUATQRIS_FEE_BY', settings.buatqrisFeeBy);
        }
        if (settings.isSandbox !== undefined) {
          setOrUpdateVar('IS_SANDBOX', String(settings.isSandbox));
        }

        if (Array.isArray(settings.upcloudApiTokens)) {
          settings.upcloudApiTokens.forEach((t) => {
            if (t.key && t.value && !t.value.includes('••••')) {
              setOrUpdateVar(t.key, t.value);
            }
          });
        }

        fs.writeFileSync(target, content, 'utf-8');
      }
    } catch (err) {
      console.warn('Could not sync settings to .env file:', err);
    }
  }

  private load(): StoreSchema {
    if (fs.existsSync(STORE_FILE)) {
      try {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const loadedSettings: AppSettings = { ...DEFAULT_SETTINGS, ...parsed.settings };

        // Keep .env variables authoritative if set
        const envTokens = getEnvTokens();
        if (envTokens.length > 0) {
          loadedSettings.upcloudApiTokens = envTokens;
          loadedSettings.upcloudApiToken = envTokens[0].value;
        } else if (!loadedSettings.upcloudApiTokens || loadedSettings.upcloudApiTokens.length === 0) {
          if (loadedSettings.upcloudApiToken) {
            loadedSettings.upcloudApiTokens = [
              { key: 'UPCLOUD_API_TOKEN_PRIMARY', value: loadedSettings.upcloudApiToken }
            ];
          } else {
            loadedSettings.upcloudApiTokens = [];
          }
        }

        if (process.env.UPCLOUD_USERNAME?.trim()) {
          loadedSettings.upcloudUsername = process.env.UPCLOUD_USERNAME.trim();
        }
        if (process.env.UPCLOUD_PASSWORD?.trim()) {
          loadedSettings.upcloudPassword = process.env.UPCLOUD_PASSWORD.trim();
        }
        if (process.env.BUATQRIS_ACCOUNT_ID?.trim()) {
          loadedSettings.buatqrisAccountId = process.env.BUATQRIS_ACCOUNT_ID.trim();
        }
        if (process.env.BUATQRIS_SECRET_TOKEN?.trim()) {
          loadedSettings.buatqrisSecretToken = process.env.BUATQRIS_SECRET_TOKEN.trim();
        }
        if (process.env.BUATQRIS_SIGNING_SECRET?.trim()) {
          loadedSettings.buatqrisSigningSecret = process.env.BUATQRIS_SIGNING_SECRET.trim();
        }
        if (process.env.BUATQRIS_METHOD?.trim()) {
          loadedSettings.buatqrisMethod = process.env.BUATQRIS_METHOD.trim() as any;
        }
        if (process.env.BUATQRIS_FEE_BY?.trim()) {
          loadedSettings.buatqrisFeeBy = process.env.BUATQRIS_FEE_BY.trim() as any;
        }
        if (process.env.IS_SANDBOX !== undefined) {
          loadedSettings.isSandbox = process.env.IS_SANDBOX === 'true';
        }

        const loadedTemplates: VpsTemplate[] = parsed.templates || DEFAULT_TEMPLATES;
        let templatesUpdated = false;
        const mergedTemplates = [...loadedTemplates];
        for (const defT of DEFAULT_TEMPLATES) {
          if (!mergedTemplates.some(t => t.id === defT.id || t.uuid === defT.uuid)) {
            mergedTemplates.push(defT);
            templatesUpdated = true;
          }
        }

        const result: StoreSchema = {
          settings: loadedSettings,
          plans: parsed.plans || DEFAULT_PLANS,
          zones: parsed.zones || DEFAULT_ZONES,
          templates: mergedTemplates,
          orders: parsed.orders || [],
          changelogs: (Array.isArray(parsed.changelogs) && parsed.changelogs.length > 0)
            ? parsed.changelogs
            : [...INITIAL_CHANGELOG_UPDATES]
        };

        if (templatesUpdated || !parsed.changelogs) {
          this.save(result);
        }

        return result;
      } catch (e) {
        console.error('Error loading store, using defaults:', e);
      }
    }
    const initial: StoreSchema = {
      settings: DEFAULT_SETTINGS,
      plans: DEFAULT_PLANS,
      zones: DEFAULT_ZONES,
      templates: DEFAULT_TEMPLATES,
      orders: [],
      changelogs: [...INITIAL_CHANGELOG_UPDATES]
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
      nextSettings.upcloudApiTokens = [{ key: 'UPCLOUD_API_TOKEN_PRIMARY', value: partial.upcloudApiToken }];
    }
    this.data.settings = nextSettings;
    this.save();
    this.syncToEnv(nextSettings);
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

  getChangelogs(): ChangelogItem[] {
    if (!this.data.changelogs || this.data.changelogs.length === 0) {
      this.data.changelogs = [...INITIAL_CHANGELOG_UPDATES];
      this.save();
    }
    return this.data.changelogs;
  }

  addChangelog(item: ChangelogItem): ChangelogItem {
    if (!this.data.changelogs) this.data.changelogs = [];
    this.data.changelogs.push(item);
    this.save();
    return item;
  }

  updateChangelog(id: string, updates: Partial<ChangelogItem>): ChangelogItem | undefined {
    if (!this.data.changelogs) return undefined;
    const idx = this.data.changelogs.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.data.changelogs[idx] = {
      ...this.data.changelogs[idx],
      ...updates
    };
    this.save();
    return this.data.changelogs[idx];
  }

  deleteChangelog(id: string): boolean {
    if (!this.data.changelogs) return false;
    const idx = this.data.changelogs.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.changelogs.splice(idx, 1);
    this.save();
    return true;
  }

  resetChangelogs(): ChangelogItem[] {
    this.data.changelogs = [...INITIAL_CHANGELOG_UPDATES];
    this.save();
    return this.data.changelogs;
  }
}

export const store = new Store();
