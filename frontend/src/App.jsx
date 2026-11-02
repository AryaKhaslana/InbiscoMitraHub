import React, { useState } from 'react';
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

function AppContent() {
  const { activeRole, switchRole } = useAuthRole();

  // Public navigation state: 'home' | 'products' | 'partnership' | 'moments' | 'about' | 'contact' | 'login'
  const [publicNav, setPublicNav] = useState('home');

  // Admin navigation state across 8 SupplySync screens
  const [adminScreen, setAdminScreen] = useState(() => {
    return activeRole === 'hq_admin' ? 'executive-overview' : 'distributor-overview';
  });

  // If in Storefront mode
  if (activeRole === 'storefront') {
    return (
      <div className="min-h-screen flex flex-col bg-surface text-on-surface antialiased">
        <PublicHeader activeNav={publicNav} setActiveNav={setPublicNav} />
        <main className="flex-1">
          {publicNav === 'home' && <Home setActiveNav={setPublicNav} />}
          {publicNav === 'products' && <Products setActiveNav={setPublicNav} />}
          {publicNav === 'partnership' && <Partnership setActiveNav={setPublicNav} />}
          {publicNav === 'moments' && <Moments />}
          {publicNav === 'about' && <About />}
          {publicNav === 'contact' && <Contact />}
          {publicNav === 'login' && <Login setActiveNav={setPublicNav} />}
        </main>
        <PublicFooter />
      </div>
    );
  }

  // If in Internal Operations / SupplySync HQ / Depo Krian mode
  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex">
      <AdminSidebar currentScreen={adminScreen} setCurrentScreen={setAdminScreen} />
      <div className="pl-72 w-full flex flex-col min-h-screen">
        <AdminHeader currentScreen={adminScreen} />
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
