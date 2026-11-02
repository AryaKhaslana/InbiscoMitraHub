import React, { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [msg, setMsg] = useState({ name: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="space-y-3 max-w-2xl">
        <Badge variant="tertiary" className="text-xs uppercase">Bantuan & Komunikasi</Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
          Pusat Layanan Kemitraan & Bantuan Mitra Toko
        </h1>
        <p className="text-sm text-on-surface-variant">
          Punya pertanyaan seputar pendaftaran toko, pengajuan plafon tempo, atau kendala pengiriman pesanan? Tim kami siap melayani Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-outline/10">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Depo Krian Hub Mayora</h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Kawasan Industri & Pergudangan KM 29 Krian<br />
                    Kabupaten Sidoarjo, Jawa Timur 61262
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Hotline WhatsApp CS Sidoarjo</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    0812-3456-7890 (Layanan Mitra Cepat)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Jam Operasional Gudang</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Senin – Sabtu: 07:00 – 17:00 WIB<br />
                    Minggu & Libur Nasional: Off (Emergency Only)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-5 bg-surface-container-low rounded-xl border border-outline/10 text-xs text-on-surface-variant space-y-2">
            <div className="font-bold text-on-surface">Komitmen Respon Cepat:</div>
            <p>
              Setiap pesan yang masuk melalui WhatsApp hotline atau form pengaduan akan dijawab oleh staf operasional dalam waktu maksimal 15 menit pada jam kerja.
            </p>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="lg:col-span-7">
          <Card className="border-outline/15 shadow-sm">
            <CardContent className="p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg text-on-surface">Pesan Anda Telah Diterima!</h3>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                    Terima kasih. Tim logistik dan kemitraan Depo Krian akan segera menghubungi nomor WhatsApp Anda.
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="outline" size="sm">
                    Kirim Pesan Lain
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Kirimkan Pertanyaan atau Permintaan Bantuan
                  </h3>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface">Nama Anda / Toko</label>
                    <Input
                      value={msg.name}
                      onChange={(e) => setMsg({ ...msg, name: e.target.value })}
                      placeholder="Ibu Ratih - Toko Ratih Waru"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface">Nomor Handphone / WhatsApp</label>
                    <Input
                      value={msg.phone}
                      onChange={(e) => setMsg({ ...msg, phone: e.target.value })}
                      placeholder="081234567890"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface">Pesan / Pertanyaan</label>
                    <textarea
                      rows={4}
                      value={msg.message}
                      onChange={(e) => setMsg({ ...msg, message: e.target.value })}
                      placeholder="Contoh: Saya ingin menanyakan plafon tempo untuk toko saya di Kecamatan Prambon..."
                      className="w-full p-3 rounded-lg border border-outline/20 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full font-bold">
                    Kirim Pesan ke Tim Logistik
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
