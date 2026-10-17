import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import type { 
  VpsPlan, 
  VpsZone, 
  VpsTemplate 
} from '../types';
import { 
  Cpu, 
  HardDrive, 
  Activity, 
  Globe2, 
  Check, 
  Zap, 
  Key, 
  User, 
  Mail, 
  Phone, 
  Sparkles, 
  ArrowRight,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
  Copy,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Info,
  ClipboardPaste
} from 'lucide-react';
import HeroSection from './HeroSection';
import { CountryFlag } from './CountryFlag';
import { OsIcon } from './OsIcon';
import SlideCommit from './SlideCommit';
import BorderGlow from './BorderGlow';
import RealtimeStatsWidget from './RealtimeStatsWidget';

export interface DistroMeta {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
}

export const DISTRO_METAS: DistroMeta[] = [
  { id: 'ubuntu', name: 'Ubuntu', tagline: 'Paling Populer & User-friendly', badge: 'Terpopuler' },
  { id: 'debian', name: 'Debian', tagline: 'Ultra-Stabil & Hemat Resource', badge: 'Paling Stabil' },
  { id: 'alpine', name: 'Alpine Linux', tagline: 'Ultra-ringan & Container Ready', badge: 'Ringan (<50MB)' },
  { id: 'arch', name: 'Arch Linux', tagline: 'Bleeding-edge Rolling Release', badge: 'Rolling' },
  { id: 'almalinux', name: 'AlmaLinux', tagline: '1:1 Binary Compatible RHEL', badge: 'Enterprise' },
  { id: 'rocky', name: 'Rocky Linux', tagline: 'Produksi Kompatibel RHEL', badge: 'Enterprise' },
  { id: 'centos', name: 'CentOS Stream', tagline: 'Upstream Red Hat Enterprise' },
  { id: 'fedora', name: 'Fedora Cloud', tagline: 'Kernel & Fitur Linux Terbaru' },
  { id: 'opensuse', name: 'openSUSE', tagline: 'Enterprise YaST & Btrfs Native', badge: 'SysAdmin' },
  { id: 'freebsd', name: 'FreeBSD', tagline: 'Advanced Unix, ZFS & Jails', badge: 'BSD Unix' },
  { id: 'windows', name: 'Windows Server', tagline: 'Remote Desktop & .NET Framework' }
];

interface VpsConfiguratorProps {
  plans: VpsPlan[];
  zones: VpsZone[];
  templates: VpsTemplate[];
  onProceedToCheckout: (formData: any) => void;
}

export const VpsConfigurator: React.FC<VpsConfiguratorProps> = ({
  plans,
  zones,
  templates,
  onProceedToCheckout
}) => {
  // Config state
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[1]?.id || plans[0]?.id || 'developer');
  const [selectedZoneCode, setSelectedZoneCode] = useState<string>('sg-sin1');
  const [selectedTemplateUuid, setSelectedTemplateUuid] = useState<string>(templates[0]?.uuid || '');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');

  // Server credentials
  const [hostname, setHostname] = useState<string>('server.nexvps.cloud');
  const [rootPassword, setRootPassword] = useState<string>('NexCloud99!Secure');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [sshKey, setSshKey] = useState<string>('');
  const [useSshKey, setUseSshKey] = useState<boolean>(false);
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);
  const [copiedSshCommand, setCopiedSshCommand] = useState<boolean>(false);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState<boolean>(false);

  // Authenticated user & theme
  const { user, isAdmin } = useAuth();
  const { isDark } = useTheme();

  // Admin test mode state (bypass payment for testing UpCloud VPS provisioning)
  const [isAdminTestMode, setIsAdminTestMode] = useState<boolean>(false);
  const canUseAdminTest = isAdmin || Boolean(user?.email && user.email.toLowerCase().trim() === 'sanzzydev@gmail.com');

  useEffect(() => {
    if (!canUseAdminTest && isAdminTestMode) {
      setIsAdminTestMode(false);
    }
  }, [canUseAdminTest, isAdminTestMode]);

  // Customer info
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.displayName || user.email.split('@')[0]);
      if (!customerEmail) setCustomerEmail(user.email);
    }
  }, [user]);

  // Keep selectedPlanId valid when plans prop changes or if selected plan was removed/modified
  useEffect(() => {
    if (plans && plans.length > 0) {
      if (!plans.some(p => p.id === selectedPlanId)) {
        const popular = plans.find(p => p.popular);
        setSelectedPlanId(popular?.id || plans[0].id);
      }
    }
  }, [plans, selectedPlanId]);

  // Active OS Distro selection
  const [activeDistro, setActiveDistro] = useState<string>('ubuntu');

  // Selected entities
  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];
  const selectedZone = zones.find(z => z.code === selectedZoneCode) || zones[0];
  const selectedTemplate = templates.find(t => t.uuid === selectedTemplateUuid) || templates[0];

  // Sync activeDistro when templates change or when template is selected
  useEffect(() => {
    if (templates && templates.length > 0) {
      if (!selectedTemplateUuid) {
        setSelectedTemplateUuid(templates[0].uuid);
        setActiveDistro(templates[0].distro || 'ubuntu');
      } else {
        const current = templates.find(t => t.uuid === selectedTemplateUuid);
        if (current && current.distro) {
          setActiveDistro(current.distro);
        }
      }
    }
  }, [templates]);

  const handleSelectDistro = (distroId: string) => {
    setActiveDistro(distroId);
    const matching = templates.filter(t => (t.distro || '').toLowerCase() === distroId.toLowerCase());
    if (matching.length > 0) {
      const preferred = matching.find(t => t.isLatest) || matching[0];
      setSelectedTemplateUuid(preferred.uuid);
    }
  };

  const activeDistroInfo = DISTRO_METAS.find(d => d.id === activeDistro) || {
    id: activeDistro,
    name: activeDistro.charAt(0).toUpperCase() + activeDistro.slice(1),
    tagline: 'Sistem Operasi Cloud VPS'
  };

  const availableVersionsForDistro = templates.filter(
    t => (t.distro || '').toLowerCase() === activeDistro.toLowerCase()
  );

  // Price calculation
  const getCycleMultiplier = () => {
    if (billingCycle === 'quarterly') return { months: 3, discount: 0.05, label: '3 Bulan (Diskon 5%)' };
    if (billingCycle === 'annually') return { months: 12, discount: 0.15, label: '1 Tahun (Diskon 15%)' };
    return { months: 1, discount: 0, label: 'Bulanan' };
  };

  const cycleInfo = getCycleMultiplier();
  const baseMonthlyPrice = selectedPlan ? selectedPlan.pricePerMonthIdr : 0;
  const totalPrice = Math.round(baseMonthlyPrice * cycleInfo.months * (1 - cycleInfo.discount));

  // Enhanced strong random password generator
  const generateStrongPassword = () => {
    setIsGeneratingPassword(true);
    const lowercase = 'abcdefghjkmnpqrstuvwxyz';
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    const symbols = '!@#$%^&*_-+=';
    const all = lowercase + uppercase + numbers + symbols;

    let pass = '';
    pass += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    pass += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    pass += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pass += symbols.charAt(Math.floor(Math.random() * symbols.length));

    for (let i = 4; i < 16; i++) {
      pass += all.charAt(Math.floor(Math.random() * all.length));
    }
    pass = pass.split('').sort(() => 0.5 - Math.random()).join('');
    setRootPassword(pass);
    setTimeout(() => setIsGeneratingPassword(false), 450);
  };

  const handleCopyPassword = () => {
    if (!rootPassword) return;
    navigator.clipboard.writeText(rootPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const sshCommandPreview = `ssh root@${hostname.trim() || 'server.nexvps.cloud'}`;
  const handleCopySshCommand = () => {
    navigator.clipboard.writeText(sshCommandPreview);
    setCopiedSshCommand(true);
    setTimeout(() => setCopiedSshCommand(false), 2000);
  };

  const handlePasteSshKey = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSshKey(text.trim());
      }
    } catch {
      // Clipboard API might be restricted
    }
  };

  const HOSTNAME_PRESETS = [
    { label: 'server', prefix: 'server' },
    { label: 'app-node', prefix: 'app-node' },
    { label: 'api-prod', prefix: 'api-prod' },
    { label: 'db-cluster', prefix: 'db-cluster' },
    { label: 'docker-host', prefix: 'docker-host' }
  ];

  const handleApplyHostnamePreset = (prefix: string) => {
    setHostname(`${prefix}.nexvps.cloud`);
  };

  const passwordCriteria = {
    min8: rootPassword.length >= 8,
    hasUpperLower: /[a-z]/.test(rootPassword) && /[A-Z]/.test(rootPassword),
    hasNumberAndSymbol: /[0-9]/.test(rootPassword) && /[^A-Za-z0-9]/.test(rootPassword)
  };

  const getPasswordStrength = () => {
    if (!rootPassword) return { score: 0, label: 'Kosong', color: 'text-slate-400', barColor: 'bg-slate-700' };
    let score = 0;
    if (rootPassword.length >= 8) score += 1;
    if (rootPassword.length >= 10 && (passwordCriteria.hasUpperLower || passwordCriteria.hasNumberAndSymbol)) score += 1;
    if (passwordCriteria.min8 && passwordCriteria.hasUpperLower && (/[0-9]/.test(rootPassword) || /[^A-Za-z0-9]/.test(rootPassword))) score += 1;
    if (rootPassword.length >= 12 && passwordCriteria.hasUpperLower && passwordCriteria.hasNumberAndSymbol) score += 1;

    if (score <= 1) return { score: 1, label: 'Lemah', color: 'text-rose-500 dark:text-rose-400', barColor: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Sedang', color: 'text-amber-500 dark:text-amber-400', barColor: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Kuat', color: 'text-emerald-500 dark:text-emerald-400', barColor: 'bg-emerald-500' };
    return { score: 4, label: 'Sangat Kuat', color: 'text-cyan-500 dark:text-cyan-400', barColor: 'bg-cyan-400' };
  };

  const pwdStrength = getPasswordStrength();

  const getSshKeyInfo = (key: string) => {
    const trimmed = key.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('ssh-ed25519')) return { label: 'ED25519 (Ultra Cepat & Modern)', valid: true, color: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
    if (trimmed.startsWith('ssh-rsa')) return { label: 'RSA Standard (2048/4096-bit)', valid: true, color: 'text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10' };
    if (trimmed.startsWith('ecdsa-sha2-nistp')) return { label: 'ECDSA NIST', valid: true, color: 'text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/10' };
    if (trimmed.startsWith('ssh-')) return { label: 'SSH Public Key Valid', valid: true, color: 'text-cyan-600 dark:text-cyan-400 border-cyan-500/30 bg-cyan-500/10' };
    return { label: 'Format belum dikenali (Gunakan ssh-ed25519 atau ssh-rsa)', valid: false, color: 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10' };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setFormError('Silakan masukkan alamat email yang valid.');
      return;
    }
    if (!hostname.trim()) {
      setFormError('Silakan tentukan hostname server.');
      return;
    }
    if (!rootPassword.trim() || rootPassword.length < 8) {
      setFormError('Password root minimal 8 karakter.');
      return;
    }

    onProceedToCheckout({
      customerName,
      customerEmail,
      customerPhone,
      planId: selectedPlanId,
      zoneCode: selectedZoneCode,
      templateUuid: selectedTemplateUuid,
      hostname,
      rootPassword,
      sshKey: useSshKey ? sshKey : undefined,
      billingCycle,
      totalPrice: isAdminTestMode ? 0 : totalPrice,
      isAdminTest: isAdminTestMode,
      planName: selectedPlan.name,
      zoneName: selectedZone.name,
      templateName: selectedTemplate.name
    });
  };

  const handleSlideCheckout = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      setFormError('');

      if (!customerName.trim()) {
        const err = 'Silakan masukkan nama lengkap Anda pada Informasi Kontak.';
        setFormError(err);
        document.getElementById('step-customer-info')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        reject(new Error(err));
        return;
      }
      if (!customerEmail.trim() || !customerEmail.includes('@')) {
        const err = 'Silakan masukkan alamat email yang valid.';
        setFormError(err);
        document.getElementById('step-customer-info')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        reject(new Error(err));
        return;
      }
      if (!hostname.trim()) {
        const err = 'Silakan tentukan hostname server.';
        setFormError(err);
        document.getElementById('step-server-access')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        reject(new Error(err));
        return;
      }
      if (!rootPassword.trim() || rootPassword.length < 8) {
        const err = 'Password root minimal 8 karakter.';
        setFormError(err);
        document.getElementById('step-server-access')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        reject(new Error(err));
        return;
      }

      // Validated successfully: resolve promise for unfurl animation
      resolve();

      setTimeout(() => {
        onProceedToCheckout({
          customerName,
          customerEmail,
          customerPhone,
          planId: selectedPlanId,
          zoneCode: selectedZoneCode,
          templateUuid: selectedTemplateUuid,
          hostname,
          rootPassword,
          sshKey: useSshKey ? sshKey : undefined,
          billingCycle,
          totalPrice: isAdminTestMode ? 0 : totalPrice,
          isAdminTest: isAdminTestMode,
          planName: selectedPlan.name,
          zoneName: selectedZone.name,
          templateName: selectedTemplate.name
        });
      }, 450);
    });
  };

  return (
    <div className="space-y-12">
      {/* Interactive Cyber Hero Section */}
      <HeroSection 
        onExploreClick={() => {
          const el = document.getElementById('vps-configurator-form');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }} 
      />

      {/* Realtime Telemetry Stats Widget */}
      <RealtimeStatsWidget />

      <form id="vps-configurator-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        {/* Left Column: Configurator Options */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* STEP 1: PILIH LOKASI DATA CENTER */}
          <section className="bg-white dark:bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/40 relative overflow-hidden transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-black text-sm flex items-center justify-center">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                    Pilih Lokasi Data Center
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pilih lokasi server terdekat untuk latensi paling rendah</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {zones.map((zone) => {
                const isSelected = selectedZoneCode === zone.code;
                return (
                  <button
                    type="button"
                    key={zone.code}
                    onClick={() => setSelectedZoneCode(zone.code)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/20 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>
                    )}
                    <div className="w-9 h-6 rounded-md overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                      <CountryFlag zoneCode={zone.code} countryName={zone.country} size="lg" className="scale-125" />
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm mt-3">{zone.city}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{zone.country}</p>
                    <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                      <span className="tabular-nums">~{zone.pingMs} ms</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 2: PILIH SISTEM OPERASI & VERSI */}
          <section className="bg-white dark:bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/40 relative overflow-hidden transition-all space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    Pilih Sistem Operasi & Versi
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pilih distribusi sistem operasi, lalu tentukan versi yang ingin diinstal</p>
                </div>
              </div>
            </div>

            {/* Sub-step A: Pilih Distribusi OS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                  Distribusi Sistem Operasi
                </label>
                <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono font-medium">
                  {DISTRO_METAS.length} Distribusi Tersedia
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {DISTRO_METAS.map((distro) => {
                  const isSelected = activeDistro.toLowerCase() === distro.id.toLowerCase();
                  const distroTemplates = templates.filter(
                    t => (t.distro || '').toLowerCase() === distro.id.toLowerCase()
                  );
                  const count = distroTemplates.length;

                  return (
                    <button
                      type="button"
                      key={distro.id}
                      onClick={() => handleSelectDistro(distro.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/25 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1.5 shadow-sm shrink-0">
                          <OsIcon distro={distro.id} size="md" />
                        </div>
                        {distro.badge ? (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isSelected ? 'bg-blue-500 text-white dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50'
                          }`}>
                            {distro.badge}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {count > 0 ? `${count} Versi` : 'Linux'}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{distro.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{distro.tagline}</p>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Dipilih</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-300">Pilih OS &rarr;</span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">{count} opsi</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-step B: Pilih Versi OS */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                  Pilih Versi untuk <span className="text-slate-900 dark:text-white font-bold">{activeDistroInfo.name}</span>
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Cloud-Init & MaxIOPS Ready
                </span>
              </div>

              {availableVersionsForDistro.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-sm">
                  Tidak ada template versi yang tersedia untuk distribusi ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableVersionsForDistro.map((tpl) => {
                    const isSelected = selectedTemplateUuid === tpl.uuid;
                    return (
                      <button
                        type="button"
                        key={tpl.uuid}
                        onClick={() => setSelectedTemplateUuid(tpl.uuid)}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/30 ring-1 ring-blue-500 shadow-md shadow-blue-500/15'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <OsIcon distro={tpl.distro} size="sm" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                              {tpl.version || tpl.name}
                            </p>
                            {tpl.isLatest && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                Latest
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {tpl.description || tpl.name}
                          </p>
                          <div className="flex items-center gap-2 mt-2.5 text-[10px] text-slate-500 font-mono">
                            <span>Min {tpl.minDiskGb} GB Storage</span>
                            <span>•</span>
                            <span className="text-cyan-600 dark:text-cyan-400/80 font-medium">MaxIOPS</span>
                          </div>
                        </div>

                        <div className="shrink-0 mt-0.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-500 text-white dark:text-slate-950'
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* STEP 3: PILIH PAKET CLOUD VPS & BILLING CYCLE */}
          <section className="bg-white dark:bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/40 relative overflow-hidden transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-black text-sm flex items-center justify-center">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                    Pilih Spesifikasi Paket VPS
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Resource terdedikasi tanpa overselling</p>
                </div>
              </div>

              {/* Billing Cycle Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    billingCycle === 'monthly' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('quarterly')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    billingCycle === 'quarterly' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  3 Bulan (-5%)
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annually')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    billingCycle === 'annually' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  1 Tahun (-15%)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const monthlyPrice = plan.pricePerMonthIdr;
                const periodPrice = Math.round(monthlyPrice * cycleInfo.months * (1 - cycleInfo.discount));

                const innerContent = (
                  <div className="p-6 relative">
                    {plan.popular && (
                      <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-[11px] font-extrabold tracking-wide uppercase shadow-md">
                        Terpopuler
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                        <p className="text-xs text-cyan-600 dark:text-cyan-400 font-mono mt-0.5 font-semibold">{plan.upcloudPlan}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected ? 'border-cyan-500 bg-cyan-500 text-white dark:text-slate-950' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Price display */}
                    <div className="my-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Rp</span>
                        <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                          {periodPrice.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          / {billingCycle === 'monthly' ? 'bln' : billingCycle === 'quarterly' ? '3 bln' : 'tahun'}
                        </span>
                      </div>
                      {cycleInfo.discount > 0 && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                          Hemat {Math.round(cycleInfo.discount * 100)}% dibanding bayar bulanan
                        </p>
                      )}
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-2.5 mb-5 text-xs">
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                        <Cpu className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                        <span>{plan.coreNumber} vCPU Cores</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                        <Activity className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        <span>{plan.memoryAmountMb / 1024} GB RAM</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                        <HardDrive className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        <span>{plan.storageSizeGb} GB MaxIOPS</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                        <Globe2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                        <span>{plan.bandwidthTb} TB Kuota</span>
                      </div>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {plan.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );

                if (plan.popular) {
                  return (
                    <BorderGlow
                      key={plan.id}
                      edgeSensitivity={32}
                      glowColor="190 95 65"
                      backgroundColor={isDark ? (isSelected ? '#0c1b30' : '#090e17') : (isSelected ? '#f0f9ff' : '#ffffff')}
                      borderRadius={24}
                      glowRadius={36}
                      glowIntensity={1.25}
                      coneSpread={28}
                      animated={false}
                      colors={['#06b6d4', '#3b82f6', '#8b5cf6']}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-2 ring-cyan-500 shadow-xl shadow-cyan-500/15'
                          : 'hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                      onClick={() => setSelectedPlanId(plan.id)}
                    >
                      {innerContent}
                    </BorderGlow>
                  );
                }

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`rounded-3xl border cursor-pointer transition-all relative ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50/70 dark:bg-gradient-to-b dark:from-cyan-950/20 dark:to-slate-900 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 shadow-md shadow-slate-100 dark:shadow-none'
                    }`}
                  >
                    {innerContent}
                  </div>
                );
              })}
            </div>
          </section>

          {/* STEP 4: KONFIGURASI SERVER ACCESS */}
          <section id="step-server-access" className="bg-white dark:bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/40 relative overflow-hidden transition-all">
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none hidden dark:block" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-sm flex items-center justify-center shadow-sm shadow-emerald-500/10 shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    <span>Konfigurasi Akses Server</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tentukan Hostname & Password root untuk login SSH server secara instan</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span>Port 22 SSH Ready</span>
              </div>
            </div>

            <div className="space-y-6 relative">
              {/* Hostname Input with Quick Presets */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                    <span>Server Hostname (FQDN)</span>
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">Preset cepat:</span>
                    {HOSTNAME_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset.prefix}
                        onClick={() => handleApplyHostnamePreset(preset.prefix)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          hostname.startsWith(preset.prefix)
                            ? 'bg-cyan-50 dark:bg-cyan-500/15 border-cyan-400 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-semibold shadow-sm shadow-cyan-500/10'
                            : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 text-cyan-600 dark:text-cyan-400 shadow-sm pointer-events-none">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    placeholder="misal: server.nexvps.cloud"
                    className="w-full pl-13 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm font-mono transition-all shadow-inner"
                    required
                  />
                </div>

                {/* Live SSH Command Terminal String */}
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono shadow-inner">
                  <div className="flex items-center gap-2 text-slate-300 truncate">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-slate-500 select-none">$</span>
                    <span className="truncate text-cyan-300 font-semibold">{sshCommandPreview}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySshCommand}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-[11px] transition-all shrink-0 cursor-pointer"
                    title="Salin string perintah SSH"
                  >
                    {copiedSshCommand ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                        <span className="text-emerald-400 font-semibold">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Root Password Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span>Password Root Server</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer font-medium transition-colors"
                      title="Salin password ke clipboard"
                    >
                      {copiedPassword ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400 stroke-[3]" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin Password</span>
                        </>
                      )}
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="inline-flex items-center gap-1.5 text-[11px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 cursor-pointer font-semibold transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${isGeneratingPassword ? 'animate-spin' : ''}`} />
                      <span>Acak Password Kuat</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 shadow-sm pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={rootPassword}
                    onChange={(e) => setRootPassword(e.target.value)}
                    placeholder="Minimal 8 karakter..."
                    className="w-full pl-13 pr-12 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono tracking-wider transition-all shadow-inner"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* 4-Segmented Entropy Strength Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Kekuatan Password:</span>
                      <span className={`text-[11px] font-bold ${pwdStrength.color}`}>
                        {pwdStrength.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      {rootPassword.length} karakter
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((tier) => (
                      <div
                        key={tier}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          pwdStrength.score >= tier ? pwdStrength.barColor : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Live Criteria Checklist Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border transition-all ${
                    passwordCriteria.min8
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-medium'
                      : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                  }`}>
                    <Check className={`w-3 h-3 ${passwordCriteria.min8 ? 'text-emerald-600 dark:text-emerald-400 stroke-[3]' : 'text-slate-400 dark:text-slate-600'}`} />
                    <span>Min. 8 Karakter</span>
                  </div>

                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border transition-all ${
                    passwordCriteria.hasUpperLower
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-medium'
                      : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                  }`}>
                    <Check className={`w-3 h-3 ${passwordCriteria.hasUpperLower ? 'text-emerald-600 dark:text-emerald-400 stroke-[3]' : 'text-slate-400 dark:text-slate-600'}`} />
                    <span>Huruf Besar & Kecil</span>
                  </div>

                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border transition-all ${
                    passwordCriteria.hasNumberAndSymbol
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-medium'
                      : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                  }`}>
                    <Check className={`w-3 h-3 ${passwordCriteria.hasNumberAndSymbol ? 'text-emerald-600 dark:text-emerald-400 stroke-[3]' : 'text-slate-400 dark:text-slate-600'}`} />
                    <span>Angka & Simbol (!@#$)</span>
                  </div>
                </div>
              </div>

              {/* SSH Public Key Switch Card */}
              <div 
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                  useSshKey
                    ? 'border-cyan-500/40 bg-cyan-50/70 dark:bg-cyan-950/20 shadow-md shadow-cyan-500/5'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                onClick={() => setUseSshKey(prev => !prev)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                      useSshKey
                        ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-400/40 dark:border-cyan-500/30 shadow-sm shadow-cyan-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800'
                    }`}>
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          Gunakan SSH Public Key
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                          Rekomendasi Keamanan
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Login SSH tanpa password menggunakan kunci kriptografi publik
                      </p>
                    </div>
                  </div>

                  {/* Modern Animated Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={useSshKey}
                    onClick={(e) => {
                      e.stopPropagation();
                      setUseSshKey(prev => !prev);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      useSshKey ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        useSshKey ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {useSshKey && (
                  <div 
                    className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2.5 animate-in fade-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        SSH Public Key String (.pub)
                      </span>
                      <button
                        type="button"
                        onClick={handlePasteSshKey}
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold cursor-pointer transition-colors"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5" />
                        <span>Tempel Clipboard</span>
                      </button>
                    </div>

                    <textarea
                      value={sshKey}
                      onChange={(e) => setSshKey(e.target.value)}
                      placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... user@machine"
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs font-mono transition-all resize-none shadow-inner"
                    />

                    {/* Key format detector indicator */}
                    {sshKey.trim() && (() => {
                      const keyInfo = getSshKeyInfo(sshKey);
                      return keyInfo ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-mono ${keyInfo.color}`}>
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{keyInfo.label}</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* STEP 5: DATA PEMBELI */}
          <section id="step-customer-info" className="bg-white dark:bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/40 relative overflow-hidden transition-all">
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none hidden dark:block" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-sm flex items-center justify-center shadow-sm shadow-indigo-500/10 shrink-0">
                  5
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    <span>Informasi Kontak Pembeli</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kredensial login, status server & invoice PDF akan dikirimkan ke kontak ini</p>
                </div>
              </div>

              {user ? (
                <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span className="truncate max-w-[200px]">Akun Terverifikasi: <strong>{user.email}</strong></span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Auto-Delivery &lt; 28 Detik</span>
                </div>
              )}
            </div>

            <div className="space-y-6 relative">
              {/* 3-Column Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Field 1: Nama Lengkap */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span>Nama Lengkap</span>
                    </label>
                    {customerName.trim().length >= 2 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Sesuai</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400 shadow-sm pointer-events-none">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Budi Santoso"
                      className="w-full pl-13 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all shadow-inner"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 pl-1">
                    Nama pemilik resmi instance VPS & faktur
                  </p>
                </div>

                {/* Field 2: Alamat Email */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span>Alamat Email</span>
                    </label>
                    {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Valid</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400 shadow-sm pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="budi@example.com"
                      className="w-full pl-13 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all shadow-inner"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 pl-1">
                    Kredensial root server & invoice PDF dikirim ke sini
                  </p>
                </div>

                {/* Field 3: Nomor WhatsApp */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span>Nomor WhatsApp</span>
                    </label>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400/80 font-mono">
                      Notifikasi Instan
                    </span>
                  </div>
                  <div className="relative flex rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-inner overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3.5 py-3 bg-slate-100 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold select-none shrink-0">
                      <span>🇮🇩</span>
                      <span>+62</span>
                    </div>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="812-3456-7890"
                      className="w-full px-3.5 py-3 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 pl-1">
                    Pemberitahuan otomatis ketika server selesai provisioning
                  </p>
                </div>
              </div>

              {/* Trust & Guarantee Cards */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Auto-Provisioning</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      Server aktif otomatis &lt; 28 detik setelah QRIS terverifikasi.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Enkripsi 256-Bit</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      Kredensial root dienkripsi aman tanpa logging password.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">E-Invoice Resmi</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      Faktur & tanda terima PDF otomatis diterbitkan ke email.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Order Summary Card with BorderGlow */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          <BorderGlow
            edgeSensitivity={30}
            glowColor="190 90 60"
            backgroundColor={isDark ? "#0b1120" : "#ffffff"}
            borderRadius={28}
            glowRadius={36}
            glowIntensity={1.2}
            coneSpread={28}
            animated={false}
            colors={['#06b6d4', '#3b82f6', '#8b5cf6']}
            className="w-full shadow-2xl"
          >
            <div className="p-6 sm:p-7 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none hidden dark:block"></div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-center justify-between">
                <span>Ringkasan Order</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-mono font-semibold">
                  NexVps
                </span>
              </h3>

              {/* Admin Test Mode Toggle (Admin only) */}
              {canUseAdminTest && (
                <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/30 dark:border-amber-500/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Admin Testing Mode</p>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 font-semibold">
                            GRATIS
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Bypass pembayaran QRIS</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAdminTestMode}
                        onChange={(e) => setIsAdminTestMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                  {isAdminTestMode && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-300 font-medium mt-2 pt-2 border-t border-amber-500/20">
                      ⚡ Mode testing aktif: Pesanan langsung berstatus <strong>PAID</strong> & otomatis mendeploy VPS UpCloud nyata tanpa tagihan QRIS.
                    </p>
                  )}
                </div>
              )}

              {/* Config Breakdown */}
              <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800/80 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Paket VPS</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedPlan.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Spesifikasi</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono text-xs font-medium">
                    {selectedPlan.coreNumber}C / {selectedPlan.memoryAmountMb / 1024}GB / {selectedPlan.storageSizeGb}GB
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Lokasi DC</span>
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2 font-medium">
                    <CountryFlag zoneCode={selectedZone.code} countryName={selectedZone.country} size="sm" />
                    <span>{selectedZone.city}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Sistem Operasi</span>
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium truncate max-w-[170px]">
                    <OsIcon distro={selectedTemplate.distro} size="xs" />
                    <span className="truncate">{selectedTemplate.version || selectedTemplate.name.split('(')[0]}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Periode</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{cycleInfo.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Hostname</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono text-xs truncate max-w-[150px]">
                    {hostname}
                  </span>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="py-5 space-y-2 border-b border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Harga Dasar</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Rp {(baseMonthlyPrice * cycleInfo.months).toLocaleString('id-ID')}</span>
                </div>
                {cycleInfo.discount > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Diskon Periode ({Math.round(cycleInfo.discount * 100)}%)</span>
                    <span>- Rp {Math.round(baseMonthlyPrice * cycleInfo.months * cycleInfo.discount).toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Metode Pembayaran</span>
                  {isAdminTestMode ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Bypass Pembayaran (Admin Test)
                    </span>
                  ) : (
                    <span className="text-cyan-600 dark:text-cyan-400 font-semibold">QRIS (Semua Bank)</span>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="pt-5 pb-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold text-sm">Total Tagihan:</span>
                  <div className="text-right">
                    {isAdminTestMode ? (
                      <div>
                        <span className="text-xs text-slate-400 line-through mr-1.5">
                          Rp {totalPrice.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-bold mr-1">Rp</span>
                        <span className="text-3xl font-black text-amber-500 dark:text-amber-400 tabular-nums">
                          0
                        </span>
                        <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          ⚡ Admin Free Test
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold mr-1">Rp</span>
                        <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                          {totalPrice.toLocaleString('id-ID')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 text-right">
                  {isAdminTestMode 
                    ? '*Mode testing admin aktif: Tidak perlu transfer, order langsung diproses.'
                    : '*Kode unik verifikasi otomatis akan disertakan pada QRIS'}
                </p>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Slide to Commit / Pay Action */}
              <div className="w-full">
                <SlideCommit
                  label={isAdminTestMode ? "Geser untuk Deploy Gratis (Test)" : "Geser untuk Bayar QRIS"}
                  doneLabel={isAdminTestMode ? "Memulai Deploy UpCloud..." : "Menyiapkan Pembayaran..."}
                  errorLabel={formError ? "Lengkapi Data Server" : "Lengkapi Form Server"}
                  onConfirm={handleSlideCheckout}
                  trackColor={isDark ? (isAdminTestMode ? "#1c1404" : "#090e17") : (isAdminTestMode ? "#fef3c7" : "#f1f5f9")}
                  handleColor={isAdminTestMode ? "#f59e0b" : "#06b6d4"}
                  successColor="#10b981"
                  dangerColor="#f43f5e"
                  width="100%"
                  height={58}
                  radius={20}
                  speed={50}
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 text-center flex items-center justify-center gap-1.5 font-medium">
                  <span>👉</span> {isAdminTestMode ? "Geser handle amber ke kanan untuk deploy gratis langsung" : "Geser handle cyan ke kanan untuk konfirmasi & buka QRIS"}
                </p>

                {isAdminTestMode && (
                  <button
                    type="submit"
                    className="w-full mt-3 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>⚡ Deploy Langsung Gratis (Admin Test)</span>
                  </button>
                )}
              </div>

              {/* Security badges */}
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-center flex items-center justify-center gap-4 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                <span>🔒 256-bit Encrypted</span>
                <span>⚡ UpCloud API 1.3</span>
                <span>{isAdminTestMode ? '⚡ Admin Test' : '📱 QRIS Resmi'}</span>
              </div>
            </div>
          </BorderGlow>
        </div>
      </form>
    </div>
  );
};
