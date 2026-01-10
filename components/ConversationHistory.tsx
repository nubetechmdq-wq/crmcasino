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
  Bot
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
    console.log('📱 ConversationHistory: Fetching initial data...');
    setIsLoading(true);
    try {
      const u = await StorageService.getUsers();
      const m = await StorageService.getMessages();
      console.log('📱 Users loaded:', u.length, u);
      console.log('📱 Messages loaded:', m.length, m);
      setUsers(u);
      setMessages(m);
      if (u.length > 0 && !selectedUser) {
        setSelectedUser(u[0]);
        console.log('📱 Selected first user:', u[0]);
      } else {
        console.warn('⚠️ No users found or user already selected');
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
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  // Show empty state if no users
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Send size={48} className="text-slate-600" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No hay conversaciones</h3>
        <p className="text-slate-400 max-w-md">
          No se encontraron usuarios con conversaciones. Los mensajes aparecerán aquí cuando los usuarios interactúen con el sistema.
        </p>
      </div>
    );
  }

  // If we have users but no selected user, select the first one
  if (!selectedUser && users.length > 0) {
    setSelectedUser(users[0]);
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl animate-in fade-in duration-700">
      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/50">
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Buscar chat..."
              className="w-full bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-4 flex items-center gap-3 transition-colors border-b border-slate-800/50 ${selectedUser.id === user.id ? 'bg-slate-800' : 'hover:bg-slate-800/40'
                }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-emerald-400 border border-slate-600">
                  {user.name.charAt(0)}
                </div>
                {user.autopilotEnabled && (
                  <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-1 rounded-full animate-pulse shadow-lg">
                    <Zap size={10} fill="currentColor" />
                  </div>
                )}
              </div>
              <div className="text-left overflow-hidden flex-1">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-semibold text-sm truncate text-white">{user.name}</h4>
                  <span className="text-[10px] text-slate-500">Ahora</span>
                </div>
                <p className="text-xs text-slate-500 truncate">${user.balance.toLocaleString()} • {user.phone}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0b141a]">
        {/* Chat Header */}
        <div className="p-4 bg-slate-800/80 backdrop-blur-md flex items-center justify-between border-b border-slate-700/50 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-emerald-400">
              {selectedUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-white">{selectedUser.name}</h4>
                {selectedUser.autopilotEnabled && (
                  <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-emerald-500/30">
                    <Bot size={10} /> Autopilot On
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">Balance: ${selectedUser.balance.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAutopilot}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${selectedUser.autopilotEnabled
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:text-white'
                }`}
            >
              <Zap size={14} className={selectedUser.autopilotEnabled ? 'fill-current' : ''} />
              {selectedUser.autopilotEnabled ? 'AUTO: ON' : 'AUTO: OFF'}
            </button>
            <button
              onClick={copyPaymentInfo}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${copiedField === 'all' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
            >
              {copiedField === 'all' ? <Check size={14} /> : <CreditCard size={14} />}
              DATOS MP
            </button>
            <div className="w-px h-6 bg-slate-700"></div>
            <MoreVertical size={20} className="text-slate-400 cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-90 scroll-smooth">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isIncoming ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm relative group ${msg.isIncoming ? 'bg-slate-800 text-slate-200 rounded-tl-none' : 'bg-emerald-600 text-white rounded-tr-none'
                }`}>
                {msg.sentByAI && (
                  <div className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-200 mb-1 tracking-widest opacity-80">
                    <Bot size={10} /> Respuesta Automática
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <div className="flex justify-end mt-1 items-center gap-1">
                  <span className={`text-[10px] ${msg.isIncoming ? 'text-slate-500' : 'text-emerald-100'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!msg.isIncoming && <Check size={10} className="text-emerald-100" />}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Box */}
        {aiSuggestion && (
          <div className="px-4 py-3 bg-emerald-500/10 border-t border-emerald-500/20 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                <Sparkles size={14} /> IA: Sugerencia de Respuesta
              </div>
              <button onClick={() => setAiSuggestion(null)} className="text-slate-500 hover:text-white"><Check size={14} /></button>
            </div>
            <p className="text-xs text-slate-300 italic line-clamp-2 mb-2">"{aiSuggestion}"</p>
            <div className="flex gap-2">
              <button
                onClick={useSuggestion}
                className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all border border-emerald-500/30"
              >
                EDITAR RESPUESTA
              </button>
              <button
                onClick={() => sendMessage(aiSuggestion, true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-lg"
              >
                ENVIAR AHORA
              </button>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700/50 flex items-center gap-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Smile size={22} className="cursor-pointer hover:text-emerald-400 transition-colors" />
            <Paperclip size={22} className="cursor-pointer hover:text-emerald-400 transition-colors" />
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={selectedUser.autopilotEnabled ? "IA monitoreando conversación..." : "Escribe un mensaje..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
              className="w-full bg-slate-900 border-none rounded-2xl py-3.5 px-4 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 transition-all outline-none"
            />
            <button
              onClick={handleAiSuggest}
              disabled={isGeneratingIA}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400 disabled:opacity-50 transition-all p-1.5 hover:bg-emerald-500/10 rounded-xl"
              title="Analizar chat y sugerir"
            >
              {isGeneratingIA ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            </button>
          </div>

          <button
            onClick={() => sendMessage(inputText)}
            className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationHistory;
