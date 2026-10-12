'use client';

import React from 'react';
import { motion, type Variants } from 'motion/react';
import { 
  ArrowRight, 
  Server, 
  ExternalLink, 
  ShieldCheck, 
  Cpu, 
  Globe2, 
  Zap, 
  Activity, 
  Lock,
  ChevronRight
} from 'lucide-react';

interface FooterProps {
  onNavigateTab?: (tab: 'store' | 'servers' | 'admin' | 'changelog') => void;
  onOpenAuth?: (tab?: 'login' | 'register') => void;
}

export default function Footer({ onNavigateTab, onOpenAuth }: FooterProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const handleNav = (tab: 'store' | 'servers' | 'admin' | 'changelog') => {
    if (onNavigateTab) {
      onNavigateTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/5 bg-[#03050c] pt-24 pb-10 text-white mt-24">
      {/* Background Enhancements */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_10%,transparent_100%)] bg-[size:4rem_4rem]" 
        aria-hidden="true"
      />
      <div 
        className="absolute top-0 left-1/2 -z-10 h-[2px] w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent" 
        aria-hidden="true"
      />
      <div 
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[320px] w-[850px] -translate-x-1/2 rounded-[100%] bg-cyan-600/10 blur-[130px]" 
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mb-16 grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-5 lg:gap-14 xl:gap-20"
        >
          {/* Brand & Mission */}
          <motion.div
            variants={itemVariants}
            className="sm:col-span-2 flex flex-col justify-between"
          >
            <div>
              <div className="mb-6 flex items-center gap-3.5">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 shadow-[0_0_30px_rgba(6,182,212,0.35)]">
                  <Server className="w-6 h-6 text-white stroke-[2.2]" />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-3xl font-black tracking-tight text-transparent">
                    NexVps<span className="text-cyan-400">.</span>
                  </span>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-cyan-400/80">
                    Cloud Infrastructure
                  </span>
                </div>
              </div>

              <p className="mb-8 max-w-sm text-sm sm:text-base leading-relaxed font-light text-slate-400">
                Platform Cloud VPS berperforma tinggi berbasis UpCloud MaxIOPS Enterprise Storage dengan jaringan global 1 Gbps dan aktivasi pembayaran instan via BuatQRIS.
              </p>

              {/* Status pill badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs font-medium text-slate-300 shadow-inner mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Semua Node UpCloud Aktif · 99.99% Uptime</span>
              </div>
            </div>

            {/* Social & Community Links */}
            <div className="mt-auto flex items-center gap-3.5">
              {[
                {
                  label: 'GitHub',
                  href: 'https://github.com',
                  icon: (
                    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                  ),
                },
                {
                  label: 'UpCloud Docs',
                  href: 'https://developers.upcloud.com/api/1.3',
                  icon: <Zap className="h-4.5 w-4.5 text-cyan-400" />,
                },
                {
                  label: 'BuatQRIS Gateway',
                  href: 'https://app.buatqris.site/dasbort',
                  icon: <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />,
                },
                {
                  label: 'Global Network',
                  href: 'https://upcloud.com/network',
                  icon: <Globe2 className="h-4.5 w-4.5 text-indigo-400" />,
                },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  title={item.label}
                  className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.03] text-slate-400 shadow-lg transition-all hover:border-cyan-500/50 hover:text-white hover:scale-105"
                >
                  <span className="absolute inset-0 translate-y-full bg-gradient-to-t from-cyan-600/40 to-transparent transition-transform duration-300 group-hover:translate-y-0" />
                  <span className="relative z-10 transition-transform group-hover:scale-110">
                    {item.icon}
                  </span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Column 1: Produk & Paket */}
          <motion.div variants={itemVariants}>
            <h4 className="mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-sm font-bold tracking-wider text-transparent uppercase">
              Paket Cloud
            </h4>
            <ul className="space-y-3.5 text-sm font-medium text-slate-400">
              {[
                { title: 'Starter Cloud', desc: '1 vCPU · 1 GB RAM' },
                { title: 'Pro Developer', desc: '2 vCPU · 2 GB RAM', badge: 'POPULER' },
                { title: 'Business Cloud', desc: '2 vCPU · 4 GB RAM' },
                { title: 'Enterprise Power', desc: '4 vCPU · 8 GB RAM' },
              ].map((item) => (
                <li key={item.title}>
                  <button
                    onClick={() => handleNav('store')}
                    className="group flex flex-col text-left transition-colors hover:text-cyan-400 cursor-pointer"
                  >
                    <span className="flex items-center">
                      {item.title}
                      {item.badge && (
                        <span className="ml-2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 text-[9px] font-bold">
                          {item.badge}
                        </span>
                      )}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 -translate-x-2 text-cyan-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </span>
                    <span className="text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors">
                      {item.desc}
                    </span>
                  </button>
                </li>
              ))}
              <li className="pt-1">
                <button
                  onClick={() => handleNav('servers')}
                  className="group flex items-center text-xs font-semibold text-cyan-400/90 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <span>Kelola Server Saya</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Column 2: Infrastruktur & Lokasi */}
          <motion.div variants={itemVariants}>
            <h4 className="mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-sm font-bold tracking-wider text-transparent uppercase">
              Infrastruktur
            </h4>
            <ul className="space-y-3.5 text-sm font-medium text-slate-400">
              {[
                { label: 'Singapore #1 (SG3)', tag: '~15 ms' },
                { label: 'Frankfurt & Helsinki', tag: 'EU' },
                { label: 'London & Amsterdam', tag: 'UK' },
                { label: 'New York & Chicago', tag: 'US' },
                { label: 'Sydney Datacenter', tag: 'AU' },
              ].map((loc) => (
                <li key={loc.label}>
                  <div className="flex items-center justify-between group">
                    <span className="text-slate-400 group-hover:text-slate-200 transition-colors flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
                      {loc.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {loc.tag}
                    </span>
                  </div>
                </li>
              ))}
              <li className="pt-2 border-t border-slate-900/80">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>MaxIOPS Storage & DDoS Guard</span>
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Column 3: Ekosistem & Bantuan */}
          <motion.div variants={itemVariants}>
            <h4 className="mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-sm font-bold tracking-wider text-transparent uppercase">
              Ekosistem & API
            </h4>
            <ul className="space-y-3.5 text-sm font-medium text-slate-400">
              <li>
                <a
                  href="https://developers.upcloud.com/api/1.3"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center transition-colors hover:text-cyan-400"
                >
                  <span>UpCloud API 1.3</span>
                  <ExternalLink className="ml-1.5 h-3 w-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </a>
              </li>
              <li>
                <a
                  href="https://app.buatqris.site/dasbort"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center transition-colors hover:text-emerald-400"
                >
                  <span>BuatQRIS Dasbor</span>
                  <ExternalLink className="ml-1.5 h-3 w-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </a>
              </li>
              <li>
                <button
                  onClick={() => handleNav('admin')}
                  className="group flex items-center transition-colors hover:text-purple-400 cursor-pointer"
                >
                  <span>Admin Setup</span>
                  <span className="ml-2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.2 text-[9px] font-bold">
                    STAFF
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('changelog')}
                  className="group flex items-center transition-colors hover:text-cyan-400 cursor-pointer"
                >
                  <span>Changelog & Roadmap</span>
                  <span className="ml-2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.2 text-[9px] font-bold">
                    v2.0.0
                  </span>
                </button>
              </li>
              <li>
                <span className="flex items-center text-slate-400">
                  <span>Garansi SLA 99.99%</span>
                </span>
              </li>
              <li>
                <span className="flex items-center text-slate-400">
                  <span>Port Jaringan 1 Gbps</span>
                </span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Massive Background Brand Text Watermark */}
        <div 
          className="relative mt-12 mb-6 flex justify-center overflow-hidden md:mt-16 md:mb-8 pointer-events-none select-none"
          aria-hidden="true"
        >
          <span className="bg-gradient-to-b from-white/[0.08] via-cyan-500/[0.03] to-transparent bg-clip-text text-[26vw] leading-none font-black tracking-tighter text-transparent select-none md:text-[20vw] lg:text-[15vw]">
            NEXVPS
          </span>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 text-center md:flex-row md:gap-0 md:text-left"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs font-medium text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} NexVps Cloud Technologies. All rights reserved.
            </p>
            <span className="hidden sm:inline text-slate-700">•</span>
            <p className="text-slate-500">
              Powered by <span className="text-slate-400 font-semibold">UpCloud API</span> & <span className="text-emerald-400 font-semibold">BuatQRIS</span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-5 text-xs font-medium text-slate-500 md:gap-7">
            <a
              href="#terms"
              onClick={(e) => { e.preventDefault(); }}
              className="underline-offset-4 transition-all hover:text-cyan-400 hover:underline"
            >
              Kebijakan Privasi
            </a>
            <a
              href="#privacy"
              onClick={(e) => { e.preventDefault(); }}
              className="underline-offset-4 transition-all hover:text-cyan-400 hover:underline"
            >
              Syarat & Ketentuan
            </a>
            <a
              href="https://developers.upcloud.com/api/1.3"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 transition-all hover:text-cyan-400 hover:underline"
            >
              Dokumentasi API
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
