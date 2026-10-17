import axios, { AxiosInstance } from 'axios';
import { store } from '../db/store';

export interface CreateServerParams {
  title: string;
  hostname: string;
  zone: string;
  plan: string;
  storageUuid: string;
  storageSizeGb: number;
  rootPassword: string;
  sshKey?: string;
}

export interface UpCloudServerInfo {
  uuid: string;
  title: string;
  hostname: string;
  zone: string;
  plan: string;
  state: 'started' | 'stopped' | 'maintenance' | 'error';
  ipAddress?: string;
  ipv6Address?: string;
  coreNumber?: number;
  memoryAmountMb?: number;
}

export interface UpCloudTokenTestResult {
  key: string;
  maskedValue: string;
  success: boolean;
  message: string;
  status?: number;
  data?: any;
}

export class UpCloudService {
  /**
   * Retrieve all configured UpCloud API tokens in priority order
   */
  public getAllTokens(): { key: string; value: string }[] {
    const settings = store.getSettings();
    const tokens: { key: string; value: string }[] = [];

    if (Array.isArray(settings.upcloudApiTokens) && settings.upcloudApiTokens.length > 0) {
      for (const item of settings.upcloudApiTokens) {
        const val = item.value?.trim();
        if (val && !val.includes('••••')) {
          tokens.push({
            key: item.key?.trim() || `UPCLOUD_API_TOKEN_${tokens.length + 1}`,
            value: val
          });
        }
      }
    }

    // Fallback to single legacy token if list is empty
    if (tokens.length === 0 && settings.upcloudApiToken?.trim() && !settings.upcloudApiToken.includes('••••')) {
      tokens.push({
        key: 'UPCLOUD_API_TOKEN_PRIMARY',
        value: settings.upcloudApiToken.trim()
      });
    }

    // Fallback directly to process.env if still empty
    if (tokens.length === 0) {
      if (process.env.UPCLOUD_API_TOKEN?.trim()) {
        tokens.push({ key: 'UPCLOUD_API_TOKEN_PRIMARY', value: process.env.UPCLOUD_API_TOKEN.trim() });
      }
      for (const [k, v] of Object.entries(process.env)) {
        if (k.startsWith('UPCLOUD_API_TOKEN_') && v?.trim() && !tokens.some(t => t.key === k)) {
          tokens.push({ key: k, value: v.trim() });
        }
      }
    }

    return tokens;
  }

  /**
   * Check if any UpCloud authentication is configured
   */
  public isConfigured(): boolean {
    const tokens = this.getAllTokens();
    if (tokens.length > 0) return true;

    const settings = store.getSettings();
    return Boolean(settings.upcloudUsername?.trim() && settings.upcloudPassword?.trim());
  }

  /**
   * Execute an UpCloud API operation with automatic multi-token failover
   */
  private async executeWithFailover<T>(
    actionName: string,
    operation: (client: AxiosInstance, tokenInfo: { key: string; value: string }) => Promise<T>
  ): Promise<T> {
    const tokens = this.getAllTokens();
    const settings = store.getSettings();

    // If tokens are available, iterate with auto-failover
    if (tokens.length > 0) {
      const errorReports: { key: string; status?: number; message: string }[] = [];

      for (let i = 0; i < tokens.length; i++) {
        const tokenInfo = tokens[i];
        const client = axios.create({
          baseURL: 'https://api.upcloud.com/1.3',
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${tokenInfo.value}`
          }
        });

        try {
          const result = await operation(client, tokenInfo);
          if (i > 0) {
            console.log(`✅ [UpCloud Failover] Action "${actionName}" berhasil menggunakan token cadangan "${tokenInfo.key}" (Prioritas #${i + 1})`);
          }
          return result;
        } catch (err: any) {
          const status = err.response?.status;
          const errMsg = err.response?.data?.error?.error_message || err.message;
          errorReports.push({ key: tokenInfo.key, status, message: errMsg });

          console.warn(
            `⚠️ [UpCloud Token Failed] Token "${tokenInfo.key}" gagal untuk "${actionName}" (HTTP ${status || 'Network'}): ${errMsg}`
          );

          if (i < tokens.length - 1) {
            console.log(`🔄 [UpCloud Failover] Otomatis beralih ke token berikutnya: "${tokens[i + 1].key}"...`);
          }
        }
      }

      // Try basic auth fallback before throwing if configured
      const username = settings.upcloudUsername?.trim();
      const password = settings.upcloudPassword?.trim();
      if (username && password) {
        try {
          console.log(`🔄 [UpCloud Failover] Semua token gagal, mencoba fallback ke Basic Auth (${username})...`);
          const basic = Buffer.from(`${username}:${password}`).toString('base64');
          const client = axios.create({
            baseURL: 'https://api.upcloud.com/1.3',
            timeout: 30000,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              Authorization: `Basic ${basic}`
            }
          });
          return await operation(client, { key: 'BASIC_AUTH', value: username });
        } catch (basicErr: any) {
          const bMsg = basicErr.response?.data?.error?.error_message || basicErr.message;
          errorReports.push({ key: 'BASIC_AUTH', status: basicErr.response?.status, message: bMsg });
        }
      }

      // If all tokens (and fallback) failed
      const summary = errorReports
        .map(e => `[${e.key}: HTTP ${e.status || 'ERR'} - ${e.message}]`)
        .join('; ');
      throw new Error(`Semua (${tokens.length}) UpCloud API Token gagal: ${summary}`);
    }

    // Fallback to basic auth if configured
    const username = settings.upcloudUsername?.trim();
    const password = settings.upcloudPassword?.trim();
    if (username && password) {
      const basic = Buffer.from(`${username}:${password}`).toString('base64');
      const client = axios.create({
        baseURL: 'https://api.upcloud.com/1.3',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Basic ${basic}`
        }
      });
      return await operation(client, { key: 'BASIC_AUTH', value: username });
    }

    throw new Error('Kredensial UpCloud belum dikonfigurasi (API Token atau Username/Password kosong).');
  }

  /**
   * Test all configured UpCloud tokens individually and return diagnostic report
   */
  async testAllTokens(customTokens?: { key: string; value: string }[]): Promise<{
    success: boolean;
    totalTokens: number;
    activeToken?: string;
    message: string;
    data?: any;
    results: UpCloudTokenTestResult[];
  }> {
    const existingTokens = this.getAllTokens();
    let tokens: { key: string; value: string }[] = [];
    const results: UpCloudTokenTestResult[] = [];

    if (Array.isArray(customTokens) && customTokens.length > 0) {
      for (let i = 0; i < customTokens.length; i++) {
        const item = customTokens[i];
        const key = item.key?.trim() || `UPCLOUD_API_TOKEN_${i + 1}`;
        let val = item.value?.trim() || '';
        if (val.includes('••••')) {
          const matched = existingTokens.find(e => e.key === key) || existingTokens[i];
          if (matched?.value && !matched.value.includes('••••')) {
            val = matched.value;
          } else if (process.env[key] && !process.env[key]!.includes('••••')) {
            val = process.env[key]!;
          } else if (i === 0 && process.env.UPCLOUD_API_TOKEN && !process.env.UPCLOUD_API_TOKEN.includes('••••')) {
            val = process.env.UPCLOUD_API_TOKEN;
          }
        }
        if (val.includes('••••') || !val) {
          results.push({
            key,
            maskedValue: val || '••••••••',
            success: false,
            message: val ? 'Token ter-masking (••••). Masukkan ulang token lengkap untuk menguji token baru.' : 'Nilai token kosong.',
            status: 400
          });
          continue;
        }
        tokens.push({ key, value: val });
      }
    }

    if (tokens.length === 0 && results.length === 0) {
      tokens = existingTokens;
    }
    const settings = store.getSettings();

    if (tokens.length === 0 && results.length === 0) {
      const username = settings.upcloudUsername?.trim();
      const password = settings.upcloudPassword?.trim();
      if (username && password) {
        // Test basic auth
        try {
          const basic = Buffer.from(`${username}:${password}`).toString('base64');
          const client = axios.create({
            baseURL: 'https://api.upcloud.com/1.3',
            timeout: 15000,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              Authorization: `Basic ${basic}`
            }
          });
          const res = await client.get('/account');
          return {
            success: true,
            totalTokens: 1,
            activeToken: 'BASIC_AUTH',
            message: 'Koneksi UpCloud via Basic Auth Berhasil!',
            data: res.data?.account || res.data,
            results: [{
              key: 'BASIC_AUTH',
              maskedValue: `${username}:••••••••`,
              success: true,
              status: 200,
              message: 'Akun Aktif',
              data: res.data?.account || res.data
            }]
          };
        } catch (err: any) {
          const status = err.response?.status;
          let msg = err.response?.data?.error?.error_message || err.message;
          if (status === 401) {
            msg = '401 Unauthorized: Username atau password UpCloud salah.';
          }
          return {
            success: false,
            totalTokens: 1,
            message: `Koneksi Basic Auth gagal: ${msg}`,
            results: [{
              key: 'BASIC_AUTH',
              maskedValue: `${username}:••••••••`,
              success: false,
              message: msg,
              status
            }]
          };
        }
      }

      return {
        success: false,
        totalTokens: 0,
        message: 'Belum ada UpCloud API Token yang dikonfigurasi.',
        results: []
      };
    }

    let firstWorkingToken: { key: string; data: any } | null = null;

    for (const item of tokens) {
      const masked = item.value.length > 8
        ? `${item.value.slice(0, 5)}••••••••${item.value.slice(-4)}`
        : '••••••••';

      const client = axios.create({
        baseURL: 'https://api.upcloud.com/1.3',
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${item.value}`
        }
      });

      try {
        const res = await client.get('/account');
        const acct = res.data?.account || res.data;
        results.push({
          key: item.key,
          maskedValue: masked,
          success: true,
          status: 200,
          message: `Koneksi Berhasil (${acct?.username || 'Valid'})`,
          data: acct
        });

        if (!firstWorkingToken) {
          firstWorkingToken = { key: item.key, data: acct };
        }
      } catch (err: any) {
        const status = err.response?.status;
        let msg = err.response?.data?.error?.error_message || err.response?.data?.message || err.message;
        if (status === 401) {
          msg = '401 Unauthorized: Token tidak valid, kedaluwarsa, dicabut, atau IP dibatasi (Allowed IP) di panel UpCloud.';
        } else if (status === 403) {
          msg = '403 Forbidden: Token tidak memiliki izin akses.';
        } else if (status === 429) {
          msg = '429 Rate Limit: Batas kuota request UpCloud API terlampaui.';
        }
        results.push({
          key: item.key,
          maskedValue: masked,
          success: false,
          message: msg,
          status
        });
      }
    }

    const workingCount = results.filter(r => r.success).length;
    const overallSuccess = workingCount > 0;
    const totalCount = results.length;

    let summaryMessage = '';
    if (overallSuccess) {
      summaryMessage = `Koneksi UpCloud OK! ${workingCount} dari ${totalCount} token aktif (Prioritas aktif: ${firstWorkingToken?.key}).`;
    } else {
      summaryMessage = `Semua (${totalCount}) token UpCloud gagal terkoneksi.`;
    }

    return {
      success: overallSuccess,
      totalTokens: totalCount,
      activeToken: firstWorkingToken?.key,
      message: summaryMessage,
      data: firstWorkingToken?.data,
      results
    };
  }

  /**
   * Test connection to UpCloud API with automatic failover
   */
  async testConnection(): Promise<{ success: boolean; message: string; data?: any; results?: UpCloudTokenTestResult[] }> {
    return this.testAllTokens();
  }

  /**
   * Fetch active zones from UpCloud or fallback
   */
  async getZones(): Promise<any[]> {
    if (!this.isConfigured()) return store.getZones();

    try {
      return await this.executeWithFailover('getZones', async (client) => {
        const res = await client.get('/zone');
        return res.data?.zones?.zone || [];
      });
    } catch (err) {
      console.warn('Failed to fetch UpCloud zones with failover, using defaults:', err);
      return store.getZones();
    }
  }

  /**
   * Create a new Cloud Server on UpCloud
   */
  async createServer(params: CreateServerParams): Promise<UpCloudServerInfo> {
    // Prepare cloud-init configuration for root password and SSH access
    let cloudInitConfig = `#cloud-config
ssh_pwauth: true
disable_root: false
chpasswd:
  list: |
    root:${params.rootPassword}
  expire: false
runcmd:
  - sed -i 's/^#\\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
  - sed -i 's/^#\\?PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config
  - systemctl restart ssh || systemctl restart sshd || true
  - echo "NexVps Cloud provisioning complete at $(date)" > /var/log/nexvps-init.log
`;

    if (params.sshKey?.trim()) {
      cloudInitConfig += `ssh_authorized_keys:\n  - ${params.sshKey.trim()}\n`;
    }

    // If UpCloud API is not configured, return realistic simulated server for instant testing
    if (!this.isConfigured()) {
      console.log('⚡ UpCloud credentials not set. Generating simulated VPS server.');
      const mockUuid = 'upc-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
      const randomOctet3 = Math.floor(Math.random() * 200) + 10;
      const randomOctet4 = Math.floor(Math.random() * 250) + 2;
      const mockIp = `94.237.${randomOctet3}.${randomOctet4}`;
      const mockIpv6 = `2a04:3543:1000:2310:${Math.random().toString(16).substring(2, 6)}::1`;

      return {
        uuid: mockUuid,
        title: params.title,
        hostname: params.hostname,
        zone: params.zone,
        plan: params.plan,
        state: 'started',
        ipAddress: mockIp,
        ipv6Address: mockIpv6
      };
    }

    const payload: any = {
      server: {
        zone: params.zone,
        title: params.title,
        hostname: params.hostname,
        plan: params.plan,
        metadata: 'yes',
        user_data: cloudInitConfig,
        storage_devices: {
          storage_device: [
            {
              action: 'clone',
              storage: params.storageUuid,
              title: `${params.hostname}-disk0`,
              size: params.storageSizeGb || 25,
              tier: 'maxiops'
            }
          ]
        }
      }
    };

    // If customer provided an SSH public key, inject via UpCloud native login_user
    if (params.sshKey?.trim()) {
      payload.server.login_user = {
        username: 'root',
        create_password: 'no',
        ssh_keys: {
          ssh_key: [params.sshKey.trim()]
        }
      };
    }

    try {
      return await this.executeWithFailover('createServer', async (client) => {
        const res = await client.post('/server', payload);
        const s = res.data?.server || {};

        let publicIp: string | undefined;
        let publicIpv6: string | undefined;

        const ipList = s.ip_addresses?.ip_address || [];
        for (const ip of ipList) {
          if (ip.access === 'public') {
            if (ip.family === 'IPv4' && !publicIp) publicIp = ip.address;
            if (ip.family === 'IPv6' && !publicIpv6) publicIpv6 = ip.address;
          }
        }

        return {
          uuid: s.uuid,
          title: s.title,
          hostname: s.hostname,
          zone: s.zone,
          plan: s.plan,
          state: s.state || 'maintenance',
          ipAddress: publicIp,
          ipv6Address: publicIpv6,
          coreNumber: s.core_number,
          memoryAmountMb: s.memory_amount
        };
      });
    } catch (err: any) {
      console.error('UpCloud server creation failed:', err.message);
      throw new Error(`UpCloud API Error: ${err.message}`);
    }
  }

  /**
   * Get Server details by UUID with failover
   */
  async getServer(uuid: string): Promise<UpCloudServerInfo> {
    if (!this.isConfigured()) {
      return {
        uuid,
        title: 'NexVps Server',
        hostname: 'vps.nexvps.cloud',
        zone: 'sg-sin1',
        plan: '1xCPU-1GB',
        state: 'started',
        ipAddress: '94.237.112.45'
      };
    }

    try {
      return await this.executeWithFailover('getServer', async (client) => {
        const res = await client.get(`/server/${uuid}`);
        const s = res.data?.server || {};

        let publicIp: string | undefined;
        let publicIpv6: string | undefined;

        const ipList = s.ip_addresses?.ip_address || [];
        for (const ip of ipList) {
          if (ip.access === 'public') {
            if (ip.family === 'IPv4' && !publicIp) publicIp = ip.address;
            if (ip.family === 'IPv6' && !publicIpv6) publicIpv6 = ip.address;
          }
        }

        return {
          uuid: s.uuid,
          title: s.title,
          hostname: s.hostname,
          zone: s.zone,
          plan: s.plan,
          state: s.state,
          ipAddress: publicIp,
          ipv6Address: publicIpv6,
          coreNumber: s.core_number,
          memoryAmountMb: s.memory_amount
        };
      });
    } catch (err: any) {
      throw new Error(`Failed to get server: ${err.message}`);
    }
  }

  /**
   * Start Server with failover
   */
  async startServer(uuid: string): Promise<void> {
    if (!this.isConfigured()) return;
    await this.executeWithFailover('startServer', async (client) => {
      await client.post(`/server/${uuid}/start`);
    });
  }

  /**
   * Stop Server (soft graceful or hard force) with failover
   */
  async stopServer(uuid: string, hard: boolean = false): Promise<void> {
    if (!this.isConfigured()) return;
    await this.executeWithFailover('stopServer', async (client) => {
      await client.post(`/server/${uuid}/stop`, {
        stop_server: {
          stop_type: hard ? 'hard' : 'soft',
          timeout: 60
        }
      });
    });
  }

  /**
   * Restart Server with failover
   */
  async restartServer(uuid: string): Promise<void> {
    if (!this.isConfigured()) return;
    await this.executeWithFailover('restartServer', async (client) => {
      await client.post(`/server/${uuid}/restart`, {
        restart_server: {
          stop_type: 'soft',
          timeout: 60,
          timeout_action: 'hard'
        }
      });
    });
  }

  /**
   * Delete Server with failover
   */
  async deleteServer(uuid: string): Promise<void> {
    if (!this.isConfigured()) return;
    await this.executeWithFailover('deleteServer', async (client) => {
      await client.delete(`/server/${uuid}?storages=1`);
    });
  }
}

export const upcloudService = new UpCloudService();
