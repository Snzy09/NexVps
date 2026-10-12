import React, { useState, useEffect } from 'react';
import { 
  SidebarNav, 
  SidebarTrigger 
} from './ui/sidebar';
import { 
  Search, 
  Terminal, 
  Sliders, 
  LogOut, 
  LogIn, 
  HardDrive, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Command,
  X,
  Check,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SwitchAnimatedTheme from './SwitchAnimatedTheme';
import { DropdownMenuNotifications } from './DropdownMenuNotifications';

interface AppSidebarNavProps {
  currentTab: 'store' | 'servers' | 'admin' | 'changelog' | 'profile' | 'support';
  setCurrentTab: (tab: 'store' | 'servers' | 'admin' | 'changelog' | 'profile' | 'support') => void;
  activeServersCount: number;
  onOpenAuth: (defaultTab?: 'login' | 'register', adminOnly?: boolean) => void;
}

export const AppSidebarNav: React.FC<AppSidebarNavProps> = ({
  currentTab,
  setCurrentTab,
  activeServersCount,
  onOpenAuth
}) => {
  const { user, isAdmin, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = [
    { title: 'Starter Cloud (1 vCPU, 1 GB)', cat: 'Paket VPS', action: () => { setCurrentTab('store'); setSearchOpen(false); } },
    { title: 'Pro Developer (2 vCPU, 2 GB)', cat: 'Paket VPS', action: () => { setCurrentTab('store'); setSearchOpen(false); } },
    { title: 'Business Cloud (2 vCPU, 4 GB)', cat: 'Paket VPS', action: () => { setCurrentTab('store'); setSearchOpen(false); } },
    { title: 'Enterprise Power (4 vCPU, 8 GB)', cat: 'Paket VPS', action: () => { setCurrentTab('store'); setSearchOpen(false); } },
    { title: 'Server Saya & Live Status', cat: 'Navigasi', action: () => { setCurrentTab('servers'); setSearchOpen(false); } },
    { title: 'Pusat Bantuan & Chat Admin 24/7', cat: 'Support', action: () => { setCurrentTab('support'); setSearchOpen(false); } },
    { title: 'Kontak WhatsApp & Gmail Admin', cat: 'Support', action: () => { setCurrentTab('support'); setSearchOpen(false); } },
    { title: 'Profil & Pengaturan Akun', cat: 'Navigasi', action: () => { setCurrentTab('profile'); setSearchOpen(false); } },
    { title: 'Changelog Platform & Roadmap', cat: 'Navigasi', action: () => { setCurrentTab('changelog'); setSearchOpen(false); } },
    { title: 'Admin & Pengaturan Tarif', cat: 'Admin', action: () => { setCurrentTab('admin'); setSearchOpen(false); } },
    { title: 'Dokumentasi UpCloud API 1.3', cat: 'Docs', action: () => { window.open('https://developers.upcloud.com/api/1.3', '_blank'); setSearchOpen(false); } },
  ].filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.cat.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <SidebarNav>
        {/* Left Side: SidebarTrigger & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1 lg:ml-0" />

          {/* Breadcrumbs (Intent UI AppSidebarNav style) */}
          <nav aria-label="Breadcrumbs" className="hidden sm:flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer" onClick={() => setCurrentTab('store')}>
              NexVps Cloud
            </span>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="text-slate-900 dark:text-slate-200">
              {currentTab === 'store' ? 'Katalog Paket VPS' :
               currentTab === 'servers' ? 'Server Saya' :
               currentTab === 'changelog' ? 'Changelog Platform' :
               currentTab === 'profile' ? 'Profil & Pengaturan User' : 
               currentTab === 'support' ? 'Pusat Bantuan & Support Admin' : 'Panel Administrator'}
            </span>
          </nav>
        </div>

        {/* Right Side: Search, Notifications & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Button (Ctrl + K) */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-36 sm:w-56 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/70 px-3 text-xs text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer shadow-inner"
          >
            <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate text-left text-[11px]">Cari...</span>
            <span className="ml-auto hidden rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-1 py-0.2 font-mono text-[9px] text-slate-500 sm:inline-block">
              ⌘K
            </span>
          </button>

          {/* Animated Celestial Theme Switcher */}
          <div className="flex items-center px-1" title="Beralih Tema (Dark / Light)">
            <SwitchAnimatedTheme variant="celestial" size="sm" showLabel={false} />
          </div>

          {/* Notifications Dropdown matching screenshot */}
          <DropdownMenuNotifications onNavigateTab={setCurrentTab} />

          {/* User Profile Menu */}
          <div className="relative">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                }}
                className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-cyan-500/50 transition-all cursor-pointer"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || user.email}
                    className="h-8 w-8 rounded-full object-cover border border-slate-700 ring-1 ring-cyan-500/40"
                  />
                ) : (
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs ring-1 ${
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

            {profileOpen && user && (
              <div className="absolute right-0 top-11 z-50 w-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/95 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95">
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.displayName || 'Akun Cloud'}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</p>
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={() => { setCurrentTab('profile'); setProfileOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                    <span>Profil & Pengaturan Akun</span>
                  </button>

                  <button
                    onClick={() => { setCurrentTab('servers'); setProfileOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span>Server Saya ({activeServersCount})</span>
                  </button>

                  {user.isAdmin && (
                    <button
                      onClick={() => { setCurrentTab('admin'); setProfileOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-slate-900 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                      <span>Panel Administrator</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-slate-200 dark:border-slate-800" />

                  <button
                    onClick={() => { logout(); setProfileOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarNav>

      {/* Global Command Palette Modal (Ctrl + K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-3 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3 px-2">
              <Search className="h-4 w-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Cari paket cloud, server, atau menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto space-y-1">
              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Tidak ditemukan hasil untuk "{searchQuery}"
                </div>
              ) : (
                searchResults.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                      {item.cat}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 px-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Navigasi Cepat</span>
              <span>ESC untuk tutup</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppSidebarNav;
