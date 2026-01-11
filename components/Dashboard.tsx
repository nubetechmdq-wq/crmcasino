
import React from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Users as UsersIcon,
  Clock,
  Loader2,
  MessageSquare,
  LogOut,
  Wallet,
  Activity,
  Zap,
  MoreVertical,
  Search,
  Plus
} from 'lucide-react';
import { StorageService } from '../services/mockData';
import { TransactionStatus, TransactionType, User } from '../types';

const Dashboard: React.FC = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [txs, setTxs] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const fetchData = React.useCallback(async () => {
    const u = await StorageService.getUsers();
    const t = await StorageService.getTransactions();
    setUsers(u);
    setTxs(t);
    if (u.length > 0 && !selectedUser) setSelectedUser(u[0]);
    setIsLoading(false);
  }, [selectedUser]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin text-primary-600" size={48} />
    </div>
  );

  const totalDeposits = txs
    .filter(t => t.type === TransactionType.DEPOSIT && t.status === TransactionStatus.APPROVED)
    .reduce((sum, t) => sum + t.amount, 0);

  const activeUsersCount = users.filter(u => u.status === 'ACTIVE').length;
  const pendingTxsCount = txs.filter(t => t.status === TransactionStatus.PENDING).length;

  const stats = [
    { label: 'Volumen Mensual', value: `$${totalDeposits.toLocaleString()}`, change: '+12.5%', icon: TrendingUp, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Usuarios Activos', value: activeUsersCount, change: '+4.2%', icon: UsersIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Cargas Pendientes', value: pendingTxsCount, change: '-2.1%', icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="h-full flex bg-white overflow-hidden animate-in fade-in duration-700">

      {/* Column 1: Stats & User List - Rule 1 */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/10">
        <div className="p-8 space-y-8 overflow-y-auto scrollbar-none">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Panel de Control</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sincronizado Hace: 1m</span>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-[1.02] transition-all">
              <Plus size={16} /> Crear Operación
            </button>
          </div>

          {/* Premium Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform`}>
                    <stat.icon size={22} />
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {stat.change.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Users Table Card */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lista de Jugadores</h3>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-all" size={14} />
                <input
                  type="text"
                  placeholder="ID / Teléfono..."
                  className="bg-slate-50 border-none rounded-lg py-1.5 pl-9 pr-4 text-[10px] font-bold outline-none ring-1 ring-slate-100 focus:ring-primary-100 transition-all w-48"
                />
              </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50/40 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Usuario</th>
                  <th className="px-8 py-4">Saldo</th>
                  <th className="px-8 py-4">Estado</th>
                  <th className="px-8 py-4">Rol</th>
                  <th className="px-8 py-4 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${selectedUser?.id === user.id ? 'bg-primary-50/30' : ''}`}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">{user.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-slate-700">${user.balance.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase">{user.role}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-slate-300 hover:text-primary-600 bg-transparent hover:bg-white rounded-lg transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Column 2: User Detail Sidebar - Rule 1 */}
      <div className="w-80 border-l border-slate-100 bg-slate-50/30 flex flex-col p-8 space-y-8 overflow-y-auto scrollbar-none">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ficha de Usuario</h3>

        {selectedUser ? (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-center">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 bg-primary-50 rounded-[32px] flex items-center justify-center mx-auto border-4 border-white shadow-xl shadow-primary-500/10">
                  <span className="text-3xl font-black text-primary-600">{selectedUser.name.charAt(0)}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 text-white rounded-full border-4 border-white shadow-lg">
                  <Activity size={10} />
                </div>
              </div>
              <h4 className="text-lg font-black text-slate-800">{selectedUser.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{selectedUser.phone}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Cartera</h4>
              <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                    <Wallet size={18} />
                  </div>
                  <span className="text-[10px] font-black text-slate-300 uppercase">Aprobación Inmediata</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Disponible</p>
                <p className="text-3xl font-black text-slate-800">${selectedUser.balance.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Configuración</h4>
              <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Zap size={16} fill="currentColor" />
                    </div>
                    <span className="text-[10px] font-black text-slate-700 uppercase">Autopilot</span>
                  </div>
                  <div className="w-10 h-6 bg-emerald-500 rounded-full relative">
                    <div className="absolute top-1 left-5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button className="w-full bg-slate-900 text-white py-4 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                <MessageSquare size={16} /> Chatear Ahora
              </button>
              <button className="w-full bg-white border border-slate-100 text-rose-500 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-[0.1em] hover:bg-rose-50 transition-all">
                Suspender Cuenta
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-10 space-y-4">
            <Activity size={64} />
            <p className="text-[10px] font-black uppercase tracking-widest">Seleccione para ver detalles</p>
          </div>
        )}

        <div className="mt-auto p-5 bg-primary-50/50 rounded-[28px] border border-primary-100">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={16} className="text-primary-600" />
            <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Actividad Global</p>
          </div>
          <p className="text-[10px] text-primary-900/40 font-bold leading-relaxed">
            +14 usuarios nuevos esta semana. El volumen de depósitos subió un 12%.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
