import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
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
  AlertCircle
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';
import confetti from 'canvas-confetti';

export default function OrderDeliveryTracking({ setCurrentScreen }) {
  const [refreshing, setRefreshing] = useState(false);
  const [bastConfirmed, setBastConfirmed] = useState(false);

  const activeShipment = {
    doNumber: 'DO-2026-0881',
    poRef: 'PO-REC-2026-0881',
    origin: 'Pabrik Pasuruan DC',
    destination: 'Gudang Krian (SDA)',
    status: 'DALAM PERJALANAN (TRANSIT)',
    eta: '09:45 WIB (T-Minus 35 Menit)',
    product: 'Roma Kelapa 300g (Dus / Karton)',
    quantityCartons: 850,
    totalValue: 182750000,
    driver: 'Bambang Sugiono',
    phone: '0812-9842-1102',
    truckType: 'Isuzu Giga FVR Wingbox (6 Roda)',
    plateNumber: 'L 9482 UT',
    eLockSeal: '#LK-9941-PASSDA',
    temperature: '24.2°C (Optimal)',
    steps: [
      { step: 1, title: 'Rilis Manifest & Dokumen DO', time: '06:15 WIB', completed: true, note: 'Dokumen DO & Faktur Pajak tervalidasi SAP' },
      { step: 2, title: 'Pemuatan & Segel di DC Pasuruan', time: '07:30 WIB', completed: true, note: '850 Dus termuat, e-Lock tamper-proof aktif' },
      { step: 3, title: 'Perjalanan Armada (Inbound Transit)', time: '08:40 WIB', current: true, note: 'Posisi GPS: Tol Pandaan - Porong KM 42' },
      { step: 4, title: 'Penerimaan & BAST Depo Krian', time: 'Est. 09:45 WIB', pending: true, note: 'Pemeriksaan fisik segel & barcode FEFO' },
    ],
  };

  const deliveryHistory = [
    { doNumber: 'DO-2026-0881', sku: 'Roma Kelapa 300g', qty: 850, date: '17 Jun 2026', status: 'IN_TRANSIT', badge: 'Dalam Perjalanan' },
    { doNumber: 'DO-2026-0840', sku: 'Beng-Beng Regular 20g', qty: 600, date: '15 Jun 2026', status: 'DELIVERED', badge: 'Diterima Lengkap' },
    { doNumber: 'DO-2026-0792', sku: 'Torabika Duo 25g', qty: 450, date: '12 Jun 2026', status: 'DELIVERED', badge: 'Diterima Lengkap' },
    { doNumber: 'DO-2026-0755', sku: 'Energen Cokelat 34g', qty: 900, date: '08 Jun 2026', status: 'DELIVERED', badge: 'Diterima Lengkap' },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleConfirmBast = () => {
    setBastConfirmed(true);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Header & KPI Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Sistem Pelacakan Logistik Inbound Hub Krian</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-on-surface tracking-tight">
            Pelacakan Pengiriman & Status Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Distributor Logistics Portal: Pemantauan armada transit pabrik, ETA langsung, dan manifest serah terima fisik (BAST).
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl px-4 py-2 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-on-surface-variant uppercase">Armada Inbound</span>
              <span className="text-sm font-bold text-on-surface">1 Truk Bergerak</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl px-4 py-2 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-on-surface-variant uppercase">Fulfillment Rata-rata</span>
              <span className="text-sm font-bold text-on-surface">99.4% Volume</span>
            </div>
          </div>

          <Button 
            onClick={handleRefresh}
            variant="outline" 
            size="sm" 
            className="text-xs font-bold gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Segarkan Status</span>
          </Button>
        </div>
      </div>

      {/* ACTIVE SHIPMENT HERO CARD */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-md overflow-hidden">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-primary to-primary-container px-6 py-4 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-white">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/20 uppercase">
                  {activeShipment.doNumber}
                </span>
                <span className="text-white/60">•</span>
                <span className="text-xs font-mono text-white/90">{activeShipment.poRef}</span>
              </div>
              <h2 className="text-lg font-bold font-display text-white mt-0.5">
                {activeShipment.origin} ➔ {activeShipment.destination}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-tertiary text-white font-mono text-xs font-bold">
              {activeShipment.status}
            </span>
          </div>
        </div>

        {/* Timeline Stepper */}
        <div className="p-6 border-b border-surface-container-high bg-surface-container-low/40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {activeShipment.steps.map((st) => (
              <div 
                key={st.step}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  st.current
                    ? 'bg-primary/5 border-primary shadow-xs'
                    : st.completed
                    ? 'bg-surface-container-lowest border-emerald-300'
                    : 'bg-surface-container border-surface-container-high opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                      st.current ? 'bg-primary text-white' : st.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {st.completed ? 'SELESAI' : st.current ? 'SEDANG JALAN' : 'MENUNGGU'}
                    </span>
                    <span className="text-[11px] font-mono text-outline">{st.time}</span>
                  </div>
                  <h4 className="text-xs font-bold font-display text-on-surface">{st.title}</h4>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-2">{st.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cargo, Driver, & Telemetry Details */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Product & Cargo Detail */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Manifest Kargo Inbound</span>
                <span className="text-xs font-mono font-bold text-on-surface">Total: {activeShipment.quantityCartons} Karton</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-surface-container-lowest border border-surface-container-high flex items-center justify-center p-2 shrink-0">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-on-surface">{activeShipment.product}</h3>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Estimasi Nilai Faktur: <strong className="text-primary">{formatRupiah(activeShipment.totalValue)}</strong> (PPn 11% Included)
                  </div>
                  <div className="text-[11px] text-outline mt-1 font-mono">
                    Batch: #RMK-PAS-260601 • Kadaluwarsa: Jun 2027 (FEFO Grade A)
                  </div>
                </div>
              </div>
            </div>

            {/* Inspection Checklist */}
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high space-y-2 text-xs">
              <span className="font-bold text-on-surface block">Instruksi Verifikasi Gudang Distributor Krian:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Periksa kesesuaian nomor segel boks #LK-9941</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Scan barcode master karton FEFO</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Validasi tanda tangan supir pada BAST</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Input kuantitas fisik ke menu DSR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Driver & Vehicle Info */}
          <div className="lg:col-span-5 bg-surface-container-low p-5 rounded-xl border border-surface-container-high space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                <span className="text-xs font-bold text-on-surface uppercase">Armada & Supir Mayora</span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">GPS ONLINE</span>
              </div>

              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-outline">Tipe Armada:</span>
                  <span className="font-semibold text-on-surface">{activeShipment.truckType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Nomor Polisi:</span>
                  <span className="font-mono font-bold text-on-surface">{activeShipment.plateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Nama Driver:</span>
                  <span className="font-semibold text-on-surface">{activeShipment.driver}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Segel e-Lock:</span>
                  <span className="font-mono font-bold text-primary">{activeShipment.eLockSeal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Suhu Kargo Boks:</span>
                  <span className="font-mono text-emerald-700 font-semibold">{activeShipment.temperature}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-container-high flex flex-col gap-2">
              {bastConfirmed ? (
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                  <span>BAST Kedatangan Telah Divalidasi</span>
                </div>
              ) : (
                <Button 
                  onClick={handleConfirmBast}
                  size="sm" 
                  className="w-full text-xs font-bold gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Konfirmasi Serah Terima Fisik (BAST)</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIWAYAT PENGIRIMAN & PENERIMAAN TABLE */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-on-surface">Riwayat Delivery Order & Penerimaan Barang</h3>
            <p className="text-xs text-on-surface-variant">Arsip serah terima inbound armada 30 hari terakhir dari Pabrik Pasuruan & Driyorejo.</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-surface-container-high rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-surface-container-high font-bold text-on-surface uppercase">
              <tr>
                <th className="py-3 px-4">No. Surat Jalan (DO)</th>
                <th className="py-3 px-4">Produk FMCG</th>
                <th className="py-3 px-4">Kuantitas</th>
                <th className="py-3 px-4">Tanggal Penerimaan</th>
                <th className="py-3 px-4">Status Logistik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {deliveryHistory.map((row, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-primary">{row.doNumber}</td>
                  <td className="py-3 px-4 font-semibold text-on-surface">{row.sku}</td>
                  <td className="py-3 px-4 font-mono">{row.qty} Karton</td>
                  <td className="py-3 px-4 text-on-surface-variant">{row.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.status === 'IN_TRANSIT'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {row.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
