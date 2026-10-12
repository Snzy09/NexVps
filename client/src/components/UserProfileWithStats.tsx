import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Mail, 
  Settings, 
  Star, 
  Users, 
  Activity, 
  ShieldCheck, 
  Server, 
  Copy, 
  Check, 
  Camera, 
  Save, 
  X, 
  Sparkles, 
  Clock, 
  Upload,
  CheckCircle2,
  ExternalLink,
  User as UserIcon,
  Fingerprint,
  Wallet,
  Crown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useNotification } from "@/contexts/NotificationContext";
import { api } from "@/services/api";
import type { Order } from "@/types";

// Curated stylish avatar presets
const AVATAR_PRESETS = [
  { label: "Cyber Guy", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
  { label: "Developer", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" },
  { label: "Tech Lead", url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80" },
  { label: "Designer", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
  { label: "Cool Anime", url: "https://api.dicebear.com/7.x/bottts/svg?seed=NexVpsCyber" },
  { label: "Pixel Hacker", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=AdminSanzzy" },
];

interface UserProfileWithStatsProps {
  onOpenAuth?: (tab?: "login" | "register") => void;
  onNavigateTab?: (tab: "store" | "servers" | "admin" | "changelog" | "profile") => void;
}

export default function UserProfileWithStats({
  onOpenAuth,
  onNavigateTab
}: UserProfileWithStatsProps) {
  const { user, isAdmin, updateUserProfile } = useAuth();
  const toast = useToast();
  const { notify } = useNotification();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
  const [userServers, setUserServers] = useState<Order[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form edit states
  const [nickname, setNickname] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [photoURL, setPhotoURL] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setNickname(user.displayName || user.email.split("@")[0]);
      setUsername(user.username || user.email.split("@")[0].toLowerCase());
      setTitle(user.title || (user.isAdmin ? "Lead Cloud Architect" : "Cloud Developer"));
      setBio(user.bio || "Deploying high-performance MaxIOPS Cloud VPS on NexVps infrastructure.");
      setPhotoURL(user.photoURL || "");

      // Fetch user's real servers
      api.getServers(user.email, user.uid).then((res) => {
        setUserServers(res);
      }).catch(() => {});
    }
  }, [user]);

  const copyToClipboard = (text: string, field: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Berhasil Disalin", text);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {}
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran Terlalu Besar", "Maksimal ukuran foto adalah 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPhotoURL(dataUrl);
        toast.info("Foto Dimuat", "Klik 'Simpan Perubahan' untuk menerapkan foto profil.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUserProfile({
        displayName: nickname.trim(),
        username: username.trim().replace(/^@/, ""),
        title: title.trim(),
        bio: bio.trim(),
        photoURL: photoURL.trim()
      });

      notify({
        title: "Profil Berhasil Diperbarui! ✨",
        desc: `Nama profil sekarang: ${nickname.trim()} (@${username.trim()}).`,
        category: "security",
        status: "success"
      });

      setIsEditing(false);
      setActiveTab("overview");
    } catch (err: any) {
      toast.error("Gagal Memperbarui Profil", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // If user is not logged in, prompt to log in or register
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center space-y-5">
        <div className="size-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-xl">
          <UserIcon className="size-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Profil & Pengaturan Akun
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Silakan masuk ke akun NexVps Cloud Anda untuk melihat statistik server, menyesuaikan nama panggilan, username, dan foto profil.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button onClick={() => onOpenAuth?.("login")} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6">
            Masuk Akun
          </Button>
          <Button variant="outline" onClick={() => onOpenAuth?.("register")}>
            Daftar Baru
          </Button>
        </div>
      </div>
    );
  }

  const activeServersCount = userServers.filter((s) => s.vpsStatus === "ACTIVE").length;
  const initials = (user.displayName || user.email.split("@")[0]).substring(0, 2).toUpperCase();

  // Calculate total spending from user orders / servers
  const totalSpending = React.useMemo(() => {
    if (!user) return 0;
    const seenIds = new Set<string>();
    let sum = 0;

    userServers.forEach((srv) => {
      seenIds.add(srv.id);
      sum += srv.totalAmountIdr || srv.baseAmountIdr || 0;
    });

    try {
      const rawOrders = localStorage.getItem("nexvps_demo_orders");
      if (rawOrders) {
        const orders: Order[] = JSON.parse(rawOrders);
        orders.forEach((ord) => {
          if (!seenIds.has(ord.id)) {
            const matchesUser = 
              (user.email && ord.customerEmail?.toLowerCase() === user.email.toLowerCase()) ||
              (user.uid && ord.userId === user.uid);
            if (matchesUser) {
              seenIds.add(ord.id);
              sum += ord.totalAmountIdr || ord.baseAmountIdr || 0;
            }
          }
        });
      }
    } catch {}

    // Fallback baseline for demo admin if initial server is counted
    if (sum === 0 && user.isAdmin) {
      sum = 150000;
    }

    return sum;
  }, [user, userServers]);

  // Determine user level based on total spending:
  // < 100000: Bronze
  // >= 100000 && < 200000: Silver
  // >= 200000 && < 500000: Gold
  // >= 500000 && < 1000000: Master
  // >= 1000000: GrandMaster
  const userTier = React.useMemo(() => {
    if (totalSpending < 100000) {
      return {
        level: "Bronze",
        badgeStyle: "bg-amber-700/20 text-amber-500 border-amber-600/30",
        iconColor: "text-amber-500",
        iconBg: "bg-amber-500/10 border-amber-500/20",
        textColor: "text-amber-500",
        desc: "Belanja < Rp 100rb"
      };
    } else if (totalSpending < 200000) {
      return {
        level: "Silver",
        badgeStyle: "bg-slate-400/20 text-slate-300 border-slate-400/30",
        iconColor: "text-slate-300",
        iconBg: "bg-slate-400/10 border-slate-400/20",
        textColor: "text-slate-300",
        desc: "Belanja Rp 100rb - 200rb"
      };
    } else if (totalSpending < 500000) {
      return {
        level: "Gold",
        badgeStyle: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        iconColor: "text-yellow-400",
        iconBg: "bg-yellow-400/10 border-yellow-400/20",
        textColor: "text-yellow-400",
        desc: "Belanja Rp 200rb - 500rb"
      };
    } else if (totalSpending < 1000000) {
      return {
        level: "Master",
        badgeStyle: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        iconColor: "text-purple-400",
        iconBg: "bg-purple-500/10 border-purple-500/20",
        textColor: "text-purple-400",
        desc: "Belanja Rp 500rb - 1jt"
      };
    } else {
      return {
        level: "GrandMaster",
        badgeStyle: "bg-rose-500/20 text-rose-400 border-rose-500/30",
        iconColor: "text-rose-400",
        iconBg: "bg-rose-500/10 border-rose-500/20",
        textColor: "text-rose-400",
        desc: "Belanja > Rp 1jt"
      };
    }
  }, [totalSpending]);

  const formattedSpending = React.useMemo(() => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(totalSpending);
  }, [totalSpending]);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12 pt-2 sm:pt-4">
      {/* Top Header matching user screenshot */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Profile
            </h1>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${userTier.badgeStyle}`}>
              <Crown className="size-3" />
              <span>{userTier.level}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola identitas publik, foto profil, dan konfigurasi akun cloud Anda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "settings" || isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIsEditing(!isEditing);
              setActiveTab(isEditing ? "overview" : "settings");
            }}
            className="cursor-pointer"
          >
            <Edit className="mr-2 size-4" />
            {isEditing ? "View Profile" : "Edit Profile"}
          </Button>

          <Button
            variant={activeTab === "settings" && !isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTab("settings");
              setIsEditing(true);
            }}
            className="cursor-pointer"
          >
            <Settings className="mr-2 size-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 items-start">
        {/* Left Sidebar Card matching user screenshot */}
        <div className="lg:col-span-4 xl:col-span-4">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900/90">
            <div className="p-6 pt-8 pb-6 flex flex-col items-center text-center">
              <div className="relative group">
                <Avatar className="size-24 border-2 border-cyan-400/50 shadow-xl">
                  <AvatarImage
                    src={user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                    alt={user.displayName || "User Avatar"}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-extrabold text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Quick Change Photo Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setActiveTab("settings");
                  }}
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-semibold transition-opacity cursor-pointer backdrop-blur-[2px]"
                  title="Ganti Foto Profil"
                >
                  <Camera className="size-5 mb-0.5" />
                  <span>Ubah Foto</span>
                </button>
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white truncate max-w-full tracking-tight">
                {user.displayName || "John Doe"}
              </h2>
              
              <p className="text-slate-500 dark:text-slate-400 text-xs font-mono mt-0.5 truncate max-w-full">
                @{user.username || user.email.split("@")[0].toLowerCase()}
              </p>

              <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
                <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                  {user.title || (user.isAdmin ? "Lead Cloud Architect" : "Product Designer")}
                </p>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${userTier.badgeStyle}`}>
                  <Crown className="size-2.5" />
                  <span>{userTier.level}</span>
                </span>
              </div>

              <Badge 
                className="mt-2.5 font-mono text-[11px]" 
                variant={user.isAdmin ? "cyan" : "secondary"}
              >
                {user.isAdmin ? "Admin Verified" : (user.role || "Pro Member")}
              </Badge>

              {/* Message / Support Button */}
              <Button 
                className="mt-5 w-full bg-white text-slate-950 hover:bg-slate-100 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 font-bold text-xs py-2.5 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all" 
                size="sm"
                onClick={() => window.open(`https://wa.me/6281234567890?text=Halo%20Admin%20NexVps,%20saya%20${encodeURIComponent(user.displayName || user.email)}`, '_blank')}
              >
                <Mail className="size-3.5" />
                Hubungi Support
              </Button>
            </div>

            {/* User Metadata list matching screenshot */}
            <div className="px-6 pb-6 pt-5 border-t border-slate-200 dark:border-slate-800/80 space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Member since</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user.memberSince || "Jan 2026"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Last active</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-500 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online Now
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Role</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {user.isAdmin ? "Super Admin" : "Customer / Developer"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500 dark:text-slate-400">Email</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(user.email, "email")}
                  className="font-mono text-[11px] text-cyan-500 dark:text-cyan-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                  title="Klik untuk salin email"
                >
                  <span>{user.email}</span>
                  {copiedField === "email" ? (
                    <Check className="size-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="size-3 opacity-70 hover:opacity-100 shrink-0" />
                  )}
                </button>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">UID Akun</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(user.uid, "uid")}
                  className="font-mono text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 cursor-pointer"
                  title="Klik untuk salin UID"
                >
                  <span>{user.uid.length > 14 ? `${user.uid.substring(0, 10)}...` : user.uid}</span>
                  {copiedField === "uid" ? (
                    <Check className="size-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="size-3 opacity-70 hover:opacity-100 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Main Content */}
        <div className="space-y-6 lg:col-span-8 xl:col-span-8">
          {/* Settings / Edit Mode Panel */}
          {activeTab === "settings" || isEditing ? (
            <Card className="p-0 border border-cyan-500/30 dark:border-cyan-500/20 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4">
              <div className="bg-slate-100 dark:bg-slate-900/90 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit className="size-4 text-cyan-400" />
                    <span>Edit Profile & User Settings</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Perbarui nama panggilan (nickname), username handle, dan foto profil Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setActiveTab("overview");
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <CardContent className="p-6">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Photo Profile Section */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Foto Profil (Photo Profile)
                    </label>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <Avatar className="size-20 border-2 border-cyan-400 shrink-0 shadow-lg">
                        <AvatarImage src={photoURL} alt="Preview Avatar" />
                        <AvatarFallback className="bg-slate-800 text-cyan-400 font-bold text-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-2 flex-1 w-full">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={photoURL}
                            onChange={(e) => setPhotoURL(e.target.value)}
                            placeholder="https://example.com/photo.png"
                            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                          />
                          <label className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                            <Upload className="size-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Presets */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[11px] text-slate-500 font-semibold mr-1">Pilihan Cepat:</span>
                          {AVATAR_PRESETS.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setPhotoURL(preset.url)}
                              className={`px-2 py-1 text-[11px] rounded-lg border transition-all cursor-pointer ${
                                photoURL === preset.url
                                  ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 font-semibold"
                                  : "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nickname & Username Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Nama Panggilan (Nickname / Display Name)
                      </label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Contoh: John Doe"
                        required
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Username Handle (@username)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">
                          @
                        </span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ""))}
                          placeholder="johndoe"
                          required
                          className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title & Bio Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Profesi / Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Product Designer / Cloud Engineer"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Biografi Singkat (Bio)
                      </label>
                      <input
                        type="text"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Deskripsi ringkas profil Anda..."
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* User Information Summary Card */}
                  <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Fingerprint className="size-4 text-cyan-400" />
                      <span>Informasi Akun & Keamanan</span>
                    </h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block">Akun UID:</span>
                        <span className="font-mono text-slate-300">{user.uid.substring(0, 14)}...</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Status Akses:</span>
                        <span className="text-emerald-400 font-semibold">{user.isAdmin ? "Administrator Penuh" : "Standard Developer"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Server Aktif:</span>
                        <span className="font-semibold text-slate-200">{activeServersCount} VPS MaxIOPS</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setActiveTab("overview");
                      }}
                      className="cursor-pointer"
                    >
                      Batal
                    </Button>

                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 cursor-pointer shadow-lg shadow-cyan-500/20"
                    >
                      {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : null}

          {/* Stats Cards: Jumlah VPS, Total Pengeluaran & Level Akun */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Card 1: Jumlah VPS yang Dimiliki */}
            <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:border-slate-700 transition-all rounded-2xl bg-white dark:bg-slate-900/80">
              <div className="p-5 sm:p-6 flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Server className="size-5 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                    {userServers.length} <span className="text-base font-semibold text-slate-400">VPS</span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium pt-2 truncate flex items-center gap-1.5">
                    <span>VPS Dimiliki</span>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {activeServersCount} Aktif
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Card 2: Total Pengeluaran */}
            <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:border-slate-700 transition-all rounded-2xl bg-white dark:bg-slate-900/80">
              <div className="p-5 sm:p-6 flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Wallet className="size-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight truncate">
                    {formattedSpending}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium pt-2 truncate flex items-center gap-1.5">
                    <span>Total Pengeluaran</span>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      QRIS Paid
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Card 3: Level Akun (Bronze, Silver, Gold, Master, GrandMaster) */}
            <Card className="border border-slate-200 dark:border-slate-800 shadow-md hover:border-slate-700 transition-all rounded-2xl bg-white dark:bg-slate-900/80">
              <div className="p-5 sm:p-6 flex items-center gap-4">
                <div className={`size-12 rounded-2xl ${userTier.iconBg} border flex items-center justify-center shrink-0`}>
                  <Crown className={`size-5 ${userTier.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-2xl font-black ${userTier.textColor} leading-none tracking-tight`}>
                      {userTier.level}
                    </p>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${userTier.badgeStyle}`}>
                      Tier
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium pt-2 truncate">
                    Level Member ({userTier.desc})
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity Card matching user screenshot */}
          <Card className="border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="size-4 text-cyan-400" />
                  <span>Recent Activity</span>
                </h3>

                <button
                  type="button"
                  onClick={() => onNavigateTab?.("servers")}
                  className="text-xs text-cyan-500 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <span>Lihat Server Aktif</span>
                  <ExternalLink className="size-3" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Dynamically render real server activity if available, plus screenshot baseline items */}
                {userServers.length > 0 ? (
                  userServers.slice(0, 3).map((srv) => (
                    <div
                      key={srv.id}
                      className="flex items-start gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4 last:border-0"
                    >
                      <div className="size-9 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 text-cyan-400">
                        <Server className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          VPS Aktif: &quot;{srv.hostname}&quot;
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          {srv.templateName || "Ubuntu Server 24.04 LTS (Noble Numbat)"} · IP: {srv.serverIp || "94.237.70.40"}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 shrink-0 pt-0.5">
                        {new Date(srv.createdAt).toLocaleDateString("id-ID", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <div className="size-9 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 text-cyan-400">
                      <Server className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        VPS Aktif: &quot;server.nexvps.cloud&quot;
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                        Ubuntu Server 24.04 LTS (Noble Numbat) · IP: 94.237.70.40
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 shrink-0 pt-0.5">
                      9 Okt
                    </span>
                  </div>
                )}

                {/* Baseline items matching user template */}
                {[
                  { text: 'Completed project "Dashboard UI"', time: "2 hours ago" },
                  { text: 'Verified BuatQRIS Dynamic Payment', time: "Yesterday" },
                  { text: 'Configured Singapore Edge Datacenter', time: "3 days ago" },
                ].map((act, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4 last:border-0"
                  >
                    <div className="size-9 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 text-slate-400">
                      <Star className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {act.text}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                        {act.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
