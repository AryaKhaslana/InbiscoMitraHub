import React from 'react';

// ============================================================================
// 1. REACT SVG COMPONENTS FOR UI
// ============================================================================

export function DepoHubIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 14h6" />
      <path d="M9 18h6" />
      <path d="M9 10h6" />
    </svg>
  );
}

export function StorefrontIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M3 9l2-5h14l2 5" />
      <path d="M21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9" />
      <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

export function DeliveryTruckIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M14 8h4.5a1.5 1.5 0 0 1 1.2.6L22 12v5a1 1 0 0 1-1 1h-2" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
      <path d="M14 13h4" />
    </svg>
  );
}

export function GpsSatelliteIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <path d="M5 5l2 2" />
      <path d="M17 17l2 2" />
      <path d="M5 19l2-2" />
      <path d="M17 5l2 2" />
    </svg>
  );
}

export function StarSolidIcon({ className = "w-3.5 h-3.5 text-amber-400", ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function WhatsAppSolidIcon({ className = "w-3.5 h-3.5", ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.44 19.65L5.27 16.62L5.07 16.31C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.04 3.68C14.25 3.68 16.31 4.54 17.87 6.1C19.42 7.66 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.57 14.34C16.32 14.21 15.1 13.61 14.87 13.53C14.65 13.45 14.49 13.41 14.32 13.66C14.16 13.9 13.7 14.44 13.55 14.6C13.41 14.77 13.27 14.79 13.02 14.66C12.78 14.54 11.98 14.28 11.04 13.44C10.3 12.78 9.8 11.97 9.66 11.72C9.52 11.48 9.64 11.34 9.77 11.22C9.88 11.11 10.02 10.93 10.14 10.79C10.27 10.65 10.31 10.55 10.39 10.38C10.47 10.22 10.43 10.07 10.37 9.95C10.31 9.83 9.82 8.62 9.61 8.12C9.41 7.63 9.21 7.7 9.06 7.69L8.59 7.68C8.42 7.68 8.16 7.74 7.93 7.99C7.71 8.24 7.07 8.83 7.07 10.04C7.07 11.25 7.95 12.41 8.08 12.58C8.2 12.74 9.82 15.24 12.3 16.31C12.89 16.57 13.35 16.72 13.71 16.83C14.3 17.02 14.84 16.99 15.26 16.93C15.74 16.86 16.72 16.34 16.92 15.76C17.13 15.19 17.13 14.7 17.07 14.6C17.01 14.49 16.82 14.46 16.57 14.34Z" />
    </svg>
  );
}

export function SmartphoneDeviceIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
      <path d="M12 18h.01" />
    </svg>
  );
}

// ============================================================================
// 2. RAW SVG STRINGS FOR LEAFLET DIVICON (Crisp Vector Map Markers)
// ============================================================================

export const RAW_SVGS = {
  // Industrial Depo Hub Factory (White glyph on crimson)
  hubFactory: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 21h18"/>
      <path d="M5 21V7l7-4 7 4v14"/>
      <path d="M9 14h6"/>
      <path d="M9 18h6"/>
      <path d="M9 10h6"/>
    </svg>
  `,
  // Retail Storefront (White glyph on emerald)
  retailStore: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l2-5h14l2 5"/>
      <path d="M21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9"/>
      <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>
      <path d="M9 22V12h6v10"/>
    </svg>
  `,
  // Delivery Carry Box Truck (White glyph on cobalt/emerald)
  deliveryTruck: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
      <path d="M14 8h4.5a1.5 1.5 0 0 1 1.2.6L22 12v5a1 1 0 0 1-1 1h-2"/>
      <circle cx="7" cy="18" r="2"/>
      <circle cx="17" cy="18" r="2"/>
      <path d="M14 13h4"/>
    </svg>
  `,
  // Mini Pin Icon
  miniPin: `
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  `,
  // Mini Hub Factory Icon
  miniHub: `
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 21h18"/>
      <path d="M5 21V7l7-4 7 4v14"/>
    </svg>
  `,
  // Mini Check Icon
  miniCheck: `
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  `,
  // Live Pulse Dot
  livePulseDot: `
    <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
  `
};

