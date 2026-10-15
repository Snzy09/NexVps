import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldAlert, 
  LifeBuoy, 
  Terminal, 
  ArrowRight, 
  Search, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  User, 
  Bot, 
  Zap, 
  AlertCircle,
  MessageCircle,
  Building2,
  Calendar,
  Headphones,
  ShieldCheck,
  CheckCheck,
  Flame,
  Radio,
  Share2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SupportPageProps {
  onNavigateTab?: (tab: 'store' | 'servers' | 'admin' | 'changelog' | 'profile' | 'support') => void;
}

interface TicketRecord {
  id: string;
  subject: string;
  category: string;
  priority: 'normal' | 'urgent' | 'emergency';
  status: 'Open' | 'Diproses' | 'Selesai';
  createdAt: string;
  message: string;
}

const ADMIN_CONTACT = {
  name: 'NexVps Support & NOC Team',
  whatsappNumber: '6281234567890',
  whatsappDisplay: '+62 812-3456-7890',
  adminEmail: 'sanzzydev@gmail.com',
  supportEmail: 'support@nexvps.cloud',
  billingEmail: 'billing@nexvps.cloud',
  telegram: '@NexVpsSupport',
  location: 'Cyber 2 Tower, Lt. 18, Jakarta Selatan & Equinix SG-SIN1',
  slaHours: '24 Jam / 7 Hari Non-Stop',
  avgResponseTime: '< 5 Menit',
  uptimeGuarantee: '99.99% MaxIOPS SLA'
};

const FAQ_ITEMS = [
  {
    q: 'Berapa lama proses provisioning VPS setelah pembayaran QRIS?',
    a: 'Server akan otomatis ter-deploy dan aktif dalam waktu kurang dari 30-45 detik setelah sistem QRIS menerima mutasi saldo. Anda dapat langsung melihat IP Publik dan kredensial root pada halaman "Server Saya".'
  },
  {
    q: 'Bagaimana cara mengakses VPS pertama kali via SSH?',
    a: 'Gunakan terminal pilihan Anda (Terminal Mac/Linux, PowerShell, atau PuTTY). Jalankan perintah `ssh root@IP_SERVER_ANDA`, lalu masukkan root password yang ditentukan saat checkout atau gunakan SSH Private Key yang Anda unggah.'
  },
  {
    q: 'Pembayaran QRIS saya sudah berhasil, tetapi server belum muncul?',
    a: 'Biasanya webhook gateway membutuhkan 5-15 detik untuk verifikasi. Jika dalam 2 menit server belum muncul, silakan gunakan fitur Chat Admin atau klik tombol WhatsApp dengan menyertakan referensi invoice order untuk aktivasi manual instan oleh NOC.'
  },
  {
    q: 'Apakah saya bisa melakukan upgrade kapasitas RAM, CPU, atau Storage?',
    a: 'Bisa! Infrastruktur UpCloud mendukung scaling fleksibel. Anda dapat mengajukan upgrade spek kapan saja melalui tiket bantuan atau WhatsApp Admin tanpa kehilangan data disk yang ada.'
  },
  {
    q: 'Di mana lokasi data center server yang tersedia?',
    a: 'Server berlokasi di Equinix SG3 Singapore (latensi ~10-15 ms dari Indonesia), Frankfurt (Jerman), Helsinki (Finlandia), London (Inggris), Amsterdam (Belanda), New York (AS), dan Sydney (Australia).'
  },
  {
    q: 'Apakah ada proteksi DDoS dan jaminan keamanan data?',
    a: 'Ya, seluruh port publik dilengkapi dengan UpCloud Enterprise DDoS Protection aktif hingga layer 7 dan media storage MaxIOPS 100K+ IOPS terlindungi redundansi penyimpanan multi-host.'
  }
];

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();

  // Active view tab inside support
  const [activeSupportTab, setActiveSupportTab] = useState<'channels' | 'ticket' | 'faq'>('channels');

  // Copied states
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);

  // ----------------------------------------------------
  // 1. WHATSAPP & EMAIL HELPERS
  // ----------------------------------------------------
  const [waTemplateCategory, setWaTemplateCategory] = useState<string>('qris');
  const [waCustomNote, setWaCustomNote] = useState<string>('');

  const waTemplates: Record<string, string> = {
    qris: 'Halo Admin NexVps, saya butuh bantuan konfirmasi pembayaran QRIS. Transaksi saya belum otomatis terverifikasi.',
    server: 'Halo Admin NexVps, server VPS saya mengalami kendala teknis (tidak bisa diakses / offline). Mohon bantuan pengecekan.',
    ssh: 'Halo Admin NexVps, saya mengalami kendala koneksi SSH / reset root password pada server saya.',
    custom: 'Halo Admin NexVps, saya ingin berkonsultasi mengenai pesanan custom cluster / penambahan resource VPS.',
    general: 'Halo Admin NexVps, saya ingin menanyakan beberapa hal mengenai layanan Cloud VPS UpCloud.'
  };

  const getFullWaText = () => {
    const base = waTemplates[waTemplateCategory] || waTemplates.general;
    const userInfo = user ? `\n\nIdentitas Akun: ${user.displayName || 'Developer'} (${user.email})` : '';
    const note = waCustomNote.trim() ? `\nCatatan Tambahan: ${waCustomNote.trim()}` : '';
    return `${base}${userInfo}${note}`;
  };

  const handleOpenWhatsApp = (customText?: string) => {
    const text = customText || getFullWaText();
    const url = `https://wa.me/${ADMIN_CONTACT.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Gmail Compose
  const [emailSubject, setEmailSubject] = useState<string>('[BANTUAN TEKNIS] Kendala Layanan NexVps');
  const [emailBody, setEmailBody] = useState<string>(
    user 
      ? `Halo Tim Support NexVps,\n\nNama: ${user.displayName || '-'}\nEmail Akun: ${user.email}\n\nSaya ingin menyampaikan kendala / pertanyaan berikut:\n`
      : 'Halo Tim Support NexVps,\n\nSaya ingin menyampaikan pertanyaan / kendala berikut:\n'
  );

  const handleOpenGmailWeb = () => {
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${ADMIN_CONTACT.adminEmail}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(url, '_blank');
  };

  const handleOpenDefaultEmail = () => {
    const url = `mailto:${ADMIN_CONTACT.adminEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = url;
  };

  const handleCopyText = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(text);
      setTimeout(() => setCopiedEmail(null), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  // ----------------------------------------------------
  // 3. TICKET FORM STATE
  // ----------------------------------------------------
  const [ticketCategory, setTicketCategory] = useState<string>('Billing & QRIS');
  const [ticketPriority, setTicketPriority] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketMessage, setTicketMessage] = useState<string>('');
  const [submittedTicket, setSubmittedTicket] = useState<TicketRecord | null>(null);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    const newTicket: TicketRecord = {
      id: `TICK-NX-${Math.floor(10000 + Math.random() * 90000)}`,
      subject: ticketSubject.trim(),
      category: ticketCategory,
      priority: ticketPriority,
      status: 'Open',
      createdAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      message: ticketMessage.trim()
    };

    setSubmittedTicket(newTicket);
    setTicketSubject('');
    setTicketMessage('');
  };

  // ----------------------------------------------------
  // 4. FAQ ACCORDION STATE
  // ----------------------------------------------------
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>('');

  const filteredFaqs = FAQ_ITEMS.filter(item => 
    item.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
    item.a.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* ========================================================
          1. HERO HEADER SECTION
          ======================================================== */}
      <section className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden">
        {/* Ambient Top Glow in Dark Mode only */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-indigo-500/10 rounded-full blur-3xl hidden dark:block" />

        <div className="relative z-10 max-w-3xl">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-700 dark:text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Headphones className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Pusat Layanan Bantuan & NOC 24/7</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Hubungi Tim Admin &{' '}
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Dukungan Teknis
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Punya pertanyaan mengenai konfigurasi server UpCloud, aktivasi gateway QRIS, atau membutuhkan eskalasi darurat? Tim Administrator dan Engineer kami siap mendampingi Anda tanpa henti.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2 font-mono">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-900 dark:text-white">Admin NOC On-Duty:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Aktif & Siaga</span>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              <span>Respon Rata-rata: <strong className="text-slate-900 dark:text-white font-bold">&lt; 5 Menit</strong></span>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Jaminan SLA: <strong className="text-slate-900 dark:text-white font-bold">99.99%</strong></span>
            </div>
          </div>
        </div>

        {/* Support Navigation Pills */}
        <div className="relative z-10 mt-8 flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-6">
          {[
            { id: 'channels', label: 'WhatsApp & Gmail Gateway', icon: Phone, badge: 'Instan' },
            { id: 'ticket', label: 'Tiket Dukungan Formal', icon: FileText },
            { id: 'faq', label: 'FAQ & Solusi Cepat', icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeSupportTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveSupportTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isCurrent ? 'bg-slate-950/20 text-slate-950' : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          TAB 1: WHATSAPP & GMAIL DEDICATED GATEWAY
          ======================================================== */}
      {activeSupportTab === 'channels' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* WhatsApp Dedicated Card */}
          <section className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/40 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-md">
                    <MessageCircle className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dukungan Resmi WhatsApp</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">Status: Online 24 Jam Non-Stop</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">
                  Recommended
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Kirim pesan langsung ke WhatsApp Admin NexVps. Pilih template pesan di bawah untuk mendapatkan respons yang cepat dan tepat sasaran dari engineer kami.
              </p>

              {/* Template Selector */}
              <div className="mt-5 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Pilih Kategori Permasalahan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'qris', title: 'Konfirmasi QRIS', desc: 'Mutasi belum aktif otomatis' },
                    { key: 'server', title: 'Kendala Server Down', desc: 'VPS tidak dapat dijangkau' },
                    { key: 'ssh', title: 'Bantuan SSH & Root', desc: 'Gagal login / Reset password' },
                    { key: 'custom', title: 'Kustom Spek Enterprise', desc: 'Pemesanan cluster & resource besar' }
                  ].map((tpl) => (
                    <button
                      type="button"
                      key={tpl.key}
                      onClick={() => setWaTemplateCategory(tpl.key)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        waTemplateCategory === tpl.key
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 text-slate-900 dark:text-white ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs font-bold">{tpl.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{tpl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Note Input */}
              <div className="mt-4 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tambahan Pesan / Detail Masalah (Opsional):
                </label>
                <textarea
                  rows={2}
                  value={waCustomNote}
                  onChange={(e) => setWaCustomNote(e.target.value)}
                  placeholder="Contoh: Invoice #NX-12345 atau IP Server 192.168.1.1..."
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500"
                />
              </div>

              {/* Message Preview */}
              <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs font-mono text-emerald-900 dark:text-emerald-300">
                <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 mb-1">Preview Pesan WhatsApp:</p>
                <p className="whitespace-pre-wrap">{getFullWaText()}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => handleOpenWhatsApp()}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25 cursor-pointer hover:scale-[1.01]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim via WhatsApp (+62 812-3456-7890)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Rata-rata respons engineer: <strong>2 - 5 menit</strong></span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCheck className="w-3.5 h-3.5" />
                  Direct to Lead NOC
                </span>
              </div>
            </div>
          </section>

          {/* Gmail & Email Dedicated Card */}
          <section className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/40 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center shadow-md">
                    <Mail className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gmail & Layanan Surat Resmi</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Format Formal & Pengiriman Lampiran</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Formal Ticket
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Kirim email langsung melalui akun Gmail Web Anda atau aplikasi email bawaan. Ideal untuk pengiriman log error, faktur pajak perusahaan, atau bukti transfer.
              </p>

              {/* Email Form Pre-fill */}
              <div className="mt-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tujuan Pengiriman:
                  </label>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-900 dark:text-white">{ADMIN_CONTACT.adminEmail}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(ADMIN_CONTACT.adminEmail, 'email')}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedEmail === ADMIN_CONTACT.adminEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmail === ADMIN_CONTACT.adminEmail ? 'Tersalin' : 'Salin Email'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subjek Email:
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Isi Pesan Surat:
                  </label>
                  <textarea
                    rows={4}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleOpenGmailWeb}
                  className="py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka di Gmail Web</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenDefaultEmail}
                  className="py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-cyan-500" />
                  <span>Aplikasi Email Default</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Waktu respon email: <strong>&lt; 30 menit</strong></span>
                <span>Prioritas: <strong>High Ticket</strong></span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================
          4. TAB 3: FORMULIR TIKET DUKUNGAN RESMI
          ======================================================== */}
      {activeSupportTab === 'ticket' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/40">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-500" />
              <span>Kirim Tiket Masalah Baru</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6">
              Tiket akan langsung tercatat dalam antrean sistem teknisi kami. Anda akan menerima ID Tiket unik untuk pelacakan.
            </p>

            {submittedTicket ? (
              <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-4 animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Tiket Berhasil Dibuat!</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">ID Tiket: <strong className="font-mono">{submittedTicket.id}</strong></p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/20 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subjek:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{submittedTicket.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kategori:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{submittedTicket.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prioritas:</span>
                    <span className="uppercase font-bold text-cyan-600 dark:text-cyan-400">{submittedTicket.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Waktu Dibuat:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">{submittedTicket.createdAt}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp(`Halo Admin NexVps, saya baru saja membuat tiket: ${submittedTicket.id} mengenai "${submittedTicket.subject}". Mohon dibantu eskalasi.`)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Lanjutkan di WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmittedTicket(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all cursor-pointer"
                  >
                    Buat Tiket Baru Lainnya
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Kategori Permasalahan:
                    </label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Billing & QRIS">Billing & Pembayaran QRIS</option>
                      <option value="Server Provisioning">Server Provisioning & Status</option>
                      <option value="SSH & Akses Root">Koneksi SSH & Kredensial Root</option>
                      <option value="Jaringan & Port">Jaringan, Ping & Firewall</option>
                      <option value="Upgrade & Resource">Upgrade Kapasitas RAM/CPU</option>
                      <option value="Lainnya">Pertanyaan Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tingkat Urgensi:
                    </label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="normal">Normal (Respon &lt; 30 Menit)</option>
                      <option value="urgent">Urgent (Respon &lt; 15 Menit)</option>
                      <option value="emergency">Emergency / Server Mati (Respon &lt; 5 Menit)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Judul / Subjek Tiket:
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Contoh: Pembayaran QRIS Berhasil tapi Status Menunggu..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deskripsi Lengkap Kendala:
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Jelaskan secara detail kendala yang dialami, sertakan nomor order / invoice jika ada..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  Kirimkan Tiket ke Antrean Admin
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl text-xs space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Ketentuan Layanan Tiket</span>
              </h4>
              <ul className="space-y-2.5 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Setiap tiket akan diverifikasi langsung oleh engineer bersertifikasi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Tiket dengan prioritas Emergency otomatis men-trigger pager alert ke WhatsApp on-duty engineer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Riwayat tiket tersimpan secara aman demi akuntabilitas penanganan.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. TAB 4: FAQ & SELF-SERVICE KNOWLEDGE BASE
          ======================================================== */}
      {activeSupportTab === 'faq' && (
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/40 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pertanyaan Sering Diajukan (FAQ)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Temukan solusi cepat untuk pertanyaan seputar konfigurasi dan layanan VPS</p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                placeholder="Cari kata kunci FAQ..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {filteredFaqs.map((faq, index) => {
              const isOpen = expandedFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <span className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                Tidak ada pertanyaan yang sesuai dengan kata kunci "{faqSearchQuery}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          6. INFORMASI KONTAK LENGKAP & KANTOR PUSAT
          ======================================================== */}
      <section className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/40">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-cyan-500" />
          <span>Informasi Kontak & Jaringan Resmi NexVps</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase">
              <Phone className="w-4 h-4" />
              <span>WhatsApp Hotline</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{ADMIN_CONTACT.whatsappDisplay}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Tersedia 24 Jam via WhatsApp Chat</p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase">
              <Mail className="w-4 h-4" />
              <span>Email Resmi</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate">{ADMIN_CONTACT.adminEmail}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Departemen Teknis & Keuangan</p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase">
              <Clock className="w-4 h-4" />
              <span>Jam Operasional</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">24 Jam / 7 Hari</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Monitoring infrastruktur tanpa henti</p>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-500 text-xs font-bold uppercase">
              <Building2 className="w-4 h-4" />
              <span>Infrastruktur Cloud</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Equinix SG-SIN1</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Singapore Tier-4 Datacenter</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SupportPage;
