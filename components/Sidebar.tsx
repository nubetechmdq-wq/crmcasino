
import React from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileCheck,
  CreditCard,
  LogOut,
  ShieldCheck,
  Bell,
  Settings,
  LayoutGrid,
  Zap,
  BarChart3
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  role: UserRole;
  userName: string;
  onLogout: () => void;
  unreadNotifications: number;
  onToggleNotifications: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setTab,
  role,
  onLogout,
}) => {
  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Panel de Control', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { id: 'chats', icon: MessageSquare, label: 'Chat Jugadores', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { id: 'validator', icon: FileCheck, label: 'Carga de Saldo', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { id: 'transactions', icon: CreditCard, label: 'Movimientos', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { id: 'users', icon: Users, label: 'Gestión Personal', roles: [UserRole.ADMIN] },
    { id: 'broadcasts', icon: Zap, label: 'Campañas Masivas', roles: [UserRole.ADMIN] },
    { id: 'config', icon: Settings, label: 'Ajustes de Pago', roles: [UserRole.ADMIN] },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-slate-100 flex flex-col z-50">
      {/* Brand - Rule 4 Premium Look */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-600 rounded-[14px] flex items-center justify-center shadow-xl shadow-primary-600/20 rotate-3 group-hover:rotate-0 transition-transform">
          <LayoutGrid className="text-white" size={20} />
        </div>
        <div>
          <h1 className="font-black text-sm text-slate-800 tracking-tight leading-none uppercase">Flow<span className="text-primary-600">bi</span></h1>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em]">Soporte Activo</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-none">
        <div className="mb-4">
          <h3 className="px-5 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Menú Principal</h3>
          <div className="space-y-1">
            {menuItems.map((item) => {
              if (!item.roles.includes(role)) return null;
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                    ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20 font-bold'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-300 group-hover:text-primary-600 group-hover:scale-110 transition-all'}`} />
                  <span className="text-[11px] font-black uppercase tracking-wider">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Actions - Cleaned up redundant info */}
      <div className="p-6 border-t border-slate-50 mt-auto">
        <div className="bg-slate-50 p-4 rounded-2xl mb-4 group cursor-pointer hover:bg-primary-50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase group-hover:text-primary-600 transition-colors">Estado Sistema</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
          <p className="text-[10px] font-bold text-slate-700 mt-1">Versión 2.4.1 stable</p>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-rose-100"
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
