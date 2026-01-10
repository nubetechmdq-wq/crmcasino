
import React, { useEffect, useState } from 'react';
import { Bell, X, CheckCircle2, AlertCircle, Info, Trash2, Clock } from 'lucide-react';
import { AppNotification, NotificationLevel } from '../types';

interface NotificationProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  onClearAll,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="text-emerald-400" size={20} />
          <h3 className="font-bold text-lg">Notificaciones</h3>
          <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {notifications.filter(n => !n.isRead).length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClearAll} className="text-slate-500 hover:text-rose-400 transition-colors p-2" title="Limpiar todo">
            <Trash2 size={18} />
          </button>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-50">
            <Bell size={48} />
            <p className="text-sm font-medium">Sin notificaciones nuevas</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => onMarkAsRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                n.isRead ? 'bg-slate-800/20 border-slate-800/50' : 'bg-slate-800 border-slate-700 shadow-lg'
              }`}
            >
              {!n.isRead && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              )}
              <div className="flex gap-3">
                <div className={`mt-0.5 ${
                  n.level === NotificationLevel.SUCCESS ? 'text-emerald-400' :
                  n.level === NotificationLevel.ERROR ? 'text-rose-400' :
                  n.level === NotificationLevel.WARNING ? 'text-amber-400' : 'text-blue-400'
                }`}>
                  {n.level === NotificationLevel.SUCCESS && <CheckCircle2 size={18} />}
                  {n.level === NotificationLevel.ERROR && <AlertCircle size={18} />}
                  {n.level === NotificationLevel.WARNING && <AlertCircle size={18} />}
                  {n.level === NotificationLevel.INFO && <Info size={18} />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${n.isRead ? 'text-slate-400' : 'text-white'}`}>{n.title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-600 font-medium uppercase tracking-wider">
                    <Clock size={10} />
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                className="absolute -right-2 -top-2 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const NotificationToast: React.FC<{ notification: AppNotification; onDismiss: (id: string) => void }> = ({ 
  notification, 
  onDismiss 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notification.id), 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const levelStyles = {
    [NotificationLevel.SUCCESS]: 'border-emerald-500/50 bg-slate-900/90 text-emerald-400 shadow-emerald-500/10',
    [NotificationLevel.ERROR]: 'border-rose-500/50 bg-slate-900/90 text-rose-400 shadow-rose-500/10',
    [NotificationLevel.WARNING]: 'border-amber-500/50 bg-slate-900/90 text-amber-400 shadow-amber-500/10',
    [NotificationLevel.INFO]: 'border-blue-500/50 bg-slate-900/90 text-blue-400 shadow-blue-500/10',
  };

  return (
    <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full duration-500 pointer-events-auto min-w-[320px] mb-3 ${levelStyles[notification.level]}`}>
      <div className="shrink-0">
        {notification.level === NotificationLevel.SUCCESS && <CheckCircle2 size={24} />}
        {notification.level === NotificationLevel.ERROR && <AlertCircle size={24} />}
        {notification.level === NotificationLevel.WARNING && <AlertCircle size={24} />}
        {notification.level === NotificationLevel.INFO && <Info size={24} />}
      </div>
      <div className="flex-1">
        <p className="font-bold text-sm text-white">{notification.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{notification.message}</p>
      </div>
      <button onClick={() => onDismiss(notification.id)} className="text-slate-500 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
};
