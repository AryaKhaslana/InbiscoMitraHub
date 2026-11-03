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
  FileText
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';
import confetti from 'canvas-confetti';

const NEXT_ORDER_STATUS = {
  PENDING: { status: 'CONFIRMED', label: 'Konfirmasi PO' },
  CONFIRMED: { status: 'PACKING', label: 'Mulai Packing' },
  PACKING: { status: 'DISPATCHED', label: 'Kirim Armada' },
  DISPATCHED: { status: 'COMPLETED', label: 'Selesai Terima' },
};

export default function OrderDeliveryTracking({ setCurrentScreen }) {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDoNumber, setSelectedDoNumber] = useState('DO-2026-0881');
  const [outboundOrders, setOutboundOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingBast, setConfirmingBast] = useState(false);
  const [bastReceipt, setBastReceipt] = useState(null);
  const [mutatingOrderId, setMutatingOrderId] = useState(null);

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
      setOutboundOrders(Array.isArray(ordersRes) ? ordersRes : ordersRes?.orders || []);
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

  const handleAdvanceOrder = async (orderId, targetStatus) => {
    setMutatingOrderId(orderId);
    try {
      await api.updateOrderStatus(orderId, targetStatus);
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
            <span>Depo Krian Logistics • Inbound Delivery &amp; Outbound Dispatch</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
            Pelacakan Delivery Armada &amp; Status PO Inbound
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Pantau armada pengiriman dari Pabrik Mayora, verifikasi serah terima muatan (BAST), serta kelola antrean distribusi ke toko mitra.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          <Badge variant="surface" className="font-mono text-xs">
            {deliveries.filter((d) => d.status === 'IN_TRANSIT').length} Truk Dalam Perjalanan
          </Badge>
          <Button
            onClick={fetchTrackingData}
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>Refresh Telemetri</span>
          </Button>
        </div>
      </div>

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
          <Button size="sm" variant="outline" onClick={() => setBastReceipt(null)} className="h-7 text-xs">
            Tutup
          </Button>
        </div>
      )}

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
                      <th className="py-2.5 px-3 font-semibold">Referensi PO</th>
                      <th className="py-2.5 px-3 font-semibold">Asal Pabrik</th>
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
                          <td className="py-3 px-3 font-mono font-bold text-primary">{del.doNumber}</td>
                          <td className="py-3 px-3 font-mono text-on-surface-variant">{del.poNumber}</td>
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

      {/* Outbound Wholesale Store Orders Dispatch Table */}
      <Card className="border border-outline/10 shadow-xs">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-outline/10 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-on-surface">
                Status Pengiriman Outbound ke Toko Mitra Sidoarjo
              </h3>
            </div>
            <span className="text-xs font-mono text-on-surface-variant">{outboundOrders.length} Pesanan Toko</span>
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
                  <th className="py-2.5 px-3 font-semibold text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10 font-medium">
                {outboundOrders.map((ord) => {
                  const nextStep = NEXT_ORDER_STATUS[ord.status];
                  return (
                    <tr key={ord.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-primary">{ord.trackingCode}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-on-surface">{ord.store?.name}</div>
                        <div className="text-[10px] text-on-surface-variant">{ord.store?.district} • {ord.store?.phone}</div>
                      </td>
                      <td className="py-3 px-3 text-on-surface-variant">{ord.itemsSummary}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold">{formatRupiah(ord.totalAmount)}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface-container-highest text-on-surface">
                          {ord.statusLabel || ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {nextStep ? (
                          <Button
                            size="sm"
                            disabled={mutatingOrderId === ord.id}
                            onClick={() => handleAdvanceOrder(ord.id, nextStep.status)}
                            className="bg-primary text-white text-[11px] h-7 px-2.5 hover:bg-primary-container"
                          >
                            {mutatingOrderId === ord.id ? '...' : nextStep.label}
                          </Button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-bold">✓ Selesai</span>
                        )}
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
  );
}
