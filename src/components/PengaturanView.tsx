import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import * as XLSX from 'xlsx';
import {
  Settings,
  UserCheck,
  Building,
  Save,
  RotateCcw,
  CheckCircle2,
  Plus,
  Boxes,
  Building2,
  Shield,
  Users,
  Trash2,
  Mail,
  Fingerprint,
} from 'lucide-react';
import { UserRole } from '../types';

export const PengaturanView: React.FC = () => {
  const {
    pejabat,
    updatePejabat,
    inventory,
    bmnList,
    addInventoryMaster,
    addBmnMaster,
    resetDataToDefault,
    users,
    addUser,
    deleteUser,
    rooms,
    addRoom,
    deleteRoom,
    currentUser,
  } = useApp();

  // Pejabat Form State
  const [namaKasubbagTu, setNamaKasubbagTu] = useState(pejabat.namaKasubbagTu);
  const [nipKasubbagTu, setNipKasubbagTu] = useState(pejabat.nipKasubbagTu);
  const [namaPetugasGudang, setNamaPetugasGudang] = useState(pejabat.namaPetugasGudang);
  const [nipPetugasGudang, setNipPetugasGudang] = useState(pejabat.nipPetugasGudang);
  const [namaVerifikatorSakti, setNamaVerifikatorSakti] = useState(pejabat.namaVerifikatorSakti);
  const [nipVerifikatorSakti, setNipVerifikatorSakti] = useState(pejabat.nipVerifikatorSakti);
  const [namaPetugasBmn, setNamaPetugasBmn] = useState(pejabat.namaPetugasBmn);
  const [nipPetugasBmn, setNipPetugasBmn] = useState(pejabat.nipPetugasBmn);

  // Room Master State
  const [roomNama, setRoomNama] = useState('');
  const [roomLokasi, setRoomLokasi] = useState('');
  const [roomKapasitas, setRoomKapasitas] = useState(10);
  const [roomFasilitas, setRoomFasilitas] = useState('AC, Wi-Fi');

  // User Management State
  const [userNama, setUserNama] = useState('');
  const [userNip, setUserNip] = useState('');
  const [userNik, setUserNik] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('pegawai');
  const [userUnit, setUserUnit] = useState('Biro Perencanaan dan Kerja Sama');
  const [userEmail, setUserEmail] = useState('');
  const [userPin, setUserPin] = useState('123456');

  // New Item Persediaan Form
  const [newKodeBarang, setNewKodeBarang] = useState('');
  const [newNamaBarang, setNewNamaBarang] = useState('');
  const [newKategori, setNewKategori] = useState('ATK');
  const [newSatuan, setNewSatuan] = useState('Rim');
  const [newStok, setNewStok] = useState(50);
  const [newStokMin, setNewStokMin] = useState(10);
  const [newHargaSatuan, setNewHargaSatuan] = useState(55000);
  const [newLokasi, setNewLokasi] = useState('Gudang Lt. 2 - Rak A1');

  // New BMN Form
  const [bmnKode, setBmnKode] = useState('');
  const [bmnNup, setBmnNup] = useState('');
  const [bmnNama, setBmnNama] = useState('');
  const [bmnMerk, setBmnMerk] = useState('');
  const [bmnTahun, setBmnTahun] = useState(2026);
  const [bmnNilai, setBmnNilai] = useState(15000000);
  const [bmnLokasi, setBmnLokasi] = useState('Ruang Kerja Bagian Perencanaan');
  const [bmnPemegang, setBmnPemegang] = useState('Staf Biro ROCAN');

  const [notifMessage, setNotifMessage] = useState<string | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportUsers = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        for (const row of data as any[]) {
          const nama = row['Nama'] || row['name'] || row['nama'];
          const nip = row['NIP'] || row['nip'];
          
          if (nama && nip) {
            const roleKey = (row['Role'] || row['role'] || 'pegawai').toLowerCase().replace(' ', '_');
            await addUser({
              name: String(nama),
              nip: String(nip),
              nik: String(row['NIK'] || row['nik'] || ''),
              role: (['admin', 'pegawai', 'petugas_bmn', 'petugas_gudang', 'kasubbag_tu', 'ka_biro', 'ka_bagian', 'verifikator_persediaan', 'petugas_arsip'].includes(roleKey) ? roleKey : 'pegawai') as UserRole,
              roleTitle: row['Jabatan'] || row['roleTitle'] || 'Staf',
              unit: row['Unit'] || row['unit'] || userUnit,
              email: row['Email'] || row['email'] || '',
              pin: String(row['PIN'] || row['pin'] || nip),
            });
            importedCount++;
          }
        }

        setImportStatus({ success: true, message: `Berhasil mengimport ${importedCount} data pegawai.` });
        setTimeout(() => setImportStatus(null), 5000);
      } catch (err) {
        setImportStatus({ success: false, message: 'Gagal membaca file Excel. Pastikan format benar.' });
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSavePejabat = (e: React.FormEvent) => {
    e.preventDefault();
    updatePejabat({
      namaKasubbagTu,
      nipKasubbagTu,
      namaPetugasGudang,
      nipPetugasGudang,
      namaVerifikatorSakti,
      nipVerifikatorSakti,
      namaPetugasBmn,
      nipPetugasBmn,
    });
    setNotifMessage('Data pejabat penandatangan berhasil diperbarui!');
    setTimeout(() => setNotifMessage(null), 3500);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNama || !userNik || isAddingUser) return;

    setIsAddingUser(true);
    try {
      await addUser({
        name: userNama,
        nip: userNip,
        nik: userNik,
        role: userRole,
        roleTitle: userRole === 'pegawai' 
          ? 'Analis Kebijakan' 
          : userRole === 'ka_biro'
          ? 'Kepala Biro Perencanaan dan Kerja Sama'
          : userRole === 'ka_bagian'
          ? 'Kepala Bagian Kerja Sama'
          : userRole.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        unit: userUnit,
        email: userEmail,
        pin: userPin
      });

      setNotifMessage(`Pegawai "${userNama}" berhasil ditambahkan ke sistem!`);
      setUserNama('');
      setUserNip('');
      setUserNik('');
      setUserPin('123456');
    } catch (error) {
      console.error(error);
      setNotifMessage('Gagal menambahkan pegawai. Silakan coba lagi.');
    } finally {
      setIsAddingUser(false);
      setTimeout(() => setNotifMessage(null), 3500);
    }
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNama) return;

    addRoom({
      nama: roomNama,
      lokasi: roomLokasi,
      kapasitas: Number(roomKapasitas),
      fasilitas: roomFasilitas.split(',').map(f => f.trim()),
    });

    setNotifMessage(`Ruang rapat "${roomNama}" berhasil ditambahkan ke master data!`);
    setRoomNama('');
    setRoomLokasi('');
    setTimeout(() => setNotifMessage(null), 3500);
  };

  const handleAddMasterPersediaan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKodeBarang || !newNamaBarang) return;

    addInventoryMaster({
      kodeBarang: newKodeBarang,
      namaBarang: newNamaBarang,
      kategori: newKategori,
      satuan: newSatuan,
      stok: Number(newStok),
      stokMin: Number(newStokMin),
      hargaSatuan: Number(newHargaSatuan),
      lokasi: newLokasi,
    });

    setNotifMessage(`Barang master persediaan "${newNamaBarang}" berhasil ditambahkan ke katalog!`);
    setNewKodeBarang('');
    setNewNamaBarang('');
    setTimeout(() => setNotifMessage(null), 3500);
  };

  const handleAddMasterBmn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bmnKode || !bmnNup || !bmnNama) return;

    addBmnMaster({
      kodeBarang: bmnKode,
      nup: bmnNup,
      namaBarang: bmnNama,
      merkType: bmnMerk,
      tahunPerolehan: Number(bmnTahun),
      kondisi: 'Baik',
      nilaiPerolehan: Number(bmnNilai),
      lokasiRuang: bmnLokasi,
      pemegangBarang: bmnPemegang,
    });

    setNotifMessage(`Aset BMN "${bmnNama}" NUP ${bmnNup} berhasil didaftarkan ke SIMAN/SAKTI!`);
    setBmnKode('');
    setBmnNup('');
    setBmnNama('');
    setBmnMerk('');
    setTimeout(() => setNotifMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Pengaturan Sistem & Pejabat Penandatangan
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Konfigurasi nama & NIP pejabat berwenang penandatangan laporan naskah dinas dan master data
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Apakah Anda yakin ingin mengatur ulang data ke default awal?')) {
              resetDataToDefault();
              setNotifMessage('Data berhasil diatur ulang ke kondisi default.');
              setTimeout(() => setNotifMessage(null), 3000);
            }
          }}
          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-900/60 text-rose-800 text-xs font-semibold border border-rose-800/50 flex items-center gap-1.5 transition-colors self-start"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Data Default</span>
        </button>
      </div>

      {notifMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-500/40 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notifMessage}</span>
        </div>
      )}

      {importStatus && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-4 ${
          importStatus.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
        }`}>
          {importStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <Shield className="w-4 h-4 text-rose-500" />}
          <span className="text-xs font-bold">{importStatus.message}</span>
        </div>
      )}

      {/* Section 1: Pejabat Penandatangan Form */}
      <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-ink">
              Data Pejabat Penandatangan Naskah Dinas & Laporan Resmi
            </h3>
            <p className="text-[11px] text-ink-soft">
              Nama dan NIP akan otomatis tertera pada Berita Acara Stock Opname, Laporan Masuk/Keluar, dan Laporan BMN
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePejabat} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kasubbag TU */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-amber-300 block">
                1. Kepala Subbagian Tata Usaha Biro Perencanaan & Kerja Sama
              </span>
              <div>
                <label className="block text-[11px] text-ink-soft mb-0.5">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={namaKasubbagTu}
                  onChange={(e) => setNamaKasubbagTu(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-cyan-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-ink-soft mb-0.5">Nomor Induk Pegawai (NIP)</label>
                <input
                  type="text"
                  required
                  value={nipKasubbagTu}
                  onChange={(e) => setNipKasubbagTu(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            {/* Petugas Gudang */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-emerald-300 block">
                2. Petugas Pengelola Gudang Persediaan
              </span>
              <div>
                <label className="block text-[11px] text-ink-soft mb-0.5">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={namaPetugasGudang}
                  onChange={(e) => setNamaPetugasGudang(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-cyan-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-ink-soft mb-0.5">Nomor Induk Pegawai (NIP)</label>
                <input
                  type="text"
                  required
                  value={nipPetugasGudang}
                  onChange={(e) => setNipPetugasGudang(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            {/* Operator SAKTI */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-purple-300 block">
                3. Pemegang Aplikasi / Operator Modul Persediaan SAKTI
              </span>
              <div>
                <label className="block text-[11px] text-ink-soft mb-0.5">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={namaVerifikatorSakti}
                  onChange={(e) => setNamaVerifikatorSakti(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-cyan-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-ink-soft mb-0.5">Nomor Induk Pegawai (NIP)</label>
                <input
                  type="text"
                  required
                  value={nipVerifikatorSakti}
                  onChange={(e) => setNipVerifikatorSakti(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            {/* Petugas BMN */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-cyan-300 block">
                4. Petugas Penatausahaan Barang Milik Negara (BMN)
              </span>
              <div>
                <label className="block text-[11px] text-ink-soft mb-0.5">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={namaPetugasBmn}
                  onChange={(e) => setNamaPetugasBmn(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-cyan-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-ink-soft mb-0.5">Nomor Induk Pegawai (NIP)</label>
                <input
                  type="text"
                  required
                  value={nipPetugasBmn}
                  onChange={(e) => setNipPetugasBmn(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Pejabat Penandatangan</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Tambah Master Barang Persediaan Baru */}
      <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Boxes className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-ink">Tambah Master Barang Persediaan Baru</h3>
            <p className="text-[11px] text-ink-soft">
              Registrasi kode dan nama barang ATK/persediaan ke database aplikasi
            </p>
          </div>
        </div>

        <form onSubmit={handleAddMasterPersediaan} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-ink-soft mb-0.5">Kode Barang SAKTI</label>
              <input
                type="text"
                required
                placeholder="1.01.03.01.015"
                value={newKodeBarang}
                onChange={(e) => setNewKodeBarang(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] text-ink-soft mb-0.5">Nama Barang Persediaan</label>
              <input
                type="text"
                required
                placeholder="Contoh: Flashdisk Sandisk 64GB USB 3.0"
                value={newNamaBarang}
                onChange={(e) => setNewNamaBarang(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink"
              />
            </div>

            <div>
              <label className="block text-[11px] text-ink-soft mb-0.5">Kategori</label>
              <select
                value={newKategori}
                onChange={(e) => setNewKategori(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink"
              >
                <option value="ATK">ATK</option>
                <option value="Tinta & Toner">Tinta & Toner</option>
                <option value="Komputer & Flashdisk">Komputer & Flashdisk</option>
                <option value="Perlengkapan Dinas">Perlengkapan Dinas</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-ink-soft mb-0.5">Satuan</label>
              <input
                type="text"
                required
                value={newSatuan}
                onChange={(e) => setNewSatuan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink"
              />
            </div>

            <div>
              <label className="block text-[11px] text-ink-soft mb-0.5">Stok Awal</label>
              <input
                type="number"
                min="0"
                required
                value={newStok}
                onChange={(e) => setNewStok(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] text-ink-soft mb-0.5">Batas Stok Minimum</label>
              <input
                type="number"
                min="1"
                required
                value={newStokMin}
                onChange={(e) => setNewStokMin(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink"
              />
            </div>

            <div>
              <label className="block text-[11px] text-ink-soft mb-0.5">Harga Satuan (Rp)</label>
              <input
                type="number"
                min="0"
                required
                value={newHargaSatuan}
                onChange={(e) => setNewHargaSatuan(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Daftarkan ke Master Persediaan</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 3: Tambah Master BMN Baru */}
      <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-ink">Registrasi Master BMN Baru</h3>
            <p className="text-[11px] text-ink-soft">
              Registrasi aset tetap BMN lengkap dengan NUP dan nilai perolehan
            </p>
          </div>
        </div>

        <form onSubmit={handleAddMasterBmn} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-ink-soft mb-0.5">Kode Barang BMN</label>
              <input
                type="text"
                required
                placeholder="3.05.01.05.008"
                value={bmnKode}
                onChange={(e) => setBmnKode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-ink-soft mb-0.5">NUP</label>
              <input
                type="text"
                required
                placeholder="00015"
                value={bmnNup}
                onChange={(e) => setBmnNup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink font-mono font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] text-ink-soft mb-0.5">Nama Barang BMN</label>
              <input
                type="text"
                required
                placeholder="Contoh: Meja Rapat Kayu Jati Modular 12 Seat"
                value={bmnNama}
                onChange={(e) => setBmnNama(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink"
              />
            </div>

            <div>
              <label className="block text-[11px] text-ink-soft mb-0.5">Merk / Tipe</label>
              <input
                type="text"
                placeholder="Contoh: Chitose Custom"
                value={bmnMerk}
                onChange={(e) => setBmnMerk(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink"
              />
            </div>

            <div>
              <label className="block text-[11px] text-ink-soft mb-0.5">Tahun Perolehan</label>
              <input
                type="number"
                value={bmnTahun}
                onChange={(e) => setBmnTahun(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] text-ink-soft mb-0.5">Nilai Perolehan (Rp)</label>
              <input
                type="number"
                value={bmnNilai}
                onChange={(e) => setBmnNilai(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-ink-soft mb-0.5">Lokasi Ruang</label>
              <input
                type="text"
                value={bmnLokasi}
                onChange={(e) => setBmnLokasi(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Daftarkan ke SIMAN / SAKTI BMN</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 4: Kelola Akun Pegawai & Keamanan NIP */}
      <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-lg space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Building className="w-4 h-4 text-purple-400" />
          <div>
            <h3 className="text-sm font-bold text-ink">Master Data Ruang Rapat</h3>
            <p className="text-[11px] text-ink-soft">
              Kelola daftar ruang rapat resmi di lingkungan Biro Perencanaan dan Kerja Sama
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map(room => (
            <div key={room.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-xs border border-purple-500/20">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{room.nama}</div>
                  <div className="text-[10px] text-ink-soft">{room.lokasi} • Kapasitas: {room.kapasitas} orang</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm(`Hapus master data ruang ${room.nama}?`)) deleteRoom(room.id);
                }}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-purple-500/20 space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-500" />
            <h4 className="text-xs font-bold text-slate-900">Tambah Ruang Rapat Baru</h4>
          </div>
          
          <form onSubmit={handleAddRoom} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] text-ink-soft">Nama Ruang Rapat</label>
              <input
                type="text"
                required
                value={roomNama}
                onChange={(e) => setRoomNama(e.target.value)}
                placeholder="Contoh: Ruang Rapat Perencanaan Lt. 2"
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] text-ink-soft">Lokasi / Lantai</label>
              <input
                type="text"
                required
                value={roomLokasi}
                onChange={(e) => setRoomLokasi(e.target.value)}
                placeholder="Lantai 2"
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] text-ink-soft">Kapasitas (Orang)</label>
              <input
                type="number"
                required
                value={roomKapasitas}
                onChange={(e) => setRoomKapasitas(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink font-bold"
              />
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="block text-[10px] text-ink-soft">Fasilitas (Pisahkan dengan koma)</label>
              <input
                type="text"
                value={roomFasilitas}
                onChange={(e) => setRoomFasilitas(e.target.value)}
                placeholder="AC, Wi-Fi, Projector, Sound System"
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink"
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                SIMPAN RUANG
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Section 5: Kelola Akun Pegawai & Keamanan NIP */}
      <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-lg space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Users className="w-4 h-4 text-blue-400" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-ink">Kelola Akun Pegawai & Keamanan NIP</h3>
            <p className="text-[11px] text-ink-soft">
              Tambah, edit, atau hapus akses pegawai serta konfigurasi login NIP untuk keamanan
            </p>
          </div>
          {currentUser.role === 'admin' && (
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportUsers}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                IMPORT DARI EXCEL
              </button>
            </div>
          )}
        </div>

        {/* List of existing users */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Daftar Pegawai Terdaftar</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {users.map(u => (
              <div key={u.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                    {u.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{u.name}</div>
                    <div className="text-[10px] text-ink-soft">NIP: {u.nip || '-'} • Role: {u.roleTitle}</div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm(`Hapus akses untuk ${u.name}?`)) deleteUser(u.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add new user form */}
        <div className="p-4 rounded-xl bg-slate-50 border border-blue-500/20 space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900">Tambah Pegawai Baru</h4>
          </div>
          
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] text-ink-soft">Nama Lengkap</label>
              <input
                type="text"
                required
                value={userNama}
                onChange={(e) => setUserNama(e.target.value)}
                placeholder="Nama & Gelar"
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] text-ink-soft">Nomor Induk Pegawai (NIP)</label>
              <div className="relative">
                <UserCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={userNip}
                  onChange={(e) => setUserNip(e.target.value)}
                  placeholder="1990..."
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 pl-7 text-xs text-ink font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] text-ink-soft">NIK (Opsional)</label>
              <input
                type="text"
                value={userNik}
                onChange={(e) => setUserNik(e.target.value)}
                placeholder="3171..."
                maxLength={16}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] text-ink-soft">Role / Hak Akses</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink"
              >
                <option value="pegawai">Pegawai (Pemohon)</option>
                <option value="ka_biro">Kepala Biro Perencanaan dan Kerja Sama</option>
                <option value="ka_bagian">Kepala Bagian Kerja Sama</option>
                <option value="kasubbag_tu">Kasubbag TU (Approver)</option>
                <option value="petugas_gudang">Petugas Gudang</option>
                <option value="petugas_bmn">Petugas BMN</option>
                <option value="verifikator_persediaan">Operator SAKTI (Verifikator)</option>
                <option value="petugas_arsip">Pengelola Arsip & Persuratan</option>
                <option value="admin">Admin Sistem</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] text-ink-soft">Unit Kerja</label>
              <input
                type="text"
                value={userUnit}
                onChange={(e) => setUserUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-ink"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] text-ink-soft">Password Login (Default NIP)</label>
              <p className="text-[9px] text-slate-500 italic mt-0.5">Sistem akan menggunakan NIP sebagai password</p>
            </div>
            
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={isAddingUser}
                className={`px-6 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                  isAddingUser 
                  ? 'bg-slate-700 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                }`}
              >
                {isAddingUser ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    MEMPROSES...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    SIMPAN PEGAWAI BARU
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
