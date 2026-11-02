import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { api } from '../../services/api';
import { 
  Sparkles, 
  Brain, 
  Truck, 
  CheckCircle2, 
  Sliders, 
  AlertTriangle, 
  FileSpreadsheet, 
  Check, 
  ShieldCheck,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';
import confetti from 'canvas-confetti';

export default function SmartRecommendations({ setCurrentScreen }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customQuantities, setCustomQuantities] = useState({});
  const [approvedMap, setApprovedMap] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [batchApproving, setBatchApproving] = useState(false);
  const [lastBatchReceipt, setLastBatchReceipt] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getRestockRecommendations();
      setData(res);
      if (Array.isArray(res?.recommendations)) {
        const initialQty = {};
        for (const r of res.recommendations) {
          initialQty[r.productId] = r.recommendedQuantityCartons;
        }
        setCustomQuantities(initialQty);
      }
    } catch (err) {
      console.error('SmartRecommendations fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
    const onRefresh = () => fetchRecommendations();
    window.addEventListener('supplysync:refresh', onRefresh);
    return () => window.removeEventListener('supplysync:refresh', onRefresh);
  }, [fetchRecommendations]);

  const recommendations = data?.recommendations || [];
  const truckOpt = data?.truckOptimization || {};
  const finSummary = data?.financialSummary || {};

  const handleAdjustQty = (productId, delta) => {
    setCustomQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(10, (prev[productId] || 50) + delta),
    }));
  };

  const handleApproveOne = async (rec) => {
    const qty = customQuantities[rec.productId] || rec.recommendedQuantityCartons;
    setSubmittingId(rec.productId);
    try {
      const po = await api.batchApprovePo({
        depotName: 'CV Surya Krian Logistik',
        applyToStock: true,
        notes: `Otorisasi Prescriptive AI untuk ${rec.name} (${qty} dus)`,
        items: [
          {
            productId: rec.productId,
            sku: rec.sku,
            quantityCartons: qty,
          },
        ],
      });
      setApprovedMap((prev) => ({
        ...prev,
        [rec.productId]: po,
      }));
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      await fetchRecommendations();
    } catch (err) {
      alert(err.message || 'Gagal mengotorisasi PO');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleApproveAll = async () => {
    const unapproved = recommendations.filter((r) => !approvedMap[r.productId]);
    if (unapproved.length === 0) return;

    setBatchApproving(true);
    try {
      const itemsPayload = unapproved.map((r) => ({
        productId: r.productId,
        sku: r.sku,
        quantityCartons: customQuantities[r.productId] || r.recommendedQuantityCartons,
      }));

      const po = await api.batchApprovePo({
        depotName: 'CV Surya Krian Logistik',
        applyToStock: true,
        notes: `Batch Approval Prescriptive AI (${itemsPayload.length} SKU)`,
        items: itemsPayload,
      });

      const nextApproved = { ...approvedMap };
      for (const r of unapproved) {
        nextApproved[r.productId] = po;
      }
      setApprovedMap(nextApproved);
      setLastBatchReceipt(po);
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      await fetchRecommendations();
    } catch (err) {
      alert(err.message || 'Gagal mengotorisasi Batch PO');
    } finally {
      setBatchApproving(false);
    }
  };

  const handleExportLogCsv = () => {
    if (!recommendations.length) return;
    const headers = ['SKU', 'Nama Produk', 'Kategori', 'Stok Riil (Dus)', 'ADS (Dus/Hr)', 'Safety Stock', 'Rekomendasi AI (Dus)', 'Harga/Dus', 'Subtotal (IDR)', 'Urgensi'];
    const rows = recommendations.map((r) => [
      `"${r.sku}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      r.stockCartons,
      r.adsCartonsPerDay,
      r.safetyStock,
      customQuantities[r.productId] || r.recommendedQuantityCartons,
      r.unitPriceIDR,
      (customQuantities[r.productId] || r.recommendedQuantityCartons) * r.unitPriceIDR,
      `"${r.urgency}"`,
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Smart_Replenishment_Recommendations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider mb-1">
            <Brain className="h-4 w-4" />
            <span>HQ Replenishment Engine • Rekomendasi Alokasi Otomatis</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
            Prescriptive Replenishment Engine
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
            Sistem optimasi alokasi inventaris otomatis Mayora Enterprise HQ. Mengalkulasi laju penjualan dinamis (ADS), safety stock, dan utilitas kubikasi armada wingbox secara presisi berdasarkan data operasional rantai pasok.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          <Button
            onClick={handleExportLogCsv}
            variant="outline"
            className="text-xs h-9"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" />
            <span>Unduh CSV Rekomendasi</span>
          </Button>

          <Button
            onClick={handleApproveAll}
            disabled={batchApproving || recommendations.length === 0}
            className="bg-primary text-white text-xs font-bold h-9 px-4 hover:bg-primary-container shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {batchApproving
                ? 'Memproses Batch PO...'
                : 'Otorisasi Semua PO Rekomendasi'}
            </span>
          </Button>

          <Button
            onClick={fetchRecommendations}
            variant="outline"
            size="sm"
            className="h-9 px-2.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Macro Summary Banner from API */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline/10">
          <div className="text-[10px] uppercase font-bold text-on-surface-variant">Total Kuota Rekomendasi</div>
          <div className="text-xl font-extrabold font-mono text-on-surface mt-0.5">
            {truckOpt.totalCartons || 0} Dus
          </div>
          <div className="text-[10px] text-on-surface-variant mt-0.5">{recommendations.length} SKU Mayora Aktif</div>
        </div>
        <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline/10">
          <div className="text-[10px] uppercase font-bold text-on-surface-variant">Utilisasi Wingbox FTL</div>
          <div className="text-xl font-extrabold font-mono text-emerald-700 mt-0.5">
            {truckOpt.ftlUtilizationPct || 85}% ({truckOpt.totalVolumeM3 || 0} m³)
          </div>
          <div className="text-[10px] text-on-surface-variant mt-0.5">Berat: {truckOpt.totalWeightTon || 0} Ton / 18 Ton</div>
        </div>
        <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline/10">
          <div className="text-[10px] uppercase font-bold text-on-surface-variant">Total Nilai Batch PO (Net)</div>
          <div className="text-xl font-extrabold font-mono text-primary mt-0.5">
            {formatRupiah(finSummary.grandTotalIDR || 0)}
          </div>
          <div className="text-[10px] text-on-surface-variant mt-0.5">Termasuk Diskon Grosir 2% &amp; PPN 11%</div>
        </div>
        <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline/10">
          <div className="text-[10px] uppercase font-bold text-on-surface-variant">Sisa Plafon Kredit Mitra</div>
          <div className="text-xl font-extrabold font-mono text-on-surface mt-0.5">
            {formatRupiah(data?.depot?.creditLimitIDR || 420000000)}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">✓ Financial Clearance Valid</div>
        </div>
      </div>

      {lastBatchReceipt && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold">
                Batch Purchase Order {lastBatchReceipt.poNumber} (Surat Jalan: {lastBatchReceipt.doNumber}) Berhasil Diotorisasi!
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                Total {lastBatchReceipt.totalCartons} dus senilai {formatRupiah(lastBatchReceipt.grandTotalIDR)} telah disetujui dan dialokasikan ke Gudang Krian.
              </div>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setCurrentScreen && setCurrentScreen('order-tracking')}
            className="bg-emerald-700 text-white text-xs h-8"
          >
            Lacak DO {lastBatchReceipt.doNumber}
          </Button>
        </div>
      )}

      {/* Recommendation Cards */}
      <div className="space-y-5">
        {recommendations.map((rec) => {
          const qty = customQuantities[rec.productId] ?? rec.recommendedQuantityCartons;
          const itemSubtotal = qty * rec.unitPriceIDR;
          const itemCbm = Number((qty * rec.cbmPerCarton).toFixed(1));
          const ftlPct = Math.min(100, Math.round((itemCbm / 65) * 100));
          const approvedPo = approvedMap[rec.productId];

          const urgencyBadge =
            rec.urgency === 'URGENT'
              ? { label: 'Prioritas Kritis - Segera Eksekusi', color: 'bg-red-100 text-red-800 border-red-200', iconBg: 'bg-red-600' }
              : rec.urgency === 'HIGH'
              ? { label: 'Prioritas Menengah - Siklus Reguler', color: 'bg-amber-100 text-amber-800 border-amber-200', iconBg: 'bg-amber-600' }
              : { label: 'Prioritas Terjadwal', color: 'bg-blue-100 text-blue-800 border-blue-200', iconBg: 'bg-blue-600' };

          return (
            <Card key={rec.productId} className="border border-outline/10 shadow-xs overflow-hidden">
              {/* Card Header Strip */}
              <div className="bg-surface-container-low px-5 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-outline/10">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${urgencyBadge.iconBg}`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-on-surface">CV Surya Krian Logistik</h3>
                      <span className="text-xs font-mono text-on-surface-variant">#DIST-KR-01</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${urgencyBadge.color}`}>
                        {urgencyBadge.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Wilayah: Krian, Balongbendo &amp; Wonoayu, Sidoarjo • Runway Saat Ini: <strong>{rec.runwayDays} Hari</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono bg-surface-container-lowest px-2 py-1 rounded text-on-surface-variant font-bold">
                    {rec.stitchCode}
                  </span>
                  <span className="bg-primary/10 text-primary font-semibold px-2 py-1 rounded">
                    DC Pasuruan (42 km)
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <CardContent className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  {/* Left: Product & Quantity Adjuster (4 cols) */}
                  <div className="lg:col-span-4 space-y-2">
                    <div className="text-[10px] text-primary uppercase font-bold tracking-wider">{rec.category}</div>
                    <h4 className="text-base font-bold text-on-surface leading-tight">{rec.name}</h4>
                    <div className="text-[11px] text-on-surface-variant font-mono">{rec.sku}</div>

                    <div className="pt-1 flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAdjustQty(rec.productId, -50)}
                          className="w-7 h-7 rounded bg-surface-container hover:bg-surface-container-high flex items-center justify-center"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xl font-extrabold text-primary font-mono px-2">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjustQty(rec.productId, 50)}
                          className="w-7 h-7 rounded bg-surface-container hover:bg-surface-container-high flex items-center justify-center"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-on-surface">Dus Karton</span>
                    </div>

                    <div className="text-xs font-bold text-on-surface-variant">
                      Subtotal PO: <span className="font-mono text-on-surface">{formatRupiah(itemSubtotal)}</span>
                    </div>
                  </div>

                  {/* Center: Explainable AI Logic & Metrics (5 cols) */}
                  <div className="lg:col-span-5 p-3.5 bg-surface-container-low rounded-xl border border-outline/10 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-on-surface flex items-center gap-1.5">
                        <Brain className="h-3.5 w-3.5 text-primary" />
                        Kalkulasi Explainable AI ({rec.safetyStockFormula})
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-1.5 bg-surface-container-lowest rounded">
                        <div className="text-[9px] text-on-surface-variant">Laju (ADS)</div>
                        <div className="font-bold font-mono text-[11px] mt-0.5">{rec.adsCartonsPerDay} Dus</div>
                      </div>
                      <div className="p-1.5 bg-surface-container-lowest rounded">
                        <div className="text-[9px] text-on-surface-variant">Target Cover</div>
                        <div className="font-bold font-mono text-[11px] mt-0.5">7 Hari</div>
                      </div>
                      <div className="p-1.5 bg-surface-container-lowest rounded">
                        <div className="text-[9px] text-on-surface-variant">Buffer SS</div>
                        <div className="font-bold font-mono text-[11px] mt-0.5 text-emerald-700">+{rec.safetyStock}</div>
                      </div>
                      <div className="p-1.5 bg-surface-container-lowest rounded">
                        <div className="text-[9px] text-on-surface-variant">Stok Riil DB</div>
                        <div className="font-bold font-mono text-[11px] mt-0.5 text-error">{rec.stockCartons}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-on-surface-variant flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          <span>Kubikasi SKU: {itemCbm} m³</span>
                        </span>
                        <span className="font-mono font-bold text-on-surface">{ftlPct}% Kapasitas Wingbox</span>
                      </div>
                      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${ftlPct}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Approval Status (3 cols) */}
                  <div className="lg:col-span-3 flex flex-col items-stretch gap-2.5">
                    {approvedPo ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center space-y-1">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>PO {approvedPo.poNumber} Aktif!</span>
                        </div>
                        <p className="text-[10px] text-emerald-700">
                          Alokasi stok gudang telah diperbarui (+{qty} dus).
                        </p>
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleApproveOne(rec)}
                          disabled={submittingId === rec.productId}
                          className="w-full bg-primary text-white text-xs font-bold py-2.5 hover:bg-primary-container shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Check className="h-4 w-4" />
                          <span>
                            {submittingId === rec.productId
                              ? 'Memproses PO...'
                              : `Otorisasi PO (${qty} Dus)`}
                          </span>
                        </Button>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              sessionStorage.setItem(
                                'supplysync_sim_sku',
                                JSON.stringify({
                                  productId: rec.productId,
                                  sku: rec.sku,
                                  name: rec.name,
                                  stockOnHand: rec.stockCartons,
                                  ads: rec.adsCartonsPerDay,
                                  safetyStock: rec.safetyStock,
                                  proposedRestockQty: qty,
                                })
                              );
                              setCurrentScreen && setCurrentScreen('what-if-simulator');
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-[11px] h-8"
                          >
                            <Sliders className="h-3 w-3 mr-1" />
                            Simulasi
                          </Button>
                          <Button
                            onClick={() => setCurrentScreen && setCurrentScreen('distributor-overview')}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-[11px] h-8"
                          >
                            Cek Gudang
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Governance Note */}
      <Card className="border border-outline/10 shadow-xs bg-surface-container-low">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-on-surface">Tata Kelola Pasokan Mayora (Enterprise Governance)</div>
            <div className="text-on-surface-variant mt-0.5 leading-relaxed">
              Setiap otorisasi PO pada layar ini langsung memperbarui kuota alokasi stok gudang dan tercatat resmi pada sistem rantai pasok Mayora.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
