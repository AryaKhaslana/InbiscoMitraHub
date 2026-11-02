import React, { useState, useEffect } from 'react';
import { AuthRoleProvider, useAuthRole } from './context/AuthRoleContext';
import PublicHeader from './components/public/PublicHeader';
import PublicFooter from './components/public/PublicFooter';
import Home from './pages/Home';
import Products from './pages/Products';
import Partnership from './pages/Partnership';
import About from './pages/About';
import Moments from './pages/Moments';
import Contact from './pages/Contact';
import Login from './pages/Login';

import AdminSidebar from './components/admin/AdminSidebar';
import AdminHeader from './components/admin/AdminHeader';

// 8 Dedicated SupplySync Screens (matching Google Stitch Prototypes)
import OrderDeliveryTracking from './pages/admin/OrderDeliveryTracking'; // Screen 1
import RestockRequest from './pages/admin/RestockRequest';             // Screen 2
import DistributorOverview from './pages/admin/DistributorOverview';     // Screen 3
import DailySalesInput from './pages/admin/DailySalesInput';             // Screen 4
import StockoutRiskAnalysis from './pages/admin/StockoutRiskAnalysis';   // Screen 5
import SmartRecommendations from './pages/admin/SmartRecommendations';   // Screen 6
import WhatIfSimulator from './pages/admin/WhatIfSimulator';             // Screen 7
import ExecutiveOverview from './pages/admin/ExecutiveOverview';         // Screen 8
import AuditLogs from './pages/admin/AuditLogs';                         // System Audit & Activity Logs

function AppContent() {
  const { activeRole, switchRole, publicNav, setPublicNav } = useAuthRole();
  const [productCategoryFilter, setProductCategoryFilter] = useState('Semua Kategori');

  // Dynamic Browser Title per page
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
    }
  }, [activeRole, publicNav]);

  const handlePublicNav = (nav, param) => {
    if (nav === 'products') {
      setProductCategoryFilter(param || 'Semua Kategori');
    }
    setPublicNav(nav);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin navigation state across 8 SupplySync screens
  const [adminScreen, setAdminScreen] = useState(() => {
    return activeRole === 'hq_admin' ? 'executive-overview' : 'distributor-overview';
  });

  // If in Storefront mode
  if (activeRole === 'storefront') {
    return (
      <div className="min-h-screen flex flex-col bg-surface text-on-surface antialiased">
        <PublicHeader activeNav={publicNav} setActiveNav={handlePublicNav} />
        <main key={publicNav} className="flex-1 anim-fade-in">
          {publicNav === 'home' && <Home setActiveNav={handlePublicNav} />}
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
        </main>
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
