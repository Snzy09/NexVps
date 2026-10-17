import { v4 as uuidv4 } from 'uuid';
import { store } from '../db/store';
import { Order, PaymentStatus, VpsStatus } from '../types';
import { buatqrisService } from './buatqrisService';
import { upcloudService } from './upcloudService';

export interface CreateOrderDto {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  planId: string;
  zoneCode: string;
  templateUuid: string;
  hostname: string;
  rootPassword: string;
  sshKey?: string;
  billingCycle?: 'monthly' | 'quarterly' | 'annually';
  isAdminTest?: boolean;
}

export class OrderManager {
  /**
   * Create a new VPS purchase order and generate BuatQRIS QR code
   */
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const plans = store.getPlans();
    const plan = plans.find(p => p.id === dto.planId);
    if (!plan) throw new Error(`Plan with ID "${dto.planId}" not found`);

    const zones = store.getZones();
    const zone = zones.find(z => z.code === dto.zoneCode);
    if (!zone) throw new Error(`Zone "${dto.zoneCode}" not found`);

    const templates = store.getTemplates();
    const template = templates.find(t => t.uuid === dto.templateUuid);
    const templateName = template?.name || 'Linux OS';

    // Calculate billing cycle pricing
    const cycle = dto.billingCycle || 'monthly';
    let basePrice = plan.pricePerMonthIdr;
    if (cycle === 'quarterly') basePrice = Math.round(plan.pricePerMonthIdr * 3 * 0.95); // 5% discount
    if (cycle === 'annually') basePrice = Math.round(plan.pricePerMonthIdr * 12 * 0.85); // 15% discount

    const orderId = uuidv4();

    // ========================================================
    // MODE TESTING ADMIN: Free VPS deployment without payment
    // ========================================================
    if (dto.isAdminTest) {
      const orderNumber = `NV-TEST-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        userId: dto.userId,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        planId: plan.id,
        zoneCode: zone.code,
        templateUuid: dto.templateUuid,
        templateName,
        hostname: dto.hostname,
        rootPassword: dto.rootPassword,
        sshKey: dto.sshKey,
        billingCycle: cycle,
        baseAmountIdr: 0,
        totalAmountIdr: 0,
        amountUniq: 0,
        adminFee: 0,
        paymentStatus: 'PAID',
        vpsStatus: 'PROVISIONING',
        paidAt: new Date().toISOString(),
        isAdminTest: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      store.addOrder(newOrder);

      console.log(`⚡ [Admin Free Test] Order ${orderNumber} created without payment. Initiating UpCloud provisioning...`);
      // Start UpCloud server creation immediately in background
      this.provisionVps(orderId).catch(err => {
        console.error(`Error in admin free test provisioning for ${orderNumber}:`, err);
      });

      return newOrder;
    }

    const orderNumber = `NV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const appBaseUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5000');
    // Call BuatQRIS to generate dynamic QR code
    const qrisData = await buatqrisService.createQris({
      amount: basePrice,
      description: `NexVps ${plan.name} (${orderNumber})`,
      orderNumber,
      callbackUrl: `${appBaseUrl}/api/webhook/buatqris`
    });

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId: dto.userId,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      planId: plan.id,
      zoneCode: zone.code,
      templateUuid: dto.templateUuid,
      templateName,
      hostname: dto.hostname,
      rootPassword: dto.rootPassword,
      sshKey: dto.sshKey,
      billingCycle: cycle,
      baseAmountIdr: basePrice,
      totalAmountIdr: qrisData.total_amount || basePrice,
      amountUniq: qrisData.amount_uniq,
      adminFee: qrisData.admin_fee,
      paymentStatus: 'PENDING',
      vpsStatus: 'PENDING_PAYMENT',
      qrisTransactionId: qrisData.transaction_id,
      qrisMethod: qrisData.qris_method,
      qrUrl: qrisData.qr_url,
      qrisImage: qrisData.qris_image,
      paymentUrl: qrisData.payment_url,
      expiredAt: qrisData.expired_at,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.addOrder(newOrder);
    return newOrder;
  }

  /**
   * Handle payment success callback from Webhook or manual verify
   */
  async handlePaymentSuccess(transactionId: string, paidAmount?: number): Promise<Order | null> {
    const order = store.getOrderByQrisTransactionId(transactionId);
    if (!order) {
      console.warn(`Order not found for transaction_id: ${transactionId}`);
      return null;
    }

    // Idempotency: if already paid, do not re-provision
    if (order.paymentStatus === 'PAID') {
      console.log(`Order ${order.orderNumber} already marked as PAID.`);
      return order;
    }

    console.log(`✅ Payment received for Order ${order.orderNumber}. Starting UpCloud VPS provisioning...`);

    // Mark as PAID and PROVISIONING
    const updated = store.updateOrder(order.id, {
      paymentStatus: 'PAID',
      vpsStatus: 'PROVISIONING',
      paidAt: new Date().toISOString()
    });

    // Start UpCloud server creation asynchronously
    this.provisionVps(order.id).catch(err => {
      console.error(`Error provisioning VPS for order ${order.orderNumber}:`, err);
    });

    return updated || null;
  }

  /**
   * Provision VPS instance on UpCloud
   */
  async provisionVps(orderId: string): Promise<void> {
    const order = store.getOrderById(orderId);
    if (!order) return;

    const plan = store.getPlans().find(p => p.id === order.planId);
    if (!plan) return;

    // Resolve verified UpCloud template UUID
    let templateUuid = order.templateUuid;
    const templates = store.getTemplates();
    const matched = templates.find(t => t.uuid === templateUuid);
    if (!matched) {
      const fallback = templates.find(t => t.id === 'ubuntu-24-04' || t.name.toLowerCase().includes('ubuntu')) || templates[0];
      if (fallback) {
        templateUuid = fallback.uuid;
        console.log(`Auto-mapped template UUID from ${order.templateUuid} to verified UpCloud UUID: ${templateUuid} (${fallback.name})`);
      }
    }

    try {
      console.log(`🚀 Provisioning UpCloud server for ${order.hostname} (Plan: ${plan.upcloudPlan}, Zone: ${order.zoneCode})`);

      const serverInfo = await upcloudService.createServer({
        title: `nexvps-${order.orderNumber.toLowerCase()}`,
        hostname: order.hostname,
        zone: order.zoneCode,
        plan: plan.upcloudPlan,
        storageUuid: templateUuid,
        storageSizeGb: plan.storageSizeGb,
        rootPassword: order.rootPassword,
        sshKey: order.sshKey
      });

      console.log(`UpCloud server created with UUID: ${serverInfo.uuid}, State: ${serverInfo.state}`);

      store.updateOrder(order.id, {
        serverUuid: serverInfo.uuid,
        serverIp: serverInfo.ipAddress,
        serverIpv6: serverInfo.ipv6Address,
        serverState: serverInfo.state,
        templateUuid,
        vpsStatus: serverInfo.state === 'started' ? 'ACTIVE' : 'PROVISIONING',
        errorMessage: undefined
      });

      // Poll until server is completely started and IP is populated
      if (serverInfo.state !== 'started' || !serverInfo.ipAddress) {
        this.pollServerReady(order.id, serverInfo.uuid);
      }
    } catch (err: any) {
      console.error(`Provisioning failed for order ${order.orderNumber}:`, err.message);
      store.updateOrder(order.id, {
        vpsStatus: 'ERROR',
        errorMessage: err.message
      });
    }
  }

  /**
   * Re-attempt VPS provisioning for a paid order that had an error
   */
  async retryProvisioning(orderId: string): Promise<Order | null> {
    const order = store.getOrderById(orderId);
    if (!order) return null;

    store.updateOrder(order.id, {
      vpsStatus: 'PROVISIONING',
      errorMessage: undefined
    });

    await this.provisionVps(order.id);
    return store.getOrderById(order.id) || null;
  }

  /**
   * Poll UpCloud until server reaches 'started' state
   */
  private async pollServerReady(orderId: string, serverUuid: string, attempts = 0): Promise<void> {
    if (attempts >= 20) {
      console.warn(`Polling timeout for server ${serverUuid}`);
      return;
    }

    setTimeout(async () => {
      try {
        const info = await upcloudService.getServer(serverUuid);
        if (info.state === 'started' && info.ipAddress) {
          console.log(`🎉 UpCloud Server ${serverUuid} is READY! IP: ${info.ipAddress}`);
          store.updateOrder(orderId, {
            serverIp: info.ipAddress,
            serverIpv6: info.ipv6Address,
            serverState: 'started',
            vpsStatus: 'ACTIVE'
          });
        } else {
          // Keep polling
          this.pollServerReady(orderId, serverUuid, attempts + 1);
        }
      } catch (err) {
        console.warn(`Error during server poll (${serverUuid}):`, err);
        this.pollServerReady(orderId, serverUuid, attempts + 1);
      }
    }, 5000);
  }

  /**
   * Manually check payment status via BuatQRIS API
   */
  async checkPaymentStatus(orderId: string): Promise<Order | null> {
    const order = store.getOrderById(orderId);
    if (!order) return null;

    if (order.paymentStatus === 'PAID') return order;
    if (!order.qrisTransactionId) return order;

    const res = await buatqrisService.checkStatus(order.qrisTransactionId);
    if (res.status === 'success') {
      return this.handlePaymentSuccess(order.qrisTransactionId, res.total_amount);
    } else if (res.status === 'expired') {
      return store.updateOrder(order.id, { paymentStatus: 'EXPIRED' }) || null;
    } else if (res.status === 'failed') {
      return store.updateOrder(order.id, { paymentStatus: 'FAILED' }) || null;
    }

    return order;
  }

  /**
   * For Sandbox / Demo testing: instantly simulate payment success
   */
  async simulatePayment(orderId: string): Promise<Order | null> {
    const order = store.getOrderById(orderId);
    if (!order) return null;

    return this.handlePaymentSuccess(order.qrisTransactionId || order.id, order.totalAmountIdr);
  }
}

export const orderManager = new OrderManager();
