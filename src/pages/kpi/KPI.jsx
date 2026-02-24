import React from 'react';
import { Target, Zap, Award, CheckCircle2 } from 'lucide-react';

const KPI = () => {
  const kpis = [
    { name: 'Sotuv rejasi', progress: 85, color: 'bg-blue-500', target: '100m sum', current: '85m sum' },
    { name: "O'rtacha chek", progress: 42, color: 'bg-purple-500', target: '500k sum', current: '210k sum' },
    { name: 'Mijozlar qaytishi', progress: 60, color: 'bg-emerald-500', target: '75%', current: '60%' },
    { name: 'Xarajatlar limiti', progress: 95, color: 'bg-rose-500', target: '10m sum', current: '9.5m sum' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-700 mb-2">KPI</h1>
        <p className="text-gray-400">Asosiy samaradorlik ko'rsatkichlari (Key Performance Indicators)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass-dark p-8 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 ${kpi.color}/10 rounded-bl-full -z-10`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                 <div className={`p-3 rounded-2xl ${kpi.color}/20 text-white`}>
                   <Target size={24} className={kpi.color.replace('bg-', 'text-')} />
                 </div>
                 <h3 className="text-xl font-bold text-white">{kpi.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white">{kpi.progress}%</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${kpi.color} rounded-full transition-all duration-1000`} style={{ width: `${kpi.progress}%` }}></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <div className="text-gray-500">
                  Hozirgi holat: <span className="text-white font-medium">{kpi.current}</span>
                </div>
                <div className="text-gray-500 text-right">
                  Maqsad: <span className="text-white font-medium">{kpi.target}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5 flex gap-4">
               <div className="flex items-center gap-2 text-xs text-gray-400">
                 <Zap size={14} className="text-yellow-400" />
                 <span>Faol ko'rsatkich</span>
               </div>
               <div className="flex items-center gap-2 text-xs text-gray-400">
                 <Award size={14} className="text-purple-400" />
                 <span>Yaxshi natija</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-dark p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center">
         <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
         <h3 className="text-xl font-bold text-white">Barcha ko'rsatkichlar nazorat ostida</h3>
         <p className="text-gray-400 mt-2 max-w-md">Sizning biznesingiz barqaror rivojlanmoqda. KPI ko'rsatkichlari rejaga muvofiq.</p>
      </div>
    </div>
  );
};

export default KPI;
