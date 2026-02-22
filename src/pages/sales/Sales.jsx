import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Search, X, ShoppingCart, User as UserIcon, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { formatPhoneNumber, formatDate } from '../../utils/formatUtils';

const Sales = () => {
  const { user } = useAuth();
  
  // Data states
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Point of Sale (Cart) states
  const [selectedClient, setSelectedClient] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentType, setPaymentType] = useState('cash');
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    fetchSales();
    fetchClientsAndProducts();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      // Fetch sales and join with clients table to get the name
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          clients(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Sotuvlarni yuklashda xatolik:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientsAndProducts = async () => {
    try {
      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Fetch products (only those in stock)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('name');
      if (productsError) throw productsError;
      setProducts(productsData || []);
      
    } catch (error) {
      console.error('Ma\'lumotlarni yuklashda xatolik:', error.message);
    }
  };

  const openModal = () => {
    // Reset form
    setSelectedClient('');
    setCart([]);
    setDiscount(0);
    setPaymentType('cash');
    setProductSearch('');
    
    // Refresh products to ensure we have the latest stock
    fetchClientsAndProducts();
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // --- Cart Operations ---
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('Bazada yetarli zaxira yo\'q!');
        return;
      }
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { 
        product_id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1,
        max_stock: product.stock
      }]);
    }
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const cartItem = cart.find(item => item.product_id === productId);
    if (newQuantity > cartItem.max_stock) {
      alert('Bazada bunday miqdorda zaxira yo\'q!');
      return;
    }
    
    setCart(cart.map(item => 
      item.product_id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = Math.max(0, subTotal - discount);

  // --- Checkout Operation ---
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Aravacha bo\'sh!');
      return;
    }

    try {
      // 1. Create Sale Record
      const saleData = {
        client_id: selectedClient || null,
        seller_id: user?.id,
        total_amount: finalTotal,
        discount: discount || 0,
        payment_type: paymentType
      };

      const { data: newSale, error: saleError } = await supabase
        .from('sales')
        .insert([saleData])
        .select()
        .single();
        
      if (saleError) throw saleError;

      // 2. Create Sale Items
      const saleItemsData = cart.map(item => ({
        sale_id: newSale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsData);
        
      if (itemsError) throw itemsError;

      // 3. Decrease Product Stock
      // Note: In a robust production environment, this should ideally be done using a database RPC or Trigger to prevent race conditions.
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: item.max_stock - item.quantity })
          .eq('id', item.product_id);
          
        if (stockError) console.error('Zaxirani yangilashda xatolik:', stockError.message);
      }
      
      closeModal();
      fetchSales(); // Refresh the list
      
    } catch (error) {
      console.error('Sotuvni amalga oshirishda xatolik:', error.message);
      alert('Xatolik yuz berdi: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Haqiqatan ham bu tranzaksiyani o'chirmoqchimisiz? (Diqqat: Zaxira qayta tiklanmaydi!)")) {
      try {
        const { error } = await supabase
          .from('sales')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        fetchSales();
      } catch (error) {
        console.error('Sotuvni o\'chirishda xatolik:', error.message);
        alert('O\'chirishda xatolik yuz berdi!');
      }
    }
  };

  // Filters
  const filteredSales = sales.filter(sale => {
    const clientName = sale.clients?.name || 'Umumiy xaridor';
    return clientName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Sotuvlar</h1>
          <p className="text-gray-400">Kassa (POS) va barcha tranzaksiyalar tarixi</p>
        </div>
        
        <button 
          onClick={openModal}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-medium transition-all transform active:scale-95 shadow-lg shadow-emerald-500/30"
        >
          <ShoppingCart size={20} />
          <span>Yangi sotuv (Kassa)</span>
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
             className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
             placeholder="Mijoz ismi bo'yicha qidirish..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Sales History Table */}
      <div className="glass-dark rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-300 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Sana</th>
                <th className="p-5 font-semibold">Mijoz</th>
                <th className="p-5 font-semibold text-right">Summa (Chegirma)</th>
                <th className="p-5 font-semibold text-center">To'lov turi</th>
                <th className="p-5 font-semibold text-center">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Yuklanmoqda...</p>
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                 <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400">
                    Hech qanday tranzaksiya topilmadi.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center text-gray-300">
                        <Calendar size={16} className="mr-2 text-emerald-400 hidden sm:block" />
                        <span>{formatDate(sale.created_at)}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center">
                        <UserIcon size={16} className={`mr-2 ${sale.client_id ? 'text-blue-400' : 'text-gray-500'}`} />
                        <span className={`font-medium ${sale.client_id ? 'text-white' : 'text-gray-400 italic'}`}>
                          {sale.clients?.name || 'Umumiy xaridor'}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="font-bold text-emerald-400 text-lg">
                        ${sale.total_amount?.toLocaleString()}
                      </div>
                      {sale.discount > 0 && (
                        <div className="text-xs text-rose-400">
                          -${sale.discount?.toLocaleString()} cheg.
                        </div>
                      )}
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border
                        ${sale.payment_type === 'cash' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          sale.payment_type === 'card' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}
                      >
                        {sale.payment_type === 'cash' ? 'Nafq' : sale.payment_type === 'card' ? 'Karta' : 'O\'tkazma'}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDelete(sale.id)}
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

      {/* POS Modal (New Sale) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={closeModal}></div>
          
          <div className="relative glass-dark border border-white/10 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 shrink-0">
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                <ShoppingCart className="mr-3 text-emerald-400" />
                Kassa (POS)
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors rounded-full p-2 hover:bg-white/10">
                <X size={24} />
              </button>
            </div>
            
            {/* Modal Body (2 Columns) */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Column: Client & Products Selection */}
              <div className="flex-1 border-r border-white/10 flex flex-col p-4 sm:p-6 overflow-y-auto">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mijozni tanlang (Ixtiyoriy)</label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 appearance-none outline-none transition-all"
                  >
                    <option value="" className="bg-slate-800">Umumiy xaridor (Ro'yxatda yo'q)</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-800">{c.name} {c.phone ? `(${formatPhoneNumber(c.phone)})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mahsulot qo'shish</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="Mahsulot qidirish..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-2 pb-4">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/50 rounded-xl p-4 transition-all group flex flex-col justify-between h-32"
                    >
                      <div>
                        <div className="font-semibold text-white line-clamp-2 leading-tight group-hover:text-emerald-400 transition-colors">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{product.category}</div>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                          {product.stock} ta bor
                        </span>
                        <span className="font-bold text-white">${product.price}</span>
                      </div>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Omborda bunday mahsulot yo'q yoki qidiruv xato.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Cart & Checkout */}
              <div className="w-full md:w-96 bg-black/20 flex flex-col overflow-hidden shrink-0">
                <div className="p-4 bg-white/5 border-b border-white/10 font-bold text-white uppercase tracking-wider text-sm flex justify-between items-center">
                  <span>Aravacha</span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md text-xs">{cart.length} xil</span>
                </div>
                
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-50">
                      <ShoppingCart size={48} />
                      <p>Aravacha bo'sh</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.product_id} className="bg-white/5 rounded-xl p-3 flex flex-col relative border border-white/5">
                        <button 
                          onClick={() => removeFromCart(item.product_id)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-red-400"
                        >
                          <X size={16} />
                        </button>
                        
                        <div className="font-medium text-white pr-6 line-clamp-1">{item.name}</div>
                        <div className="text-emerald-400 font-bold text-sm my-1">${item.price} / dona</div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2 bg-black/30 rounded-lg border border-white/10 p-1">
                            <button 
                              onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-white"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-emerald-500/20 text-emerald-400"
                            >
                              +
                            </button>
                          </div>
                          <div className="font-bold text-white">
                            ${(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Checkout Panel */}
                <div className="p-4 sm:p-6 bg-slate-900 border-t border-white/10">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-400">
                      <span>Oraliq summa:</span>
                      <span>${subTotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Chegirma ($):</span>
                      <input 
                        type="number" 
                        min="0"
                        max={subTotal}
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-right text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-white/10">
                      <span className="text-lg font-bold text-white">Jami to'lov:</span>
                      <span className="text-3xl font-extrabold text-emerald-400">${finalTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-2">To'lov turi</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => setPaymentType('cash')}
                        className={`py-2 px-3 rounded-lg flex flex-col items-center justify-center space-y-1 text-sm transition-all border ${paymentType === 'cash' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                      >
                        <DollarSign size={18} />
                        <span>Naqd</span>
                      </button>
                      <button 
                        onClick={() => setPaymentType('card')}
                        className={`py-2 px-3 rounded-lg flex flex-col items-center justify-center space-y-1 text-sm transition-all border ${paymentType === 'card' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                      >
                        <CreditCard size={18} />
                        <span>Karta</span>
                      </button>
                      <button 
                        onClick={() => setPaymentType('transfer')}
                        className={`py-2 px-3 rounded-lg flex flex-col items-center justify-center space-y-1 text-sm transition-all border ${paymentType === 'transfer' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                      >
                        <span className="font-bold">⇌</span>
                        <span>O'tkazma</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-500/30"
                  >
                    <span>Sotish (${finalTotal.toLocaleString()})</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
