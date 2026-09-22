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
  ShieldAlert 
} from 'lucide-react';
import { MaintenanceTicket, Equipment, Contract, TicketPriority, TicketStatus } from '../types';

interface Props {
  tickets: MaintenanceTicket[];
  equipments: Equipment[];
  contracts: Contract[];
  onCreateTicket: (data: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'createdAt'>) => Promise<MaintenanceTicket>;
  onExecuteSwap: (ticketId: string, newEquipmentId: string) => Promise<boolean>;
  onSendTicketWhatsApp: (ticket: MaintenanceTicket) => void;
  onSendTicketEmail: (ticket: MaintenanceTicket) => void;
}

export const MaintenanceView: React.FC<Props> = ({
  tickets,
  equipments,
  contracts,
  onCreateTicket,
  onExecuteSwap,
  onSendTicketWhatsApp,
  onSendTicketEmail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

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
      alert('Troca de equipamento (Swap) executada com sucesso! O contrato foi atualizado com a nova máquina.');
      setSwapModalTicket(null);
    } else {
      alert('Falha ao executar a substituição da máquina.');
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
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Suporte Técnico & Troca Rápida (Swap)</h2>
          <p className="text-xs text-slate-500">Gestão de incidentes, reparos e substituição expressa de computadores</p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Abrir Chamado Técnico
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Todos ({tickets.length})
        </button>
        <button
          onClick={() => setStatusFilter('open')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            statusFilter === 'open' ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 border border-rose-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Abertos ({tickets.filter(t => t.status === 'open').length})
        </button>
        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            statusFilter === 'in_progress' ? 'bg-amber-600 text-white' : 'bg-white text-amber-700 border border-amber-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Em Reparo ({tickets.filter(t => t.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            statusFilter === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 border border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Resolvidos ({tickets.filter(t => t.status === 'resolved').length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar chamado por protocolo, máquina, cliente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              Nenhum chamado de manutenção pendente com este filtro. Todas as máquinas alugadas estão com funcionamento garantido.
            </p>
          </div>
          <button
            onClick={handleOpenNewModal}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md active:scale-95"
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

            return (
              <div 
                key={ticket.id} 
                className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 flex flex-col justify-between space-y-4 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                        {ticket.ticketNumber}
                      </span>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white mt-1.5">
                        {ticket.equipmentTag} • {ticket.equipmentModel}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Cliente: <strong className="text-slate-700 dark:text-slate-200">{ticket.clientName}</strong></p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${priorityBadge}`}>
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
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSendTicketWhatsApp(ticket)}
                      className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl transition"
                      title="Notificar Cliente no WhatsApp (Evolution API)"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSendTicketEmail(ticket)}
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition"
                      title="Notificar por E-mail (Resend)"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Botão de Troca Rápida de Máquina (Swap) */}
                  {!ticket.swapEquipmentId && ticket.status !== 'resolved' && (
                    <button
                      onClick={() => handleOpenSwapModal(ticket)}
                      className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition active:scale-95"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Troca Rápida (Swap)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Abertura de Chamado */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Abrir Chamado de Assistência Técnica</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Equipamento com Defeito *</label>
                <select
                  required
                  value={selectedEquipmentId}
                  onChange={e => setSelectedEquipmentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
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
                <label className="block text-slate-700 font-semibold mb-1">Nível de Prioridade *</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as TicketPriority)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white capitalize"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica (Interrupção Total)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Descrição do Defeito *</label>
                <textarea
                  rows={3}
                  required
                  value={issueDescription}
                  onChange={e => setIssueDescription(e.target.value)}
                  placeholder="Ex: Não liga, tela piscando, teclado com teclas travadas..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  Registrar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Execução de Swap (Troca de Máquina) */}
      {swapModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col">
            <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-300" />
                <h3 className="font-bold text-sm">Troca Rápida de Máquina (Swap)</h3>
              </div>
              <button onClick={() => setSwapModalTicket(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Como funciona o Swap Inteligente:
                </p>
                <p className="mt-1">
                  A máquina defeituosa (<strong>{swapModalTicket.equipmentTag}</strong>) será desvinculada do contrato e movida para <strong>Manutenção</strong>. O contrato do cliente continuará ativo imediatamente vinculado ao computador reserva selecionado abaixo.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Selecione o Computador Reserva Disponível:
                </label>
                {availableEquipments.length === 0 ? (
                  <p className="text-rose-600 font-semibold">
                    ⚠️ Não há máquinas disponíveis no estoque para realizar a substituição no momento.
                  </p>
                ) : (
                  <select
                    value={selectedSwapEquipmentId}
                    onChange={e => setSelectedSwapEquipmentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    {availableEquipments.map(eq => (
                      <option key={eq.id} value={eq.id}>
                        {eq.tag} - {eq.brand} {eq.model} ({eq.cpu} • {eq.ram})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSwapModalTicket(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSwap}
                  disabled={availableEquipments.length === 0}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
                >
                  Efetivar Troca (Swap) Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
