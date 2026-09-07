import React, { useState } from 'react';
import blindajeLogo from '../assets/images/blindaje_vial_logo_1788658120391.jpg';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'dark' | 'light';
  useVectorOnly?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  variant = 'dark',
  useVectorOnly = false
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeMap = {
    sm: { container: 'w-8 h-8 rounded-lg', text: 'text-sm', subtext: 'text-[9px]', badge: 'text-[8px] px-1 py-0.2' },
    md: { container: 'w-10 h-10 rounded-xl', text: 'text-base', subtext: 'text-[10px]', badge: 'text-[9px] px-1.5 py-0.5' },
    lg: { container: 'w-14 h-14 rounded-2xl', text: 'text-xl', subtext: 'text-xs', badge: 'text-[10px] px-2 py-0.5' },
    xl: { container: 'w-24 h-24 rounded-3xl', text: 'text-3xl', subtext: 'text-sm', badge: 'text-xs px-2.5 py-1' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official 3D Metallic Shield Logo Emblem */}
      <div
        className={`relative ${currentSize.container} flex-shrink-0 overflow-hidden shadow-lg border ${
          isLight ? 'border-slate-300 shadow-slate-300/60' : 'border-slate-700/80 shadow-blue-950/50'
        } group transition-all duration-200 hover:scale-105 hover:shadow-blue-500/20`}
      >
        {!useVectorOnly && !imageError ? (
          <img
            src={blindajeLogo}
            alt="Blindaje Vial Logo Oficial"
            className="w-full h-full object-cover object-center transform transition-transform duration-300 group-hover:scale-110"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          /* SVG Vector Fallback */
          <svg
            viewBox="0 0 120 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full p-0.5 bg-slate-950"
          >
            <defs>
              <linearGradient id="shieldChromeBezel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="25%" stopColor="#94A3B8" />
                <stop offset="50%" stopColor="#F8FAFC" />
                <stop offset="75%" stopColor="#64748B" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <linearGradient id="shieldInnerBlue" x1="15%" y1="10%" x2="85%" y2="90%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="40%" stopColor="#0056B3" />
                <stop offset="85%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>
            <path
              d="M60 4 L110 24 C110 82 82 120 60 136 C38 120 10 82 10 24 Z"
              fill="url(#shieldChromeBezel)"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
            <path
              d="M60 11 L102 28 C102 78 77 112 60 126 C43 112 18 78 18 28 Z"
              fill="#1E293B"
            />
            <path
              d="M60 15 L98 31 C98 75 74 107 60 120 C46 107 22 75 22 31 Z"
              fill="url(#shieldInnerBlue)"
            />
            <path
              d="M36 68 L52 84 L84 48 L93 57 L52 100 L27 77 Z"
              fill="#FFFFFF"
            />
          </svg>
        )}
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5 font-black tracking-wider">
            <span
              className={`${currentSize.text} ${isLight ? 'text-slate-900' : 'text-white'}`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              BLINDAJE VIAL
            </span>
            <span
              className={`${currentSize.text} ${
                isLight ? 'text-[#0056B3]' : 'text-[#38BDF8]'
              } font-mono font-extrabold`}
            >
              360
            </span>
          </div>
          <span
            className={`${currentSize.subtext} font-medium tracking-wide ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            } uppercase font-mono`}
          >
            Seguridad Vial & Compliance ISO 37301
          </span>
        </div>
      )}
    </div>
  );
};

