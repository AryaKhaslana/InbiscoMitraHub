import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { api } from '../../services/api';
import { 
  Warehouse, 
  AlertTriangle, 
  TrendingUp, 
  Truck, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Layers,
  Sliders,
  CheckSquare,
  RefreshCw,
  Store,
  Plus,
  Minus,
  FileText
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';

const NEXT_ORDER_STATUS = {
  PENDING: { status: 'CONFIRMED', label: 'Konfirmasi PO' },
  CONFIRMED: { status: 'PACKING', label: 'Mulai Packing' },
  PACKING: { status: 'DISPATCHED', label: 'Kirim Armada' },
  DISPATCHED: { status: 'COMPLETED', label: 'Selesai Terima' },
};

export default function DistributorOverview({ setCurrentScreen }) {
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState(null);
  const [fefo, setFefo] = useState(null);
  const [dsr, setDsr] = useState(null);
  const [inbound, setInbound] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [mutatingId, setMutatingId] = useState(null);

  const fetchOverviewData = useCallback(async () => {
    setLoading(true);
    try {
      const [kpiRes, fefoRes, dsrRes, inboundRes, ordersRes, storesRes] = await Promise.all([
        api.getAdminKpi(),
        api.getFefoInventory(),
        api.getDailySales({ limit: 5 }),
        api.getInboundDeliveries(),
        api.getAdminOrders({ limit: 8 }),
        api.getAdminStores({ limit: 15 }),
      ]);
      setKpi(kpiRes);
      setFefo(fefoRes);
      setDsr(dsrRes);
      setInbound(inboundRes);
      setOrders(Array.isArray(ordersRes) ? ordersRes : ordersRes?.orders || []);
      setStores(Array.isArray(storesRes) ? storesRes : storesRes?.stores || []);
    } catch (err) {
      console.error('DistributorOverview fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();
    const onRefresh = () => fetchOverviewData();
    window.addEventListener('supplysync:refresh', onRefresh);
    return () => window.removeEventListener('supplysync:refresh', onRefresh);
  }, [fetchOverviewData]);

  const handleAdjustStock = async (productId, addCartons) => {
    setMutatingId(productId);
    try {
      await api.updateProductStock(productId, { addCartons });
      await fetchOverviewData();
    } catch (err) {
      alert(err.message || 'Gagal memperbarui stok gudang');
    } finally {
      setMutatingId(null);
    }
  };

  const handleAdvanceOrder = async (orderId, nextStatus) => {
    setMutatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      await fetchOverviewData();
    } catch (err) {
      alert(err.message || 'Gagal mengubah status pesanan');
    } finally {
      setMutatingId(null);
    }
  };

  const handleVerifyStore = async (storeId, isVerified) => {
    setMutatingId(storeId);
    try {
      await api.verifyStore(storeId, isVerified);
      await fetchOverviewData();
    } catch (err) {
      alert(err.message || 'Gagal memverifikasi toko mitra');
    } finally {
      setMutatingId(null);
    }
  };

  const inventoryItems = fefo?.inventory || [];
  const totalCartons = fefo?.summary?.totalCartonsInWarehouse ?? 1745;
  const capacityPct = Math.min(100, Math.round((totalCartons / 2400) * 100));
  const criticalSkus = inventoryItems.filter((i) => i.stockCartons < 150 || i.fefoStatus === 'DANGER');
  const lowestSku = [...inventoryItems].sort((a, b) => a.stockCartons - b.stockCartons)[0];
  const dsrCartons = dsr?.summary?.totalCartonsSold ?? 175;
  const dsrRevenue = dsr?.summary?.totalRevenueIDR ?? 31850000;
  const activeInbound = inbound?.deliveries?.[0] || null;
  const recentLogs = dsr?.records || [];

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Dynamic Operational Notice / Urgent AI Alert */}
      {lowestSku && (
        <div className="p-3.5 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border-l-4 border-l-red-600 rounded-r-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-on-surface">
                Peringatan Stok &amp; FEFO: {lowestSku.name.split('(')[0].trim()}
              </div>
              <div className="text-[11px] text-on-surface-variant">
                Stok fisik gudang: <strong>{lowestSku.stockCartons} dus</strong> • Batch {lowestSku.batchNumber} (Sisa umur simpan: {lowestSku.daysUntilExpiry} hari).
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button 
              onClick={() => setCurrentScreen && setCurrentScreen('restock-request')}
              size="sm"
              className="bg-primary text-white text-xs font-bold h-8 hover:bg-primary-container shadow-xs"
            >
              Ajukan Restock Cepat
            </Button>
          </div>
        </div>
      )}

      {/* Operational Context Strip & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
            <span>Mayora B2B Network</span>
            <span>/</span>
            <span>Distributor Jatim</span>
            <span>/</span>
            <span className="text-primary font-bold">Depo Krian Logistik</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface mt-1">
            Ringkasan Operasional Depot &amp; Gudang FEFO
          </h1>
          <p className="text-xs text-on-surface-variant">
            Pusat monitoring gudang real-time, rotasi batch FEFO, verifikasi toko mitra, dan orkestrasi pengiriman teritori Sidoarjo Barat.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="surface" className="font-mono text-xs">Node: DEP-SDA-01</Badge>
          <Button
            onClick={fetchOverviewData}
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>Refresh Gudang</span>
          </Button>
        </div>
      </div>

      {/* 4 Primary KPI Metrik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="border border-outline/10 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Total Stok Aktif (DB)</span>
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                <Warehouse className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-on-surface">{totalCartons.toLocaleString('id-ID')}</span>
              <span className="text-xs text-on-surface-variant font-medium">Karton Dus</span>
            </div>
            <div className="mt-3 pt-2.5 bg-surface-container-low -mx-4 -mb-4 px-4 pb-3 rounded-b-xl border-t border-outline/5">
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-on-surface-variant">Kapasitas Gudang 1 Krian</span>
                <span className="font-bold text-on-surface">{capacityPct}% Terisi</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${capacityPct}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-on-surface-variant mt-1">
                <span>Max: 2.400 Dus</span>
                <span>{inventoryItems.length} SKU Terdaftar</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="border-l-4 border-l-red-600 border border-outline/10 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">SKU Kritis &amp; FEFO Danger</span>
              <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-700">
                <AlertTriangle className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-red-600">{criticalSkus.length}</span>
              <span className="text-xs text-on-surface-variant font-medium">Produk Prioritas</span>
            </div>
            <div className="mt-3 pt-2.5 bg-surface-container-low -mx-4 -mb-4 px-4 pb-3 rounded-b-xl border-t border-outline/5">
              <div className="text-[11px] text-red-700 font-semibold truncate">
                {criticalSkus.map((s) => s.name.split(' ')[0]).join(', ') || 'Semua SKU Aman'}
              </div>
              <div className="text-[10px] text-on-surface-variant mt-0.5">
                FEFO Danger (&lt;90hr): {fefo?.summary?.dangerCount || 0} Batch
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="border border-outline/10 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Penjualan DSR Tercatat</span>
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-on-surface">{dsrCartons}</span>
              <span className="text-xs text-on-surface-variant font-medium">Dus Terjual</span>
            </div>
            <div className="mt-3 pt-2.5 bg-surface-container-low -mx-4 -mb-4 px-4 pb-3 rounded-b-xl border-t border-outline/5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                  {formatRupiah(dsrRevenue)}
                </span>
                <span className="font-mono text-[10px] text-on-surface-variant">
                  {dsr?.summary?.totalTransactions || recentLogs.length} Transaksi
                </span>
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1">Tersinkron ke sistem operasional</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="border border-outline/10 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Armada Inbound &amp; Order</span>
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                <Truck className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-on-surface">{inbound?.activeCount ?? 1}</span>
              <span className="text-xs text-on-surface-variant font-medium">Truk Wingbox Inbound</span>
            </div>
            <div className="mt-3 pt-2.5 bg-surface-container-low -mx-4 -mb-4 px-4 pb-3 rounded-b-xl border-t border-outline/5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-on-surface">{activeInbound?.doNumber || 'DO-2026-0881'}</span>
                <span className="text-purple-700 font-bold text-[10px] bg-purple-50 px-1 rounded">
                  {kpi?.pendingDispatch || 4} DO Toko Antre
                </span>
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1">
                {activeInbound?.fleet?.gpsCoordinates?.locationLabel || 'Transit Tol Pandaan - Krian'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main SKU Inventory Health & FEFO Grid (With Live Stock Update Controls) */}
      <Card className="border border-outline/10 shadow-xs">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-primary" />
                Inventori Gudang Krian &amp; Rotasi Batch FEFO (First-Expired, First-Out)
              </h3>
              <p className="text-xs text-on-surface-variant">
                Diurutkan otomatis berdasarkan tanggal kedaluwarsa terdekat. Gunakan tombol +/- untuk penyesuaian stok fisik.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-[10px] font-mono">
                {fefo?.summary?.dangerCount || 2} Danger (&lt;3 Bln)
              </Badge>
              <Badge variant="tertiary" className="text-[10px] font-mono">
                {fefo?.summary?.warningCount || 2} Warning (&lt;6 Bln)
              </Badge>
            </div>
          </div>

          <div className="space-y-2.5">
            {inventoryItems.map((sku) => {
              const fefoBadge =
                sku.fefoStatus === 'DANGER' || sku.fefoStatus === 'EXPIRED'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : sku.fefoStatus === 'WARNING'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200';
              const barColor =
                sku.stockCartons < 150
                  ? 'bg-red-600'
                  : sku.stockCartons < 250
                  ? 'bg-amber-500'
                  : 'bg-emerald-600';
              const fillPercent = Math.min(100, Math.round((sku.stockCartons / 500) * 100));

              return (
                <div key={sku.id} className="p-3.5 bg-surface-container-low rounded-xl border border-outline/10 hover:border-outline/25 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-[260px]">
                      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center font-bold text-xs text-primary shrink-0">
                        {sku.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-on-surface">{sku.name}</div>
                        <div className="text-[10px] text-on-surface-variant font-mono">
                          {sku.sku} • Batch: <strong>{sku.batchNumber}</strong> • Exp: {sku.daysUntilExpiry} hari lagi
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex-1 max-w-sm space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-on-surface-variant">
                          Stok Fisik DB: <strong className="text-on-surface font-mono">{sku.stockCartons} Dus</strong>
                        </span>
                        <span className="text-on-surface-variant font-mono">{formatRupiah(sku.cartonPrice)}/dus</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${fillPercent}%` }}></div>
                      </div>
                    </div>

                    {/* FEFO Pill & Stock Adjustment Controls */}
                    <div className="flex items-center gap-2.5 justify-between lg:justify-end flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${fefoBadge}`}>
                        FEFO: {sku.fefoStatus} ({sku.monthsUntilExpiry} bln)
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={mutatingId === sku.id}
                          onClick={() => handleAdjustStock(sku.id, -25)}
                          title="Kurangi 25 Dus"
                          className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-[11px] font-mono font-bold text-on-surface flex items-center gap-0.5"
                        >
                          <Minus className="h-3 w-3" />25
                        </button>
                        <button
                          type="button"
                          disabled={mutatingId === sku.id}
                          onClick={() => handleAdjustStock(sku.id, 50)}
                          title="Tambah 50 Dus"
                          className="px-2 py-1 rounded bg-primary/10 hover:bg-primary text-primary hover:text-white text-[11px] font-mono font-bold flex items-center gap-0.5 transition-colors"
                        >
                          <Plus className="h-3 w-3" />50
                        </button>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => setCurrentScreen && setCurrentScreen('restock-request')}
                        className="bg-primary text-white text-xs h-7 px-3 hover:bg-primary-container"
                      >
                        Restock PO
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Wholesale Store Orders Queue & Partner Store Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Wholesale Orders State Machine (7 cols) */}
        <Card className="lg:col-span-7 border border-outline/10 shadow-xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-outline/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-xs text-on-surface">Antrean Pesanan Grosir Toko (One-Way State Machine)</h3>
              </div>
              <span className="text-[11px] font-mono text-on-surface-variant">{orders.length} Order Terakhir</span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {orders.map((ord) => {
                const nextAction = NEXT_ORDER_STATUS[ord.status];
                return (
                  <div key={ord.id} className="p-3 bg-surface-container-low rounded-lg border border-outline/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">{ord.trackingCode}</span>
                        <span className="font-bold text-on-surface">{ord.store?.name}</span>
                        <Badge variant="surface" className="text-[9px] py-0 px-1.5">{ord.store?.district}</Badge>
                      </div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">
                        {ord.itemsSummary} • <strong className="font-mono text-on-surface">{formatRupiah(ord.totalAmount)}</strong> ({ord.paymentMethodLabel})
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] font-mono font-bold">
                        {ord.status}
                      </span>
                      {nextAction && (
                        <Button
                          size="sm"
                          disabled={mutatingId === ord.id}
                          onClick={() => handleAdvanceOrder(ord.id, nextAction.status)}
                          className="bg-primary text-white text-[11px] h-7 px-2.5 hover:bg-primary-container"
                        >
                          {mutatingId === ord.id ? '...' : nextAction.label}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right: Partner Stores Verification (5 cols) */}
        <Card className="lg:col-span-5 border border-outline/10 shadow-xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-outline/10 pb-3">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-xs text-on-surface">Direktori &amp; Verifikasi Mitra Toko Sidoarjo</h3>
              </div>
              <Badge variant="surface" className="text-[10px] font-mono">{stores.length} Toko</Badge>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {stores.map((st) => (
                <div key={st.id} className="p-2.5 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between gap-2 text-xs">
                  <div className="overflow-hidden">
                    <div className="font-bold text-on-surface truncate">{st.name}</div>
                    <div className="text-[10px] text-on-surface-variant truncate">
                      {st.ownerName} • {st.district} • <span className="font-mono">{st.phone}</span>
                    </div>
                  </div>

                  {st.isVerified ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                      ✓ Verified
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      disabled={mutatingId === st.id}
                      onClick={() => handleVerifyStore(st.id, true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] h-7 px-2.5 shrink-0"
                    >
                      Verifikasi Mitra
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: Active DO Tracking & Recent Sales Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Active Inbound Delivery Tracking Card: 6 cols */}
        <div className="lg:col-span-6 bg-surface-container-lowest p-5 rounded-xl border border-outline/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-outline/10 pb-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-xs text-on-surface">
                Lacak Surat Jalan Inbound {activeInbound?.doNumber || 'DO-2026-0881'}
              </h3>
            </div>
            <Button
              onClick={() => setCurrentScreen && setCurrentScreen('order-tracking')}
              variant="outline"
              size="sm"
              className="text-xs h-7"
            >
              Lihat Detail &amp; BAST
            </Button>
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Asal Pabrik:</span>
              <span className="font-bold text-on-surface">{activeInbound?.origin || 'Mayora Plant DC Pasuruan'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Armada / Driver:</span>
              <span className="font-mono text-on-surface">
                {activeInbound?.fleet?.plateNumber || 'W 9102 UP'} • {activeInbound?.fleet?.driverName || 'Slamet Riyadi'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Total Muatan:</span>
              <span className="font-bold text-primary">
                {activeInbound?.cargoSummary?.totalCartons || 850} Dus ({activeInbound?.status || 'IN_TRANSIT'})
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {(activeInbound?.milestones || []).map((m) => (
              <div key={m.step} className="flex items-center gap-2.5 text-xs">
                {m.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                )}
                <span className={m.completed ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}>
                  {m.title} ({m.time})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales Submission Feed: 6 cols */}
        <div className="lg:col-span-6 bg-surface-container-lowest p-5 rounded-xl border border-outline/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-outline/10 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-xs text-on-surface">Aktivitas Penjualan Harian Terbaru</h3>
            </div>
            <Button
              onClick={() => setCurrentScreen && setCurrentScreen('daily-sales-input')}
              size="sm"
              className="bg-primary text-white text-xs h-7 px-3"
            >
              + Input DSR Baru
            </Button>
          </div>

          <div className="space-y-2">
            {recentLogs.map((log, idx) => (
              <div key={log.dsrId || idx} className="p-2.5 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-on-surface">{log.storeName || 'Mitra Ritel Krian'}</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">
                    DSR: {log.operatorName || 'Bambang S.'} • {(log.productName || log.sku || '').split('(')[0]} ({log.quantityCartons} Dus)
                  </div>
                </div>
                <div className="font-bold font-mono text-on-surface text-right">
                  {formatRupiah(log.totalSalesAmount || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
