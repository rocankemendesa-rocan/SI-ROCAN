import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { KemendesLogo } from './KemendesLogo';
import { Printer, X } from 'lucide-react';
import { formatDateLong } from '../utils';

export type ReportType =
  | 'persediaan_masuk'
  | 'persediaan_keluar'
  | 'stock_opname'
  | 'persediaan_bulanan'
  | 'bmn_lengkap'
  | 'bmn_mutasi'
  | 'bmn_pemeliharaan';

interface ReportPrintModalProps {
  reportType: ReportType;
  startDate?: string;
  endDate?: string;
  bulan?: string;
  tahun?: number;
  onClose: () => void;
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  reportType,
  startDate = '2026-03-01',
  endDate = '2026-03-31',
  bulan = 'Maret',
  tahun = 2026,
  onClose,
}) => {
  const {
    barangMasuk,
    barangKeluar,
    stockOpnames,
    inventory,
    permintaanList,
    bmnList,
    mutasiBmnList,
    pemeliharaanList,
    pejabat,
  } = useApp();

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'persediaan_masuk':
        return 'LAPORAN BARANG PERSEDIAAN MASUK';
      case 'persediaan_keluar':
        return 'LAPORAN BARANG PERSEDIAAN KELUAR';
      case 'stock_opname':
        return `BERITA ACARA & LAPORAN STOCK OPNAME PERSEDIAAN BULAN ${bulan.toUpperCase()} ${tahun}`;
      case 'persediaan_bulanan':
        return `LAPORAN PERTANGGUNGJAWABAN PERSEDIAAN BULAN ${bulan.toUpperCase()} ${tahun}`;
      case 'bmn_lengkap':
        return `DAFTAR LENGKAP INVENTARIS BARANG MILIK NEGARA (BMN) TAHUN ${tahun}`;
      case 'bmn_mutasi':
        return `DAFTAR MUTASI BARANG MILIK NEGARA (BMN) TAHUN ${tahun}`;
      case 'bmn_pemeliharaan':
        return `DAFTAR REKAPITULASI PEMELIHARAAN BMN TAHUN ${tahun}`;
    }
  };

  // Filtered data based on dates
  const filteredMasuk = barangMasuk.filter(
    (b) => (!startDate || b.tanggal >= startDate) && (!endDate || b.tanggal <= endDate)
  );

  const filteredKeluar = barangKeluar.filter(
    (b) => (!startDate || b.tanggal >= startDate) && (!endDate || b.tanggal <= endDate)
  );

  const latestSO = stockOpnames[0] || {
    periodeBulan: bulan,
    tahun: tahun,
    tanggalPelaksanaan: '2026-03-31',
    items: inventory.map((i) => ({
      kodeBarang: i.kodeBarang,
      namaBarang: i.namaBarang,
      satuan: i.satuan,
      stokSistem: i.stok,
      stokFisik: i.stok,
      selisih: 0,
      keterangan: 'Sesuai fisik',
    })),
  };

  // Stats for persediaan bulanan
  const requestCountsByItem: Record<string, { nama: string; totalQty: number; satuan: string }> = {};
  const requestCountsByUser: Record<string, { unit: string; totalReq: number }> = {};

  permintaanList.forEach((req) => {
    if (!requestCountsByUser[req.namaPemohon]) {
      requestCountsByUser[req.namaPemohon] = { unit: req.unitKerja, totalReq: 0 };
    }
    requestCountsByUser[req.namaPemohon].totalReq += 1;

    req.items.forEach((item) => {
      if (!requestCountsByItem[item.kodeBarang]) {
        requestCountsByItem[item.kodeBarang] = {
          nama: item.namaBarang,
          totalQty: 0,
          satuan: item.satuan,
        };
      }
      requestCountsByItem[item.kodeBarang].totalQty += item.jumlahDisetujui || item.jumlahDiminta;
    });
  });

  const topItems = Object.entries(requestCountsByItem)
    .map(([kode, data]) => ({ kode, ...data }))
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, 5);

  const topUsers = Object.entries(requestCountsByUser)
    .map(([nama, data]) => ({ nama, ...data }))
    .sort((a, b) => b.totalReq - a.totalReq)
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="border rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-colors bg-white border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b transition-colors border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pratinjau Dokumen Cetak Kedinasan</h3>
              <p className="text-[11px] text-slate-400">
                Format standar naskah dinas Kementerian Desa & PDTT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-trigger-print"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Cetak ke PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (White paper simulated) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-900/60 flex justify-center">
          <div
            ref={printRef}
            id="print-paper"
            className="w-full max-w-4xl bg-white text-black p-8 md:p-12 shadow-2xl rounded-sm font-serif print:p-0 print:shadow-none print:w-full print:max-w-none text-xs leading-relaxed"
          >
            {/* Kop Surat Resmi */}
            <div className="flex items-center justify-between border-b-4 border-double border-black pb-3 mb-6">
              <KemendesLogo size={74} />
              <div className="flex-1 text-center px-4">
                <h2 className="text-sm font-bold tracking-wider uppercase font-sans text-black">
                  KEMENTERIAN DESA DAN PEMBANGUNAN DAERAH TERTINGGAL
                </h2>
                <h1 className="text-base font-extrabold uppercase tracking-wide font-sans mt-0.5 text-black">
                  BIRO PERENCANAAN DAN KERJA SAMA
                </h1>
                <p className="text-[10px] font-sans text-gray-700 mt-1">
                  Jalan TMP Kalibata No. 17, Jakarta Selatan 12750 | Telepon: (021) 7989872 | Faksimile: (021) 7989873
                </p>
                <p className="text-[10px] font-sans text-gray-700">
                  Laman: kemendesa.go.id | Pos-el: rocan@kemendesa.go.id
                </p>
              </div>
              <div className="w-[74px]"></div>
            </div>

            {/* Judul Laporan */}
            <div className="text-center mb-6 font-sans">
              <h3 className="text-sm font-bold uppercase tracking-wider underline text-black">
                {getReportTitle()}
              </h3>
              {(reportType === 'persediaan_masuk' || reportType === 'persediaan_keluar') && (
                <p className="text-[11px] text-gray-700 mt-1">
                  Periode: {formatDateLong(startDate)} s.d. {formatDateLong(endDate)}
                </p>
              )}
              {reportType === 'stock_opname' && (
                <p className="text-[11px] text-gray-700 mt-1">
                  Tanggal Pelaksanaan: {formatDateLong(latestSO.tanggalPelaksanaan)}
                </p>
              )}
            </div>

            {/* Konten Laporan berdasarkan reportType */}
            {reportType === 'persediaan_masuk' && (
              <table className="w-full border-collapse border border-black text-[11px] mb-8">
                <thead>
                  <tr className="bg-gray-100 font-bold font-sans">
                    <th className="border border-black p-1.5 text-center w-8">No</th>
                    <th className="border border-black p-1.5 text-center">No. Dokumen</th>
                    <th className="border border-black p-1.5 text-center">Tanggal</th>
                    <th className="border border-black p-1.5 text-center">Kode Barang</th>
                    <th className="border border-black p-1.5 text-left">Nama Barang</th>
                    <th className="border border-black p-1.5 text-center">Jumlah</th>
                    <th className="border border-black p-1.5 text-center">Satuan</th>
                    <th className="border border-black p-1.5 text-left">Lokasi Simpan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMasuk.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="border border-black p-4 text-center text-gray-500">
                        Tidak ada transaksi barang masuk pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    filteredMasuk.map((bm, idx) => (
                      <tr key={bm.id}>
                        <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-black p-1.5 text-center font-mono">{bm.nomorDokumen}</td>
                        <td className="border border-black p-1.5 text-center">{formatDateLong(bm.tanggal)}</td>
                        <td className="border border-black p-1.5 text-center font-mono">{bm.kodeBarang}</td>
                        <td className="border border-black p-1.5 font-sans font-medium">{bm.namaBarang}</td>
                        <td className="border border-black p-1.5 text-center font-bold">{bm.jumlah}</td>
                        <td className="border border-black p-1.5 text-center">{bm.satuan}</td>
                        <td className="border border-black p-1.5">{bm.lokasi}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {reportType === 'persediaan_keluar' && (
              <table className="w-full border-collapse border border-black text-[11px] mb-8">
                <thead>
                  <tr className="bg-gray-100 font-bold font-sans">
                    <th className="border border-black p-1.5 text-center w-8">No</th>
                    <th className="border border-black p-1.5 text-center">No. Pengeluaran</th>
                    <th className="border border-black p-1.5 text-center">Tanggal</th>
                    <th className="border border-black p-1.5 text-left">Nama Pemohon / Penerima</th>
                    <th className="border border-black p-1.5 text-left">Unit Kerja</th>
                    <th className="border border-black p-1.5 text-left">Daftar Barang Diserahkan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKeluar.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border border-black p-4 text-center text-gray-500">
                        Tidak ada transaksi barang keluar pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    filteredKeluar.map((bk, idx) => (
                      <tr key={bk.id}>
                        <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-black p-1.5 text-center font-mono">{bk.nomorPengeluaran}</td>
                        <td className="border border-black p-1.5 text-center">{formatDateLong(bk.tanggal)}</td>
                        <td className="border border-black p-1.5 font-bold font-sans">{bk.namaPenerima}</td>
                        <td className="border border-black p-1.5">{bk.unitKerja}</td>
                        <td className="border border-black p-1.5">
                          <ul className="list-disc pl-4">
                            {bk.items.map((it, i) => (
                              <li key={i}>
                                {it.namaBarang} : <strong>{it.jumlahDisetujui || it.jumlahDiminta}</strong>{' '}
                                {it.satuan}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {reportType === 'stock_opname' && (
              <div className="space-y-4 mb-8">
                <p className="text-[11px] leading-relaxed text-black">
                  Pada hari ini, tanggal <strong>{formatDateLong(latestSO.tanggalPelaksanaan)}</strong>, telah dilaksanakan
                  pemeriksaan fisik (Stock Opname) terhadap barang-barang persediaan pada Gudang Biro
                  Perencanaan dan Kerja Sama dengan rincian perbandingan catatan sistem SAKTI dan kondisi fisik
                  sebagai berikut:
                </p>

                <table className="w-full border-collapse border border-black text-[11px]">
                  <thead>
                    <tr className="bg-gray-100 font-bold font-sans">
                      <th className="border border-black p-1.5 text-center w-8">No</th>
                      <th className="border border-black p-1.5 text-center">Kode Barang</th>
                      <th className="border border-black p-1.5 text-left">Nama Barang</th>
                      <th className="border border-black p-1.5 text-center">Satuan</th>
                      <th className="border border-black p-1.5 text-center">Stok Sistem</th>
                      <th className="border border-black p-1.5 text-center">Stok Fisik</th>
                      <th className="border border-black p-1.5 text-center">Selisih</th>
                      <th className="border border-black p-1.5 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestSO.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border border-black p-1.5 text-center text-black">{idx + 1}</td>
                        <td className="border border-black p-1.5 text-center font-mono text-black">{item.kodeBarang}</td>
                        <td className="border border-black p-1.5 font-sans text-black">{item.namaBarang}</td>
                        <td className="border border-black p-1.5 text-center text-black">{item.satuan}</td>
                        <td className="border border-black p-1.5 text-center font-semibold text-black">{item.stokSistem}</td>
                        <td className="border border-black p-1.5 text-center font-semibold text-black">{item.stokFisik}</td>
                        <td className={`border border-black p-1.5 text-center font-bold ${item.selisih !== 0 ? 'text-red-600' : 'text-gray-800'}`}>
                          {item.selisih > 0 ? `+${item.selisih}` : item.selisih}
                        </td>
                        <td className="border border-black p-1.5 text-black">{item.keterangan || 'Cocok'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'persediaan_bulanan' && (
              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="font-bold font-sans text-xs uppercase mb-2 text-black">
                    A. Rekapitulasi Mutasi Barang Persediaan
                  </h4>
                  <table className="w-full border-collapse border border-black text-[10px]">
                    <thead>
                      <tr className="bg-gray-100 font-bold font-sans">
                        <th className="border border-black p-1 text-center w-8" rowSpan={2}>No</th>
                        <th className="border border-black p-1 text-left" rowSpan={2}>Nama Barang</th>
                        <th className="border border-black p-1 text-center" rowSpan={2}>Satuan</th>
                        <th className="border border-black p-1 text-center" colSpan={4}>Kuantitas</th>
                        <th className="border border-black p-1 text-right" rowSpan={2}>Harga Satuan (Rp)</th>
                        <th className="border border-black p-1 text-right" rowSpan={2}>Nilai Akhir (Rp)</th>
                      </tr>
                      <tr className="bg-gray-100 font-bold font-sans">
                        <th className="border border-black p-1 text-center">Awal</th>
                        <th className="border border-black p-1 text-center">Masuk</th>
                        <th className="border border-black p-1 text-center">Keluar</th>
                        <th className="border border-black p-1 text-center">Akhir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((inv, idx) => {
                        // Calculate stats for this specific item in the period
                        const totalMasuk = filteredMasuk
                          .filter(bm => bm.kodeBarang === inv.kodeBarang)
                          .reduce((sum, current) => sum + current.jumlah, 0);
                        
                        const totalKeluar = filteredKeluar.reduce((sum, bk) => {
                          const itemQty = bk.items
                            .filter(it => it.kodeBarang === inv.kodeBarang)
                            .reduce((s, it) => s + (it.jumlahDisetujui || it.jumlahDiminta), 0);
                          return sum + itemQty;
                        }, 0);

                        const stokAwal = inv.stok - totalMasuk + totalKeluar;

                        return (
                          <tr key={inv.id}>
                            <td className="border border-black p-1 text-center text-black">{idx + 1}</td>
                            <td className="border border-black p-1 font-sans text-black">
                              <div className="font-bold">{inv.namaBarang}</div>
                              <div className="text-[8px] font-mono opacity-60">{inv.kodeBarang}</div>
                            </td>
                            <td className="border border-black p-1 text-center text-black">{inv.satuan}</td>
                            <td className="border border-black p-1 text-center text-black font-medium">{stokAwal}</td>
                            <td className="border border-black p-1 text-center text-emerald-600 font-medium">+{totalMasuk}</td>
                            <td className="border border-black p-1 text-center text-rose-600 font-medium">-{totalKeluar}</td>
                            <td className="border border-black p-1 text-center font-bold text-black">{inv.stok}</td>
                            <td className="border border-black p-1 text-right text-black">{inv.hargaSatuan.toLocaleString('id-ID')}</td>
                            <td className="border border-black p-1 text-right font-bold text-black">{(inv.stok * inv.hargaSatuan).toLocaleString('id-ID')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportType === 'bmn_lengkap' && (
              <table className="w-full border-collapse border border-black text-[11px] mb-8">
                <thead>
                  <tr className="bg-gray-100 font-bold font-sans">
                    <th className="border border-black p-1 text-center w-8">No</th>
                    <th className="border border-black p-1 text-center">Kode Barang</th>
                    <th className="border border-black p-1 text-center">NUP</th>
                    <th className="border border-black p-1 text-left">Nama Barang</th>
                    <th className="border border-black p-1 text-center">Tahun</th>
                    <th className="border border-black p-1 text-center">Kondisi</th>
                    <th className="border border-black p-1 text-right">Nilai Perolehan</th>
                  </tr>
                </thead>
                <tbody>
                  {bmnList.map((bmn, idx) => (
                    <tr key={bmn.id}>
                      <td className="border border-black p-1 text-center text-black">{idx + 1}</td>
                      <td className="border border-black p-1 text-center font-mono text-black">{bmn.kodeBarang}</td>
                      <td className="border border-black p-1 text-center font-mono font-bold text-black">{bmn.nup}</td>
                      <td className="border border-black p-1 font-sans text-black">
                        <div className="font-semibold">{bmn.namaBarang}</div>
                        <div className="text-[10px] text-gray-600">{bmn.merkType}</div>
                      </td>
                      <td className="border border-black p-1 text-center text-black">{bmn.tahunPerolehan}</td>
                      <td className="border border-black p-1 text-center font-medium text-black">{bmn.kondisi}</td>
                      <td className="border border-black p-1 text-right text-black">Rp {bmn.nilaiPerolehan.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'bmn_mutasi' && (
              <table className="w-full border-collapse border border-black text-[11px] mb-8">
                <thead>
                  <tr className="bg-gray-100 font-bold font-sans">
                    <th className="border border-black p-1.5 text-center w-8">No</th>
                    <th className="border border-black p-1.5 text-center">No. Mutasi</th>
                    <th className="border border-black p-1.5 text-center">Jenis</th>
                    <th className="border border-black p-1.5 text-left">Nama Barang (NUP)</th>
                    <th className="border border-black p-1.5 text-left">Dari</th>
                    <th className="border border-black p-1.5 text-left">Ke</th>
                  </tr>
                </thead>
                <tbody>
                  {mutasiBmnList.map((mut, idx) => (
                    <tr key={mut.id}>
                      <td className="border border-black p-1.5 text-center text-black">{idx + 1}</td>
                      <td className="border border-black p-1.5 text-center font-mono text-black">{mut.nomorMutasi}</td>
                      <td className="border border-black p-1.5 text-center font-semibold text-black">{mut.jenisMutasi}</td>
                      <td className="border border-black p-1.5 font-sans text-black">{mut.namaBarang} (NUP: {mut.nup})</td>
                      <td className="border border-black p-1.5 text-black">{mut.dariPemegang}</td>
                      <td className="border border-black p-1.5 text-black font-semibold">{mut.kePemegang}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'bmn_pemeliharaan' && (
              <table className="w-full border-collapse border border-black text-[11px] mb-8">
                <thead>
                  <tr className="bg-gray-100 font-bold font-sans">
                    <th className="border border-black p-1.5 text-center w-8">No</th>
                    <th className="border border-black p-1.5 text-center">No. Tiket</th>
                    <th className="border border-black p-1.5 text-left">Nama Pemohon</th>
                    <th className="border border-black p-1.5 text-left">Barang BMN</th>
                    <th className="border border-black p-1.5 text-center">Status</th>
                    <th className="border border-black p-1.5 text-right">Biaya</th>
                  </tr>
                </thead>
                <tbody>
                  {pemeliharaanList.map((mtn, idx) => (
                    <tr key={mtn.id}>
                      <td className="border border-black p-1.5 text-center text-black">{idx + 1}</td>
                      <td className="border border-black p-1.5 text-center font-mono text-black">{mtn.nomorTiket}</td>
                      <td className="border border-black p-1.5 font-sans text-black">{mtn.namaPemohon}</td>
                      <td className="border border-black p-1.5 text-black">{mtn.namaBarang} (NUP: {mtn.nup})</td>
                      <td className="border border-black p-1.5 text-center font-bold uppercase text-black">{mtn.status}</td>
                      <td className="border border-black p-1.5 text-right font-medium text-black">
                        {mtn.biayaRealisasi ? `Rp ${mtn.biayaRealisasi.toLocaleString('id-ID')}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Lembar Tanda Tangan */}
            <div className="mt-8 font-sans text-xs text-black">
              <div className="text-right mb-4">
                Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>

              {(reportType === 'persediaan_masuk' || reportType === 'persediaan_keluar') && (
                <div className="grid grid-cols-2 gap-8 text-center pt-2">
                  <div>
                    <p className="font-semibold">Petugas Pengelola Gudang,</p>
                    <div className="h-20"></div>
                    <p className="font-bold underline">{pejabat.namaPetugasGudang}</p>
                    <p className="text-[10px]">NIP. {pejabat.nipPetugasGudang}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Verifikator SAKTI,</p>
                    <div className="h-20"></div>
                    <p className="font-bold underline">{pejabat.namaVerifikatorSakti}</p>
                    <p className="text-[10px]">NIP. {pejabat.nipVerifikatorSakti}</p>
                  </div>
                </div>
              )}

              {(reportType === 'stock_opname' || reportType === 'persediaan_bulanan') && (
                <div className="space-y-8 pt-2">
                  <div className="grid grid-cols-2 gap-8 text-center">
                    <div>
                      <p className="font-semibold">Petugas Pengelola Gudang,</p>
                      <div className="h-16"></div>
                      <p className="font-bold underline">{pejabat.namaPetugasGudang}</p>
                      <p className="text-[10px]">NIP. {pejabat.nipPetugasGudang}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Operator SAKTI,</p>
                      <div className="h-16"></div>
                      <p className="font-bold underline">{pejabat.namaVerifikatorSakti}</p>
                      <p className="text-[10px]">NIP. {pejabat.nipVerifikatorSakti}</p>
                    </div>
                  </div>
                  <div className="text-center w-full max-w-xs mx-auto pt-2">
                    <p className="font-semibold">Mengetahui,</p>
                    <p className="font-medium text-[11px]">Kepala Subbagian Tata Usaha</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{pejabat.namaKasubbagTu}</p>
                    <p className="text-[10px]">NIP. {pejabat.nipKasubbagTu}</p>
                  </div>
                </div>
              )}

              {(reportType === 'bmn_lengkap' || reportType === 'bmn_mutasi' || reportType === 'bmn_pemeliharaan') && (
                <div className="grid grid-cols-2 gap-8 text-center pt-2">
                  <div>
                    <p className="font-semibold">Petugas BMN,</p>
                    <div className="h-20"></div>
                    <p className="font-bold underline">{pejabat.namaPetugasBmn}</p>
                    <p className="text-[10px]">NIP. {pejabat.nipPetugasBmn}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Kepala Subbagian Tata Usaha,</p>
                    <div className="h-20"></div>
                    <p className="font-bold underline">{pejabat.namaKasubbagTu}</p>
                    <p className="text-[10px]">NIP. {pejabat.nipKasubbagTu}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
