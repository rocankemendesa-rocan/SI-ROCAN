import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import * as XLSX from 'xlsx';
import {
  Building2,
  Printer,
  Search,
  Calendar,
  UserCheck,
  Upload,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { ReportType } from '../ReportPrintModal';

interface LaporanBmnViewProps {
  onOpenReport: (type: ReportType, start?: string, end?: string, bulan?: string, tahun?: number) => void;
}

export const LaporanBmnView: React.FC<LaporanBmnViewProps> = ({ onOpenReport }) => {
  const { bmnList, mutasiBmnList, pemeliharaanList, pejabat, addBmnItem } = useApp();

  const [selectedTahun, setSelectedTahun] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState<'lengkap' | 'mutasi' | 'pemeliharaan'>('lengkap');
  const [searchTerm, setSearchTerm] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalNilaiPerolehan = bmnList.reduce((acc, b) => acc + (b.nilaiPerolehan || 0), 0);
  const totalBaik = bmnList.filter((b) => b.kondisi === 'Baik').length;
  const totalRusak = bmnList.filter((b) => b.kondisi !== 'Baik').length;

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          setImportStatus({ success: false, message: 'File Excel kosong atau format tidak sesuai.' });
          return;
        }

        let importedCount = 0;
        data.forEach((row: any) => {
          const kode = row['Kode Barang'] || row['kodeBarang'];
          const nup = row['NUP'] || row['nup'];
          const nama = row['Nama Barang'] || row['namaBarang'];
          
          if (kode && nup && nama) {
            addBmnItem({
              kodeBarang: String(kode),
              nup: String(nup),
              namaBarang: String(nama),
              merkType: row['Merk'] || row['merkType'] || '-',
              tahunPerolehan: Number(row['Tahun'] || row['tahunPerolehan'] || 2026),
              nilaiPerolehan: Number(row['Nilai'] || row['nilaiPerolehan'] || 0),
              kondisi: row['Kondisi'] || row['kondisi'] || 'Baik',
              lokasiRuang: row['Lokasi'] || row['lokasiRuang'] || 'Gudang BMN',
              pemegangBarang: row['Pemegang'] || row['pemegangBarang'] || 'Belum Ditentukan',
              statusPenggunaan: 'Digunakan Sendiri',
              kategori: row['Kategori'] || row['kategori'] || 'Peralatan & Mesin',
            });
            importedCount++;
          }
        });

        setImportStatus({ success: true, message: `Berhasil mengimport ${importedCount} data BMN.` });
        setTimeout(() => setImportStatus(null), 5000);
      } catch (err) {
        setImportStatus({ success: false, message: 'Gagal membaca file Excel. Pastikan format benar.' });
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredBmn = bmnList.filter(
    (b) => (b.namaBarang || '').toLowerCase().includes(searchTerm.toLowerCase()) || (b.nup || '').includes(searchTerm)
  );

  const themeClasses = {
    card: 'bg-white border-slate-200 shadow-sm',
    input: 'bg-white border-slate-200 text-ink',
    tableHeader: 'bg-slate-50 text-slate-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <Building2 className="w-5 h-5 text-cyan-500" /> Laporan BMN
          </h2>
          <p className="text-xs text-slate-400">Penatausahaan BMN Biro ROCAN</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl ${themeClasses.card}`}>
            <Calendar className="w-4 h-4 text-cyan-500" />
            <select value={selectedTahun} onChange={(e) => setSelectedTahun(Number(e.target.value))} className="bg-transparent text-xs font-bold focus:outline-none">
              <option value={2026}>TA 2026</option>
              <option value={2025}>TA 2025</option>
            </select>
          </div>
          <button onClick={() => onOpenReport('bmn_lengkap', undefined, undefined, undefined, selectedTahun)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md">
            <Printer className="w-4 h-4" /> Cetak
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-md flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Import
          </button>
        </div>
      </div>

      {importStatus && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-4 ${
          importStatus.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
        }`}>
          {importStatus.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-xs font-bold">{importStatus.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${themeClasses.card}`}>
          <span className="text-[11px] text-slate-400">Total Nilai Buku</span>
          <div className="text-xl font-extrabold text-emerald-500 mt-1 font-mono">Rp {totalNilaiPerolehan.toLocaleString()}</div>
        </div>
        <div className={`p-4 rounded-xl border ${themeClasses.card}`}>
          <span className="text-[11px] text-slate-400">Kondisi Aset</span>
          <div className="text-sm font-bold mt-1 flex gap-2">
            <span className="text-emerald-500">{totalBaik} Baik</span>
            <span className="text-amber-500">{totalRusak} Rusak</span>
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-xl border flex items-center gap-2 text-xs bg-slate-50 border-slate-200">
        <UserCheck className="w-4 h-4 text-cyan-500" />
        <span>Disahkan oleh: <strong>{pejabat.namaPetugasBmn}</strong> & <strong>{pejabat.namaKasubbagTu}</strong></span>
      </div>

      <div className="flex items-center justify-between border-b pb-1 gap-2 flex-wrap">
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('lengkap')} className={`pb-2 text-xs font-bold ${activeTab === 'lengkap' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-slate-400'}`}>Lengkap</button>
          <button onClick={() => setActiveTab('mutasi')} className={`pb-2 text-xs font-bold ${activeTab === 'mutasi' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-slate-400'}`}>Mutasi</button>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input type="text" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`border rounded-lg pl-8 pr-3 py-1.5 text-xs ${themeClasses.input}`} />
        </div>
      </div>

      <div className={`rounded-xl border overflow-hidden ${themeClasses.card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b text-[11px] font-semibold ${themeClasses.tableHeader}`}>
                <th className="py-3 px-4">Kode & NUP</th>
                <th className="py-3 px-4">Nama Barang</th>
                <th className="py-3 px-4 text-center">Kategori</th>
                <th className="py-3 px-4 text-center">Tahun</th>
                <th className="py-3 px-4 text-center">Kondisi</th>
                <th className="py-3 px-4 text-right">Nilai Perolehan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredBmn.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono">
                    <div className="text-blue-500">{item.kodeBarang}</div>
                    <div className="font-bold">NUP: {item.nup}</div>
                  </td>
                  <td className="py-3 px-4 font-bold">{item.namaBarang}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.kategori || '-'}</span>
                  </td>
                  <td className="py-3 px-4 text-center">{item.tahunPerolehan}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.kondisi === 'Baik' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>{item.kondisi}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">Rp {item.nilaiPerolehan.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
