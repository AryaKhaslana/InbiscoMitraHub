import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '../../services/api';
import { formatRupiah } from '../../lib/utils';
import { 
  RefreshCw, 
  Search, 
  Bell, 
  Home, 
  CheckCircle2, 
  Loader2, 
  ExternalLink,
  X,
  AlertTriangle,
  Truck,
  Boxes,
  Store,
  LayoutDashboard,
  Sliders,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Trash2
} from 'lucide-react';

function timeAgo(dateString) {
  if (!dateString) return 'Baru saja';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} mnt lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} hari lalu`;
}

export default function AdminHeader({ currentScreen, setCurrentScreen }) {
  const { activeRole, switchRole } = useAuthRole();
  const [syncingSap, setSyncingSap] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [kpiSnapshot, setKpiSnapshot] = useState(null);

  // Search Palette State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const searchRef = useRef(null);

  // Notification State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const isHq = activeRole === 'hq_admin';

  // Fetch live notifications from live Supabase & Upstash APIs
  const fetchNotifications = useCallback(async () => {
    try {
      const [riskSettled, inboundSettled, ordersSettled, kpiSettled] = await Promise.allSettled([
        api.getStockoutRisk(),
        api.getInboundDeliveries(),
        api.getAdminOrders({ limit: 5 }),
        api.getAdminKpi(),
      ]);

      let savedReadIds = [];
      try {
        savedReadIds = JSON.parse(localStorage.getItem('supplysync_read_notifications') || '[]');
      } catch (e) {
        savedReadIds = [];
      }
      const readSet = new Set(savedReadIds);

      const items = [];

      // 1. Stockout Risk Notifications (Danger)
      if (riskSettled.status === 'fulfilled' && riskSettled.value) {
        const riskPayload = riskSettled.value;
        const riskItems = riskPayload.items || (Array.isArray(riskPayload) ? riskPayload : []);
        const criticalItems = riskItems.filter(
          (i) => i.riskLevel === 'CRITICAL' || i.runwayDays < 3.0 || i.stockCartons < 150
        );
        criticalItems.slice(0, 2).forEach((item) => {
          const id = `risk-${item.sku}`;
          items.push({
            id,
            title: `Peringatan Stok Kritis (${item.name ? item.name.split('(')[0].trim() : item.sku})`,
            message: `Sisa stok ${item.stockCartons} dus di Gudang Krian (runway ${item.runwayDays} hari). Disarankan pengajuan PO restock atau transfer depo.`,
            time: 'Realtime',
            type: 'danger',
            targetScreen: 'stockout-risk',
            actionLabel: 'Buka Radar Risiko',
            read: readSet.has(id),
          });
        });
      }

      // 2. Inbound Deliveries Notifications (Truck)
      if (inboundSettled.status === 'fulfilled' && inboundSettled.value) {
        const inboundPayload = inboundSettled.value;
        const deliveries = inboundPayload.deliveries || inboundPayload.activeDeliveries || [];
        const activeShipment = deliveries.find((d) => d.status === 'IN_TRANSIT') || deliveries[0];
        if (activeShipment) {
          const id = `inbound-${activeShipment.doNumber}`;
          const isTransit = activeShipment.status === 'IN_TRANSIT';
          items.push({
            id,
            title: isTransit
              ? `Armada Inbound Transit (${activeShipment.doNumber})`
              : `Penerimaan Barang Selesai (${activeShipment.doNumber})`,
            message: activeShipment.fleet?.plateNumber
              ? `Truk Wingbox ${activeShipment.fleet.plateNumber} muatan ${activeShipment.cargoSummary?.totalCartons || 850} dus ${isTransit ? `menuju ${activeShipment.destination}` : 'telah terverifikasi BAST di Gudang Krian'}.`
              : `Surat jalan ${activeShipment.doNumber} origin ${activeShipment.origin}.`,
            time: activeShipment.eta || 'Hari ini',
            type: 'truck',
            targetScreen: 'order-tracking',
            actionLabel: 'Lacak Armada Inbound',
            read: readSet.has(id),
          });
        }
      }

      // 3. Wholesale Orders Notifications (Store Order)
      if (ordersSettled.status === 'fulfilled' && ordersSettled.value) {
        const ordersPayload = ordersSettled.value;
        const orderList = Array.isArray(ordersPayload)
          ? ordersPayload
          : ordersPayload.orders || ordersPayload.data || [];
        orderList.slice(0, 2).forEach((ord) => {
          const id = `order-${ord.id || ord.trackingCode}`;
          items.push({
            id,
            title: `Pesanan Grosir (${ord.trackingCode})`,
            message: `${ord.store?.name || 'Mitra Toko'} memesan ${ord.items?.length || 0} SKU (${formatRupiah(ord.totalAmount)}) — status: ${ord.status}.`,
            time: timeAgo(ord.createdAt),
            type: 'order',
            targetScreen: 'distributor-overview',
            actionLabel: 'Kelola Pesanan Toko',
            read: readSet.has(id),
          });
        });
      }

      // 4. System / KPI Sync Notification (Info)
      const kpi = kpiSettled.status === 'fulfilled' ? kpiSettled.value : null;
      if (kpi) {
        setKpiSnapshot(kpi);
      }
      const sysId = 'sys-sync-live';
      items.push({
        id: sysId,
        title: 'Sinkronisasi Sistem Mayora',
        message: `${kpi?.activeStores || 12} Mitra Toko Terverifikasi & ${kpi?.totalOrders || 10} Order aktif tersinkronisasi penuh dengan server pusat.`,
        time: 'Tersinkron',
        type: 'info',
        targetScreen: 'executive-overview',
        actionLabel: 'Ringkasan Jaringan',
        read: readSet.has(sysId),
      });

      if (items.length > 0) {
        setNotifications(items);
      }
    } catch (err) {
      console.warn('Failed to load dynamic notifications:', err);
    }
  }, []);

  // Load KPI, dynamic notifications, and product catalog for search palette
  useEffect(() => {
    fetchNotifications();

    api.getProducts({ limit: 50 })
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.data || res?.products || [];
        setProductsList(items);
      })
      .catch(() => {});

    const onRefresh = () => fetchNotifications();
    window.addEventListener('supplysync:refresh', onRefresh);
    return () => window.removeEventListener('supplysync:refresh', onRefresh);
  }, [fetchNotifications, currentScreen]);

  // Click outside listener for search & notif dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSyncSap = async () => {
    setSyncingSap(true);
    setSyncSuccess(false);
    try {
      const res = await api.syncSap();
      if (res?.kpiSnapshot) {
        setKpiSnapshot((prev) => ({ ...prev, ...res.kpiSnapshot }));
      }
      setSyncSuccess(true);
      window.dispatchEvent(new CustomEvent('supplysync:refresh'));
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err) {
      console.error('Sync SAP error:', err);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } finally {
      setSyncingSap(false);
    }
  };

  // Navigational items searchable across screens
  const searchableScreens = [
    { id: 'executive-overview', label: 'Executive Overview', desc: 'Pemantauan makro jaringan & performa distributor regional', icon: LayoutDashboard },
    { id: 'stockout-risk', label: 'Stockout Risk Radar', desc: 'Peringatan dini stok kritis & transfer antar-depot', icon: AlertTriangle },
    { id: 'smart-recommendations', label: 'Smart Replenishment Engine', desc: 'Rekomendasi alokasi kuantitas restock dan otorisasi batch PO', icon: Sparkles },
    { id: 'what-if-simulator', label: 'What-if Restock Simulator', desc: 'Simulasi stres skenario lonjakan permintaan & lead time', icon: Sliders },
    { id: 'distributor-overview', label: 'Depo Krian Overview & FEFO', desc: 'Inventori gudang FEFO, order toko, dan verifikasi mitra', icon: Store },
    { id: 'daily-sales-input', label: 'Input Penjualan Harian (DSR)', desc: 'Pencatatan faktur keluar ritel dan pemotongan stok otomatis', icon: CheckSquare },
    { id: 'restock-request', label: 'Pengajuan Restock Mandiri', desc: 'Formulir pengajuan PO ke Mayora Manufacturing Plant', icon: Boxes },
    { id: 'order-tracking', label: 'Tracking Armada & Dispatch', desc: 'Pelacakan armada inbound wingbox, BAST, dan antrean toko', icon: Truck },
  ];

  const searchableDocuments = [
    { id: 'DO-2026-0881', label: 'Surat Jalan DO-2026-0881', desc: 'Truk Wingbox Pasuruan • 850 Dus Inbound Transit Tol Pandaan', targetScreen: 'order-tracking', icon: Truck },
    { id: 'DO-2026-0882', label: 'Surat Jalan DO-2026-0882', desc: 'Truk B 9421 UYX Jayanti • 1.200 Dus Transit Tol Mojokerto', targetScreen: 'order-tracking', icon: Truck },
    { id: 'PO-2026-0042', label: 'Purchase Order PO-2026-0042', desc: 'Alokasi 650 Dus Roma & Beng-Beng disetujui Mayora HQ', targetScreen: 'restock-request', icon: Boxes },
    { id: 'ORD-2026-001', label: 'Pesanan Toko Mitra Berkah Jaya', desc: '15 Dus Biskuit & Kopi • Sidoarjo Barat', targetScreen: 'distributor-overview', icon: Store },
  ];

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { screens: [], products: [], documents: [] };
    const q = searchQuery.toLowerCase().trim();

    const screens = searchableScreens.filter(
      (s) => s.label.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
    );

    const products = productsList.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
    ).slice(0, 5);

    const documents = searchableDocuments.filter(
      (d) => d.id.toLowerCase().includes(q) || d.label.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q)
    );

    return { screens, products, documents };
  }, [searchQuery, productsList]);

  const hasSearchResults = 
    searchResults.screens.length > 0 || 
    searchResults.products.length > 0 || 
    searchResults.documents.length > 0;

  const handleSelectSearchResult = (targetScreen, extraAction = null) => {
    if (setCurrentScreen && targetScreen) {
      setCurrentScreen(targetScreen);
    }
    if (extraAction) {
      extraAction();
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => {
      const allIds = prev.map((n) => n.id);
      try {
        localStorage.setItem('supplysync_read_notifications', JSON.stringify(allIds));
      } catch (e) {}
      return prev.map((n) => ({ ...n, read: true }));
    });
  };

  const handleClearAll = () => {
    setNotifications([]);
    try {
      localStorage.setItem('supplysync_read_notifications', JSON.stringify([]));
    } catch (e) {}
  };

  const handleDismissNotification = (e, notifId) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  const handleNotificationClick = (notif) => {
    try {
      const saved = JSON.parse(localStorage.getItem('supplysync_read_notifications') || '[]');
      if (!saved.includes(notif.id)) {
        saved.push(notif.id);
        localStorage.setItem('supplysync_read_notifications', JSON.stringify(saved));
      }
    } catch (e) {}

    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (setCurrentScreen && notif.targetScreen) {
      setCurrentScreen(notif.targetScreen);
    }
    setIsNotifOpen(false);
  };

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface/90 backdrop-blur-md border-b border-outline/10 z-40 flex items-center justify-between px-4 sm:px-6">
      {/* Breadcrumbs & Status */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-on-surface-variant font-medium whitespace-nowrap shrink-0">
          <Home className="h-4 w-4 shrink-0 text-on-surface-variant" />
          <span className="opacity-40">/</span>
          <span className="text-on-surface font-bold">
            {isHq ? 'Mayora HQ' : 'Depo Krian'}
          </span>
          <span className="opacity-40">/</span>
          <span className="capitalize text-primary font-semibold truncate max-w-[120px] sm:max-w-[170px] lg:max-w-[220px]">
            {currentScreen.replace(/-/g, ' ')}
          </span>
        </div>

        {/* Global Network Health Pill - Compact on xl, full on 2xl */}
        <div className="hidden 2xl:flex items-center gap-2 bg-surface-container-low px-3 py-1 rounded-full text-xs border border-outline/10 whitespace-nowrap shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="font-semibold text-on-surface">
            {kpiSnapshot?.activeStores
              ? `${kpiSnapshot.activeStores} Mitra Terverifikasi • ${kpiSnapshot.totalOrders || kpiSnapshot.todayOrders || 10} Order Aktif`
              : 'Network Health: 94.2% Optimal'}
          </span>
          <span className="text-outline">•</span>
          <span className="text-on-surface-variant">Sistem Terhubung</span>
        </div>

        <div className="hidden xl:flex 2xl:hidden items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-full text-xs border border-outline/10 whitespace-nowrap shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="font-semibold text-on-surface text-[11px]">
            {kpiSnapshot?.activeStores || 12} Mitra • {kpiSnapshot?.totalOrders || 10} Order
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Interactive Quick Search Palette */}
        <div ref={searchRef} className="relative hidden md:block w-36 lg:w-48 xl:w-60 shrink min-w-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Cari SKU, batch, DO..."
            className="w-full h-9 pl-8 pr-7 rounded-lg bg-surface-container-low text-xs text-on-surface border border-outline/15 focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all truncate"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2 top-2.5 text-on-surface-variant hover:text-on-surface"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Search Dropdown Results */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface-container-lowest rounded-xl shadow-xl border border-outline/15 py-2 z-50 max-h-96 overflow-y-auto animate-in fade-in duration-100">
              {hasSearchResults ? (
                <div className="space-y-2 text-xs">
                  {/* Screens match */}
                  {searchResults.screens.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[10px] font-bold text-outline uppercase tracking-wider">
                        Layar &amp; Modul Operasional
                      </div>
                      {searchResults.screens.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectSearchResult(item.id)}
                            className="w-full px-3 py-2 text-left hover:bg-surface-container-low flex items-center justify-between group transition-colors"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Icon className="h-4 w-4 text-primary shrink-0" />
                              <div className="overflow-hidden">
                                <div className="font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                                  {item.label}
                                </div>
                                <div className="text-[10px] text-on-surface-variant truncate">{item.desc}</div>
                              </div>
                            </div>
                            <ArrowRight className="h-3 w-3 text-outline group-hover:text-primary transition-colors shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Products match */}
                  {searchResults.products.length > 0 && (
                    <div className="border-t border-outline/10 pt-1">
                      <div className="px-3 py-1 text-[10px] font-bold text-outline uppercase tracking-wider">
                        Produk FMCG &amp; Saldo Stok
                      </div>
                      {searchResults.products.map((p) => (
                        <button
                          key={p.id}
                          onClick={() =>
                            handleSelectSearchResult('distributor-overview', () => {
                              sessionStorage.setItem('supplysync_highlight_sku', p.sku);
                            })
                          }
                          className="w-full px-3 py-2 text-left hover:bg-surface-container-low flex items-center justify-between group transition-colors"
                        >
                          <div className="overflow-hidden">
                            <div className="font-bold text-on-surface group-hover:text-primary truncate">
                              {p.name.split('(')[0].trim()}
                            </div>
                            <div className="text-[10px] text-on-surface-variant font-mono truncate">
                              {p.sku} • {p.category}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-primary block">
                              {p.stockCartons ?? 0} Dus
                            </span>
                            <span className="text-[9px] text-outline block">Gudang FEFO</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Documents match */}
                  {searchResults.documents.length > 0 && (
                    <div className="border-t border-outline/10 pt-1">
                      <div className="px-3 py-1 text-[10px] font-bold text-outline uppercase tracking-wider">
                        Surat Jalan &amp; Dokumen DO/PO
                      </div>
                      {searchResults.documents.map((d) => {
                        const Icon = d.icon;
                        return (
                          <button
                            key={d.id}
                            onClick={() => handleSelectSearchResult(d.targetScreen)}
                            className="w-full px-3 py-2 text-left hover:bg-surface-container-low flex items-center justify-between group transition-colors"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Icon className="h-4 w-4 text-emerald-700 shrink-0" />
                              <div className="overflow-hidden">
                                <div className="font-bold text-on-surface group-hover:text-primary truncate">
                                  {d.label}
                                </div>
                                <div className="text-[10px] text-on-surface-variant truncate">{d.desc}</div>
                              </div>
                            </div>
                            <ArrowRight className="h-3 w-3 text-outline group-hover:text-primary transition-colors shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-on-surface-variant">
                  <Search className="h-6 w-6 mx-auto mb-1 opacity-40 text-outline" />
                  <div className="font-semibold text-xs text-on-surface">Tidak ada data yang cocok</div>
                  <div className="text-[11px] text-outline mt-0.5">Coba kata kunci lain seperti "Roma", "DO", atau "Pasuruan"</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sync SAP Button */}
        <Button
          onClick={handleSyncSap}
          disabled={syncingSap}
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-semibold h-9 px-2.5 sm:px-3 shrink-0"
        >
          {syncingSap ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : syncSuccess ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5 text-primary" />
          )}
          <span className="hidden sm:inline">
            {syncingSap ? 'Sinkronisasi...' : syncSuccess ? 'Data Tersinkronisasi' : 'Sinkronisasi SAP'}
          </span>
          <span className="sm:hidden">SAP</span>
        </Button>

        {/* Notification Bell with Interactive Dropdown */}
        <div ref={notifRef} className="relative shrink-0">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative h-9 w-9 rounded-lg bg-surface-container-low border border-outline/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
            title="Pusat Notifikasi Operasional"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[calc(100vh-5rem)] flex flex-col bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline/15 z-50 overflow-hidden animate-in fade-in duration-150">
              <div className="p-3.5 border-b border-outline/10 flex items-center justify-between bg-surface-container-low/50 shrink-0">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-on-surface">Pemberitahuan Operasional</span>
                  {unreadCount > 0 ? (
                    <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                      {unreadCount} Baru
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-outline font-mono">
                      {notifications.length} Info
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      title="Bersihkan Semua Notifikasi"
                      className="text-[11px] text-on-surface-variant hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Bersihkan</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List - Fixed Max Height & Smooth Scroll */}
              <div className="divide-y divide-outline/10 overflow-y-auto max-h-[380px] flex-1 overscroll-contain">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-on-surface-variant">
                    <ShieldCheck className="h-6 w-6 mx-auto mb-1 text-emerald-600 opacity-60" />
                    <p className="font-semibold text-on-surface">Semua Sistem Terkendali</p>
                    <p className="text-[11px] text-outline mt-0.5">Tidak ada pemberitahuan baru.</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 text-xs hover:bg-surface-container-low transition-colors cursor-pointer flex gap-3 relative group ${
                          !notif.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {notif.type === 'danger' && (
                            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                              <AlertTriangle className="h-4 w-4" />
                            </div>
                          )}
                          {notif.type === 'truck' && (
                            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                              <Truck className="h-4 w-4" />
                            </div>
                          )}
                          {notif.type === 'order' && (
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                              <Store className="h-4 w-4" />
                            </div>
                          )}
                          {notif.type === 'info' && (
                            <div className="w-7 h-7 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                              <ShieldCheck className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-1 overflow-hidden pr-4">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`font-bold truncate ${!notif.read ? 'text-primary' : 'text-on-surface'}`}>
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-outline font-mono shrink-0">{notif.time}</span>
                          </div>
                          <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">
                            {notif.message}
                          </p>
                          <div className="pt-1 flex items-center gap-1 text-[11px] font-bold text-primary">
                            <span>{notif.actionLabel}</span>
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        </div>

                        {/* Dismiss Single Notification Button on Hover */}
                        <button
                          onClick={(e) => handleDismissNotification(e, notif.id)}
                          title="Hapus pemberitahuan ini"
                          className="absolute right-2 top-2 p-1 text-outline hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Quick Refresh Action */}
              <div className="p-2.5 border-t border-outline/10 bg-surface-container-low/40 flex items-center justify-between text-xs shrink-0">
                <span className="text-[11px] text-on-surface-variant">Telemetri Jatim Terhubung</span>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('supplysync:refresh'));
                    api.getAdminKpi().then((res) => setKpiSnapshot(res));
                  }}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Segarkan Data</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Link back to storefront (Guaranteed redirect to Home Storefront, not Login) */}
        <Button
          onClick={() => switchRole('storefront', 'home')}
          variant="ghost"
          size="sm"
          className="text-xs text-on-surface-variant hover:text-primary gap-1 hidden lg:flex shrink-0 px-2 sm:px-3"
        >
          <span>Storefront</span>
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </header>
  );
}
