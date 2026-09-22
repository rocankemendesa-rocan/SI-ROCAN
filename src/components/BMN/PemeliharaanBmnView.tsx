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
  const { bmnList, pemeliharaanList, addPemeliharaan, updatePemeliharaan, currentUser } = useApp();

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

  const isKasubbag = currentUser.role === 'kasubbag_tu' || currentUser.role === 'admin';
  const isPetugasBmn = currentUser.role === 'petugas_bmn' || currentUser.role === 'admin';

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
    updatePemeliharaan(selectedTicket.id, {
      status: actionKasubbag === 'setuju' ? 'disetujui' : 'ditolak',
      catatanKasubbag,
    });
    setSelectedTicket(null);
    setNotifSuccess(`Tiket ${selectedTicket.nomorTiket} diperbarui.`);
    setTimeout(() => setNotifSuccess(null), 4000);
  };

  const handleFollowup = () => {
    if (!ticketFollowup) return;
    updatePemeliharaan(ticketFollowup.id, {
      status: statusFollowup,
      vendorBengkel,
      estimasiBiaya,
      biayaRealisasi: statusFollowup === 'selesai' ? biayaRealisasi : undefined,
      catatanPerbaikan,
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
          <p className="text-xs text-slate-400">Pengajuan perbaikan aset BMN</p>
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
        {pemeliharaanList.map((mtn) => (
          <div key={mtn.id} className={`p-5 rounded-xl border space-y-3 ${themeClasses.card}`}>
            <div className="flex justify-between border-b pb-3">
              <div className="flex gap-2 text-xs">
                <span className="font-mono font-bold text-amber-500">{mtn.nomorTiket}</span>
                <span className="text-slate-400">{formatDateLong(mtn.tanggalPengajuan)}</span>
                <span className="font-semibold">• {mtn.namaPemohon}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${mtn.status === 'selesai' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                {mtn.status.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="md:col-span-2">
                <div className="font-bold text-sm">{mtn.namaBarang}</div>
                <div className={`p-2.5 rounded-lg border mt-1 ${themeClasses.subCard}`}>Kerusakan: {mtn.jenisKerusakan}</div>
              </div>
              <div className={`p-2.5 rounded-lg border space-y-1 ${themeClasses.subCard}`}>
                <div>Vendor: {mtn.vendorBengkel || '-'}</div>
                <div className="text-emerald-600 font-bold">Rp {(mtn.biayaRealisasi || mtn.estimasiBiaya || 0).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-3">
              {mtn.status === 'pengajuan' && isKasubbag && (
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedTicket(mtn); setActionKasubbag('setuju'); }} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg">Setujui</button>
                  <button onClick={() => { setSelectedTicket(mtn); setActionKasubbag('tolak'); }} className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg">Tolak</button>
                </div>
              )}
              {(mtn.status === 'disetujui' || mtn.status === 'proses') && isPetugasBmn && (
                <button onClick={() => { setTicketFollowup(mtn); setStatusFollowup('selesai'); }} className="px-3.5 py-1.5 bg-cyan-600 text-white text-xs font-bold rounded-lg">Tindak Lanjut</button>
              )}
            </div>
          </div>
        ))}
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
