import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthRoleContext = createContext(null);

export function AuthRoleProvider({ children }) {
  // Determine initial route and role from browser URL or localStorage
  const getInitialState = () => {
    if (typeof window === 'undefined') {
      return { role: 'storefront', nav: 'home' };
    }
    const path = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
    if (path === 'admin/hq' || path === 'admin/executive') {
      return { role: 'hq_admin', nav: 'home' };
    }
    if (path === 'admin/depo' || path === 'admin/krian') {
      return { role: 'distributor_ops', nav: 'home' };
    }
    const validNavs = ['home', 'products', 'partnership', 'moments', 'about', 'contact', 'login'];
    if (validNavs.includes(path)) {
      return { role: 'storefront', nav: path };
    }
    const savedRole = localStorage.getItem('inbisco_active_role');
    if (savedRole && savedRole !== 'storefront') {
      return { role: savedRole, nav: 'home' };
    }
    return { role: 'storefront', nav: 'home' };
  };

  const initialState = getInitialState();
  const [activeRole, setActiveRole] = useState(initialState.role);
  const [publicNav, setPublicNavState] = useState(initialState.nav);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('inbisco_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      username: 'bambang.sudiro',
      name: 'Bambang Sudiro',
      depot: 'CV Surya Krian Logistik (Hub Jawa Timur 1)',
      role: 'DISTRIBUTOR_DEPO',
    };
  });

  const [activeTab, setActiveTab] = useState('overview');

  // Synchronize browser back/forward history navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
      if (path === 'admin/hq' || path === 'admin/executive') {
        setActiveRole('hq_admin');
        return;
      }
      if (path === 'admin/depo' || path === 'admin/krian') {
        setActiveRole('distributor_ops');
        return;
      }
      const validNavs = ['home', 'products', 'partnership', 'moments', 'about', 'contact', 'login'];
      setActiveRole('storefront');
      if (validNavs.includes(path)) {
        setPublicNavState(path);
      } else {
        setPublicNavState('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setPublicNav = (nav, shouldPushHistory = true) => {
    setPublicNavState(nav);
    if (shouldPushHistory && typeof window !== 'undefined') {
      const targetPath = nav === 'home' ? '/' : `/${nav}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ nav }, '', targetPath);
      }
    }
  };

  const switchRole = (newRole, targetPublicNav = 'home') => {
    setActiveRole(newRole);
    localStorage.setItem('inbisco_active_role', newRole);
    if (newRole === 'hq_admin') {
      setCurrentUser({
        username: 'ops.hq',
        name: 'SC Ops Admin Mayora',
        depot: 'Mayora Distribution HQ (Jawa Timur & Madura)',
        role: 'HQ_ADMIN',
      });
      setActiveTab('executive-overview');
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin/hq') {
        window.history.pushState({ role: 'hq_admin' }, '', '/admin/hq');
      }
    } else if (newRole === 'distributor_ops') {
      setCurrentUser({
        username: 'bambang.sudiro',
        name: 'Bambang Sudiro',
        depot: 'CV Surya Krian Logistik (Hub Krian)',
        role: 'DISTRIBUTOR_DEPO',
      });
      setActiveTab('krian-dashboard');
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin/depo') {
        window.history.pushState({ role: 'distributor_ops' }, '', '/admin/depo');
      }
    } else {
      setPublicNav(targetPublicNav);
      setActiveTab('home');
      if (typeof window !== 'undefined') {
        const targetPath = targetPublicNav === 'home' ? '/' : `/${targetPublicNav}`;
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ nav: targetPublicNav }, '', targetPath);
        }
      }
    }
  };

  return (
    <AuthRoleContext.Provider
      value={{
        activeRole,
        setActiveRole,
        currentUser,
        setCurrentUser,
        activeTab,
        setActiveTab,
        publicNav,
        setPublicNav,
        switchRole,
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
}

export function useAuthRole() {
  const context = useContext(AuthRoleContext);
  if (!context) {
    throw new Error('useAuthRole must be used within an AuthRoleProvider');
  }
  return context;
}

