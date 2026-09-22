import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Laptop, 
  Monitor, 
  Server, 
  Cpu, 
  FileText, 
  DollarSign, 
  Wrench, 
  Smartphone, 
  Calendar, 
  ShieldCheck, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Copy, 
  Check, 
  X,
  ExternalLink,
  Repeat
} from 'lucide-react';
import { Client, Contract, Equipment, Invoice, MaintenanceTicket } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  contracts: Contract[];
  equipments: Equipment[];
  invoices: Invoice[];
  tickets: MaintenanceTicket[];
  onEditClient: (client: Client) => void;
  onCreateContract: (client: Client) => void;
  onSendWhatsApp: (client: Client, message?: string) => void;
  onSendEmail: (client: Client) => void;
  onPrintContract?: (contract: Contract) => void;
  onPrintInvoice?: (invoice: Invoice) => void;
  onExecuteSwap?: (ticketId: string, currentEquipmentId: string, newEquipmentId: string) => void;
}

export const ClientDetailsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  client,
  contracts,
  equipments,
  invoices,
  tickets,
  onEditClient,
  onCreateContract,
  onSendWhatsApp,
  onSendEmail,
  onPrintContract,
  onPrintInvoice
}) => {
  const [activeTab, setActiveTab] = useState<'equipments' | 'contracts' | 'financial' | 'tickets' | 'profile'>('equipments');
  const [copiedDoc, setCopiedDoc] = useState(false);

  if (!isOpen || !client) return null;

  // Filtros de dados específicos do cliente
  const clientContracts = contracts.filter(c => c.clientId === client.id);
  const activeContracts = clientContracts.filter(c => c.status === 'active');
  const clientEquipments = equipments.filter(e => e.currentClientId === client.id);
  const clientInvoices = invoices.filter(i => i.clientId === client.id);
  const clientTickets = tickets.filter(t => t.clientId === client.id);

  // Totais do cliente
  const totalMonthlySpend = activeContracts.reduce((sum, c) => sum + c.monthlyTotal, 0);
  const pendingInvoices = clientInvoices.filter(i => i.status === 'pending' || i.status === 'overdue');
  const totalPendingAmount = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);

  const handleCopyDocument = () => {
    navigator.clipboard.writeText(client.document);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'notebook': return <Laptop className="w-4 h-4 text-blue-500" />;
      case 'desktop': return <Monitor className="w-4 h-4 text-orange-500" />;
      case 'workstation': return <Cpu className="w-4 h-4 text-rose-500" />;
      case 'server': return <Server className="w-4 h-4 text-emerald-500" />;
      default: return <Monitor className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-5 animate-fade-in select-none">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
        
        {/* 1. Header Superior da Ficha */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
          <div className="flex items-start gap-4 z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/20 ${
              client.type === 'PJ' 
                ? 'bg-blue-600/30 text-blue-300' 
                : 'bg-indigo-600/30 text-indigo-300'
            }`}>
              {client.type === 'PJ' ? <Building2 className="w-7 h-7" /> : <User className="w-7 h-7" />}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {client.name}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {client.type === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cliente Ativo
                </span>
              </div>

              {client.tradeName && (
                <p className="text-xs text-slate-300 font-medium">{client.tradeName}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
                <button 
                  onClick={handleCopyDocument}
                  className="flex items-center gap-1.5 hover:text-white bg-white/10 hover:bg-white/15 px-2 py-0.5 rounded-lg border border-white/10 transition"
                  title="Copiar Documento"
                >
                  <span className="font-mono text-[11px]">{client.type === 'PJ' ? 'CNPJ:' : 'CPF:'} {client.document}</span>
                  {copiedDoc ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>

                <span className="flex items-center gap-1 text-[11px] text-slate-300">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {client.address.city}/{client.address.state}
                </span>

                {client.contactPerson && (
                  <span className="text-[11px] text-slate-400">
                    Contato: <strong className="text-white font-medium">{client.contactPerson}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botões de Ação Imediata no Topo */}
          <div className="flex items-center gap-2 z-10 self-end sm:self-center">
            <button
              onClick={() => onSendWhatsApp(client)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95"
              title="Abrir WhatsApp da Evolution API"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => onSendEmail(client)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95"
              title="Enviar E-mail via Resend"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>E-mail</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEditClient(client);
              }}
              className="px-3 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl border border-white/20 transition"
            >
              Editar
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* 2. Mini KPI Bar do Cliente */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
              Máquinas em Posse
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {clientEquipments.length} <span className="text-xs font-semibold text-slate-500">unid.</span>
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
              Mensalidade / MRR
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                R$ {totalMonthlySpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
              Contratos Ativos
            </span>
            <div className="flex items-center gap-2 mt-1">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {activeContracts.length} <span className="text-xs font-semibold text-slate-500">vigente(s)</span>
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
              Status Financeiro
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {pendingInvoices.length > 0 ? (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                    R$ {totalPendingAmount.toFixed(2)} pendente
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                    100% Em Dia
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 3. Navegação por Abas da Ficha */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 overflow-x-auto bg-slate-50/50 dark:bg-slate-900/40">
          <button
            onClick={() => setActiveTab('equipments')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'equipments'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Máquinas em Posse ({clientEquipments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'contracts'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Contratos ({clientContracts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'financial'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Faturas & PIX ({clientInvoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tickets'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Chamados & Manutenções ({clientTickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Endereço & Dados de TI</span>
          </button>
        </div>

        {/* 4. Corpo do Conteúdo por Aba */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* ABA 1: EQUIPAMENTOS ALUGADOS */}
          {activeTab === 'equipments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Equipamentos Alocados para Este Cliente
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Lista de computadores, números de série e patrimônios atualmente sob responsabilidade do cliente.
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onCreateContract(client);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Alugar Mais Máquinas</span>
                </button>
              </div>

              {clientEquipments.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Laptop className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Nenhum equipamento em posse no momento</p>
                  <p className="text-[11px] text-slate-400 mt-1">Gere um novo contrato de locação para vincular computadores a este cliente.</p>
                  <button
                    onClick={() => {
                      onClose();
                      onCreateContract(client);
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                  >
                    Criar Contrato de Locação
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientEquipments.map(eq => (
                    <div 
                      key={eq.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            {getEquipmentIcon(eq.type)}
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                              {eq.tag}
                            </span>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1 leading-snug">
                              {eq.brand} {eq.model}
                            </h4>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Alugado
                        </span>
                      </div>

                      {/* Especificações da Máquina */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Processador</span>
                          <span className="truncate block font-semibold">{eq.cpu}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Memória RAM</span>
                          <span className="truncate block font-semibold">{eq.ram}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Armazenamento</span>
                          <span className="truncate block font-semibold">{eq.storage}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-700">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          S/N: {eq.serialNumber}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-semibold">Valor Mensal</span>
                          <strong className="text-xs font-black text-blue-600 dark:text-blue-400">
                            R$ {eq.monthlyRate.toFixed(2)}/mês
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 2: CONTRATOS DE LOCAÇÃO */}
          {activeTab === 'contracts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Histórico de Contratos de Locação
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Contratos assinados, termos de responsabilidade e vigência das máquinas.
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onCreateContract(client);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Novo Contrato</span>
                </button>
              </div>

              {clientContracts.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500">Nenhum contrato cadastrado para este cliente.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientContracts.map(ctr => (
                    <div 
                      key={ctr.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded">
                            {ctr.contractNumber}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ctr.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {ctr.status === 'active' ? 'Vigente' : 'Encerrado'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {ctr.items.length} máquina(s): {ctr.items.map(i => `${i.tag} (${i.model})`).join(', ')}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(ctr.startDate).toLocaleDateString('pt-BR')} até {new Date(ctr.endDate).toLocaleDateString('pt-BR')}
                          </span>
                          <span>•</span>
                          <span>Frequência: {ctr.billingFrequency === 'monthly' ? 'Mensal' : ctr.billingFrequency}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-700">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          R$ {ctr.monthlyTotal.toFixed(2)}/mês
                        </span>

                        <div className="flex items-center gap-2">
                          {onPrintContract && (
                            <button
                              onClick={() => onPrintContract(ctr)}
                              className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition"
                              title="Visualizar Termo de Locação para Impressão / PDF"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Termo PDF</span>
                            </button>
                          )}
                          <button
                            onClick={() => onSendWhatsApp(client, `Olá! Segue o termo de locação ${ctr.contractNumber} vigente com a RAFIUSK INFORMÁTICA.`)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
                            title="Enviar no WhatsApp"
                          >
                            <Smartphone className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 3: FINANCEIRO E FATURAS */}
          {activeTab === 'financial' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Histórico Financeiro & Cobranças
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Faturas mensais de locação com PIX gerado e comprovantes de pagamento.
                  </p>
                </div>
              </div>

              {clientInvoices.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500">Nenhuma fatura gerada para este cliente.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientInvoices.map(inv => (
                    <div 
                      key={inv.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            {inv.invoiceNumber}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : inv.status === 'overdue'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {inv.status === 'paid' ? 'Pago' : inv.status === 'overdue' ? 'Vencido' : 'Pendente'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {inv.periodDescription}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>Vencimento: {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</span>
                          {inv.paidDate && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 font-medium">
                                Pago em: {new Date(inv.paidDate).toLocaleDateString('pt-BR')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          R$ {inv.amount.toFixed(2)}
                        </span>

                        <div className="flex items-center gap-2">
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => onSendWhatsApp(client, `Olá! Lembramos do vencimento da fatura ${inv.invoiceNumber} no valor de R$ ${inv.amount.toFixed(2)}. Chave PIX: ${inv.pixCode || 'pix@rafiusk.shop'}`)}
                              className="px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition"
                              title="Cobrar via WhatsApp com Chave PIX"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>Cobrar PIX</span>
                            </button>
                          )}

                          {onPrintInvoice && (
                            <button
                              onClick={() => onPrintInvoice(inv)}
                              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                              title="Imprimir Recibo"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 4: CHAMADOS E MANUTENÇÕES */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Chamados Técnicos & Trocas Rápidas (Swap)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Histórico de ocorrências, suporte técnico e substituição de máquinas com defeito.
                  </p>
                </div>
              </div>

              {clientTickets.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhum chamado aberto!</p>
                  <p className="text-[11px] text-slate-400 mt-1">Todos os equipamentos deste cliente estão operando 100%.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientTickets.map(tkt => (
                    <div 
                      key={tkt.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                            {tkt.ticketNumber}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tkt.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {tkt.status === 'resolved' ? 'Resolvido' : 'Em Andamento'}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            {tkt.priority}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Equipamento: {tkt.equipmentTag}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {tkt.issueDescription}
                      </p>

                      {tkt.isSwapRequested && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-900">
                          <Repeat className="w-3.5 h-3.5" />
                          <span>Troca Rápida (Swap) requerida para restabelecimento imediato de SLA.</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 5: ENDEREÇO & DADOS DE TI */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Endereço de Instalação dos Computadores</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Logradouro / Número</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {client.address.street}, {client.address.number}
                    </strong>
                    {client.address.complement && (
                      <span className="block text-slate-500">Comp: {client.address.complement}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Bairro</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {client.address.neighborhood}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Cidade / Estado</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {client.address.city} - {client.address.state}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">CEP</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono font-semibold">
                      {client.address.zipCode}
                    </strong>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${client.address.street}, ${client.address.number}, ${client.address.city} - ${client.address.state}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold"
                  >
                    <span>Abrir rota no Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Informações de Contato e TI */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Responsável Operacional / Gestor de TI</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Nome do Contato</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{client.contactPerson || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">WhatsApp Direto</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{client.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">E-mail Corporativo</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{client.email}</span>
                  </div>
                </div>

                {client.notes && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Notas Internas da Locadora</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      {client.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* 5. Footer da Ficha */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Cadastrado em {new Date(client.createdAt).toLocaleDateString('pt-BR')}
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 rounded-xl text-xs font-bold transition"
          >
            Fechar Ficha
          </button>
        </div>

      </div>
    </div>
  );
};
