import React from 'react';
import { BarChart3, TrendingUp, PieChart, Calendar } from 'lucide-react';

const Statistics = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-700 mb-2">Statistika</h1>
        <p className="text-gray-400">Biznesingizning umumiy holati va dinamikasi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-dark p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Sotuvlar o'sishi</h3>
          </div>
          <div className="h-48 flex items-end gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-500/40 rounded-t-lg hover:bg-blue-400 transition-all cursor-help" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-xs text-gray-500">
            <span>Dush</span><span>Sesh</span><span>Chor</span><span>Pay</span><span>Jum</span><span>Shan</span><span>Yak</span>
          </div>
        </div>

        <div className="glass-dark p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Daromad manbalari</h3>
          </div>
          <div className="space-y-4 pt-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Elektronika</span>
                <span className="text-white font-medium">65%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Aksessuarlar</span>
                <span className="text-white font-medium">25%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Boshqa</span>
                <span className="text-white font-medium">10%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-dark p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-500/20 rounded-2xl text-orange-400">
              <PieChart size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Xarajatlar taqsimoti</h3>
          </div>
          <div className="h-48 flex items-center justify-center relative">
             <div className="w-32 h-32 rounded-full border-[12px] border-orange-500/20 relative">
                <div className="absolute inset-0 border-[12px] border-orange-500 rounded-full border-t-transparent border-l-transparent" style={{ transform: 'rotate(45deg)' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">72%</span>
                </div>
             </div>
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">Operatsion xarajatlar ulushi</p>
        </div>
      </div>

      <div className="glass-dark p-8 rounded-3xl border border-white/5 text-center">
        <Calendar className="mx-auto text-gray-500 mb-4" size={48} />
        <h3 className="text-xl font-bold text-white">Batafsil tahlil</h3>
        <p className="text-gray-400 mt-2">Ma'lumotlar real vaqt rejimida yangilanmoqda...</p>
      </div>
    </div>
  );
};

export default Statistics;
