
import React, { useState, useMemo, useEffect } from 'react';
import { Upload, CheckCircle2, XCircle, Loader2, FileCheck, ShieldCheck, Database } from 'lucide-react';
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

    // 1. Análisis de IA
    const base64Data = preview.split(',')[1];
    const res = await validateReceipt(base64Data);

    if (res.isValid && res.transactionId) {
      setIsValidating(false);
      setIsVerifyingAPI(true);

      // 2. Verificación cruzada con API
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
          : `Se detectó un comprobante por $${res.amount?.toLocaleString()}. Verifique manualmente en MP.`,
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
    resetForm();
  };

  const resetForm = () => {
    setTimeout(() => {
      setPreview(null);
      setResult(null);
      setIsSuccess(false);
      setTargetPhone('');
      setSelectedPendingTx(null);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Validación de Comprobantes</h2>
          <p className="text-slate-400 mt-1">Cross-Check entre Inteligencia Artificial y la API de Mercado Pago.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 flex flex-col h-full max-h-[750px]">
          <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-2xl mb-6">
            {(Object.values(TransactionStatus)).map(status => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`py-2 text-[10px] font-bold rounded-xl transition-all ${activeFilter === status ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            {filteredTransactions.map((tx) => (
              <button
                key={tx.id}
                onClick={() => { setSelectedPendingTx(tx); setTargetPhone(users.find(u => u.id === tx.userId)?.phone || ''); }}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedPendingTx?.id === tx.id ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-900/50 border-slate-700/50'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-white">${tx.amount.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono truncate">{tx.id}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Area */}
            <div className="space-y-4">
              <div className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center min-h-[350px] transition-all ${preview ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 bg-slate-800/40'}`}>
                {preview ? (
                  <div className="relative w-full">
                    <img src={preview} className="w-full h-72 object-contain rounded-xl shadow-xl" />
                    <button onClick={() => setPreview(null)} className="absolute -top-2 -right-2 bg-slate-900 p-2 rounded-full text-rose-400"><XCircle size={20} /></button>
                  </div>
                ) : (
                  <label className="cursor-pointer text-center group">
                    <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-500 transition-colors">
                      <Upload className="text-white" />
                    </div>
                    <p className="font-bold text-slate-300">Sube el comprobante</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </div>
              <input
                type="text"
                placeholder="Teléfono del usuario..."
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status Panel */}
            <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 flex flex-col min-h-[400px]">
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-6 flex items-center gap-2">
                <ShieldCheck size={16} /> Verificación Automática
              </h3>

              {!result && !isValidating && !isVerifyingAPI && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center">
                  <FileCheck size={48} className="mb-4" />
                  <p className="text-xs max-w-[150px]">Listo para analizar comprobante</p>
                  {preview && (
                    <button onClick={runValidation} className="mt-6 w-full bg-emerald-500 py-3 rounded-xl font-bold text-white">Analizar Ahora</button>
                  )}
                </div>
              )}

              {(isValidating || isVerifyingAPI) && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <Loader2 className="animate-spin text-emerald-500" size={40} />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{isValidating ? 'IA Analizando Imagen...' : 'Consultando API Mercado Pago...'}</p>
                    <p className="text-[10px] text-slate-500">{isValidating ? 'Extrayendo ID de operación y montos' : 'Validando existencia en cuenta'}</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className={`p-4 rounded-2xl border ${result.isValid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Resultado</span>
                      {result.apiVerified && <div className="flex items-center gap-1 bg-emerald-500 text-white px-2 py-0.5 rounded text-[8px] font-black"><Database size={8} /> API VERIFIED</div>}
                    </div>
                    <p className="text-2xl font-black text-white">${result.amount?.toLocaleString()}</p>
                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] text-slate-500">Operación: <span className="text-slate-300 font-mono">{result.transactionId}</span></p>
                      <p className="text-[10px] text-slate-500">Nombre: <span className="text-slate-300">{result.senderName}</span></p>
                    </div>
                  </div>

                  {isSuccess ? (
                    <div className="bg-emerald-500 text-white p-4 rounded-xl text-center font-bold">CARGA EXITOSA</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setResult(null)} className="bg-slate-700 py-3 rounded-xl font-bold">Cancelar</button>
                      <button onClick={approveTransaction} disabled={!result.isValid} className="bg-emerald-500 py-3 rounded-xl font-bold text-white">Aprobar</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptValidator;
