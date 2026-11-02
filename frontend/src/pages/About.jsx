import React from 'react';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Building2, ShieldCheck, MapPin, Truck, Target, Users, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* HEADER */}
      <div className="space-y-3 max-w-3xl">
        <Badge variant="tertiary" className="text-xs uppercase">Profil Perusahaan & Ekosistem</Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
          Menjaga Pasokan FMCG Mayora Tetap Mengalir di Seluruh Pelosok Sidoarjo
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
          PT Inbisco Niagatama Semesta adalah entitas distribusi strategis produk-produk Mayora Group di Jawa Timur. Melalui platform digital Inbisco MitraHub (SupplySync), kami mendigitalkan ekosistem rantai pasok dari pabrik hingga ke rak warung kelontong.
        </p>
      </div>

      {/* 3 CORE STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-outline/10">
          <CardContent className="pt-6 space-y-2">
            <div className="text-3xl font-black text-primary">28 Depo</div>
            <div className="font-bold text-on-surface">Jaringan Mitra Jawa Timur</div>
            <p className="text-xs text-on-surface-variant">
              Terhubung dalam jaringan SupplySync macro-intelligence Mayora Enterprise HQ Surabaya.
            </p>
          </CardContent>
        </Card>

        <Card className="border-outline/10">
          <CardContent className="pt-6 space-y-2">
            <div className="text-3xl font-black text-primary">18 Kecamatan</div>
            <div className="font-bold text-on-surface">Jangkauan Penuh Sidoarjo</div>
            <p className="text-xs text-on-surface-variant">
              Dari kawasan barat Krian, Balongbendo, Tarik hingga timur Sedati, Waru, dan Porong.
            </p>
          </CardContent>
        </Card>

        <Card className="border-outline/10">
          <CardContent className="pt-6 space-y-2">
            <div className="text-3xl font-black text-emerald-700">100% FEFO</div>
            <div className="font-bold text-on-surface">Jaminan Kesegaran Produk</div>
            <p className="text-xs text-on-surface-variant">
              Sistem batch rotasi otomatis mencegah stok kedaluwarsa mengendap di gudang distributor maupun toko.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* VISION & MISSION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-surface-container-low p-8 rounded-2xl border border-outline/10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Target className="h-4 w-4" />
            Visi & Misi Inovasi
          </div>
          <h2 className="text-2xl font-bold text-on-surface">
            Kedaulatan Pasokan Ritel Tradisional Berbasis Data Preskriptif
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Misi kami adalah menghapuskan fenomena <em>stockout</em> (kehabisan barang) pada produk konsumsi harian masyarakat seperti biskuit Roma dan kopi Torabika, sekaligus melindungi permodalan pemilik warung kecil melalui transparansi harga dan plafon tempo yang berkeadilan.
          </p>
          <div className="space-y-2 text-xs text-on-surface">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Transparansi harga grosir resmi tanpa perantara bertingkat.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Pencegahan disparitas harga antar-wilayah pedesaan dan perkotaan.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Efisiensi emisi logistik armada melalui konsolidasi muatan truk (FTL).</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline/10 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary text-white flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface">Depo Operasional Krian Hub</h3>
              <p className="text-[11px] text-on-surface-variant">Simpul Gerbang Logistik Sidoarjo Barat</p>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Berlokasi di koridor strategis KM 29 Krian, depo ini menjadi hub transit langsung dari pabrik Mayora DC Pasuruan. Memiliki kapasitas simpan 12.000 karton dengan fasilitas loading dock 6 armada secara simultan.
          </p>
        </div>
      </div>
    </div>
  );
}
