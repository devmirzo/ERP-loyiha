import React from 'react';
import { FileText, Download, Filter, Search } from 'lucide-react';

const Reports = () => {
  const reportsList = [
    { title: 'Oylik sotuv hisoboti', type: 'Sales', date: 'Feb 2026', size: '1.2 MB' },
    { title: 'Xarajatlar tahlili', type: 'Expense', date: 'Jan 2026', size: '850 KB' },
    { title: 'Mijozlar faolligi', type: 'Clients', date: 'Q4 2025', size: '2.1 MB' },
    { title: 'Zaxira qoldiqlari', type: 'Inventory', date: 'Current', size: '450 KB' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-700 mb-2">Hisobotlar</h1>
          <p className="text-gray-400">Kerakli hisobotlarni ko'rish va yuklab olish</p>
        </div>
        
        <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30">
          <PlusCircle size={20} className="hidden" />
          <span>Yangi hisobot yaratish</span>
        </button>
      </div>

      <div className="glass-dark p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Hisobotlarni qidirish..." 
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
          <Filter size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((report, i) => (
          <div key={i} className="glass-dark p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-500/20 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{report.title}</h3>
                <p className="text-sm text-gray-500">{report.type} • {report.date}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs text-gray-600 font-mono">{report.size}</span>
              <button className="p-2 text-gray-400 hover:text-indigo-400 transition-colors">
                <Download size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Internal PlusCircle component since it wasn't imported
const PlusCircle = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export default Reports;
