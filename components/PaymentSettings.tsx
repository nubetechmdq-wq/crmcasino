
import React, { useState } from 'react';
import { 
  CreditCard, 
  Save, 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertCircle, 
  Key, 
  ExternalLink, 
  MessageCircle, 
  Globe, 
  Info,
  Server,
  Sparkles,
  Terminal,
  ChevronRight,
  Loader2,
  BookOpen,
  HelpCircle,
  Link as LinkIcon,
  Cpu,
  Activity,
  Zap
} from 'lucide-react';
import { StorageService } from '../services/mockData';
import { testAiConnection } from '../services/geminiService';
import { PaymentSettings, WhatsAppSettings, NotificationLevel } from '../types';

interface PaymentSettingsProps {
  onNotify: (title: string, message: string, level: NotificationLevel) => void;
}

const PaymentSettingsModule: React.FC<PaymentSettingsProps> = ({ onNotify }) => {
  const [activeSubTab, setActiveSubTab] = useState<'payment' | 'whatsapp'>('whatsapp');
  const [showGuide, setShowGuide] = useState(false);
  const [paySettings, setPaySettings] = useState<PaymentSettings>(StorageService.getPaymentSettings());
  const [waSettings, setWaSettings] = useState<WhatsAppSettings>(StorageService.getWhatsAppSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSaveWhatsApp = () => {
    setIsSaving(true);
    setTimeout(() => {
      StorageService.updateWhatsAppSettings(waSettings);
      setIsSaving(false);
      onNotify('Configuración Guardada', 'WhatsApp y Motor de IA actualizados.', NotificationLevel.SUCCESS);
    }, 800);
  };

  const handleTestAi = async () => {
    setIsTestingAi(true);
    const isOnline = await testAiConnection();
    setIsTestingAi(false);
    if (isOnline) {
      onNotify('Conexión Exitosa', 'El motor de IA está respondiendo correctamente.', NotificationLevel.SUCCESS);
    } else {
      onNotify('Error de Conexión', 'No se pudo contactar con la IA. Verifica tu API Key.', NotificationLevel.ERROR);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const variables = [
    { tag: '{{nombre_jugador}}', desc: 'Nombre del usuario' },
    { tag: '{{saldo}}', desc: 'Balance actual' },
    { tag: '{{titular}}', desc: 'Nombre del titular MP' },
    { tag: '{{alias}}', desc: 'Alias de cobro' },
    { tag: '{{cajero}}', desc: 'Nombre del cajero' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Configuración de Integraciones</h2>
          <p className="text-slate-400 mt-1">Gestión de WhatsApp, Mercado Pago y Cerebro IA.</p>
        </div>
        
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 self-start">
          <button 
            onClick={() => setActiveSubTab('whatsapp')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'whatsapp' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <MessageCircle size={18} /> WhatsApp & IA
          </button>
          <button 
            onClick={() => setActiveSubTab('payment')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'payment' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <CreditCard size={18} /> Mercado Pago
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeSubTab === 'whatsapp' ? (
            <div className="space-y-8">
              {/* AI Engine Settings */}
              <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                      <Cpu size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Motor de Inteligencia Artificial</h3>
                      <p className="text-xs text-slate-500">Configura el cerebro que procesa mensajes y fotos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Google Gemini Conectado</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setWaSettings({...waSettings, aiModel: 'gemini-3-flash-preview'})}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${waSettings.aiModel === 'gemini-3-flash-preview' ? 'bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/10' : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <Zap size={20} className={waSettings.aiModel === 'gemini-3-flash-preview' ? 'text-indigo-400' : 'text-slate-500'} />
                      <span className="text-[8px] font-black uppercase tracking-tighter bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-300">Rápido</span>
                    </div>
                    <p className="font-bold text-sm text-white">Gemini 3 Flash</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">Ideal para respuestas instantáneas en el chat y autopilot.</p>
                  </button>

                  <button 
                    onClick={() => setWaSettings({...waSettings, aiModel: 'gemini-3-pro-preview'})}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${waSettings.aiModel === 'gemini-3-pro-preview' ? 'bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/10' : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <Sparkles size={20} className={waSettings.aiModel === 'gemini-3-pro-preview' ? 'text-indigo-400' : 'text-slate-500'} />
                      <span className="text-[8px] font-black uppercase tracking-tighter bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">Preciso</span>
                    </div>
                    <p className="font-bold text-sm text-white">Gemini 3 Pro</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">Mejor para validación de comprobantes y razonamiento complejo.</p>
                  </button>
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    onClick={handleTestAi}
                    disabled={isTestingAi}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 py-3 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center justify-center gap-2"
                  >
                    {isTestingAi ? <Loader2 className="animate-spin" size={14} /> : <Activity size={14} />}
                    Testear Motor de IA
                  </button>
                  <button 
                    onClick={handleSaveWhatsApp}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Aplicar Cambios de IA
                  </button>
                </div>
              </div>

              {/* WhatsApp Config (Simplified UI) */}
              <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                      <Globe size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Conexión con WhatsApp</h3>
                      <p className="text-xs text-slate-500">Credenciales de Meta Business Cloud</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <input 
                      type="password" 
                      value={waSettings.accessToken}
                      onChange={(e) => setWaSettings({...waSettings, accessToken: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-6 text-white font-mono text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Access Token Permanente (Meta)"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        value={waSettings.phoneNumberId}
                        onChange={(e) => setWaSettings({...waSettings, phoneNumberId: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white text-xs outline-none"
                        placeholder="Phone ID"
                      />
                      <input 
                        type="text" 
                        value={waSettings.wabaId}
                        onChange={(e) => setWaSettings({...waSettings, wabaId: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white text-xs outline-none"
                        placeholder="WABA ID"
                      />
                    </div>
                 </div>
              </div>

              {/* Prompt Editor */}
              <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                      <Terminal size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Instrucciones de la IA</h3>
                      <p className="text-xs text-slate-500">Personaliza la personalidad del bot</p>
                    </div>
                </div>
                <textarea 
                  value={waSettings.aiPrompt}
                  onChange={(e) => setWaSettings({...waSettings, aiPrompt: e.target.value})}
                  rows={8}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 text-sm text-emerald-50 font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Mercado Pago API</h3>
                  <p className="text-xs text-slate-500">Automatiza la verificación de depósitos</p>
                </div>
              </div>

              <div className="space-y-4">
                <input 
                  type="password" 
                  value={paySettings.mpAccessToken}
                  onChange={(e) => setPaySettings({...paySettings, mpAccessToken: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-6 text-white font-mono"
                  placeholder="APP_USR-..."
                />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" value={paySettings.alias} onChange={(e) => setPaySettings({...paySettings, alias: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white text-sm" placeholder="Alias" />
                  <input type="text" value={paySettings.cvu} onChange={(e) => setPaySettings({...paySettings, cvu: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white text-xs font-mono" placeholder="CVU" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-3xl space-y-4">
             <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                <Cpu size={24} />
             </div>
             <h4 className="font-bold text-white">¿Cómo funciona la IA?</h4>
             <p className="text-[11px] text-slate-400 leading-relaxed">
               Este CRM utiliza <strong>Google Gemini</strong> como motor principal. No necesitas configurar claves externas, ya que el sistema viene pre-vinculado. 
             </p>
             <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                   <span>Seguridad</span>
                   <span className="text-emerald-400 font-bold">Encriptado</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                   <span>Latencia</span>
                   <span className="text-indigo-400 font-bold">&lt; 1s</span>
                </div>
             </div>
          </div>
          
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl space-y-4">
             <Info className="text-amber-500" />
             <h4 className="font-bold text-white">Próximamente: OpenAI</h4>
             <p className="text-xs text-slate-500">
               Estamos trabajando para añadir soporte a GPT-4o. Pronto podrás elegir tu motor preferido en esta misma pantalla.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsModule;
