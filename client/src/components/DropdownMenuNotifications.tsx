"use client"

import React from "react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  Bell,
  CheckCircle2,
  Server,
  Sparkles,
  Zap,
  Trash2,
  Shield,
  Layers,
  ExternalLink,
} from "lucide-react"
import { useNotification, type UserNotificationItem } from "../contexts/NotificationContext"
import { useAuth } from "../contexts/AuthContext"

interface DropdownMenuNotificationsProps {
  onNavigateTab?: (tab: 'store' | 'servers' | 'admin' | 'changelog') => void
  className?: string
}

export function DropdownMenuNotifications({
  onNavigateTab,
  className = "",
}: DropdownMenuNotificationsProps) {
  const { user } = useAuth()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll
  } = useNotification()

  const handleItemClick = (notification: UserNotificationItem) => {
    markAsRead(notification.id)

    if (
      notification.category === "server" ||
      notification.category === "order" ||
      notification.title.toLowerCase().includes("vps") ||
      notification.title.toLowerCase().includes("server")
    ) {
      onNavigateTab?.("servers")
    }
  }

  const getCategoryIcon = (item: UserNotificationItem) => {
    switch (item.category) {
      case "server":
        return <Server className="size-4 text-cyan-400" />
      case "payment":
        return <Zap className="size-4 text-emerald-400" />
      case "security":
        return <Shield className="size-4 text-amber-400" />
      case "order":
        return <Layers className="size-4 text-blue-400" />
      case "system":
      default:
        return item.status === "success" ? (
          <CheckCircle2 className="size-4 text-emerald-400" />
        ) : (
          <Sparkles className="size-4 text-indigo-400" />
        )
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className={`relative h-9 w-9 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-sm ${className}`}
            title="Lihat Notifikasi Realtime"
            aria-label="Notifications"
          />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[340px] sm:w-[380px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-2.5 shadow-2xl backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0 text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Notifikasi Realtime</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 text-[10px] font-bold border border-cyan-500/20">
                  {unreadCount} baru
                </span>
              )}
            </DropdownMenuLabel>
            {user && (
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate max-w-[190px] block mt-0.5">
                {user.email}
              </span>
            )}
          </DropdownMenuGroup>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  markAllAsRead()
                }}
                className="h-auto px-2 py-0.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline transition-colors cursor-pointer"
              >
                Tandai dibaca
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  clearAll()
                }}
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Hapus semua notifikasi"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="bg-slate-200/80 dark:bg-slate-800/80 my-1.5" />

        {/* Notifications list */}
        <DropdownMenuGroup className="max-h-84 overflow-y-auto space-y-1.5 pr-0.5">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              <Sparkles className="size-6 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="font-medium text-slate-300">Belum ada notifikasi baru</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Aktivitas pesanan & status server VPS Anda akan tampil realtime di sini.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`items-start gap-3 p-2.5 rounded-xl transition-all select-none cursor-pointer border ${
                  item.unread
                    ? "bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border-cyan-500/30 shadow-sm"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-transparent opacity-80"
                }`}
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shrink-0">
                  {getCategoryIcon(item)}
                </div>

                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h6 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h6>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {item.time}
                    </span>
                  </div>

                  {item.desc && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  )}

                  {item.metadata?.hostname && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-900 border border-slate-700 text-cyan-400">
                        {item.metadata.hostname}
                      </span>
                      {item.metadata.serverIp && (
                        <span className="text-[9px] font-mono text-slate-400">
                          {item.metadata.serverIp}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {item.unread && (
                  <span className="mt-1.5 ml-auto flex h-2 w-2 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-slate-200/80 dark:bg-slate-800/80 my-1.5" />

        {/* Footer */}
        <DropdownMenuItem
          onClick={() => onNavigateTab?.("servers")}
          className="justify-center text-center text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-cyan-400 py-1.5 cursor-pointer flex items-center gap-1.5"
        >
          <span>Kelola Semua Server & Riwayat</span>
          <ExternalLink className="size-3" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownMenuNotifications
