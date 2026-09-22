import React, { useState } from 'react';
import { 
  Zap, 
  Search, 
  Laptop, 
  Users, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Printer, 
  Smartphone, 
  ArrowRight, 
  Check, 
  X,
  ShieldCheck,
  Building2,
  FileText
} from 'lucide-react';
import { Client, Equipment, Contract, Invoice, CompanySettings } from '../types';

interface Props {
  clients: Client[];
  equipments: Equipment[];
  company: CompanySettings;
  onExecuteQuickRental: (params: {
    clientId: string;
    equipmentIds: string[];
    periodMonths: number;
    monthlyTotal: number;
    billingDay: number;
    startDate: string;
    endDate: string;
  }) => Promise<{ contract: Contract; invoice: Invoice }>;
  onPrintContract: (contract: Contract) => void;
  onSendWhatsApp: (clientName: string, phone: string, message: string) => void;
  onSuccessNavigateToContracts: () => void;
}

export const QuickRentalView: React.FC<Props> = ({
  clients,
  equipments,
  company,
  onExecuteQuickRental,
  onPrintContract,
  onSendWhatsApp,
  onSuccessNavigateToContracts
}) => {
  // Step State (1: Cliente, 2: Equipamentos, 3: Vigência & Fechamento)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form selections
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [periodMonths, setPeriodMonths] = useState<number>(12);
  const [billingDay, setBillingDay] = useState<number>(10);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customMonthlyTotal, setCustomMonthlyTotal] = useState<number | null>(null);

  // Search filters
  const [clientSearch, setClientSearch] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');

  // Loading & Success Result
  const [loading, setLoading] = useState(false);
  const [rentalResult, setRentalResult] = useState<{ contract: Contract; invoice: Invoice } | null>(null);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  // Equipamentos disponíveis
  const availableEquipments = equipments.filter(e => e.status === 'available');
  const filteredEquipments = availableEquipments.filter(e => 
    e.tag.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
    e.model.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
    e.brand.toLowerCase().includes(equipmentSearch.toLowerCase())
  );

  const selectedEquipmentsList = equipments.filter(e => selectedEquipmentIds.includes(e.id));
  
  // Cálculo do total sugerido pelas taxas mensais das máquinas
  const defaultMonthlyTotal = selectedEquipmentsList.reduce((sum, e) => sum + e.monthlyRate, 0);
  const activeMonthlyTotal = customMonthlyTotal !== null ? customMonthlyTotal : defaultMonthlyTotal;

  // Data de término calculada
  const calculateEndDate = (start: string, months: number) => {
    const d = new Date(start);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  const endDate = calculateEndDate(startDate, periodMonths);

  const handleToggleEquipment = (id: string) => {
    if (selectedEquipmentIds.includes(id)) {
      setSelectedEquipmentIds(selectedEquipmentIds.filter(eId => eId !== id));
    } else {
      setSelectedEquipmentIds([...selectedEquipmentIds, id]);
    }
  };

  const handleFinishRental = async () => {
    if (!selectedClientId || selectedEquipmentIds.length === 0) return;

    setLoading(true);
    try {
      const res = await onExecuteQuickRental({
        clientId: selectedClientId,
        equipmentIds: selectedEquipmentIds,
        periodMonths,
        monthlyTotal: activeMonthlyTotal,
        billingDay,
        startDate,
        endDate
      });
      setRentalResult(res);
    } catch (err: any) {
      alert('Erro ao emitir locação: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Se já concluiu com sucesso, exibe a tela de resultado da locação
  if (rentalResult) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-8 text-center shadow-xl space-y-5">
          
          {/* Mascote Oficial Comemorando Locação */}
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
            <img 
              src="/assets/mascot/mascot_thumb_up.png" 
              alt="Mascote Rafiusk Locação Sucesso" 
              className="w-full h-full object-contain filter drop-shadow-lg hover:scale-105 transition duration-300"
            />
          </div>

          <div>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Operação de Balcão Concluída
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Locação Emitida com Sucesso!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Contrato <span className="font-bold text-purple-600">{rentalResult.contract.contractNumber}</span> e 1ª Mensalidade <span className="font-bold text-slate-700 dark:text-slate-300">{rentalResult.invoice.invoiceNumber}</span> gerados.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 text-left border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Cliente:</span>
              <span className="font-bold text-slate-900 dark:text-white">{rentalResult.contract.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Máquinas Alocadas:</span>
              <span className="font-bold text-purple-600">{rentalResult.contract.items.length} unidade(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mensalidade:</span>
              <span className="font-mono font-bold text-emerald-600">R$ {rentalResult.contract.monthlyTotal.toFixed(2)}/mês</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vigência:</span>
              <span className="font-mono">{rentalResult.contract.startDate} a {rentalResult.contract.endDate}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => onPrintContract(rentalResult.contract)}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Termo RAFIUSK</span>
            </button>

            <button
              onClick={() => {
                const msg = `Olá, ${rentalResult.contract.clientName}! Sua locação com a RAFIUSK INFORMÁTICA foi emitida com sucesso.\n\nContrato: ${rentalResult.contract.contractNumber}\nEquipamentos: ${rentalResult.contract.items.map(i => i.tag).join(', ')}\nValor mensal: R$ ${rentalResult.contract.monthlyTotal.toFixed(2)}\n\nEstamos à disposição para suporte técnico!`;
                onSendWhatsApp(rentalResult.contract.clientName, rentalResult.contract.clientPhone, msg);
              }}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>Mandar no WhatsApp</span>
            </button>
          </div>

          <button
            onClick={onSuccessNavigateToContracts}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline pt-2 block mx-auto"
          >
            Ver todos os contratos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header do Balcão */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            <span>Balcão Express • PDV de Locação</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Nova Locação Rápida
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Emita um novo aluguel de hardware em 3 passos com contrato e faturamento imediato.
          </p>
        </div>

        {/* Stepper Visual */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            step === 1 
              ? 'bg-purple-600 text-white shadow-sm' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}>
            1. Cliente
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            step === 2 
              ? 'bg-purple-600 text-white shadow-sm' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}>
            2. Máquinas ({selectedEquipmentIds.length})
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            step === 3 
              ? 'bg-purple-600 text-white shadow-sm' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}>
            3. Vigência & Fatura
          </span>
        </div>
      </div>

      {/* PASSO 1: SELEÇÃO DE CLIENTE */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Selecione o Cliente Locatário
              </h3>
              <span className="text-xs text-slate-400">
                Escolha uma empresa ou pessoa física cadastrada
              </span>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Buscar por nome ou CPF/CNPJ..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {clients
              .filter(c => 
                c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                c.document.includes(clientSearch)
              )
              .map((cli) => {
                const isSelected = selectedClientId === cli.id;
                return (
                  <div
                    key={cli.id}
                    onClick={() => setSelectedClientId(cli.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20'
                        : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-purple-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {cli.type}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-purple-600 font-bold" />}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {cli.name}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                        {cli.document}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400">
                      {cli.phone} • {cli.email}
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              disabled={!selectedClientId}
              onClick={() => setStep(2)}
              className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-40"
            >
              <span>Avançar para Escolha de Máquinas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PASSO 2: SELEÇÃO DE EQUIPAMENTOS */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Selecione as Máquinas para Locação
              </h3>
              <span className="text-xs text-slate-400">
                Exibindo equipamentos disponíveis no estoque • {selectedEquipmentIds.length} selecionado(s)
              </span>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={equipmentSearch}
                onChange={(e) => setEquipmentSearch(e.target.value)}
                placeholder="Buscar por tag, marca ou modelo..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {availableEquipments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhuma máquina disponível no momento. Todas estão alugadas ou em manutenção.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredEquipments.map((eq) => {
                const isSelected = selectedEquipmentIds.includes(eq.id);
                return (
                  <div
                    key={eq.id}
                    onClick={() => handleToggleEquipment(eq.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20'
                        : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-purple-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          {eq.tag}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-purple-600 font-bold" />}
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {eq.brand} {eq.model}
                      </h4>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        {eq.cpu} • {eq.ram} • {eq.storage}
                      </span>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Mensalidade:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        R$ {eq.monthlyRate.toFixed(2)}/mês
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
            >
              ← Voltar
            </button>

            <button
              disabled={selectedEquipmentIds.length === 0}
              onClick={() => setStep(3)}
              className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-40"
            >
              <span>Avançar para Vigência & Valores</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PASSO 3: VIGÊNCIA, VALORES E FECHAMENTO */}
      {step === 3 && selectedClient && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Definir Vigência e Condições Comerciais
            </h3>
            <span className="text-xs text-slate-400">
              Confirme os prazos e valor consolidado da mensalidade
            </span>
          </div>

          {/* Resumo Rápido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Cliente Locatário:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedClient.name}</span>
              <span className="text-slate-500 block font-mono text-[11px]">{selectedClient.document}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Máquinas Selecionadas ({selectedEquipmentsList.length}):</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedEquipmentsList.map(e => (
                  <span key={e.id} className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold">
                    {e.tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Prazo de Locação (Meses)
              </label>
              <select
                value={periodMonths}
                onChange={(e) => setPeriodMonths(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
              >
                <option value={1}>1 Mês (Locação Pontual)</option>
                <option value={3}>3 Meses (Trimestral)</option>
                <option value={6}>6 Meses (Semestral)</option>
                <option value={12}>12 Meses (Anual - Padrão)</option>
                <option value={24}>24 Meses (Bienal Corporativo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Data de Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Dia do Vencimento
              </label>
              <select
                value={billingDay}
                onChange={(e) => setBillingDay(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
              >
                <option value={5}>Dia 05</option>
                <option value={10}>Dia 10 (Padrão)</option>
                <option value={15}>Dia 15</option>
                <option value={20}>Dia 20</option>
                <option value={25}>Dia 25</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Valor Mensal Consolidado (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                value={activeMonthlyTotal}
                onChange={(e) => setCustomMonthlyTotal(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Soma tabelada das máquinas: R$ {defaultMonthlyTotal.toFixed(2)}/mês. Você pode ajustar o valor se tiver concedido desconto de pacote.
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
            >
              ← Voltar
            </button>

            <button
              disabled={loading}
              onClick={handleFinishRental}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-950/20 transition transform active:scale-[0.98] disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Emitindo Contrato...' : 'Emitir Locação & Gerar Contrato'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
