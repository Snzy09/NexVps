import React, { useState, useEffect } from 'react';
import type { AdminMetrics, AdminSettings, Order, VpsPlan, ChangelogItem } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import GlideSelect from './GlideSelect';
import HoldButton from './HoldButton';
import { AdminMetricsCharts } from './AdminMetricsCharts';
import { EnvEditor, type EnvItem } from './ballmac/env-editor';
import { ChangelogMarkdownEditor } from './ChangelogMarkdownEditor';
import { FormattedMarkdown } from './FormattedMarkdown';
import { 
  Sliders, 
  DollarSign, 
  Server, 
  Clock, 
  ShoppingBag, 
  Key, 
  QrCode, 
  Save, 
  RefreshCw, 
  Copy, 
  Check, 
  Tag, 
  Edit3, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Cpu, 
  HardDrive, 
  Activity, 
  Globe2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  LogOut,
  X,
  Eye,
  EyeOff,
  Zap,
  AlertTriangle,
  Search,
  RotateCcw,
  FileText,
  Bug
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToStore?: () => void;
  onOpenAuth?: (tab?: 'login' | 'register', adminOnly?: boolean) => void;
  onPlansUpdated?: (plans: VpsPlan[]) => void;
}

const QRIS_METHOD_OPTIONS = [
  { value: 'qris_two', label: 'QRIS Dua (Metode 2)', tag: 'Default' },
  { value: 'qris_one', label: 'QRIS Satu (Metode 1)', tag: 'Metode 1' },
  { value: 'qris_three', label: 'QRIS Tiga (Metode 3)', tag: 'Metode 3' },
  { value: 'qris_four', label: 'QRIS Empat (Metode 4)', tag: 'Metode 4' },
];

const QRIS_FEE_OPTIONS = [
  { value: 'user', label: 'Dipotong dari Saldo Toko', tag: 'Default' },
  { value: 'buyer', label: 'Ditambahkan ke Pembeli', tag: 'Pembeli' },
];

const TRANSACTION_MODE_OPTIONS = [
  { value: 'false', label: 'Live Production', tag: 'Uang Nyata' },
  { value: 'true', label: 'Sandbox (Test)', tag: 'Uji Coba' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore, onOpenAuth, onPlansUpdated }) => {
  const { user, isAdmin, logout } = useAuth();
  const { isDark } = useTheme();
  const toast = useToast();

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [, setSettings] = useState<AdminSettings | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [plans, setPlans] = useState<VpsPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'plans' | 'metrics' | 'orders' | 'changelog'>('plans');

  // Changelog management state
  const [changelogItems, setChangelogItems] = useState<ChangelogItem[]>([]);
  const [editingChangelogId, setEditingChangelogId] = useState<string | null>(null);
  const [changelogForm, setChangelogForm] = useState<{
    title: string;
    type: 'feature' | 'improvement' | 'fix';
    date: string;
    description: string;
  }>({
    title: '',
    type: 'feature',
    date: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()),
    description: ''
  });
  const [showChangelogForm, setShowChangelogForm] = useState<boolean>(true);
  const [changelogSearch, setChangelogSearch] = useState<string>('');
  const [changelogCategoryFilter, setChangelogCategoryFilter] = useState<'all' | 'feature' | 'improvement' | 'fix'>('all');
  const [savingChangelog, setSavingChangelog] = useState<boolean>(false);

  // Plan editing state
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<Partial<VpsPlan>>({});
  const [showAddPlanModal, setShowAddPlanModal] = useState<boolean>(false);
  const [newPlanForm, setNewPlanForm] = useState<Partial<VpsPlan>>({
    name: '',
    upcloudPlan: '1xCPU-1GB',
    pricePerMonthIdr: 100000,
    coreNumber: 1,
    memoryAmountMb: 1024,
    storageSizeGb: 25,
    bandwidthTb: 1,
    features: ['High-Performance MaxIOPS', '1 Gbps Public Port', 'DDoS Protection Included']
  });

  // Test connection state
  const [upcloudTestStatus, setUpcloudTestStatus] = useState<{ loading: boolean; result?: any }>({ loading: false });
  const [buatqrisTestStatus, setBuatqrisTestStatus] = useState<{ loading: boolean; result?: any }>({ loading: false });
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false);

  // Settings form states
  const [formSettings, setFormSettings] = useState<Partial<AdminSettings>>({});
  const [showTokens, setShowTokens] = useState<{ upcloud?: boolean; secret?: boolean; signing?: boolean }>({});
  const toggleToken = (key: 'upcloud' | 'secret' | 'signing') => setShowTokens(p => ({ ...p, [key]: !p[key] }));

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, s, ord, p, cl] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminSettings(),
        api.getAdminOrders(),
        api.getAdminPlans(),
        api.getChangelogs()
      ]);
      setMetrics(m);
      setSettings(s);
      const safeTokens = (s.upcloudApiTokens && s.upcloudApiTokens.length > 0)
        ? s.upcloudApiTokens
        : (s.upcloudApiToken ? [{ key: 'UPCLOUD_API_TOKEN_PRIMARY', value: s.upcloudApiToken }] : [{ key: 'UPCLOUD_API_TOKEN_PRIMARY', value: '' }]);
      setFormSettings({
        ...s,
        upcloudApiTokens: safeTokens
      });
      setOrders(ord);
      setPlans(p);
      setChangelogItems(cl);
      if (p && Array.isArray(p)) {
        onPlansUpdated?.(p);
      }
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const tokenBadges = React.useMemo(() => {
    if (!upcloudTestStatus.result?.results) return undefined;
    const badges: Record<number, { text: string; variant?: 'success' | 'warning' | 'error' | 'neutral' }> = {};
    upcloudTestStatus.result.results.forEach((res: any, idx: number) => {
      if (res.status === 'valid') {
        badges[idx] = { text: 'Valid & Siap', variant: 'success' };
      } else if (res.status === 'rate_limited') {
        badges[idx] = { text: 'Rate Limited', variant: 'warning' };
      } else {
        badges[idx] = { text: 'Gagal / Error', variant: 'error' };
      }
    });
    return badges;
  }, [upcloudTestStatus.result]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  // 1. If user is NOT logged in: Gate with Admin Login
  if (!user) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center space-y-6">
        <div className="p-8 sm:p-10 bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/10">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
              Protected Admin Area
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">Halaman Khusus Administrator</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-sm mx-auto">
              Panel ini memerlukan autentikasi akun Administrator NexVps untuk mengakses konfigurasi UpCloud, BuatQRIS, dan tarif paket.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => onOpenAuth?.('login', true)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Login dengan Akun Administrator</span>
            </button>

            {onBackToStore && (
              <button
                onClick={onBackToStore}
                className="w-full py-2.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                ← Kembali ke Katalog VPS
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. If user IS logged in but is NOT an admin: 403 Forbidden Screen
  if (!isAdmin) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center space-y-6">
        <div className="p-8 sm:p-10 bg-white dark:bg-slate-900/90 rounded-3xl border border-rose-500/20 shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold">
              403 Akses Ditolak
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">Bukan Akun Administrator</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-sm mx-auto">
              Anda saat ini masuk sebagai <strong className="text-slate-900 dark:text-white font-mono">{user.email}</strong> (Akun Pelanggan Biasa). Halaman ini hanya dapat diakses oleh akun Administrator terdaftar.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={async () => {
                await logout();
                onOpenAuth?.('login', true);
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Ganti Akun & Login Administrator</span>
            </button>

            {onBackToStore && (
              <button
                onClick={onBackToStore}
                className="w-full py-2.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                ← Kembali ke Katalog VPS
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateAdminSettings(formSettings);
      toast.success('Pengaturan API & Gateway berhasil disimpan!');
      const updated = await api.getAdminSettings();
      setSettings(updated);
      const safeTokens = (updated.upcloudApiTokens && updated.upcloudApiTokens.length > 0)
        ? updated.upcloudApiTokens
        : (updated.upcloudApiToken ? [{ key: 'UPCLOUD_API_TOKEN_PRIMARY', value: updated.upcloudApiToken }] : [{ key: 'UPCLOUD_API_TOKEN_PRIMARY', value: '' }]);
      setFormSettings({
        ...updated,
        upcloudApiTokens: safeTokens
      });
    } catch (err: any) {
      toast.error('Gagal Menyimpan Pengaturan', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePlanPrice = async (planId: string) => {
    try {
      await api.updateAdminPlan(planId, planForm);
      toast.success('Harga & Spesifikasi Paket Berhasil Diperbarui!');
      setEditingPlanId(null);
      const updatedPlans = await api.getAdminPlans();
      setPlans(updatedPlans);
      onPlansUpdated?.(updatedPlans);
    } catch (err: any) {
      toast.error('Gagal Memperbarui Harga', err.message);
    }
  };

  const handleCreateNewPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminPlan(newPlanForm);
      toast.success('Paket VPS baru berhasil ditambahkan!');
      setShowAddPlanModal(false);
      const updatedPlans = await api.getAdminPlans();
      setPlans(updatedPlans);
      onPlansUpdated?.(updatedPlans);
    } catch (err: any) {
      toast.error('Gagal Menambah Paket', err.message);
    }
  };

  const handleDeletePlan = async (planId: string, planName: string, confirmed: boolean = false) => {
    if (!confirmed && !confirm(`Yakin ingin menghapus paket "${planName}"?`)) return;
    try {
      await api.deleteAdminPlan(planId);
      toast.success('Paket Berhasil Dihapus', `Paket "${planName}" telah dihapus.`);
      const updatedPlans = await api.getAdminPlans();
      setPlans(updatedPlans);
      onPlansUpdated?.(updatedPlans);
    } catch (err: any) {
      toast.error('Gagal Menghapus Paket', err.message);
    }
  };

  const handleTestUpCloud = async () => {
    setUpcloudTestStatus({ loading: true });
    try {
      const currentTokens = (formSettings.upcloudApiTokens && formSettings.upcloudApiTokens.length > 0)
        ? formSettings.upcloudApiTokens
        : (formSettings.upcloudApiToken ? [{ key: 'UPCLOUD_API_TOKEN_PRIMARY', value: formSettings.upcloudApiToken }] : []);
      const res = await api.testUpCloud(currentTokens);
      setUpcloudTestStatus({ loading: false, result: res });
    } catch (err: any) {
      setUpcloudTestStatus({ loading: false, result: { success: false, message: err.message } });
    }
  };

  const handleTestBuatQris = async () => {
    setBuatqrisTestStatus({ loading: true });
    try {
      const res = await api.testBuatQris({
        accountId: formSettings.buatqrisAccountId,
        secretToken: formSettings.buatqrisSecretToken
      });
      setBuatqrisTestStatus({ loading: false, result: res });
    } catch (err: any) {
      setBuatqrisTestStatus({ loading: false, result: { success: false, message: err.message } });
    }
  };

  const webhookUrl = `${window.location.origin}/api/webhook/buatqris`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleSaveChangelog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changelogForm.title.trim()) {
      toast.error('Judul Diperlukan', 'Masukkan judul atau ringkasan rilis.');
      return;
    }

    setSavingChangelog(true);
    try {
      if (editingChangelogId) {
        await api.updateChangelogItem(editingChangelogId, {
          title: changelogForm.title.trim(),
          type: changelogForm.type,
          date: changelogForm.date.trim(),
          description: changelogForm.description.trim()
        });
        toast.success('Catatan Rilis Diperbarui', `Item "${changelogForm.title}" berhasil disimpan.`);
        setEditingChangelogId(null);
      } else {
        await api.createChangelogItem({
          title: changelogForm.title.trim(),
          type: changelogForm.type,
          date: changelogForm.date.trim(),
          description: changelogForm.description.trim()
        });
        toast.success('Catatan Rilis Ditambahkan', `Item baru [${changelogForm.type.toUpperCase()}] berhasil ditambahkan.`);
      }

      setChangelogForm({
        title: '',
        type: 'feature',
        date: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()),
        description: ''
      });

      const updated = await api.getChangelogs();
      setChangelogItems(updated);
    } catch (err: any) {
      toast.error('Gagal Menyimpan Catatan', err.message);
    } finally {
      setSavingChangelog(false);
    }
  };

  const handleEditChangelog = (item: ChangelogItem) => {
    setEditingChangelogId(item.id);
    setChangelogForm({
      title: item.title,
      type: item.type,
      date: item.date,
      description: item.description || ''
    });
    setShowChangelogForm(true);

    const el = document.getElementById('changelog-editor-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEditChangelog = () => {
    setEditingChangelogId(null);
    setChangelogForm({
      title: '',
      type: 'feature',
      date: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()),
      description: ''
    });
  };

  const handleDeleteChangelog = async (id: string, title: string) => {
    if (!confirm(`Hapus catatan rilis "${title}"?`)) return;
    try {
      await api.deleteChangelogItem(id);
      toast.success('Catatan Dihapus', `Catatan "${title}" telah dihapus.`);
      const updated = await api.getChangelogs();
      setChangelogItems(updated);
      if (editingChangelogId === id) {
        handleCancelEditChangelog();
      }
    } catch (err: any) {
      toast.error('Gagal Menghapus Catatan', err.message);
    }
  };

  const handleResetChangelogs = async () => {
    if (!confirm('Kembalikan changelog ke catatan default versi 1.0.0, 1.2.0, dan 2.0.0?')) return;
    try {
      const reset = await api.resetChangelogs();
      setChangelogItems(reset);
      handleCancelEditChangelog();
      toast.info('Changelog Direset', 'Daftar rilis telah dikembalikan ke setelan default.');
    } catch (err: any) {
      toast.error('Gagal Mereset Changelog', err.message);
    }
  };


  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-indigo-500/15 border border-cyan-500/25 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-sm">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Admin & Kontrol VPS
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                Live Console
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Kelola harga paket VPS, konfigurasi kredensial UpCloud & BuatQRIS, dan pantau seluruh transaksi platform.
            </p>
          </div>
        </div>

        {/* Modern Segmented Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'plans'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Paket & Tarif</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Integrasi API</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'metrics'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Metrik Finansial</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pesanan ({orders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('changelog')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'changelog'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Changelog ({changelogItems.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Memuat data admin...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: ATUR HARGA & PAKET VPS */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      <Tag className="w-4 h-4" />
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      Daftar Paket & Tarif Cloud VPS
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                    Sesuaikan harga jual IDR per bulan, spesifikasi hardware, atau tambahkan paket baru. Perubahan langsung tersinkronisasi di webstore pelanggan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddPlanModal(true)}
                  className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Tambah Paket Baru</span>
                </button>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((p) => {
                  const isEditing = editingPlanId === p.id;
                  const currentForm = isEditing ? planForm : p;

                  return (
                    <div
                      key={p.id}
                      className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-5 relative overflow-hidden transition-all"
                    >
                      {/* Popular tag */}
                      {p.popular && (
                        <div className="absolute top-4 right-4 px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-wider">
                          Terpopuler
                        </div>
                      )}

                      {/* Plan Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 mr-2">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={currentForm.name || ''}
                                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                                className="text-lg font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-cyan-500/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 w-full"
                                placeholder="Nama Paket"
                              />
                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  type="text"
                                  value={currentForm.upcloudPlan || ''}
                                  onChange={(e) => setPlanForm({ ...planForm, upcloudPlan: e.target.value })}
                                  className="text-xs text-cyan-600 dark:text-cyan-400 font-mono bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-cyan-400 focus:outline-none w-36"
                                  placeholder="UpCloud Plan"
                                />
                                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(currentForm.popular)}
                                    onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                                    className="rounded border-slate-300 dark:border-slate-700 text-cyan-500 focus:ring-cyan-500"
                                  />
                                  <span>Badge Terpopuler</span>
                                </label>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h4 className="text-xl font-bold text-slate-900 dark:text-white">{p.name}</h4>
                              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
                                UpCloud Plan: {p.upcloudPlan}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Pricing Editor Box */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Harga Jual Per Bulan (Rupiah)
                        </span>

                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-cyan-500/50 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 px-3 py-1.5 rounded-xl w-full">
                              <span className="text-cyan-600 dark:text-cyan-400 font-bold text-sm">Rp</span>
                              <input
                                type="number"
                                value={currentForm.pricePerMonthIdr || 0}
                                onChange={(e) => setPlanForm({ ...planForm, pricePerMonthIdr: Number(e.target.value) })}
                                className="w-full text-2xl font-black text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none font-mono"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold">Rp</span>
                            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                              {p.pricePerMonthIdr.toLocaleString('id-ID')}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">/ bulan</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <div>
                            <span>Tagihan 3 Bulan (-5%): </span>
                            <strong className="text-slate-700 dark:text-slate-200 tabular-nums">
                              Rp {Math.round((currentForm.pricePerMonthIdr || 0) * 3 * 0.95).toLocaleString('id-ID')}
                            </strong>
                          </div>
                          <div>
                            <span>Tagihan 1 Tahun (-15%): </span>
                            <strong className="text-slate-700 dark:text-slate-200 tabular-nums">
                              Rp {Math.round((currentForm.pricePerMonthIdr || 0) * 12 * 0.85).toLocaleString('id-ID')}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Specs Summary / Editor */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="number"
                                min={1}
                                value={currentForm.coreNumber || 1}
                                onChange={(e) => setPlanForm({ ...planForm, coreNumber: Number(e.target.value) })}
                                className="w-14 bg-white dark:bg-slate-900 border border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 px-2 py-1 rounded-lg text-slate-900 dark:text-white font-mono text-center font-bold"
                              />
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">Core</span>
                            </div>
                          ) : (
                            <span className="font-medium">{p.coreNumber} vCPU Core</span>
                          )}
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="number"
                                min={1}
                                value={(currentForm.memoryAmountMb || 1024) / 1024}
                                onChange={(e) => setPlanForm({ ...planForm, memoryAmountMb: Number(e.target.value) * 1024 })}
                                className="w-14 bg-white dark:bg-slate-900 border border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 px-2 py-1 rounded-lg text-slate-900 dark:text-white font-mono text-center font-bold"
                              />
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">GB RAM</span>
                            </div>
                          ) : (
                            <span className="font-medium">{p.memoryAmountMb / 1024} GB RAM</span>
                          )}
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="number"
                                min={10}
                                value={currentForm.storageSizeGb || 25}
                                onChange={(e) => setPlanForm({ ...planForm, storageSizeGb: Number(e.target.value) })}
                                className="w-14 bg-white dark:bg-slate-900 border border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 px-2 py-1 rounded-lg text-slate-900 dark:text-white font-mono text-center font-bold"
                              />
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">GB SSD</span>
                            </div>
                          ) : (
                            <span className="font-medium">{p.storageSizeGb} GB MaxIOPS</span>
                          )}
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Globe2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="number"
                                min={1}
                                value={currentForm.bandwidthTb || 1}
                                onChange={(e) => setPlanForm({ ...planForm, bandwidthTb: Number(e.target.value) })}
                                className="w-14 bg-white dark:bg-slate-900 border border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 px-2 py-1 rounded-lg text-slate-900 dark:text-white font-mono text-center font-bold"
                              />
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">TB BW</span>
                            </div>
                          ) : (
                            <span className="font-medium">{p.bandwidthTb} TB Kuota</span>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                        {isEditing ? (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              type="button"
                              onClick={() => handleUpdatePlanPrice(p.id)}
                              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Simpan Perubahan</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPlanId(null)}
                              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPlanId(p.id);
                                setPlanForm(p);
                              }}
                              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Harga & Spesifikasi</span>
                            </button>

                            <HoldButton
                              size="sm"
                              radius={12}
                              holdTime={1400}
                              backgroundColor={isDark ? "#1e293b" : "#f1f5f9"}
                              fillColor="#e11d48"
                              textColor={isDark ? "#f43f5e" : "#e11d48"}
                              fillTextColor="#ffffff"
                              doneLabel="Dihapus"
                              icon={<Trash2 className="w-3.5 h-3.5" />}
                              doneIcon={<Trash2 className="w-3.5 h-3.5" />}
                              onHold={() => handleDeletePlan(p.id, p.name, true)}
                            >
                              Tahan Hapus
                            </HoldButton>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Plan Modal */}
              {showAddPlanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
                  <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8 text-slate-900 dark:text-white transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Tambah Paket Cloud VPS Baru</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Atur spesifikasi hardware dan harga jual komputasi</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddPlanModal(false)}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateNewPlan} className="space-y-5 text-xs">
                      {/* Nama Paket */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                          <span>Nama Paket Layanan</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newPlanForm.name}
                          onChange={(e) => setNewPlanForm({ ...newPlanForm, name: e.target.value })}
                          placeholder="misal: Cloud Ultra 4 Core"
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        />
                      </div>

                      {/* UpCloud Plan & Price Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Server className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                            <span>UpCloud Plan Code</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={newPlanForm.upcloudPlan}
                            onChange={(e) => setNewPlanForm({ ...newPlanForm, upcloudPlan: e.target.value })}
                            placeholder="e.g. 1xCPU-1GB"
                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-white text-sm font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                          />
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Kode paket standar API UpCloud</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                            <span>Harga Jual IDR / Bulan</span>
                          </label>
                          <div className="relative flex items-center rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all overflow-hidden">
                            <span className="px-3.5 py-3 text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-slate-100 dark:bg-slate-900/60 border-r border-slate-200 dark:border-slate-800 shrink-0">
                              Rp
                            </span>
                            <input
                              type="number"
                              required
                              value={newPlanForm.pricePerMonthIdr || ''}
                              onChange={(e) => setNewPlanForm({ ...newPlanForm, pricePerMonthIdr: Number(e.target.value) })}
                              placeholder="100000"
                              className="w-full px-3.5 py-3 bg-transparent text-slate-900 dark:text-white text-sm font-mono font-bold focus:outline-none"
                            />
                          </div>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                            Preview: Rp {(newPlanForm.pricePerMonthIdr || 0).toLocaleString('id-ID')} / bulan
                          </p>
                        </div>
                      </div>

                      {/* Popular Toggle */}
                      <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <input
                          type="checkbox"
                          checked={Boolean(newPlanForm.popular)}
                          onChange={(e) => setNewPlanForm({ ...newPlanForm, popular: e.target.checked })}
                          className="rounded border-slate-300 dark:border-slate-700 text-cyan-500 focus:ring-cyan-500"
                        />
                        <span>Tandai sebagai Paket Rekomendasi Terpopuler (Badge Popular)</span>
                      </label>

                      {/* Specs Box */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-3">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Spesifikasi Hardware Cloud
                        </span>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {/* vCPU */}
                          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all text-center">
                            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                              <Cpu className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
                              <span>vCPU</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min={1}
                                value={newPlanForm.coreNumber || 1}
                                onChange={(e) => setNewPlanForm({ ...newPlanForm, coreNumber: Math.max(1, Number(e.target.value)) })}
                                className="w-12 text-center text-sm font-bold font-mono text-slate-900 dark:text-white bg-transparent focus:outline-none"
                              />
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Core</span>
                            </div>
                          </div>

                          {/* RAM */}
                          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all text-center">
                            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                              <Activity className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                              <span>RAM</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min={0.5}
                                step={0.5}
                                value={(newPlanForm.memoryAmountMb || 1024) / 1024}
                                onChange={(e) => setNewPlanForm({ ...newPlanForm, memoryAmountMb: Math.max(0.5, Number(e.target.value)) * 1024 })}
                                className="w-12 text-center text-sm font-bold font-mono text-slate-900 dark:text-white bg-transparent focus:outline-none"
                              />
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">GB</span>
                            </div>
                          </div>

                          {/* Disk */}
                          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all text-center">
                            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                              <HardDrive className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                              <span>Disk SSD</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min={10}
                                value={newPlanForm.storageSizeGb || 25}
                                onChange={(e) => setNewPlanForm({ ...newPlanForm, storageSizeGb: Math.max(1, Number(e.target.value)) })}
                                className="w-12 text-center text-sm font-bold font-mono text-slate-900 dark:text-white bg-transparent focus:outline-none"
                              />
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">GB</span>
                            </div>
                          </div>

                          {/* Bandwidth */}
                          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all text-center">
                            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                              <Globe2 className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                              <span>Kuota BW</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min={1}
                                value={newPlanForm.bandwidthTb || 1}
                                onChange={(e) => setNewPlanForm({ ...newPlanForm, bandwidthTb: Math.max(1, Number(e.target.value)) })}
                                className="w-12 text-center text-sm font-bold font-mono text-slate-900 dark:text-white bg-transparent focus:outline-none"
                              />
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">TB</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Modal Actions */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Simpan Paket Baru</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddPlanModal(false)}
                          className="py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white font-medium text-sm transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTEGRASI API SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-8">

              {/* Admin Access & Firebase Auth Card */}
              <div className="bg-white dark:bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-6 transition-all">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Hak Akses Administrator & Firebase Auth
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Kelola daftar email yang berhak mengakses panel admin dan mengelola harga/server.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Daftar Email Administrator (Pisahkan dengan koma)
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(formSettings.adminEmails) ? formSettings.adminEmails.join(', ') : (formSettings.adminEmails || '')}
                      onChange={(e) => {
                        const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setFormSettings({ ...formSettings, adminEmails: list });
                      }}
                      placeholder="admin@domain.com, admin2@domain.com"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-purple-500 text-sm font-mono transition-all"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Pengguna yang login via Firebase dengan email di atas akan otomatis dikenali sebagai Administrator.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Batas Kuota Test VPS Gratis Harian (Limit Keamanan)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={formSettings.adminDailyTestLimit ?? 5}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setFormSettings({ ...formSettings, adminDailyTestLimit: isNaN(val) ? 5 : val });
                      }}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-purple-500 text-sm font-mono transition-all"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Maksimal jumlah deploy VPS gratis mode testing per hari untuk mencegah saldo akun UpCloud terpakai berlebih tanpa disengaja.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-slate-950 border border-purple-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <p className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Status Akun Admin Aktif:</span>
                    </p>
                    <p className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                      Login saat ini: <strong className="text-cyan-600 dark:text-cyan-400">{user?.email}</strong> ({user?.displayName || 'Admin'})
                    </p>
                  </div>
                </div>
              </div>
              
              {/* UpCloud Configuration Card with Multi-Token Failover */}
              <div className="bg-white dark:bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-6 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        UpCloud Cloud Provider API 1.3
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                          Multi-Token Failover
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Dokumentasi: <a href="https://developers.upcloud.com/api/1.3" target="_blank" rel="noreferrer" className="text-cyan-600 dark:text-cyan-400 underline">https://developers.upcloud.com/api/1.3</a>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestUpCloud}
                    disabled={upcloudTestStatus.loading}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${upcloudTestStatus.loading ? 'animate-spin' : ''}`} />
                    <span>Tes Koneksi Semua Token</span>
                  </button>
                </div>

                {/* Failover Feature Description Banner */}
                <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/20 flex items-start gap-3 text-xs text-cyan-900 dark:text-cyan-300">
                  <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-cyan-800 dark:text-cyan-200">Sistem Failover Multi-Token Berjenjang Otomatis</p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                      Token dieksekusi berurutan berdasarkan nomor urut (Prioritas #1 ➔ #2 ➔ #3). Apabila Token #1 kehabisan saldo/kredit, terkena rate-limit (HTTP 429), atau offline, sistem secara otomatis mengalihkan proses provisioning VPS pelanggan ke token berikutnya tanpa jeda.
                    </p>
                  </div>
                </div>

                {/* Test Result Alert & Multi-Token Report */}
                {upcloudTestStatus.result && (
                  <div className={`p-4 rounded-2xl text-xs border space-y-3 ${
                    upcloudTestStatus.result.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="font-bold flex items-center gap-2">
                        {upcloudTestStatus.result.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                        {upcloudTestStatus.result.message}
                      </p>
                      {upcloudTestStatus.result.activeToken && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                          Active Token: {upcloudTestStatus.result.activeToken}
                        </span>
                      )}
                    </div>

                    {/* Breakdown of individual tokens tested */}
                    {upcloudTestStatus.result.results && upcloudTestStatus.result.results.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                        {upcloudTestStatus.result.results.map((r: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                                <span className="text-cyan-600 dark:text-cyan-400">#{idx + 1}</span>
                                <span>{r.key}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                {r.maskedToken}
                              </div>
                              {r.username && (
                                <div className="text-[10px] text-slate-600 dark:text-slate-300">
                                  User: <span className="text-slate-900 dark:text-white font-medium">{r.username}</span> • Saldo: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{r.credits !== undefined ? `${r.credits}` : 'OK'}</span>
                                </div>
                              )}
                              {r.error && (
                                <div className="text-[10px] text-rose-600 dark:text-rose-400 truncate max-w-[200px]" title={r.error}>
                                  {r.error}
                                </div>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                              r.status === 'valid'
                                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                : r.status === 'rate_limited'
                                ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                            }`}>
                              {r.status === 'valid' ? 'Valid' : r.status === 'rate_limited' ? 'Rate Limit' : 'Error'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Ballmac EnvEditor Component for Multi-Token Management */}
                <EnvEditor
                  title="Environment variables (UpCloud API Tokens)"
                  description="Available to builds and at runtime in Production. Dilengkapi masked values, show/hide individual atau all, validasi duplikat, dan paste .env massal."
                  value={formSettings.upcloudApiTokens || []}
                  onChange={(items: EnvItem[]) => {
                    setFormSettings(prev => ({
                      ...prev,
                      upcloudApiTokens: items,
                      upcloudApiToken: items[0]?.value || ''
                    }));
                  }}
                  itemBadges={tokenBadges}
                  placeholderKey="UPCLOUD_API_TOKEN_PRIMARY"
                  placeholderValue="ucat_xxxxxxxxxxxxxxxxxxxxxxxx..."
                  defaultKeyPrefix="UPCLOUD_API_TOKEN"
                />
              </div>

              {/* BuatQRIS Configuration Card */}
              <div className="bg-white dark:bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-6 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        BuatQRIS Payment Gateway Open API
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Dasbor: <a href="https://app.buatqris.site/dasbort" target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 underline">https://app.buatqris.site/dasbort</a>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestBuatQris}
                    disabled={buatqrisTestStatus.loading}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${buatqrisTestStatus.loading ? 'animate-spin' : ''}`} />
                    <span>Tes Koneksi BuatQRIS</span>
                  </button>
                </div>

                {/* Test Result Alert */}
                {buatqrisTestStatus.result && (
                  <div className={`p-4 rounded-2xl text-xs border ${
                    buatqrisTestStatus.result.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
                  }`}>
                    <p className="font-bold mb-1">{buatqrisTestStatus.result.message}</p>
                    {buatqrisTestStatus.result.data && (
                      <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        Trx ID: {buatqrisTestStatus.result.data.transaction_id} • Status: {buatqrisTestStatus.result.data.status}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Account ID & Secret Token */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Account ID
                      </label>
                      <input
                        type="text"
                        value={formSettings.buatqrisAccountId || ''}
                        onChange={(e) => setFormSettings({ ...formSettings, buatqrisAccountId: e.target.value })}
                        placeholder="Ambil di dasbor -> menu Open API"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Secret Token
                      </label>
                      <div className="relative">
                        <input
                          type={showTokens.secret ? 'text' : 'password'}
                          value={formSettings.buatqrisSecretToken || ''}
                          onChange={(e) => setFormSettings({ ...formSettings, buatqrisSecretToken: e.target.value })}
                          placeholder="token_secret_xxxxxxxxxxxxxxxx"
                          className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => toggleToken('secret')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 cursor-pointer"
                          title={showTokens.secret ? 'Sembunyikan' : 'Lihat'}
                        >
                          {showTokens.secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Signing Secret */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Signing Secret (Untuk Verifikasi Webhook HMAC-SHA256)
                    </label>
                    <div className="relative">
                      <input
                        type={showTokens.signing ? 'text' : 'password'}
                        value={formSettings.buatqrisSigningSecret || ''}
                        onChange={(e) => setFormSettings({ ...formSettings, buatqrisSigningSecret: e.target.value })}
                        placeholder="Signing secret webhook dari dasbor"
                        className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => toggleToken('signing')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 cursor-pointer"
                        title={showTokens.signing ? 'Sembunyikan' : 'Lihat'}
                      >
                        {showTokens.signing ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Webhook Endpoint Display */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
                      URL Callback / Webhook untuk dimasukkan ke dasbor BuatQRIS:
                    </span>
                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-emerald-600 dark:text-emerald-400">
                      <span className="truncate">{webhookUrl}</span>
                      <button
                        type="button"
                        onClick={copyWebhookUrl}
                        className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0 flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedWebhook ? 'Tersalin' : 'Salin URL'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Settings toggles with GlideSelect */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Metode QRIS
                      </label>
                      <GlideSelect
                        options={QRIS_METHOD_OPTIONS}
                        value={formSettings.buatqrisMethod || 'qris_two'}
                        onChange={(val) => setFormSettings({ ...formSettings, buatqrisMethod: val as any })}
                        showTags
                        accentColor="#10b981"
                        surfaceColor={isDark ? '#090e17' : '#ffffff'}
                        highlightColor={isDark ? '#1e293b' : '#f1f5f9'}
                        textColor={isDark ? '#f8fafc' : '#0f172a'}
                        menuWidth={280}
                        placement="bottom"
                        size="md"
                        radius={14}
                        ariaLabel="Metode QRIS"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Beban Biaya Admin
                      </label>
                      <GlideSelect
                        options={QRIS_FEE_OPTIONS}
                        value={formSettings.buatqrisFeeBy || 'user'}
                        onChange={(val) => setFormSettings({ ...formSettings, buatqrisFeeBy: val as any })}
                        showTags
                        accentColor="#10b981"
                        surfaceColor={isDark ? '#090e17' : '#ffffff'}
                        highlightColor={isDark ? '#1e293b' : '#f1f5f9'}
                        textColor={isDark ? '#f8fafc' : '#0f172a'}
                        menuWidth={280}
                        placement="bottom"
                        size="md"
                        radius={14}
                        ariaLabel="Beban Biaya Admin"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Mode Transaksi
                      </label>
                      <GlideSelect
                        options={TRANSACTION_MODE_OPTIONS}
                        value={formSettings.isSandbox ? 'true' : 'false'}
                        onChange={(val) => setFormSettings({ ...formSettings, isSandbox: val === 'true' })}
                        showTags
                        accentColor="#10b981"
                        surfaceColor={isDark ? '#090e17' : '#ffffff'}
                        highlightColor={isDark ? '#1e293b' : '#f1f5f9'}
                        textColor={isDark ? '#f8fafc' : '#0f172a'}
                        menuWidth={280}
                        placement="bottom"
                        size="md"
                        radius={14}
                        ariaLabel="Mode Transaksi"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 dark:text-white font-bold text-base shadow-xl shadow-cyan-500/25 hover:scale-[1.005] active:scale-[0.995] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Semua Pengaturan API'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: METRICS */}
          {activeTab === 'metrics' && metrics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Total Pendapatan</span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-3 font-mono tabular-nums">
                    Rp {metrics.totalRevenueIdr.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Pembayaran QRIS lunas</p>
                </div>

                <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Server Aktif</span>
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                      <Server className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-3 tabular-nums">
                    {metrics.activeServersCount}
                  </p>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1 font-medium">Cloud VPS Running</p>
                </div>

                <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Menunggu Pembayaran</span>
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-3 tabular-nums">
                    {metrics.pendingOrdersCount}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">QRIS Pending</p>
                </div>

                <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Total Transaksi</span>
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-3 tabular-nums">
                    {metrics.totalOrders}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">Pesanan masuk</p>
                </div>
              </div>

              {/* Modern Analytics Charts (Area Growth & Plan Distribution Donut) */}
              <AdminMetricsCharts
                orders={orders}
                metrics={metrics}
                plans={plans}
                onRefresh={loadData}
              />
            </div>
          )}

          {/* TAB 4: ALL ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden transition-all">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Daftar Semua Pesanan VPS</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Riwayat transaksi dan status server pelanggan</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tabular-nums">
                  {orders.length} pesanan tercatat
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                  Belum ada pesanan yang dibuat.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                      <tr>
                        <th className="p-4">No. Order</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Paket & Lokasi</th>
                        <th className="p-4">Total IDR</th>
                        <th className="p-4">Status Bayar</th>
                        <th className="p-4">Status VPS</th>
                        <th className="p-4">IP Server</th>
                        <th className="p-4">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-mono font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">{o.orderNumber}</td>
                          <td className="p-4">
                            <p className="font-semibold text-slate-900 dark:text-white">{o.customerName}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px]">{o.customerEmail}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-slate-800 dark:text-slate-200">{o.planId}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px]">{o.zoneCode} • {o.hostname}</p>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                            Rp {o.totalAmountIdr.toLocaleString('id-ID')}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              o.paymentStatus === 'PAID'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : o.paymentStatus === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              o.vpsStatus === 'ACTIVE'
                                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                                : o.vpsStatus === 'PROVISIONING'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 animate-pulse'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {o.vpsStatus}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-cyan-600 dark:text-cyan-300">
                            {o.serverIp || '-'}
                          </td>
                          <td className="p-4 text-slate-500 dark:text-slate-400 tabular-nums">
                            {new Date(o.createdAt).toLocaleDateString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MANAJEMEN CATATAN RILIS & CHANGELOG */}
          {activeTab === 'changelog' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-all">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      <Sparkles className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        Manajemen Catatan Rilis & Changelog
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                        Kelola riwayat pembaruan sistem dan roadmap. Setiap siklus (3 fitur baru atau 2 bug fix atau 2 improvement) otomatis mengevaluasi versi di halaman Changelog publik.
                      </p>
                    </div>
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700/60">
                      Total: {changelogItems.length}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-semibold border border-cyan-500/30">
                      + Feature: {changelogItems.filter(c => c.type === 'feature').length}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold border border-blue-500/30">
                      ⚡ Improvement: {changelogItems.filter(c => c.type === 'improvement').length}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold border border-rose-500/30">
                      🐛 Bug Fix: {changelogItems.filter(c => c.type === 'fix').length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      handleCancelEditChangelog();
                      setShowChangelogForm(true);
                      const el = document.getElementById('changelog-editor-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Tambah Catatan Baru</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetChangelogs}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Reset data changelog ke setelan awal default"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editor & Form Section (Text Editor with Formatter and Live Preview) */}
              {showChangelogForm && (
                <div
                  id="changelog-editor-section"
                  className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-cyan-500/30 shadow-xl space-y-5 animate-in fade-in"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        {editingChangelogId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {editingChangelogId ? 'Edit Catatan Rilis' : 'Tambah Catatan Rilis Baru'}
                      </h4>
                    </div>

                    {editingChangelogId && (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                          Sedang Mengedit: {editingChangelogId}
                        </span>
                        <button
                          type="button"
                          onClick={handleCancelEditChangelog}
                          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          Batal Edit
                        </button>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSaveChangelog} className="space-y-4">
                    {/* Judul Catatan */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Deskripsi / Judul Update <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={changelogForm.title}
                        onChange={(e) => setChangelogForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Contoh: Multi-token UpCloud API Token Failover Manager..."
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                        required
                      />
                    </div>

                    {/* Kategori & Tanggal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Kategori */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Kategori Perubahan
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setChangelogForm(f => ({ ...f, type: 'feature' }))}
                            className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                              changelogForm.type === 'feature'
                                ? 'bg-cyan-500/15 border-cyan-500 text-cyan-700 dark:text-cyan-400 shadow-sm font-bold'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            + New Feature
                          </button>
                          <button
                            type="button"
                            onClick={() => setChangelogForm(f => ({ ...f, type: 'improvement' }))}
                            className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                              changelogForm.type === 'improvement'
                                ? 'bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm font-bold'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            ⚡ Improvement
                          </button>
                          <button
                            type="button"
                            onClick={() => setChangelogForm(f => ({ ...f, type: 'fix' }))}
                            className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                              changelogForm.type === 'fix'
                                ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-400 shadow-sm font-bold'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            🐛 Bug Fix
                          </button>
                        </div>
                      </div>

                      {/* Tanggal */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Tanggal Rilis
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={changelogForm.date}
                            onChange={(e) => setChangelogForm(f => ({ ...f, date: e.target.value }))}
                            placeholder="Contoh: April 16, 2026"
                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Markdown Editor dengan Formatter & Pratinjau Tab */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Rincian & Deskripsi Lengkap Pembaruan</span>
                        <span className="text-[11px] text-slate-400 font-normal">Dukungan format teks Markdown</span>
                      </label>
                      <ChangelogMarkdownEditor
                        value={changelogForm.description}
                        onChange={(val) => setChangelogForm(f => ({ ...f, description: val }))}
                        previewTitle={changelogForm.title}
                        previewType={changelogForm.type}
                        previewDate={changelogForm.date}
                      />
                    </div>

                    {/* Submit Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      {editingChangelogId && (
                        <button
                          type="button"
                          onClick={handleCancelEditChangelog}
                          className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Batal Edit
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={savingChangelog}
                        className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                      >
                        {savingChangelog ? 'Menyimpan...' : (editingChangelogId ? 'Simpan Perubahan Catatan' : 'Simpan & Evaluasi Versi')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* List / Table of Existing Changelog Items */}
              <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl p-6 sm:p-7 space-y-4">
                {/* Search & Filter Header */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <FileText className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Daftar Riwayat Catatan Rilis ({changelogItems.length})
                    </h4>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setChangelogCategoryFilter('all')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          changelogCategoryFilter === 'all'
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Semua
                      </button>
                      <button
                        type="button"
                        onClick={() => setChangelogCategoryFilter('feature')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          changelogCategoryFilter === 'feature'
                            ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400'
                        }`}
                      >
                        Feature
                      </button>
                      <button
                        type="button"
                        onClick={() => setChangelogCategoryFilter('improvement')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          changelogCategoryFilter === 'improvement'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                      >
                        Improvement
                      </button>
                      <button
                        type="button"
                        onClick={() => setChangelogCategoryFilter('fix')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          changelogCategoryFilter === 'fix'
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
                        }`}
                      >
                        Fix
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={changelogSearch}
                        onChange={(e) => setChangelogSearch(e.target.value)}
                        placeholder="Cari catatan..."
                        className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 w-40 sm:w-52"
                      />
                    </div>
                  </div>
                </div>

                {/* Filtered Items */}
                {(() => {
                  const filtered = changelogItems
                    .filter((item) => {
                      if (changelogCategoryFilter !== 'all' && item.type !== changelogCategoryFilter) {
                        return false;
                      }
                      if (changelogSearch.trim()) {
                        const q = changelogSearch.toLowerCase();
                        const matchTitle = item.title.toLowerCase().includes(q);
                        const matchDesc = item.description?.toLowerCase().includes(q);
                        const matchDate = item.date.toLowerCase().includes(q);
                        return matchTitle || matchDesc || matchDate;
                      }
                      return true;
                    })
                    .slice()
                    .reverse(); // Newest first

                  if (filtered.length === 0) {
                    return (
                      <div className="py-12 text-center space-y-2">
                        <FileText className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Tidak ada catatan rilis yang cocok
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Coba gunakan kata kunci lain atau ubah filter kategori.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {filtered.map((item) => {
                        const isBeingEdited = editingChangelogId === item.id;

                        return (
                          <div
                            key={item.id}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                              isBeingEdited
                                ? 'bg-cyan-50/50 dark:bg-slate-950 border-cyan-500 ring-1 ring-cyan-500/30'
                                : 'bg-slate-50/70 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                {/* Category Badge & Date */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                    item.type === 'feature'
                                      ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30'
                                      : item.type === 'improvement'
                                      ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                                  }`}>
                                    {item.type === 'feature' ? '+ Feature' : item.type === 'improvement' ? '⚡ Improvement' : '🐛 Bug Fix'}
                                  </span>

                                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                                    <Clock className="size-3" />
                                    <span>{item.date}</span>
                                  </span>

                                  <span className="text-[10px] text-slate-400 font-mono">
                                    ID: {item.id}
                                  </span>
                                </div>

                                {/* Title */}
                                <h5 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                                  {item.title}
                                </h5>

                                {/* Description (Formatted Markdown) */}
                                {item.description && (
                                  <div className="pt-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60 mt-1">
                                    <FormattedMarkdown content={item.description} />
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons: Edit & Delete */}
                              <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditChangelog(item)}
                                  className="p-2 rounded-xl text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-700 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                                  title="Edit catatan rilis ini"
                                >
                                  <Edit3 className="size-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteChangelog(item.id, item.title)}
                                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                                  title="Hapus catatan rilis ini"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
