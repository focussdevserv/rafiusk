import React from 'react';
import { 
  Laptop, 
  Monitor, 
  Server, 
  Cpu, 
  MoreVertical, 
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Repeat,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Equipment, Client, Contract, Invoice, MaintenanceTicket } from '../types';

interface Props {
  equipments: Equipment[];
  clients: Client[];
  contracts: Contract[];
  invoices: Invoice[];
  tickets: MaintenanceTicket[];
  onNavigate: (tab: any) => void;
  onNewContract: () => void;
  onNewEquipment: () => void;
}

export const DashboardView: React.FC<Props> = ({
  equipments,
  contracts,
  onNavigate,
  onNewContract,
  onNewEquipment
}) => {
  const activeContracts = contracts.filter(c => c.status === 'active');
  const mrr = activeContracts.reduce((sum, c) => sum + c.monthlyTotal, 0);
  const rentedCount = equipments.filter(e => e.status === 'rented').length;
  const availableCount = equipments.filter(e => e.status === 'available').length;
  const occupancyRate = equipments.length > 0 ? Math.round((rentedCount / equipments.length) * 100) : 0;

  const categories = [
    {
      title: 'Notebooks',
      count: equipments.filter(e => e.type === 'notebook').length,
      rented: equipments.filter(e => e.type === 'notebook' && e.status === 'rented').length,
      icon: Laptop,
      bgColor: 'bg-blue-600',
    },
    {
      title: 'Desktops',
      count: equipments.filter(e => e.type === 'desktop').length,
      rented: equipments.filter(e => e.type === 'desktop' && e.status === 'rented').length,
      icon: Monitor,
      bgColor: 'bg-orange-500',
    },
    {
      title: 'Workstations',
      count: equipments.filter(e => e.type === 'workstation').length,
      rented: equipments.filter(e => e.type === 'workstation' && e.status === 'rented').length,
      icon: Cpu,
      bgColor: 'bg-rose-500',
    },
    {
      title: 'Servidores',
      count: equipments.filter(e => e.type === 'server').length,
      rented: equipments.filter(e => e.type === 'server' && e.status === 'rented').length,
      icon: Server,
      bgColor: 'bg-emerald-500',
    },
    {
      title: 'Monitores',
      count: equipments.filter(e => e.type === 'monitor').length,
      rented: equipments.filter(e => e.type === 'monitor' && e.status === 'rented').length,
      icon: Monitor,
      bgColor: 'bg-purple-600',
    },
  ];

  const monthlyRevenueData = [
    { month: 'Abr', value: 3400, height: '40%' },
    { month: 'Mai', value: 4200, height: '52%' },
    { month: 'Jun', value: 5100, height: '64%' },
    { month: 'Jul', value: 6800, height: '80%' },
    { month: 'Ago', value: 7400, height: '88%' },
    { month: 'Set', value: 8900, height: '100%', active: true },
  ];

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* 1. Hero Banner Principal com Mockup Realista de Hardware & Identidade RAFIUSK */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 rounded-[32px] p-6 sm:p-8 text-white shadow-2xl shadow-purple-950/30 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-purple-500/20">
        
        {/* Glows Decorativos de Fundo */}
        <div className="absolute -left-10 -top-10 w-72 h-72 bg-purple-600/30 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute right-1/4 -bottom-10 w-72 h-72 bg-blue-600/25 rounded-full blur-[90px] pointer-events-none" />

        <div className="space-y-4 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-[11px] font-extrabold backdrop-blur-md border border-purple-400/30">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="tracking-wide uppercase">RAFIUSK INFORMÁTICA • FROTA CORPORATIVA</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Gestão Operacional de TI
          </h2>

          <p className="text-purple-100/90 text-xs sm:text-sm font-medium leading-relaxed">
            Você possui <strong className="text-white underline decoration-purple-400 underline-offset-4">{rentedCount} computadores ativos</strong> em clientes e <strong className="text-emerald-400 font-bold">{availableCount} máquinas prontas</strong> no estoque para locação imediata.
          </p>

          {/* Quick Metrics Bar inside Hero */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-[11px] text-purple-200 font-medium">
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Frota 100% Homologada
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              SLA Troca Rápida 24h
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Contratos & PIX Integrado
            </span>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onNewContract}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-600/30 transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Novo Contrato</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNewEquipment}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 backdrop-blur-md transition active:scale-95 cursor-pointer"
            >
              Adicionar Máquina
            </button>
          </div>
        </div>

        {/* Mockup do Mascote Oficial RAFIUSK */}
        <div className="relative z-10 shrink-0 w-full sm:w-80 lg:w-96 flex items-center justify-center">
          <div className="relative group w-full">
            {/* Glows de Fundo do Mascote */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition duration-500" />
            
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-purple-400/30 bg-gradient-to-b from-purple-950/80 via-slate-950/90 to-black p-5 flex flex-col items-center justify-center backdrop-blur-xl">
              
              {/* Pedestal & Reflexo Holográfico */}
              <div className="relative w-full h-56 sm:h-64 flex items-center justify-center">
                <div className="absolute bottom-2 w-44 h-12 bg-purple-600/30 rounded-full blur-xl pointer-events-none" />
                <div className="absolute bottom-4 w-36 h-6 bg-indigo-500/40 rounded-full blur-md pointer-events-none" />
                
                {/* Imagem do Mascote Oficial em Alta Definição */}
                <img
                  src="/assets/mascot/mascot_presenting.png"
                  alt="Mascote Oficial RAFIUSK INFORMÁTICA"
                  className="relative z-10 max-h-56 sm:max-h-60 object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] transform group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500"
                />

                {/* Badge Flutuante no Topo com "R" Roxo */}
                <div className="absolute top-1 right-1 bg-purple-500/20 backdrop-blur-md border border-purple-400/40 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase text-purple-200 tracking-wider flex items-center gap-1 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Mascote Oficial</span>
                </div>
              </div>

              {/* Card de Status da Frota e Suporte no Pé do Mascote */}
              <div className="w-full bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-2xl p-2.5 flex items-center justify-between text-[11px] shadow-lg mt-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-extrabold text-white tracking-tight">RAFIUSK ASSIST</span>
                </div>
                <span className="font-mono font-black text-purple-300 text-[10px] bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-500/20">
                  SLA &lt; 24H
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 2. Mini Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">MRR Contratado</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {mrr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
            +18.4%
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">Taxa de Ocupação</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">{occupancyRate}%</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
            Alta Demanda
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">Taxa de Renovação</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">96.8%</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
            Excelente
          </span>
        </div>
      </div>

      {/* 3. Categorias de Hardware */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Categorias de Equipamentos</h3>
          <button
            onClick={() => onNavigate('equipments')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline transition"
          >
            Ver todos
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate('equipments')}
                className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col items-center text-center group"
              >
                <div className={`w-11 h-11 rounded-2xl ${cat.bgColor} text-white flex items-center justify-center shadow-md shadow-slate-200 dark:shadow-none mb-3 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition block leading-tight">
                  {cat.title}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">
                  ({cat.count} máquinas)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Andamento das Locações & Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Andamento dos Contratos de Locação</h3>
            <button
              onClick={() => onNavigate('contracts')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline transition"
            >
              Ver todos
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 dark:text-slate-500 font-medium border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-6">Cliente / Locatário</th>
                    <th className="p-3.5">Equipamento Alocado</th>
                    <th className="p-3.5">Mensalidade</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-6 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {contracts.slice(0, 5).map((c, index) => {
                    const isHighlighted = index === 1;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => onNavigate('contracts')}
                        className={`cursor-pointer transition-colors ${
                          isHighlighted
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <td className="p-3.5 pl-6">
                          <span className={`font-bold block ${isHighlighted ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                            {c.clientName}
                          </span>
                          <span className={`text-[10px] block ${isHighlighted ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>
                            {c.contractNumber}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className={isHighlighted ? 'text-blue-100' : 'text-slate-600 dark:text-slate-300'}>
                            {c.items[0]?.model || `${c.items.length} máquina(s)`}
                          </span>
                        </td>

                        <td className="p-3.5 font-bold">
                          <span className={isHighlighted ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'}>
                            {c.monthlyTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              isHighlighted 
                                ? 'bg-white' 
                                : c.status === 'active' 
                                  ? 'bg-blue-600 dark:bg-blue-400' 
                                  : 'bg-slate-400'
                            }`} />
                            <span className={isHighlighted ? 'text-white' : 'text-slate-700 dark:text-slate-300 font-medium'}>
                              {c.status === 'active' ? 'Locação Ativa' : 'Encerrada'}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5 pr-6 text-right">
                          <button className={`p-1 rounded-lg ${isHighlighted ? 'text-white hover:bg-blue-700' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Gráfico Analítico de Crescimento Mensal */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Crescimento de Faturamento</h3>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Últimos 6 meses</span>
          </div>

          <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs flex flex-col justify-between h-[230px] transition-colors">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white block">
                  R$ 8.900
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Total Faturado em Setembro</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                +24% vs Ago
              </span>
            </div>

            <div className="flex items-end justify-between gap-2 pt-4 h-28">
              {monthlyRevenueData.map(item => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div 
                    className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                      item.active 
                        ? 'bg-blue-600 shadow-md shadow-blue-500/30' 
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`} 
                    style={{ height: item.height }}
                  />
                  <span className={`text-[10px] font-semibold ${item.active ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
