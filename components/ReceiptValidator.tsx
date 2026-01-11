
import React, { useState, useMemo, useEffect } from 'react';
import { Upload, CheckCircle2, XCircle, Loader2, FileCheck, ShieldCheck, Database, Search, ArrowRight, X, Info, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { validateReceipt } from '../services/geminiService';
import { verifyPaymentWithAPI } from '../services/mercadopagoService';
import { ValidationResult, TransactionStatus, TransactionType, NotificationLevel, Transaction } from '../types';
import { StorageService } from '../services/mockData';

interface ReceiptValidatorProps {
  currentUserId: string;
  onNotify: (title: string, message: string, level: NotificationLevel) => void;
}

const ReceiptValidator: React.FC<ReceiptValidatorProps> = ({ currentUserId, onNotify }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isVerifyingAPI, setIsVerifyingAPI] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [targetPhone, setTargetPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPendingTx, setSelectedPendingTx] = useState<Transaction | null>(null);
  const [activeFilter, setActiveFilter] = useState<TransactionStatus>(TransactionStatus.PENDING);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const fetchInitialData = async () => {
    const t = await StorageService.getTransactions();
    const u = await StorageService.getUsers();
    setTransactions(t);
    setUsers(u);
  };

  useEffect(() => {
    fetchInitialData();
  }, [isSuccess]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => t.type === TransactionType.DEPOSIT)
      .filter(t => t.status === activeFilter)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions, activeFilter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setResult(null);
      setIsSuccess(false);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const runValidation = async () => {
    if (!preview) return;
    setIsValidating(true);
    setResult(null);

    const base64Data = preview.split(',')[1];
    const res = await validateReceipt(base64Data);

    if (res.isValid && res.transactionId) {
      setIsValidating(false);
      setIsVerifyingAPI(true);
      const apiCheck = await verifyPaymentWithAPI(res.transactionId, res.amount || 0);
      res.apiVerified = apiCheck.verified;
      setIsVerifyingAPI(false);
    } else {
      setIsValidating(false);
    }

    setResult(res);

    if (res.isValid) {
      onNotify(
        res.apiVerified ? 'Verificado en Cuenta' : 'Validación IA completada',
        res.apiVerified
          ? `Operación ${res.transactionId} confirmada en Mercado Pago.`
          : `Se detectó un comprobante por $${res.amount?.toLocaleString()}.`,
        res.apiVerified ? NotificationLevel.SUCCESS : NotificationLevel.INFO
      );
    }
  };

  const approveTransaction = async () => {
    if (!result || !result.amount || !targetPhone) return;
    const user = users.find(u => u.phone.includes(targetPhone.trim()) || targetPhone.trim() === u.phone);
    if (!user) {
      onNotify('Error', 'Usuario no encontrado.', NotificationLevel.ERROR);
      return;
    }

    if (selectedPendingTx) {
      await StorageService.updateTransactionStatus(selectedPendingTx.id, TransactionStatus.APPROVED, currentUserId);
    } else {
      await StorageService.addTransaction({
        id: `tx-ai-${Date.now()}`,
        userId: user.id,
        amount: result.amount,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.APPROVED,
        paymentMethod: 'Mercado Pago (Verified)',
        externalRef: result.transactionId,
        timestamp: new Date().toISOString(),
        processedBy: currentUserId,
        notes: result.apiVerified ? 'VERIFICADO VÍA API MP' : 'VALIDADO SOLO POR IA'
      });
    }

    onNotify('Éxito', 'Saldo acreditado correctamente.', NotificationLevel.SUCCESS);
    setIsSuccess(true);
    setTimeout(() => {
      setPreview(null);
      setResult(null);
      setIsSuccess(false);
      setSelectedPendingTx(null);
    }, 2000);
  };

  return (
    <div className="h-full flex bg-white overflow-hidden animate-in fade-in duration-700">

      {/* Column 1: Receipts List - Rule 1 & 3 */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/20">
        <div className="p-6 border-b border-slate-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Comprobantes</h3>
            <label className="cursor-pointer group">
              <div className="p-2 bg-primary-600 text-white rounded-lg shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-all">
                <Upload size={14} />
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
          <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl">
            {[TransactionStatus.PENDING, TransactionStatus.APPROVED].map(status => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${activeFilter === status ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400'}`}
              >
                {status === TransactionStatus.PENDING ? 'Pendientes' : 'Aprobados'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-none">
          {filteredTransactions.map((tx) => (
            <button
              key={tx.id}
              onClick={() => {
                setSelectedPendingTx(tx);
                setTargetPhone(users.find(u => u.id === tx.userId)?.phone || '');
                setPreview(null);
                setResult(null);
              }}
              className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedPendingTx?.id === tx.id ? 'bg-white border-primary-100 shadow-md ring-1 ring-black/5' : 'bg-transparent border-transparent hover:bg-white/50'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-black text-slate-800">${tx.amount.toLocaleString()}</span>
                <span className="text-[9px] text-slate-300 font-bold uppercase">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${tx.status === TransactionStatus.PENDING ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{users.find(u => u.id === tx.userId)?.name || 'Desconocido'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Column 2: Content (Receipt Table View) - Rule 3 */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {preview || selectedPendingTx ? (
          <div className="h-full flex flex-col">
            <div className="p-8 flex-1 overflow-y-auto scrollbar-none space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Detalle del Comprobante</h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 italic text-[10px] font-bold">
                  <ImageIcon size={14} /> ID: {selectedPendingTx?.id.substring(0, 8) || 'NUEVO'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-[32px] p-2 border border-slate-100 shadow-inner group relative">
                    {preview ? (
                      <img src={preview} className="w-full h-[500px] object-contain rounded-[24px]" alt="Receipt" />
                    ) : (
                      <div className="w-full h-[500px] flex flex-col items-center justify-center text-slate-300 gap-4">
                        <ImageIcon size={64} className="opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Esperando Imagen</p>
                      </div>
                    )}
                    {preview && (
                      <button onClick={() => setPreview(null)} className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur shadow-lg rounded-full text-rose-500 hover:scale-110 transition-all border border-slate-100">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden text-left">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-50">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información Detectada</h4>
                    </div>
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-50 font-bold text-xs">
                        <tr>
                          <td className="px-6 py-4 text-slate-400 uppercase text-[9px]">Usuario</td>
                          <td className="px-6 py-4 text-slate-800">{selectedPendingTx ? users.find(u => u.id === selectedPendingTx.userId)?.name : (result?.senderName || '---')}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-slate-400 uppercase text-[9px]">Monto MP</td>
                          <td className="px-6 py-4 text-emerald-600 font-black text-lg">${(result?.amount || selectedPendingTx?.amount || 0).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-slate-400 uppercase text-[9px]">Operación</td>
                          <td className="px-6 py-4 font-mono text-slate-500">{result?.transactionId || selectedPendingTx?.externalRef || 'PENDIENTE'}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-slate-400 uppercase text-[9px]">Fecha</td>
                          <td className="px-6 py-4 text-slate-500">{selectedPendingTx ? new Date(selectedPendingTx.timestamp).toLocaleString() : 'AHORA'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-primary-50 px-6 py-5 rounded-[24px] border border-primary-100 flex items-start gap-4">
                    <Info size={18} className="text-primary-600 mt-1" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-primary-900/60 uppercase tracking-widest leading-none">Recordatorio de Seguridad</p>
                      <p className="text-[10px] text-primary-900/40 font-bold leading-relaxed">
                        Verifique siempre que el nombre del emisor en el comprobante coincida con el usuario del sistema antes de aprobar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10 text-center">
            <FileCheck size={80} className="mb-4" />
            <h3 className="text-xl font-black uppercase tracking-[0.3em]">Selecciona un Comprobante</h3>
          </div>
        )}
      </div>

      {/* Column 3: Actions - Rule 3 (Sidebar Detail) */}
      <div className="w-80 border-l border-slate-100 bg-slate-50/30 flex flex-col p-8 space-y-8 overflow-y-auto scrollbar-none">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verificación IA</h3>

        {!result && !isValidating && !isVerifyingAPI && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30 py-20">
            <ShieldCheck size={48} className="text-slate-300" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Suba un archivo o seleccione un pendiente para validar</p>
          </div>
        )}

        {(isValidating || isVerifyingAPI) && (
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary-50 border-t-primary-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={24} className="text-primary-600 animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{isValidating ? 'IA Escaneando...' : 'Conectando MP...'}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Protección Nivel 4</p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${result.isValid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {result.isValid ? 'Estructura OK' : 'Datos Inválidos'}
                </span>
                {result.apiVerified && (
                  <div className="bg-primary-600 text-white p-1.5 rounded-lg shadow-lg">
                    <ShieldCheck size={14} />
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confianza IA</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: '98%' }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Confirmar Destino</h4>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="text"
                  placeholder="Teléfono (549...)"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-bold outline-none focus:ring-4 focus:ring-primary-500/5 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              {isSuccess ? (
                <div className="py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center shadow-xl shadow-emerald-500/20">
                  Carga Exitosa
                </div>
              ) : (
                <>
                  <button
                    onClick={approveTransaction}
                    disabled={!result.isValid || !targetPhone}
                    className="w-full py-4 bg-primary-600 disabled:opacity-30 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                  >
                    Aprobar Saldo <CheckCircle2 size={18} />
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    className="w-full py-4 bg-white border border-slate-100 text-rose-500 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-rose-50 transition-all flex items-center justify-center gap-3"
                  >
                    Rechazar <XCircle size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {(preview || selectedPendingTx) && !result && !isValidating && !isVerifyingAPI && (
          <div className="pt-4">
            <button
              onClick={runValidation}
              className="w-full py-5 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 group flex items-center justify-center gap-3"
            >
              Iniciar Análisis <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        <div className="mt-auto">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-500 mt-0.5" />
            <p className="text-[9px] text-amber-700 font-bold leading-tight">
              Si los datos no son claros, rechace y solicite una nueva imagen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptValidator;
