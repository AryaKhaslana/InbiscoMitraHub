import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  PhoneCall,
  Check,
  Clock,
  Navigation,
  Layers,
  Printer
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

const DEMO_PRESETS = [
  {
    label: 'Toko Grosir Krian',
    badge: 'Grosir Pasar Ring 1',
    data: {
      name: 'Toko Sembako Berkah Barokah',
      ownerName: 'Haji Budi Santoso',
      phone: '081234567890',
      nik: '3515081203850001',
      address: 'Jl. Raya Krian No. 142 (Depan Pasar Krian)',
      district: 'Krian',
      postalCode: '61262',
      storeType: 'GROSIR',
      estimatedMonthlyTurnover: '45000000',
      operationalYears: '6 Tahun',
      storageCapacity: '100-250 Karton',
      preferredVisitDays: 'Senin & Kamis',
    },
  },
  {
    label: 'Warkop Balongbendo',
    badge: 'Food Service & Seduh',
    data: {
      name: 'Warkop Nusantara & Camilan',
      ownerName: 'Achmad Zaky',
      phone: '085712348901',
      nik: '3515091507920003',
      address: 'Jl. Raya Bakalan No. 45, Balongbendo',
      district: 'Balongbendo',
      postalCode: '61263',
      storeType: 'WARKOP',
      estimatedMonthlyTurnover: '18500000',
      operationalYears: '3 Tahun',
      storageCapacity: '50-100 Karton',
      preferredVisitDays: 'Selasa & Jumat',
    },
  },
  {
    label: 'Agen Sidoarjo Kota',
    badge: 'Retail Modern & Agen',
    data: {
      name: 'CV Surya Rezeki Makmur',
      ownerName: 'Ibu Siti Rahmawati',
      phone: '081398765432',
      nik: '3515014811880002',
      address: 'Komp. Ruko Pondok Jati Blok AA-12, Buduran',
      district: 'Buduran',
      postalCode: '61252',
      storeType: 'MINIMARKET',
      estimatedMonthlyTurnover: '80000000',
      operationalYears: '8 Tahun',
      storageCapacity: '>250 Karton',
      preferredVisitDays: 'Senin, Rabu, & Jumat',
    },
  },
];

const SIDOARJO_ZONES = [
  {
    id: 'zona-barat',
    name: 'Zona 1: Sidoarjo Barat',
    badge: 'Ring 1 Depo Krian · Prioritas Harian',
    badgeVariant: 'bg-primary-container text-white',
    leadTime: '< 12 Jam (Same-Day / Next-Day Pagi)',
    frequency: 'Rute Harian (Senin – Sabtu, 2 Rit/Hari)',
    depotDistance: 'Perimeter Utama Ponokawan Km 27 Krian (Radius 2 – 14 km)',
    vehicle: 'Colt Diesel Boks & Canter Ber-GPS',
    districts: ['Krian', 'Balongbendo', 'Tarik', 'Prambon', 'Wonoayu'],
    description: 'Koridor prioritas dengan perimeter logistik terdekat ke pusat pergudangan. Menyediakan pengantaran terjadwal cepat dan tanggap retur instan.',
  },
  {
    id: 'zona-pusat',
    name: 'Zona 2: Sidoarjo Pusat & Kota',
    badge: 'Sentra Grosir & Pasar Induk',
    badgeVariant: 'bg-[#92400e] text-white',
    leadTime: 'Maksimal 24 Jam (Pemberangkatan 08:00 WIB)',
    frequency: 'Rute Reguler 6 Hari Kerja (Senin – Sabtu)',
    depotDistance: 'Koridor Jalur Arteri Sidoarjo Tengah (12 – 22 km)',
    vehicle: 'Truk Boks 6-Roda & Canter',
    districts: ['Sidoarjo', 'Buduran', 'Candi', 'Sukodono', 'Tulangan'],
    description: 'Kawasan perdagangan grosir, agen pasar sentral, dan toko kelontong jalan arteri utama dengan volume perputaran karton tinggi.',
  },
  {
    id: 'zona-utara',
    name: 'Zona 3: Sidoarjo Utara & Industri',
    badge: 'Koridor Surabaya & Ritel Padat',
    badgeVariant: 'bg-[#065f46] text-white',
    leadTime: 'Maksimal 24 Jam (Jalur Logistik Bypass)',
    frequency: 'Rute Pagi Reguler (Senin – Sabtu)',
    depotDistance: 'Koridor Bypass Waru-Gedangan (18 – 28 km)',
    vehicle: 'Wingbox & Truk Boks Tertutup Ber-GPS',
    districts: ['Waru', 'Taman', 'Gedangan', 'Sedati'],
    description: 'Pusat pemukiman padat dan koridor industri dengan ribuan titik warkop aktif, minimarket, serta agen retail modern.',
  },
  {
    id: 'zona-selatan',
    name: 'Zona 4: Sidoarjo Selatan & Pesisir',
    badge: 'Jalur Lingkar Industri & Pesisir',
    badgeVariant: 'bg-[#075985] text-white',
    leadTime: 'Maksimal 24 Jam Sesuai Klaster Rute',
    frequency: '3× Seminggu Terjadwal (Senin, Rabu, Jumat)',
    depotDistance: 'Koridor Porong-Jabon (20 – 32 km)',
    vehicle: 'Armada Boks Canter Distribusi Khusus',
    districts: ['Tanggulangin', 'Porong', 'Krembung', 'Jabon'],
    description: 'Menjangkau sentra UMKM, pasar tradisional pelosok, dan warung mitra di pesisir serta perbatasan Pasuruan.',
  },
];

export default function Partnership({ setActiveNav }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && successData) {
        setSuccessData(null);
      }
    };
    if (successData) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [successData]);

  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    nik: '',
    address: '',
    district: 'Krian',
    postalCode: '',
    storeType: 'GROSIR',
    estimatedMonthlyTurnover: '18500000',
    operationalYears: '5 Tahun',
    storageCapacity: '50-100 Karton',
    preferredVisitDays: 'Senin & Kamis',
  });

  const [activePreset, setActivePreset] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const applyDemoPreset = (preset) => {
    setFormData(preset.data);
    setActivePreset(preset.label);
    setError(null);
  };

  const handleSelectDistrict = (districtName) => {
    setFormData((prev) => ({ ...prev, district: districtName }));
    const formElem = document.getElementById('form-section');
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth' });
    }
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

  const handlePrintReceipt = () => {
    if (!successData) return;
    const regCode = successData.code || successData.id || 'REG-MITRA-2026-SDA';
    const currentDate = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Bukti Registrasi Kemitraan - ${regCode}</title>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1b1c1c; padding: 40px; margin: 0; background: #fff; line-height: 1.5; }
          .header { border-bottom: 2.5px solid #a80000; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
          .title { font-size: 20px; font-weight: 800; color: #a80000; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .subtitle { font-size: 13px; color: #524341; margin-top: 4px; font-weight: 600; }
          .address { font-size: 11px; color: #7d6b68; margin-top: 4px; }
          .badge { display: inline-block; background: #e8f5e9; color: #1b5e20; border: 1px solid #c8e6c9; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 12px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; background: #fdf8f7; padding: 16px; border-radius: 8px; border: 1px solid #f0e1df; }
          .meta-item { font-size: 12px; }
          .meta-label { color: #7d6b68; font-weight: 500; display: block; margin-bottom: 2px; }
          .meta-val { color: #1b1c1c; font-weight: 700; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12.5px; }
          th, td { border: 1px solid #e5d8d6; padding: 9px 14px; text-align: left; }
          th { background: #fbf5f4; font-weight: 700; color: #433332; width: 35%; }
          td { color: #1b1c1c; }
          .footer-note { font-size: 11px; color: #7d6b68; line-height: 1.6; margin-top: 24px; border-top: 1px dashed #d5c4c2; padding-top: 14px; }
          .sign-area { display: flex; justify-content: space-between; margin-top: 36px; }
          .sign-box { text-align: center; width: 200px; }
          .sign-line { border-bottom: 1px solid #1b1c1c; margin-top: 55px; margin-bottom: 4px; }
          @media print { body { padding: 15px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">PT Inbisco Niagatama Semesta</h1>
            <div class="subtitle">Distributor Resmi Mayora Group — Cabang Krian (Sidoarjo)</div>
            <div class="address">Jl. Raya Ponokawan No. Km. 27 No. 8, Ponokawan, Kec. Krian, Kabupaten Sidoarjo 61262 (Telp: 031-8983290)</div>
          </div>
          <div style="text-align: right;">
            <div class="badge">BUKTI RESMI REGISTRASI</div>
            <div style="font-size: 11px; font-family: monospace; color: #7d6b68; margin-top: 6px;">${regCode}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Nomor Registrasi Sistem:</span>
            <span class="meta-val" style="color: #a80000; font-family: monospace;">${regCode}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Tanggal Pengajuan:</span>
            <span class="meta-val">${currentDate}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Zonasi Layanan:</span>
            <span class="meta-val">Kecamatan ${formData.district} (Depot Krian Hub)</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Status Verifikasi Awal:</span>
            <span class="meta-val" style="color: #1b5e20;">TERDAFTAR — JADWAL SURVEY H+1</span>
          </div>
        </div>

        <table>
          <tr>
            <th>Nama Toko / Outlet</th>
            <td><strong>${formData.name}</strong></td>
          </tr>
          <tr>
            <th>Nama Pemilik / PIC</th>
            <td>${formData.ownerName}</td>
          </tr>
          <tr>
            <th>Nomor WhatsApp Aktif</th>
            <td>${formData.phone}</td>
          </tr>
          <tr>
            <th>Nomor NIK / KTP</th>
            <td>${formData.nik || '-'}</td>
          </tr>
          <tr>
            <th>Alamat Lokasi Fisik</th>
            <td>${formData.address}, Kec. ${formData.district}, Kab. Sidoarjo (${formData.postalCode || '61262'})</td>
          </tr>
          <tr>
            <th>Tipe Profil Usaha</th>
            <td>${formData.storeType}</td>
          </tr>
          <tr>
            <th>Kapasitas Ruang Simpan</th>
            <td>${formData.storageCapacity}</td>
          </tr>
          <tr>
            <th>Pilihan Hari Kunjungan</th>
            <td>${formData.preferredVisitDays}</td>
          </tr>
        </table>

        <div class="sign-area">
          <div class="sign-box">
            <div style="font-size: 11px; color: #7d6b68;">Pemilik / Penanggung Jawab Outlet</div>
            <div class="sign-line"></div>
            <div style="font-size: 12px; font-weight: 700;">${formData.ownerName}</div>
            <div style="font-size: 10px; color: #7d6b68;">Mitra Toko Inbisco</div>
          </div>
          <div class="sign-box">
            <div style="font-size: 11px; color: #7d6b68;">Logistik & Sales Cabang Krian</div>
            <div class="sign-line"></div>
            <div style="font-size: 12px; font-weight: 700;">Tim Kemitraan Mayora</div>
            <div style="font-size: 10px; color: #7d6b68;">PT Inbisco Niagatama Semesta</div>
          </div>
        </div>

        <div class="footer-note">
          <strong>Pemberitahuan Resmi:</strong> Lembar ini merupakan bukti sah pencatatan permohonan kemitraan baru pada sistem Supply Chain Inbisco MitraHub. Petugas Sales Representatif wilayah Anda akan menghubungi via WhatsApp dalam 1×24 jam untuk verifikasi titik GPS dan jadwal pengiriman perdana produk Mayora bebas ongkir.
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
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
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">
                Pendaftaran Mitra Resmi · Cabang Krian
              </span>
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
          {/* Header & Auto-Fill Ribbon */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-primary tracking-wider uppercase">
                LANGKAH PENDAFTARAN (LANGKAH {step} DARI 4)
              </span>
              <h2 className="text-2xl font-bold font-display text-on-surface mt-1">
                Formulir Verifikasi Kemitraan Toko & Warkop
              </h2>
            </div>

            {/* Quick Auto-Fill Tool for Evaluation & Testing */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-surface-container-lowest border border-primary/20 shadow-2xs flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5 pl-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Auto-Fill Uji Form:</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {DEMO_PRESETS.map((p, idx) => {
                  const isActive = activePreset === p.label;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyDemoPreset(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? 'bg-primary-container text-white shadow-2xs font-bold'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface hover:text-primary border border-surface-container-high'
                      }`}
                      title={p.badge}
                    >
                      {isActive && <Check className="h-3 w-3" />}
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Preset Notification Banner */}
          {activePreset && (
            <div className="mb-6 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs anim-fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Data profil <strong>{formData.name}</strong> ({formData.ownerName} · {formData.district}) berhasil dimuat!
                </span>
              </span>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 self-end sm:self-auto cursor-pointer"
              >
                <span>Loncat ke Ringkasan (Langkah 4)</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}

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
                onClick={() => { 
                  if (s.num < step || (formData.name && formData.phone)) {
                    setStep(s.num);
                  }
                }}
                className={`p-3 rounded-xl border text-center transition-all ${
                  step === s.num
                    ? 'bg-primary-container text-white border-primary-container shadow-xs font-bold'
                    : step > s.num
                    ? 'bg-surface-container-lowest text-emerald-800 border-emerald-300 font-semibold cursor-pointer'
                    : formData.name && formData.phone
                    ? 'bg-surface-container-lowest text-on-surface border-surface-container-high hover:border-primary cursor-pointer'
                    : 'bg-surface-container text-on-surface-variant border-surface-container-high opacity-70'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider">
                  {step > s.num ? 'Selesai' : `Langkah ${s.num}`}
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
      {/* SECTION 3: 4 ZONA LOGISTIK & 18 KECAMATAN INTERAKTIF      */}
      {/* ========================================================= */}
      <section className="py-14 bg-surface border-t border-surface-container-high" id="lokasi-coverage">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 space-y-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary tracking-wider uppercase flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5" />
                <span>ZONA DISTRIBUSI & JANGKAUAN LOGISTIK</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-on-surface mt-1">
                Jaringan Rute Terjadwal 18 Kecamatan Kabupaten Sidoarjo
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 max-w-2xl leading-relaxed">
                PT Inbisco Niagatama Semesta Cabang Krian mengoperasikan 4 koridor logistik armada boks Mayora. Klik nama kecamatan untuk langsung memilihnya pada formulir pendaftaran di atas.
              </p>
            </div>

            {formData.district && (
              <div className="px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary font-medium flex items-center gap-2 self-start md:self-auto shrink-0">
                <MapPin className="h-4 w-4" />
                <span>Kecamatan Terpilih di Form: <strong>{formData.district}</strong></span>
              </div>
            )}
          </div>

          {/* 4-Zone Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SIDOARJO_ZONES.map((zone) => {
              const hasActiveDistrict = zone.districts.includes(formData.district);
              return (
                <div
                  key={zone.id}
                  className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    hasActiveDistrict
                      ? 'bg-surface-container-lowest border-primary shadow-sm ring-1 ring-primary/20'
                      : 'bg-surface-container-lowest border-surface-container-high hover:border-surface-variant'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Zone Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${zone.badgeVariant}`}>
                            {zone.badge}
                          </span>
                        </div>
                        <h4 className="text-base font-bold font-display text-on-surface">
                          {zone.name}
                        </h4>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0 border border-surface-container-high">
                        <Truck className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {zone.description}
                    </p>

                    {/* Operational Specs */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                      <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high/60 space-y-0.5">
                        <span className="text-[10px] text-outline font-semibold uppercase block">Frekuensi Kirim</span>
                        <span className="font-semibold text-on-surface text-[11px] block">{zone.frequency}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high/60 space-y-0.5">
                        <span className="text-[10px] text-outline font-semibold uppercase block">SLA Kedatangan</span>
                        <span className="font-semibold text-primary text-[11px] block">{zone.leadTime}</span>
                      </div>
                    </div>

                    {/* Interactive District Pills */}
                    <div>
                      <span className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-2">
                        Pilih Kecamatan Terdaftar:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {zone.districts.map((d) => {
                          const isSelected = formData.district === d;
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => handleSelectDistrict(d)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-primary-container text-white shadow-xs font-bold ring-2 ring-primary ring-offset-1'
                                  : 'bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-on-surface hover:text-primary hover:border-primary/40'
                              }`}
                              title={`Pilih kecamatan ${d} untuk formulir pendaftaran`}
                            >
                              {isSelected ? (
                                <Check className="h-3 w-3 text-white" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-container shrink-0"></span>
                              )}
                              <span>{d}</span>
                              {isSelected && (
                                <span className="text-[10px] bg-white/25 px-1 py-0.2 rounded font-mono">
                                  Aktif
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-container-high/60 flex items-center justify-between text-[11px] text-outline">
                    <span className="truncate">{zone.depotDistance}</span>
                    <span className="shrink-0 font-medium">{zone.vehicle.split('&')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3 Logistics Performance SLA Guarantees */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface block">100% Sidoarjo Tercover</span>
                <span className="text-[11px] text-on-surface-variant">18 kecamatan tanpa area blank spot</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface block">&lt; 24 Jam Garansi Tiba</span>
                <span className="text-[11px] text-on-surface-variant">Armada diberangkatkan rutin tiap pagi</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface block">Rp 0 Biaya Pengiriman</span>
                <span className="text-[11px] text-on-surface-variant">Bebas ongkir sampai ke pintu toko mitra</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SUCCESS MODAL DIALOG (PORTALLED)                         */}
      {/* ========================================================= */}
      {successData &&
        createPortal(
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="partnership-success-title"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <div
              onClick={() => setSuccessData(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs anim-backdrop"
              aria-hidden="true"
            />

            {/* Centering Flex Container */}
            <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-surface-container-high p-6 md:p-8 shadow-2xl space-y-4 anim-modal text-left z-10 my-6 sm:my-8"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>

                <div className="text-center space-y-1">
                  <h3 id="partnership-success-title" className="text-xl font-bold font-display text-on-surface">
                    Pendaftaran Kemitraan Diterima!
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Pengajuan toko Anda telah berhasil dicatat ke dalam sistem operasional Depo Krian.
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

                <div className="text-xs text-on-surface-variant text-center leading-relaxed">
                  Tim Sales Representatif rute <strong>{formData.district}</strong> akan menghubungi WhatsApp Anda dalam 1×24 jam untuk verifikasi titik GPS dan jadwal pengiriman pertama.
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="w-full text-xs font-bold gap-2 bg-primary-container text-white shadow-xs hover:bg-primary transition-colors cursor-pointer py-2.5"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Cetak / Simpan Bukti Registrasi (PDF)</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setSuccessData(null);
                      setActiveNav('products');
                    }}
                    variant="outline"
                    className="w-full text-xs font-semibold cursor-pointer"
                  >
                    Lihat Katalog Produk Grosir
                  </Button>
                  <Button
                    onClick={() => {
                      setSuccessData(null);
                      setActiveNav('home');
                    }}
                    variant="ghost"
                    className="w-full text-xs text-outline hover:text-on-surface cursor-pointer"
                  >
                    Kembali ke Beranda
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
