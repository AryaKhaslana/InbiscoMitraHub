import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Send, 
  AlertCircle,
  HelpCircle,
  ChevronDown,
  MessageSquare
} from 'lucide-react';

export default function Contact({ setActiveNav }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(0); // first item open by default

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    storeName: '',
    category: 'Kemitraan Toko Baru',
    message: '',
  });

  const faqs = [
    {
      q: 'Berapa minimal order (MOQ) pembelian produk FMCG untuk toko atau warung baru?',
      a: 'Tidak ada batasan volume puluhan karton untuk toko baru. Mitra UMKM dan warung kelontong di Sidoarjo dapat memesan mulai dari 1 karton per varian produk. Kami juga mendukung pemesanan campuran (mix SKU) seperti Roma, Beng-Beng, Torabika, dan Le Minerale dalam satu jadwal pengantaran armada tanpa biaya kirim tambahan.',
      category: 'Pemesanan Grosir Volume Besar (Agen)',
    },
    {
      q: 'Kapan jadwal armada pengiriman ke Krian, Balongbendo, dan wilayah Sidoarjo lainnya?',
      a: 'Pengiriman logistik armada beroperasi rutin setiap hari kerja (Senin – Sabtu). Pesanan yang terkonfirmasi sebelum pukul 14:00 WIB dijadwalkan tiba H+1 sesuai zonasi rute harian armada truk boks kami di masing-masing dari 18 kecamatan di Kabupaten Sidoarjo.',
      category: 'Konsultasi Jadwal Rute Pengiriman',
    },
    {
      q: 'Apa saja syarat dan prosedur pengajuan fasilitas tempo pembayaran (TOP 7 – 14 Hari)?',
      a: 'Fasilitas tempo (Term of Payment) dibuka bagi mitra toko yang telah aktif bertransaksi tunai/COD minimal 3 kali pemesanan berturut-turut. Pengajuan dilanjutkan dengan verifikasi fisik outlet dan konfirmasi kesepakatan oleh petugas Sales Representatif wilayah Anda.',
      category: 'Pengajuan Plafon Tempo (TOP)',
    },
    {
      q: 'Bagaimana prosedur penukaran (retur) jika terdapat dus penyok atau kemasan rusak di jalan?',
      a: 'Pemeriksaan fisik dilakukan bersama kurir armada saat proses bongkar muat. Apabila ditemukan kemasan rusak atau bocor karena perjalanan, retur diproses seketika di tempat dengan Berita Acara Serah Terima tanpa biaya penalti apapun, digantikan stok baru pada pengiriman berikutnya.',
      category: 'Lainnya',
    },
    {
      q: 'Apakah pendaftaran kemitraan toko dikenakan biaya registrasi atau deposit awal?',
      a: 'Pendaftaran kemitraan 100% GRATIS dan bebas deposit awal. Mitra hanya membayar total nilai produk yang dipesan sesuai faktur resmi cabang pabrikan. Seluruh faktur diterbitkan sah dengan pencatatan pajak resmi.',
      category: 'Kemitraan Toko Baru',
    },
  ];

  const toggleFaq = (idx) => {
    setOpenFaq((prev) => (prev === idx ? -1 : idx));
  };

  const handleApplyFaqToForm = (faqItem) => {
    setFormData((prev) => ({
      ...prev,
      category: faqItem.category || prev.category,
      message: `Tanya terkait: "${faqItem.q}" - `,
    }));
    const formElem = document.getElementById('inquiry-form-card');
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setError('Harap lengkapi semua kolom wajib bertanda bintang (*).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.submitContactInquiry(formData);
      setSubmitted(true);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      setError(err.message || 'Gagal mengirim pesan. Silakan coba kembali atau hubungi via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-surface pb-16">
      {/* ========================================================= */}
      {/* SECTION 0: HERO & BREADCRUMB                              */}
      {/* ========================================================= */}
      <section className="bg-surface-container-lowest border-b border-surface-container-high py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <nav className="flex items-center gap-2 text-xs text-outline mb-6">
            <button onClick={() => setActiveNav && setActiveNav('home')} className="hover:text-primary transition-colors">
              Beranda
            </button>
            <span className="material-symbols-outlined text-[16px] text-surface-dim">chevron_right</span>
            <span className="text-on-surface font-semibold">Kontak & Layanan Informasi</span>
          </nav>

          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block">
              Layanan Informasi Distribusi Resmi · Cabang Krian
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-on-surface tracking-tight">
              Hubungi Tim Penjualan & Kemitraan Cabang Krian
            </h1>
            <p className="text-base text-on-surface-variant leading-relaxed">
              Pusat komunikasi resmi untuk konsultasi jadwal pengantaran armada logistik, pembukaan akun mitra grosir/warung baru, dan pasokan produk FMCG Mayora Group di Kabupaten Sidoarjo.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 1: CONTACT INFO & INQUIRY FORM                    */}
      {/* ========================================================= */}
      <section className="py-12">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: DEPOT INFO */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-5 shadow-xs space-y-4">
                <div className="relative h-44 rounded-xl overflow-hidden bg-surface-container">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV2H9nF8GLDWtNtpTxEambD16lyZIfbzF97RfbuFxzgH35TVc6nfJQrd4TxSQdFiV-sXsn3sFPwREneZpfZC6O1Df_k9dHH4ks-UKxsEJZ1lcQXUlEIEIcmcmo-tjOvPPh0uIO3eEgvyRwYlldHV2Pl6vY1mLMiFlOr1P7kJ0TozDUN-a5yGD0-MudaW1nt1X245d-ydtCaeRQnRHPRcJgWuV1rmUlQ2qKMek6zGY"
                    alt="Depot pergudangan logistik Inbisco MitraHub cabang Krian"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <span className="absolute bottom-3 left-3 text-white text-xs font-bold font-display">
                    Depot Konsolidasi Logistik Krian
                  </span>
                </div>

                <div className="space-y-3.5 text-xs text-on-surface-variant">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <strong className="text-on-surface block text-sm">Alamat Kantor & Depot</strong>
                      <span>Jl. Raya Krian KM 29, Krian, Kabupaten Sidoarjo, Jawa Timur 61262</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <strong className="text-on-surface block text-sm">WhatsApp Resmi CS Kemitraan</strong>
                      <a 
                        href="https://wa.me/6281234567890" 
                        target="_blank" 
                        rel="noreferrer"
                        className="font-mono text-emerald-800 font-bold hover:underline block"
                      >
                        +62 812-3456-7890
                      </a>
                      <span className="text-[11px] block text-outline">Respons cepat pada jam kerja operasional</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <strong className="text-on-surface block text-sm">Email Korespondensi Bisnis</strong>
                      <span className="font-mono">mitrahub.krian@inbisco.co.id</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <strong className="text-on-surface block text-sm">Jam Operasional Layanan</strong>
                      <span>Senin – Sabtu: 07:00 – 17:00 WIB</span>
                      <span className="text-[11px] block text-outline">Minggu & Hari Libur Nasional: Gudang Off</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-surface-container-high">
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Tim%20Inbisco%20Krian,%20saya%20ingin%20berkonsultasi%20seputar%20pasokan%20produk%20FMCG."
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Hubungi CS WhatsApp Cabang</span>
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: INQUIRY FORM */}
            <div 
              id="inquiry-form-card" 
              className="lg:col-span-7 bg-surface-container-lowest rounded-2xl border border-surface-container-high p-6 md:p-8 shadow-xs"
            >
              <div className="pb-4 border-b border-surface-container-high mb-6">
                <h2 className="text-xl font-bold font-display text-on-surface">
                  Formulir Permintaan Kemitraan & Pertanyaan
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Kirimkan detail kebutuhan pasokan Anda. Tim sales representatif cabang kami akan menindaklanjuti via WhatsApp dalam waktu maksimal 1×24 jam kerja.
                </p>
              </div>

              {submitted ? (
                <div className="text-center py-10 space-y-3">
                  <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-on-surface">
                    Pesan Kemitraan Terkirim!
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                    Terima kasih telah menghubungi PT Inbisco Niagatama Semesta Cabang Krian. Sales representatif wilayah Anda akan segera menghubungi nomor WhatsApp Anda.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', phone: '', storeName: '', category: 'Kemitraan Toko Baru', message: '' });
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                  >
                    Kirim Pesan Lainnya
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-error-container text-on-error-container text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-error shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-on-surface block mb-1">
                        Nama Lengkap Penanggung Jawab <span className="text-error">*</span>
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Cth: Budi Santoso"
                        className="text-xs h-10"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-on-surface block mb-1">
                        Nomor WhatsApp Aktif <span className="text-error">*</span>
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="081234567890"
                        className="text-xs h-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-on-surface block mb-1">
                        Nama Toko / Warung / Usaha (Opsional)
                      </label>
                      <Input
                        value={formData.storeName}
                        onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                        placeholder="Cth: Toko Berkah Barokah"
                        className="text-xs h-10"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-on-surface block mb-1">
                        Kategori Keperluan
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full text-xs h-10 rounded-md border border-input bg-surface-container-lowest px-3 py-1 font-medium"
                      >
                        <option>Kemitraan Toko Baru</option>
                        <option>Konsultasi Jadwal Rute Pengiriman</option>
                        <option>Pengajuan Plafon Tempo (TOP)</option>
                        <option>Pemesanan Grosir Volume Besar (Agen)</option>
                        <option>Lainnya</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Pesan atau Kebutuhan Suplai <span className="text-error">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      placeholder="Jelaskan kebutuhan pasokan produk, lokasi toko di Sidoarjo, atau pertanyaan spesifik Anda..."
                      className="w-full text-xs rounded-md border border-input bg-surface-container-lowest p-3 focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="px-8 text-xs font-bold gap-2 shadow-sm"
                    >
                      <Send className="h-4 w-4" />
                      <span>{submitting ? 'Mengirim...' : 'Kirim Pesan Kemitraan'}</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: PROMINENT ACCORDION FAQ SECTION                */}
      {/* ========================================================= */}
      <section className="py-12 border-t border-surface-container-high bg-surface-container-lowest">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto mb-10 text-center">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">
              Tanya Jawab Terstruktur (FAQ)
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface tracking-tight">
              Pertanyaan yang Sering Diajukan Mitra
            </h2>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              Ketahui syarat ketentuan pemesanan grosir, jadwal armada pengiriman ke 18 kecamatan di Sidoarjo, prosedur klaim retur, dan fasilitas tempo pembayaran.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-primary/40 bg-surface shadow-xs'
                      : 'border-surface-container-high bg-surface-container-lowest hover:border-surface-variant'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold font-display text-on-surface leading-snug">
                      {faq.q}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen ? 'bg-primary/10 text-primary rotate-180' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 border-t border-surface-container-high/60 mt-1">
                      <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed pt-3">
                        {faq.a}
                      </p>
                      <div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-container-high/40 text-xs">
                        <button
                          type="button"
                          onClick={() => handleApplyFaqToForm(faq)}
                          className="font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          <span>Tanyakan topik ini di formulir</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                        <span className="text-[11px] text-outline font-medium">Cabang Krian Sidoarjo</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
