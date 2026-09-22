import React from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  Package, 
  ArrowLeftRight, 
  Calendar, 
  Shield, 
  FileText,
  MousePointer2,
  CheckCircle2,
  Info
} from 'lucide-react';

export const PanduanView: React.FC = () => {
  const sections = [
    {
      title: "1. Modul Persediaan (ATK)",
      icon: <Package className="w-5 h-5 text-emerald-500" />,
      steps: [
        {
          sub: "Barang Masuk",
          desc: "Gunakan menu ini untuk menambah stok barang baru. Anda dapat mengunggah foto fisik barang dan dokumen pendukung (BAST/Faktur). Data dapat diunduh dalam format Excel untuk pelaporan."
        },
        {
          sub: "Permintaan Barang",
          desc: "Pegawai dapat mengajukan permintaan barang persediaan. Pilih item dari katalog yang tersedia dan tentukan jumlahnya."
        },
        {
          sub: "Persetujuan & Pengeluaran",
          desc: "Kasubbag TU memverifikasi permintaan. Setelah disetujui, petugas gudang melakukan proses 'Barang Keluar' untuk mengurangi stok secara sistem."
        },
        {
          sub: "Stock Opname",
          desc: "Dilakukan secara berkala untuk mencocokkan jumlah fisik di gudang dengan catatan di aplikasi. Masukkan jumlah temuan fisik untuk penyesuaian otomatis."
        }
      ]
    },
    {
      title: "2. Modul BMN (Aset & Inventaris)",
      icon: <ArrowLeftRight className="w-5 h-5 text-cyan-500" />,
      steps: [
        {
          sub: "Katalog BMN",
          desc: "Daftar seluruh aset milik Biro ROCAN. Petugas BMN dapat menambah, mengedit, atau menghapus data master aset termasuk NUP, Merk, dan Lokasi."
        },
        {
          sub: "Mutasi BMN",
          desc: "Mencatat perpindahan tangan atau lokasi aset. Wajib melampirkan nomor BAST dan dapat mengunggah foto serah terima."
        },
        {
          sub: "Pemeliharaan BMN",
          desc: "Pegawai dapat mengajukan perbaikan jika ada kerusakan alat. Status perbaikan dapat dipantau dari 'Pengajuan' hingga 'Selesai'."
        },
        {
          sub: "Peminjaman Ruang & Alat",
          desc: "Booking ruang rapat atau alat portabel (Kamera, Laptop, Proyektor). Pastikan memeriksa jadwal agar tidak terjadi bentrok penggunaan."
        }
      ]
    },
    {
      title: "3. Modul Administrasi & Persuratan",
      icon: <Calendar className="w-5 h-5 text-purple-500" />,
      steps: [
        {
          sub: "Arsip Surat",
          desc: "Pencatatan surat masuk dan keluar secara digital. Memudahkan pencarian dokumen berdasarkan nomor atau perihal."
        },
        {
          sub: "Monitoring Disposisi",
          desc: "Melacak alur instruksi pimpinan. Memastikan setiap disposisi ditindaklanjuti oleh unit terkait tepat waktu."
        },
        {
          sub: "Jadwal Kegiatan",
          desc: "Kalender agenda Biro. Menampilkan seluruh rapat, kunjungan, dan acara penting untuk sinkronisasi jadwal internal."
        }
      ]
    },
    {
      title: "4. Manajemen Pengguna & Sistem",
      icon: <Shield className="w-5 h-5 text-rose-500" />,
      steps: [
        {
          sub: "Kelola Akun",
          desc: "Admin dapat menambah user baru, mengatur NIP, dan memberikan role (Petugas BMN, Petugas Gudang, Kasubbag, dll)."
        },
        {
          sub: "Master Data Ruang",
          desc: "Pengaturan daftar ruang rapat yang tersedia untuk dipinjam, termasuk kapasitas dan fasilitas."
        }
      ]
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between border-b pb-6 border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" /> Panduan Teknis SI-ROCAN
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Pedoman lengkap penggunaan Sistem Informasi Biro Perencanaan dan Kerjasama</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-xl hover:bg-slate-800 transition-all no-print"
          >
            <FileText className="w-4 h-4" />
            Cetak PDF
          </button>
          <div className="hidden md:block">
            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
              Versi 2.0.0 (Latest)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
          <Info className="w-10 h-10 mb-4 opacity-80" />
          <h2 className="text-xl font-bold mb-2">Tips Cepat</h2>
          <ul className="space-y-3 text-blue-100 text-sm">
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-blue-300" />
              Gunakan fitur <b>Export Excel</b> di setiap modul laporan untuk olah data mandiri.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-blue-300" />
              Pastikan mengunggah <b>Foto Bukti</b> untuk setiap mutasi BMN guna validasi audit.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-blue-300" />
              Cek <b>Kalender Kegiatan</b> sebelum melakukan booking ruang rapat.
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
            <MousePointer2 className="w-5 h-5 text-amber-500" /> Alur Utama Aplikasi
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">1</div>
              <p className="text-sm text-slate-600">Login dengan Akun Pegawai / Admin</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">2</div>
              <p className="text-sm text-slate-600">Pilih Modul di Sidebar Kiri</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">3</div>
              <p className="text-sm text-slate-600">Lakukan Transaksi & Simpan Data</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12 pb-20">
        {sections.map((section) => (
          <div key={section.title} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm">
                {section.icon}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.steps.map((step) => (
                <div key={step.sub} className="group p-5 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 transition-all hover:shadow-md">
                  <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center justify-between">
                    {step.sub}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
