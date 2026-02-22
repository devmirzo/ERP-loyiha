import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Search, X, Phone, MapPin } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/formatUtils';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Mijozlarni chaqirishda xatolik:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name || '',
        phone: client.phone || '',
        address: client.address || ''
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        phone: '',
        address: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        // Mijozni tahrirlash
        const { error } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', editingClient.id);
        
        if (error) throw error;
      } else {
        // Yangi mijoz qo'shish
        const { error } = await supabase
          .from('clients')
          .insert([formData]);
          
        if (error) throw error;
      }
      
      closeModal();
      fetchClients();
    } catch (error) {
      console.error('Mijozni saqlashda xatolik:', error.message);
      alert('Mijozni saqlashda xatolik yuz berdi!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Haqiqatan ham bu mijozni o'chirmoqchimisiz?")) {
      try {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        fetchClients();
      } catch (error) {
        console.error('Mijozni o\'chirishda xatolik:', error.message);
        alert('Mijozni o\'chirishda xatolik yuz berdi!');
      }
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.phone && client.phone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-700 mb-2">Mijozlar</h1>
          <p className="text-gray-400">Barcha mijozlar bilan ishlash paneli</p>
        </div>
        
        <button 
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition-all transform active:scale-95 shadow-lg shadow-blue-500/30"
        >
          <Plus size={20} />
          <span>Yangi qo'shish</span>
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
             className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
             placeholder="Mijoz ismi yoki telefoni bo'yicha qidirish..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="glass-dark rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-300 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Ism-sharifi</th>
                <th className="p-5 font-semibold">Telefon raqami</th>
                <th className="p-5 font-semibold">Manzili</th>
                <th className="p-5 font-semibold text-center">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Yuklanmoqda...</p>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                 <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-400">
                    Hech qanday mijoz topilmadi.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5">
                      <div className="font-medium text-white text-lg">{client.name}</div>
                    </td>
                    <td className="p-5">
                      {client.phone ? (
                        <div className="flex items-center text-gray-300">
                          <Phone size={16} className="mr-2 text-blue-400" />
                          {formatPhoneNumber(client.phone)}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm italic">Mavjud emas</span>
                      )}
                    </td>
                    <td className="p-5">
                      {client.address ? (
                        <div className="flex items-center text-gray-300">
                          <MapPin size={16} className="mr-2 text-rose-400 flex-shrink-0" />
                          <span className="truncate max-w-xs">{client.address}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm italic">Mavjud emas</span>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(client)}
                          className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id)}
                          className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                          title="O'chirish"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative glass-dark border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">
                {editingClient ? 'Mijozni tahrirlash' : 'Yangi mijoz'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Ism-sharifi yoki Kompaniya nomi *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Masalan: Ali Valiyev"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Telefon raqami</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="+998 90 123 45 67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Manzili</label>
                <textarea
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Mijozning yashash yoki ish joyi manzili..."
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 font-medium transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-lg shadow-blue-500/30"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
