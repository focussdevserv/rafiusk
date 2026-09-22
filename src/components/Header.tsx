import React, { useState } from 'react';
import { Search, ChevronDown, Bell, Settings as SettingsIcon, Sun, Moon, Laptop, Users, FileText, Menu } from 'lucide-react';
import { NavItem } from './Sidebar';
import { AuthUser } from '../types';

interface Props {
  currentTab: NavItem;
  searchTerm: string;
  isDarkMode: boolean;
  currentUser?: AuthUser | null;
  onToggleDarkMode: () => void;
  onSearchChange: (value: string) => void;
  onOpenNewContract: () => void;
  onOpenNewEquipment: () => void;
  onOpenNewClient: () => void;
  onNavigateSettings: () => void;
  onLogout?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<Props> = ({
  currentTab,
  searchTerm,
  isDarkMode,
  currentUser,
  onToggleDarkMode,
  onSearchChange,
  onOpenNewContract,
  onOpenNewEquipment,
  onOpenNewClient,
  onNavigateSettings,
  onLogout,
  onToggleMobileMenu
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between gap-3 sm:gap-6 shrink-0 bg-transparent select-none">
      
      {/* Botão Hambúrguer Mobile e Barra de Busca */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-sm">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-xs active:scale-95"
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

      {/* Right Side: Theme Toggle + Add New Button + Icons + Profile */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Dark Mode Toggle Button */}
        <button
          onClick={onToggleDarkMode}
          className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition active:scale-95 flex items-center justify-center"
          title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 animate-spin-slow" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Dropdown Button "Novo..." */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition active:scale-95"
          >
            <span>Novo...</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-40 text-xs font-semibold text-slate-700 dark:text-slate-200 animate-fade-in">
              <button
                onClick={() => {
                  onOpenNewContract();
                  setDropdownOpen(false);
                }}
                className="w-full px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5 transition text-left"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Novo Contrato</span>
              </button>
              <button
                onClick={() => {
                  onOpenNewEquipment();
                  setDropdownOpen(false);
                }}
                className="w-full px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5 transition text-left"
              >
                <Laptop className="w-4 h-4 text-indigo-600" />
                <span>Novo Equipamento</span>
              </button>
              <button
                onClick={() => {
                  onOpenNewClient();
                  setDropdownOpen(false);
                }}
                className="w-full px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5 transition text-left"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Novo Cliente</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Action Icons */}
        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
          <button 
            onClick={onNavigateSettings}
            className="px-2.5 py-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition flex items-center gap-1.5 text-xs font-bold border border-slate-200 dark:border-slate-800"
            title="Cadastrar / Configurar Chave PIX de Cobrança"
          >
            <span className="text-emerald-500 font-black">PIX</span>
          </button>
          <button 
            onClick={onNavigateSettings}
            className="p-2 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition"
            title="Configurações do Sistema"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
          <button 
            className="p-2 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition relative"
            title="Notificações"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2 right-2 ring-2 ring-white dark:ring-slate-900" />
          </button>
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
            className="w-9 h-9 rounded-xl ring-2 ring-purple-500/20 overflow-hidden bg-black p-1 flex items-center justify-center cursor-pointer shadow-xs"
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
