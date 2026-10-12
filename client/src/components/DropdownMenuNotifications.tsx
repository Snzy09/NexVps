"use client"

import React, { useState, useEffect } from "react"

// shadcn
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

// assets
import {
  Bell,
  CheckCircle2,
  Heart,
  MessageCircle,
  Server,
  Sparkles,
  UserPlus,
  Zap,
  Trash2,
} from "lucide-react"

export interface NotificationItem {
  id: string | number
  icon: React.ReactNode
  title: string
  time: string
  desc?: string
  unread: boolean
  link?: string
}

interface DropdownMenuNotificationsProps {
  onNavigateTab?: (tab: 'store' | 'servers' | 'admin') => void
  className?: string
}

// Initial notifications matching account updates and screenshot style
const defaultNotifications: NotificationItem[] = [
  {
    id: 1,
    icon: <CheckCircle2 className="size-4 text-emerald-400" />,
    title: "Sukses Create VPS: server.nexvps.cloud",
    desc: "Ubuntu 24.04 LTS aktif di SG-SIN1 dengan IP 94.237.70.40.",
    time: "2 minutes ago",
    unread: true,
  },
  {
    id: 2,
    icon: <Zap className="size-4 text-cyan-400" />,
    title: "Pembayaran QRIS Diverifikasi",
    desc: "Transaksi Rp 1.000 sukses otomatis via BuatQRIS gateway.",
    time: "15 minutes ago",
    unread: true,
  },
  {
    id: 3,
    icon: <Server className="size-4 text-blue-500" />,
    title: "MaxIOPS Storage 25 GB Siap",
    desc: "Throughput 100K+ IOPS teralokasi dengan latensi ~14ms.",
    time: "2 hours ago",
    unread: false,
  },
  {
    id: 4,
    icon: <Heart className="size-4 text-rose-500" />,
    title: "Jane liked your post",
    desc: "Aktivitas profil developer di komunitas NexVps.",
    time: "4 hours ago",
    unread: false,
  },
]

//  ------------------------------ | DROPDOWN MENU - NOTIFICATIONS | ------------------------------  //

export function DropdownMenuNotifications({
  onNavigateTab,
  className = "",
}: DropdownMenuNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem("nexvps_notifications")
      if (saved) {
        const parsed = JSON.parse(saved)
        // Re-hydrate icons if loaded from JSON
        return parsed.map((item: any) => ({
          ...item,
          icon: item.type === "server" ? (
            <Server className="size-4 text-blue-500" />
          ) : item.type === "qris" ? (
            <Zap className="size-4 text-cyan-400" />
          ) : item.type === "heart" ? (
            <Heart className="size-4 text-rose-500" />
          ) : (
            <CheckCircle2 className="size-4 text-emerald-400" />
          ),
        }))
      }
    } catch {}
    return defaultNotifications
  })

  // Listen for global notification dispatch events (e.g. from VPS orders, toasts)
  useEffect(() => {
    const handleNewNotification = (e: any) => {
      const detail = e.detail
      if (!detail) return

      const newItem: NotificationItem = {
        id: Date.now(),
        icon: detail.icon || <CheckCircle2 className="size-4 text-emerald-400" />,
        title: detail.title || "Notifikasi Baru Akun",
        desc: detail.desc || detail.description || "",
        time: "Baru saja",
        unread: true,
        link: detail.link,
      }

      setNotifications((prev) => [newItem, ...prev])
    }

    window.addEventListener("nexvps:notification", handleNewNotification)
    return () => window.removeEventListener("nexvps:notification", handleNewNotification)
  }, [])

  // Persist notifications
  useEffect(() => {
    try {
      const serializable = notifications.map((n) => ({
        id: n.id,
        title: n.title,
        desc: n.desc,
        time: n.time,
        unread: n.unread,
        type:
          typeof n.id === "number" && n.id === 4
            ? "heart"
            : n.title.includes("QRIS")
            ? "qris"
            : n.title.includes("Storage")
            ? "server"
            : "check",
      }))
      localStorage.setItem("nexvps_notifications", JSON.stringify(serializable))
    } catch {}
  }, [notifications])

  const unreadCount = notifications.filter((n) => n.unread).length

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const handleItemClick = (notification: NotificationItem) => {
    // Mark this item as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, unread: false } : n))
    )

    // Navigate to server page if relevant
    if (
      notification.title.toLowerCase().includes("vps") ||
      notification.title.toLowerCase().includes("server")
    ) {
      onNavigateTab?.("servers")
    }
  }

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications([])
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className={`relative h-9 w-9 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-sm ${className}`}
            title="Lihat Notifikasi Akun"
            aria-label="Notifications"
          />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[330px] sm:w-[350px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151d2e] p-2 shadow-2xl backdrop-blur-2xl"
      >
        {/* Header matching screenshot */}
        <div className="flex items-center justify-between px-2.5 py-2">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0 text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400 text-[10px] font-bold border border-blue-500/20">
                  {unreadCount} new
                </span>
              )}
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="h-auto px-2 py-0.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Hapus semua"
              >
                <Trash2 className="size-3" />
              </button>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="bg-slate-200/80 dark:bg-slate-800/80 my-1" />

        {/* Notifications list */}
        <DropdownMenuGroup className="max-h-80 overflow-y-auto space-y-1">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
              <Sparkles className="size-6 text-slate-400 mx-auto mb-2 opacity-50" />
              Tidak ada notifikasi baru
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleItemClick(notification)}
                className={`items-start gap-3.5 p-3 rounded-xl transition-all select-none cursor-pointer ${
                  notification.unread
                    ? "bg-slate-50 dark:bg-slate-900/90 text-slate-900 dark:text-white border border-slate-200/50 dark:border-slate-800/60"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 opacity-80"
                }`}
              >
                <div className="mt-0.5 shrink-0 [&_svg]:size-4">
                  {notification.icon}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <h6 className="text-xs sm:text-sm leading-snug font-medium text-slate-900 dark:text-white truncate">
                    {notification.title}
                  </h6>
                  {notification.desc && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {notification.desc}
                    </p>
                  )}
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    {notification.time}
                  </p>
                </div>
                {notification.unread && (
                  <span className="mt-1.5 ml-auto flex h-2 w-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-slate-200/80 dark:bg-slate-800/80 my-1" />

        {/* Footer */}
        <DropdownMenuItem
          onClick={() => onNavigateTab?.("servers")}
          className="justify-center text-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white py-2 cursor-pointer"
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownMenuNotifications
