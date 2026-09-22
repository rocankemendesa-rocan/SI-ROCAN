import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateLong } from '../../utils';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { PermintaanPersediaan } from '../../types';

interface PersetujuanPermintaanViewProps {
  onNavigateToBarangKeluar: () => void;
}

export const PersetujuanPermintaanView: React.FC<PersetujuanPermintaanViewProps> = ({
  onNavigateToBarangKeluar,
}) => {
  const { theme, permintaanList, verifikasiPermintaan, currentUser, setCurrentUser, users } = useApp();

  const [selectedReq, setSelectedReq] = useState<PermintaanPersediaan | null>(null);
  const [approvalQuantities, setApprovalQuantities] = useState<Record<string, number>>({});
  const [catatanKasubbag, setCatatanKasubbag] = useState('');
  const [alasanTolak, setAlasanTolak] = useState('');
  const [actionType, setActionType] = useState<'setuju' | 'tolak'>('setuju');
  const [notifMessage, setNotifMessage] = useState<string | null>(null);

  const isKasubbag = currentUser.role === 'kasubbag_tu' || currentUser.role === 'admin';

  // Requests waiting for verification
  const pendingRequests = React.useMemo(() => permintaanList.filter((r) => r.status === 'menunggu_verifikasi'), [permintaanList]);
  const processedRequests = React.useMemo(() => permintaanList.filter((r) => r.status !== 'menunggu_verifikasi'), [permintaanList]);

  const handleOpenModal = (req: PermintaanPersediaan, action: 'setuju' | 'tolak') => {
    setSelectedReq(req);
    setActionType(action);
    setCatatanKasubbag('');
    setAlasanTolak('');

    const initialQties: Record<string, number> = {};
    req.items.forEach((it) => {
      initialQties[it.kodeBarang] = it.jumlahDiminta;
    });
    setApprovalQuantities(initialQties);
  };

  const handleProcessVerification = () => {
    if (!selectedReq) return;

    if (actionType === 'setuju') {
      const disetujuiItems = selectedReq.items.map((it) => ({
        kodeBarang: it.kodeBarang,
        jumlahDisetujui: approvalQuantities[it.kodeBarang] ?? it.jumlahDiminta,
      }));

      verifikasiPermintaan(
        selectedReq.id,
        'setuju',
        disetujuiItems,
        catatanKasubbag || 'Disetujui oleh Kepala Subbagian Tata Usaha'
      );

      setNotifMessage(
        `Permintaan ${selectedReq.nomorPermintaan} telah disetujui! Barang siap dicatat keluar oleh Petugas Gudang.`
      );
    } else {
      verifikasiPermintaan(
        selectedReq.id,
        'tolak',
        undefined,
        alasanTolak || 'Permintaan belum dapat disetujui saat ini.'
      );
      setNotifMessage(`Permintaan ${selectedReq.nomorPermintaan} telah ditolak.`);
    }

    setSelectedReq(null);
    setTimeout(() => setNotifMessage(null), 4000);
  };

  const switchToKasubbag = () => {
    const kasubbagUser = users.find((u) => u.role === 'kasubbag_tu');
    if (kasubbagUser) setCurrentUser(kasubbagUser);
  };

  const themeClasses = {
    card: theme === 'dark' ? 'bg-[#0c1630] border-[#22396b]' : 'bg-white border-slate-200',
    header: theme === 'dark' ? 'bg-[#081126] border-[#1b2d56] text-ink-soft' : 'bg-slate-50 border-slate-100 text-ink-soft',
    row: theme === 'dark' ? 'hover:bg-[#101e40]' : 'hover:bg-slate-50/50',
    input: theme === 'dark' ? 'bg-[#081126] border-[#1b2d56] text-ink focus:border-cyan-400' : 'bg-white border-slate-200 text-ink focus:border-cyan-500 shadow-sm',
    badgeEmerald: theme === 'dark' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm',
    badgeAmber: theme === 'dark' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700',
    modal: theme === 'dark' ? 'bg-[#0b1429] border-blue-500/40' : 'bg-white border-slate-200',
    itemCard: theme === 'dark' ? 'bg-[#081126] border-[#1b2d56]' : 'bg-slate-50 border-slate-200 shadow-sm',
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Otoritas Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-ink">
            <FileCheck className="w-5 h-5 text-blue-500" />
            Persetujuan Permintaan Persediaan
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Otoritas verifikasi dan persetujuan oleh Kepala Subbagian Tata Usaha Biro Perencanaan dan Kerja Sama
          </p>
        </div>

        {/* Status role badge */}
        <div className="flex items-center gap-2">
          {isKasubbag ? (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${themeClasses.badgeEmerald}`}>
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>Otoritas Aktif: {currentUser.name}</span>
            </div>
          ) : (
            <button
              onClick={switchToKasubbag}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${themeClasses.badgeAmber} hover:opacity-80`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Beralih ke Akun Kasubbag TU untuk Verifikasi</span>
            </button>
          )}
        </div>
      </div>

      {notifMessage && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-fadeIn ${themeClasses.badgeEmerald}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{notifMessage}</span>
          </div>
          <button
            onClick={onNavigateToBarangKeluar}
            className={`text-xs font-bold underline flex items-center gap-1 transition-colors ${theme === 'dark' ? 'text-cyan-300 hover:text-cyan-200' : 'text-cyan-600 hover:text-cyan-700'}`}
          >
            Buka Modul Barang Keluar
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Section: Menunggu Persetujuan */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2 text-ink">
            <Clock className="w-4 h-4 text-amber-500" />
            Daftar Permintaan Menunggu Otoritas Kasubbag ({pendingRequests.length})
          </h3>
          <span className="text-xs text-ink-soft">
            Periksa keperluan dan tentukan kuantitas yang disetujui
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className={`p-8 rounded-xl border text-center text-xs transition-colors ${themeClasses.card} text-slate-400`}>
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            Tidak ada permohonan yang menunggu verifikasi saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className={`p-5 rounded-xl border hover:border-amber-500/50 shadow-xl space-y-4 transition-all ${themeClasses.card}`}
              >
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${theme === 'dark' ? 'border-[#182a52]' : 'border-slate-50'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-amber-500">
                        {req.nomorPermintaan}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold border border-amber-500/20">
                        Menunggu Otoritas
                      </span>
                    </div>
                    <div className="text-xs text-ink-soft mt-1">
                      Diajukan oleh: <strong className="text-ink">{req.namaPemohon}</strong> ({req.unitKerja}) • NIP. {req.nipPemohon}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-setujui-${req.id}`}
                      disabled={!isKasubbag}
                      onClick={() => handleOpenModal(req, 'setuju')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isKasubbag
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verifikasi & Setujui</span>
                    </button>

                    <button
                      id={`btn-tolak-${req.id}`}
                      disabled={!isKasubbag}
                      onClick={() => handleOpenModal(req, 'tolak')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isKasubbag
                          ? theme === 'dark' ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 border-rose-800/50' : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-ink-soft">Keperluan Pengajuan:</div>
                  <div className={`p-3 rounded-lg border text-xs transition-colors ${themeClasses.itemCard} text-ink`}>
                    {req.keperluan}
                  </div>
                </div>

                {/* Items Table */}
                <div className={`border rounded-lg overflow-hidden ${theme === 'dark' ? 'border-[#182c56]' : 'border-slate-100'}`}>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`text-[11px] border-b ${themeClasses.header}`}>
                        <th className="py-2 px-3">Kode Barang</th>
                        <th className="py-2 px-3">Nama Barang Persediaan</th>
                        <th className="py-2 px-3 text-center">Jumlah Diminta</th>
                        <th className="py-2 px-3">Satuan</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#142345]' : 'divide-slate-50'}`}>
                      {req.items.map((it, idx) => (
                        <tr key={`${req.id}-${it.kodeBarang}-${idx}`} className={theme === 'dark' ? '' : 'bg-white'}>
                          <td className="py-2 px-3 font-mono text-blue-500">{it.kodeBarang}</td>
                          <td className="py-2 px-3 font-semibold text-ink">{it.namaBarang}</td>
                          <td className="py-2 px-3 text-center font-extrabold text-amber-600">
                            {it.jumlahDiminta}
                          </td>
                          <td className="py-2 px-3 text-ink-soft">{it.satuan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat Permintaan yang Telah Diproses */}
      <div className={`space-y-3 pt-6 border-t ${theme === 'dark' ? 'border-[#1b2d56]' : 'border-slate-100'}`}>
        <h3 className="text-sm font-bold flex items-center gap-2 text-ink">
          <FileCheck className="w-4 h-4 text-cyan-500" />
          Riwayat Permintaan yang Telah Diverifikasi ({processedRequests.length})
        </h3>

        <div className={`rounded-xl border overflow-hidden shadow-lg ${themeClasses.card}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[11px] font-semibold ${themeClasses.header}`}>
                  <th className="py-3 px-4">No. Permintaan</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nama Pemohon & Unit</th>
                  <th className="py-3 px-4">Rincian Barang</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Catatan Kasubbag</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#152447]' : 'divide-slate-50'}`}>
                {processedRequests.map((req) => (
                  <tr key={req.id} className={`transition-colors ${themeClasses.row}`}>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-600">
                      {req.nomorPermintaan}
                    </td>
                    <td className="py-3 px-4 text-ink-soft">{formatDateLong(req.tanggal)}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-ink">{req.namaPemohon}</div>
                      <div className="text-[10px] text-ink-soft">{req.unitKerja}</div>
                    </td>
                    <td className="py-3 px-4">
                      {req.items.map((it, i) => (
                        <div key={`${req.id}-${it.kodeBarang}-${i}`} className="text-[11px] text-ink-soft">
                          • {it.namaBarang}: <strong className="text-cyan-600">{it.jumlahDisetujui || it.jumlahDiminta}</strong>{' '}
                          {it.satuan}
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {req.status === 'disetujui' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          Disetujui
                        </span>
                      )}
                      {req.status === 'selesai_diserahkan' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          Diserahkan
                        </span>
                      )}
                      {req.status === 'ditolak' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                          Ditolak
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-ink-soft italic">
                      {req.catatanKasubbag || req.alasanTolak || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Dialog for Verification */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 ${themeClasses.modal}`}>
            <div className={`border-b pb-3 ${theme === 'dark' ? 'border-[#1c2e56]' : 'border-slate-100'}`}>
              <h3 className="text-base font-bold text-ink">
                {actionType === 'setuju' ? 'Verifikasi & Persetujuan Permintaan' : 'Penolakan Permintaan'}
              </h3>
              <p className="text-xs text-ink-soft">
                {selectedReq.nomorPermintaan} • Pemohon: {selectedReq.namaPemohon} ({selectedReq.unitKerja})
              </p>
            </div>

            {actionType === 'setuju' ? (
              <div className="space-y-3">
                <p className="text-xs text-ink">
                  Periksa kuantitas yang disetujui. Anda dapat menyesuaikan kuantitas sesuai pertimbangan sisa
                  stok persediaan gudang:
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedReq.items.map((it) => (
                    <div
                      key={it.kodeBarang}
                      className={`p-3 rounded-lg border flex items-center justify-between text-xs ${themeClasses.itemCard}`}
                    >
                      <div className="pr-3">
                        <span className="font-semibold block text-ink">{it.namaBarang}</span>
                        <span className="text-[10px] text-ink-soft">
                          Diminta: {it.jumlahDiminta} {it.satuan}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-ink-soft">Disetujui:</label>
                        <input
                          type="number"
                          min="0"
                          max={it.jumlahDiminta}
                          value={approvalQuantities[it.kodeBarang] ?? it.jumlahDiminta}
                          onChange={(e) =>
                            setApprovalQuantities({
                              ...approvalQuantities,
                              [it.kodeBarang]: Number(e.target.value),
                            })
                          }
                          className={`w-20 border rounded px-2 py-1 font-bold text-center focus:outline-none ${themeClasses.input}`}
                        />
                        <span className="text-ink-soft text-xs">{it.satuan}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-ink">
                    Catatan Disposisi / Verifikasi Kasubbag
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Disetujui sesuai kebutuhan prioritas"
                    value={catatanKasubbag}
                    onChange={(e) => setCatatanKasubbag(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${themeClasses.input}`}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-rose-500">
                  Berikan alasan penolakan permintaan persediaan ini agar dapat ditinjau oleh pemohon:
                </p>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Stok barang saat ini habis atau dialokasikan untuk kegiatan pimpinan"
                  value={alasanTolak}
                  onChange={(e) => setAlasanTolak(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${theme === 'dark' ? 'bg-[#081126] border-[#1b2d56] text-ink focus:border-rose-400' : 'bg-white border-slate-200 text-ink focus:border-rose-500 shadow-sm'}`}
                />
              </div>
            )}

            <div className={`flex items-center justify-end gap-2.5 pt-2 border-t ${theme === 'dark' ? 'border-[#1c2e56]' : 'border-slate-100'}`}>
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className={`px-4 py-2 rounded-lg text-xs ${theme === 'dark' ? 'bg-[#142347] hover:bg-[#1a2f5e] text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessVerification}
                className={`px-5 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-md ${
                  actionType === 'setuju'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                }`}
              >
                {actionType === 'setuju' ? 'Sahkan Persetujuan' : 'Tolak Permintaan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
