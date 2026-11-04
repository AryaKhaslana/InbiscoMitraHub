import React, { useState, useEffect } from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { api } from '../../services/api';
import { Badge } from '../ui/badge';
import { 
  Building2, 
  Warehouse, 
  LayoutDashboard, 
  AlertTriangle, 
  Sliders, 
  Sparkles, 
  CheckSquare, 
  Truck, 
  Boxes, 
  FileText, 
  LogOut, 
  ArrowRightLeft,
  Store
} from 'lucide-react';

export default function AdminSidebar({ currentScreen, setCurrentScreen }) {
  const { activeRole, currentUser, switchRole } = useAuthRole();
  const [criticalCount, setCriticalCount] = useState(3);

  const isHq = activeRole === 'hq_admin';

  useEffect(() => {
    let isMounted = true;
    const fetchRisk = async () => {
      try {
        const res = await api.getStockoutRisk();
        if (isMounted && res?.summary?.criticalSkuCount !== undefined) {
          setCriticalCount(res.summary.criticalSkuCount);
        }
      } catch (err) {
        // silent fallback to default
      }
    };
    fetchRisk();

    const handleRefresh = () => fetchRisk();
    window.addEventListener('supplysync:refresh', handleRefresh);
    return () => {
      isMounted = false;
      window.removeEventListener('supplysync:refresh', handleRefresh);
    };
  }, []);

  const macroNav = [
    { id: 'executive-overview', label: 'Executive Overview', icon: LayoutDashboard },
    { 
      id: 'stockout-risk', 
      label: 'Stockout Risk Radar', 
      icon: AlertTriangle, 
      badge: criticalCount > 0 ? `${criticalCount} Kritis` : 'Aman', 
      badgeColor: criticalCount > 0 ? 'destructive' : 'surface' 
    },
    { id: 'smart-recommendations', label: 'Smart Replenishment', icon: Sparkles, badge: 'Auto', badgeColor: 'surface' },
    { id: 'what-if-simulator', label: 'What-if Simulator', icon: Sliders, badge: 'Skenario', badgeColor: 'surface' },
  ];

  const microNav = [
    { id: 'distributor-overview', label: 'Distributor Overview', icon: Store, badge: 'FEFO', badgeColor: 'surface' },
    { id: 'daily-sales-input', label: 'Input Penjualan DSR', icon: CheckSquare },
    { id: 'restock-request', label: 'Pengajuan Restock', icon: Boxes, badge: 'Inbound', badgeColor: 'surface' },
    { id: 'order-tracking', label: 'Tracking & Dispatch', icon: Truck, badge: 'e-POD', badgeColor: 'surface' },
  ];

  const systemNav = [
    { id: 'audit-logs', label: 'Audit Trail & Log', icon: FileText, badge: 'Audit', badgeColor: 'surface' },
  ];

  const handleToggleRole = () => {
    if (isHq) {
      switchRole('distributor_ops');
      setCurrentScreen('distributor-overview');
    } else {
      switchRole('hq_admin');
      setCurrentScreen('executive-overview');
    }
  };

  const renderNavSection = (title, items) => (
    <div className="space-y-1">
      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-outline">
        {title}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentScreen(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-on-surface-variant'}`} />
              <span className="truncate">{item.label}</span>
            </div>
            {item.badge && (
              <Badge
                variant={isActive ? 'surface' : (item.badgeColor || 'surface')}
                className="text-[9px] py-0 px-1.5 shrink-0"
              >
                {item.badge}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest border-r border-outline/10 shadow-sm z-50 flex flex-col justify-between overflow-y-auto">
      {/* TOP BRAND & USER CONTEXT */}
      <div className="flex flex-col">
        <div className="p-4 border-b border-outline/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
                SS
              </div>
              <div>
                <span className="font-bold text-base text-on-surface tracking-tight">SupplySync</span>
                <div className="text-[10px] text-on-surface-variant">Mayora FMCG Enterprise</div>
              </div>
            </div>
          </div>

          {/* ACTIVE NODE CARD */}
          <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary shrink-0" />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-on-surface truncate">
                  Admin Operasional Terpadu
                </div>
                <div className="text-[10px] text-on-surface-variant truncate font-mono">
                  Mayora HQ &amp; Depo Krian Sidoarjo
                </div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Sistem Aktif &amp; Terhubung"></span>
          </div>
        </div>

        {/* NAVIGATION LINKS: Unified Macro & Micro Operational Hierarchy */}
        <nav className="p-3 space-y-3">
          {renderNavSection('Manajemen Strategis (Mayora HQ)', macroNav)}
          {renderNavSection('Operasional Lapangan & Depo Krian', microNav)}
          {renderNavSection('Tata Kelola & Kepatuhan', systemNav)}
        </nav>
      </div>

      {/* BOTTOM USER & NETWORK FOOTER */}
      <div className="p-3 border-t border-outline/10 bg-surface-container-low/40 space-y-2">
        <div className="flex items-center justify-between px-1 text-[11px] text-on-surface-variant font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Jaringan Terhubung</span>
          </span>
          <span className="font-mono text-[10px] text-outline">Jatim Hub 1</span>
        </div>

        {/* User Card & Sign Out */}
        <div className="p-2 bg-surface-container-lowest rounded-xl border border-outline/10 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              A
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-on-surface truncate">Admin SCM &amp; Logistik</div>
              <div className="text-[10px] text-on-surface-variant truncate font-mono">admin@inbisco.co.id</div>
            </div>
          </div>
          <button
            onClick={() => switchRole('storefront', 'home')}
            title="Keluar ke Portal Publik Mitra"
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

