import React, { useState, useEffect } from 'react';
import type { Order } from '../types';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import confetti from 'canvas-confetti';
import { 
  X, 
  Copy, 
  Check, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  Terminal, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Zap,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface QrisCheckoutModalProps {
  order: Order | null;
  onClose: () => void;
  onVpsReady: (order: Order) => void;
}

export const QrisCheckoutModal: React.FC<QrisCheckoutModalProps> = ({
  order: initialOrder,
  onClose,
  onVpsReady
}) => {
  const toast = useToast();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(initialOrder);
  const [copiedAmount, setCopiedAmount] = useState<boolean>(false);
  const [copiedSsh, setCopiedSsh] = useState<boolean>(false);
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>('15:00');

  useEffect(() => {
    setCurrentOrder(initialOrder);
  }, [initialOrder]);

  // Countdown timer calculation
  useEffect(() => {
    if (!currentOrder || currentOrder.paymentStatus === 'PAID') return;

    const timer = setInterval(() => {
      if (!currentOrder.expiredAt) {
        setTimeLeft('14:59');
        return;
      }
      const diff = new Date(currentOrder.expiredAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Kedaluwarsa');
        clearInterval(timer);
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentOrder]);

  // Auto-poll status every 3 seconds for real-time payment detection
  useEffect(() => {
    if (!currentOrder || currentOrder.paymentStatus === 'PAID') return;

    const interval = setInterval(async () => {
      try {
        const updated = await api.checkPayment(currentOrder.id);
        if (updated.paymentStatus === 'PAID') {
          setCurrentOrder(updated);
          triggerConfetti();
        }
      } catch (e) {
        // quiet error on interval
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentOrder]);

  // Polling server IP and status once paid until active
  useEffect(() => {
    if (!currentOrder || currentOrder.paymentStatus !== 'PAID' || currentOrder.vpsStatus === 'ACTIVE' || currentOrder.vpsStatus === 'ERROR') return;

    const interval = setInterval(async () => {
      try {
        const updated = await api.getOrder(currentOrder.id);
        setCurrentOrder(updated);
        if (updated.vpsStatus === 'ACTIVE') {
          onVpsReady(updated);
        }
      } catch (e) {
        // quiet
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentOrder, onVpsReady]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualCheck = async () => {
    if (!currentOrder) return;
    setIsChecking(true);
    try {
      const updated = await api.checkPayment(currentOrder.id);
      setCurrentOrder(updated);
      if (updated.paymentStatus === 'PAID') {
        triggerConfetti();
        toast.success('Pembayaran Berhasil Diterima!', 'Memulai provisioning VPS UpCloud otomatis.');
      } else {
        toast.info('Menunggu Pembayaran', 'Pembayaran belum terdeteksi di mutasi. Pastikan transfer nominal sesuai.');
      }
    } catch (err: any) {
      toast.error('Pengecekan Pembayaran', err.message);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRetryProvision = async () => {
    if (!currentOrder) return;
    setIsRetrying(true);
    try {
      const updated = await api.retryProvision(currentOrder.id);
      setCurrentOrder(updated);
      toast.success('Provisioning Diulang', 'Meminta UpCloud API membangun ulang server VPS.');
    } catch (err: any) {
      toast.error('Gagal Mencoba Ulang Provisioning', err.message);
    } finally {
      setIsRetrying(false);
    }
  };

  if (!currentOrder) return null;

  const isPaid = currentOrder.paymentStatus === 'PAID';
  const isVpsActive = currentOrder.vpsStatus === 'ACTIVE';
  const isVpsError = currentOrder.vpsStatus === 'ERROR';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                {currentOrder.orderNumber}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(currentOrder.createdAt).toLocaleTimeString('id-ID')}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              {isPaid ? 'Pembayaran Sukses — VPS Provisioning' : 'Selesaikan Pembayaran QRIS'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* VIEW A: UNPAID - QRIS PAYMENT */}
          {!isPaid ? (
            <div className="space-y-6 text-center">
              
              {/* QR Code Container */}
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-cyan-500/30 relative group">
                  {currentOrder.qrUrl || currentOrder.qrisImage ? (
                    <img
                      src={currentOrder.qrUrl || currentOrder.qrisImage}
                      alt="QRIS Code"
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center bg-slate-100 text-slate-400 rounded-xl">
                      Memuat QRIS...
                    </div>
                  )}

                  {/* QRIS Logo banner */}
                  <div className="mt-2 text-center text-slate-900 font-black text-xs tracking-wider">
                    QRIS • STANDAR NASIONAL
                  </div>
                </div>

                {/* Expiry countdown */}
                <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Sisa Waktu Pembayaran: <strong className="text-cyan-400 font-mono">{timeLeft}</strong></span>
                </div>
              </div>

              {/* Exact Amount To Pay */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Nominal yang Harus Ditransfer (Termasuk Kode Unik):
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">
                    Rp {currentOrder.totalAmountIdr.toLocaleString('id-ID')}
                  </span>
                  <button
                    onClick={() => copyToClipboard(currentOrder.totalAmountIdr.toString(), setCopiedAmount)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
                    title="Salin Nominal"
                  >
                    {copiedAmount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedAmount ? 'Disalin' : 'Salin'}</span>
                  </button>
                </div>
                {currentOrder.amountUniq && (
                  <p className="text-[11px] text-amber-400">
                    *Wajib transfer sesuai nominal hingga digit terakhir agar sistem UpCloud memproses VPS otomatis!
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="text-left text-xs text-slate-400 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <p className="font-semibold text-slate-300 mb-1">Cara Pembayaran QRIS:</p>
                <p>1. Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (GoPay, OVO, Dana, ShopeePay).</p>
                <p>2. Pilih menu <strong>Scan QRIS</strong> dan arahkan kamera ke kode QR di atas.</p>
                <p>3. Pastikan nominal pembayaran adalah <strong>Rp {currentOrder.totalAmountIdr.toLocaleString('id-ID')}</strong>.</p>
                <p>4. Konfirmasi pembayaran. Setelah berhasil, halaman ini akan otomatis berganti dan membangun VPS UpCloud Anda.</p>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleManualCheck}
                  disabled={isChecking}
                  className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Memeriksa ke BuatQRIS...' : 'Cek Status Pembayaran Sekarang'}</span>
                </button>

                {/* Real-time Monitoring Indicator */}
                <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                  </span>
                  <span className="font-semibold text-[11px]">Memantau pembayaran real-time (otomatis deteksi setelah dibayar)</span>
                </div>

                {currentOrder.paymentUrl && (
                  <div className="text-center">
                    <a
                      href={currentOrder.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      <span>Buka halaman bayar BuatQRIS langsung</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            
            /* VIEW B: PAID - VPS PROVISIONING PROGRESS & CREDENTIALS */
            <div className="space-y-6">
              
              {/* Status Banner */}
              <div className={`p-5 rounded-2xl border text-center ${
                isVpsActive 
                  ? 'bg-emerald-950/20 border-emerald-500/30' 
                  : isVpsError
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-cyan-950/20 border-cyan-500/30'
              }`}>
                {isVpsActive ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-white">VPS Siap Digunakan!</h4>
                    <p className="text-xs text-slate-300">
                      Server UpCloud telah berhasil di-deploy, IP publik dialokasikan & siap login SSH.
                    </p>
                  </div>
                ) : isVpsError ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-white">Gagal Membangun VPS</h4>
                    <p className="text-xs text-rose-300 max-w-md mx-auto">
                      {currentOrder.errorMessage || 'Terjadi kesalahan saat berkomunikasi dengan UpCloud API.'}
                    </p>
                    <button
                      onClick={handleRetryProvision}
                      disabled={isRetrying}
                      className="mt-3 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                      <span>{isRetrying ? 'Sedang Mencoba Ulang...' : 'Coba Bangun Ulang Sekarang (Retry)'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                    <div>
                      <h4 className="text-lg font-bold text-white">Sedang Membangun VPS di UpCloud...</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Mengalokasikan storage MaxIOPS, menyiapkan OS & cloud-init (~15-40 detik)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Milestones */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Pembayaran QRIS Terkonfirmasi Lunas</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Request Pembuatan Server Dikirim ke UpCloud API 1.3</span>
                </div>
                {isVpsError ? (
                  <div className="flex items-center gap-3 text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Status: Gagal — {currentOrder.errorMessage || 'UpCloud mengembalikan status error'}</span>
                  </div>
                ) : (
                  <>
                    <div className={`flex items-center gap-3 ${currentOrder.serverUuid ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {currentOrder.serverUuid ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                      <span>UUID Server UpCloud Dialokasikan: {currentOrder.serverUuid || 'Menunggu...'}</span>
                    </div>
                    <div className={`flex items-center gap-3 ${isVpsActive ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {isVpsActive ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                      <span>Inisialisasi Cloud-Init & IP Publik: {currentOrder.serverIp || 'Sedang proses...'}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Server Access Credentials Box */}
              {currentOrder.serverIp && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h5 className="font-bold text-white text-sm flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      Detail Akses Server VPS
                    </h5>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
                      ONLINE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">IP Publik (IPv4):</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">{currentOrder.serverIp}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Username SSH:</span>
                      <span className="text-white font-mono font-bold text-sm">root</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-[11px]">Password Root:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-400 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(currentOrder.rootPassword, setCopiedPassword)}
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                          >
                            {copiedPassword ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedPassword ? 'Tersalin' : 'Salin'}</span>
                          </button>
                        </div>
                      </div>
                      <span className="text-white font-mono text-sm">
                        {showPassword ? currentOrder.rootPassword : '••••••••••••••••'}
                      </span>
                    </div>
                  </div>

                  {/* One-click SSH Command */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <span className="text-[11px] text-slate-400 block">Perintah Akses Terminal:</span>
                    <div className="flex items-center justify-between gap-2 bg-slate-950 px-3 py-2 rounded-lg font-mono text-xs text-emerald-400">
                      <span className="truncate">ssh root@{currentOrder.serverIp}</span>
                      <button
                        onClick={() => copyToClipboard(`ssh root@${currentOrder.serverIp}`, setCopiedSsh)}
                        className="text-slate-400 hover:text-white shrink-0"
                        title="Salin Perintah SSH"
                      >
                        {copiedSsh ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Final Close / Dashboard button */}
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.01] transition-all cursor-pointer"
              >
                Tutup & Buka Menu "Server Saya"
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
