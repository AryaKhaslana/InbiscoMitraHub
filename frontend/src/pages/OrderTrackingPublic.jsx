import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { formatRupiah } from '../lib/utils';
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
  Search, 
  ArrowRight, 
  Printer, 
  AlertCircle,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Store,
  ChevronRight
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const STEPPER_STAGES = [
  { key: 'PENDING', step: 1, title: 'Pesanan Masuk', desc: 'PO dibuat & tersimpan di sistem' },
  { key: 'CONFIRMED', step: 2, title: 'Dikonfirmasi', desc: 'Admin depo memvalidasi stok' },
  { key: 'PACKING', step: 3, title: 'Packing Gudang', desc: 'Pengemasan batch FEFO siap muat' },
  { key: 'DISPATCHED', step: 4, title: 'Kirim Armada', desc: 'Mobil box jalan ke rute toko' },
  { key: 'COMPLETED', step: 5, title: 'Selesai (e-POD)', desc: 'Diterima toko mitra & tanda tangan' },
];

const STAGE_INDEX_MAP = {
  PENDING: 1,
  CONFIRMED: 2,
  PACKING: 3,
  DISPATCHED: 4,
  COMPLETED: 5,
};

const SAMPLE_CODES = [
  { code: 'INB-2610-KR06', store: 'Toko Makmur (Waru)', status: 'Packing' },
  { code: 'INB-2610-KR05', store: 'Minimarket Barokah (Krian)', status: 'Selesai' },
  { code: 'INB-2611-C7CHLQND', store: 'Toko Sumber Jaya (Tarik)', status: 'Pending' },
];

export default function OrderTrackingPublic({ setActiveNav, initialTrackingCode = '' }) {
  const [searchInput, setSearchInput] = useState(initialTrackingCode || '');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  // Load recent orders from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('supplysync_mitra_recent_orders');
      if (raw) {
        setRecentOrders(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const handleFetchOrder = useCallback(async (codeToFetch) => {
    const trimmed = (codeToFetch || '').trim();
    if (!trimmed) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.trackOrder(trimmed);
      const order = res.order || res;
      setOrderData(order);

      // Save to recent orders
      const newEntry = {
        code: order.trackingCode || trimmed,
        storeName: order.store?.name || order.storeName || 'Toko Mitra',
        totalAmount: order.totalAmount || 0,
        statusLabel: order.statusLabel || order.status,
        date: order.createdAt || new Date().toISOString(),
      };

      setRecentOrders((prev) => {
        const filtered = prev.filter((o) => o.code !== newEntry.code);
        const updated = [newEntry, ...filtered].slice(0, 5);
        try {
          localStorage.setItem('supplysync_mitra_recent_orders', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } catch (err) {
      setOrderData(null);
      setErrorMsg(err.message || 'Pesanan dengan kode pelacakan tersebut tidak ditemukan. Mohon periksa kembali nomor resi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialTrackingCode) {
      setSearchInput(initialTrackingCode);
      handleFetchOrder(initialTrackingCode);
    } else {
      // Check if there is a recent order stored
      try {
        const raw = localStorage.getItem('supplysync_mitra_recent_orders');
        if (raw) {
          const list = JSON.parse(raw);
          if (list.length > 0 && list[0]?.code) {
            setSearchInput(list[0].code);
            handleFetchOrder(list[0].code);
            return;
          }
        }
      } catch {}
      // Fallback to sample
      setSearchInput('INB-2610-KR06');
      handleFetchOrder('INB-2610-KR06');
    }
  }, [initialTrackingCode, handleFetchOrder]);

  const handleSubmitSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    handleFetchOrder(searchInput.trim());
  };

  const handlePrintInvoice = () => {
    if (!orderData) return;
    const trackingCode = orderData.trackingCode || orderData.id || 'INB-PO-2026';
    const currentDate = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const totalAmount = orderData.totalAmount || 0;
    const dpp = Math.round(totalAmount / 1.11);
    const ppn = totalAmount - dpp;
    const payMethod = orderData.paymentMethodLabel || orderData.paymentMethod || 'Cash on Delivery (COD Tunai)';

    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Surat Pesanan Grosir - ${trackingCode}</title>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1b1c1c; padding: 40px; margin: 0; background: #fff; line-height: 1.5; }
          .header { border-bottom: 2.5px solid #a80000; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
          .title { font-size: 20px; font-weight: 800; color: #a80000; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .subtitle { font-size: 13px; color: #524341; margin-top: 4px; font-weight: 600; }
          .address { font-size: 11px; color: #7d6b68; margin-top: 4px; }
          .badge { display: inline-block; background: #e8f5e9; color: #1b5e20; border: 1px solid #c8e6c9; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 12px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; background: #fdf8f7; padding: 16px; border-radius: 8px; border: 1px solid #f0e1df; }
          .meta-item { font-size: 12px; }
          .meta-label { color: #7d6b68; font-weight: 500; display: block; margin-bottom: 2px; }
          .meta-val { color: #1b1c1c; font-weight: 700; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12.5px; }
          th, td { border: 1px solid #e5d8d6; padding: 10px 14px; text-align: left; }
          th { background: #fbf5f4; font-weight: 700; color: #433332; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals-table { width: 50%; margin-left: auto; margin-bottom: 24px; }
          .totals-table td { padding: 8px 12px; }
          .grand-total { font-size: 15px; font-weight: 800; color: #a80000; background: #fdf8f7; }
          .footer-note { font-size: 11px; color: #7d6b68; line-height: 1.6; margin-top: 24px; border-top: 1px dashed #d5c4c2; padding-top: 14px; }
          .sign-area { display: flex; justify-content: space-between; margin-top: 36px; }
          .sign-box { text-align: center; width: 220px; }
          .sign-line { border-bottom: 1px solid #1b1c1c; margin-top: 55px; margin-bottom: 4px; }
          @media print { body { padding: 15px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">PT Inbisco Niagatama Semesta</h1>
            <div class="subtitle">Distributor Resmi Mayora Group — Cabang Krian (Sidoarjo)</div>
            <div class="address">Gudang Logistik Krian, Jl. Raya Surabaya–Mojokerto KM 32, Sidoarjo | Telp: (031) 897-2200</div>
          </div>
          <div class="badge">STATUS: ${(orderData.statusLabel || orderData.status || 'TERCATAT').toUpperCase()}</div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">NOMOR RESI / TRACKING:</span>
            <span class="meta-val">${trackingCode}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">TANGGAL CETAK:</span>
            <span class="meta-val">${currentDate}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">TOKO PEMESAN (MITRA):</span>
            <span class="meta-val">${orderData.store?.name || orderData.storeName || 'Toko Mitra Sidoarjo'} (${orderData.store?.district || 'Sidoarjo'})</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">METODE PEMBAYARAN:</span>
            <span class="meta-val">${payMethod}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="text-center" style="width: 45px;">No.</th>
              <th>Deskripsi Produk FMCG</th>
              <th class="text-center" style="width: 100px;">Jumlah Dus</th>
              <th class="text-right" style="width: 130px;">Harga Satuan</th>
              <th class="text-right" style="width: 140px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${(orderData.items || []).map((it, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td><strong>${it.product?.name || it.name || 'Produk Mayora'}</strong><br><span style="font-size: 11px; color: #7d6b68;">SKU: ${it.product?.sku || it.sku || '-'}</span></td>
                <td class="text-center font-bold">${it.quantity} Karton</td>
                <td class="text-right">Rp ${Number(it.unitPrice || 0).toLocaleString('id-ID')}</td>
                <td class="text-right"><strong>Rp ${Number(it.subtotal || 0).toLocaleString('id-ID')}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td>Dasar Pengenaan Pajak (DPP):</td>
            <td class="text-right">Rp ${dpp.toLocaleString('id-ID')}</td>
          </tr>
          <tr>
            <td>PPN 11%:</td>
            <td class="text-right">Rp ${ppn.toLocaleString('id-ID')}</td>
          </tr>
          <tr class="grand-total">
            <td><strong>TOTAL TAGIHAN PO:</strong></td>
            <td class="text-right"><strong>Rp ${totalAmount.toLocaleString('id-ID')}</strong></td>
          </tr>
        </table>

        <div class="footer-note">
          <strong>Catatan Serah Terima Logistik:</strong><br>
          1. Periksa keutuhan karton, segel plastik pabrik, serta nomor batch sebelum armada meninggalkan lokasi toko Anda.<br>
          2. Pembayaran tunai (COD) hanya diserahkan kepada kurir resmi bertanda pengenal Inbisco atau via transfer rekening resmi PT Inbisco Niagatama Semesta.<br>
          3. Dokumen elektronik ini sah dan terhubung langsung ke telemetri armada Depo Krian (Sidoarjo).
        </div>

        <div class="sign-area">
          <div class="sign-box">
            <div>Penerima (Toko Mitra),</div>
            <div class="sign-line"></div>
            <div>Cap Toko &amp; Tanda Tangan</div>
          </div>
          <div class="sign-box">
            <div>Kurir / Driver Pengantar,</div>
            <div class="sign-line"></div>
            <div>Bambang Triyono (Depo Krian)</div>
          </div>
          <div class="sign-box">
            <div>Admin Dispatch Hub Krian,</div>
            <div class="sign-line"></div>
            <div>PT Inbisco Niagatama Semesta</div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 400);
  };

  const currentStageIndex = STAGE_INDEX_MAP[(orderData?.status || '').toUpperCase()] || 1;

  return (
    <div className="w-full bg-surface pb-20">
      {/* ========================================================= */}
      {/* SECTION 0: HERO & BREADCRUMB                              */}
      {/* ========================================================= */}
      <section className="bg-surface-container-low border-b border-surface-container-high py-10 md:py-14">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <nav className="flex items-center gap-2 text-xs text-outline mb-4">
            <button
              onClick={() => setActiveNav && setActiveNav('home')}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Beranda
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-surface-dim" />
            <span className="text-on-surface font-semibold">Portal Pelacakan Pesanan Mitra</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                Jaringan Distribusi FMCG Mayora • Cabang Krian Sidoarjo
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-on-surface tracking-tight">
                Status Pesanan &amp; Pelacakan Pengiriman Mitra Toko
              </h1>
              <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
                Pantau proses pemenuhan pesanan grosir toko Anda secara transparan dari konfirmasi admin depo, proses packing gudang berbasis FEFO, pergerakan armada kurir, hingga tanda terima digital (e-POD).
              </p>
            </div>

            <div className="lg:col-span-4 bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
                <Truck className="h-4 w-4 text-primary" />
                <span>Cakupan Pengantaran Langsung:</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Armada distribusi rutin melayani 18 kecamatan di Kabupaten Sidoarjo setiap hari kerja dengan jaminan produk asli pabrik Mayora.
              </p>
              <div className="pt-2 border-t border-surface-container-high flex items-center justify-between text-[11px] font-mono text-outline">
                <span>Waktu Operasional:</span>
                <span className="font-bold text-on-surface">07.30 - 16.30 WIB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 1: SEARCH LOOKUP & PRESET SAMPLES                 */}
      {/* ========================================================= */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 -mt-6">
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-5 sm:p-6 shadow-md space-y-4">
          <form onSubmit={handleSubmitSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                placeholder="Masukkan Nomor Resi / Tracking Code (contoh: INB-2610-KR06)..."
                className="pl-10 h-11 text-xs sm:text-sm font-mono uppercase bg-surface-container-low border-surface-container-high"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !searchInput.trim()}
              className="h-11 px-6 bg-primary-container hover:bg-secondary-container text-white text-xs sm:text-sm font-bold gap-2 shadow-xs shrink-0 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Mencari...' : 'Lacak Status Pesanan'}</span>
            </Button>
          </form>

          {/* Quick Demo Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-on-surface-variant font-semibold flex items-center gap-1.5 text-[11px]">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Contoh Resi untuk Pengujian:
            </span>
            {SAMPLE_CODES.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => {
                  setSearchInput(s.code);
                  handleFetchOrder(s.code);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 border ${
                  orderData?.trackingCode === s.code
                    ? 'bg-primary-container text-white border-primary-container font-bold shadow-2xs'
                    : 'bg-surface-container-low hover:bg-surface-container border-surface-container-high text-on-surface'
                }`}
              >
                <span className="font-bold">{s.code}</span>
                <span className="text-[10px] opacity-80 font-sans">({s.status})</span>
              </button>
            ))}
          </div>

          {/* Recent Orders of This Browser / Mitra */}
          {recentOrders.length > 0 && (
            <div className="pt-3 border-t border-surface-container-high">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
                  Riwayat Pesanan di Perangkat Ini:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('supplysync_mitra_recent_orders');
                    setRecentOrders([]);
                  }}
                  className="text-[10px] text-outline hover:text-primary transition-colors cursor-pointer"
                >
                  Bersihkan Riwayat
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentOrders.map((rec) => (
                  <button
                    key={rec.code}
                    type="button"
                    onClick={() => {
                      setSearchInput(rec.code);
                      handleFetchOrder(rec.code);
                    }}
                    className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center gap-2.5 ${
                      orderData?.trackingCode === rec.code
                        ? 'bg-primary/5 border-primary text-primary font-bold shadow-2xs'
                        : 'bg-surface-container-low hover:bg-surface-container border-surface-container-high text-on-surface'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                      <Store className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="font-mono font-bold leading-tight">{rec.code}</div>
                      <div className="text-[10px] text-on-surface-variant">{rec.storeName}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: LIVE ORDER DOSSIER & STATUS MACHINE            */}
      {/* ========================================================= */}
      {orderData && (
        <section className="max-w-[1280px] mx-auto px-4 md:px-8 mt-8 space-y-6 animate-in fade-in duration-200">
          {/* Main Status Dossier Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-6 md:p-8 shadow-xs space-y-6">
            {/* Top Bar: Resi, Toko, Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-surface-container-high">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black font-mono text-on-surface">
                      {orderData.trackingCode || orderData.id}
                    </h2>
                    <Badge
                      variant={
                        (orderData.status || '').toUpperCase() === 'COMPLETED'
                          ? 'surface'
                          : 'tertiary'
                      }
                      className="font-bold text-xs uppercase"
                    >
                      {orderData.statusLabel || orderData.status || 'TERCATAT'}
                    </Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Toko Mitra: <strong>{orderData.store?.name || orderData.storeName || 'Toko Mitra Sidoarjo'}</strong> • Kecamatan:{' '}
                    <strong>{orderData.store?.district || 'Sidoarjo'}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
                <Button
                  onClick={() => handleFetchOrder(orderData.trackingCode || orderData.id)}
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 gap-1.5 cursor-pointer"
                  title="Periksa pembaharuan status dari depo"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
                  <span>Refresh Status</span>
                </Button>
                <Button
                  onClick={handlePrintInvoice}
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 gap-1.5 cursor-pointer text-primary border-primary/20 hover:bg-primary/5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Cetak Surat Jalan (PDF)</span>
                </Button>
              </div>
            </div>

            {/* Visual 5-Stage Stepper */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                <span>Alur Pemrosesan Logistik Distribusi:</span>
                <span className="font-mono text-primary text-[11px]">
                  Tahap {currentStageIndex} dari 5
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {STEPPER_STAGES.map((st) => {
                  const isDone = st.step < currentStageIndex;
                  const isCurrent = st.step === currentStageIndex;
                  return (
                    <div
                      key={st.key}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isCurrent
                          ? 'bg-primary-container text-white border-primary-container shadow-xs'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-surface-container-low text-on-surface-variant border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-xs">0{st.step}.</span>
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        ) : (
                          <Clock className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </div>
                      <div className="font-bold text-xs leading-tight">{st.title}</div>
                      <div className={`text-[10px] mt-1 line-clamp-2 ${isCurrent ? 'text-white/90' : 'opacity-80'}`}>
                        {st.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2-Columns: Driver Telemetry & Store Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high space-y-2">
                <div className="font-bold text-on-surface flex items-center gap-1.5 text-primary">
                  <MapPin className="h-4 w-4" />
                  <span>Destinasi Toko &amp; Kontak Penerima:</span>
                </div>
                <div className="space-y-1 text-on-surface">
                  <div className="font-extrabold text-sm">{orderData.store?.name || orderData.storeName || 'Toko Mitra'}</div>
                  <div className="text-on-surface-variant">
                    Wilayah: Kec. {orderData.store?.district || 'Sidoarjo'}
                  </div>
                  <div className="text-primary font-mono font-semibold flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{orderData.store?.phone || '0812-3456-7890'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high space-y-2">
                <div className="font-bold text-on-surface flex items-center gap-1.5 text-primary">
                  <Truck className="h-4 w-4" />
                  <span>Armada &amp; Kurir Distribusi Cabang Krian:</span>
                </div>
                <div className="space-y-1 text-on-surface">
                  <div className="font-extrabold text-sm">Suzuki Carry Box (W 8821 NA)</div>
                  <div className="text-on-surface-variant">
                    Kurir Resmi: <strong>Bambang Triyono</strong> (Logistik Ritel)
                  </div>
                  <div className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                    {orderData.status === 'COMPLETED' ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Muatan telah diserahterimakan di pintu toko</span>
                      </>
                    ) : orderData.status === 'DISPATCHED' ? (
                      <>
                        <Truck className="h-3.5 w-3.5 text-blue-600" />
                        <span>Armada sedang dalam perjalanan rute toko</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        <span>Dalam antrean jadwal muat dispatch gudang</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                <span className="flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Rincian Produk Pesanan Grosir:</span>
                </span>
                <span className="font-mono text-on-surface-variant text-[11px]">
                  {(orderData.items || []).length} Item Terdaftar
                </span>
              </div>

              <div className="border border-surface-container-high rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant border-b border-surface-container-high">
                      <th className="py-2.5 px-3 font-semibold">SKU Produk FMCG</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Jumlah Dus</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Harga Karton</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high font-medium">
                    {(orderData.items || []).map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low/50">
                        <td className="py-3 px-3">
                          <div className="font-bold text-on-surface">
                            {item.product?.name || item.name || 'Produk Mayora'}
                          </div>
                          <div className="text-[10px] text-on-surface-variant font-mono">
                            SKU: {item.product?.sku || item.sku || '-'} • Kategori:{' '}
                            {item.product?.category || item.category || 'FMCG'}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-primary">
                          {item.quantity} Karton
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-on-surface-variant">
                          {formatRupiah(item.unitPrice || 0)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-on-surface">
                          {formatRupiah(item.subtotal || item.quantity * (item.unitPrice || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary & e-POD Proof Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Details */}
              <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high space-y-2 text-xs">
                <span className="font-bold text-on-surface block">Ringkasan Pembayaran:</span>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Metode Pembayaran:</span>
                  <strong className="text-on-surface font-mono">
                    {orderData.paymentMethodLabel || orderData.paymentMethod || 'CASH ON DELIVERY (COD)'}
                  </strong>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Ongkos Kirim Armada:</span>
                  <span className="text-emerald-700 font-bold font-mono">Rp 0 (GRATIS)</span>
                </div>
                <div className="pt-2 border-t border-surface-container-high flex justify-between items-baseline font-bold text-sm">
                  <span className="text-on-surface">Total Tagihan DO:</span>
                  <span className="text-lg font-black font-mono text-primary">
                    {formatRupiah(orderData.totalAmount || 0)}
                  </span>
                </div>
              </div>

              {/* Digital Proof of Delivery (e-POD) */}
              <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high space-y-2 text-xs flex flex-col justify-between">
                <div>
                  <span className="font-bold text-on-surface block mb-1">
                    Validasi Penerimaan Digital (e-POD):
                  </span>
                  {(orderData.status || '').toUpperCase() === 'COMPLETED' ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>e-POD Terverifikasi &amp; Sah</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-tight">
                        Barang telah diterima utuh dan ditandatangani oleh pemilik toko mitra sesuai surat jalan.
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-surface-container rounded-lg text-on-surface-variant space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-on-surface">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span>Menunggu Konfirmasi Serah Terima Fisik</span>
                      </div>
                      <p className="text-[11px] leading-tight">
                        Tanda tangan digital akan dicatat oleh kurir saat armada tiba di toko Anda.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-outline">
                  <span>Pusat Distribusi: Depo Krian Hub</span>
                  <button
                    onClick={() => setActiveNav && setActiveNav('products')}
                    className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Pesan Produk Lagi</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: FAQ & B2B ASSISTANCE                           */}
      {/* ========================================================= */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 mt-12">
        <div className="p-6 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>Butuh Bantuan Jadwal Armada atau Perubahan Pesanan?</span>
            </h3>
            <p className="text-xs text-on-surface-variant">
              Hubungi tim sales koordinator Cabang Krian melalui WhatsApp resmi untuk konfirmasi waktu tiba atau perubahan rincian PO.
            </p>
          </div>
          <Button
            onClick={() => setActiveNav && setActiveNav('contact')}
            className="text-xs font-bold px-4 h-9 gap-1.5 bg-primary-container text-white shrink-0 cursor-pointer"
          >
            <span>Hubungi Dispatch Krian</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
