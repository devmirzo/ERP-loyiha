import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Receipt, ArrowDownRight, Search, X, Trash2, Calendar, User as UserIcon } from 'lucide-react';
import { formatDate } from '../../utils/formatUtils';

const Expenses = () => {
  const { user } = useAuth();
  
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Ijara',
    description: ''
  });

  const categories = [
    'Ijara',
    'Oylik maosh',
    'Soliqlar',
    'Kommunal',
    'Transport',
    'Kanselyariya',
    'Boshqa'
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      // Join with profiles to see who recorded the expense
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          profiles(full_name)
        `)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Xarajatlarni yuklashda xatolik:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = () => {
    setFormData({
      amount: '',
      category: 'Ijara',
      description: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const expenseAmount = parseFloat(formData.amount);
      if (isNaN(expenseAmount) || expenseAmount <= 0) {
        throw new Error('Summani to\'g\'ri kiriting!');
      }

      const expenseData = {
        amount: expenseAmount,
        category: formData.category,
        description: formData.description,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('expenses')
        .insert([expenseData]);
        
      if (error) throw error;
      
      closeModal();
      fetchExpenses();
      
    } catch (error) {
      console.error('Xarajatni saqlashda xatolik:', error.message);
      alert('Xatolik: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Haqiqatan ham bu xarajatni o'chirmoqchimisiz?")) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        fetchExpenses();
      } catch (error) {
        console.error('Xarajatni o\'chirishda xatolik:', error.message);
        alert('O\'chirishda xatolik yuz berdi!');
      }
    }
  };

  const filteredExpenses = expenses.filter(exp => 
    exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-700 mb-2">Xarajatlar</h1>
          <p className="text-gray-400">Biznesning kundalik va oylik chiqimlarini nazorat qilish paneli</p>
        </div>
        
        <button 
          onClick={openModal}
          className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl font-medium transition-all transform active:scale-95 shadow-lg shadow-rose-500/30"
        >
          <ArrowDownRight size={20} />
          <span>Yangi xarajat</span>
        </button>
      </div>

      {/* Controls & Search */}
      <div className="glass-dark p-4 rounded-2xl mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
             type="text"
             className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-all"
             placeholder="Tavsifi yoki toifasi bo'yicha qidirish..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Expenses History Table */}
      <div className="glass-dark rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-300 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Sana</th>
                <th className="p-5 font-semibold">Toifa / Tavsif</th>
                <th className="p-5 font-semibold">Qayd etgan xodim</th>
                <th className="p-5 font-semibold text-right">Summa (Chiqim)</th>
                <th className="p-5 font-semibold text-center">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Yuklanmoqda...</p>
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                 <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400 flex flex-col items-center">
                    <Receipt className="h-12 w-12 text-gray-600 mb-3" />
                    <p>Hozircha hech qanday xarajat qayd etilmagan.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center text-gray-300">
                        <Calendar size={16} className="mr-2 text-rose-400 hidden sm:block" />
                        <span>{formatDate(exp.expense_date)}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-semibold text-white mb-1">{exp.category}</div>
                      <div className="text-sm text-pink-100 line-clamp-2 max-w-xs">{exp.description}</div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center text-gray-400 text-sm">
                        <UserIcon size={14} className="mr-2 opacity-70" />
                        <span>{exp.profiles?.full_name || 'Tizim foydalanuvchisi'}</span>
                      </div>
                    </td>
                    <td className="p-5 text-right flex-col justify-center items-end">
                      <div className="flex items-center justify-end text-rose-400 font-bold text-lg">
                        <ArrowDownRight size={18} className="mr-1" />
                        {exp.amount?.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDelete(exp.id)}
                          className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                          title="Xarajatni bekor qilish"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative glass-dark border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Receipt className="mr-3 text-rose-400" />
                Yangi xarajat
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Chiqim summasi ($) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-rose-400 font-bold text-lg">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    required
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-4 text-white text-xl font-bold focus:ring-2 focus:ring-rose-500 outline-none transition-all placeholder-rose-500/30"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Xarajat toifasi *</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all appearance-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-800">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Batafsil tavsif *</label>
                <textarea
                  name="description"
                  required
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all resize-none"
                  placeholder="Masalan: Yanvar oyi ofis ijarasi uchun 50% to'lov..."
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-5 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 font-medium transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-medium transition-colors shadow-lg shadow-rose-500/30 flex items-center gap-2"
                >
                  <ArrowDownRight size={18} />
                  {submitting ? 'Saqlanmoqda...' : 'Chiqim qilish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
