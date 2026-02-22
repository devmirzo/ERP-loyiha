import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PackagePlus, Search, X, Database, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatUtils';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    cost: ''
  });

  useEffect(() => {
    fetchBatches();
    fetchProducts();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('batches')
        .select(`
          *,
          products(name, category)
        `)
        .order('received_date', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Kirim tarixini yuklashda xatolik:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock')
        .order('name');
        
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Mahsulotlarni yuklashda xatolik:', error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = () => {
    setFormData({
      product_id: '',
      quantity: '',
      cost: ''
    });
    // Ensure we have the latest stock data when opening modal
    fetchProducts();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_id) return alert('Mahsulotni tanlang!');
    
    try {
      setSubmitting(true);
      
      const quantityToAdd = parseInt(formData.quantity);
      if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
        throw new Error('Miqdorni to\'g\'ri kiriting!');
      }

      // 1. Create Batch Record
      const batchData = {
        product_id: formData.product_id,
        quantity: quantityToAdd,
        cost: parseFloat(formData.cost) || 0
      };

      const { error: batchError } = await supabase
        .from('batches')
        .insert([batchData]);
        
      if (batchError) throw batchError;

      // 2. Refresh Products to get the exact current stock (to avoid race conditions as much as possible on frontend)
      const selectedProduct = products.find(p => p.id === formData.product_id);
      
      // 3. Update Product Stock
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: selectedProduct.stock + quantityToAdd })
        .eq('id', formData.product_id);
        
      if (stockError) {
        console.error('Zaxirani qo\'shishda xatolik:', stockError.message);
        alert('Diqqat! Kirim saqlandi, lekin mahsulot zaxirasi o\'zgarmadi. Tizim administratoriga murojaat qiling.');
      }
      
      closeModal();
      fetchBatches();
      fetchProducts(); // update local state
      
    } catch (error) {
      console.error('Omborga kirim qilishda xatolik:', error.message);
      alert('Xatolik: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (batchId, productId, batchQuantity) => {
    const confirmMsg = `Diqqat! Bu kirimni o'chirsangiz, ombordagi mahsulot soni yana ${batchQuantity} taga kamayadi. Tasdiqlaysizmi?`;
    
    if (window.confirm(confirmMsg)) {
      try {
        // Find current stock
        const { data: currentProduct, error: fetchError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', productId)
          .single();
          
        if (fetchError) throw fetchError;
        
        // Prevent negative stock if they sold items from this batch already
        if (currentProduct.stock - batchQuantity < 0) {
          alert("Xatolik: Bu kirimni bekor qilib bo'lmaydi, chunki mahsulotlar allaqachon sotib yuborilgan (zaxira manfiy bo'lib qoladi).");
          return;
        }

        // 1. Delete batch
        const { error: deleteError } = await supabase
          .from('batches')
          .delete()
          .eq('id', batchId);
          
        if (deleteError) throw deleteError;

        // 2. Reduce stock back
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: currentProduct.stock - batchQuantity })
          .eq('id', productId);
          
        if (stockError) throw stockError;

        fetchBatches();
        fetchProducts();
      } catch (error) {
        console.error('Kirimni o\'chirishda xatolik:', error.message);
        alert('O\'chirishda xatolik: ' + error.message);
      }
    }
  };

  const filteredBatches = batches.filter(batch => {
    const productName = batch.products?.name || '';
    return productName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Omborga qabul (Kirim)</h1>
          <p className="text-gray-400">Yangi kelgan mahsulotlarni zaxiraga qo'shish paneli</p>
        </div>
        
        <button 
          onClick={openModal}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-medium transition-all transform active:scale-95 shadow-lg shadow-indigo-500/30"
        >
          <PackagePlus size={20} />
          <span>Yangi kirim qilish</span>
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
             className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
             placeholder="Mahsulot nomi bo'yicha qidirish..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Batches History Table */}
      <div className="glass-dark rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-300 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Kiritilgan vaqt</th>
                <th className="p-5 font-semibold">Mahsulot</th>
                <th className="p-5 font-semibold text-center">Miqdori</th>
                <th className="p-5 font-semibold text-right">Kelish narxi (Tannarxi)</th>
                <th className="p-5 font-semibold text-center">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Yuklanmoqda...</p>
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                 <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400 flex flex-col items-center">
                    <Database className="h-12 w-12 text-gray-600 mb-3" />
                    <p>Hozircha omborga hech narsa qabul qilinmagan.</p>
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center text-gray-300">
                        <Calendar size={16} className="mr-2 text-indigo-400 hidden sm:block" />
                        <span>{formatDate(batch.received_date)}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-medium text-white">{batch.products?.name || 'Noma\'lum mahsulot'}</div>
                      <div className="text-xs text-gray-500 mt-1">{batch.products?.category || ''}</div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        +{batch.quantity} dona
                      </span>
                    </td>
                    <td className="p-5 text-right font-medium text-gray-300">
                      ${batch.cost?.toLocaleString()} / umumiy
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDelete(batch.id, batch.product_id, batch.quantity)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500 hover:text-white transition-colors"
                        >
                          Bekor qilish
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

      {/* Receiving Modal (New Batch) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative glass-dark border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center">
                <PackagePlus className="mr-3 text-indigo-400" />
                Omborga kirim qilish
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Qaysi mahsulot keldi? *</label>
                <select
                  name="product_id"
                  required
                  value={formData.product_id}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                >
                  <option value="" className="bg-slate-800" disabled>Mahsulotni tanlang...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-800">
                      {p.name} (Joriy zaxira: {p.stock} ta)
                    </option>
                  ))}
                </select>
                {products.length === 0 && (
                  <p className="text-xs text-rose-400 mt-2">
                    Avval "Mahsulotlar" bo'limidan mahsulot yarating.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Soni (dona) *</label>
                  <input
                    type="number"
                    name="quantity"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Masalan: 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Umumiy kelish narxi ($)</label>
                  <input
                    type="number"
                    name="cost"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Masalan: 1500"
                  />
                </div>
              </div>

              {formData.quantity && formData.cost && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 border-dashed rounded-xl p-3 text-center">
                  <span className="text-gray-400 text-sm">Bir donasining o'rtacha tannarxi: </span>
                  <span className="text-indigo-400 font-bold">${(formData.cost / formData.quantity).toFixed(2)}</span>
                </div>
              )}

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
                  disabled={submitting || !formData.product_id}
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium transition-colors shadow-lg shadow-indigo-500/30 flex items-center"
                >
                  {submitting ? 'Saqlanmoqda...' : 'Omborga qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batches;
