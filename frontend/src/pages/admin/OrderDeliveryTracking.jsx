import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { api } from '../../services/api';
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  RefreshCw, 
  Phone, 
  ShieldCheck, 
  FileText,
  Users,
  Eye,
  X,
  ArrowRight
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';
import confetti from 'canvas-confetti';
import SidoarjoDeliveryMap from '../../components/common/SidoarjoDeliveryMap';

const NEXT_ORDER_STATUS = {
  PENDING: { status: 'CONFIRMED', label: 'Konfirmasi PO' },
  CONFIRMED: { status: 'PACKING', label: 'Mulai Packing' },
  PACKING: { status: 'DISPATCHED', label: 'Kirim Armada' },
  DISPATCHED: { status: 'COMPLETED', label: 'Selesai Terima' },
};

const STATUS_INDEX_MAP = {
  PENDING: 0,
  CONFIRMED: 1,
  PACKING: 2,
  DISPATCHED: 3,
  COMPLETED: 4,
};

export default function OrderDeliveryTracking({ setCurrentScreen }) {
  const [activeTab, setActiveTab] = useState('outbound'); // 'outbound' (Mitra Toko Sidoarjo) | 'inbound' (Pabrik Mayora BAST)
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDoNumber, setSelectedDoNumber] = useState('DO-2026-0881');
  const [outboundOrders, setOutboundOrders] = useState([]);
  const [radarSelectedOrder, setRadarSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmingBast, setConfirmingBast] = useState(false);
  const [bastReceipt, setBastReceipt] = useState(null);
  const [mutatingOrderId, setMutatingOrderId] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [orderFeedbackToast, setOrderFeedbackToast] = useState(null);

  const fetchTrackingData = useCallback(async () => {
    setLoading(true);
    try {
      const [inboundRes, ordersRes] = await Promise.all([
        api.getInboundDeliveries(),
        api.getAdminOrders({ limit: 15 }),
      ]);
      const list = inboundRes?.deliveries || [];
      setDeliveries(list);
      if (list.length > 0) {
        setSelectedDoNumber((prev) => {
          const exists = list.find((d) => d.doNumber === prev);
          return exists ? prev : list[0].doNumber;
        });
      }
      const ordersList = Array.isArray(ordersRes) ? ordersRes : ordersRes?.orders || [];
      setOutboundOrders(ordersList);
      setRadarSelectedOrder((prev) => prev || ordersList[0] || null);
    } catch (err) {
      console.error('OrderDeliveryTracking fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrackingData();
    const onRefresh = () => fetchTrackingData();
    window.addEventListener('supplysync:refresh', onRefresh);
    return () => window.removeEventListener('supplysync:refresh', onRefresh);
  }, [fetchTrackingData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedOrderDetails(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeShipment =
    deliveries.find((d) => d.doNumber === selectedDoNumber) ||
    deliveries[0] || {
      doNumber: 'DO-2026-0881',
      poNumber: 'PO-MYR-2610-8821',
      origin: 'Mayora Plant DC Pasuruan (Pier II)',
      destination: 'Gudang Utama CV Surya Krian Logistik (Bay 2)',
      status: 'IN_TRANSIT',
      currentStep: 3,
      milestones: [
        { step: 1, title: 'HQ Approval & SAP DO Release', time: '14:10 WIB', completed: true },
        { step: 2, title: 'Plant Loading & e-Lock Sealing', time: '15:25 WIB', completed: true },
        { step: 3, title: 'Transit Tol Pandaan – Krian (KM 742)', time: '16:45 WIB', completed: true },
        { step: 4, title: 'Unloading & Verifikasi BAST Gudang Krian', time: 'Estimasi 17:28 WIB', completed: false },
      ],
      fleet: {
        plateNumber: 'W 9102 UP',
        vehicleType: 'Hino Ranger FM 260 JD Wingbox (65 m³)',
        driverName: 'Slamet Riyadi',
        driverPhone: '0812-3099-4412',
        sealNumber: 'MYR-998240',
        sealStatus: 'LOCKED_INTACT',
        gpsCoordinates: {
          locationLabel: '5.2 km menjelang Exit Tol Krian',
        },
      },
      cargoSummary: {
        totalCartons: 850,
        ftlUtilizationPct: 86,
        items: [],
      },
    };

  const isBastVerified = activeShipment.status === 'DELIVERED_BAST_VERIFIED';

  const handleConfirmBast = async () => {
    if (isBastVerified || confirmingBast) return;
    setConfirmingBast(true);
    setBastReceipt(null);
    try {
      const res = await api.confirmInboundArrival(activeShipment.doNumber, {
        receivedBy: 'Bambang Sudiro (Kepala Gudang Krian)',
        sealCode: activeShipment.fleet?.sealNumber || 'MYR-998240',
        notes: `Verifikasi BAST fisik untuk ${activeShipment.doNumber} lengkap sesuai manifest`,
        applyToStock: true,
      });
      setBastReceipt(res);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
      await fetchTrackingData();
    } catch (err) {
      alert(err.message || 'Gagal mengonfirmasi BAST');
    } finally {
      setConfirmingBast(false);
    }
  };

  const handleAdvanceOrder = async (orderId, targetStatus, orderData = null) => {
    setMutatingOrderId(orderId);
    try {
      await api.updateOrderStatus(orderId, targetStatus);
      
      const statusFeedback = {
        CONFIRMED: {
          title: 'Pesanan Dikonfirmasi & Masuk Antrean Gudang',
          message: 'Verifikasi DO selesai. Tim gudang siap memproses alokasi stok dan batching.',
        },
        PACKING: {
          title: 'Proses Packing Gudang Dimulai',
          message: 'Barang sedang diambil dari rak penyimpanan dan dikemas sesuai manifest surat jalan.',
        },
        DISPATCHED: {
          title: 'Armada Pengiriman Berangkat Menuju Toko',
          message: 'Muatan telah dinaikkan ke armada pengantaran lokal menuju kecamatan mitra.',
        },
        COMPLETED: {
          title: 'Pesanan Selesai & e-POD Terverifikasi',
          message: 'Serah terima barang telah divalidasi oleh pemilik toko mitra dengan bukti penerimaan digital.',
        },
      };

      const feedback = statusFeedback[targetStatus] || {
        title: 'Status Pesanan Berhasil Diperbarui',
        message: `Status dialihkan ke tahap ${targetStatus}.`,
      };

      const trackingCode =
        orderData?.trackingCode ||
        outboundOrders.find((o) => o.id === orderId)?.trackingCode ||
        orderId;

      setOrderFeedbackToast({
        trackingCode,
        title: feedback.title,
        message: feedback.message,
      });

      if (targetStatus === 'COMPLETED') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      // If modal is currently open for this order, update its status reactively
      setSelectedOrderDetails((prev) => {
        if (!prev || prev.id !== orderId) return prev;
        const nextMap = {
          CONFIRMED: { nextStatus: 'PACKING', nextActionLabel: 'Mulai Packing' },
          PACKING: { nextStatus: 'DISPATCHED', nextActionLabel: 'Kirim Armada' },
          DISPATCHED: { nextStatus: 'COMPLETED', nextActionLabel: 'Selesai Terima' },
          COMPLETED: { nextStatus: null, nextActionLabel: null },
        };
        const nextInfo = nextMap[targetStatus] || { nextStatus: null, nextActionLabel: null };
        return {
          ...prev,
          status: targetStatus,
          statusLabel:
            targetStatus === 'CONFIRMED'
              ? 'Dikonfirmasi'
              : targetStatus === 'PACKING'
              ? 'Dipacking'
              : targetStatus === 'DISPATCHED'
              ? 'Dikirim'
              : 'Selesai',
          nextStatus: nextInfo.nextStatus,
          nextActionLabel: nextInfo.nextActionLabel,
        };
      });

      await fetchTrackingData();
    } catch (err) {
      alert(err.message || 'Gagal memperbarui status pesanan');
    } finally {
      setMutatingOrderId(null);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider mb-1">
            <Truck className="h-4 w-4" />
            <span>Depo Krian Logistics • SCM Tracking &amp; Dispatch Console</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
            Pelacakan Armada &amp; Status Distribusi
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola pengiriman karton Mayora ke toko mitra kelontong Sidoarjo (Outbound) dan pantau pasokan truk pabrik (Inbound BAST).
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          <Badge variant="surface" className="font-mono text-xs">
            {outboundOrders.length} Pesanan Mitra • {deliveries.filter((d) => d.status === 'IN_TRANSIT').length} Truk Inbound
          </Badge>
          <Button
            onClick={fetchTrackingData}
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>Refresh Telemetri</span>
          </Button>
        </div>
      </div>

      {/* 2-Way SCM Direction Switcher (Outbound vs Inbound Tabs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-surface-container-low rounded-2xl border border-outline/10 shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('outbound')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'outbound'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Outbound: Distribusi Toko Mitra</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${activeTab === 'outbound' ? 'bg-white/20' : 'bg-surface-container-high'}`}>
              {outboundOrders.length} Pesanan
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inbound')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'inbound'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Inbound: Suplai Pabrik Mayora (BAST)</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${activeTab === 'inbound' ? 'bg-white/20' : 'bg-surface-container-high'}`}>
              {deliveries.length} Truk
            </span>
          </button>
        </div>

        <div className="text-[11px] text-on-surface-variant px-3 py-1 font-medium hidden lg:block font-mono">
          {activeTab === 'outbound' 
            ? '🚚 Rute Depo Krian ➔ 18 Kec. Sidoarjo (Suzuki Carry Box • e-POD)'
            : '🏭 Rute Pabrik DC Pasuruan ➔ Depo Krian (Hino Wingbox • BAST)'}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OUTBOUND DISTRIBUTION TO TOKO MITRA (FOKUS UTAMA PESANAN WEB)     */}
      {/* ========================================================================= */}
      {activeTab === 'outbound' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Outbound Context Guide */}
          <div className="p-4 bg-surface-container-lowest border border-outline/10 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-on-surface">Alur Pengiriman Toko Mitra:</span>
                <span className="text-on-surface-variant ml-1">
                  Semua pesanan yang dibuat oleh toko mitra melalui katalog publik akan masuk ke antrean ini. Anda dapat memajukan tahapan (Konfirmasi PO ➔ Packing FEFO ➔ Kirim Armada Carry ➔ Selesai e-POD) dan memantau rute pengantaran secara <em>live</em> pada radar di bawah.
                </span>
              </div>
            </div>
            <Badge variant="surface" className="text-[10px] shrink-0 font-mono">
              Live e-POD &amp; Rute Lokal
            </Badge>
          </div>

          {/* REAL FORMAL SIDOARJO LOGISTICS MAP */}
          <SidoarjoDeliveryMap
            orderData={radarSelectedOrder || outboundOrders[0]}
            height="h-[380px]"
          />

          {/* Toast Feedback Status Update Outbound */}
          {orderFeedbackToast && (
            <div className="p-4 bg-primary/10 border border-primary/20 text-on-surface rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-on-surface">
                    {orderFeedbackToast.title} • <span className="font-mono text-primary font-extrabold">{orderFeedbackToast.trackingCode}</span>
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    {orderFeedbackToast.message}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setOrderFeedbackToast(null)}
                className="h-7 text-xs text-on-surface-variant hover:text-on-surface self-end sm:self-auto cursor-pointer"
              >
                Tutup
              </Button>
            </div>
          )}

          {/* Outbound Wholesale Store Orders Dispatch Table */}
          <Card className="border border-outline/10 shadow-xs">
            <CardContent className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline/10 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-on-surface">
                      Antrean &amp; Status Pengiriman Outbound ke Toko Mitra Sidoarjo
                    </h3>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Klik baris pesanan untuk menyorot posisi rute pada radar GPS, atau klik <strong>Detail &amp; POD</strong> untuk bukti tanda terima digital.
                  </p>
                </div>
                <Badge variant="surface" className="text-xs font-mono self-start sm:self-auto">
                  {outboundOrders.length} Pesanan Toko
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline/10">
                      <th className="py-2.5 px-3 font-semibold">No Resi</th>
                      <th className="py-2.5 px-3 font-semibold">Toko Tujuan &amp; Kecamatan</th>
                      <th className="py-2.5 px-3 font-semibold">Ringkasan Item</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Total Tagihan</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Status Saat Ini</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Aksi Dispatch &amp; e-POD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline/10 font-medium">
                    {outboundOrders.map((ord) => {
                      const nextStep = NEXT_ORDER_STATUS[ord.status];
                      const isRadarActive = radarSelectedOrder?.id === ord.id;
                      return (
                        <tr
                          key={ord.id}
                          onClick={() => setRadarSelectedOrder(ord)}
                          className={`hover:bg-surface-container-low/80 cursor-pointer transition-colors group ${
                            isRadarActive ? 'bg-primary/5 ring-1 ring-primary/30' : ''
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold text-primary group-hover:underline">
                            <div className="flex items-center gap-1.5">
                              {isRadarActive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>}
                              <span>{ord.trackingCode}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-on-surface">{ord.store?.name}</div>
                            <div className="text-[10px] text-on-surface-variant">
                              {ord.store?.district} • {ord.store?.phone}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-on-surface-variant max-w-xs truncate">
                            {ord.itemsSummary}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold">
                            {formatRupiah(ord.totalAmount)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                ord.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'DISPATCHED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : ord.status === 'PACKING'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-surface-container-highest text-on-surface'
                              }`}
                            >
                              {ord.statusLabel || ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedOrderDetails(ord)}
                                className="h-7 px-2 text-[11px] gap-1 border-outline/20 hover:bg-surface-container cursor-pointer"
                                title="Buka Rincian Pesanan & e-POD"
                              >
                                <Eye className="h-3 w-3 text-primary" />
                                <span>Detail &amp; POD</span>
                              </Button>
                              {nextStep ? (
                                <Button
                                  size="sm"
                                  disabled={mutatingOrderId === ord.id}
                                  onClick={() => handleAdvanceOrder(ord.id, nextStep.status, ord)}
                                  className="bg-primary text-white text-[11px] h-7 px-2.5 hover:bg-primary-container font-semibold shadow-xs cursor-pointer active:scale-95 transition-transform"
                                >
                                  {mutatingOrderId === ord.id ? '...' : nextStep.label}
                                </Button>
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-bold px-1.5 flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INBOUND FACTORY REPLENISHMENT FROM MAYORA HQ (BAST & GUDANG KRIAN) */}
      {/* ========================================================================= */}
      {activeTab === 'inbound' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {bastReceipt && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold">
                    Berita Acara Serah Terima ({bastReceipt.bastNumber}) untuk {bastReceipt.doNumber} Terverifikasi!
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    Stok Gudang Krian telah diperbarui:{' '}
                    {(bastReceipt.restockedItems || [])
                      .map((it) => `${it.name.split('(')[0].trim()} (+${it.addedCartons} dus → ${it.newStockCartons} dus)`)
                      .join(', ')}
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setBastReceipt(null)} className="h-7 text-xs cursor-pointer">
                Tutup
              </Button>
            </div>
          )}

          {/* Inbound Context Guide */}
          <div className="p-4 bg-surface-container-lowest border border-outline/10 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-on-surface">Alur Pasokan Masuk Pabrik Mayora (Inbound BAST):</span>
                <span className="text-on-surface-variant ml-1">
                  Pasokan ratusan dus karton Mayora dari Pabrik DC Pasuruan &amp; Balaraja diangkut armada truk Hino Wingbox. Pilih kartu pengemudi di bawah untuk melihat rute perjalanan tol Trans-Jawa. Saat armada tiba di Bay Gudang Krian, tekan <strong>Konfirmasi Terima BAST</strong> untuk otomatis memasukkan muatan dus ke saldo stok aktif.
                </span>
              </div>
            </div>
            <Badge variant="surface" className="text-[10px] shrink-0 font-mono">
              Inbound Truk Pabrik &amp; BAST
            </Badge>
          </div>

      {/* Fleet & Driver Selector Grid (Pilih Pengemudi & Truk Aktif) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-xs text-on-surface uppercase tracking-wider">
              Pilih Armada &amp; Pengemudi Aktif (Fleet &amp; Driver Directory)
            </h3>
          </div>
          <span className="text-[11px] text-on-surface-variant font-mono">
            Klik kartu untuk beralih pengemudi ({deliveries.length} Armada Siap Dipantau)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {deliveries.map((del) => {
            const isSelected = del.doNumber === activeShipment.doNumber;
            const isDelivered = del.status === 'DELIVERED_BAST_VERIFIED';
            const driver = del.fleet?.driverName || 'Pengemudi Mayora';
            const plate = del.fleet?.plateNumber || 'Plat Truk';
            const cartons = del.cargoSummary?.totalCartons || 0;

            return (
              <button
                key={del.doNumber}
                type="button"
                onClick={() => setSelectedDoNumber(del.doNumber)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-surface-container-lowest border-primary ring-2 ring-primary/40 shadow-md'
                    : 'bg-surface-container-low border-outline/10 hover:border-outline/30 hover:bg-surface-container-lowest'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg font-mono">
                    AKTIF
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {driver.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-xs text-on-surface truncate group-hover:text-primary transition-colors">
                        {driver}
                      </div>
                      <div className="font-mono text-[10px] text-on-surface-variant truncate">
                        {plate}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-on-surface-variant truncate">
                    {del.doNumber} • <strong className="text-on-surface font-mono">{cartons} Dus</strong>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-outline/5 flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      isDelivered
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {isDelivered ? '✓ BAST Valid' : 'In Transit'}
                  </span>
                  <span className="text-[10px] font-mono text-outline truncate max-w-[90px]">
                    {del.origin.split('(')[0].replace('Mayora', '').trim()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: 8 cols Active Shipment Details + 4 cols Fleet & Cargo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Stepper & Route Map (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="border border-outline/10 shadow-xs overflow-hidden">
            <div className="bg-surface-container-low px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline/10">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-extrabold text-sm text-primary">{activeShipment.doNumber}</span>
                <span className="text-xs text-on-surface-variant font-mono">({activeShipment.poNumber})</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isBastVerified
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-purple-100 text-purple-800 animate-pulse'
                }`}
              >
                {isBastVerified ? 'SELESAI & BAST TERVERIFIKASI' : 'DALAM PERJALANAN (IN TRANSIT)'}
              </span>
            </div>

            <CardContent className="p-5 space-y-5">
              {/* Origin -> Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 bg-surface-container-low rounded-xl border border-outline/10 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Titik Keberangkatan (Origin)</span>
                  <div className="font-bold text-on-surface mt-0.5">{activeShipment.origin}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Titik Tujuan (Destination)</span>
                  <div className="font-bold text-on-surface mt-0.5">{activeShipment.destination}</div>
                </div>
              </div>

              {/* GPS Live Position Strip */}
              <div className="p-3.5 bg-primary/5 border border-primary/15 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-bold text-on-surface">
                    Posisi GPS Terkini: {activeShipment.fleet?.gpsCoordinates?.locationLabel || 'Tol Pandaan - Krian'}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-primary font-bold">
                  e-Lock Seal: {activeShipment.fleet?.sealNumber || 'MYR-998240'} ({activeShipment.fleet?.sealStatus || 'INTACT'})
                </span>
              </div>

              {/* 4-Step Milestone Stepper */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-on-surface">Tahapan Perjalanan &amp; Validasi Dokumen</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(activeShipment.milestones || []).map((step) => (
                    <div
                      key={step.step}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                        step.completed
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-surface-container-low border-outline/15'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold text-on-surface">
                          Step {step.step}: {step.title}
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">{step.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm BAST Action */}
              <div className="pt-3 border-t border-outline/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-on-surface-variant">
                  {isBastVerified
                    ? '✓ Muatan DO ini telah diverifikasi dan masuk ke saldo stok gudang.'
                    : 'Klik tombol di samping saat truk tiba di Bay Gudang Krian untuk memverifikasi BAST dan menambah stok otomatis.'}
                </div>

                <Button
                  onClick={handleConfirmBast}
                  disabled={isBastVerified || confirmingBast}
                  className={`text-xs font-bold px-4 py-2 shrink-0 ${
                    isBastVerified
                      ? 'bg-emerald-600 text-white opacity-90'
                      : 'bg-primary text-white hover:bg-primary-container shadow-xs'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 mr-1.5" />
                  <span>
                    {isBastVerified
                      ? 'BAST Terverifikasi'
                      : confirmingBast
                      ? 'Memverifikasi & Update Stok...'
                      : `Konfirmasi BAST ${activeShipment.doNumber} (+${activeShipment.cargoSummary?.totalCartons || 850} Dus)`}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inbound DO List Selector */}
          <Card className="border border-outline/10 shadow-xs">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-on-surface">Daftar Surat Jalan Inbound Pabrik (DC Pasuruan / Driyorejo)</h3>
                <span className="text-xs font-mono text-on-surface-variant">{deliveries.length} DO Tercatat</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline/10">
                      <th className="py-2.5 px-3 font-semibold">Nomor DO</th>
                      <th className="py-2.5 px-3 font-semibold">Pengemudi &amp; Armada</th>
                      <th className="py-2.5 px-3 font-semibold">Asal Pabrik / Depo</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Muatan</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline/10 font-medium">
                    {deliveries.map((del) => {
                      const isDone = del.status === 'DELIVERED_BAST_VERIFIED';
                      const isSelected = del.doNumber === activeShipment.doNumber;
                      return (
                        <tr
                          key={del.doNumber}
                          onClick={() => setSelectedDoNumber(del.doNumber)}
                          className={`hover:bg-surface-container-low cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                        >
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-primary block">{del.doNumber}</span>
                            <span className="font-mono text-[10px] text-on-surface-variant">{del.poNumber}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-on-surface block">{del.fleet?.driverName || 'Supir Mayora'}</span>
                            <span className="font-mono text-[10px] text-on-surface-variant">{del.fleet?.plateNumber} • {del.fleet?.vehicleType?.split('(')[0].trim()}</span>
                          </td>
                          <td className="py-3 px-3 text-on-surface">{del.origin}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold">
                            {del.cargoSummary?.totalCartons || 0} Dus
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {isDone ? 'Diterima (BAST Valid)' : 'In Transit'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Button
                              size="sm"
                              variant={isSelected ? 'default' : 'outline'}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDoNumber(del.doNumber);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`text-[11px] h-7 px-2.5 ${
                                isSelected ? 'bg-primary text-white shadow-xs' : ''
                              }`}
                            >
                              {isSelected ? 'Sedang Aktif' : 'Pilih DO'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Fleet Telemetry & Cargo Items (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="border border-outline/10 shadow-xs bg-surface-container-lowest">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-outline/10 pb-3">
                <span className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-primary" />
                  Identitas Armada &amp; Pengemudi
                </span>
                <Badge variant="surface" className="font-mono text-[10px]">
                  {activeShipment.fleet?.plateNumber || 'W 9102 UP'}
                </Badge>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Tipe Armada:</span>
                  <span className="font-bold text-on-surface text-right">{activeShipment.fleet?.vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Nama Pengemudi:</span>
                  <span className="font-bold text-on-surface">{activeShipment.fleet?.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Kontak Darurat:</span>
                  <span className="font-mono font-semibold text-primary flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {activeShipment.fleet?.driverPhone || '0812-3099-4412'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Utilisasi FTL:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {activeShipment.cargoSummary?.ftlUtilizationPct || 86}% Kapasitas
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-outline/10 shadow-xs bg-surface-container-lowest">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-outline/10 pb-3">
                <span className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-primary" />
                  Rincian Muatan Kargo ({activeShipment.cargoSummary?.totalCartons || 0} Dus)
                </span>
              </div>

              <div className="space-y-2">
                {(activeShipment.cargoSummary?.items || []).map((item, idx) => (
                  <div key={idx} className="p-3 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-on-surface">{item.name || item.productName || item.sku}</div>
                      <div className="text-[10px] text-on-surface-variant font-mono">
                        {item.sku} • Batch: {item.batchNumber || 'BATCH-2611'}
                      </div>
                    </div>
                    <span className="font-mono font-extrabold text-primary">{item.quantityCartons} Dus</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )}

  {/* Modal Dossier Detail & e-POD Pesanan Toko Outbound */}
      {selectedOrderDetails && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrderDetails(null);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest border border-outline/15 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 cursor-default"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-outline/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-on-surface">
                      {selectedOrderDetails.trackingCode}
                    </h3>
                    <Badge variant="surface" className="text-[10px] font-mono font-bold">
                      {selectedOrderDetails.statusLabel || selectedOrderDetails.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Toko Mitra: <strong>{selectedOrderDetails.store?.name}</strong> • Pemilik:{' '}
                    {selectedOrderDetails.store?.ownerName || '-'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
                title="Tutup (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Stepper Status Alur Outbound */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                <span>Alur Pemenuhan &amp; Pengiriman Outbound:</span>
                <span className="text-[11px] text-primary font-mono font-bold">
                  Tahap {(STATUS_INDEX_MAP[selectedOrderDetails.status] ?? 0) + 1} dari 5
                </span>
              </div>

              {/* Animated Progress Bar Track */}
              <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${Math.min(100, Math.max(12, (((STATUS_INDEX_MAP[selectedOrderDetails.status] ?? 0) + 1) / 5) * 100))}%` 
                  }}
                />
              </div>

              <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                {[
                  { key: 'PENDING', label: '1. Masuk PO' },
                  { key: 'CONFIRMED', label: '2. Verifikasi' },
                  { key: 'PACKING', label: '3. Packing' },
                  { key: 'DISPATCHED', label: '4. Dikirim' },
                  { key: 'COMPLETED', label: '5. Selesai POD' },
                ].map((st, idx) => {
                  const currentIdx = STATUS_INDEX_MAP[selectedOrderDetails.status] ?? 0;
                  const isDone = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={st.key}
                      className={`p-2 rounded-lg border font-semibold transition-all duration-300 ease-out ${
                        isCurrent
                          ? 'bg-primary text-white border-primary shadow-xs scale-[1.02]'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-surface-container-low text-on-surface-variant border-transparent'
                      }`}
                    >
                      <div className="truncate">{st.label}</div>
                      <div className="text-[9px] opacity-80 mt-0.5 flex items-center justify-center gap-1">
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                        {isCurrent ? 'Aktif' : isDone ? '✓ Selesai' : 'Antre'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Informasi Toko & Lokasi Pengantaran */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline/10 space-y-1.5">
                <div className="font-bold text-on-surface flex items-center gap-1.5 text-[11px] text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                  Alamat &amp; Kontak Penerima
                </div>
                <div className="text-on-surface font-semibold">{selectedOrderDetails.store?.name}</div>
                <div className="text-on-surface-variant text-[11px]">
                  {selectedOrderDetails.store?.address || 'Jl. Raya Sidoarjo No. 12'}, Kec.{' '}
                  {selectedOrderDetails.store?.district}
                </div>
                <div className="text-primary font-mono text-[11px] flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {selectedOrderDetails.store?.phone || '0812-3456-7890'}
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl border border-outline/10 space-y-1.5">
                <div className="font-bold text-on-surface flex items-center gap-1.5 text-[11px] text-primary">
                  <Truck className="h-3.5 w-3.5" />
                  Armada &amp; Kurir Distribusi Depo
                </div>
                <div className="text-on-surface font-semibold">Suzuki Carry Box (W 8821 NA)</div>
                <div className="text-on-surface-variant text-[11px]">
                  Kurir: <strong>Bambang Triyono</strong> (Depo Krian Hub)
                </div>
                <div className="text-emerald-700 font-semibold text-[11px]">
                  {selectedOrderDetails.status === 'COMPLETED'
                    ? '✓ Tiba & Diserahterimakan di Lokasi'
                    : selectedOrderDetails.status === 'DISPATCHED'
                    ? '🚚 Dalam Perjalanan Pengantaran'
                    : '⏳ Menunggu Jadwal Muat Dispatch'}
                </div>
              </div>
            </div>

            {/* Rincian Muatan Kargo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                <span className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-primary" />
                  Daftar Muatan Dus Pesanan:
                </span>
                <span className="text-[11px] font-mono text-on-surface-variant">
                  {selectedOrderDetails.items?.length || 1} SKU Produk
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto border border-outline/10 rounded-xl divide-y divide-outline/10 text-xs">
                {(selectedOrderDetails.items || []).length > 0 ? (
                  selectedOrderDetails.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-surface-container-low/50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-on-surface">
                          {item.product?.name || item.name || 'Produk Mayora'}
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-mono">
                          SKU: {item.product?.sku || item.sku || '-'} • Batch:{' '}
                          {item.product?.batchNumber || 'B-2026-N09'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold font-mono text-on-surface">
                          {item.quantity} Dus
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-mono">
                          {formatRupiah(item.subtotal || item.quantity * (item.unitPrice || 0))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-surface-container-low/50 text-on-surface-variant text-xs">
                    {selectedOrderDetails.itemsSummary || 'Rincian produk tidak tersedia'}
                  </div>
                )}
              </div>
            </div>

            {/* Financial & e-POD Status Bar */}
            <div className="p-3.5 bg-surface-container-low rounded-xl space-y-2 text-xs border border-outline/10">
              <div className="flex justify-between text-on-surface-variant">
                <span>Metode Pembayaran:</span>
                <span className="font-mono font-bold text-on-surface">
                  {selectedOrderDetails.paymentMethodLabel ||
                    selectedOrderDetails.paymentMethod ||
                    'TEMPO 7 HARI'}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-outline/10 text-sm">
                <span className="font-bold text-on-surface">Total Tagihan DO:</span>
                <span className="font-mono font-black text-primary">
                  {formatRupiah(selectedOrderDetails.totalAmount)}
                </span>
              </div>

              {/* e-POD Verification Badge */}
              <div className="pt-2 border-t border-outline/10 flex items-center justify-between text-[11px]">
                <span className="text-on-surface-variant">Status e-POD (Proof of Delivery):</span>
                {selectedOrderDetails.status === 'COMPLETED' ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 font-mono">
                    <ShieldCheck className="h-3.5 w-3.5" /> e-POD Tervalidasi &amp; Tanda Terima Sah
                  </span>
                ) : selectedOrderDetails.status === 'DISPATCHED' ? (
                  <span className="text-blue-700 font-semibold flex items-center gap-1 font-mono">
                    <Clock className="h-3.5 w-3.5" /> Menunggu Konfirmasi Serah Terima Toko
                  </span>
                ) : (
                  <span className="text-on-surface-variant font-mono">
                    Belum Diterbitkan (Menunggu Pengiriman)
                  </span>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-outline/10 flex items-center justify-between gap-3">
              <div>
                {NEXT_ORDER_STATUS[selectedOrderDetails.status] ? (
                  <Button
                    size="sm"
                    disabled={mutatingOrderId === selectedOrderDetails.id}
                    onClick={() =>
                      handleAdvanceOrder(
                        selectedOrderDetails.id,
                        NEXT_ORDER_STATUS[selectedOrderDetails.status].status,
                        selectedOrderDetails
                      )
                    }
                    className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-4 gap-1.5 shadow-xs h-9 active:scale-95 transition-transform duration-150 cursor-pointer"
                  >
                    <span>
                      {mutatingOrderId === selectedOrderDetails.id
                        ? 'Memproses...'
                        : `Lanjut: ${NEXT_ORDER_STATUS[selectedOrderDetails.status].label}`}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <span className="text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Serah Terima Selesai &amp; e-POD Terverifikasi
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrderDetails(null)}
                className="text-xs h-9 px-4"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
