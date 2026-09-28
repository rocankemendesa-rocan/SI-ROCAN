import React from 'react';

interface KemendesLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const KemendesLogo: React.FC<KemendesLogoProps> = ({
  className = '',
  size = 48,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-4 ${className}`}>
      <div className="relative flex items-center justify-center">
        <img
          src="/logo_official.jpg"
          alt="Logo Kemendes"
          width={size}
          height={size}
          className="relative shrink-0 object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-[13px] tracking-tight text-ink leading-none uppercase">
            Biro Perencanaan dan Kerja Sama
          </span>
          <span className="text-[10px] text-blue-600 font-bold tracking-[0.05em] mt-1 opacity-80">
            KEMENTERIAN DESA DAN PEMBANGUNAN DAERAH TERTINGGAL
          </span>
        </div>
      )}
    </div>
  );
};
