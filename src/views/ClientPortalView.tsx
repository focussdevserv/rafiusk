import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  FileText, 
  DollarSign, 
  Wrench, 
  LogOut, 
  QrCode, 
  Copy, 
  Check, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Smartphone, 
  ExternalLink,
  Search,
  ArrowRight,
  Printer,
  ChevronRight,
  Send,
  HelpCircle
} from 'lucide-react';
import { Client, Equipment, Contract, Invoice, CompanySettings, MaintenanceTicket } from '../types';

interface Props {
  clients: Client[];
  equipments: Equipment[];
  contracts: Contract[];
  invoices: Invoice[];
  company: CompanySettings;
  initialCpf?: string;
  onBackToAdmin?: () => void;
  onRequestTicket?: (ticketData: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'createdAt'>) => Promise<any>;
}

export const ClientPortalView: React.FC<Props> = ({
  clients,
  equipments,
  contracts,
  invoices,
  company,
  initialCpf = '',
  onBackToAdmin,
  onRequestTicket
}) => {
  const [cpfInput, setCpfInput] = useState(initialCpf);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'equipments' | 'invoices' | 'contracts' | 'support'>('equipments');

  // Modal de pagamento PIX
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  // Form de suporte / Swap
  const [supportEquipmentId, setSupportEquipmentId] = useState('');
  const [supportDescription, setSupportDescription] = useState('');
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [submittingSupport, setSubmittingSupport] = useState(false);

  // Tentar login automático se vier CPF nos parâmetros
  useEffect(() => {
    if (initialCpf) {
      handleLogin(initialCpf);
    }
  }, [initialCpf, clients]);

  const cleanDoc = (doc: string) => doc.replace(/\D/g, '');

  const formatCpf = (val: string) => {
    const numbers = val.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const handleLogin = (rawDoc: string) => {
    setErrorMessage('');
    const target = cleanDoc(rawDoc);
    if (!target) {
      setErrorMessage('Por favor, informe seu CPF para entrar.');
      return;
    }

    const found = clients.find(c => cleanDoc(c.document) === target);
    if (found) {
      setActiveClient(found);
    } else {
      setErrorMessage('Nenhum cadastro de locação encontrado com este CPF/CNPJ. Verifique os dígitos ou fale com a nossa equipe no WhatsApp.');
    }
  };

  const handleLogout = () => {
    setActiveClient(null);
    setCpfInput('');
    setErrorMessage('');
  };

  // Se o cliente ainda não fez login, exibir tela de autenticação exclusiva por CPF
  if (!activeClient) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 selection:bg-purple-500 selection:text-white relative overflow-hidden">
        {/* Glows decorativos */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Topbar com retorno */}
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black p-1.5 border border-purple-500/40 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <img 
                src="/assets/logo_rafiusk_web.png" 
                alt="RAFIUSK INFORMÁTICA" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-black text-sm tracking-wider uppercase block text-white">
                RAFIUSK
              </span>
              <span className="text-[10px] font-extrabold text-purple-400 tracking-widest uppercase block -mt-0.5">
                PORTAL DO CLIENTE
              </span>
            </div>
          </div>

          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-900 transition"
            >
              Voltar ao Painel Admin
            </button>
          )}
        </div>

        {/* Card Central de Login por CPF com Mascote Oficial */}
        <div className="w-full max-w-md mx-auto my-auto z-10 py-6">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-[32px] p-6 sm:p-8 shadow-2xl shadow-purple-950/30 text-center">
            
            {/* Mascote Oficial Apresentando o Portal */}
            <div className="relative w-36 h-36 mx-auto mb-3 flex items-center justify-center">
              <div className="absolute inset-0 bg-purple-600/25 rounded-full blur-2xl pointer-events-none" />
              <img 
                src="/assets/mascot/mascot_thumb_up.png" 
                alt="Mascote RAFIUSK" 
                className="w-full h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)] hover:scale-105 transition duration-300"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Acesso Seguro com CPF</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1.5">
              Portal do Cliente RAFIUSK
            </h1>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Consulte seus computadores alugados, faturas e pague instantaneamente via PIX sem burocracia.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin(cpfInput);
              }}
              className="space-y-4 text-left"
            >
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Digite seu CPF ou CNPJ
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cpfInput}
                    onChange={(e) => setCpfInput(formatCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={18}
                    autoFocus
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-base sm:text-lg font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-purple-400">
                    CPF
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-purple-900/30 transition transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Acessar Meu Painel</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Acesso rápido para demonstração */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                💡 Acesso Rápido para Demonstração:
              </span>
              <div className="space-y-1.5">
                {clients.slice(0, 3).map((cli) => (
                  <button
                    key={cli.id}
                    onClick={() => {
                      setCpfInput(cli.document);
                      handleLogin(cli.document);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950/50 hover:bg-purple-950/30 border border-slate-800/60 hover:border-purple-600/40 text-xs transition flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 block truncate">{cli.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{cli.document}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé institucional */}
        <div className="w-full max-w-4xl mx-auto text-center text-xs text-slate-500 z-10">
          <p>© {new Date().getFullYear()} RAFIUSK INFORMÁTICA - Locação de Equipamentos e Alta Tecnologia</p>
          <p className="text-[11px] mt-1 text-slate-600">rafiusk.shop • Suporte Técnico e Troca Rápida de Hardware</p>
        </div>
      </div>
    );
  }

  // --- PAINEL DO CLIENTE LOGADO ---
  const clientContracts = contracts.filter(c => c.clientId === activeClient.id);
  const clientContractIds = clientContracts.map(c => c.id);
  
  // Equipamentos em posse do cliente
  const clientEquipments = equipments.filter(
    e => e.currentClientId === activeClient.id || clientContractIds.includes(e.currentContractId || '')
  );

  // Faturas do cliente
  const clientInvoices = invoices.filter(
    inv => inv.clientId === activeClient.id || clientContractIds.includes(inv.contractId)
  );

  const pendingTotal = clientInvoices
    .filter(i => i.status !== 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Dados do PIX
  const pixKey = company.pixKey || '24.981.402/0001-90';

  const generatePixCopyPaste = (inv: Invoice) => {
    return `00020126580014br.gov.bcb.pix0136${pixKey.replace(/\D/g, '')}520400005303986540${inv.amount.toFixed(2)}5802BR5920RAFIUSK INFORMATICA6009SAO PAULO62070503***6304`;
  };

  const handleSendSupportRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportEquipmentId || !supportDescription) return;

    setSubmittingSupport(true);
    const selectedEq = equipments.find(e => e.id === supportEquipmentId);

    if (onRequestTicket) {
      await onRequestTicket({
        equipmentId: supportEquipmentId,
        equipmentTag: selectedEq?.tag || 'NTB-LOC',
        equipmentModel: selectedEq?.model || 'Notebook',
        clientId: activeClient.id,
        clientName: activeClient.name,
        issueDescription: `[PORTAL DO CLIENTE] ${supportDescription}`,
        priority: 'high',
        status: 'open',
        isSwapRequested: true
      });
    }

    setSubmittingSupport(false);
    setSupportSuccess(true);
    setSupportDescription('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* 1. Header do Portal */}
      <header className="bg-slate-950/90 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black p-1.5 border border-purple-500/40 flex items-center justify-center shadow-md shadow-purple-950/40">
              <img 
                src="/assets/logo_rafiusk_web.png" 
                alt="RAFIUSK INFORMÁTICA" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-wider uppercase text-white">
                  RAFIUSK
                </span>
                <span className="text-[10px] font-extrabold text-purple-400 uppercase bg-purple-950/60 border border-purple-800/80 px-2 py-0.5 rounded-full">
                  Portal do Cliente
                </span>
              </div>
              <span className="text-xs text-slate-400 block truncate max-w-[200px] sm:max-w-xs">
                {activeClient.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onBackToAdmin && (
              <button
                onClick={onBackToAdmin}
                className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-900 transition hidden sm:block"
              >
                Voltar ao Admin
              </button>
            )}

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar border-t border-slate-900 pt-1">
          <button
            onClick={() => setActiveTab('equipments')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'equipments'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Meus Equipamentos ({clientEquipments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'invoices'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Mensalidades & PIX</span>
            {pendingTotal > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('contracts')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'contracts'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Contratos ({clientContracts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'support'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Solicitar Suporte / Swap</span>
          </button>
        </div>
      </header>

      {/* 2. Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Banner de Boas-Vindas */}
        <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/40 border border-purple-900/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Cliente Oficial RAFIUSK</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Olá, {activeClient.name.split(' ')[0]}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              CPF/CNPJ: <span className="font-mono text-slate-300">{activeClient.document}</span> • {activeClient.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Dispositivos Ativos
              </span>
              <span className="text-lg font-black text-white">
                {clientEquipments.length} máquinas
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Pendente
              </span>
              <span className={`text-lg font-black ${pendingTotal > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                R$ {pendingTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* ABA 1: MEUS EQUIPAMENTOS ALUGADOS */}
        {activeTab === 'equipments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-purple-400" />
                  <span>Hardware em Locação</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Máquinas ativas sob sua responsabilidade técnica e garantia RAFIUSK.
                </p>
              </div>
            </div>

            {clientEquipments.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-950/50 border border-slate-800 text-center space-y-3">
                <Laptop className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Nenhum equipamento alugado no momento</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Você não possui máquinas em locação ativa. Entre em contato com a RAFIUSK para solicitar uma cotação.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientEquipments.map((eq) => (
                  <div
                    key={eq.id}
                    className="bg-slate-950/70 border border-slate-800 hover:border-purple-600/40 rounded-3xl p-5 shadow-lg transition space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Foto do Equipamento */}
                      <div className="h-40 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden relative mb-4 flex items-center justify-center">
                        {eq.photos && eq.photos.length > 0 ? (
                          <img 
                            src={eq.photos[0]} 
                            alt={eq.model} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img 
                            src="/assets/laptop_mockup.jpg" 
                            alt={eq.model} 
                            className="w-full h-full object-cover"
                          />
                        )}
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-[11px] font-mono font-bold text-purple-300 border border-purple-500/30">
                          {eq.tag}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                            {eq.brand}
                          </span>
                          <h4 className="text-sm font-bold text-white leading-snug">
                            {eq.model}
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Ativo
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
                        <div>
                          <span className="text-slate-500 block">Processador</span>
                          <span className="font-semibold text-slate-200">{eq.cpu || 'Intel Core'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Memória RAM</span>
                          <span className="font-semibold text-slate-200">{eq.ram || '16GB'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Armazenamento</span>
                          <span className="font-semibold text-slate-200">{eq.storage || 'SSD NVMe'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Nº de Série</span>
                          <span className="font-mono text-slate-300">{eq.serialNumber}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSupportEquipmentId(eq.id);
                        setActiveTab('support');
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/80 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Reportar Problema / Pedir Swap</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 2: MENSALIDADES & PIX */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-400" />
                <span>Mensalidades e Pagamentos</span>
              </h3>
              <p className="text-xs text-slate-400">
                Acompanhe o status das suas faturas e pague com chave PIX instantânea.
              </p>
            </div>

            {clientInvoices.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-950/50 border border-slate-800 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Nenhuma fatura em aberto</h4>
                <p className="text-xs text-slate-500">
                  Todas as suas obrigações financeiras estão em dia.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        inv.status === 'paid'
                          ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                          : 'bg-amber-950/80 border border-amber-800 text-amber-400'
                      }`}>
                        {inv.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-white">
                            {inv.invoiceNumber}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            inv.status === 'paid'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {inv.status === 'paid' ? 'Pago' : 'Pendente'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          Vencimento: <span className="font-mono text-slate-300">{inv.dueDate}</span>
                          {inv.paidDate && ` • Pago em: ${inv.paidDate}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Valor da Mensalidade
                        </span>
                        <span className="text-base font-black text-white font-mono">
                          R$ {inv.amount.toFixed(2)}
                        </span>
                      </div>

                      {inv.status !== 'paid' ? (
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>Pagar via PIX</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>Quitação Confirmada</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 3: MEUS CONTRATOS */}
        {activeTab === 'contracts' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <span>Termos e Contratos de Locação</span>
              </h3>
              <p className="text-xs text-slate-400">
                Seus acordos comerciais vigentes com a RAFIUSK INFORMÁTICA.
              </p>
            </div>

            {clientContracts.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-950/50 border border-slate-800 text-center space-y-3">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Nenhum contrato ativo</h4>
                <p className="text-xs text-slate-500">
                  Entre em contato com nosso departamento comercial para emitir novos termos.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientContracts.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <span className="font-mono font-bold text-white text-sm">
                          Contrato #{c.id}
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Vigência: {c.startDate} até {c.endDate}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full">
                          Contrato Vigente
                        </span>
                        <span className="text-sm font-mono font-bold text-white">
                          R$ {c.monthlyTotal.toFixed(2)}/mês
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Máquinas Inclusas neste Contrato:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {c.items.map((it, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                            <span className="font-bold text-slate-200">{it.model}</span>
                            <span className="font-mono text-purple-400 text-[11px]">{it.tag}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {c.customContractText && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 font-serif max-h-36 overflow-y-auto leading-relaxed">
                        <span className="font-bold text-slate-400 font-sans block mb-1">Cláusulas Validadas:</span>
                        {c.customContractText}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 4: SOLICITAR SUPORTE / SWAP DE MÁQUINA */}
        {activeTab === 'support' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="text-center sm:text-left">
              <h3 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <Wrench className="w-5 h-5 text-purple-400" />
                <span>Solicitação de Suporte Técnico & Troca Rápida (Swap)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Teve problema com teclado, tela, lentidão ou carregador? Abra um chamado para troca imediata do equipamento.
              </p>
            </div>

            {supportSuccess ? (
              <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Chamado de Suporte Aberto com Sucesso!</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Nossa equipe técnica da RAFIUSK já recebeu a sua solicitação com prioridade de SLA. Em instantes entraremos em contato via WhatsApp.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setSupportSuccess(false)}
                    className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition"
                  >
                    Abrir Outro Chamado
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendSupportRequest} className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Selecione o Equipamento com Defeito
                  </label>
                  <select
                    value={supportEquipmentId}
                    onChange={(e) => setSupportEquipmentId(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Escolha a máquina --</option>
                    {clientEquipments.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.tag} - {eq.model} (S/N: {eq.serialNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Descreva o Defeito / Problema Apresentado
                  </label>
                  <textarea
                    value={supportDescription}
                    onChange={(e) => setSupportDescription(e.target.value)}
                    required
                    rows={4}
                    placeholder="Ex: Notebook não está ligando após queda de energia, ou teclado com teclas falhando..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    Caso seja necessária a substituição da máquina, levaremos uma unidade reserva equivalente (Swap) em até poucas horas.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submittingSupport}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submittingSupport ? 'Enviando...' : 'Enviar Chamado Técnico para a RAFIUSK'}</span>
                </button>
              </form>
            )}
          </div>
        )}

      </main>

      {/* 3. Modal de Pagamento PIX com QR Code */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white">
              Pagamento via PIX Instantâneo
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Fatura <span className="font-mono text-slate-200">{selectedInvoice.invoiceNumber}</span>
            </p>

            <div className="my-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Valor a Pagar</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                R$ {selectedInvoice.amount.toFixed(2)}
              </span>

              {/* QR Code dinâmico do PIX */}
              <div className="mt-4 p-3 bg-white rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    generatePixCopyPaste(selectedInvoice)
                  )}&margin=10`}
                  alt="QR Code PIX RAFIUSK"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="mt-3 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Chave PIX da RAFIUSK:
                </span>
                <span className="font-mono text-xs text-slate-200 block truncate">
                  {pixKey}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatePixCopyPaste(selectedInvoice));
                  setPixCopied(true);
                  setTimeout(() => setPixCopied(false), 2500);
                }}
                className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                {pixCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{pixCopied ? 'PIX Copia e Cola Copiado!' : 'Copiar Código PIX'}</span>
              </button>

              <a
                href={`https://wa.me/5511999998888?text=${encodeURIComponent(
                  `Olá, equipe RAFIUSK! Efetuei o pagamento da fatura ${selectedInvoice.invoiceNumber} no valor de R$ ${selectedInvoice.amount.toFixed(2)}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Smartphone className="w-4 h-4" />
                <span>Enviar Comprovante no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. Rodapé */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <p>RAFIUSK INFORMÁTICA • Central de Locações e Hardware • rafiusk.shop</p>
      </footer>
    </div>
  );
};
