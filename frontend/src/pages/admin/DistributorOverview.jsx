import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { api } from '../../services/api';
import { 
  Warehouse, 
  AlertTriangle, 
  TrendingUp, 
  Truck, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Layers,
  Sliders,
  CheckSquare,
  RefreshCw,
  Store,
  Plus,
  Minus,
  FileText,
  Trash2,
  X,
  Boxes,
  UploadCloud,
  Image as ImageIcon,
  Zap,
  Eye,
  Search,
  Filter,
  Calendar,
  Tag,
  ChevronRight
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';

function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function compressImageFile(file, maxWidth = 800, maxHeight = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const estBytes = Math.round((dataUrl.length * 3) / 4);
        const originalBytes = file.size;
        const savings = Math.max(0, Math.round(((originalBytes - estBytes) / originalBytes) * 100));

        resolve({
          dataUrl,
          originalSizeStr: formatBytes(originalBytes),
          compressedSizeStr: formatBytes(estBytes),
          savingsPercent: savings,
          format: dataUrl.startsWith('data:image/webp') ? 'WebP' : 'JPEG',
          width,
          height,
        });
      };
      img.onerror = () => reject(new Error('Gagal memuat file gambar'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.readAsDataURL(file);
  });
}

const NEXT_ORDER_STATUS = {
  PENDING: { status: 'CONFIRMED', label: 'Konfirmasi PO' },
  CONFIRMED: { status: 'PACKING', label: 'Mulai Packing' },
  PACKING: { status: 'DISPATCHED', label: 'Kirim Armada' },
  DISPATCHED: { status: 'COMPLETED', label: 'Selesai Terima' },
};

export default function DistributorOverview({ setCurrentScreen }) {
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState(null);
  const [fefo, setFefo] = useState(null);
  const [dsr, setDsr] = useState(null);
  const [inbound, setInbound] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [mutatingId, setMutatingId] = useState(null);
  const [highlightedSku, setHighlightedSku] = useState(null);
  const [selectedStoreProposal, setSelectedStoreProposal] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [orderAdvanceToast, setOrderAdvanceToast] = useState(null);

  // READ Inspection Dossier Modals
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [selectedInboundDetail, setSelectedInboundDetail] = useState(null);

  // Search & Filter State for Inventory
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('ALL');
  const [inventoryFefoFilter, setInventoryFefoFilter] = useState('ALL');

  // Search & Filter State for Wholesale Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Search & Filter State for Partner Stores
  const [storeSearch, setStoreSearch] = useState('');
  const [storeDistrictFilter, setStoreDistrictFilter] = useState('ALL');
  const [storeStatusFilter, setStoreStatusFilter] = useState('ALL');

  // CRUD Modal & Feedback State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [productActionFeedback, setProductActionFeedback] = useState(null);
  const [newProductForm, setNewProductForm] = useState({
    sku: '',
    name: '',
    category: 'Biskuit',
    cartonPrice: 215000,
    retailPriceEst: 235000,
    stockCartons: 100,
    batchNumber: 'B-2026-N09',
    expiryDate: '2027-08-30',
    imageUrl: '',
  });

  // Image Upload & Auto-Compression State (WebP / Supabase Storage)
  const [imageUploadMode, setImageUploadMode] = useState('upload'); // 'upload' | 'url'
  const [photoName, setPhotoName] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoMetrics, setPhotoMetrics] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const resetAddForm = useCallback(() => {
    setIsAddModalOpen(false);
    setPhotoPreview(null);
    setPhotoMetrics(null);
    setPhotoName('');
    setIsCompressing(false);
    setIsDragging(false);
    setImageUploadMode('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setNewProductForm({
      sku: '',
      name: '',
      category: 'Biskuit',
      cartonPrice: 215000,
      retailPriceEst: 235000,
      stockCartons: 100,
      batchNumber: 'B-2026-N09',
      expiryDate: '2027-08-30',
      imageUrl: '',
    });
  }, []);

  const processImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar yang valid (JPG, PNG, atau WebP)');
      return;
    }
    setIsCompressing(true);
    try {
      const result = await compressImageFile(file, 800, 800, 0.75);
      setPhotoName(file.name);
      setPhotoPreview(result.dataUrl);
      setPhotoMetrics(result);
      setNewProductForm((prev) => ({ ...prev, imageUrl: result.dataUrl }));
    } catch (err) {
      console.error('Image compression error:', err);
      alert('Gagal mengompresi gambar. Coba file gambar lain.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoMetrics(null);
    setPhotoName('');
    setNewProductForm((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Close any open modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        resetAddForm();
        setProductToDelete(null);
        setSelectedStoreProposal(null);
        setSelectedOrderDetails(null);
        setSelectedProductDetail(null);
        setSelectedInboundDetail(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetAddForm]);

  const fetchOverviewData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [kpiRes, fefoRes, dsrRes, inboundRes, ordersRes, storesRes] = await Promise.all([
        api.getAdminKpi(),
        api.getFefoInventory(),
        api.getDailySales({ limit: 5 }),
        api.getInboundDeliveries(),
        api.getAdminOrders({ limit: 8 }),
        api.getAdminStores({ limit: 15 }),
      ]);
      setKpi(kpiRes);
      setFefo(fefoRes);
      setDsr(dsrRes);
      setInbound(inboundRes);
      setOrders(Array.isArray(ordersRes) ? ordersRes : ordersRes?.orders || []);
      setStores(Array.isArray(storesRes) ? storesRes : storesRes?.stores || []);
    } catch (err) {
      console.error('DistributorOverview fetch error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();

    // Check if navigated with a specific SKU from search palette
    const savedSku = sessionStorage.getItem('supplysync_highlight_sku');
    if (savedSku) {
      setHighlightedSku(savedSku);
      sessionStorage.removeItem('supplysync_highlight_sku');
    }

    const onHighlight = (e) => {
      if (e.detail) {
        setHighlightedSku(e.detail);
      }
    };

    const onRefresh = () => fetchOverviewData(true);
    window.addEventListener('supplysync:refresh', onRefresh);
    window.addEventListener('supplysync:highlight-sku', onHighlight);
    return () => {
      window.removeEventListener('supplysync:refresh', onRefresh);
      window.removeEventListener('supplysync:highlight-sku', onHighlight);
    };
  }, [fetchOverviewData]);

  // Scroll to and highlight targeted SKU row
  useEffect(() => {
    if (highlightedSku) {
      const el = document.getElementById(`sku-row-${highlightedSku}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const timer = setTimeout(() => setHighlightedSku(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [highlightedSku, fefo]);

  const handleAdjustStock = async (productId, addCartons) => {
    setMutatingId(productId);
    // Optimistic UI update
    setFefo((prev) => {
      if (!prev?.inventory) return prev;
      return {
        ...prev,
        inventory: prev.inventory.map((item) =>
          item.id === productId
            ? { ...item, stockCartons: Math.max(0, (item.stockCartons || 0) + addCartons) }
            : item
        ),
      };
    });
    try {
      await api.updateProductStock(productId, { addCartons });
      window.dispatchEvent(new CustomEvent('supplysync:refresh'));
      await fetchOverviewData(true);
    } catch (err) {
      alert(err.message || 'Gagal memperbarui stok gudang');
      await fetchOverviewData(true);
    } finally {
      setMutatingId(null);
    }
  };

  const handleAdvanceOrder = async (orderId, nextStatus, ordData = null) => {
    setMutatingId(orderId);
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: nextStatus } : ord))
    );
    setSelectedOrderDetails((prev) =>
      prev && prev.id === orderId ? { ...prev, status: nextStatus } : prev
    );
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      const tracking = ordData?.trackingCode || 'PO';
      const storeName = ordData?.store?.name || 'Toko Mitra';
      setOrderAdvanceToast({
        trackingCode: tracking,
        storeName,
        status: nextStatus,
      });
      window.dispatchEvent(new CustomEvent('supplysync:refresh'));
      await fetchOverviewData(true);
    } catch (err) {
      alert(err.message || 'Gagal mengubah status pesanan');
      await fetchOverviewData(true);
    } finally {
      setMutatingId(null);
    }
  };

  const handleVerifyStore = async (storeId, isVerified) => {
    setMutatingId(storeId);
    // Optimistic UI update
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, isVerified } : s))
    );
    setSelectedStoreProposal((prev) => (prev && prev.id === storeId ? { ...prev, isVerified } : prev));
    try {
      await api.verifyStore(storeId, isVerified);
      window.dispatchEvent(new CustomEvent('supplysync:refresh'));
      await fetchOverviewData(true);
    } catch (err) {
      alert(err.message || 'Gagal memverifikasi toko mitra');
      await fetchOverviewData(true);
    } finally {
      setMutatingId(null);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmittingProduct(true);
    try {
      await api.createProduct({
        sku: newProductForm.sku.trim().toUpperCase(),
        name: newProductForm.name.trim(),
        category: newProductForm.category,
        cartonPrice: Number(newProductForm.cartonPrice),
        retailPriceEst: Number(newProductForm.retailPriceEst),
        stockCartons: Number(newProductForm.stockCartons),
        batchNumber: newProductForm.batchNumber.trim(),
        expiryDate: new Date(newProductForm.expiryDate).toISOString(),
        imageUrl: newProductForm.imageUrl.trim() || undefined,
      });
      setProductActionFeedback({
        type: 'success',
        message: `Produk baru "${newProductForm.name}" (${newProductForm.sku}) berhasil ditambahkan ke database gudang!`,
      });
      resetAddForm();
      await fetchOverviewData();
      setTimeout(() => setProductActionFeedback(null), 4000);
    } catch (err) {
      alert(err.message || 'Gagal menambahkan produk SKU baru');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setSubmittingProduct(true);
    try {
      const res = await api.deleteProduct(productToDelete.id);
      setProductActionFeedback({
        type: 'success',
        message: res?.message || `SKU "${productToDelete.name}" berhasil dihapus / dinonaktifkan.`,
      });
      setProductToDelete(null);
      await fetchOverviewData();
      setTimeout(() => setProductActionFeedback(null), 4000);
    } catch (err) {
      alert(err.message || 'Gagal menghapus produk SKU');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const inventoryItems = fefo?.inventory || [];

  const INVENTORY_CATEGORIES = ['ALL', 'Biskuit', 'Wafer', 'Cokelat', 'Kopi', 'Sereal', 'Permen', 'Minuman'];

  const filteredInventory = useMemo(() => {
    return inventoryItems.filter((item) => {
      if (inventoryCategory !== 'ALL' && item.category !== inventoryCategory) {
        return false;
      }
      if (inventoryFefoFilter !== 'ALL' && item.fefoStatus !== inventoryFefoFilter) {
        return false;
      }
      if (inventorySearch.trim()) {
        const q = inventorySearch.toLowerCase().trim();
        const matchSku = item.sku?.toLowerCase().includes(q);
        const matchName = item.name?.toLowerCase().includes(q);
        const matchBatch = item.batchNumber?.toLowerCase().includes(q);
        if (!matchSku && !matchName && !matchBatch) return false;
      }
      return true;
    });
  }, [inventoryItems, inventoryCategory, inventoryFefoFilter, inventorySearch]);

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (orderStatusFilter !== 'ALL' && ord.status !== orderStatusFilter) {
        return false;
      }
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase().trim();
        const matchCode = ord.trackingCode?.toLowerCase().includes(q);
        const matchStore = ord.store?.name?.toLowerCase().includes(q);
        const matchDistrict = ord.store?.district?.toLowerCase().includes(q);
        if (!matchCode && !matchStore && !matchDistrict) return false;
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  const filteredStores = useMemo(() => {
    return stores.filter((st) => {
      if (storeDistrictFilter !== 'ALL' && st.district?.toLowerCase() !== storeDistrictFilter.toLowerCase()) {
        return false;
      }
      if (storeStatusFilter === 'VERIFIED' && !st.isVerified) return false;
      if (storeStatusFilter === 'PENDING' && st.isVerified) return false;
      if (storeSearch.trim()) {
        const q = storeSearch.toLowerCase().trim();
        const matchName = st.name?.toLowerCase().includes(q);
        const matchOwner = st.ownerName?.toLowerCase().includes(q);
        const matchPhone = st.phone?.toLowerCase().includes(q);
        if (!matchName && !matchOwner && !matchPhone) return false;
      }
      return true;
    });
  }, [stores, storeDistrictFilter, storeStatusFilter, storeSearch]);

  const uniqueDistricts = useMemo(() => {
    const list = stores.map((s) => s.district).filter(Boolean);
    return ['ALL', ...Array.from(new Set(list))];
  }, [stores]);
  const totalCartons = fefo?.summary?.totalCartonsInWarehouse ?? 1745;
  const capacityPct = Math.min(100, Math.round((totalCartons / 2400) * 100));
  const criticalSkus = inventoryItems.filter((i) => i.stockCartons < 150 || i.fefoStatus === 'DANGER');
  const lowestSku = [...inventoryItems].sort((a, b) => a.stockCartons - b.stockCartons)[0];
  const dsrCartons = dsr?.summary?.totalCartonsSold ?? 175;
  const dsrRevenue = dsr?.summary?.totalRevenueIDR ?? 31850000;
  const activeInbound = inbound?.deliveries?.[0] || null;
  const recentLogs = dsr?.records || [];

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Dynamic Operational Notice / Urgent AI Alert */}
      {lowestSku && (
        <div className="p-3.5 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border-l-4 border-l-red-600 rounded-r-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-on-surface">
                Peringatan Stok Rendah: {lowestSku.name.split('(')[0].trim()}
              </div>
              <div className="text-[11px] text-on-surface-variant">
                Stok fisik gudang: <strong>{lowestSku.stockCartons} dus</strong> • Batch {lowestSku.batchNumber} (Sisa umur simpan: {lowestSku.daysUntilExpiry} hari).
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button 
              onClick={() => setCurrentScreen && setCurrentScreen('restock-request')}
              size="sm"
              className="bg-primary text-white text-xs font-bold h-8 hover:bg-primary-container shadow-xs"
            >
              Ajukan Restock Cepat
            </Button>
          </div>
        </div>
      )}

      {/* Operational Context Strip & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
            <span>Mayora B2B Network</span>
            <span>/</span>
            <span>Distributor Jatim</span>
            <span>/</span>
            <span className="text-primary font-bold">Depo Krian Logistik</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface mt-1">
            Ringkasan Operasional Depot &amp; Gudang FEFO
          </h1>
          <p className="text-xs text-on-surface-variant">
            Pusat monitoring gudang real-time, rotasi batch FEFO, verifikasi toko mitra, dan orkestrasi pengiriman teritori Sidoarjo Barat.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="surface" className="font-mono text-xs">Node: DEP-SDA-01</Badge>
          <Button
            onClick={fetchOverviewData}
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>Refresh Gudang</span>
          </Button>
        </div>
      </div>

      {/* Panduan Operasional Depo Krian */}
      <div className="p-4 bg-surface-container-lowest border border-outline/10 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Warehouse className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-on-surface">Panduan Operasional Gudang:</span>
            <span className="text-on-surface-variant ml-1">
              Gunakan tabel inventori untuk mengaudit stok riil per batch FEFO. Pesanan toko mitra di kolom bawah dapat dimajukan statusnya secara bertahap hingga selesai terkirim. Klik baris SKU, Order, atau Armada mana pun untuk inspeksi detail lengkap.
            </span>
          </div>
        </div>
        <Badge variant="surface" className="text-[10px] shrink-0 font-mono">
          Depo Hub Sidoarjo Barat
        </Badge>
      </div>

      {/* 4 Primary KPI Metrik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="border border-outline/10 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Total Stok Fisik Gudang</span>
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                <Warehouse className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-on-surface">{totalCartons.toLocaleString('id-ID')}</span>
              <span className="text-xs text-on-surface-variant font-medium">Karton Dus</span>
            </div>
            <div className="mt-3 pt-2.5 bg-surface-container-low -mx-4 -mb-4 px-4 pb-3 rounded-b-xl border-t border-outline/5">
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-on-surface-variant">Kapasitas Gudang 1 Krian</span>
                <span className="font-bold text-on-surface">{capacityPct}% Terisi</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${capacityPct}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-on-surface-variant mt-1">
                <span>Max: 2.400 Dus</span>
                <span>{inventoryItems.length} SKU Terdaftar</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="border-l-4 border-l-red-600 border border-outline/10 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">SKU Kritis &amp; Peringatan FEFO</span>
              <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-700">
                <AlertTriangle className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-red-600">{criticalSkus.length}</span>
              <span className="text-xs text-on-surface-variant font-medium">Produk Prioritas</span>
            </div>
            <div className="mt-3 pt-2.5 bg-surface-container-low -mx-4 -mb-4 px-4 pb-3 rounded-b-xl border-t border-outline/5">
              <div className="text-[11px] text-red-700 font-semibold truncate">
                {criticalSkus.map((s) => s.name.split(' ')[0]).join(', ') || 'Semua SKU Aman'}
              </div>
              <div className="text-[10px] text-on-surface-variant mt-0.5">
                Masa Simpan &lt;90 Hari: {fefo?.summary?.dangerCount || 0} Batch
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="border border-outline/10 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Penjualan Harian Sales (DSR)</span>
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-on-surface">{dsrCartons}</span>
              <span className="text-xs text-on-surface-variant font-medium">Dus Terjual</span>
            </div>
            <div className="mt-3 pt-2.5 bg-surface-container-low -mx-4 -mb-4 px-4 pb-3 rounded-b-xl border-t border-outline/5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                  {formatRupiah(dsrRevenue)}
                </span>
                <span className="font-mono text-[10px] text-on-surface-variant">
                  {dsr?.summary?.totalTransactions || recentLogs.length} Transaksi
                </span>
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1">Tersinkron ke sistem operasional</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4 - Armada Inbound */}
        <Card 
          onClick={() => activeInbound && setSelectedInboundDetail(activeInbound)}
          className="border border-outline/10 shadow-xs hover:shadow-md transition-shadow cursor-pointer hover:border-primary/40 group"
          title="Klik untuk membuka Manifest & Surat Jalan Inbound"
        >
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant group-hover:text-primary transition-colors">
                Armada Inbound &amp; Order
              </span>
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Truck className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-on-surface">{inbound?.activeCount ?? 1}</span>
                <span className="text-xs text-on-surface-variant font-medium">Truk Wingbox Inbound</span>
              </div>
              <span className="text-[10px] text-primary font-bold flex items-center gap-0.5 group-hover:underline">
                Manifest <ChevronRight className="h-3 w-3" />
              </span>
            </div>
            <div className="mt-3 pt-2.5 bg-surface-container-low -mx-4 -mb-4 px-4 pb-3 rounded-b-xl border-t border-outline/5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-on-surface">{activeInbound?.doNumber || 'DO-2026-0881'}</span>
                <span className="text-purple-700 font-bold text-[10px] bg-purple-50 px-1 rounded">
                  {kpi?.pendingDispatch || 4} DO Toko Antre
                </span>
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1">
                {activeInbound?.fleet?.gpsCoordinates?.locationLabel || 'Transit Tol Pandaan - Krian'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main SKU Inventory Health & FEFO Grid (With Live Stock Update Controls & Rich READ Explorer) */}
      <Card className="border border-outline/10 shadow-xs">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-primary" />
                Inventori Gudang Krian &amp; Rotasi Batch FEFO (First-Expired, First-Out)
              </h3>
              <p className="text-xs text-on-surface-variant">
                Klik baris SKU untuk membuka Dossier Spesifikasi Lengkap. Gunakan filter dan pencarian untuk mengaudit stok.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-[10px] font-mono">
                {fefo?.summary?.dangerCount || 2} Danger (&lt;3 Bln)
              </Badge>
              <Badge variant="tertiary" className="text-[10px] font-mono">
                {fefo?.summary?.warningCount || 2} Warning (&lt;6 Bln)
              </Badge>
              <Button
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary text-white text-xs font-bold h-7 px-3 gap-1 shadow-xs hover:bg-primary-container"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah SKU</span>
              </Button>
            </div>
          </div>

          {productActionFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{productActionFeedback.message}</span>
              </div>
              <button onClick={() => setProductActionFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Interactive Search & Multi-Filter Bar (Enhanced READ Experience) */}
          <div className="space-y-3 pt-1 border-t border-outline/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Cari SKU, nama produk Mayora, atau no. batch..."
                  className="w-full h-8 pl-8 pr-8 rounded-lg bg-surface-container-low border border-outline/20 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {inventorySearch && (
                  <button
                    onClick={() => setInventorySearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* FEFO Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline/10 text-xs self-start sm:self-auto">
                {[
                  { id: 'ALL', label: 'Semua Status' },
                  { id: 'DANGER', label: 'Kritis (<3 Bln)' },
                  { id: 'WARNING', label: 'Waspada (<6 Bln)' },
                  { id: 'SAFE', label: 'Aman' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setInventoryFefoFilter(st.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      inventoryFefoFilter === st.id
                        ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline shrink-0 mr-1 flex items-center gap-1">
                <Tag className="h-3 w-3" /> Kategori:
              </span>
              {INVENTORY_CATEGORIES.map((cat) => {
                const count = cat === 'ALL'
                  ? inventoryItems.length
                  : inventoryItems.filter((i) => i.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setInventoryCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-all ${
                      inventoryCategory === cat
                        ? 'bg-primary text-white font-bold shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-outline/10'
                    }`}
                  >
                    {cat === 'ALL' ? 'Semua Kategori' : cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Active Query Status Indicator */}
            <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-0.5">
              <span>
                Menampilkan <strong>{filteredInventory.length}</strong> dari <strong>{inventoryItems.length}</strong> SKU produk aktif
              </span>
              {(inventorySearch || inventoryCategory !== 'ALL' || inventoryFefoFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setInventorySearch('');
                    setInventoryCategory('ALL');
                    setInventoryFefoFilter('ALL');
                  }}
                  className="text-primary hover:underline font-bold text-[10px] flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Reset Filter
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredInventory.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-low rounded-xl border border-outline/10 text-xs text-on-surface-variant space-y-2">
                <Boxes className="h-8 w-8 mx-auto text-outline" />
                <p className="font-semibold text-on-surface">Tidak ada SKU produk yang cocok dengan filter.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setInventorySearch('');
                    setInventoryCategory('ALL');
                    setInventoryFefoFilter('ALL');
                  }}
                  className="text-xs font-bold"
                >
                  Tampilkan Semua SKU
                </Button>
              </div>
            ) : (
              filteredInventory.map((sku) => {
                const fefoBadge =
                  sku.fefoStatus === 'DANGER' || sku.fefoStatus === 'EXPIRED'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : sku.fefoStatus === 'WARNING'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200';
                const barColor =
                  sku.stockCartons < 150
                    ? 'bg-red-600'
                    : sku.stockCartons < 250
                    ? 'bg-amber-500'
                    : 'bg-emerald-600';
                const fillPercent = Math.min(100, Math.round((sku.stockCartons / 500) * 100));

                const isTargeted = highlightedSku === sku.sku;
                return (
                  <div 
                    id={`sku-row-${sku.sku}`}
                    key={sku.id} 
                    className={`p-3.5 rounded-xl border transition-all duration-300 ${
                      isTargeted
                        ? 'bg-primary/10 border-primary ring-2 ring-primary/40 shadow-md'
                        : 'bg-surface-container-low border-outline/10 hover:border-outline/25'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Product identity & Clickable link to dossier */}
                      <div 
                        onClick={() => setSelectedProductDetail(sku)}
                        className="flex items-start gap-3 min-w-[260px] cursor-pointer group"
                        title="Klik untuk membuka Dossier & Spesifikasi Lengkap SKU"
                      >
                        <div className="relative w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center font-bold text-xs text-primary shrink-0 overflow-hidden border border-outline/15 group-hover:border-primary transition-colors">
                          {sku.imageUrl ? (
                            <img
                              src={sku.imageUrl}
                              alt={sku.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{sku.name.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors flex items-center gap-1.5">
                            <span>{sku.name}</span>
                            <Eye className="h-3 w-3 text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-[10px] text-on-surface-variant font-mono">
                            {sku.sku} • Batch: <strong>{sku.batchNumber}</strong> • Exp: {sku.daysUntilExpiry} hari lagi
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="flex-1 max-w-sm space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-on-surface-variant">
                            Stok Fisik Gudang: <strong className="text-on-surface font-mono">{sku.stockCartons} Dus</strong>
                          </span>
                          <span className="text-on-surface-variant font-mono">{formatRupiah(sku.cartonPrice)}/dus</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full`} style={{ width: `${fillPercent}%` }}></div>
                        </div>
                      </div>

                      {/* FEFO Pill & Action Controls */}
                      <div className="flex items-center gap-2.5 justify-between lg:justify-end flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${fefoBadge}`}>
                          FEFO: {sku.fefoStatus} ({sku.monthsUntilExpiry} bln)
                        </span>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedProductDetail(sku)}
                          title="Lihat Spesifikasi & Dossier Lengkap SKU"
                          className="h-7 text-xs font-bold gap-1 px-2.5 border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Detail SKU</span>
                        </Button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={mutatingId === sku.id}
                            onClick={() => handleAdjustStock(sku.id, -25)}
                            title="Kurangi 25 Dus"
                            className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-[11px] font-mono font-bold text-on-surface flex items-center gap-0.5"
                          >
                            <Minus className="h-3 w-3" />25
                          </button>
                          <button
                            type="button"
                            disabled={mutatingId === sku.id}
                            onClick={() => handleAdjustStock(sku.id, 50)}
                            title="Tambah 50 Dus"
                            className="px-2 py-1 rounded bg-primary/10 hover:bg-primary text-primary hover:text-white text-[11px] font-mono font-bold flex items-center gap-0.5 transition-colors"
                          >
                            <Plus className="h-3 w-3" />50
                          </button>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => setCurrentScreen && setCurrentScreen('restock-request')}
                          className="bg-primary text-white text-xs h-7 px-3 hover:bg-primary-container"
                        >
                          Restock PO
                        </Button>

                        <button
                          type="button"
                          disabled={mutatingId === sku.id}
                          onClick={() => setProductToDelete(sku)}
                          title="Hapus / Arsipkan SKU ini"
                          className="p-1.5 rounded hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wholesale Store Orders Queue & Partner Store Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Wholesale Orders State Machine (7 cols) */}
        <Card className="lg:col-span-7 border border-outline/10 shadow-xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-xs text-on-surface">Antrean Pesanan Grosir Mitra Toko</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-on-surface-variant">
                  {filteredOrders.length} dari {orders.length} Pesanan
                </span>
              </div>
            </div>

            {/* Quick Search & Filter for Orders */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Cari no. PO atau nama toko..."
                  className="w-full h-7 pl-7 pr-2 rounded-lg bg-surface-container-low border border-outline/20 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto text-[10px] no-scrollbar">
                {[
                  { id: 'ALL', label: 'Semua' },
                  { id: 'PENDING', label: 'Menunggu' },
                  { id: 'CONFIRMED', label: 'Dikonfirmasi' },
                  { id: 'PACKING', label: 'Dipacking' },
                  { id: 'DISPATCHED', label: 'Dikirim' },
                  { id: 'COMPLETED', label: 'Selesai' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setOrderStatusFilter(st.id)}
                    className={`px-2 py-1 rounded font-semibold whitespace-nowrap transition-all ${
                      orderStatusFilter === st.id
                        ? 'bg-primary text-white font-bold'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Instant Toast Feedback saat status PO dimajukan */}
            {orderAdvanceToast && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Status PO <strong>{orderAdvanceToast.trackingCode}</strong> ({orderAdvanceToast.storeName}) berhasil dimajukan ke: <strong>{orderAdvanceToast.status}</strong>!
                  </span>
                </div>
                <button
                  onClick={() => setOrderAdvanceToast(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold text-xs ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="p-6 text-center text-xs text-on-surface-variant bg-surface-container-low rounded-lg">
                  Tidak ada pesanan grosir yang cocok dengan filter.
                </div>
              ) : (
                filteredOrders.map((ord) => {
                  const nextAction = NEXT_ORDER_STATUS[ord.status];
                  return (
                    <div
                      key={ord.id}
                      className="p-3 bg-surface-container-low rounded-lg border border-outline/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:border-outline/25 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-primary">{ord.trackingCode}</span>
                          <span className="font-bold text-on-surface truncate">{ord.store?.name}</span>
                          <Badge variant="surface" className="text-[9px] py-0 px-1.5">{ord.store?.district}</Badge>
                        </div>
                        <div className="text-[11px] text-on-surface-variant mt-0.5">
                          {ord.itemsSummary} • <strong className="font-mono text-on-surface">{formatRupiah(ord.totalAmount)}</strong> ({ord.paymentMethodLabel})
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="text-[10px] h-7 px-2 gap-1 font-semibold"
                          title="Lihat Alur Status & Faktur Rincian"
                        >
                          <FileText className="h-3 w-3 text-primary" />
                          <span>Detail &amp; Alur</span>
                        </Button>

                        <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] font-mono font-bold">
                          {ord.status}
                        </span>

                        {nextAction && (
                          <Button
                            size="sm"
                            disabled={mutatingId === ord.id}
                            onClick={() => handleAdvanceOrder(ord.id, nextAction.status, ord)}
                            className="bg-primary text-white text-[11px] h-7 px-2.5 hover:bg-primary-container"
                          >
                            {mutatingId === ord.id ? '...' : nextAction.label}
                          </Button>
                        )}

                        {ord.status === 'DISPATCHED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentScreen && setCurrentScreen('order-tracking')}
                            className="text-[10px] h-7 px-2 text-primary border-primary/30 hover:bg-primary/10 font-bold"
                            title="Lacak armada pengiriman ke toko di Tracking & Dispatch"
                          >
                            <Truck className="h-3 w-3 mr-1" />
                            <span>Lacak</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Partner Stores Verification (5 cols) */}
        <Card className="lg:col-span-5 border border-outline/10 shadow-xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline/10 pb-3">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-xs text-on-surface">Direktori &amp; Verifikasi Mitra Toko Sidoarjo</h3>
              </div>
              <Badge variant="surface" className="text-[10px] font-mono">
                {filteredStores.length} dari {stores.length} Toko
              </Badge>
            </div>

            {/* Quick Search & District Filter for Stores */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
                <input
                  type="text"
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  placeholder="Cari toko, pemilik, HP..."
                  className="w-full h-7 pl-7 pr-2 rounded-lg bg-surface-container-low border border-outline/20 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                />
              </div>
              <select
                value={storeDistrictFilter}
                onChange={(e) => setStoreDistrictFilter(e.target.value)}
                className="h-7 px-2 rounded-lg bg-surface-container-low border border-outline/20 text-[11px] text-on-surface font-semibold focus:outline-none"
              >
                {uniqueDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d === 'ALL' ? 'Semua Kecamatan' : `Kec. ${d}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredStores.length === 0 ? (
                <div className="p-6 text-center text-xs text-on-surface-variant bg-surface-container-low rounded-lg">
                  Tidak ada toko mitra yang cocok dengan pencarian.
                </div>
              ) : (
                filteredStores.map((st) => (
                  <div
                    key={st.id}
                    className="p-2.5 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between gap-2 text-xs hover:border-outline/25 transition-all"
                  >
                    <div className="overflow-hidden min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-on-surface truncate">{st.name}</span>
                        <span className="text-[10px] text-outline font-mono">
                          ({(st.orders || []).length} PO)
                        </span>
                      </div>
                      <div className="text-[10px] text-on-surface-variant truncate">
                        {st.ownerName} • {st.district} • <span className="font-mono">{st.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedStoreProposal(st)}
                        className="text-[10px] h-7 px-2 gap-1 font-semibold hover:bg-surface-container"
                      >
                        <FileText className="h-3 w-3 text-primary" />
                        <span>Proposal &amp; PO</span>
                      </Button>

                      {st.isVerified ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ✓ Verified
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          disabled={mutatingId === st.id}
                          onClick={() => handleVerifyStore(st.id, true)}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] h-7 px-2.5"
                        >
                          Verifikasi
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: Active DO Tracking & Recent Sales Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Active Inbound Delivery Tracking Card: 6 cols */}
        <div className="lg:col-span-6 bg-surface-container-lowest p-5 rounded-xl border border-outline/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-outline/10 pb-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-xs text-on-surface">
                Lacak Surat Jalan Inbound {activeInbound?.doNumber || 'DO-2026-0881'}
              </h3>
            </div>
            <Button
              onClick={() => setCurrentScreen && setCurrentScreen('order-tracking')}
              variant="outline"
              size="sm"
              className="text-xs h-7"
            >
              Lihat Detail &amp; BAST
            </Button>
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Asal Pabrik:</span>
              <span className="font-bold text-on-surface">{activeInbound?.origin || 'Mayora Plant DC Pasuruan'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Armada / Driver:</span>
              <span className="font-mono text-on-surface">
                {activeInbound?.fleet?.plateNumber || 'W 9102 UP'} • {activeInbound?.fleet?.driverName || 'Slamet Riyadi'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Total Muatan:</span>
              <span className="font-bold text-primary">
                {activeInbound?.cargoSummary?.totalCartons || 850} Dus ({activeInbound?.status || 'IN_TRANSIT'})
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {(activeInbound?.milestones || []).map((m) => (
              <div key={m.step} className="flex items-center gap-2.5 text-xs">
                {m.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                )}
                <span className={m.completed ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}>
                  {m.title} ({m.time})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales Submission Feed: 6 cols */}
        <div className="lg:col-span-6 bg-surface-container-lowest p-5 rounded-xl border border-outline/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-outline/10 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-xs text-on-surface">Aktivitas Penjualan Harian Terbaru</h3>
            </div>
            <Button
              onClick={() => setCurrentScreen && setCurrentScreen('daily-sales-input')}
              size="sm"
              className="bg-primary text-white text-xs h-7 px-3"
            >
              + Input DSR Baru
            </Button>
          </div>

          <div className="space-y-2">
            {recentLogs.map((log, idx) => (
              <div key={log.dsrId || idx} className="p-2.5 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-on-surface">{log.storeName || 'Mitra Ritel Krian'}</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">
                    DSR: {log.operatorName || 'Bambang S.'} • {(log.productName || log.sku || '').split('(')[0]} ({log.quantityCartons} Dus)
                  </div>
                </div>
                <div className="font-bold font-mono text-on-surface text-right">
                  {formatRupiah(log.totalSalesAmount || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Tambah SKU Baru */}
      {isAddModalOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) resetAddForm(); }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest border border-outline/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-outline/10 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base text-on-surface">Tambah SKU Produk Baru</h3>
              </div>
              <button
                type="button"
                onClick={resetAddForm}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Kode SKU *</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.sku}
                    onChange={(e) => setNewProductForm({ ...newProductForm, sku: e.target.value.toUpperCase() })}
                    placeholder="Contoh: MYR-BIS-ROMA500-12"
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline/20 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Kategori Produk *</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline/20 font-semibold"
                  >
                    <option value="Biskuit">Biskuit</option>
                    <option value="Wafer">Wafer</option>
                    <option value="Cokelat">Cokelat</option>
                    <option value="Kopi">Kopi</option>
                    <option value="Sereal">Sereal</option>
                    <option value="Permen">Permen</option>
                    <option value="Minuman">Minuman</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface">Nama Lengkap Produk *</label>
                <input
                  type="text"
                  required
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  placeholder="Contoh: Roma Kelapa Kaleng 450g (1 Karton x 12 Kaleng)"
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline/20 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Harga Karton/Dus (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={newProductForm.cartonPrice}
                    onChange={(e) => setNewProductForm({ ...newProductForm, cartonPrice: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline/20 font-mono font-bold text-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Estimasi Harga Eceran (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={newProductForm.retailPriceEst}
                    onChange={(e) => setNewProductForm({ ...newProductForm, retailPriceEst: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline/20 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Stok Awal (Dus)</label>
                  <input
                    type="number"
                    min="0"
                    value={newProductForm.stockCartons}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stockCartons: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline/20 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">No. Batch FEFO *</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.batchNumber}
                    onChange={(e) => setNewProductForm({ ...newProductForm, batchNumber: e.target.value })}
                    placeholder="B-2026-N09"
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline/20 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Kedaluwarsa *</label>
                  <input
                    type="date"
                    required
                    value={newProductForm.expiryDate}
                    onChange={(e) => setNewProductForm({ ...newProductForm, expiryDate: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg bg-surface-container-low border border-outline/20 font-semibold"
                  />
                </div>
              </div>

              {/* Upload Foto Produk dengan Auto-Compress WebP & Supabase Storage */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-on-surface flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-primary" />
                    <span>Foto Produk (Auto-Compress WebP • Supabase Storage)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setImageUploadMode((m) => (m === 'upload' ? 'url' : 'upload'))}
                    className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    {imageUploadMode === 'upload' ? 'Gunakan Link URL' : 'Upload File Foto'}
                  </button>
                </div>

                {imageUploadMode === 'upload' ? (
                  <div className="space-y-2">
                    {!photoPreview ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                          isDragging
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-outline/25 hover:border-primary/50 hover:bg-surface-container-low'
                        } ${isCompressing ? 'opacity-60 pointer-events-none' : ''}`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center gap-1 text-on-surface-variant">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <UploadCloud className="h-5 w-5" />
                          </div>
                          <div className="text-xs font-bold text-on-surface">
                            {isCompressing ? 'Mengompresi Gambar ke WebP...' : 'Pilih Foto Produk atau Tarik ke Sini'}
                          </div>
                          <p className="text-[10px] text-on-surface-variant max-w-xs leading-normal">
                            Otomatis di-compress ke WebP ultra-ringan (&lt;35 KB) agar katalog cepat dan hemat bandwidth storage.
                          </p>
                          <div className="flex items-center gap-1.5 text-[9px] font-mono text-outline uppercase tracking-wider pt-0.5">
                            <span>JPG</span> • <span>PNG</span> • <span>WEBP</span> • <span>Auto Optimize</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-surface-container-low rounded-xl border border-outline/15 flex items-center justify-between gap-3 animate-in fade-in">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-black/5 shrink-0 border border-outline/20">
                            <img
                              src={photoPreview}
                              alt="Preview SKU"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0 right-0 bg-primary text-white text-[8px] font-bold px-1 rounded-tl">
                              {photoMetrics?.format || 'WebP'}
                            </span>
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="text-xs font-bold text-on-surface truncate">
                              {photoName || 'Foto Produk Terkompresi'}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                              {photoMetrics?.originalSizeStr && (
                                <span className="text-on-surface-variant line-through">
                                  {photoMetrics.originalSizeStr}
                                </span>
                              )}
                              <span className="font-bold text-primary font-mono">
                                ➔ {photoMetrics?.compressedSizeStr}
                              </span>
                              {photoMetrics?.savingsPercent > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                                  Hemat {photoMetrics.savingsPercent}%
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-emerald-700 font-medium block">
                              ✓ Siap disimpan ke Supabase Storage (Performa 100%)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 text-[11px] font-bold text-on-surface hover:bg-surface-container rounded-lg border border-outline/20"
                          >
                            Ganti
                          </button>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Hapus foto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/jpg"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="url"
                      value={newProductForm.imageUrl}
                      onChange={(e) => setNewProductForm({ ...newProductForm, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline/20 font-mono text-xs"
                    />
                    <span className="text-[10px] text-on-surface-variant block">
                      Gunakan link URL CDN eksternal jika tidak ingin mengupload file lokal.
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-outline/10 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetAddForm}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={submittingProduct || isCompressing}
                  size="sm"
                  className="bg-primary text-white text-xs font-bold px-4"
                >
                  {submittingProduct ? 'Menyimpan SKU...' : 'Simpan SKU ke Database'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus / Arsipkan SKU */}
      {productToDelete && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setProductToDelete(null); }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest border border-outline/15 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 cursor-default"
          >
            <div className="flex items-center gap-2.5 text-red-600">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface">Hapus / Nonaktifkan SKU Produk?</h3>
                <span className="text-[11px] text-on-surface-variant font-mono">{productToDelete.sku}</span>
              </div>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl text-xs space-y-1.5">
              <div className="font-bold text-on-surface">{productToDelete.name}</div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Stok Fisik Saat Ini:</span>
                <span className="font-bold font-mono text-on-surface">{productToDelete.stockCartons} Dus</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Nomor Batch:</span>
                <span className="font-mono text-on-surface">{productToDelete.batchNumber}</span>
              </div>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Jika produk ini memiliki riwayat transaksi pesanan grosir, sistem akan mengarsipkan statusnya agar riwayat keuangan dan faktur toko tidak rusak.
            </p>

            <div className="pt-2 border-t border-outline/10 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProductToDelete(null)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                size="sm"
                disabled={submittingProduct}
                onClick={handleDeleteProduct}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4"
              >
                {submittingProduct ? 'Memproses...' : 'Ya, Hapus / Arsip SKU'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Proposal Kemitraan & Rincian Pesanan Mitra Toko */}
      {selectedStoreProposal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedStoreProposal(null); }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest border border-outline/15 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] flex flex-col cursor-default"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-outline/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base text-on-surface">
                      {selectedStoreProposal.name}
                    </h3>
                    {selectedStoreProposal.isVerified ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ✓ Mitra Terverifikasi
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Menunggu Otorisasi Verifikasi
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant font-mono">
                    ID: REG-SDA-{selectedStoreProposal.id.slice(0, 8).toUpperCase()} • Terdaftar:{' '}
                    {new Date(selectedStoreProposal.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStoreProposal(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Info Grid Toko */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-surface-container-low rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-outline uppercase font-bold block">
                    Penanggung Jawab / Pemilik
                  </span>
                  <span className="font-bold text-on-surface">{selectedStoreProposal.ownerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-outline uppercase font-bold block">
                    Kontak WhatsApp / Telepon
                  </span>
                  <span className="font-mono font-bold text-primary">{selectedStoreProposal.phone}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-outline uppercase font-bold block">
                    Titik Distribusi &amp; Alamat Lengkap
                  </span>
                  <span className="text-on-surface font-medium flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    {selectedStoreProposal.address}, Kec. {selectedStoreProposal.district}, Kab. Sidoarjo
                  </span>
                </div>
              </div>

              {/* Section: Proposal Pesanan Grosir Toko */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" />
                    Proposal Pesanan &amp; Alokasi SKU Mitra (B2B Purchase Orders)
                  </h4>
                  <Badge variant="surface" className="text-[10px] font-mono">
                    {(selectedStoreProposal.orders || []).length} Pesanan Tercatat
                  </Badge>
                </div>

                {(selectedStoreProposal.orders || []).length > 0 ? (
                  <div className="space-y-3">
                    {selectedStoreProposal.orders.map((po) => (
                      <div
                        key={po.id}
                        className="p-3.5 bg-surface-container-lowest border border-outline/15 rounded-xl shadow-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline/10 pb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-primary text-xs">
                                {po.trackingCode}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container font-mono">
                                {po.status}
                              </span>
                            </div>
                            <span className="text-[10px] text-on-surface-variant font-mono">
                              Metode: {po.paymentMethod.replace(/_/g, ' ')} • Dibuat:{' '}
                              {new Date(po.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-on-surface-variant block">Total Nilai Tagihan</span>
                            <span className="font-mono font-bold text-sm text-on-surface">
                              {formatRupiah(po.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Table SKU Items */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-[10px] uppercase text-outline border-b border-outline/10">
                                <th className="pb-1.5 font-bold">SKU Produk</th>
                                <th className="pb-1.5 font-bold text-right">Kuantitas</th>
                                <th className="pb-1.5 font-bold text-right">Harga Dus</th>
                                <th className="pb-1.5 font-bold text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline/5 font-mono">
                              {(po.items || []).map((it) => (
                                <tr key={it.id}>
                                  <td className="py-2">
                                    <div className="font-sans font-bold text-on-surface">
                                      {it.product?.name || 'Produk Mayora'}
                                    </div>
                                    <span className="text-[10px] text-on-surface-variant">
                                      {it.product?.sku}
                                    </span>
                                  </td>
                                  <td className="py-2 text-right font-bold text-primary">
                                    {it.quantity} Dus
                                  </td>
                                  <td className="py-2 text-right text-on-surface-variant">
                                    {formatRupiah(it.unitPrice)}
                                  </td>
                                  <td className="py-2 text-right font-bold text-on-surface">
                                    {formatRupiah(it.subtotal)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {po.notes && (
                          <div className="p-2 bg-surface-container-low rounded-lg text-[11px] text-on-surface-variant italic">
                            Catatan Mitra: "{po.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-surface-container-low rounded-xl border border-outline/10 text-center space-y-2">
                    <Boxes className="h-8 w-8 text-outline mx-auto" />
                    <div className="font-bold text-xs text-on-surface">Belum Ada Pesanan Terbit</div>
                    <p className="text-[11px] text-on-surface-variant max-w-sm mx-auto">
                      Toko ini baru mengajukan permohonan kemitraan outlet resmi. Lakukan verifikasi agar toko dapat memesan SKU biskuit, wafer, dan sereal secara langsung melalui platform B2B.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-outline/10 flex items-center justify-between gap-2">
              <div>
                {!selectedStoreProposal.isVerified && (
                  <Button
                    size="sm"
                    disabled={mutatingId === selectedStoreProposal.id}
                    onClick={async () => {
                      await handleVerifyStore(selectedStoreProposal.id, true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {mutatingId === selectedStoreProposal.id
                        ? 'Memverifikasi...'
                        : 'Verifikasi Mitra Ini'}
                    </span>
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStoreProposal(null)}
                className="text-xs px-4"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detail Alur Pesanan Grosir & One-Way State Machine */}
      {selectedOrderDetails && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrderDetails(null); }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest border border-outline/15 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8 cursor-default"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-outline/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-on-surface">
                      {selectedOrderDetails.trackingCode}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container font-mono">
                      {selectedOrderDetails.status}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Toko: <strong>{selectedOrderDetails.store?.name}</strong> • {selectedOrderDetails.store?.district}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Visual Stepper (5 Steps) */}
            <div className="space-y-2">
              <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">
                Tahapan Pemrosesan Pesanan (Status Alur)
              </span>
              <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                {[
                  { key: 'PENDING', label: '1. Masuk' },
                  { key: 'CONFIRMED', label: '2. Konfirmasi' },
                  { key: 'PACKING', label: '3. Packing' },
                  { key: 'DISPATCHED', label: '4. Dikirim' },
                  { key: 'COMPLETED', label: '5. Selesai' },
                ].map((st, idx) => {
                  const statusIdxMap = { PENDING: 0, CONFIRMED: 1, PACKING: 2, DISPATCHED: 3, COMPLETED: 4 };
                  const currentIdx = statusIdxMap[selectedOrderDetails.status] ?? 0;
                  const isDone = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={st.key}
                      className={`p-2 rounded-lg border font-semibold transition-all ${
                        isCurrent
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-surface-container-low text-on-surface-variant/60 border-outline/10'
                      }`}
                    >
                      <div className="truncate">{st.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rincian Finansial & Produk */}
            <div className="p-3.5 bg-surface-container-low rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>Ringkasan Barang:</span>
                <span className="font-bold text-on-surface text-right">{selectedOrderDetails.itemsSummary}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Metode Pembayaran:</span>
                <span className="font-mono font-bold text-on-surface">
                  {selectedOrderDetails.paymentMethodLabel || selectedOrderDetails.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-outline/10 text-sm">
                <span className="font-bold text-on-surface">Total Tagihan:</span>
                <span className="font-mono font-black text-primary">
                  {formatRupiah(selectedOrderDetails.totalAmount)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-outline/10 flex items-center justify-between gap-2">
              <div>
                {NEXT_ORDER_STATUS[selectedOrderDetails.status] ? (
                  <Button
                    size="sm"
                    disabled={mutatingId === selectedOrderDetails.id}
                    onClick={() =>
                      handleAdvanceOrder(
                        selectedOrderDetails.id,
                        NEXT_ORDER_STATUS[selectedOrderDetails.status].status,
                        selectedOrderDetails
                      )
                    }
                    className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-4 gap-1.5 shadow-xs"
                  >
                    <span>
                      {mutatingId === selectedOrderDetails.id
                        ? 'Memproses...'
                        : `Lanjut: ${NEXT_ORDER_STATUS[selectedOrderDetails.status].label}`}
                    </span>
                  </Button>
                ) : (
                  <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Pesanan Selesai &amp; Lunas
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedOrderDetails.status === 'DISPATCHED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedOrderDetails(null);
                      setCurrentScreen && setCurrentScreen('order-tracking');
                    }}
                    className="text-xs text-primary"
                  >
                    Lacak Pengiriman ➔
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="text-xs"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Dossier & Spesifikasi Lengkap SKU FMCG (Rich READ Modal) */}
      {selectedProductDetail && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedProductDetail(null); }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest border border-outline/15 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[92vh] flex flex-col cursor-default"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-outline/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold font-mono text-sm border border-primary/20">
                  {selectedProductDetail.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base text-on-surface">
                      {selectedProductDetail.name}
                    </h3>
                    <Badge variant="surface" className="text-[10px] font-mono font-bold">
                      {selectedProductDetail.sku}
                    </Badge>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold">
                      {selectedProductDetail.category}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                    Official SKU PT Mayora Indah Tbk • Depo Surya Krian Logistik
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductDetail(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
              {/* Product Visual & Status Row */}
              <div className="flex flex-col sm:flex-row gap-4 p-4 bg-surface-container-low rounded-xl border border-outline/10">
                <div className="w-full sm:w-40 h-36 rounded-lg bg-black/5 overflow-hidden flex items-center justify-center shrink-0 border border-outline/15 relative">
                  {selectedProductDetail.imageUrl ? (
                    <img
                      src={selectedProductDetail.imageUrl}
                      alt={selectedProductDetail.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-outline gap-1">
                      <Boxes className="h-8 w-8" />
                      <span className="text-[10px]">Gambar Standar FMCG</span>
                    </div>
                  )}
                  <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                    {selectedProductDetail.category}
                  </span>
                </div>

                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-outline">
                      Kesiapan &amp; Kepatuhan FEFO
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        selectedProductDetail.fefoStatus === 'DANGER' || selectedProductDetail.fefoStatus === 'EXPIRED'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : selectedProductDetail.fefoStatus === 'WARNING'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      Rotasi FEFO: {selectedProductDetail.fefoStatus}
                    </span>
                  </div>

                  <div className="text-xs text-on-surface-variant leading-relaxed">
                    {selectedProductDetail.fefoRecommendation || 'Prioritas rotasi batch FEFO terstandarisasi ISO 9001 Mayora.'}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-outline/10 text-[11px]">
                    <div>
                      <span className="text-outline block text-[10px]">Batch Produksi Pabrik:</span>
                      <strong className="font-mono text-on-surface">{selectedProductDetail.batchNumber}</strong>
                    </div>
                    <div>
                      <span className="text-outline block text-[10px]">Tanggal Kedaluwarsa:</span>
                      <strong className="font-mono text-on-surface">
                        {new Date(selectedProductDetail.expiryDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })} ({selectedProductDetail.daysUntilExpiry} hari lagi)
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial & Commercial Valuation */}
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline/10 space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-outline block">
                  Analisis Finansial &amp; Margin Ritel Mitra
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-outline/10">
                    <span className="text-[10px] text-outline block">Harga Karton (Grosir)</span>
                    <span className="font-mono font-bold text-primary text-sm">
                      {formatRupiah(selectedProductDetail.cartonPrice)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-outline/10">
                    <span className="text-[10px] text-outline block">Estimasi Eceran Ritel</span>
                    <span className="font-mono font-bold text-on-surface text-sm">
                      {formatRupiah(selectedProductDetail.retailPriceEst)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-outline/10">
                    <span className="text-[10px] text-outline block">Margin Mitra per Dus</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      +{formatRupiah(selectedProductDetail.estimatedMarginPerCarton || 20000)}
                    </span>
                    <span className="text-[9px] text-emerald-800 block">
                      ({selectedProductDetail.estimatedMarginPercent || 9.3}%)
                    </span>
                  </div>
                  <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-outline/10">
                    <span className="text-[10px] text-outline block">Total Nilai Aset Stok</span>
                    <span className="font-mono font-extrabold text-on-surface text-sm">
                      {formatRupiah(selectedProductDetail.stockCartons * selectedProductDetail.cartonPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logistics, Palletizing & Warehouse Runway */}
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline/10 space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-outline block">
                  Logistik Pergudangan, Runway &amp; Penempatan Rak
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-outline block">Stok Fisik Depo:</span>
                    <strong className="text-sm font-mono text-on-surface block">
                      {selectedProductDetail.stockCartons} Karton
                    </strong>
                    <span className="text-[10px] text-on-surface-variant">
                      Kapasitas Terisi: ~{Math.min(100, Math.round((selectedProductDetail.stockCartons / 500) * 100))}% dari batas aman
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-outline block">Ketahanan Stok (Runway):</span>
                    <strong className="text-sm font-mono text-primary block">
                      ~{Math.round(selectedProductDetail.stockCartons / 14)} Hari Operasional
                    </strong>
                    <span className="text-[10px] text-on-surface-variant">
                      Rata-rata Penjualan ADS: ~14 dus/hari
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-outline block">Estimasi Volume &amp; Rak:</span>
                    <strong className="text-sm font-mono text-on-surface block">
                      {(selectedProductDetail.stockCartons * 0.042).toFixed(2)} m³ (CBM)
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      Zona Rak {selectedProductDetail.category.toUpperCase().slice(0, 3)}-0{(selectedProductDetail.stockCartons % 4) + 1}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-outline/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-on-surface-variant font-medium">
                  Penyesuaian Cepat:
                </span>
                <button
                  type="button"
                  disabled={mutatingId === selectedProductDetail.id}
                  onClick={async () => {
                    await handleAdjustStock(selectedProductDetail.id, -25);
                    setSelectedProductDetail((prev) => prev ? { ...prev, stockCartons: Math.max(0, prev.stockCartons - 25) } : prev);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-mono font-bold text-on-surface"
                >
                  -25 Dus
                </button>
                <button
                  type="button"
                  disabled={mutatingId === selectedProductDetail.id}
                  onClick={async () => {
                    await handleAdjustStock(selectedProductDetail.id, 50);
                    setSelectedProductDetail((prev) => prev ? { ...prev, stockCartons: prev.stockCartons + 50 } : prev);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-mono font-bold transition-colors"
                >
                  +50 Dus
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedProductDetail(null);
                    setCurrentScreen && setCurrentScreen('restock-request');
                  }}
                  className="bg-primary text-white text-xs font-bold px-3 gap-1 hover:bg-primary-container"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Restock PO</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProductDetail(null)}
                  className="text-xs px-4"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manifest Inbound & Surat Jalan Armada Pabrik (Rich READ Modal) */}
      {selectedInboundDetail && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedInboundDetail(null); }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest border border-outline/15 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8 cursor-default"
          >
            <div className="flex items-start justify-between border-b border-outline/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-on-surface">
                      Surat Jalan Inbound: {selectedInboundDetail.doNumber || 'DO-2026-0881'}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 font-mono">
                      {selectedInboundDetail.status || 'IN_TRANSIT'}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Pengiriman Antar-Fasilitas Mayora (Pabrik Pasuruan ➔ Depo Surya Krian)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInboundDetail(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Fleet & Driver Dossier */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-surface-container-low rounded-xl">
                <div>
                  <span className="text-[10px] text-outline uppercase font-bold block">Armada Truk &amp; Nopol</span>
                  <strong className="text-on-surface font-mono text-sm">
                    {selectedInboundDetail.fleet?.plateNumber || 'W 9102 UP'}
                  </strong>
                  <span className="text-[10px] text-on-surface-variant block">
                    {selectedInboundDetail.fleet?.vehicleType || 'Hino 500 Wingbox (24 Ton)'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-outline uppercase font-bold block">Pengemudi Otorisasi</span>
                  <strong className="text-on-surface text-sm">
                    {selectedInboundDetail.fleet?.driverName || 'Slamet Riyadi'}
                  </strong>
                  <span className="text-[10px] text-on-surface-variant block font-mono">
                    ID: DRV-0881 • SIM B2 Umum
                  </span>
                </div>
              </div>

              {/* Cargo Itemization */}
              <div className="p-3.5 bg-surface-container-low rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-outline uppercase font-bold block">Rincian Muatan FMCG Segel</span>
                  <span className="font-mono font-bold text-primary">
                    Total: {selectedInboundDetail.cargoSummary?.totalCartons || 850} Dus (~18.5 Ton)
                  </span>
                </div>
                <div className="space-y-1 pt-1">
                  {(selectedInboundDetail.cargoSummary?.items || [
                    { name: 'Roma Biskuit Kelapa 300g', cartons: 350, batch: 'BATCH-RK-2611A' },
                    { name: 'Beng-Beng Wafer Caramel 25g', cartons: 250, batch: 'BATCH-BB-2611B' },
                    { name: 'Teh Pucuk Harum 350ml', cartons: 150, batch: 'BATCH-TP-2603B' },
                    { name: 'Le Minerale 600ml', cartons: 100, batch: 'BATCH-LM-2604A' },
                  ]).map((item, idx) => (
                    <div key={idx} className="flex justify-between p-2 rounded bg-surface-container-lowest text-xs">
                      <div>
                        <strong className="text-on-surface">{item.name}</strong>
                        <span className="text-[10px] text-outline block font-mono">Batch: {item.batch}</span>
                      </div>
                      <span className="font-mono font-bold text-primary">{item.cartons} Dus</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GPS Timeline Milestones */}
              <div className="p-3.5 bg-surface-container-low rounded-xl space-y-2">
                <span className="text-[10px] text-outline uppercase font-bold block">Tracking Rute &amp; Posisi GPS</span>
                <div className="space-y-2 pt-1">
                  {(selectedInboundDetail.milestones || [
                    { step: 1, title: 'Muat Barang di Pabrik Pasuruan Plant 2', time: '06:30 WIB', completed: true },
                    { step: 2, title: 'Timbangan & Segel Kontainer Disetujui', time: '07:15 WIB', completed: true },
                    { step: 3, title: 'Perjalanan Tol Pandaan Menuju Exit Krian', time: '08:45 WIB', completed: false },
                    { step: 4, title: 'Bongkar Muat & Verifikasi FEFO Gudang Krian', time: 'Estimasi 09:30 WIB', completed: false },
                  ]).map((m) => (
                    <div key={m.step} className="flex items-center gap-2.5">
                      {m.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                      )}
                      <span className={m.completed ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}>
                        {m.title} ({m.time})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-outline/10 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInboundDetail(null)}
                className="text-xs px-4"
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
