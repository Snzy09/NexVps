import type { CatalogData, Order, AdminMetrics, AdminSettings, VpsPlan } from '../types';

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
    { id: 'ubuntu-24', uuid: '01000000-0000-4000-8000-000030240200', name: 'Ubuntu Server 24.04 LTS (Noble Numbat)', distro: 'ubuntu', version: '24.04 LTS', icon: 'ubuntu', minDiskGb: 10, tier: 'maxiops', description: 'Versi LTS terbaru dengan dukungan jangka panjang', isLatest: true },
    { id: 'ubuntu-22', uuid: '01000000-0000-4000-8000-000030220200', name: 'Ubuntu Server 22.04 LTS (Jammy Jellyfish)', distro: 'ubuntu', version: '22.04 LTS', icon: 'ubuntu', minDiskGb: 10, tier: 'maxiops', description: 'Stabil & kompatibilitas aplikasi luas' },
    { id: 'debian-12', uuid: '01000000-0000-4000-8000-000020120100', name: 'Debian GNU/Linux 12 (Bookworm)', distro: 'debian', version: '12 (Bookworm)', icon: 'debian', minDiskGb: 10, tier: 'maxiops', description: 'Ultra-stabil, ringan, cocok untuk server produksi', isLatest: true },
    { id: 'debian-11', uuid: '01000000-0000-4000-8000-000020110100', name: 'Debian GNU/Linux 11 (Bullseye)', distro: 'debian', version: '11 (Bullseye)', icon: 'debian', minDiskGb: 10, tier: 'maxiops', description: 'Distro Linux paling stabil dan teruji' },
    { id: 'almalinux-9', uuid: '01000000-0000-4000-8000-000070090100', name: 'AlmaLinux 9', distro: 'almalinux', version: '9', icon: 'almalinux', minDiskGb: 15, tier: 'maxiops', description: '1:1 kompatibel RHEL tingkat enterprise', isLatest: true },
    { id: 'rocky-9', uuid: '01000000-0000-4000-8000-000080090100', name: 'Rocky Linux 9', distro: 'rocky', version: '9', icon: 'rocky', minDiskGb: 15, tier: 'maxiops', description: 'Kompatibilitas RHEL untuk beban kerja berat', isLatest: true }
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
  }
};
