import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Building2, 
  ShoppingBag, 
  Store, 
  Info, 
  PhoneCall, 
  LogIn, 
  Truck, 
  Menu, 
  X,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

export default function PublicHeader({ activeNav, setActiveNav }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Beranda' },
    { id: 'about', label: 'Tentang Kami' },
    { id: 'moments', label: 'Aktivitas & Jaringan' },
    { id: 'contact', label: 'Kontak' },
  ];

  const productCategories = [
    { label: 'Semua Produk FMCG', id: 'all', category: 'Semua Kategori' },
    { label: 'Biskuit Roma', id: 'biscuit', category: 'Biskuit' },
    { label: 'Wafer & Cokelat Beng-Beng', id: 'wafer', category: 'Wafer & Cokelat' },
    { label: 'Kopi Torabika & Permen Kopiko', id: 'coffee', category: 'Kopi & Teh' },
    { label: 'Sereal & Minuman Energen', id: 'cereal', category: 'Sereal & Minuman' },
    { label: 'Air Mineral Le Minerale', id: 'mineral', category: 'Air Mineral' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/95 backdrop-blur-md border-b border-surface-container-high shadow-xs">
      <div className="h-20 max-w-[1280px] mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Brand Identity */}
        <div 
          onClick={() => setActiveNav('home')} 
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-white shadow-sm group-hover:scale-95 transition-transform duration-200">
            <span className="material-symbols-outlined text-[24px]">corporate_fare</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-display text-on-surface tracking-tight leading-none">
                Inbisco MitraHub
              </span>
            </div>
            <span className="text-xs text-on-surface-variant font-medium mt-0.5">
              PT Inbisco Niagatama Semesta · Cabang Krian
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <button
            onClick={() => setActiveNav('home')}
            className={`pb-1 text-sm font-semibold transition-all duration-200 ${
              activeNav === 'home'
                ? 'border-b-2 border-primary-container text-primary font-bold'
                : 'text-on-surface hover:text-primary'
            }`}
          >
            Beranda
          </button>

          <button
            onClick={() => setActiveNav('about')}
            className={`pb-1 text-sm font-semibold transition-all duration-200 ${
              activeNav === 'about'
                ? 'border-b-2 border-primary-container text-primary font-bold'
                : 'text-on-surface hover:text-primary'
            }`}
          >
            Tentang Kami
          </button>

          {/* Produk Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => setProductDropdownOpen(true)}
            onMouseLeave={() => setProductDropdownOpen(false)}
          >
            <button
              onClick={() => setActiveNav('products')}
              className={`pb-1 text-sm font-semibold inline-flex items-center gap-1 transition-colors ${
                activeNav === 'products'
                  ? 'border-b-2 border-primary-container text-primary font-bold'
                  : 'text-on-surface hover:text-primary'
              }`}
            >
              <span>Produk</span>
              <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${productDropdownOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {productDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container-high py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-1.5 border-b border-surface-container-high mb-1">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Kategori Produk
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveNav('products', 'Semua Kategori');
                    setProductDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 hover:bg-surface-container-low text-on-surface text-sm font-semibold text-primary cursor-pointer"
                >
                  <span>Semua Produk FMCG</span>
                  <span className="material-symbols-outlined text-[16px] text-primary">arrow_forward</span>
                </button>
                {productCategories.slice(1).map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveNav('products', cat.category);
                      setProductDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-1.5 hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface text-xs font-medium text-left cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container shrink-0"></span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveNav('moments')}
            className={`pb-1 text-sm font-semibold transition-all duration-200 ${
              activeNav === 'moments'
                ? 'border-b-2 border-primary-container text-primary font-bold'
                : 'text-on-surface hover:text-primary'
            }`}
          >
            Aktivitas & Jaringan
          </button>

          <button
            onClick={() => setActiveNav('contact')}
            className={`pb-1 text-sm font-semibold transition-all duration-200 ${
              activeNav === 'contact'
                ? 'border-b-2 border-primary-container text-primary font-bold'
                : 'text-on-surface hover:text-primary'
            }`}
          >
            Kontak
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => setActiveNav('login')}
            className="inline-flex items-center px-4 py-2 rounded-lg border border-surface-variant bg-surface-container-lowest text-on-surface text-sm font-semibold hover:bg-surface-container-low transition-colors shadow-2xs"
          >
            <span>Portal Masuk</span>
          </button>

          <button
            onClick={() => setActiveNav('partnership')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-white text-sm font-bold hover:bg-secondary-container transition-all shadow-sm active:scale-95"
          >
            <span>Daftar Kemitraan</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setActiveNav('login')}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-surface-variant bg-surface-container-lowest"
          >
            Portal
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-on-surface hover:bg-surface-container"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6 text-on-surface" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-surface-container-high bg-surface-container-lowest px-4 py-3 space-y-1">
          <button
            onClick={() => { setActiveNav('home'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
              activeNav === 'home' ? 'bg-primary text-white font-bold' : 'text-on-surface hover:bg-surface-container'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => { setActiveNav('about'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
              activeNav === 'about' ? 'bg-primary text-white font-bold' : 'text-on-surface hover:bg-surface-container'
            }`}
          >
            Tentang Kami
          </button>
          <button
            onClick={() => { setActiveNav('products'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
              activeNav === 'products' ? 'bg-primary text-white font-bold' : 'text-on-surface hover:bg-surface-container'
            }`}
          >
            Katalog Produk FMCG
          </button>
          <button
            onClick={() => { setActiveNav('moments'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
              activeNav === 'moments' ? 'bg-primary text-white font-bold' : 'text-on-surface hover:bg-surface-container'
            }`}
          >
            Aktivitas & Jaringan Distribusi
          </button>
          <button
            onClick={() => { setActiveNav('contact'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
              activeNav === 'contact' ? 'bg-primary text-white font-bold' : 'text-on-surface hover:bg-surface-container'
            }`}
          >
            Kontak & Kantor Cabang
          </button>
          <div className="pt-2 border-t border-surface-container-high">
            <button
              onClick={() => { setActiveNav('partnership'); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-primary-container text-white text-sm font-bold shadow-sm"
            >
              <span>Daftar Kemitraan Sekarang</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
