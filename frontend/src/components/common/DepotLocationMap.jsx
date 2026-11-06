import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Building2, 
  Layers, 
  Crosshair, 
  ExternalLink, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Radio, 
  Phone,
  Navigation2,
  Compass,
  MapPin,
  Warehouse,
  ShieldCheck
} from 'lucide-react';
import { RAW_SVGS } from './CustomTrackingIcons';

// Verified Real Facilities of PT Inbisco Niagatama Semesta (Mayora Group) in East Java
export const INBISCO_FACILITIES = [
  {
    id: 'krian',
    type: 'rdc',
    badge: 'Regional DC (Utama)',
    title: 'Depo Inbisco Cabang Krian',
    fullName: 'PT Inbisco Niagatama Semesta — Cabang Krian',
    role: 'Regional Distribution Center Sidoarjo',
    address: 'Jl. Raya Ponokawan No. Km. 27 No. 8, Karangpoh, Ponokawan, Kec. Krian, Kabupaten Sidoarjo, Jawa Timur 61262',
    shortAddress: 'Jl. Raya Ponokawan Km. 27 No. 8, Krian, Sidoarjo',
    phone: '+62 31 8983290',
    displayPhone: '(031) 8983290',
    coords: [-7.3930, 112.5980],
    isPrimary: true,
    coverage: '18 Kecamatan se-Kabupaten Sidoarjo & Sekitarnya',
    googleSearchUrl: 'https://www.google.com/search?q=pt.+inbisco+niagatama+semesta+mayora+group+alamat&ludocid=12706558823106029316',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=-7.3930,112.5980',
    color: '#8b0000'
  },
  {
    id: 'kalianak',
    type: 'hub',
    badge: 'Hub Pergudangan',
    title: 'Pergudangan Kalianak 55',
    fullName: 'PT Inbisco Niagatama Semesta — Hub Kalianak 55',
    role: 'Buffer Stock & Gateway Surabaya Barat',
    address: 'Jl. Kalianak 55 No. 55, Genting Kalianak, Kec. Asem Rowo, Surabaya, Jawa Timur 60182 (Pergudangan 55 / Kalianak Barat)',
    shortAddress: 'Pergudangan 55, Jl. Kalianak Barat No. 55SC, Surabaya',
    phone: '+62 31 7490055',
    displayPhone: '(031) 7490055',
    coords: [-7.2367, 112.7059],
    isPrimary: false,
    coverage: 'Kawasan Industri Pantura & Jalur Logistik Surabaya Barat',
    googleSearchUrl: 'https://idalamat.com/alamat/pt-inbisco-niagatama-semesta-mayora-group-742970',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=-7.2367,112.7059',
    color: '#1e3a8a'
  },
  {
    id: 'kendangsari',
    type: 'office',
    badge: 'Kantor Perwakilan',
    title: 'Kantor Kendangsari Surabaya',
    fullName: 'PT Inbisco Niagatama Semesta — Kendangsari',
    role: 'Kantor Perwakilan Komersial Jawa Timur',
    address: 'Jl. Kendangsari YKP Blok A No. 7, Tenggilis Mejoyo, Kota Surabaya, Jawa Timur 60292',
    shortAddress: 'Jl. Kendangsari YKP Blok A No. 7, Surabaya',
    phone: '+62 31 8432177',
    displayPhone: '(031) 8432177',
    coords: [-7.3244, 112.7497],
    isPrimary: false,
    coverage: 'Administrasi Regional & Korespondensi Korporat Jatim',
    googleSearchUrl: 'https://id1625947-inbisco-niagatama-semesta-pt.contact.page/',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=-7.3244,112.7497',
    color: '#0f766e'
  }
];

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

export default function DepotLocationMap({ height = 'h-[320px]', className = '', onFacilitySelect }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});
  const circleRadiusRef = useRef(null);

  const [activeFacilityId, setActiveFacilityId] = useState('krian');
  const [basemap, setBasemap] = useState('streets');
  const [showRadius, setShowRadius] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFacility = INBISCO_FACILITIES.find(f => f.id === activeFacilityId) || INBISCO_FACILITIES[0];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: activeFacility.coords,
      zoom: 15,
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: false
    });

    // Basemap Layer
    const initialProvider = TILE_PROVIDERS[basemap] || TILE_PROVIDERS.streets;
    const tileLayer = L.tileLayer(initialProvider.url, {
      maxZoom: 19,
      subdomains: ['server', 'services'],
      attribution: initialProvider.attribution
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Radius Circle for Krian Sidoarjo Distribution
    const primaryFacility = INBISCO_FACILITIES[0];
    const radiusCircle = L.circle(primaryFacility.coords, {
      radius: 18000, // 18 km covers 18 districts of Sidoarjo
      color: '#8b0000',
      weight: 1.5,
      dashArray: '5, 8',
      fillColor: '#8b0000',
      fillOpacity: 0.05
    });
    circleRadiusRef.current = radiusCircle;

    // Create markers for all 3 facilities
    INBISCO_FACILITIES.forEach(fac => {
      const isPrimary = fac.isPrimary;
      const markerHtml = `
        <div style="transform: translate(-50%, -100%);" class="flex flex-col items-center pointer-events-auto group cursor-pointer">
          <div class="px-2 py-0.5 rounded-full text-[9px] font-bold shadow-lg whitespace-nowrap mb-1 text-white border border-white/80 flex items-center gap-1 transition-transform group-hover:scale-105" style="background-color: ${fac.color};">
            <span class="inline-flex items-center text-white/90">${RAW_SVGS.miniHub}</span>
            <span class="tracking-wide">${fac.title}</span>
          </div>
          <div class="relative transition-transform group-hover:scale-110">
            ${isPrimary ? '<div class="absolute -inset-2 rounded-full bg-red-600/35 animate-ping pointer-events-none"></div>' : ''}
            ${RAW_SVGS.realisticDepoPin}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: `inbisco-marker-${fac.id}`,
        html: markerHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const popupContent = `
        <div style="min-width: 240px; font-family: inherit;" class="p-1 text-slate-800">
          <div class="flex items-center gap-2 mb-1.5 border-b pb-1.5 border-slate-200">
            <div class="w-6 h-6 rounded-md text-white flex items-center justify-center text-xs font-bold shrink-0" style="background-color: ${fac.color};">
              IN
            </div>
            <div>
              <div class="font-extrabold text-xs text-slate-900 leading-tight">${fac.fullName}</div>
              <div class="text-[10px] font-semibold text-slate-600">${fac.role}</div>
            </div>
          </div>
          <div class="text-[11px] text-slate-600 space-y-1 mb-2">
            <p class="leading-snug">${fac.address}</p>
            <p class="text-[10px] text-slate-700 font-mono font-semibold">Telp: ${fac.displayPhone}</p>
            <p class="text-[10px] text-slate-500 font-mono">GPS: ${fac.coords[0]}, ${fac.coords[1]}</p>
          </div>
          <a 
            href="${fac.googleMapsUrl}" 
            target="_blank" 
            rel="noopener noreferrer"
            style="display: flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 10px; background-color: ${fac.color}; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 11px; font-weight: 700;"
          >
            <span>Petunjuk Arah Google Maps</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>
      `;

      const marker = L.marker(fac.coords, { icon: customIcon }).addTo(map);
      marker.bindPopup(popupContent, {
        className: 'inbisco-map-popup',
        offset: [0, -42],
        closeButton: false
      });

      marker.on('click', () => {
        setActiveFacilityId(fac.id);
        if (onFacilitySelect) onFacilitySelect(fac);
      });

      markersRef.current[fac.id] = marker;
    });

    mapInstanceRef.current = map;

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

  // Handle Facility Selection Switch
  const handleSelectFacility = (fac) => {
    setActiveFacilityId(fac.id);
    if (onFacilitySelect) onFacilitySelect(fac);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(fac.coords, 15, { duration: 1.2 });
      const targetMarker = markersRef.current[fac.id];
      if (targetMarker) {
        setTimeout(() => {
          targetMarker.openPopup();
        }, 1250);
      }
    }
  };

  // Toggle Sidoarjo Distribution Radius
  useEffect(() => {
    if (!mapInstanceRef.current || !circleRadiusRef.current) return;
    if (showRadius) {
      circleRadiusRef.current.addTo(mapInstanceRef.current);
      mapInstanceRef.current.fitBounds(circleRadiusRef.current.getBounds(), { padding: [25, 25] });
    } else {
      circleRadiusRef.current.remove();
      mapInstanceRef.current.setView(activeFacility.coords, 15);
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

  // Fit all 3 East Java hubs
  const handleViewAllHubs = () => {
    if (!mapInstanceRef.current) return;
    const group = L.featureGroup(Object.values(markersRef.current));
    mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
  };

  // Copy coordinates
  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${activeFacility.coords[0]}, ${activeFacility.coords[1]}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-surface-container-high bg-surface-container-lowest shadow-xs flex flex-col ${className}`}>
      {/* 1. Facility Quick Tabs (Krian, Kalianak, Kendangsari) */}
      <div className="px-3 pt-3 pb-2 bg-surface-container-low border-b border-surface-container-high">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Jaringan Logistik Jawa Timur</span>
          </div>
          <button
            type="button"
            onClick={handleViewAllHubs}
            className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
            title="Tampilkan semua 3 titik fasilitas di Jawa Timur"
          >
            <span>Lihat Semua Titik (3 Hub)</span>
          </button>
        </div>

        {/* Facility Pill Selector */}
        <div className="grid grid-cols-3 gap-1.5">
          {INBISCO_FACILITIES.map(fac => {
            const isSelected = fac.id === activeFacilityId;
            return (
              <button
                key={fac.id}
                type="button"
                onClick={() => handleSelectFacility(fac)}
                className={`py-1.5 px-2 rounded-xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-surface-container-lowest border-primary text-on-surface shadow-xs ring-1 ring-primary/20'
                    : 'bg-surface-container/60 hover:bg-surface-container border-transparent text-on-surface-variant'
                }`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span 
                    className="w-1.5 h-1.5 rounded-full shrink-0" 
                    style={{ backgroundColor: fac.color }}
                  />
                  <span className="text-[10px] font-extrabold truncate block">
                    {fac.id === 'krian' ? 'Depo Krian' : fac.id === 'kalianak' ? 'Kalianak 55' : 'Kendangsari'}
                  </span>
                </div>
                <div className="text-[9px] text-outline truncate leading-none">
                  {fac.id === 'krian' ? 'Sidoarjo (RDC)' : fac.id === 'kalianak' ? 'Surabaya Barat' : 'Perwakilan'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Map Control Toolbar */}
      <div className="px-3 py-2 bg-surface-container-lowest border-b border-surface-container-high flex items-center justify-between gap-2 z-10 text-xs">
        <div className="truncate">
          <span className="font-extrabold text-xs text-on-surface block leading-tight truncate">
            {activeFacility.fullName}
          </span>
          <span className="text-[10px] text-on-surface-variant truncate block">
            {activeFacility.shortAddress}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Basemap Switcher */}
          <div className="flex items-center bg-surface-container-low rounded-lg border border-surface-container-high p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setBasemap('streets')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                basemap === 'streets'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Jalan
            </button>
            <button
              type="button"
              onClick={() => setBasemap('satellite')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                basemap === 'satellite'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Satelit
            </button>
          </div>

          {/* Toggle Sidoarjo Delivery Coverage Radius */}
          {activeFacility.id === 'krian' && (
            <button
              type="button"
              onClick={() => setShowRadius(!showRadius)}
              className={`p-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                showRadius
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-surface-container-low text-on-surface-variant border-surface-container-high hover:bg-surface-container'
              }`}
              title="Tampilkan radius jangkauan suplai 18 kecamatan Sidoarjo"
            >
              <Radio className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-[10px]">Radius</span>
            </button>
          )}

          {/* Recenter */}
          <button
            type="button"
            onClick={() => handleSelectFacility(activeFacility)}
            className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            title="Pusatkan kembali ke lokasi terpilih"
          >
            <Crosshair className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Map View Canvas */}
      <div className={`relative w-full ${isExpanded ? 'h-[460px]' : height} transition-all duration-300`}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Facility Badge Overlay */}
        <div className="absolute bottom-2.5 left-2.5 z-[500] pointer-events-none">
          <div className="px-2.5 py-1 rounded-lg bg-surface-container-lowest/95 backdrop-blur-md border border-surface-container-high text-[10px] text-on-surface shadow-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: activeFacility.color }}></span>
            <span className="font-bold text-on-surface">{activeFacility.badge}</span>
            <span className="text-outline">&bull;</span>
            <span className="font-mono text-[9px] text-on-surface-variant">{activeFacility.displayPhone}</span>
          </div>
        </div>

        {/* Expand / Minimize Button */}
        <div className="absolute top-2.5 right-2.5 z-[500]">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md hover:bg-surface-container border border-surface-container-high text-on-surface-variant hover:text-on-surface shadow-xs transition-colors cursor-pointer"
            title={isExpanded ? 'Perkecil tampilan' : 'Perbesar tampilan'}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* 4. Map Footer Info Bar */}
      <div className="px-3.5 py-2.5 bg-surface-container-lowest border-t border-surface-container-high flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-on-surface-variant text-[11px]">
          <span className="font-mono text-[10px] text-outline">
            {activeFacility.coords[0]}, {activeFacility.coords[1]}
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

        <div className="flex items-center gap-2">
          {activeFacility.googleSearchUrl && (
            <a
              href={activeFacility.googleSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-outline hover:text-on-surface font-semibold hover:underline hidden sm:inline"
            >
              Detail Perusahaan & Ulasan
            </a>
          )}
          <a
            href={activeFacility.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-[11px] shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Petunjuk Arah (Google Maps)</span>
            <ExternalLink className="h-3 w-3 opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );
}
