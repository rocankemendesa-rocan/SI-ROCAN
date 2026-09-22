import React, { createContext, useContext, useState, useEffect } from 'react';
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
import {
  INITIAL_USERS,
  INITIAL_PEJABAT,
  INITIAL_INVENTORY,
  INITIAL_BARANG_MASUK,
  INITIAL_PERMINTAAN,
  INITIAL_BARANG_KELUAR,
  INITIAL_STOCK_OPNAME,
  INITIAL_BMN,
  INITIAL_MUTASI_BMN,
  INITIAL_PEMELIHARAAN_BMN,
  INITIAL_PEMINJAMAN_RUANG,
  INITIAL_SURAT,
  INITIAL_DISPOSISI,
  INITIAL_KEGIATAN,
  INITIAL_ROOMS,
} from '../data/initialData';

import { firestoreService } from '../lib/firestore';
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AppContextType {
  currentUser: UserProfile;
  isAuthenticated: boolean;
  setCurrentUser: (user: UserProfile) => void;
  users: UserProfile[];
  addUser: (newUser: Omit<UserProfile, 'id'>) => void;
  deleteUser: (id: string) => void;
  loginWithNip: (nip: string, password?: string) => { success: boolean; message: string; user?: UserProfile };
  logout: () => void;
  isSidebarMinimized: boolean;
  setIsSidebarMinimized: (min: boolean) => void;
  pejabat: PejabatPenandatangan;
  updatePejabat: (p: PejabatPenandatangan) => void;

  // Master Data
  rooms: MeetingRoom[];
  addRoom: (room: Omit<MeetingRoom, 'id'>) => void;
  updateRoom: (room: MeetingRoom) => void;
  deleteRoom: (id: string) => void;

  // Persediaan
  inventory: InventoryItem[];
  barangMasuk: BarangMasukItem[];
  permintaanList: PermintaanPersediaan[];
  barangKeluar: BarangKeluarRecord[];
  stockOpnames: StockOpnameRecord[];

  addBarangMasuk: (item: Omit<BarangMasukItem, 'id' | 'createdAt'>) => void;
  addPermintaan: (req: Omit<PermintaanPersediaan, 'id' | 'nomorPermintaan' | 'status'>) => void;
  verifikasiPermintaan: (
    reqId: string,
    action: 'setuju' | 'tolak',
    disetujuiItems?: { kodeBarang: string; jumlahDisetujui: number }[],
    catatan?: string
  ) => void;
  prosesPengeluaranBarang: (permintaanId: string, catatan?: string) => void;
  addStockOpname: (so: Omit<StockOpnameRecord, 'id'>) => void;
  verifikasiSaktiStockOpname: (soId: string) => void;
  setujuiKasubbagStockOpname: (soId: string, catatan?: string) => void;

  // BMN
  bmnList: BmnItem[];
  mutasiBmnList: MutasiBmnRecord[];
  pemeliharaanList: PemeliharaanBmnRecord[];
  peminjamanList: PeminjamanRuangBmnRecord[];

  addInventoryMaster: (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => void;
  addBmnItem: (bmn: Omit<BmnItem, 'id'>) => void;
  addBmnMaster: (bmn: Omit<BmnItem, 'id'>) => void;
  updateBmnItem: (id: string, bmn: Partial<BmnItem>) => void;
  addMutasiBmn: (mutasi: Omit<MutasiBmnRecord, 'id' | 'nomorMutasi' | 'status'>) => void;
  setujuiMutasiBmn: (mutasiId: string, role?: 'petugas_bmn' | 'kasubbag_tu', catatan?: string) => void;
  addPemeliharaan: (mtn: Omit<PemeliharaanBmnRecord, 'id' | 'nomorTiket' | 'status'>) => void;
  verifikasiPemeliharaan: (id: string, action: 'setuju' | 'tolak', catatan?: string) => void;
  updateProsesPemeliharaan: (
    id: string,
    status: 'proses' | 'selesai',
    vendorBengkel?: string,
    estimasiBiaya?: number,
    biayaRealisasi?: number,
    catatanTeknisi?: string
  ) => void;
  updateStatusPemeliharaan: (
    id: string,
    status: 'persetujuan' | 'proses' | 'selesai',
    detail?: { estimasiBiaya?: number; biayaRealisasi?: number; vendorBengkel?: string; catatanTeknisi?: string; tanggalSelesai?: string }
  ) => void;
  addPeminjaman: (pinjam: Omit<PeminjamanRuangBmnRecord, 'id' | 'nomorPeminjaman' | 'status'>) => void;
  verifikasiPeminjaman: (id: string, status: 'disetujui' | 'ditolak', catatan?: string) => void;
  deletePeminjaman: (id: string) => void;
  clearAllPeminjaman: () => void;

  // ROCAN - Disposisi & Jadwal
  suratList: SuratMasuk[];
  disposisiList: Disposisi[];
  kegiatanList: Kegiatan[];
  addSurat: (surat: Omit<SuratMasuk, 'id' | 'tglDiterima'>) => void;
  addDisposisi: (disposisi: Omit<Disposisi, 'id' | 'status'>) => void;
  updateDisposisiStatus: (id: string, status: Disposisi['status'], catatan?: string, dokumen?: string) => void;
  addKegiatan: (kegiatan: Omit<Kegiatan, 'id'>) => void;

  // Global helper
  resetData: () => void;
  resetDataToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'kemendes_bmn_persediaan_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [pejabat, setPejabat] = useState<PejabatPenandatangan>(INITIAL_PEJABAT);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [barangMasuk, setBarangMasuk] = useState<BarangMasukItem[]>([]);
  const [permintaanList, setPermintaanList] = useState<PermintaanPersediaan[]>([]);
  const [barangKeluar, setBarangKeluar] = useState<BarangKeluarRecord[]>([]);
  const [stockOpnames, setStockOpnames] = useState<StockOpnameRecord[]>([]);

  const [bmnList, setBmnList] = useState<BmnItem[]>([]);
  const [mutasiBmnList, setMutasiBmnList] = useState<MutasiBmnRecord[]>([]);
  const [pemeliharaanList, setPemeliharaanList] = useState<PemeliharaanBmnRecord[]>([]);
  const [peminjamanList, setPeminjamanList] = useState<PeminjamanRuangBmnRecord[]>([]);

  // ROCAN - Disposisi & Jadwal
  const [suratList, setSuratList] = useState<SuratMasuk[]>([]);
  const [disposisiList, setDisposisiList] = useState<Disposisi[]>([]);
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Firestore listeners
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    const syncCollection = (path: string, setter: (data: any[]) => void) => {
      const unsub = firestoreService.subscribe(path, (data) => {
        setter(data);
      });
      unsubs.push(unsub);
    };

    syncCollection('users', setUsers);
    syncCollection('inventory', setInventory);
    syncCollection('incoming_goods', setBarangMasuk);
    syncCollection('requests', setPermintaanList);
    syncCollection('outgoing_goods', setBarangKeluar);
    syncCollection('stock_opname', setStockOpnames);
    syncCollection('bmn_assets', setBmnList);
    syncCollection('bmn_mutations', setMutasiBmnList);
    syncCollection('bmn_maintenance', setPemeliharaanList);
    syncCollection('room_bookings', setPeminjamanList);
    syncCollection('letters', setSuratList);
    syncCollection('dispositions', setDisposisiList);
    syncCollection('activities', setKegiatanList);
    syncCollection('rooms', setRooms);

    // Sync pejabat (single doc)
    const unsubPejabat = firestoreService.subscribe('pejabat', (data) => {
      if (data.length > 0) {
        const mainPejabat = data.find(d => d.id === 'main');
        if (mainPejabat) {
          const { id, ...rest } = mainPejabat;
          setPejabat(rest as PejabatPenandatangan);
        }
      }
    });
    unsubs.push(unsubPejabat);

    // Sync initialization status
    const unsubInit = firestoreService.subscribe('metadata', (data) => {
      const initDoc = data.find(d => d.id === 'app_state');
      if (initDoc && initDoc.initialized) {
        setIsInitialized(true);
      }
      setIsLoaded(true);
    });
    unsubs.push(unsubInit);

    return () => unsubs.forEach(unsub => unsub());
  }, []);

  // First time seed (if app is not initialized)
  useEffect(() => {
    if (isLoaded && !isInitialized) {
      const seedData = async () => {
        // Double check if users exist to avoid accidental overwrite
        const currentUsers = await firestoreService.list('users');
        if (currentUsers.length > 0) {
          await firestoreService.set('metadata', 'app_state', { initialized: true });
          setIsInitialized(true);
          return;
        }

        console.log("Initializing master data for the first time...");
        
        // Seed core users
        for (const user of INITIAL_USERS) {
          await firestoreService.set('users', user.id, user);
        }
        // Seed pejabat
        await firestoreService.set('pejabat', 'main', INITIAL_PEJABAT);
        // Seed rooms
        for (const room of INITIAL_ROOMS) {
          await firestoreService.set('rooms', room.id, room);
        }
        
        // Mark as initialized
        await firestoreService.set('metadata', 'app_state', { initialized: true });
        setIsInitialized(true);
      };
      seedData();
    }
  }, [isLoaded, isInitialized]);

  const updatePejabat = async (p: PejabatPenandatangan) => {
    await firestoreService.set('pejabat', 'main', p);
  };

  const addUser = async (newUser: Omit<UserProfile, 'id'>) => {
    const id = `usr-${Date.now()}`;
    await firestoreService.set('users', id, { ...newUser, id });
  };

  const deleteUser = async (id: string) => {
    if (users.length <= 1) return;
    await firestoreService.delete('users', id);
  };

  const loginWithNip = (nip: string, password?: string) => {
    const user = users.find((u) => u.nip === nip);
    if (!user) {
      return { success: false, message: 'NIP tidak terdaftar dalam sistem.' };
    }
    // Check if password matches PIN or NIP
    const isValidPassword = password === user.pin || password === user.nip;
    if (password && !isValidPassword) {
      return { success: false, message: 'Password salah. Gunakan NIP atau PIN Anda.' };
    }
    setCurrentUser(user);
    setIsAuthenticated(true);
    return { success: true, message: 'Login berhasil.', user };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  // --- Modul Persediaan ---
  const addBarangMasuk = async (item: Omit<BarangMasukItem, 'id' | 'createdAt'>) => {
    const newId = `bm-${Date.now()}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newEntry: BarangMasukItem = {
      ...item,
      id: newId,
      createdAt: nowStr,
    };

    await firestoreService.set('incoming_goods', newId, newEntry);

    // Update inventory stock
    const invItem = inventory.find((inv) => inv.kodeBarang === item.kodeBarang);
    if (invItem) {
      await firestoreService.update('inventory', invItem.id, {
        stok: invItem.stok + Number(item.jumlah),
        updatedAt: item.tanggal,
        lokasi: item.lokasi || invItem.lokasi,
      });
    } else {
      const invId = `inv-${Date.now()}`;
      const newItem: InventoryItem = {
        id: invId,
        kodeBarang: item.kodeBarang,
        namaBarang: item.namaBarang,
        kategori: 'Alat Tulis Kantor',
        stok: Number(item.jumlah),
        satuan: item.satuan,
        lokasi: item.lokasi || 'Gudang Lt. 2',
        stokMin: 10,
        hargaSatuan: 50000,
        keterangan: item.catatan || 'Pengadaan barang masuk',
        updatedAt: item.tanggal,
      };
      await firestoreService.set('inventory', invId, newItem);
    }
  };

  const addPermintaan = async (req: Omit<PermintaanPersediaan, 'id' | 'nomorPermintaan' | 'status'>) => {
    const seq = permintaanList.length + 1;
    const nomor = `REQ-ROCAN/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(seq).padStart(3, '0')}`;
    const id = `req-${Date.now()}`;
    const newReq: PermintaanPersediaan = {
      ...req,
      id,
      nomorPermintaan: nomor,
      status: 'menunggu_verifikasi',
      items: req.items.map((it) => ({
        ...it,
        jumlahDisetujui: it.jumlahDiminta,
      })),
    };
    await firestoreService.set('requests', id, newReq);
  };

  const verifikasiPermintaan = async (
    reqId: string,
    action: 'setuju' | 'tolak',
    disetujuiItems?: { kodeBarang: string; jumlahDisetujui: number }[],
    catatan?: string
  ) => {
    const req = permintaanList.find(r => r.id === reqId);
    if (!req) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    if (action === 'tolak') {
      await firestoreService.update('requests', reqId, {
        status: 'ditolak',
        alasanTolak: catatan || 'Permintaan belum dapat dipenuhi saat ini',
        disetujuiOleh: currentUser.name,
        tanggalPersetujuan: nowStr,
      });
      return;
    }

    const updatedItems = req.items.map((it) => {
      const adj = disetujuiItems?.find((d) => d.kodeBarang === it.kodeBarang);
      return {
        ...it,
        jumlahDisetujui: adj !== undefined ? adj.jumlahDisetujui : it.jumlahDiminta,
      };
    });

    await firestoreService.update('requests', reqId, {
      status: 'disetujui',
      items: updatedItems,
      catatanKasubbag: catatan || 'Disetujui oleh Kasubbag Tata Usaha',
      disetujuiOleh: currentUser.name,
      tanggalPersetujuan: nowStr,
    });
  };

  const prosesPengeluaranBarang = async (permintaanId: string, catatan?: string) => {
    const req = permintaanList.find((r) => r.id === permintaanId);
    if (!req) return;

    const seq = barangKeluar.length + 1;
    const nomorBK = `BK/ROCAN/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(seq).padStart(3, '0')}`;
    const nowStr = new Date().toISOString().split('T')[0];

    // Kurangi stok persediaan
    for (const matchingItem of req.items) {
      if (matchingItem.jumlahDisetujui > 0) {
        const inv = inventory.find(i => i.kodeBarang === matchingItem.kodeBarang);
        if (inv) {
          await firestoreService.update('inventory', inv.id, {
            stok: Math.max(0, inv.stok - matchingItem.jumlahDisetujui),
            updatedAt: nowStr
          });
        }
      }
    }

    // Buat record barang keluar
    const bkId = `bk-${Date.now()}`;
    const bkRecord: BarangKeluarRecord = {
      id: bkId,
      nomorPengeluaran: nomorBK,
      nomorPermintaan: req.nomorPermintaan,
      permintaanId: req.id,
      tanggal: nowStr,
      namaPenerima: req.namaPemohon,
      unitKerja: req.unitKerja,
      items: req.items.filter((i) => i.jumlahDisetujui > 0),
      petugasGudang: currentUser.role === 'petugas_gudang' ? currentUser.name : pejabat.namaPetugasGudang,
      verifikatorSakti: pejabat.namaVerifikatorSakti,
      catatan: catatan || 'Barang telah diserahkan sesuai permohonan disetujui',
      dokumenTandaTerima: `TTR-${Date.now().toString().slice(-6)}`,
    };

    await firestoreService.set('outgoing_goods', bkId, bkRecord);

    await firestoreService.update('requests', permintaanId, {
      status: 'selesai_diserahkan',
      tanggalPenyerahan: nowStr,
      petugasPenyerah: currentUser.name,
    });
  };

  const addStockOpname = async (so: Omit<StockOpnameRecord, 'id'>) => {
    const newId = `so-${so.tahun}-${so.periodeBulan.toLowerCase()}-${Date.now()}`;
    await firestoreService.set('stock_opname', newId, { ...so, id: newId });
  };

  const verifikasiSaktiStockOpname = async (soId: string) => {
    await firestoreService.update('stock_opname', soId, {
      status: 'diverifikasi_sakti',
      verifikatorSakti: currentUser.name,
    });
  };

  const setujuiKasubbagStockOpname = async (soId: string, catatan?: string) => {
    await firestoreService.update('stock_opname', soId, {
      status: 'disetujui_kasubbag',
      kasubbagTu: currentUser.name,
      catatan: catatan || '',
    });
  };

  // --- Modul BMN ---
  const addInventoryMaster = async (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => {
    const newId = `inv-${Date.now()}`;
    const nowStr = new Date().toISOString().split('T')[0];
    await firestoreService.set('inventory', newId, { ...item, id: newId, updatedAt: nowStr });
  };

  const addBmnItem = async (bmn: Omit<BmnItem, 'id'>) => {
    const newId = `bmn-${Date.now()}`;
    await firestoreService.set('bmn_assets', newId, { ...bmn, id: newId });
  };

  const updateBmnItem = async (id: string, bmn: Partial<BmnItem>) => {
    await firestoreService.update('bmn_assets', id, bmn);
  };

  const addMutasiBmn = async (mutasi: Omit<MutasiBmnRecord, 'id' | 'nomorMutasi' | 'status'>) => {
    const seq = mutasiBmnList.length + 1;
    const nomor = `MUT-BMN/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(seq).padStart(3, '0')}`;
    const id = `mut-${Date.now()}`;
    await firestoreService.set('bmn_mutations', id, {
      ...mutasi,
      id,
      nomorMutasi: nomor,
      status: 'menunggu_persetujuan',
      disetujuiPetugasBmn: currentUser.role === 'petugas_bmn' ? currentUser.name : undefined,
    });
  };

  const setujuiMutasiBmn = async (mutasiId: string, role?: 'petugas_bmn' | 'kasubbag_tu', catatan?: string) => {
    const mut = mutasiBmnList.find(m => m.id === mutasiId);
    if (!mut) return;

    const effectiveRole = role || (currentUser.role === 'petugas_bmn' ? 'petugas_bmn' : 'kasubbag_tu');
    const update: any = {};
    if (effectiveRole === 'petugas_bmn') {
      update.disetujuiPetugasBmn = currentUser.name;
    } else if (effectiveRole === 'kasubbag_tu' || currentUser.role === 'admin') {
      update.disetujuiKasubbagTu = currentUser.name;
    }
    if (catatan) update.catatan = catatan;

    const willBeApproved = update.disetujuiKasubbagTu || (mut.disetujuiPetugasBmn && update.disetujuiKasubbagTu);
    if (willBeApproved) {
      update.status = 'disetujui';
      // Update BMN asset
      const asset = bmnList.find(b => b.id === mut.bmnId || (b.kodeBarang === mut.kodeBarang && b.nup === mut.nup));
      if (asset) {
        await firestoreService.update('bmn_assets', asset.id, {
          lokasiRuang: mut.keLokasi || asset.lokasiRuang,
          pemegangBarang: mut.kePemegang || asset.pemegangBarang,
          kondisi: mut.kondisi || asset.kondisi,
        });
      }
    }
    await firestoreService.update('bmn_mutations', mutasiId, update);
  };

  const addPemeliharaan = async (mtn: Omit<PemeliharaanBmnRecord, 'id' | 'nomorTiket' | 'status'>) => {
    const seq = pemeliharaanList.length + 1;
    const nomor = `MTN-BMN/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(seq).padStart(3, '0')}`;
    const id = `mtn-${Date.now()}`;
    await firestoreService.set('bmn_maintenance', id, { ...mtn, id, nomorTiket: nomor, status: 'pengajuan' });
  };

  const verifikasiPemeliharaan = async (id: string, action: 'setuju' | 'tolak', catatan?: string) => {
    await firestoreService.update('bmn_maintenance', id, {
      status: action === 'setuju' ? 'persetujuan' : 'ditolak',
      disetujuiKasubbag: action === 'setuju',
      catatanTeknisi: catatan || '',
    });
  };

  const updateStatusPemeliharaan = async (
    id: string,
    status: 'persetujuan' | 'proses' | 'selesai',
    detail?: any
  ) => {
    const mtn = pemeliharaanList.find(m => m.id === id);
    if (!mtn) return;

    const update: any = { status, ...detail };
    if (status === 'persetujuan') {
      update.disetujuiKasubbag = true;
      update.disetujuiPetugasBmn = true;
    }
    if (status === 'selesai' && mtn.bmnId) {
      await firestoreService.update('bmn_assets', mtn.bmnId, { kondisi: 'Baik', statusPenggunaan: 'Digunakan Sendiri' });
    }
    await firestoreService.update('bmn_maintenance', id, update);
  };

  const updateProsesPemeliharaan = async (
    id: string,
    status: 'proses' | 'selesai',
    vendorBengkel?: string,
    estimasiBiaya?: number,
    biayaRealisasi?: number,
    catatanTeknisi?: string
  ) => {
    await updateStatusPemeliharaan(id, status, {
      vendorBengkel,
      estimasiBiaya,
      biayaRealisasi,
      catatanTeknisi,
      tanggalSelesai: status === 'selesai' ? new Date().toISOString().split('T')[0] : undefined,
    });
  };

  const addPeminjaman = async (pinjam: Omit<PeminjamanRuangBmnRecord, 'id' | 'nomorPeminjaman' | 'status'>) => {
    const seq = peminjamanList.length + 1;
    const nomor = `PINJAM/ROCAN/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(seq).padStart(3, '0')}`;
    const id = `pinjam-${Date.now()}`;
    await firestoreService.set('room_bookings', id, { ...pinjam, id, nomorPeminjaman: nomor, status: 'menunggu' });
  };

  const verifikasiPeminjaman = async (id: string, status: 'disetujui' | 'ditolak', catatan?: string) => {
    await firestoreService.update('room_bookings', id, {
      status,
      disetujuiOleh: currentUser.name,
      catatan: catatan || '',
    });
  };

  const deletePeminjaman = async (id: string) => {
    await firestoreService.delete('room_bookings', id);
  };

  const clearAllPeminjaman = async () => {
    // Delete all documents in room_bookings collection
    for (const p of peminjamanList) {
      await firestoreService.delete('room_bookings', p.id);
    }
  };

  // --- Modul ROCAN (Disposisi & Jadwal) ---
  const addSurat = async (surat: Omit<SuratMasuk, 'id' | 'tglDiterima'>) => {
    const newId = `srt-${Date.now()}`;
    const tglDiterima = new Date().toISOString().split('T')[0];
    await firestoreService.set('letters', newId, { ...surat, id: newId, tglDiterima });
  };

  const addDisposisi = async (disposisi: Omit<Disposisi, 'id' | 'status'>) => {
    const newId = `disp-${Date.now()}`;
    await firestoreService.set('dispositions', newId, { ...disposisi, id: newId, status: 'belum_dibaca' });
  };

  const updateDisposisiStatus = async (id: string, status: Disposisi['status'], catatan?: string, dokumen?: string) => {
    const update: any = { status };
    if (catatan !== undefined) update.catatanTindakLanjut = catatan;
    if (dokumen !== undefined) update.dokumenTindakLanjut = dokumen;
    await firestoreService.update('dispositions', id, update);
  };

  const addKegiatan = async (kegiatan: Omit<Kegiatan, 'id'>) => {
    const newId = `keg-${Date.now()}`;
    await firestoreService.set('activities', newId, { ...kegiatan, id: newId });
  };

  const addRoom = async (room: Omit<MeetingRoom, 'id'>) => {
    const id = `room-${Date.now()}`;
    await firestoreService.set('rooms', id, { ...room, id });
  };

  const updateRoom = async (room: MeetingRoom) => {
    await firestoreService.set('rooms', room.id, room);
  };

  const deleteRoom = async (id: string) => {
    await firestoreService.delete('rooms', id);
  };

  const resetData = async () => {
    // We don't want to delete the whole cloud DB easily, but we can reset local view
    // Or we could implement a full cloud clear if needed.
    // For now, let's just clear some collections if the user insists.
    console.warn('Reset data called - this is now a cloud database.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        setCurrentUser,
        users,
        addUser,
        deleteUser,
        loginWithNip,
        logout,
        isSidebarMinimized,
        setIsSidebarMinimized,
        pejabat,
        updatePejabat,
        rooms,
        addRoom,
        updateRoom,
        deleteRoom,
        inventory,
        barangMasuk,
        permintaanList,
        barangKeluar,
        stockOpnames,
        addBarangMasuk,
        addPermintaan,
        verifikasiPermintaan,
        prosesPengeluaranBarang,
        addStockOpname,
        verifikasiSaktiStockOpname,
        setujuiKasubbagStockOpname,
        bmnList,
        mutasiBmnList,
        pemeliharaanList,
        peminjamanList,
        addInventoryMaster,
        addBmnItem,
        addBmnMaster: addBmnItem,
        updateBmnItem,
        addMutasiBmn,
        setujuiMutasiBmn,
        addPemeliharaan,
        verifikasiPemeliharaan,
        updateProsesPemeliharaan,
        updateStatusPemeliharaan,
        addPeminjaman,
        verifikasiPeminjaman,
        deletePeminjaman,
        clearAllPeminjaman,
        suratList,
        disposisiList,
        kegiatanList,
        addSurat,
        addDisposisi,
        updateDisposisiStatus,
        addKegiatan,
        resetData,
        resetDataToDefault: resetData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
