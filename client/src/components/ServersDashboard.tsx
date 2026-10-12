import React, { useState, useEffect, useRef } from 'react';
import type { Order } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Server, 
  Terminal, 
  Play, 
  RotateCw, 
  Copy, 
  Check, 
  Search, 
  RefreshCw, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Power,
  Activity,
  Trash2,
  Unplug
} from 'lucide-react';
import { OsIcon } from './OsIcon';
import { ServerStatsCards } from './ServerStatsCards';
import { ServerDetailView } from './ServerDetailView';
import { ServerTableSkeleton } from './PageSkeletonLoader';
import { TimelineCollapsible } from './TimelineCollapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from './ui/alert-dialog';

export const getDistroFromTemplateName = (name?: string): string => {
  if (!name) return 'linux';
  const lower = name.toLowerCase();
  if (lower.includes('ubuntu')) return 'ubuntu';
  if (lower.includes('debian')) return 'debian';
  if (lower.includes('alma')) return 'almalinux';
  if (lower.includes('rocky')) return 'rocky';
  if (lower.includes('centos')) return 'centos';
  if (lower.includes('fedora')) return 'fedora';
  if (lower.includes('windows')) return 'windows';
  return 'linux';
};

interface ServersDashboardProps {
  onOrderNew: () => void;
  onOpenAuth?: () => void;
}

export const ServersDashboard: React.FC<ServersDashboardProps> = ({ onOrderNew, onOpenAuth }) => {
  const { user, isAdmin } = useAuth();
  const { success, error: toastError } = useToast();
  const [servers, setServers] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingAll, setSyncingAll] = useState<boolean>(false);
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'stopped' | 'building' | 'error'>('all');
  const [actionLoading, setActionLoading] = useState<{ [uuid: string]: string }>({});
  const [actionMessage, setActionMessage] = useState<{ [uuid: string]: { text: string; type: 'success' | 'error' } }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedServerDetail, setSelectedServerDetail] = useState<Order | null>(null);
  const [showTelemetryPipeline, setShowTelemetryPipeline] = useState<boolean>(false);
  const [pendingDialog, setPendingDialog] = useState<{
    uuid: string;
    action: 'start' | 'stop' | 'force_stop' | 'restart' | 'sync' | 'delete';
    hostname?: string;
  } | null>(null);

  // Sorting state (Image 1)
  const [sortField, setSortField] = useState<'name' | 'cpu' | 'storage' | 'memory' | 'location'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Checkbox selection state (Image 1)
  const [selectedServerIds, setSelectedServerIds] = useState<string[]>([]);

  // Pagination & Page Size
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageSizeDropdownOpen, setPageSizeDropdownOpen] = useState<boolean>(false);

  // Poll timer reference
  const pollTimerRef = useRef<any>(null);

  const fetchServers = async (silent = false, forceSync = false) => {
    if (!user) {
      setLoading(false);
      setServers([]);
      return;
    }
    if (!silent) setLoading(true);
    if (forceSync) setSyncingAll(true);

    try {
      const emailFilter = (!isAdmin && user) ? user.email : undefined;
      const data = await api.getServers(emailFilter, user?.uid, forceSync);
      setServers(data);

      // If detail view is open, keep its data updated using functional state
      setSelectedServerDetail(prev => {
        if (!prev) return null;
        return data.find(s => s.id === prev.id) || prev;
      });
    } catch (err: any) {
      console.error('Error fetching servers:', err);
    } finally {
      if (!silent) setLoading(false);
      if (forceSync) setSyncingAll(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchServers(false, false);
  }, [user, isAdmin]);

  // Real-time background auto-sync polling
  useEffect(() => {
    if (!user || !autoSync) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    const hasPendingServer = servers.some(
      s => s.vpsStatus === 'PROVISIONING' || s.serverState === 'maintenance' || (s.serverUuid && actionLoading[s.serverUuid])
    );
    const intervalMs = hasPendingServer ? 4000 : 8000;

    pollTimerRef.current = setInterval(() => {
      fetchServers(true, hasPendingServer);
    }, intervalMs);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [user, autoSync, servers, actionLoading]);

  // Execute Power Action (Start, Stop, Force Stop, Restart, Sync, Delete)
  const handleAction = async (
    uuid: string, 
    action: 'start' | 'stop' | 'force_stop' | 'restart' | 'sync' | 'delete', 
    confirmed: boolean = false
  ) => {
    if (!confirmed) {
      if (action === 'stop' || action === 'force_stop' || action === 'restart' || action === 'delete') {
        const targetServer = servers.find(s => s.serverUuid === uuid);
        setPendingDialog({
          uuid,
          action,
          hostname: targetServer?.hostname || 'Server VPS'
        });
        return;
      }
    }

    setActionLoading(prev => ({ ...prev, [uuid]: action }));
    setActionMessage(prev => {
      const next = { ...prev };
      delete next[uuid];
      return next;
    });

    try {
      const res = await api.executeServerAction(uuid, action);
      setActionMessage(prev => ({
        ...prev,
        [uuid]: { text: res.message || `Aksi ${action} berhasil.`, type: 'success' }
      }));

      const actionTitle = 
        action === 'restart' ? 'Server Berhasil Direboot' :
        action === 'start' ? 'Server Berhasil Dinyalakan' :
        action === 'force_stop' ? 'Server Dipaksa Berhenti (Force Shutdown)' :
        action === 'delete' ? 'Server Berhasil Dihapus' :
        action === 'sync' ? 'Status Server Disinkronisasi' :
        'Server Berhasil Dimatikan';

      success(actionTitle, res.message || `Perintah ${action} berhasil diproses.`);

      if (action === 'delete') {
        if (selectedServerDetail?.serverUuid === uuid) {
          setSelectedServerDetail(null);
        }
      }

      await fetchServers(true, true);
    } catch (err: any) {
      setActionMessage(prev => ({
        ...prev,
        [uuid]: { text: `Gagal: ${err.message}`, type: 'error' }
      }));
      toastError('Gagal Mengeksekusi Aksi', err.message);
    } finally {
      setActionLoading(prev => {
        const next = { ...prev };
        delete next[uuid];
        return next;
      });
      setTimeout(() => {
        setActionMessage(prev => {
          const next = { ...prev };
          delete next[uuid];
          return next;
        });
      }, 4000);
    }
  };

  const copyText = (text: string, id: string, label: string = 'Data') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      }
    } catch {}
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
    success(
      `${label} Berhasil Disalin`,
      text.length > 36 ? `${text.substring(0, 36)}...` : text
    );
  };

  // Filter servers
  const filteredServers = servers.filter(s => {
    const isRunning = s.serverState === 'started';
    const isStopped = s.serverState === 'stopped';
    const isBuilding = s.vpsStatus === 'PROVISIONING' || s.serverState === 'maintenance';
    const isError = s.vpsStatus === 'ERROR';

    if (statusFilter === 'running' && !isRunning) return false;
    if (statusFilter === 'stopped' && !isStopped) return false;
    if (statusFilter === 'building' && !isBuilding) return false;
    if (statusFilter === 'error' && !isError) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.hostname.toLowerCase().includes(q) ||
      (s.serverIp && s.serverIp.toLowerCase().includes(q)) ||
      s.orderNumber.toLowerCase().includes(q) ||
      (s.customerEmail && s.customerEmail.toLowerCase().includes(q)) ||
      (s.planName && s.planName.toLowerCase().includes(q)) ||
      (s.zoneName && s.zoneName.toLowerCase().includes(q))
    );
  });

  // Sort servers
  const sortedServers = [...filteredServers].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'name') {
      comparison = a.hostname.localeCompare(b.hostname);
    } else if (sortField === 'cpu') {
      comparison = (a.coreNumber || 2) - (b.coreNumber || 2);
    } else if (sortField === 'storage') {
      comparison = (a.storageSizeGb || 50) - (b.storageSizeGb || 50);
    } else if (sortField === 'memory') {
      comparison = (a.memoryAmountMb || 2048) - (b.memoryAmountMb || 2048);
    } else if (sortField === 'location') {
      comparison = (a.zoneCode || '').localeCompare(b.zoneCode || '');
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const displayedServers = sortedServers.slice(0, pageSize);

  const handleToggleSort = (field: 'name' | 'cpu' | 'storage' | 'memory' | 'location') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const allCurrentSelected = displayedServers.length > 0 && displayedServers.every(s => selectedServerIds.includes(s.id));

  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedServerIds([]);
    } else {
      setSelectedServerIds(displayedServers.map(s => s.id));
    }
  };

  const toggleSelectServer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedServerIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const countRunning = servers.filter(s => s.serverState === 'started').length;
  const countStopped = servers.filter(s => s.serverState === 'stopped').length;
  const countBuilding = servers.filter(s => s.vpsStatus === 'PROVISIONING' || s.serverState === 'maintenance').length;
  const countError = servers.filter(s => s.vpsStatus === 'ERROR').length;

  // Unauthenticated screen
  if (!user) {
    return (
      <div className="py-20 text-center bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-4 max-w-md mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
          <Terminal className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Silakan Masuk Terlebih Dahulu</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Anda perlu login ke akun Anda untuk melihat dan mengontrol server Cloud VPS milik Anda.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all cursor-pointer"
        >
          Masuk ke Akun Saya
        </button>
      </div>
    );
  }

  // If a server is selected, render the dedicated Server Detail View
  if (selectedServerDetail) {
    return (
      <ServerDetailView
        server={selectedServerDetail}
        onBack={() => setSelectedServerDetail(null)}
        onAction={handleAction}
        actionLoading={actionLoading}
        actionMessage={actionMessage}
        onRefresh={() => fetchServers(true, true)}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header & Global Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
                <span>Dashboard Server Cloud</span>
                {isAdmin && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold">
                    Admin View
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Kelola instans UpCloud MaxIOPS: monitor status daya, kontrol start/stop, dan detail SSH real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setAutoSync(!autoSync)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              autoSync 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={autoSync ? 'Auto-sync aktif setiap 8 detik' : 'Auto-sync dinonaktifkan'}
          >
            <span className="relative flex h-2 w-2">
              {autoSync && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${autoSync ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
            </span>
            <span>{autoSync ? 'Realtime Sync: ON' : 'Realtime Sync: OFF'}</span>
          </button>

          <button
            onClick={() => fetchServers(false, true)}
            disabled={syncingAll || loading}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Sinkronisasi status terbaru langsung dari UpCloud API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{syncingAll ? 'Menyinkron...' : 'Sync UpCloud'}</span>
          </button>

          <button
            onClick={() => setShowTelemetryPipeline(!showTelemetryPipeline)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              showTelemetryPipeline
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-500 dark:text-blue-400'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Lihat alur pipeline telemetry dan live ingestion"
          >
            <Activity className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
            <span>{showTelemetryPipeline ? 'Tutup Telemetri' : 'Live Telemetri'}</span>
          </button>

          <button
            onClick={onOrderNew}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Beli VPS Baru</span>
          </button>
        </div>
      </div>

      {/* Cloud Server Analytics & Performance Stats */}
      <ServerStatsCards servers={servers} />

      {/* Realtime Telemetry Pipeline Timeline */}
      {showTelemetryPipeline && (
        <div className="animate-in fade-in duration-300 flex justify-center py-2">
          <TimelineCollapsible className="shadow-2xl" />
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto shadow-sm">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white font-bold shadow'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Semua ({servers.length})
          </button>
          <button
            onClick={() => setStatusFilter('running')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'running'
                ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold border border-emerald-500/30'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
            <span>Running ({countRunning})</span>
          </button>
          <button
            onClick={() => setStatusFilter('stopped')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'stopped'
                ? 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 font-bold border border-rose-500/30'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400"></span>
            <span>Stopped ({countStopped})</span>
          </button>
          {countBuilding > 0 && (
            <button
              onClick={() => setStatusFilter('building')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'building'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Building ({countBuilding})</span>
            </button>
          )}
          {countError > 0 && (
            <button
              onClick={() => setStatusFilter('error')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'error'
                  ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Error ({countError})</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari hostname, IP, order ID..."
            className="w-full sm:w-80 pl-9 pr-8 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <ServerTableSkeleton />
      ) : filteredServers.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-5 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
            <Server className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white">
              {servers.length === 0 ? 'Belum Ada Server Aktif' : 'Tidak Ada Server yang Cocok'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {servers.length === 0 
                ? 'Anda belum memiliki server VPS yang aktif. Pesan instans baru dengan aktivasi instan otomatis sekarang!' 
                : 'Tidak ada server yang memenuhi filter pencarian saat ini.'}
            </p>
          </div>
          {servers.length === 0 ? (
            <button
              onClick={onOrderNew}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all cursor-pointer"
            >
              Pesan Cloud VPS Sekarang
            </button>
          ) : (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        /* ========================================================
            REDESIGNED SERVER LIST TABLE (Image 1 Style)
            ======================================================== */
        <div className="space-y-3">
          {/* Table Header Row (Image 1) */}
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 text-xs font-bold text-slate-400">
            {/* Checkbox Header */}
            <div className="shrink-0 flex items-center pr-1">
              <input
                type="checkbox"
                checked={allCurrentSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#7000FF] focus:ring-[#7000FF] cursor-pointer"
              />
            </div>

            {/* Column 1: NAME */}
            <div className="flex-1 min-w-[220px]">
              <button
                onClick={() => handleToggleSort('name')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span>NAME</span>
                {sortField === 'name' ? (
                  sortDirection === 'asc' ? (
                    <span className="text-[#7000FF] font-black text-sm">▲</span>
                  ) : (
                    <span className="text-[#7000FF] font-black text-sm">▼</span>
                  )
                ) : (
                  <span className="text-slate-600 text-xs">▼</span>
                )}
              </button>
            </div>

            {/* Column 2: CPU */}
            <div className="w-24 text-left hidden sm:block">
              <button
                onClick={() => handleToggleSort('cpu')}
                className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span>CPU</span>
                <span className={`text-xs ${sortField === 'cpu' ? 'text-[#7000FF]' : 'text-slate-600'}`}>▼</span>
              </button>
            </div>

            {/* Column 3: STORAGE */}
            <div className="w-24 text-left hidden md:block">
              <button
                onClick={() => handleToggleSort('storage')}
                className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span>STORAGE</span>
                <span className={`text-xs ${sortField === 'storage' ? 'text-[#7000FF]' : 'text-slate-600'}`}>▼</span>
              </button>
            </div>

            {/* Column 4: MEMORY */}
            <div className="w-24 text-left hidden md:block">
              <button
                onClick={() => handleToggleSort('memory')}
                className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span>MEMORY</span>
                <span className={`text-xs ${sortField === 'memory' ? 'text-[#7000FF]' : 'text-slate-600'}`}>▼</span>
              </button>
            </div>

            {/* Column 5: LOCATION */}
            <div className="w-28 text-left hidden sm:block">
              <button
                onClick={() => handleToggleSort('location')}
                className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span>LOCATION</span>
                <span className={`text-xs ${sortField === 'location' ? 'text-[#7000FF]' : 'text-slate-600'}`}>▼</span>
              </button>
            </div>

            {/* Column 6: Empty spacer for Right Arrow */}
            <div className="w-6 shrink-0" />
          </div>

          {/* Table Rows (Image 1 Cards) */}
          <div className="space-y-2.5">
            {displayedServers.map((server) => {
              const isOnline = server.serverState === 'started';
              const isStopped = server.serverState === 'stopped';
              const isBuilding = server.vpsStatus === 'PROVISIONING' || server.serverState === 'maintenance';
              const isError = server.vpsStatus === 'ERROR';
              const isSelected = selectedServerIds.includes(server.id);

              return (
                <div
                  key={server.id}
                  onClick={() => setSelectedServerDetail(server)}
                  className={`group relative flex items-center justify-between gap-4 px-4 sm:px-6 py-4 rounded-xl border transition-all cursor-pointer shadow-md ${
                    isSelected 
                      ? 'bg-slate-900 border-[#7000FF]/50 ring-1 ring-[#7000FF]/30' 
                      : 'bg-slate-900/70 border-slate-800/90 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  {/* Checkbox */}
                  <div onClick={(e) => toggleSelectServer(server.id, e)} className="shrink-0 flex items-center pr-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-[#7000FF] focus:ring-[#7000FF] cursor-pointer"
                    />
                  </div>

                  {/* Column 1: NAME (Green dot, Hostname, OS Icon + Distro Name, IP + Copy button) */}
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' :
                        isStopped ? 'bg-rose-500' :
                        isBuilding ? 'bg-amber-400 animate-pulse' :
                        isError ? 'bg-rose-600' : 'bg-slate-600'
                      }`} />
                      <span className="font-bold text-white text-sm sm:text-base tracking-tight group-hover:text-cyan-400 transition-colors">
                        {server.hostname}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <OsIcon distro={getDistroFromTemplateName(server.templateName)} size="xs" />
                        <span className="text-slate-300 font-medium">
                          {server.templateName ? server.templateName.split('(')[0].trim() : 'Ubuntu Server 24.04 LTS'}
                        </span>
                      </div>

                      {server.serverIp && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            copyText(server.serverIp!, `ip-${server.id}`, 'Alamat IP');
                          }}
                          className="flex items-center gap-1.5 text-slate-400 hover:text-white cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-slate-800 transition-colors font-mono"
                          title="Salin Alamat IP"
                        >
                          <span>IP {server.serverIp}</span>
                          {copiedKey === `ip-${server.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-[#7000FF]" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: CPU */}
                  <div className="w-24 text-left hidden sm:block">
                    <span className="text-xs sm:text-sm font-semibold text-slate-200">
                      {server.coreNumber || 2} cores
                    </span>
                  </div>

                  {/* Column 3: STORAGE */}
                  <div className="w-24 text-left hidden md:block">
                    <span className="text-xs sm:text-sm font-semibold text-slate-200">
                      {server.storageSizeGb || 50} GB
                    </span>
                  </div>

                  {/* Column 4: MEMORY */}
                  <div className="w-24 text-left hidden md:block">
                    <span className="text-xs sm:text-sm font-semibold text-slate-200">
                      {Math.round((server.memoryAmountMb || 2048) / 1024)} GB
                    </span>
                  </div>

                  {/* Column 5: LOCATION */}
                  <div className="w-28 text-left hidden sm:block">
                    <span className="text-xs sm:text-sm font-semibold text-slate-200 uppercase font-mono">
                      {server.zoneCode?.toUpperCase() || 'SG-SIN1'}
                    </span>
                  </div>

                  {/* Column 6: Action Chevron Right */}
                  <div className="shrink-0 flex items-center pr-1">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Footer: Server Count & Page Size Selector */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 px-2">
            <div>
              <span className="font-semibold text-slate-300">{filteredServers.length} servers</span>
            </div>

            {/* 10 per page Selector */}
            <div className="relative">
              <button
                onClick={() => setPageSizeDropdownOpen(!pageSizeDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                <span>{pageSize} per page</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {pageSizeDropdownOpen && (
                <div className="absolute right-0 bottom-full mb-1 w-32 rounded-xl bg-slate-900 border border-slate-700 shadow-xl p-1 z-30 animate-in fade-in">
                  {[5, 10, 20, 50].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setPageSize(size);
                        setPageSizeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        pageSize === size ? 'bg-[#7000FF] text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {size} per page
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SHADCN / UIABLE ALERT DIALOG - VPS CONTROL ACTIONS
          ======================================================== */}
      {pendingDialog && (
        <AlertDialog open={Boolean(pendingDialog)} onOpenChange={(open) => !open && setPendingDialog(null)}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia
                className={
                  pendingDialog.action === 'delete' || pendingDialog.action === 'force_stop'
                    ? 'bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-500'
                    : pendingDialog.action === 'stop'
                    ? 'bg-purple-500/10 text-purple-400 dark:bg-purple-500/20 dark:text-purple-400'
                    : 'bg-cyan-500/10 text-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-400'
                }
              >
                {pendingDialog.action === 'delete' ? (
                  <Trash2 className="size-5" />
                ) : pendingDialog.action === 'force_stop' ? (
                  <Unplug className="size-5" />
                ) : pendingDialog.action === 'stop' ? (
                  <Power className="size-5" />
                ) : (
                  <RotateCw className="size-5" />
                )}
              </AlertDialogMedia>
              <AlertDialogTitle>
                {pendingDialog.action === 'delete'
                  ? 'Delete server?'
                  : pendingDialog.action === 'force_stop'
                  ? 'Force shutdown?'
                  : pendingDialog.action === 'stop'
                  ? 'Shut down server?'
                  : 'Restart server?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingDialog.action === 'delete'
                  ? `This will permanently delete "${pendingDialog.hostname}" and destroy all associated MaxIOPS storage. This action cannot be undone.`
                  : pendingDialog.action === 'force_stop'
                  ? `Force shutdown immediately pulls the virtual power from "${pendingDialog.hostname}" without safe OS unmount.`
                  : pendingDialog.action === 'stop'
                  ? `Are you sure you want to shut down "${pendingDialog.hostname}"? Server services will temporarily stop until powered on again.`
                  : `Are you sure you want to reboot "${pendingDialog.hostname}"? Sesi koneksi aktif akan terputus sementara.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant={
                  pendingDialog.action === 'delete' || pendingDialog.action === 'force_stop'
                    ? 'destructive'
                    : pendingDialog.action === 'stop'
                    ? 'purple'
                    : 'default'
                }
                onClick={() => {
                  const { uuid, action } = pendingDialog;
                  setPendingDialog(null);
                  handleAction(uuid, action, true);
                }}
              >
                {pendingDialog.action === 'delete'
                  ? 'Delete'
                  : pendingDialog.action === 'force_stop'
                  ? 'Force Stop'
                  : pendingDialog.action === 'stop'
                  ? 'Shut Down'
                  : 'Restart'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default ServersDashboard;
