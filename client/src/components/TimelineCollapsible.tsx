"use client"

import React, { useState, useEffect } from "react"

// UI components
import { Button } from "./ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTime,
  TimelineTitle,
} from "./ui/timeline"

// third-party
import { AnimatePresence, motion } from "motion/react"

// assets
import {
  Activity,
  ChevronDown,
  Cpu,
  Database,
  Radio,
} from "lucide-react"

export interface TimelineCollapsibleProps {
  serverName?: string
  serverIp?: string
  className?: string
  defaultOpenItems?: Record<string, boolean>
}

//  ------------------------------ | TIMELINE - COLLAPSIBLE | ------------------------------  //

export function TimelineCollapsible({
  serverName,
  serverIp = "10.0.4.12",
  className = "",
  defaultOpenItems,
}: TimelineCollapsibleProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(
    defaultOpenItems || {
      step1: true,
      step2: false,
      step3: false,
    }
  )

  // Real-time live telemetry stream state
  const [ingestionRate, setIngestionRate] = useState<number>(1.4)
  const [latency, setLatency] = useState<number>(18)
  const [eventsProcessed, setEventsProcessed] = useState<number>(142850)
  const [activeSockets, setActiveSockets] = useState<number>(128)
  const [cacheHitRatio, setCacheHitRatio] = useState<number>(99.4)
  const [liveSecondCounter, setLiveSecondCounter] = useState<number>(0)

  // Real-time simulation ticker
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuating ingestion rate (1.2 to 2.6 MB/s)
      setIngestionRate((prev) => {
        const delta = (Math.random() - 0.48) * 0.22
        return parseFloat(Math.max(1.1, Math.min(2.8, prev + delta)).toFixed(1))
      })

      // Fluctuating latency (12 to 22 ms)
      setLatency((prev) => {
        const delta = Math.floor((Math.random() - 0.48) * 3)
        return Math.max(12, Math.min(24, prev + delta))
      })

      // Incrementing event stream
      setEventsProcessed((prev) => prev + Math.floor(Math.random() * 26 + 12))

      // Fluctuating active sockets
      setActiveSockets((prev) => {
        const delta = Math.floor((Math.random() - 0.5) * 3)
        return Math.max(112, Math.min(148, prev + delta))
      })

      // Minor hit ratio jitter
      setCacheHitRatio((prev) => {
        const delta = (Math.random() - 0.45) * 0.05
        return parseFloat(Math.max(98.8, Math.min(99.9, prev + delta)).toFixed(1))
      })

      setLiveSecondCounter((c) => c + 1)
    }, 1200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`w-full max-w-2xl rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#070f1e]/80 p-5 sm:p-7 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-blue-950/20 ${className}`}
    >
      {/* Header bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 shrink-0">
            <Radio className="size-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Pipeline Telemetri & Execution</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {serverName ? `${serverName} • ` : ""}Alur kerja sinkronisasi data & ingestion real-time
            </p>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setOpenItems({
                step1: true,
                step2: true,
                step3: true,
              })
            }
            className="h-7 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2.5 rounded-lg"
          >
            Expand All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setOpenItems({
                step1: false,
                step2: false,
                step3: false,
              })
            }
            className="h-7 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2.5 rounded-lg"
          >
            Collapse All
          </Button>
        </div>
      </div>

      <Timeline size="default">
        {/* Item 1: Cache Warmup & Schema Sync */}
        <TimelineItem status="completed">
          <TimelineSeparator>
            <TimelineIndicator variant="subtle">
              <Database className="size-4 text-blue-500 dark:text-blue-400" />
            </TimelineIndicator>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Collapsible
              open={openItems.step1}
              onOpenChange={(isOpen) =>
                setOpenItems((prev) => ({ ...prev, step1: isOpen }))
              }
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 text-left py-0.5 cursor-pointer group/trig select-none">
                <TimelineTitle className="text-sm font-semibold text-slate-900 dark:text-white group-hover/trig:text-blue-500 dark:group-hover/trig:text-blue-400 transition-colors">
                  Cache Warmup & Schema Sync
                </TimelineTitle>
                <div className="flex shrink-0 items-center gap-2">
                  <TimelineTime className="text-slate-500 dark:text-slate-400 font-mono text-xs">
                    08:30 AM
                  </TimelineTime>
                  <div className="flex size-5 items-center justify-center rounded-sm text-slate-400 group-hover/trig:text-slate-200 transition-colors">
                    <ChevronDown
                      className={`size-3.5 transition-transform duration-200 ${
                        openItems.step1 ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>
              <TimelineDescription className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Synchronized 24,000 document records to Redis cluster with TTL tags.
              </TimelineDescription>
              <AnimatePresence initial={false}>
                {openItems.step1 && (
                  <CollapsibleContent
                    render={
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      />
                    }
                  >
                    <div className="mt-3 space-y-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-[#070d18] p-3.5 font-mono text-xs shadow-inner text-slate-300 select-text">
                      <div className="text-slate-400 flex items-center justify-between">
                        <span>&gt; REDIS_HOST: <span className="text-slate-100">{serverIp}:6379</span></span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">CONNECTED</span>
                      </div>
                      <div className="text-slate-400">
                        &gt; KEYS_INDEXED: <span className="text-slate-100">24,192</span> <span className="text-cyan-400">[100%]</span>
                      </div>
                      <div className="text-emerald-400 font-semibold flex items-center gap-2">
                        <span>&gt; CACHE_HIT_RATIO: {cacheHitRatio}%</span>
                        <span className="text-[10px] text-slate-500 font-sans font-normal">(live sync)</span>
                      </div>
                    </div>
                  </CollapsibleContent>
                )}
              </AnimatePresence>
            </Collapsible>
          </TimelineContent>
        </TimelineItem>

        {/* Item 2: Worker Thread Pool Allocation */}
        <TimelineItem status="completed">
          <TimelineSeparator>
            <TimelineIndicator variant="subtle">
              <Cpu className="size-4 text-blue-500 dark:text-blue-400" />
            </TimelineIndicator>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Collapsible
              open={openItems.step2}
              onOpenChange={(isOpen) =>
                setOpenItems((prev) => ({ ...prev, step2: isOpen }))
              }
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 text-left py-0.5 cursor-pointer group/trig select-none">
                <TimelineTitle className="text-sm font-semibold text-slate-900 dark:text-white group-hover/trig:text-blue-500 dark:group-hover/trig:text-blue-400 transition-colors">
                  Worker Thread Pool Allocation
                </TimelineTitle>
                <div className="flex shrink-0 items-center gap-2">
                  <TimelineTime className="text-slate-500 dark:text-slate-400 font-mono text-xs">
                    08:32 AM
                  </TimelineTime>
                  <div className="flex size-5 items-center justify-center rounded-sm text-slate-400 group-hover/trig:text-slate-200 transition-colors">
                    <ChevronDown
                      className={`size-3.5 transition-transform duration-200 ${
                        openItems.step2 ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>
              <TimelineDescription className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Spawned 8 Node.js worker threads to handle batch background indexing.
              </TimelineDescription>
              <AnimatePresence initial={false}>
                {openItems.step2 && (
                  <CollapsibleContent
                    render={
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      />
                    }
                  >
                    <div className="mt-3 space-y-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-[#070d18] p-3.5 font-mono text-xs shadow-inner text-slate-300 select-text">
                      <div className="text-slate-400">
                        &gt; MAX_CONCURRENCY: <span className="text-slate-100">8 workers</span>
                      </div>
                      <div className="text-slate-400">
                        &gt; MEMORY_PER_THREAD: <span className="text-slate-100">128MB (Total 1024MB allocated)</span>
                      </div>
                      <div className="text-emerald-400 font-semibold">
                        &gt; STATUS: READY [0 crashed, 8 healthy]
                      </div>
                    </div>
                  </CollapsibleContent>
                )}
              </AnimatePresence>
            </Collapsible>
          </TimelineContent>
        </TimelineItem>

        {/* Item 3: Live Stream Ingestion (Real-time Active) */}
        <TimelineItem status="in-progress">
          <TimelineSeparator>
            <TimelineIndicator variant="in-progress">
              <Activity className="size-4 text-cyan-400" />
            </TimelineIndicator>
          </TimelineSeparator>
          <TimelineContent>
            <Collapsible
              open={openItems.step3}
              onOpenChange={(isOpen) =>
                setOpenItems((prev) => ({ ...prev, step3: isOpen }))
              }
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 text-left py-0.5 cursor-pointer group/trig select-none">
                <TimelineTitle className="text-sm font-semibold text-blue-500 dark:text-blue-400 flex items-center gap-2">
                  <span>Live Stream Ingestion</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                </TimelineTitle>
                <div className="flex shrink-0 items-center gap-2">
                  <TimelineTime className="text-slate-500 dark:text-slate-400 font-mono text-xs">
                    Running
                  </TimelineTime>
                  <div className="flex size-5 items-center justify-center rounded-sm text-slate-400 group-hover/trig:text-slate-200 transition-colors">
                    <ChevronDown
                      className={`size-3.5 transition-transform duration-200 ${
                        openItems.step3 ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>
              <TimelineDescription className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Streaming telemetry metrics and event payloads in real-time.
              </TimelineDescription>
              <AnimatePresence initial={false}>
                {openItems.step3 && (
                  <CollapsibleContent
                    render={
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      />
                    }
                  >
                    <div className="mt-3 space-y-2 rounded-xl border border-cyan-500/30 bg-slate-900 dark:bg-[#070d18] p-3.5 font-mono text-xs shadow-inner shadow-cyan-500/5 text-slate-300 select-text">
                      <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800/80">
                        <span className="text-[11px] text-cyan-400 font-bold tracking-wider">
                          REALTIME TELEMETRY FEED
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Tick #{liveSecondCounter}
                        </span>
                      </div>
                      
                      <div className="text-slate-400 flex items-center justify-between">
                        <span>&gt; INGESTION_RATE:</span>
                        <span className="text-cyan-300 font-semibold">{ingestionRate} MB/s</span>
                      </div>

                      <div className="text-slate-400 flex items-center justify-between">
                        <span>&gt; LATENCY:</span>
                        <span className="text-emerald-400 font-semibold">{latency}ms</span>
                      </div>

                      <div className="text-slate-400 flex items-center justify-between">
                        <span>&gt; EVENTS_PROCESSED:</span>
                        <span className="text-white font-semibold">
                          {eventsProcessed.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-slate-400 flex items-center justify-between">
                        <span>&gt; ACTIVE_SOCKETS:</span>
                        <span className="text-blue-300 font-semibold">{activeSockets} clients</span>
                      </div>

                      <div className="pt-1.5 text-[11px] text-emerald-400 font-medium border-t border-slate-800/60 flex items-center justify-between">
                        <span>&gt; HEALTH_STATUS: STABLE</span>
                        <span className="text-slate-400 font-mono text-[10px]">0 dropped pkts</span>
                      </div>
                    </div>
                  </CollapsibleContent>
                )}
              </AnimatePresence>
            </Collapsible>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  )
}

export default TimelineCollapsible
