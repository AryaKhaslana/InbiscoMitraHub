import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuthRole } from '../../context/AuthRoleContext';
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
  ExternalLink
} from 'lucide-react';

export default function PublicHeader({ activeNav, setActiveNav }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { switchRole } = useAuthRole();

  const navLinks = [
    { id: 'home', label: 'Beranda', icon: Building2 },
    { id: 'products', label: 'Katalog Grosir', icon: ShoppingBag },
    { id: 'partnership', label: 'Kemitraan Toko', icon: Store },
    { id: 'moments', label: 'Rantai Pasok & Armada', icon: Truck },
    { id: 'about', label: 'Tentang Kami', icon: Info },
    { id: 'contact', label: 'Kontak', icon: PhoneCall },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline/10 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveNav('home')} 
          className="flex cursor-pointer items-center gap-3 transition-transform hover:scale-[1.01]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
            <span className="font-bold text-lg tracking-wider">IM</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-on-surface tracking-tight">Inbisco MitraHub</span>
              <Badge variant="tertiary" className="text-[10px] uppercase font-bold py-0 px-1.5">GTNIC 2026</Badge>
            </div>
            <span className="text-[11px] font-medium text-on-surface-variant">PT Inbisco Niagatama Semesta • Depo Krian</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeNav === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveNav(link.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} />
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20Inbisco%20MitraHub,%20saya%20ingin%20tanya%20program%20kemitraan%20toko%20Mayora"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            CS WhatsApp
          </a>

          <Button
            onClick={() => setActiveNav('login')}
            variant="default"
            size="sm"
            className="flex items-center gap-1.5 font-bold shadow-sm"
          >
            <LogIn className="h-4 w-4" />
            <span>Portal Operasional</span>
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <Button
            onClick={() => setActiveNav('login')}
            size="sm"
            className="text-xs px-2.5 py-1"
          >
            Portal
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-on-surface hover:bg-surface-container"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-outline/10 bg-surface-container-lowest px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeNav === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveNav(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-primary text-white font-bold'
                    : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
