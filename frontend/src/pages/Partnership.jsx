import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  Store, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle,
  Building,
  CreditCard,
  Truck,
  ShieldCheck,
  Sparkles,
  PhoneCall
} from 'lucide-react';

const SIDOARJO_DISTRICTS = [
  'Krian',
  'Balongbendo',
  'Tarik',
  'Prambon',
  'Sukodono',
  'Wonoayu',
  'Taman',
  'Waru',
  'Sedati',
  'Gedangan',
  'Buduran',
  'Sidoarjo',
  'Candi',
  'Tanggulangin',
  'Porong',
  'Krembung',
  'Tulangan',
  'Jabon',
];

export default function Partnership({ setActiveNav }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const [formData, setFormData] = useState({
    name: 'Toko Berkah Barokah',
    ownerName: 'Haji Ahmad Fauzi',
    phone: '081234567890',
    nik: '3515082103850002',
    address: 'Jl. Raya Krian KM 29 No. 45, Krian',
    district: 'Krian',
    postalCode: '61262',
    storeType: 'GROSIR',
    estimatedMonthlyTurnover: '18500000',
    operationalYears: '5 Tahun',
    storageCapacity: '50-100 Karton',
    preferredVisitDays: 'Senin & Kamis',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name.trim() || !formData.ownerName.trim() || !formData.phone.trim()) {
        setError('Harap lengkapi semua data identitas toko dan penanggung jawab.');
        return;
      }
    } else if (step === 2) {
      if (!formData.address.trim()) {
        setError('Harap isi alamat lengkap lokasi fisik toko/warkop.');
        return;
      }
    }
    setError(null);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.registerStore({
        name: formData.name.trim(),
        ownerName: formData.ownerName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        district: formData.district,
        postalCode: formData.postalCode,
        storeType: formData.storeType,
      });

      setSuccessData(res.store || res);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      setError(err.message || 'Gagal mengirim formulir pendaftaran. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateFill = () => {
    setFormData({
      name: 'Grosir Rejeki Bersama',
      ownerName: 'Budi Santoso',
      phone: '081398765432',
      nik: '3515081204890001',
      address: 'Jl. Raya Tropodo No. 12, Waru',
      district: 'Waru',
      postalCode: '61256',
      storeType: 'GROSIR',
      estimatedMonthlyTurnover: '25000000',
      operationalYears: '4 Tahun',
      storageCapacity: '100-250 Karton',
      preferredVisitDays: 'Selasa & Jumat',
    });
    setError(null);
  };

  return (
    <div className="w-full bg-surface pb-16">
      {/* ========================================================= */}
      {/* SECTION 0: HERO & BREADCRUMB                              */}
      {/* ========================================================= */}
      <section className="bg-surface-container-lowest border-b border-surface-container-high py-10 md:py-14">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <nav className="flex items-center gap-2 text-xs text-outline mb-6">
            <button onClick={() => setActiveNav('home')} className="hover:text-primary transition-colors">
              Beranda
            </button>
            <span className="material-symbols-outlined text-[16px] text-surface-dim">chevron_right</span>
            <span className="text-on-surface font-semibold">Pendaftaran Kemitraan</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-wider mb-4 border border-surface-variant">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                <span>PENDAFTARAN MITRA · CABANG KRIAN</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-display text-on-surface tracking-tight mb-4">
                Mulai Kemitraan Distribusi Bersama Inbisco.
              </h1>
              <p className="text-base text-on-surface-variant max-w-2xl mb-6 leading-relaxed">
                Lengkapi informasi usaha Anda untuk memulai proses pendaftaran sebagai mitra distribusi resmi Mayora FMCG. Nikmati jaminan harga distributor, jadwal rute teratur, dan dukungan fasilitas tempo (TOP).
              </p>
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex items-start gap-3.5">
                <span className="material-symbols-outlined text-tertiary text-[22px] shrink-0 mt-0.5">verified_user</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <strong>Pemberitahuan Resmi:</strong> Pengajuan kemitraan dievaluasi langsung oleh tim representatif Depo Krian berdasarkan kesiapan rute dan kapasitas usaha. Tidak dipungut biaya pendaftaran apapun.
                </p>
              </div>
            </div>

            {/* Quick Helper Box */}
            <div className="lg:col-span-4 bg-surface-container-low p-6 rounded-2xl border border-surface-container-high space-y-3">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                BANTUAN SALES REPRESENTATIF
              </span>
              <h3 className="text-base font-bold font-display text-on-surface">
                Butuh Bantuan Pendaftaran?
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Sales representatif kami siap memandu proses verifikasi lokasi toko fisik dan pemilihan paket awal stok.
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Admin%20Inbisco%20MitraHub,%20saya%20ingin%20dibantu%20daftar%20kemitraan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>WhatsApp Tim Kemitraan</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 1: 3 BENEFIT HIGHLIGHTS                          */}
      {/* ========================================================= */}
      <section className="py-12 bg-surface">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-high shadow-xs hover:border-tertiary-container transition-all">
              <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-center text-primary-container mb-4">
                <span className="material-symbols-outlined text-[26px]">category</span>
              </div>
              <h3 className="text-base font-bold font-display text-on-surface mb-2">
                Informasi Produk
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Kenali pilihan produk FMCG resmi Mayora dan sampaikan kebutuhan volume usaha Anda dengan transparan.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-high shadow-xs hover:border-tertiary-container transition-all">
              <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-center text-tertiary mb-4">
                <span className="material-symbols-outlined text-[26px]">forum</span>
              </div>
              <h3 className="text-base font-bold font-display text-on-surface mb-2">
                Komunikasi Bisnis Langsung
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Gunakan informasi usaha yang Anda berikan untuk membantu perwakilan sales memahami lokasi dan pola belanja toko Anda.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-high shadow-xs hover:border-tertiary-container transition-all">
              <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined text-[26px]">calendar_month</span>
              </div>
              <h3 className="text-base font-bold font-display text-on-surface mb-2">
                Peninjauan Terencana
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Tim cabang akan meninjau pengajuan dan menghubungi kontak terdaftar sesuai jadwal operasional rute harian.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: 4-STEP WIZARD FORM                            */}
      {/* ========================================================= */}
      <section className="py-12 bg-surface-container-low border-t border-surface-container-high" id="form-section">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          {/* Header & Jury Simulation Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-primary tracking-wider uppercase">
                LANGKAH PENDAFTARAN (LANGKAH {step} DARI 4)
              </span>
              <h2 className="text-2xl font-bold font-display text-on-surface mt-1">
                Formulir Verifikasi Kemitraan Toko & Warkop
              </h2>
            </div>
            {/* Quick autofill for GTNIC Jury */}
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-container-lowest border border-surface-container-high self-start md:self-auto">
              <span className="text-xs text-outline font-medium px-2 hidden sm:inline">Jury Sandbox:</span>
              <button
                type="button"
                onClick={handleSimulateFill}
                className="px-3 py-1.5 rounded text-xs font-bold bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Auto-Fill Data Uji
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 gap-2 mb-8">
            {[
              { num: 1, title: 'Informasi Pribadi' },
              { num: 2, title: 'Titik Usaha' },
              { num: 3, title: 'Kapasitas Stok' },
              { num: 4, title: 'Konfirmasi' },
            ].map((s) => (
              <div 
                key={s.num} 
                onClick={() => { if (s.num < step) setStep(s.num); }}
                className={`p-3 rounded-xl border text-center transition-all ${
                  step === s.num
                    ? 'bg-primary-container text-white border-primary-container shadow-xs font-bold'
                    : step > s.num
                    ? 'bg-surface-container-lowest text-emerald-800 border-emerald-300 font-semibold cursor-pointer'
                    : 'bg-surface-container text-on-surface-variant border-surface-container-high opacity-70'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider">
                  {step > s.num ? '✓ Selesai' : `Langkah ${s.num}`}
                </div>
                <div className="text-xs mt-0.5 truncate">{s.title}</div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error-container text-on-error-container text-xs font-medium flex items-center gap-2 border border-error/20">
              <AlertCircle className="h-4 w-4 text-error shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* FORM CONTAINER */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-6 md:p-8 shadow-xs">
            {/* STEP 1: INFORMASI PRIBADI */}
            {step === 1 && (
              <form onSubmit={handleNext} className="space-y-5">
                <div className="pb-3 border-b border-surface-container-high">
                  <h3 className="text-lg font-bold font-display text-on-surface">
                    Bagian 1: Informasi Pribadi & Penanggung Jawab (PIC)
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Data penanggung jawab yang akan menerima surat jalan, faktur resmi, dan komunikasi jadwal pengiriman.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Nama Lengkap Pemilik / PIC <span className="text-error">*</span>
                    </label>
                    <Input
                      value={formData.ownerName}
                      onChange={(e) => handleChange('ownerName', e.target.value)}
                      placeholder="Cth: Haji Ahmad Fauzi"
                      className="text-xs h-10"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Nomor WhatsApp Aktif <span className="text-error">*</span>
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="081234567890"
                      className="text-xs h-10"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Nama Usaha / Toko Fisik <span className="text-error">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Cth: Toko Berkah Barokah"
                      className="text-xs h-10"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Nomor KTP / NIK (Verifikasi Faktur Pajak)
                    </label>
                    <Input
                      value={formData.nik}
                      onChange={(e) => handleChange('nik', e.target.value)}
                      placeholder="351508xxxxxxxxxx"
                      className="text-xs h-10"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" className="gap-2 text-xs font-bold px-6">
                    <span>Lanjut ke Titik Usaha</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 2: TITIK TOKO & LOKASI */}
            {step === 2 && (
              <form onSubmit={handleNext} className="space-y-5">
                <div className="pb-3 border-b border-surface-container-high">
                  <h3 className="text-lg font-bold font-display text-on-surface">
                    Bagian 2: Informasi Usaha & Titik Toko Fisik
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Alamat lokasi toko fisik untuk penentuan zonasi rute armada truk dari Depot Krian.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Alamat Lengkap Toko / Warkop <span className="text-error">*</span>
                    </label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="Nama jalan, nomor bangunan, RT/RW, kelurahan/desa..."
                      className="text-xs h-10"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Kecamatan (Wilayah Kabupaten Sidoarjo) <span className="text-error">*</span>
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => handleChange('district', e.target.value)}
                      className="w-full text-xs h-10 rounded-md border border-input bg-surface-container-lowest px-3 py-1 font-medium"
                      required
                    >
                      {SIDOARJO_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Kode Pos Sidoarjo
                    </label>
                    <Input
                      value={formData.postalCode}
                      onChange={(e) => handleChange('postalCode', e.target.value)}
                      placeholder="61262"
                      className="text-xs h-10"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Tipe Profil Usaha
                    </label>
                    <select
                      value={formData.storeType}
                      onChange={(e) => handleChange('storeType', e.target.value)}
                      className="w-full text-xs h-10 rounded-md border border-input bg-surface-container-lowest px-3 py-1 font-medium"
                    >
                      <option value="GROSIR">Grosir Pasar / Agen Sembako</option>
                      <option value="KELONTONG">Toko Kelontong / Warung Harian</option>
                      <option value="WARKOP">Warkop / Food Service / Depot Seduh</option>
                      <option value="MINIMARKET">Minimarket Mandiri / Retail Modern</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Lama Usaha Berjalan
                    </label>
                    <Input
                      value={formData.operationalYears}
                      onChange={(e) => handleChange('operationalYears', e.target.value)}
                      placeholder="Cth: 5 Tahun"
                      className="text-xs h-10"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button type="button" onClick={handleBack} variant="outline" className="gap-2 text-xs">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali</span>
                  </Button>
                  <Button type="submit" className="gap-2 text-xs font-bold px-6">
                    <span>Lanjut ke Kapasitas Distribusi</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 3: KAPASITAS DISTRIBUSI */}
            {step === 3 && (
              <form onSubmit={handleNext} className="space-y-5">
                <div className="pb-3 border-b border-surface-container-high">
                  <h3 className="text-lg font-bold font-display text-on-surface">
                    Bagian 3: Kapasitas Distribusi & Kebutuhan Suplai
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Data estimasi untuk menentukan kuota alokasi produk fast-moving dan batas plafon tempo awal.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Estimasi Omzet Bulanan Produk FMCG (Rp)
                    </label>
                    <select
                      value={formData.estimatedMonthlyTurnover}
                      onChange={(e) => handleChange('estimatedMonthlyTurnover', e.target.value)}
                      className="w-full text-xs h-10 rounded-md border border-input bg-surface-container-lowest px-3 py-1 font-medium"
                    >
                      <option value="7500000">Rp 5.000.000 – Rp 10.000.000 / bulan</option>
                      <option value="18500000">Rp 10.000.000 – Rp 25.000.000 / bulan</option>
                      <option value="45000000">Rp 25.000.000 – Rp 50.000.000 / bulan</option>
                      <option value="80000000">&gt; Rp 50.000.000 / bulan (Agen Utama)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Kapasitas Gudang / Ruang Simpan Toko
                    </label>
                    <select
                      value={formData.storageCapacity}
                      onChange={(e) => handleChange('storageCapacity', e.target.value)}
                      className="w-full text-xs h-10 rounded-md border border-input bg-surface-container-lowest px-3 py-1 font-medium"
                    >
                      <option value="20-50 Karton">20 – 50 Master Dus</option>
                      <option value="50-100 Karton">50 – 100 Master Dus</option>
                      <option value="100-250 Karton">100 – 250 Master Dus</option>
                      <option value=">250 Karton">&gt; 250 Master Dus (Gudang Pallet)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Pilihan Hari Kunjungan & Kirim Rutin
                    </label>
                    <Input
                      value={formData.preferredVisitDays}
                      onChange={(e) => handleChange('preferredVisitDays', e.target.value)}
                      placeholder="Cth: Senin & Kamis"
                      className="text-xs h-10"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">
                      Fasilitas Akses Armada ke Toko
                    </label>
                    <select className="w-full text-xs h-10 rounded-md border border-input bg-surface-container-lowest px-3 py-1 font-medium">
                      <option>Dapat diakses Truk Engkel Box (Jalan &gt; 4 Meter)</option>
                      <option>Dapat diakses Mobil Van Box / GranMax</option>
                      <option>Akses Gang Sempit (Motor Roda Tiga / Pickup Kecil)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button type="button" onClick={handleBack} variant="outline" className="gap-2 text-xs">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali</span>
                  </Button>
                  <Button type="submit" className="gap-2 text-xs font-bold px-6">
                    <span>Lanjut ke Ringkasan Pengajuan</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 4: RINGKASAN & KONFIRMASI */}
            {step === 4 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="pb-3 border-b border-surface-container-high">
                  <h3 className="text-lg font-bold font-display text-on-surface">
                    Bagian 4: Ringkasan & Konfirmasi Pengajuan Kemitraan
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Harap periksa kembali kebenaran seluruh data profil usaha Anda sebelum mengirimkan berkas.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-surface-container-low border border-surface-container-high space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-outline block">Nama Toko Fisik:</span>
                      <strong className="text-on-surface text-sm">{formData.name}</strong>
                    </div>
                    <div>
                      <span className="text-outline block">Pemilik / PIC:</span>
                      <strong className="text-on-surface text-sm">{formData.ownerName}</strong>
                    </div>
                    <div>
                      <span className="text-outline block">Nomor WhatsApp:</span>
                      <strong className="text-on-surface font-mono">{formData.phone}</strong>
                    </div>
                    <div>
                      <span className="text-outline block">Tipe Profil Usaha:</span>
                      <strong className="text-primary">{formData.storeType}</strong>
                    </div>
                    <div>
                      <span className="text-outline block">Lokasi & Kecamatan:</span>
                      <strong className="text-on-surface">{formData.address}, Kec. {formData.district}</strong>
                    </div>
                    <div>
                      <span className="text-outline block">Kapasitas Simpan:</span>
                      <strong className="text-on-surface">{formData.storageCapacity}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-on-surface-variant flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    Dengan menekan tombol konfirmasi, Anda menyetujui data usaha dihubungi oleh representatif PT Inbisco Niagatama Semesta Cabang Krian untuk keperluan evaluasi rute pengiriman dan aktivasi akun mitra.
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button type="button" onClick={handleBack} variant="outline" className="gap-2 text-xs">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Ubah Data</span>
                  </Button>
                  <Button type="submit" disabled={loading} className="gap-2 text-xs font-bold px-8 shadow-sm">
                    {loading ? (
                      <span>Mengirim Berkas...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Kirim Formulir Pendaftaran</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: 18 KECAMATAN COVERAGE BADGES                  */}
      {/* ========================================================= */}
      <section className="py-12 bg-surface border-t border-surface-container-high">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="mb-6">
            <span className="text-xs font-bold text-primary tracking-wider uppercase">
              JALUR DISTRIBUSI REGULER DEPOT KRIAN
            </span>
            <h3 className="text-xl font-bold font-display text-on-surface mt-1">
              18 Kecamatan Kabupaten Sidoarjo Terlayani
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Seluruh kecamatan berikut tercakup dalam rute reguler armada truk Mayora:
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {SIDOARJO_DISTRICTS.map((d, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container-high text-xs font-semibold text-on-surface flex items-center gap-1.5 shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                <span>{d}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SUCCESS MODAL DIALOG                                     */}
      {/* ========================================================= */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl border border-surface-container-high p-6 md:p-8 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold font-display text-on-surface">
                Pendaftaran Kemitraan Diterima!
              </h3>
              <p className="text-xs text-on-surface-variant">
                Pengajuan toko Anda telah berhasil dicatat ke dalam database operasional Depo Krian.
              </p>
            </div>

            <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-outline">Kode Registrasi:</span>
                <span className="font-mono font-bold text-primary">
                  {successData.code || successData.id || 'REG-MITRA-2026-SDA'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Nama Toko:</span>
                <span className="font-semibold">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Kecamatan:</span>
                <span className="font-semibold">{formData.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Status Verifikasi:</span>
                <Badge variant="tertiary" className="text-[10px] font-bold">
                  DIJADWALKAN SURVEY (H+1)
                </Badge>
              </div>
            </div>

            <div className="text-xs text-on-surface-variant text-center">
              Tim Sales Representatif rute <strong>{formData.district}</strong> akan menghubungi WhatsApp Anda dalam 1×24 jam untuk verifikasi titik GPS dan jadwal pengiriman pertama.
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                onClick={() => {
                  setSuccessData(null);
                  setActiveNav('products');
                }}
                className="w-full text-xs font-bold"
              >
                Lihat Katalog Produk Grosir
              </Button>
              <Button
                onClick={() => {
                  setSuccessData(null);
                  setActiveNav('home');
                }}
                variant="outline"
                className="w-full text-xs"
              >
                Kembali ke Beranda
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
