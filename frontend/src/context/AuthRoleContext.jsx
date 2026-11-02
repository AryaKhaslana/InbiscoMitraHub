import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthRoleContext = createContext(null);

export function AuthRoleProvider({ children }) {
  // Current active role: 'storefront' | 'hq_admin' | 'distributor_ops'
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('inbisco_active_role') || 'storefront';
  });

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
  const [publicNav, setPublicNav] = useState('home');

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
    } else if (newRole === 'distributor_ops') {
      setCurrentUser({
        username: 'bambang.sudiro',
        name: 'Bambang Sudiro',
        depot: 'CV Surya Krian Logistik (Hub Krian)',
        role: 'DISTRIBUTOR_DEPO',
      });
      setActiveTab('krian-dashboard');
    } else {
      setPublicNav(targetPublicNav);
      setActiveTab('home');
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

