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
  Truck
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
    name: '',
    ownerName: '',
    phone: '',
    address: '',
    district: 'Krian',
    postalCode: '61262',
    storeType: 'GROSIR',
    estimatedMonthlyTurnover: '15000000',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name.trim() || !formData.ownerName.trim() || !formData.phone.trim()) {
        setError('Harap lengkapi semua data identitas toko dan pemilik.');
        return;
      }
    } else if (step === 2) {
      if (!formData.address.trim()) {
        setError('Harap isi alamat lengkap lokasi toko fisik.');
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
      });

      setSuccessData(res.store || res);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal. Periksa apakah nomor handphone sudah pernah didaftarkan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <Badge variant="tertiary" className="text-xs uppercase">Program Kemitraan Toko Sidoarjo</Badge>
        <h1 className="text-3xl font-black text-on-surface tracking-tight">
          Formulir Registrasi Mitra Resmi Inbisco Mayora
        </h1>
        <p className="text-sm text-on-surface-variant">
          Dapatkan akses harga prinsipal pabrik, fasilitas TOP tempo 14 hari, dan prioritas pasokan SKU fast-moving Mayora.
        </p>
      </div>

      {/* STEP PROGRESS INDICATOR */}
      {!successData && (
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {[
            { num: 1, label: 'Identitas Toko' },
            { num: 2, label: 'Alamat Sidoarjo' },
            { num: 3, label: 'Tipe Usaha' },
            { num: 4, label: 'Konfirmasi' },
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === item.num
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : step > item.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {step > item.num ? '✓' : item.num}
              </div>
              <span className={`hidden sm:inline text-xs font-semibold ${step === item.num ? 'text-primary' : 'text-on-surface-variant'}`}>
                {item.label}
              </span>
              {item.num < 4 && <div className="hidden sm:block w-6 h-0.5 bg-outline/20"></div>}
            </div>
          ))}
        </div>
      )}

      {/* MAIN CARD */}
      <Card className="border-outline/15 shadow-xl overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <strong className="block font-bold">Terjadi Kendala:</strong>
                {error}
              </div>
            </div>
          )}

          {successData ? (
            /* SUCCESS STATE */
            <div className="text-center py-8 space-y-6">
              <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-on-surface">Pendaftaran Berhasil Diajukan!</h3>
                <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                  Selamat, toko Anda telah terdaftar di sistem Inbisco MitraHub. Tim Dispatcher Depo Krian akan memverifikasi dalam waktu 1x24 jam.
                </p>
              </div>

              <div className="p-5 bg-surface-container-low rounded-xl border border-outline/10 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Nama Toko:</span>
                  <strong className="text-on-surface">{formData.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Pemilik:</span>
                  <span className="font-semibold text-on-surface">{formData.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Nomor WhatsApp:</span>
                  <span className="font-mono text-primary font-bold">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Kecamatan:</span>
                  <span className="font-semibold text-on-surface">{formData.district}, Sidoarjo</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-outline/10">
                  <span className="text-on-surface-variant">Status Akun:</span>
                  <Badge variant="warning">Menunggu Verifikasi Depo</Badge>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Button onClick={() => setActiveNav('products')} size="lg" className="w-full sm:w-auto font-bold gap-2">
                  <Store className="h-4 w-4" />
                  <span>Jelajahi Katalog Grosir</span>
                </Button>
                <Button onClick={() => setActiveNav('home')} variant="outline" size="lg" className="w-full sm:w-auto">
                  Kembali ke Beranda
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={step === 4 ? handleSubmit : handleNext}>
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-outline/10 pb-3">
                    <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                      <Store className="h-5 w-5 text-primary" />
                      Langkah 1: Identitas Toko & Pemilik
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Informasi ini akan tertera pada faktur resmi dan delivery order Mayora.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface">Nama Toko / Warung</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Contoh: Toko Barokah Jaya"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface">Nama Lengkap Pemilik (Sesuai KTP)</label>
                      <Input
                        value={formData.ownerName}
                        onChange={(e) => handleChange('ownerName', e.target.value)}
                        placeholder="Contoh: Hj. Siti Nurhaliza"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface">Nomor WhatsApp Aktif</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="Contoh: 081234567890"
                        required
                      />
                      <p className="text-[11px] text-outline">
                        Digunakan untuk konfirmasi pesanan harian dan pelacakan GPS armada.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-outline/10 pb-3">
                    <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Langkah 2: Lokasi Toko di Kabupaten Sidoarjo
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Armada kami melayani 18 kecamatan di Sidoarjo dengan rute terjadwal.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface">Kecamatan</label>
                      <select
                        value={formData.district}
                        onChange={(e) => handleChange('district', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-outline/20 bg-surface-container-low text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {SIDOARJO_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>
                            Kecamatan {dist}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface">Alamat Lengkap Toko</label>
                      <textarea
                        rows={3}
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="Jl. Raya Krian No. 45, RT 02 / RW 01 (Depan Pasar Krian)"
                        className="w-full p-3 rounded-lg border border-outline/20 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface">Kode Pos</label>
                      <Input
                        value={formData.postalCode}
                        onChange={(e) => handleChange('postalCode', e.target.value)}
                        placeholder="61262"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-outline/10 pb-3">
                    <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      Langkah 3: Karakteristik Usaha & Perputaran
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Membantu kami menetapkan rekomendasi alokasi kuota produk fast-moving.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface">Kategori Usaha</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'GROSIR', label: 'Toko Grosir / Agen', desc: 'Menjual dalam dus ke warung lain' },
                          { id: 'WARUNG_KELONTONG', label: 'Warung Kelontong', desc: 'Menjual eceran ke warga' },
                          { id: 'MINIMARKET', label: 'Minimarket Lokal', desc: 'Toko swalayan mandiri' },
                        ].map((t) => (
                          <div
                            key={t.id}
                            onClick={() => handleChange('storeType', t.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              formData.storeType === t.id
                                ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                                : 'border-outline/20 bg-surface-container-low hover:bg-surface-container'
                            }`}
                          >
                            <div className="text-xs font-bold text-on-surface">{t.label}</div>
                            <div className="text-[10px] text-on-surface-variant mt-1">{t.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface">Estimasi Omzet Grosir Mayora per Bulan</label>
                      <select
                        value={formData.estimatedMonthlyTurnover}
                        onChange={(e) => handleChange('estimatedMonthlyTurnover', e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-outline/20 bg-surface-container-low text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="5000000">&lt; Rp 5.000.000 (Pemula)</option>
                        <option value="15000000">Rp 5.000.000 – Rp 25.000.000 (Menengah)</option>
                        <option value="50000000">&gt; Rp 25.000.000 (Besar / Sub-Agen)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-outline/10 pb-3">
                    <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Langkah 4: Konfirmasi Pendaftaran Mitra
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Periksa kembali keakuratan data toko Anda sebelum dikirim ke sistem operasional.
                    </p>
                  </div>

                  <div className="p-4 bg-surface-container-low rounded-xl border border-outline/10 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-outline">Nama Toko:</span>
                        <div className="font-bold text-on-surface">{formData.name}</div>
                      </div>
                      <div>
                        <span className="text-outline">Pemilik:</span>
                        <div className="font-bold text-on-surface">{formData.ownerName}</div>
                      </div>
                      <div>
                        <span className="text-outline">No. WhatsApp:</span>
                        <div className="font-mono font-bold text-primary">{formData.phone}</div>
                      </div>
                      <div>
                        <span className="text-outline">Kecamatan:</span>
                        <div className="font-bold text-on-surface">{formData.district}, Sidoarjo</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-outline/10">
                      <span className="text-outline">Alamat Pengiriman:</span>
                      <div className="font-medium text-on-surface">{formData.address}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                    <Truck className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
                    <div>
                      Dengan menekan tombol di bawah, Anda menyatakan bahwa data ini benar dan bersedia diverifikasi oleh tim surveyor lapangan Depo Krian.
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-between pt-6 border-t border-outline/10 mt-6">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={handleBack} className="gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Sebelumnya</span>
                  </Button>
                ) : (
                  <div></div>
                )}

                {step < 4 ? (
                  <Button type="submit" className="gap-1 font-bold">
                    <span>Lanjutkan</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading} className="gap-2 font-bold bg-primary hover:bg-primary-container">
                    {loading ? 'Mendaftarkan Toko...' : 'Kirim Pendaftaran Resmi'}
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
