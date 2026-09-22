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
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src="/logo_official.jpg"
        alt="Logo Kemendes"
        width={size}
        height={size}
        className="shrink-0 drop-shadow-md rounded-full object-cover"
        referrerPolicy="no-referrer"
      />

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-wide text-white leading-tight">
            BIRO PERENCANAAN DAN KERJA SAMA
          </span>
          <span className="text-xs text-blue-200 tracking-wider">
            KEMENTERIAN DESA & DAERAH TERTINGGAL
          </span>
        </div>
      )}
    </div>
  );
};
