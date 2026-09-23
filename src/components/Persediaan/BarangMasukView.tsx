import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateLong } from '../../utils';
import * as XLSX from 'xlsx';
import {
  PackagePlus,
  Search,
  Printer,
  Boxes,
  Calendar,
  Camera,
  MapPin,
  FileText,
  CheckCircle,
  Plus,
  Download,
  Upload,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { ReportType } from '../ReportPrintModal';

interface BarangMasukViewProps {
  onOpenReport: (type: ReportType, start?: string, end?: string) => void;
}

export const BarangMasukView: React.FC<BarangMasukViewProps> = ({ onOpenReport }) => {
  const { inventory, barangMasuk, addBarangMasuk, currentUser, pejabat } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'transaksi' | 'rekap_stok'>('transaksi');

  // Filter dates for report
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2026-03-31');

  // Form State
  const [kodeBarang, setKodeBarang] = useState('');
  const [namaBarang, setNamaBarang] = useState('');
  const [jumlah, setJumlah] = useState<number>(10);
  const [satuan, setSatuan] = useState('Rim');
  const [lokasi, setLokasi] = useState('Gudang Lt. 2 - Rak A1');
  const [tandaTiba, setTandaTiba] = useState('');
  const [sumberPengadaan, setSumberPengadaan] = useState('DIPA ROCAN Kemendes TA 2026');
  const [fotoUrl, setFotoUrl] = useState('');
  const [dokumenUrl, setDokumenUrl] = useState('');
  const [catatan, setCatatan] = useState('');
  const [notifSuccess, setNotifSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSelectExistingItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setKodeBarang('');
      setNamaBarang('');
      return;
    }
    const item = inventory.find((i) => i.kodeBarang === val);
    if (item) {
      setKodeBarang(item.kodeBarang);
      setNamaBarang(item.namaBarang);
      setSatuan(item.satuan);
      setLokasi(item.lokasi);
    }
  };

  const exportToExcel = () => {
    const data = activeTab === 'transaksi' 
      ? barangMasuk.map(bm => ({
          'Nomor Dokumen': bm.nomorDokumen,
          'Tanggal': bm.tanggal,
          'Kode Barang': bm.kodeBarang,
          'Nama Barang': bm.namaBarang,
          'Jumlah': bm.jumlah,
          'Satuan': bm.satuan,
          'Lokasi': bm.lokasi,
          'Sumber Pengadaan': bm.sumberPengadaan,
          'Petugas': bm.petugasGudang
        }))
      : inventory.map(item => ({
          'Kode Barang': item.kodeBarang,
          'Nama Barang': item.namaBarang,
          'Kategori': item.kategori,
          'Stok': item.stok,
          'Satuan': item.satuan,
          'Lokasi': item.lokasi,
          'Nilai Persediaan': item.stok * item.hargaSatuan
        }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === 'transaksi' ? 'Riwayat Masuk' : 'Status Stok');
    XLSX.writeFile(wb, `Laporan_Persediaan_${activeTab}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
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
        for (const row of (data as any[])) {
          const kode = row['Kode Barang'] || row['kodeBarang'];
          const nama = row['Nama Barang'] || row['namaBarang'];
          const qty = Number(row['Jumlah'] || row['jumlah'] || 0);
          
          if (kode && nama && qty > 0) {
            const seq = barangMasuk.length + importedCount + 1;
            const nomor = `BM/IMPORT/${new Date().getFullYear()}/${String(seq).padStart(4, '0')}`;
            const nowStr = new Date().toISOString().split('T')[0];

            await addBarangMasuk({
              nomorDokumen: nomor,
              tanggal: nowStr,
              kodeBarang: String(kode),
              namaBarang: String(nama),
              jumlah: qty,
              satuan: row['Satuan'] || row['satuan'] || 'Pcs',
              lokasi: row['Lokasi'] || row['lokasi'] || 'Gudang Umum',
              tandaTiba: row['Keterangan'] || row['keterangan'] || 'Import Massal',
              sumberPengadaan: row['Sumber'] || row['sumber'] || 'Import Massal',
              petugasGudang: currentUser.name,
              verifikatorSakti: pejabat.namaVerifikatorSakti,
              catatan: 'Import massal dari Excel',
            });
            importedCount++;
          }
        }

        setImportStatus({ success: true, message: `Berhasil mengimport ${importedCount} data barang.` });
        setTimeout(() => setImportStatus(null), 5000);
      } catch (err) {
        console.error('Import error:', err);
        setImportStatus({ success: false, message: 'Gagal membaca file Excel. Pastikan format benar.' });
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kodeBarang || !namaBarang || jumlah <= 0) return;

    try {
      const seq = barangMasuk.length + 1;
      const nomor = `BM/ROCAN/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(seq).padStart(3, '0')}`;
      const nowStr = new Date().toISOString().split('T')[0];

      await addBarangMasuk({
        nomorDokumen: nomor,
        tanggal: nowStr,
        kodeBarang,
        namaBarang,
        jumlah: Number(jumlah),
        satuan,
        lokasi,
        tandaTiba: tandaTiba || `SJ-${Date.now().toString().slice(-6)}`,
        sumberPengadaan,
        petugasGudang: currentUser.role === 'petugas_gudang' ? currentUser.name : pejabat.namaPetugasGudang,
        verifikatorSakti: pejabat.namaVerifikatorSakti,
        fotoUrl: fotoUrl || undefined,
        dokumenUrl: dokumenUrl || undefined,
        catatan,
      });

      setNotifSuccess(true);
      setTimeout(() => setNotifSuccess(false), 3000);
      setKodeBarang('');
      setNamaBarang('');
      setFotoUrl('');
      setDokumenUrl('');
      setShowForm(false);
    } catch (err) {
      console.error('Save error:', err);
      alert('Gagal menyimpan data barang masuk. Silakan cek koneksi internet atau hubungi admin.');
    }
  };

  const filteredMasuk = React.useMemo(() => {
    return barangMasuk.filter(
      (bm) =>
        (bm.namaBarang || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bm.kodeBarang || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bm.nomorDokumen || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [barangMasuk, searchTerm]);

  const filteredInventory = React.useMemo(() => {
    return inventory.filter(
      (item) =>
        (item.namaBarang || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.kodeBarang || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  const themeClasses = {
    card: 'bg-white border-slate-200 shadow-sm',
    header: 'text-ink',
    input: 'bg-white border-slate-300 text-ink',
    tableHeader: 'bg-slate-50 border-slate-100 text-slate-500',
    tableRow: 'hover:bg-slate-50/50',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-ink">
            Persediaan Masuk
          </h2>
          <p className="text-xs text-ink-soft font-bold uppercase tracking-widest mt-1">Modul Inventaris SAKTI</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl border transition-all bg-white border-ink-faint shadow-sm">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-[11px] px-2 py-1.5 rounded-xl focus:outline-none font-bold text-ink"
              />
              <span className="text-[10px] font-black text-ink-soft uppercase tracking-tighter">s.d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-[11px] px-2 py-1.5 rounded-xl focus:outline-none font-bold text-ink"
              />
            <button
              onClick={() => onOpenReport('persediaan_masuk', startDate, endDate)}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20"
              title="Cetak Laporan PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={exportToExcel}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/20"
              title="Unduh Excel"
            >
              <Download className="w-4 h-4" />
            </button>
            {currentUser.role !== 'verifikator_persediaan' && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportExcel}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg shadow-amber-600/20"
                  title="Import dari Excel"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {currentUser.role !== 'verifikator_persediaan' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
                showForm 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              }`}
            >
              {showForm ? <Plus className="w-4 h-4 rotate-45" /> : <Plus className="w-4 h-4" />}
              <span>{showForm ? 'Batal Input' : 'Input Barang'}</span>
            </button>
          )}
        </div>
      </div>

      {notifSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4" />
          <span>Barang persediaan masuk berhasil dicatat!</span>
        </div>
      )}

      {importStatus && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top-4 ${
          importStatus.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
        }`}>
          {importStatus.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-xs font-bold">{importStatus.message}</span>
        </div>
      )}

      {/* Form Input */}
      {showForm && (
        <div className="rounded-3xl border p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300 bg-white border-ink-faint">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 flex items-center justify-center">
              <PackagePlus className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-ink">Formulir Barang Masuk</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 rounded-2xl bg-[#f8f9fb] border border-ink-faint">
              <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-2 ml-1">Pilih Barang Terdaftar</label>
              <select
                onChange={handleSelectExistingItem}
                className="w-full bg-transparent border-none rounded-xl px-2 py-1 text-xs focus:outline-none font-bold text-ink"
              >
                <option value="">-- Manual Input / Cari di Katalog --</option>
                {inventory.map((inv) => (
                  <option key={inv.id} value={inv.kodeBarang}>[{inv.kodeBarang}] {inv.namaBarang}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4">
                <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-2 ml-1">Kode Barang</label>
                <input
                  type="text"
                  required
                  value={kodeBarang}
                  onChange={(e) => setKodeBarang(e.target.value)}
                  placeholder="Kode SAKTI"
                  className={`w-full border rounded-2xl px-4 py-3 text-xs font-mono focus:ring-2 focus:ring-blue-600/20 transition-all ${themeClasses.input}`}
                />
              </div>
              <div className="md:col-span-8">
                <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-2 ml-1">Nama Barang</label>
                <input
                  type="text"
                  required
                  value={namaBarang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  placeholder="Nama barang lengkap"
                  className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-600/20 transition-all ${themeClasses.input}`}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-2 ml-1">Jumlah</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={jumlah}
                  onChange={(e) => setJumlah(Number(e.target.value))}
                  className={`w-full border rounded-2xl px-4 py-3 text-xs font-black focus:ring-2 focus:ring-blue-600/20 transition-all ${themeClasses.input}`}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-2 ml-1">Satuan</label>
                <select
                  value={satuan}
                  onChange={(e) => setSatuan(e.target.value)}
                  className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-600/20 transition-all ${themeClasses.input}`}
                >
                  <option value="Rim">Rim</option>
                  <option value="Box">Box</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Pack">Pack</option>
                  <option value="Set">Set</option>
                </select>
              </div>
              <div className="md:col-span-6">
                <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-2 ml-1">Lokasi Penyimpanan</label>
                <input
                  type="text"
                  required
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  placeholder="Gudang / Rak / Ruang"
                  className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-600/20 transition-all ${themeClasses.input}`}
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-2 ml-1">Upload Foto Barang</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={fotoUrl}
                    onChange={(e) => setFotoUrl(e.target.value)}
                    placeholder="URL Foto (Opsional)"
                    className={`flex-1 border rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-600/20 transition-all ${themeClasses.input}`}
                  />
                  <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-600">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-6">
                <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-2 ml-1">Upload Dokumen Pendukung (PDF/Doc)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={dokumenUrl}
                    onChange={(e) => setDokumenUrl(e.target.value)}
                    placeholder="URL Dokumen (Opsional)"
                    className={`flex-1 border rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-600/20 transition-all ${themeClasses.input}`}
                  />
                  <div className="p-3 rounded-2xl bg-purple-600/10 text-purple-600">
                    <Upload className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink-faint">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-full text-xs font-bold transition-all bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/20 transition-all"
              >
                Simpan Transaksi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Navigation & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="inline-flex p-1 rounded-2xl border transition-all bg-white border-ink-faint shadow-sm">
          <button
            onClick={() => setActiveTab('transaksi')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'transaksi' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            Riwayat Masuk
          </button>
          <button
            onClick={() => setActiveTab('rekap_stok')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'rekap_stok' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            Status Stok
          </button>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="w-4 h-4 text-ink-soft absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Cari kode atau nama barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full border rounded-full pl-11 pr-5 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-600/20 transition-all outline-none ${themeClasses.input}`}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="rounded-3xl border overflow-hidden transition-all duration-500 bg-white border-ink-faint shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8f9fb]">
              <tr className="border-b border-ink-faint">
                {activeTab === 'transaksi' ? (
                  <>
                    <th className="py-4 px-6 text-[10px] font-black text-ink-soft uppercase tracking-widest">Dokumen / Tanggal</th>
                    <th className="py-4 px-6 text-[10px] font-black text-ink-soft uppercase tracking-widest">Barang</th>
                    <th className="py-4 px-6 text-[10px] font-black text-ink-soft uppercase tracking-widest text-center">Jumlah</th>
                    <th className="py-4 px-6 text-[10px] font-black text-ink-soft uppercase tracking-widest">Lokasi</th>
                  </>
                ) : (
                  <>
                    <th className="py-4 px-6 text-[10px] font-black text-ink-soft uppercase tracking-widest">Kode / Nama</th>
                    <th className="py-4 px-6 text-[10px] font-black text-ink-soft uppercase tracking-widest text-center">Stok</th>
                    <th className="py-4 px-6 text-[10px] font-black text-ink-soft uppercase tracking-widest">Satuan</th>
                    <th className="py-4 px-6 text-[10px] font-black text-ink-soft uppercase tracking-widest text-right">Nilai Persediaan</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-faint">
              {activeTab === 'transaksi' ? (
                filteredMasuk.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="text-xs font-black text-ink">{item.nomorDokumen}</div>
                      <div className="text-[10px] text-ink-soft font-bold mt-1">{formatDateLong(item.tanggal)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-blue-600 font-bold tracking-tighter">{item.kodeBarang}</span>
                        <span className="text-xs font-bold text-ink">{item.namaBarang}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black">
                         +{item.jumlah}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-[10px] text-ink-soft font-bold">
                        <MapPin className="w-3 h-3" />
                        {item.lokasi}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-blue-600 font-bold tracking-tighter">{item.kodeBarang}</span>
                        <span className="text-xs font-bold text-ink">{item.namaBarang}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-sm font-black ${item.stok <= item.stokMin ? 'text-rose-600' : 'text-ink'}`}>
                        {item.stok}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[10px] font-black text-ink-soft uppercase tracking-widest">{item.satuan}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="text-xs font-black text-emerald-600">
                        Rp {(item.stok * item.hargaSatuan).toLocaleString('id-ID')}
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {(activeTab === 'transaksi' ? filteredMasuk : filteredInventory).length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-xs text-ink-soft font-medium italic">
                    Data tidak ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
