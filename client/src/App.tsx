import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { SidebarProvider, SidebarInset } from './components/ui/sidebar';
import AppSidebar from './components/AppSidebar';
import AppSidebarNav from './components/AppSidebarNav';
import { VpsConfigurator } from './components/VpsConfigurator';
import { QrisCheckoutModal } from './components/QrisCheckoutModal';
import { ServersDashboard } from './components/ServersDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import GridChangelog from './components/GridChangelog';
import UserProfileWithStats from './components/UserProfileWithStats';
import SupportPage from './components/SupportPage';
import { AuthModal } from './components/AuthModal';
import Footer from './components/Footer';
import { api, getStoredPlans } from './services/api';
import type { CatalogData, Order, VpsPlan } from './types';
import { PageSkeletonLoader } from './components/PageSkeletonLoader';
import { RefreshCw, Server, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { notify } = useNotification();
  const [currentTab, setCurrentTab] = useState<'store' | 'servers' | 'admin' | 'changelog' | 'profile' | 'support'>('store');
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [activeServersCount, setActiveServersCount] = useState<number>(0);
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [adminOnlyPrompt, setAdminOnlyPrompt] = useState<boolean>(false);

  const fetchCatalogAndServers = async () => {
    try {
      const startTime = Date.now();
      const [catData, servers] = await Promise.all([
        api.getCatalog(),
        api.getServers(user?.email || undefined, user?.uid || undefined)
      ]);
      setCatalog(catData);
      setActiveServersCount(servers.filter(s => s.vpsStatus === 'ACTIVE').length);

      // Smooth skeleton buffer for perceived performance
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
      }
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogAndServers();
  }, [user]);

  // Real-time synchronization for VPS plans catalog across store and admin settings
  useEffect(() => {
    const handlePlansUpdated = (e: CustomEvent<VpsPlan[]>) => {
      const updatedPlans = e.detail;
      if (Array.isArray(updatedPlans) && updatedPlans.length > 0) {
        setCatalog(prev => (prev ? { ...prev, plans: updatedPlans } : prev));
      }
    };

    window.addEventListener('nexvps_plans_updated', handlePlansUpdated as EventListener);
    return () => {
      window.removeEventListener('nexvps_plans_updated', handlePlansUpdated as EventListener);
    };
  }, []);

  // Re-sync plans whenever user switches back to the store tab
  useEffect(() => {
    if (currentTab === 'store') {
      const stored = getStoredPlans();
      if (stored && stored.length > 0) {
        setCatalog(prev => {
          if (!prev) return prev;
          if (JSON.stringify(prev.plans) !== JSON.stringify(stored)) {
            return { ...prev, plans: stored };
          }
          return prev;
        });
      }
    }
  }, [currentTab]);

  const handleOpenAuth = (tab: 'login' | 'register' = 'login', adminOnly = false) => {
    setAuthModalTab(tab);
    setAdminOnlyPrompt(adminOnly);
    setAuthModalOpen(true);
  };

  const handleProceedToCheckout = async (formData: any) => {
    if (!user) {
      toast.warning(
        'Login Diperlukan',
        'Silakan masuk ke akun Anda terlebih dahulu untuk melanjutkan pemesanan Cloud VPS.'
      );
      handleOpenAuth('login');
      return;
    }

    setIsCreatingOrder(true);
    try {
      const newOrder = await api.createOrder({
        userId: user?.uid,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        planId: formData.planId,
        zoneCode: formData.zoneCode,
        templateUuid: formData.templateUuid,
        hostname: formData.hostname,
        rootPassword: formData.rootPassword,
        sshKey: formData.sshKey,
        billingCycle: formData.billingCycle,
        isAdminTest: formData.isAdminTest
      });

      setActiveOrder(newOrder);
      if (newOrder.isAdminTest) {
        notify({
          title: `⚡ Admin Test: #${newOrder.orderNumber}`,
          desc: `Mode testing admin aktif! Pembayaran di-bypass & VPS ${newOrder.hostname} langsung di-deploy gratis ke UpCloud.`,
          category: 'order',
          status: 'success',
          metadata: {
            orderNumber: newOrder.orderNumber,
            orderId: newOrder.id,
            hostname: newOrder.hostname
          }
        });
      } else {
        notify({
          title: `Pesanan Dibuat: #${newOrder.orderNumber}`,
          desc: `Pesanan untuk ${newOrder.hostname} (${formData.billingCycle === 'annually' ? '1 Tahun' : '1 Bulan'}) siap dibayar via QRIS Dinamis.`,
          category: 'order',
          status: 'info',
          metadata: {
            orderNumber: newOrder.orderNumber,
            orderId: newOrder.id,
            hostname: newOrder.hostname
          }
        });
      }
    } catch (err: any) {
      toast.error('Gagal Membuat Pesanan', err.message);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleVpsReady = (_order: Order) => {
    notify({
      title: '🚀 VPS Siap Digunakan!',
      desc: `Server ${_order.hostname}${_order.serverIp ? ` (${_order.serverIp})` : ''} telah selesai di-deploy dan aktif.`,
      category: 'server',
      status: 'success',
      metadata: {
        hostname: _order.hostname,
        serverIp: _order.serverIp,
        zoneCode: _order.zoneCode
      }
    });
    // refresh active servers count
    api.getServers(user?.email || undefined, user?.uid || undefined).then(servers => {
      setActiveServersCount(servers.filter(s => s.vpsStatus === 'ACTIVE').length);
    });
  };

  const showSkeletonPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('skeleton');

  if (loading || showSkeletonPreview) {
    return <PageSkeletonLoader />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-300 selection:bg-cyan-500 selection:text-black">
        {/* Collapsible Intent UI AppSidebar */}
        <AppSidebar
          collapsible="dock"
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          activeServersCount={activeServersCount}
          onOpenAuth={handleOpenAuth}
        />

        {/* Main Content Area (SidebarInset) */}
        <SidebarInset className="relative z-10 flex-1 flex flex-col min-w-0">
          {/* Top Navbar with Breadcrumbs, Search, Notifications & User */}
          <AppSidebarNav
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            activeServersCount={activeServersCount}
            onOpenAuth={handleOpenAuth}
          />

          {/* Main Content View */}
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {currentTab === 'store' && catalog && (
              <VpsConfigurator
                plans={catalog.plans}
                zones={catalog.zones}
                templates={catalog.templates}
                onProceedToCheckout={handleProceedToCheckout}
              />
            )}

            {currentTab === 'servers' && (
              <ServersDashboard
                onOrderNew={() => setCurrentTab('store')}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            )}

            {currentTab === 'admin' && (
              <AdminDashboard 
                onBackToStore={() => setCurrentTab('store')}
                onOpenAuth={handleOpenAuth}
                onPlansUpdated={(newPlans) => {
                  setCatalog(prev => (prev ? { ...prev, plans: newPlans } : prev));
                }}
              />
            )}

            {currentTab === 'changelog' && (
              <GridChangelog />
            )}

            {currentTab === 'profile' && (
              <UserProfileWithStats
                onOpenAuth={handleOpenAuth}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'support' && (
              <SupportPage
                onNavigateTab={setCurrentTab}
              />
            )}
          </main>

          {/* Modern Cyber Footer */}
          <Footer 
            onNavigateTab={(tab) => setCurrentTab(tab)} 
            onOpenAuth={(tab) => {
              setAuthModalTab(tab || 'login');
              setAuthModalOpen(true);
            }}
          />
        </SidebarInset>

        {/* QRIS Checkout Modal */}
        {activeOrder && (
          <QrisCheckoutModal
            order={activeOrder}
            onClose={() => {
              setActiveOrder(null);
              fetchCatalogAndServers();
            }}
            onVpsReady={handleVpsReady}
          />
        )}

        {/* Creating Order Loading Overlay */}
        {isCreatingOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center text-center p-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-sm font-bold text-white">Membuat Transaksi QRIS Dinamis...</p>
              <p className="text-xs text-slate-400">Menghubungi BuatQRIS Open API</p>
            </div>
          </div>
        )}

        {/* Auth Modal (Login / Register / Demo) */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultTab={authModalTab}
          adminOnlyPrompt={adminOnlyPrompt}
        />
      </div>
    </SidebarProvider>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
