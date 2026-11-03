import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { api } from '../../services/api';
import { formatRupiah } from '../../lib/utils';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRightLeft, 
  Boxes, 
  Truck, 
  KeyRound, 
  CheckSquare, 
  Sliders, 
  Layers, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function AuditLogs({ setCurrentScreen }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAuditLogs({ limit: 100 });
      const items = Array.isArray(res) ? res : res?.logs || res?.data || [];
      setLogs(items);
    } catch (err) {
      setError(err.message || 'Gagal memuat log aktivitas sistem.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const onRefresh = () => fetchLogs();
    window.addEventListener('supplysync:refresh', onRefresh);
    return () => window.removeEventListener('supplysync:refresh', onRefresh);
  }, [fetchLogs]);

  // Categories config
  const categories = [
    { id: 'ALL', label: 'Semua Log' },
    { id: 'AUTH', label: 'Login & Akses' },
    { id: 'INVENTORY', label: 'Mutasi Stok & SKU' },
    { id: 'PO', label: 'PO & Restock' },
    { id: 'DISPATCH', label: 'Inbound DO & BAST' },
    { id: 'DSR', label: 'Penjualan DSR' },
    { id: 'SYNC', label: 'Sinkronisasi SAP' },
  ];

  // Helper to categorize an action
  const getActionCategory = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('LOGIN') || act.includes('AUTH')) return 'AUTH';
    if (act.includes('PRODUCT') || act.includes('STOCK') || act.includes('TRANSFER')) return 'INVENTORY';
    if (act.includes('PO') || act.includes('RESTOCK')) return 'PO';
    if (act.includes('DO') || act.includes('BAST') || act.includes('INBOUND')) return 'DISPATCH';
    if (act.includes('SALES') || act.includes('DSR')) return 'DSR';
    if (act.includes('SYNC') || act.includes('SAP')) return 'SYNC';
    return 'OTHER';
  };

  // Helper for human description
  const formatLogSummary = (log) => {
    const act = log.action || '';
    const d = log.details || {};

    switch (act) {
      case 'PORTAL_LOGIN':
        return `Login portal ${d.role || 'Admin'} (${d.username || 'user'}) via node ${d.node || 'HQ-SURABAYA'}`;
      case 'CROSS_DEPOT_TRANSFER':
        return `Transfer antar-depot ${d.quantityCartons || ''} dus ${d.productName || d.sku || ''} dari ${d.sourceDepot || 'Depo asal'} ke ${d.targetDepot || 'Krian'}`;
      case 'BATCH_PO_APPROVED':
        return `Otorisasi PO Restock batch oleh HQ untuk ${d.depotName || 'Depo Krian'} (${d.itemCount || (d.items?.length) || 1} SKU disetujui)`;
      case 'INBOUND_DO_RECEIVED':
        return `Penerimaan armada Truk Inbound Surat Jalan ${log.entityId} & verifikasi e-BAST di Bay Gudang`;
      case 'DAILY_SALES_INPUT':
      case 'DAILY_SALES_RECORDED':
        return `Penjualan ritel DSR ${d.quantityCartons || ''} dus ${d.productName || d.sku || ''} ke ${d.storeName || 'Outlet Mitra'} (-${d.quantityCartons || 0} dus fisik)`;
      case 'PRODUCT_CREATED':
        return `SKU baru ditambahkan ke katalog master: ${d.name || log.entityId} (${d.category || 'FMCG'})`;
      case 'PRODUCT_STOCK_UPDATED':
        return `Koreksi stok fisik gudang SKU ${d.sku || log.entityId}: ${d.previousStock ?? ''} → ${d.newStock ?? ''} dus (${d.difference > 0 ? '+' : ''}${d.difference || ''} dus)`;
      case 'PRODUCT_DELETED':
        return `Penonaktifan / arsip SKU ${d.sku || log.entityId} (${d.name || ''}) dari katalog`;
      case 'SAP_SYNC_COMPLETED':
      case 'SAP_SYNC_EXECUTED':
        return `Sinkronisasi menyeluruh database lokal dengan ERP Mayora SAP S/4HANA (stok & mutasi)`;
      case 'ORDER_STATUS_UPDATED':
        return `Pembaruan status pesanan ${log.entityId} menjadi ${d.status || 'DIPROSES'}`;
      case 'CONTACT_INQUIRY':
        return `Pengajuan kemitraan / pesan kontak dari mitra baru: ${d.name || 'Calon Mitra'}`;
      default:
        return `Operasi ${act} pada entitas ${log.entityType} (${log.entityId})`;
    }
  };

  // Badge styler
  const getActionBadge = (action) => {
    const cat = getActionCategory(action);
    switch (cat) {
      case 'AUTH':
        return <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-700 border-slate-300">AUTH LOGIN</Badge>;
      case 'INVENTORY':
        return <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-300">MUTASI STOK</Badge>;
      case 'PO':
        return <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300">PO RESTOCK</Badge>;
      case 'DISPATCH':
        return <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-800 border-blue-300">INBOUND DO</Badge>;
      case 'DSR':
        return <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-800 border-purple-300">PENJUALAN DSR</Badge>;
      case 'SYNC':
        return <Badge variant="outline" className="text-[10px] bg-teal-50 text-teal-800 border-teal-300">SAP SYNC</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] bg-surface-container text-on-surface-variant">SISTEM</Badge>;
    }
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      // Category filter
      if (selectedCategory !== 'ALL') {
        const cat = getActionCategory(l.action);
        if (cat !== selectedCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const summary = formatLogSummary(l).toLowerCase();
        const action = (l.action || '').toLowerCase();
        const entityId = (l.entityId || '').toLowerCase();
        const ip = (l.ipAddress || '').toLowerCase();
        const detailsStr = JSON.stringify(l.details || {}).toLowerCase();

        return (
          summary.includes(q) ||
          action.includes(q) ||
          entityId.includes(q) ||
          ip.includes(q) ||
          detailsStr.includes(q)
        );
      }

      return true;
    });
  }, [logs, selectedCategory, searchQuery]);

  // Export CSV
  const handleExportCsv = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['Timestamp WIB', 'Action', 'Category', 'Entity Type', 'Entity ID', 'Summary', 'IP Address'];
    const rows = filteredLogs.map((l) => {
      const dateStr = l.createdAt ? new Date(l.createdAt).toLocaleString('id-ID') : '-';
      return [
        `"${dateStr}"`,
        `"${l.action || ''}"`,
        `"${getActionCategory(l.action)}"`,
        `"${l.entityType || ''}"`,
        `"${l.entityId || ''}"`,
        `"${formatLogSummary(l).replace(/"/g, '""')}"`,
        `"${l.ipAddress || '127.0.0.1'}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SupplySync_AuditLogs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // KPI Summary stats
  const stats = useMemo(() => {
    const total = logs.length;
    const inventoryCount = logs.filter((l) => getActionCategory(l.action) === 'INVENTORY').length;
    const poCount = logs.filter((l) => getActionCategory(l.action) === 'PO' || getActionCategory(l.action) === 'DISPATCH').length;
    const authCount = logs.filter((l) => getActionCategory(l.action) === 'AUTH').length;

    return { total, inventoryCount, poCount, authCount };
  }, [logs]);

  return (
    <div className="w-full space-y-6 pb-16">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-wide uppercase">
            <ShieldCheck className="h-4 w-4" />
            <span>Sistem Tata Kelola &amp; Audit Trail Enterprise</span>
          </div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight mt-1">
            Riwayat Log &amp; Audit Trail Aktivitas
          </h1>
          <p className="text-xs text-on-surface-variant max-w-2xl mt-0.5">
            Pencatatan menyeluruh setiap aksi mutasi stok, otorisasi restock, penerimaan armada DO, input DSR ritel, serta sinkronisasi ERP Mayora.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={fetchLogs}
            disabled={loading}
            variant="outline"
            size="sm"
            className="text-xs font-semibold gap-1.5 h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>Segarkan</span>
          </Button>

          <Button
            onClick={handleExportCsv}
            disabled={filteredLogs.length === 0}
            variant="outline"
            size="sm"
            className="text-xs font-semibold gap-1.5 h-9"
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            <span>Ekspor CSV ({filteredLogs.length})</span>
          </Button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-outline/10 bg-surface-container-lowest shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs font-bold">Total Log Tercatat</span>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-black text-on-surface font-mono">{stats.total}</div>
            <div className="text-[11px] text-on-surface-variant font-medium">Tersimpan di Supabase &amp; Redis</div>
          </CardContent>
        </Card>

        <Card className="border border-outline/10 bg-surface-container-lowest shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs font-bold">Mutasi Stok &amp; SKU</span>
              <Boxes className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700 font-mono">{stats.inventoryCount}</div>
            <div className="text-[11px] text-on-surface-variant font-medium">Koreksi fisik &amp; transfer depo</div>
          </CardContent>
        </Card>

        <Card className="border border-outline/10 bg-surface-container-lowest shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs font-bold">Otorisasi PO &amp; DO</span>
              <Truck className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-700 font-mono">{stats.poCount}</div>
            <div className="text-[11px] text-on-surface-variant font-medium">Batch approval &amp; e-BAST transit</div>
          </CardContent>
        </Card>

        <Card className="border border-outline/10 bg-surface-container-lowest shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs font-bold">Sesi Akses &amp; Login</span>
              <KeyRound className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono">{stats.authCount}</div>
            <div className="text-[11px] text-on-surface-variant font-medium">Verifikasi node HQ &amp; Depo Krian</div>
          </CardContent>
        </Card>
      </div>

      {/* FILTER CONTROLS & SEARCH */}
      <Card className="border border-outline/10 shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kata kunci aksi, entitas ID (TRF/DO/PO/SKU), atau operator..."
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-surface-container-low text-xs text-on-surface border border-outline/15 focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-xs text-on-surface-variant hover:text-on-surface"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MAIN LOG TABLE */}
      <Card className="border border-outline/10 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-outline/10 bg-surface-container-low/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-on-surface">Daftar Transaksi &amp; Jejak Rekam Operasional</span>
            </div>
            <span className="text-xs text-on-surface-variant font-mono">
              Menampilkan {filteredLogs.length} dari {logs.length} data
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-on-surface-variant space-y-2">
              <RefreshCw className="h-6 w-6 mx-auto animate-spin text-primary" />
              <p className="font-semibold">Menyinkronkan log audit dari database...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-xs text-red-600 space-y-2">
              <p className="font-semibold">{error}</p>
              <Button onClick={fetchLogs} size="sm" variant="outline">Coba Lagi</Button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-on-surface-variant space-y-2">
              <ShieldCheck className="h-8 w-8 mx-auto text-outline opacity-50" />
              <p className="font-bold text-on-surface">Tidak ada log aktivitas yang cocok</p>
              <p className="text-[11px] text-outline">Coba ganti filter kategori atau kata kunci pencarian.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline/10">
                    <th className="py-2.5 px-4 font-semibold w-40">Waktu &amp; Tanggal</th>
                    <th className="py-2.5 px-3 font-semibold w-32">Kategori Aksi</th>
                    <th className="py-2.5 px-4 font-semibold">Deskripsi Operasional</th>
                    <th className="py-2.5 px-4 font-semibold w-36">ID Entitas</th>
                    <th className="py-2.5 px-4 font-semibold w-32 text-right">IP / Host</th>
                    <th className="py-2.5 px-3 font-semibold w-16 text-center">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10 font-medium">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-on-surface-variant text-xs">
                        Tidak ada riwayat log audit yang cocok dengan kriteria filter. Silakan ubah kata kunci atau kategori aksi.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    const dateObj = log.createdAt ? new Date(log.createdAt) : new Date();
                    const dateStr = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                    const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';

                    return (
                      <React.Fragment key={log.id}>
                        <tr 
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                        >
                          {/* WAKTU */}
                          <td className="py-3 px-4 font-mono">
                            <div className="font-bold text-on-surface">{timeStr}</div>
                            <div className="text-[10px] text-outline">{dateStr}</div>
                          </td>

                          {/* KATEGORI AKSI */}
                          <td className="py-3 px-3">
                            {getActionBadge(log.action)}
                          </td>

                          {/* DESKRIPSI OPERASIONAL */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-on-surface text-xs leading-relaxed">
                              {formatLogSummary(log)}
                            </div>
                            <div className="text-[10px] font-mono text-outline mt-0.5">
                              Action: {log.action} • Type: {log.entityType}
                            </div>
                          </td>

                          {/* ENTITY ID */}
                          <td className="py-3 px-4 font-mono text-[11px] text-on-surface font-bold">
                            <span className="bg-surface-container-low px-2 py-0.5 rounded border border-outline/10 inline-block truncate max-w-[130px]">
                              {log.entityId}
                            </span>
                          </td>

                          {/* IP ADDRESS */}
                          <td className="py-3 px-4 font-mono text-right text-[11px] text-on-surface-variant">
                            {log.ipAddress || '127.0.0.1'}
                          </td>

                          {/* EXPAND BUTTON */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedLogId(isExpanded ? null : log.id);
                              }}
                              className="text-outline hover:text-primary transition-colors p-1 rounded-md hover:bg-surface-container"
                              title={isExpanded ? 'Tutup Rincian' : 'Buka Rincian Log'}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </td>
                        </tr>

                        {/* EXPANDED JSON DETAILS ROW */}
                        {isExpanded && (
                          <tr className="bg-surface-container-low/40">
                            <td colSpan={6} className="p-4 border-b border-outline/10">
                              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline/15 text-xs space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-bold text-outline uppercase tracking-wider">
                                  <span>Payload Metadata / Snapshot Audit Log</span>
                                  <span className="font-mono">UUID: {log.id}</span>
                                </div>
                                <pre className="p-3 bg-surface-container rounded-lg font-mono text-[11px] overflow-x-auto text-on-surface border border-outline/10">
                                  {JSON.stringify(log.details || {}, null, 2)}
                                </pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
