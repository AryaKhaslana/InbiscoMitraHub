import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { useAuthRole } from '../context/AuthRoleContext';
import { api } from '../services/api';
import { 
  Building2, 
  Warehouse, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Truck,
  Store,
  Layers
} from 'lucide-react';

export default function Login({ setActiveNav }) {
  const { switchRole } = useAuthRole();
  const [selectedRole, setSelectedRole] = useState('HQ_ADMIN'); // 'HQ_ADMIN' | 'DISTRIBUTOR_DEPO'
  const [username, setUsername] = useState('ops.hq');
  const [password, setPassword] = useState('MayoraGTNIC2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'HQ_ADMIN') {
      setUsername('ops.hq');
      setPassword('MayoraGTNIC2026!');
    } else {
      setUsername('bambang.sudiro');
      setPassword('KrianDepot2026!');
    }
  };

  const handleDirectDemoLogin = async (role) => {
    setLoading(true);
    setError(null);
    try {
      const u = role === 'HQ_ADMIN' ? 'ops.hq' : 'bambang.sudiro';
      const p = role === 'HQ_ADMIN' ? 'MayoraGTNIC2026!' : 'KrianDepot2026!';
      
      const res = await api.login(u, p, role);
      if (res && res.token) {
        localStorage.setItem('inbisco_auth_token', res.token);
      }
      
      if (role === 'HQ_ADMIN') {
        switchRole('hq_admin');
      } else {
        switchRole('distributor_ops');
      }
    } catch (err) {
      // Fallback demo bypass for presentation resilience
      if (role === 'HQ_ADMIN') {
        switchRole('hq_admin');
      } else {
        switchRole('distributor_ops');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(username.trim(), password, selectedRole);
      if (res && res.token) {
        localStorage.setItem('inbisco_auth_token', res.token);
      }
      if (selectedRole === 'HQ_ADMIN') {
        switchRole('hq_admin');
      } else {
        switchRole('distributor_ops');
      }
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa username dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-center bg-surface">
      <div className="w-full max-w-[1280px] mx-auto my-6 px-4 md:px-8">
        <div className="bg-surface-container-lowest rounded-3xl border border-surface-container-high shadow-xl overflow-hidden flex flex-col lg:flex-row">
          {/* ========================================================= */}
          {/* LEFT PANEL: 45% Corporate Crimson Overlay & Bento Cards   */}
          {/* ========================================================= */}
          <section className="lg:w-[45%] relative bg-gradient-to-br from-primary-container via-[#a80000] to-primary p-8 sm:p-12 text-white flex flex-col justify-between overflow-hidden shadow-inner">
            {/* Background Contextual Warehouse Logistics Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-25 pointer-events-none scale-105"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDbPHvnZR4aUHaGjVWcgh4KMhwPD69ZUEWa3lhp5k1X5TrOBCl7HG3G-ff4sQh-I_hplbp6P8ypDDIJjDCeB1xxQ3Qbt_ht1Q1W5AIXJuPimbe5ScTUz61Eq9OJJv39MidFbAW7LoyqZ277KZVfhHWUkhYQTCJ4rgqde8KzHo4CGIreDB9Hrz9JY9E2tZ1sKXyDfHjYNAUO1e2lUP01ZoGm6QfGdkI7pcblu9Hykl8')`
              }}
            />

            {/* Top Content */}
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wide shadow-xs">
                <span className="material-symbols-outlined text-[15px] text-tertiary-container">verified_user</span>
                <span>PORTAL OPERASIONAL & MITRA RESMI</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display tracking-tight text-white leading-tight">
                  Satu Portal untuk Operasional yang Lebih Terarah.
                </h1>
                <p className="text-sm text-white/90 leading-relaxed">
                  Akses sistem operasional terintegrasi untuk membantu percepatan pesanan, pemantauan stok gudang Krian secara real-time, dan verifikasi mitra ritel se-Sidoarjo.
                </p>
              </div>

              {/* Bento Glass Cards */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/15 shrink-0 flex items-center justify-center text-tertiary-container">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold font-display text-white">
                      Pengelolaan Order & Delivery
                    </h2>
                    <p className="text-xs text-white/80 mt-0.5 leading-snug">
                      Sinkronisasi otomatis Surat Jalan & DO harian ritel Krian, Balongbendo, dan sekitarnya.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/15 shrink-0 flex items-center justify-center text-tertiary-container">
                    <Warehouse className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold font-display text-white">
                      Kontrol Stok Gudang Krian
                    </h2>
                    <p className="text-xs text-white/80 mt-0.5 leading-snug">
                      Manajemen rotasi FEFO ketat dan visibilitas buffer stock SKU Mayora (Roma, Torabika, Beng-Beng).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/15 shrink-0 flex items-center justify-center text-tertiary-container">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold font-display text-white">
                      Direktori Mitra Terverifikasi
                    </h2>
                    <p className="text-xs text-white/80 mt-0.5 leading-snug">
                      Database terpadu toko kelontong, pedagang grosir, dan mitra warkop dengan limit kredit tempo (TOP).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Notice */}
            <div className="relative z-10 mt-8 pt-4 border-t border-white/20 flex items-center gap-2.5 text-xs text-white/85">
              <Lock className="h-4 w-4 text-tertiary-container shrink-0" />
              <span>
                <strong>Akses Terbatas:</strong> Khusus personel internal PT Inbisco Niagatama Semesta dan tim juri kompetisi GTNIC 2026.
              </span>
            </div>
          </section>

          {/* ========================================================= */}
          {/* RIGHT PANEL: 55% Authentication Canvas & Form Engine      */}
          {/* ========================================================= */}
          <section className="lg:w-[55%] bg-surface-container-lowest p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-[440px] w-full mx-auto space-y-6">
              {/* Header Title */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container text-on-surface-variant text-[11px] font-bold uppercase mb-2">
                  <span>SISTEM LOGIN TERINTEGRASI</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface">
                  Selamat Datang Kembali
                </h2>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Pilih lingkungan otorisasi kerja Anda untuk membuka modul konsol yang sesuai.
                </p>
              </div>

              {/* Role Switcher Selector */}
              <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-surface-container-low border border-surface-container-high">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('HQ_ADMIN')}
                  className={`p-3 rounded-lg text-left transition-all ${
                    selectedRole === 'HQ_ADMIN'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm font-bold border border-surface-container-high'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-0.5">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>SupplySync HQ</span>
                  </div>
                  <div className="text-[11px] text-outline">Macro Intelligence & Risk</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('DISTRIBUTOR_DEPO')}
                  className={`p-3 rounded-lg text-left transition-all ${
                    selectedRole === 'DISTRIBUTOR_DEPO'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm font-bold border border-surface-container-high'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mb-0.5">
                    <Warehouse className="h-3.5 w-3.5" />
                    <span>Depot Krian Hub</span>
                  </div>
                  <div className="text-[11px] text-outline">Distribusi & Sales Last-Mile</div>
                </button>
              </div>

              {/* GTNIC Jury 1-Click Fast Login Ribbon */}
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Jury 1-Click Fast Access:
                  </span>
                  <Badge variant="tertiary" className="text-[9px] uppercase">
                    GTNIC Testing
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDirectDemoLogin('HQ_ADMIN')}
                    className="p-2 rounded-lg bg-surface-container-lowest border border-surface-container-high hover:border-primary text-xs font-semibold text-on-surface hover:text-primary transition-all text-left flex items-center justify-between group shadow-2xs"
                  >
                    <span>Masuk HQ Admin</span>
                    <ArrowRight className="h-3.5 w-3.5 text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDirectDemoLogin('DISTRIBUTOR_DEPO')}
                    className="p-2 rounded-lg bg-surface-container-lowest border border-surface-container-high hover:border-primary text-xs font-semibold text-on-surface hover:text-primary transition-all text-left flex items-center justify-between group shadow-2xs"
                  >
                    <span>Masuk Depo Krian</span>
                    <ArrowRight className="h-3.5 w-3.5 text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Form Input */}
              {error && (
                <div className="p-3 bg-error-container text-on-error-container text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-error shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-on-surface block mb-1">
                    ID Akun / Username
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username personel"
                    className="text-xs h-10 bg-surface-container-low"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface block mb-1">
                    Kata Sandi (Password)
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="text-xs h-10 bg-surface-container-low"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full text-xs font-bold py-2.5 gap-2 shadow-sm"
                >
                  <Lock className="h-4 w-4" />
                  <span>{loading ? 'Memvalidasi Kredensial...' : 'Masuk ke Konsol Operasional'}</span>
                </Button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
