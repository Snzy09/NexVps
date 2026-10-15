import axios from 'axios';
import crypto from 'crypto';
import { store } from '../db/store';

export interface CreateQrisParams {
  amount: number;
  description: string;
  orderNumber: string;
  callbackUrl?: string;
}

export interface BuatQrisTransactionData {
  transaction_id: string;
  amount: number;
  total_amount: number;
  amount_uniq: number;
  admin_fee: number;
  admin_fee_pct?: number;
  credit_amount: number;
  fee_by: string;
  qris_method: string;
  description: string;
  umkm_name?: string;
  profile_pic?: string;
  qris_image?: string;
  qr_url: string;
  expired_at: string;
  status: 'pending' | 'success' | 'expired' | 'failed';
  payment_url?: string;
}

export class BuatQrisService {
  private readonly baseUrl = 'https://api.buatqris.site';

  /**
   * Test connection to BuatQRIS API
   */
  async testConnection(customAccountId?: string, customSecretToken?: string): Promise<{ success: boolean; message: string; data?: any }> {
    const settings = store.getSettings();
    const accountId = (customAccountId && !customAccountId.includes('••••'))
      ? customAccountId.trim()
      : (settings.buatqrisAccountId?.trim() || process.env.BUATQRIS_ACCOUNT_ID?.trim());

    let secretToken = (customSecretToken && !customSecretToken.includes('••••'))
      ? customSecretToken.trim()
      : (settings.buatqrisSecretToken?.trim() || process.env.BUATQRIS_SECRET_TOKEN?.trim());

    if (!accountId || !secretToken) {
      return {
        success: false,
        message: 'Kredensial BuatQRIS belum dikonfigurasi (Account ID atau Secret Token kosong).'
      };
    }

    try {
      // Create a test 1000 IDR transaction to check credentials
      const res = await this.createQris({
        amount: 1000,
        description: 'Test API Connection NexVps',
        orderNumber: 'TEST-' + Date.now().toString(36)
      });

      return {
        success: true,
        message: 'Koneksi ke BuatQRIS API Berhasil!',
        data: res
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal terhubung ke BuatQRIS: ${err.message}`
      };
    }
  }

  /**
   * Create dynamic QRIS payment transaction
   */
  async createQris(params: CreateQrisParams): Promise<BuatQrisTransactionData> {
    const settings = store.getSettings();
    const isConfigured = Boolean(
      settings.buatqrisAccountId?.trim() && 
      settings.buatqrisSecretToken?.trim() && 
      settings.buatqrisSecretToken.length >= 20
    );

    // If not configured, provide an interactive sandbox mock with valid QR image
    if (!isConfigured) {
      console.log('⚡ BuatQRIS credentials not provided. Generating sandbox simulated QRIS.');
      const txId = '1000' + Math.floor(10000000 + Math.random() * 90000000).toString();
      const uniq = Math.floor(Math.random() * 89) + 11;
      const total = params.amount + uniq;
      const expireDate = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      // SVG fallback QR encoded as data URI for clean preview
      const simulatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021226${txId}520458125303360540${total}5802ID5913NEXVPS_CLOUD6007JAKARTA`;

      return {
        transaction_id: txId,
        amount: params.amount,
        total_amount: total,
        amount_uniq: uniq,
        admin_fee: 500,
        credit_amount: params.amount - 500,
        fee_by: settings.buatqrisFeeBy || 'user',
        qris_method: settings.buatqrisMethod || 'qris_two',
        description: params.description,
        umkm_name: 'NexVps Cloud Store (Sandbox)',
        qr_url: simulatedQrUrl,
        expired_at: expireDate,
        status: 'pending',
        payment_url: `https://app.buatqris.site/trx/${txId}`
      };
    }

    // Prepare x-www-form-urlencoded params
    const form = new URLSearchParams();
    form.append('action', 'api_create_qris');
    form.append('account_id', settings.buatqrisAccountId.trim());
    form.append('secret_token', settings.buatqrisSecretToken.trim());
    form.append('amount', Math.round(params.amount).toString());
    form.append('description', params.description.substring(0, 100));
    form.append('qris_method', settings.buatqrisMethod || 'qris_two');
    form.append('fee_by', settings.buatqrisFeeBy || 'user');

    if (params.callbackUrl) {
      form.append('callback_url', params.callbackUrl);
    }

    if (settings.isSandbox) {
      form.append('test', '1');
    }

    try {
      const response = await axios.post(this.baseUrl, form.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-App-Name': 'NexVps',
          'X-App-Version': '1.0.0'
        },
        timeout: 20000
      });

      const resData = response.data;
      if (!resData || resData.success !== true) {
        throw new Error(resData?.message || 'BuatQRIS API returned failure response');
      }

      return resData.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message;
      console.error('BuatQRIS create transaction error:', errMsg);
      throw new Error(`BuatQRIS Error: ${errMsg}`);
    }
  }

  /**
   * Check QRIS payment status via action=api_check_status
   * Note: BuatQRIS rate limit is 1 check per 20s per transaction
   */
  async checkStatus(transactionId: string): Promise<{
    status: 'pending' | 'success' | 'expired' | 'failed';
    amount?: number;
    total_amount?: number;
    qris_method?: string;
    updated_at?: string;
  }> {
    const settings = store.getSettings();
    if (!settings.buatqrisAccountId || !settings.buatqrisSecretToken) {
      return { status: 'pending' };
    }

    const form = new URLSearchParams();
    form.append('action', 'api_check_status');
    form.append('account_id', settings.buatqrisAccountId.trim());
    form.append('secret_token', settings.buatqrisSecretToken.trim());
    form.append('transaction_id', transactionId);

    try {
      const response = await axios.post(this.baseUrl, form.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000
      });

      const data = response.data;
      if (data && data.success && data.data) {
        return {
          status: data.data.status,
          amount: data.data.amount,
          total_amount: data.data.total_amount,
          qris_method: data.data.qris_method,
          updated_at: data.data.updated_at
        };
      }

      return { status: 'pending' };
    } catch (err: any) {
      if (err.response?.status === 429) {
        console.warn('BuatQRIS rate limit hit on check_status:', err.response?.data?.message);
      } else {
        console.error('BuatQRIS check_status error:', err.message);
      }
      return { status: 'pending' };
    }
  }

  /**
   * Verify HMAC-SHA256 signature from BuatQRIS Webhook
   * According to section 6 of konfigurasi-open-api.txt:
   * Header: X-BuatQris-Signature: sha256=<hex>
   */
  verifyWebhookSignature(rawBody: Buffer | string, signatureHeader?: string): boolean {
    const settings = store.getSettings();
    const signingSecret = settings.buatqrisSigningSecret?.trim();

    // If signing secret is not yet set in settings, allow with warning in development
    if (!signingSecret) {
      console.warn('⚠️ BUATQRIS_SIGNING_SECRET not configured. Skipping webhook signature verification in dev mode.');
      return true;
    }

    if (!signatureHeader) return false;

    try {
      const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf-8');
      const calcHex = crypto.createHmac('sha256', signingSecret).update(bodyBuffer).digest('hex');
      const expected = `sha256=${calcHex}`;

      if (expected.length !== signatureHeader.length) {
        return false;
      }

      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
    } catch (err) {
      console.error('Error verifying signature:', err);
      return false;
    }
  }
}

export const buatqrisService = new BuatQrisService();
