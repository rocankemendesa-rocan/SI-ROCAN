import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavSection } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { BarangMasukView } from './components/Persediaan/BarangMasukView';
import { PermintaanPersediaanView } from './components/Persediaan/PermintaanPersediaanView';
import { PersetujuanPermintaanView } from './components/Persediaan/PersetujuanPermintaanView';
import { BarangKeluarView } from './components/Persediaan/BarangKeluarView';
import { StockOpnameView } from './components/Persediaan/StockOpnameView';
import { LaporanPersediaanView } from './components/Persediaan/LaporanPersediaanView';
import { MutasiBmnView } from './components/BMN/MutasiBmnView';
import { PemeliharaanBmnView } from './components/BMN/PemeliharaanBmnView';
import { PeminjamanRuangView } from './components/BMN/PeminjamanRuangView';
import { LaporanBmnView } from './components/BMN/LaporanBmnView';
import { PengaturanView } from './components/PengaturanView';
import { LoginScreen } from './components/LoginScreen';
import { ReportPrintModal, ReportType } from './components/ReportPrintModal';
import ArsipSuratView from './components/ArsipSuratView';
import DisposisiMonitorView from './components/DisposisiMonitorView';
import JadwalKegiatanView from './components/JadwalKegiatanView';
import { PanduanView } from './components/PanduanView';

const MainLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const { isAuthenticated, currentUser } = useApp();

  // Report Modal State
  const [reportState, setReportState] = useState<{
    isOpen: boolean;
    type: ReportType;
    startDate?: string;
    endDate?: string;
    bulan?: string;
    tahun?: number;
  }>({
    isOpen: false,
    type: 'persediaan_masuk',
  });

  const handleOpenReport = (
    type: ReportType,
    startDate?: string,
    endDate?: string,
    bulan?: string,
    tahun?: number
  ) => {
    setReportState({
      isOpen: true,
      type,
      startDate: startDate || '2026-03-01',
      endDate: endDate || '2026-03-31',
      bulan: bulan || 'Maret',
      tahun: tahun || 2026,
    });
  };

  const handleCloseReport = () => {
    setReportState((prev) => ({ ...prev, isOpen: false }));
  };

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen flex flex-row font-geist selection:bg-blue-600 selection:text-white transition-colors duration-300 relative overflow-hidden bg-[#f8f9fb] text-ink">
      {/* Global Background Ornaments */}
      <div className="absolute inset-0 bg-abstract-dots opacity-[0.05] pointer-events-none" />
      
      {/* Sidebar (Aside in Variation 8) */}
      <Sidebar activeSection={activeSection} onSelectSection={(sec) => setActiveSection(sec)} />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Navbar (Header in Variation 8) */}
        <Navbar
          onNavigateToSettings={() => setActiveSection('pengaturan')}
        />

        {/* Dynamic Main View Area (Content in Variation 8) */}
        <main id="main-content" className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 lg:p-12 transition-colors duration-300 bg-[#f8f9fb]">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeSection === 'dashboard' && (
                  <DashboardView
                    onNavigate={(sec) => setActiveSection(sec)}
                    onOpenReport={() => handleOpenReport('persediaan_bulanan')}
                  />
                )}

                {/* Modul Persediaan Views */}
                {activeSection === 'persediaan_masuk' && (
                  <BarangMasukView onOpenReport={handleOpenReport} />
                )}

                {activeSection === 'persediaan_minta' && <PermintaanPersediaanView />}

                {activeSection === 'persediaan_setuju' && (
                  <PersetujuanPermintaanView
                    onNavigateToBarangKeluar={() => setActiveSection('persediaan_keluar')}
                  />
                )}

                {activeSection === 'persediaan_keluar' && (
                  <BarangKeluarView onOpenReport={handleOpenReport} />
                )}

                {activeSection === 'persediaan_opname' && (
                  <StockOpnameView onOpenReport={handleOpenReport} />
                )}

                {activeSection === 'persediaan_laporan' && (
                  <LaporanPersediaanView onOpenReport={handleOpenReport} />
                )}

                {/* Modul BMN Views */}
                {activeSection === 'bmn_mutasi' && <MutasiBmnView onOpenReport={handleOpenReport} />}

                {activeSection === 'bmn_pemeliharaan' && (
                  <PemeliharaanBmnView onOpenReport={handleOpenReport} />
                )}

                {(activeSection === 'bmn_ruang' || activeSection === 'bmn_peminjaman') && <PeminjamanRuangView />}

                {activeSection === 'bmn_laporan' && <LaporanBmnView onOpenReport={handleOpenReport} />}

                {/* Pengaturan Pejabat & Master */}
                {(activeSection === 'pengaturan' || activeSection === 'admin_master') && (
                  currentUser.role === 'admin' ? <PengaturanView /> : <DashboardView onNavigate={(sec) => setActiveSection(sec)} onOpenReport={() => handleOpenReport('persediaan_bulanan')} />
                )}

                {/* Modul ROCAN (Surat, Disposisi, Jadwal) */}
                {activeSection === 'arsip_surat' && <ArsipSuratView />}
                {activeSection === 'disposisi_monitor' && <DisposisiMonitorView />}
                {activeSection === 'jadwal_kegiatan' && <JadwalKegiatanView />}
                {activeSection === 'panduan' && <PanduanView />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Branding */}
          <footer id="app-footer" className="mt-20 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-medium tracking-wide border-ink-faint text-ink-soft">
            <span>© 2026 Biro Perencanaan dan Kerja Sama Kemendes PDT</span>
            <div className="flex items-center gap-6">
               <span className="uppercase tracking-widest opacity-80">Sistem Informasi Terpadu (SI-ROCAN)</span>
               <span className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 border border-blue-600/20">v2.4.0-STABLE</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Official Government Printable Document Modal */}
      {reportState.isOpen && (
        <ReportPrintModal
          reportType={reportState.type}
          startDate={reportState.startDate}
          endDate={reportState.endDate}
          bulan={reportState.bulan}
          tahun={reportState.tahun}
          onClose={handleCloseReport}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
