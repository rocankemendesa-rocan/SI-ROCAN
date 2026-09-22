import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PeminjamanRuang } from '../../types';
import { formatDateLong } from '../../utils';
import {
  CalendarCheck,
  Plus,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Trash2,
  Camera,
  Monitor,
  Mic,
  Laptop,
} from 'lucide-react';

export const PeminjamanRuangView: React.FC = () => {
  const { peminjamanList, bmnList, addPeminjaman, verifikasiPeminjaman, deletePeminjaman, clearAllPeminjaman, currentUser, pejabat, rooms } = useApp();

  const bmnPortabelOptions = bmnList.filter(b => b.kategori === 'Portabel');

  const [showForm, setShowForm] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);

  const [namaPemohon, setNamaPemohon] = useState(currentUser.name);
  const [unitKerja, setUnitKerja] = useState(currentUser.unit);
  const [jenisPeminjaman, setJenisPeminjaman] = useState<'Ruang Rapat' | 'BMN Portabel' | 'Keduanya'>('Ruang Rapat');
  const [namaRuangan, setNamaRuangan] = useState(rooms[0]?.nama || 'Ruang Rapat Utama Biro ROCAN Lt. 2');
  const [selectedBmnPortabel, setSelectedBmnPortabel] = useState<string[]>([]);
  const [tanggalPeminjaman, setTanggalPeminjaman] = useState('2026-03-20');
  const [waktuMulai, setWaktuMulai] = useState('09:00');
  const [waktuSelesai, setWaktuSelesai] = useState('12:00');
  const [jumlahPeserta, setJumlahPeserta] = useState<number>(15);
  const [keperluan, setKeperluan] = useState('');

  const [selectedBooking, setSelectedBooking] = useState<PeminjamanRuang | null>(null);
  const [actionBmn, setActionBmn] = useState<'disetujui' | 'ditolak'>('disetujui');
  const [catatanBmn, setCatatanBmn] = useState('');

  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const isPetugasBmn = currentUser.role === 'petugas_bmn' || currentUser.role === 'kasubbag_tu' || currentUser.role === 'admin';

  const handleToggleBmn = (name: string) => {
    setSelectedBmnPortabel(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleClearAll = () => {
    clearAllPeminjaman();
    setNotifSuccess('Semua data peminjaman telah dihapus.');
    setShowConfirmClear(false);
    setTimeout(() => setNotifSuccess(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const seq = peminjamanList.length + 1;
    const prefix = jenisPeminjaman === 'Ruang Rapat' ? 'RR' : jenisPeminjaman === 'BMN Portabel' ? 'BMN' : 'MIX';
    const nomorPeminjaman = `PINJAM-${prefix}/${new Date().getFullYear()}/${String(seq).padStart(3, '0')}`;

    addPeminjaman({
      nomorPeminjaman,
      namaPemohon,
      nipPemohon: currentUser.nip,
      unitKerja,
      namaRuangan: jenisPeminjaman !== 'BMN Portabel' ? namaRuangan : '-',
      namaRuang: jenisPeminjaman !== 'BMN Portabel' ? namaRuangan : '-',
      bmnPortabel: selectedBmnPortabel,
      tanggalPeminjaman,
      tanggalMulai: tanggalPeminjaman,
      tanggalSelesai: tanggalPeminjaman,
      waktuMulai,
      jamMulai: waktuMulai,
      waktuSelesai,
      jamSelesai: waktuSelesai,
      jumlahPeserta: jenisPeminjaman !== 'BMN Portabel' ? jumlahPeserta : 0,
      keperluan,
      agenda: keperluan,
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      jenis: jenisPeminjaman,
      status: 'menunggu',
    });

    setNotifSuccess(`Permohonan peminjaman ${jenisPeminjaman} berhasil dikirim!`);
    setShowForm(false);
    setKeperluan('');
    setSelectedBmnPortabel([]);
    setTimeout(() => setNotifSuccess(null), 4000);
  };

  const handleExecuteVerification = () => {
    if (!selectedBooking) return;
    verifikasiPeminjaman(selectedBooking.id, actionBmn, catatanBmn || 'Diproses');
    setNotifSuccess(`Peminjaman ${selectedBooking.nomorPeminjaman} diperbarui.`);
    setSelectedBooking(null);
    setCatatanBmn('');
    setTimeout(() => setNotifSuccess(null), 4000);
  };

  const themeClasses = {
    card: 'bg-white border-slate-200 shadow-sm',
    input: 'bg-white border-slate-300 text-ink',
    form: 'bg-white border-purple-200 shadow-2xl',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <CalendarCheck className="w-5 h-5 text-purple-500" /> Peminjaman Ruang & BMN
          </h2>
          <p className="text-xs text-slate-400">Reservasi ruang rapat dan peminjaman alat penunjang kegiatan</p>
        </div>
        <div className="flex items-center gap-2">
          {isPetugasBmn && peminjamanList.length > 0 && (
            <>
              {showConfirmClear ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-rose-500 font-bold animate-pulse">Yakin hapus semua?</span>
                  <button onClick={handleClearAll} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold">Ya, Hapus</button>
                  <button onClick={() => setShowConfirmClear(false)} className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-600 text-[10px] font-bold">Batal</button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowConfirmClear(true)} 
                  className="px-4 py-2 rounded-xl bg-rose-600/10 text-rose-600 border border-rose-500/20 text-xs font-bold shadow-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Hapus Semua
                </button>
              )}
            </>
          )}
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md">
            {showForm ? 'Tutup Formulir' : 'Ajukan Peminjaman'}
          </button>
        </div>
      </div>

      {notifSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {notifSuccess}
        </div>
      )}

      {!showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rooms.map((ruang) => (
            <div key={ruang.id} className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${themeClasses.card}`}>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-purple-600">Kapasitas {ruang.kapasitas} Orang</span>
                  <Building2 className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-900">{ruang.nama}</h4>
                <p className="text-[11px] text-slate-400">{ruang.fasilitas.join(', ')}</p>
              </div>
              <button onClick={() => { setNamaRuangan(ruang.nama); setJenisPeminjaman('Ruang Rapat'); setShowForm(true); }} className="w-full py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-600">Pilih Ruangan</button>
            </div>
          ))}
          <div className={`p-4 rounded-xl border border-dashed border-cyan-300 flex flex-col justify-center items-center space-y-2 bg-cyan-50/30`}>
             <Camera className="w-8 h-8 text-cyan-500 opacity-40" />
             <p className="text-[11px] font-bold text-cyan-600">Peminjaman Alat Saja</p>
             <button onClick={() => { setJenisPeminjaman('BMN Portabel'); setShowForm(true); }} className="px-4 py-1.5 rounded-lg bg-cyan-600 text-white text-[10px] font-bold">Ajukan Alat</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className={`rounded-2xl border p-6 space-y-4 animate-in slide-in-from-top-4 duration-500 ${themeClasses.form}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900">Formulir Peminjaman</h3>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
               {(['Ruang Rapat', 'BMN Portabel', 'Keduanya'] as const).map(t => (
                 <button 
                  key={t}
                  type="button"
                  onClick={() => setJenisPeminjaman(t)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${jenisPeminjaman === t ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}
                 >
                   {t}
                 </button>
               ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Pemohon</label>
                <input type="text" required placeholder="Nama Pemohon" value={namaPemohon} onChange={(e) => setNamaPemohon(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Unit Kerja</label>
                <input type="text" required placeholder="Unit Kerja" value={unitKerja} onChange={(e) => setUnitKerja(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tanggal Peminjaman</label>
                <input type="date" required value={tanggalPeminjaman} onChange={(e) => setTanggalPeminjaman(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
              </div>
              
              {jenisPeminjaman !== 'BMN Portabel' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Pilih Ruangan</label>
                    <select value={namaRuangan} onChange={(e) => setNamaRuangan(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`}>
                      {rooms.map((r) => <option key={r.id} value={r.nama}>{r.nama}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jumlah Peserta</label>
                    <input type="number" required value={jumlahPeserta} onChange={(e) => setJumlahPeserta(Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Waktu (Mulai - Selesai)</label>
                <div className="flex gap-2">
                  <input type="time" required value={waktuMulai} onChange={(e) => setWaktuMulai(e.target.value)} className={`flex-1 border rounded-lg px-2 py-2 text-xs ${themeClasses.input}`} />
                  <input type="time" required value={waktuSelesai} onChange={(e) => setWaktuSelesai(e.target.value)} className={`flex-1 border rounded-lg px-2 py-2 text-xs ${themeClasses.input}`} />
                </div>
              </div>
            </div>

            {jenisPeminjaman !== 'Ruang Rapat' && (
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Pilih Alat BMN Portabel</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {bmnPortabelOptions.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleToggleBmn(item.namaBarang)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        selectedBmnPortabel.includes(item.namaBarang) 
                          ? 'bg-cyan-50 border-cyan-500 ring-1 ring-cyan-500' 
                          : 'bg-white border-slate-200 hover:border-cyan-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedBmnPortabel.includes(item.namaBarang) ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {item.namaBarang.toLowerCase().includes('kamera') ? <Camera className="w-3.5 h-3.5" /> : 
                         item.namaBarang.toLowerCase().includes('proyektor') ? <Monitor className="w-3.5 h-3.5" /> :
                         item.namaBarang.toLowerCase().includes('mic') || item.namaBarang.toLowerCase().includes('sound') ? <Mic className="w-3.5 h-3.5" /> : <Laptop className="w-3.5 h-3.5" />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-ink leading-tight truncate">{item.namaBarang}</p>
                        <p className="text-[8px] text-slate-400 uppercase font-black">NUP: {item.nup}</p>
                      </div>
                    </div>
                  ))}
                  {bmnPortabelOptions.length === 0 && (
                    <div className="col-span-full py-6 text-center border-2 border-dashed rounded-xl text-slate-400 text-xs italic">
                      Tidak ada alat portabel tersedia di katalog.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Agenda / Keperluan</label>
              <textarea required rows={2} placeholder="Agenda Rapat / Penggunaan Alat" value={keperluan} onChange={(e) => setKeperluan(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs text-slate-500">Batal</button>
              <button type="submit" className="px-8 py-3 rounded-xl bg-purple-600 text-white text-xs font-black shadow-lg shadow-purple-600/20 hover:scale-[1.02] transition-all">Kirim Pengajuan</button>
            </div>
          </form>
        </div>
      )}

      <div className={`rounded-xl border p-5 shadow-lg ${themeClasses.card}`}>
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-slate-900">
          <Calendar className="w-4 h-4 text-cyan-500" /> Daftar Jadwal ({peminjamanList.length})
        </h3>
        <div className="space-y-3">
          {peminjamanList.map((booking) => (
            <div key={booking.id} className="p-4 rounded-xl border flex flex-col md:flex-row justify-between gap-4 bg-white border-slate-100 shadow-sm">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                    booking.jenis === 'Ruang Rapat' ? 'bg-purple-100 text-purple-600' :
                    booking.jenis === 'BMN Portabel' ? 'bg-cyan-100 text-cyan-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {booking.jenis || 'Ruang Rapat'}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">{booking.nomorPeminjaman}</span>
                </div>
                <div className="font-bold text-xs mt-1">
                   {booking.jenis !== 'BMN Portabel' && <span>{booking.namaRuangan} • </span>}
                   {booking.bmnPortabel && booking.bmnPortabel.length > 0 && (
                     <span className="text-cyan-600">[{booking.bmnPortabel.join(', ')}]</span>
                   )}
                </div>
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  <div className="flex items-center gap-1.5 bg-slate-500/5 px-2 py-0.5 rounded-lg border border-slate-500/10">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Tgl: <strong className="text-slate-900">{formatDateLong(booking.tanggalPeminjaman || '')}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-500/5 px-2 py-0.5 rounded-lg border border-slate-500/10">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Pukul: <strong className="text-slate-900">{booking.waktuMulai} - {booking.waktuSelesai}</strong></span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 italic mt-1">"{booking.keperluan}" — {booking.namaPemohon}</div>
              </div>
              <div className="flex items-center gap-2">
                {isPetugasBmn && (
                  <button 
                    onClick={() => {
                      deletePeminjaman(booking.id);
                      setNotifSuccess(`Pengajuan ${booking.nomorPeminjaman} telah dihapus.`);
                      setTimeout(() => setNotifSuccess(null), 4000);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {(booking.status === 'menunggu' || booking.status === 'menunggu_persetujuan') && isPetugasBmn ? (
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedBooking(booking); setActionBmn('disetujui'); }} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg">Setuju</button>
                    <button onClick={() => { setSelectedBooking(booking); setActionBmn('ditolak'); }} className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg">Tolak</button>
                  </div>
                ) : (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${booking.status === 'disetujui' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                    {booking.status.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          ))}
          {peminjamanList.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400 italic">Belum ada jadwal peminjaman</div>
          )}
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`border rounded-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 ${themeClasses.card}`}>
            <h3 className="text-base font-bold">Verifikasi {actionBmn === 'disetujui' ? 'Persetujuan' : 'Penolakan'}</h3>
            <p className="text-xs text-slate-500">Memberikan keputusan untuk permohonan <strong>{selectedBooking.nomorPeminjaman}</strong></p>
            <textarea 
              rows={3} 
              placeholder="Berikan catatan verifikasi..."
              value={catatanBmn} 
              onChange={(e) => setCatatanBmn(e.target.value)} 
              className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} 
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setSelectedBooking(null); setCatatanBmn(''); }} className="px-4 py-2 text-xs text-slate-500">Batal</button>
              <button onClick={handleExecuteVerification} className={`px-5 py-2 rounded-lg text-xs font-bold text-white ${actionBmn === 'disetujui' ? 'bg-emerald-600 shadow-lg shadow-emerald-600/20' : 'bg-rose-600 shadow-lg shadow-rose-600/20'}`}>Konfirmasi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
