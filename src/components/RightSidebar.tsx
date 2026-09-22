import React from 'react';
import { Calendar as CalendarIcon, MessageCircle, Mail, Laptop } from 'lucide-react';
import { Client, Equipment, Contract } from '../types';

interface Props {
  clients: Client[];
  equipments: Equipment[];
  contracts: Contract[];
  onOpenWhatsApp: (client: Client) => void;
  onOpenEmail: (client: Client) => void;
  onViewAllClients: () => void;
  onViewAllEquipments: () => void;
}

export const RightSidebar: React.FC<Props> = ({
  clients,
  equipments,
  onOpenWhatsApp,
  onOpenEmail,
  onViewAllClients,
  onViewAllEquipments
}) => {
  const weekDays = [
    { day: 'Seg', date: '21', active: false },
    { day: 'Ter', date: '22', active: true },
    { day: 'Qua', date: '23', active: false },
    { day: 'Qui', date: '24', active: false },
    { day: 'Sex', date: '25', active: false },
  ];

  const availableEquipments = equipments.filter(e => e.status === 'available').slice(0, 3);

  return (
    <aside className="w-80 bg-white dark:bg-slate-900/90 border-l border-slate-100 dark:border-slate-800/80 flex flex-col shrink-0 p-6 space-y-6 overflow-y-auto select-none transition-colors">
      {/* Schedule Calendar Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
          <span>Agenda & Entregas</span>
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-semibold cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[11px]">Hoje</span>
          </div>
        </div>

        {/* Days of week row */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          {weekDays.map(item => (
            <div
              key={item.date}
              className={`flex-1 py-2.5 rounded-2xl flex flex-col items-center justify-center transition cursor-pointer ${
                item.active
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25 scale-105'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span className="text-[10px] font-medium leading-none">{item.day}</span>
              <span className="text-sm font-extrabold mt-1 leading-none">{item.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* New Clients / Locatários Recentes */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Clientes & Contatos</span>
          <button 
            onClick={onViewAllClients}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline transition"
          >
            Ver todos
          </button>
        </div>

        <div className="space-y-2.5">
          {clients.slice(0, 5).map((client, idx) => {
            const avatarColors = [
              'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
              'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
              'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
              'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
              'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
            ];
            const colorClass = avatarColors[idx % avatarColors.length];

            return (
              <div 
                key={client.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${colorClass}`}>
                    {client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="max-w-[130px]">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate block leading-tight">
                      {client.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block">
                      {client.type === 'PJ' ? 'Empresa PJ' : 'Pessoa Física'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenWhatsApp(client)}
                    className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white flex items-center justify-center transition shadow-2xs"
                    title="WhatsApp (Evolution API)"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onOpenEmail(client)}
                    className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white flex items-center justify-center transition shadow-2xs"
                    title="E-mail (Resend)"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ready for Rental / Prontos para Entrega */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Prontos no Estoque</span>
          <button 
            onClick={onViewAllEquipments}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline transition"
          >
            Ver todos
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {availableEquipments.map(eq => (
            <div 
              key={eq.id}
              className="p-3 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-1.5 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                <Laptop className="w-4 h-4" />
              </div>
              <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 block truncate">
                {eq.model}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">
                {eq.tag}
              </span>
              <div className="pt-1">
                <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full inline-block">
                  R$ {eq.monthlyRate}/mês
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
