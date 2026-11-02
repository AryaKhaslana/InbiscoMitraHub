import React from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
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
  RefreshCw,
  Users,
  Store,
  ArrowRightLeft
} from 'lucide-react';

export default function AdminSidebar({ currentScreen, setCurrentScreen }) {
  const { activeRole, currentUser, switchRole } = useAuthRole();

  const isHq = activeRole === 'hq_admin';

  const hqNav = [
    { id: 'executive-overview', label: 'Executive Overview', icon: LayoutDashboard, badge: 'Macro' },
    { id: 'stockout-risk', label: 'Stockout Risk Radar', icon: AlertTriangle, badge: '3 Kritis', badgeColor: 'destructive' },
    { id: 'smart-recommendations', label: 'Smart Replenishment', icon: Sparkles },
    { id: 'what-if-simulator', label: 'What-if Simulator', icon: Sliders, badge: 'AI Inovasi', badgeColor: 'tertiary' },
    { id: 'distributor-overview', label: 'Distributor Overview', icon: Store },
  ];

  const depoNav = [
    { id: 'distributor-overview', label: 'Depo Krian Overview', icon: LayoutDashboard },
    { id: 'daily-sales-input', label: 'Input Penjualan DSR', icon: CheckSquare },
    { id: 'restock-request', label: 'Pengajuan Restock', icon: Boxes, badge: 'AI Ready', badgeColor: 'tertiary' },
    { id: 'order-tracking', label: 'Tracking & Dispatch', icon: Truck, badge: 'Live POD' },
  ];

  const currentNavList = isHq ? hqNav : depoNav;

  const handleToggleRole = () => {
    if (isHq) {
      switchRole('distributor_ops');
      setCurrentScreen('distributor-overview');
    } else {
      switchRole('hq_admin');
      setCurrentScreen('executive-overview');
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest border-r border-outline/10 shadow-sm z-50 flex flex-col justify-between overflow-y-auto">
      {/* TOP BRAND & USER CONTEXT */}
      <div className="flex flex-col">
        <div className="p-5 border-b border-outline/10 space-y-3">
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
            <Badge variant="tertiary" className="text-[10px] py-0 px-1.5 font-bold">GTNIC 2026</Badge>
          </div>

          {/* ACTIVE NODE CARD */}
          <div className="p-3 bg-surface-container-low rounded-xl border border-outline/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isHq ? (
                <Building2 className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <Warehouse className="h-4 w-4 text-secondary shrink-0" />
              )}
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-on-surface truncate">
                  {isHq ? 'Mayora Admin (HQ)' : 'CV Surya Krian Logistik'}
                </div>
                <div className="text-[10px] text-on-surface-variant truncate font-mono">
                  {isHq ? 'Root Governance • Surabaya' : 'Hub Jawa Timur 1 • Krian'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-outline">
            {isHq ? 'Macro Intelligence & Governance' : 'Micro Operations & Execution'}
          </div>

          {currentNavList.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
        </nav>
      </div>

      {/* BOTTOM ROLE SWITCHER CARD (GTNIC SHOWCASE PROMPT) */}
      <div className="p-4 space-y-3 border-t border-outline/10 bg-surface-container-low/50">
        <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Switch Portal Role</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-tight">
            {isHq
              ? 'Beralih ke konteks operasional gudang mitra lokal (Bambang Sudiro).'
              : 'Beralih ke otoritas pembuat keputusan pusat (Mayora HQ SCM).'}
          </p>
          <button
            onClick={handleToggleRole}
            className="w-full py-1.5 px-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>{isHq ? 'Switch to Depo Krian Ops' : 'Switch to Mayora HQ Admin'}</span>
          </button>
        </div>

        {/* User Card & Sign Out */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-on-surface truncate">{currentUser.name}</div>
              <div className="text-[10px] text-on-surface-variant truncate">{currentUser.username}</div>
            </div>
          </div>
          <button
            onClick={() => switchRole('storefront', 'home')}
            title="Keluar ke Portal Publik"
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

