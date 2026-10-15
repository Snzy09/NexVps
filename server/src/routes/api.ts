import { Router, Request, Response } from 'express';
import { store } from '../db/store';
import { orderManager } from '../services/orderManager';
import { upcloudService } from '../services/upcloudService';
import { buatqrisService } from '../services/buatqrisService';

const router = Router();

// ==========================================
// 1. VPS CATALOG & CONFIGURATOR
// ==========================================

router.get('/catalog', async (_req: Request, res: Response) => {
  try {
    const plans = store.getPlans();
    const zones = store.getZones();
    const templates = store.getTemplates();
    const settings = store.getSettings();

    res.json({
      success: true,
      data: {
        plans,
        zones,
        templates,
        store: {
          name: settings.storeName,
          tagline: settings.storeTagline,
          supportEmail: settings.supportEmail,
          supportWhatsapp: settings.supportWhatsapp,
          isSandbox: settings.isSandbox
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. ORDERS & CHECKOUT
// ==========================================

router.post('/orders', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      planId,
      zoneCode,
      templateUuid,
      hostname,
      rootPassword,
      sshKey,
      billingCycle
    } = req.body;

    if (!customerName || !customerEmail || !planId || !zoneCode || !templateUuid || !hostname || !rootPassword) {
      return res.status(400).json({
        success: false,
        message: 'Lengkapi semua data yang diperlukan (Nama, Email, Plan, Lokasi, OS, Hostname, Password Root).'
      });
    }

    const order = await orderManager.createOrder({
      userId,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      planId,
      zoneCode,
      templateUuid,
      hostname,
      rootPassword,
      sshKey,
      billingCycle: billingCycle || 'monthly'
    });

    res.json({
      success: true,
      message: 'Pesanan berhasil dibuat, silakan selesaikan pembayaran QRIS.',
      data: order
    });
  } catch (err: any) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/orders/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const order = store.getOrderById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  }
  res.json({ success: true, data: order });
});

router.post('/orders/:id/check-payment', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await orderManager.checkPaymentStatus(id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.post('/orders/:id/retry-provision', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await orderManager.retryProvisioning(id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
    res.json({
      success: true,
      message: 'Mencoba kembali pembuatan server UpCloud...',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. VPS INSTANCES MANAGEMENT
// ==========================================

router.get('/servers', async (req: Request, res: Response) => {
  const email = (req.query.email as string)?.trim().toLowerCase();
  const userId = req.query.userId as string;
  const adminEmail = ((req.headers['x-admin-email'] as string) || '').trim().toLowerCase();
  const forceSync = req.query.sync === '1' || req.query.sync === 'true';

  const settings = store.getSettings();
  const adminEmails = (settings.adminEmails || ['sanzzydev@gmail.com']).map(e => e.toLowerCase().trim());
  const isAdmin = Boolean(adminEmail && adminEmails.includes(adminEmail));

  let orders = store.getOrders().filter(o => o.vpsStatus === 'ACTIVE' || o.vpsStatus === 'PROVISIONING' || o.vpsStatus === 'ERROR');

  // If user is Admin, they can read ALL VPS servers from all users!
  // If not admin, they can ONLY read their own VPS servers by email or userId
  if (!isAdmin) {
    if (userId || email) {
      orders = orders.filter(o => 
        (userId && o.userId === userId) || 
        (email && o.customerEmail?.toLowerCase() === email)
      );
    } else {
      orders = [];
    }
  } else {
    // Admin can view all, or optionally filter by email
    if (email) {
      orders = orders.filter(o => o.customerEmail?.toLowerCase().includes(email));
    }
  }

  // Real-time synchronization with UpCloud API:
  // If forceSync is true, OR if any server is currently in 'maintenance' / 'PROVISIONING', sync directly with UpCloud
  const shouldSync = forceSync || orders.some(o => o.serverUuid && (o.vpsStatus === 'PROVISIONING' || o.serverState === 'maintenance'));
  if (shouldSync && orders.length > 0) {
    await Promise.allSettled(
      orders
        .filter(o => Boolean(o.serverUuid))
        .map(async (ord) => {
          try {
            const live = await upcloudService.getServer(ord.serverUuid!);
            if (live && live.state) {
              const newVpsStatus: any = 
                live.state === 'started' || live.state === 'stopped' 
                  ? 'ACTIVE' 
                  : (live.state === 'error' ? 'ERROR' : 'PROVISIONING');
              
              store.updateOrder(ord.id, {
                serverState: live.state,
                serverIp: live.ipAddress || ord.serverIp,
                serverIpv6: live.ipv6Address || ord.serverIpv6,
                vpsStatus: newVpsStatus
              });
            }
          } catch (e: any) {
            console.warn(`Live sync skipped for ${ord.serverUuid}:`, e.message);
          }
        })
    );

    // Re-fetch orders from store to return freshly synced values
    const refreshedOrders = store.getOrders().filter(o => o.vpsStatus === 'ACTIVE' || o.vpsStatus === 'PROVISIONING' || o.vpsStatus === 'ERROR');
    if (!isAdmin) {
      orders = refreshedOrders.filter(o => 
        (userId && o.userId === userId) || 
        (email && o.customerEmail?.toLowerCase() === email)
      );
    } else {
      orders = email ? refreshedOrders.filter(o => o.customerEmail?.toLowerCase().includes(email)) : refreshedOrders;
    }
  }

  // Enrich each order with plan, zone, and template details for rich card UI
  const allPlans = store.getPlans();
  const allZones = store.getZones();
  const allTemplates = store.getTemplates();

  const enriched = orders.map(ord => {
    const plan = allPlans.find(p => p.id === ord.planId);
    const zone = allZones.find(z => z.code === ord.zoneCode);
    const template = allTemplates.find(t => t.uuid === ord.templateUuid);

    return {
      ...ord,
      coreNumber: plan?.coreNumber || 1,
      memoryAmountMb: plan?.memoryAmountMb || 1024,
      storageSizeGb: plan?.storageSizeGb || 25,
      bandwidthTb: plan?.bandwidthTb || 1,
      planName: plan?.name || ord.planId,
      zoneName: zone?.name || ord.zoneCode,
      zoneFlag: zone?.flag || '🌐',
      zoneCity: zone?.city || '',
      zoneCountry: zone?.country || '',
      templateIcon: template?.icon || '🐧',
      templateDistro: template?.distro || 'linux'
    };
  });

  res.json({ success: true, data: enriched });
});

router.get('/servers/:uuid', async (req: Request, res: Response) => {
  try {
    const uuid = Array.isArray(req.params.uuid) ? req.params.uuid[0] : req.params.uuid;
    const server = await upcloudService.getServer(uuid);
    res.json({ success: true, data: server });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/servers/:uuid/action', async (req: Request, res: Response) => {
  const uuid = Array.isArray(req.params.uuid) ? req.params.uuid[0] : req.params.uuid;
  const { action } = req.body; // 'start' | 'stop' | 'restart' | 'sync' | 'delete'

  try {
    let actionMessage = '';

    if (action === 'start') {
      await upcloudService.startServer(uuid);
      actionMessage = 'Server berhasil dinyalakan (Power On).';
    } else if (action === 'stop') {
      await upcloudService.stopServer(uuid, false);
      actionMessage = 'Server berhasil dimatikan (Power Off).';
    } else if (action === 'force_stop') {
      await upcloudService.stopServer(uuid, true);
      actionMessage = 'Server berhasil dimatikan secara paksa (Force Shutdown).';
    } else if (action === 'restart') {
      await upcloudService.restartServer(uuid);
      actionMessage = 'Server berhasil di-restart (Reboot).';
    } else if (action === 'sync') {
      actionMessage = 'Status server berhasil disinkronisasi langsung dari UpCloud.';
    } else if (action === 'delete') {
      await upcloudService.deleteServer(uuid);
      const orders = store.getOrders();
      const match = orders.find(o => o.serverUuid === uuid);
      if (match) {
        store.updateOrder(match.id, { vpsStatus: 'TERMINATED', serverState: 'stopped' });
      }
      return res.json({ success: true, message: 'Server berhasil dihapus dari cloud.' });
    } else {
      return res.status(400).json({ success: false, message: `Aksi tidak dikenal: ${action}` });
    }

    // Immediately fetch updated live server info from UpCloud
    let liveInfo: any = null;
    try {
      liveInfo = await upcloudService.getServer(uuid);
      const orders = store.getOrders();
      const match = orders.find(o => o.serverUuid === uuid);
      if (match) {
        const newVpsStatus: any = liveInfo.state === 'started' || liveInfo.state === 'stopped' 
          ? 'ACTIVE' 
          : (liveInfo.state === 'error' ? 'ERROR' : 'PROVISIONING');

        const updated = store.updateOrder(match.id, {
          serverState: liveInfo.state,
          serverIp: liveInfo.ipAddress || match.serverIp,
          serverIpv6: liveInfo.ipv6Address || match.serverIpv6,
          vpsStatus: newVpsStatus
        });
        return res.json({ 
          success: true, 
          message: actionMessage, 
          data: updated,
          liveState: liveInfo.state 
        });
      }
    } catch (syncErr: any) {
      console.warn('Sync post-action error:', syncErr.message);
    }

    res.json({ success: true, message: actionMessage, liveState: liveInfo?.state });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. BUATQRIS WEBHOOK RECEIVER
// ==========================================

router.post('/webhook/buatqris', async (req: Request, res: Response) => {
  try {
    const signature = req.get('X-BuatQris-Signature') || '';
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    // Verify HMAC-SHA256 signature
    const isValid = buatqrisService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('❌ Invalid BuatQRIS webhook signature!');
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log('📩 BuatQRIS Webhook received:', payload.event, payload.transaction_id);

    const { event, transaction_id, status, total_amount } = payload;

    if (event === 'payment.success' || status === 'success') {
      await orderManager.handlePaymentSuccess(transaction_id, total_amount);
    } else if (event === 'payment.expired' || status === 'expired') {
      const order = store.getOrderByQrisTransactionId(transaction_id);
      if (order && order.paymentStatus !== 'PAID') {
        store.updateOrder(order.id, { paymentStatus: 'EXPIRED' });
      }
    } else if (event === 'payment.failed' || status === 'failed') {
      const order = store.getOrderByQrisTransactionId(transaction_id);
      if (order && order.paymentStatus !== 'PAID') {
        store.updateOrder(order.id, { paymentStatus: 'FAILED' });
      }
    }

    // Always respond 200 OK fast
    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (err: any) {
    console.error('Webhook error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4.5. AUTH & ADMIN VERIFICATION
// ==========================================

const checkAdminEmail = (req: Request): boolean => {
  const adminEmail = ((req.headers['x-admin-email'] as string) || (req.query.adminEmail as string) || '').toLowerCase().trim();
  const settings = store.getSettings();
  const adminEmails = (settings.adminEmails || ['sanzzydev@gmail.com']).map(e => e.toLowerCase().trim());
  return Boolean(adminEmail && adminEmails.includes(adminEmail));
};

const requireAdmin = (req: Request, res: Response, next: Function) => {
  if (!checkAdminEmail(req)) {
    return res.status(403).json({
      success: false,
      message: 'Akses Ditolak: Halaman dan aksi ini hanya dapat diakses oleh akun Administrator NexVps.'
    });
  }
  next();
};

router.get('/auth/admin-check', (req: Request, res: Response) => {
  const email = ((req.query.email as string) || (req.headers['x-admin-email'] as string) || '').toLowerCase().trim();
  const settings = store.getSettings();
  const adminEmails = (settings.adminEmails || ['sanzzydev@gmail.com']).map(e => e.toLowerCase().trim());
  const isAdmin = Boolean(email && adminEmails.includes(email));

  res.json({
    success: true,
    data: {
      email,
      isAdmin,
      adminEmails: isAdmin ? adminEmails : []
    }
  });
});

// ==========================================
// 5. ADMIN SETTINGS & METRICS
// ==========================================

router.get('/admin/metrics', requireAdmin, (_req: Request, res: Response) => {
  const orders = store.getOrders();
  const totalOrders = orders.length;
  const paidOrders = orders.filter(o => o.paymentStatus === 'PAID');
  const activeServers = orders.filter(o => o.vpsStatus === 'ACTIVE');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmountIdr || 0), 0);
  const pendingOrders = orders.filter(o => o.paymentStatus === 'PENDING');

  res.json({
    success: true,
    data: {
      totalOrders,
      paidOrdersCount: paidOrders.length,
      activeServersCount: activeServers.length,
      pendingOrdersCount: pendingOrders.length,
      totalRevenueIdr: totalRevenue
    }
  });
});

router.get('/admin/orders', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, data: store.getOrders() });
});

router.get('/admin/settings', requireAdmin, (_req: Request, res: Response) => {
  const settings = store.getSettings();

  const tokensList = (settings.upcloudApiTokens && settings.upcloudApiTokens.length > 0)
    ? settings.upcloudApiTokens
    : (settings.upcloudApiToken ? [{ key: 'UPCLOUD_API_TOKEN_1', value: settings.upcloudApiToken }] : []);

  const maskedTokens = tokensList.map((t, idx) => ({
    key: t.key?.trim() || `UPCLOUD_API_TOKEN_${idx + 1}`,
    value: t.value ? (t.value.length > 8 ? `${t.value.slice(0, 5)}••••••••${t.value.slice(-4)}` : '••••••••') : ''
  }));

  // Mask secrets for UI security
  const masked = {
    ...settings,
    upcloudApiToken: settings.upcloudApiToken ? '••••••••' + settings.upcloudApiToken.slice(-4) : '',
    upcloudApiTokens: maskedTokens,
    upcloudPassword: settings.upcloudPassword ? '••••••••' : '',
    buatqrisSecretToken: settings.buatqrisSecretToken ? '••••••••' + settings.buatqrisSecretToken.slice(-4) : '',
    buatqrisSigningSecret: settings.buatqrisSigningSecret ? '••••••••' + settings.buatqrisSigningSecret.slice(-4) : '',
    hasUpCloudToken: Boolean(tokensList.some(t => Boolean(t.value))),
    hasUpCloudBasic: Boolean(settings.upcloudUsername && settings.upcloudPassword),
    hasBuatQrisCreds: Boolean(settings.buatqrisAccountId && settings.buatqrisSecretToken)
  };
  res.json({ success: true, data: masked });
});

router.post('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  try {
    const body = req.body;
    const current = store.getSettings();

    // Only update sensitive values if new non-masked value is provided
    const updates: any = { ...body };

    // Handle multi-token array resolution
    if (Array.isArray(body.upcloudApiTokens)) {
      const existingTokens = current.upcloudApiTokens || (current.upcloudApiToken ? [{ key: 'UPCLOUD_API_TOKEN_1', value: current.upcloudApiToken }] : []);
      const resolvedTokens: { key: string; value: string }[] = [];

      for (let i = 0; i < body.upcloudApiTokens.length; i++) {
        const submitted = body.upcloudApiTokens[i];
        const key = submitted.key?.trim();
        if (!key) continue;

        let val = submitted.value?.trim() || '';
        if (val.includes('••••')) {
          // Find matching existing token by key or index
          const matched = existingTokens.find(e => e.key === key) || existingTokens[i];
          if (matched && matched.value) {
            val = matched.value;
          }
        }
        if (val) {
          resolvedTokens.push({ key, value: val });
        }
      }

      updates.upcloudApiTokens = resolvedTokens;
      if (resolvedTokens.length > 0) {
        updates.upcloudApiToken = resolvedTokens[0].value;
      }
    } else if (body.upcloudApiToken?.includes('••••')) {
      delete updates.upcloudApiToken;
    }

    if (body.upcloudPassword?.includes('••••')) delete updates.upcloudPassword;
    if (body.buatqrisSecretToken?.includes('••••')) delete updates.buatqrisSecretToken;
    if (body.buatqrisSigningSecret?.includes('••••')) delete updates.buatqrisSigningSecret;

    const updated = store.updateSettings(updates);
    const maskedUpdatedTokens = (updated.upcloudApiTokens || []).map((t, idx) => ({
      key: t.key || `UPCLOUD_API_TOKEN_${idx + 1}`,
      value: t.value ? (t.value.length > 8 ? `${t.value.slice(0, 5)}••••••••${t.value.slice(-4)}` : '••••••••') : ''
    }));

    res.json({
      success: true,
      message: 'Pengaturan berhasil disimpan!',
      data: {
        ...updated,
        upcloudApiToken: updated.upcloudApiToken ? '••••••••' : '',
        upcloudApiTokens: maskedUpdatedTokens,
        upcloudPassword: updated.upcloudPassword ? '••••••••' : '',
        buatqrisSecretToken: updated.buatqrisSecretToken ? '••••••••' : '',
        buatqrisSigningSecret: updated.buatqrisSigningSecret ? '••••••••' : ''
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.all('/admin/test-upcloud', requireAdmin, async (req: Request, res: Response) => {
  try {
    const rawTokens = req.body?.tokens || req.body?.upcloudApiTokens;
    let customTokens: { key: string; value: string }[] | undefined = undefined;
    if (Array.isArray(rawTokens)) {
      customTokens = rawTokens.map((t: any, idx: number) => {
        if (typeof t === 'string') {
          return { key: `TOKEN_${idx + 1}`, value: t };
        }
        return { key: t.key || `TOKEN_${idx + 1}`, value: t.value || '' };
      });
    }
    const result = await upcloudService.testAllTokens(customTokens);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, results: [] });
  }
});

router.all('/admin/test-buatqris', requireAdmin, async (req: Request, res: Response) => {
  try {
    const accountId = req.body?.accountId || req.query?.accountId;
    const secretToken = req.body?.secretToken || req.query?.secretToken;
    const result = await buatqrisService.testConnection(accountId as string, secretToken as string);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. ADMIN PLAN & PRICING MANAGEMENT
// ==========================================

router.get('/admin/plans', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, data: store.getPlans() });
});

router.put('/admin/plans/:id', requireAdmin, (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updates = req.body;
  const updated = store.updatePlan(id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Paket VPS tidak ditemukan' });
  }
  res.json({ success: true, message: 'Harga & paket berhasil diperbarui!', data: updated });
});

router.post('/admin/plans', requireAdmin, (req: Request, res: Response) => {
  const { name, coreNumber, memoryAmountMb, storageSizeGb, bandwidthTb, pricePerMonthIdr, upcloudPlan, features } = req.body;
  if (!name || !pricePerMonthIdr || !upcloudPlan) {
    return res.status(400).json({ success: false, message: 'Data paket tidak lengkap' });
  }
  const id = req.body.id || `plan-${Date.now().toString(36)}`;
  const newPlan = store.addPlan({
    id,
    name,
    slug: id,
    coreNumber: Number(coreNumber) || 1,
    memoryAmountMb: Number(memoryAmountMb) || 1024,
    storageSizeGb: Number(storageSizeGb) || 25,
    bandwidthTb: Number(bandwidthTb) || 1,
    pricePerMonthIdr: Number(pricePerMonthIdr),
    pricePerMonthUsd: Math.round(Number(pricePerMonthIdr) / 16000),
    upcloudPlan,
    features: features || ['High-Performance MaxIOPS Storage', '1 Gbps Public Port', 'DDoS Protection Included'],
    popular: Boolean(req.body.popular)
  });
  res.json({ success: true, message: 'Paket VPS baru berhasil ditambahkan!', data: newPlan });
});

router.delete('/admin/plans/:id', requireAdmin, (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const ok = store.deletePlan(id);
  if (!ok) {
    return res.status(404).json({ success: false, message: 'Paket tidak ditemukan' });
  }
  res.json({ success: true, message: 'Paket berhasil dihapus' });
});

export default router;
