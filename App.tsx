
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
import {
  Users as UsersIcon,
  CreditCard,
  Lock,
  Mail,
  ChevronRight,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  Zap,
  UserPlus,
  ArrowRight,
  Bell,
  X,
  Plus,
  Search,
  LogOut,
  ChevronDown
} from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginForm, setLoginForm] = useState({ phone: '', password: '', role: UserRole.CASHIER });
  const [registerForm, setRegisterForm] = useState({ name: '', phone: '', password: '', role: UserRole.CASHIER });

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    processLogin(loginForm.phone.trim(), loginForm.password.trim(), loginForm.role);
  };

  const processLogin = async (phone: string, password: string, role: UserRole) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .eq('role', role)
        .eq('status', 'ACTIVE')
        .single();

      if (user) {
        if (user.password && user.password !== password) {
          alert("Contraseña incorrecta.");
          return;
        }
        setCurrentUser(user);
        setCurrentTab(user.role === UserRole.ADMIN ? 'dashboard' : 'validator');
        addNotification(
          `Bienvenido, ${user.name}`,
          `Has iniciado sesión como ${user.role}.`,
          NotificationLevel.SUCCESS
        );
      } else {
        alert("Credenciales incorrectas.");
      }
    } catch (err) {
      alert("Error al conectar con la base de datos.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, phone, password, role } = registerForm;
    if (!name || !phone || !password) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone.trim())
        .single();

      if (existingUser) {
        alert("Este número de teléfono ya está registrado.");
        return;
      }

      const newUser = {
        name: name.trim(),
        phone: phone.trim(),
        password: password.trim(),
        role: role,
        balance: 0,
        status: 'ACTIVE'
      };

      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        addNotification(
          "Cuenta creada",
          `Bienvenido ${data.name}.`,
          NotificationLevel.SUCCESS
        );
        setCurrentUser(data);
        setCurrentTab(data.role === UserRole.ADMIN ? 'dashboard' : 'validator');
      }
    } catch (err) {
      alert("Error al registrar el usuario.");
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans">
        {/* Left Side: Branding */}
        <div className="hidden lg:flex lg:w-3/5 bg-primary-600 relative overflow-hidden items-center justify-center p-24">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:30px_30px]"></div>
          <div className="relative z-10 space-y-10 max-w-xl text-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-2xl rounded-[40px] flex items-center justify-center mx-auto shadow-2xl border border-white/30 rotate-12">
              <LayoutGrid className="text-white" size={48} />
            </div>
            <div className="space-y-4">
              <h1 className="text-6xl font-black text-white tracking-tighter leading-[0.9]">
                Flowbi <br /> <span className="text-primary-200">CRM de WhatsApp</span>
              </h1>
              <p className="text-primary-50/70 text-lg font-medium tracking-tight">
                Plataforma de Automatización de WhatsApp
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="bg-white p-10 lg:rounded-[48px] lg:shadow-2xl lg:shadow-slate-200/50 border border-slate-100 animate-in fade-in slide-in-from-right-12 duration-1000">
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-4xl font-black tracking-tight text-slate-800 mb-2">
                  {isRegistering ? 'Crear Cuenta' : 'Bienvenido'}
                </h2>
                <p className="text-slate-400 font-medium font-bold">
                  {isRegistering ? 'Completa los datos para registrarte' : 'Ingresa tus credenciales para continuar'}
                </p>
              </div>

              {isRegistering ? (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-6 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary-100 transition-all"
                      placeholder="Juan Pérez"
                      required
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-6 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary-100 transition-all"
                      placeholder="549..."
                      required
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                    <input
                      type="password"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-6 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary-100 transition-all"
                      placeholder="••••••••"
                      required
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[UserRole.ADMIN, UserRole.CASHIER].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setRegisterForm({ ...registerForm, role })}
                          className={`py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${registerForm.role === role
                            ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/10'
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                            }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest mt-6 shadow-xl shadow-slate-900/10">
                    Registrarse
                  </button>
                  <button type="button" onClick={() => setIsRegistering(false)} className="w-full text-primary-600 text-[10px] font-black uppercase tracking-widest mt-4">
                    Volver al Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 rounded-[20px] py-4 px-6 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary-100 transition-all"
                      placeholder="549..."
                      value={loginForm.phone}
                      onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                    <input
                      type="password"
                      className="w-full bg-slate-50 border border-slate-100 rounded-[20px] py-4 px-6 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary-100 transition-all"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Acceso</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[UserRole.ADMIN, UserRole.CASHIER].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setLoginForm({ ...loginForm, role })}
                          className={`py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${loginForm.role === role ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-white border-slate-100 text-slate-400'}`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 group">
                    Ingresar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button type="button" onClick={() => setIsRegistering(true)} className="w-full text-primary-600 text-[10px] font-black uppercase tracking-widest">
                    Solicitar Acceso
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      {/* Sidebar - strictly fixed */}
      <div className="w-64 h-full flex-shrink-0">
        <Sidebar
          currentTab={currentTab}
          setTab={setCurrentTab}
          role={currentUser.role}
          userName={currentUser.name}
          onLogout={() => setCurrentUser(null)}
          unreadNotifications={notifications.filter(n => !n.isRead).length}
          onToggleNotifications={() => setIsNotificationPanelOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Top Header - Rule 1 */}
        <header className="h-[72px] bg-white border-b border-slate-100 flex items-center justify-between px-10 z-20 flex-shrink-0">
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Buscar en el sistema..."
                className="w-full bg-slate-50 border border-transparent rounded-2xl py-2.5 pl-12 pr-4 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-primary-100 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNotificationPanelOpen(true)}
                className="relative p-2.5 bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
              >
                <Bell size={20} />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                )}
              </button>
            </div>

            <div className="w-px h-6 bg-slate-100"></div>

            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-none">{currentUser.name}</p>
                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-1 opacity-70">{currentUser.role}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white text-xs shadow-lg">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-auto bg-[#F8FAFC]">
          <div className="h-full">
            {currentTab === 'dashboard' && <Dashboard />}
            {currentTab === 'validator' && <ReceiptValidator currentUserId={currentUser.id} onNotify={addNotification} />}
            {currentTab === 'chats' && <ConversationHistory />}
            {currentTab === 'broadcasts' && <BulkMessaging onNotify={addNotification} />}
            {currentTab === 'config' && <PaymentSettingsModule />}

            {currentTab === 'users' && (
              <div className="p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Gestión Personal</h2>
                  <button onClick={() => setIsImportOpen(!isImportOpen)} className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary-500/20 flex items-center gap-2">
                    <UserPlus size={20} /> Importar Datos
                  </button>
                </div>

                {isImportOpen && (
                  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm animate-in zoom-in-95 duration-300">
                    <UserImport onNotify={addNotification} onComplete={() => { fetchDbData(); setIsImportOpen(false); }} />
                  </div>
                )}

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                      <tr>
                        <th className="px-8 py-5">Nombre</th>
                        <th className="px-8 py-5">WhatsApp</th>
                        <th className="px-8 py-5">Rol</th>
                        <th className="px-8 py-5">Balance</th>
                        <th className="px-8 py-5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {dbUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5 font-bold text-slate-700">{u.name}</td>
                          <td className="px-8 py-5 font-mono text-xs text-slate-400">{u.phone}</td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black rounded-full uppercase">{u.role}</span>
                          </td>
                          <td className="px-8 py-5 font-black text-slate-800">${u.balance.toLocaleString()}</td>
                          <td className="px-8 py-5 text-right">
                            <button className="text-[10px] font-black uppercase text-slate-300 hover:text-primary-600 transition-colors">Ajustes</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentTab === 'transactions' && (
              <div className="p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Movimientos</h2>
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                      <tr>
                        <th className="px-8 py-5">ID / Fecha</th>
                        <th className="px-8 py-5">Usuario</th>
                        <th className="px-8 py-5">Tipo</th>
                        <th className="px-8 py-5">Monto</th>
                        <th className="px-8 py-5">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-bold">
                      {dbTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors text-xs">
                          <td className="px-8 py-5">
                            <p className="text-slate-800 uppercase">{tx.id.substring(0, 8)}</p>
                            <p className="text-[9px] text-slate-300 uppercase">{new Date(tx.timestamp).toLocaleString()}</p>
                          </td>
                          <td className="px-8 py-5 text-slate-600">
                            {dbUsers.find(u => u.id === tx.userId)?.name || 'Anónimo'}
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] uppercase ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{tx.type}</span>
                          </td>
                          <td className="px-8 py-5 text-slate-800 font-black text-sm">${tx.amount.toLocaleString()}</td>
                          <td className="px-8 py-5">
                            <span className="text-emerald-500 uppercase text-[10px]">Aprobado</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end pointer-events-none">
        {toasts.map(toast => (
          <NotificationToast key={toast.id} notification={toast} onDismiss={dismissToast} />
        ))}
      </div>

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
