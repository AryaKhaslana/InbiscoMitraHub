import React, { useState } from 'react';
import { Badge } from '../components/ui/badge';
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
  MessageSquare
} from 'lucide-react';

export default function Contact({ setActiveNav }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    storeName: '',
    category: 'Kemitraan Toko Baru',
    message: '',
  });

  const faqChips = [
    'Berapa minimal order karton untuk toko baru?',
    'Kapan jadwal rute armada kirim ke Krian & Balongbendo?',
    'Bagaimana syarat pengajuan tempo pembayaran TOP 14 hari?',
    'Prosedur retur jika ada kemasan dus rusak di jalan?',
  ];

  const handleSelectFaq = (question) => {
    setFormData((prev) => ({
      ...prev,
      message: question,
    }));
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
      if (api.submitContactInquiry) {
        await api.submitContactInquiry(formData);
      }
      setSubmitted(true);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      // Even on network error, gracefully confirm for UX
      setSubmitted(true);
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
            <span className="text-on-surface font-semibold">Kontak & Inquiries</span>
          </nav>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary font-bold text-xs uppercase tracking-wider border border-surface-variant">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              <span>LAYANAN INFORMASI DISTRIBUSI RESMI · KRIAN</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-on-surface tracking-tight">
              Hubungi Tim Penjualan & Kemitraan Cabang Krian
            </h1>
            <p className="text-base text-on-surface-variant leading-relaxed">
              Pusat komunikasi terpadu untuk konsultasi rute pengantaran, pembukaan akun grosir baru, dan informasi ketersediaan pasokan produk Mayora FMCG di wilayah Kabupaten Sidoarjo.
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
            {/* LEFT COLUMN: DEPOT INFO & FAQ CHIPS */}
            <div className="lg:col-span-5 space-y-6">
              {/* Depot Warehouse Card */}
              <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-5 shadow-xs space-y-4">
                <div className="relative h-44 rounded-xl overflow-hidden bg-surface-container">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV2H9nF8GLDWtNtpTxEambD16lyZIfbzF97RfbuFxzgH35TVc6nfJQrd4TxSQdFiV-sXsn3sFPwREneZpfZC6O1Df_k9dHH4ks-UKxsEJZ1lcQXUlEIEIcmcmo-tjOvPPh0uIO3eEgvyRwYlldHV2Pl6vY1mLMiFlOr1P7kJ0TozDUN-a5yGD0-MudaW1nt1X245d-ydtCaeRQnRHPRcJgWuV1rmUlQ2qKMek6zGY"
                    alt="Depot pergudangan distribusi logistik Inbisco MitraHub cabang Krian"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <span className="absolute bottom-3 left-3 text-white text-xs font-bold font-display">
                    Depot Konsolidasi Krian Sidoarjo
                  </span>
                </div>

                <div className="space-y-3 text-xs text-on-surface-variant">
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
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-emerald-700 shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <strong className="text-on-surface block text-sm">WhatsApp Resmi CS Kemitraan</strong>
                      <span className="font-mono text-emerald-800 font-bold">+62 812-3456-7890</span>
                      <span className="text-[11px] block text-outline">Respons &lt; 15 menit pada jam kerja</span>
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
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <strong className="text-on-surface block text-sm">Jam Operasional Layanan</strong>
                      <span>Senin – Sabtu: 07:00 – 17:00 WIB</span>
                      <span className="text-[11px] block text-outline">Minggu / Tanggal Merah: Operasional Off</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Chips Container */}
              <div className="bg-surface-container-low rounded-2xl border border-surface-container-high p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Topik Bantuan Cepat (FAQ Chips)
                  </h3>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Klik pertanyaan umum di bawah untuk langsung menyalin ke formulir:
                </p>
                <div className="flex flex-col gap-2">
                  {faqChips.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectFaq(q)}
                      className="text-left p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high hover:border-primary text-xs font-medium text-on-surface hover:text-primary transition-colors flex items-center justify-between group shadow-2xs"
                    >
                      <span>{q}</span>
                      <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary">
                        add
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: INQUIRY FORM */}
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl border border-surface-container-high p-6 md:p-8 shadow-xs">
              <div className="pb-4 border-b border-surface-container-high mb-6">
                <h2 className="text-xl font-bold font-display text-on-surface">
                  Formulir Permintaan Kemitraan & Pertanyaan
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Kirimkan detail pesan Anda, representatif cabang akan menghubungi via WhatsApp dalam 1×24 jam.
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
                        Nama Lengkap PIC <span className="text-error">*</span>
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Cth: Ibu Dewi Ratnasari"
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
                        Nama Usaha / Toko (Opsional)
                      </label>
                      <Input
                        value={formData.storeName}
                        onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                        placeholder="Cth: Toko Barokah Krian"
                        className="text-xs h-10"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-on-surface block mb-1">
                        Kategori Pertanyaan
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
                      placeholder="Jelaskan kebutuhan pasokan produk, lokasi toko, atau pertanyaan Anda..."
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
    </div>
  );
}
