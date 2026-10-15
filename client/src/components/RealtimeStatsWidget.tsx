import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  Cpu, 
  Server, 
  Zap, 
  Activity, 
  ArrowUp,
  Sparkles,
  Radio
} from 'lucide-react';

export interface WidgetStat {
  id: string;
  title: string;
  value: string;
  change: string;
  comparison: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'cyan' | 'blue' | 'emerald' | 'purple';
  chartData: { value: number }[];
}

interface RealtimeStatsWidgetProps {
  activeServersCount?: number;
}

const colorStyles = {
  cyan: {
    border: 'border-slate-200 dark:border-cyan-500/40 dark:hover:border-cyan-400',
    glow: 'dark:shadow-[0_0_15px_-2px_rgba(6,182,212,0.3),inset_0_0_12px_rgba(6,182,212,0.05)] dark:hover:shadow-[0_0_24px_-1px_rgba(6,182,212,0.5),inset_0_0_16px_rgba(6,182,212,0.1)]',
    cornerGlow: 'bg-cyan-500/10',
    iconBg: 'bg-cyan-600/25 border-cyan-500/30 text-cyan-400 shadow-cyan-500/10',
    stroke: '#06b6d4',
    stopColor: '#06b6d4',
  },
  blue: {
    border: 'border-slate-200 dark:border-blue-500/40 dark:hover:border-blue-400',
    glow: 'dark:shadow-[0_0_15px_-2px_rgba(59,130,246,0.3),inset_0_0_12px_rgba(59,130,246,0.05)] dark:hover:shadow-[0_0_24px_-1px_rgba(59,130,246,0.5),inset_0_0_16px_rgba(59,130,246,0.1)]',
    cornerGlow: 'bg-blue-500/10',
    iconBg: 'bg-blue-600/25 border-blue-500/30 text-blue-400 shadow-blue-500/10',
    stroke: '#3b82f6',
    stopColor: '#3b82f6',
  },
  emerald: {
    border: 'border-slate-200 dark:border-emerald-500/40 dark:hover:border-emerald-400',
    glow: 'dark:shadow-[0_0_15px_-2px_rgba(16,185,129,0.3),inset_0_0_12px_rgba(16,185,129,0.05)] dark:hover:shadow-[0_0_24px_-1px_rgba(16,185,129,0.5),inset_0_0_16px_rgba(16,185,129,0.1)]',
    cornerGlow: 'bg-emerald-500/10',
    iconBg: 'bg-emerald-600/25 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10',
    stroke: '#10b981',
    stopColor: '#10b981',
  },
  purple: {
    border: 'border-slate-200 dark:border-purple-500/40 dark:hover:border-purple-400',
    glow: 'dark:shadow-[0_0_15px_-2px_rgba(168,85,247,0.3),inset_0_0_12px_rgba(168,85,247,0.05)] dark:hover:shadow-[0_0_24px_-1px_rgba(168,85,247,0.5),inset_0_0_16px_rgba(168,85,247,0.1)]',
    cornerGlow: 'bg-purple-500/10',
    iconBg: 'bg-purple-600/25 border-purple-500/30 text-purple-400 shadow-purple-500/10',
    stroke: '#a855f7',
    stopColor: '#a855f7',
  },
};

export const RealtimeStatsWidget: React.FC<RealtimeStatsWidgetProps> = ({ 
  activeServersCount = 2 
}) => {
  // Live fluctuating simulation for IOPS and real-time feel
  const [liveIops, setLiveIops] = useState<number>(104.8);
  const [livePing, setLivePing] = useState<number>(14.2);
  const [chartJitter, setChartJitter] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveIops(+(104 + Math.random() * 2.2).toFixed(1));
      setLivePing(+(13.8 + Math.random() * 2.1).toFixed(1));
      setChartJitter(j => (j + 1) % 100);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const stats: WidgetStat[] = [
    {
      id: 'iops-performance',
      title: 'Performa MaxIOPS',
      value: `${liveIops}K`,
      change: '24%',
      comparison: 'vs. SSD Standar',
      icon: Cpu,
      color: 'cyan',
      chartData: [
        { value: 18 + (chartJitter % 3) },
        { value: 26 - (chartJitter % 2) },
        { value: 22 + (chartJitter % 4) },
        { value: 34 },
        { value: 30 + (chartJitter % 3) },
        { value: 44 - (chartJitter % 2) },
        { value: 54 + (chartJitter % 5) },
      ],
    },
    {
      id: 'active-cloud-nodes',
      title: 'Server Aktif Global',
      value: `${activeServersCount > 0 ? activeServersCount : 24} Nodes`,
      change: '18%',
      comparison: 'di 8 Datacenter',
      icon: Server,
      color: 'blue',
      chartData: [
        { value: 12 + (chartJitter % 2) },
        { value: 22 },
        { value: 18 + (chartJitter % 3) },
        { value: 32 - (chartJitter % 2) },
        { value: 28 + (chartJitter % 4) },
        { value: 42 },
        { value: 50 + (chartJitter % 3) },
      ],
    },
    {
      id: 'qris-auto-deploy',
      title: 'Aktivasi Otomatis QRIS',
      value: '< 28 Detik',
      change: '32%',
      comparison: 'Auto Provisioning',
      icon: Zap,
      color: 'emerald',
      chartData: [
        { value: 14 },
        { value: 20 + (chartJitter % 3) },
        { value: 16 - (chartJitter % 2) },
        { value: 30 + (chartJitter % 4) },
        { value: 26 },
        { value: 44 + (chartJitter % 3) },
        { value: 52 - (chartJitter % 2) },
      ],
    },
    {
      id: 'network-latency',
      title: 'Jaringan & Latensi SG3',
      value: `${livePing} ms`,
      change: '15%',
      comparison: 'Port 1 Gbps Aktif',
      icon: Activity,
      color: 'purple',
      chartData: [
        { value: 16 + (chartJitter % 2) },
        { value: 28 - (chartJitter % 3) },
        { value: 22 },
        { value: 34 + (chartJitter % 3) },
        { value: 28 - (chartJitter % 2) },
        { value: 46 + (chartJitter % 4) },
        { value: 56 },
      ],
    },
  ];

  return (
    <section className="w-full mb-6">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Telemetri Realtime UpCloud MaxIOPS & QRIS
          </h3>
        </div>
        <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400/90 flex items-center gap-1 font-semibold">
          <Sparkles className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
          Live Metrics
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const style = colorStyles[stat.color];

          return (
            <div
              key={stat.id}
              className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border ${style.border} bg-white dark:bg-slate-900/90 p-5 text-slate-900 dark:text-white shadow-sm shadow-slate-200/50 dark:shadow-none ${style.glow} backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5`}
            >
              {/* Top-Right Corner Accent */}
              <div
                className={`pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20 dark:opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-50 dark:group-hover:opacity-60 ${style.cornerGlow} hidden dark:block`}
                aria-hidden="true"
              />

              {/* Title & Icon Header */}
              <div className="relative z-10 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border p-2 shadow-sm transition-transform duration-300 group-hover:scale-105 ${style.iconBg}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {stat.title}
                </span>
              </div>

              {/* Metric Value & Trend Row */}
              <div className="relative z-10 mt-4 flex items-center gap-3.5">
                <span className="text-2xl font-bold tracking-tight whitespace-nowrap text-slate-900 dark:text-white sm:text-3xl font-mono">
                  {stat.value}
                </span>

                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 sm:text-sm">
                    <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>{stat.change}</span>
                  </div>
                  <span className="text-[11px] font-normal whitespace-nowrap text-slate-500 dark:text-slate-400 sm:text-xs">
                    {stat.comparison}
                  </span>
                </div>
              </div>

              {/* Bottom Sparkline Mini Area Chart */}
              <div className="relative mt-4 h-16 w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stat.chartData}
                    margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id={`gradient-${stat.id}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={style.stopColor}
                          stopOpacity={0.45}
                        />
                        <stop
                          offset="100%"
                          stopColor={style.stopColor}
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="natural"
                      dataKey="value"
                      stroke={style.stroke}
                      strokeWidth={2.5}
                      fill={`url(#gradient-${stat.id})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RealtimeStatsWidget;
