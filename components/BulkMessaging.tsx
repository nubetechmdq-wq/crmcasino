import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Send, Users, AlertCircle, CheckCircle2, Loader2, MessageSquare } from 'lucide-react';

interface BulkMessagingProps {
    onNotify: (title: string, message: string, level: any) => void;
}

const BulkMessaging: React.FC<BulkMessagingProps> = ({ onNotify }) => {
    const [message, setMessage] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('users').select('*').order('name');
        if (data) setUsers(data);
        setIsLoading(false);
    };

    const toggleUserSelection = (id: string) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u.id));
        }
    };

    const handleSend = async () => {
        if (!message || selectedUsers.length === 0) return;

        setIsSending(true);

        // Here we would integrate with actual WhatsApp API
        // For now, we simulate the broadcast record
        const { error } = await supabase.from('broadcasts').insert({
            message_text: message,
            recipient_count: selectedUsers.length,
            status: 'SENT'
        });

        if (error) {
            onNotify('Error al registrar envío', error.message, 'ERROR');
        } else {
            onNotify('Mensajes en cola', `Se están enviando ${selectedUsers.length} mensajes via WhatsApp.`, 'SUCCESS');
            setMessage('');
            setSelectedUsers([]);
        }

        setIsSending(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Mensajes Masivos</h2>
                    <p className="text-slate-400 mt-1">Envía promociones o avisos a tus jugadores por WhatsApp.</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/50">
                    <div className="px-4 py-2 text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Seleccionados</p>
                        <p className="text-xl font-black text-emerald-400">{selectedUsers.length}</p>
                    </div>
                    <button
                        onClick={selectAll}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
                    >
                        {selectedUsers.length === users.length ? 'Desmarcar Todos' : 'Seleccionar Todos'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Selection List */}
                <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Users size={16} className="text-emerald-500" />
                            Destinatarios
                        </h3>
                        <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded">
                            {users.length} TOTAL
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-20 text-slate-500">
                                <Loader2 size={24} className="animate-spin" />
                            </div>
                        ) : (
                            users.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => toggleUserSelection(user.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group ${selectedUsers.includes(user.id)
                                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                                            : 'hover:bg-slate-800/50 border border-transparent'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedUsers.includes(user.id) ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                                        }`}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${selectedUsers.includes(user.id) ? 'text-emerald-400' : 'text-slate-200'}`}>
                                            {user.name}
                                        </p>
                                        <p className="text-[10px] font-mono text-slate-500">{user.phone}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Message Composer */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
                        <div>
                            <label className="text-sm font-bold text-slate-300 ml-1 mb-2 block uppercase tracking-widest">
                                Contenido del Mensaje
                            </label>
                            <div className="relative">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Escribe tu mensaje aquí... Ej: ¡Hola! Te avisamos que ya puedes cargar saldo con nuestro nuevo alias 🎰🔥"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white outline-none focus:ring-2 focus:ring-emerald-500 min-h-[250px] resize-none transition-all"
                                />
                                <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-600 uppercase">
                                    {message.length} Caracteres
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex gap-3">
                            <AlertCircle size={20} className="text-amber-500 shrink-0" />
                            <p className="text-xs text-amber-200/70 leading-relaxed">
                                <strong className="text-amber-500 block mb-1">Nota de Seguridad:</strong>
                                Evita enviar demasiados mensajes idénticos en poco tiempo para prevenir el bloqueo de tu cuenta de WhatsApp. Recomendamos usar variables y un lenguaje natural.
                            </p>
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={isSending || selectedUsers.length === 0 || !message}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    PROCESANDO ENVÍO...
                                </>
                            ) : (
                                <>
                                    ENVIAR A {selectedUsers.length} USUARIOS
                                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Enviados</p>
                                <p className="text-2xl font-black text-white">0</p>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Jugadores Activos</p>
                                <p className="text-2xl font-black text-white">{users.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkMessaging;
