import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateLong } from '../../utils';
import {
  Wrench,
  Printer,
  Plus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { PemeliharaanBmn } from '../../types';
import { ReportType } from '../ReportPrintModal';

interface PemeliharaanBmnViewProps {
  onOpenReport: (type: ReportType, start?: string, end?: string, bulan?: string, tahun?: number) => void;
}

export const PemeliharaanBmnView: React.FC<PemeliharaanBmnViewProps> = ({ onOpenReport }) => {
  const { bmnList, pemeliharaanList, addPemeliharaan, verifikasiPemeliharaan, updateStatusPemeliharaan, currentUser } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [selectedBmnId, setSelectedBmnId] = useState<string>('');
  const [namaPemohon, setNamaPemohon] = useState(currentUser.name);
  const [namaBarang, setNamaBarang] = useState('');
  const [nup, setNup] = useState('');
  const [jenisKerusakan, setJenisKerusakan] = useState('');
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);

  const [selectedTicket, setSelectedTicket] = useState<PemeliharaanBmn | null>(null);
  const [actionKasubbag, setActionKasubbag] = useState<'setuju' | 'tolak'>('setuju');
  const [catatanKasubbag, setCatatanKasubbag] = useState('');

  const [ticketFollowup, setTicketFollowup] = useState<PemeliharaanBmn | null>(null);
  const [vendorBengkel, setVendorBengkel] = useState('');
  const [estimasiBiaya, setEstimasiBiaya] = useState(0);
  const [biayaRealisasi, setBiayaRealisasi] = useState(0);
  const [statusFollowup, setStatusFollowup] = useState<PemeliharaanBmn['status']>('proses');
  const [catatanPerbaikan, setCatatanPerbaikan] = useState('');

  const [filterStatus, setFilterStatus] = useState<PemeliharaanBmn['status'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isKasubbag = currentUser.role === 'kasubbag_tu' || currentUser.role === 'admin';
  const isPetugasBmn = currentUser.role === 'petugas_bmn' || currentUser.role === 'admin';

  const stats = {
    total: pemeliharaanList.length,
    pending: pemeliharaanList.filter(p => p.status === 'pengajuan').length,
    ongoing: pemeliharaanList.filter(p => p.status === 'persetujuan' || p.status === 'proses').length,
    done: pemeliharaanList.filter(p => p.status === 'selesai').length
  };

  const filteredList = pemeliharaanList
    .filter(p => filterStatus === 'all' || p.status === filterStatus)
    .filter(p => 
      p.nomorTiket.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.namaBarang.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getStatusStep = (status: PemeliharaanBmn['status']) => {
    switch(status) {
      case 'pengajuan': return 1;
      case 'persetujuan': return 2;
      case 'proses': return 3;
      case 'selesai': return 4;
      default: return 0;
    }
  };

  const handleSelectBmn = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedBmnId(id);
    const found = bmnList.find((b) => b.id === id);
    if (found) {
      setNamaBarang(found.namaBarang);
      setNup(found.nup);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const ticketNo = `MTN-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    addPemeliharaan({
      nomorTiket: ticketNo,
      tanggalPengajuan: dateStr,
      namaPemohon,
      nipPemohon: currentUser.nip,
      unitKerja: currentUser.unit,
      namaBarang,
      nup,
      jenisKerusakan,
      fotoKerusakan: '',
      status: 'pengajuan',
    });

    setNotifSuccess(`Pengajuan ${ticketNo} berhasil.`);
    setShowForm(false);
    setTimeout(() => setNotifSuccess(null), 5000);
  };

  const handleVerify = () => {
    if (!selectedTicket) return;
    verifikasiPemeliharaan(selectedTicket.id, actionKasubbag, catatanKasubbag);
    setSelectedTicket(null);
    setNotifSuccess(`Tiket ${selectedTicket.nomorTiket} diperbarui.`);
    setTimeout(() => setNotifSuccess(null), 4000);
  };

  const handleFollowup = () => {
    if (!ticketFollowup) return;
    updateStatusPemeliharaan(ticketFollowup.id, statusFollowup, {
      vendorBengkel,
      estimasiBiaya,
      biayaRealisasi: statusFollowup === 'selesai' ? biayaRealisasi : undefined,
      catatanTeknisi: catatanPerbaikan,
    });
    setTicketFollowup(null);
    setNotifSuccess(`Update tiket ${ticketFollowup.nomorTiket} berhasil.`);
    setTimeout(() => setNotifSuccess(null), 4000);
  };

  const themeClasses = {
    card: 'bg-white border-slate-200 shadow-lg',
    input: 'bg-white border-slate-300 text-ink',
    subCard: 'bg-slate-50 border-slate-100',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <Wrench className="w-5 h-5 text-amber-500" /> Pemeliharaan BMN
          </h2>
          <p className="text-xs text-slate-400">Monitoring progres dan manajemen perbaikan aset</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => onOpenReport('bmn_pemeliharaan', undefined, undefined, undefined, 2026)} className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md">
            <Printer className="w-4 h-4" /> Cetak Rekap
          </button>
          <button onClick={() => setShowForm(!showForm)} className="px-3.5 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-md">
            <Plus className="w-4 h-4" /> {showForm ? 'Tutup' : 'Ajukan Perbaikan'}
          </button>
        </div>
      </div>

      {/* Monitoring Summary Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Tiket</p>
          <h4 className="text-2xl font-black text-slate-900 mt-1">{stats.total}</h4>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menunggu</p>
          <h4 className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</h4>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm border-l-4 border-l-cyan-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sedang Proses</p>
          <h4 className="text-2xl font-black text-cyan-600 mt-1">{stats.ongoing}</h4>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selesai</p>
          <h4 className="text-2xl font-black text-emerald-600 mt-1">{stats.done}</h4>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-2">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {(['all', 'pengajuan', 'persetujuan', 'proses', 'selesai'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                filterStatus === s 
                ? 'bg-slate-900 text-white' 
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? 'Semua' : s === 'persetujuan' ? 'Disetujui' : s}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Cari Tiket / Barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
      </div>

      {notifSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 text-xs">
          {notifSuccess}
        </div>
      )}

      {showForm && (
        <div className={`rounded-2xl border p-6 space-y-4 ${themeClasses.card} border-amber-200`}>
          <h3 className="text-sm font-bold flex items-center gap-2">Formulir Pengajuan</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select value={selectedBmnId} onChange={handleSelectBmn} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`}>
              <option value="">-- Pilih Barang BMN --</option>
              {bmnList.map(b => <option key={b.id} value={b.id}>[NUP: {b.nup}] {b.namaBarang}</option>)}
            </select>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" required placeholder="Nama Pemohon" value={namaPemohon} onChange={(e) => setNamaPemohon(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
              <input type="text" required placeholder="Nama Barang" value={namaBarang} onChange={(e) => setNamaBarang(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
            </div>
            <textarea required rows={2} placeholder="Rincian Kerusakan" value={jenisKerusakan} onChange={(e) => setJenisKerusakan(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="text-xs text-slate-500">Batal</button>
              <button type="submit" className="px-5 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold">Kirim Pengajuan</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-xs text-slate-400 font-medium italic">Tidak ada tiket yang ditemukan</p>
          </div>
        ) : (
          filteredList.map((mtn) => (
            <div key={mtn.id} className={`p-5 rounded-xl border space-y-4 ${themeClasses.card}`}>
              <div className="flex justify-between border-b pb-3">
                <div className="flex gap-2 text-xs">
                  <span className="font-mono font-bold text-amber-500">{mtn.nomorTiket}</span>
                  <span className="text-slate-400">{formatDateLong(mtn.tanggalPengajuan)}</span>
                  <span className="font-semibold">• {mtn.namaPemohon}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  mtn.status === 'selesai' ? 'bg-emerald-500/10 text-emerald-600' : 
                  mtn.status === 'proses' ? 'bg-cyan-500/10 text-cyan-600' :
                  mtn.status === 'persetujuan' ? 'bg-blue-500/10 text-blue-600' :
                  'bg-amber-500/10 text-amber-600'
                }`}>
                  {mtn.status}
                </span>
              </div>

              {/* Progress Stepper */}
              <div className="py-2 px-2">
                <div className="relative flex justify-between items-center max-w-lg mx-auto">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                  <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-amber-500 -translate-y-1/2 z-0 transition-all duration-700" 
                    style={{ width: `${((getStatusStep(mtn.status) - 1) / 3) * 100}%` }}
                  />
                  
                  {[
                    { s: 'pengajuan', label: 'Pengajuan' },
                    { s: 'persetujuan', label: 'Disetujui' },
                    { s: 'proses', label: 'Perbaikan' },
                    { s: 'selesai', label: 'Selesai' }
                  ].map((step, idx) => {
                    const stepNum = idx + 1;
                    const isActive = getStatusStep(mtn.status) >= stepNum;
                    return (
                      <div key={step.s} className="relative z-10 flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${
                          isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-white border-2 border-slate-100 text-slate-300'
                        }`}>
                          {isActive ? <CheckCircle2 className="w-3 h-3" /> : stepNum}
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-tighter mt-2 ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
                <div className="md:col-span-2">
                  <div className="font-bold text-sm text-slate-900">{mtn.namaBarang}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">NUP: {mtn.nup} • {mtn.unitKerja}</div>
                  <div className={`p-3 rounded-xl border mt-3 ${themeClasses.subCard} italic text-slate-600`}>
                    <span className="font-bold text-slate-400 not-italic uppercase text-[9px] block mb-1">Rincian Kerusakan:</span>
                    {mtn.jenisKerusakan}
                  </div>
                </div>
                <div className={`p-4 rounded-xl border space-y-3 ${themeClasses.subCard}`}>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Penyedia / Bengkel</p>
                    <p className="font-bold text-slate-900">{mtn.vendorBengkel || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Biaya (Riil)</p>
                    <p className="text-emerald-600 font-black text-lg">Rp {(mtn.biayaRealisasi || mtn.estimasiBiaya || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                {mtn.status === 'pengajuan' && isKasubbag && (
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedTicket(mtn); setActionKasubbag('setuju'); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all">Setujui Perbaikan</button>
                    <button onClick={() => { setSelectedTicket(mtn); setActionKasubbag('tolak'); }} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-all">Tolak</button>
                  </div>
                )}
                {(mtn.status === 'persetujuan' || mtn.status === 'proses') && isPetugasBmn && (
                  <button onClick={() => { setTicketFollowup(mtn); setStatusFollowup('selesai'); }} className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Update Progres / Selesai
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 space-y-4 ${themeClasses.card}`}>
            <h3 className="text-base font-bold">Verifikasi Tiket</h3>
            <textarea rows={3} value={catatanKasubbag} onChange={(e) => setCatatanKasubbag(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedTicket(null)} className="text-xs text-slate-500">Batal</button>
              <button onClick={handleVerify} className={`px-5 py-2 rounded-lg text-xs font-bold text-white ${actionKasubbag === 'setuju' ? 'bg-emerald-600' : 'bg-rose-600'}`}>Konfirmasi</button>
            </div>
          </div>
        </div>
      )}

      {ticketFollowup && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 space-y-4 ${themeClasses.card}`}>
            <h3 className="text-base font-bold">Tindak Lanjut Perbaikan</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Vendor" value={vendorBengkel} onChange={(e) => setVendorBengkel(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
              <input type="number" placeholder="Biaya" value={biayaRealisasi} onChange={(e) => setBiayaRealisasi(Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
              <textarea rows={2} placeholder="Catatan" value={catatanPerbaikan} onChange={(e) => setCatatanPerbaikan(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setTicketFollowup(null)} className="text-xs text-slate-500">Batal</button>
              <button onClick={handleFollowup} className="px-5 py-2 rounded-lg bg-cyan-600 text-white text-xs font-bold">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
