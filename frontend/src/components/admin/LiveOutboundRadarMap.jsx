import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Wifi, 
  Clock, 
  Gauge, 
  ShieldCheck, 
  Maximize2,
  Minimize2,
  Radio,
  CheckCircle2,
  Package
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { formatRupiah } from '../../lib/utils';

// Sidoarjo District Geo Map Nodes relative to Depo Krian
const DISTRICT_COORDINATES = {
  Krian: { x: 190, y: 220, label: 'Kec. Krian', isDepoNearby: true },
  Wonoayu: { x: 280, y: 240, label: 'Kec. Wonoayu' },
  Taman: { x: 390, y: 150, label: 'Kec. Taman (Sepanjang)' },
  Waru: { x: 470, y: 130, label: 'Kec. Waru' },
  Sukodono: { x: 340, y: 200, label: 'Kec. Sukodono' },
  Tarik: { x: 110, y: 280, label: 'Kec. Tarik' },
  Sidoarjo: { x: 420, y: 270, label: 'Sidoarjo Kota' },
  Sedati: { x: 510, y: 170, label: 'Kec. Sedati' },
  Prambon: { x: 210, y: 290, label: 'Kec. Prambon' },
  Porong: { x: 410, y: 350, label: 'Kec. Porong' },
};

export default function LiveOutboundRadarMap({ selectedOrder, outboundOrders = [], onSelectOrder }) {
  const [speed, setSpeed] = useState(41);
  const [satelliteCount, setSatelliteCount] = useState(14);
  const [isExpanded, setIsExpanded] = useState(false);

  // Depo Krian Base Origin
  const depoCoords = { x: 160, y: 210, label: 'Depo Inbisco Krian (Origin)' };

  // Determine target coordinates based on selected order district
  const destDistrict = selectedOrder?.store?.district || 'Krian';
  const targetCoords = DISTRICT_COORDINATES[destDistrict] || DISTRICT_COORDINATES.Krian;

  // Calculate dynamic vehicle position along the line from Depo to Destination
  const orderStatus = selectedOrder?.status || 'PENDING';
  let progressRatio = 0.1;
  let statusBadgeText = 'Armada Siap di Bay Gudang';
  let statusBadgeColor = 'bg-surface-container-high text-on-surface-variant';

  if (orderStatus === 'CONFIRMED') {
    progressRatio = 0.15;
    statusBadgeText = 'Validasi PO Gudang';
    statusBadgeColor = 'bg-blue-100 text-blue-800';
  } else if (orderStatus === 'PACKING') {
    progressRatio = 0.25;
    statusBadgeText = 'Proses Muat Armada Carry';
    statusBadgeColor = 'bg-amber-100 text-amber-800';
  } else if (orderStatus === 'DISPATCHED') {
    progressRatio = 0.65;
    statusBadgeText = 'Dalam Perjalanan Menuju Toko';
    statusBadgeColor = 'bg-primary text-white animate-pulse';
  } else if (orderStatus === 'COMPLETED') {
    progressRatio = 1.0;
    statusBadgeText = 'Tiba di Toko (e-POD Valid)';
    statusBadgeColor = 'bg-emerald-100 text-emerald-800';
  }

  const vehicleX = depoCoords.x + (targetCoords.x - depoCoords.x) * progressRatio;
  const vehicleY = depoCoords.y + (targetCoords.y - depoCoords.y) * progressRatio;

  // Real-time speed & telemetry jitter simulation for ultra-realistic feeling
  useEffect(() => {
    if (orderStatus !== 'DISPATCHED') {
      setSpeed(0);
      return;
    }
    const timer = setInterval(() => {
      setSpeed(Math.floor(37 + Math.random() * 8));
      setSatelliteCount(Math.floor(13 + Math.random() * 3));
    }, 3200);
    return () => clearInterval(timer);
  }, [orderStatus]);

  // Generate SVG curved route path between Depo and Store
  const midX = (depoCoords.x + targetCoords.x) / 2;
  const midY = (depoCoords.y + targetCoords.y) / 2 - 25;
  const routePath = `M ${depoCoords.x} ${depoCoords.y} Q ${midX} ${midY} ${targetCoords.x} ${targetCoords.y}`;

  return (
    <div className={`rounded-2xl border border-outline/15 bg-gradient-to-b from-[#11161d] to-[#0a0d12] text-white shadow-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'h-[540px]' : 'h-[380px]'}`}>
      {/* Top Header HUD Bar */}
      <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5 font-display">
                GPS Live Fleet Radar • Sidoarjo Distribution Hub
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <div className="text-[10px] text-white/60 font-mono">
              Gateway: Depo Krian (Jl. Raya Surabaya - Krian KM 28)
            </div>
          </div>
        </div>

        {/* Telemetry Metrics Pill */}
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-white/80">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            <span>{speed} km/jam</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-emerald-400">
            <Wifi className="h-3.5 w-3.5" />
            <span>{satelliteCount} Satelit (4G GPS)</span>
          </div>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeColor}`}>
            {statusBadgeText}
          </span>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? 'Perkecil Radar' : 'Perbesar Tampilan Radar'}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Radar Screen */}
      <div className="relative w-full h-[calc(100%-88px)] overflow-hidden">
        {/* Subtle Radar Grid & Background Mesh */}
        <svg 
          viewBox="0 0 600 400" 
          className="w-full h-full object-cover select-none"
          style={{ background: 'radial-gradient(circle at 30% 50%, #151f2e 0%, #0a0d12 100%)' }}
        >
          <defs>
            {/* Radar Grid Pattern */}
            <pattern id="radar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
            {/* Animated Pulse Gradient */}
            <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d91a1a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#radar-grid)" />

          {/* Radar Range Rings */}
          <circle cx={depoCoords.x} cy={depoCoords.y} r="80" fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <circle cx={depoCoords.x} cy={depoCoords.y} r="160" fill="none" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <circle cx={depoCoords.x} cy={depoCoords.y} r="250" fill="none" stroke="rgba(255,255,255,0.03)" strokeDasharray="6 6" />

          {/* Sidoarjo Road Arterials (Regional Highway Network) */}
          <g stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none">
            {/* Tol Surabaya - Mojokerto (Sumo) */}
            <path d="M 70 230 Q 160 190 280 170 T 490 120" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="3" />
            <text x="80" y="215" fill="rgba(59, 130, 246, 0.5)" fontSize="8" fontFamily="monospace">TOL SUMO (KM 740)</text>

            {/* Arterial Jl. Raya Krian - Taman - Waru */}
            <path d="M 160 210 Q 280 230 390 150 T 470 130" stroke="rgba(255, 255, 255, 0.18)" strokeWidth="2.5" />
            
            {/* Arterial Krian - Wonoayu - Sidoarjo Kota */}
            <path d="M 160 210 Q 270 240 420 270" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2" />

            {/* Arterial Krian - Tarik */}
            <path d="M 160 210 L 110 280" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" />
          </g>

          {/* Active Order Trajectory Route */}
          {selectedOrder && (
            <g>
              {/* Outer Glow */}
              <path
                d={routePath}
                fill="none"
                stroke="rgba(217, 26, 26, 0.25)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* Animated Dash Path */}
              <path
                d={routePath}
                fill="none"
                stroke="url(#route-gradient)"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                className="animate-pulse"
              />
            </g>
          )}

          {/* District Territorial Nodes */}
          {Object.entries(DISTRICT_COORDINATES).map(([distKey, coords]) => {
            const isTarget = destDistrict.toLowerCase().includes(distKey.toLowerCase());
            return (
              <g key={distKey} className="cursor-pointer group" onClick={() => onSelectOrder && onSelectOrder(distKey)}>
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isTarget ? 5 : 3.5}
                  fill={isTarget ? '#10b981' : 'rgba(255,255,255,0.3)'}
                  stroke={isTarget ? 'white' : 'rgba(255,255,255,0.6)'}
                  strokeWidth={isTarget ? '2' : '1'}
                />
                {isTarget && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r="12"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    className="animate-ping"
                    style={{ transformOrigin: `${coords.x}px ${coords.y}px` }}
                  />
                )}
                <text
                  x={coords.x}
                  y={coords.y + 14}
                  textAnchor="middle"
                  fill={isTarget ? '#34d399' : 'rgba(255,255,255,0.5)'}
                  fontSize={isTarget ? '9.5' : '8'}
                  fontWeight={isTarget ? 'bold' : 'normal'}
                  fontFamily="sans-serif"
                >
                  {coords.label}
                </text>
              </g>
            );
          })}

          {/* Origin Node: DEPO KRIAN HUB */}
          <g>
            <circle cx={depoCoords.x} cy={depoCoords.y} r="8" fill="#d91a1a" stroke="white" strokeWidth="2" />
            <circle cx={depoCoords.x} cy={depoCoords.y} r="16" fill="none" stroke="#d91a1a" strokeWidth="1" opacity="0.4" className="animate-ping" />
            <rect x={depoCoords.x - 45} y={depoCoords.y - 24} width="90" height="15" rx="3" fill="rgba(217, 26, 26, 0.85)" />
            <text x={depoCoords.x} y={depoCoords.y - 13} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
              🏭 DEPO KRIAN (HUB)
            </text>
          </g>

          {/* Destination Node: MITRA STORE */}
          {selectedOrder && (
            <g>
              <circle cx={targetCoords.x} cy={targetCoords.y} r="8" fill="#10b981" stroke="white" strokeWidth="2" />
              <rect x={targetCoords.x - 55} y={targetCoords.y - 26} width="110" height="16" rx="4" fill="rgba(16, 185, 129, 0.9)" />
              <text x={targetCoords.x} y={targetCoords.y - 14} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                🏪 {selectedOrder.store?.name?.substring(0, 15) || 'Toko Mitra'}
              </text>
            </g>
          )}

          {/* Dynamic Moving Fleet Pin (Suzuki Carry Box W 8821 NA) */}
          <g style={{ transition: 'all 0.8s ease-out' }}>
            {/* Radar Wave Ping */}
            <circle
              cx={vehicleX}
              cy={vehicleY}
              r="14"
              fill="rgba(59, 130, 246, 0.25)"
              stroke="#3b82f6"
              strokeWidth="1.5"
              className="animate-ping"
              style={{ transformOrigin: `${vehicleX}px ${vehicleY}px` }}
            />
            {/* Vehicle Icon Badge */}
            <circle cx={vehicleX} cy={vehicleY} r="10" fill="#2563eb" stroke="white" strokeWidth="2" />
            <foreignObject x={vehicleX - 6} y={vehicleY - 6} width="12" height="12">
              <div className="w-full h-full flex items-center justify-center text-white">
                <Truck className="w-3 h-3" />
              </div>
            </foreignObject>
            {/* Floating Vehicle Label */}
            <rect x={vehicleX - 42} y={vehicleY + 14} width="84" height="14" rx="3" fill="rgba(17, 24, 39, 0.9)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <text x={vehicleX} y={vehicleY + 24} textAnchor="middle" fill="#60a5fa" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
              W 8821 NA (Carry)
            </text>
          </g>
        </svg>

        {/* Floating Live Telemetry Panel (Bottom Left Corner) */}
        <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md border border-white/10 rounded-xl p-3 text-xs space-y-1.5 max-w-xs shadow-lg pointer-events-none sm:pointer-events-auto">
          <div className="flex items-center justify-between text-[11px] text-white/80 font-bold border-b border-white/10 pb-1">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-primary" />
              Armada Suzuki Carry Box
            </span>
            <span className="font-mono text-emerald-400">W 8821 NA</span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-white/70">
            <div>
              <span className="text-white/40 block">Kurir Logistik:</span>
              <span className="font-semibold text-white">Bambang Triyono</span>
            </div>
            <div>
              <span className="text-white/40 block">Toko Tujuan:</span>
              <span className="font-semibold text-white truncate block">
                {selectedOrder?.store?.name || 'Toko Mitra Krian'}
              </span>
            </div>
            <div>
              <span className="text-white/40 block">Wilayah Rute:</span>
              <span className="font-semibold text-white">Kec. {destDistrict}</span>
            </div>
            <div>
              <span className="text-white/40 block">Estimasi Tiba:</span>
              <span className="font-semibold text-emerald-400 font-mono">
                {orderStatus === 'COMPLETED' ? 'Telah Tiba' : orderStatus === 'DISPATCHED' ? '12-18 Menit' : 'Standby'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Order Selector Pills on Radar (Top Right) */}
        {outboundOrders.length > 0 && (
          <div className="absolute top-3 right-3 hidden lg:flex flex-col gap-1 max-w-[200px] max-h-36 overflow-y-auto">
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/50 px-1">
              Pilih Pesanan untuk Lacak:
            </span>
            {outboundOrders.slice(0, 4).map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              return (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => onSelectOrder && onSelectOrder(ord)}
                  className={`px-2.5 py-1.5 rounded-lg text-left text-[10px] transition-all flex items-center justify-between border cursor-pointer ${
                    isSelected
                      ? 'bg-primary/90 text-white border-primary shadow-xs'
                      : 'bg-black/60 hover:bg-black/80 text-white/80 border-white/10'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-mono font-bold block">{ord.trackingCode}</span>
                    <span className="text-[9px] opacity-75 truncate block">{ord.store?.name}</span>
                  </div>
                  <span className="text-[9px] font-mono px-1 rounded bg-white/20 ml-1.5 shrink-0">
                    {ord.status === 'COMPLETED' ? 'Selesai' : ord.status === 'DISPATCHED' ? 'Jalan' : 'Antre'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Status Ticker Bar */}
      <div className="px-4 py-2 bg-black/60 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70">
        <div className="flex items-center gap-2 truncate">
          <Navigation className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate">
            {orderStatus === 'COMPLETED'
              ? `✓ Paket telah diserahterimakan kepada kasir/pemilik ${selectedOrder?.store?.name || 'Toko Mitra'} secara utuh.`
              : orderStatus === 'DISPATCHED'
              ? `Armada sedang melaju di Jl. Raya Surabaya - Krian menuju ${selectedOrder?.store?.name || 'Toko Mitra'} (${destDistrict}).`
              : `Pesanan ${selectedOrder?.trackingCode || 'PO'} sedang dipersiapkan di Depo Krian untuk rute ${destDistrict}.`}
          </span>
        </div>
        <div className="font-mono text-[10px] text-white/50 hidden sm:block shrink-0 ml-2">
          Lat: -7.4128 • Long: 112.5844 (WGS84)
        </div>
      </div>
    </div>
  );
}
