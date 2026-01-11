
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CreditCard,
  Sparkles,
  Loader2,
  Zap,
  Bot,
  X,
  User as UserIcon,
  Phone,
  Calendar,
  ShieldCheck,
  Ban,
  Wallet,
  Settings,
  Info
} from 'lucide-react';
import { StorageService } from '../services/mockData';
import { generateWhatsAppResponse } from '../services/geminiService';
import { Message, User } from '../types';

const ConversationHistory: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inputText, setInputText] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const u = await StorageService.getUsers();
      const m = await StorageService.getMessages();
      setUsers(u);
      setMessages(m);
      if (u.length > 0 && !selectedUser) {
        setSelectedUser(u[0]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error loading conversation data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const paymentSettings = StorageService.getPaymentSettings();
  const chatMessages = selectedUser
    ? messages.filter(m => m.senderPhone === selectedUser.phone || m.receiverPhone === selectedUser.phone)
    : [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAiSuggestion(null);
  }, [selectedUser, messages]);

  const copyPaymentInfo = () => {
    const text = `💰 DATOS PARA CARGAR SALDO:\n👤 Titular: ${paymentSettings.holderName}\n🔑 Alias: ${paymentSettings.alias}\n🏦 CVU: ${paymentSettings.cvu}\n\n⚠️ Una vez realizado el pago, envía el comprobante por este medio.`;
    navigator.clipboard.writeText(text);
    setCopiedField('all');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAiSuggest = async () => {
    setIsGeneratingIA(true);
    const suggestion = await generateWhatsAppResponse(chatMessages, selectedUser, "Cajero");
    setAiSuggestion(suggestion);
    setIsGeneratingIA(false);
  };

  const sendMessage = async (text: string, fromAI: boolean = false) => {
    if (!text.trim() || !selectedUser) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      senderPhone: 'SYSTEM',
      receiverPhone: selectedUser.phone,
      text: text,
      timestamp: new Date().toISOString(),
      isIncoming: false,
      sentByAI: fromAI
    };

    await StorageService.addMessage(newMessage);
    const m = await StorageService.getMessages();
    setMessages(m);
    setInputText('');
    setAiSuggestion(null);
  };

  const toggleAutopilot = async () => {
    if (!selectedUser) return;
    await StorageService.toggleUserAutopilot(selectedUser.id, !!selectedUser.autopilotEnabled);
    const updatedUsers = await StorageService.getUsers();
    setUsers(updatedUsers);
    const updatedUser = updatedUsers.find(u => u.id === selectedUser.id);
    if (updatedUser) setSelectedUser(updatedUser);
  };

  const useSuggestion = () => {
    if (aiSuggestion) {
      setInputText(aiSuggestion);
      setAiSuggestion(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white overflow-hidden animate-in fade-in duration-700">

      {/* Column 1: Chat List - Rule 2 */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/20">
        <div className="p-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Chat Activos</h3>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              type="text"
              placeholder="Buscar jugador..."
              className="w-full bg-white border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:ring-4 focus:ring-primary-500/5 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1 scrollbar-none">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-4 flex items-center gap-3 rounded-2xl transition-all ${selectedUser?.id === user.id
                ? 'bg-white shadow-md border border-slate-100 ring-1 ring-black/5'
                : 'hover:bg-white/50 border border-transparent'
                }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center font-black text-primary-600 shadow-inner">
                  {user.name.charAt(0)}
                </div>
                {user.autopilotEnabled && (
                  <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-1 rounded-lg shadow-lg border-2 border-white">
                    <Zap size={8} fill="currentColor" />
                  </div>
                )}
              </div>
              <div className="text-left overflow-hidden flex-1">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-black text-xs text-slate-800 truncate">{user.name}</h4>
                  <span className="text-[8px] font-black text-slate-300 uppercase">10m</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold truncate tracking-wide">{user.phone}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Column 2: Chat Window - Rule 2 */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        {selectedUser ? (
          <>
            {/* Thread Header */}
            <div className="px-8 py-4 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-[10px]">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-800">{selectedUser.name}</h4>
                  <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">En Línea</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleAiSuggest} disabled={isGeneratingIA} className="p-2 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-all">
                  {isGeneratingIA ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                </button>
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/10 scrollbar-none">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isIncoming ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] flex flex-col ${msg.isIncoming ? 'items-start' : 'items-end'}`}>
                    {msg.sentByAI && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 rounded-full mb-2 border border-primary-100">
                        <Bot size={10} className="text-primary-600" />
                        <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest leading-none">AI Response</span>
                      </div>
                    )}
                    <div className={`p-4 rounded-[24px] shadow-sm text-sm font-medium leading-relaxed ${msg.isIncoming
                      ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                      : 'bg-primary-600 text-white shadow-xl shadow-primary-600/10 rounded-tr-none'
                      }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 px-1">
                      <span className="text-[9px] font-bold text-slate-300 uppercase">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!msg.isIncoming && <Check size={10} className="text-primary-400" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* AI Suggestion Box */}
            {aiSuggestion && (
              <div className="mx-8 mb-4 p-5 bg-primary-50/80 border border-primary-100 rounded-[28px] animate-in slide-in-from-bottom-4 duration-300 shadow-lg">
                <div className="flex items-center justify-between mb-3 text-primary-600 pr-2">
                  <div className="flex items-center gap-2 font-black text-[9px] uppercase tracking-[0.2em]">
                    <Sparkles size={14} /> Sugerencia de AI
                  </div>
                  <button onClick={() => setAiSuggestion(null)}><X size={14} /></button>
                </div>
                <p className="text-xs text-slate-600 font-medium italic mb-4 leading-relaxed">"{aiSuggestion}"</p>
                <div className="flex gap-2">
                  <button onClick={useSuggestion} className="flex-1 bg-white text-slate-600 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50">Editar</button>
                  <button onClick={() => sendMessage(aiSuggestion, true)} className="flex-1 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl shadow-md transition-all hover:bg-primary-700">Enviar Ahora</button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-50">
              <div className="flex items-center gap-4 bg-slate-50/50 p-2 rounded-[28px] border border-slate-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-500/5 transition-all">
                <button className="p-3 text-slate-300 hover:text-primary-600 transition-colors">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                  className="flex-1 bg-transparent border-none py-3 text-sm font-bold text-slate-800 placeholder:text-slate-300 outline-none"
                />
                <button
                  onClick={() => sendMessage(inputText)}
                  className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-all active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
            <UserIcon size={64} className="mb-4" />
            <h3 className="font-black uppercase tracking-[0.3em]">Selecciona un Chat</h3>
          </div>
        )}
      </div>

      {/* Column 3: User Detail - Rule 2 (Mandatory) */}
      <div className="w-80 border-l border-slate-100 bg-slate-50/30 overflow-y-auto scrollbar-none flex flex-col">
        {selectedUser ? (
          <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
            {/* Profile Card */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto mb-4 border-4 border-slate-50">
                <UserIcon size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">{selectedUser.name}</h3>
              <p className="text-xs font-bold text-slate-400 mt-1">{selectedUser.phone}</p>
              <div className="mt-4 flex flex-col gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedUser.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  Estado: {selectedUser.status}
                </span>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Resumen Financiero</h4>
              <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Wallet size={18} />
                  </div>
                  <span className="text-sm font-bold text-slate-600">Balance</span>
                </div>
                <span className="text-lg font-black text-slate-800">${selectedUser.balance.toLocaleString()}</span>
              </div>
            </div>

            {/* Settings & AI */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Configuración del Chat</h4>
              <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-colors ${selectedUser.autopilotEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                      <Zap size={16} fill={selectedUser.autopilotEnabled ? "currentColor" : "none"} />
                    </div>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">AI Autopilot</span>
                  </div>
                  <button
                    onClick={toggleAutopilot}
                    className={`w-10 h-6 rounded-full transition-all relative ${selectedUser.autopilotEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedUser.autopilotEnabled ? 'left-5' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Acciones Rápidas</h4>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={copyPaymentInfo} className="p-4 bg-white border border-slate-100 rounded-[24px] shadow-sm hover:bg-slate-50 transition-all flex flex-col items-center gap-2 group">
                  <CreditCard size={20} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
                  <span className="text-[9px] font-black uppercase text-slate-500">Enviar Datos</span>
                </button>
                <button className="p-4 bg-white border border-slate-100 rounded-[24px] shadow-sm hover:bg-slate-50 transition-all flex flex-col items-center gap-2 group">
                  <Ban size={20} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
                  <span className="text-[9px] font-black uppercase text-slate-500">Bloquear</span>
                </button>
              </div>
              <button className="w-full mt-2 p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-[24px] shadow-lg shadow-slate-900/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                Cargar Saldo
              </button>
            </div>

            {/* Info */}
            <div className="bg-primary-50/50 p-5 rounded-[28px] border border-primary-100 flex items-start gap-4">
              <Info size={16} className="text-primary-600 mt-0.5" />
              <p className="text-[10px] text-primary-900/60 font-bold leading-relaxed">
                Todos los mensajes son monitoreados y registrados para su seguridad.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-10 opacity-10">
            <Settings size={48} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistory;
