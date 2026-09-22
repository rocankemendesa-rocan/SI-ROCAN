import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateLong } from '../utils';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Search,
  X,
  CalendarDays
} from 'lucide-react';

const JadwalKegiatanView: React.FC = () => {
  const { kegiatanList, peminjamanList, addKegiatan } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate] = useState(new Date('2026-09-14'));
  
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  // Combine general activities with room bookings (approved and pending)
  const allEvents = React.useMemo(() => [
    ...kegiatanList.map(k => ({ ...k, type: 'kegiatan' })),
    ...peminjamanList
      .filter(p => p.status === 'disetujui' || p.status === 'menunggu')
      .map(p => ({
        id: p.id,
        judul: `[RUANG] ${p.agenda || p.keperluan}`,
        mulai: `${p.tanggalPeminjaman} ${p.waktuMulai}`,
        selesai: `${p.tanggalPeminjaman} ${p.waktuSelesai}`,
        lokasi: p.namaRuangan,
        deskripsi: p.keperluan,
        type: 'ruang',
        status: p.status
      }))
  ], [kegiatanList, peminjamanList]);

  const filteredKegiatan = React.useMemo(() => {
    return allEvents.filter(k => 
      k.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
      const dateA = new Date((a.mulai || '').replace(' ', 'T')).getTime();
      const dateB = new Date((b.mulai || '').replace(' ', 'T')).getTime();
      return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    });
  }, [allEvents, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addKegiatan({
      judul: formData.judul,
      mulai: (formData.mulai || '').replace('T', ' '),
      selesai: (formData.selesai || '').replace('T', ' '),
      lokasi: formData.lokasi,
      deskripsi: formData.deskripsi
    });
    setIsModalOpen(false);
    setFormData({ judul: '', mulai: '', selesai: '', lokasi: '', deskripsi: '' });
  };

  const [formData, setFormData] = useState({
    judul: '',
    mulai: '',
    selesai: '',
    lokasi: '',
    deskripsi: ''
  });

  const daysInMonth = 30;
  const startDay = 2; 
  const calendarDays = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const getEventsForDay = (day: number) => {
    return allEvents.filter(k => {
      const dateObj = new Date((k.mulai || '').replace(' ', 'T'));
      if (isNaN(dateObj.getTime())) return false;
      const d = dateObj.getDate();
      const m = dateObj.getMonth();
      const y = dateObj.getFullYear();
      // Use current date context if possible, but keep it stable for now
      return d === day && m === 8 && y === 2026;
    });
  };

  const themeClasses = {
    card: 'bg-white border-slate-200 shadow-xl',
    header: 'text-ink',
    input: 'bg-white border-slate-300 text-ink',
    day: 'bg-slate-50 border-slate-100',
    modal: 'bg-white border-slate-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink">Kalender & Agenda Kegiatan</h2>
          <p className="text-sm text-ink-soft">Jadwal rapat dan agenda kedinasan</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Tambah Agenda
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className={`lg:col-span-2 border rounded-2xl p-6 ${themeClasses.card} space-y-6`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2 text-ink">
              <CalendarDays className="w-5 h-5 text-indigo-500" />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg transition-colors text-ink-soft hover:text-ink">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="px-3 py-1 text-xs font-bold text-indigo-500 bg-indigo-500/10 rounded-lg">Hari Ini</button>
              <button className="p-2 rounded-lg transition-colors text-ink-soft hover:text-ink">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-500 uppercase py-2">{d}</div>
            ))}
            {calendarDays.map((day, idx) => {
              const events = day ? getEventsForDay(day) : [];
              const isToday = day === 14;
              return (
                <div 
                  key={idx} 
                  className={`min-h-[100px] rounded-xl border p-2 flex flex-col gap-1 transition-all ${
                    day 
                      ? isToday 
                        ? 'bg-indigo-600/10 border-indigo-500'
                        : `${themeClasses.day} hover:border-slate-500 cursor-pointer`
                      : 'border-transparent opacity-0'
                  }`}
                >
                  <span className={`text-xs font-bold ${isToday ? 'text-indigo-500' : 'text-slate-400'}`}>{day}</span>
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[70px]">
                    {events.map(e => (
                      <div 
                        key={e.id} 
                        className={`text-[9px] px-1.5 py-0.5 rounded truncate font-medium ${
                          (e as any).type === 'ruang' 
                            ? (e as any).status === 'disetujui' ? 'bg-purple-600' : 'bg-amber-500'
                            : 'bg-indigo-600'
                        } text-white`}
                      >
                        {e.judul}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agenda List */}
        <div className={`border rounded-2xl flex flex-col shadow-xl overflow-hidden ${themeClasses.card}`}>
          <div className="p-4 border-b flex items-center justify-between bg-slate-50 border-slate-200">
            <h3 className={`text-sm font-bold uppercase tracking-tight ${themeClasses.header}`}>Daftar Agenda</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Cari..." 
                className={`border rounded-lg pl-8 pr-3 py-1 text-[10px] focus:outline-none focus:border-indigo-500 ${themeClasses.input}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredKegiatan.map((k) => (
              <div 
                key={k.id}
                className="border rounded-xl p-3.5 space-y-2 transition-colors bg-white border-slate-100 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded ${
                    (k as any).type === 'ruang' 
                      ? (k as any).status === 'disetujui' ? 'text-purple-500 bg-purple-500/10' : 'text-amber-500 bg-amber-500/10'
                      : 'text-indigo-500 bg-indigo-500/10'
                  }`}>
                    <Calendar className="w-3 h-3" />
                    <span>{formatDateLong(k.mulai)}</span>
                  </div>
                  {(k as any).type === 'ruang' && (
                    <span className={`text-[9px] font-bold px-1.5 rounded border ${
                      (k as any).status === 'disetujui' 
                        ? 'text-purple-400 bg-purple-400/10 border-purple-400/20' 
                        : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                    }`}>
                      {(k as any).status === 'disetujui' ? 'RUANG' : 'PENDING'}
                    </span>
                  )}
                </div>
                <h4 className={`text-xs font-bold line-clamp-1 ${themeClasses.header}`}>{k.judul}</h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span className="truncate">{k.lokasi}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className={`relative w-full max-w-lg border rounded-2xl shadow-2xl overflow-hidden ${themeClasses.modal}`}>
            <div className="p-6 border-b flex items-center justify-between bg-slate-50 border-slate-200">
              <h3 className={`text-lg font-bold ${themeClasses.header}`}>Tambah Agenda Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Judul Kegiatan</label>
                <input
                  required
                  type="text"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 ${themeClasses.input}`}
                  placeholder="Judul"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Mulai</label>
                  <input
                    required
                    type="datetime-local"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 ${themeClasses.input}`}
                    value={formData.mulai}
                    onChange={(e) => setFormData({ ...formData, mulai: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Selesai</label>
                  <input
                    required
                    type="datetime-local"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 ${themeClasses.input}`}
                    value={formData.selesai}
                    onChange={(e) => setFormData({ ...formData, selesai: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Lokasi</label>
                <input
                  required
                  type="text"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 ${themeClasses.input}`}
                  placeholder="Lokasi"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold transition-colors bg-slate-100 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JadwalKegiatanView;
