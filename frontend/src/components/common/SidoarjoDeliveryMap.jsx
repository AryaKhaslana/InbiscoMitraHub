import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Store, 
  Building2, 
  ShieldCheck, 
  Clock, 
  Maximize2, 
  Minimize2,
  Layers,
  Compass,
  Phone,
  MessageCircle,
  Star,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

// Master coordinates for 18 districts across Sidoarjo Regency
const SIDOARJO_DISTRICT_COORDS = {
  krian: { lat: -7.4080, lng: 112.5890, name: 'Kecamatan Krian' },
  waru: { lat: -7.3512, lng: 112.7236, name: 'Kecamatan Waru' },
  taman: { lat: -7.3550, lng: 112.6840, name: 'Kecamatan Taman (Sepanjang)' },
  wonoayu: { lat: -7.4328, lng: 112.6312, name: 'Kecamatan Wonoayu' },
  sukodono: { lat: -7.4050, lng: 112.6780, name: 'Kecamatan Sukodono' },
  tarik: { lat: -7.4380, lng: 112.5120, name: 'Kecamatan Tarik' },
  sidoarjo: { lat: -7.4478, lng: 112.7183, name: 'Sidoarjo Kota' },
  sedati: { lat: -7.3780, lng: 112.7840, name: 'Kecamatan Sedati' },
  prambon: { lat: -7.4710, lng: 112.5780, name: 'Kecamatan Prambon' },
  balongbendo: { lat: -7.4010, lng: 112.5280, name: 'Kecamatan Balongbendo' },
  candi: { lat: -7.4820, lng: 112.7150, name: 'Kecamatan Candi' },
  tanggulangin: { lat: -7.5080, lng: 112.7100, name: 'Kecamatan Tanggulangin' },
  porong: { lat: -7.5350, lng: 112.6980, name: 'Kecamatan Porong' },
  gedangan: { lat: -7.3820, lng: 112.7310, name: 'Kecamatan Gedangan' },
  buduran: { lat: -7.4200, lng: 112.7220, name: 'Kecamatan Buduran' },
  krembung: { lat: -7.5250, lng: 112.6120, name: 'Kecamatan Krembung' },
  tulangan: { lat: -7.4720, lng: 112.6510, name: 'Kecamatan Tulangan' },
  jabon: { lat: -7.5580, lng: 112.7520, name: 'Kecamatan Jabon' },
};

// Base Origin: Depo PT Inbisco Niagatama Semesta Cabang Krian
const DEPO_KRIAN = {
  lat: -7.4042,
  lng: 112.5804,
  title: 'Depo Inbisco Krian (Hub Distribusi)',
  address: 'Jl. Raya Surabaya - Krian KM 28, Sidoarjo',
};

// Tokopedia/Shopee styled Map Marker Icons using crisp HTML DivIcons
function createShopeeTokpedMarker(type, title, subtitle) {
  if (type === 'depo') {
    return L.divIcon({
      className: 'tokped-depo-marker',
      html: `
        <div style="transform: translate(-50%, -100%);" class="flex flex-col items-center pointer-events-auto group cursor-pointer">
          <div class="px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg whitespace-nowrap mb-1 bg-[#a80000] text-white border-2 border-white flex items-center gap-1">
            <span>🏭</span>
            <span>${title}</span>
          </div>
          <div class="w-8 h-8 rounded-full bg-[#a80000] text-white flex items-center justify-center shadow-xl border-2 border-white text-sm group-hover:scale-110 transition-transform">
            🏭
          </div>
          <div class="w-2 h-1 bg-black/40 rounded-full blur-[1px] mt-0.5"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }

  if (type === 'store') {
    return L.divIcon({
      className: 'tokped-store-marker',
      html: `
        <div style="transform: translate(-50%, -100%);" class="flex flex-col items-center pointer-events-auto group cursor-pointer">
          <div class="px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg whitespace-nowrap mb-1 bg-emerald-600 text-white border-2 border-white flex items-center gap-1 animate-bounce">
            <span>📍</span>
            <span>Toko Anda: ${title}</span>
          </div>
          <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl border-2 border-white text-base group-hover:scale-110 transition-transform">
            🏪
          </div>
          <div class="w-2.5 h-1 bg-black/40 rounded-full blur-[1px] mt-0.5"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }

  // Courier Vehicle (Suzuki Carry Box) with pulsing halo beacon
  return L.divIcon({
    className: 'tokped-vehicle-marker',
    html: `
      <div style="transform: translate(-50%, -50%);" class="relative flex items-center justify-center pointer-events-auto cursor-pointer">
        <div class="absolute w-12 h-12 rounded-full bg-blue-500/30 animate-ping"></div>
        <div class="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl border-2 border-white text-base z-10 hover:scale-110 transition-transform">
          🚚
        </div>
        <div class="absolute top-10 px-2 py-0.5 rounded-md bg-white text-on-surface text-[9px] font-bold shadow-md border border-outline/20 whitespace-nowrap z-20 font-mono">
          W 8821 NA (Carry)
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function SidoarjoDeliveryMap({ orderData, height = 'h-[440px]' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [mapStyle, setMapStyle] = useState('esri'); // 'esri' (clean corporate) | 'osm' (standard open)
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract destination coordinates
  const districtKey = (orderData?.store?.district || orderData?.district || 'krian').toLowerCase().trim();
  const destCoords = SIDOARJO_DISTRICT_COORDS[districtKey] || SIDOARJO_DISTRICT_COORDS.krian;
  const storeName = orderData?.store?.name || orderData?.storeName || 'Toko Mitra Sidoarjo';
  const orderStatus = (orderData?.status || 'PENDING').toUpperCase();

  // Calculate simulated courier vehicle position along the route
  let progressRatio = 0.05;
  let etaMinutes = 25;
  if (orderStatus === 'CONFIRMED') {
    progressRatio = 0.15;
    etaMinutes = 20;
  } else if (orderStatus === 'PACKING') {
    progressRatio = 0.28;
    etaMinutes = 15;
  } else if (orderStatus === 'DISPATCHED') {
    progressRatio = 0.68;
    etaMinutes = 8;
  } else if (orderStatus === 'COMPLETED') {
    progressRatio = 1.0;
    etaMinutes = 0;
  }

  const vehicleLat = DEPO_KRIAN.lat + (destCoords.lat - DEPO_KRIAN.lat) * progressRatio;
  const vehicleLng = DEPO_KRIAN.lng + (destCoords.lng - DEPO_KRIAN.lng) * progressRatio;

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-7.4200, 112.6500],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Add zoom control at bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomleft', prefix: false })
        .addAttribution('&copy; OpenStreetMap &copy; Esri')
        .addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Set tile layer: Esri WorldStreetMap (100% Free, NO WATERMARK) vs OpenStreetMap (100% Free, NO WATERMARK)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Zero-watermark tile providers
    const tileUrl =
      mapStyle === 'esri'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);
  }, [mapStyle]);

  // Update Markers, Route Polyline, and Camera view when orderData changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // 1. Depo Krian Hub Marker (Origin)
    const depoMarker = L.marker([DEPO_KRIAN.lat, DEPO_KRIAN.lng], {
      icon: createShopeeTokpedMarker('depo', 'Depo Inbisco Krian', 'Pusat Pasokan FMCG'),
    }).bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5; padding: 2px;">
        <strong style="color: #a80000;">🏭 PT Inbisco Niagatama Semesta</strong><br/>
        <span>Pusat Distribusi Resmi Mayora Cabang Krian</span><br/>
        <small style="color: #666;">Jl. Raya Surabaya - Krian KM 28</small>
      </div>
    `);
    layers.addLayer(depoMarker);

    // 2. Destination Mitra Store Marker
    const storeMarker = L.marker([destCoords.lat, destCoords.lng], {
      icon: createShopeeTokpedMarker('store', storeName, destCoords.name),
    }).bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5; padding: 2px;">
        <strong style="color: #047857;">🏪 ${storeName}</strong><br/>
        <span>Toko Mitra Ritel Resmi Inbisco</span><br/>
        <small style="color: #666;">Wilayah: ${destCoords.name}</small>
      </div>
    `);
    layers.addLayer(storeMarker);

    // 3. Route Polyline (Simulated road waypoints via key Sidoarjo highway junction)
    const midLat = (DEPO_KRIAN.lat + destCoords.lat) / 2 + 0.005;
    const midLng = (DEPO_KRIAN.lng + destCoords.lng) / 2 - 0.005;
    const routePoints = [
      [DEPO_KRIAN.lat, DEPO_KRIAN.lng],
      [midLat, midLng],
      [destCoords.lat, destCoords.lng],
    ];

    // Background road track glow
    const routeShadow = L.polyline(routePoints, {
      color: '#93c5fd',
      weight: 8,
      opacity: 0.5,
      lineCap: 'round',
    });
    layers.addLayer(routeShadow);

    // Primary delivery route line (solid or dashed based on completion)
    const routeLine = L.polyline(routePoints, {
      color: orderStatus === 'COMPLETED' ? '#10b981' : '#2563eb',
      weight: 4,
      opacity: 0.95,
      dashArray: orderStatus === 'COMPLETED' ? null : '6, 6',
      lineCap: 'round',
    });
    layers.addLayer(routeLine);

    // 4. Moving Courier Vehicle Marker (Suzuki Carry Box)
    const vehicleMarker = L.marker([vehicleLat, vehicleLng], {
      icon: createShopeeTokpedMarker('vehicle', 'W 8821 NA (Carry)', 'Kurir: Bambang Triyono'),
    }).bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5; padding: 2px;">
        <strong style="color: #2563eb;">🚚 Suzuki Carry Box (W 8821 NA)</strong><br/>
        <span>Kurir: Bambang Triyono (Logistik Ritel)</span><br/>
        <small style="color: #666;">Status: ${orderStatus}</small>
      </div>
    `);
    layers.addLayer(vehicleMarker);

    // Fit map bounds to contain Depo, Vehicle, and Store with comfortable padding
    const bounds = L.latLngBounds([
      [DEPO_KRIAN.lat, DEPO_KRIAN.lng],
      [destCoords.lat, destCoords.lng],
      [vehicleLat, vehicleLng],
    ]);
    map.fitBounds(bounds, { padding: [55, 55], maxZoom: 14 });

    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [orderData, destCoords, vehicleLat, vehicleLng, orderStatus, storeName]);

  const handleCenterDepo = () => {
    mapInstanceRef.current?.setView([DEPO_KRIAN.lat, DEPO_KRIAN.lng], 14, { animate: true });
  };

  const handleCenterStore = () => {
    mapInstanceRef.current?.setView([destCoords.lat, destCoords.lng], 14, { animate: true });
  };

  const handleFitRoute = () => {
    const bounds = L.latLngBounds([
      [DEPO_KRIAN.lat, DEPO_KRIAN.lng],
      [destCoords.lat, destCoords.lng],
    ]);
    mapInstanceRef.current?.fitBounds(bounds, { padding: [45, 45], maxZoom: 14, animate: true });
  };

  const kurirWaUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(
    `Halo Mas Bambang (Kurir Inbisco Krian), saya dari toko ${storeName} (Kecamatan ${destCoords.name}). Mau tanya estimasi pengantaran pesanan resi ${orderData?.trackingCode || 'INB-2610'}. Terima kasih.`
  )}`;

  return (
    <div className={`rounded-2xl border border-surface-container-high bg-surface-container-lowest overflow-hidden shadow-md transition-all duration-300 flex flex-col ${isExpanded ? 'h-[620px]' : height}`}>
      {/* 1. SHOPEE / TOKOPEDIA STYLE LIVE STATUS HEADER */}
      <div className="p-4 bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low border-b border-surface-container-high flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-extrabold text-on-surface font-display">
                Pelacakan Pengantaran Kurir Langsung
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                orderStatus === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : orderStatus === 'DISPATCHED'
                  ? 'bg-blue-100 text-blue-800 animate-pulse'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>
                  {orderStatus === 'COMPLETED'
                    ? 'Pesanan Selesai (e-POD Valid)'
                    : orderStatus === 'DISPATCHED'
                    ? 'Kurir Sedang Mengantar ke Toko'
                    : 'Dalam Persiapan Gudang FEFO'}
                </span>
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Rute Distribusi: <strong>Depo Krian</strong> ➔ <strong>{storeName}</strong> ({destCoords.name})
            </p>
          </div>
        </div>

        {/* Quick Map Controls (Shopee/Tokped Style) */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            type="button"
            onClick={handleFitRoute}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline/15 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Lihat Seluruh Rute"
          >
            <Compass className="h-3.5 w-3.5 text-primary" />
            <span>Rute Penuh</span>
          </button>

          <button
            type="button"
            onClick={() => setMapStyle(mapStyle === 'esri' ? 'osm' : 'esri')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline/15 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Ganti Mode Tampilan Peta"
          >
            <Layers className="h-3.5 w-3.5 text-outline" />
            <span>{mapStyle === 'esri' ? 'Peta Bersih' : 'OSM'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsExpanded(!isExpanded);
              setTimeout(() => mapInstanceRef.current?.invalidateSize(), 300);
            }}
            className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline/15 shadow-2xs transition-colors cursor-pointer"
            title={isExpanded ? 'Kecilkan Peta' : 'Perbesar Peta Layar Penuh'}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN MAP CANVAS (WITH FLOATING COURIER CARD) */}
      <div className="relative flex-1 min-h-[240px]">
        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Quick Jump Buttons (Top Left) */}
        <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={handleCenterStore}
            className="px-3 py-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-xs font-bold text-emerald-800 rounded-xl shadow-md border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
          >
            <span>📍 Toko Saya</span>
          </button>
          <button
            type="button"
            onClick={handleCenterDepo}
            className="px-3 py-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-xs font-bold text-primary rounded-xl shadow-md border border-primary/20 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
          >
            <span>🏭 Hub Krian</span>
          </button>
        </div>

        {/* 3. SHOPEE / TOKOPEDIA FLOATING COURIER CARD (BOTTOM OVERLAY) */}
        <div className="absolute bottom-3 left-3 right-3 md:right-auto md:w-96 z-[400] bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-outline/15 pointer-events-auto space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Courier Info Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200 shadow-xs">
                BT
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-on-surface">Bambang Triyono</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                    ✓ Kurir Resmi
                  </span>
                </div>
                <div className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                  <span className="flex items-center text-amber-500 font-bold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" /> 4.9
                  </span>
                  <span>•</span>
                  <span className="font-mono font-semibold">Suzuki Carry (W 8821 NA)</span>
                </div>
              </div>
            </div>

            {/* ETA Badge */}
            <div className="text-right">
              <div className="text-[9px] uppercase font-bold text-outline">Estimasi Tiba</div>
              <div className="text-xs font-black font-mono text-primary">
                {orderStatus === 'COMPLETED' ? 'Tiba di Toko' : `~${etaMinutes} Menit`}
              </div>
            </div>
          </div>

          {/* Delivery Route Progress Subtitle */}
          <div className="p-2 bg-surface-container-low rounded-xl text-[11px] text-on-surface-variant flex items-center justify-between border border-outline/5">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="truncate">
                {orderStatus === 'COMPLETED'
                  ? 'Muatan telah diserahterimakan & e-POD ditandatangani.'
                  : orderStatus === 'DISPATCHED'
                  ? 'Kurir sedang melaju menuju lokasi tokomu di Sidoarjo.'
                  : 'Pesanan sedang dipersiapkan di Bay Loading Gudang Krian.'}
              </span>
            </div>
          </div>

          {/* Direct Tokopedia / Shopee Call-to-Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={kurirWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 text-center"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Chat WhatsApp</span>
            </a>

            <a
              href="tel:081234567890"
              className="py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all border border-outline/15 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 text-center"
            >
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>Hubungi Kurir</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4. FOOTER TIKER */}
      <div className="px-4 py-2 bg-surface-container-low border-t border-surface-container-high flex items-center justify-between text-[11px] text-on-surface-variant">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Pengiriman Resmi PT Inbisco Niagatama Semesta • Produk 100% Asli Mayora</span>
        </div>
        <span className="text-[10px] font-mono text-outline hidden sm:inline-block">
          Sidoarjo SCM Gateway
        </span>
      </div>
    </div>
  );
}
