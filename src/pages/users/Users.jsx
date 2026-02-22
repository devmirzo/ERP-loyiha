import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, Plus, Trash2, Search, X, Mail } from 'lucide-react';
import { formatDate } from '../../utils/formatUtils';

const Users = () => {
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    role: 'seller'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [emailsRes, profilesRes] = await Promise.all([
        supabase.from('allowed_emails').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('updated_at', { ascending: false })
      ]);

      if (emailsRes.error) throw emailsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setAllowedEmails(emailsRes.data || []);
      setProfiles(profilesRes.data || []);
    } catch (error) {
      console.error('Ma\'lumotlarni yuklashda xatolik:', error.message);
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
      email: '',
      role: 'seller'
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

      const emailData = {
        email: formData.email.toLowerCase(),
        role: formData.role
      };

      const { error } = await supabase
        .from('allowed_emails')
        .insert([emailData]);
        
      if (error) {
        if (error.code === '23505') {
          throw new Error("Bu email tizimga allaqachon qo'shilgan!");
        }
        throw error;
      }
      
      closeModal();
      fetchData();
      
    } catch (error) {
      console.error('Pochtani saqlashda xatolik:', error.message);
      alert('Xatolik: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (window.confirm(`Haqiqatan ham ${email} pochtasiga tizimga kirish huquqini bekor qilmoqchimisiz? (Bu harakat faqat yangi kirishlarni cheklaydi)`)) {
      try {
        const { error } = await supabase
          .from('allowed_emails')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        fetchData();
      } catch (error) {
        console.error('Ruxsatni bekor qilishda xatolik:', error.message);
        alert('O\'chirishda xatolik yuz berdi!');
      }
    }
  };

  const filteredEmails = allowedEmails.filter(item => 
    item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProfiles = profiles.filter(item => 
    item.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-700 mb-2">Foydalanuvchilar va Ruxsatlar</h1>
          <p className="text-gray-400">Tizimga kirish ruxsati bor xodimlarni boshqarish</p>
        </div>
        
        <button 
          onClick={openModal}
          className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-xl font-medium transition-all transform active:scale-95 shadow-lg shadow-amber-500/30"
        >
          <Shield size={20} />
          <span>Ruxsat qo'shish</span>
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
             className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
             placeholder="Pochta yoki rol bo'yicha qidirish..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Allowed Emails Table */}
      <div className="glass-dark rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-300 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Gmail Pochta</th>
                <th className="p-5 font-semibold">Tizimdagi Roli</th>
                <th className="p-5 font-semibold">Qo'shilgan sana</th>
                <th className="p-5 font-semibold text-center">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Yuklanmoqda...</p>
                  </td>
                </tr>
              ) : filteredEmails.length === 0 ? (
                 <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-400 flex flex-col items-center">
                    <Shield className="h-12 w-12 text-gray-600 mb-3" />
                    <p>Hozircha hech qanday ruxsat etilgan pochta topilmadi.</p>
                  </td>
                </tr>
              ) : (
                filteredEmails.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center text-gray-300">
                        <Mail size={16} className="mr-3 text-amber-400 hidden sm:block" />
                        <span className="font-semibold text-white">{item.email}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase border
                        ${item.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                          item.role === 'manager' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                      >
                        {item.role === 'admin' ? 'Direktor' : item.role === 'manager' ? 'Menejer' : 'Sotuvchi'}
                      </span>
                    </td>
                    <td className="p-5 text-gray-400 text-sm">
                        {formatDate(item.created_at)}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDelete(item.id, item.email)}
                          className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                          title="Ruxsatni olib tashlash"
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

      {/* Profiles Table */}
      <h3 className="text-xl font-bold text-white mt-10 mb-4 flex items-center gap-2">
        <Shield className="text-emerald-400" size={20} />
        Bazada ro'yxatdan o'tganlar (Profiles)
      </h3>
      <div className="glass-dark rounded-3xl overflow-hidden border border-white/10 mb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-300 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">F.I.SH & Pochta</th>
                <th className="p-5 font-semibold">Roli</th>
                <th className="p-5 font-semibold">Oxirgi faollik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-10 text-center text-gray-400">Yuklanmoqda...</td>
                </tr>
              ) : filteredProfiles.length === 0 ? (
                 <tr>
                  <td colSpan="3" className="p-10 text-center text-gray-400 flex flex-col items-center">
                    <p>Hozircha baza foydalanuvchilarsiz.</p>
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center text-gray-300">
                        {item.avatar_url ? (
                          <img src={item.avatar_url} alt="avatar" className="w-8 h-8 rounded-full mr-3 object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 mr-3 flex items-center justify-center text-indigo-400 font-bold">
                            {(item.full_name || 'U')[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-white block">{item.full_name || 'Noma\'lum shaxs'}</span>
                          {item.email && <span className="text-xs text-gray-500 block">{item.email}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase border
                        ${item.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                          item.role === 'manager' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                      >
                        {item.role === 'admin' ? 'Direktor' : item.role === 'manager' ? 'Menejer' : 'Sotuvchi'}
                      </span>
                    </td>
                    <td className="p-5 text-gray-400 text-sm">
                        {formatDate(item.updated_at || item.created_at || Date.now())}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Allowed Email Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative glass-dark border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Shield className="mr-3 text-amber-500" />
                Yangi ruxsat berish
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Gmail pochtasi *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder-gray-500"
                    placeholder="xodim@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tizimdagi roli *</label>
                <select
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none"
                >
                  <option value="seller" className="bg-slate-800">Sotuvchi (Kassir)</option>
                  <option value="manager" className="bg-slate-800">Menejer (Ombor, Sotuv, Xarajat)</option>
                  <option value="admin" className="bg-slate-800">Direktor (To'liq huquq)</option>
                </select>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 border-dashed rounded-xl p-4 text-amber-200 text-sm leading-relaxed mt-4">
                <strong>Diqqat:</strong> Ushbu ruxsat qo'shilgandan so'ng, foydalanuvchi yuqoridagi pochta bilan 
                Login tugmasini bosishi va dasturga xatosiz kirishi mumkin bo'ladi. Aks holda bloklanadi!
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
                  className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium transition-colors shadow-lg shadow-amber-500/30 flex items-center justify-center min-w-[140px]"
                >
                  {submitting ? 'Saqlanmoqda...' : 'Ruxsat berish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
