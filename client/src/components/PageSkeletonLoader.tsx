import React from 'react';
import { Skeleton } from './ui/skeleton';

/**
 * ServerTableSkeleton
 * Skeleton placeholder for the ServersDashboard table rows and analytics.
 */
export const ServerTableSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 3 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b101d] p-6 sm:p-7 space-y-5 shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <Skeleton className="h-11 w-11 rounded-2xl" />
              <Skeleton className="h-5 w-36 rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-3 w-4/5 rounded-md pt-2 border-t border-slate-100 dark:border-slate-800" />
          </div>
        ))}
      </div>

      {/* Filter Tabs and Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Skeleton className="h-10 w-64 rounded-2xl" />
        <Skeleton className="h-10 w-72 rounded-2xl" />
      </div>

      {/* Server Rows Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm"
          >
            <div className="flex items-center gap-3 flex-1 min-w-[220px]">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-40 rounded-md" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                </div>
              </div>
            </div>

            <div className="hidden sm:block w-24">
              <Skeleton className="h-4 w-12 rounded-md" />
            </div>
            <div className="hidden md:block w-24">
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
            <div className="hidden md:block w-24">
              <Skeleton className="h-4 w-14 rounded-md" />
            </div>
            <div className="hidden lg:block w-28">
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
            <Skeleton className="h-5 w-5 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ServerDetailSkeleton
 * Skeleton placeholder for ServerDetailView with live telemetry graphs and specs.
 */
export const ServerDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-150 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36 rounded-md" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-8 w-60 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-11 w-44 rounded-xl" />
      </div>

      {/* 4 Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-14 rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>

      {/* Specifications Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 sm:p-7 space-y-5">
        <Skeleton className="h-6 w-64 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-5 w-48 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * PageSkeletonLoader
 * High-performance full-page skeleton loader crafted according to UIAble & shadcn design principles.
 * Emulates the exact physical structure of the NexVps Cloud app (Sidebar, Navbar, Hero, Telemetry & Configurator)
 * ensuring zero Cumulative Layout Shift (CLS) and smooth perceived performance.
 */
export const PageSkeletonLoader: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-300">
      {/* Background ambient lighting placeholders */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden dark:block">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[140px]" />
      </div>

      {/* 1. APP SIDEBAR SKELETON (Hidden on mobile, visible on desktop) */}
      <aside className="relative z-30 shrink-0 hidden lg:flex flex-col justify-between w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl min-h-screen select-none">
        <div>
          {/* Sidebar Header */}
          <div className="flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-800/80 px-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-2.5 w-16 rounded-md" />
            </div>
          </div>

          {/* Sidebar Navigation Items */}
          <div className="p-3 space-y-6">
            {/* Section 1: Main Platform */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 rounded-md mx-2 mb-3" />
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100/60 dark:bg-slate-900/60">
                <Skeleton className="h-5 w-5 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-lg" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
                <Skeleton className="h-4 w-6 rounded-full" />
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl">
                <Skeleton className="h-5 w-5 rounded-lg" />
                <Skeleton className="h-4 w-28 rounded-md" />
              </div>
            </div>

            {/* Section 2: Infrastructure */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 rounded-md mx-2 mb-3" />
              <div className="flex items-center gap-3 p-2 rounded-xl">
                <Skeleton className="h-5 w-5 rounded-lg" />
                <Skeleton className="h-4 w-36 rounded-md" />
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl">
                <Skeleton className="h-5 w-5 rounded-lg" />
                <Skeleton className="h-4 w-30 rounded-md" />
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl">
                <Skeleton className="h-5 w-5 rounded-lg" />
                <Skeleton className="h-4 w-28 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Profile */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 p-3">
          <div className="flex items-center gap-3 p-1.5 rounded-xl bg-slate-100/60 dark:bg-slate-900/50">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-2.5 w-32 rounded-md" />
            </div>
            <Skeleton className="h-4 w-4 rounded-md" />
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar Skeleton */}
        <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-4 backdrop-blur-xl sm:px-6">
          {/* Left: Sidebar trigger + Breadcrumbs */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="hidden sm:flex items-center gap-2">
              <Skeleton className="h-4 w-20 rounded-md" />
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
          </div>

          {/* Right: Search, Theme switch, Notifications, Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Skeleton className="h-9 w-32 sm:w-52 rounded-xl" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>

        {/* Main Body Skeleton */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
          {/* HERO SECTION SKELETON */}
          <section className="text-center pt-8 pb-4 space-y-6 max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="flex justify-center">
              <Skeleton className="h-7 w-72 rounded-full" />
            </div>

            {/* Headlines */}
            <div className="space-y-3 flex flex-col items-center">
              <Skeleton className="h-10 sm:h-12 w-4/5 max-w-xl rounded-2xl" />
              <Skeleton className="h-9 sm:h-10 w-3/5 max-w-md rounded-2xl" />
            </div>

            {/* Subtitles */}
            <div className="space-y-2 flex flex-col items-center pt-1">
              <Skeleton className="h-4 w-11/12 max-w-2xl rounded-md" />
              <Skeleton className="h-4 w-3/4 max-w-lg rounded-md" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Skeleton className="h-12 w-48 rounded-2xl" />
              <Skeleton className="h-12 w-36 rounded-2xl" />
            </div>

            {/* Mock Code Terminal Window Skeleton */}
            <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-2xl max-w-2xl mx-auto text-left space-y-3">
              {/* Terminal Dots */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-3 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-lg" />
              </div>
              {/* Code lines */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3.5 w-8 rounded-md" />
                  <Skeleton className="h-3.5 w-3/4 rounded-md" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3.5 w-8 rounded-md" />
                  <Skeleton className="h-3.5 w-1/2 rounded-md" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3.5 w-8 rounded-md" />
                  <Skeleton className="h-3.5 w-2/3 rounded-md" />
                </div>
              </div>
            </div>
          </section>

          {/* TELEMETRY METRICS 4-CARD SKELETON (RealtimeStatsWidget) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-60 rounded-md" />
              </div>
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-4 w-12 rounded-md" />
                  </div>
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-28 rounded-md" />
                    <Skeleton className="h-7 w-20 rounded-lg" />
                    <Skeleton className="h-2.5 w-24 rounded-md" />
                  </div>
                  {/* Wave sparkline placeholder */}
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </section>

          {/* CONFIGURATOR SKELETON (Datacenter Zones & VPS Plans) */}
          <section className="space-y-6 pt-4">
            {/* Step 1: Datacenter Location */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 sm:p-7 space-y-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-xl" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-48 rounded-md" />
                  <Skeleton className="h-3 w-64 rounded-md" />
                </div>
              </div>

              {/* Location Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5"
                  >
                    <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-20 rounded-md" />
                      <Skeleton className="h-3 w-28 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: VPS Plan Tiers */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 sm:p-7 space-y-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-xl" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-40 rounded-md" />
                  <Skeleton className="h-3 w-56 rounded-md" />
                </div>
              </div>

              {/* Plan Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-24 rounded-md" />
                        <Skeleton className="h-4 w-12 rounded-full" />
                      </div>
                      <Skeleton className="h-7 w-28 rounded-lg" />
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Skeleton className="h-3.5 w-full rounded-md" />
                        <Skeleton className="h-3.5 w-4/5 rounded-md" />
                        <Skeleton className="h-3.5 w-3/4 rounded-md" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PageSkeletonLoader;
