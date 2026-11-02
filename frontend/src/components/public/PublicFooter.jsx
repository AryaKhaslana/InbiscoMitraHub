import React from 'react';
import { Badge } from '../ui/badge';
import { Building2, ShieldCheck, Truck, Clock, Award } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="border-t border-outline/10 bg-surface-container-low text-on-surface pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-outline/10">
          {/* Col 1: About */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
                IM
              </div>
              <span className="font-bold text-base text-on-surface">Inbisco MitraHub</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Distributor resmi PT Inbisco Niagatama Semesta (Mayora Group). Menyediakan pasokan grosir langsung ke 18 kecamatan di Kabupaten Sidoarjo dengan jaminan FEFO dan SLA 24 jam.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="tertiary" className="text-[10px]">GTNIC 2026 Innovation</Badge>
              <span className="text-[11px] text-on-surface-variant">Web Dev Competition</span>
            </div>
          </div>

          {/* Col 2: Hub & Operations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-outline">Pusat Distribusi (Depo)</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong>Depo Krian Hub Mayora</strong><br />
              Kawasan Industri & Pergudangan Krian KM 29<br />
              Kabupaten Sidoarjo, Jawa Timur 61262
            </p>
            <div className="text-xs text-on-surface-variant space-y-1">
              <div>Penerimaan PO: 06:00 – 17:00 WIB</div>
              <div>Jadwal Armada: 2 Wave Harian</div>
            </div>
          </div>

          {/* Col 3: Key Commitments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-outline">4 Pilar Komitmen</h4>
            <ul className="text-xs text-on-surface-variant space-y-2">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>100% Produk Mayora Asli & Segel Pabrik</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Pengiriman Maksimal 24 Jam Pasti Tiba</span>
              </li>
              <li className="flex items-center gap-2">
                <Award className="h-3.5 w-3.5 text-primary" />
                <span>Manajemen Kedaluwarsa FEFO Ketat</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-primary" />
                <span>Armada Wingbox & Canter Ber-GPS</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Tim Inovasi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-outline">Tim Pengembang GTNIC</h4>
            <div className="p-3 bg-surface-container rounded-lg border border-outline/10 text-xs text-on-surface-variant space-y-1">
              <div className="font-semibold text-on-surface">SMK Telkom Sidoarjo</div>
              <div>• Raka Al-islami</div>
              <div>• Arya Chaka Braja Wisesa</div>
              <div>• Allifa Qurrota Ayunina</div>
              <div className="text-[10px] text-outline pt-1">Garda Tech National Innovation 2026</div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <div>© 2026 PT Inbisco Niagatama Semesta & Tim GTNIC. Hak cipta dilindungi undang-undang.</div>
          <div className="flex items-center gap-4">
            <span>Privasi Kebijakan</span>
            <span>Syarat & Ketentuan Kemitraan</span>
            <span>API Docs v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
