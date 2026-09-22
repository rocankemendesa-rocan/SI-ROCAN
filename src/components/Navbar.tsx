import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KemendesLogo } from './KemendesLogo';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  onNavigateToSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateToSettings }) => {
  const {
    currentUser,
    resetData,
    logout,
  } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const themeClasses = React.useMemo(() => ({
    header: 'bg-white/80 border-ink-faint',
    text: 'text-ink',
    textMuted: 'text-ink-soft',
    actionBtn: 'bg-[#f8f9fb] border-ink-faint text-ink hover:text-blue-600',
    dropdown: 'bg-white border-ink-faint shadow-2xl',
  }), []);

  return (
    <header
      id="app-header"
      className={`sticky top-0 z-40 w-full backdrop-blur-md border-b px-6 lg:px-12 py-3.5 flex items-center justify-between transition-all duration-300 ${themeClasses.header}`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if(window.confirm('Reset data ke kondisi awal?')) resetData();
          }}
          className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold tracking-tight transition-all ${themeClasses.actionBtn}`}
        >
          Reset Data
        </button>
      </div>

      <div className="relative">
        <button
          id="btn-user-profile-toggle"
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-full border transition-all hover:ring-2 hover:ring-blue-500/20 bg-white border-ink-faint"
        >
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-[10px] shadow-lg shadow-blue-600/20">
            {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <span className={`text-[12px] font-bold hidden md:inline ${themeClasses.text}`}>
            {currentUser.name}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 ${themeClasses.textMuted}`} />
        </button>

        {showUserMenu && (
          <div
            id="user-dropdown-panel"
            className={`absolute right-0 mt-3 w-64 rounded-2xl p-2 z-50 border overflow-hidden ${themeClasses.dropdown}`}
          >
            <div className="px-4 py-3 border-b border-ink-faint">
              <div className={`text-[13px] font-bold leading-tight ${themeClasses.text}`}>{currentUser.name}</div>
              <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mt-1">{currentUser.roleTitle}</div>
              <div className="text-[10px] text-ink-soft mt-0.5">NIP. {currentUser.nip}</div>
            </div>

            <div className="p-1 space-y-0.5">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigateToSettings();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors text-ink-soft hover:bg-slate-50 hover:text-ink"
              >
                <Sliders className="w-4 h-4 text-blue-500" />
                <span>Pengaturan Akun</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Sistem</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
