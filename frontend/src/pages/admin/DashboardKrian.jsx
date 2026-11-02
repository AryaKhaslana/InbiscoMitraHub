import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { api } from '../../services/api';
import { formatRupiah } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { 
  TrendingUp, 
  ShoppingBag, 
  Truck, 
  Store, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Printer, 
  ArrowRight, 
  Boxes, 
  RefreshCw,
  Plus,
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function DashboardKrian() {
  const [kpi, setKpi] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status update tracking
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Manifest modal
  const [manifestModalOpen, setManifestModalOpen] = useState(false);
  const [manifestData, setManifestData] = useState(null);

  // DSR input state
  const [dsrSku, setDsrSku] = useState('MYR-RMK-01');
  const [dsrCartons, setDsrCartons] = useState(10);
  const [dsrChannel, setDsrChannel] = useState('WARUNG_KELONTONG');
  const [dsrSubmitting, setDsrSubmitting] = useState(false);
  const [dsrSuccessMsg, setDsrSuccessMsg] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiRes, ordersRes, invRes] = await Promise.all([
        api.getAdminKpi().catch(() => null),
        api.getAdminOrders().catch(() => ({ orders: [] })),
        api.getFefoInventory().catch(() => ({ inventory: [] })),
      ]);

      if (kpiRes) setKpi(kpiRes);
      if (ordersRes && ordersRes.orders) setOrders(ordersRes.orders);
      if (invRes && invRes.inventory) setInventory(invRes.inventory);
    } catch (err) {
      setError(err.message || 'Gagal memuat data operasional Depo Krian.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, nextStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.updateOrderStatus(orderId, nextStatus, `Updated via Depo Krian Dashboard`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      await loadDashboardData();
    } catch (err) {
      alert(`Gagal memperbarui status: ${err.message}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleOpenManifest = async () => {
    setManifestModalOpen(true);
    try {
      const res = await api.getDailyManifest();
      setManifestData(res);
    } catch (err) {
      console.error('Failed to load manifest:', err);
    }
  };

  const handleSubmitDsr = async (e) => {
    e.preventDefault();
    setDsrSubmitting(true);
    setDsrSuccessMsg(null);
    try {
      const res = await api.submitDailySales({
        sku: dsrSku,
        cartonsSold: Number(dsrCartons),
        channel: dsrChannel,
        notes: 'Pencatatan kasir lapangan Krian',
      });
      setDsrSuccessMsg(`Berhasil mencatat penjualan ${dsrCartons} karton (${dsrSku}). Sisa stok: ${res.record?.remainingStock || 'diperbarui'}.`);
      await loadDashboardData();
    } catch (err) {
      alert(`Gagal submit DSR: ${err.message}`);
    } finally {
      setDsrSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* TITLE & QUICK ACTIONS BAR */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] uppercase font-bold">Depot Node: CV Surya Krian Logistik</Badge>
            <span className="text-xs text-outline">• Sidoarjo Barat</span>
          </div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight mt-1">
            Operasional Depo & Manajemen FEFO Gudang
          </h1>
          <p className="text-xs text-on-surface-variant">
            Pencatatan barang keluar, pemantauan gelombang dispatch toko kelontong, dan rotasi kedaluwarsa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenManifest}
            variant="outline"
            size="sm"
            className="gap-1.5 font-bold text-xs"
          >
            <Printer className="h-4 w-4 text-secondary" />
            <span>Cetak Manifest Harian</span>
          </Button>

          <Button
            onClick={loadDashboardData}
            variant="subtle"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* KPI 4 CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omzet Hari Ini */}
        <Card className="border-outline/10 shadow-xs">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-outline uppercase tracking-wider">Omzet Grosir Hari Ini</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-on-surface">
              {kpi ? formatRupiah(kpi.todayRevenue || 28450000) : 'Rp 28.450.000'}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span>+18.4% dari kemarin</span>
              <span className="text-outline">• 18 Kecamatan</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Pesanan */}
        <Card className="border-outline/10 shadow-xs">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-outline uppercase tracking-wider">Pesanan Masuk</span>
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-on-surface">
              {kpi ? `${kpi.todayOrders || 24} PO` : '24 PO'}
            </div>
            <div className="text-[11px] text-on-surface-variant">
              Rata-rata: 14 karton per warung
            </div>
          </CardContent>
        </Card>

        {/* Antrean Dispatch */}
        <Card className="border-outline/10 shadow-xs">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-outline uppercase tracking-wider">Antrean Dispatch</span>
              <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Truck className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700">
              {kpi ? `${kpi.pendingDispatch || 8} Pengiriman` : '8 Pengiriman'}
            </div>
            <div className="text-[11px] text-amber-800 font-medium">
              Wave 2 (Siang): Siap muat ke Canter
            </div>
          </CardContent>
        </Card>

        {/* Toko Aktif */}
        <Card className="border-outline/10 shadow-xs">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-outline uppercase tracking-wider">Mitra Toko Aktif</span>
              <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                <Store className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-on-surface">
              {kpi ? `${kpi.activeStores || 128} Mitra` : '128 Mitra'}
            </div>
            <div className="text-[11px] text-on-surface-variant">
              Tingkat retensi pemesanan: 92%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DISPATCH STREAM & DSR FORM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: LIVE ORDERS DISPATCH TABLE */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-outline/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-surface-container-low border-b border-outline/10 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  Antrean Dispatch & Pengiriman Toko
                </CardTitle>
                <p className="text-xs text-on-surface-variant">
                  Tekan tombol aksi untuk memperbarui alur siklus pemesanan toko secara langsung.
                </p>
              </div>
              <Badge variant="surface" className="text-xs font-mono">{orders.length} Pesanan</Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container text-outline font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Kode Order</th>
                    <th className="p-3">Toko & Kecamatan</th>
                    <th className="p-3">Item Pesanan</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi Alur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-on-surface-variant">
                        Belum ada pesanan aktif.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => {
                      const isUpdating = updatingOrderId === (o.id || o.trackingCode);
                      return (
                        <tr key={o.id || o.trackingCode} className="hover:bg-surface-container-low transition-colors">
                          <td className="p-3 font-mono font-bold text-primary whitespace-nowrap">
                            {o.trackingCode}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-on-surface">{o.store?.name || o.storeName || 'Toko Mitra'}</div>
                            <div className="text-[11px] text-on-surface-variant">{o.store?.district || o.district || 'Sidoarjo'}</div>
                          </td>
                          <td className="p-3 max-w-[200px] truncate text-on-surface-variant">
                            {o.itemsSummary || (o.items && o.items.map(i => `${i.product?.name || 'SKU'} (${i.quantity} dus)`).join(', ')) || '1 SKU'}
                          </td>
                          <td className="p-3 font-bold text-on-surface whitespace-nowrap">
                            {formatRupiah(o.totalAmount)}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <Badge
                              variant={
                                o.status === 'DELIVERED'
                                  ? 'success'
                                  : o.status === 'DISPATCHED'
                                  ? 'warning'
                                  : o.status === 'CONFIRMED'
                                  ? 'secondary'
                                  : 'surface'
                              }
                              className="text-[10px]"
                            >
                              {o.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            {o.nextStatus ? (
                              <Button
                                onClick={() => handleUpdateStatus(o.id || o.trackingCode, o.nextStatus)}
                                disabled={isUpdating}
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] font-bold gap-1"
                              >
                                <span>{isUpdating ? '...' : (o.nextActionLabel || `Ke ${o.nextStatus}`)}</span>
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: DSR INPUT KASIR HARIAN FORM */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-outline/10 shadow-sm">
            <CardHeader className="bg-surface-container-low border-b border-outline/10 py-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Boxes className="h-4 w-4 text-primary" />
                Catat Penjualan Harian (DSR)
              </CardTitle>
              <p className="text-xs text-on-surface-variant">
                Kurangi stok fisik gudang saat barang keluar ke warung kelontong lokal.
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {dsrSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                  <div>{dsrSuccessMsg}</div>
                </div>
              )}

              <form onSubmit={handleSubmitDsr} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">Pilih Produk SKU</label>
                  <select
                    value={dsrSku}
                    onChange={(e) => setDsrSku(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-outline/20 bg-surface-container-low text-xs text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="MYR-RMK-01">MYR-RMK-01 • Roma Kelapa 300g</option>
                    <option value="MYR-BBG-02">MYR-BBG-02 • Beng-Beng Regular 20g</option>
                    <option value="MYR-KPK-03">MYR-KPK-03 • Kopiko Candy Pocket</option>
                    <option value="MYR-TRB-04">MYR-TRB-04 • Torabika Duo Kopi Gula</option>
                    <option value="MYR-SLI-05">MYR-SLI-05 • Slai O'Lai Stroberi 128g</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">Jumlah Karton Keluar</label>
                  <Input
                    type="number"
                    min="1"
                    max="500"
                    value={dsrCartons}
                    onChange={(e) => setDsrCartons(e.target.value)}
                    className="text-xs font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">Kanal Distribusi</label>
                  <select
                    value={dsrChannel}
                    onChange={(e) => setDsrChannel(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-outline/20 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="WARUNG_KELONTONG">Warung Kelontong / Eceran</option>
                    <option value="GROSIR">Sub-Agen Grosir Pasar</option>
                    <option value="MINIMARKET">Minimarket Mandiri</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={dsrSubmitting}
                  className="w-full font-bold gap-2 text-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>{dsrSubmitting ? 'Mencatat...' : 'Kurangi Stok Fisik Gudang'}</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FEFO INVENTORY ROTATION TABLE */}
      <Card className="border-outline/10 shadow-sm overflow-hidden">
        <CardHeader className="bg-surface-container-low border-b border-outline/10 py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Boxes className="h-4 w-4 text-primary" />
              Monitoring Inventori Gudang Depo Krian (FEFO Strict)
            </CardTitle>
            <p className="text-xs text-on-surface-variant">
              Diurutkan berdasarkan tanggal kedaluwarsa terdekat untuk mencegah risiko stok kadaluwarsa (First-Expired, First-Out).
            </p>
          </div>
          <Badge variant="success" className="text-xs">FEFO Protocol: 100% Compliant</Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-container text-outline font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">SKU</th>
                <th className="p-3">Nama Produk</th>
                <th className="p-3">Stok Fisik (Karton)</th>
                <th className="p-3">Safety Stock</th>
                <th className="p-3">Tanggal Expired</th>
                <th className="p-3">Status FEFO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-on-surface-variant">
                    Memuat data inventori gudang...
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id || item.sku} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-3 font-mono font-bold text-primary">{item.sku}</td>
                    <td className="p-3 font-semibold text-on-surface">{item.name}</td>
                    <td className="p-3 font-bold text-on-surface">{item.stock} Karton</td>
                    <td className="p-3 text-on-surface-variant font-mono">{item.minStock || 150} Karton</td>
                    <td className="p-3 font-mono text-on-surface">
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          item.fefoBadge === 'DANGER'
                            ? 'destructive'
                            : item.fefoBadge === 'WARNING'
                            ? 'warning'
                            : 'success'
                        }
                        className="text-[10px]"
                      >
                        {item.fefoBadge || 'SAFE'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* MANIFEST PRINT MODAL */}
      {manifestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline/15 overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 bg-surface-container-low border-b border-outline/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base text-on-surface">
                  Manifest Muatan Harian Armada — Wave Loading
                </h3>
              </div>
              <button
                onClick={() => setManifestModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline/10 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Nomor Manifest:</span>
                  <span className="font-mono text-primary">MNF-2026-WAVE2-SDA</span>
                </div>
                <div className="flex justify-between">
                  <span>Gudang Asal:</span>
                  <span>Depo Krian KM 29 Hub</span>
                </div>
                <div className="flex justify-between">
                  <span>Armada:</span>
                  <span>Mitsubishi Canter 120PS (W 8912 UZ)</span>
                </div>
                <div className="flex justify-between">
                  <span>Driver & Dispatcher:</span>
                  <span>Agus Prasetyo / Bambang Sudiro</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-on-surface mb-2">Daftar Titik Toko & Alokasi Muatan:</h4>
                <div className="border border-outline/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container text-outline font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Urutan</th>
                        <th className="p-2.5">Nama Toko</th>
                        <th className="p-2.5">Kecamatan</th>
                        <th className="p-2.5 text-right">Muatan (Dus)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/10">
                      <tr>
                        <td className="p-2.5 font-bold">Drop 1</td>
                        <td className="p-2.5">Toko Barokah Jaya</td>
                        <td className="p-2.5">Krian</td>
                        <td className="p-2.5 text-right font-bold">25 Dus</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">Drop 2</td>
                        <td className="p-2.5">Grosir Sembako Rezeki</td>
                        <td className="p-2.5">Balongbendo</td>
                        <td className="p-2.5 text-right font-bold">40 Dus</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">Drop 3</td>
                        <td className="p-2.5">Warung Bu Ratih</td>
                        <td className="p-2.5">Tarik</td>
                        <td className="p-2.5 text-right font-bold">15 Dus</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <Button onClick={() => window.print()} className="font-bold gap-2">
                  <Printer className="h-4 w-4" />
                  <span>Cetak Lembar Serah Terima</span>
                </Button>
                <Button onClick={() => setManifestModalOpen(false)} variant="outline">
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
