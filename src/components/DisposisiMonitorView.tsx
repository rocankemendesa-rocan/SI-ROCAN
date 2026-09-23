import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateLong } from '../utils';
import { 
  ClipboardList, 
  Clock, 
  Plus, 
  X, 
  Send,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Download
} from 'lucide-react';
import { Disposisi } from '../types';

const KanbanCard: React.FC<{ 
  disposisi: Disposisi; 
  onUpdateStatus: (id: string, status: Disposisi['status']) => void;
  onTindakLanjut: (id: string) => void;
}> = ({ disposisi, onUpdateStatus, onTindakLanjut }) => {
  const { theme } = useApp();
  const sifatColors = {
    'Biasa': theme === 'dark' ? 'bg-slate-500/20 text-slate-400 border-slate-500/20' : 'bg-slate-50 text-slate-600 border-slate-200',
    'Segera': theme === 'dark' ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200',
    'Sangat Segera': theme === 'dark' ? 'bg-rose-500/20 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-200',
    'Rahasia': theme === 'dark' ? 'bg-purple-500/20 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-700 border-purple-200'
  };

  return (
    <div className={`rounded-xl p-4 space-y-3 shadow-lg border transition-all ${theme === 'dark' ? 'bg-[#0e1b3d] border-[#1b2d56]' : 'bg-white border-slate-200 hover:shadow-xl'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sifatColors[disposisi.sifat]}`}>{disposisi.sifat}</span>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Clock className="w-3 h-3" />
          <span>{formatDateLong(disposisi.deadline)}</span>
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-bold line-clamp-2 leading-relaxed text-ink">{disposisi.perihal}</h4>
        <p className={`text-[10px] font-medium ${theme === 'dark' ? 'text-blue-300/60' : 'text-blue-600'}`}>{disposisi.suratNo}</p>
      </div>
      <div className={`p-2.5 rounded-lg border text-[11px] italic ${theme === 'dark' ? 'bg-[#070e22] border-[#1b2d56] text-ink-soft' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>"{disposisi.instruksi}"</div>
      <div className="pt-3 border-t flex items-center justify-between gap-2 border-slate-50">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">{disposisi.kepada[0]}</div>
          <span className="text-[10px] font-medium truncate text-ink-soft">{disposisi.kepada}</span>
        </div>
        <div className="flex items-center gap-1">
          {disposisi.status !== 'selesai' && (
            <>
              {disposisi.status === 'belum_dibaca' && (
                <button onClick={() => onUpdateStatus(disposisi.id, 'sedang_dikerjakan')} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg"><Send className="w-4 h-4" /></button>
              )}
              <button onClick={() => onTindakLanjut(disposisi.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"><CheckCircle2 className="w-4 h-4" /></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const KanbanColumn: React.FC<{ title: string; count: number; color: string; children: React.ReactNode }> = ({ title, count, color, children }) => {
  const { theme } = useApp();
  return (
    <div className={`border rounded-2xl p-4 flex flex-col h-[700px] shadow-xl ${theme === 'dark' ? 'bg-[#0c1630] border-[#1b2d56]' : 'bg-slate-50/50 border-slate-200'}`}>
      <div className={`flex items-center justify-between pb-3 border-b mb-4 ${theme === 'dark' ? 'border-[#1b2d56]' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
          <h3 className="text-sm font-bold uppercase text-ink">{title}</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#1b2d56] text-ink-soft border border-ink-faint">{count}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">{children}</div>
    </div>
  );
};

const DisposisiMonitorView: React.FC = () => {
  const { disposisiList, suratList, users, addDisposisi, updateDisposisiStatus, currentUser, theme } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTindakLanjutModalOpen, setIsTindakLanjutModalOpen] = useState(false);
  const [selectedDisposisiId, setSelectedDisposisiId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ suratId: '', kepada: '', instruksi: '', sifat: 'Biasa' as Disposisi['sifat'], deadline: '' });
  const [tindakLanjutData, setTindakLanjutData] = useState({ catatan: '', dokumen: '' });

  const filteredDisposisi = React.useMemo(() => {
    return currentUser.role === 'staf' || currentUser.role === 'pegawai'
      ? disposisiList.filter(d => (d.kepada || '').toLowerCase().includes((currentUser.name || '').toLowerCase().split(',')[0]))
      : disposisiList;
  }, [disposisiList, currentUser]);

  const colBelum = React.useMemo(() => filteredDisposisi.filter(d => d.status === 'belum_dibaca'), [filteredDisposisi]);
  const colProses = React.useMemo(() => filteredDisposisi.filter(d => d.status === 'sedang_dikerjakan'), [filteredDisposisi]);
  const colSelesai = React.useMemo(() => filteredDisposisi.filter(d => d.status === 'selesai'), [filteredDisposisi]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const surat = suratList.find(s => s.id === formData.suratId);
    if (!surat) return;
    addDisposisi({ 
      suratId: surat.id, 
      suratNo: surat.nomor, 
      perihal: surat.perihal, 
      kepada: formData.kepada, 
      instruksi: formData.instruksi, 
      sifat: formData.sifat, 
      deadline: (formData.deadline || '').replace('T', ' ') 
    });
    setIsModalOpen(false);
    setFormData({ suratId: '', kepada: '', instruksi: '', sifat: 'Biasa', deadline: '' });
  };

  const handleTindakLanjut = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDisposisiId) {
      updateDisposisiStatus(selectedDisposisiId, 'selesai', tindakLanjutData.catatan, tindakLanjutData.dokumen || 'laporan.pdf');
      setIsTindakLanjutModalOpen(false);
      setSelectedDisposisiId(null);
      setTindakLanjutData({ catatan: '', dokumen: '' });
    }
  };

  const themeClasses = {
    modal: theme === 'dark' ? 'bg-[#0c1630] border-[#1b2d56]' : 'bg-white border-slate-200',
    header: theme === 'dark' ? 'bg-[#0e1b3d] border-[#1b2d56]' : 'bg-slate-50 border-slate-200',
    input: theme === 'dark' ? 'bg-[#070e22] border-[#1b2d56] text-ink' : 'bg-white border-slate-300 text-ink',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">Pemantauan Status Disposisi</h2>
          <p className="text-sm text-ink-soft">Monitoring instruksi pimpinan</p>
        </div>
        {currentUser.role !== 'staf' && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg">
            <Plus className="w-5 h-5" /> Buat Disposisi
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KanbanColumn title="Belum Dibaca" count={colBelum.length} color="bg-amber-500">
          {colBelum.map(d => <KanbanCard key={d.id} disposisi={d} onUpdateStatus={updateDisposisiStatus} onTindakLanjut={(id) => { setSelectedDisposisiId(id); setIsTindakLanjutModalOpen(true); }} />)}
        </KanbanColumn>
        <KanbanColumn title="Sedang Dikerjakan" count={colProses.length} color="bg-blue-500">
          {colProses.map(d => <KanbanCard key={d.id} disposisi={d} onUpdateStatus={updateDisposisiStatus} onTindakLanjut={(id) => { setSelectedDisposisiId(id); setIsTindakLanjutModalOpen(true); }} />)}
        </KanbanColumn>
        <KanbanColumn title="Selesai" count={colSelesai.length} color="bg-emerald-500">
          {colSelesai.map(d => <KanbanCard key={d.id} disposisi={d} onUpdateStatus={updateDisposisiStatus} onTindakLanjut={(id) => { setSelectedDisposisiId(id); setIsTindakLanjutModalOpen(true); }} />)}
        </KanbanColumn>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className={`relative w-full max-w-lg border rounded-2xl shadow-2xl overflow-hidden ${themeClasses.modal}`}>
            <div className={`p-6 border-b flex items-center justify-between ${themeClasses.header}`}>
              <h3 className="text-lg font-bold text-ink">Buat Disposisi Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-ink-soft hover:text-ink"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink-soft uppercase">Pilih Surat Masuk</label>
                <select required className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${themeClasses.input}`} value={formData.suratId} onChange={(e) => setFormData({ ...formData, suratId: e.target.value })}>
                  <option value="">-- Pilih Surat --</option>
                  {suratList.map(s => <option key={s.id} value={s.id}>[{s.nomor}] {s.perihal.substring(0, 40)}...</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-ink-soft uppercase">Kepada</label>
                  <select required className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${themeClasses.input}`} value={formData.kepada} onChange={(e) => setFormData({ ...formData, kepada: e.target.value })}>
                    <option value="">-- Pilih Staf --</option>
                    {users.filter(u => ['staf', 'pegawai', 'ka_bagian', 'ka_biro'].includes(u.role)).map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-ink-soft uppercase">Sifat</label>
                  <select required className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${themeClasses.input}`} value={formData.sifat} onChange={(e) => setFormData({ ...formData, sifat: e.target.value as Disposisi['sifat'] })}>
                    <option value="Biasa">Biasa</option>
                    <option value="Segera">Segera</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink-soft uppercase">Instruksi</label>
                <textarea required rows={3} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${themeClasses.input}`} placeholder="Tulis instruksi..." value={formData.instruksi} onChange={(e) => setFormData({ ...formData, instruksi: e.target.value })} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 px-4 py-2.5 rounded-xl font-bold ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>Batal</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">Kirim</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTindakLanjutModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div onClick={() => setIsTindakLanjutModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className={`relative w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden ${themeClasses.modal}`}>
            <div className={`p-6 border-b flex items-center justify-between ${themeClasses.header}`}>
              <h3 className="text-lg font-bold text-ink">Selesaikan Tugas</h3>
              <button onClick={() => setIsTindakLanjutModalOpen(false)} className="text-ink-soft hover:text-ink"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleTindakLanjut} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink-soft uppercase">Catatan Hasil</label>
                <textarea required rows={4} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${themeClasses.input}`} placeholder="Uraian singkat..." value={tindakLanjutData.catatan} onChange={(e) => setTindakLanjutData({ ...tindakLanjutData, catatan: e.target.value })} />
              </div>
              <div className={`border p-3 rounded-xl text-[10px] ${theme === 'dark' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400/80' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                <AlertCircle className="w-3 h-3 inline mr-1" /> Mengirim laporan akan mengubah status menjadi <strong>Selesai</strong>.
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsTindakLanjutModalOpen(false)} className={`flex-1 px-4 py-2.5 rounded-xl font-bold ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>Batal</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold">Selesai</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisposisiMonitorView;
