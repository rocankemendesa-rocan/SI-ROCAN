import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { KemendesLogo } from './KemendesLogo';
import { Printer, X, FileDown, Loader2 } from 'lucide-react';
import { formatDateLong } from '../utils';
import html2pdf from 'html2pdf.js';

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
  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    
    setIsExporting(true);
    const element = printRef.current;
    const title = getReportTitle();
    const fileName = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;

    const opt: any = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Gagal mengekspor PDF. Silakan gunakan fitur Cetak (Print to PDF) sebagai alternatif.');
    } finally {
      setIsExporting(false);
    }
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
                Format standar naskah dinas Kementerian Desa & PDT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>{isExporting ? 'Memproses...' : 'Unduh PDF'}</span>
            </button>
            <button
              id="btn-trigger-print"
              onClick={handlePrint}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak</span>
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
          <style>
            {`
              #print-paper, #print-paper * {
                color-scheme: light !important;
                /* Force standard colors for html2canvas compatibility and avoid oklch errors */
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              /* Explicitly map common Tailwind colors used in the app to HEX/RGB to avoid oklch parse errors in html2canvas */
              #print-paper .text-black, #print-paper { color: #000000 !important; }
              #print-paper .text-white { color: #ffffff !important; }
              #print-paper .text-gray-900 { color: #111827 !important; }
              #print-paper .text-gray-800 { color: #1f2937 !important; }
              #print-paper .text-gray-700 { color: #374151 !important; }
              #print-paper .text-gray-600 { color: #4b5563 !important; }
              #print-paper .text-gray-500 { color: #6b7280 !important; }
              #print-paper .text-gray-400 { color: #9ca3af !important; }
              #print-paper .text-slate-900 { color: #0f172a !important; }
              #print-paper .text-slate-800 { color: #1e293b !important; }
              #print-paper .text-slate-700 { color: #334155 !important; }
              #print-paper .text-slate-600 { color: #475569 !important; }
              #print-paper .text-slate-500 { color: #64748b !important; }
              #print-paper .text-slate-400 { color: #94a3b8 !important; }
              #print-paper .text-blue-900 { color: #1e3a8a !important; }
              #print-paper .text-blue-800 { color: #1e40af !important; }
              #print-paper .text-blue-700 { color: #1d4ed8 !important; }
              #print-paper .text-blue-600 { color: #2563eb !important; }
              #print-paper .text-blue-500 { color: #3b82f6 !important; }
              #print-paper .text-blue-200 { color: #bfdbfe !important; }
              #print-paper .text-emerald-700 { color: #047857 !important; }
              #print-paper .text-emerald-600 { color: #059669 !important; }
              #print-paper .text-emerald-500 { color: #10b981 !important; }
              #print-paper .text-rose-700 { color: #be123c !important; }
              #print-paper .text-rose-600 { color: #e11d48 !important; }
              #print-paper .text-red-700 { color: #b91c1c !important; }
              #print-paper .text-red-600 { color: #dc2626 !important; }
              
              /* Backgrounds */
              #print-paper .bg-white { background-color: #ffffff !important; }
              #print-paper .bg-gray-50 { background-color: #f9fafb !important; }
              #print-paper .bg-gray-100 { background-color: #f3f4f6 !important; }
              #print-paper .bg-slate-50 { background-color: #f8fafc !important; }
              #print-paper .bg-slate-100 { background-color: #f1f5f9 !important; }
              #print-paper .bg-emerald-50 { background-color: #ecfdf5 !important; }
              #print-paper .bg-rose-50 { background-color: #fff1f2 !important; }
              
              /* Borders */
              #print-paper .border-black { border-color: #000000 !important; }
              #print-paper .border-gray-200 { border-color: #e5e7eb !important; }
              #print-paper .border-gray-300 { border-color: #d1d5db !important; }
              #print-paper .border-slate-200 { border-color: #e2e8f0 !important; }
              
              /* Print Layout */
              @media print {
                body { margin: 0; padding: 0; }
                #print-paper { 
                  box-shadow: none !important; 
                  margin: 0 !important;
                  width: 100% !important;
                  max-width: none !important;
                }
              }
            `}
          </style>
          <div
            ref={printRef}
            id="print-paper"
            className="w-full max-w-4xl bg-white text-black p-8 md:p-14 shadow-2xl rounded-sm font-tahoma print:p-0 print:shadow-none print:w-full print:max-w-none text-[11px] leading-relaxed"
          >
            {/* Kop Surat Resmi - Proportional Tahoma Styling */}
            <div className="flex items-center pb-2 min-h-[100px]">
              <div className="w-[100px] flex-shrink-0 flex items-center justify-center">
                <img 
                  src="/logo_official.jpg" 
                  alt="Logo Kemendes" 
                  className="w-[85px] h-auto max-h-[90px] object-contain" 
                />
              </div>
              <div className="flex-1 text-center pr-[100px]">
                <h2 className="text-[14px] font-bold tracking-tight text-black leading-tight uppercase">
                  KEMENTERIAN DESA DAN PEMBANGUNAN DAERAH TERTINGGAL
                </h2>
                <h2 className="text-[14px] font-bold tracking-tight text-black leading-tight uppercase">
                  REPUBLIK INDONESIA
                </h2>
                <h1 className="text-[19px] font-bold uppercase tracking-normal text-black leading-tight mt-1">
                  SEKRETARIAT JENDERAL
                </h1>
                <p className="text-[10px] font-normal text-black leading-normal mt-1.5">
                  Jalan TMP. Kalibata Nomor 17 Jakarta Selatan 12750 Telepon 021 – 7989925
                </p>
                <p className="text-[10px] font-normal text-blue-800 underline leading-normal">
                  www.kemendesa.go.id
                </p>
              </div>
            </div>

            <div className="border-b-[3px] border-black"></div>
            <div className="border-b-[1px] border-black mt-[1.5px] mb-8"></div>

            {/* Judul Laporan */}
            <div className="text-center mb-8">
              <h3 className="text-[13px] font-bold uppercase tracking-wider underline text-black">
                {getReportTitle()}
              </h3>
              {(reportType === 'persediaan_masuk' || reportType === 'persediaan_keluar') && (
                <p className="text-[11px] font-bold text-gray-800 mt-1">
                  Periode: {formatDateLong(startDate)} s.d. {formatDateLong(endDate)}
                </p>
              )}
              {reportType === 'stock_opname' && (
                <p className="text-[11px] font-bold text-gray-800 mt-1">
                  Tanggal Pelaksanaan: {formatDateLong(latestSO.tanggalPelaksanaan)}
                </p>
              )}
            </div>

            {/* Konten Laporan berdasarkan reportType */}
            {reportType === 'persediaan_masuk' && (
              <table className="w-full border-collapse border border-black text-[10.5px] mb-8">
                <thead>
                  <tr className="bg-gray-100 font-bold">
                    <th className="border border-black p-2 text-center w-8">No</th>
                    <th className="border border-black p-2 text-center">No. Dokumen</th>
                    <th className="border border-black p-2 text-center">Tanggal</th>
                    <th className="border border-black p-2 text-center">Kode Barang</th>
                    <th className="border border-black p-2 text-left">Nama Barang</th>
                    <th className="border border-black p-2 text-center">Jumlah</th>
                    <th className="border border-black p-2 text-center">Satuan</th>
                    <th className="border border-black p-2 text-left">Lokasi Simpan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMasuk.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="border border-black p-6 text-center text-gray-500 italic">
                        Tidak ada transaksi barang masuk pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    filteredMasuk.map((bm, idx) => (
                      <tr key={bm.id}>
                        <td className="border border-black p-2 text-center">{idx + 1}</td>
                        <td className="border border-black p-2 text-center font-mono">{bm.nomorDokumen}</td>
                        <td className="border border-black p-2 text-center">{formatDateLong(bm.tanggal)}</td>
                        <td className="border border-black p-2 text-center font-mono">{bm.kodeBarang}</td>
                        <td className="border border-black p-2 font-bold">{bm.namaBarang}</td>
                        <td className="border border-black p-2 text-center font-bold">{bm.jumlah}</td>
                        <td className="border border-black p-2 text-center">{bm.satuan}</td>
                        <td className="border border-black p-2">{bm.lokasi}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {reportType === 'persediaan_keluar' && (
              <table className="w-full border-collapse border border-black text-[10.5px] mb-8">
                <thead>
                  <tr className="bg-gray-100 font-bold">
                    <th className="border border-black p-2 text-center w-8">No</th>
                    <th className="border border-black p-2 text-center">No. Pengeluaran</th>
                    <th className="border border-black p-2 text-center">Tanggal</th>
                    <th className="border border-black p-2 text-left">Nama Pemohon / Penerima</th>
                    <th className="border border-black p-2 text-left">Unit Kerja</th>
                    <th className="border border-black p-2 text-left">Daftar Barang Diserahkan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKeluar.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border border-black p-6 text-center text-gray-500 italic">
                        Tidak ada transaksi barang keluar pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    filteredKeluar.map((bk, idx) => (
                      <tr key={bk.id}>
                        <td className="border border-black p-2 text-center">{idx + 1}</td>
                        <td className="border border-black p-2 text-center font-mono">{bk.nomorPengeluaran}</td>
                        <td className="border border-black p-2 text-center">{formatDateLong(bk.tanggal)}</td>
                        <td className="border border-black p-2 font-bold">{bk.namaPenerima}</td>
                        <td className="border border-black p-2">{bk.unitKerja}</td>
                        <td className="border border-black p-2">
                          <ul className="list-disc pl-4 space-y-0.5">
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
              <div className="space-y-5 mb-8 text-[11px]">
                <p className="leading-relaxed text-black">
                  Pada hari ini, tanggal <strong>{formatDateLong(latestSO.tanggalPelaksanaan)}</strong>, telah dilaksanakan
                  pemeriksaan fisik (Stock Opname) terhadap barang-barang persediaan pada Gudang Biro
                  Perencanaan dan Kerja Sama dengan rincian perbandingan catatan sistem SAKTI dan kondisi fisik
                  sebagai berikut:
                </p>

                <table className="w-full border-collapse border border-black text-[10.5px]">
                  <thead>
                    <tr className="bg-gray-100 font-bold">
                      <th className="border border-black p-2 text-center w-8">No</th>
                      <th className="border border-black p-2 text-center">Kode Barang</th>
                      <th className="border border-black p-2 text-left">Nama Barang</th>
                      <th className="border border-black p-2 text-center">Satuan</th>
                      <th className="border border-black p-2 text-center">Stok Sistem</th>
                      <th className="border border-black p-2 text-center">Stok Fisik</th>
                      <th className="border border-black p-2 text-center">Selisih</th>
                      <th className="border border-black p-2 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestSO.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border border-black p-2 text-center text-black">{idx + 1}</td>
                        <td className="border border-black p-2 text-center font-mono text-black">{item.kodeBarang}</td>
                        <td className="border border-black p-2 font-bold text-black">{item.namaBarang}</td>
                        <td className="border border-black p-2 text-center text-black">{item.satuan}</td>
                        <td className="border border-black p-2 text-center font-semibold text-black">{item.stokSistem}</td>
                        <td className="border border-black p-2 text-center font-semibold text-black">{item.stokFisik}</td>
                        <td className={`border border-black p-2 text-center font-bold ${item.selisih !== 0 ? 'text-red-700' : 'text-gray-800'}`}>
                          {item.selisih > 0 ? `+${item.selisih}` : item.selisih}
                        </td>
                        <td className="border border-black p-2 text-black italic text-[10px]">{item.keterangan || 'Cocok'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'persediaan_bulanan' && (
              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="font-bold text-[11px] uppercase mb-3 text-black">
                    A. Rekapitulasi Mutasi Barang Persediaan
                  </h4>
                  <table className="w-full border-collapse border border-black text-[10px]">
                    <thead>
                      <tr className="bg-gray-100 font-bold">
                        <th className="border border-black p-2 text-center w-8" rowSpan={2}>No</th>
                        <th className="border border-black p-2 text-left" rowSpan={2}>Nama Barang</th>
                        <th className="border border-black p-2 text-center" rowSpan={2}>Satuan</th>
                        <th className="border border-black p-2 text-center" colSpan={4}>Kuantitas</th>
                        <th className="border border-black p-2 text-right" rowSpan={2}>Harga Satuan (Rp)</th>
                        <th className="border border-black p-2 text-right" rowSpan={2}>Nilai Akhir (Rp)</th>
                      </tr>
                      <tr className="bg-gray-100 font-bold">
                        <th className="border border-black p-2 text-center">Awal</th>
                        <th className="border border-black p-2 text-center">Masuk</th>
                        <th className="border border-black p-2 text-center">Keluar</th>
                        <th className="border border-black p-2 text-center">Akhir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((inv, idx) => {
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
                            <td className="border border-black p-2 text-center text-black">{idx + 1}</td>
                            <td className="border border-black p-2 text-black">
                              <div className="font-bold">{inv.namaBarang}</div>
                              <div className="text-[8px] font-mono opacity-60">{inv.kodeBarang}</div>
                            </td>
                            <td className="border border-black p-2 text-center text-black">{inv.satuan}</td>
                            <td className="border border-black p-2 text-center text-black font-medium">{stokAwal}</td>
                            <td className="border border-black p-2 text-center text-emerald-700 font-bold">+{totalMasuk}</td>
                            <td className="border border-black p-2 text-center text-red-700 font-bold">-{totalKeluar}</td>
                            <td className="border border-black p-2 text-center font-bold text-black">{inv.stok}</td>
                            <td className="border border-black p-2 text-right text-black">{inv.hargaSatuan.toLocaleString('id-ID')}</td>
                            <td className="border border-black p-2 text-right font-bold text-black">{(inv.stok * inv.hargaSatuan).toLocaleString('id-ID')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportType === 'bmn_lengkap' && (
              <table className="w-full border-collapse border border-black text-[10.5px] mb-8">
                <thead>
                  <tr className="bg-gray-100 font-bold">
                    <th className="border border-black p-2 text-center w-8">No</th>
                    <th className="border border-black p-2 text-center">Kode Barang</th>
                    <th className="border border-black p-2 text-center">NUP</th>
                    <th className="border border-black p-2 text-left">Nama Barang</th>
                    <th className="border border-black p-2 text-center">Tahun</th>
                    <th className="border border-black p-2 text-center">Kondisi</th>
                    <th className="border border-black p-2 text-right">Nilai Perolehan</th>
                  </tr>
                </thead>
                <tbody>
                  {bmnList.map((bmn, idx) => (
                    <tr key={bmn.id}>
                      <td className="border border-black p-2 text-center text-black">{idx + 1}</td>
                      <td className="border border-black p-2 text-center font-mono text-black">{bmn.kodeBarang}</td>
                      <td className="border border-black p-2 text-center font-mono font-bold text-black">{bmn.nup}</td>
                      <td className="border border-black p-2 text-black">
                        <div className="font-bold">{bmn.namaBarang}</div>
                        <div className="text-[10px] text-gray-600 font-medium">{bmn.merkType}</div>
                      </td>
                      <td className="border border-black p-2 text-center text-black">{bmn.tahunPerolehan}</td>
                      <td className="border border-black p-2 text-center font-bold text-black">{bmn.kondisi}</td>
                      <td className="border border-black p-2 text-right text-black font-bold">Rp {bmn.nilaiPerolehan.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'bmn_mutasi' && (
              <table className="w-full border-collapse border border-black text-[10.5px] mb-8">
                <thead>
                  <tr className="bg-gray-100 font-bold">
                    <th className="border border-black p-2 text-center w-8">No</th>
                    <th className="border border-black p-2 text-center">No. Mutasi</th>
                    <th className="border border-black p-2 text-center">Jenis</th>
                    <th className="border border-black p-2 text-left">Nama Barang (NUP)</th>
                    <th className="border border-black p-2 text-left">Dari</th>
                    <th className="border border-black p-2 text-left">Ke</th>
                  </tr>
                </thead>
                <tbody>
                  {mutasiBmnList.map((mut, idx) => (
                    <tr key={mut.id}>
                      <td className="border border-black p-2 text-center text-black">{idx + 1}</td>
                      <td className="border border-black p-2 text-center font-mono text-black">{mut.nomorMutasi}</td>
                      <td className="border border-black p-2 text-center font-bold text-black">{mut.jenisMutasi}</td>
                      <td className="border border-black p-2 text-black font-bold">{mut.namaBarang} (NUP: {mut.nup})</td>
                      <td className="border border-black p-2 text-black italic">{mut.dariPemegang}</td>
                      <td className="border border-black p-2 text-black font-bold">{mut.kePemegang}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'bmn_pemeliharaan' && (
              <table className="w-full border-collapse border border-black text-[10.5px] mb-8">
                <thead>
                  <tr className="bg-gray-100 font-bold">
                    <th className="border border-black p-2 text-center w-8">No</th>
                    <th className="border border-black p-2 text-center">No. Tiket</th>
                    <th className="border border-black p-2 text-left">Nama Pemohon</th>
                    <th className="border border-black p-2 text-left">Barang BMN</th>
                    <th className="border border-black p-2 text-center">Status</th>
                    <th className="border border-black p-2 text-right">Biaya</th>
                  </tr>
                </thead>
                <tbody>
                  {pemeliharaanList.map((mtn, idx) => (
                    <tr key={mtn.id}>
                      <td className="border border-black p-2 text-center text-black">{idx + 1}</td>
                      <td className="border border-black p-2 text-center font-mono text-black">{mtn.nomorTiket}</td>
                      <td className="border border-black p-2 text-black font-medium">{mtn.namaPemohon}</td>
                      <td className="border border-black p-2 text-black font-bold">{mtn.namaBarang} (NUP: {mtn.nup})</td>
                      <td className="border border-black p-2 text-center font-bold uppercase text-black">{mtn.status}</td>
                      <td className="border border-black p-2 text-right font-bold text-black">
                        {mtn.biayaRealisasi ? `Rp ${mtn.biayaRealisasi.toLocaleString('id-ID')}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Lembar Tanda Tangan - Proportional Tahoma Styling */}
            <div className="mt-12 text-[11px] text-black">
              <div className="text-right mb-6 px-4">
                Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>

              {(reportType === 'persediaan_masuk' || reportType === 'persediaan_keluar') && (
                <div className="grid grid-cols-2 gap-12 text-center pt-4">
                  <div>
                    <p className="font-bold">Petugas Pengelola Gudang,</p>
                    <div className="h-24"></div>
                    <p className="font-bold underline">{pejabat.namaPetugasGudang}</p>
                    <p className="text-[10px] mt-0.5 font-medium text-gray-700">NIP. {pejabat.nipPetugasGudang}</p>
                  </div>
                  <div>
                    <p className="font-bold">Verifikator SAKTI,</p>
                    <div className="h-24"></div>
                    <p className="font-bold underline">{pejabat.namaVerifikatorSakti}</p>
                    <p className="text-[10px] mt-0.5 font-medium text-gray-700">NIP. {pejabat.nipVerifikatorSakti}</p>
                  </div>
                </div>
              )}

              {(reportType === 'stock_opname' || reportType === 'persediaan_bulanan') && (
                <div className="space-y-12 pt-4">
                  <div className="grid grid-cols-2 gap-12 text-center">
                    <div>
                      <p className="font-bold">Petugas Pengelola Gudang,</p>
                      <div className="h-20"></div>
                      <p className="font-bold underline">{pejabat.namaPetugasGudang}</p>
                      <p className="text-[10px] mt-0.5 font-medium text-gray-700">NIP. {pejabat.nipPetugasGudang}</p>
                    </div>
                    <div>
                      <p className="font-bold">Operator SAKTI,</p>
                      <div className="h-20"></div>
                      <p className="font-bold underline">{pejabat.namaVerifikatorSakti}</p>
                      <p className="text-[10px] mt-0.5 font-medium text-gray-700">NIP. {pejabat.nipVerifikatorSakti}</p>
                    </div>
                  </div>
                  <div className="text-center w-full max-w-sm mx-auto pt-4">
                    <p className="font-bold">Mengetahui,</p>
                    <p className="font-bold text-[11px]">Kepala Subbagian Tata Usaha</p>
                    <div className="h-20"></div>
                    <p className="font-bold underline">{pejabat.namaKasubbagTu}</p>
                    <p className="text-[10px] mt-0.5 font-medium text-gray-700">NIP. {pejabat.nipKasubbagTu}</p>
                  </div>
                </div>
              )}

              {(reportType === 'bmn_lengkap' || reportType === 'bmn_mutasi' || reportType === 'bmn_pemeliharaan') && (
                <div className="grid grid-cols-2 gap-12 text-center pt-4">
                  <div>
                    <p className="font-bold">Petugas BMN,</p>
                    <div className="h-24"></div>
                    <p className="font-bold underline">{pejabat.namaPetugasBmn}</p>
                    <p className="text-[10px] mt-0.5 font-medium text-gray-700">NIP. {pejabat.nipPetugasBmn}</p>
                  </div>
                  <div>
                    <p className="font-bold">Kepala Subbagian Tata Usaha,</p>
                    <div className="h-24"></div>
                    <p className="font-bold underline">{pejabat.namaKasubbagTu}</p>
                    <p className="text-[10px] mt-0.5 font-medium text-gray-700">NIP. {pejabat.nipKasubbagTu}</p>
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
