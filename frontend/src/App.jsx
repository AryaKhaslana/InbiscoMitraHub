import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthRoleProvider, useAuthRole } from './context/AuthRoleContext';
import PublicHeader from './components/public/PublicHeader';
import PublicFooter from './components/public/PublicFooter';
import FloatingB2BHelpdesk from './components/public/FloatingB2BHelpdesk';
import Home from './pages/Home';

// Lazy-load secondary public pages for optimal initial payload
const Products = lazy(() => import('./pages/Products'));
const Partnership = lazy(() => import('./pages/Partnership'));
const About = lazy(() => import('./pages/About'));
const Moments = lazy(() => import('./pages/Moments'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));

import AdminSidebar from './components/admin/AdminSidebar';
import AdminHeader from './components/admin/AdminHeader';

// Code-split 9 SupplySync Admin Screens (preloaded on admin entry for 0ms tab switches)
const loadOrderDeliveryTracking = () => import('./pages/admin/OrderDeliveryTracking');
const loadRestockRequest = () => import('./pages/admin/RestockRequest');
const loadDistributorOverview = () => import('./pages/admin/DistributorOverview');
const loadDailySalesInput = () => import('./pages/admin/DailySalesInput');
const loadStockoutRiskAnalysis = () => import('./pages/admin/StockoutRiskAnalysis');
const loadSmartRecommendations = () => import('./pages/admin/SmartRecommendations');
const loadWhatIfSimulator = () => import('./pages/admin/WhatIfSimulator');
const loadExecutiveOverview = () => import('./pages/admin/ExecutiveOverview');
const loadAuditLogs = () => import('./pages/admin/AuditLogs');

const OrderDeliveryTracking = lazy(loadOrderDeliveryTracking);
const RestockRequest = lazy(loadRestockRequest);
const DistributorOverview = lazy(loadDistributorOverview);
const DailySalesInput = lazy(loadDailySalesInput);
const StockoutRiskAnalysis = lazy(loadStockoutRiskAnalysis);
const SmartRecommendations = lazy(loadSmartRecommendations);
const WhatIfSimulator = lazy(loadWhatIfSimulator);
const ExecutiveOverview = lazy(loadExecutiveOverview);
const AuditLogs = lazy(loadAuditLogs);

function AppContent() {
  const { activeRole, switchRole, publicNav, setPublicNav } = useAuthRole();
  const [productCategoryFilter, setProductCategoryFilter] = useState('Semua Kategori');

  // Admin navigation state across 9 SupplySync screens
  const [adminScreen, setAdminScreen] = useState(() => {
    return activeRole === 'hq_admin' ? 'executive-overview' : 'distributor-overview';
  });

  // Sync default landing screen & preload admin chunks when switching into an internal role
  useEffect(() => {
    if (activeRole === 'hq_admin') {
      setAdminScreen('executive-overview');
    } else if (activeRole === 'distributor_ops') {
      setAdminScreen('distributor-overview');
    }
    if (activeRole !== 'storefront') {
      // Preload all admin screen chunks in background so tab switching is 0ms instant
      Promise.allSettled([
        loadExecutiveOverview(),
        loadStockoutRiskAnalysis(),
        loadSmartRecommendations(),
        loadWhatIfSimulator(),
        loadDistributorOverview(),
        loadDailySalesInput(),
        loadRestockRequest(),
        loadOrderDeliveryTracking(),
        loadAuditLogs(),
      ]);
    }
  }, [activeRole]);

  // Dynamic Browser Title & scroll-to-top per page/screen
  useEffect(() => {
    if (activeRole === 'storefront') {
      const titles = {
        home: 'Inbisco MitraHub — Solusi Pasokan FMCG Resmi Mayora Sidoarjo',
        products: 'Katalog Produk FMCG Mayora — Inbisco MitraHub',
        partnership: 'Pendaftaran Kemitraan Toko & Warung — Inbisco MitraHub',
        moments: 'Aktivitas & Jaringan Distribusi Cabang Krian — Inbisco MitraHub',
        about: 'Tentang Kami & Depot Logistik — Inbisco MitraHub',
        contact: 'Kontak Cabang Krian & FAQ — Inbisco MitraHub',
        login: 'Portal Masuk Operasional B2B — Inbisco MitraHub',
      };
      document.title = titles[publicNav] || 'Inbisco MitraHub — B2B FMCG Supply Chain';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const adminTitles = {
        'executive-overview': 'Executive Overview — SupplySync Mayora HQ',
        'stockout-risk': 'Stockout Risk Radar — SupplySync Mayora HQ',
        'smart-recommendations': 'Smart Replenishment Engine — SupplySync Mayora HQ',
        'what-if-simulator': 'What-if Restock Simulator — SupplySync Mayora HQ',
        'distributor-overview': 'Depo Krian Overview & FEFO — SupplySync',
        'daily-sales-input': 'Input Penjualan Harian (DSR) — SupplySync Depo Krian',
        'restock-request': 'Pengajuan Restock Mandiri — SupplySync Depo Krian',
        'order-tracking': 'Tracking Armada & Dispatch — SupplySync Depo Krian',
        'audit-logs': 'Audit Trail & Log Aktivitas — SupplySync',
      };
      document.title = adminTitles[adminScreen] || 'SupplySync — Mayora FMCG Enterprise';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeRole, publicNav, adminScreen]);

  const handlePublicNav = (nav, param) => {
    if (nav === 'products') {
      setProductCategoryFilter(param || 'Semua Kategori');
    }
    setPublicNav(nav);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Storefront mode
  if (activeRole === 'storefront') {
    return (
      <div className="min-h-screen flex flex-col bg-surface text-on-surface antialiased">
        <PublicHeader activeNav={publicNav} setActiveNav={handlePublicNav} />
        <main key={publicNav} className="flex-1 anim-fade-in">
          {publicNav === 'home' && <Home setActiveNav={handlePublicNav} />}
          <Suspense fallback={
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-on-surface-variant font-medium">Memuat halaman...</span>
            </div>
          }>
            {publicNav === 'products' && (
              <Products
                setActiveNav={handlePublicNav}
                initialCategory={productCategoryFilter}
                onCategoryChange={setProductCategoryFilter}
              />
            )}
            {publicNav === 'partnership' && <Partnership setActiveNav={handlePublicNav} />}
            {publicNav === 'moments' && <Moments setActiveNav={handlePublicNav} />}
            {publicNav === 'about' && <About setActiveNav={handlePublicNav} />}
            {publicNav === 'contact' && <Contact setActiveNav={handlePublicNav} />}
            {publicNav === 'login' && <Login setActiveNav={handlePublicNav} />}
          </Suspense>
        </main>
        <FloatingB2BHelpdesk setActiveNav={handlePublicNav} />
        <PublicFooter setActiveNav={handlePublicNav} />
      </div>
    );
  }

  // If in Internal Operations / SupplySync HQ / Depo Krian mode
  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex">
      <AdminSidebar currentScreen={adminScreen} setCurrentScreen={setAdminScreen} />
      <div className="pl-72 w-full flex flex-col min-h-screen">
        <AdminHeader currentScreen={adminScreen} setCurrentScreen={setAdminScreen} />
        <main className="pt-20 px-6 sm:px-8 max-w-[1600px] w-full mx-auto flex-1">
          <Suspense
            fallback={
              <div className="py-24 text-center">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-container-high border border-outline-variant/30 text-xs text-on-surface-variant font-mono animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  Memuat modul operasional SupplySync...
                </div>
              </div>
            }
          >
            {adminScreen === 'executive-overview' && (
              <ExecutiveOverview setCurrentScreen={setAdminScreen} />
            )}
            {adminScreen === 'stockout-risk' && (
              <StockoutRiskAnalysis setCurrentScreen={setAdminScreen} />
            )}
            {adminScreen === 'smart-recommendations' && (
              <SmartRecommendations setCurrentScreen={setAdminScreen} />
            )}
            {adminScreen === 'what-if-simulator' && (
              <WhatIfSimulator setCurrentScreen={setAdminScreen} />
            )}
            {(adminScreen === 'distributor-overview' || adminScreen === 'krian-dashboard') && (
              <DistributorOverview setCurrentScreen={setAdminScreen} />
            )}
            {adminScreen === 'daily-sales-input' && (
              <DailySalesInput setCurrentScreen={setAdminScreen} />
            )}
            {adminScreen === 'restock-request' && (
              <RestockRequest setCurrentScreen={setAdminScreen} />
            )}
            {adminScreen === 'order-tracking' && (
              <OrderDeliveryTracking setCurrentScreen={setAdminScreen} />
            )}
            {adminScreen === 'audit-logs' && (
              <AuditLogs setCurrentScreen={setAdminScreen} />
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthRoleProvider>
      <AppContent />
    </AuthRoleProvider>
  );
}
