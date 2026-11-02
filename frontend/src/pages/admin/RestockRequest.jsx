import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { api } from '../../services/api';
import { 
  Boxes, 
  Truck, 
  Sparkles, 
  Building2, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Minus, 
  Send, 
  History, 
  PackageCheck,
  RefreshCw
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';
import confetti from 'canvas-confetti';

export default function RestockRequest({ setCurrentScreen }) {
  const [skuItems, setSkuItems] = useState([]);
  const [poHistory, setPoHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [targetPlant, setTargetPlant] = useState('pasuruan'); // pasuruan | driyorejo
  const [priority, setPriority] = useState('express'); // regular | express | urgent
  const [applyImmediately, setApplyImmediately] = useState(false);
  const [notes, setNotes] = useState('Prioritaskan pemenuhan rute Krian Barat & Balongbendo sebelum akhir pekan.');
  const [submittedPo, setSubmittedPo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRestockData = useCallback(async () => {
    setLoading(true);
    try {
      let simOverride = null;
      try {
        const raw = sessionStorage.getItem('supplysync_sim_restock');
        if (raw) {
          simOverride = JSON.parse(raw);
          sessionStorage.removeItem('supplysync_sim_restock');
        }
      } catch {}

      const [recRes, logsRes] = await Promise.all([
        api.getRestockRecommendations(),
        api.getAuditLogs({ action: 'BATCH_PO_APPROVED', limit: 15 }),
      ]);

      const recs = recRes?.recommendations || [];
      setSkuItems(
        recs.map((r, idx) => {
          const isOverridden =
            simOverride && (simOverride.productId === r.productId || simOverride.sku === r.sku);
          return {
            id: r.productId,
            productId: r.productId,
            name: r.name.split('(')[0].trim(),
            category: r.category,
            skuCode: r.sku,
            stitchCode: r.stitchCode,
            stockReal: r.stockCartons,
            avgDailySales: r.adsCartonsPerDay,
            aiSuggested: r.recommendedQuantityCartons,
            inputDus: isOverridden
              ? simOverride.quantityCartons
              : idx < 4
              ? r.recommendedQuantityCartons
              : 0,
            unitPrice: r.unitPriceIDR,
            cbmPerDus: r.cbmPerCarton,
            kgPerDus: r.weightKgPerCarton,
          };
        })
      );

      const rawLogs = Array.isArray(logsRes) ? logsRes : logsRes?.logs || [];
      const mappedLogs = rawLogs.map((l) => {
        const d = l.details || {};
        const isDone = d.status === 'RECEIVED_IN_STOCK';
        return {
          id: d.poNumber || l.entityId,
          doNumber: d.doNumber || '-',
          date: new Date(d.approvedAt || l.createdAt).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          plant: d.sourceFactory || 'Mayora Plant DC Pasuruan',
          totalDus: d.totalCartons || 0,
          totalValue: d.grandTotalIDR || d.subtotalIDR || 0,
          status: d.status || 'APPROVED_IN_TRANSIT',
          statusLabel: isDone
            ? 'Selesai & Stok Masuk DB'
            : `Dalam Pengiriman (${d.doNumber || 'DO Aktif'})`,
          statusColor: isDone
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-purple-100 text-purple-800',
        };
      });
      setPoHistory(mappedLogs);
    } catch (err) {
      console.error('RestockRequest fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestockData();
    const onRefresh = () => fetchRestockData();
    window.addEventListener('supplysync:refresh', onRefresh);
    return () => window.removeEventListener('supplysync:refresh', onRefresh);
  }, [fetchRestockData]);

  // Calculations
  const calculations = useMemo(() => {
    let totalDus = 0;
    let totalCbm = 0;
    let totalKg = 0;
    let subtotalValue = 0;

    skuItems.forEach((item) => {
      const dus = Number(item.inputDus) || 0;
      totalDus += dus;
      totalCbm += dus * item.cbmPerDus;
      totalKg += dus * item.kgPerDus;
      subtotalValue += dus * item.unitPrice;
    });

    const discount = Math.round(subtotalValue * 0.02);
    const ppn = Math.round((subtotalValue - discount) * 0.11);
    const grandTotal = subtotalValue - discount + ppn;

    // Wingbox capacity = 65 CBM or 18,000 KG
    const cbmPercentage = Math.min(100, Math.round((totalCbm / 65) * 100));
    const kgPercentage = Math.min(100, Math.round((totalKg / 18000) * 100));
    const ftlPercentage = Math.max(cbmPercentage, kgPercentage);

    return {
      totalDus,
      totalCbm: totalCbm.toFixed(1),
      totalKg: Math.round(totalKg),
      subtotalValue,
      discount,
      ppn,
      grandTotal,
      ftlPercentage,
    };
  }, [skuItems]);

  const handleQuantityChange = (id, newQuantity) => {
    const qty = Math.max(0, parseInt(newQuantity) || 0);
    setSkuItems((prev) => prev.map((item) => (item.id === id ? { ...item, inputDus: qty } : item)));
  };

  const handleApplyAiRecommendation = () => {
    setSkuItems((prev) =>
      prev.map((item) => ({
        ...item,
        inputDus: item.aiSuggested,
      }))
    );
  };

  const handleSubmitPo = async (e) => {
    e.preventDefault();
    const selectedItems = skuItems.filter((i) => Number(i.inputDus) > 0);
    if (selectedItems.length === 0) {
      alert('Mohon masukkan kuantitas dus yang ingin diajukan.');
      return;
    }

    setIsSubmitting(true);
    setSubmittedPo(null);
    try {
      const po = await api.batchApprovePo({
        depotName: 'CV Surya Krian Logistik',
        targetPlant,
        priority,
        applyToStock: applyImmediately,
        notes,
        items: selectedItems.map((i) => ({
          productId: i.productId,
          sku: i.skuCode,
          quantityCartons: Number(i.inputDus),
        })),
      });

      setSubmittedPo(po);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
      await fetchRestockData();
    } catch (err) {
      alert(err.message || 'Gagal mengajukan Purchase Order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const topSku = skuItems[0];

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Context & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider mb-1">
            <Truck className="h-4 w-4" />
            <span>Modul Alokasi Pabrik • Terhubung ke Supabase &amp; SAP S/4HANA</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
            Pengajuan Restock Mandiri &amp; Rekomendasi Alokasi Pabrik
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Sinkronisasi kuota replenishment langsung ke Mayora Manufacturing Plant Pasuruan &amp; Driyorejo.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={() => {
              const el = document.getElementById('history-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold hover:bg-surface-container-high shadow-xs border border-outline/10 transition-colors"
          >
            <History className="h-3.5 w-3.5" />
            <span>Riwayat PO ({poHistory.length})</span>
          </button>
          <Button
            onClick={fetchRestockData}
            variant="outline"
            size="sm"
            className="h-8 px-2.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Smart Pre-Filled Recommendation Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-surface-container-lowest via-surface-container-low to-surface-container-lowest p-5 shadow-sm border border-outline/10">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center shrink-0 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-primary text-white text-[11px] uppercase tracking-wider font-bold">
                  Rekomendasi AI Terdeteksi (Live DB)
                </span>
                <span className="font-mono text-xs text-tertiary font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Service Level 95% (Z=1.65)
                </span>
              </div>
              <h2 className="text-base font-bold text-on-surface">
                {topSku
                  ? `${topSku.name} (${topSku.aiSuggested} Dus) direkomendasikan segera diajukan.`
                  : 'Rekomendasi alokasi SKU prioritas siap diajukan.'}
              </h2>
              <p className="text-xs text-on-surface-variant max-w-3xl">
                {topSku
                  ? `Stok fisik di Gudang Krian saat ini hanya tersisa ${topSku.stockReal} dus dengan laju konsumsi rata-rata ${topSku.avgDailySales} dus/hari.`
                  : 'Kalkulasi dinamis berdasarkan saldo stok aktual di Supabase.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
            <Button
              onClick={handleApplyAiRecommendation}
              className="bg-primary text-white text-xs font-semibold px-4 py-2 hover:bg-primary-container shadow-xs flex items-center gap-1.5"
            >
              <PackageCheck className="h-4 w-4" />
              <span>Terapkan Semua Saran AI</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Form Area: 8 cols Form + 4 cols Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Distributor Info & Target Plant */}
          <Card className="border border-outline/10 shadow-xs">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-outline/10 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-bold text-sm text-on-surface">Entitas Pemohon &amp; Validasi Finansial</span>
                </div>
                <Badge variant="surface" className="text-[10px] font-mono">MITRA-SDA-KRN-01</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline/10">
                  <div className="text-[11px] text-on-surface-variant font-medium">Distributor Mitra</div>
                  <div className="text-xs font-bold text-on-surface mt-0.5">CV Surya Krian Logistik</div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">Krian, Sidoarjo Barat</div>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline/10">
                  <div className="text-[11px] text-on-surface-variant font-medium">Plafon Kredit Mitra</div>
                  <div className="text-xs font-bold text-emerald-700 mt-0.5">Rp 500.000.000</div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">Sisa Aktif: Rp 420.000.000</div>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline/10">
                  <div className="text-[11px] text-on-surface-variant font-medium">Plant Induk Pasokan</div>
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setTargetPlant('pasuruan')}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                        targetPlant === 'pasuruan'
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      Pasuruan DC
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetPlant('driyorejo')}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                        targetPlant === 'driyorejo'
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      Driyorejo
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Multi-item SKU Input Table */}
          <Card className="border border-outline/10 shadow-xs overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-primary" />
                  <span className="font-bold text-sm text-on-surface">Katalog &amp; Alokasi Kuantitas Produk (Data Live Supabase)</span>
                </div>
                <span className="text-[11px] text-on-surface-variant">Satuan: <strong>Karton (Dus)</strong></span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline/10">
                      <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">Produk SKU</th>
                      <th className="py-2.5 px-2 font-semibold uppercase tracking-wider text-right">Stok Riil DB</th>
                      <th className="py-2.5 px-2 font-semibold uppercase tracking-wider text-right">Avg Laju/Hr</th>
                      <th className="py-2.5 px-2 font-semibold uppercase tracking-wider text-right">Saran AI</th>
                      <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-center w-36">Input Dus</th>
                      <th className="py-2.5 px-2 font-semibold uppercase tracking-wider text-right">Est. CBM</th>
                      <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline/10 font-medium">
                    {skuItems.map((sku, idx) => {
                      const itemSubtotal = (sku.inputDus || 0) * sku.unitPrice;
                      const itemCbm = ((sku.inputDus || 0) * sku.cbmPerDus).toFixed(2);
                      const isLow = sku.stockReal < 150;

                      return (
                        <tr key={sku.id} className={`hover:bg-surface-container-low transition-colors ${idx === 0 ? 'bg-amber-50/40' : ''}`}>
                          <td className="py-3 px-3">
                            <div className="font-bold text-on-surface">{sku.name}</div>
                            <div className="text-[10px] text-on-surface-variant font-mono">
                              {sku.skuCode} • {sku.category}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right font-mono">
                            <span className={isLow ? 'text-error font-bold' : 'text-on-surface'}>
                              {sku.stockReal}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-on-surface-variant">{sku.avgDailySales}</td>
                          <td className="py-3 px-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(sku.id, sku.aiSuggested)}
                              className="font-mono text-tertiary font-bold hover:underline bg-amber-50 px-1.5 py-0.5 rounded text-[11px]"
                              title="Klik untuk menerapkan saran AI"
                            >
                              +{sku.aiSuggested}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(sku.id, Math.max(0, sku.inputDus - 50))}
                                className="w-6 h-6 rounded bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                step="10"
                                value={sku.inputDus}
                                onChange={(e) => handleQuantityChange(sku.id, e.target.value)}
                                className="w-16 h-7 text-center font-bold text-xs bg-surface-container-lowest border border-outline/20 rounded focus:outline-none focus:border-primary"
                              />
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(sku.id, sku.inputDus + 50)}
                                className="w-6 h-6 rounded bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-on-surface-variant">{itemCbm}</td>
                          <td className="py-3 px-3 text-right font-bold font-mono text-on-surface">{formatRupiah(itemSubtotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Priority */}
          <Card className="border border-outline/10 shadow-xs">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-on-surface">Preferensi Logistik &amp; Mode Penerimaan Stok</span>
                <label className="flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyImmediately}
                    onChange={(e) => setApplyImmediately(e.target.checked)}
                    className="accent-primary h-4 w-4"
                  />
                  <span>Langsung Tambahkan ke Stok Gudang Saat Ini</span>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div
                  onClick={() => setPriority('regular')}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    priority === 'regular' ? 'border-primary bg-primary/5 shadow-xs' : 'border-outline/15 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="font-bold text-xs">Standard Cycle (48 Jam)</div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">Jadwal rutin mingguan pabrik</div>
                </div>
                <div
                  onClick={() => setPriority('express')}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    priority === 'express' ? 'border-primary bg-primary/5 shadow-xs' : 'border-outline/15 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="font-bold text-xs text-primary flex items-center gap-1">
                    <span>Expedited GTNIC (24 Jam)</span>
                    <Badge variant="tertiary" className="text-[8px] py-0 px-1">Prioritas</Badge>
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">Pengiriman esok subuh langsung</div>
                </div>
                <div
                  onClick={() => setPriority('urgent')}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    priority === 'urgent' ? 'border-primary bg-primary/5 shadow-xs' : 'border-outline/15 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="font-bold text-xs text-secondary">Weekend Buffer (12 Jam)</div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">Penyelamatan stockout kritis</div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Catatan Operasional Dispatch Pabrik:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-surface-container-low border border-outline/20 focus:outline-none focus:border-primary"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Action Panel: 4 cols */}
        <div className="lg:col-span-4 space-y-5">
          {/* FTL Utilization Widget */}
          <Card className="border border-outline/10 shadow-xs bg-surface-container-lowest">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-primary" />
                  Pemanfaatan Armada Wingbox (FTL)
                </span>
                <span className={`font-mono text-xs font-bold ${calculations.ftlPercentage >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {calculations.ftlPercentage}% Terisi
                </span>
              </div>

              <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${calculations.ftlPercentage >= 80 ? 'bg-emerald-600' : 'bg-primary'}`}
                  style={{ width: `${Math.min(100, calculations.ftlPercentage)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-surface-container-low rounded-lg">
                  <div className="text-[10px] text-on-surface-variant">Total Dus</div>
                  <div className="font-bold font-mono mt-0.5 text-on-surface">{calculations.totalDus}</div>
                </div>
                <div className="p-2 bg-surface-container-low rounded-lg">
                  <div className="text-[10px] text-on-surface-variant">Volume CBM</div>
                  <div className="font-bold font-mono mt-0.5 text-on-surface">{calculations.totalCbm} m³</div>
                </div>
                <div className="p-2 bg-surface-container-low rounded-lg">
                  <div className="text-[10px] text-on-surface-variant">Berat Bersih</div>
                  <div className="font-bold font-mono mt-0.5 text-on-surface">{(calculations.totalKg / 1000).toFixed(1)} Ton</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary & Submission */}
          <Card className="border border-outline/10 shadow-xs bg-surface-container-lowest">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-outline/10 pb-2.5">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="font-bold text-xs text-on-surface">Ringkasan Nilai PO &amp; Otorisasi</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal Produk:</span>
                  <span className="font-mono font-semibold">{formatRupiah(calculations.subtotalValue)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Diskon Kontrak Distributor (2%):</span>
                  <span className="font-mono font-semibold">-{formatRupiah(calculations.discount)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>PPN 11% (Faktur Resmi):</span>
                  <span className="font-mono font-semibold">{formatRupiah(calculations.ppn)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Biaya Pengiriman Pabrik:</span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    {calculations.ftlPercentage >= 80 ? 'GRATIS (Kontrak FTL)' : 'Sesuai Tarif Reguler'}
                  </span>
                </div>
                <div className="border-t border-outline/10 pt-2 flex justify-between items-baseline font-bold">
                  <span className="text-on-surface">Grand Total PO:</span>
                  <span className="text-base text-primary font-mono">{formatRupiah(calculations.grandTotal)}</span>
                </div>
              </div>

              {submittedPo && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>PO {submittedPo.poNumber} Tercatat di Supabase!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Surat Jalan: <strong>{submittedPo.doNumber}</strong> ({submittedPo.totalCartons} Dus).
                    {applyImmediately
                      ? ' Stok gudang telah langsung diperbarui.'
                      : ' Anda dapat melacak dan mengonfirmasi BAST di menu Tracking & Dispatch.'}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => setCurrentScreen && setCurrentScreen('order-tracking')}
                      size="sm"
                      className="flex-1 bg-emerald-700 text-white text-xs"
                    >
                      Lacak {submittedPo.doNumber}
                    </Button>
                    <Button
                      onClick={() => setSubmittedPo(null)}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      Tutup
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSubmitPo}
                disabled={isSubmitting || calculations.totalDus === 0}
                className="w-full bg-primary text-white text-xs font-bold py-2.5 hover:bg-primary-container shadow-xs flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Menyimpan PO ke Database...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Kirim Pengajuan Restock ke Mayora HQ</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Riwayat Permintaan Restock Sebelumnya (Live from AuditLog) */}
      <div id="history-section" className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-on-surface">Riwayat Status Pengajuan PO Restock (Database AuditLog)</h3>
          </div>
          <span className="text-xs text-on-surface-variant font-mono">Total {poHistory.length} PO Tercatat</span>
        </div>

        <Card className="border border-outline/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline/10">
                  <th className="py-2.5 px-4 font-semibold">Nomor PO / Surat Jalan</th>
                  <th className="py-2.5 px-3 font-semibold">Tanggal</th>
                  <th className="py-2.5 px-3 font-semibold">Plant Pasokan</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Total Kuantitas</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Nilai Transaksi</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status Pemrosesan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10 font-medium">
                {poHistory.map((po, i) => (
                  <tr key={`${po.id}-${i}`} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-primary">{po.id}</div>
                      <div className="text-[10px] text-on-surface-variant">DO: {po.doNumber}</div>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant">{po.date}</td>
                    <td className="py-3 px-3 text-on-surface">{po.plant}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold">{po.totalDus} Dus</td>
                    <td className="py-3 px-3 text-right font-mono">{formatRupiah(po.totalValue)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${po.statusColor}`}>
                        {po.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
