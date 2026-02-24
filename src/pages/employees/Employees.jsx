import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, TrendingUp, Calendar, Search, ArrowUpRight, User } from 'lucide-react';
import { formatDate } from '../../utils/formatUtils';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchEmployeePerformance();
  }, [dateRange]);

  const fetchEmployeePerformance = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch all profiles (employees)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'blocked');

      if (profilesError) throw profilesError;

      // 2. Fetch sales for the selected date range
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('seller_id, total_amount, created_at')
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`);

      if (salesError) throw salesError;

      // 3. Calculate performance per employee
      const performanceData = profiles.map(profile => {
        const employeeSales = sales.filter(sale => sale.seller_id === profile.id);
        const totalSalesAmount = employeeSales.reduce((sum, sale) => sum + (parseFloat(sale.total_amount) || 0), 0);
        const salesCount = employeeSales.length;

        return {
          ...profile,
          totalSalesAmount,
          salesCount
        };
      });

      // Sort by performance (descending)
      setEmployees(performanceData.sort((a, b) => b.totalSalesAmount - a.totalSalesAmount));
      
    } catch (error) {
      console.error('Xodimlarni yuklashda xatolik:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-700 mb-2">Xodimlar</h1>
          <p className="text-gray-400">Xodimlar ro'yxati va sotuv ko'rsatkichlari</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
          <div className="flex items-center px-3 gap-2">
            <Calendar size={18} className="text-indigo-400" />
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="bg-transparent text-white text-sm outline-none border-none focus:ring-0"
            />
          </div>
          <div className="hidden sm:block text-gray-600 self-center">—</div>
          <div className="flex items-center px-3 gap-2">
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="bg-transparent text-white text-sm outline-none border-none focus:ring-0"
            />
          </div>
        </div>
      </div>

      <div className="glass-dark p-4 rounded-2xl mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
             type="text"
             className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
             placeholder="Xodim ismi yoki roli bo'yicha qidirish..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-20 text-center col-span-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Ma'lumotlar hisoblanmoqda...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-20 text-center glass-dark rounded-3xl text-gray-500 italic">
            Xodimlar topilmadi
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <div key={emp.id} className="glass-dark p-6 rounded-3xl border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col md:flex-row items-center gap-6 group">
              <div className="flex items-center gap-4 flex-1 w-full">
                <div className="shrink-0">
                  {emp.avatar_url ? (
                    <img src={emp.avatar_url} alt={emp.full_name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/10" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400">
                      <User size={32} />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors uppercase">{emp.full_name || 'Ismsiz xodim'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border
                      ${emp.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        emp.role === 'manager' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                    >
                      {emp.role === 'admin' ? 'Direktor' : emp.role === 'manager' ? 'Menejer' : 'Sotuvchi'}
                    </span>
                    <span className="text-xs text-gray-500">{emp.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 px-8 py-4 bg-white/5 rounded-2xl border border-white/5 w-full md:w-auto">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Sotuvlar soni</p>
                  <p className="text-xl font-bold text-white tracking-tight">{emp.salesCount} ta</p>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Umumiy summa</p>
                  <p className="text-xl font-bold text-emerald-400 flex items-center gap-1">
                    <TrendingUp size={16} />
                    {emp.totalSalesAmount.toLocaleString()} sum
                  </p>
                </div>
              </div>

              <div className="hidden lg:block p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={24} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Employees;
