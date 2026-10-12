import React, { useState, useEffect, useRef } from 'react';
import { 
  Server, 
  PanelLeft, 
  Search, 
  Settings, 
  Bell, 
  HardDrive, 
  Terminal, 
  Sliders, 
  LogOut, 
  LogIn, 
  Lock, 
  X, 
  Check, 
  CheckCircle2, 
  Zap, 
  ExternalLink, 
  ChevronRight, 
  Command, 
  Sparkles,
  Globe2,
  Cpu
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentTab: 'store' | 'servers' | 'admin';
  setCurrentTab: (tab: 'store' | 'servers' | 'admin') => void;
  activeServersCount: number;
  onOpenAuth: (defaultTab?: 'login' | 'register', adminOnly?: boolean) => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'server' | 'payment' | 'system';
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  activeServersCount,
  onOpenAuth 
}) => {
  const { user, isAdmin, logout } = useAuth();
  
  // States
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  // Mock Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Server SG3 Running',
      description: 'UpCloud MaxIOPS Equinix Singapore aktif & siap diakses.',
      time: 'Baru saja',
      unread: true,
      type: 'server',
    },
    {
      id: '2',
      title: 'QRIS Pembayaran Berhasil',
      description: 'Transaksi Pro Developer 2 vCPU terverifikasi otomatis.',
      time: '5m lalu',
      unread: true,
      type: 'payment',
    },
    {
      id: '3',
      title: 'Koneksi 1 Gbps Stabil',
      description: 'Latensi ke Singapore ~15 ms tanpa packet loss.',
      time: '1j lalu',
      unread: true,
      type: 'system',
    },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Global Ctrl + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSidebarOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search Results
  const searchResults = [
    { title: 'Starter Cloud (1 vCPU, 1 GB)', cat: 'Paket VPS', action: () => { setCurrentTab('store'); setSearchOpen(false); } },
    { title: 'Pro Developer (2 vCPU, 2 GB)', cat: 'Paket VPS', action: () => { setCurrentTab('store'); setSearchOpen(false); } },
    { title: 'Business Cloud (2 vCPU, 4 GB)', cat: 'Paket VPS', action: () => { setCurrentTab('store'); setSearchOpen(false); } },
    { title: 'Enterprise Power (4 vCPU, 8 GB)', cat: 'Paket VPS', action: () => { setCurrentTab('store'); setSearchOpen(false); } },
    { title: 'Server Saya & Live Status', cat: 'Navigasi', action: () => { setCurrentTab('servers'); setSearchOpen(false); } },
    { title: 'Admin & Pengaturan Tarif', cat: 'Admin', action: () => { setCurrentTab('admin'); setSearchOpen(false); } },
    { title: 'Dokumentasi UpCloud API 1.3', cat: 'Docs', action: () => { window.open('https://developers.upcloud.com/api/1.3', '_blank'); setSearchOpen(false); } },
  ].filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.cat.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      {/* ----------------- TOP NAVBAR HEADER ----------------- */}
      <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-950/85 px-3 sm:px-6 backdrop-blur-xl">
        
        {/* Left Section: Sidebar Trigger & Search Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sidebar Trigger Button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Toggle Navigation Sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            title="Menu Navigasi"
          >
            <PanelLeft className="h-4.5 w-4.5" />
          </button>

          {/* Search Bar (Ctrl + K) */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-44 sm:w-60 md:w-72 items-center gap-2 rounded-xl border border-slate-800/90 bg-slate-900/70 px-3 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-all cursor-pointer shadow-inner"
          >
            <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span className="truncate text-left text-[11px] sm:text-xs">Ctrl + K</span>
            <span className="ml-auto hidden rounded border border-slate-800 bg-slate-950 px-1.5 py-0.5 font-mono text-[9px] text-slate-500 sm:inline-block">
              ⌘K
            </span>
          </button>
        </div>

        {/* Center Section: Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-2xl border border-slate-800/90 bg-slate-900/80 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setCurrentTab('store')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'store'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <HardDrive className="h-3.5 w-3.5" />
            <span>Katalog & Beli</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('servers')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'servers'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Server Saya</span>
            {activeServersCount > 0 && (
              <span className="ml-0.5 rounded-full bg-cyan-400 px-1.5 py-0.2 text-[9px] font-black text-slate-950">
                {activeServersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('admin')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'admin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            {isAdmin ? <Sliders className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5 text-amber-400" />}
            <span>Admin</span>
            {!isAdmin && (
              <span className="rounded bg-amber-500/20 border border-amber-500/30 px-1 text-[8px] font-mono text-amber-300">
                KUNCI
              </span>
            )}
          </button>
        </nav>

        {/* Right Section: Settings, Divider, Notification, Divider, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Settings Button */}
          <button
            type="button"
            onClick={() => {
              if (isAdmin) {
                setCurrentTab('admin');
              } else {
                onOpenAuth('login', true);
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            title="Pengaturan & Admin"
            aria-label="Settings"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>

          {/* Divider 1 */}
          <div className="h-4 w-px bg-slate-800/90" />

          {/* Notification Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              title="Notifikasi"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-slate-950 ring-2 ring-slate-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-80 sm:w-88 rounded-2xl border border-slate-800 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Notifikasi Cloud</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        item.unread 
                          ? 'bg-slate-900/80 border-cyan-500/30 shadow-sm' 
                          : 'bg-slate-900/30 border-slate-800/60 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${item.unread ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                          <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 pl-3 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider 2 */}
          <div className="h-4 w-px bg-slate-800/90" />

          {/* User Profile */}
          <div className="relative">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="relative flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-cyan-500/50 transition-all cursor-pointer"
                title={user.email}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || user.email}
                    className="h-9 w-9 rounded-full object-cover border border-slate-700 ring-1 ring-cyan-500/40"
                  />
                ) : (
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-xs ring-1 ${
                    user.isAdmin 
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white ring-purple-500/40' 
                      : 'bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 ring-cyan-500/40'
                  }`}>
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:brightness-110 transition-all cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Masuk</span>
              </button>
            )}

            {/* Profile Dropdown */}
            {profileOpen && user && (
              <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-slate-800 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95">
                <div className="p-3 border-b border-slate-800/80 mb-1">
                  <p className="text-xs font-bold text-white truncate">{user.displayName || 'Akun Pengguna'}</p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
                  <div className="mt-1.5">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      user.isAdmin 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {user.isAdmin ? 'ADMINISTRATOR' : 'PELANGGAN CLOUD'}
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={() => { setCurrentTab('servers'); setProfileOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Server Saya ({activeServersCount})</span>
                  </button>

                  {user.isAdmin && (
                    <button
                      onClick={() => { setCurrentTab('admin'); setProfileOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-purple-300 hover:text-white hover:bg-slate-900 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5 text-purple-400" />
                      <span>Panel Administrator</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-slate-800/80" />

                  <button
                    onClick={() => { logout(); setProfileOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ----------------- COMMAND PALETTE MODAL (Ctrl + K) ----------------- */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-2xl">
            {/* Search Input */}
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3 px-2">
              <Search className="h-4 w-4 text-cyan-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Cari paket cloud, datacenter, atau halaman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="py-2 space-y-1 max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors cursor-pointer group"
                  >
                    <span className="text-xs text-slate-300 group-hover:text-white font-medium">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                      {item.cat}
                    </span>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  Tidak ada hasil yang cocok dengan "{searchQuery}".
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 px-2 font-mono">
              <span>Navigasi Cepat</span>
              <span>ESC untuk tutup</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SIDEBAR DRAWER (SidebarTrigger) ----------------- */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setSidebarOpen(false)} 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
          />

          {/* Drawer Body */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-slate-950 border-r border-slate-800 p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              {/* Brand Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-black text-white text-base">NexVps.</span>
                    <span className="block text-[10px] text-cyan-400 font-mono font-semibold">CLOUD CONTROL</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1.5 font-medium">
                <button
                  type="button"
                  onClick={() => { setCurrentTab('store'); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    currentTab === 'store'
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span>Katalog Paket VPS</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setCurrentTab('servers'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    currentTab === 'servers'
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>Server Saya</span>
                  </div>
                  {activeServersCount > 0 && (
                    <span className="rounded-full bg-cyan-400 px-1.5 py-0.2 text-[9px] font-bold text-slate-950">
                      {activeServersCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setCurrentTab('admin'); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    currentTab === 'admin'
                      ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Admin Dashboard</span>
                </button>

                <div className="pt-4 mt-4 border-t border-slate-900" />

                <span className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Integrasi & Layanan
                </span>

                <a
                  href="https://developers.upcloud.com/api/1.3"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <span>UpCloud API Docs</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>

                <a
                  href="https://app.buatqris.site/dasbort"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <span>BuatQRIS Dasbor</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="pt-4 border-t border-slate-900 text-xs text-slate-500">
              <p className="font-semibold text-slate-300">NexVps Cloud</p>
              <p className="text-[11px] mt-0.5">UpCloud MaxIOPS & BuatQRIS</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
