import React, { useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { Bell, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { PermintaanPersediaan, Disposisi } from '../types';

export const NotificationSystem: React.FC = () => {
  const { 
    currentUser, 
    isAuthenticated, 
    permintaanList, 
    disposisiList,
    peminjamanList,
    mutasiBmnList
  } = useApp();

  const prevPermintaanRef = useRef<PermintaanPersediaan[]>([]);
  const prevDisposisiRef = useRef<Disposisi[]>([]);
  const prevPeminjamanRef = useRef<any[]>([]);
  const prevMutasiRef = useRef<any[]>([]);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    // --- Stock Opname Notification (1st-10th) ---
    const today = new Date();
    const date = today.getDate();
    if (date >= 1 && date <= 10) {
      const hasNotifiedSO = sessionStorage.getItem(`so_notified_${today.getMonth()}_${today.getFullYear()}`);
      if (!hasNotifiedSO) {
        toast('Pengingat: Periode Stock Opname (Tanggal 1-10)', {
          icon: <AlertTriangle className="text-amber-500" size={20} />,
          duration: 6000,
          position: 'top-right',
          style: {
            borderLeft: '4px solid #f59e0b',
            background: '#fffbeb',
            color: '#92400e',
          }
        });
        sessionStorage.setItem(`so_notified_${today.getMonth()}_${today.getFullYear()}`, 'true');
      }
    }

    if (isFirstMount.current) {
      prevPermintaanRef.current = permintaanList;
      prevDisposisiRef.current = disposisiList;
      prevPeminjamanRef.current = peminjamanList;
      prevMutasiRef.current = mutasiBmnList;
      isFirstMount.current = false;
      return;
    }

    // --- Permintaan Persediaan Notifications ---
    permintaanList.forEach(curr => {
      const prev = prevPermintaanRef.current.find(p => p.id === curr.id);
      if (!prev && curr.status === 'menunggu_verifikasi') {
        const isAdminOrOfficer = ['admin', 'kasubbag_tu', 'petugas_gudang', 'verifikator_persediaan'].includes(currentUser.role);
        if (isAdminOrOfficer) {
          toast(`Permintaan Persediaan Baru: ${curr.nomorPermintaan}`, {
            icon: <Bell className="text-blue-500" size={20} />,
          });
        }
      }
      if (prev && prev.status !== curr.status && curr.nipPemohon === currentUser.nip) {
        if (curr.status === 'disetujui') toast.success(`Permintaan Persediaan Disetujui: ${curr.nomorPermintaan}`);
        if (curr.status === 'ditolak') toast.error(`Permintaan Persediaan Ditolak: ${curr.nomorPermintaan}`);
      }
    });

    // --- Peminjaman Ruang & BMN Notifications ---
    peminjamanList.forEach(curr => {
      const prev = prevPeminjamanRef.current.find(p => p.id === curr.id);
      if (!prev && (curr.status === 'menunggu' || curr.status === 'menunggu_persetujuan')) {
        const isAdminOrOfficer = ['admin', 'kasubbag_tu', 'petugas_bmn'].includes(currentUser.role);
        if (isAdminOrOfficer) {
          toast(`Permohonan Peminjaman Baru dari ${curr.namaPemohon}`, {
            icon: <Bell className="text-purple-500" size={20} />,
          });
        }
      }
      if (prev && prev.status !== curr.status && curr.nipPemohon === currentUser.nip) {
        if (curr.status === 'disetujui') toast.success(`Peminjaman Disetujui: ${curr.nomorPeminjaman || 'Permohonan Anda'}`);
        if (curr.status === 'ditolak') toast.error(`Peminjaman Ditolak: ${curr.nomorPeminjaman || 'Permohonan Anda'}`);
      }
    });

    // --- Mutasi BMN Notifications ---
    mutasiBmnList.forEach(curr => {
      const prev = prevMutasiRef.current.find(m => m.id === curr.id);
      if (!prev && curr.status === 'menunggu_persetujuan') {
        const isAdminOrOfficer = ['admin', 'kasubbag_tu', 'petugas_bmn'].includes(currentUser.role);
        if (isAdminOrOfficer) {
          toast(`Usul Mutasi BMN Baru: ${curr.nomorMutasi}`, {
            icon: <Bell className="text-orange-500" size={20} />,
          });
        }
      }
      if (prev && prev.status !== curr.status && (curr.nipPemegang === currentUser.nip || curr.petugasBmn === currentUser.name)) {
        if (curr.status === 'disetujui') toast.success(`Mutasi BMN Disetujui: ${curr.nomorMutasi}`);
        if (curr.status === 'ditolak') toast.error(`Mutasi BMN Ditolak: ${curr.nomorMutasi}`);
      }
    });

    // --- Disposisi Notifications ---
    disposisiList.forEach(curr => {
      const prev = prevDisposisiRef.current.find(d => d.id === curr.id);
      if (!prev && curr.kepada === currentUser.name) {
        toast(`Disposisi Baru: ${curr.suratNo}`, {
          icon: <FileText className="text-indigo-500" size={20} />,
        });
      }
    });

    prevPermintaanRef.current = permintaanList;
    prevDisposisiRef.current = disposisiList;
    prevPeminjamanRef.current = peminjamanList;
    prevMutasiRef.current = mutasiBmnList;
  }, [permintaanList, disposisiList, peminjamanList, mutasiBmnList, currentUser, isAuthenticated]);

  return <Toaster position="top-right" />;
};
