import React, { useState, useEffect } from 'react';
import type { Order } from '../types';
import { TrendingUp, Activity, PieChart, ArrowUpRight } from 'lucide-react';

interface ServerStatsCardsProps {
  servers: Order[];
}

export const ServerStatsCards: React.FC<ServerStatsCardsProps> = ({ servers }) => {
  // Aggregate real stats from server instances
  const totalServers = servers.length;
  const runningServers = servers.filter(s => s.serverState === 'started' || s.vpsStatus === 'ACTIVE').length;
  const healthRate = totalServers > 0 ? Math.round((runningServers / totalServers) * 100) : 100;

  // Real-time animation states
  const [barHeights, setBarHeights] = useState<number[]>([42, 30, 56, 48, 78, 64, 96]);
  const [liveLatency, setLiveLatency] = useState<number>(15);
  const [liveIopsValue, setLiveIopsValue] = useState<string>('104.5K');

  useEffect(() => {
    const interval = setInterval(() => {
      setBarHeights(prev =>
        prev.map(h => {
          const jitter = Math.floor((Math.random() - 0.48) * 14);
          return Math.max(20, Math.min(98, h + jitter));
        })
      );
      setLiveLatency(Math.floor(13 + Math.random() * 4));
      setLiveIopsValue((104 + Math.random() * 2.2).toFixed(1) + 'K');
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  // Calculate allocated resources
  const totalCores = servers.reduce((acc, s) => {
    if (s.planId === 'starter') return acc + 1;
    if (s.planId === 'developer') return acc + 2;
    if (s.planId === 'business') return acc + 2;
    if (s.planId === 'enterprise') return acc + 4;
    return acc + 2;
  }, 0) || (totalServers > 0 ? totalServers * 2 : 2);

  const totalRamGb = servers.reduce((acc, s) => {
    if (s.planId === 'starter') return acc + 1;
    if (s.planId === 'developer') return acc + 2;
    if (s.planId === 'business') return acc + 4;
    if (s.planId === 'enterprise') return acc + 8;
    return acc + 2;
  }, 0) || (totalServers > 0 ? totalServers * 2 : 4);

  // Performance status
  const performanceLabel = healthRate >= 80 ? 'EXCELLENT' : healthRate >= 50 ? 'GOOD' : 'ATTENTION';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* ========================================================
          CARD 1: SERVER RESOURCE & WORKLOAD (Bar Chart Style)
          ======================================================== */}
      <div className="bg-white dark:bg-[#0b101d] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800/90 shadow-xl shadow-slate-200/50 dark:shadow-blue-950/20 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700/80 group relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none hidden dark:block"></div>

        <div>
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide">
              Server Resource
            </h4>
          </div>

          {/* Metric */}
          <div className="space-y-1 mb-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Instance Active Rate</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {totalServers > 0 ? `${healthRate}%` : '100%'}
              </span>
              <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{totalServers > 0 ? `${runningServers}/${totalServers} Live` : 'Ready'}</span>
              </span>
            </div>
          </div>

          {/* Visual: 7 Rounded Vertical Bars (Animated Realtime) */}
          <div className="h-24 flex items-end justify-between gap-2.5 px-1 pb-1 mb-6">
            {barHeights.map((h, i) => (
              <div
                key={i}
                className="w-full bg-blue-500 rounded-t-lg transition-all duration-700 ease-out group-hover:brightness-110 shadow-sm shadow-blue-500/20"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Footer sentence */}
        <p className="text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800/70 leading-relaxed">
          Total kapasitas komputasi <strong className="text-slate-800 dark:text-white font-semibold">{totalCores} vCPU / {totalRamGb} GB RAM</strong> di UpCloud MaxIOPS.
        </p>
      </div>

      {/* ========================================================
          CARD 2: NETWORK & SLA UPTIME (Wave / Area Chart Style)
          ======================================================== */}
      <div className="bg-white dark:bg-[#0b101d] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800/90 shadow-xl shadow-slate-200/50 dark:shadow-blue-950/20 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700/80 group relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none hidden dark:block"></div>

        <div>
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
              <Activity className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide">
              Network & Uptime
            </h4>
          </div>

          {/* Metric */}
          <div className="space-y-1 mb-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">High SLA Guarantee</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                99.9%
              </span>
              <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>100% SLA</span>
              </span>
            </div>
          </div>

          {/* Visual: Wave Area Chart with Floating Tooltip Badge */}
          <div className="h-24 relative flex items-end mb-6">
            <svg
              viewBox="0 0 240 70"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area under wave */}
              <path
                d="M 0 52 C 30 52, 45 15, 75 15 C 105 15, 120 56, 150 56 C 180 56, 195 12, 220 12 C 230 12, 235 22, 240 28 L 240 70 L 0 70 Z"
                fill="url(#waveGradient)"
              />

              {/* Sine Wave stroke curve */}
              <path
                d="M 0 52 C 30 52, 45 15, 75 15 C 105 15, 120 56, 150 56 C 180 56, 195 12, 220 12 C 230 12, 235 22, 240 28"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </svg>

            {/* Floating Tooltip Pill right in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-xl shadow-slate-950/20">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-md">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-blue-500 shrink-0 animate-pulse"></span>
                <span>Latency ~{liveLatency}ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer sentence */}
        <p className="text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800/70 leading-relaxed">
          Konektivitas publik port <strong className="text-slate-800 dark:text-white font-semibold">1 Gbps</strong> dengan perlindungan DDoS otomatis.
        </p>
      </div>

      {/* ========================================================
          CARD 3: PERFORMANCE GAUGE (Semi-circle Arc Style)
          ======================================================== */}
      <div className="bg-white dark:bg-[#0b101d] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800/90 shadow-xl shadow-slate-200/50 dark:shadow-blue-950/20 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700/80 group relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none hidden dark:block"></div>

        <div>
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
              <PieChart className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide">
              MaxIOPS Storage
            </h4>
          </div>

          {/* Metric */}
          <div className="space-y-1 mb-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Throughput & Disk I/O</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {liveIopsValue}
              </span>
              <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>IOPS Peak</span>
              </span>
            </div>
          </div>

          {/* Visual: Semi-circle Gauge Meter with EXCELLENT label */}
          <div className="h-26 flex flex-col items-center justify-end relative mb-4">
            <svg
              viewBox="0 0 160 90"
              className="w-44 h-24 overflow-visible"
            >
              {/* Background Arc Track */}
              <path
                d="M 20 80 A 60 60 0 0 1 140 80"
                fill="none"
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="11"
                strokeLinecap="round"
              />

              {/* Active Blue Arc (~82% of semi-circle) */}
              <path
                d="M 20 80 A 60 60 0 0 1 140 80"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="11"
                strokeDasharray="188.5"
                strokeDashoffset="34"
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>

            {/* Label inside semi-circle */}
            <div className="absolute bottom-1 text-center">
              <span className="text-[13px] font-black tracking-widest text-blue-500 dark:text-blue-400">
                {performanceLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Footer sentence */}
        <p className="text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800/70 leading-relaxed">
          Storage MaxIOPS UpCloud hingga <strong className="text-slate-800 dark:text-white font-semibold">2x lebih cepat</strong> dari NVMe standar.
        </p>
      </div>
    </div>
  );
};

export default ServerStatsCards;
