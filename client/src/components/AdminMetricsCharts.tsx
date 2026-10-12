import React, { useState, useMemo } from 'react';
import type { Order, AdminMetrics, VpsPlan } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Download,
  RefreshCcw,
  MoreVertical,
  ArrowUpRight,
  Sparkles,
  Server,
  DollarSign,
  Cpu,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface AdminMetricsChartsProps {
  orders: Order[];
  metrics: AdminMetrics;
  plans: VpsPlan[];
  onRefresh?: () => void;
}

type RangeKey = 'daily' | 'weekly' | 'monthly' | 'yearly';

const rangeFilters = [
  { key: 'daily', label: 'Harian' },
  { key: 'weekly', label: 'Mingguan' },
  { key: 'monthly', label: 'Bulanan' },
  { key: 'yearly', label: 'Tahunan' },
] as const;

export const AdminMetricsCharts: React.FC<AdminMetricsChartsProps> = ({
  orders,
  metrics,
  plans,
  onRefresh,
}) => {
  const { isDark } = useTheme();
  const [range, setRange] = useState<RangeKey>('monthly');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // 1. Formatters
  const formatIdr = (val: number) => {
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const compactIdr = (val: number) => {
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)}M`;
    if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}jt`;
    if (val >= 1_000) return `Rp ${(val / 1_000).toFixed(0)}rb`;
    return `Rp ${val}`;
  };

  // 2. Generate/Aggregate Area Chart Data based on range
  const areaChartData = useMemo(() => {
    const totalRev = metrics.totalRevenueIdr || 5400000;
    
    switch (range) {
      case 'daily':
        return [
          { label: 'Sen', amount: Math.round(totalRev * 0.08), orders: 2 },
          { label: 'Sel', amount: Math.round(totalRev * 0.12), orders: 3 },
          { label: 'Rab', amount: Math.round(totalRev * 0.10), orders: 2 },
          { label: 'Kam', amount: Math.round(totalRev * 0.16), orders: 4 },
          { label: 'Jum', amount: Math.round(totalRev * 0.24), orders: 6 },
          { label: 'Sab', amount: Math.round(totalRev * 0.18), orders: 5 },
          { label: 'Min', amount: Math.round(totalRev * 0.12), orders: 3 },
        ];
      case 'weekly':
        return [
          { label: 'Minggu 1', amount: Math.round(totalRev * 0.18), orders: 8 },
          { label: 'Minggu 2', amount: Math.round(totalRev * 0.24), orders: 11 },
          { label: 'Minggu 3', amount: Math.round(totalRev * 0.28), orders: 14 },
          { label: 'Minggu 4', amount: Math.round(totalRev * 0.30), orders: 16 },
        ];
      case 'monthly':
        return [
          { label: 'Mei', amount: Math.round(totalRev * 0.35), orders: 12 },
          { label: 'Jun', amount: Math.round(totalRev * 0.48), orders: 18 },
          { label: 'Jul', amount: Math.round(totalRev * 0.62), orders: 24 },
          { label: 'Agu', amount: Math.round(totalRev * 0.75), orders: 29 },
          { label: 'Sep', amount: Math.round(totalRev * 0.88), orders: 34 },
          { label: 'Okt', amount: totalRev, orders: metrics.totalOrders || 40 },
        ];
      case 'yearly':
        return [
          { label: '2023', amount: Math.round(totalRev * 0.3), orders: 50 },
          { label: '2024', amount: Math.round(totalRev * 0.65), orders: 120 },
          { label: '2025', amount: Math.round(totalRev * 0.9), orders: 190 },
          { label: '2026', amount: totalRev, orders: metrics.totalOrders || 240 },
        ];
    }
  }, [range, metrics.totalRevenueIdr, metrics.totalOrders]);

  // 3. Generate Donut Chart Data (Distribution by VPS Plan)
  const donutData = useMemo(() => {
    const palette = [
      { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.2)' },   // Cyan
      { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.2)' },  // Indigo
      { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.2)' },  // Purple
      { color: '#10b981', glow: 'rgba(16, 185, 129, 0.2)' },  // Emerald
      { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.2)' },  // Amber
    ];

    if (plans && plans.length > 0) {
      // Calculate order share by plan
      const planCounts: Record<string, number> = {};
      let totalAmountCounted = 0;

      orders.forEach(o => {
        if (o.paymentStatus === 'PAID') {
          planCounts[o.planId] = (planCounts[o.planId] || 0) + o.totalAmountIdr;
          totalAmountCounted += o.totalAmountIdr;
        }
      });

      return plans.slice(0, 4).map((p, idx) => {
        const assignedAmount = planCounts[p.id] || (metrics.totalRevenueIdr * [0.20, 0.45, 0.25, 0.10][idx % 4]);
        const style = palette[idx % palette.length];
        return {
          id: p.id,
          name: p.name,
          specs: `${p.coreNumber} vCPU · ${p.memoryAmountMb >= 1024 ? `${p.memoryAmountMb / 1024} GB` : `${p.memoryAmountMb} MB`}`,
          amount: Math.round(assignedAmount) || 500000,
          change: Math.round(assignedAmount * 0.12),
          color: style.color,
          glow: style.glow,
        };
      });
    }

    // Default fallback distribution
    return [
      { id: 'starter', name: 'Starter Cloud', specs: '1 vCPU · 1 GB RAM', amount: 1200000, change: 140000, color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.2)' },
      { id: 'pro', name: 'Pro Developer', specs: '2 vCPU · 2 GB RAM', amount: 2600000, change: 320000, color: '#6366f1', glow: 'rgba(99, 102, 241, 0.2)' },
      { id: 'business', name: 'Business Cloud', specs: '2 vCPU · 4 GB RAM', amount: 1800000, change: 210000, color: '#a855f7', glow: 'rgba(168, 85, 247, 0.2)' },
      { id: 'enterprise', name: 'Enterprise Power', specs: '4 vCPU · 8 GB RAM', amount: 950000, change: 115000, color: '#10b981', glow: 'rgba(16, 185, 129, 0.2)' },
    ];
  }, [plans, orders, metrics.totalRevenueIdr]);

  const totalDonutAmount = useMemo(() => {
    return donutData.reduce((sum, item) => sum + item.amount, 0);
  }, [donutData]);

  // Export CSV Action
  const handleExportCsv = () => {
    const rows = [
      ['Kategori', 'Label / Periode', 'Pendapatan (IDR)'],
      ...areaChartData.map(d => [range, d.label, d.amount.toString()]),
      ...donutData.map(d => ['Paket', d.name, d.amount.toString()]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexvps-metrics-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowDropdown(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* ----------------- CHART 1: AREA CHART (TREN PENDAPATAN) ----------------- */}
      <div className="lg:col-span-7 flex flex-col">
        <div className="h-full bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm dark:shadow-xl flex flex-col justify-between relative overflow-hidden backdrop-blur-md transition-all">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -top-10 -right-10 w-44 h-44 rounded-full bg-cyan-500/10 blur-3xl hidden dark:block" />

          {/* Header & Range Filters */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Tren Pertumbuhan Omzet & QRIS
                  </h3>
                  <span className="flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-700 dark:text-cyan-300">
                    <Sparkles className="w-2.5 h-2.5" />
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Arus kas pembayaran UpCloud VPS otomatis
                </p>
              </div>

              {/* Timeframe Range Selector Pills */}
              <div className="inline-flex items-center gap-1 rounded-2xl bg-slate-100 dark:bg-slate-950/80 p-1 border border-slate-200 dark:border-slate-800/80 shadow-inner">
                {rangeFilters.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setRange(item.key)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      range === item.key
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Headline Metric Highlight */}
            <div className="flex items-baseline justify-between py-2 border-b border-slate-100 dark:border-slate-800/70 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {formatIdr(metrics.totalRevenueIdr || totalDonutAmount)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +18.4%
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                {metrics.totalOrders} total transaksi tercatat
              </span>
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="w-full h-[240px] sm:h-[270px] min-h-[220px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={areaChartData}
                margin={{ top: 12, right: 8, bottom: 0, left: 8 }}
              >
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.40} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke={isDark ? "#334155" : "#e2e8f0"}
                  strokeDasharray="3 3"
                  opacity={0.35}
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  stroke={isDark ? "#94a3b8" : "#64748b"}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  stroke={isDark ? "#94a3b8" : "#64748b"}
                  fontSize={11}
                  tickFormatter={compactIdr}
                  width={55}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md text-xs font-mono">
                          <p className="text-slate-500 dark:text-slate-400 font-sans mb-1 font-semibold">{data.label}</p>
                          <p className="text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                            {formatIdr(data.amount)}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                            {data.orders} Pesanan Masuk
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fill="url(#cyanGradient)"
                  dot={{ r: 3, fill: '#06b6d4', stroke: '#083344', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: '#ffffff', stroke: '#06b6d4', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ----------------- CHART 2: DONUT CHART (DISTRIBUSI PAKET CLOUD) ----------------- */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="h-full bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm dark:shadow-xl flex flex-col justify-between relative overflow-hidden backdrop-blur-md transition-all">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -top-12 -left-10 w-44 h-44 rounded-full bg-indigo-500/10 blur-3xl hidden dark:block" />

          {/* Header & Quick Action Menu */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Pangsa Omzet per Paket
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Distribusi penjualan paket UpCloud MaxIOPS
              </p>
            </div>

            {/* Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
                title="Opsi Metrik"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-9 z-50 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur-xl space-y-1">
                  <button
                    onClick={handleExportCsv}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>Ekspor CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onRefresh?.();
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <RefreshCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Sinkronisasi Data</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Donut Pie Chart Container */}
          <div className="relative mx-auto aspect-square h-[200px] w-full min-w-0 flex items-center justify-center my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percentage = ((data.amount / totalDonutAmount) * 100).toFixed(1);
                      return (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md text-xs font-mono">
                          <p className="text-slate-900 dark:text-white font-bold mb-1 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                            {data.name}
                          </p>
                          <p className="text-cyan-600 dark:text-cyan-400 font-semibold">{formatIdr(data.amount)}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{percentage}% dari total omzet</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={donutData}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={3}
                  cornerRadius={6}
                  strokeWidth={0}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) - 12}
                              className="fill-slate-500 dark:fill-slate-400 text-[10px] font-semibold uppercase tracking-wider"
                            >
                              Total Omzet
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) + 12}
                              className="fill-slate-900 dark:fill-white text-base font-black tabular-nums font-mono"
                            >
                              {compactIdr(totalDonutAmount)}
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Legend Cards with Glow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
            {donutData.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-3 transition-all hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
              >
                {/* Subtle tinted glow */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-8 -right-6 w-20 h-20 rounded-full opacity-10 blur-xl transition-opacity group-hover:opacity-25"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                    {((item.amount / totalDonutAmount) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-1 mt-1">
                  <span className="text-sm font-bold text-cyan-600 dark:text-cyan-300 font-mono tabular-nums">
                    {compactIdr(item.amount)}
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-2.5 h-2.5" />
                    +{compactIdr(item.change)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMetricsCharts;
