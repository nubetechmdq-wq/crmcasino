
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
  Settings
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
  userName,
  onLogout,
  unreadNotifications,
  onToggleNotifications
}) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { id: 'users', icon: Users, label: 'Gestión Usuarios', roles: [UserRole.ADMIN] },
    { id: 'broadcasts', icon: MessageSquare, label: 'Mensajes Masivos', roles: [UserRole.ADMIN] },
    { id: 'chats', icon: MessageSquare, label: 'Conversaciones', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { id: 'validator', icon: FileCheck, label: 'Validar Comprobantes', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { id: 'transactions', icon: CreditCard, label: 'Transacciones', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { id: 'config', icon: Settings, label: 'Configuración', roles: [UserRole.ADMIN] },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <ShieldCheck className="text-white" size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg text-emerald-50 tracking-tight">CasinoHub</h1>
          <span className="text-xs text-emerald-400 font-medium uppercase tracking-widest">WhatsApp CRM</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          if (!item.roles.includes(role)) return null;
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
            >
              <Icon size={20} className={isActive ? 'text-emerald-400' : 'group-hover:scale-110 transition-transform'} />
              {item.label}
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={onToggleNotifications}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all"
          >
            <div className="flex items-center gap-3">
              <Bell size={20} />
              <span>Notificaciones</span>
            </div>
            {unreadNotifications > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-emerald-400 border border-slate-600">
            {userName.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-xs text-slate-500 font-medium">{role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
