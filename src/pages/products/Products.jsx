import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        category: product.category || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0
      };

      if (editingProduct) {
        // Update product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
      } else {
        // Add new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);
          
        if (error) throw error;
      }
      
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error.message);
      alert('Mahsulotni saqlashda xatolik yuz berdi!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?")) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error.message);
        alert('Mahsulotni o\'chirishda xatolik yuz berdi!');
      }
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-700 mb-2">Mahsulotlar</h1>
          <p className="text-gray-400">Barcha mahsulotlarni boshqarish paneli</p>
        </div>
        
        <button 
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-medium transition-all transform active:scale-95 shadow-lg shadow-purple-500/30"
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
             className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all"
             placeholder="Mahsulot nomi yoki toifasi bo'yicha qidirish..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-dark rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-300 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Nomi</th>
                <th className="p-5 font-semibold">Toifa</th>
                <th className="p-5 font-semibold text-right">Narxi</th>
                <th className="p-5 font-semibold text-center">Zaxira</th>
                <th className="p-5 font-semibold text-center">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Yuklanmoqda...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                 <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400">
                    Hech qanday mahsulot topilmadi.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5">
                      <div className="font-medium text-white">{product.name}</div>
                      {product.description && <div className="text-xs text-pink-100 mt-1 truncate max-w-xs">{product.description}</div>}
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {product.category || 'Belgilanmagan'}
                      </span>
                    </td>
                    <td className="p-5 text-right font-medium text-green-400">
                      {product.price?.toLocaleString()}
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock > 10 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : product.stock > 0 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {product.stock} dona
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(product)}
                          className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
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
                {editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Nomi *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Masalan: iPhone 15 Pro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Narxi ($) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Zaxira (dona) *</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Toifa</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Masalan: Elektronika"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tavsif</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Mahsulot haqida qisqacha ma'lumot..."
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
                  className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors shadow-lg shadow-purple-500/30"
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

export default Products;
