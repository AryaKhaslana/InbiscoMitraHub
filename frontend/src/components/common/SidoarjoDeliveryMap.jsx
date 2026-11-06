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
  CheckCircle2,
  ExternalLink,
  Radio,
  ArrowRight,
  Warehouse,
  Crosshair,
  Globe
} from 'lucide-react';
import { 
  RAW_SVGS, 
  StarSolidIcon, 
  WhatsAppSolidIcon, 
  SmartphoneDeviceIcon,
  calculateCompassBearing 
} from './CustomTrackingIcons';
import { api } from '../../services/api';

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

// Pure Vector SVG Map Markers (Realistic 3D Pins & Top-Down Vehicle)
function createRealisticDeliveryMarker(type, title, subtitle, isLiveDevice = false, headingDeg = 0) {
  if (type === 'depo') {
    return L.divIcon({
      className: 'inbisco-depo-marker',
      html: `
        <div style="transform: translate(-50%, -100%);" class="flex flex-col items-center pointer-events-auto group cursor-pointer">
          <div class="px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg whitespace-nowrap mb-1 bg-[#8b0000] text-white border border-white/70 flex items-center gap-1.5 transition-transform group-hover:scale-105">
            <span class="inline-flex items-center text-white/90">${RAW_SVGS.miniHub}</span>
            <span class="tracking-wide">${title}</span>
          </div>
          <div class="transition-transform group-hover:scale-110">
            ${RAW_SVGS.realisticDepoPin}
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }

  if (type === 'store') {
    return L.divIcon({
      className: 'inbisco-store-marker',
      html: `
        <div style="transform: translate(-50%, -100%);" class="flex flex-col items-center pointer-events-auto group cursor-pointer">
          <div class="px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg whitespace-nowrap mb-1 bg-[#059669] text-white border border-white/70 flex items-center gap-1.5 animate-bounce">
            <span class="inline-flex items-center text-white/90">${RAW_SVGS.miniPin}</span>
            <span class="tracking-wide">Toko: ${title}</span>
          </div>
          <div class="relative transition-transform group-hover:scale-110">
            <div class="absolute -inset-1.5 rounded-full bg-emerald-400/35 animate-ping pointer-events-none"></div>
            ${RAW_SVGS.realisticStorePin}
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }

  // Realistic Courier Vehicle (Suzuki Carry Box with dynamic heading)
  const haloColor = isLiveDevice ? 'bg-emerald-500/40' : 'bg-blue-600/30';
  const badgeClass = isLiveDevice 
    ? 'bg-slate-900/90 text-emerald-300 border-emerald-500/60' 
    : 'bg-slate-900/90 text-white border-white/20';

  return L.divIcon({
    className: 'inbisco-vehicle-marker',
    html: `
      <div style="transform: translate(-50%, -50%);" class="relative flex flex-col items-center justify-center pointer-events-auto cursor-pointer select-none">
        <!-- Floating License Plate Pill -->
        <div class="px-2 py-0.5 rounded-md ${badgeClass} text-[9px] font-bold shadow-md border whitespace-nowrap mb-1 font-mono flex items-center gap-1 z-30 backdrop-blur-md">
          <span class="w-1.5 h-1.5 rounded-full ${isLiveDevice ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}"></span>
          <span>${title}</span>
        </div>

        <!-- Realistic Suzuki Carry Box Vehicle Graphic with Directional Bearing Rotation -->
        <div class="relative flex items-center justify-center">
          <!-- Live GPS Radar Ring Pulse Under Chassis -->
          <div class="absolute -inset-3 rounded-full ${haloColor} animate-ping pointer-events-none"></div>
          
          <div style="transform: rotate(${headingDeg}deg); transform-origin: center center;" class="transition-transform duration-500 ease-out z-20 filter drop-shadow-md">
            ${RAW_SVGS.suzukiCarryBox}
          </div>
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

  // Map Basemap: 'esri_streets' (Peta Jalan HD) | 'esri_satellite' (Citra Satelit) | 'osm' (OpenStreetMap)
  const [mapStyle, setMapStyle] = useState('esri_streets');
  const [isExpanded, setIsExpanded] = useState(false);
  const [followCourier, setFollowCourier] = useState(false);
  const [roadGeometry, setRoadGeometry] = useState(null); // OSRM real road coordinates
  const [roadMeta, setRoadMeta] = useState({ distanceKm: 0, durationMin: 20 });
  const [liveDriverGps, setLiveDriverGps] = useState(null); // Telemetry from real driver phone
  const [prevCoord, setPrevCoord] = useState(null);

  // Extract destination coordinates
  const districtKey = (orderData?.store?.district || orderData?.district || 'krian').toLowerCase().trim();
  const destCoords = SIDOARJO_DISTRICT_COORDS[districtKey] || SIDOARJO_DISTRICT_COORDS.krian;
  const storeName = orderData?.store?.name || orderData?.storeName || 'Toko Mitra Sidoarjo';
  const orderStatus = (orderData?.status || 'PENDING').toUpperCase();
  const trackingCode = orderData?.trackingCode || 'INB-2610-KR06';

  // 1. Fetch real turn-by-turn road geometry from OSRM
  useEffect(() => {
    let isCancelled = false;
    const fetchOsrmRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${DEPO_KRIAN.lng},${DEPO_KRIAN.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('OSRM routing request failed');
        const data = await res.json();

        if (!isCancelled && data.code === 'Ok' && data.routes?.[0]) {
          const route = data.routes[0];
          const latLngs = route.geometry.coordinates.map((coord) => [coord[1], coord[0]]);
          setRoadGeometry(latLngs);
          setRoadMeta({
            distanceKm: Number((route.distance / 1000).toFixed(1)),
            durationMin: Math.max(5, Math.round(route.duration / 60)),
          });
        }
      } catch (err) {
        console.warn('OSRM routing fallback to waypoint geometry:', err.message);
        if (!isCancelled) {
          const midLat = (DEPO_KRIAN.lat + destCoords.lat) / 2 + 0.005;
          const midLng = (DEPO_KRIAN.lng + destCoords.lng) / 2 - 0.005;
          setRoadGeometry([
            [DEPO_KRIAN.lat, DEPO_KRIAN.lng],
            [midLat, midLng],
            [destCoords.lat, destCoords.lng],
          ]);
        }
      }
    };

    fetchOsrmRoute();
    return () => {
      isCancelled = true;
    };
  }, [destCoords.lat, destCoords.lng]);

  // 2. Poll real driver smartphone GPS telemetry from backend every 3.5 seconds
  useEffect(() => {
    let active = true;
    const checkDriverTelemetry = async () => {
      if (!trackingCode) return;
      try {
        const telemetry = await api.getDriverGps(trackingCode);
        if (active && telemetry && telemetry.lat && telemetry.lng) {
          setLiveDriverGps(telemetry);
        }
      } catch (e) {
        // quiet fallback
      }
    };

    checkDriverTelemetry();
    const interval = setInterval(checkDriverTelemetry, 3500);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [trackingCode]);

  // 3. Compute vehicle coordinate & dynamic road bearing
  let vehicleLat = DEPO_KRIAN.lat;
  let vehicleLng = DEPO_KRIAN.lng;
  let vehicleBearing = 90;
  const isLiveDevice = Boolean(liveDriverGps?.isLiveDevice && liveDriverGps?.lat && liveDriverGps?.lng);

  if (isLiveDevice) {
    vehicleLat = liveDriverGps.lat;
    vehicleLng = liveDriverGps.lng;
    if (prevCoord) {
      vehicleBearing = calculateCompassBearing(prevCoord.lat, prevCoord.lng, vehicleLat, vehicleLng) || 90;
    }
  } else if (roadGeometry && roadGeometry.length > 0) {
    let progressRatio = 0.05;
    if (orderStatus === 'CONFIRMED') progressRatio = 0.18;
    else if (orderStatus === 'PACKING') progressRatio = 0.35;
    else if (orderStatus === 'DISPATCHED') progressRatio = 0.72;
    else if (orderStatus === 'COMPLETED') progressRatio = 1.0;

    const targetIdx = Math.min(
      roadGeometry.length - 1,
      Math.floor((roadGeometry.length - 1) * progressRatio)
    );
    vehicleLat = roadGeometry[targetIdx][0];
    vehicleLng = roadGeometry[targetIdx][1];

    const nextIdx = Math.min(roadGeometry.length - 1, targetIdx + 1);
    vehicleBearing = calculateCompassBearing(
      roadGeometry[targetIdx][0],
      roadGeometry[targetIdx][1],
      roadGeometry[nextIdx][0],
      roadGeometry[nextIdx][1]
    );
  } else {
    const ratio = orderStatus === 'COMPLETED' ? 1.0 : orderStatus === 'DISPATCHED' ? 0.65 : 0.15;
    vehicleLat = DEPO_KRIAN.lat + (destCoords.lat - DEPO_KRIAN.lat) * ratio;
    vehicleLng = DEPO_KRIAN.lng + (destCoords.lng - DEPO_KRIAN.lng) * ratio;
    vehicleBearing = calculateCompassBearing(DEPO_KRIAN.lat, DEPO_KRIAN.lng, destCoords.lat, destCoords.lng);
  }

  // Update previous coordinate for next bearing delta
  useEffect(() => {
    setPrevCoord({ lat: vehicleLat, lng: vehicleLng });
  }, [vehicleLat, vehicleLng]);

  // 4. Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-7.4200, 112.6500],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.control.attribution({ position: 'bottomleft', prefix: false })
        .addAttribution('&copy; OpenStreetMap &copy; Esri &bull; Sidoarjo Logistics')
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

  // 5. Basemap tile provider (Esri HD Streets, Esri Satellite, or OpenStreetMap)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
    let maxZoom = 19;

    if (mapStyle === 'esri_satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapStyle === 'osm') {
      tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    L.tileLayer(tileUrl, {
      maxZoom,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);
  }, [mapStyle]);

  // 6. Draw realistic vector markers & road-following polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // 1. Depo Inbisco Krian Hub Marker (Origin)
    const depoMarker = L.marker([DEPO_KRIAN.lat, DEPO_KRIAN.lng], {
      icon: createRealisticDeliveryMarker('depo', 'Depo Inbisco Krian', 'Pusat Pasokan FMCG'),
    }).bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5; padding: 2px;">
        <strong style="color: #8b0000;">PT Inbisco Niagatama Semesta</strong><br/>
        <span>Pusat Distribusi Resmi Mayora Cabang Krian</span><br/>
        <small style="color: #666;">Jl. Raya Surabaya - Krian KM 28</small>
      </div>
    `);
    layers.addLayer(depoMarker);

    // 2. Destination Mitra Store Marker
    const storeMarker = L.marker([destCoords.lat, destCoords.lng], {
      icon: createRealisticDeliveryMarker('store', storeName, destCoords.name),
    }).bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5; padding: 2px;">
        <strong style="color: #047857;">${storeName}</strong><br/>
        <span>Toko Mitra Ritel Resmi Inbisco</span><br/>
        <small style="color: #666;">Wilayah: ${destCoords.name}</small>
      </div>
    `);
    layers.addLayer(storeMarker);

    // 3. Polyline following actual Sidoarjo road geometry
    const polylineCoords =
      roadGeometry && roadGeometry.length > 0
        ? roadGeometry
        : [
            [DEPO_KRIAN.lat, DEPO_KRIAN.lng],
            [destCoords.lat, destCoords.lng],
          ];

    // Road track glow underlay
    const roadUnderlay = L.polyline(polylineCoords, {
      color: '#60a5fa',
      weight: 8,
      opacity: 0.4,
      lineCap: 'round',
      lineJoin: 'round',
    });
    layers.addLayer(roadUnderlay);

    // Main navigation road line
    const roadTrack = L.polyline(polylineCoords, {
      color: orderStatus === 'COMPLETED' ? '#10b981' : '#2563eb',
      weight: 5,
      opacity: 0.95,
      dashArray: orderStatus === 'COMPLETED' ? null : '8, 8',
      lineCap: 'round',
      lineJoin: 'round',
    });
    layers.addLayer(roadTrack);

    // 4. Moving Courier Vehicle Marker (Realistic Top-Down Suzuki Carry Box)
    const vehicleTitle = isLiveDevice
      ? `GPS: ±${liveDriverGps.accuracy}m`
      : 'W 8821 NA (Carry)';

    const vehicleMarker = L.marker([vehicleLat, vehicleLng], {
      icon: createRealisticDeliveryMarker('vehicle', vehicleTitle, 'Kurir: Bambang Triyono', isLiveDevice, vehicleBearing),
    }).bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5; padding: 2px;">
        <strong style="color: #2563eb;">Suzuki Carry Box (W 8821 NA)</strong><br/>
        <span>Kurir: Bambang Triyono (Logistik Ritel)</span><br/>
        <small style="color: ${isLiveDevice ? '#059669' : '#666'};">
          ${isLiveDevice ? `Sinyal GPS HP Aktif (Akurasi: ±${liveDriverGps.accuracy}m • Speed: ${liveDriverGps.speed || 38} km/j)` : `Status Order: ${orderStatus}`}
        </small>
      </div>
    `);
    layers.addLayer(vehicleMarker);

    // Auto follow camera if toggled ON
    if (followCourier) {
      map.panTo([vehicleLat, vehicleLng], { animate: true, duration: 0.6 });
    } else {
      // Auto fit bounds
      const bounds = L.latLngBounds([
        [DEPO_KRIAN.lat, DEPO_KRIAN.lng],
        [destCoords.lat, destCoords.lng],
        [vehicleLat, vehicleLng],
      ]);
      map.fitBounds(bounds, { padding: [55, 55], maxZoom: 14 });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [
    destCoords.lat, 
    destCoords.lng, 
    destCoords.name, 
    storeName, 
    roadGeometry, 
    vehicleLat, 
    vehicleLng, 
    vehicleBearing, 
    orderStatus, 
    isLiveDevice, 
    liveDriverGps,
    followCourier
  ]);

  const handleCenterDepo = () => {
    mapInstanceRef.current?.setView([DEPO_KRIAN.lat, DEPO_KRIAN.lng], 14, { animate: true });
  };

  const handleCenterStore = () => {
    mapInstanceRef.current?.setView([destCoords.lat, destCoords.lng], 14, { animate: true });
  };

  const handleCenterVehicle = () => {
    mapInstanceRef.current?.setView([vehicleLat, vehicleLng], 15, { animate: true });
  };

  const handleFitRoute = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([
      [DEPO_KRIAN.lat, DEPO_KRIAN.lng],
      [destCoords.lat, destCoords.lng],
      [vehicleLat, vehicleLng],
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 14, animate: true });
  };

  const kurirWaUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(
    `Halo Mas Bambang (Kurir Inbisco Krian), saya dari toko ${storeName} (${destCoords.name}). Mau konfirmasi pengantaran pesanan nomor resi ${trackingCode}. Terima kasih.`
  )}`;

  return (
    <div className={`rounded-2xl border border-surface-container-high bg-surface-container-lowest overflow-hidden shadow-sm transition-all duration-300 flex flex-col ${isExpanded ? 'h-[620px]' : height}`}>
      {/* 1. TOP STATUS HEADER (CLEAN ENTERPRISE SCM) */}
      <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-extrabold text-on-surface font-display">
                Pelacakan Pengantaran Kurir Langsung
              </span>
              
              {/* Telemetry Indicator Pill */}
              {isLiveDevice ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>GPS HP Driver Aktif (±{liveDriverGps.accuracy}m)</span>
                </span>
              ) : (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                  orderStatus === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : orderStatus === 'DISPATCHED'
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    orderStatus === 'COMPLETED' 
                      ? 'bg-emerald-600' 
                      : orderStatus === 'DISPATCHED' 
                      ? 'bg-blue-600 animate-pulse' 
                      : 'bg-amber-600'
                  }`}></span>
                  <span>
                    {orderStatus === 'COMPLETED'
                      ? 'Pesanan Selesai (e-POD Valid)'
                      : orderStatus === 'DISPATCHED'
                      ? 'Kurir Sedang Mengantar ke Toko'
                      : 'Dalam Persiapan Gudang FEFO'}
                  </span>
                </span>
              )}
            </div>

            <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1 flex-wrap">
              <span>Rute Fisik:</span>
              <strong className="text-on-surface">Depo Krian</strong>
              <ArrowRight className="h-3 w-3 text-outline inline" />
              <strong className="text-on-surface">{storeName}</strong>
              <span className="text-outline">({destCoords.name})</span>
              {roadMeta.distanceKm > 0 && (
                <span className="font-mono font-semibold text-primary ml-1">
                  • {roadMeta.distanceKm} km ({roadMeta.durationMin} mnt)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Quick Map Controls (Map Mode Switcher & Follow Courier) */}
        <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
          {/* Segmented Map Style Selector */}
          <div className="flex items-center bg-surface-container-lowest p-0.5 rounded-lg border border-outline/15 shadow-2xs">
            <button
              type="button"
              onClick={() => setMapStyle('esri_streets')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                mapStyle === 'esri_streets'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Peta Jalan HD (Seperti Google Maps)"
            >
              Jalan HD
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('esri_satellite')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                mapStyle === 'esri_satellite'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Citra Satelit Bumi Asli (Earth Observation)"
            >
              Satelit
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('osm')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                mapStyle === 'osm'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="OpenStreetMap Standar"
            >
              OSM
            </button>
          </div>

          {/* Follow Courier Button */}
          <button
            type="button"
            onClick={() => setFollowCourier(!followCourier)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer ${
              followCourier
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface border-outline/15'
            }`}
            title="Kunci kamera untuk selalu mengikuti posisi kurir secara otomatis"
          >
            <Crosshair className={`h-3.5 w-3.5 ${followCourier ? 'animate-spin' : 'text-blue-600'}`} />
            <span>{followCourier ? 'Ikuti: ON' : 'Ikuti Kurir'}</span>
          </button>

          <button
            type="button"
            onClick={handleFitRoute}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline/15 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Lihat Rute Penuh"
          >
            <Compass className="h-3.5 w-3.5 text-primary" />
            <span>Rute Penuh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsExpanded(!isExpanded);
              setTimeout(() => mapInstanceRef.current?.invalidateSize(), 250);
            }}
            className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline/15 shadow-2xs transition-colors cursor-pointer"
            title={isExpanded ? 'Kecilkan Peta' : 'Perbesar Peta Layar Penuh'}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN MAP CANVAS (WITH COCKPIT HUD & FLOATING COURIER CARD) */}
      <div className="relative flex-1 min-h-[260px]">
        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Quick Jump Buttons (Top Left) */}
        <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={handleCenterStore}
            className="px-3 py-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-xs font-bold text-emerald-800 rounded-xl shadow-md border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Store className="h-3.5 w-3.5 text-emerald-700" />
            <span>Toko Tujuan</span>
          </button>
          <button
            type="button"
            onClick={handleCenterVehicle}
            className="px-3 py-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-xs font-bold text-blue-700 rounded-xl shadow-md border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Truck className="h-3.5 w-3.5 text-blue-700" />
            <span>Posisi Kurir</span>
          </button>
          <button
            type="button"
            onClick={handleCenterDepo}
            className="px-3 py-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-xs font-bold text-primary rounded-xl shadow-md border border-primary/20 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Warehouse className="h-3.5 w-3.5 text-primary" />
            <span>Hub Krian</span>
          </button>
        </div>

        {/* Top Right Cockpit HUD Telemetry */}
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5 pointer-events-auto items-end">
          <div className="bg-slate-900/90 backdrop-blur-md text-white rounded-xl px-3 py-1.5 border border-white/15 shadow-md flex items-center gap-2.5 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isLiveDevice ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`}></span>
              <span className="font-bold text-[11px] tracking-wide">
                {isLiveDevice ? `GPS LIVE (±${liveDriverGps.accuracy}m)` : 'RUTE JALAN TERENCANA'}
              </span>
            </div>
            <span className="text-white/40">•</span>
            <span className="text-emerald-400 font-bold text-[11px]">
              {isLiveDevice ? `${liveDriverGps.speed || 38} km/j` : '38 km/j'}
            </span>
          </div>
        </div>

        {/* 3. ENTERPRISE COURIER DOSSIER CARD (BOTTOM OVERLAY) */}
        <div className="absolute bottom-3 left-3 right-3 md:right-auto md:w-96 z-[400] bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-outline/15 pointer-events-auto space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Courier Info Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200 shadow-2xs font-mono">
                BT
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-on-surface">Bambang Triyono</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-2.5 w-2.5 text-blue-700" />
                    <span>Kurir Resmi</span>
                  </span>
                </div>
                <div className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                  <span className="flex items-center text-amber-500 font-bold gap-0.5">
                    <StarSolidIcon className="h-3 w-3 text-amber-500 fill-amber-400" /> 4.9
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
                {orderStatus === 'COMPLETED' ? 'Tiba di Toko' : `~${roadMeta.durationMin} Menit`}
              </div>
            </div>
          </div>

          {/* Delivery Telemetry HUD Notification */}
          <div className={`p-2 rounded-xl text-[11px] flex items-center justify-between border ${
            isLiveDevice
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-surface-container-low text-on-surface-variant border-outline/5'
          }`}>
            <div className="flex items-center gap-2 truncate">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isLiveDevice ? 'bg-emerald-500 animate-pulse' : 'bg-primary'}`}></span>
              <span className="truncate">
                {isLiveDevice
                  ? `Sinyal GPS HP Driver Aktif • Kecepatan: ${liveDriverGps.speed || 38} km/j`
                  : orderStatus === 'COMPLETED'
                  ? 'Muatan telah diserahterimakan & e-POD ditandatangani.'
                  : orderStatus === 'DISPATCHED'
                  ? 'Kurir melaju via jalan arteri Sidoarjo menuju tokomu.'
                  : 'Pesanan disiapkan di Gudang Krian (batch FEFO).'}
              </span>
            </div>
          </div>

          {/* Action Buttons: WhatsApp & Phone */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={kurirWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 text-center"
            >
              <WhatsAppSolidIcon className="h-3.5 w-3.5 text-white" />
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

          {/* Driver Phone Geolocation Portal Direct Link */}
          <div className="pt-1 border-t border-outline/10 flex items-center justify-between">
            <span className="text-[10px] text-outline flex items-center gap-1">
              <Radio className="h-3 w-3 text-primary" />
              <span>Sensor GPS HP Driver:</span>
            </span>
            <a
              href="/driver"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              title="Buka portal pemancar GPS di smartphone driver"
            >
              <SmartphoneDeviceIcon className="h-3 w-3" />
              <span>{isLiveDevice ? 'HP Terhubung (Buka Portal)' : 'Buka Portal HP Driver (Uji Coba)'}</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 4. FOOTER TICKER */}
      <div className="px-4 py-2 bg-surface-container-low border-t border-surface-container-high flex items-center justify-between text-[11px] text-on-surface-variant">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Pengiriman Resmi PT Inbisco Niagatama Semesta • Produk 100% Asli Mayora</span>
        </div>
        <span className="text-[10px] font-mono text-outline hidden sm:inline-block">
          Sidoarjo SCM Gateway • OSRM Snapped Routing
        </span>
      </div>
    </div>
  );
}
