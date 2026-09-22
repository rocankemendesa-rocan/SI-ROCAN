import {
  UserProfile,
  InventoryItem,
  BarangMasukItem,
  PermintaanPersediaan,
  BarangKeluarRecord,
  StockOpnameRecord,
  BmnItem,
  MutasiBmnRecord,
  PemeliharaanBmnRecord,
  PeminjamanRuangBmnRecord,
  PejabatPenandatangan,
  SuratMasuk,
  Disposisi,
  Kegiatan,
  MeetingRoom,
} from '../types';

export const INITIAL_ROOMS: MeetingRoom[] = [
  {
    id: 'room-1',
    nama: 'Ruang Rapat Utama Biro ROCAN Lt. 2',
    lokasi: 'Lantai 2, Sayap Kanan',
    kapasitas: 30,
    fasilitas: ['AC', 'Projector', 'Sound System', 'Wi-Fi', 'Smart TV'],
  },
  {
    id: 'room-2',
    nama: 'Ruang Rapat Pimpinan Biro Lt. 2',
    lokasi: 'Lantai 2, Dekat Ruang Karo',
    kapasitas: 15,
    fasilitas: ['AC', 'Smart TV', 'Wi-Fi', 'Coffee Maker'],
  },
  {
    id: 'room-3',
    nama: 'Ruang Rapat Koordinasi Program Lt. 1',
    lokasi: 'Lantai 1, Samping Lobby',
    kapasitas: 20,
    fasilitas: ['AC', 'Projector', 'Whiteboard', 'Wi-Fi'],
  },
  {
    id: 'room-4',
    nama: 'Ruang Rapat Kerja Sama Luar Negeri Lt. 2',
    lokasi: 'Lantai 2, Bidang Kerja Sama',
    kapasitas: 12,
    fasilitas: ['AC', 'Projector', 'Wi-Fi'],
  },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin',
    name: 'Admin Master ROCAN',
    nip: 'admin',
    nik: '1234567890123456',
    pin: 'rocan2026',
    role: 'admin',
    roleTitle: 'Administrator Utama',
    unit: 'Biro Perencanaan dan Kerja Sama',
    email: 'admin.rocan@kemendesa.go.id',
  },
  {
    id: 'usr-1',
    name: 'Dr. Ir. Sunaryo, M.Eng',
    nip: '197108171997031002',
    nik: '3171071708710001',
    pin: '123456',
    role: 'ka_biro',
    roleTitle: 'Kepala Biro Perencanaan dan Kerja Sama',
    unit: 'Biro Perencanaan dan Kerja Sama',
    email: 'sunaryo@kemendesa.go.id',
  },
  {
    id: 'usr-2',
    name: 'Ir. Ahmad Zulkarnain, M.Sc',
    nip: '197505222001121001',
    nik: '3171052205750002',
    pin: '123456',
    role: 'ka_bagian',
    roleTitle: 'Kepala Bagian Kerja Sama',
    unit: 'Bagian Kerja Sama - Biro Perencanaan',
    email: 'ahmad.zulkarnain@kemendesa.go.id',
  },
  {
    id: 'usr-3',
    name: 'Dra. Hj. Siti Rahmawati, M.Si',
    nip: '197804152002122001',
    nik: '3171015504780001',
    pin: '123456',
    role: 'kasubbag_tu',
    roleTitle: 'Kepala Subbagian Tata Usaha',
    unit: 'Subbagian Tata Usaha - Biro Perencanaan',
    email: 'kasubbag.tu@kemendesa.go.id',
  },
  {
    id: 'usr-4',
    name: 'Rina Wijayanti, S.Sos',
    nip: '199503142020122008',
    nik: '3171055403950005',
    pin: '123456',
    role: 'pegawai',
    roleTitle: 'Analis Kebijakan Ahli Pertama',
    unit: 'Bagian Perencanaan Anggaran & Program',
    email: 'rina.wijayanti@kemendesa.go.id',
  },
  {
    id: 'usr-5',
    name: 'Budi Santoso, S.AP',
    nip: '198807192014031002',
    nik: '3171021907880002',
    pin: '123456',
    role: 'petugas_gudang',
    roleTitle: 'Petugas Pengelola Gudang Persediaan',
    unit: 'Biro Perencanaan dan Kerja Sama',
    email: 'gudang.persediaan@kemendesa.go.id',
  },
  {
    id: 'usr-6',
    name: 'Ahmad Fauzi, S.Kom',
    nip: '199201082018011003',
    nik: '3171030801920003',
    pin: '123456',
    role: 'verifikator_persediaan',
    roleTitle: 'Verifikator Persediaan (Operator SAKTI)',
    unit: 'Biro Perencanaan dan Kerja Sama',
    email: 'verifikator.persediaan@kemendesa.go.id',
  },
  {
    id: 'usr-7',
    name: 'Hendra Pratama, S.E.',
    nip: '198511232010121004',
    nik: '3171042311850004',
    pin: '123456',
    role: 'petugas_bmn',
    roleTitle: 'Pengelola Barang Milik Negara (BMN)',
    unit: 'Biro Perencanaan dan Kerja Sama',
    email: 'petugas.bmn@kemendesa.go.id',
  },
  {
    id: 'usr-8',
    name: 'Siti Aminah, SE',
    nip: '198809142012122003',
    nik: '3171091409880009',
    pin: '123456',
    role: 'petugas_arsip',
    roleTitle: 'Petugas Pengelola Arsip & Persuratan',
    unit: 'Biro Perencanaan dan Kerja Sama',
    email: 'petugas.arsip@kemendesa.go.id',
  },
  {
    id: 'usr-9',
    name: 'Admin Sistem',
    nip: '199002152015021001',
    nik: '3171061502900006',
    pin: '123456',
    role: 'admin',
    roleTitle: 'Administrator Sistem',
    unit: 'IT Support - Biro Perencanaan',
    email: 'admin.kemendesa@gmail.com',
  },
];

export const INITIAL_PEJABAT: PejabatPenandatangan = {
  jabatanKasubbagTu: 'Kepala Subbagian Tata Usaha Biro Perencanaan dan Kerja Sama',
  namaKasubbagTu: 'Dra. Hj. Siti Rahmawati, M.Si',
  nipKasubbagTu: '197804152002122001',

  jabatanPetugasGudang: 'Pengurus / Petugas Gudang Persediaan',
  namaPetugasGudang: 'Budi Santoso, S.AP',
  nipPetugasGudang: '198807192014031002',

  jabatanVerifikatorSakti: 'Verifikator Persediaan (Operator Aplikasi SAKTI)',
  namaVerifikatorSakti: 'Ahmad Fauzi, S.Kom',
  nipVerifikatorSakti: '199201082018011003',

  jabatanPetugasBmn: 'Petugas Penatausahaan BMN',
  namaPetugasBmn: 'Hendra Pratama, S.E.',
  nipPetugasBmn: '198511232010121004',

  jabatanKepalaBiro: 'Kepala Biro Perencanaan dan Kerja Sama',
  namaKepalaBiro: 'Dr. Ir. Sunaryo, M.Eng',
  nipKepalaBiro: '197108171997031002',
};

export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_BARANG_MASUK: BarangMasukItem[] = [];

export const INITIAL_PERMINTAAN: PermintaanPersediaan[] = [];

export const INITIAL_BARANG_KELUAR: BarangKeluarRecord[] = [];

export const INITIAL_STOCK_OPNAME: StockOpnameRecord[] = [];

export const INITIAL_BMN: BmnItem[] = [];

export const INITIAL_MUTASI_BMN: MutasiBmnRecord[] = [];

export const INITIAL_PEMELIHARAAN_BMN: PemeliharaanBmnRecord[] = [];

export const INITIAL_PEMINJAMAN_RUANG: PeminjamanRuangBmnRecord[] = [];

export const INITIAL_SURAT: SuratMasuk[] = [];

export const INITIAL_DISPOSISI: Disposisi[] = [];

export const INITIAL_KEGIATAN: Kegiatan[] = [];
