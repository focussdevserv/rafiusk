import { 
  LayoutDashboard, 
  Laptop, 
  Users, 
  FileText, 
  ClipboardCheck, 
  DollarSign, 
  Wrench, 
  BarChart3, 
  Settings,
  LogOut,
  Smartphone,
  Zap,
  Send,
  FileCheck,
  X
} from 'lucide-react';

export type NavItem = 
  | 'dashboard' 
  | 'quick-rental'
  | 'equipments' 
  | 'clients' 
  | 'contracts' 
  | 'proposals'
  | 'checklists' 
  | 'financial' 
  | 'maintenance' 
  | 'client-portal'
  | 'whatsapp-center'
  | 'reports' 
  | 'settings';

interface Props {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  isWhatsAppConnected: boolean;
  onOpenWhatsAppConnect: () => void;
  pendingInvoicesCount: number;
  openTicketsCount: number;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<Props> = ({ 
  currentTab, 
  onSelectTab, 
  isWhatsAppConnected, 
  onOpenWhatsAppConnect,
  pendingInvoicesCount,
  openTicketsCount,
  onLogout,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const menuItems = [
    { id: 'dashboard' as NavItem, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quick-rental' as NavItem, label: 'Nova Locação', icon: Zap },
    { id: 'equipments' as NavItem, label: 'Equipamentos', icon: Laptop },
    { id: 'clients' as NavItem, label: 'Clientes', icon: Users },
    { id: 'contracts' as NavItem, label: 'Contratos', icon: FileText },
    { id: 'proposals' as NavItem, label: 'Propostas B2B', icon: FileCheck },
    { id: 'checklists' as NavItem, label: 'Vistorias', icon: ClipboardCheck },
    { 
      id: 'financial' as NavItem, 
      label: 'Financeiro', 
      icon: DollarSign,
      badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : undefined
    },
    { 
      id: 'maintenance' as NavItem, 
      label: 'Suporte & Swap', 
      icon: Wrench,
      badge: openTicketsCount > 0 ? openTicketsCount : undefined
    },
    { id: 'client-portal' as NavItem, label: 'Portal do Cliente', icon: Smartphone },
    { id: 'whatsapp-center' as NavItem, label: 'Central WhatsApp', icon: Send },
    { id: 'reports' as NavItem, label: 'Relatórios', icon: BarChart3 },
    { id: 'settings' as NavItem, label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Backdrop para Mobile quando o menu estiver aberto */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-56 bg-white dark:bg-slate-900 flex flex-col shrink-0 min-h-full py-6 px-4 select-none border-r border-slate-100 dark:border-slate-800/80 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Logo Oficial RAFIUSK & Botão Fechar no Mobile */}
        <div className="flex items-center justify-between px-1 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-black p-1.5 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-purple-950/20">
              <img 
                src="/assets/logo_rafiusk_web.png" 
                alt="RAFIUSK INFORMÁTICA" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="overflow-hidden">
              <span className="font-black text-slate-900 dark:text-white text-sm tracking-wider uppercase block truncate leading-tight">
                RAFIUSK
              </span>
              <span className="text-[9px] font-extrabold text-purple-600 dark:text-purple-400 tracking-widest uppercase block truncate -mt-0.5">
                INFORMÁTICA
              </span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav Menu Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive 
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-bold shadow-xs' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom WhatsApp Connection & Logout */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <button
          onClick={onOpenWhatsAppConnect}
          className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
            isWhatsAppConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/70'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100/70'
          }`}
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">
              {isWhatsAppConnected ? 'WhatsApp Online' : 'Parear WhatsApp'}
            </span>
          </div>
          <span className={`w-2 h-2 rounded-full ${isWhatsAppConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
        </button>

        <button 
          onClick={onLogout ? onLogout : () => onSelectTab('settings')}
          className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
    </>
  );
};
