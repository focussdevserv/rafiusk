import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Smartphone, 
  Printer, 
  CheckCircle2, 
  Clock, 
  X, 
  DollarSign, 
  Send, 
  Trash2,
  Building2,
  ShieldCheck,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { CommercialProposal, ProposalItem, Client, CompanySettings } from '../types';

interface Props {
  proposals: CommercialProposal[];
  clients: Client[];
  company: CompanySettings;
  onCreateProposal: (proposal: Omit<CommercialProposal, 'id' | 'proposalNumber' | 'createdAt'>) => Promise<CommercialProposal>;
  onUpdateProposalStatus: (id: string, status: CommercialProposal['status']) => Promise<void>;
  onSendWhatsApp: (clientName: string, phone: string, message: string) => void;
  onConvertToContract: (proposal: CommercialProposal) => void;
}

export const ProposalsView: React.FC<Props> = ({
  proposals,
  clients,
  company,
  onCreateProposal,
  onUpdateProposalStatus,
  onSendWhatsApp,
  onConvertToContract
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposalForPrint, setSelectedProposalForPrint] = useState<CommercialProposal | null>(null);

  // Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientDocument, setClientDocument] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [rentalPeriodMonths, setRentalPeriodMonths] = useState(12);
  const [slaHours, setSlaHours] = useState(4);
  const [deliveryDays, setDeliveryDays] = useState(2);
  const [notes, setNotes] = useState('');
  
  // Itens da Proposta
  const [items, setItems] = useState<ProposalItem[]>([
    {
      equipmentType: 'notebook',
      brandModel: 'Dell Latitude 3440 Core i5',
      cpu: 'Intel Core i5-1335U',
      ram: '16GB DDR4',
      storage: '512GB SSD NVMe',
      quantity: 5,
      unitMonthlyRate: 250.00
    }
  ]);

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const cli = clients.find(c => c.id === clientId);
    if (cli) {
      setClientName(cli.name);
      setClientDocument(cli.document);
      setClientPhone(cli.phone);
      setClientEmail(cli.email);
      setContactPerson(cli.contactPerson || '');
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        equipmentType: 'notebook',
        brandModel: 'Lenovo ThinkPad E14',
        cpu: 'AMD Ryzen 5',
        ram: '16GB DDR4',
        storage: '256GB SSD',
        quantity: 1,
        unitMonthlyRate: 230.00
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ProposalItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const totalMonthly = items.reduce((sum, it) => sum + (it.unitMonthlyRate * it.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || items.length === 0) return;

    const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await onCreateProposal({
      clientId: selectedClientId || undefined,
      clientName,
      clientDocument,
      clientPhone,
      clientEmail,
      contactPerson,
      items,
      monthlyTotal: totalMonthly,
      rentalPeriodMonths,
      slaHours,
      deliveryDays,
      status: 'sent',
      notes,
      validUntil
    });

    setIsModalOpen(false);
  };

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = 
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.proposalNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header do Módulo */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Comercial & Vendas B2B</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Cotações & Propostas Comerciais
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monte orçamentos formais de locação de computadores com logotipo da RAFIUSK e envie por WhatsApp em segundos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Proposta Comercial</span>
        </button>
      </div>

      {/* 2. Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente ou número da proposta..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'draft', 'sent', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {st === 'all' ? 'Todas' : st === 'draft' ? 'Rascunho' : st === 'sent' ? 'Enviadas' : st === 'approved' ? 'Aprovadas' : 'Recusadas'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Lista de Propostas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProposals.map((prop) => (
          <div
            key={prop.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                    {prop.proposalNumber}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    prop.status === 'approved' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                      : prop.status === 'sent'
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {prop.status === 'approved' ? 'Aprovada' : prop.status === 'sent' ? 'Enviada' : 'Rascunho'}
                  </span>
                </div>

                <span className="text-[11px] text-slate-400">
                  Válida até {prop.validUntil}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {prop.clientName}
              </h4>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {prop.clientPhone} • {prop.clientEmail}
              </span>

              {/* Itens */}
              <div className="mt-3 space-y-1.5">
                {prop.items.map((it, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {it.quantity}x {it.brandModel} ({it.cpu} • {it.ram})
                    </span>
                    <span className="font-mono font-bold text-purple-600">
                      R$ {(it.unitMonthlyRate * it.quantity).toFixed(2)}/mês
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/40">
                <span className="text-purple-900 dark:text-purple-300 font-semibold">
                  Total Mensal ({prop.rentalPeriodMonths} meses • SLA {prop.slaHours}h):
                </span>
                <span className="font-mono font-bold text-sm text-purple-700 dark:text-purple-300">
                  R$ {prop.monthlyTotal.toFixed(2)}/mês
                </span>
              </div>
            </div>

            {/* Ações */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={() => setSelectedProposalForPrint(prop)}
                className="flex-1 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir PDF</span>
              </button>

              <button
                onClick={() => {
                  const msg = `Olá, ${prop.clientName}! Segue a Proposta Comercial nº ${prop.proposalNumber} da RAFIUSK INFORMÁTICA.\n\nItens cotados:\n${prop.items.map(i => `• ${i.quantity}x ${i.brandModel} (${i.cpu} / ${i.ram})`).join('\n')}\n\nValor mensal consolidado: R$ ${prop.monthlyTotal.toFixed(2)}\nPrazo de locação: ${prop.rentalPeriodMonths} meses\nSLA de suporte e troca rápida (Swap): até ${prop.slaHours} horas.\n\nFicamos à disposição para fechamento!`;
                  onSendWhatsApp(prop.clientName, prop.clientPhone, msg);
                }}
                className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              {prop.status !== 'approved' ? (
                <button
                  onClick={() => onUpdateProposalStatus(prop.id, 'approved')}
                  className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aprovar</span>
                </button>
              ) : (
                <button
                  onClick={() => onConvertToContract(prop)}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                >
                  <span>Gerar Contrato</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE CRIAÇÃO DE PROPOSTA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span>Nova Proposta Comercial de Locação</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Selecionar cliente cadastrado ou preencher avulso */}
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Cliente Cadastrado (Opcional)
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="">-- Ou preencha os dados manualmente abaixo --</option>
                  {clients.map(cli => (
                    <option key={cli.id} value={cli.id}>{cli.name} ({cli.document})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Razão Social / Nome</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">CNPJ ou CPF</label>
                  <input
                    type="text"
                    value={clientDocument}
                    onChange={(e) => setClientDocument(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">E-mail Comercial</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Itens */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Equipamentos Cotados
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="py-1 px-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-bold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Máquina</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Marca / Modelo</label>
                          <input
                            type="text"
                            value={it.brandModel}
                            onChange={(e) => handleItemChange(idx, 'brandModel', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Processador</label>
                          <input
                            type="text"
                            value={it.cpu}
                            onChange={(e) => handleItemChange(idx, 'cpu', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Memória RAM</label>
                          <input
                            type="text"
                            value={it.ram}
                            onChange={(e) => handleItemChange(idx, 'ram', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 items-end">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Qtd</label>
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Mensalidade Unit. (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={it.unitMonthlyRate}
                            onChange={(e) => handleItemChange(idx, 'unitMonthlyRate', Number(e.target.value))}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono font-bold"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Condições Comerciais */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Prazo (Meses)</label>
                  <input
                    type="number"
                    value={rentalPeriodMonths}
                    onChange={(e) => setRentalPeriodMonths(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">SLA Troca (Horas)</label>
                  <input
                    type="number"
                    value={slaHours}
                    onChange={(e) => setSlaHours(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Prazo Entrega (Dias)</label>
                  <input
                    type="number"
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
                <span>Total Consolidado da Proposta:</span>
                <span className="text-base font-mono">R$ {totalMonthly.toFixed(2)}/mês</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md"
                >
                  Salvar e Emitir Proposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE IMPRESSÃO OFICIAL DA PROPOSTA COM A LOGO DA RAFIUSK */}
      {selectedProposalForPrint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-black p-2 flex items-center justify-center">
                  <img src="/assets/logo_rafiusk_web.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 uppercase">RAFIUSK INFORMÁTICA</h3>
                  <span className="text-xs text-slate-500">PROPOSTA COMERCIAL DE LOCAÇÃO DE HARDWARE</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedProposalForPrint(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Proposta: {selectedProposalForPrint.proposalNumber}</span>
                  <span>Data: {new Date().toLocaleDateString('pt-BR')}</span>
                </div>
                <div>Cliente: <span className="font-bold">{selectedProposalForPrint.clientName}</span></div>
                <div>Documento: {selectedProposalForPrint.clientDocument || 'Não informado'}</div>
                <div>Contato: {selectedProposalForPrint.clientPhone} • {selectedProposalForPrint.clientEmail}</div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider block">Equipamentos Ofertados:</span>
                <table className="w-full text-left border-collapse border rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100 text-[11px] font-bold">
                      <th className="p-2 border">Qtd</th>
                      <th className="p-2 border">Equipamento / Especificação</th>
                      <th className="p-2 border">Valor Unit.</th>
                      <th className="p-2 border">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProposalForPrint.items.map((it, idx) => (
                      <tr key={idx} className="border-b text-[11px]">
                        <td className="p-2 border font-bold text-center">{it.quantity}</td>
                        <td className="p-2 border">{it.brandModel} ({it.cpu} • {it.ram} • {it.storage})</td>
                        <td className="p-2 border font-mono">R$ {it.unitMonthlyRate.toFixed(2)}</td>
                        <td className="p-2 border font-mono font-bold">R$ {(it.unitMonthlyRate * it.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex justify-between items-center text-sm font-bold text-purple-950">
                <span>VALOR MENSAL CONSOLIDADO:</span>
                <span className="text-lg font-mono">R$ {selectedProposalForPrint.monthlyTotal.toFixed(2)}/mês</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border space-y-1 text-[11px] text-slate-600">
                <span className="font-bold block text-slate-900">Condições Gerais & SLA da RAFIUSK:</span>
                <p>• Prazo de vigência da locação: <strong>{selectedProposalForPrint.rentalPeriodMonths} meses</strong>.</p>
                <p>• Suporte técnico e substituição rápida (Swap): <strong>até {selectedProposalForPrint.slaHours} horas úteis</strong>.</p>
                <p>• Prazo de entrega e homologação dos equipamentos: <strong>{selectedProposalForPrint.deliveryDays} dias úteis</strong>.</p>
                <p>• Proposta válida até: <strong>{selectedProposalForPrint.validUntil}</strong>.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => window.print()}
                className="py-2.5 px-5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Salvar como PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
