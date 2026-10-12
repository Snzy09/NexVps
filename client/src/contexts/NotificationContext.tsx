import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { api } from '../services/api';
import type { Order } from '../types';

export interface UserNotificationItem {
  id: string;
  userEmail: string;
  title: string;
  desc?: string;
  time: string;
  timestamp: number;
  unread: boolean;
  category: 'server' | 'order' | 'payment' | 'security' | 'system';
  status: 'success' | 'warning' | 'error' | 'info';
  metadata?: {
    hostname?: string;
    serverIp?: string;
    serverUuid?: string;
    orderNumber?: string;
    orderId?: string;
    zoneCode?: string;
    action?: string;
  };
}

export interface NotifyOptions {
  title: string;
  desc?: string;
  category?: 'server' | 'order' | 'payment' | 'security' | 'system';
  status?: 'success' | 'warning' | 'error' | 'info';
  metadata?: UserNotificationItem['metadata'];
  showToast?: boolean;
  playSound?: boolean;
  duration?: number;
}

interface NotificationContextType {
  notifications: UserNotificationItem[];
  unreadCount: number;
  notify: (options: NotifyOptions) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Web Audio API high-tech sound synthesizer (zero external dependencies)
const playChimeSound = (status: 'success' | 'warning' | 'error' | 'info' = 'info') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (status === 'error') {
      // Alert low tone
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(240, now + 0.1);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    } else if (status === 'success') {
      // Pleasant double bell (D5 -> A5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880.00, now + 0.08);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    } else {
      // Subtle sleek ping (E5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.06);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  } catch {
    // Graceful fallback if browser audio policy blocks autoplay
  }
};

const getRelativeTimeString = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'Baru saja';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hr lalu`;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const toast = useToast();

  const currentEmail = user?.email?.toLowerCase() || 'guest';
  const storageKey = `nexvps_notifications_${currentEmail}`;

  const [notifications, setNotifications] = useState<UserNotificationItem[]>([]);
  const prevServersRef = useRef<Map<string, Order>>(new Map());
  const initialSyncDoneRef = useRef<string | null>(null);

  // Load notifications for the current user session
  const loadUserNotifications = useCallback((): UserNotificationItem[] => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: UserNotificationItem[] = JSON.parse(raw);
        return parsed.map(n => ({
          ...n,
          time: getRelativeTimeString(n.timestamp || Date.now())
        }));
      }
    } catch {}
    return [];
  }, [storageKey]);

  // Sync state on user change
  useEffect(() => {
    const list = loadUserNotifications();
    setNotifications(list);
    prevServersRef.current.clear();
  }, [storageKey, loadUserNotifications]);

  // Persist notifications to user-scoped storage
  const saveNotifications = useCallback((items: UserNotificationItem[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items.slice(0, 50)));
    } catch {}
  }, [storageKey]);

  // Central Notify method: pops up real-time toast + stores in user's notification center
  const notify = useCallback(({
    title,
    desc = '',
    category = 'system',
    status = 'info',
    metadata,
    showToast = true,
    playSound = true,
    duration = 4500
  }: NotifyOptions) => {
    const now = Date.now();
    const newItem: UserNotificationItem = {
      id: `notif-${now}-${Math.random().toString(36).substring(2, 7)}`,
      userEmail: currentEmail,
      title,
      desc,
      time: 'Baru saja',
      timestamp: now,
      unread: true,
      category,
      status,
      metadata
    };

    setNotifications(prev => {
      const updated = [newItem, ...prev.filter(n => n.id !== newItem.id)];
      saveNotifications(updated);
      return updated;
    });

    // 1. Trigger real popup toast on screen
    if (showToast) {
      if (status === 'success') {
        toast.success(title, desc);
      } else if (status === 'error') {
        toast.error(title, desc);
      } else if (status === 'warning') {
        toast.warning(title, desc);
      } else {
        toast.info(title, desc);
      }
    }

    // 2. Play subtle modern sound chime
    if (playSound) {
      playChimeSound(status);
    }

    // 3. Dispatch global event for backward compatibility
    try {
      window.dispatchEvent(new CustomEvent('nexvps:notification', { detail: newItem }));
    } catch {}
  }, [currentEmail, saveNotifications, toast]);

  // Mark single notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => (n.id === id ? { ...n, unread: false } : n));
      saveNotifications(next);
      return next;
    });
  }, [saveNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, unread: false }));
      saveNotifications(next);
      return next;
    });
  }, [saveNotifications]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  // Remove single notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      saveNotifications(next);
      return next;
    });
  }, [saveNotifications]);

  // REALTIME BACKGROUND WATCHER:
  // Detects real-time changes to the user's servers and orders
  useEffect(() => {
    if (!user) {
      initialSyncDoneRef.current = null;
      return;
    }

    let isMounted = true;

    const checkRealtimeUserData = async () => {
      try {
        const userServers = await api.getServers(user.email, user.uid);
        if (!isMounted) return;

        // Initial connection sync for this user
        if (initialSyncDoneRef.current !== user.email) {
          initialSyncDoneRef.current = user.email;

          // If user has zero notifications in their personal box, generate real initial summary
          const existing = loadUserNotifications();
          if (existing.length === 0) {
            const initialItems: UserNotificationItem[] = [];

            // Add real server notifications
            userServers.forEach(srv => {
              initialItems.push({
                id: `server-${srv.id || srv.serverUuid}`,
                userEmail: user.email.toLowerCase(),
                title: `Server Aktif: ${srv.hostname}`,
                desc: `${srv.templateName || 'Linux'} di ${srv.zoneName || 'Singapore'} dengan IP ${srv.serverIp || 'dalam alokasi'}.`,
                time: getRelativeTimeString(new Date(srv.createdAt || Date.now()).getTime()),
                timestamp: new Date(srv.createdAt || Date.now()).getTime(),
                unread: false,
                category: 'server',
                status: 'success',
                metadata: {
                  hostname: srv.hostname,
                  serverIp: srv.serverIp,
                  serverUuid: srv.serverUuid,
                  zoneCode: srv.zoneCode
                }
              });
            });

            // Add welcome notification
            initialItems.push({
              id: `welcome-${user.uid}`,
              userEmail: user.email.toLowerCase(),
              title: `Selamat Datang, ${user.displayName || user.email.split('@')[0]}! 🎉`,
              desc: `Akun cloud terhubung. Pemantauan realtime untuk ${userServers.length} server aktif.`,
              time: 'Baru saja',
              timestamp: Date.now(),
              unread: true,
              category: 'system',
              status: 'info'
            });

            setNotifications(initialItems);
            saveNotifications(initialItems);

            // Pop up welcoming toast
            toast.success(
              `Selamat Datang, ${user.displayName || user.email.split('@')[0]}! 👋`,
              `Data ${userServers.length} server Anda tersinkronisasi realtime.`
            );
            playChimeSound('success');
          }

          // Populate cache
          userServers.forEach(s => {
            const key = s.id || s.serverUuid || s.hostname;
            prevServersRef.current.set(key, s);
          });
          return;
        }

        // Compare server state changes in real-time
        userServers.forEach(srv => {
          const key = srv.id || srv.serverUuid || srv.hostname;
          const prev = prevServersRef.current.get(key);

          if (prev) {
            // Server just became active
            if (prev.vpsStatus === 'PROVISIONING' && srv.vpsStatus === 'ACTIVE') {
              notify({
                title: `🚀 VPS Siap Digunakan: ${srv.hostname}`,
                desc: `Server aktif di ${srv.zoneName || srv.zoneCode} dengan IP Publik: ${srv.serverIp}. Password root siap digunakan.`,
                category: 'server',
                status: 'success',
                metadata: { hostname: srv.hostname, serverIp: srv.serverIp, serverUuid: srv.serverUuid }
              });
            }
            // Server state changed (e.g. started / stopped)
            else if (prev.serverState && srv.serverState && prev.serverState !== srv.serverState) {
              const stateIndo = srv.serverState === 'started' ? 'Dinyalakan (Running)' : srv.serverState === 'stopped' ? 'Dimatikan (Stopped)' : srv.serverState;
              notify({
                title: `⚡ Status Server: ${srv.hostname}`,
                desc: `Server kini berstatus: ${stateIndo}.`,
                category: 'server',
                status: srv.serverState === 'started' ? 'success' : 'info',
                metadata: { hostname: srv.hostname, serverIp: srv.serverIp, serverUuid: srv.serverUuid }
              });
            }
            // Newly assigned IP address
            else if (!prev.serverIp && srv.serverIp) {
              notify({
                title: `🌐 IP Publik Ditetapkan: ${srv.serverIp}`,
                desc: `Alamat IP publik untuk ${srv.hostname} telah aktif. Port SSH siap dihubungkan.`,
                category: 'server',
                status: 'info',
                metadata: { hostname: srv.hostname, serverIp: srv.serverIp }
              });
            }
          }

          prevServersRef.current.set(key, srv);
        });
      } catch {
        // Quiet on network glitch
      }
    };

    // Initial check
    checkRealtimeUserData();

    // Poll every 6 seconds for live state changes
    const interval = setInterval(checkRealtimeUserData, 6000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, loadUserNotifications, notify, saveNotifications, toast]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        notify,
        markAsRead,
        markAllAsRead,
        clearAll,
        removeNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
