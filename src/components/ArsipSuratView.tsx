import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateLong } from '../utils';
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Building2,
  X,
} from 'lucide-react';

const ArsipSuratView: React.FC = () => {
  const { suratList, addSurat, theme } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nomor: '',
    asal: '',
    perihal: '',
    tglSurat: new Date().toISOString().split('T')[0],
    lampiran: ''
  });

  const filteredSurat = React.useMemo(() => {
    return suratList.filter(s => 
      s.nomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.perihal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.asal.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suratList, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSurat({
      nomor: formData.nomor,
      asal: formData.asal,
      perihal: formData.perihal,
      tglSurat: formData.tglSurat,
      lampiran: formData.lampiran || 'surat_lampiran.pdf'
    });
    setIsModalOpen(false);
    setFormData({
      nomor: '',
      asal: '',
      perihal: '',
      tglSurat: new Date().toISOString().split('T')[0],
      lampiran: ''
    });
  };

  const themeClasses = {
    card: theme === 'dark' ? 'bg-[#0c1630] border-[#1b2d56]' : 'bg-white border-slate-200 shadow-xl',
    input: theme === 'dark' ? 'bg-[#070e22] border-[#1b2d56] text-ink' : 'bg-white border-slate-300 text-ink',
    header: theme === 'dark' ? 'bg-[#0e1b3d] border-[#1b2d56]' : 'bg-slate-50 border-slate-200',
    modal: theme === 'dark' ? 'bg-[#0c1630] border-[#1b2d56]' : 'bg-white border-slate-200 shadow-2xl',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink">Arsip Surat Masuk</h2>
          <p className="text-sm text-ink-soft">Pengelolaan database surat masuk resmi</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Tambah Surat Masuk
        </button>
      </div>

      <div className={`border rounded-2xl overflow-hidden ${themeClasses.card}`}>
        <div className={`p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between ${themeClasses.header}`}>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
            <input
              type="text"
              placeholder="Cari..."
              className={`w-full border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors ${themeClasses.input}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <span>Menampilkan {filteredSurat.length} surat</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider bg-[#f8f9fb] dark:bg-[#0e1b3d] text-ink-soft">
                <th className="px-6 py-4">Informasi Surat</th>
                <th className="px-6 py-4">Asal Instansi</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Lampiran</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#1b2d56]' : 'divide-slate-100'}`}>
              {filteredSurat.map((surat) => (
                <tr key={surat.id} className={`transition-colors group border-b ${theme === 'dark' ? 'border-[#1b2d56] hover:bg-[#122147]' : 'border-slate-100 hover:bg-slate-50/50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-ink">{surat.nomor}</span>
                      <span className="text-xs text-ink-soft line-clamp-1">{surat.perihal}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-ink">
                      <Building2 className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs">{surat.asal}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-xs">
                      <span className="font-medium text-ink">{formatDateLong(surat.tglSurat)}</span>
                      <span className="text-blue-500/70 italic text-[10px]">Diterima: {formatDateLong(surat.tglDiterima)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg border ${theme === 'dark' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className={`relative w-full max-w-lg border rounded-2xl overflow-hidden ${themeClasses.modal}`}>
            <div className={`p-6 border-b flex items-center justify-between ${themeClasses.header}`}>
              <h3 className="text-lg font-bold text-ink">Input Surat Masuk</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-ink-soft hover:text-ink"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input required type="text" className={`w-full border rounded-xl px-4 py-2.5 text-sm ${themeClasses.input}`} placeholder="Nomor Surat" value={formData.nomor} onChange={(e) => setFormData({ ...formData, nomor: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="text" className={`w-full border rounded-xl px-4 py-2.5 text-sm ${themeClasses.input}`} placeholder="Asal Instansi" value={formData.asal} onChange={(e) => setFormData({ ...formData, asal: e.target.value })} />
                <input required type="date" className={`w-full border rounded-xl px-4 py-2.5 text-sm ${themeClasses.input}`} value={formData.tglSurat} onChange={(e) => setFormData({ ...formData, tglSurat: e.target.value })} />
              </div>
              <textarea required rows={3} className={`w-full border rounded-xl px-4 py-2.5 text-sm resize-none ${themeClasses.input}`} placeholder="Perihal..." value={formData.perihal} onChange={(e) => setFormData({ ...formData, perihal: e.target.value })} />
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 px-4 py-2.5 rounded-xl font-bold ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>Batal</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArsipSuratView;
