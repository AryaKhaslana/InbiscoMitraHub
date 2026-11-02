import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Bolt, 
  CheckSquare, 
  TrendingUp, 
  RotateCcw, 
  CheckCircle2, 
  Store, 
  Calendar, 
  Clock, 
  Send,
  Boxes,
  Layers,
  ArrowRight
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';
import confetti from 'canvas-confetti';

const SKU_OPTIONS = [
  { id: 'ROMA_300', code: 'MYR-BISC-002', name: 'Roma Kelapa 300g (Karton / 24 Pack)', price: 182000, currentStock: 480 },
  { id: 'BENGBENG_20', code: 'MYR-WAF-014', name: 'Beng-Beng Regular 20g (Karton / 12 Box x 17 Pcs)', price: 215000, currentStock: 920 },
  { id: 'TORA_25', code: 'MYR-BEV-033', name: 'Torabika Duo 25g (Karton / 10 Renceng x 12 Sachet)', price: 148500, currentStock: 1250 },
  { id: 'LEMIN_600', code: 'MYR-WAT-008', name: 'Le Minerale 600ml (Karton / 24 Botol)', price: 48000, currentStock: 840 },
  { id: 'KOPIKO_CND', code: 'MYR-CND-001', name: 'Kopiko Candy Pocket (Karton / 24 Pack)', price: 95000, currentStock: 600 },
];

export default function DailySalesInput({ setCurrentScreen }) {
  const [selectedSkuId, setSelectedSkuId] = useState('ROMA_300');
  const [transDate, setTransDate] = useState('2026-06-17');
  const [salesChannel, setSalesChannel] = useState('Grosir Tradisional');
  const [quantity, setQuantity] = useState(25);
  const [storeName, setStoreName] = useState('Toko Rejeki Makmur Krian');
  const [salesPerson, setSalesPerson] = useState('Bambang Sudiro');
  const [notes, setNotes] = useState('Faktur Toko #TRM-9812. Pembayaran Tempo 14 Hari.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const selectedProduct = SKU_OPTIONS.find(s => s.id === selectedSkuId) || SKU_OPTIONS[0];

  const subtotal = quantity * selectedProduct.price;
  const ppn = subtotal * 0.11;
  const grandTotal = subtotal + ppn;
  const remainingStock = Math.max(0, selectedProduct.currentStock - quantity);
  const stockDepletionPercent = Math.min(100, Math.round((quantity / selectedProduct.currentStock) * 100));

  const [auditLogs, setAuditLogs] = useState([
    { id: 'LOG-081', time: '14:22 WIB', store: 'Toko Rejeki Makmur', channel: 'Grosir Tradisional', sku: 'Roma Kelapa 300g', qty: 40, total: 7280000, status: 'SYNCED' },
    { id: 'LOG-080', time: '13:05 WIB', store: 'Warung Bu Siti', channel: 'Warung Ritel', sku: 'Beng-Beng 20g', qty: 25, total: 5375000, status: 'SYNCED' },
    { id: 'LOG-079', time: '11:40 WIB', store: 'Grosir Berkah Abadi', channel: 'Grosir Tradisional', sku: 'Torabika Duo 25g', qty: 50, total: 7425000, status: 'SYNCED' },
    { id: 'LOG-078', time: '09:15 WIB', store: 'Minimarket Mitra', channel: 'Minimarket Lokal', sku: 'Le Minerale 600ml', qty: 60, total: 2880000, status: 'SYNCED' },
  ]);

  const handleAddQty = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg(true);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

      const newLog = {
        id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
        time: 'Baru saja',
        store: storeName || 'Toko Retail',
        channel: salesChannel,
        sku: selectedProduct.name.split('(')[0].trim(),
        qty: quantity,
        total: grandTotal,
        status: 'SYNCED'
      };

      setAuditLogs([newLog, ...auditLogs]);
      setTimeout(() => setSuccessMsg(false), 4000);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider mb-1">
            <CheckSquare className="h-4 w-4" />
            <span>Depo Krian • Sinking Stok Real-Time Otomatis</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
            Input Penjualan Harian (DSR)
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Setiap transaksi retail langsung mengurangi saldo inventori gudang Krian dan memicu update laju konsumsi ADS ke HQ.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge variant="surface" className="text-xs font-mono">DSR Shift Siang</Badge>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SAP Synced: 2 mnt lalu</span>
          </div>
        </div>
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
                    <h2 className="text-base font-bold text-on-surface">Formulir Log Transaksi SKU</h2>
                    <p className="text-xs text-on-surface-variant">Lengkapi kuantitas karton keluar per sub-saluran retail</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container px-2.5 py-1 rounded">
                  Shift Siang • Batch #KRN-2026-081
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* SKU Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                    <span>Pilih SKU Produk Mayora <span className="text-primary">*</span></span>
                    <span className="text-[10px] text-primary uppercase font-bold">Resmi Terdaftar</span>
                  </label>
                  <select
                    value={selectedSkuId}
                    onChange={(e) => setSelectedSkuId(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-surface-container-low border border-outline/20 rounded-lg focus:outline-none focus:border-primary font-medium"
                  >
                    {SKU_OPTIONS.map((sku) => (
                      <option key={sku.id} value={sku.id}>
                        {sku.name} — Stok: {sku.currentStock} Dus
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
                      <option value="Institusi & Katering">Institusi &amp; Katering</option>
                    </select>
                  </div>
                </div>

                {/* Quantity Input + Steppers */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-on-surface">Kuantitas Terjual (Dus/Karton)</label>
                    <span className="text-[11px] text-on-surface-variant">Stok Gudang: <strong>{selectedProduct.currentStock} Dus</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct.currentStock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-32 h-11 text-center font-bold text-base bg-surface-container-low border border-outline/20 rounded-lg focus:outline-none focus:border-primary"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddQty(10)}
                        className="px-3 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-bold transition-colors"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQty(25)}
                        className="px-3 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-bold transition-colors"
                      >
                        +25
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQty(50)}
                        className="px-3 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-bold transition-colors"
                      >
                        +50
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQty(100)}
                        className="px-3 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-bold transition-colors"
                      >
                        +100
                      </button>
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
                  <label className="text-xs font-bold text-on-surface">Keterangan / Faktur</label>
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
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white text-xs font-bold px-6 py-2.5 hover:bg-primary-container shadow-xs flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmitting ? 'Menyinkronkan...' : 'Simpan & Sinkronkan Stok Fisik'}</span>
                  </Button>
                </div>

                {successMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Transaksi berhasil dicatat! Stok gudang Krian otomatis dipotong {quantity} dus.</span>
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
                  <span>Harga Satuan/Dus:</span>
                  <span className="font-mono font-semibold">{formatRupiah(selectedProduct.price)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Kuantitas:</span>
                  <span className="font-mono font-semibold">{quantity} Dus</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal Nilai:</span>
                  <span className="font-mono font-semibold">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>PPN 11%:</span>
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
                  <span className="text-on-surface-variant">Sisa Stok Fisik:</span>
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
                    <span className="text-error font-semibold flex items-center gap-1">
                      ⚠️ Sisa stok menipis! Pertimbangkan restock segera.
                    </span>
                  ) : (
                    <span>Stok masih dalam batas aman operasional.</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mini 7-Day Trend Chart Card */}
          <Card className="border border-outline/10 shadow-xs bg-surface-container-lowest">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-on-surface">Laju Penjualan 7 Hari Terakhir</h3>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">+18.4% WoW</span>
              </div>

              {/* Mini SVG Trend Line */}
              <div className="h-28 w-full flex items-end justify-between gap-2 pt-2 px-1">
                {[
                  { day: 'Sen', val: 140, h: '60%' },
                  { day: 'Sel', val: 155, h: '68%' },
                  { day: 'Rab', val: 130, h: '55%' },
                  { day: 'Kam', val: 165, h: '75%' },
                  { day: 'Jum', val: 190, h: '88%' },
                  { day: 'Sab', val: 210, h: '98%' },
                  { day: 'Min', val: 175, h: '80%' },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-surface-container rounded-t flex items-end justify-center h-20">
                      <div
                        className="w-full bg-primary/80 hover:bg-primary transition-all rounded-t"
                        style={{ height: bar.h }}
                        title={`${bar.day}: ${bar.val} Dus`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-on-surface-variant">{bar.day}</span>
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-on-surface-variant text-center pt-1 border-t border-outline/10">
                Puncak konsumsi terjadi pada Jumat - Sabtu menjelang akhir pekan.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Real-time Audit Log Table: Riwayat Penjualan Terbaru Hari Ini */}
      <Card className="border border-outline/10 shadow-xs">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-outline/10 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-on-surface">Riwayat Penjualan Terbaru Hari Ini</h3>
            </div>
            <span className="text-xs text-on-surface-variant font-mono">Tersinkron dengan Cloud Database</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline/10">
                  <th className="py-2.5 px-4 font-semibold">Waktu / Log ID</th>
                  <th className="py-2.5 px-3 font-semibold">Outlet / Toko</th>
                  <th className="py-2.5 px-3 font-semibold">Channel</th>
                  <th className="py-2.5 px-3 font-semibold">SKU Produk</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Kuantitas</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Total Nilai</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10 font-medium">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-on-surface">
                      <div>{log.time}</div>
                      <div className="text-[10px] text-on-surface-variant">{log.id}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-on-surface">{log.store}</td>
                    <td className="py-3 px-3 text-on-surface-variant">{log.channel}</td>
                    <td className="py-3 px-3 text-on-surface">{log.sku}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold">{log.qty} Dus</td>
                    <td className="py-3 px-3 text-right font-mono">{formatRupiah(log.total)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>{log.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
