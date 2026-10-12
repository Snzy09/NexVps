'use client';

import React, { type MouseEvent as ReactMouseEvent } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Code2,
  CornerDownLeft,
  Folder,
  FolderOpen,
  GitBranch,
  Play,
  Search,
  Sparkles,
  X,
  Server,
  Zap,
  ShieldCheck,
  ExternalLink,
  Cpu,
  Globe2
} from 'lucide-react';

interface HeroSectionProps {
  onExploreClick?: () => void;
}

export function HeroSection({ onExploreClick }: HeroSectionProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: ReactMouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const handleScrollToConfig = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const el = document.getElementById('vps-configurator-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-12 text-white">
      {/* Background Multi-layer Radial Glow */}
      <div 
        className="pointer-events-none absolute top-1/3 left-1/2 h-[450px] w-[750px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-600/15 blur-[140px]" 
        aria-hidden="true" 
      />
      <div 
        className="pointer-events-none absolute top-1/2 left-1/2 h-[350px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/15 blur-[120px]" 
        aria-hidden="true" 
      />

      <div className="relative z-10 container mx-auto flex flex-col items-center px-4 text-center">
        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-[0_0_25px_rgba(6,182,212,0.2)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>UpCloud Enterprise Cloud & QRIS Otomatis</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-5 max-w-4xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.12]"
        >
          The Next-Gen Cloud VPS
          <br />
          for <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Modern Developers</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-8 max-w-2xl text-base text-slate-300/90 sm:text-lg leading-relaxed font-normal"
        >
          Infrastruktur komputasi berkecepatan tinggi dengan storage MaxIOPS 100K+ IOPS. Aktivasi instan otomatis melalui gateway QRIS dinamis dalam hitungan detik.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-14 flex flex-col items-center gap-3.5 sm:flex-row"
        >
          <button
            type="button"
            onClick={handleScrollToConfig}
            className="group cursor-pointer rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-sm font-bold text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.55)] transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <Server className="w-4 h-4 text-white" />
            <span>Konfigurasi Server Sekarang</span>
            <ArrowRight className="ml-0.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </button>

          <a
            href="https://developers.upcloud.com/api/1.3"
            target="_blank"
            rel="noreferrer"
            className="group cursor-pointer rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>UpCloud API 1.3 Docs</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-white transition-colors" />
          </a>
        </motion.div>

        {/* Mockup UI Showcase (Glassmorphic + Spotlight) */}
        <div className="relative mt-2 w-full max-w-4xl">
          {/* Ambient Multi-layer Glow Behind Mockup */}
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-tr from-cyan-600/30 via-indigo-500/20 to-blue-600/30 opacity-70 blur-2xl" />

          {/* Floating Metric Badge 1 (Top Right) */}
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute -top-3.5 right-1 z-30 flex origin-top-right scale-[0.85] items-center gap-2 rounded-xl border border-emerald-500/30 bg-[#0B0F19] px-2.5 py-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.8)] ring-1 ring-white/10 backdrop-blur-xl sm:-top-5 sm:right-0 sm:scale-95 sm:gap-2.5 sm:px-3.5 sm:py-2 md:-top-6 md:-right-2 md:scale-100 lg:-top-6 lg:-right-6 xl:-top-7 xl:-right-6"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-inner sm:h-7 sm:w-7">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  UpCloud MaxIOPS
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  100% SLA
                </span>
              </div>
              <span className="text-[10px] text-gray-400">
                100K+ IOPS • 1 Gbps Port
              </span>
            </div>
          </motion.div>

          {/* Floating Metric Badge 2 (Bottom Left) */}
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute -bottom-3.5 left-1 z-30 flex origin-bottom-left scale-[0.85] items-center gap-2 rounded-xl border border-cyan-500/30 bg-[#0B0F19] px-2.5 py-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.8)] ring-1 ring-white/10 backdrop-blur-xl sm:-bottom-5 sm:left-0 sm:scale-95 sm:gap-2.5 sm:px-3.5 sm:py-2 md:-bottom-6 md:-left-2 md:scale-100 lg:-bottom-6 lg:-left-6 xl:-bottom-7 xl:-left-6"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/15 text-cyan-400 shadow-inner sm:h-7 sm:w-7">
              <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  QRIS Gateway Ready
                </span>
                <span className="flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                  Live Webhook
                </span>
              </div>
              <span className="text-[10px] text-gray-400">
                &lt; 30s Auto Provisioning
              </span>
            </div>
          </motion.div>

          {/* Main IDE / Cloud Console Window with Spotlight Effect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onMouseMove={handleMouseMove}
            className="group relative z-10 w-full overflow-hidden rounded-2xl border border-white/15 bg-[#0B0F19]/60 text-left shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10 backdrop-blur-2xl transition-colors hover:border-cyan-500/40"
          >
            {/* Interactive Spotlight Radial Glow */}
            <motion.div
              className="pointer-events-none absolute -inset-px z-0 opacity-0 transition duration-300 group-hover:opacity-100"
              style={{
                background: useMotionTemplate`
                  radial-gradient(
                    450px circle at ${mouseX}px ${mouseY}px,
                    rgba(6, 182, 212, 0.18),
                    rgba(99, 102, 241, 0.10),
                    transparent 80%
                  )
                `,
              }}
            />

            {/* Interactive Spotlight Border Highlight */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-30 rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
              style={
                {
                  background: useMotionTemplate`
                    radial-gradient(
                      350px circle at ${mouseX}px ${mouseY}px,
                      rgba(34, 211, 238, 0.7),
                      rgba(129, 140, 248, 0.4),
                      transparent 80%
                    )
                  `,
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  padding: '1.5px',
                } as any
              }
            />

            {/* Window Titlebar */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs backdrop-blur-md">
              {/* Left: Window Dots & Project Breadcrumb */}
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-1.5">
                  <div className="h-2.5 w-2.5 rounded-full border border-[#E0443E]/50 bg-[#FF5F56]/90 shadow-inner" />
                  <div className="h-2.5 w-2.5 rounded-full border border-[#DEA123]/50 bg-[#FFBD2E]/90 shadow-inner" />
                  <div className="h-2.5 w-2.5 rounded-full border border-[#1AAB29]/50 bg-[#27C93F]/90 shadow-inner" />
                </div>
                <div className="hidden items-center gap-1.5 font-mono text-[11px] text-gray-400 sm:flex">
                  <span>nexvps</span>
                  <span className="text-gray-600">/</span>
                  <span>infrastructure</span>
                  <span className="text-gray-600">/</span>
                  <span className="font-medium text-cyan-300">
                    deploy-instance.ts
                  </span>
                </div>
              </div>

              {/* Center: Command Palette / Search Bar */}
              <div className="flex w-36 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-gray-400 sm:w-56 md:w-64">
                <Search className="h-3 w-3 shrink-0 text-gray-500" />
                <span className="truncate text-[10px] text-gray-400">
                  Quick deploy or search templates...
                </span>
                <span className="py-0.2 ml-auto hidden items-center rounded border border-white/10 bg-white/5 px-1 font-mono text-[9px] text-gray-400 md:inline-flex">
                  ⌘K
                </span>
              </div>

              {/* Right: Branch & Engine Info */}
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] text-gray-300 md:flex">
                  <GitBranch className="h-2.5 w-2.5 text-cyan-400" />
                  <span>main</span>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-300">
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>UpCloud API 1.3</span>
                </div>
              </div>
            </div>

            {/* Window Body: 3-Panel Compact Layout */}
            <div className="relative z-10 grid min-h-[300px] grid-cols-1 md:grid-cols-12">
              {/* Left Panel: Cloud Resources Explorer */}
              <div className="hidden flex-col border-r border-white/10 bg-black/20 text-xs backdrop-blur-sm select-none md:col-span-3 md:flex">
                <div className="flex items-center justify-between border-b border-white/5 px-3 py-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  <span>Resources</span>
                  <Code2 className="h-3 w-3 text-gray-500" />
                </div>
                <div className="space-y-0.5 p-1.5 font-mono text-[11px]">
                  <div className="flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-gray-400 hover:bg-white/5">
                    <Folder className="h-3 w-3 text-cyan-500/70" />
                    <span>regions/sg-sin1</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 font-medium text-cyan-300">
                    <FolderOpen className="h-3 w-3 text-cyan-400" />
                    <span>production/vps</span>
                  </div>
                  <div className="space-y-0.5 pl-3.5">
                    <div className="flex items-center gap-1.5 rounded border-l-2 border-cyan-400 bg-cyan-500/15 px-2 py-1 font-medium text-cyan-200">
                      <span className="text-[9px] font-bold text-cyan-400">
                        TS
                      </span>
                      <span className="truncate">deploy.ts</span>
                    </div>
                    <div className="flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-gray-400 hover:bg-white/5 hover:text-gray-300">
                      <span className="text-[9px] font-bold text-gray-500">
                        YML
                      </span>
                      <span className="truncate">cloud-init.yml</span>
                    </div>
                  </div>
                  <div className="flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-gray-400 hover:bg-white/5">
                    <Folder className="h-3 w-3 text-gray-500" />
                    <span>storage/maxiops</span>
                  </div>
                </div>

                {/* Cloud Context Mini Card */}
                <div className="m-2 mt-auto rounded-lg border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xs">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[9px] font-semibold tracking-wider text-gray-400 uppercase">
                      Cloud Context
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-gray-400">
                    <span>8 Datacenters</span>
                    <span className="text-cyan-300">100% Ready</span>
                  </div>
                </div>
              </div>

              {/* Center Panel: Code Editor with Inline Deployment Diff */}
              <div className="col-span-1 flex min-w-0 flex-col bg-transparent md:col-span-9 lg:col-span-6">
                {/* Editor Tab Bar */}
                <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.015] px-2 pt-1 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1.5 border-b-2 border-cyan-500 bg-white/[0.04] px-2.5 py-1.5 font-mono text-[11px] font-medium text-gray-200">
                      <span className="text-[9px] font-bold text-cyan-400">
                        TS
                      </span>
                      <span>deploy.ts</span>
                      <X className="ml-0.5 h-2.5 w-2.5 cursor-pointer text-gray-500 hover:text-white" />
                    </div>
                    <div className="hidden cursor-pointer items-center gap-1.5 px-2 py-1.5 font-mono text-[11px] text-gray-500 hover:text-gray-300 sm:flex">
                      <span className="text-[9px] font-bold text-gray-600">
                        YML
                      </span>
                      <span>cloud-init.yml</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pr-1">
                    <button 
                      onClick={handleScrollToConfig}
                      className="flex cursor-pointer items-center gap-1 rounded bg-cyan-500/15 px-2 py-0.5 text-[10px] text-cyan-300 transition-colors hover:bg-cyan-500/25"
                    >
                      <Play className="h-2.5 w-2.5 fill-current" />
                      <span>Deploy</span>
                    </button>
                  </div>
                </div>

                {/* Editor Lines */}
                <div className="flex-1 overflow-x-auto p-3 font-mono text-xs leading-relaxed select-none sm:text-[12px]">
                  {/* Line 1 */}
                  <div className="flex items-start">
                    <span className="mr-3 w-4 shrink-0 text-right text-gray-600 select-none">
                      1
                    </span>
                    <span className="text-cyan-400">
                      import{" "}
                      <span className="text-gray-200">{"{ UpCloudClient }"}</span> from{" "}
                      <span className="text-green-300">"@nexvps/core"</span>;
                    </span>
                  </div>
                  {/* Line 2 */}
                  <div className="flex items-start">
                    <span className="mr-3 w-4 shrink-0 text-right text-gray-600 select-none">
                      2
                    </span>
                    <span className="text-cyan-400">
                      export async function{" "}
                      <span className="text-blue-300">provisionInstance</span>(
                      <span className="text-orange-300">plan</span>:{" "}
                      <span className="text-cyan-300">VpsPlan</span>) {"{"}
                    </span>
                  </div>
                  {/* Line 3 */}
                  <div className="flex items-start">
                    <span className="mr-3 w-4 shrink-0 text-right text-gray-600 select-none">
                      3
                    </span>
                    <span className="pl-3 text-cyan-400">
                      const <span className="text-blue-300">cloud</span> ={" "}
                      <span className="text-cyan-400">new</span>{" "}
                      <span className="text-yellow-200">UpCloudClient</span>({"{"}{" "}
                      <span className="text-gray-300">zone</span>:{" "}
                      <span className="text-green-300">"sg-sin1"</span> {"}"}
                      );
                    </span>
                  </div>

                  {/* Inline Automation Suggestion / Diff Block */}
                  <div className="my-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-2 shadow-sm ring-1 ring-cyan-500/20 backdrop-blur-xs">
                    <div className="mb-1 flex items-center justify-between font-sans text-[10px]">
                      <div className="flex items-center gap-1 font-medium text-cyan-300">
                        <Sparkles className="h-3 w-3 text-cyan-400" />
                        <span>Automated Pipeline: Instant QRIS & MaxIOPS Deploy</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="py-0.2 rounded border border-cyan-500/30 bg-cyan-500/20 px-1 font-mono text-[9px] text-cyan-300">
                          Ready
                        </span>
                        <span className="text-[9px] text-gray-400">Live</span>
                      </div>
                    </div>
                    <div className="space-y-0.5 font-mono text-[11px] text-emerald-300">
                      <div className="flex items-start">
                        <span className="mr-3 w-4 shrink-0 text-right text-emerald-500/60 select-none">
                          4
                        </span>
                        <span className="pl-3">
                          <span className="font-bold text-emerald-400">+</span>{" "}
                          return await cloud.createInstance({"{"}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="mr-3 w-4 shrink-0 text-right text-emerald-500/60 select-none">
                          5
                        </span>
                        <span className="pl-6">
                          <span className="font-bold text-emerald-400">+</span>{" "}
                          storage: "MaxIOPS-100K", port: "1Gbps", qrisAutoSettle: true
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="mr-3 w-4 shrink-0 text-right text-emerald-500/60 select-none">
                          6
                        </span>
                        <span className="pl-3">
                          <span className="font-bold text-emerald-400">+</span>{" "}
                          {"}"});
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Line 7 */}
                  <div className="flex items-start">
                    <span className="mr-3 w-4 shrink-0 text-right text-gray-600 select-none">
                      7
                    </span>
                    <span className="text-cyan-400">{"}"}</span>
                  </div>
                </div>

                {/* Editor Bottom Status Bar */}
                <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-3 py-1 font-mono text-[10px] text-gray-500 backdrop-blur-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-gray-400">
                      <GitBranch className="h-2.5 w-2.5 text-cyan-400" />{" "}
                      main*
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">TypeScript 5.7</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                    <span className="text-gray-300">100K+ IOPS</span>
                  </div>
                </div>
              </div>

              {/* Right Panel: Cloud Copilot Drawer */}
              <div className="hidden flex-col border-l border-white/10 bg-black/20 p-3 text-xs backdrop-blur-sm lg:col-span-3 lg:flex">
                {/* Assistant Header */}
                <div className="mb-2 flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400">
                      <Sparkles className="h-3 w-3" />
                    </div>
                    <span className="text-[11px] font-semibold text-white">
                      Cloud Copilot
                    </span>
                  </div>
                  <div className="py-0.2 flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 text-[9px] text-emerald-400">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    <span>Ready</span>
                  </div>
                </div>

                {/* Assistant Feed */}
                <div className="flex-1 space-y-2 font-sans">
                  {/* User Message */}
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2">
                    <div className="mb-1 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-[8px] font-black flex items-center justify-center text-white">
                        NX
                      </div>
                      <span className="text-[10px] font-medium text-gray-300">
                        Developer
                      </span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-gray-300">
                      "Deploy 2 vCPU 2GB RAM di Singapore SG3 dengan Ubuntu 24.04."
                    </p>
                  </div>

                  {/* AI Response & Actions */}
                  <div className="space-y-1.5 rounded-lg border border-cyan-500/20 bg-cyan-950/15 p-2">
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-cyan-300">
                      <Bot className="h-3 w-3 text-cyan-400" />
                      <span>Orchestrations</span>
                    </div>
                    <div className="space-y-1 font-mono text-[10px] text-gray-400">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Check className="h-3 w-3 shrink-0 text-emerald-400" />
                        <span>Storage MaxIOPS verified (12ms)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Check className="h-3 w-3 shrink-0 text-emerald-400" />
                        <span>QRIS Webhook auto-hooked</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assistant Input Bar */}
                <div className="mt-2 flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-gray-400">
                  <span className="truncate text-[10px] text-gray-500">
                    Ask Cloud Copilot...
                  </span>
                  <div className="flex h-4 w-4 items-center justify-center rounded bg-cyan-600/30 text-cyan-300">
                    <CornerDownLeft className="h-2.5 w-2.5" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
