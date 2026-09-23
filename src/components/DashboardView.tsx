import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { NavSection } from './Sidebar';
import {
  Boxes,
  Clock,
  Calendar,
  MapPin,
  Package,
  Mail,
  ClipboardCheck,
  ChevronRight,
  Monitor,
  Camera as CameraIcon,
  Activity,
  ArrowUpRight,
  PackagePlus,
  FileCheck,
  CalendarCheck,
  Wrench,
  Archive,
  ShoppingCart,
  History,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (section: NavSection) => void;
  onOpenReport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenReport }) => {
  const {
    currentUser,
    inventory,
    barangMasuk,
    permintaanList,
    barangKeluar,
    mutasiBmnList,
    disposisiList,
    kegiatanList,
    peminjamanList,
    bmnList,
  } = useApp();

  const recentActivities = useMemo(() => {
    const activities: any[] = [];

    // 1. Barang Masuk
    barangMasuk.forEach((bm) => {
      activities.push({
        id: bm.id,
        type: 'barang_masuk',
        title: 'Barang Masuk Baru',
        description: `${bm.namaBarang} (${bm.jumlah} ${bm.satuan}) diterima di ${bm.lokasi}`,
        time: bm.createdAt || bm.tanggal,
        icon: <PackagePlus className="w-4 h-4" />,
        color: 'bg-emerald-500',
        nav: 'persediaan_masuk'
      });
    });

    // 2. Permintaan Baru
    permintaanList.forEach((p) => {
      if (p.status === 'menunggu_verifikasi') {
        activities.push({
          id: p.id,
          type: 'permintaan_baru',
          title: 'Permintaan Baru',
          description: `Permintaan dari ${p.namaPemohon} (${p.unitKerja})`,
          time: p.tanggal,
          icon: <ClipboardCheck className="w-4 h-4" />,
          color: 'bg-amber-500',
          nav: 'persediaan_setuju'
        });
      } else if (p.status === 'disetujui') {
        activities.push({
          id: p.id + '-approved',
          type: 'permintaan_disetujui',
          title: 'Permintaan Disetujui',
          description: `Permintaan ${p.nomorPermintaan} telah disetujui Kasubbag TU`,
          time: p.tanggalPersetujuan || p.tanggal,
          icon: <FileCheck className="w-4 h-4" />,
          color: 'bg-blue-500',
          nav: 'persediaan_keluar'
        });
      }
    });

    // 3. Peminjaman Ruang Disetujui
    peminjamanList.forEach((p) => {
      if (p.status === 'disetujui') {
        activities.push({
          id: p.id,
          type: 'peminjaman_disetujui',
          title: 'Peminjaman Disetujui',
          description: `${p.namaRuangan || 'Ruang Rapat'} untuk agenda ${p.agenda}`,
          time: p.tanggalPersetujuan || p.tanggalPengajuan || p.tanggalPeminjaman || '',
          icon: <CalendarCheck className="w-4 h-4" />,
          color: 'bg-purple-500',
          nav: 'bmn_peminjaman'
        });
      }
    });

    // 4. Barang Keluar
    barangKeluar.forEach((bk) => {
      activities.push({
        id: bk.id,
        type: 'barang_keluar',
        title: 'Penyerahan Barang',
        description: `Barang diserahkan kepada ${bk.namaPenerima}`,
        time: bk.tanggal,
        icon: <ArrowUpRight className="w-4 h-4" />,
        color: 'bg-rose-500',
        nav: 'persediaan_keluar'
      });
    });

    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  }, [barangMasuk, permintaanList, peminjamanList, barangKeluar]);

  const upcomingReservations = useMemo(() => {
    return [...peminjamanList]
      .filter(p => p.status === 'disetujui' || p.status === 'menunggu')
      .sort((a, b) => {
        const dateA = new Date((a.tanggalPeminjaman || '').replace(' ', 'T')).getTime();
        const dateB = new Date((b.tanggalPeminjaman || '').replace(' ', 'T')).getTime();
        return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
      })
      .slice(0, 5);
  }, [peminjamanList]);

  const sortedKegiatan = useMemo(() => {
    return [...kegiatanList]
      .sort((a, b) => new Date((a.mulai || '').replace(' ', 'T')).getTime() - new Date((b.mulai || '').replace(' ', 'T')).getTime())
      .slice(0, 4);
  }, [kegiatanList]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl p-8 lg:p-12 bg-ink text-white">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-4 leading-tight">
            Selamat Datang, <br/>
            <span className="text-blue-500">{currentUser.name}</span>
          </h2>
          <p className="text-sm lg:text-base opacity-70 font-medium leading-relaxed max-w-lg">
            Akses penuh ke Sistem Informasi Terpadu Biro Perencanaan dan Kerja Sama. Kelola persediaan, aset BMN, dan administrasi surat secara efisien.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
             <button 
               onClick={() => onNavigate('persediaan_minta')}
               className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
             >
               Buat Permintaan Barang
             </button>
             <button 
               onClick={() => onNavigate('bmn_peminjaman')}
               className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
             >
               Ajukan Peminjaman Ruang & BMN
             </button>
             <button 
               onClick={() => onNavigate('jadwal_kegiatan')}
               className="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-lg shadow-amber-600/20"
             >
               Jadwal Penggunaan Ruang
             </button>
             <button 
               onClick={onOpenReport}
               className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/20 transition-all"
             >
               Cetak Laporan Bulanan
             </button>
          </div>
        </div>
      </div>

      {/* Quick Shortcuts Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900/5 flex items-center justify-center">
            <Boxes className="w-5 h-5 text-slate-900" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-ink">Akses Cepat</h3>
        </div>

        <div className="flex flex-wrap gap-4">
          <ShortcutCard 
            label="Barang Masuk" 
            icon={<PackagePlus className="w-5 h-5" />} 
            onClick={() => onNavigate('persediaan_masuk')}
            color="emerald"
            style={{ width: '600px' }}
          />
          <ShortcutCard 
            label="Barang Keluar" 
            icon={<ArrowUpRight className="w-5 h-5" />} 
            onClick={() => onNavigate('persediaan_keluar')}
            color="rose"
          />
          <ShortcutCard 
            label="Permintaan" 
            icon={<ShoppingCart className="w-5 h-5" />} 
            onClick={() => onNavigate('persediaan_minta')}
            color="blue"
          />
          <ShortcutCard 
            label="Perbaikan BMN" 
            icon={<Wrench className="w-5 h-5" />} 
            onClick={() => onNavigate('bmn_pemeliharaan')}
            color="amber"
          />
          <ShortcutCard 
            label="Arsip Surat" 
            icon={<Archive className="w-5 h-5" />} 
            onClick={() => onNavigate('arsip_surat')}
            color="indigo"
          />
          <ShortcutCard 
            label="Jadwal Agenda" 
            icon={<Calendar className="w-5 h-5" />} 
            onClick={() => onNavigate('jadwal_kegiatan')}
            color="purple"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Barang Persediaan" 
          value={inventory.length} 
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <StatCard 
          label="Permintaan Menunggu" 
          value={permintaanList.filter(p => p.status === 'menunggu_verifikasi').length} 
          icon={<ClipboardCheck className="w-5 h-5" />}
          color="amber"
          isAlert={permintaanList.filter(p => p.status === 'menunggu_verifikasi').length > 0}
        />
        <StatCard 
          label="Total Aset BMN" 
          value={bmnList.length} 
          icon={<Boxes className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard 
          label="Disposisi Aktif" 
          value={disposisiList.length} 
          icon={<Mail className="w-5 h-5" />}
          color="indigo"
        />
      </div>

  {/* Quick Shortcuts Section REMOVED FROM HERE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Agenda & Activity Feed */}
        <div className="lg:col-span-7 space-y-8">
          {/* Recent Activity Feed */}
          <div className="p-6 rounded-3xl border transition-all bg-white border-ink-faint shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-ink">Aktivitas Terkini</h3>
              </div>
            </div>

            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-ink-faint rounded-2xl">
                  <p className="text-xs text-ink-soft font-medium italic">Belum ada aktivitas tercatat</p>
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div key={act.id} className="flex gap-4 p-4 rounded-2xl bg-[#f8f9fb] border border-transparent hover:border-ink-faint transition-all group">
                    <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl ${act.color} text-white shadow-sm`}>
                      {act.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-ink">{act.title}</h4>
                        <span className="text-[10px] text-ink-soft font-bold">
                          {new Date(act.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs text-ink-soft mt-1 leading-relaxed truncate">{act.description}</p>
                      <button 
                        onClick={() => onNavigate(act.nav)}
                        className="mt-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1"
                      >
                        Lihat Detail <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 rounded-3xl border transition-all bg-white border-ink-faint shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-ink">Agenda Kegiatan</h3>
              </div>
              <button 
                onClick={() => onNavigate('jadwal_kegiatan')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Lihat Kalender
              </button>
            </div>

            <div className="space-y-4">
              {kegiatanList.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-xs text-ink-soft font-medium">Tidak ada agenda kegiatan terdekat</p>
                </div>
              ) : (
                sortedKegiatan.map((kegiatan) => (
                    <div key={kegiatan.id} className="flex gap-4 p-4 rounded-2xl bg-[#f8f9fb] border border-transparent hover:border-blue-500/20 transition-all group">
                       <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-white shadow-sm border border-ink-faint">
                          <span className="text-[10px] font-black text-ink-soft uppercase leading-none mb-1">
                            {new Date((kegiatan.mulai || '').replace(' ', 'T')).toLocaleDateString('id-ID', { month: 'short' })}
                          </span>
                          <span className="text-xl font-black text-blue-600 leading-none">
                            {new Date((kegiatan.mulai || '').replace(' ', 'T')).getDate()}
                          </span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold group-hover:text-blue-600 transition-colors text-ink leading-relaxed">
                            {kegiatan.judul}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5">
                             <div className="flex items-center gap-1 text-[11px] text-ink-soft font-medium">
                                <Clock className="w-3 h-3" />
                                <span>{kegiatan.mulai.split(' ')[1]} WIB</span>
                             </div>
                             <div className="flex items-center gap-1 text-[11px] text-ink-soft font-medium">
                                <MapPin className="w-3 h-3" />
                                <span className="">{kegiatan.lokasi}</span>
                             </div>
                          </div>
                       </div>
                       <div className="shrink-0 flex items-center">
                          <ChevronRight className="w-4 h-4 text-ink-soft opacity-0 group-hover:opacity-100 transition-all" />
                       </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Stock Status & Meeting Rooms */}
        <div className="lg:col-span-5 space-y-8">
          {/* Meeting Room Schedule */}
          <div className="p-6 rounded-3xl border transition-all bg-white border-ink-faint shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/10 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-ink">Jadwal Ruang Rapat</h3>
              </div>
              <button 
                onClick={() => onNavigate('bmn_peminjaman')}
                className="text-xs font-bold text-purple-600 hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-4">
              {upcomingReservations.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-ink-faint rounded-2xl">
                  <p className="text-[11px] text-ink-soft font-medium">Belum ada pemesanan ruang rapat</p>
                </div>
              ) : (
                upcomingReservations.map((res) => (
                  <div key={res.id} className="p-4 rounded-2xl border bg-[#f8f9fb] border-ink-faint hover:border-purple-500/20 transition-all">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-600/10 text-purple-600 border border-purple-600/20">
                         {res.namaRuangan || res.namaRuang || 'Ruang Rapat'}
                       </span>
                       <div className="flex items-center gap-1 text-[10px] text-ink-soft font-bold">
                         <Clock className="w-3 h-3" />
                         <span>{res.waktuMulai} - {res.waktuSelesai}</span>
                       </div>
                    </div>
                    <h4 className="text-xs font-bold text-ink leading-tight mb-1">{res.agenda || res.keperluan}</h4>
                    <div className="flex items-center justify-between mt-2">
                       <p className="text-[10px] text-ink-soft font-medium">
                         {res.tanggalPeminjaman ? new Date(res.tanggalPeminjaman).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                       </p>
                       <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                         res.status === 'disetujui' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                       }`}>
                         {res.status === 'disetujui' ? 'Disetujui' : 'Menunggu'}
                       </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className="p-6 rounded-3xl border transition-all bg-white border-ink-faint shadow-sm">
             <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-ink">Stok Gudang</h3>
              </div>
            </div>

            <div className="overflow-hidden border border-ink-faint rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f8f9fb]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black text-ink-soft uppercase tracking-widest border-b border-ink-faint">Barang</th>
                    <th className="px-4 py-3 text-[10px] font-black text-ink-soft uppercase tracking-widest border-b border-ink-faint text-center">Stok</th>
                    <th className="px-4 py-3 text-[10px] font-black text-ink-soft uppercase tracking-widest border-b border-ink-faint">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-faint">
                  {inventory.slice(0, 6).map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3.5 text-xs font-bold text-ink">{item.namaBarang}</td>
                      <td className="px-4 py-3.5 text-xs font-mono text-ink-soft font-bold text-center">{item.stok}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                          item.stok > item.stokMin 
                            ? 'bg-emerald-500/10 text-emerald-600' 
                            : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {item.stok > item.stokMin ? 'Aman' : 'Menipis'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-xs text-ink-soft font-medium italic">Data barang kosong</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShortcutCard: React.FC<{
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
  style?: React.CSSProperties;
}> = ({ label, icon, onClick, color, style }) => {
  const colorMap: any = {
    emerald: 'text-emerald-600 bg-emerald-500/10 group-hover:bg-emerald-600 group-hover:text-white',
    rose: 'text-rose-600 bg-rose-500/10 group-hover:bg-rose-600 group-hover:text-white',
    blue: 'text-blue-600 bg-blue-500/10 group-hover:bg-blue-600 group-hover:text-white',
    amber: 'text-amber-600 bg-amber-500/10 group-hover:bg-amber-600 group-hover:text-white',
    indigo: 'text-indigo-600 bg-indigo-500/10 group-hover:bg-indigo-600 group-hover:text-white',
    purple: 'text-purple-600 bg-purple-500/10 group-hover:bg-purple-600 group-hover:text-white',
  };

  return (
    <button 
      onClick={onClick}
      style={style}
      className="group p-4 rounded-3xl border border-ink-faint bg-white hover:border-slate-900 transition-all duration-300 flex flex-col items-center gap-3 text-center shadow-sm hover:shadow-md"
    >
      <div className={`p-3 rounded-2xl transition-all duration-300 ${colorMap[color]}`}>
        {icon}
      </div>
      <span className="text-[11px] font-black uppercase tracking-wider text-ink-soft group-hover:text-ink transition-colors">
        {label}
      </span>
    </button>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'amber' | 'indigo';
  isAlert?: boolean;
}> = ({ label, value, icon, color, isAlert }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-600/10',
    emerald: 'text-emerald-600 bg-emerald-600/10',
    amber: 'text-amber-600 bg-amber-600/10',
    indigo: 'text-indigo-600 bg-indigo-600/10',
  };

  return (
    <div className={`p-6 rounded-3xl border transition-all hover:-translate-y-1 duration-300 bg-white border-ink-faint shadow-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-2xl ${colorMap[color]}`}>
          {icon}
        </div>
        {isAlert && (
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-ink-soft uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-1">
          <h4 className="text-3xl font-black tracking-tight text-ink">
            {value}
          </h4>
        </div>
      </div>
    </div>
  );
};

