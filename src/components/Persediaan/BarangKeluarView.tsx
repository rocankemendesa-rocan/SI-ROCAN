import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateLong } from '../../utils';
import {
  PackageMinus,
  Search,
  Printer,
  Boxes,
  Calendar,
  CheckCircle2,
  FileCheck,
  Building,
  User,
  ArrowRight,
  ClipboardCheck,
} from 'lucide-react';
import { PermintaanPersediaan } from '../../types';
import { ReportType } from '../ReportPrintModal';

interface BarangKeluarViewProps {
  onOpenReport: (type: ReportType, start?: string, end?: string) => void;
}

export const BarangKeluarView: React.FC<BarangKeluarViewProps> = ({ onOpenReport }) => {
  const {
    inventory,
    barangKeluar,
    permintaanList,
    prosesPengeluaranBarang,
    currentUser,
    pejabat,
    theme,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'siap_serah' | 'riwayat_keluar' | 'rekap_stok'>(
    'siap_serah'
  );

  // Filter dates for report
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2026-03-31');

  // Selected request for handover modal
  const [selectedReq, setSelectedReq] = useState<PermintaanPersediaan | null>(null);
  const [nomorTandaTerima, setNomorTandaTerima] = useState('');
  const [catatanHandover, setCatatanHandover] = useState('');
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);

  // Requests approved by Kasubbag TU and ready for warehouse dispatch
  const readyForHandover = permintaanList.filter((r) => r.status === 'disetujui');

  const handleOpenHandover = (req: PermintaanPersediaan) => {
    setSelectedReq(req);
    const seq = barangKeluar.length + 1;
    setNomorTandaTerima(`TTR-ROCAN/${new Date().getFullYear()}/${String(seq).padStart(3, '0')}`);
    setCatatanHandover('Barang fisik telah diperiksa bersama pemohon dalam kondisi lengkap dan baik.');
  };

  const handleExecuteHandover = async () => {
    if (!selectedReq) return;

    try {
      await prosesPengeluaranBarang(selectedReq.id, catatanHandover);

      setNotifSuccess(
        `Barang persediaan berhasil diserahkan kepada ${selectedReq.namaPemohon}! Stok fisik telah dipotong secara otomatis.`
      );
      setSelectedReq(null);
      setTimeout(() => setNotifSuccess(null), 4000);
    } catch (err) {
      console.error('Handover error:', err);
      alert('Gagal memproses serah terima barang. Silakan coba lagi.');
    }
  };

  const filteredRiwayat = barangKeluar.filter(
    (bk) =>
      bk.nomorPengeluaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bk.namaPenerima.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bk.unitKerja.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bk.items.some((i) => i.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const themeClasses = {
    card: theme === 'dark' ? 'bg-[#0c1630] border-[#1b2d56]' : 'bg-white border-slate-200 shadow-sm',
    header: 'text-ink',
    input: theme === 'dark' ? 'bg-[#0c1630] border-[#1f3463] text-ink' : 'bg-white border-slate-200 text-ink',
    tableHeader: theme === 'dark' ? 'bg-[#081126] border-[#1b2d56] text-ink-soft' : 'bg-slate-50 border-slate-100 text-slate-500',
    tableRow: theme === 'dark' ? 'hover:bg-[#101e40]' : 'hover:bg-slate-50/50',
    itemCard: theme === 'dark' ? 'bg-[#081126] border-[#182a52]' : 'bg-slate-50 border-slate-100',
    modal: theme === 'dark' ? 'bg-[#0b1429] border-cyan-500/40' : 'bg-white border-slate-200',
    modalMuted: theme === 'dark' ? 'bg-[#081126] border-[#1b2d56]' : 'bg-slate-50 border-slate-100',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${themeClasses.header}`}>
            <PackageMinus className="w-5 h-5 text-cyan-500" />
            Pencatatan Barang Persediaan Keluar
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Penyerahan kepada pemohon dan pemotongan stok
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-1.5 border p-1 rounded-lg ${theme === 'dark' ? 'bg-[#0e1b38] border-[#1e3466]' : 'bg-slate-50 border-slate-200'}`}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`bg-transparent text-[11px] px-1.5 py-1 rounded focus:outline-none ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}
            />
            <span className="text-xs text-slate-500">s.d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`bg-transparent text-[11px] px-1.5 py-1 rounded focus:outline-none ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}
            />
            <button
              onClick={() => onOpenReport('persediaan_keluar', startDate, endDate)}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {notifSuccess && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 animate-fadeIn ${
          theme === 'dark' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{notifSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className={`flex items-center justify-between border-b pb-1 flex-wrap gap-2 ${theme === 'dark' ? 'border-[#1b2d56]' : 'border-slate-100'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('siap_serah')}
            className={`pb-2.5 text-xs font-bold relative ${activeTab === 'siap_serah' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Siap Diserahkan ({readyForHandover.length})
          </button>
          <button
            onClick={() => setActiveTab('riwayat_keluar')}
            className={`pb-2.5 text-xs font-bold ${activeTab === 'riwayat_keluar' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Riwayat ({barangKeluar.length})
          </button>
          <button
            onClick={() => setActiveTab('rekap_stok')}
            className={`pb-2.5 text-xs font-bold ${activeTab === 'rekap_stok' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Stok ({inventory.length})
          </button>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${themeClasses.input}`}
          />
        </div>
      </div>

      {/* Tab Content: Siap Diserahkan */}
      {activeTab === 'siap_serah' && (
        <div className="space-y-4">
          {readyForHandover.length === 0 ? (
            <div className={`p-8 rounded-xl border text-center text-xs ${themeClasses.card} text-slate-400`}>
              Tidak ada antrean barang.
            </div>
          ) : (
            readyForHandover.map((req) => (
              <div key={req.id} className={`p-5 rounded-xl border hover:border-cyan-500/50 shadow-lg space-y-3 ${themeClasses.card}`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${theme === 'dark' ? 'border-[#182a52]' : 'border-slate-50'}`}>
                  <div>
                    <span className="font-mono text-xs font-bold text-cyan-600">{req.nomorPermintaan}</span>
                    <div className="text-xs text-slate-500 mt-1">Penerima: <strong className={themeClasses.header}>{req.namaPemohon}</strong></div>
                  </div>
                  {currentUser.role !== 'verifikator_persediaan' && (
                    <button
                      onClick={() => handleOpenHandover(req)}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      <span>Serahkan</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {req.items.map((it, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border text-xs flex flex-col justify-between ${themeClasses.itemCard}`}>
                      <div>
                        <span className={`font-bold block ${themeClasses.header}`}>{it.namaBarang}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{it.kodeBarang}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Jumlah:</span>
                        <span className="font-extrabold text-cyan-600">{it.jumlahDisetujui || it.jumlahDiminta} {it.satuan}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Riwayat */}
      {activeTab === 'riwayat_keluar' && (
        <div className={`rounded-xl border overflow-hidden shadow-lg ${themeClasses.card}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[11px] font-semibold ${themeClasses.tableHeader}`}>
                  <th className="py-3 px-4">No / Tanggal</th>
                  <th className="py-3 px-4">Penerima</th>
                  <th className="py-3 px-4">Barang</th>
                  <th className="py-3 px-4">TTR</th>
                  <th className="py-3 px-4">Petugas</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#152447]' : 'divide-slate-50'}`}>
                {filteredRiwayat.map((bk) => (
                  <tr key={bk.id} className={themeClasses.tableRow}>
                    <td className="py-3 px-4">
                      <div className={`font-bold ${themeClasses.header}`}>{bk.nomorPengeluaran}</div>
                      <div className="text-[10px] text-slate-400">{formatDateLong(bk.tanggal)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`font-bold ${themeClasses.header}`}>{bk.namaPenerima}</div>
                      <div className="text-[10px] text-slate-400">{bk.unitKerja}</div>
                    </td>
                    <td className="py-3 px-4">
                      <ul className="list-disc pl-3 text-[11px] text-slate-500">
                        {bk.items.map((it, idx) => (
                          <li key={idx}>{it.namaBarang} ({it.jumlahDisetujui || it.jumlahDiminta})</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-3 px-4 font-mono">{bk.dokumenTandaTerima}</td>
                    <td className="py-3 px-4 text-[10px] text-slate-400">{bk.petugasGudang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Stok */}
      {activeTab === 'rekap_stok' && (
        <div className={`rounded-xl border overflow-hidden shadow-lg ${themeClasses.card}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[11px] font-semibold ${themeClasses.tableHeader}`}>
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Barang</th>
                  <th className="py-3 px-4 text-center">Stok</th>
                  <th className="py-3 px-4">Satuan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#152447]' : 'divide-slate-50'}`}>
                {inventory.map((inv) => (
                  <tr key={inv.id} className={themeClasses.tableRow}>
                    <td className="py-3 px-4 font-mono text-blue-500">{inv.kodeBarang}</td>
                    <td className={`py-3 px-4 font-bold ${themeClasses.header}`}>{inv.namaBarang}</td>
                    <td className={`py-3 px-4 text-center font-extrabold ${themeClasses.header}`}>{inv.stok}</td>
                    <td className="py-3 px-4 text-slate-500">{inv.satuan}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${inv.stok <= inv.stokMin ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {inv.stok <= inv.stokMin ? 'Menipis' : 'Aman'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Handover Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 ${themeClasses.modal}`}>
            <h3 className={`text-base font-bold ${themeClasses.header}`}>Serah Terima Barang</h3>
            <div className={`p-3 rounded-lg border ${themeClasses.modalMuted} space-y-1.5`}>
              {selectedReq.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{it.namaBarang}</span>
                  <span className="font-extrabold text-cyan-600">{it.jumlahDisetujui || it.jumlahDiminta} {it.satuan}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-400">Nomor Tanda Terima</label>
                <input
                  type="text"
                  value={nomorTandaTerima}
                  onChange={(e) => setNomorTandaTerima(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none ${themeClasses.input}`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-400">Catatan</label>
                <textarea
                  rows={2}
                  value={catatanHandover}
                  onChange={(e) => setCatatanHandover(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${themeClasses.input}`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedReq(null)}
                className={`px-4 py-2 rounded-lg text-xs ${theme === 'dark' ? 'bg-[#142347] text-slate-300' : 'bg-slate-100 text-slate-600'}`}
              >
                Batal
              </button>
              <button
                onClick={handleExecuteHandover}
                className="px-5 py-2 rounded-lg bg-cyan-600 text-white text-xs font-bold shadow-md"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
