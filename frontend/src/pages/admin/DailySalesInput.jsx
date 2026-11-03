import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { api } from '../../services/api';
import { 
  Bolt, 
  CheckSquare, 
  TrendingUp, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Send,
  RefreshCw,
  AlertCircle,
  Eye,
  X,
  FileText
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';
import confetti from 'canvas-confetti';

export default function DailySalesInput({ setCurrentScreen }) {
  const [availableSkus, setAvailableSkus] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [summary, setSummary] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDsrRecord, setSelectedDsrRecord] = useState(null);

  const [transDate, setTransDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [salesChannel, setSalesChannel] = useState('Grosir Tradisional');
  const [quantity, setQuantity] = useState(10);
  const [storeName, setStoreName] = useState('Toko Kelontong Berkah Jaya (Krian)');
  const [salesPerson, setSalesPerson] = useState('Bambang Sudiro');
  const [notes, setNotes] = useState('Faktur Toko — Pembayaran Tempo 7 Hari');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchDsrData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getDailySales({ limit: 20 });
      const skus = res?.availableSkus || [];
      setAvailableSkus(skus);
      setSummary(res?.summary || null);
      setAuditLogs(res?.records || []);
      if (skus.length > 0) {
        setSelectedProductId((prev) => {
          const exists = prev && skus.find((s) => s.productId === prev);
          return exists ? prev : skus[0].productId;
        });
      }
    } catch (err) {
      console.error('DailySalesInput fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDsrData();
    const onRefresh = () => fetchDsrData();
    window.addEventListener('supplysync:refresh', onRefresh);
    return () => window.removeEventListener('supplysync:refresh', onRefresh);
  }, [fetchDsrData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedDsrRecord(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedProduct =
    availableSkus.find((s) => s.productId === selectedProductId) ||
    availableSkus[0] || {
      productId: '',
      sku: 'MYR-BIS-ROMAKELAPA-300',
      name: 'Roma Biskuit Kelapa 300g',
      cartonPrice: 215000,
      stockCartons: 140,
    };

  const subtotal = quantity * (selectedProduct.cartonPrice || 0);
  const ppn = Math.round(subtotal * 0.11);
  const grandTotal = subtotal + ppn;
  const remainingStock = Math.max(0, (selectedProduct.stockCartons || 0) - quantity);
  const stockDepletionPercent =
    selectedProduct.stockCartons > 0
      ? Math.min(100, Math.round((quantity / selectedProduct.stockCartons) * 100))
      : 100;

  const handleAddQty = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quantity <= 0 || !selectedProduct.productId) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessReceipt(null);
    try {
      const result = await api.submitDailySales({
        productId: selectedProduct.productId,
        sku: selectedProduct.sku,
        quantityCartons: Number(quantity),
        channel: salesChannel,
        storeName: storeName || 'Mitra Ritel Krian',
        operatorName: salesPerson || 'Bambang Sudiro',
        notes: notes || `Tanggal transaksi: ${transDate}`,
      });

      setSuccessReceipt(result);
      confetti({ particleCount: 55, spread: 60, origin: { y: 0.8 } });
      await fetchDsrData();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan transaksi penjualan DSR');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider mb-1">
            <CheckSquare className="h-4 w-4" />
            <span>Depo Krian • Pengelolaan Log Penjualan Harian</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
            Input Penjualan Harian (DSR)
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Setiap transaksi retail langsung mengurangi saldo stok gudang secara otomatis dan tercatat pada sistem logistik.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge variant="surface" className="text-xs font-mono">
            Total Terjual: {summary?.totalCartonsSold || 0} Dus
          </Badge>
          <Button
            onClick={fetchDsrData}
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>Refresh Data</span>
          </Button>
        </div>
      </div>

      {/* Panduan Cepat & Konteks DSR */}
      <div className="p-4 bg-surface-container-lowest border border-outline/10 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <CheckSquare className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-on-surface">Panduan Input Penjualan:</span>
            <span className="text-on-surface-variant ml-1">
              Catat transaksi harian per SKU dari tim sales lapangan (DSR) ke toko ritel. Setiap data yang disimpan otomatis memotong saldo stok fisik riil di Gudang Krian secara real-time.
            </span>
          </div>
        </div>
        <Badge variant="surface" className="text-[10px] shrink-0 font-mono">
          Sinkronisasi Stok Otomatis
        </Badge>
      </div>

      {/* Main Grid: 8 cols Form + 4 cols Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 8 cols */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="border border-outline/10 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-amber-500"></div>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-outline/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center">
                    <Bolt className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-on-surface">Formulir Transaksi Penjualan SKU</h2>
                    <p className="text-xs text-on-surface-variant">Potong stok fisik gudang Krian sesuai faktur keluar DSR</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* SKU Selection from Real DB */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                    <span>Pilih SKU Produk Mayora <span className="text-primary">*</span></span>
                    <span className="text-[10px] text-primary uppercase font-bold">
                      Harga: {formatRupiah(selectedProduct.cartonPrice || 0)}/Dus
                    </span>
                  </label>
                  <select
                    value={selectedProduct.productId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-surface-container-low border border-outline/20 rounded-lg focus:outline-none focus:border-primary font-semibold"
                  >
                    {availableSkus.map((sku) => (
                      <option key={sku.productId} value={sku.productId}>
                        {sku.name} — Stok Tersedia: {sku.stockCartons} Dus ({formatRupiah(sku.cartonPrice)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Channel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface">Tanggal Transaksi</label>
                    <input
                      type="date"
                      value={transDate}
                      onChange={(e) => setTransDate(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-surface-container-low border border-outline/20 rounded-lg focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface">Saluran Retail (Channel)</label>
                    <select
                      value={salesChannel}
                      onChange={(e) => setSalesChannel(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-surface-container-low border border-outline/20 rounded-lg focus:outline-none focus:border-primary font-medium"
                    >
                      <option value="Grosir Tradisional">Grosir Tradisional</option>
                      <option value="Warung Ritel">Warung / Toko Kelontong</option>
                      <option value="Minimarket Lokal">Minimarket Lokal Modern</option>
                      <option value="Warkop & Agen Kopi">Warkop &amp; Agen Kopi</option>
                    </select>
                  </div>
                </div>

                {/* Quantity Input + Steppers */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-on-surface">Kuantitas Terjual (Dus/Karton)</label>
                    <span className="text-[11px] text-on-surface-variant">
                      Stok Gudang Saat Ini: <strong className="font-mono text-primary">{selectedProduct.stockCartons} Dus</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      type="number"
                      min="1"
                      max={Math.max(1, selectedProduct.stockCartons)}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-32 h-11 text-center font-bold text-base bg-surface-container-low border border-outline/20 rounded-lg focus:outline-none focus:border-primary"
                    />
                    <div className="flex items-center gap-2">
                      {[5, 10, 25, 50].map((step) => (
                        <button
                          key={step}
                          type="button"
                          onClick={() => handleAddQty(step)}
                          className="px-3 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-bold transition-colors"
                        >
                          +{step}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Outlet Name & Salesperson */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface">Nama Toko / Outlet Tujuan</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Toko Sumber Makmur"
                      className="w-full h-10 px-3 text-xs bg-surface-container-low border border-outline/20 rounded-lg focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface">DSR Pelaksana</label>
                    <input
                      type="text"
                      value={salesPerson}
                      onChange={(e) => setSalesPerson(e.target.value)}
                      placeholder="Nama DSR"
                      className="w-full h-10 px-3 text-xs bg-surface-container-low border border-outline/20 rounded-lg focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface">Keterangan / Nomor Faktur</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-surface-container-low border border-outline/20 rounded-lg focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-3 flex items-center justify-between border-t border-outline/10">
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity(10);
                      setStoreName('');
                      setNotes('');
                      setErrorMsg(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </button>

                  <Button
                    type="submit"
                    disabled={isSubmitting || selectedProduct.stockCartons < quantity}
                    className="bg-primary text-white text-xs font-bold px-6 py-2.5 hover:bg-primary-container shadow-xs flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}</span>
                  </Button>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successReceipt && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      DSR Berhasil Direkam! Stok {successReceipt.productName?.split('(')[0]} diperbarui dari{' '}
                      {successReceipt.previousStock} dus menjadi {successReceipt.remainingStock} dus di gudang.
                    </span>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Live Analytics: 4 cols */}
        <div className="lg:col-span-4 space-y-5">
          {/* Live Calculation Card */}
          <Card className="border border-outline/10 shadow-xs bg-surface-container-lowest">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-outline/10 pb-3">
                <span className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Kalkulasi Nilai Transaksi
                </span>
                <Badge variant="surface" className="text-[10px] font-mono">DSR Realtime</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Harga per Karton:</span>
                  <span className="font-mono font-semibold">{formatRupiah(selectedProduct.cartonPrice || 0)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Kuantitas Keluar:</span>
                  <span className="font-mono font-semibold">{quantity} Dus</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal Nilai:</span>
                  <span className="font-mono font-semibold">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>PPN 11% (Estimasi):</span>
                  <span className="font-mono font-semibold">{formatRupiah(ppn)}</span>
                </div>
                <div className="border-t border-outline/10 pt-2 flex justify-between items-baseline font-bold">
                  <span className="text-on-surface">Total Nilai Tagihan:</span>
                  <span className="text-base text-primary font-mono">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              {/* Stock Impact Visualizer */}
              <div className="pt-3 border-t border-outline/10 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-on-surface-variant">Sisa Stok Setelah Input:</span>
                  <span className={`font-mono font-bold ${remainingStock < 100 ? 'text-error' : 'text-on-surface'}`}>
                    {remainingStock} Dus
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${remainingStock < 100 ? 'bg-error' : 'bg-primary'}`}
                    style={{ width: `${Math.max(5, 100 - stockDepletionPercent)}%` }}
                  />
                </div>
                <div className="text-[10px] text-on-surface-variant">
                  {remainingStock < 100 ? (
                    <span className="text-error font-semibold flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>Sisa stok di bawah 100 dus. Segera ajukan restock pasokan.</span>
                    </span>
                  ) : (
                    <span>Stok masih mencukupi untuk operasional harian.</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Total DSR Card */}
          <Card className="border border-outline/10 shadow-xs bg-surface-container-lowest">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-on-surface">Akumulasi Penjualan Tercatat</h3>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {summary?.totalTransactions || auditLogs.length} Log
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 bg-surface-container-low rounded-lg">
                  <div className="text-[10px] text-on-surface-variant">Total Dus Keluar</div>
                  <div className="text-lg font-extrabold font-mono text-on-surface mt-0.5">
                    {summary?.totalCartonsSold || 0} Dus
                  </div>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg">
                  <div className="text-[10px] text-on-surface-variant">Total Nilai DSR</div>
                  <div className="text-sm font-extrabold font-mono text-primary mt-1">
                    {formatRupiah(summary?.totalRevenueIDR || 0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Real-time Audit Log Table: Riwayat Penjualan Terbaru dari Supabase */}
      <Card className="border border-outline/10 shadow-xs">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-outline/10 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-on-surface">Riwayat Transaksi Penjualan Harian (DSR)</h3>
            </div>
            <span className="text-xs text-on-surface-variant font-mono">{auditLogs.length} Transaksi Terakhir</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline/10">
                  <th className="py-2.5 px-4 font-semibold">Waktu / DSR ID</th>
                  <th className="py-2.5 px-3 font-semibold">Outlet / Toko</th>
                  <th className="py-2.5 px-3 font-semibold">Channel &amp; DSR</th>
                  <th className="py-2.5 px-3 font-semibold">SKU Produk</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Kuantitas</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Sisa Stok</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Nilai Penjualan</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10 font-medium">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-on-surface-variant text-xs">
                      Belum ada riwayat transaksi penjualan DSR tercatat hari ini. Gunakan formulir di atas untuk mencatat penjualan perdana.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log, idx) => (
                    <tr
                      key={log.dsrId || idx}
                      onClick={() => setSelectedDsrRecord(log)}
                      className="hover:bg-surface-container-low/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono text-on-surface">
                        <div className="font-bold group-hover:text-primary transition-colors">
                          {log.recordedAt ? new Date(log.recordedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Hari ini'} WIB
                        </div>
                        <div className="text-[10px] text-on-surface-variant">{String(log.dsrId || '').slice(0, 8)}</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-on-surface">{log.storeName || 'Toko Mitra'}</td>
                      <td className="py-3 px-3 text-on-surface-variant">
                        <div>{log.channel || 'Grosir'}</div>
                        <div className="text-[10px] font-mono">Oleh: {log.operatorName || 'Bambang S.'}</div>
                      </td>
                      <td className="py-3 px-3 text-on-surface font-semibold">{(log.productName || log.sku || '').split('(')[0]}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-primary">-{log.quantityCartons} Dus</td>
                      <td className="py-3 px-3 text-right font-mono text-on-surface-variant">{log.remainingStock ?? '-'} Dus</td>
                      <td className="py-3 px-3 text-right font-mono font-bold">{formatRupiah(log.totalSalesAmount || 0)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>SYNCED</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedDsrRecord(log)}
                          className="h-7 px-2 text-[11px] gap-1 hover:bg-surface-container"
                          title="Buka Voucher Faktur DSR"
                        >
                          <Eye className="h-3 w-3 text-primary" />
                          <span>Faktur</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Voucher / Faktur Rincian Transaksi DSR */}
      {selectedDsrRecord && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDsrRecord(null);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest border border-outline/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 cursor-default"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-outline/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-on-surface">
                    Voucher Bukti Penjualan DSR
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono">
                    ID Transaksi: {selectedDsrRecord.dsrId || 'DSR-RECORD'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDsrRecord(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
                title="Tutup (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Dossier */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Toko / Outlet Tujuan:</span>
                  <strong className="text-on-surface text-right">{selectedDsrRecord.storeName || 'Toko Mitra'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Channel Retail:</span>
                  <span className="font-semibold text-on-surface">{selectedDsrRecord.channel || 'Grosir Tradisional'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">DSR Petugas:</span>
                  <span className="font-mono text-on-surface">{selectedDsrRecord.operatorName || 'Bambang Sudiro'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Waktu Pencatatan:</span>
                  <span className="font-mono text-on-surface">
                    {selectedDsrRecord.recordedAt ? new Date(selectedDsrRecord.recordedAt).toLocaleString('id-ID') : 'Hari ini'} WIB
                  </span>
                </div>
              </div>

              {/* Produk & Stok Info */}
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline/10 space-y-2">
                <div className="font-bold text-on-surface text-sm">
                  {selectedDsrRecord.productName || selectedDsrRecord.sku}
                </div>
                <div className="text-[11px] text-on-surface-variant font-mono">
                  SKU: {selectedDsrRecord.sku}
                </div>
                <div className="pt-2 border-t border-outline/10 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-on-surface-variant block">Kuantitas Terjual:</span>
                    <strong className="text-primary font-mono text-sm">-{selectedDsrRecord.quantityCartons} Dus</strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Sisa Stok Fisik:</span>
                    <strong className="text-emerald-700 font-mono text-sm">{selectedDsrRecord.remainingStock ?? '-'} Dus</strong>
                  </div>
                </div>
              </div>

              {/* Total Tagihan & Catatan */}
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline/10 space-y-1.5">
                <div className="flex justify-between text-sm font-bold">
                  <span>Total Tagihan Penjualan:</span>
                  <span className="font-mono text-primary text-base">
                    {formatRupiah(selectedDsrRecord.totalSalesAmount || 0)}
                  </span>
                </div>
                {selectedDsrRecord.notes && (
                  <div className="text-[11px] text-on-surface-variant pt-1 border-t border-outline/10">
                    Catatan Faktur: <em>{selectedDsrRecord.notes}</em>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-outline/10 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDsrRecord(null)}
                className="text-xs h-8 px-4"
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
