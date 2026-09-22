import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateLong } from '../../utils';
import {
  ClipboardList,
  Printer,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Search,
  Plus,
} from 'lucide-react';
import { StockOpnameItem } from '../../types';
import { ReportType } from '../ReportPrintModal';

interface StockOpnameViewProps {
  onOpenReport: (type: ReportType, start?: string, end?: string, bulan?: string, tahun?: number) => void;
}

export const StockOpnameView: React.FC<StockOpnameViewProps> = ({ onOpenReport }) => {
  const { theme, inventory, stockOpnames, addStockOpname, currentUser, pejabat } = useApp();

  const [showInputModal, setShowInputModal] = useState(false);
  const [periodeBulan, setPeriodeBulan] = useState('Maret');
  const [tahun, setTahun] = useState<number>(2026);
  const [itemsFisik, setItemsFisik] = useState<StockOpnameItem[]>(
    inventory.map((inv) => ({
      kodeBarang: inv.kodeBarang,
      namaBarang: inv.namaBarang,
      satuan: inv.satuan,
      stokSistem: inv.stok,
      stokFisik: inv.stok,
      selisih: 0,
      keterangan: 'Sesuai fisik',
    }))
  );

  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);

  const handleFisikChange = (index: number, val: number) => {
    setItemsFisik((prev) => {
      const updated = [...prev];
      const stokSistem = updated[index].stokSistem;
      const selisih = val - stokSistem;
      let keterangan = 'Sesuai fisik';
      if (selisih < 0) keterangan = `Selisih kurang ${Math.abs(selisih)} unit`;
      if (selisih > 0) keterangan = `Selisih lebih ${selisih} unit`;

      updated[index] = {
        ...updated[index],
        stokFisik: val,
        selisih,
        keterangan,
      };
      return updated;
    });
  };

  const handleKeteranganChange = (index: number, val: string) => {
    setItemsFisik((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], keterangan: val };
      return updated;
    });
  };

  const handleSaveStockOpname = () => {
    const nowStr = new Date().toISOString().split('T')[0];

    addStockOpname({
      periodeBulan,
      tahun,
      tanggalPelaksanaan: nowStr,
      petugasGudang:
        currentUser.role === 'petugas_gudang' ? currentUser.name : pejabat.namaPetugasGudang,
      verifikatorSakti: pejabat.namaVerifikatorSakti,
      kasubbagTu: pejabat.namaKasubbagTu,
      status: 'selesai',
      items: itemsFisik,
      catatanHasil: `Stock Opname bulan ${periodeBulan} ${tahun} terlaksana dengan ${
        itemsFisik.filter((i) => i.selisih !== 0).length
      } temuan selisih.`,
    });

    setNotifSuccess(`Berita Acara Stock Opname Periode ${periodeBulan} ${tahun} berhasil disimpan!`);
    setShowInputModal(false);
    setTimeout(() => setNotifSuccess(null), 4000);
  };

  const activeSO = stockOpnames[0];

  const themeClasses = {
    bg: theme === 'dark' ? 'bg-[#0c1630]' : 'bg-white',
    border: theme === 'dark' ? 'border-[#1b2d56]' : 'border-slate-200',
    text: 'text-ink',
    textMuted: 'text-ink-soft',
    card: theme === 'dark' ? 'bg-[#0c1630] border-[#1b2d56]' : 'bg-white border-slate-200',
    input: theme === 'dark' ? 'bg-[#081126] border-[#1f3563] text-ink' : 'bg-white border-slate-200 text-ink',
    subCard: theme === 'dark' ? 'bg-[#0d1c3a] border-[#1d3568]' : 'bg-slate-50 border-slate-200',
    tableHeader: theme === 'dark' ? 'bg-[#081126] border-[#1b2d56] text-ink-soft' : 'bg-slate-50 border-slate-100 text-slate-500',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-ink">
            <ClipboardList className="w-5 h-5 text-purple-500" />
            Stock Opname Persediaan (Periode Bulanan)
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Pemeriksaan dan pencocokan fisik barang persediaan gudang dengan data saldo SAKTI
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-cetak-laporan-so"
            onClick={() =>
              onOpenReport(
                'stock_opname',
                undefined,
                undefined,
                activeSO?.periodeBulan || 'Maret',
                activeSO?.tahun || 2026
              )
            }
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Stock Opname Periode Per Bulan</span>
          </button>

          <button
            id="btn-input-so-baru"
            onClick={() => {
              setItemsFisik(
                inventory.map((inv) => ({
                  kodeBarang: inv.kodeBarang,
                  namaBarang: inv.namaBarang,
                  satuan: inv.satuan,
                  stokSistem: inv.stok,
                  stokFisik: inv.stok,
                  selisih: 0,
                  keterangan: 'Sesuai fisik',
                }))
              );
              setShowInputModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Input Stock Opname Baru</span>
          </button>
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

      {/* Tanda Tangan 3 Pihak Official Notice */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition-colors ${themeClasses.subCard}`}>
        <div className="flex items-center gap-2.5 text-ink-soft">
          <UserCheck className="w-5 h-5 text-cyan-500 shrink-0" />
          <div>
            <span className="font-bold block text-ink">
              Ketentuan Berita Acara Stock Opname Kemendes PDT:
            </span>
            <span className="text-[11px]">
              Laporan Stock Opname Periode Per Bulan wajib ditandatangani oleh 3 Pejabat: Petugas
              Gudang, Pemegang Aplikasi / Operator SAKTI, dan Kepala Subbagian Tata Usaha.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] shrink-0">
          <span className={`px-2 py-1 rounded border transition-colors ${theme === 'dark' ? 'bg-[#091326] border-[#233d73] text-cyan-300' : 'bg-white border-slate-200 text-cyan-700 font-semibold'}`}>
            Gd: {pejabat.namaPetugasGudang}
          </span>
          <span className={`px-2 py-1 rounded border transition-colors ${theme === 'dark' ? 'bg-[#091326] border-[#233d73] text-purple-300' : 'bg-white border-slate-200 text-purple-700 font-semibold'}`}>
            Sakti: {pejabat.namaVerifikatorSakti}
          </span>
          <span className={`px-2 py-1 rounded border transition-colors ${theme === 'dark' ? 'bg-[#091326] border-[#233d73] text-amber-300' : 'bg-white border-slate-200 text-amber-700 font-semibold'}`}>
            Kasubbag: {pejabat.namaKasubbagTu}
          </span>
        </div>
      </div>

      {/* Latest Stock Opname Result Table */}
      {activeSO && (
        <div className={`rounded-xl border overflow-hidden shadow-lg space-y-4 p-5 transition-colors ${themeClasses.card}`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 transition-colors ${theme === 'dark' ? 'border-[#182a52]' : 'border-slate-50'}`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-ink">
                  Hasil Stock Opname Periode: Bulan {activeSO.periodeBulan} {activeSO.tahun}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold">
                  Selesai Diverifikasi
                </span>
              </div>
              <span className="text-xs text-ink-soft">
                Tanggal Pelaksanaan Fisik: {formatDateLong(activeSO.tanggalPelaksanaan)}
              </span>
            </div>

            <button
              onClick={() =>
                onOpenReport(
                  'stock_opname',
                  undefined,
                  undefined,
                  activeSO.periodeBulan,
                  activeSO.tahun
                )
              }
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors self-start sm:self-center"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Pratinjau Berita Acara</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[11px] font-semibold transition-colors ${themeClasses.tableHeader}`}>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Kode Barang</th>
                  <th className="py-2.5 px-3">Nama Barang</th>
                  <th className="py-2.5 px-3 text-center">Stok Sistem</th>
                  <th className="py-2.5 px-3 text-center">Stok Fisik Gudang</th>
                  <th className="py-2.5 px-3 text-center">Selisih</th>
                  <th className="py-2.5 px-3">Keterangan / Temuan</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors ${theme === 'dark' ? 'divide-[#152447]' : 'divide-slate-50'}`}>
                {activeSO.items.map((item, idx) => (
                  <tr key={idx} className={`transition-colors ${theme === 'dark' ? 'hover:bg-[#101e40]' : 'hover:bg-slate-50/50'}`}>
                    <td className="py-2.5 px-3 text-ink-soft">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-blue-500">
                      {item.kodeBarang}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-ink">{item.namaBarang}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-ink-soft">
                      {item.stokSistem} {item.satuan}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-cyan-600">
                      {item.stokFisik} {item.satuan}
                    </td>
                    <td className="py-2.5 px-3 text-center font-extrabold">
                      {item.selisih === 0 ? (
                        <span className="text-emerald-500">0</span>
                      ) : (
                        <span className="text-rose-500">
                          {item.selisih > 0 ? `+${item.selisih}` : item.selisih}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-ink-soft">{item.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Input Stock Opname Baru */}
      {showInputModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`border rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col transition-colors ${theme === 'dark' ? 'bg-[#0b1429] border-purple-500/40' : 'bg-white border-slate-200'}`}>
            <div className={`border-b pb-3 flex items-center justify-between transition-colors ${theme === 'dark' ? 'border-[#1c2e56]' : 'border-slate-100'}`}>
              <div>
                <h3 className="text-base font-bold text-ink">
                  Formulir Pelaksanaan Stock Opname Persediaan
                </h3>
                <p className="text-xs text-ink-soft">
                  Masukkan hasil pemeriksaan fisik di gudang untuk dibandingkan dengan saldo sistem
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={periodeBulan}
                  onChange={(e) => setPeriodeBulan(e.target.value)}
                  className={`border rounded px-2.5 py-1 text-xs focus:outline-none focus:border-purple-500 transition-colors ${themeClasses.input}`}
                >
                  <option value="Januari">Januari</option>
                  <option value="Februari">Februari</option>
                  <option value="Maret">Maret</option>
                  <option value="April">April</option>
                  <option value="Mei">Mei</option>
                  <option value="Juni">Juni</option>
                  <option value="Juli">Juli</option>
                  <option value="Agustus">Agustus</option>
                  <option value="September">September</option>
                  <option value="Oktober">Oktober</option>
                  <option value="November">November</option>
                  <option value="Desember">Desember</option>
                </select>

                <select
                  value={tahun}
                  onChange={(e) => setTahun(Number(e.target.value))}
                  className={`border rounded px-2.5 py-1 text-xs focus:outline-none focus:border-purple-500 transition-colors ${themeClasses.input}`}
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`text-[11px] border-b transition-colors ${themeClasses.tableHeader}`}>
                    <th className="py-2 px-3">Nama Barang</th>
                    <th className="py-2 px-3 text-center">Stok Sistem</th>
                    <th className="py-2 px-3 text-center">Hasil Hitung Fisik</th>
                    <th className="py-2 px-3 text-center">Selisih</th>
                    <th className="py-2 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${theme === 'dark' ? 'divide-[#152447]' : 'divide-slate-50'}`}>
                  {itemsFisik.map((item, idx) => (
                    <tr key={idx} className={theme === 'dark' ? '' : 'bg-white'}>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-ink">{item.namaBarang}</div>
                        <div className="text-[10px] text-ink-soft font-mono">{item.kodeBarang}</div>
                      </td>
                      <td className="py-2 px-3 text-center font-semibold text-ink-soft">
                        {item.stokSistem} {item.satuan}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={item.stokFisik}
                            onChange={(e) => handleFisikChange(idx, Number(e.target.value))}
                            className={`w-20 border rounded px-2 py-1 font-bold text-center focus:outline-none transition-colors ${
                              theme === 'dark' ? 'bg-[#081126] border-[#203666] text-ink focus:border-purple-400' : 'bg-white border-slate-300 text-ink focus:border-purple-500 shadow-sm'
                            }`}
                          />
                          <span className="text-ink-soft text-xs">{item.satuan}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold">
                        {item.selisih === 0 ? (
                          <span className="text-emerald-500">0</span>
                        ) : (
                          <span className="text-rose-500">
                            {item.selisih > 0 ? `+${item.selisih}` : item.selisih}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.keterangan}
                          onChange={(e) => handleKeteranganChange(idx, e.target.value)}
                          className={`w-full border rounded px-2 py-1 text-xs focus:outline-none transition-colors ${
                            theme === 'dark' ? 'bg-[#081126] border-[#1f3563] text-ink focus:border-purple-400' : 'bg-white border-slate-200 text-ink-soft focus:border-purple-500'
                          }`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`flex items-center justify-end gap-2.5 pt-3 border-t transition-colors ${theme === 'dark' ? 'border-[#1c2e56]' : 'border-slate-100'}`}>
              <button
                type="button"
                onClick={() => setShowInputModal(false)}
                className={`px-4 py-2 rounded-lg text-xs transition-colors ${theme === 'dark' ? 'bg-[#142347] hover:bg-[#1a2f5e] text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveStockOpname}
                className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
              >
                Simpan Berita Acara Stock Opname
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
