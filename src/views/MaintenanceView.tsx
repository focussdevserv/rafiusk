import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  ArrowRightLeft, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  Smartphone, 
  Mail, 
  Laptop, 
  ShieldAlert,
  Printer,
  Check,
  FileCheck
} from 'lucide-react';
import { MaintenanceTicket, Equipment, Contract, TicketPriority, TicketStatus } from '../types';

interface Props {
  tickets: MaintenanceTicket[];
  equipments: Equipment[];
  contracts: Contract[];
  onCreateTicket: (data: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'createdAt'>) => Promise<MaintenanceTicket>;
  onExecuteSwap: (ticketId: string, newEquipmentId: string) => Promise<boolean>;
  onResolveTicket?: (ticketId: string) => Promise<void>;
  onSendTicketWhatsApp: (ticket: MaintenanceTicket) => void;
  onSendTicketEmail: (ticket: MaintenanceTicket) => void;
}

export const MaintenanceView: React.FC<Props> = ({
  tickets,
  equipments,
  contracts,
  onCreateTicket,
  onExecuteSwap,
  onResolveTicket,
  onSendTicketWhatsApp,
  onSendTicketEmail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // OS Print Modal State
  const [printTicket, setPrintTicket] = useState<MaintenanceTicket | null>(null);

  // Swap Modal State
  const [swapModalTicket, setSwapModalTicket] = useState<MaintenanceTicket | null>(null);
  const [selectedSwapEquipmentId, setSelectedSwapEquipmentId] = useState('');

  // Form State
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [isSwapRequested, setIsSwapRequested] = useState(true);

  const availableEquipments = equipments.filter(e => e.status === 'available');

  const handleOpenNewModal = () => {
    const firstEq = equipments.find(e => e.status === 'rented') || equipments[0];
    setSelectedEquipmentId(firstEq?.id || '');
    setIssueDescription('');
    setPriority('medium');
    setIsSwapRequested(true);
    setIsNewModalOpen(true);
  };

  const handleOpenSwapModal = (ticket: MaintenanceTicket) => {
    setSwapModalTicket(ticket);
    setSelectedSwapEquipmentId(availableEquipments[0]?.id || '');
  };

  const handleConfirmSwap = async () => {
    if (!swapModalTicket || !selectedSwapEquipmentId) return;
    const success = await onExecuteSwap(swapModalTicket.id, selectedSwapEquipmentId);
    if (success) {
      setSwapModalTicket(null);
    }
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipmentId) {
      alert('Selecione o equipamento com defeito.');
      return;
    }

    const eq = equipments.find(e => e.id === selectedEquipmentId)!;
    const contract = contracts.find(c => c.id === eq.currentContractId);

    await onCreateTicket({
      equipmentId: eq.id,
      equipmentTag: eq.tag,
      equipmentModel: `${eq.brand} ${eq.model}`,
      clientId: eq.currentClientId || 'cli-avulso',
      clientName: contract?.clientName || 'Cliente Direto',
      contractId: eq.currentContractId,
      issueDescription,
      priority,
      status: 'open',
      isSwapRequested
    });

    setIsNewModalOpen(false);
  };

  const handlePrintOS = () => {
    window.print();
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.equipmentTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.issueDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Suporte Técnico & Substituição Expressa (Swap)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Controle de incidentes de hardware, bancada de reparos e emissão de Ordem de Serviço (OS)
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Chamado Técnico</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            statusFilter === 'all' 
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          Todos ({tickets.length})
        </button>
        <button
          onClick={() => setStatusFilter('open')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            statusFilter === 'open' 
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' 
              : 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Abertos ({tickets.filter(t => t.status === 'open').length})</span>
        </button>
        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            statusFilter === 'in_progress' 
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' 
              : 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Em Bancada ({tickets.filter(t => t.status === 'in_progress').length})</span>
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            statusFilter === 'resolved' 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
              : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/60'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Concluídos ({tickets.filter(t => t.status === 'resolved').length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar chamado por protocolo, máquina, cliente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-xs flex flex-col items-center justify-center gap-4 transition-colors">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-xl pointer-events-none" />
            <img 
              src="/assets/mascot/mascot_sitting.png" 
              alt="Mascote Rafiusk Suporte" 
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-sm text-slate-800 dark:text-slate-200">
              Frota 100% Operacional!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Nenhum chamado pendente no momento. Todos os computadores alugados estão com funcionamento garantido e SLA ativo.
            </p>
          </div>
          <button
            onClick={handleOpenNewModal}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md active:scale-95 cursor-pointer"
          >
            Registrar Incidente / Reparo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTickets.map(ticket => {
            const priorityBadge = {
              low: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
              medium: 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300',
              high: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300',
              critical: 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 animate-pulse'
            }[ticket.priority];

            const statusBadge: Record<TicketStatus, string> = {
              open: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900',
              in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
              waiting_swap: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-900',
              resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900',
              closed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            };

            const statusLabel: Record<TicketStatus, string> = {
              open: 'Aberto',
              in_progress: 'Em Reparo',
              waiting_swap: 'Aguardando Swap',
              resolved: 'Concluído',
              closed: 'Fechado'
            };

            return (
              <div 
                key={ticket.id} 
                className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 flex flex-col justify-between space-y-4 transition-colors hover:border-purple-500/30"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                          {ticket.ticketNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${statusBadge[ticket.status]}`}>
                          {statusLabel[ticket.status]}
                        </span>
                      </div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white mt-1.5">
                        {ticket.equipmentTag} • {ticket.equipmentModel}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Cliente: <strong className="text-slate-700 dark:text-slate-200">{ticket.clientName}</strong>
                      </p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${priorityBadge}`}>
                      {ticket.priority}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 mt-3">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Defeito relatado:</p>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">"{ticket.issueDescription}"</p>
                  </div>

                  {ticket.swapEquipmentTag && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300 mt-3 flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        Máquina substituída (Swap) pelo patrimônio reserva: <strong>{ticket.swapEquipmentTag}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    
                    {/* Botão Imprimir OS Timbrada */}
                    <button
                      onClick={() => setPrintTicket(ticket)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      title="Imprimir Ordem de Serviço (OS)"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>OS</span>
                    </button>

                    <button
                      onClick={() => onSendTicketWhatsApp(ticket)}
                      className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      title="Notificar Cliente no WhatsApp"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onSendTicketEmail(ticket)}
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      title="Notificar por E-mail"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botão de Troca Rápida de Máquina (Swap) */}
                    {!ticket.swapEquipmentId && ticket.status !== 'resolved' && (
                      <button
                        onClick={() => handleOpenSwapModal(ticket)}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Swap</span>
                      </button>
                    )}

                    {/* Botão Concluir Reparo / Resolver Chamado */}
                    {ticket.status !== 'resolved' && onResolveTicket && (
                      <button
                        onClick={() => onResolveTicket(ticket.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                        title="Marcar como reparado e liberar equipamento"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Concluir</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Abertura de Chamado */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-black text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-purple-400" />
                <span>Abrir Chamado de Assistência Técnica</span>
              </h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Equipamento com Defeito *</label>
                <select
                  required
                  value={selectedEquipmentId}
                  onChange={e => setSelectedEquipmentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="">Selecione o equipamento...</option>
                  {equipments.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.tag} - {eq.brand} {eq.model} (Status: {eq.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Nível de Prioridade *</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as TicketPriority)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 capitalize focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica (SLA Emergencial 4h)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Descrição do Defeito / Falha *</label>
                <textarea
                  required
                  rows={3}
                  value={issueDescription}
                  onChange={e => setIssueDescription(e.target.value)}
                  placeholder="Ex: Teclado parou de responder, tela com listras verticais, erro de boot..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="text-[11px] font-bold text-purple-900 dark:text-purple-200">
                    Solicitar Troca Expressa (Swap Imediato)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isSwapRequested}
                  onChange={e => setIsSwapRequested(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-md transition cursor-pointer"
                >
                  Confirmar Abertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Troca Rápida (Swap) */}
      {swapModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-black text-sm flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                <span>Troca Rápida de Equipamento (Swap)</span>
              </h3>
              <button onClick={() => setSwapModalTicket(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300">
                <p className="font-bold">Máquina com Defeito:</p>
                <p>{swapModalTicket.equipmentTag} • {swapModalTicket.equipmentModel}</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">Cliente: {swapModalTicket.clientName}</p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  Selecione a Máquina de Reserva para Substituição:
                </label>
                {availableEquipments.length === 0 ? (
                  <p className="text-rose-500 font-bold p-3 bg-rose-50 rounded-xl border border-rose-200">
                    Atenção: Não há equipamentos disponíveis no estoque para troca no momento.
                  </p>
                ) : (
                  <select
                    value={selectedSwapEquipmentId}
                    onChange={e => setSelectedSwapEquipmentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    {availableEquipments.map(eq => (
                      <option key={eq.id} value={eq.id}>
                        {eq.tag} - {eq.brand} {eq.model} ({eq.cpu}, {eq.ram})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSwapModalTicket(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={availableEquipments.length === 0}
                  onClick={handleConfirmSwap}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black rounded-xl shadow-md transition cursor-pointer"
                >
                  Executar Swap Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Timbrado de Ordem de Serviço (OS) para Impressão */}
      {printTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-8 border border-slate-200 flex flex-col space-y-6 my-auto">
            
            {/* Cabeçalho da OS */}
            <div className="flex items-center justify-between border-b pb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-black p-1 flex items-center justify-center border border-purple-500/30">
                  <img src="/assets/logo_rafiusk_web.png" alt="RAFIUSK" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-wider uppercase">RAFIUSK INFORMÁTICA</h1>
                  <p className="text-[11px] font-bold text-purple-600 tracking-widest uppercase">ASSISTÊNCIA TÉCNICA & HARDWARE</p>
                  <p className="text-xs text-slate-500">CNPJ: 48.912.873/0001-92 • Suporte: Cr.sp3ktrum@gmail.com</p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 font-mono text-xs font-black rounded-lg">
                  {printTicket.ticketNumber}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Data: {new Date(printTicket.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Dados do Cliente e Equipamento */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-500 uppercase text-[10px]">Cliente / Solicitante</p>
                <p className="font-black text-sm text-slate-800">{printTicket.clientName}</p>
                <p className="text-slate-600">Protocolo Vinculado: {printTicket.contractId || 'Locação Ativa'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-500 uppercase text-[10px]">Equipamento em Atendimento</p>
                <p className="font-black text-sm text-slate-800">{printTicket.equipmentTag}</p>
                <p className="text-slate-600">{printTicket.equipmentModel}</p>
              </div>
            </div>

            {/* Diagnóstico e Relato */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700">Defeito / Sintoma Relatado:</p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-slate-700 leading-relaxed">
                "{printTicket.issueDescription}"
              </div>
            </div>

            {/* Status e Swap */}
            <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-purple-900">Prioridade de Atendimento: </span>
                <span className="font-black uppercase text-purple-700">{printTicket.priority}</span>
              </div>
              <div>
                <span className="font-bold text-purple-900">Status Operacional: </span>
                <span className="font-black uppercase text-purple-700">{printTicket.status === 'resolved' ? 'Resolvido' : 'Em Atendimento'}</span>
              </div>
            </div>

            {/* Checklist de Entrega Técnica */}
            <div className="text-xs space-y-1.5 border-t pt-4">
              <p className="font-bold text-slate-800 mb-2">Checklist de Saída e Homologação Técnica:</p>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div className="flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Teste de Estresse CPU/Memória OK</div>
                <div className="flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Sistema Operacional e Drivers Atualizados</div>
                <div className="flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Limpeza interna e pasta térmica nova</div>
                <div className="flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Bateria e Fonte de Alimentação testadas</div>
              </div>
            </div>

            {/* Assinaturas */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-800">Técnico Responsável</p>
                <p className="text-[10px] text-slate-500">RAFIUSK INFORMÁTICA</p>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-800">Cliente / Recebedor</p>
                <p className="text-[10px] text-slate-500">{printTicket.clientName}</p>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="pt-4 border-t flex items-center justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setPrintTicket(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition cursor-pointer text-xs"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handlePrintOS}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Salvar PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
