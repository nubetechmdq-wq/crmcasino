
import React from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Users as UsersIcon,
  Clock,
  Loader2
} from 'lucide-react';
import { StorageService } from '../services/mockData';
import { TransactionStatus, TransactionType } from '../types';

const Dashboard: React.FC = () => {
  const [users, setUsers] = React.useState<any[]>([]);
  const [txs, setTxs] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      const u = await StorageService.getUsers();
      const t = await StorageService.getTransactions();
      setUsers(u);
      setTxs(t);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>;

  const totalDeposits = txs
    .filter(t => t.type === TransactionType.DEPOSIT && t.status === TransactionStatus.APPROVED)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = txs
    .filter(t => t.type === TransactionType.WITHDRAWAL && t.status === TransactionStatus.APPROVED)
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingTxs = txs.filter(t => t.status === TransactionStatus.PENDING).length;

  const stats = [
    { label: 'Depósitos Totales', value: `$${totalDeposits.toLocaleString()}`, icon: ArrowUpRight, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Retiros Totales', value: `$${totalWithdrawals.toLocaleString()}`, icon: ArrowDownRight, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Pendientes', value: pendingTxs, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Usuarios Activos', value: users.length, icon: UsersIcon, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resumen General</h2>
          <p className="text-slate-400 mt-1">Monitoreo en tiempo real de la actividad del casino.</p>
        </div>
        <div className="bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-emerald-400">Live Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 hover:border-slate-600 transition-all group">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="text-emerald-400" />
            Transacciones Recientes
          </h3>
          <div className="space-y-4">
            {txs.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-700/30">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {tx.type === TransactionType.DEPOSIT ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold">{tx.type === TransactionType.DEPOSIT ? 'Depósito' : 'Retiro'}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${tx.amount.toLocaleString()}</p>
                  <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${tx.status === TransactionStatus.APPROVED ? 'bg-emerald-500/10 text-emerald-500' :
                    tx.status === TransactionStatus.PENDING ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                    {tx.status}
                  </div>
                </div>
              </div>
            ))}
            {txs.length === 0 && <p className="text-center text-slate-500 py-10">No hay transacciones registradas.</p>}
          </div>
        </div>

        <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-400" />
            Distribución de Carga
          </h3>
          <div className="flex flex-col items-center justify-center h-full pb-10">
            {/* Simple Visual Representation */}
            <div className="relative w-48 h-48 mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-700" />
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="502.4" strokeDashoffset={502.4 * (1 - (totalDeposits / (totalDeposits + totalWithdrawals || 1)))} className="text-emerald-500 transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Depósitos</span>
                <span className="text-2xl font-bold">{Math.round((totalDeposits / (totalDeposits + totalWithdrawals || 1)) * 100)}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 w-full">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium">Depósitos</span>
                </div>
                <p className="text-xl font-bold">${totalDeposits.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-slate-700 rounded-full"></div>
                  <span className="text-sm font-medium">Retiros</span>
                </div>
                <p className="text-xl font-bold">${totalWithdrawals.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
