import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateLong } from '../../utils';
import * as XLSX from 'xlsx';
import {
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  Search,
  Printer,
  Download,
  Image as ImageIcon,
  FileText,
  Upload,
} from 'lucide-react';
import { ReportType } from '../ReportPrintModal';

interface MutasiBmnViewProps {
  onOpenReport: (type: ReportType, start?: string, end?: string, bulan?: string, tahun?: number) => void;
}

export const MutasiBmnView: React.FC<MutasiBmnViewProps> = ({ onOpenReport }) => {
  const { bmnList, mutasiBmnList, addMutasiBmn, setujuiMutasiBmn, addBmnMaster, updateBmnItem, currentUser, pejabat } = useApp();

  const [activeMainTab, setActiveMainTab] = useState<'katalog' | 'mutasi'>('katalog');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState<'all' | 'Masuk' | 'Keluar'>('all');
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);

  // BMN Master Form State
  const [editingBmnId, setEditingBmnId] = useState<string | null>(null);
  const [kodeBarangM, setKodeBarangM] = useState('');
  const [nupM, setNupM] = useState('');
  const [namaBarangM, setNamaBarangM] = useState('');
  const [merkTypeM, setMerkTypeM] = useState('');
  const [kategoriM, setKategoriM] = useState<'Portabel' | 'Mebel' | 'Elektronik' | 'Kendaraan' | 'Lainnya'>('Portabel');
  const [tahunM, setTahunM] = useState(new Date().getFullYear());
  const [nilaiM, setNilaiM] = useState(0);
  const [lokasiM, setLokasiM] = useState('');
  const [pemegangM, setPemegangM] = useState('');
  const [nipPemegangM, setNipPemegangM] = useState('');
  const [kondisiM, setKondisiM] = useState<'Baik' | 'Rusak Ringan' | 'Rusak Berat'>('Baik');

  // Mutasi Form State
  const [jenisMutasi, setJenisMutasi] = useState<'Masuk' | 'Keluar'>('Masuk');
  const [selectedBmnId, setSelectedBmnId] = useState<string>('');
  const [kodeBarang, setKodeBarang] = useState('');
  const [nup, setNup] = useState('');
  const [namaBarang, setNamaBarang] = useState('');
  const [kondisi, setKondisi] = useState<'Baik' | 'Rusak Ringan' | 'Rusak Berat'>('Baik');
  const [nomorBast, setNomorBast] = useState('');
  const [keLokasi, setKeLokasi] = useState('');
  const [kePemegang, setKePemegang] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [dokumenUrl, setDokumenUrl] = useState('');

  const isKasubbag = currentUser.role === 'kasubbag_tu' || currentUser.role === 'admin';

  const resetMasterForm = () => {
    setEditingBmnId(null);
    setKodeBarangM('');
    setNupM('');
    setNamaBarangM('');
    setMerkTypeM('');
    setKategoriM('Portabel');
    setTahunM(new Date().getFullYear());
    setNilaiM(0);
    setLokasiM('');
    setPemegangM('');
    setNipPemegangM('');
    setKondisiM('Baik');
    setShowForm(false);
  };

  const handleEditMaster = (item: any) => {
    setEditingBmnId(item.id);
    setKodeBarangM(item.kodeBarang);
    setNupM(item.nup);
    setNamaBarangM(item.namaBarang);
    setMerkTypeM(item.merkType);
    setKategoriM(item.kategori || 'Portabel');
    setTahunM(item.tahunPerolehan);
    setNilaiM(item.nilaiPerolehan);
    setLokasiM(item.lokasiRuang);
    setPemegangM(item.pemegangBarang);
    setNipPemegangM(item.nipPemegang);
    setKondisiM(item.kondisi);
    setShowForm(true);
    setActiveMainTab('katalog');
  };

  const handleMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      kodeBarang: kodeBarangM,
      nup: nupM,
      namaBarang: namaBarangM,
      merkType: merkTypeM,
      kategori: kategoriM,
      tahunPerolehan: tahunM,
      nilaiPerolehan: nilaiM,
      lokasiRuang: lokasiM,
      pemegangBarang: pemegangM,
      nipPemegang: nipPemegangM,
      kondisi: kondisiM,
      statusPenggunaan: 'Digunakan Sendiri' as const,
    };

    if (editingBmnId) {
      updateBmnItem(editingBmnId, data);
      setNotifSuccess('Data BMN Master berhasil diperbarui.');
    } else {
      addBmnMaster(data);
      setNotifSuccess('Item BMN baru berhasil ditambahkan ke katalog.');
    }
    resetMasterForm();
    setTimeout(() => setNotifSuccess(null), 4000);
  };

  const handleSelectBmn = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedBmnId(id);
    const b = bmnList.find((item) => item.id === id);
    if (b) {
      setKodeBarang(b.kodeBarang);
      setNup(b.nup);
      setNamaBarang(b.namaBarang);
      setKondisi(b.kondisi);
    }
  };

  const exportToExcel = () => {
    const data = activeMainTab === 'mutasi' 
      ? mutasiBmnList.map(m => ({
          'Nomor Mutasi': m.nomorMutasi,
          'Tanggal': m.tanggal,
          'Jenis Mutasi': m.jenisMutasi,
          'Kode Barang': m.kodeBarang,
          'NUP': m.nup,
          'Nama Barang': m.namaBarang,
          'Lokasi Tujuan': m.keLokasi,
          'Pemegang Baru': m.kePemegang,
          'Nomor BAST': m.nomorBast,
          'Status': m.status
        }))
      : bmnList.map(b => ({
          'Kode Barang': b.kodeBarang,
          'NUP': b.nup,
          'Nama Barang': b.namaBarang,
          'Merk/Type': b.merkType,
          'Kategori': b.kategori || '-',
          'Tahun': b.tahunPerolehan,
          'Kondisi': b.kondisi,
          'Lokasi': b.lokasiRuang,
          'Pemegang': b.pemegangBarang
        }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeMainTab === 'mutasi' ? 'Mutasi BMN' : 'Katalog BMN');
    XLSX.writeFile(wb, `Laporan_${activeMainTab}_BMN_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const seq = mutasiBmnList.length + 1;
    const nomorMutasi = `MUT/BMN/${new Date().getFullYear()}/${String(seq).padStart(3, '0')}`;

    addMutasiBmn({
      nomorMutasi,
      tanggal: new Date().toISOString().split('T')[0],
      jenisMutasi,
      kodeBarang,
      nup,
      namaBarang,
      kondisi,
      nomorBast,
      dariLokasi: '',
      keLokasi,
      dariPemegang: '',
      kePemegang,
      keterangan: '',
      fotoUrl: fotoUrl || undefined,
      dokumenUrl: dokumenUrl || undefined,
      petugasBmn: pejabat.namaPetugasBmn,
      kasubbagTu: pejabat.namaKasubbagTu,
      status: 'menunggu_persetujuan',
    });

    setNotifSuccess(`Mutasi ${nomorMutasi} berhasil dicatat.`);
    setShowForm(false);
    setFotoUrl('');
    setDokumenUrl('');
    setTimeout(() => setNotifSuccess(null), 4000);
  };

  const filteredItems = (activeMainTab === 'mutasi' ? mutasiBmnList : bmnList).filter(m => {
    const name = activeMainTab === 'mutasi' ? (m as any).namaBarang : (m as any).namaBarang;
    const matchSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeMainTab === 'mutasi') {
      const matchJenis = filterJenis === 'all' || (m as any).jenisMutasi === filterJenis;
      return matchSearch && matchJenis;
    }
    return matchSearch;
  });

  const themeClasses = {
    card: 'bg-white border-slate-200 shadow-lg',
    input: 'bg-white border-slate-300 text-ink',
    form: 'bg-white border-cyan-200 shadow-2xl',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <ArrowLeftRight className="w-5 h-5 text-cyan-500" /> Katalog & Mutasi BMN
          </h2>
          <p className="text-xs text-slate-400">Pengelolaan master data dan mutasi aset BMN</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onOpenReport('bmn_mutasi', undefined, undefined, undefined, 2026)} className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md" title="Cetak PDF"><Printer className="w-4 h-4" /></button>
          <button onClick={exportToExcel} className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md" title="Unduh Excel"><Download className="w-4 h-4" /></button>
          <button 
            onClick={() => {
              if (activeMainTab === 'katalog') {
                resetMasterForm();
                setShowForm(true);
              } else {
                setShowForm(!showForm);
              }
            }} 
            className="px-3.5 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold shadow-md"
          >
            <Plus className="w-4 h-4" /> {showForm ? 'Tutup' : activeMainTab === 'katalog' ? 'Tambah Barang' : 'Catat Mutasi'}
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        <button 
          onClick={() => { setActiveMainTab('katalog'); setShowForm(false); }}
          className={`pb-2 text-xs font-bold px-2 ${activeMainTab === 'katalog' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-slate-400'}`}
        >
          Katalog Master
        </button>
        <button 
          onClick={() => { setActiveMainTab('mutasi'); setShowForm(false); }}
          className={`pb-2 text-xs font-bold px-2 ${activeMainTab === 'mutasi' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-slate-400'}`}
        >
          Riwayat Mutasi
        </button>
      </div>

      {notifSuccess && <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 text-xs font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {notifSuccess}</div>}

      {showForm && activeMainTab === 'katalog' && (
        <div className={`rounded-2xl border p-6 space-y-4 animate-in slide-in-from-top-4 duration-300 ${themeClasses.form}`}>
          <h3 className="text-sm font-bold text-slate-900">{editingBmnId ? 'Edit Data BMN' : 'Tambah BMN Baru ke Katalog'}</h3>
          <form onSubmit={handleMasterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Kode Barang</label>
              <input type="text" required value={kodeBarangM} onChange={(e) => setKodeBarangM(e.target.value)} placeholder="e.g. 3.05.02.01.003" className={`w-full border rounded-lg px-3 py-2 text-xs mt-1 ${themeClasses.input}`} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">NUP</label>
              <input type="text" required value={nupM} onChange={(e) => setNupM(e.target.value)} placeholder="00001" className={`w-full border rounded-lg px-3 py-2 text-xs mt-1 font-bold ${themeClasses.input}`} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nama Barang</label>
              <input type="text" required value={namaBarangM} onChange={(e) => setNamaBarangM(e.target.value)} placeholder="Nama Alat / Perangkat" className={`w-full border rounded-lg px-3 py-2 text-xs mt-1 ${themeClasses.input}`} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Merk / Type</label>
              <input type="text" value={merkTypeM} onChange={(e) => setMerkTypeM(e.target.value)} placeholder="Canon EOS 90D" className={`w-full border rounded-lg px-3 py-2 text-xs mt-1 ${themeClasses.input}`} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Kategori</label>
              <select value={kategoriM} onChange={(e) => setKategoriM(e.target.value as any)} className={`w-full border rounded-lg px-3 py-2 text-xs mt-1 font-bold text-cyan-600 ${themeClasses.input}`}>
                <option value="Portabel">Portabel (Bisa Dipinjam)</option>
                <option value="Mebel">Mebel / Furnitur</option>
                <option value="Elektronik">Elektronik Kantor</option>
                <option value="Kendaraan">Kendaraan Dinas</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tahun Perolehan</label>
              <input type="number" value={tahunM} onChange={(e) => setTahunM(Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-xs mt-1 ${themeClasses.input}`} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Kondisi</label>
              <select value={kondisiM} onChange={(e) => setKondisiM(e.target.value as any)} className={`w-full border rounded-lg px-3 py-2 text-xs mt-1 ${themeClasses.input}`}>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Lokasi Ruang</label>
              <input type="text" value={lokasiM} onChange={(e) => setLokasiM(e.target.value)} placeholder="Ruang Rapat Utama" className={`w-full border rounded-lg px-3 py-2 text-xs mt-1 ${themeClasses.input}`} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Pemegang Barang</label>
              <input type="text" value={pemegangM} onChange={(e) => setPemegangM(e.target.value)} placeholder="Nama Pegawai" className={`w-full border rounded-lg px-3 py-2 text-xs mt-1 ${themeClasses.input}`} />
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={resetMasterForm} className="text-xs font-bold text-slate-400">Batal</button>
              <button type="submit" className="px-6 py-2 rounded-xl bg-cyan-600 text-white text-xs font-black shadow-lg shadow-cyan-600/20">{editingBmnId ? 'Simpan Perubahan' : 'Tambah ke Katalog'}</button>
            </div>
          </form>
        </div>
      )}

      {showForm && activeMainTab === 'mutasi' && (
        <div className={`rounded-2xl border p-6 space-y-4 animate-in slide-in-from-top-4 duration-300 ${themeClasses.form}`}>
          <h3 className="text-sm font-bold text-slate-900">Formulir Mutasi BMN</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-2">
                <button type="button" onClick={() => setJenisMutasi('Masuk')} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${jenisMutasi === 'Masuk' ? 'bg-emerald-600 text-white' : 'text-slate-500 bg-slate-50'}`}>Masuk</button>
                <button type="button" onClick={() => setJenisMutasi('Keluar')} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${jenisMutasi === 'Keluar' ? 'bg-amber-600 text-white' : 'text-slate-500 bg-slate-50'}`}>Keluar</button>
              </div>
              <select value={selectedBmnId} onChange={handleSelectBmn} className={`w-full border rounded-lg px-3 py-2 text-xs font-bold ${themeClasses.input}`}>
                <option value="">-- Pilih Barang dari Katalog --</option>
                {bmnList.map(b => <option key={b.id} value={b.id}>[{b.kategori || 'General'}] [NUP: {b.nup}] {b.namaBarang}</option>)}
              </select>
              <input type="text" required placeholder="Kode Barang" value={kodeBarang} onChange={(e) => setKodeBarang(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
              <input type="text" required placeholder="NUP" value={nup} onChange={(e) => setNup(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs font-bold ${themeClasses.input}`} />
              <input type="text" required placeholder="Nama Barang" value={namaBarang} onChange={(e) => setNamaBarang(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
              <input type="text" required placeholder="Nomor BAST" value={nomorBast} onChange={(e) => setNomorBast(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
              <input type="text" required placeholder="Tujuan Lokasi" value={keLokasi} onChange={(e) => setKeLokasi(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
              <input type="text" required placeholder="Penerima Baru" value={kePemegang} onChange={(e) => setKePemegang(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Upload Foto BMN</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="URL Foto" value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} className={`flex-1 border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
                  <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600"><ImageIcon className="w-4 h-4" /></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Dokumen Pendukung</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="URL Dokumen" value={dokumenUrl} onChange={(e) => setDokumenUrl(e.target.value)} className={`flex-1 border rounded-lg px-3 py-2 text-xs ${themeClasses.input}`} />
                  <div className="p-2 rounded-lg bg-purple-600/10 text-purple-600"><Upload className="w-4 h-4" /></div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={() => setShowForm(false)} className="text-xs font-bold text-slate-400">Batal</button>
              <button type="submit" className="px-8 py-2 rounded-xl bg-cyan-600 text-white text-xs font-black shadow-lg shadow-cyan-600/20">Simpan Mutasi</button>
            </div>
          </form>
        </div>
      )}

      <div className={`rounded-xl border p-4 flex flex-col md:flex-row justify-between items-center gap-4 ${themeClasses.card}`}>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {activeMainTab === 'mutasi' ? (
            (['all', 'Masuk', 'Keluar'] as const).map(j => (
              <button key={j} onClick={() => setFilterJenis(j)} className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filterJenis === j ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 bg-slate-50'}`}>{j === 'all' ? 'Semua Riwayat' : `Mutasi ${j}`}</button>
            ))
          ) : (
            <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
              <Search className="w-4 h-4" /> Daftar Katalog Master ({bmnList.length} Item)
            </div>
          )}
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-600 transition-colors" />
          <input type="text" placeholder="Cari nama barang atau NUP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full border rounded-full pl-10 pr-4 py-2 text-xs font-bold outline-none transition-all focus:ring-2 focus:ring-cyan-500/20 ${themeClasses.input}`} />
        </div>
      </div>

      <div className={`rounded-xl border overflow-hidden ${themeClasses.card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b text-[11px] font-bold bg-slate-50 text-slate-500 uppercase tracking-wider">
                {activeMainTab === 'mutasi' ? (
                  <>
                    <th className="py-4 px-6">No. Mutasi</th>
                    <th className="py-4 px-6">Jenis</th>
                    <th className="py-4 px-6">Nama Barang</th>
                    <th className="py-4 px-6">BAST</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Aksi</th>
                  </>
                ) : (
                  <>
                    <th className="py-4 px-6">Aset (Kode & NUP)</th>
                    <th className="py-4 px-6">Nama & Merk</th>
                    <th className="py-4 px-6 text-center">Kategori</th>
                    <th className="py-4 px-6 text-center">Kondisi</th>
                    <th className="py-4 px-6">Lokasi & Pemegang</th>
                    <th className="py-4 px-6 text-center">Aksi</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  {activeMainTab === 'mutasi' ? (
                    <>
                      <td className="py-4 px-6 font-mono">
                        <div className="font-bold text-slate-900">{item.nomorMutasi}</div>
                        <div className="text-[10px] text-slate-400">{formatDateLong(item.tanggal)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.jenisMutasi === 'Masuk' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{item.jenisMutasi}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{item.namaBarang}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NUP: {item.nup}</div>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-500">{item.nomorBast}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${item.status === 'disetujui' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{item.status.replace('_', ' ')}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {item.status === 'menunggu_persetujuan' && isKasubbag && (
                          <button onClick={() => setujuiMutasiBmn(item.id)} className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-500 transition-all shadow-md">Setujui</button>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-6 font-mono">
                        <div className="text-blue-600 font-bold tracking-tighter">{item.kodeBarang}</div>
                        <div className="text-[11px] font-black">NUP: {item.nup}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{item.namaBarang}</div>
                        <div className="text-[10px] text-slate-500">{item.merkType || '-'}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${item.kategori === 'Portabel' ? 'bg-cyan-100 text-cyan-700 border border-cyan-200' : 'bg-slate-100 text-slate-600'}`}>
                          {item.kategori || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.kondisi === 'Baik' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{item.kondisi}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[11px] font-bold text-slate-700">{item.lokasiRuang}</div>
                        <div className="text-[10px] text-slate-500 italic">{item.pemegangBarang}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button onClick={() => handleEditMaster(item)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><FileText className="w-4 h-4" /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr><td colSpan={6} className="py-20 text-center text-slate-400 italic">Data tidak ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
