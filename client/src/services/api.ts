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
      return json.data;
    } catch (err) {
      console.warn('Backend server unavailable, loading catalog fallback:', err);
      return FALLBACK_CATALOG;
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
        baseAmountIdr: 150000,
        totalAmountIdr: 150000,
        adminFee: 0,
        paymentStatus: 'PENDING',
        vpsStatus: 'PENDING_PAYMENT',
        qrisImage: 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=00020101021226670016ID.CO.BUATQRIS01189360091800000000000214NEXVPSCLOUD5204581253033605802ID5912NEXVPS+CLOUD6007JAKARTA62070703A016304ABCD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
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
      const saved = localStorage.getItem('nexvps_demo_servers');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
      return INITIAL_SERVERS;
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
    const res = await fetch(`${API_BASE}/admin/metrics`, { headers: getHeaders() });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getAdminOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/admin/orders`, { headers: getHeaders() });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getAdminSettings(): Promise<AdminSettings> {
    const res = await fetch(`${API_BASE}/admin/settings`, { headers: getHeaders() });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async updateAdminSettings(settings: Partial<AdminSettings>): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(settings)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
  },

  async getAdminPlans(): Promise<VpsPlan[]> {
    const res = await fetch(`${API_BASE}/admin/plans`, { headers: getHeaders() });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async updateAdminPlan(id: string, updates: Partial<VpsPlan>): Promise<VpsPlan> {
    const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
      method: 'PUT',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async createAdminPlan(plan: Partial<VpsPlan>): Promise<VpsPlan> {
    const res = await fetch(`${API_BASE}/admin/plans`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(plan)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async deleteAdminPlan(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
  },

  async testUpCloud(): Promise<{ success: boolean; message: string; data?: any; totalTokens?: number; activeToken?: string; results?: import('../types').UpCloudTokenTestResult[] }> {
    const res = await fetch(`${API_BASE}/admin/test-upcloud`, { 
      method: 'POST',
      headers: getHeaders() 
    });
    return await res.json();
  },

  async testBuatQris(): Promise<{ success: boolean; message: string; data?: any }> {
    const res = await fetch(`${API_BASE}/admin/test-buatqris`, { 
      method: 'POST',
      headers: getHeaders() 
    });
    return await res.json();
  }
};
