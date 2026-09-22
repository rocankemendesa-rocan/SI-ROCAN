export type UserRole =
  | 'ka_biro'
  | 'ka_bagian'
  | 'kasubbag_tu'
  | 'pegawai'
  | 'petugas_gudang'
  | 'verifikator_persediaan'
  | 'petugas_bmn'
  | 'petugas_arsip'
  | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  nip: string;
  nik?: string; // Nomor Induk Kependudukan (16 digit)
  pin?: string; // PIN / Password akses (default 6 digit atau NIK)
  role: UserRole;
  roleTitle: string;
  unit: string;
  avatarUrl?: string;
  email: string;
}

export interface SuratMasuk {
  id: string;
  nomor: string;
  asal: string;
  perihal: string;
  tglSurat: string;
  tglDiterima: string;
  lampiran?: string;
}

export interface Disposisi {
  id: string;
  suratId: string;
  suratNo: string;
  perihal: string;
  kepada: string; // Nama Pegawai / NIP
  instruksi: string;
  sifat: 'Biasa' | 'Segera' | 'Sangat Segera' | 'Rahasia';
  deadline: string;
  status: 'belum_dibaca' | 'sedang_dikerjakan' | 'selesai';
  dokumenTindakLanjut?: string;
  catatanTindakLanjut?: string;
}

export interface Kegiatan {
  id: string;
  judul: string;
  mulai: string;
  selesai: string;
  lokasi: string;
  deskripsi: string;
}

export interface InventoryItem {
  id: string;
  kodeBarang: string; // e.g. "1.01.03.01.001"
  namaBarang: string;
  kategori: string; // e.g. "ATK", "Kertas & Percetakan", "Toner & Komputer", "Kebersihan"
  stok: number;
  satuan: string; // Rim, Box, Pcs, Buah, Set, Botol
  lokasi: string; // "Gudang Lt. 2 - Rak A1"
  stokMin: number;
  hargaSatuan: number;
  fotoUrl?: string;
  keterangan?: string;
  updatedAt: string;
}

export interface BarangMasukItem {
  id: string;
  nomorDokumen: string; // e.g. "BM/ROCAN/2026/03/001"
  tanggal: string;
  kodeBarang: string;
  namaBarang: string;
  jumlah: number;
  satuan: string;
  lokasi: string;
  tandaTiba: string; // Tanggal / No Surat Jalan / DO
  sumberPengadaan: string; // DIPA ROCAN 2026, Hibah, Transfer Masuk
  fotoUrl?: string;
  dokumenUrl?: string;
  petugasGudang: string;
  verifikatorSakti: string;
  catatan?: string;
  createdAt: string;
}

export interface PermintaanItemDetail {
  kodeBarang: string;
  namaBarang: string;
  jumlahDiminta: number;
  jumlahDisetujui: number;
  satuan: string;
}

export interface PermintaanPersediaan {
  id: string;
  nomorPermintaan: string; // e.g. "REQ-ATK/2026/03/012"
  tanggal: string;
  namaPemohon: string;
  nipPemohon: string;
  unitKerja: string; // e.g. "Bagian Perencanaan", "Bagian Kerja Sama Luar Negeri"
  keperluan: string;
  items: PermintaanItemDetail[];
  status: 'menunggu_verifikasi' | 'disetujui' | 'ditolak' | 'selesai_diserahkan';
  alasanTolak?: string;
  catatanKasubbag?: string;
  disetujuiOleh?: string;
  tanggalPersetujuan?: string;
  tanggalPenyerahan?: string;
  petugasPenyerah?: string;
}

export interface BarangKeluarRecord {
  id: string;
  nomorPengeluaran: string; // e.g. "BK/ROCAN/2026/03/008"
  nomorPermintaan: string;
  permintaanId: string;
  tanggal: string;
  namaPenerima: string;
  unitKerja: string;
  items: PermintaanItemDetail[];
  petugasGudang: string;
  verifikatorSakti: string;
  catatan?: string;
  dokumenTandaTerima?: string;
}

export interface StockOpnameItem {
  kodeBarang: string;
  namaBarang: string;
  satuan: string;
  stokSistem: number;
  stokFisik: number;
  selisih: number; // stokFisik - stokSistem
  keterangan: string;
}

export interface StockOpnameRecord {
  id: string;
  periodeBulan: string; // "Maret"
  tahun: number; // 2026
  tanggalPelaksanaan: string;
  items: StockOpnameItem[];
  status: 'draft' | 'diverifikasi_sakti' | 'disetujui_kasubbag';
  petugasGudang: string;
  verifikatorSakti: string;
  kasubbagTu: string;
  catatan?: string;
}

export type KondisiBmn = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';

export interface BmnItem {
  id: string;
  kodeBarang: string; // e.g. "3.05.02.01.003"
  nup: string; // "00001", "00014"
  namaBarang: string;
  merkType: string;
  kategori?: 'Portabel' | 'Mebel' | 'Elektronik' | 'Kendaraan' | 'Lainnya';
  tahunPerolehan: number;
  nilaiPerolehan: number;
  kondisi: KondisiBmn;
  lokasiRuang: string; // "Ruang Kerja Kepala Biro Lt. 2", "Ruang Rapat Perencanaan"
  pemegangBarang: string; // Nama Pegawai Penanggung Jawab
  nipPemegang: string;
  statusPenggunaan: 'Digunakan Sendiri' | 'Dipinjamkan' | 'Dalam Pemeliharaan' | 'Usul Hapus';
  fotoUrl?: string;
  keterangan?: string;
}

export interface MutasiBmnRecord {
  id: string;
  nomorMutasi: string; // e.g. "MUT-BMN/2026/03/004"
  tanggal: string;
  jenisMutasi: 'Masuk' | 'Keluar' | 'Perpindahan Ruang' | 'Alih Pemegang';
  bmnId: string;
  kodeBarang: string;
  nup: string;
  namaBarang: string;
  jumlah: number;
  dariLokasi: string;
  keLokasi: string;
  dariPemegang: string;
  kePemegang: string;
  kondisi: KondisiBmn;
  nomorBast: string;
  tanggalBast: string;
  fotoUrl?: string;
  dokumenUrl?: string;
  dokumenBastUrl?: string;
  status: 'menunggu_persetujuan' | 'disetujui' | 'ditolak';
  disetujuiPetugasBmn?: string;
  disetujuiKasubbagTu?: string;
  catatan?: string;
}

export interface PemeliharaanBmnRecord {
  id: string;
  nomorTiket: string; // e.g. "MTN-BMN/2026/03/009"
  tanggalPengajuan: string;
  namaPemohon: string;
  nipPemohon: string;
  unitKerja: string;
  bmnId: string;
  namaBarang: string;
  nup: string;
  jumlah: number;
  jenisKerusakan: string;
  status: 'pengajuan' | 'persetujuan' | 'proses' | 'selesai';
  estimasiBiaya?: number;
  biayaRealisasi?: number;
  vendorBengkel?: string;
  tanggalSelesai?: string;
  catatanTeknisi?: string;
  disetujuiKasubbag?: boolean;
  disetujuiPetugasBmn?: boolean;
  fotoKerusakanUrl?: string;
}

export interface PeminjamanRuangBmnRecord {
  id: string;
  nomorPeminjaman: string;
  tanggalPengajuan?: string;
  namaPemohon: string;
  nipPemohon: string;
  unitKerja: string;
  jenis?: 'Ruang Rapat' | 'BMN Portabel' | 'Keduanya';
  namaRuang?: string;
  namaRuangan?: string;
  bmnPortabel?: string[]; // e.g. ["LCD Projector Epson NUP 002", "Pointer Wireless", "Mic Portable"]
  agenda?: string;
  keperluan?: string;
  tanggalMulai?: string;
  tanggalPeminjaman?: string;
  jamMulai?: string;
  waktuMulai?: string;
  tanggalSelesai?: string;
  jamSelesai?: string;
  waktuSelesai?: string;
  jumlahPeserta: number;
  fasilitasPendukung?: string[]; // ["Zoom Meeting", "Sound System", "Konsumsi", "Papan Tulis"]
  status: 'menunggu' | 'menunggu_persetujuan' | 'disetujui' | 'ditolak' | 'selesai';
  disetujuiOleh?: string;
  catatan?: string;
  catatanBmn?: string;
}

export interface PejabatPenandatangan {
  jabatanKasubbagTu: string;
  namaKasubbagTu: string;
  nipKasubbagTu: string;
  jabatanPetugasGudang: string;
  namaPetugasGudang: string;
  nipPetugasGudang: string;
  jabatanVerifikatorSakti: string;
  namaVerifikatorSakti: string;
  nipVerifikatorSakti: string;
  jabatanPetugasBmn: string;
  namaPetugasBmn: string;
  nipPetugasBmn: string;
  jabatanKepalaBiro: string;
  namaKepalaBiro: string;
  nipKepalaBiro: string;
}

export interface MeetingRoom {
  id: string;
  nama: string;
  lokasi: string;
  kapasitas: number;
  fasilitas: string[];
  fotoUrl?: string;
}

export type MutasiBmn = MutasiBmnRecord;
export type PemeliharaanBmn = PemeliharaanBmnRecord;
export type PeminjamanRuang = PeminjamanRuangBmnRecord;

