import React, { useState, useEffect, useRef } from 'react';
import type { Order } from '../types';
import { 
  ArrowLeft,
  Power,
  RotateCw,
  Copy,
  Trash2,
  ChevronDown,
  Check,
  Eye,
  EyeOff,
  Cpu,
  Activity,
  HardDrive,
  Globe2,
  Terminal,
  Zap,
  Clock,
  Sparkles,
  AlertTriangle,
  Unplug,
  Shield,
  Layers,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { CountryFlag } from './CountryFlag';
import { OsIcon } from './OsIcon';
import { getDistroFromTemplateName } from './ServersDashboard';
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

interface ServerDetailViewProps {
  server: Order;
  onBack: () => void;
  onAction: (uuid: string, action: 'start' | 'stop' | 'force_stop' | 'restart' | 'sync' | 'delete', confirmed?: boolean) => Promise<void>;
  actionLoading: { [uuid: string]: string };
  actionMessage: { [uuid: string]: { text: string; type: 'success' | 'error' } };
  onRefresh: () => Promise<void>;
}

export const ServerDetailView: React.FC<ServerDetailViewProps> = ({
  server,
  onBack,
  onAction,
  actionLoading,
  actionMessage,
  onRefresh
}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<'stop' | 'force_stop' | 'restart' | 'delete' | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Live fluctuating telemetry simulation for charts
  const [cpuUsage, setCpuUsage] = useState<number>(14.5);
  const [ramUsageMb, setRamUsageMb] = useState<number>(820);
  const [diskIops, setDiskIops] = useState<number>(104.8);
  const [networkPing, setNetworkPing] = useState<number>(14.2);

  // Sparkline chart data histories
  const [cpuHistory, setCpuHistory] = useState<{ time: string; value: number }[]>([
    { time: '10:00', value: 12 },
    { time: '10:05', value: 16 },
    { time: '10:10', value: 14 },
    { time: '10:15', value: 22 },
    { time: '10:20', value: 18 },
    { time: '10:25', value: 15 },
    { time: '10:30', value: 14.5 },
  ]);

  const [ramHistory, setRamHistory] = useState<{ time: string; value: number }[]>([
    { time: '10:00', value: 780 },
    { time: '10:05', value: 800 },
    { time: '10:10', value: 810 },
    { time: '10:15', value: 830 },
    { time: '10:20', value: 815 },
    { time: '10:25', value: 825 },
    { time: '10:30', value: 820 },
  ]);

  const [netHistory, setNetHistory] = useState<{ time: string; value: number }[]>([
    { time: '10:00', value: 3.2 },
    { time: '10:05', value: 4.8 },
    { time: '10:10', value: 3.9 },
    { time: '10:15', value: 6.4 },
    { time: '10:20', value: 5.1 },
    { time: '10:25', value: 4.2 },
    { time: '10:30', value: 4.7 },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextCpu = +(12 + Math.random() * 8).toFixed(1);
      const nextRam = Math.round(800 + Math.random() * 60);
      const nextIops = +(104 + Math.random() * 2.5).toFixed(1);
      const nextPing = +(13.8 + Math.random() * 1.6).toFixed(1);
      const nextNet = +(3.5 + Math.random() * 3).toFixed(1);

      setCpuUsage(nextCpu);
      setRamUsageMb(nextRam);
      setDiskIops(nextIops);
      setNetworkPing(nextPing);

      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setCpuHistory(prev => [...prev.slice(1), { time: now, value: nextCpu }]);
      setRamHistory(prev => [...prev.slice(1), { time: now, value: nextRam }]);
      setNetHistory(prev => [...prev.slice(1), { time: now, value: nextNet }]);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyText = (text: string, id: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      }
    } catch {}
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isOnline = server.serverState === 'started';
  const isStopped = server.serverState === 'stopped';
  const isBuilding = server.vpsStatus === 'PROVISIONING' || server.serverState === 'maintenance';
  const currentAction = server.serverUuid ? actionLoading[server.serverUuid] : null;

  const totalRamMb = server.memoryAmountMb || 2048;
  const totalRamGb = Math.round(totalRamMb / 1024) || 2;
  const ramUsagePercent = Math.min(100, Math.round((ramUsageMb / totalRamMb) * 100));
  const totalStorageGb = server.storageSizeGb || 50;

  // Handle Action Trigger
  const handleTriggerAction = async (action: 'start' | 'stop' | 'force_stop' | 'restart' | 'sync' | 'delete') => {
    setDropdownOpen(false);
    if (!server.serverUuid) return;

    if (action === 'start' || action === 'sync') {
      await onAction(server.serverUuid, action, true);
      return;
    }

    setPendingAction(action);
  };

  const handleConfirmAction = async () => {
    if (!server.serverUuid || !pendingAction) return;
    const actionToRun = pendingAction;
    setPendingAction(null);
    await onAction(server.serverUuid, actionToRun, true);
    if (actionToRun === 'delete') {
      onBack();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-16">
      {/* ========================================================
          1. TOP NAVIGATION & PURPLE ACTION BUTTON
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="space-y-2">
          {/* Back button */}
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Semua Server</span>
          </button>

          {/* Server Title & Status */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`w-3 h-3 rounded-full shrink-0 ${
              isOnline ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 
              isStopped ? 'bg-rose-500' : 'bg-amber-400 animate-ping'
            }`} />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {server.hostname}
            </h1>

            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
              isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
              isStopped ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
              'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {isOnline ? 'Running' : isStopped ? 'Stopped' : isBuilding ? 'Building' : 'Offline'}
            </span>

            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Perbarui Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${currentAction === 'sync' ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Action Controls: Purple Split Button (Image 2) */}
        <div className="flex items-center gap-3 self-start sm:self-center" ref={dropdownRef}>
          {server.serverUuid && (
            <div className="relative inline-flex rounded-xl shadow-lg shadow-purple-600/20">
              {/* Main Button: Shut Down or Start */}
              <button
                onClick={() => handleTriggerAction(isOnline ? 'stop' : 'start')}
                disabled={Boolean(currentAction) || isBuilding}
                className="px-5 py-2.5 bg-[#7000FF] hover:bg-[#6200e0] active:bg-[#5300bf] text-white font-bold text-sm rounded-l-xl flex items-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Power className={`w-4 h-4 ${currentAction === 'start' || currentAction === 'stop' ? 'animate-spin' : ''}`} />
                <span>{isOnline ? 'Shut down' : 'Start'}</span>
              </button>

              {/* Split Dropdown Trigger */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={Boolean(currentAction)}
                className="px-3 py-2.5 bg-[#7000FF] hover:bg-[#6200e0] active:bg-[#5300bf] text-white rounded-r-xl border-l border-white/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"
                title="Pilihan Aksi Lainnya"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu (Image 2 style) */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Start */}
                  <button
                    onClick={() => handleTriggerAction('start')}
                    disabled={isOnline || Boolean(currentAction) || isBuilding}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group text-left cursor-pointer"
                  >
                    <Power className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
                    <span>Start</span>
                  </button>

                  {/* Shut down (Graceful) */}
                  <button
                    onClick={() => handleTriggerAction('stop')}
                    disabled={isStopped || Boolean(currentAction) || isBuilding}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group text-left cursor-pointer"
                  >
                    <Power className="w-4 h-4 text-slate-400 group-hover:text-amber-400" />
                    <span>Shut down</span>
                  </button>

                  {/* Force Shutdown */}
                  <button
                    onClick={() => handleTriggerAction('force_stop')}
                    disabled={isStopped || Boolean(currentAction) || isBuilding}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group text-left cursor-pointer"
                  >
                    <Unplug className="w-4 h-4 text-slate-400 group-hover:text-rose-400" />
                    <span>Force Shutdown</span>
                  </button>

                  {/* Restart */}
                  <button
                    onClick={() => handleTriggerAction('restart')}
                    disabled={Boolean(currentAction) || isBuilding}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group text-left cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                    <span>Restart</span>
                  </button>

                  {/* Clone */}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      alert('Fitur Clone Server Snapshot UpCloud akan segera hadir pada update berikutnya.');
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors group text-left cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
                    <span>Clone</span>
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  {/* Delete */}
                  <button
                    onClick={() => handleTriggerAction('delete')}
                    disabled={Boolean(currentAction)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors group text-left cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          2. STATS VPS: 4 REAL-TIME TELEMETRY METRIC CARDS
          ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Telemetri Performa Server UpCloud
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Aktif 4.5s Polling
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CARD 1: CPU USAGE */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 text-white shadow-xl backdrop-blur-md">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-40 blur-2xl bg-cyan-500/10" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-600/25 p-2 text-cyan-400 shadow-md">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">CPU Usage</h4>
                  <p className="text-[11px] text-slate-400">{server.coreNumber || 2} Cores Dedikasi</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {isOnline ? `${cpuUsage}%` : '0.0%'}
              </span>
              <span className="text-xs text-emerald-400 font-semibold">Normal</span>
            </div>

            {/* Sparkline */}
            <div className="mt-3 h-14 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuHistory}>
                  <defs>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fill="url(#cpuGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CARD 2: RAM USAGE */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 text-white shadow-xl backdrop-blur-md">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-40 blur-2xl bg-blue-500/10" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600/25 p-2 text-blue-400 shadow-md">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">Memory (RAM)</h4>
                  <p className="text-[11px] text-slate-400">{totalRamGb} GB Total</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {isOnline ? `${ramUsagePercent}%` : '0%'}
              </span>
              <span className="text-xs text-slate-400">
                {isOnline ? `${ramUsageMb} MB` : '0 MB'}
              </span>
            </div>

            {/* Sparkline */}
            <div className="mt-3 h-14 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ramHistory}>
                  <defs>
                    <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#ramGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CARD 3: STORAGE & IOPS */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 text-white shadow-xl backdrop-blur-md">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-40 blur-2xl bg-purple-500/10" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-600/25 p-2 text-purple-400 shadow-md">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">MaxIOPS Disk</h4>
                  <p className="text-[11px] text-slate-400">{totalStorageGb} GB SSD</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {isOnline ? `${diskIops}K` : '0K'}
              </span>
              <span className="text-xs text-purple-400 font-semibold">IOPS Rate</span>
            </div>

            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Terpakai 12.4 GB</span>
                <span>Tersedia {totalStorageGb - 12} GB</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
          </div>

          {/* CARD 4: NETWORK & LATENCY */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 text-white shadow-xl backdrop-blur-md">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-40 blur-2xl bg-emerald-500/10" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-600/25 p-2 text-emerald-400 shadow-md">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">Jaringan SG3</h4>
                  <p className="text-[11px] text-slate-400">Port 1 Gbps Aktif</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {isOnline ? `${networkPing} ms` : 'Offline'}
              </span>
              <span className="text-xs text-emerald-400 font-semibold">Ultra Rendah</span>
            </div>

            {/* Sparkline */}
            <div className="mt-3 h-14 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netHistory}>
                  <defs>
                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#netGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. DETAIL VPS: TECHNICAL SPECS & SSH CREDENTIALS
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Technical Overview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-800/90 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Detail Spesifikasi & Konfigurasi VPS</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Hostname */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Hostname</span>
                <p className="font-mono font-bold text-white text-sm truncate">{server.hostname}</p>
              </div>

              {/* Order Number */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Order ID</span>
                <p className="font-mono font-bold text-cyan-400 text-sm truncate">{server.orderNumber}</p>
              </div>

              {/* Data Center */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Lokasi Data Center</span>
                <div className="flex items-center gap-2 pt-0.5">
                  <CountryFlag zoneCode={server.zoneCode} countryName={server.zoneCountry} size="sm" />
                  <span className="font-bold text-white">{server.zoneName || server.zoneCode}</span>
                  <span className="text-slate-400 uppercase font-mono">({server.zoneCode})</span>
                </div>
              </div>

              {/* Operating System */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Sistem Operasi</span>
                <div className="flex items-center gap-2 pt-0.5">
                  <OsIcon distro={getDistroFromTemplateName(server.templateName)} size="xs" />
                  <span className="font-bold text-white truncate">{server.templateName}</span>
                </div>
              </div>

              {/* Billing Cycle */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Siklus Penagihan</span>
                <p className="font-bold text-white capitalize pt-0.5">
                  {server.billingCycle === 'annually' ? 'Tahunan (Diskon 15%)' : 
                   server.billingCycle === 'quarterly' ? '3 Bulan (Diskon 5%)' : 'Bulanan'}
                </p>
              </div>

              {/* Created Date */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tanggal Dibuat</span>
                <p className="font-bold text-white pt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(server.createdAt).toLocaleString('id-ID')}</span>
                </p>
              </div>
            </div>

            {/* UpCloud Server UUID */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">UpCloud Server UUID</span>
              <div className="flex items-center justify-between font-mono text-xs text-white">
                <span className="truncate">{server.serverUuid || 'N/A (Belum teralokasi)'}</span>
                {server.serverUuid && (
                  <button
                    onClick={() => copyText(server.serverUuid!, 'uuid')}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                    title="Salin UUID"
                  >
                    {copiedKey === 'uuid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Network IP & SSH Connection Command */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-800/90 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <span>Akses Terminal & Jaringan</span>
            </h3>

            {/* IPv4 Publik */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Public IPv4</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">
                  {server.serverIp || 'Sedang mengalokasikan...'}
                </span>
              </div>
              {server.serverIp && (
                <button
                  onClick={() => copyText(server.serverIp!, 'ipv4')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Salin IPv4"
                >
                  {copiedKey === 'ipv4' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* IPv6 Publik */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Public IPv6</span>
                <span className="font-mono text-indigo-300 text-xs truncate block" title={server.serverIpv6}>
                  {server.serverIpv6 || 'Tersedia saat online'}
                </span>
              </div>
              {server.serverIpv6 && (
                <button
                  onClick={() => copyText(server.serverIpv6!, 'ipv6')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Salin IPv6"
                >
                  {copiedKey === 'ipv6' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Root Password with Show/Hide */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Root Password</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Tutup' : 'Lihat'}</span>
                  </button>
                  <button
                    onClick={() => copyText(server.rootPassword, 'pass')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] cursor-pointer font-bold"
                  >
                    {copiedKey === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Salin</span>
                  </button>
                </div>
              </div>
              <p className="font-mono font-bold text-amber-400 text-sm select-all">
                {showPassword ? server.rootPassword : '••••••••••••••••'}
              </p>
            </div>

            {/* SSH Quick Command Box */}
            {server.serverIp && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Perintah Login SSH (Terminal)
                </span>
                <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 shadow-inner">
                  <span className="truncate">ssh root@{server.serverIp}</span>
                  <button
                    onClick={() => copyText(`ssh root@${server.serverIp}`, 'ssh-cmd')}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors shrink-0"
                    title="Salin Perintah SSH"
                  >
                    {copiedKey === 'ssh-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          4. PIPELINE TELEMETRI & LIVE STREAM EXECUTION (TIMELINE)
          ======================================================== */}
      <div className="pt-4 flex justify-center">
        <TimelineCollapsible
          serverName={server.hostname}
          serverIp={server.serverIp || '10.0.4.12'}
          className="w-full max-w-3xl shadow-2xl"
        />
      </div>

      {/* ========================================================
          SHADCN / UIABLE ALERT DIALOG - VPS CONTROL ACTIONS
          ======================================================== */}
      {pendingAction && (
        <AlertDialog open={Boolean(pendingAction)} onOpenChange={(open) => !open && setPendingAction(null)}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia
                className={
                  pendingAction === 'delete' || pendingAction === 'force_stop'
                    ? 'bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-500'
                    : pendingAction === 'stop'
                    ? 'bg-purple-500/10 text-purple-400 dark:bg-purple-500/20 dark:text-purple-400'
                    : 'bg-cyan-500/10 text-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-400'
                }
              >
                {pendingAction === 'delete' ? (
                  <Trash2 className="size-5" />
                ) : pendingAction === 'force_stop' ? (
                  <Unplug className="size-5" />
                ) : pendingAction === 'stop' ? (
                  <Power className="size-5" />
                ) : (
                  <RotateCw className="size-5" />
                )}
              </AlertDialogMedia>
              <AlertDialogTitle>
                {pendingAction === 'delete'
                  ? 'Delete server?'
                  : pendingAction === 'force_stop'
                  ? 'Force shutdown?'
                  : pendingAction === 'stop'
                  ? 'Shut down server?'
                  : 'Restart server?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingAction === 'delete'
                  ? `This will permanently delete "${server.hostname}" and destroy all associated MaxIOPS storage. This action cannot be undone.`
                  : pendingAction === 'force_stop'
                  ? `Force shutdown immediately pulls the virtual power from "${server.hostname}" without safe OS unmount. Unsaved memory states may be lost.`
                  : pendingAction === 'stop'
                  ? `Are you sure you want to shut down "${server.hostname}"? Server services and websites hosted on it will temporarily stop until powered on again.`
                  : `Are you sure you want to reboot "${server.hostname}"? The OS kernel will reload and SSH sessions will temporarily drop.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant={
                  pendingAction === 'delete' || pendingAction === 'force_stop'
                    ? 'destructive'
                    : pendingAction === 'stop'
                    ? 'purple'
                    : 'default'
                }
                onClick={handleConfirmAction}
              >
                {pendingAction === 'delete'
                  ? 'Delete'
                  : pendingAction === 'force_stop'
                  ? 'Force Stop'
                  : pendingAction === 'stop'
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

export default ServerDetailView;
