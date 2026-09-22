import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  PackagePlus,
  FileCheck,
  PackageMinus,
  ClipboardCheck,
  BarChart3,
  Layers,
  Wrench,
  CalendarDays,
  FileSpreadsheet,
  Settings,
  ArrowDownLeft,
  ShieldCheck,
  Mail,
  CalendarRange,
  HelpCircle,
  Package,
  Boxes,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KemendesLogo } from './KemendesLogo';

export type NavSection =
  | 'dashboard'
  | 'persediaan_masuk'
  | 'persediaan_minta'
  | 'persediaan_setuju'
  | 'persediaan_keluar'
  | 'persediaan_opname'
  | 'persediaan_laporan'
  | 'bmn_mutasi'
  | 'bmn_pemeliharaan'
  | 'bmn_peminjaman'
  | 'bmn_laporan'
  | 'admin_master'
  | 'pengaturan'
  | 'disposisi_monitor'
  | 'jadwal_kegiatan'
  | 'arsip_surat'
  | 'panduan';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSelectSection }) => {
  const { currentUser } = useApp();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const themeClasses = React.useMemo(() => ({
    bg: 'bg-white',
    border: 'border-ink-faint',
    text: 'text-ink',
    active: 'bg-blue-600 text-white shadow-lg shadow-blue-600/20',
    hover: 'hover:bg-[#f8f9fb]',
    label: 'font-geist-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft opacity-60',
  }), []);

  const hasAccess = (section: NavSection): boolean => {
    const role = currentUser.role;
    if (role === 'admin') return true;
    switch (section) {
      case 'dashboard': return true;
      case 'persediaan_masuk': return ['petugas_gudang', 'admin'].includes(role);
      case 'persediaan_minta': return true;
      case 'persediaan_setuju': return ['kasubbag_tu', 'admin'].includes(role);
      case 'persediaan_keluar': return ['petugas_gudang', 'admin'].includes(role);
      case 'persediaan_opname': return ['petugas_gudang', 'verifikator_persediaan', 'kasubbag_tu', 'admin'].includes(role);
      case 'persediaan_laporan': return ['ka_biro', 'kasubbag_tu', 'verifikator_persediaan', 'admin'].includes(role);
      case 'bmn_mutasi': return ['petugas_bmn', 'admin'].includes(role);
      case 'bmn_pemeliharaan': return ['pegawai', 'petugas_bmn', 'kasubbag_tu', 'admin'].includes(role);
      case 'bmn_peminjaman': return true;
      case 'bmn_laporan': return ['ka_biro', 'petugas_bmn', 'admin'].includes(role);
      case 'arsip_surat': return ['petugas_arsip', 'admin'].includes(role);
      case 'disposisi_monitor': return ['ka_biro', 'ka_bagian', 'petugas_arsip', 'pegawai', 'admin'].includes(role);
      case 'jadwal_kegiatan': return true;
      case 'admin_master': return role === 'admin';
      case 'pengaturan': return true;
      case 'panduan': return true;
      default: return false;
    }
  };

  const NavItem: React.FC<{
    section: NavSection;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
  }> = ({ section, icon, label, isActive }) => {
    if (!hasAccess(section)) return null;
    return (
      <button
        onClick={() => onSelectSection(section)}
        title={isCollapsed ? label : undefined}
        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 group ${
          isActive ? themeClasses.active : `text-ink-soft ${themeClasses.hover}`
        }`}
      >
        <span className={`shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'}`}>
          {icon}
        </span>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="truncate"
          >
            {label}
          </motion.span>
        )}
        {!isCollapsed && isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="ml-auto w-1 h-4 rounded-full bg-white/40"
          />
        )}
      </button>
    );
  };

  return (
    <aside
      id="app-sidebar"
      className={`${isCollapsed ? 'w-[80px]' : 'w-[280px]'} shrink-0 border-r flex flex-col h-screen overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out select-none relative z-20 ${themeClasses.bg} ${themeClasses.border}`}
    >
      {/* Background Ornaments */}
      <div className="absolute inset-0 bg-abstract-dots opacity-10 pointer-events-none" />
      
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute top-6 -right-3 w-6 h-6 rounded-full border ${themeClasses.bg} ${themeClasses.border} flex items-center justify-center z-30 shadow-sm hover:shadow-md transition-all duration-200 text-ink-soft hover:text-blue-600`}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`${isCollapsed ? 'p-4' : 'p-6'} space-y-8`}>
        {/* Brand Area */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-1'} mb-2`}>
          <div className="relative shrink-0">
            <KemendesLogo size={isCollapsed ? 32 : 40} showText={false} />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col overflow-hidden"
            >
              <h1 className={`text-sm font-black tracking-tight leading-none ${themeClasses.text} truncate`}>SI - ROCAN</h1>
              <p className="text-[9px] font-bold text-ink-soft uppercase tracking-widest mt-1 truncate">KEMENDES PDT 2026</p>
            </motion.div>
          )}
        </div>

        {/* Dashboard Section */}
        <div className="space-y-1">
          <NavItem
            section="dashboard"
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Dashboard"
            isActive={activeSection === 'dashboard'}
          />
        </div>

        {/* Modul Persediaan */}
        <div className="space-y-4">
          {isCollapsed ? (
            <div className="border-t border-ink-faint opacity-20 mx-2" />
          ) : (
            <span className={themeClasses.label}>Modul Persediaan</span>
          )}
          <div className="space-y-1">
            <NavItem
              section="persediaan_masuk"
              icon={<PackagePlus className="w-4 h-4" />}
              label="Barang Masuk"
              isActive={activeSection === 'persediaan_masuk'}
            />
            <NavItem
              section="persediaan_minta"
              icon={<ArrowDownLeft className="w-4 h-4" />}
              label="Permintaan"
              isActive={activeSection === 'persediaan_minta'}
            />
            <NavItem
              section="persediaan_setuju"
              icon={<ClipboardCheck className="w-4 h-4" />}
              label="Persetujuan"
              isActive={activeSection === 'persediaan_setuju'}
            />
            <NavItem
              section="persediaan_keluar"
              icon={<PackageMinus className="w-4 h-4" />}
              label="Barang Keluar"
              isActive={activeSection === 'persediaan_keluar'}
            />
          </div>
        </div>

        {/* Modul BMN */}
        <div className="space-y-4">
          {isCollapsed ? (
            <div className="border-t border-ink-faint opacity-20 mx-2" />
          ) : (
            <span className={themeClasses.label}>Modul BMN</span>
          )}
          <div className="space-y-1">
            <NavItem
              section="bmn_mutasi"
              icon={<Boxes className="w-4 h-4" />}
              label="Katalog & Mutasi"
              isActive={activeSection === 'bmn_mutasi'}
            />
            <NavItem
              section="bmn_pemeliharaan"
              icon={<Wrench className="w-4 h-4" />}
              label="Pemeliharaan"
              isActive={activeSection === 'bmn_pemeliharaan'}
            />
            <NavItem
              section="bmn_peminjaman"
              icon={<CalendarRange className="w-4 h-4" />}
              label="Peminjaman"
              isActive={activeSection === 'bmn_peminjaman'}
            />
          </div>
        </div>

        {/* Administrasi */}
        <div className="space-y-4">
          {isCollapsed ? (
            <div className="border-t border-ink-faint opacity-20 mx-2" />
          ) : (
            <span className={themeClasses.label}>Administrasi</span>
          )}
          <div className="space-y-1">
            <NavItem
              section="arsip_surat"
              icon={<Mail className="w-4 h-4" />}
              label="Arsip Surat"
              isActive={activeSection === 'arsip_surat'}
            />
            <NavItem
              section="disposisi_monitor"
              icon={<ShieldCheck className="w-4 h-4" />}
              label="Pantau Disposisi"
              isActive={activeSection === 'disposisi_monitor'}
            />
            <NavItem
              section="jadwal_kegiatan"
              icon={<CalendarDays className="w-4 h-4" />}
              label="Jadwal Kegiatan"
              isActive={activeSection === 'jadwal_kegiatan'}
            />
          </div>
        </div>

        {/* Support */}
        <div className="space-y-4 pt-4">
           {isCollapsed ? (
             <div className="border-t border-ink-faint opacity-20 mx-2" />
           ) : (
             <span className={themeClasses.label}>Dukungan</span>
           )}
           <div className="space-y-1">
             <NavItem
                section="pengaturan"
                icon={<Settings className="w-4 h-4" />}
                label="Pengaturan"
                isActive={activeSection === 'pengaturan'}
             />
             <NavItem
                section="panduan"
                icon={<HelpCircle className="w-4 h-4" />}
                label="Panduan Aplikasi"
                isActive={activeSection === 'panduan'}
             />
           </div>
        </div>
      </div>
    </aside>
  );
};
