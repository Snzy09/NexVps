import React, { useState, useEffect } from 'react';
import type { AdminMetrics, AdminSettings, Order, VpsPlan } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import GlideSelect from './GlideSelect';
import HoldButton from './HoldButton';
import { AdminMetricsCharts } from './AdminMetricsCharts';
import { EnvEditor, type EnvItem } from './ballmac/env-editor';
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
  AlertTriangle
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
  const toast = useToast();

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [, setSettings] = useState<AdminSettings | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [plans, setPlans] = useState<VpsPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'plans' | 'metrics' | 'orders'>('plans');

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
      const [m, s, ord, p] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminSettings(),
        api.getAdminOrders(),
        api.getAdminPlans()
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
        <div className="p-8 bg-slate-900/80 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/10">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
              Protected Admin Area
            </span>
            <h2 className="text-2xl font-black text-white mt-2">Halaman Khusus Administrator</h2>
            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
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
                className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
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
        <div className="p-8 bg-slate-900/80 rounded-3xl border border-rose-500/20 shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
              403 Akses Ditolak
            </span>
            <h2 className="text-2xl font-black text-white mt-2">Bukan Akun Administrator</h2>
            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
              Anda saat ini masuk sebagai <strong className="text-white font-mono">{user.email}</strong> (Akun Pelanggan Biasa). Halaman ini hanya dapat diakses oleh akun Administrator terdaftar.
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
                className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
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
      const res = await api.testUpCloud();
      setUpcloudTestStatus({ loading: false, result: res });
    } catch (err: any) {
      setUpcloudTestStatus({ loading: false, result: { success: false, message: err.message } });
    }
  };

  const handleTestBuatQris = async () => {
    setBuatqrisTestStatus({ loading: true });
    try {
      const res = await api.testBuatQris();
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Sliders className="w-7 h-7 text-cyan-400" />
            <span>Admin & Kontrol VPS</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Kelola harga paket VPS, konfigurasi kredensial UpCloud & BuatQRIS, dan pantau seluruh transaksi.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === 'plans' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Atur Harga & Paket
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === 'settings' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Integrasi API
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === 'metrics' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Metrik
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pesanan ({orders.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400 mt-2">Memuat data admin...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: ATUR HARGA & PAKET VPS */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-cyan-400" />
                    <span>Daftar Paket & Pengaturan Harga Jual</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Ubah harga jual IDR per bulan, spesifikasi, atau tambahkan paket cloud baru. Perubahan langsung aktif di webstore pelanggan.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddPlanModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Tambah Paket Baru</span>
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
                      className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5 relative overflow-hidden"
                    >
                      {/* Popular tag */}
                      {p.popular && (
                        <div className="absolute top-4 right-4 px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase">
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
                                className="text-lg font-bold text-white bg-slate-950 px-3 py-1.5 rounded-xl border border-cyan-500/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 w-full"
                                placeholder="Nama Paket"
                              />
                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  type="text"
                                  value={currentForm.upcloudPlan || ''}
                                  onChange={(e) => setPlanForm({ ...planForm, upcloudPlan: e.target.value })}
                                  className="text-xs text-cyan-400 font-mono bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-700 focus:border-cyan-400 focus:outline-none w-36"
                                  placeholder="UpCloud Plan"
                                />
                                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none px-2.5 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(currentForm.popular)}
                                    onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                                    className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                                  />
                                  <span>Badge Terpopuler</span>
                                </label>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h4 className="text-xl font-bold text-white">{p.name}</h4>
                              <p className="text-xs text-cyan-400 font-mono mt-0.5">
                                UpCloud Plan: {p.upcloudPlan}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Pricing Editor Box */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Harga Jual Per Bulan (Rupiah)
                        </span>

                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-slate-900 border border-cyan-500/50 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 px-3 py-1.5 rounded-xl w-full">
                              <span className="text-cyan-400 font-bold text-sm">Rp</span>
                              <input
                                type="number"
                                value={currentForm.pricePerMonthIdr || 0}
                                onChange={(e) => setPlanForm({ ...planForm, pricePerMonthIdr: Number(e.target.value) })}
                                className="w-full text-2xl font-black text-white bg-transparent border-0 focus:outline-none font-mono"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs text-cyan-400 font-bold">Rp</span>
                            <span className="text-3xl font-black text-white font-mono">
                              {p.pricePerMonthIdr.toLocaleString('id-ID')}
                            </span>
                            <span className="text-xs text-slate-500">/ bulan</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                          <div>
                            <span>Tagihan 3 Bulan (-5%): </span>
                            <strong className="text-slate-200">
                              Rp {Math.round((currentForm.pricePerMonthIdr || 0) * 3 * 0.95).toLocaleString('id-ID')}
                            </strong>
                          </div>
                          <div>
                            <span>Tagihan 1 Tahun (-15%): </span>
                            <strong className="text-slate-200">
                              Rp {Math.round((currentForm.pricePerMonthIdr || 0) * 12 * 0.85).toLocaleString('id-ID')}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Specs Summary / Editor */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="number"
                                min={1}
                                value={currentForm.coreNumber || 1}
                                onChange={(e) => setPlanForm({ ...planForm, coreNumber: Number(e.target.value) })}
                                className="w-14 bg-slate-900 border border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 px-2 py-1 rounded-lg text-white font-mono text-center font-bold"
                              />
                              <span className="text-[11px] text-slate-400">Core</span>
                            </div>
                          ) : (
                            <span>{p.coreNumber} vCPU Core</span>
                          )}
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="number"
                                min={1}
                                value={(currentForm.memoryAmountMb || 1024) / 1024}
                                onChange={(e) => setPlanForm({ ...planForm, memoryAmountMb: Number(e.target.value) * 1024 })}
                                className="w-14 bg-slate-900 border border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 px-2 py-1 rounded-lg text-white font-mono text-center font-bold"
                              />
                              <span className="text-[11px] text-slate-400">GB RAM</span>
                            </div>
                          ) : (
                            <span>{p.memoryAmountMb / 1024} GB RAM</span>
                          )}
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="number"
                                min={10}
                                value={currentForm.storageSizeGb || 25}
                                onChange={(e) => setPlanForm({ ...planForm, storageSizeGb: Number(e.target.value) })}
                                className="w-14 bg-slate-900 border border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 px-2 py-1 rounded-lg text-white font-mono text-center font-bold"
                              />
                              <span className="text-[11px] text-slate-400">GB SSD</span>
                            </div>
                          ) : (
                            <span>{p.storageSizeGb} GB MaxIOPS</span>
                          )}
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-2">
                          <Globe2 className="w-4 h-4 text-indigo-400 shrink-0" />
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="number"
                                min={1}
                                value={currentForm.bandwidthTb || 1}
                                onChange={(e) => setPlanForm({ ...planForm, bandwidthTb: Number(e.target.value) })}
                                className="w-14 bg-slate-900 border border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 px-2 py-1 rounded-lg text-white font-mono text-center font-bold"
                              />
                              <span className="text-[11px] text-slate-400">TB BW</span>
                            </div>
                          ) : (
                            <span>{p.bandwidthTb} TB Kuota</span>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                        {isEditing ? (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              onClick={() => handleUpdatePlanPrice(p.id)}
                              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Simpan Perubahan</span>
                            </button>
                            <button
                              onClick={() => setEditingPlanId(null)}
                              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <button
                              onClick={() => {
                                setEditingPlanId(p.id);
                                setPlanForm(p);
                              }}
                              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Harga & Spesifikasi</span>
                            </button>

                            <HoldButton
                              size="sm"
                              radius={12}
                              holdTime={1400}
                              backgroundColor="#1e293b"
                              fillColor="#e11d48"
                              textColor="#f43f5e"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                  <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">Tambah Paket Cloud VPS Baru</h4>
                          <p className="text-xs text-slate-400">Atur spesifikasi hardware dan harga jual komputasi</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddPlanModal(false)}
                        className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateNewPlan} className="space-y-5 text-xs">
                      {/* Nama Paket */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Nama Paket Layanan</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newPlanForm.name}
                          onChange={(e) => setNewPlanForm({ ...newPlanForm, name: e.target.value })}
                          placeholder="misal: Cloud Ultra 4 Core"
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        />
                      </div>

                      {/* UpCloud Plan & Price Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <Server className="w-3.5 h-3.5 text-blue-400" />
                            <span>UpCloud Plan Code</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={newPlanForm.upcloudPlan}
                            onChange={(e) => setNewPlanForm({ ...newPlanForm, upcloudPlan: e.target.value })}
                            placeholder="e.g. 1xCPU-1GB"
                            className="w-full px-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-white text-sm font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                          />
                          <p className="text-[11px] text-slate-500">Kode paket standar API UpCloud</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Harga Jual IDR / Bulan</span>
                          </label>
                          <div className="relative flex items-center rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all overflow-hidden">
                            <span className="px-3.5 py-3 text-xs font-bold text-cyan-400 bg-slate-900/60 border-r border-slate-800 shrink-0">
                              Rp
                            </span>
                            <input
                              type="number"
                              required
                              value={newPlanForm.pricePerMonthIdr || ''}
                              onChange={(e) => setNewPlanForm({ ...newPlanForm, pricePerMonthIdr: Number(e.target.value) })}
                              placeholder="100000"
                              className="w-full px-3.5 py-3 bg-transparent text-white text-sm font-mono font-bold focus:outline-none"
                            />
                          </div>
                          <p className="text-[11px] text-emerald-400 font-mono">
                            Preview: Rp {(newPlanForm.pricePerMonthIdr || 0).toLocaleString('id-ID')} / bulan
                          </p>
                        </div>
                      </div>

                      {/* Popular Toggle */}
                      <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all">
                        <input
                          type="checkbox"
                          checked={Boolean(newPlanForm.popular)}
                          onChange={(e) => setNewPlanForm({ ...newPlanForm, popular: e.target.checked })}
                          className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                        />
                        <span>Tandai sebagai Paket Rekomendasi Terpopuler (Badge Popular)</span>
                      </label>

                      {/* Specs Box */}
                      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Spesifikasi Hardware Cloud
                        </span>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {/* vCPU */}
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all text-center">
                            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
                              <Cpu className="w-3 h-3 text-cyan-400" />
                              <span>vCPU</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min={1}
                                value={newPlanForm.coreNumber || 1}
                                onChange={(e) => setNewPlanForm({ ...newPlanForm, coreNumber: Math.max(1, Number(e.target.value)) })}
                                className="w-12 text-center text-sm font-bold font-mono text-white bg-transparent focus:outline-none"
                              />
                              <span className="text-[11px] text-slate-500 font-medium">Core</span>
                            </div>
                          </div>

                          {/* RAM */}
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all text-center">
                            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
                              <Activity className="w-3 h-3 text-blue-400" />
                              <span>RAM</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min={0.5}
                                step={0.5}
                                value={(newPlanForm.memoryAmountMb || 1024) / 1024}
                                onChange={(e) => setNewPlanForm({ ...newPlanForm, memoryAmountMb: Math.max(0.5, Number(e.target.value)) * 1024 })}
                                className="w-12 text-center text-sm font-bold font-mono text-white bg-transparent focus:outline-none"
                              />
                              <span className="text-[11px] text-slate-500 font-medium">GB</span>
                            </div>
                          </div>

                          {/* Disk */}
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all text-center">
                            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
                              <HardDrive className="w-3 h-3 text-emerald-400" />
                              <span>Disk SSD</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min={10}
                                value={newPlanForm.storageSizeGb || 25}
                                onChange={(e) => setNewPlanForm({ ...newPlanForm, storageSizeGb: Math.max(1, Number(e.target.value)) })}
                                className="w-12 text-center text-sm font-bold font-mono text-white bg-transparent focus:outline-none"
                              />
                              <span className="text-[11px] text-slate-500 font-medium">GB</span>
                            </div>
                          </div>

                          {/* Bandwidth */}
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all text-center">
                            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
                              <Globe2 className="w-3 h-3 text-indigo-400" />
                              <span>Kuota BW</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min={1}
                                value={newPlanForm.bandwidthTb || 1}
                                onChange={(e) => setNewPlanForm({ ...newPlanForm, bandwidthTb: Math.max(1, Number(e.target.value)) })}
                                className="w-12 text-center text-sm font-bold font-mono text-white bg-transparent focus:outline-none"
                              />
                              <span className="text-[11px] text-slate-500 font-medium">TB</span>
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
                          className="py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-sm transition-colors cursor-pointer"
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
              <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Hak Akses Administrator & Firebase Auth
                    </h3>
                    <p className="text-xs text-slate-400">
                      Kelola daftar email yang berhak mengakses panel admin dan mengelola harga/server.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
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
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Pengguna yang login via Firebase dengan email di atas akan otomatis dikenali sebagai Administrator.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Status Akun Admin Aktif:</span>
                    </p>
                    <p className="text-[11px] font-mono text-slate-300">
                      Login saat ini: <strong className="text-cyan-400">{user?.email}</strong> ({user?.displayName || 'Admin'})
                    </p>
                  </div>
                </div>
              </div>
              
              {/* UpCloud Configuration Card with Multi-Token Failover */}
              <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        UpCloud Cloud Provider API 1.3
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Multi-Token Failover
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Dokumentasi: <a href="https://developers.upcloud.com/api/1.3" target="_blank" rel="noreferrer" className="text-cyan-400 underline">https://developers.upcloud.com/api/1.3</a>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestUpCloud}
                    disabled={upcloudTestStatus.loading}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${upcloudTestStatus.loading ? 'animate-spin' : ''}`} />
                    <span>Tes Koneksi Semua Token</span>
                  </button>
                </div>

                {/* Failover Feature Description Banner */}
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-3 text-xs text-cyan-300">
                  <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-cyan-200">Sistem Failover Multi-Token Berjenjang Otomatis</p>
                    <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                      Token dieksekusi berurutan berdasarkan nomor urut (Prioritas #1 ➔ #2 ➔ #3). Apabila Token #1 kehabisan saldo/kredit, terkena rate-limit (HTTP 429), atau offline, sistem secara otomatis mengalihkan proses provisioning VPS pelanggan ke token berikutnya tanpa jeda.
                    </p>
                  </div>
                </div>

                {/* Test Result Alert & Multi-Token Report */}
                {upcloudTestStatus.result && (
                  <div className={`p-4 rounded-2xl text-xs border space-y-3 ${
                    upcloudTestStatus.result.success
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="font-bold flex items-center gap-2">
                        {upcloudTestStatus.result.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                        {upcloudTestStatus.result.message}
                      </p>
                      {upcloudTestStatus.result.activeToken && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                          Active Token: {upcloudTestStatus.result.activeToken}
                        </span>
                      )}
                    </div>

                    {/* Breakdown of individual tokens tested */}
                    {upcloudTestStatus.result.results && upcloudTestStatus.result.results.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                        {upcloudTestStatus.result.results.map((r: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px]"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-200">
                                <span className="text-cyan-400">#{idx + 1}</span>
                                <span>{r.key}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {r.maskedToken}
                              </div>
                              {r.username && (
                                <div className="text-[10px] text-slate-300">
                                  User: <span className="text-white font-medium">{r.username}</span> • Saldo: <span className="text-emerald-400 font-semibold">{r.credits !== undefined ? `${r.credits}` : 'OK'}</span>
                                </div>
                              )}
                              {r.error && (
                                <div className="text-[10px] text-rose-400 truncate max-w-[200px]" title={r.error}>
                                  {r.error}
                                </div>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                              r.status === 'valid'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : r.status === 'rate_limited'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
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
              <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        BuatQRIS Payment Gateway Open API
                      </h3>
                      <p className="text-xs text-slate-400">
                        Dasbor: <a href="https://app.buatqris.site/dasbort" target="_blank" rel="noreferrer" className="text-emerald-400 underline">https://app.buatqris.site/dasbort</a>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestBuatQris}
                    disabled={buatqrisTestStatus.loading}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${buatqrisTestStatus.loading ? 'animate-spin' : ''}`} />
                    <span>Tes Koneksi BuatQRIS</span>
                  </button>
                </div>

                {/* Test Result Alert */}
                {buatqrisTestStatus.result && (
                  <div className={`p-4 rounded-2xl text-xs border ${
                    buatqrisTestStatus.result.success
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                  }`}>
                    <p className="font-bold mb-1">{buatqrisTestStatus.result.message}</p>
                    {buatqrisTestStatus.result.data && (
                      <p className="font-mono text-[11px] text-slate-400">
                        Trx ID: {buatqrisTestStatus.result.data.transaction_id} • Status: {buatqrisTestStatus.result.data.status}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Account ID & Secret Token */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Account ID
                      </label>
                      <input
                        type="text"
                        value={formSettings.buatqrisAccountId || ''}
                        onChange={(e) => setFormSettings({ ...formSettings, buatqrisAccountId: e.target.value })}
                        placeholder="Ambil di dasbor -> menu Open API"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Secret Token
                      </label>
                      <div className="relative">
                        <input
                          type={showTokens.secret ? 'text' : 'password'}
                          value={formSettings.buatqrisSecretToken || ''}
                          onChange={(e) => setFormSettings({ ...formSettings, buatqrisSecretToken: e.target.value })}
                          placeholder="token_secret_xxxxxxxxxxxxxxxx"
                          className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => toggleToken('secret')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 cursor-pointer"
                          title={showTokens.secret ? 'Sembunyikan' : 'Lihat'}
                        >
                          {showTokens.secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Signing Secret */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Signing Secret (Untuk Verifikasi Webhook HMAC-SHA256)
                    </label>
                    <div className="relative">
                      <input
                        type={showTokens.signing ? 'text' : 'password'}
                        value={formSettings.buatqrisSigningSecret || ''}
                        onChange={(e) => setFormSettings({ ...formSettings, buatqrisSigningSecret: e.target.value })}
                        placeholder="Signing secret webhook dari dasbor"
                        className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => toggleToken('signing')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 cursor-pointer"
                        title={showTokens.signing ? 'Sembunyikan' : 'Lihat'}
                      >
                        {showTokens.signing ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Webhook Endpoint Display */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-[11px] text-slate-400 font-semibold block">
                      URL Callback / Webhook untuk dimasukkan ke dasbor BuatQRIS:
                    </span>
                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400">
                      <span className="truncate">{webhookUrl}</span>
                      <button
                        type="button"
                        onClick={copyWebhookUrl}
                        className="text-slate-400 hover:text-white shrink-0 flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedWebhook ? 'Tersalin' : 'Salin URL'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Settings toggles with GlideSelect */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Metode QRIS
                      </label>
                      <GlideSelect
                        options={QRIS_METHOD_OPTIONS}
                        value={formSettings.buatqrisMethod || 'qris_two'}
                        onChange={(val) => setFormSettings({ ...formSettings, buatqrisMethod: val as any })}
                        showTags
                        accentColor="#10b981"
                        surfaceColor="#090e17"
                        highlightColor="#1e293b"
                        textColor="#f8fafc"
                        menuWidth={280}
                        placement="bottom"
                        size="md"
                        radius={14}
                        ariaLabel="Metode QRIS"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Beban Biaya Admin
                      </label>
                      <GlideSelect
                        options={QRIS_FEE_OPTIONS}
                        value={formSettings.buatqrisFeeBy || 'user'}
                        onChange={(val) => setFormSettings({ ...formSettings, buatqrisFeeBy: val as any })}
                        showTags
                        accentColor="#10b981"
                        surfaceColor="#090e17"
                        highlightColor="#1e293b"
                        textColor="#f8fafc"
                        menuWidth={280}
                        placement="bottom"
                        size="md"
                        radius={14}
                        ariaLabel="Beban Biaya Admin"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Mode Transaksi
                      </label>
                      <GlideSelect
                        options={TRANSACTION_MODE_OPTIONS}
                        value={formSettings.isSandbox ? 'true' : 'false'}
                        onChange={(val) => setFormSettings({ ...formSettings, isSandbox: val === 'true' })}
                        showTags
                        accentColor="#10b981"
                        surfaceColor="#090e17"
                        highlightColor="#1e293b"
                        textColor="#f8fafc"
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
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base shadow-xl shadow-cyan-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Total Pendapatan</span>
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-3xl font-black text-white mt-3 font-mono">
                    Rp {metrics.totalRevenueIdr.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">Pembayaran QRIS lunas</p>
                </div>

                <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Server Aktif</span>
                    <Server className="w-5 h-5 text-cyan-400" />
                  </div>
                  <p className="text-3xl font-black text-white mt-3">
                    {metrics.activeServersCount}
                  </p>
                  <p className="text-xs text-cyan-400 mt-1">Cloud VPS Running</p>
                </div>

                <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Menunggu Pembayaran</span>
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-3xl font-black text-white mt-3">
                    {metrics.pendingOrdersCount}
                  </p>
                  <p className="text-xs text-amber-400 mt-1">QRIS Pending</p>
                </div>

                <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Total Transaksi</span>
                    <ShoppingBag className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-3xl font-black text-white mt-3">
                    {metrics.totalOrders}
                  </p>
                  <p className="text-xs text-blue-400 mt-1">Pesanan masuk</p>
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
            <div className="bg-slate-900/80 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-white text-base">Daftar Semua Pesanan VPS</h3>
                <span className="text-xs text-slate-400">{orders.length} pesanan tercatat</span>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm">
                  Belum ada pesanan yang dibuat.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
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
                    <tbody className="divide-y divide-slate-800">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-800/30">
                          <td className="p-4 font-mono font-bold text-cyan-400">{o.orderNumber}</td>
                          <td className="p-4">
                            <p className="font-semibold text-white">{o.customerName}</p>
                            <p className="text-slate-500 text-[11px]">{o.customerEmail}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-slate-200">{o.planId}</p>
                            <p className="text-slate-500 text-[11px]">{o.zoneCode} • {o.hostname}</p>
                          </td>
                          <td className="p-4 font-mono font-bold text-white">
                            Rp {o.totalAmountIdr.toLocaleString('id-ID')}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              o.paymentStatus === 'PAID'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : o.paymentStatus === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              o.vpsStatus === 'ACTIVE'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : o.vpsStatus === 'PROVISIONING'
                                ? 'bg-blue-500/10 text-blue-400 animate-pulse'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {o.vpsStatus}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-cyan-300">
                            {o.serverIp || '-'}
                          </td>
                          <td className="p-4 text-slate-500">
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
        </>
      )}
    </div>
  );
};
