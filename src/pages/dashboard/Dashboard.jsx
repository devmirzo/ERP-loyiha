import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, TrendingDown, DollarSign, Users, Package, AlertTriangle, Calendar, ArrowRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatUtils';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalClients: 0
  });
  
  const [recentSales, setRecentSales] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Execute all queries concurrently for better performance and to prevent one from blocking others entirely
      const [salesRes, expRes, clientsRes, productsRes] = await Promise.all([
        supabase.from('sales').select('total_amount, created_at, clients(name)').order('created_at', { ascending: false }).limit(100),
        supabase.from('expenses').select('amount, category, description, expense_date').order('expense_date', { ascending: false }).limit(100),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id, name, stock').lt('stock', 10).order('stock', { ascending: true }).limit(5)
      ]);
      
      // Process Sales
      if (salesRes.error) console.error('Sales Error:', salesRes.error);
      const sData = salesRes.data || [];
      const totalSalesSum = sData.reduce((acc, sale) => acc + (parseFloat(sale.total_amount) || 0), 0);
      setRecentSales(sData.slice(0, 5));

      // Process Expenses
      if (expRes.error) console.error('Expenses Error:', expRes.error);
      const eData = expRes.data || [];
      const totalExpSum = eData.reduce((acc, exp) => acc + (parseFloat(exp.amount) || 0), 0);
      setRecentExpenses(eData.slice(0, 5));

      // Process Clients Count
      if (clientsRes.error) console.error('Clients Error:', clientsRes.error);
      const clientsCount = clientsRes.count || 0;

      // Process Products
      if (productsRes.error) console.error('Products Error:', productsRes.error);
      setLowStockProducts(productsRes.data || []);

      // Calculate Net Profit
      const profit = totalSalesSum - totalExpSum;

      // Update State
      setStats({
        totalSales: totalSalesSum,
        totalExpenses: totalExpSum,
        netProfit: profit,
        totalClients: clientsCount
      });

    } catch (error) {
      console.error('Bosh sahifa ma\'lumotlarini yuklashda kutilmagan xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Analitika yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-700 mb-2">Bosh sahifa</h1>
        <p className="text-gray-400">Biznesning joriy holati va asosiy ko'rsatkichlar (KPI)</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Sales Card */}
        <div className="glass-dark rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -z-10 group-hover:bg-emerald-500/20 transition-colors"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Umumiy tushum</p>
              <h3 className="text-3xl font-bold text-white">{stats.totalSales.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-2xl">
              <TrendingUp className="text-emerald-400" size={24} />
            </div>
          </div>
          <div className="text-sm font-medium text-emerald-400 flex items-center">
            <span>Barcha sotuvlar yig'indisi</span>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="glass-dark rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full -z-10 group-hover:bg-rose-500/20 transition-colors"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Umumiy xarajat</p>
              <h3 className="text-3xl font-bold text-white">{stats.totalExpenses.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-rose-500/20 rounded-2xl">
              <TrendingDown className="text-rose-400" size={24} />
            </div>
          </div>
          <div className="text-sm font-medium text-rose-400 flex items-center">
            <span>ofis, oylik va boshqalar</span>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="glass-dark rounded-3xl p-6 border border-white/5 relative overflow-hidden group bg-gradient-to-br from-white/5 to-purple-500/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-bl-full -z-10 group-hover:bg-purple-500/30 transition-colors"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Sof foyda (Tushum - Xarajat)</p>
              <h3 className={`text-3xl font-bold ${stats.netProfit >= 0 ? 'text-white' : 'text-rose-400'}`}>
                {stats.netProfit.toLocaleString()}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl ${stats.netProfit >= 0 ? 'bg-purple-500/20' : 'bg-rose-500/20'}`}>
              <DollarSign className={stats.netProfit >= 0 ? 'text-purple-400' : 'text-rose-400'} size={24} />
            </div>
          </div>
          <div className="text-sm font-medium text-purple-300">
            Joriy balans holati
          </div>
        </div>

        {/* Total Clients Card */}
        <div className="glass-dark rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -z-10 group-hover:bg-blue-500/20 transition-colors"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Jami Mijozlar</p>
              <h3 className="text-3xl font-bold text-white">{stats.totalClients} kishi</h3>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-2xl">
              <Users className="text-blue-400" size={24} />
            </div>
          </div>
          <div className="text-sm font-medium text-blue-400">
            Bazada ro'yxatdan o'tganlar
          </div>
        </div>

      </div>

      {/* Main Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Left Column: Recent Activity (Takes up 2/3 of space) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Sales Table */}
          <div className="glass-dark rounded-3xl overflow-hidden border border-white/5">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="text-emerald-400" size={20} />
                So'nggi sotuvlar
              </h3>
              <Link to="/sales" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1">
                Barchasini ko'rish <ArrowRight size={16} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Mijoz</th>
                    <th className="px-6 py-4 font-semibold">Sana</th>
                    <th className="px-6 py-4 font-semibold text-right">Summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentSales.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">Hozircha sotuvlar yo'q</td>
                    </tr>
                  ) : (
                    recentSales.map((sale, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{sale.clients?.name || 'Umumiy xaridor'}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {formatDate(sale.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-400">
                          +{sale.total_amount?.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Expenses Table */}
          <div className="glass-dark rounded-3xl overflow-hidden border border-white/5">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingDown className="text-rose-400" size={20} />
                So'nggi xarajatlar
              </h3>
              <Link to="/expenses" className="text-rose-400 hover:text-rose-300 text-sm font-medium flex items-center gap-1">
                Barchasini ko'rish <ArrowRight size={16} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Tavsif / Toifa</th>
                    <th className="px-6 py-4 font-semibold">Sana</th>
                    <th className="px-6 py-4 font-semibold text-right">Summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentExpenses.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">Hozircha xarajatlar yo'q</td>
                    </tr>
                  ) : (
                    recentExpenses.map((exp, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white line-clamp-1">{exp.description}</div>
                          <div className="text-xs text-gray-500 mt-1">{exp.category}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {formatDate(exp.expense_date)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-rose-400">
                          -{exp.amount?.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Alerts & Status */}
        <div className="space-y-6">
          
          {/* Low Stock Alert Panel */}
          <div className="glass-dark rounded-3xl overflow-hidden border border-rose-500/20 flex flex-col h-full bg-gradient-to-b from-rose-500/5 to-transparent">
            <div className="p-6 border-b border-white/5 flex items-center gap-3">
              <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Zaxira ogohlantirishi</h3>
                <p className="text-xs text-gray-400 mt-1">Soni 10 tadan kam qolgan tovarlar</p>
              </div>
            </div>
            
            <div className="p-6 flex-1">
              {lowStockProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-60">
                  <Package size={48} className="text-emerald-500 mb-4" />
                  <p className="text-emerald-400 font-medium">Barcha mahsulotlar zaxirasi yetarli!</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {lowStockProducts.map(product => (
                    <li key={product.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-rose-500/30 transition-colors">
                      <div className="font-medium text-white max-w-[150px] truncate" title={product.name}>
                        {product.name}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-full">
                          {product.stock} ta qoldi
                        </span>
                        <Link to="/batches" className="text-gray-400 hover:text-white transition-colors" title="Omborga kirim qilish">
                          <ArrowRight size={18} />
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="p-4 border-t border-white/5 text-center">
              <Link to="/products" className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1">
                Barcha mahsulotlarni ko'rish <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
