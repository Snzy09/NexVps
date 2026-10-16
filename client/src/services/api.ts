import type { CatalogData, Order, AdminMetrics, AdminSettings, VpsPlan, ChangelogItem } from '../types';
import { INITIAL_CHANGELOG_UPDATES } from '../data/initialChangelog';

const API_BASE = '/api';

let activeAdminEmail: string | null = null;

const getHeaders = (customHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = { ...customHeaders };
  if (activeAdminEmail) {
    headers['x-admin-email'] = activeAdminEmail;
  }
  return headers;
};

export const FALLBACK_CATALOG: CatalogData = {
  plans: [
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
      bandwidthTb: 3,
      pricePerMonthIdr: 300000,
      pricePerMonthUsd: 20,
      upcloudPlan: '2xCPU-4GB',
      features: [
        '2 vCPU Cores',
        '4 GB MaxIOPS RAM',
        '80 GB MaxIOPS Ultra-Fast Storage',
        '3 TB Transfer Kuota / Bulan',
        '1 Gbps Public Port',
        'Enterprise SLA 99.99%',
        'Dedicated IP Address',
        'Free SSL & DDoS Protection'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Power',
      slug: 'enterprise-4c-8g',
      coreNumber: 4,
      memoryAmountMb: 8192,
      storageSizeGb: 160,
      bandwidthTb: 4,
      pricePerMonthIdr: 600000,
      pricePerMonthUsd: 40,
      upcloudPlan: '4xCPU-8GB',
      features: [
        '4 vCPU Cores (Dedicated Power)',
        '8 GB MaxIOPS RAM',
        '160 GB MaxIOPS Ultra-Fast Storage',
        '4 TB Transfer Kuota / Bulan',
        '1 Gbps Public Port',
        'High I/O Performance',
        '24/7 Priority Support',
        'Instant Cloud Deployment'
      ]
    }
  ],
  zones: [
    { id: 'sg-sin1', code: 'sg-sin1', name: 'Singapore #1', city: 'Singapore', country: 'Singapore', flag: 'sg', pingMs: 15, available: true },
    { id: 'de-fra1', code: 'de-fra1', name: 'Frankfurt #1', city: 'Frankfurt', country: 'Germany', flag: 'de', pingMs: 160, available: true },
    { id: 'fi-hel1', code: 'fi-hel1', name: 'Helsinki #1', city: 'Helsinki', country: 'Finland', flag: 'fi', pingMs: 180, available: true },
    { id: 'uk-lon1', code: 'uk-lon1', name: 'London #1', city: 'London', country: 'United Kingdom', flag: 'gb', pingMs: 175, available: true },
    { id: 'us-nyc1', code: 'us-nyc1', name: 'New York #1', city: 'New York', country: 'United States', flag: 'us', pingMs: 220, available: true },
    { id: 'us-chi1', code: 'us-chi1', name: 'Chicago #1', city: 'Chicago', country: 'United States', flag: 'us', pingMs: 235, available: true },
    { id: 'au-syd1', code: 'au-syd1', name: 'Sydney #1', city: 'Sydney', country: 'Australia', flag: 'au', pingMs: 95, available: true },
    { id: 'nl-ams1', code: 'nl-ams1', name: 'Amsterdam #1', city: 'Amsterdam', country: 'Netherlands', flag: 'nl', pingMs: 168, available: true }
  ],
  templates: [
    // Ubuntu
    { id: 'ubuntu-24-04', uuid: '01000000-0000-4000-8000-000030240200', name: 'Ubuntu Server 24.04 LTS (Noble Numbat)', distro: 'ubuntu', version: '24.04 LTS', icon: 'ubuntu', minDiskGb: 10, tier: 'maxiops', description: 'Versi LTS terbaru dengan dukungan jangka panjang 5 tahun', isLatest: true },
    { id: 'ubuntu-22-04', uuid: '01000000-0000-4000-8000-000030220200', name: 'Ubuntu Server 22.04 LTS (Jammy Jellyfish)', distro: 'ubuntu', version: '22.04 LTS', icon: 'ubuntu', minDiskGb: 10, tier: 'maxiops', description: 'Stabil & kompatibilitas aplikasi luas' },
    { id: 'ubuntu-20-04', uuid: '01000000-0000-4000-8000-000030200200', name: 'Ubuntu Server 20.04 LTS (Focal Fossa)', distro: 'ubuntu', version: '20.04 LTS', icon: 'ubuntu', minDiskGb: 10, tier: 'maxiops', description: 'Versi LTS mature untuk aplikasi legacy enterprise' },
    { id: 'ubuntu-24-04-cuda', uuid: '01000000-0000-4000-8000-000030700200', name: 'Ubuntu Server 24.04 LTS (NVIDIA & CUDA)', distro: 'ubuntu', version: '24.04 CUDA', icon: 'ubuntu', minDiskGb: 20, tier: 'maxiops', description: 'Driver NVIDIA & Toolkit CUDA pre-installed untuk AI/ML' },
    { id: 'ubuntu-26-04', uuid: '01000000-0000-4000-8000-000030260200', name: 'Ubuntu Server 26.04 LTS (Resolute Raccoon)', distro: 'ubuntu', version: '26.04 LTS', icon: 'ubuntu', minDiskGb: 10, tier: 'maxiops', description: 'Next-gen kernel & fitur cloud computing mutakhir' },

    // Debian
    { id: 'debian-12', uuid: '01000000-0000-4000-8000-000020070100', name: 'Debian GNU/Linux 12 (Bookworm)', distro: 'debian', version: '12 (Bookworm)', icon: 'debian', minDiskGb: 10, tier: 'maxiops', description: 'Ultra-stabil, ringan, cocok untuk server produksi', isLatest: true },
    { id: 'debian-11', uuid: '01000000-0000-4000-8000-000020060100', name: 'Debian GNU/Linux 11 (Bullseye)', distro: 'debian', version: '11 (Bullseye)', icon: 'debian', minDiskGb: 5, tier: 'maxiops', description: 'Versi LTS teruji hemat resource memori' },
    { id: 'debian-10', uuid: '01000000-0000-4000-8000-000020050100', name: 'Debian GNU/Linux 10 (Buster)', distro: 'debian', version: '10 (Buster)', icon: 'debian', minDiskGb: 5, tier: 'maxiops', description: 'Dukungan extended LTS untuk workload warisan' },
    { id: 'debian-13', uuid: '01000000-0000-4000-8000-000020080100', name: 'Debian GNU/Linux 13 (Trixie)', distro: 'debian', version: '13 (Trixie)', icon: 'debian', minDiskGb: 10, tier: 'maxiops', description: 'Debian generasi berikutnya (Testing channel)' },

    // Alpine Linux
    { id: 'alpine-3-21', uuid: '01000000-0000-4000-8000-000070032100', name: 'Alpine Linux 3.21 (Cloud-Init)', distro: 'alpine', version: '3.21', icon: 'alpine', minDiskGb: 5, tier: 'maxiops', description: 'Ultra-ringan (<50MB RAM), berorientasi keamanan, ideal untuk Docker & microservices', isLatest: true },
    { id: 'alpine-3-20', uuid: '01000000-0000-4000-8000-000070032000', name: 'Alpine Linux 3.20', distro: 'alpine', version: '3.20', icon: 'alpine', minDiskGb: 5, tier: 'maxiops', description: 'Distribusi minimalis berbasis musl libc & busybox' },
    { id: 'alpine-3-19', uuid: '01000000-0000-4000-8000-000070031900', name: 'Alpine Linux 3.19', distro: 'alpine', version: '3.19', icon: 'alpine', minDiskGb: 5, tier: 'maxiops', description: 'Versi stabil teruji dengan paket APK cepat & ringan' },

    // Arch Linux
    { id: 'arch-rolling', uuid: '01000000-0000-4000-8000-000060010100', name: 'Arch Linux (Rolling Release)', distro: 'arch', version: 'Rolling (Latest)', icon: 'arch', minDiskGb: 10, tier: 'maxiops', description: 'Bleeding-edge, pacman package manager, kernel Linux mutakhir', isLatest: true },
    { id: 'arch-lts', uuid: '01000000-0000-4000-8000-000060010200', name: 'Arch Linux (LTS Kernel)', distro: 'arch', version: 'LTS Kernel', icon: 'arch', minDiskGb: 10, tier: 'maxiops', description: 'Arch Linux dengan kernel Long Term Support untuk stabilitas ekstra' },

    // AlmaLinux
    { id: 'almalinux-9', uuid: '01000000-0000-4000-8000-000140020100', name: 'AlmaLinux 9', distro: 'almalinux', version: '9', icon: 'almalinux', minDiskGb: 10, tier: 'maxiops', description: '100% 1:1 Binary Compatible Red Hat Enterprise Linux 9', isLatest: true },
    { id: 'almalinux-8', uuid: '01000000-0000-4000-8000-000140010100', name: 'AlmaLinux 8', distro: 'almalinux', version: '8', icon: 'almalinux', minDiskGb: 5, tier: 'maxiops', description: 'Kompatibel RHEL 8 untuk aplikasi enterprise' },
    { id: 'almalinux-10', uuid: '01000000-0000-4000-8000-000141000200', name: 'AlmaLinux 10', distro: 'almalinux', version: '10', icon: 'almalinux', minDiskGb: 10, tier: 'maxiops', description: 'Generasi terbaru platform enterprise AlmaLinux' },

    // Rocky Linux
    { id: 'rocky-9', uuid: '01000000-0000-4000-8000-000150020100', name: 'Rocky Linux 9', distro: 'rocky', version: '9', icon: 'rocky', minDiskGb: 10, tier: 'maxiops', description: 'Enterprise OS alternatif CentOS oleh pendiri CentOS asli', isLatest: true },
    { id: 'rocky-8', uuid: '01000000-0000-4000-8000-000150010100', name: 'Rocky Linux 8', distro: 'rocky', version: '8', icon: 'rocky', minDiskGb: 5, tier: 'maxiops', description: 'Kompatibilitas RHEL 8 yang tangguh' },
    { id: 'rocky-10', uuid: '01000000-0000-4000-8000-000151000200', name: 'Rocky Linux 10', distro: 'rocky', version: '10', icon: 'rocky', minDiskGb: 10, tier: 'maxiops', description: 'Generasi baru Rocky Linux' },

    // CentOS Stream
    { id: 'centos-9', uuid: '01000000-0000-4000-8000-000050010600', name: 'CentOS Stream 9', distro: 'centos', version: 'Stream 9', icon: 'centos', minDiskGb: 10, tier: 'maxiops', description: 'Upstream resmi Red Hat Enterprise Linux', isLatest: true },
    { id: 'centos-8', uuid: '01000000-0000-4000-8000-000050010500', name: 'CentOS Stream 8', distro: 'centos', version: 'Stream 8', icon: 'centos', minDiskGb: 10, tier: 'maxiops', description: 'Platform CentOS Stream stabil untuk aplikasi lawas' },
    { id: 'centos-10', uuid: '01000000-0000-4000-8000-000050010700', name: 'CentOS Stream 10', distro: 'centos', version: 'Stream 10', icon: 'centos', minDiskGb: 10, tier: 'maxiops', description: 'Platform pengembangan Red Hat Enterprise Linux generasi baru' },

    // Fedora
    { id: 'fedora-41', uuid: '01000000-0000-4000-8000-000044203700', name: 'Fedora 41 Cloud', distro: 'fedora', version: '41 Cloud', icon: 'fedora', minDiskGb: 10, tier: 'maxiops', description: 'Fitur Linux paling mutakhir, kernel modern & inovatif', isLatest: true },
    { id: 'fedora-40', uuid: '01000000-0000-4000-8000-000044202700', name: 'Fedora 40 Cloud', distro: 'fedora', version: '40 Cloud', icon: 'fedora', minDiskGb: 10, tier: 'maxiops', description: 'Stabil & modern untuk cloud developer' },
    { id: 'fedora-42', uuid: '01000000-0000-4000-8000-000044204700', name: 'Fedora 42 Cloud', distro: 'fedora', version: '42 Cloud', icon: 'fedora', minDiskGb: 10, tier: 'maxiops', description: 'Next-gen Fedora Cloud environment' },

    // openSUSE
    { id: 'opensuse-15-6', uuid: '01000000-0000-4000-8000-000090150600', name: 'openSUSE Leap 15.6', distro: 'opensuse', version: 'Leap 15.6', icon: 'opensuse', minDiskGb: 10, tier: 'maxiops', description: 'Distribusi enterprise Jerman dengan YaST & snapshot Btrfs otomatis', isLatest: true },
    { id: 'opensuse-15-5', uuid: '01000000-0000-4000-8000-000090150500', name: 'openSUSE Leap 15.5', distro: 'opensuse', version: 'Leap 15.5', icon: 'opensuse', minDiskGb: 10, tier: 'maxiops', description: 'Stabilitas tinggi berbasis source code SUSE Linux Enterprise (SLE)' },
    { id: 'opensuse-tumbleweed', uuid: '01000000-0000-4000-8000-000090200100', name: 'openSUSE Tumbleweed', distro: 'opensuse', version: 'Tumbleweed', icon: 'opensuse', minDiskGb: 10, tier: 'maxiops', description: 'Versi rolling release dengan paket perangkat lunak paling mutakhir' },

    // FreeBSD
    { id: 'freebsd-14-1', uuid: '01000000-0000-4000-8000-000120140100', name: 'FreeBSD 14.1-RELEASE', distro: 'freebsd', version: '14.1-RELEASE', icon: 'freebsd', minDiskGb: 10, tier: 'maxiops', description: 'Sistem operasi Unix canggih dengan ZFS native & Jails containerization', isLatest: true },
    { id: 'freebsd-13-3', uuid: '01000000-0000-4000-8000-000120130300', name: 'FreeBSD 13.3-RELEASE', distro: 'freebsd', version: '13.3-RELEASE', icon: 'freebsd', minDiskGb: 10, tier: 'maxiops', description: 'Rilisan stabil branch 13 dengan performa network stack legendaris' },

    // Windows Server
    { id: 'windows-2025', uuid: '01000000-0000-4000-8000-000010090300', name: 'Windows Server 2025 Standard', distro: 'windows', version: '2025 Standard', icon: 'windows', minDiskGb: 25, tier: 'maxiops', description: 'Edisi Windows Server terbaru dengan keamanan AI & SMB over QUIC', isLatest: true },
    { id: 'windows-2022', uuid: '01000000-0000-4000-8000-000010080300', name: 'Windows Server 2022 Standard', distro: 'windows', version: '2022 Standard', icon: 'windows', minDiskGb: 20, tier: 'maxiops', description: 'Pilihan terpopuler dengan RDP & ekosistem .NET' },
    { id: 'windows-2019', uuid: '01000000-0000-4000-8000-000010070300', name: 'Windows Server 2019 Standard', distro: 'windows', version: '2019 Standard', icon: 'windows', minDiskGb: 25, tier: 'maxiops', description: 'Kompatibilitas legacy aplikasi Windows Server' },
    { id: 'windows-2016', uuid: '01000000-0000-4000-8000-000010060300', name: 'Windows Server 2016 Standard', distro: 'windows', version: '2016 Standard', icon: 'windows', minDiskGb: 25, tier: 'maxiops', description: 'Dukungan stabil jangka panjang untuk sistem enterprise lawas' }
  ],
  store: {
    name: 'NexVps Cloud',
    tagline: 'High-Performance Cloud VPS with UpCloud MaxIOPS & QRIS Auto Activation',
    supportEmail: 'support@nexvps.cloud',
    supportWhatsapp: '6281234567890',
    isSandbox: false
  }
};

const INITIAL_SERVERS: Order[] = [
  {
    id: 'server-demo-1',
    orderNumber: 'NEX-882194',
    customerName: 'Admin Sanzzy',
    customerEmail: 'sanzzydev@gmail.com',
    customerPhone: '081234567890',
    planId: 'developer',
    zoneCode: 'sg-sin1',
    templateUuid: '01000000-0000-4000-8000-000030240200',
    templateName: 'Ubuntu Server 24.04 LTS (Noble Numbat)',
    hostname: 'server.nexvps.cloud',
    rootPassword: '••••••••••••••••',
    billingCycle: 'monthly',
    baseAmountIdr: 150000,
    totalAmountIdr: 150000,
    paymentStatus: 'PAID',
    vpsStatus: 'ACTIVE',
    serverUuid: '00612376-8ac8-4f74-b28d-ece7eb1542c9',
    serverIp: '94.237.70.40',
    serverState: 'started',
    coreNumber: 2,
    memoryAmountMb: 2048,
    storageSizeGb: 50,
    bandwidthTb: 2,
    planName: 'Pro Developer',
    zoneName: 'Singapore #1',
    zoneFlag: 'sg',
    zoneCity: 'Singapore',
    zoneCountry: 'Singapore',
    templateIcon: 'ubuntu',
    templateDistro: 'ubuntu',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'server-demo-2',
    orderNumber: 'NEX-901428',
    customerName: 'Admin Sanzzy',
    customerEmail: 'sanzzydev@gmail.com',
    customerPhone: '081234567890',
    planId: 'business',
    zoneCode: 'sg-sin1',
    templateUuid: '01000000-0000-4000-8000-000020120100',
    templateName: 'Debian GNU/Linux 12 (Bookworm)',
    hostname: 'db-cluster.nexvps.cloud',
    rootPassword: '••••••••••••••••',
    billingCycle: 'monthly',
    baseAmountIdr: 300000,
    totalAmountIdr: 300000,
    paymentStatus: 'PAID',
    vpsStatus: 'ACTIVE',
    serverUuid: '00d373ac-d3e8-48e0-b610-e1e17d41d95c',
    serverIp: '94.237.77.71',
    serverState: 'stopped',
    coreNumber: 2,
    memoryAmountMb: 4096,
    storageSizeGb: 80,
    bandwidthTb: 3,
    planName: 'Business Cloud',
    zoneName: 'Singapore #1',
    zoneFlag: 'sg',
    zoneCity: 'Singapore',
    zoneCountry: 'Singapore',
    templateIcon: 'debian',
    templateDistro: 'debian',
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const STORAGE_PLANS_KEY = 'nexvps_custom_plans';

export const getStoredPlans = (): VpsPlan[] => {
  try {
    const saved = localStorage.getItem(STORAGE_PLANS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored plans:', e);
  }
  try {
    localStorage.setItem(STORAGE_PLANS_KEY, JSON.stringify(FALLBACK_CATALOG.plans));
  } catch {}
  return FALLBACK_CATALOG.plans;
};

export const saveStoredPlans = (plans: VpsPlan[]): void => {
  try {
    localStorage.setItem(STORAGE_PLANS_KEY, JSON.stringify(plans));
  } catch (e) {
    console.warn('Failed to save plans to localStorage:', e);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexvps_plans_updated', { detail: plans }));
  }
};

export const api = {
  setAdminEmail(email: string | null) {
    activeAdminEmail = email;
  },

  async checkAdmin(email: string): Promise<{ isAdmin: boolean; adminEmails: string[] }> {
    try {
      const res = await fetch(`${API_BASE}/auth/admin-check?email=${encodeURIComponent(email)}`, {
        headers: getHeaders()
      });
      const json = await res.json();
      return json.data || { isAdmin: false, adminEmails: [] };
    } catch {
      return { isAdmin: email.toLowerCase() === 'sanzzydev@gmail.com', adminEmails: ['sanzzydev@gmail.com'] };
    }
  },

  async getCatalog(): Promise<CatalogData> {
    try {
      const res = await fetch(`${API_BASE}/catalog`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      if (json.data?.plans && Array.isArray(json.data.plans) && json.data.plans.length > 0) {
        try {
          localStorage.setItem(STORAGE_PLANS_KEY, JSON.stringify(json.data.plans));
        } catch {}
      }
      return json.data;
    } catch (err) {
      console.warn('Backend server unavailable, loading catalog fallback with stored plans:', err);
      const storedPlans = getStoredPlans();
      return {
        ...FALLBACK_CATALOG,
        plans: storedPlans
      };
    }
  },

  async createOrder(payload: any): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    } catch {
      // Local fallback simulation for static hosting demo
      const simulatedOrder: Order = {
        id: `demo-${Date.now()}`,
        orderNumber: `NEX-${Math.floor(100000 + Math.random() * 900000)}`,
        userId: payload.userId,
        customerName: payload.customerName || 'Pelanggan NexVps',
        customerEmail: payload.customerEmail || 'user@example.com',
        customerPhone: payload.customerPhone || '081234567890',
        planId: payload.planId || 'developer',
        zoneCode: payload.zoneCode || 'sg-sin1',
        templateUuid: payload.templateUuid,
        templateName: payload.templateName || 'Ubuntu Server 24.04 LTS',
        hostname: payload.hostname || 'server.nexvps.cloud',
        rootPassword: payload.rootPassword || 'P@ssword123!',
        sshKey: payload.sshKey,
        billingCycle: payload.billingCycle || 'monthly',
        baseAmountIdr: payload.planId === 'starter' ? 75000 : payload.planId === 'business' ? 300000 : payload.planId === 'enterprise' ? 600000 : 150000,
        totalAmountIdr: payload.planId === 'starter' ? 75000 : payload.planId === 'business' ? 300000 : payload.planId === 'enterprise' ? 600000 : 150000,
        adminFee: 0,
        paymentStatus: 'PENDING',
        vpsStatus: 'PENDING_PAYMENT',
        qrisImage: 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=00020101021226670016ID.CO.BUATQRIS01189360091800000000000214NEXVPSCLOUD5204581253033605802ID5912NEXVPS+CLOUD6007JAKARTA62070703A016304ABCD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      try {
        const orders: Order[] = JSON.parse(localStorage.getItem('nexvps_demo_orders') || '[]');
        orders.unshift(simulatedOrder);
        localStorage.setItem('nexvps_demo_orders', JSON.stringify(orders));
      } catch {}
      return simulatedOrder;
    }
  },

  async getOrder(id: string): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    } catch {
      try {
        const orders: Order[] = JSON.parse(localStorage.getItem('nexvps_demo_orders') || '[]');
        const found = orders.find(o => o.id === id);
        if (found) return found;
      } catch {}
      return {
        id,
        orderNumber: 'NEX-882194',
        customerName: 'Admin Sanzzy',
        customerEmail: 'sanzzydev@gmail.com',
        customerPhone: '081234567890',
        planId: 'developer',
        zoneCode: 'sg-sin1',
        templateUuid: '01000000-0000-4000-8000-000030240200',
        templateName: 'Ubuntu Server 24.04 LTS',
        hostname: 'server.nexvps.cloud',
        rootPassword: '••••••••••••••••',
        billingCycle: 'monthly',
        baseAmountIdr: 150000,
        totalAmountIdr: 150000,
        paymentStatus: 'PAID',
        vpsStatus: 'ACTIVE',
        serverUuid: '00612376-8ac8-4f74-b28d-ece7eb1542c9',
        serverIp: '94.237.70.40',
        serverState: 'started',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  },

  async checkPayment(id: string): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/check-payment`, {
        method: 'POST',
        headers: getHeaders()
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    } catch {
      try {
        const orders: Order[] = JSON.parse(localStorage.getItem('nexvps_demo_orders') || '[]');
        const found = orders.find(o => o.id === id);
        if (found) {
          found.paymentStatus = 'PAID';
          if (found.vpsStatus === 'PENDING_PAYMENT') {
            found.vpsStatus = 'PROVISIONING';
          }

          // Advance to ACTIVE with real IP
          const elapsed = Date.now() - new Date(found.createdAt).getTime();
          if (elapsed >= 3000 && found.vpsStatus !== 'ACTIVE') {
            found.vpsStatus = 'ACTIVE';
            found.serverState = 'started';
            found.serverIp = `94.237.70.${Math.floor(Math.random() * 180) + 20}`;
            found.serverUuid = `00${Math.floor(100000 + Math.random() * 900000)}-8ac8-4f74-b28d-ece7eb1542c9`;

            // Insert into user servers
            const servers: Order[] = JSON.parse(localStorage.getItem('nexvps_demo_servers') || JSON.stringify(INITIAL_SERVERS));
            const existingIdx = servers.findIndex(s => s.id === found.id);
            if (existingIdx >= 0) {
              servers[existingIdx] = found;
            } else {
              servers.unshift(found);
            }
            localStorage.setItem('nexvps_demo_servers', JSON.stringify(servers));
          }

          localStorage.setItem('nexvps_demo_orders', JSON.stringify(orders));
          return found;
        }
      } catch {}
      return {
        id,
        orderNumber: 'NEX-882194',
        customerName: 'Admin Sanzzy',
        customerEmail: 'sanzzydev@gmail.com',
        customerPhone: '081234567890',
        planId: 'developer',
        zoneCode: 'sg-sin1',
        templateUuid: '01000000-0000-4000-8000-000030240200',
        templateName: 'Ubuntu Server 24.04 LTS',
        hostname: 'server.nexvps.cloud',
        rootPassword: '••••••••••••••••',
        billingCycle: 'monthly',
        baseAmountIdr: 150000,
        totalAmountIdr: 150000,
        paymentStatus: 'PAID',
        vpsStatus: 'ACTIVE',
        serverUuid: '00612376-8ac8-4f74-b28d-ece7eb1542c9',
        serverIp: '94.237.70.40',
        serverState: 'started',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  },

  async retryProvision(id: string): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/retry-provision`, {
        method: 'POST',
        headers: getHeaders()
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    } catch {
      return this.getOrder(id);
    }
  },

  async getServers(email?: string, userId?: string, sync?: boolean): Promise<Order[]> {
    try {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (userId) params.append('userId', userId);
      if (sync) params.append('sync', '1');
      const queryString = params.toString();
      const url = queryString ? `${API_BASE}/servers?${queryString}` : `${API_BASE}/servers`;
      
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    } catch {
      let servers: Order[] = INITIAL_SERVERS;
      const saved = localStorage.getItem('nexvps_demo_servers');
      if (saved) {
        try { servers = JSON.parse(saved); } catch {}
      } else {
        try { localStorage.setItem('nexvps_demo_servers', JSON.stringify(INITIAL_SERVERS)); } catch {}
      }

      const isAdmin = activeAdminEmail?.toLowerCase() === 'sanzzydev@gmail.com';
      if (!isAdmin) {
        if (email || userId) {
          return servers.filter(s => 
            (email && s.customerEmail?.toLowerCase() === email.toLowerCase()) ||
            (userId && s.userId === userId)
          );
        }
        return [];
      }
      return servers;
    }
  },

  async executeServerAction(
    uuid: string, 
    action: 'start' | 'stop' | 'force_stop' | 'restart' | 'sync' | 'delete'
  ): Promise<{ message: string; data?: any; liveState?: string }> {
    try {
      const res = await fetch(`${API_BASE}/servers/${uuid}/action`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ action })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return {
        message: json.message,
        data: json.data,
        liveState: json.liveState
      };
    } catch {
      // Offline fallback state updater
      const savedServers: Order[] = JSON.parse(localStorage.getItem('nexvps_demo_servers') || JSON.stringify(INITIAL_SERVERS));
      const target = savedServers.find(s => s.serverUuid === uuid);
      let nextState: 'started' | 'stopped' = 'started';
      if (action === 'stop' || action === 'force_stop') nextState = 'stopped';
      if (action === 'start') nextState = 'started';
      if (action === 'restart') nextState = 'started';
      if (action === 'delete') {
        const remaining = savedServers.filter(s => s.serverUuid !== uuid);
        localStorage.setItem('nexvps_demo_servers', JSON.stringify(remaining));
        return { message: 'Server berhasil dihapus dari cloud (Demo Mode)', liveState: undefined };
      }
      if (target) {
        target.serverState = nextState;
        localStorage.setItem('nexvps_demo_servers', JSON.stringify(savedServers));
      }
      const label = action === 'start' ? 'dinyalakan' : action === 'restart' ? 'direstart' : 'dimatikan';
      return { message: `Server berhasil ${label} (Demo Mode).`, liveState: nextState };
    }
  },

  async getAdminMetrics(): Promise<AdminMetrics> {
    try {
      const res = await fetch(`${API_BASE}/admin/metrics`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    } catch {
      const servers: Order[] = JSON.parse(localStorage.getItem('nexvps_demo_servers') || JSON.stringify(INITIAL_SERVERS));
      const totalRevenue = servers.filter(s => s.paymentStatus === 'PAID').reduce((sum, s) => sum + (s.totalAmountIdr || 0), 0);
      return {
        totalOrders: servers.length,
        paidOrdersCount: servers.filter(s => s.paymentStatus === 'PAID').length,
        activeServersCount: servers.filter(s => s.vpsStatus === 'ACTIVE').length,
        pendingOrdersCount: servers.filter(s => s.paymentStatus === 'PENDING').length,
        totalRevenueIdr: totalRevenue
      };
    }
  },

  async getAdminOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/orders`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    } catch {
      const servers: Order[] = JSON.parse(localStorage.getItem('nexvps_demo_servers') || JSON.stringify(INITIAL_SERVERS));
      return servers;
    }
  },

  async getAdminSettings(): Promise<AdminSettings> {
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    } catch {
      const saved = localStorage.getItem('nexvps_demo_settings');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
      return {
        upcloudApiToken: 'uc_tok_demo_sample_token_889123',
        upcloudApiTokens: [{ key: 'UPCLOUD_API_TOKEN_PRIMARY', value: 'uc_tok_demo_sample_token_889123' }],
        upcloudUsername: 'sanzzydev',
        upcloudPassword: '••••••••••••',
        useTokenAuth: true,
        hasUpCloudToken: true,
        hasUpCloudBasic: false,
        buatqrisAccountId: 'bq_acc_9921',
        buatqrisSecretToken: 'bq_sec_••••••••••••',
        buatqrisSigningSecret: 'bq_sgn_••••••••••••',
        hasBuatQrisCreds: true,
        buatqrisMethod: 'qris_one',
        buatqrisFeeBy: 'user',
        isSandbox: false,
        storeName: 'NexVps Cloud',
        storeTagline: 'High-Performance Cloud VPS with UpCloud MaxIOPS & QRIS Auto Activation',
        supportEmail: 'support@nexvps.cloud',
        supportWhatsapp: '6281234567890',
        adminEmails: ['sanzzydev@gmail.com']
      };
    }
  },

  async updateAdminSettings(settings: Partial<AdminSettings>): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return;
      }
    } catch {
      // Offline fallback
    }
    const current = await this.getAdminSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('nexvps_demo_settings', JSON.stringify(updated));
  },

  async getAdminPlans(): Promise<VpsPlan[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/plans`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        try {
          localStorage.setItem(STORAGE_PLANS_KEY, JSON.stringify(json.data));
        } catch {}
      }
      return json.data;
    } catch (err) {
      console.warn('getAdminPlans backend unavailable, fallback to local storage:', err);
      return getStoredPlans();
    }
  },

  async updateAdminPlan(id: string, updates: Partial<VpsPlan>): Promise<VpsPlan> {
    let updatedPlanFromServer: VpsPlan | null = null;
    try {
      const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
        method: 'PUT',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          updatedPlanFromServer = json.data;
        }
      }
    } catch (err) {
      console.warn('Backend updateAdminPlan unavailable, updating locally:', err);
    }

    const currentPlans = getStoredPlans();
    const idx = currentPlans.findIndex(p => p.id === id);
    if (idx !== -1) {
      const merged: VpsPlan = {
        ...currentPlans[idx],
        ...updates,
        ...(updatedPlanFromServer || {})
      };
      if (updates.pricePerMonthIdr !== undefined && updates.pricePerMonthUsd === undefined) {
        merged.pricePerMonthUsd = Math.max(1, Math.round(Number(updates.pricePerMonthIdr) / 15000));
      }
      currentPlans[idx] = merged;
      saveStoredPlans(currentPlans);
      return merged;
    }

    if (updatedPlanFromServer) {
      currentPlans.push(updatedPlanFromServer);
      saveStoredPlans(currentPlans);
      return updatedPlanFromServer;
    }

    throw new Error('Paket tidak ditemukan untuk diperbarui');
  },

  async createAdminPlan(plan: Partial<VpsPlan>): Promise<VpsPlan> {
    let createdPlan: VpsPlan | null = null;
    try {
      const res = await fetch(`${API_BASE}/admin/plans`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(plan)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          createdPlan = json.data;
        }
      }
    } catch (err) {
      console.warn('Backend createAdminPlan unavailable, creating locally:', err);
    }

    if (!createdPlan) {
      const rawName = plan.name || 'custom';
      const slugId = rawName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Math.floor(100 + Math.random() * 900);
      const idr = Number(plan.pricePerMonthIdr) || 100000;
      createdPlan = {
        id: slugId,
        name: plan.name || 'Paket Cloud Kustom',
        slug: slugId,
        coreNumber: Number(plan.coreNumber) || 1,
        memoryAmountMb: Number(plan.memoryAmountMb) || 1024,
        storageSizeGb: Number(plan.storageSizeGb) || 25,
        bandwidthTb: Number(plan.bandwidthTb) || 1,
        pricePerMonthIdr: idr,
        pricePerMonthUsd: plan.pricePerMonthUsd || Math.max(1, Math.round(idr / 15000)),
        popular: Boolean(plan.popular),
        upcloudPlan: plan.upcloudPlan || '1xCPU-1GB',
        features: plan.features || [
          `${plan.coreNumber || 1} vCPU Cores`,
          `${Math.round((Number(plan.memoryAmountMb) || 1024) / 1024)} GB MaxIOPS RAM`,
          `${plan.storageSizeGb || 25} GB MaxIOPS Ultra-Fast Storage`,
          `${plan.bandwidthTb || 1} TB Transfer Kuota / Bulan`,
          '1 Gbps Public Port',
          'DDoS Protection Included'
        ]
      };
    }

    const currentPlans = getStoredPlans();
    const exists = currentPlans.some(p => p.id === createdPlan!.id);
    const updatedList = exists
      ? currentPlans.map(p => p.id === createdPlan!.id ? createdPlan! : p)
      : [...currentPlans, createdPlan];

    saveStoredPlans(updatedList);
    return createdPlan;
  },

  async deleteAdminPlan(id: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) {
        console.warn('deleteAdminPlan backend status:', res.status);
      }
    } catch (err) {
      console.warn('Backend deleteAdminPlan unavailable, deleting locally:', err);
    }

    const currentPlans = getStoredPlans();
    const updatedList = currentPlans.filter(p => p.id !== id);
    saveStoredPlans(updatedList);
  },

  async testUpCloud(tokens?: { key: string; value: string }[]): Promise<{ success: boolean; message: string; data?: any; totalTokens?: number; activeToken?: string; results?: import('../types').UpCloudTokenTestResult[] }> {
    try {
      const res = await fetch(`${API_BASE}/admin/test-upcloud`, { 
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ tokens })
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return {
          success: false,
          totalTokens: tokens?.length || 0,
          message: `Server backend port 5000 mengembalikan respons non-JSON (HTTP ${res.status}). Pastikan backend server ('npm run server:dev') berjalan normal di port 5000.`
        };
      }
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        totalTokens: tokens?.length || 0,
        message: `Koneksi gagal: ${err.message}. Pastikan backend server 'npm run server:dev' aktif di http://localhost:5000.`
      };
    }
  },

  async testBuatQris(credentials?: { accountId?: string; secretToken?: string }): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const res = await fetch(`${API_BASE}/admin/test-buatqris`, { 
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(credentials || {})
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return {
          success: false,
          message: `Server backend port 5000 mengembalikan respons non-JSON (HTTP ${res.status}). Pastikan backend server ('npm run server:dev') berjalan normal di port 5000.`
        };
      }
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: `Koneksi gagal: ${err.message}. Pastikan backend server 'npm run server:dev' aktif di http://localhost:5000.`
      };
    }
  },

  async getChangelogs(): Promise<ChangelogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/changelog`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          localStorage.setItem('nexvps_custom_changelog_updates', JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend getChangelogs unavailable, reading from local storage:', err);
    }
    return this.getLocalChangelogs();
  },

  async createChangelogItem(item: Omit<ChangelogItem, 'id'> & { id?: string }): Promise<ChangelogItem> {
    const newItem: ChangelogItem = {
      id: item.id || `upd-${Date.now()}`,
      title: item.title,
      type: item.type,
      date: item.date,
      description: item.description
    };
    try {
      const res = await fetch(`${API_BASE}/admin/changelog`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const list = this.getLocalChangelogs();
          list.push(json.data);
          localStorage.setItem('nexvps_custom_changelog_updates', JSON.stringify(list));
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend createChangelogItem unavailable, saving locally:', err);
    }
    const list = this.getLocalChangelogs();
    list.push(newItem);
    localStorage.setItem('nexvps_custom_changelog_updates', JSON.stringify(list));
    return newItem;
  },

  async updateChangelogItem(id: string, updates: Partial<ChangelogItem>): Promise<ChangelogItem> {
    try {
      const res = await fetch(`${API_BASE}/admin/changelog/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const list = this.getLocalChangelogs();
          const idx = list.findIndex(c => c.id === id);
          if (idx !== -1) {
            list[idx] = json.data;
            localStorage.setItem('nexvps_custom_changelog_updates', JSON.stringify(list));
          }
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend updateChangelogItem unavailable, updating locally:', err);
    }
    const list = this.getLocalChangelogs();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem('nexvps_custom_changelog_updates', JSON.stringify(list));
      return list[idx];
    }
    throw new Error('Catatan rilis tidak ditemukan.');
  },

  async deleteChangelogItem(id: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/admin/changelog/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    } catch (err) {
      console.warn('Backend deleteChangelogItem unavailable, deleting locally:', err);
    }
    const list = this.getLocalChangelogs().filter(c => c.id !== id);
    localStorage.setItem('nexvps_custom_changelog_updates', JSON.stringify(list));
    return true;
  },

  async resetChangelogs(): Promise<ChangelogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/changelog/reset`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          localStorage.setItem('nexvps_custom_changelog_updates', JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend resetChangelogs unavailable, resetting locally:', err);
    }
    localStorage.removeItem('nexvps_custom_changelog_updates');
    return [...INITIAL_CHANGELOG_UPDATES];
  },

  getLocalChangelogs(): ChangelogItem[] {
    try {
      const saved = localStorage.getItem('nexvps_custom_changelog_updates');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [...INITIAL_CHANGELOG_UPDATES];
  }
};

