import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
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
  Sparkles, 
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ChevronRight
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* HEADER */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <Badge variant="tertiary" className="text-xs uppercase">Dual-Environment Portal</Badge>
        <h1 className="text-3xl font-black text-on-surface tracking-tight">
          Portal Operasional SupplySync & MitraHub
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Pilih lingkungan portal kerja sesuai peran wewenang Anda: Kantor Pusat Mayora (HQ) atau Depo Distribusi Mitra.
        </p>
      </div>

      {/* QUICK ROLE SELECTOR FOR GTNIC PRESENTATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Role Option 1: HQ Admin */}
        <div
          onClick={() => handleRoleSelect('HQ_ADMIN')}
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            selectedRole === 'HQ_ADMIN'
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-outline/20 bg-surface-container-lowest hover:border-outline/40'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            {selectedRole === 'HQ_ADMIN' ? (
              <Badge variant="default" className="text-[10px]">Aktif Dipilih</Badge>
            ) : (
              <span className="text-xs text-outline font-semibold">Klik untuk Pilih</span>
            )}
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">Level 1: Macro Intelligence</div>
            <h3 className="font-black text-base text-on-surface">Mayora Admin (HQ Pusat)</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Pengawasan agregat 28 distributor se-Jawa Timur, What-If restock simulator, deteksi stockout radar, dan batch PO approval.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline/10 flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] text-outline">User: ops.hq</span>
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDirectDemoLogin('HQ_ADMIN');
              }}
              size="sm"
              className="gap-1 font-bold text-xs h-7"
            >
              <span>Quick Demo</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Role Option 2: Distributor Ops */}
        <div
          onClick={() => handleRoleSelect('DISTRIBUTOR_DEPO')}
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            selectedRole === 'DISTRIBUTOR_DEPO'
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-outline/20 bg-surface-container-lowest hover:border-outline/40'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-secondary text-white flex items-center justify-center shadow-xs">
              <Warehouse className="h-5 w-5" />
            </div>
            {selectedRole === 'DISTRIBUTOR_DEPO' ? (
              <Badge variant="secondary" className="text-[10px]">Aktif Dipilih</Badge>
            ) : (
              <span className="text-xs text-outline font-semibold">Klik untuk Pilih</span>
            )}
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-xs font-bold text-secondary uppercase tracking-wider">Level 2: Micro Execution</div>
            <h3 className="font-black text-base text-on-surface">Distributor Depo Krian (Mitra)</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Eksekusi gudang lokal CV Surya Krian Logistik, rotasi FEFO, konfirmasi BAST armada inbound, dan cetak manifest pengiriman.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline/10 flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] text-outline">User: bambang.sudiro</span>
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleDirectDemoLogin('DISTRIBUTOR_DEPO');
              }}
              size="sm"
              className="gap-1 font-bold text-xs h-7"
            >
              <span>Quick Demo</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* LOGIN CREDENTIAL FORM */}
      <Card className="max-w-md mx-auto border-outline/15 shadow-xl">
        <CardContent className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 border-b border-outline/10 pb-3">
            <Lock className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm text-on-surface">
              Autentikasi Kredensial: {selectedRole === 'HQ_ADMIN' ? 'Mayora HQ' : 'Depo Krian'}
            </h3>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Username / NIK Akun</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="font-mono text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Kata Sandi (Password)</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="text-xs"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-bold gap-2 shadow-sm"
            >
              {loading ? 'Memverifikasi...' : 'Masuk ke Portal Kerja'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={() => setActiveNav('home')}
              className="text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              ← Kembali ke Beranda MitraHub
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
