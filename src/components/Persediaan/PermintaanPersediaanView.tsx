import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PermintaanItemDetail } from '../../types';
import { formatDateLong } from '../../utils';
import {
  ArrowDownLeft,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  FileCheck,
  Search,
  Building,
  User,
  Package,
} from 'lucide-react';

export const PermintaanPersediaanView: React.FC = () => {
  const { inventory, permintaanList, addPermintaan, currentUser, theme } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Form Fields
  const [namaPemohon, setNamaPemohon] = useState(currentUser.name);
  const [nipPemohon, setNipPemohon] = useState(currentUser.nip);
  const [unitKerja, setUnitKerja] = useState(currentUser.unit);
  const [keperluan, setKeperluan] = useState('');

  // Multi-item cart
  const [items, setItems] = useState<PermintaanItemDetail[]>([
    {
      kodeBarang: inventory[0]?.kodeBarang || '1.01.03.01.001',
      namaBarang: inventory[0]?.namaBarang || 'Kertas HVS A4 80 Gram (PaperOne)',
      jumlahDiminta: 2,
      jumlahDisetujui: 2,
      satuan: inventory[0]?.satuan || 'Rim',
    },
  ]);

  const handleAddItemRow = () => {
    const defaultItem = inventory[0];
    setItems((prev) => [
      ...prev,
      {
        kodeBarang: defaultItem?.kodeBarang || '',
        namaBarang: defaultItem?.namaBarang || '',
        jumlahDiminta: 1,
        jumlahDisetujui: 1,
        satuan: defaultItem?.satuan || 'Pcs',
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, kodeBarang: string) => {
    const selected = inventory.find((i) => i.kodeBarang === kodeBarang);
    if (!selected) return;

    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        kodeBarang: selected.kodeBarang,
        namaBarang: selected.namaBarang,
        satuan: selected.satuan,
      };
      return updated;
    });
  };

  const handleQtyChange = (index: number, qty: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        jumlahDiminta: Math.max(1, qty),
        jumlahDisetujui: Math.max(1, qty),
      };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPemohon || !keperluan || items.length === 0) return;

    const nowStr = new Date().toISOString().split('T')[0];

    addPermintaan({
      tanggal: nowStr,
      namaPemohon,
      nipPemohon,
      unitKerja,
      keperluan,
      items: items.map((it) => ({
        ...it,
        jumlahDiminta: Number(it.jumlahDiminta),
        jumlahDisetujui: Number(it.jumlahDiminta),
      })),
    });

    setNotifSuccess(true);
    setTimeout(() => setNotifSuccess(false), 3000);

    // Reset Form
    setKeperluan('');
    setShowForm(false);
  };

  const filteredPermintaan = React.useMemo(() => {
    return permintaanList.filter((req) => {
      const matchesSearch =
        req.nomorPermintaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.namaPemohon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.unitKerja.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.keperluan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.items.some((i) => i.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = filterStatus === 'all' || req.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [permintaanList, searchTerm, filterStatus]);

  const themeClasses = {
    card: theme === 'dark' ? 'bg-[#0c1630] border-[#1b2d56]' : 'bg-white border-slate-200 shadow-sm',
    input: theme === 'dark' ? 'bg-[#091328] border-[#1d3260] text-ink' : 'bg-white border-slate-300 text-ink',
    inputMuted: theme === 'dark' ? 'bg-[#091328] border-[#1d3260] text-ink-soft' : 'bg-slate-50 border-slate-200 text-slate-600',
    text: 'text-ink',
    itemCard: theme === 'dark' ? 'bg-[#0c1833] border-[#1e3466]' : 'bg-white border-slate-100',
    badge: theme === 'dark' ? 'bg-[#122247] text-ink-soft' : 'bg-slate-50 text-slate-600',
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'menunggu_verifikasi':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
            theme === 'dark' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <Clock className="w-3 h-3 text-amber-500" />
            Menunggu Verifikasi
          </span>
        );
      case 'disetujui':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
            theme === 'dark' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            <FileCheck className="w-3 h-3 text-blue-500" />
            Disetujui
          </span>
        );
      case 'selesai_diserahkan':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
            theme === 'dark' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            Selesai
          </span>
        );
      case 'ditolak':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
            theme === 'dark' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            <XCircle className="w-3 h-3 text-rose-500" />
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-ink">
            <ArrowDownLeft className="w-5 h-5 text-amber-500" />
            Permintaan Barang Persediaan
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Pengajuan permintaan ATK & persediaan oleh pegawai Biro Perencanaan dan Kerja Sama
          </p>
        </div>

        <button
          id="btn-buat-permintaan"
          onClick={() => {
            setNamaPemohon(currentUser.name);
            setNipPemohon(currentUser.nip);
            setUnitKerja(currentUser.unit);
            setShowForm(!showForm);
          }}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Tutup Formulir' : 'Ajukan Permintaan Barang'}</span>
        </button>
      </div>

      {notifSuccess && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 animate-fadeIn ${
          theme === 'dark' ? 'bg-blue-950/60 border-blue-500/40 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <CheckCircle className="w-4 h-4 text-cyan-500" />
          <span>
            Permintaan barang berhasil diajukan dan telah masuk ke antrean verifikasi Kasubbag Tata Usaha!
          </span>
        </div>
      )}

      {/* Form Card */}
      {showForm && (
        <div className={`rounded-2xl border p-5 md:p-6 shadow-2xl space-y-4 transition-all ${themeClasses.card}`}>
          <div className={`border-b pb-3 flex items-center justify-between ${theme === 'dark' ? 'border-[#1b2d56]' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-500" />
              <h3 className={`text-sm font-bold ${themeClasses.text}`}>Formulir Pengajuan Permintaan Persediaan</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-cyan-500" />
                  <span>Nama Pemohon</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaPemohon}
                  onChange={(e) => setNamaPemohon(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500 ${themeClasses.input}`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">NIP Pemohon</label>
                <input
                  type="text"
                  value={nipPemohon}
                  onChange={(e) => setNipPemohon(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 ${themeClasses.inputMuted}`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <Building className="w-3 h-3 text-cyan-500" />
                  <span>Unit Kerja / Bagian</span>
                </label>
                <input
                  type="text"
                  required
                  value={unitKerja}
                  onChange={(e) => setUnitKerja(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 ${themeClasses.input}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Keperluan / Peruntukan</label>
              <textarea
                required
                rows={2}
                placeholder="Contoh: Kebutuhan rapat koordinasi"
                value={keperluan}
                onChange={(e) => setKeperluan(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 ${themeClasses.input}`}
              />
            </div>

            <div className={`p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-[#081126] border-[#17274c]' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${themeClasses.text}`}>
                  <Package className="w-3.5 h-3.5 text-blue-500" />
                  Daftar Barang yang Diminta
                </span>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border ${
                    theme === 'dark' ? 'bg-[#13244a] hover:bg-[#1a3266] text-cyan-300 border-[#213b73]' : 'bg-white hover:bg-slate-50 text-blue-600 border-slate-200 shadow-sm'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Barang</span>
                </button>
              </div>

              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div key={`${it.kodeBarang}-${idx}`} className={`p-3 rounded-lg border grid grid-cols-1 md:grid-cols-12 gap-2 items-center ${themeClasses.itemCard}`}>
                    <div className="md:col-span-7">
                      <select
                        value={it.kodeBarang}
                        onChange={(e) => handleItemChange(idx, e.target.value)}
                        className={`w-full border rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${themeClasses.input}`}
                      >
                        {inventory.map((inv) => (
                          <option key={inv.id} value={inv.kodeBarang}>
                            {inv.namaBarang} ({inv.stok} {inv.satuan})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-4">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          value={it.jumlahDiminta}
                          onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                          className={`w-full border rounded-md px-2 py-1 text-xs font-bold focus:outline-none focus:border-cyan-500 ${themeClasses.input}`}
                        />
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${themeClasses.badge}`}>
                          {it.satuan}
                        </span>
                      </div>
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className={`px-4 py-2 rounded-lg text-xs font-medium ${theme === 'dark' ? 'bg-[#122144] hover:bg-[#182c5a] text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              >
                Batal
              </button>
              <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30">
                Kirim Permintaan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border ${themeClasses.card}`}>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'menunggu_verifikasi', 'disetujui', 'selesai_diserahkan', 'ditolak'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : themeClasses.badge
              }`}
            >
              {st === 'all' ? 'Semua' : st === 'menunggu_verifikasi' ? 'Menunggu' : st === 'disetujui' ? 'Disetujui' : st === 'selesai_diserahkan' ? 'Selesai' : 'Ditolak'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
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

      {/* Daftar Permintaan */}
      <div className="space-y-3">
        {filteredPermintaan.length === 0 ? (
          <div className={`p-8 rounded-xl border text-center text-slate-400 text-xs ${themeClasses.card}`}>
            Tidak ada data permintaan barang.
          </div>
        ) : (
          filteredPermintaan.map((req) => (
            <div
              key={req.id}
              className={`p-4 rounded-xl border transition-all space-y-3 shadow-md ${themeClasses.card} hover:border-blue-500/40`}
            >
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5 ${theme === 'dark' ? 'border-[#182a52]' : 'border-slate-50'}`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`font-mono text-xs font-bold ${theme === 'dark' ? 'text-cyan-300' : 'text-blue-700'}`}>
                    {req.nomorPermintaan}
                  </span>
                  <span className="text-xs text-slate-500">{formatDateLong(req.tanggal)}</span>
                  <span className={`text-xs font-semibold ${themeClasses.text}`}>• {req.namaPemohon}</span>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="md:col-span-2 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">Keperluan:</span>
                  <p className={`p-2 rounded-lg border ${theme === 'dark' ? 'text-slate-200 bg-[#081126] border-[#16274c]' : 'text-slate-700 bg-slate-50 border-slate-100'}`}>
                    {req.keperluan}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">Catatan:</span>
                  <p className={`p-2 rounded-lg border italic ${theme === 'dark' ? 'text-slate-300 bg-[#081126] border-[#16274c]' : 'text-slate-600 bg-slate-50 border-slate-100'}`}>
                    {req.catatanKasubbag || req.alasanTolak || '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {req.items.map((it, idx) => (
                  <div key={`${req.id}-${it.kodeBarang}-${idx}`} className={`p-2 rounded-lg border flex items-center justify-between text-xs ${theme === 'dark' ? 'bg-[#081126] border-[#192b52]' : 'bg-white border-slate-100'}`}>
                    <div className="truncate pr-2">
                      <span className={`font-semibold block truncate ${themeClasses.text}`}>{it.namaBarang}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`font-bold ${theme === 'dark' ? 'text-cyan-300' : 'text-blue-700'}`}>
                        {it.jumlahDiminta} {it.satuan}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
