import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KemendesLogo } from './KemendesLogo';
import { 
  Shield, 
  KeyRound, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CalendarCheck, 
  CalendarDays, 
  MapPin, 
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatDateLong } from '../utils';

export const LoginScreen: React.FC = () => {
  const { loginWithNip, peminjamanList, kegiatanList } = useApp();
  const [nipInput, setNipInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic date reference
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  nextWeek.setHours(23, 59, 59, 999);

  const publicJadwalRuang = [...peminjamanList]
    .filter(b => {
      const bDate = new Date((b.tanggalPeminjaman || '').replace(' ', 'T'));
      return !isNaN(bDate.getTime()) && bDate >= now;
    })
    .sort((a, b) => {
      const dateA = new Date((a.tanggalPeminjaman || '').replace(' ', 'T')).getTime();
      const dateB = new Date((b.tanggalPeminjaman || '').replace(' ', 'T')).getTime();
      return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    })
    .slice(0, 5); // Show top 5 upcoming
  
  const publicAgenda = [...kegiatanList]
    .filter(k => {
      const kStart = new Date(k.mulai.includes(' ') ? k.mulai.replace(' ', 'T') : k.mulai);
      const kEnd = new Date(k.selesai ? (k.selesai.includes(' ') ? k.selesai.replace(' ', 'T') : k.selesai) : k.mulai);
      
      if (isNaN(kStart.getTime())) return false;
      
      // Activity is upcoming (starts within next 7 days)
      const isUpcoming = kStart >= now && kStart <= nextWeek;
      
      // Activity is currently ongoing (started before/on now, ends after/on now)
      const isOngoing = kStart <= now && (isNaN(kEnd.getTime()) || kEnd >= now);
      
      return isUpcoming || isOngoing;
    })
    .sort((a, b) => {
      const dateA = new Date(a.mulai.replace(' ', 'T')).getTime();
      const dateB = new Date(b.mulai.replace(' ', 'T')).getTime();
      return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate small delay for better UX
    setTimeout(() => {
      const result = loginWithNip(nipInput, passwordInput);
      if (!result.success) {
        setError(result.message);
      }
      setIsLoading(false);
    }, 800);
  };

  const themeClasses = {
    bg: 'bg-slate-50',
    card: 'bg-white border-slate-200',
    input: 'bg-slate-50 border-slate-300 text-ink',
    label: 'text-ink-soft',
    text: 'text-ink',
    muted: 'text-ink-soft',
    sectionCard: 'bg-slate-50/80 border-slate-200',
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-500 ${themeClasses.bg}`}>
      {/* Public Info Panel - Left Side on Large Screens */}
      <div className="w-full lg:w-[40%] xl:w-[35%] p-6 lg:p-12 overflow-y-auto bg-slate-100/50 border-b lg:border-b-0 lg:border-r border-slate-200">
        <div className="max-w-md mx-auto space-y-10">
          <div className="flex items-center gap-4 mb-8">
            <KemendesLogo size={60} showText={false} />
            <div>
              <h1 className={`text-xl font-black tracking-tight ${themeClasses.text}`}>SI-ROCAN</h1>
              <p className={`text-[10px] uppercase tracking-widest font-bold ${themeClasses.muted}`}>Informasi Publik</p>
            </div>
          </div>

          {/* Room Usage */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${themeClasses.text}`}>
                <CalendarCheck className="w-4 h-4 text-purple-500" /> Jadwal Ruang Rapat
              </h3>
              <span className="text-[10px] font-bold text-ink-soft uppercase">Seluruh Jadwal</span>
            </div>
            
            <div className="space-y-3">
              {publicJadwalRuang.length === 0 ? (
                <p className="text-xs text-ink-soft italic">Tidak ada jadwal penggunaan ruang dalam waktu dekat.</p>
              ) : (
                publicJadwalRuang.map(b => (
                  <div key={b.id} className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] ${themeClasses.sectionCard}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">{b.namaRuangan}</span>
                      <div className="flex items-center gap-1 text-[9px] text-ink-soft">
                        <Clock className="w-3 h-3" />
                        <span>{b.waktuMulai}</span>
                      </div>
                    </div>
                    <h4 className={`text-xs font-bold leading-relaxed mb-1 ${themeClasses.text}`}>{b.agenda || b.keperluan}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-ink-soft font-medium">{formatDateLong(b.tanggalPeminjaman)}</p>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                        b.status === 'disetujui' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                        b.status === 'ditolak' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                      }`}>
                        {b.status === 'disetujui' ? 'Disetujui' : b.status === 'ditolak' ? 'Ditolak' : 'Menunggu'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Office Agenda */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${themeClasses.text}`}>
                <CalendarDays className="w-4 h-4 text-blue-500" /> Agenda Kegiatan
              </h3>
              <span className="text-[10px] font-bold text-ink-soft uppercase">7 Hari Kedepan</span>
            </div>
            
            <div className="space-y-3">
              {publicAgenda.length === 0 ? (
                <p className="text-xs text-ink-soft italic">Belum ada agenda kegiatan biro yang terdaftar.</p>
              ) : (
                publicAgenda.map(k => (
                  <div key={k.id} className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] ${themeClasses.sectionCard}`}>
                    <h4 className={`text-xs font-bold leading-relaxed mb-2 ${themeClasses.text}`}>{k.judul}</h4>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[10px] text-ink-soft">
                        <CalendarDays className="w-3 h-3 text-blue-500" />
                        <span>{formatDateLong(k.mulai)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-ink-soft">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span className="truncate">{k.lokasi}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <div className="pt-6 border-t border-slate-500/10">
            <p className={`text-[10px] leading-relaxed ${themeClasses.muted}`}>
              Informasi di atas merupakan data publik dari Biro Perencanaan dan Kerja Sama. Silakan login untuk manajemen data lebih lanjut.
            </p>
          </div>
        </div>
      </div>

      {/* Login Side - Right Side on Large Screens */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px]"
        >
          {/* Branding Area for Mobile (hidden on LG) */}
          <div className="text-center mb-8 lg:hidden">
            <KemendesLogo size={80} showText={false} />
            <h1 className={`text-2xl font-black tracking-tight mt-4 ${themeClasses.text}`}>SI-ROCAN</h1>
          </div>

          {/* Login Card */}
          <div className={`border rounded-[32px] shadow-2xl p-8 lg:p-10 backdrop-blur-xl ${themeClasses.card}`}>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${themeClasses.text}`}>Login Sistem</h2>
                <p className="text-xs text-ink-soft">Akses Terbatas Pegawai Biro ROCAN</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className={`text-[11px] font-bold uppercase tracking-wider ${themeClasses.label}`}>NIP Pegawai</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={nipInput}
                    onChange={(e) => setNipInput(e.target.value)}
                    placeholder="Contoh: 19900101..."
                    className={`w-full rounded-2xl py-4 px-5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 border ${themeClasses.input}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[11px] font-bold uppercase tracking-wider ${themeClasses.label}`}>Password / PIN</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-2xl py-4 px-5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 border ${themeClasses.input}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-500 text-xs leading-relaxed"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-5 h-5 transition-transform group-hover:scale-110" />
                    MASUK KE SISTEM
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-500/10 flex items-center justify-between">
               <p className={`text-[10px] font-bold uppercase tracking-widest ${themeClasses.muted}`}>SI-ROCAN v2.0</p>
               <div className="flex gap-4 text-[10px] font-bold text-blue-500">
                  <span className="cursor-pointer hover:underline">Bantuan</span>
                  <span className="cursor-pointer hover:underline">Lupa PIN</span>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

