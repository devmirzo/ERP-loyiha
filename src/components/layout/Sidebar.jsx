import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  UserCog, 
  LogOut,
  Layers,
  BarChart3,
  FileText,
  Target
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const { role, signOut } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'manager', 'seller'] },
    { name: 'Products', path: '/products', icon: Package, roles: ['admin', 'manager'] },
    { name: 'Batches', path: '/batches', icon: Layers, roles: ['admin', 'manager'] },
    { name: 'Sales', path: '/sales', icon: ShoppingCart, roles: ['admin', 'seller', 'manager'] },
    { name: 'Clients', path: '/clients', icon: Users, roles: ['admin', 'seller', 'manager'] },
    { name: 'Expenses', path: '/expenses', icon: CreditCard, roles: ['admin', 'manager'] },
    { name: 'Users', path: '/users', icon: UserCog, roles: ['admin'] },
    { name: 'Statistika', path: '/statistics', icon: BarChart3, roles: ['admin'] },
    { name: 'Hisobotlar', path: '/reports', icon: FileText, roles: ['admin'] },
    { name: 'KPI', path: '/kpi', icon: Target, roles: ['admin'] },
    { name: 'Xodimlar', path: '/employees', icon: Users, roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="h-screen w-64 glass-dark text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          ERP Pro
        </h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{role} Portal</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-primary shadow-lg shadow-blue-500/30 text-white' 
                : 'text-gray-400 hover:bg-white/10 hover:text-white'}
            `}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={signOut}
          className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
