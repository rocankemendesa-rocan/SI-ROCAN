import React, { useState, useEffect, useRef } from 'react';
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
  Search,
  X,
  Package,
  FileText,
  Calendar,
  Box,
  ChevronRight,
} from 'lucide-react';
import { NavSection } from './Sidebar';

interface NavbarProps {
  onNavigate: (section: NavSection) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const {
    currentUser,
    resetData,
    logout,
    inventory,
    bmnList,
    suratList,
    kegiatanList,
  } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    id: string;
    title: string;
    subtitle: string;
    type: 'bmn' | 'persediaan' | 'surat' | 'kegiatan';
    section: NavSection;
  }[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const themeClasses = React.useMemo(() => ({
    header: 'bg-white/80 border-ink-faint',
    text: 'text-ink',
    textMuted: 'text-ink-soft',
    actionBtn: 'bg-[#f8f9fb] border-ink-faint text-ink hover:text-blue-600',
    dropdown: 'bg-white border-ink-faint shadow-2xl',
  }), []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: typeof searchResults = [];

    // Search BMN
    bmnList.filter(item => 
      (item.namaBarang || '').toLowerCase().includes(query) || 
      (item.kodeBarang || '').toLowerCase().includes(query) ||
      (item.nup || '').toLowerCase().includes(query)
    ).slice(0, 3).forEach(item => {
      results.push({
        id: item.id,
        title: item.namaBarang,
        subtitle: `BMN - NUP: ${item.nup}`,
        type: 'bmn',
        section: 'bmn_mutasi'
      });
    });

    // Search Persediaan
    inventory.filter(item => 
      (item.namaBarang || '').toLowerCase().includes(query) || 
      (item.kodeBarang || '').toLowerCase().includes(query)
    ).slice(0, 3).forEach(item => {
      results.push({
        id: item.id,
        title: item.namaBarang,
        subtitle: `Persediaan - Stok: ${item.stok} ${item.satuan}`,
        type: 'persediaan',
        section: 'persediaan_masuk'
      });
    });

    // Search Surat
    suratList.filter(item => 
      (item.nomor || '').toLowerCase().includes(query) || 
      (item.perihal || '').toLowerCase().includes(query) ||
      (item.asal || '').toLowerCase().includes(query)
    ).slice(0, 3).forEach(item => {
      results.push({
        id: item.id,
        title: item.perihal,
        subtitle: `Surat - No: ${item.nomor}`,
        type: 'surat',
        section: 'arsip_surat'
      });
    });

    // Search Kegiatan
    kegiatanList.filter(item => 
      (item.judul || '').toLowerCase().includes(query) || 
      (item.lokasi || '').toLowerCase().includes(query)
    ).slice(0, 3).forEach(item => {
      results.push({
        id: item.id,
        title: item.judul,
        subtitle: `Kegiatan - ${item.lokasi}`,
        type: 'kegiatan',
        section: 'jadwal_kegiatan'
      });
    });

    setSearchResults(results);
  }, [searchQuery, bmnList, inventory, suratList, kegiatanList]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (section: NavSection) => {
    onNavigate(section);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  return (
    <header
      id="app-header"
      className={`sticky top-0 z-40 w-full backdrop-blur-md border-b px-6 lg:px-12 py-3.5 flex items-center justify-between transition-all duration-300 ${themeClasses.header}`}
    >
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => {
            if(window.confirm('Reset data ke kondisi awal?')) resetData();
          }}
          className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold tracking-tight transition-all hidden lg:block ${themeClasses.actionBtn}`}
        >
          Reset Data
        </button>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative w-full max-w-md ml-4">
          <div className={`relative flex items-center transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
            <Search className={`absolute left-3.5 w-4 h-4 transition-colors ${isSearchFocused ? 'text-blue-600' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Cari BMN, nomor surat, atau kegiatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className={`w-full bg-[#f8f9fb] border-ink-faint border rounded-2xl pl-10 pr-10 py-2.5 text-[12px] font-medium focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all ${themeClasses.text}`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery.length >= 2 && (
            <div className={`absolute top-full mt-2 w-full max-h-[400px] overflow-y-auto rounded-2xl border p-2 animate-in fade-in slide-in-from-top-2 ${themeClasses.dropdown}`}>
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result.section)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all group text-left"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        result.type === 'bmn' ? 'bg-amber-100 text-amber-600' :
                        result.type === 'persediaan' ? 'bg-blue-100 text-blue-600' :
                        result.type === 'surat' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {result.type === 'bmn' && <Box className="w-5 h-5" />}
                        {result.type === 'persediaan' && <Package className="w-5 h-5" />}
                        {result.type === 'surat' && <FileText className="w-5 h-5" />}
                        {result.type === 'kegiatan' && <Calendar className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold text-ink group-hover:text-blue-600 transition-colors truncate">
                          {result.title}
                        </div>
                        <div className="text-[10px] text-ink-soft font-medium truncate mt-0.5">
                          {result.subtitle}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-all transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-500">Tidak ada hasil ditemukan untuk "{searchQuery}"</p>
                  <p className="text-[10px] text-slate-400 mt-1">Coba kata kunci lain atau periksa ejaan Anda</p>
                </div>
              )}
            </div>
          )}
        </div>
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
                  onNavigate('pengaturan');
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

