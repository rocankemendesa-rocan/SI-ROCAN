import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FileSpreadsheet,
  Printer,
  TrendingUp,
  Award,
  Boxes,
  ClipboardList,
  Calendar,
  Users,
  CheckCircle,
  BarChart3,
} from 'lucide-react';
import { ReportType } from '../ReportPrintModal';

interface LaporanPersediaanViewProps {
  onOpenReport: (type: ReportType, start?: string, end?: string, bulan?: string, tahun?: number) => void;
}

export const LaporanPersediaanView: React.FC<LaporanPersediaanViewProps> = ({ onOpenReport }) => {
  const { inventory, stockOpnames, permintaanList, theme } = useApp();

  const [selectedBulan, setSelectedBulan] = useState('Maret');
  const [selectedTahun, setSelectedTahun] = useState(2026);

  // Process Chart Data
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthlyStats: Record<number, number> = {};
    
    // Initialize months
    for (let i = 0; i < 12; i++) monthlyStats[i] = 0;

    permintaanList.forEach(req => {
      if (req.status === 'disetujui' || req.status === 'selesai') {
        const date = new Date(req.tanggalPermintaan);
        if (!isNaN(date.getTime())) {
          const monthIdx = date.getMonth();
          const totalItems = req.items.reduce((sum, item) => sum + (item.jumlahDisetujui || item.jumlahDiminta), 0);
          monthlyStats[monthIdx] += totalItems;
        }
      }
    });

    return months.map((name, index) => ({
      name,
      total: monthlyStats[index],
    }));
  }, [permintaanList]);

  // Stats
  const requestCountsByItem: Record<string, { nama: string; totalQty: number; satuan: string }> = {};
  const requestCountsByUser: Record<string, { unit: string; totalReq: number; itemsCount: number }> =
    {};

  permintaanList.forEach((req) => {
    if (!requestCountsByUser[req.namaPemohon]) {
      requestCountsByUser[req.namaPemohon] = {
        unit: req.unitKerja,
        totalReq: 0,
        itemsCount: 0,
      };
    }
    requestCountsByUser[req.namaPemohon].totalReq += 1;

    req.items.forEach((item) => {
      requestCountsByUser[req.namaPemohon].itemsCount += item.jumlahDisetujui || item.jumlahDiminta;

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
    .sort((a, b) => b.totalQty - a.totalQty);

  const topUsers = Object.entries(requestCountsByUser)
    .map(([nama, data]) => ({ nama, ...data }))
    .sort((a, b) => b.totalReq - a.totalReq);

  const totalNilaiSisa = inventory.reduce((acc, i) => acc + i.stok * i.hargaSatuan, 0);

  const themeClasses = {
    card: theme === 'dark' ? 'bg-[#0c1630] border-[#1b2d56]' : 'bg-white border-slate-200 shadow-sm',
    header: 'text-ink',
    muted: 'text-ink-soft',
    itemCard: theme === 'dark' ? 'bg-[#081126] border-[#182a52]' : 'bg-slate-50 border-slate-100',
    tableHeader: theme === 'dark' ? 'bg-[#081126] border-[#1b2d56]' : 'bg-slate-50 border-slate-100',
    tableRow: theme === 'dark' ? 'hover:bg-[#101e40]' : 'hover:bg-slate-50/80',
    grid: theme === 'dark' ? '#1b2d56' : '#f1f5f9',
    tooltip: theme === 'dark' ? '#0c1630' : '#ffffff',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-ink">
            <FileSpreadsheet className="w-5 h-5 text-cyan-500" />
            Laporan Persediaan Bulanan
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Kompilasi hasil stock opname dan rekapitulasi sisa barang
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-2 border p-1 rounded-xl ${themeClasses.card}`}>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className={`bg-transparent text-xs px-2 py-1 focus:outline-none ${themeClasses.header}`}
            >
              {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'].map(b => (
                <option key={b} value={b} className={theme === 'dark' ? 'bg-[#081126]' : 'bg-white'}>{b}</option>
              ))}
            </select>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(Number(e.target.value))}
              className={`bg-transparent text-xs px-2 py-1 focus:outline-none ${themeClasses.header}`}
            >
              <option value={2026} className={theme === 'dark' ? 'bg-[#081126]' : 'bg-white'}>2026</option>
              <option value={2025} className={theme === 'dark' ? 'bg-[#081126]' : 'bg-white'}>2025</option>
            </select>
          </div>

          <button
            onClick={() => onOpenReport('persediaan_bulanan', undefined, undefined, selectedBulan, selectedTahun)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className={`p-6 rounded-2xl border ${themeClasses.card}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">Tren Penggunaan Barang</h3>
            <p className="text-[10px] text-ink-soft">Volume permintaan barang keluar per bulan (Tahun Berjalan)</p>
          </div>
        </div>
        
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={themeClasses.grid} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#94a3b8'}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#94a3b8'}}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: themeClasses.tooltip, 
                  borderRadius: '12px', 
                  border: `1px solid ${themeClasses.grid}`,
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
                itemStyle={{ color: '#2563eb', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#2563eb" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${themeClasses.card}`}>
          <span className="text-[11px] text-slate-400 font-medium">Nilai Total Sisa Stok</span>
          <div className={`text-xl font-extrabold mt-1 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
            Rp {totalNilaiSisa.toLocaleString('id-ID')}
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${themeClasses.card}`}>
          <span className="text-[11px] text-slate-400 font-medium">Status Stock Opname</span>
          <div className={`text-base font-bold mt-1 flex items-center gap-1.5 ${theme === 'dark' ? 'text-cyan-300' : 'text-blue-600'}`}>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Terverifikasi SAKTI
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${themeClasses.card}`}>
          <span className="text-[11px] text-slate-400 font-medium">Barang Terpopuler</span>
          <div className={`text-sm font-bold mt-1 truncate ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`}>
            {topItems[0]?.nama || '-'}
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${themeClasses.card}`}>
          <span className="text-[11px] text-slate-400 font-medium">Pemohon Teraktif</span>
          <div className={`text-sm font-bold mt-1 truncate ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`}>
            {topUsers[0]?.nama || '-'}
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-xl border p-5 shadow-lg space-y-4 ${themeClasses.card}`}>
          <h3 className={`text-sm font-bold flex items-center gap-2 ${themeClasses.header}`}>
            <TrendingUp className="w-4 h-4 text-amber-500" />
            Barang Paling Banyak Diminta
          </h3>
          <div className="space-y-2.5">
            {topItems.slice(0, 5).map((item, idx) => (
              <div key={item.kode} className={`p-3 rounded-lg border flex items-center justify-between text-xs ${themeClasses.itemCard}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? 'bg-amber-500 text-black' : 'bg-slate-200 text-slate-600'}`}>
                    {idx + 1}
                  </span>
                  <span className={`font-semibold ${themeClasses.header}`}>{item.nama}</span>
                </div>
                <span className={`font-mono font-bold ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`}>
                  {item.totalQty} {item.satuan}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-xl border p-5 shadow-lg space-y-4 ${themeClasses.card}`}>
          <h3 className={`text-sm font-bold flex items-center gap-2 ${themeClasses.header}`}>
            <Users className="w-4 h-4 text-purple-500" />
            Pemohon Teraktif
          </h3>
          <div className="space-y-2.5">
            {topUsers.slice(0, 5).map((user, idx) => (
              <div key={user.nama} className={`p-3 rounded-lg border flex items-center justify-between text-xs ${themeClasses.itemCard}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {idx + 1}
                  </span>
                  <div>
                    <div className={`font-bold ${themeClasses.header}`}>{user.nama}</div>
                    <div className="text-[10px] text-slate-500">{user.unit}</div>
                  </div>
                </div>
                <div className={`font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`}>{user.totalReq} kali</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className={`rounded-xl border p-5 shadow-lg space-y-4 ${themeClasses.card}`}>
        <h3 className={`text-sm font-bold flex items-center gap-2 ${themeClasses.header}`}>
          <Boxes className="w-4 h-4 text-cyan-500" />
          Rekapitulasi Sisa Barang
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b text-[11px] font-semibold text-slate-500 ${themeClasses.tableHeader}`}>
                <th className="py-2.5 px-3">Kode Barang</th>
                <th className="py-2.5 px-3">Nama Barang</th>
                <th className="py-2.5 px-3 text-center">Sisa Stok</th>
                <th className="py-2.5 px-3">Satuan</th>
                <th className="py-2.5 px-3 text-right">Harga</th>
                <th className="py-2.5 px-3 text-right">Total Nilai</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#152447]' : 'divide-slate-50'}`}>
              {inventory.map((item) => (
                <tr key={item.id} className={themeClasses.tableRow}>
                  <td className={`py-2.5 px-3 font-mono text-[11px] ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>{item.kodeBarang}</td>
                  <td className={`py-2.5 px-3 font-semibold ${themeClasses.header}`}>{item.namaBarang}</td>
                  <td className={`py-2.5 px-3 text-center font-bold ${themeClasses.header}`}>{item.stok}</td>
                  <td className="py-2.5 px-3 text-slate-500">{item.satuan}</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">Rp {item.hargaSatuan.toLocaleString('id-ID')}</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Rp {(item.stok * item.hargaSatuan).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
