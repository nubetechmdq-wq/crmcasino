import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { UserRole } from '../types';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface UserImportProps {
    onComplete: () => void;
    onNotify: (title: string, message: string, level: any) => void;
}

const UserImport: React.FC<UserImportProps> = ({ onComplete, onNotify }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const processCSV = async () => {
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',');

            const usersToInsert = lines.slice(1).map(line => {
                const values = line.split(',');
                if (values.length < 2) return null;

                return {
                    name: values[0].trim(),
                    phone: values[1].trim(),
                    role: UserRole.CASHIER,
                    balance: 0,
                    status: 'ACTIVE'
                };
            }).filter(Boolean);

            const { error } = await supabase.from('users').upsert(usersToInsert, { onConflict: 'phone' });

            if (error) {
                onNotify('Error al importar', error.message, 'ERROR');
            } else {
                onNotify('Importación exitosa', `${usersToInsert.length} usuarios importados.`, 'SUCCESS');
                onComplete();
                setFile(null);
            }
            setIsUploading(false);
        };

        reader.readAsText(file);
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                    <Upload size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Importar Usuarios</h3>
                    <p className="text-xs text-slate-500">Sube un archivo CSV con formato: nombre, telefono</p>
                </div>
            </div>

            <div className="relative group">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3 ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
                    }`}>
                    {file ? (
                        <>
                            <FileText className="text-emerald-500" size={32} />
                            <p className="text-sm font-medium text-emerald-400">{file.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Archivo seleccionado</p>
                        </>
                    ) : (
                        <>
                            <Upload className="text-slate-600 group-hover:text-slate-400 transition-colors" size={32} />
                            <p className="text-sm font-medium text-slate-400">Seleccionar archivo CSV</p>
                            <p className="text-[10px] text-slate-600 uppercase font-bold">O arrastra y suelta aquí</p>
                        </>
                    )}
                </div>
            </div>

            {file && (
                <button
                    onClick={processCSV}
                    disabled={isUploading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-wait"
                >
                    {isUploading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        <>
                            Confirmar Importación
                            <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default UserImport;
