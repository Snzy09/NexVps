import React, { useState, useRef, useEffect } from 'react';
import { 
  Server, 
  HardDrive, 
  Terminal, 
  CreditCard, 
  LifeBuoy, 
  FileText, 
  HelpCircle, 
  Building2, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  LogIn,
  Sliders, 
  Activity, 
  Zap, 
  ChevronsUpDown, 
  Ellipsis, 
  ChevronRight,
  Sparkles,
  ExternalLink,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SwitchAnimatedTheme from './SwitchAnimatedTheme';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarSectionGroup,
  SidebarSection,
  SidebarItem,
  SidebarLabel,
  SidebarBadge,
  SidebarDisclosureGroup,
  SidebarDisclosure,
  SidebarDisclosureTrigger,
  SidebarDisclosurePanel,
  SidebarFooter,
  SidebarRail,
  SidebarMenuTrigger,
  useSidebar
} from './ui/sidebar';

interface AppSidebarProps {
  currentTab: 'store' | 'servers' | 'admin' | 'changelog' | 'profile';
  setCurrentTab: (tab: 'store' | 'servers' | 'admin' | 'changelog' | 'profile') => void;
  activeServersCount: number;
  onOpenAuth: (defaultTab?: 'login' | 'register', adminOnly?: boolean) => void;
  collapsible?: 'hidden' | 'dock' | 'none';
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentTab,
  setCurrentTab,
  activeServersCount,
  onOpenAuth,
  collapsible = 'dock'
}) => {
  const { state } = useSidebar();
  const { user, isAdmin, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible={collapsible}>
      {/* 1. SIDEBAR HEADER */}
      <SidebarHeader>
        <div 
          onClick={() => setCurrentTab('store')}
          className={`flex items-center gap-3 w-full cursor-pointer group ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Server className="h-5 w-5" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 animate-in fade-in">
              <span className="font-black text-white text-sm sm:text-base tracking-tight truncate block">
                NexVps <span className="text-cyan-400 font-mono text-xs">Cloud</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono block -mt-0.5">
                MAXIOPS & QRIS
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* 2. SIDEBAR CONTENT */}
      <SidebarContent>
        <SidebarSectionGroup>
          {/* Overview Section */}
          <SidebarSection label="Overview">
            {/* Katalog Paket Cloud */}
            <SidebarItem
              tooltip="Katalog & Beli VPS"
              isCurrent={currentTab === 'store'}
              onClick={() => setCurrentTab('store')}
            >
              <HardDrive className="h-4 w-4 shrink-0 text-cyan-400" />
              <SidebarLabel>Katalog Paket VPS</SidebarLabel>
            </SidebarItem>

            {/* Server Saya */}
            <SidebarItem
              tooltip="Server Saya"
              isCurrent={currentTab === 'servers'}
              onClick={() => setCurrentTab('servers')}
              badge={activeServersCount > 0 ? `${activeServersCount} Active` : undefined}
            >
              <Terminal className="h-4 w-4 shrink-0 text-emerald-400" />
              <SidebarLabel>Server Saya</SidebarLabel>
            </SidebarItem>

            {/* Admin Panel */}
            {isAdmin ? (
              <SidebarItem
                tooltip="Panel Administrator"
                isCurrent={currentTab === 'admin'}
                onClick={() => setCurrentTab('admin')}
                badge="Admin"
              >
                <Sliders className="h-4 w-4 shrink-0 text-purple-400" />
                <SidebarLabel>Panel Admin</SidebarLabel>
              </SidebarItem>
            ) : (
              <SidebarItem
                tooltip="Admin Access"
                onClick={() => onOpenAuth('login', true)}
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400" />
                <SidebarLabel>Login Admin</SidebarLabel>
              </SidebarItem>
            )}

            {/* Profil & Pengaturan User */}
            <SidebarItem
              tooltip="Profil & Pengaturan"
              isCurrent={currentTab === 'profile'}
              onClick={() => setCurrentTab('profile')}
            >
              <User className="h-4 w-4 shrink-0 text-cyan-400" />
              <SidebarLabel>Profil & Pengaturan</SidebarLabel>
            </SidebarItem>

            {/* Changelog & Catatan Rilis */}
            <SidebarItem
              tooltip="Changelog Platform"
              isCurrent={currentTab === 'changelog'}
              onClick={() => setCurrentTab('changelog')}
              badge="v2.0.0"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-cyan-400" />
              <SidebarLabel>Changelog</SidebarLabel>
            </SidebarItem>

            {/* Payment & Gateway */}
            <SidebarItem
              tooltip="BuatQRIS Gateway"
              onClick={() => window.open('https://app.buatqris.site/dasbort', '_blank')}
            >
              <CreditCard className="h-4 w-4 shrink-0 text-blue-400" />
              <SidebarLabel>Gateway QRIS</SidebarLabel>
              <SidebarBadge>Auto</SidebarBadge>
            </SidebarItem>
          </SidebarSection>

          {/* Collapsible Disclosure Groups */}
          <SidebarDisclosureGroup defaultExpandedKeys={[1]}>
            {/* Disclosure 1: Dukungan & Bantuan */}
            <SidebarDisclosure id={1}>
              <SidebarDisclosureTrigger>
                <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
                <SidebarLabel>Dukungan & Bantuan</SidebarLabel>
              </SidebarDisclosureTrigger>
              <SidebarDisclosurePanel>
                <SidebarItem 
                  tooltip="Dokumentasi API"
                  onClick={() => window.open('https://developers.upcloud.com/api/1.3', '_blank')}
                >
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <SidebarLabel>Dokumentasi UpCloud</SidebarLabel>
                </SidebarItem>

                <SidebarItem 
                  tooltip="Bantuan WhatsApp"
                  onClick={() => window.open('https://wa.me/6281234567890?text=Halo%20NexVps%20Support', '_blank')}
                >
                  <LifeBuoy className="h-3.5 w-3.5 text-slate-400" />
                  <SidebarLabel>Chat Dukungan CS</SidebarLabel>
                </SidebarItem>

                <SidebarItem 
                  tooltip="FAQ"
                  onClick={() => setCurrentTab('store')}
                >
                  <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                  <SidebarLabel>FAQ Cloud VPS</SidebarLabel>
                </SidebarItem>
              </SidebarDisclosurePanel>
            </SidebarDisclosure>

            {/* Disclosure 2: Infrastruktur Cloud */}
            <SidebarDisclosure id={2}>
              <SidebarDisclosureTrigger>
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                <SidebarLabel>Infrastruktur Node</SidebarLabel>
              </SidebarDisclosureTrigger>
              <SidebarDisclosurePanel>
                <SidebarItem tooltip="Datacenter SG-SIN1">
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                  <SidebarLabel>Equinix SG-SIN1</SidebarLabel>
                  <SidebarBadge>~14ms</SidebarBadge>
                </SidebarItem>

                <SidebarItem tooltip="UpCloud MaxIOPS">
                  <Zap className="h-3.5 w-3.5 text-cyan-400" />
                  <SidebarLabel>MaxIOPS 100K+</SidebarLabel>
                  <SidebarBadge>105K</SidebarBadge>
                </SidebarItem>
              </SidebarDisclosurePanel>
            </SidebarDisclosure>
          </SidebarDisclosureGroup>
        </SidebarSectionGroup>
      </SidebarContent>

      {/* 3. SIDEBAR FOOTER (User Menu) */}
      <SidebarFooter className="relative" ref={userMenuRef}>
        {user ? (
          <div>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex w-full items-center justify-between p-1.5 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || user.email}
                    className="h-8 w-8 rounded-lg object-cover ring-1 ring-cyan-500/40 shrink-0"
                  />
                ) : (
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs ring-1 shrink-0 ${
                    user.isAdmin
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white ring-purple-500/40'
                      : 'bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 ring-cyan-500/40'
                  }`}>
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                )}

                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {user.displayName || user.email.split('@')[0]}
                    </p>
                    <span className="block text-[10px] text-slate-500 truncate font-mono">
                      @{user.email.split('@')[0]}
                    </span>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <ChevronsUpDown className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
              )}
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute left-2 bottom-full mb-2 w-56 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 border-b border-slate-800 mb-1">
                  <p className="text-xs font-bold text-white truncate">{user.displayName || 'Akun Cloud'}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                </div>

                <button
                  onClick={() => { setCurrentTab('profile'); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-left"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Profil & Pengaturan Akun</span>
                </button>

                <button
                  onClick={() => { setCurrentTab('servers'); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-left"
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Server Saya ({activeServersCount})</span>
                </button>

                {user.isAdmin && (
                  <button
                    onClick={() => { setCurrentTab('admin'); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-purple-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-left"
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    <span>Panel Administrator</span>
                  </button>
                )}

                <div className="my-1 border-t border-slate-800" />

                {/* Theme Switcher in Profile Menu */}
                <div className="px-3 py-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Tema Tampilan</span>
                  <SwitchAnimatedTheme variant="stretchy" size="sm" showLabel={false} />
                </div>

                <div className="my-1 border-t border-slate-800" />

                <button
                  onClick={() => { logout(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out (Keluar)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenAuth('login')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:brightness-110 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-1' : 'justify-center'
            }`}
          >
            <LogIn className="w-4 h-4" />
            {!isCollapsed && <span>Masuk / Daftar</span>}
          </button>
        )}
      </SidebarFooter>

      {/* 4. SIDEBAR RAIL DOCK TOGGLE */}
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
