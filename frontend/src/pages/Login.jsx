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
  const [username, setUsername] = useState('admin.scm@inbisco.co.id');
  const [password, setPassword] = useState('Inbisco2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDirectDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login('ops.hq@mayora.co.id', 'Inbisco2026!', 'HQ_ADMIN');
      if (res && res.token) {
        localStorage.setItem('inbisco_auth_token', res.token);
      }
      switchRole('hq_admin');
    } catch (err) {
      // Fallback demo bypass for presentation resilience
      switchRole('hq_admin');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(username.trim(), password, 'HQ_ADMIN');
      if (res && res.token) {
        localStorage.setItem('inbisco_auth_token', res.token);
      }
      switchRole('hq_admin');
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
            <div className="relative z-10 space-y-4">
              <span className="text-xs font-bold text-tertiary-container uppercase tracking-wider block">
                Portal Operasional & Distribusi B2B · Cabang Krian
              </span>

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
                      Direktori terpadu toko kelontong, pedagang grosir, dan mitra warkop dengan limit kredit tempo (TOP).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Notice */}
            <div className="relative z-10 mt-8 pt-4 border-t border-white/20 flex items-center gap-2.5 text-xs text-white/85">
              <Lock className="h-4 w-4 text-tertiary-container shrink-0" />
              <span>
                <strong>Akses Terbatas:</strong> Khusus personel internal PT Inbisco Niagatama Semesta.
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
                  <span>PORTAL MASUK TERPADU</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface">
                  Login Administrator
                </h2>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Akses tunggal sistem rantai pasok terpadu SupplySync PT Inbisco Niagatama Semesta &amp; Mayora Group.
                </p>
              </div>

              {/* Fast 1-Click Operational Switcher Ribbon */}
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Akses Cepat Pengujian:
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                    1-Klik Masuk
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDirectDemoLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-3 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all flex items-center justify-between shadow-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>Masuk sebagai Admin Terpadu (Akses Penuh)</span>
                  </div>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
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
                    ID Akun / Email Personel
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin.scm@inbisco.co.id"
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
                  className="w-full text-xs font-bold py-2.5 gap-2 shadow-sm cursor-pointer"
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
