import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Wifi, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Phone,
  Radio,
  ExternalLink,
  RefreshCw,
  Power,
  RotateCcw
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { api } from '../services/api';

export default function DriverPortal({ setActiveNav }) {
  const [trackingCode, setTrackingCode] = useState('INB-2610-KR06');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [gpsData, setGpsData] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [lastSentTime, setLastSentTime] = useState(null);
  const [sendCount, setSendCount] = useState(0);
  const [driverStatus, setDriverStatus] = useState('DISPATCHED');
  const [actionSuccess, setActionSuccess] = useState(null);

  const watchIdRef = useRef(null);

  // Clean up GPS watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleStartGps = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Browser atau perangkat ini tidak mendukung sensor Geolocation GPS.');
      return;
    }

    setIsTransmitting(true);

    const successHandler = async (position) => {
      const { latitude, longitude, accuracy, speed } = position.coords;
      const payload = {
        trackingCode: trackingCode.trim().toUpperCase(),
        lat: latitude,
        lng: longitude,
        accuracy: Math.round(accuracy || 10),
        speed: speed ? Math.round(speed * 3.6) : 38, // km/h
        driverName: 'Bambang Triyono',
        vehiclePlate: 'W 8821 NA',
        status: driverStatus,
      };

      setGpsData(payload);
      try {
        await api.sendDriverGps(payload);
        setLastSentTime(new Date().toLocaleTimeString('id-ID'));
        setSendCount((prev) => prev + 1);
      } catch (err) {
        console.warn('Gagal memancarkan GPS driver:', err);
      }
    };

    const errorHandler = (err) => {
      console.error('Geolocation watch error:', err);
      setGpsError(
        err.code === 1
          ? 'Izin lokasi GPS ditolak oleh pengguna. Mohon izinkan akses lokasi di browser HP Anda.'
          : 'Gagal membaca sensor GPS. Pastikan GPS HP aktif.'
      );
      setIsTransmitting(false);
    };

    // Watch real-time position updates with high accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleStopGps = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation?.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTransmitting(false);
  };

  const handleUpdateStatus = async (newStatus, label) => {
    setDriverStatus(newStatus);
    setActionSuccess(`Status pesanan berhasil diperbarui menjadi: ${label}`);
    setTimeout(() => setActionSuccess(null), 3500);

    // If currently broadcasting, send updated status immediately
    if (gpsData) {
      try {
        await api.sendDriverGps({
          ...gpsData,
          status: newStatus,
        });
      } catch (err) {}
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low py-8 px-4 sm:px-6 flex flex-col items-center">
      <div className="max-w-md w-full space-y-4">
        {/* Top Header Card */}
        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline/15 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-base shadow-sm">
                🚚
              </div>
              <div>
                <h1 className="text-base font-extrabold text-on-surface font-display leading-tight">
                  Portal Kurir Lapangan (Driver GPS)
                </h1>
                <span className="text-xs text-on-surface-variant font-medium">
                  PT Inbisco Niagatama Semesta • Cabang Krian
                </span>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono ${
              isTransmitting
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                : 'bg-surface-container text-on-surface-variant border border-outline/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isTransmitting ? 'bg-emerald-600' : 'bg-outline'}`}></span>
              <span>{isTransmitting ? 'GPS ON' : 'STANDBY'}</span>
            </span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Halaman ini dipakai oleh kurir di jalan raya Sidoarjo. Saat GPS diaktifkan, koordinat fisik HP Anda akan dipancarkan ke peta pelacakan mitra secara <em>real-time</em> tanpa rekayasa.
          </p>

          <div className="pt-2 border-t border-outline/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                BT
              </div>
              <span className="font-bold text-on-surface">Bambang Triyono</span>
            </div>
            <span className="font-mono text-[11px] font-semibold text-primary">
              Suzuki Carry (W 8821 NA)
            </span>
          </div>
        </div>

        {/* Input Target Tracking Code */}
        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline/15 shadow-md space-y-3">
          <label className="block text-xs font-bold text-on-surface">
            Nomor Resi Pesanan yang Sedang Diantar:
          </label>
          <div className="flex gap-2">
            <Input
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              placeholder="Cth: INB-2610-KR06"
              className="text-xs font-mono font-bold bg-surface-container-low h-10"
            />
          </div>

          {/* Preset Buttons for Demo */}
          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
            <span>Pilih Cepat:</span>
            {['INB-2610-KR06', 'INB-2610-KR05'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setTrackingCode(code)}
                className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border transition-colors cursor-pointer ${
                  trackingCode === code
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-container border-outline/15 hover:border-primary text-on-surface'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Big GPS Transmission Trigger Box */}
        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline/15 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Radio className={`h-4 w-4 ${isTransmitting ? 'text-emerald-500 animate-pulse' : 'text-outline'}`} />
              Pemancar Lokasi Satelit GPS HP
            </span>
            {lastSentTime && (
              <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                Terkirim: {lastSentTime} ({sendCount}x)
              </span>
            )}
          </div>

          {/* Main Toggle Button */}
          {!isTransmitting ? (
            <Button
              type="button"
              onClick={handleStartGps}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm gap-2 shadow-lg cursor-pointer active:scale-95 transition-all"
            >
              <Navigation className="h-5 w-5" />
              <span>Nyalakan GPS HP &amp; Mulai Mengantar</span>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleStopGps}
              variant="outline"
              className="w-full h-12 rounded-2xl border-red-300 text-red-600 hover:bg-red-50 font-extrabold text-sm gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Power className="h-5 w-5" />
              <span>Hentikan Transmisi GPS</span>
            </Button>
          )}

          {/* Live Telemetry Display */}
          {gpsData && isTransmitting && (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between font-bold text-emerald-900 border-b border-emerald-200/60 pb-1.5">
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                  Sinyal GPS Terkunci Aktif
                </span>
                <span className="font-mono text-[11px] text-emerald-700">Akurasi ±{gpsData.accuracy}m</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-emerald-700/70 block">Latitude:</span>
                  <span className="font-bold text-emerald-900">{gpsData.lat.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-emerald-700/70 block">Longitude:</span>
                  <span className="font-bold text-emerald-900">{gpsData.lng.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-emerald-700/70 block">Kecepatan:</span>
                  <span className="font-bold text-emerald-900">{gpsData.speed} km/jam</span>
                </div>
                <div>
                  <span className="text-emerald-700/70 block">Armada:</span>
                  <span className="font-bold text-emerald-900">{gpsData.vehiclePlate}</span>
                </div>
              </div>
            </div>
          )}

          {gpsError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        {/* Kurir Milestone Action Buttons */}
        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline/15 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface">Update Tahapan Pengantaran Kurir:</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-bold">
              Status: {driverStatus}
            </span>
          </div>

          {actionSuccess && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              onClick={() => handleUpdateStatus('DISPATCHED', 'Sedang Diantar (Dispatched)')}
              className={`text-xs font-bold h-10 rounded-xl border transition-all cursor-pointer ${
                driverStatus === 'DISPATCHED'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container border-outline/15'
              }`}
            >
              <Truck className="h-4 w-4 mr-1.5" />
              <span>Mulai Berangkat</span>
            </Button>

            <Button
              type="button"
              onClick={() => handleUpdateStatus('COMPLETED', 'Selesai Terima Toko (e-POD)')}
              className={`text-xs font-bold h-10 rounded-xl border transition-all cursor-pointer ${
                driverStatus === 'COMPLETED'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container border-outline/15'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              <span>Selesai Terima Toko</span>
            </Button>
          </div>
        </div>

        {/* Link back to Public Tracking */}
        <div className="p-4 bg-surface-container rounded-2xl border border-outline/10 text-center space-y-2">
          <span className="text-xs text-on-surface-variant block">
            Buka portal pelacakan mitra untuk melihat posisi HP Anda bergerak di peta:
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (setActiveNav) setActiveNav('track-order', trackingCode);
              else window.location.href = `/track-order?resi=${trackingCode}`;
            }}
            className="text-xs font-bold h-9 gap-1.5 bg-surface-container-lowest border-outline/20 hover:border-primary text-primary cursor-pointer w-full"
          >
            <span>Buka Pelacakan Mitra ({trackingCode})</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
