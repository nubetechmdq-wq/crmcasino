
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Transaction, TransactionStatus, TransactionType, AppNotification, NotificationLevel } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ReceiptValidator from './components/ReceiptValidator';
import ConversationHistory from './components/ConversationHistory';
import PaymentSettingsModule from './components/PaymentSettings';
import BulkMessaging from './components/BulkMessaging';
import UserImport from './components/UserImport';
import { NotificationPanel, NotificationToast } from './components/NotificationSystem';
import { StorageService } from './services/mockData';
import { supabase } from './services/supabaseClient';
import { Users as UsersIcon, CreditCard, Lock, Mail, ChevronRight, LayoutGrid, CheckCircle2, XCircle, Zap, UserPlus } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ phone: '', role: UserRole.CASHIER });

  // Notification State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [dbUsers, setDbUsers] = useState<User[]>([]);
  const [dbTransactions, setDbTransactions] = useState<Transaction[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const fetchDbData = useCallback(async () => {
    const users = await StorageService.getUsers();
    const txs = await StorageService.getTransactions();
    setDbUsers(users);
    setDbTransactions(txs);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchDbData();
    }
  }, [currentUser, fetchDbData]);

  const addNotification = useCallback((title: string, message: string, level: NotificationLevel = NotificationLevel.INFO) => {
    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      level,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    setToasts(prev => [newNotification, ...prev]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    processLogin(loginForm.phone.trim(), loginForm.role);
  };

  const processLogin = async (phone: string, role: UserRole) => {
    console.log('🔐 Attempting login:', { phone, role });

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .eq('role', role)
        .single();

      console.log('📊 Supabase response:', { user, error });

      if (user) {
        console.log('✅ Login successful:', user);
        setCurrentUser(user);
        setCurrentTab(user.role === UserRole.ADMIN ? 'dashboard' : 'validator');

        // Welcome Notification
        addNotification(
          `Bienvenido, ${user.name}`,
          `Has iniciado sesión como ${user.role}. Tienes acceso completo al sistema.`,
          NotificationLevel.SUCCESS
        );
      } else {
        console.error('❌ Login failed - no user found');
        alert("Credenciales incorrectas.\nAdmin: +5491112345678\nCajero: +5491198765432");
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      alert("Error al conectar con la base de datos. Revisa la consola.");
    }
  };

  const quickLogin = (phone: string, role: UserRole) => {
    setLoginForm({ phone, role });
    processLogin(phone, role);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
        {/* Decorative Side */}
        <div className="hidden lg:flex lg:w-1/2 bg-emerald-600 relative overflow-hidden items-center justify-center p-12">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="relative z-10 text-center space-y-8 max-w-lg">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[40px] flex items-center justify-center mx-auto shadow-2xl rotate-12">
              <LayoutGrid className="text-white" size={48} />
            </div>
            <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
              El CRM definitivo para tu <span className="text-emerald-900/50">Casino Virtual</span>
            </h1>
            <p className="text-emerald-100 text-lg font-medium">
              Gestiona depósitos de Mercado Pago, automatiza validaciones y chatea con tus jugadores en una sola plataforma segura.
            </p>
          </div>
        </div>

        {/* Login Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-black tracking-tighter text-white mb-2">Bienvenido</h2>
              <p className="text-slate-400">Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Teléfono Registrado</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input
                    type="text"
                    required
                    placeholder="+54911..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={loginForm.phone}
                    onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Rol de Acceso</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setLoginForm({ ...loginForm, role: UserRole.CASHIER })}
                    className={`py-4 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-2 ${loginForm.role === UserRole.CASHIER
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                  >
                    <CreditCard size={24} />
                    Cajero
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginForm({ ...loginForm, role: UserRole.ADMIN })}
                    className={`py-4 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-2 ${loginForm.role === UserRole.ADMIN
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                  >
                    <Lock size={24} />
                    Administrador
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group"
              >
                Acceder al CRM
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Quick Access Section */}
            <div className="pt-8 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Acceso de Prueba</span>
                <div className="h-px bg-slate-800 flex-1"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => quickLogin('+5491112345678', UserRole.ADMIN)}
                  className="bg-slate-900/50 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-500 uppercase">Admin</span>
                    <Zap size={14} className="text-slate-600 group-hover:text-amber-500" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">+5491112345678</p>
                </button>

                <button
                  onClick={() => quickLogin('+5491198765432', UserRole.CASHIER)}
                  className="bg-slate-900/50 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-500 uppercase">Cajero</span>
                    <Zap size={14} className="text-slate-600 group-hover:text-blue-500" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">+5491198765432</p>
                </button>
              </div>
            </div>

            <div className="pt-8 text-center text-[10px] text-slate-700 uppercase tracking-widest font-bold">
              Soporte Técnico CasinoHub &copy; 2024
            </div>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Sidebar
        currentTab={currentTab}
        setTab={setCurrentTab}
        role={currentUser.role}
        userName={currentUser.name}
        onLogout={() => setCurrentUser(null)}
        unreadNotifications={unreadCount}
        onToggleNotifications={() => setIsNotificationPanelOpen(true)}
      />

      <main className="ml-64 p-8 min-h-screen">
        {currentTab === 'dashboard' && <Dashboard />}
        {currentTab === 'validator' && (
          <ReceiptValidator
            currentUserId={currentUser.id}
            onNotify={addNotification}
          />
        )}
        {currentTab === 'chats' && <ConversationHistory />}
        {currentTab === 'broadcasts' && currentUser.role === UserRole.ADMIN && (
          <BulkMessaging onNotify={addNotification} />
        )}

        {currentTab === 'users' && currentUser.role === UserRole.ADMIN && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h2>
                <p className="text-slate-400 mt-1">Administra los accesos y balances de jugadores y empleados.</p>
              </div>
              <button
                onClick={() => setIsImportOpen(!isImportOpen)}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all"
              >
                <UserPlus size={20} />
                Importar CSV
              </button>
            </div>

            {isImportOpen && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <UserImport onNotify={addNotification} onComplete={() => { fetchDbData(); setIsImportOpen(false); }} />
              </div>
            )}

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-700/50">
                    <th className="px-6 py-5">Nombre</th>
                    <th className="px-6 py-5">WhatsApp</th>
                    <th className="px-6 py-5">Rol</th>
                    <th className="px-6 py-5">Balance</th>
                    <th className="px-6 py-5">Estado</th>
                    <th className="px-6 py-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {dbUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-400 font-mono text-sm">{user.phone}</td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${user.role === UserRole.ADMIN ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-bold text-emerald-400">${user.balance.toLocaleString()}</td>
                      <td className="px-6 py-5">
                        <span className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                          Activo
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="text-slate-500 hover:text-white transition-colors">Ver Detalles</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentTab === 'transactions' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Historial Financiero</h2>
              <p className="text-slate-400 mt-1">Registro detallado de todos los movimientos de la plataforma.</p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-700/50">
                    <th className="px-6 py-5">ID / Fecha</th>
                    <th className="px-6 py-5">Usuario</th>
                    <th className="px-6 py-5">Tipo</th>
                    <th className="px-6 py-5">Monto</th>
                    <th className="px-6 py-5">Referencia MP</th>
                    <th className="px-6 py-5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {dbTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-white uppercase">{tx.id.substring(0, 8)}</p>
                        <p className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-5 text-slate-300 font-medium">
                        {dbUsers.find(u => u.id === tx.userId)?.name || 'Desconocido'}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-bold text-lg">${tx.amount.toLocaleString()}</td>
                      <td className="px-6 py-5 text-slate-500 font-mono text-xs">{tx.externalRef}</td>
                      <td className="px-6 py-5 text-emerald-400 text-xs font-bold">
                        {tx.status === TransactionStatus.APPROVED ? 'APROBADO' : tx.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Toast Layer */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end pointer-events-none">
        {toasts.map(toast => (
          <NotificationToast key={toast.id} notification={toast} onDismiss={dismissToast} />
        ))}
      </div>

      {/* Panel */}
      <NotificationPanel
        notifications={notifications}
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
        onClearAll={clearAllNotifications}
      />
    </div>
  );
};

export default App;
