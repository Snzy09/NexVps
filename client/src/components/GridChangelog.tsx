import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Bug, 
  Plus, 
  Clock, 
  Layers, 
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

export interface ChangelogUpdateItem {
  id: string;
  title: string;
  type: "feature" | "improvement" | "fix";
  date: string;
  description?: string;
}

export interface VersionChangelog {
  version: string;
  date: string;
  isLatest?: boolean;
  features: string[];
  improvements: string[];
  fixes: string[];
}

// Initial chronological updates of the NexVps Platform
// Organized so each threshold cycle (3 features OR 2 fixes OR 2 improvements) cuts a new version:
// Cycle 1: Version 1.0.0
// Cycle 2: Version 1.2.0
// Cycle 3: Version 2.0.0 (Latest)
const INITIAL_RAW_UPDATES: ChangelogUpdateItem[] = [
  // --- Cycle 1: Version 1.0.0 (Foundation & Engine) ---
  {
    id: "upd-1",
    title: "UpCloud MaxIOPS Integration via API 1.3 with 100K+ IOPS",
    type: "feature",
    date: "January 15, 2026",
  },
  {
    id: "upd-2",
    title: "BuatQRIS Dynamic QRIS payment gateway with instant webhook",
    type: "feature",
    date: "January 15, 2026",
  },
  {
    id: "upd-3",
    title: "Interactive VPS Configurator with live hourly/monthly pricing",
    type: "feature",
    date: "January 15, 2026",
  },
  {
    id: "upd-4",
    title: "Real-time system telemetry and IOPS performance metrics charts",
    type: "improvement",
    date: "January 15, 2026",
  },
  {
    id: "upd-5",
    title: "Multi-datacenter low latency edge routing across 8 global zones",
    type: "improvement",
    date: "January 15, 2026",
  },
  {
    id: "upd-6",
    title: "Corrected currency conversion formatting between IDR and USD",
    type: "fix",
    date: "January 15, 2026",
  },
  {
    id: "upd-7",
    title: "Fixed OpenSSH public key textarea multi-line validation",
    type: "fix",
    date: "January 15, 2026",
  },

  // --- Cycle 2: Version 1.2.0 (Resilience, Safety & UX) ---
  {
    id: "upd-8",
    title: "Multi-token UpCloud API Token Failover Manager with priority failover",
    type: "feature",
    date: "March 2, 2026",
  },
  {
    id: "upd-9",
    title: "UIable Destructive Alert Dialogs for server power management",
    type: "feature",
    date: "March 2, 2026",
  },
  {
    id: "upd-10",
    title: "Smooth Skeleton Loading Screen with perceived latency buffer",
    type: "feature",
    date: "March 2, 2026",
  },
  {
    id: "upd-11",
    title: "Celestial animated Day/Night switch with sky & stars animation",
    type: "improvement",
    date: "March 2, 2026",
  },
  {
    id: "upd-12",
    title: "Collapsible Timeline progress stepper for server provisioning",
    type: "improvement",
    date: "March 2, 2026",
  },
  {
    id: "upd-13",
    title: "Sanitized dummy keys in README and types to pass GitHub Push Protection",
    type: "fix",
    date: "March 2, 2026",
  },
  {
    id: "upd-14",
    title: "Resolved isolated demo data persistence across browser tabs",
    type: "fix",
    date: "March 2, 2026",
  },

  // --- Cycle 3: Version 2.0.0 (Realtime User Isolation & Cloud Deployment) ---
  {
    id: "upd-15",
    title: "Realtime user-scoped popup notifications with SwipeToast gesture support",
    type: "feature",
    date: "April 15, 2026",
  },
  {
    id: "upd-16",
    title: "Synthetic Web Audio API multi-tone chime (D5/A5) for instant notification audio",
    type: "feature",
    date: "April 15, 2026",
  },
  {
    id: "upd-17",
    title: "Automated GitHub Pages CI/CD deployment with relative base path bundling",
    type: "feature",
    date: "April 15, 2026",
  },
  {
    id: "upd-18",
    title: "Isolated per-user notification store preventing cross-user data leakage",
    type: "improvement",
    date: "April 15, 2026",
  },
  {
    id: "upd-19",
    title: "Realtime 6-second background watcher for server state transitions and orders",
    type: "improvement",
    date: "April 15, 2026",
  },
  {
    id: "upd-20",
    title: "Fixed cross-account server visibility in local demo fallback",
    type: "fix",
    date: "April 15, 2026",
  },
  {
    id: "upd-21",
    title: "Prevented redundant payment polling once order status reaches PAID",
    type: "fix",
    date: "April 15, 2026",
  },
];

/**
 * Builds version cards dynamically based on user rule:
 * Starts at Version 1.0.0.
 * After 3 new features OR 2 bug fixes OR 2 improvements, cuts a new version (1.2.0, 2.0.0, etc.) and repeats.
 */
export function buildChangelogFromUpdates(updatesList: ChangelogUpdateItem[]): VersionChangelog[] {
  const versionNames = [
    "Version 1.0.0",
    "Version 1.2.0",
    "Version 2.0.0",
    "Version 2.2.0",
    "Version 3.0.0",
    "Version 3.2.0",
    "Version 4.0.0",
  ];

  const versions: VersionChangelog[] = [];
  let currentFeatures: string[] = [];
  let currentImprovements: string[] = [];
  let currentFixes: string[] = [];
  let versionIndex = 0;
  let currentDate = updatesList[0]?.date || "Recent";

  for (const item of updatesList) {
    if (item.type === "feature") currentFeatures.push(item.title);
    else if (item.type === "improvement") currentImprovements.push(item.title);
    else if (item.type === "fix") currentFixes.push(item.title);
    currentDate = item.date;

    // Threshold check: 3 new features OR 2 bug fixes OR 2 improvements
    if (
      currentFeatures.length >= 3 ||
      currentFixes.length >= 2 ||
      currentImprovements.length >= 2
    ) {
      const vName =
        versionNames[versionIndex] ||
        `Version ${1 + Math.floor(versionIndex / 2)}.${(versionIndex % 2) * 2}.0`;

      versions.push({
        version: vName,
        date: currentDate,
        features: [...currentFeatures],
        improvements: [...currentImprovements],
        fixes: [...currentFixes],
        isLatest: false,
      });

      // Reset bucket for next release cycle
      currentFeatures = [];
      currentImprovements = [];
      currentFixes = [];
      versionIndex++;
    }
  }

  // Any ongoing updates not yet hitting the threshold roll into the active build
  if (
    currentFeatures.length > 0 ||
    currentImprovements.length > 0 ||
    currentFixes.length > 0
  ) {
    const vName =
      versionNames[versionIndex] ||
      `Version ${1 + Math.floor(versionIndex / 2)}.${(versionIndex % 2) * 2}.0 (In Progress)`;

    versions.push({
      version: vName,
      date: currentDate,
      features: [...currentFeatures],
      improvements: [...currentImprovements],
      fixes: [...currentFixes],
      isLatest: false,
    });
  }

  // Mark latest and return descending order (newest first)
  if (versions.length > 0) {
    versions[versions.length - 1].isLatest = true;
  }

  return [...versions].reverse();
}

export default function GridChangelog() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [updates, setUpdates] = useState<ChangelogUpdateItem[]>(() => {
    try {
      const saved = localStorage.getItem("nexvps_custom_changelog_updates");
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_RAW_UPDATES;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"feature" | "improvement" | "fix">("feature");

  // Dynamically calculate changelog version buckets based on the rule
  const versionChangelog = useMemo(() => {
    return buildChangelogFromUpdates(updates);
  }, [updates]);

  const handleAddUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error(
        "Akses Ditolak",
        "Hanya akun Administrator yang diizinkan menambahkan catatan changelog baru."
      );
      return;
    }
    if (!newTitle.trim()) return;

    const todayStr = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date());

    const newItem: ChangelogUpdateItem = {
      id: `upd-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      date: todayStr,
    };

    const nextUpdates = [...updates, newItem];
    setUpdates(nextUpdates);
    try {
      localStorage.setItem("nexvps_custom_changelog_updates", JSON.stringify(nextUpdates));
    } catch {}

    setNewTitle("");
    setShowAddForm(false);

    toast.success(
      "Update Berhasil Ditambahkan!",
      `Item [${newType.toUpperCase()}] dicatat ke changelog. Sistem otomatis mengevaluasi versi.`
    );
  };

  const handleResetDefaults = () => {
    if (!isAdmin) {
      toast.error(
        "Akses Ditolak",
        "Hanya akun Administrator yang diizinkan mereset data changelog."
      );
      return;
    }
    setUpdates(INITIAL_RAW_UPDATES);
    try {
      localStorage.removeItem("nexvps_custom_changelog_updates");
    } catch {}
    toast.info("Changelog Direset", "Kembali ke data default versi 1.0.0, 1.2.0, dan 2.0.0.");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <Sparkles className="size-3.5" />
          <span>Platform Release History & Roadmap</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Changelog
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          All notable changes, automated failovers, and security updates deployed to the NexVps Cloud Platform.
        </p>

        {/* Action button bar - Hanya ditampilkan untuk akun Admin */}
        {isAdmin && (
          <div className="flex flex-col items-center justify-center gap-2.5 pt-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm">
                <ShieldCheck className="size-3.5 text-cyan-400" />
                <span>Admin Mode</span>
              </span>

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-semibold rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="size-3.5" />
                <span>{showAddForm ? "Tutup Form" : "Tambah Catatan Rilis Baru"}</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                title="Reset ke default"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Form for adding new updates dynamically (Hanya untuk Admin) */}
      {isAdmin && showAddForm && (
        <form
          onSubmit={handleAddUpdate}
          className="mb-8 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-cyan-500/30 max-w-xl mx-auto shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="size-4 text-cyan-400" />
              <span>Tambah Catatan Rilis Baru</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Total Updates: {updates.length}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Deskripsi / Judul Update</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Contoh: Auto backup snapshot schedule..."
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kategori Perubahan</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setNewType("feature")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  newType === "feature"
                    ? "bg-cyan-500/15 border-cyan-500 text-cyan-700 dark:text-cyan-400 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                + New Feature
              </button>
              <button
                type="button"
                onClick={() => setNewType("improvement")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  newType === "improvement"
                    ? "bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                ⚡ Improvement
              </button>
              <button
                type="button"
                onClick={() => setNewType("fix")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  newType === "fix"
                    ? "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-400 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                🐛 Bug Fix
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              Simpan & Evaluasi Versi
            </button>
          </div>
        </form>
      )}

      {/* Tabs matching the requested GridChangelog component */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8 flex h-fit flex-wrap justify-center gap-2">
          <TabsTrigger value="all">All Updates</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
          <TabsTrigger value="fixes">Bug Fixes</TabsTrigger>
        </TabsList>

        {/* Tab 1: All Updates */}
        <TabsContent value="all" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {versionChangelog.map((ver) => (
              <Card key={ver.version} className="overflow-hidden pt-0 border border-slate-200 dark:border-slate-800 hover:border-slate-700 transition-all shadow-md">
                <CardHeader className="bg-slate-100/70 dark:bg-slate-900/90 py-3.5 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                      {ver.version}
                    </CardTitle>
                    {ver.isLatest ? (
                      <Badge variant="cyan" className="font-mono">Latest</Badge>
                    ) : (
                      <Badge variant="secondary" className="font-mono text-slate-500 text-[10px]">Archived</Badge>
                    )}
                  </div>
                  <time className="text-slate-500 dark:text-slate-400 text-xs font-mono mt-0.5 block">
                    {ver.date}
                  </time>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Features */}
                  {ver.features.length > 0 && (
                    <div>
                      <h4 className="text-cyan-500 dark:text-cyan-400 mb-2 flex items-center text-sm font-semibold">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 shrink-0"
                        >
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                          <path d="m9 12 2 2 4-4"></path>
                        </svg>
                        New Features ({ver.features.length})
                      </h4>
                      <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {ver.features.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {ver.improvements.length > 0 && (
                    <div>
                      <h4 className="mb-2 flex items-center text-sm font-semibold text-blue-500 dark:text-blue-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 shrink-0"
                        >
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                          <path d="M12 16v-4"></path>
                          <path d="M12 8h.01"></path>
                        </svg>
                        Improvements ({ver.improvements.length})
                      </h4>
                      <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {ver.improvements.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bug Fixes */}
                  {ver.fixes.length > 0 && (
                    <div>
                      <h4 className="mb-2 flex items-center text-sm font-semibold text-rose-500 dark:text-rose-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 shrink-0"
                        >
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                          <path d="M12 9v4"></path>
                          <path d="M12 17h.01"></path>
                        </svg>
                        Bug Fixes ({ver.fixes.length})
                      </h4>
                      <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {ver.fixes.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Features Only */}
        <TabsContent value="features" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {versionChangelog
              .filter((ver) => ver.features.length > 0)
              .map((ver) => (
                <Card key={ver.version} className="overflow-hidden pt-0 border border-slate-200 dark:border-slate-800 shadow-md">
                  <CardHeader className="bg-slate-100/70 dark:bg-slate-900/90 py-3.5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">{ver.version}</CardTitle>
                      {ver.isLatest ? <Badge variant="cyan">Latest</Badge> : null}
                    </div>
                    <time className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                      {ver.date}
                    </time>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <h4 className="text-cyan-500 dark:text-cyan-400 mb-2.5 flex items-center text-sm font-semibold">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 shrink-0"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                        <path d="m9 12 2 2 4-4"></path>
                      </svg>
                      New Features ({ver.features.length})
                    </h4>
                    <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {ver.features.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Tab 3: Improvements Only */}
        <TabsContent value="improvements" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {versionChangelog
              .filter((ver) => ver.improvements.length > 0)
              .map((ver) => (
                <Card key={ver.version} className="overflow-hidden pt-0 border border-slate-200 dark:border-slate-800 shadow-md">
                  <CardHeader className="bg-slate-100/70 dark:bg-slate-900/90 py-3.5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">{ver.version}</CardTitle>
                      {ver.isLatest ? <Badge variant="cyan">Latest</Badge> : null}
                    </div>
                    <time className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                      {ver.date}
                    </time>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <h4 className="mb-2.5 flex items-center text-sm font-semibold text-blue-500 dark:text-blue-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 shrink-0"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                      </svg>
                      Improvements ({ver.improvements.length})
                    </h4>
                    <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {ver.improvements.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Tab 4: Bug Fixes Only */}
        <TabsContent value="fixes" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {versionChangelog
              .filter((ver) => ver.fixes.length > 0)
              .map((ver) => (
                <Card key={ver.version} className="overflow-hidden pt-0 border border-slate-200 dark:border-slate-800 shadow-md">
                  <CardHeader className="bg-slate-100/70 dark:bg-slate-900/90 py-3.5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">{ver.version}</CardTitle>
                      {ver.isLatest ? <Badge variant="cyan">Latest</Badge> : null}
                    </div>
                    <time className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                      {ver.date}
                    </time>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <h4 className="mb-2.5 flex items-center text-sm font-semibold text-rose-500 dark:text-rose-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 shrink-0"
                      >
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                        <path d="M12 9v4"></path>
                        <path d="M12 17h.01"></path>
                      </svg>
                      Bug Fixes ({ver.fixes.length})
                    </h4>
                    <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {ver.fixes.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
