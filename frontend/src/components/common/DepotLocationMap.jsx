import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Layers, 
  Crosshair, 
  ExternalLink, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Radio, 
  Building2, 
  Navigation2,
  Compass
} from 'lucide-react';
import { RAW_SVGS } from './CustomTrackingIcons';

// Depot Coordinates: PT Inbisco Niagatama Semesta - Cabang Krian
const DEPO_COORDS = [-7.4042, 112.5804];
const GOOGLE_MAPS_URL = `https://www.google.com/maps/dir/?api=1&destination=${DEPO_COORDS[0]},${DEPO_COORDS[1]}`;

const TILE_PROVIDERS = {
  streets: {
    name: 'Jalan HD',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Sidoarjo FMCG Network'
  },
  satellite: {
    name: 'Citra Satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery &mdash; Earthstar Geographics'
  }
};

export default function DepotLocationMap({ height = 'h-[300px]', className = '' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const circleRadiusRef = useRef(null);

  const [basemap, setBasemap] = useState('streets');
  const [showRadius, setShowRadius] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: DEPO_COORDS,
      zoom: 15,
      zoomControl: false,
      scrollWheelZoom: false, // Prevents unintended scroll hijack
      attributionControl: false
    });

    // Add initial tile layer (Esri HD Streets)
    const initialProvider = TILE_PROVIDERS[basemap] || TILE_PROVIDERS.streets;
    const tileLayer = L.tileLayer(initialProvider.url, {
      maxZoom: 19,
      subdomains: ['server', 'services'],
      attribution: initialProvider.attribution
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Create 3D Realistic Teardrop Pin Marker for Depo
    const depoIcon = L.divIcon({
      className: 'inbisco-depo-contact-marker',
      html: `
        <div style="transform: translate(-50%, -100%);" class="flex flex-col items-center pointer-events-auto group cursor-pointer">
          <div class="px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg whitespace-nowrap mb-1 bg-[#8b0000] text-white border border-white/70 flex items-center gap-1.5 transition-transform group-hover:scale-105">
            <span class="inline-flex items-center text-white/90">${RAW_SVGS.miniHub}</span>
            <span class="tracking-wide">Depo Inbisco Krian</span>
          </div>
          <div class="relative transition-transform group-hover:scale-110">
            <div class="absolute -inset-2 rounded-full bg-red-600/30 animate-ping pointer-events-none"></div>
            ${RAW_SVGS.realisticDepoPin}
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    const marker = L.marker(DEPO_COORDS, { icon: depoIcon }).addTo(map);

    // Rich popup content
    const popupHtml = `
      <div style="min-width: 220px; font-family: inherit;" class="p-1 text-slate-800">
        <div class="flex items-center gap-2 mb-1.5 border-b pb-1.5 border-slate-200">
          <div class="w-6 h-6 rounded-md bg-[#8b0000] text-white flex items-center justify-center text-xs font-bold shrink-0">
            IN
          </div>
          <div>
            <div class="font-extrabold text-xs text-slate-900 leading-tight">PT Inbisco Niagatama Semesta</div>
            <div class="text-[10px] text-red-700 font-semibold">Cabang Krian &bull; Pusat Distribusi FMCG</div>
          </div>
        </div>
        <div class="text-[11px] text-slate-600 space-y-1 mb-2">
          <p class="leading-snug">Jl. Raya Surabaya - Krian KM 28/29, Sidoarjo 61262</p>
          <p class="text-[10px] text-slate-500 font-mono">Koordinat: -7.4042&deg;S, 112.5804&deg;E</p>
        </div>
        <a 
          href="${GOOGLE_MAPS_URL}" 
          target="_blank" 
          rel="noopener noreferrer"
          style="display: flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 10px; background-color: #8b0000; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 11px; font-weight: 700;"
        >
          <span>Petunjuk Arah di Google Maps</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      </div>
    `;

    marker.bindPopup(popupHtml, {
      className: 'inbisco-map-popup',
      offset: [0, -42],
      closeButton: false
    });

    // Optional 20km FMCG Distribution Service Zone
    const radiusCircle = L.circle(DEPO_COORDS, {
      radius: 18000, // 18 km covers 18 districts of Sidoarjo
      color: '#8b0000',
      weight: 1.5,
      dashArray: '4, 6',
      fillColor: '#8b0000',
      fillOpacity: 0.05
    });
    circleRadiusRef.current = radiusCircle;

    mapInstanceRef.current = map;

    // Invalidate size after layout mounts
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Basemap Tiles
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const provider = TILE_PROVIDERS[basemap] || TILE_PROVIDERS.streets;
    tileLayerRef.current.setUrl(provider.url);
  }, [basemap]);

  // Toggle Coverage Radius
  useEffect(() => {
    if (!mapInstanceRef.current || !circleRadiusRef.current) return;
    if (showRadius) {
      circleRadiusRef.current.addTo(mapInstanceRef.current);
      mapInstanceRef.current.fitBounds(circleRadiusRef.current.getBounds(), { padding: [20, 20] });
    } else {
      circleRadiusRef.current.remove();
      mapInstanceRef.current.setView(DEPO_COORDS, 15);
    }
  }, [showRadius]);

  // Handle Resize on Expand
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const timer = setTimeout(() => {
      mapInstanceRef.current.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [isExpanded]);

  // Recenter map handler
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(DEPO_COORDS, 15, { animate: true });
  };

  // Copy coordinates handler
  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${DEPO_COORDS[0]}, ${DEPO_COORDS[1]}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border border-surface-container-high bg-surface-container-lowest shadow-xs flex flex-col ${className}`}>
      {/* Map Header Toolbar */}
      <div className="px-3.5 py-2.5 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2 truncate">
          <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <div className="truncate">
            <span className="font-extrabold text-xs text-on-surface block leading-tight truncate">
              Peta Depo & Distribusi
            </span>
            <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Cabang Krian, KM 28 Sidoarjo</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Basemap Switcher */}
          <div className="flex items-center bg-surface-container-lowest rounded-lg border border-surface-container-high p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setBasemap('streets')}
              className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                basemap === 'streets'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Tampilkan peta jalan detail"
            >
              Jalan
            </button>
            <button
              type="button"
              onClick={() => setBasemap('satellite')}
              className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                basemap === 'satellite'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Tampilkan citra satelit nyata bumi"
            >
              Satelit
            </button>
          </div>

          {/* Toggle Radius */}
          <button
            type="button"
            onClick={() => setShowRadius(!showRadius)}
            className={`p-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              showRadius
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-surface-container-lowest text-on-surface-variant border-surface-container-high hover:bg-surface-container'
            }`}
            title="Tampilkan radius jangkauan distribusi 18 kecamatan"
          >
            <Radio className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[10px]">Radius</span>
          </button>

          {/* Recenter */}
          <button
            type="button"
            onClick={handleRecenter}
            className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            title="Pusatkan kembali ke Depo Krian"
          >
            <Crosshair className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Map View Canvas */}
      <div className={`relative w-full ${isExpanded ? 'h-[440px]' : height} transition-all duration-300`}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Overlay Badge: Live GPS Geolocation status */}
        <div className="absolute bottom-2.5 left-2.5 z-[500] pointer-events-none">
          <div className="px-2.5 py-1 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md border border-surface-container-high text-[10px] text-on-surface shadow-md flex items-center gap-1.5">
            <Navigation2 className="h-3 w-3 text-primary animate-pulse rotate-45" />
            <span className="font-mono font-bold text-on-surface">Krian Logistical Hub</span>
            <span className="text-outline">&bull;</span>
            <span className="text-on-surface-variant text-[9px]">Sidoarjo Gateway</span>
          </div>
        </div>

        {/* Floating Expand Button */}
        <div className="absolute top-2.5 right-2.5 z-[500]">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md hover:bg-surface-container border border-surface-container-high text-on-surface-variant hover:text-on-surface shadow-xs transition-colors cursor-pointer"
            title={isExpanded ? 'Perkecil tampilan peta' : 'Perbesar tampilan peta'}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Map Footer Bar with Navigation & Coordinates */}
      <div className="px-3.5 py-2.5 bg-surface-container-lowest border-t border-surface-container-high flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-on-surface-variant text-[11px]">
          <span className="font-mono text-[10px] text-outline">
            {DEPO_COORDS[0]}, {DEPO_COORDS[1]}
          </span>
          <button
            type="button"
            onClick={handleCopyCoords}
            className="text-[10px] text-primary hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
            title="Salin koordinat GPS"
          >
            {copied ? (
              <>
                <Check className="h-2.5 w-2.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="h-2.5 w-2.5" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>

        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-[11px] shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Buka Rute di Google Maps</span>
          <ExternalLink className="h-3 w-3 opacity-80" />
        </a>
      </div>
    </div>
  );
}
