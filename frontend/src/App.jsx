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
import DashboardKrian from './pages/admin/DashboardKrian';
import SupplySyncHQ from './pages/admin/SupplySyncHQ';

function AppContent() {
  const { activeRole, switchRole } = useAuthRole();

  // Public navigation state: 'home' | 'products' | 'partnership' | 'moments' | 'about' | 'contact' | 'login'
  const [publicNav, setPublicNav] = useState('home');

  // Admin navigation state: 'executive-overview' | 'krian-dashboard' | 'stockout-risk' | 'what-if-simulator' | etc.
  const [adminScreen, setAdminScreen] = useState(() => {
    return activeRole === 'hq_admin' ? 'executive-overview' : 'krian-dashboard';
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

  // If in Internal Operations / SupplySync HQ mode
  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex">
      <AdminSidebar currentScreen={adminScreen} setCurrentScreen={setAdminScreen} />
      <div className="pl-72 w-full flex flex-col min-h-screen">
        <AdminHeader currentScreen={adminScreen} />
        <main className="pt-20 px-6 sm:px-8 max-w-[1600px] w-full mx-auto flex-1">
          {activeRole === 'hq_admin' ? (
            <SupplySyncHQ />
          ) : (
            <DashboardKrian />
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
