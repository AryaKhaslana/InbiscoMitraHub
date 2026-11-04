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
  Compass
} from 'lucide-react';
import { Badge } from '../ui/badge';

// Geolocation master coordinates for 18 districts in Sidoarjo Regency
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
  title: 'Depo Inbisco Cabang Krian (Hub Logistik)',
  address: 'Jl. Raya Surabaya - Krian KM 28, Sidoarjo',
};

// Helper to create HTML DivIcon for sharp, crisp rendering without 404 image errors
function createMarkerIcon(type, title, subtitle) {
  let badgeColor = 'bg-primary text-white';
  let iconEmoji = '🚚';
  let ringColor = 'border-primary';

  if (type === 'depo') {
    badgeColor = 'bg-[#a80000] text-white';
    iconEmoji = '🏭';
    ringColor = 'border-[#a80000]';
  } else if (type === 'store') {
    badgeColor = 'bg-emerald-700 text-white';
    iconEmoji = '🏪';
    ringColor = 'border-emerald-600';
  }

  return L.divIcon({
    className: 'custom-fmcg-marker',
    html: `
      <div style="transform: translate(-50%, -100%);" class="flex flex-col items-center pointer-events-auto">
        <div class="px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md whitespace-nowrap mb-1 ${badgeColor} border border-white/20">
          ${title}
        </div>
        <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${badgeColor} text-sm">
          ${iconEmoji}
        </div>
        <div class="w-1.5 h-1.5 bg-black/40 rounded-full blur-[0.5px] mt-0.5"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function SidoarjoDeliveryMap({ orderData, height = 'h-[360px]' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [mapStyle, setMapStyle] = useState('carto'); // 'carto' (clean formal) | 'osm' (standard)
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract destination coordinates
  const districtKey = (orderData?.store?.district || orderData?.district || 'krian').toLowerCase().trim();
  const destCoords = SIDOARJO_DISTRICT_COORDS[districtKey] || SIDOARJO_DISTRICT_COORDS.krian;
  const storeName = orderData?.store?.name || orderData?.storeName || 'Toko Mitra Sidoarjo';
  const orderStatus = (orderData?.status || 'PENDING').toUpperCase();

  // Calculate simulated courier vehicle position along the route
  let progressRatio = 0.05;
  if (orderStatus === 'CONFIRMED') progressRatio = 0.15;
  else if (orderStatus === 'PACKING') progressRatio = 0.25;
  else if (orderStatus === 'DISPATCHED') progressRatio = 0.65;
  else if (orderStatus === 'COMPLETED') progressRatio = 1.0;

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
        .addAttribution('&copy; OpenStreetMap &copy; CARTO')
        .addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update base map tiles when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl =
      mapStyle === 'carto'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: 'abcd',
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
      icon: createMarkerIcon('depo', 'Depo Inbisco Krian', 'Hub Pasokan FMCG'),
    }).bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
        <strong style="color: #a80000;">🏭 PT Inbisco Niagatama Semesta</strong><br/>
        <span>Cabang Krian • Pusat Logistik Sidoarjo</span><br/>
        <small style="color: #666;">Jl. Raya Surabaya - Krian KM 28</small>
      </div>
    `);
    layers.addLayer(depoMarker);

    // 2. Destination Mitra Store Marker
    const storeMarker = L.marker([destCoords.lat, destCoords.lng], {
      icon: createMarkerIcon('store', storeName, destCoords.name),
    }).bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
        <strong style="color: #047857;">🏪 ${storeName}</strong><br/>
        <span>Toko Mitra Ritel Resmi</span><br/>
        <small style="color: #666;">Wilayah: ${destCoords.name}</small>
      </div>
    `);
    layers.addLayer(storeMarker);

    // 3. Route Polyline (Simulated road waypoints via key junction)
    // Sidoarjo artery waypoint (e.g. Sepanjang / Trosobo / Krian junction)
    const midLat = (DEPO_KRIAN.lat + destCoords.lat) / 2 + 0.005;
    const midLng = (DEPO_KRIAN.lng + destCoords.lng) / 2 - 0.005;
    const routePoints = [
      [DEPO_KRIAN.lat, DEPO_KRIAN.lng],
      [midLat, midLng],
      [destCoords.lat, destCoords.lng],
    ];

    // Background road shadow
    const routeShadow = L.polyline(routePoints, {
      color: '#9ca3af',
      weight: 6,
      opacity: 0.4,
      lineCap: 'round',
    });
    layers.addLayer(routeShadow);

    // Primary route line
    const routeLine = L.polyline(routePoints, {
      color: orderStatus === 'COMPLETED' ? '#10b981' : '#b91c1c',
      weight: 4,
      opacity: 0.9,
      dashArray: orderStatus === 'COMPLETED' ? null : '8, 6',
      lineCap: 'round',
    });
    layers.addLayer(routeLine);

    // 4. Moving Armada Vehicle Marker (Suzuki Carry Box)
    const vehicleMarker = L.marker([vehicleLat, vehicleLng], {
      icon: createMarkerIcon('vehicle', 'W 8821 NA (Carry)', 'Kurir: Bambang Triyono'),
    }).bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
        <strong>🚚 Suzuki Carry Box (W 8821 NA)</strong><br/>
        <span>Kurir Ritel: Bambang Triyono</span><br/>
        <small style="color: #666;">Status: ${orderStatus}</small>
      </div>
    `);
    layers.addLayer(vehicleMarker);

    // Fit map bounds to contain Depo, Vehicle, and Store with comfort padding
    const bounds = L.latLngBounds([
      [DEPO_KRIAN.lat, DEPO_KRIAN.lng],
      [destCoords.lat, destCoords.lng],
      [vehicleLat, vehicleLng],
    ]);
    map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });

    // Invalidate size in case of tab/modal container resize
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
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

  return (
    <div className={`rounded-2xl border border-surface-container-high bg-surface-container-lowest overflow-hidden shadow-xs transition-all duration-300 ${isExpanded ? 'h-[520px]' : height}`}>
      {/* Top Formal Logistics Header */}
      <div className="px-4 py-2.5 bg-surface-container-low border-b border-surface-container-high flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface font-display">
                Peta Rute Distribusi FMCG • Wilayah Sidoarjo
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant">
                Live Leaflet OpenStreetMap
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant font-medium">
              Rute Distribusi: <strong>Depo Krian</strong> ➔ <strong>{storeName}</strong> ({destCoords.name})
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={handleFitRoute}
            className="px-2 py-1 rounded-md text-[11px] font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline/10 transition-colors cursor-pointer flex items-center gap-1"
            title="Tampilkan Seluruh Rute"
          >
            <Compass className="h-3 w-3 text-primary" />
            <span>Lihat Rute</span>
          </button>

          <button
            type="button"
            onClick={() => setMapStyle(mapStyle === 'carto' ? 'osm' : 'carto')}
            className="px-2 py-1 rounded-md text-[11px] font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline/10 transition-colors cursor-pointer flex items-center gap-1"
            title="Ganti Tampilan Peta"
          >
            <Layers className="h-3 w-3 text-outline" />
            <span>{mapStyle === 'carto' ? 'Peta Bersih' : 'OSM Standar'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsExpanded(!isExpanded);
              setTimeout(() => mapInstanceRef.current?.invalidateSize(), 300);
            }}
            className="p-1 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            title={isExpanded ? 'Perkecil Peta' : 'Perbesar Peta'}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[calc(100%-80px)]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Quick Info Pill (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-md border border-outline/10 text-xs space-y-1 max-w-[260px] pointer-events-auto">
          <div className="flex items-center justify-between text-[11px] font-bold border-b border-outline/10 pb-1">
            <span className="flex items-center gap-1 text-primary">
              <Truck className="h-3.5 w-3.5" />
              Suzuki Carry Box
            </span>
            <span className="font-mono text-on-surface">W 8821 NA</span>
          </div>
          <div className="text-[10px] space-y-0.5 text-on-surface-variant">
            <div>Kurir Ritel: <strong className="text-on-surface">Bambang Triyono</strong></div>
            <div>Tujuan: <strong className="text-on-surface">{destCoords.name}</strong></div>
            <div className="flex items-center gap-1 text-emerald-700 font-semibold pt-0.5">
              {orderStatus === 'COMPLETED' ? (
                <>
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span>Muatan telah sampai di toko</span>
                </>
              ) : orderStatus === 'DISPATCHED' ? (
                <>
                  <Truck className="h-3 w-3 text-blue-600 animate-pulse" />
                  <span>Sedang melaju di rute Sidoarjo</span>
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 text-amber-600" />
                  <span>Menunggu giliran berangkat di depo</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Jump Buttons (Top Left) */}
        <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={handleCenterDepo}
            className="px-2 py-1 bg-white/95 backdrop-blur-md hover:bg-white text-[10px] font-bold text-on-surface rounded-lg shadow-sm border border-outline/15 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>🏭 Depo Krian</span>
          </button>
          <button
            type="button"
            onClick={handleCenterStore}
            className="px-2 py-1 bg-white/95 backdrop-blur-md hover:bg-white text-[10px] font-bold text-on-surface rounded-lg shadow-sm border border-outline/15 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>🏪 {storeName.substring(0, 14)}</span>
          </button>
        </div>
      </div>

      {/* Bottom Route Status Ticker */}
      <div className="px-4 py-1.5 bg-surface-container-low border-t border-surface-container-high flex items-center justify-between text-[11px] text-on-surface-variant">
        <div className="flex items-center gap-1.5 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
          <span className="truncate">
            Jaringan Pasokan FMCG Resmi Mayora • Menjangkau 18 Kecamatan Kabupaten Sidoarjo
          </span>
        </div>
        <span className="font-mono text-[10px] text-outline shrink-0 hidden sm:inline-block">
          Radius Operasional ~35 km
        </span>
      </div>
    </div>
  );
}
