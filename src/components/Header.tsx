import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  Bell, 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Laptop, 
  Users, 
  FileText, 
  Menu,
  AlertTriangle,
  DollarSign,
  Wrench,
  CheckCircle2,
  Clock,
  X,
  ExternalLink,
  ShieldAlert,
  Check
} from 'lucide-react';
import { NavItem } from './Sidebar';
import { AuthUser, Invoice, Contract, MaintenanceTicket, Equipment } from '../types';

interface Props {
  currentTab: NavItem;
  searchTerm: string;
  isDarkMode: boolean;
  currentUser?: AuthUser | null;
  invoices?: Invoice[];
  contracts?: Contract[];
  tickets?: MaintenanceTicket[];
  equipments?: Equipment[];
  onToggleDarkMode: () => void;
  onSearchChange: (value: string) => void;
  onOpenNewContract: () => void;
  onOpenNewEquipment: () => void;
  onOpenNewClient: () => void;
  onNavigateSettings: () => void;
  onNavigateTab?: (tab: NavItem) => void;
  onLogout?: () => void;
  onToggleMobileMenu?: () => void;
}

export interface AppNotification {
  id: string;
  type: 'invoice' | 'contract' | 'maintenance' | 'equipment';
  title: string;
  description: string;
  dateStr: string;
  priority: 'critical' | 'warning' | 'info';
  targetTab: NavItem;
}

export const Header: React.FC<Props> = ({
  currentTab,
  searchTerm,
  isDarkMode,
  currentUser,
  invoices = [],
  contracts = [],
  tickets = [],
  equipments = [],
  onToggleDarkMode,
  onSearchChange,
  onOpenNewContract,
  onOpenNewEquipment,
  onOpenNewClient,
  onNavigateSettings,
  onNavigateTab,
  onLogout,
  onToggleMobileMenu
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeNotifFilter, setActiveNotifFilter] = useState<'all' | 'unread'>('all');

  const notificationsRef = useRef<HTMLDivElement>(null);
  const newButtonRef = useRef<HTMLDivElement>(null);

  // Lista de IDs lidos pelo usuário
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('rafiusk_read_notifications') || '[]');
    } catch {
      return [];
    }
  });

  // Salva no localStorage quando os IDs lidos mudam
  useEffect(() => {
    try {
      localStorage.setItem('rafiusk_read_notifications', JSON.stringify(readIds));
    } catch (e) {
      console.error(e);
    }
  }, [readIds]);

  // Click outside para fechar os menus suspensos
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (newButtonRef.current && !newButtonRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Construção em tempo real das notificações reais do sistema
  const systemNotifications = useMemo<AppNotification[]>(() => {
    const list: AppNotification[] = [];
    const now = new Date();

    // 1. Faturas Vencidas
    invoices.forEach(inv => {
      const dueDate = new Date(inv.dueDate);
      const isPast = dueDate < now && inv.status !== 'paid';
      if (inv.status === 'overdue' || isPast) {
        list.push({
          id: `notif-inv-overdue-${inv.id}`,
          type: 'invoice',
          title: `Fatura Vencida • ${inv.invoiceNumber}`,
          description: `${inv.clientName} possui pendência de R$ ${inv.amount.toFixed(2)} vencida em ${dueDate.toLocaleDateString('pt-BR')}.`,
          dateStr: 'Vencida',
          priority: 'critical',
          targetTab: 'financial'
        });
      } else if (inv.status === 'pending') {
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 5) {
          list.push({
            id: `notif-inv-pending-${inv.id}`,
            type: 'invoice',
            title: `Vencimento Próximo • ${inv.invoiceNumber}`,
            description: `${inv.clientName} - R$ ${inv.amount.toFixed(2)} vence ${diffDays === 0 ? 'hoje' : `em ${diffDays} dias`}.`,
            dateStr: diffDays === 0 ? 'Hoje' : `Em ${diffDays}d`,
            priority: 'warning',
            targetTab: 'financial'
          });
        }
      }
    });

    // 2. Chamados de Suporte / Manutenção
    tickets.forEach(ticket => {
      if (ticket.status === 'open') {
        list.push({
          id: `notif-ticket-open-${ticket.id}`,
          type: 'maintenance',
          title: `Chamado Técnico Aberto • ${ticket.ticketNumber}`,
          description: `${ticket.equipmentTag} (${ticket.clientName}): "${ticket.issueDescription.slice(0, 60)}${ticket.issueDescription.length > 60 ? '...' : ''}"`,
          dateStr: 'Aberto',
          priority: ticket.isSwapRequested || ticket.priority === 'critical' ? 'critical' : 'warning',
          targetTab: 'maintenance'
        });
      } else if (ticket.status === 'in_progress') {
        list.push({
          id: `notif-ticket-progress-${ticket.id}`,
          type: 'maintenance',
          title: `Máquina em Reparo • ${ticket.ticketNumber}`,
          description: `${ticket.equipmentTag} em bancada para manutenção técnica.`,
          dateStr: 'Em Reparo',
          priority: 'info',
          targetTab: 'maintenance'
        });
      }
    });

    // 3. Contratos a Expirar
    contracts.forEach(ctr => {
      if (ctr.status === 'active') {
        const endDate = new Date(ctr.endDate);
        const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 15) {
          list.push({
            id: `notif-ctr-exp-${ctr.id}`,
            type: 'contract',
            title: `Contrato Próximo do Término • ${ctr.contractNumber}`,
            description: `${ctr.clientName} - encerramento previsto para ${endDate.toLocaleDateString('pt-BR')} (${diffDays} dias restantes).`,
            dateStr: `${diffDays}d restantes`,
            priority: diffDays <= 5 ? 'warning' : 'info',
            targetTab: 'contracts'
          });
        }
      }
    });

    // 4. Equipamentos com status Manutenção
    equipments.forEach(eq => {
      if (eq.status === 'maintenance') {
        list.push({
          id: `notif-eq-maint-${eq.id}`,
          type: 'equipment',
          title: `Equipamento Indisponível • ${eq.tag}`,
          description: `${eq.brand} ${eq.model} recolhido para reparos técnicos ou peças.`,
          dateStr: 'Manutenção',
          priority: 'info',
          targetTab: 'equipments'
        });
      }
    });

    return list;
  }, [invoices, tickets, contracts, equipments]);

  const unreadCount = useMemo(() => {
    return systemNotifications.filter(n => !readIds.includes(n.id)).length;
  }, [systemNotifications, readIds]);

  const displayedNotifications = useMemo(() => {
    if (activeNotifFilter === 'unread') {
      return systemNotifications.filter(n => !readIds.includes(n.id));
    }
    return systemNotifications;
  }, [systemNotifications, activeNotifFilter, readIds]);

  const handleMarkAllRead = () => {
    const allIds = systemNotifications.map(n => n.id);
    setReadIds(allIds);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!readIds.includes(notif.id)) {
      setReadIds(prev => [...prev, notif.id]);
    }
    setNotificationsOpen(false);
    if (onNavigateTab) {
      onNavigateTab(notif.targetTab);
    }
  };

  const handleDismissNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!readIds.includes(id)) {
      setReadIds(prev => [...prev, id]);
    }
  };

  return (
    <header className="h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between gap-3 sm:gap-6 shrink-0 bg-transparent select-none relative z-30">
      
      {/* Botão Hambúrguer Mobile e Barra de Busca */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-sm">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-xs active:scale-95 transition"
            title="Abrir Menu de Navegação"
          >
            <Menu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </button>
        )}

        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar no sistema..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-4 pr-9 py-2 sm:py-2.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-xs transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Right Side: Theme Toggle + Add New Button + Central Notificações + Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        {/* Dark Mode Toggle Button */}
        <button
          onClick={onToggleDarkMode}
          className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition active:scale-95 flex items-center justify-center cursor-pointer"
          title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 animate-spin-slow" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Dropdown Button "Novo..." */}
        <div className="relative" ref={newButtonRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <span>Novo...</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 text-xs font-semibold text-slate-700 dark:text-slate-200 animate-fade-in">
              <button
                onClick={() => {
                  onOpenNewContract();
                  setDropdownOpen(false);
                }}
                className="w-full px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5 transition text-left cursor-pointer"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Novo Contrato</span>
              </button>
              <button
                onClick={() => {
                  onOpenNewEquipment();
                  setDropdownOpen(false);
                }}
                className="w-full px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5 transition text-left cursor-pointer"
              >
                <Laptop className="w-4 h-4 text-indigo-600" />
                <span>Novo Equipamento</span>
              </button>
              <button
                onClick={() => {
                  onOpenNewClient();
                  setDropdownOpen(false);
                }}
                className="w-full px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5 transition text-left cursor-pointer"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Novo Cliente</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Action Icons: PIX + Settings + SININHO REAL DE NOTIFICAÇÕES */}
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
          
          <button 
            onClick={onNavigateSettings}
            className="px-2.5 py-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition flex items-center gap-1.5 text-xs font-bold border border-slate-200 dark:border-slate-800 cursor-pointer"
            title="Cadastrar / Configurar Chave PIX da Empresa"
          >
            <span className="text-emerald-500 font-black">PIX</span>
          </button>

          <button 
            onClick={onNavigateSettings}
            className="p-2 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition cursor-pointer"
            title="Configurações do Sistema"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Central de Notificações Interativa */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`p-2 rounded-xl transition relative cursor-pointer ${
                notificationsOpen 
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' 
                  : 'hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-900'
              }`}
              title="Central de Notificações Operacionais"
            >
              <Bell className="w-4 h-4" />
              
              {/* Badge de Não Lidas */}
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] bg-rose-600 text-white font-black text-[10px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : systemNotifications.length > 0 ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 ring-2 ring-white dark:ring-slate-900" />
              ) : null}
            </button>

            {/* Painel Dropdown de Notificações */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden z-50 animate-fade-in flex flex-col max-h-[85vh]">
                
                {/* Header do Painel */}
                <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-black tracking-wide">Notificações Operacionais</span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                        {unreadCount} novas
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-purple-300 hover:text-white font-semibold transition flex items-center gap-1 cursor-pointer"
                      title="Marcar todas como lidas"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Ler todas</span>
                    </button>
                  )}
                </div>

                {/* Filtro: Todas / Não Lidas */}
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveNotifFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                        activeNotifFilter === 'all'
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      Todas ({systemNotifications.length})
                    </button>
                    <button
                      onClick={() => setActiveNotifFilter('unread')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                        activeNotifFilter === 'unread'
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      Pendentes ({unreadCount})
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400">Tempo real</span>
                </div>

                {/* Lista de Notificações */}
                <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[380px]">
                  {displayedNotifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {activeNotifFilter === 'unread' ? 'Nenhuma notificação não lida!' : 'Tudo em dia na RAFIUSK!'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">
                          {activeNotifFilter === 'unread' 
                            ? 'Você visualizou todos os alertas operacionais.' 
                            : 'Nenhuma pendência financeira, incidente técnico ou contrato expirando no momento.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    displayedNotifications.map(notif => {
                      const isRead = readIds.includes(notif.id);

                      const iconBg = {
                        critical: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900',
                        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
                        info: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                      }[notif.priority];

                      const IconComponent = {
                        invoice: DollarSign,
                        maintenance: Wrench,
                        contract: FileText,
                        equipment: Laptop
                      }[notif.type];

                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3.5 transition flex items-start gap-3 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                            isRead ? 'opacity-70 bg-white dark:bg-slate-900' : 'bg-purple-50/40 dark:bg-purple-950/20'
                          }`}
                        >
                          {/* Ícone Temático */}
                          <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${iconBg}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>

                          {/* Conteúdo */}
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs font-black truncate ${isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                {notif.title}
                              </p>
                              <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                {notif.dateStr}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {notif.description}
                            </p>

                            <div className="pt-1 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:underline">
                                <span>Acessar módulo</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </span>

                              {!isRead && (
                                <button
                                  onClick={(e) => handleDismissNotification(e, notif.id)}
                                  className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                                  title="Marcar como lida"
                                >
                                  Dispensar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer do Dropdown */}
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-[10px] text-slate-500">
                    Sistema de telemetria e alertas em tempo real • <strong>RAFIUSK INFORMÁTICA</strong>
                  </p>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* User Profile Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200/80 dark:border-slate-800">
          <div 
            onClick={onNavigateSettings}
            className="text-right cursor-pointer group"
          >
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
              {currentUser?.name || 'Administrador Rafiusk'}
            </span>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {currentUser?.role === 'admin' ? 'Gestor Geral TI' : 'Operador Rafiusk'}
            </span>
          </div>
          <div 
            onClick={onLogout ? onLogout : onNavigateSettings}
            className="w-9 h-9 rounded-xl ring-2 ring-purple-500/20 overflow-hidden bg-black p-1 flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition"
            title="Clique para Sair ou Configurar"
          >
            <img 
              src={currentUser?.avatarUrl || "/assets/logo_rafiusk_web.png"} 
              alt="Avatar Rafiusk" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

      </div>
    </header>
  );
};
