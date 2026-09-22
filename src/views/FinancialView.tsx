import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Smartphone, 
  Mail, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X,
  FileCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  Filter,
  Copy,
  Check,
  CreditCard,
  Building,
  Tag,
  PieChart as PieChartIcon,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Receipt,
  QrCode,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import { 
  Invoice, 
  InvoiceStatus, 
  Contract, 
  CompanySettings, 
  Expense, 
  ExpenseCategory, 
  PaymentMethod,
  PeriodOption 
} from '../types';
import { db } from '../services/database';

interface Props {
  invoices: Invoice[];
  contracts: Contract[];
  company: CompanySettings;
  expenses?: Expense[];
  onMarkAsPaid: (invoiceId: string, method?: PaymentMethod) => Promise<void>;
  onCreateManualInvoice: (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => Promise<Invoice>;
  onSendInvoiceWhatsApp: (invoice: Invoice, isOverdueAlert?: boolean) => void;
  onSendInvoiceEmail: (invoice: Invoice, isOverdueAlert?: boolean) => void;
  onPrintReceipt: (invoice: Invoice) => void;
  onCreateExpense?: (data: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt'>) => Promise<Expense>;
  onMarkExpenseAsPaid?: (expenseId: string, method?: PaymentMethod) => Promise<void>;
  onDeleteExpense?: (expenseId: string) => Promise<void>;
}

export const FinancialView: React.FC<Props> = ({
  invoices: initialInvoices,
  contracts,
  company,
  expenses: propExpenses,
  onMarkAsPaid,
  onCreateManualInvoice,
  onSendInvoiceWhatsApp,
  onSendInvoiceEmail,
  onPrintReceipt,
  onCreateExpense: propCreateExpense,
  onMarkExpenseAsPaid: propMarkExpenseAsPaid,
  onDeleteExpense: propDeleteExpense
}) => {
  // Aba ativa: 'invoices' (Contas a Receber) | 'expenses' (Contas a Pagar) | 'dre' (Demonstrativo DRE / Fluxo)
  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses' | 'dre'>('invoices');

  // Despesas internas gerenciadas via db
  const [expensesList, setExpensesList] = useState<Expense[]>([]);

  // Carregar despesas
  useEffect(() => {
    if (propExpenses && propExpenses.length > 0) {
      setExpensesList(propExpenses);
    } else {
      db.getExpenses().then(setExpensesList);
    }
  }, [propExpenses]);

  // Filtro de Período
  const [period, setPeriod] = useState<PeriodOption>('this_month');
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Filtros de Tabela
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | 'all'>('all');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  // Modais
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPayInvoiceModalOpen, setIsPayInvoiceModalOpen] = useState(false);
  const [selectedInvoiceToPay, setSelectedInvoiceToPay] = useState<Invoice | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('pix');
  const [pixCopied, setPixCopied] = useState(false);

  // Form states - Fatura
  const [contractId, setContractId] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState(450);
  const [invoiceDueDate, setInvoiceDueDate] = useState(() => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [periodDescription, setPeriodDescription] = useState('Mensalidade de Locação de Hardware');
  const [invoicePaymentMethod, setInvoicePaymentMethod] = useState<PaymentMethod>('pix');

  // Form states - Despesa
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('hardware_parts');
  const [expenseSupplier, setExpenseSupplier] = useState('');
  const [expenseAmount, setExpenseAmount] = useState(350);
  const [expenseDueDate, setExpenseDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expenseMethod, setExpenseMethod] = useState<PaymentMethod>('pix');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Copiar chave PIX rápida
  const handleCopyPix = () => {
    const key = company.pixKey || 'financeiro@rafiusk.shop';
    navigator.clipboard.writeText(key);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  // Cálculo das datas limites de acordo com o período selecionado
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (period) {
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case 'last_30_days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
        break;
      case 'last_90_days':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        end = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
        break;
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      case 'custom':
        start = new Date(customStartDate + 'T00:00:00');
        end = new Date(customEndDate + 'T23:59:59');
        break;
      case 'all':
      default:
        start = new Date('2020-01-01');
        end = new Date('2030-12-31');
        break;
    }

    return { startDate: start, endDate: end };
  }, [period, customStartDate, customEndDate]);

  // Faturas Filtradas por Período
  const periodInvoices = useMemo(() => {
    return initialInvoices.filter(inv => {
      if (period === 'all') return true;
      const refDate = new Date(inv.dueDate);
      return refDate >= startDate && refDate <= endDate;
    });
  }, [initialInvoices, period, startDate, endDate]);

  // Despesas Filtradas por Período
  const periodExpenses = useMemo(() => {
    return expensesList.filter(exp => {
      if (period === 'all') return true;
      const refDate = new Date(exp.dueDate);
      return refDate >= startDate && refDate <= endDate;
    });
  }, [expensesList, period, startDate, endDate]);

  // Cálculos de Indicadores Financeiros do Período
  const metrics = useMemo(() => {
    // MRR (Receita Recorrente Mensal de todos os contratos ativos)
    const activeContracts = contracts.filter(c => c.status === 'active');
    const mrr = activeContracts.reduce((acc, c) => acc + c.monthlyTotal, 0);

    // Faturas
    const totalInvoiced = periodInvoices.reduce((acc, i) => acc + i.amount, 0);
    const totalPaid = periodInvoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
    const totalPending = periodInvoices.filter(i => i.status === 'pending').reduce((acc, i) => acc + i.amount, 0);
    const totalOverdue = periodInvoices.filter(i => {
      if (i.status === 'paid' || i.status === 'cancelled') return false;
      return new Date(i.dueDate) < new Date();
    }).reduce((acc, i) => acc + i.amount, 0);

    const defaultRate = totalInvoiced > 0 ? (totalOverdue / totalInvoiced) * 100 : 0;

    // Despesas
    const totalExpenses = periodExpenses.reduce((acc, e) => acc + e.amount, 0);
    const totalExpensesPaid = periodExpenses.filter(e => e.status === 'paid').reduce((acc, e) => acc + e.amount, 0);
    const totalExpensesPending = periodExpenses.filter(e => e.status === 'pending').reduce((acc, e) => acc + e.amount, 0);

    // Lucro Líquido Real (Receitas Liquidadas - Despesas Pagas)
    const netProfit = totalPaid - totalExpensesPaid;
    const netMargin = totalPaid > 0 ? (netProfit / totalPaid) * 100 : 0;

    return {
      mrr,
      totalInvoiced,
      totalPaid,
      totalPending,
      totalOverdue,
      defaultRate,
      totalExpenses,
      totalExpensesPaid,
      totalExpensesPending,
      netProfit,
      netMargin,
      paidCount: periodInvoices.filter(i => i.status === 'paid').length,
      pendingCount: periodInvoices.filter(i => i.status === 'pending').length,
      overdueCount: periodInvoices.filter(i => i.status === 'pending' && new Date(i.dueDate) < new Date()).length
    };
  }, [periodInvoices, periodExpenses, contracts]);

  // Lista Filtrada de Faturas (por busca, status, método de pagamento e cliente)
  const filteredInvoices = useMemo(() => {
    return periodInvoices.filter(inv => {
      const isOverdue = inv.status === 'pending' && new Date(inv.dueDate) < new Date();
      const effectiveStatus = isOverdue ? 'overdue' : inv.status;

      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.periodDescription.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter;
      const matchesMethod = paymentMethodFilter === 'all' || inv.paymentMethod === paymentMethodFilter;
      const matchesClient = clientFilter === 'all' || inv.clientId === clientFilter;

      return matchesSearch && matchesStatus && matchesMethod && matchesClient;
    });
  }, [periodInvoices, searchTerm, statusFilter, paymentMethodFilter, clientFilter]);

  // Lista Filtrada de Despesas
  const filteredExpenses = useMemo(() => {
    return periodExpenses.filter(exp => {
      const matchesSearch = 
        exp.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.supplier.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = expenseCategoryFilter === 'all' || exp.category === expenseCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [periodExpenses, searchTerm, expenseCategoryFilter]);

  // Exportar Relatório em CSV Formatado
  const handleExportCSV = () => {
    if (activeTab === 'invoices' || activeTab === 'dre') {
      const headers = ['Numero Fatura', 'Cliente', 'Descricao', 'Vencimento', 'Data Pagamento', 'Valor (R$)', 'Status', 'Metodo Pagamento'];
      const rows = filteredInvoices.map(inv => [
        `"${inv.invoiceNumber}"`,
        `"${inv.clientName}"`,
        `"${inv.periodDescription}"`,
        `"${inv.dueDate}"`,
        `"${inv.paidDate || '-'}"`,
        `"${inv.amount.toFixed(2)}"`,
        `"${inv.status}"`,
        `"${inv.paymentMethod || 'pix'}"`
      ]);

      const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `rafiusk_faturas_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Numero Despesa', 'Categoria', 'Descricao', 'Fornecedor', 'Vencimento', 'Data Pagamento', 'Valor (R$)', 'Status', 'Metodo Pagamento'];
      const rows = filteredExpenses.map(exp => [
        `"${exp.expenseNumber}"`,
        `"${exp.category}"`,
        `"${exp.description}"`,
        `"${exp.supplier}"`,
        `"${exp.dueDate}"`,
        `"${exp.paidDate || '-'}"`,
        `"${exp.amount.toFixed(2)}"`,
        `"${exp.status}"`,
        `"${exp.paymentMethod || 'pix'}"`
      ]);

      const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `rafiusk_despesas_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Submissão de Fatura Manual
  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId) {
      alert('Por favor, selecione o contrato do cliente.');
      return;
    }
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;

    await onCreateManualInvoice({
      contractId: contract.id,
      clientId: contract.clientId,
      clientName: contract.clientName,
      clientPhone: contract.clientPhone,
      clientEmail: contract.clientEmail,
      amount: invoiceAmount,
      dueDate: invoiceDueDate,
      status: 'pending',
      paymentMethod: invoicePaymentMethod,
      periodDescription
    });

    setIsInvoiceModalOpen(false);
  };

  // Submissão de Despesa
  const handleCreateExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || !expenseSupplier) {
      alert('Preencha a descrição e o fornecedor da despesa.');
      return;
    }

    const newExpData = {
      description: expenseDesc,
      category: expenseCategory,
      supplier: expenseSupplier,
      amount: expenseAmount,
      dueDate: expenseDueDate,
      status: 'pending' as const,
      paymentMethod: expenseMethod,
      notes: expenseNotes
    };

    if (propCreateExpense) {
      const created = await propCreateExpense(newExpData);
      setExpensesList(prev => [created, ...prev]);
    } else {
      const created = await db.createExpense(newExpData);
      setExpensesList(prev => [created, ...prev]);
    }

    // Limpar form
    setExpenseDesc('');
    setExpenseSupplier('');
    setExpenseAmount(350);
    setExpenseNotes('');
    setIsExpenseModalOpen(false);
  };

  // Confirmar Baixa com Modal de Escolha de Método
  const handleOpenPayModal = (inv: Invoice) => {
    setSelectedInvoiceToPay(inv);
    setSelectedPaymentMethod(inv.paymentMethod || 'pix');
    setIsPayInvoiceModalOpen(true);
  };

  const handleConfirmPayInvoice = async () => {
    if (!selectedInvoiceToPay) return;
    await onMarkAsPaid(selectedInvoiceToPay.id, selectedPaymentMethod);
    setIsPayInvoiceModalOpen(false);
    setSelectedInvoiceToPay(null);
  };

  // Marcar Despesa como Paga
  const handlePayExpense = async (expId: string) => {
    if (propMarkExpenseAsPaid) {
      await propMarkExpenseAsPaid(expId, 'pix');
      setExpensesList(prev => prev.map(e => e.id === expId ? { ...e, status: 'paid', paidDate: new Date().toISOString().split('T')[0] } : e));
    } else {
      await db.markExpenseAsPaid(expId, 'pix');
      const updated = await db.getExpenses();
      setExpensesList(updated);
    }
  };

  // Excluir Despesa
  const handleDeleteExpense = async (expId: string) => {
    if (!confirm('Deseja realmente remover este lançamento de despesa?')) return;
    if (propDeleteExpense) {
      await propDeleteExpense(expId);
    } else {
      await db.deleteExpense(expId);
    }
    setExpensesList(prev => prev.filter(e => e.id !== expId));
  };

  // Rótulos de Categoria de Despesa
  const getCategoryLabel = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'hardware_parts': return 'Peças & Upgrades (SSDs/RAM)';
      case 'licenses': return 'Licenças de Software (Win/Office)';
      case 'logistics': return 'Logística & Fretes';
      case 'maintenance': return 'Manutenção Especializada';
      case 'infrastructure': return 'Infra Cloud & Servidores';
      case 'tax_accounting': return 'Impostos & Contabilidade';
      case 'marketing': return 'Comercial & Divulgação';
      default: return 'Outros Custos';
    }
  };

  // Rótulos de Método de Pagamento
  const getPaymentMethodBadge = (method?: PaymentMethod) => {
    switch (method) {
      case 'pix':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"><QrCode className="w-2.5 h-2.5" /> PIX</span>;
      case 'credit_card':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800"><CreditCard className="w-2.5 h-2.5" /> Cartão</span>;
      case 'boleto':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800"><Receipt className="w-2.5 h-2.5" /> Boleto</span>;
      case 'bank_transfer':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-300 dark:border-blue-800"><Building className="w-2.5 h-2.5" /> TED</span>;
      case 'cash':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-300 dark:border-teal-800"><DollarSign className="w-2.5 h-2.5" /> Dinheiro</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">PIX</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in select-none">
      
      {/* 1. Header do Módulo & Ações Globais */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Gestão Financeira & Faturamento HaaS
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receitas Recorrentes (MRR), Contas a Receber, Custos de Hardware e Apuração de Lucro Líquido Real
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
            title="Exportar dados filtrados para planilha CSV"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => {
              setContractId(contracts[0]?.id || '');
              setIsInvoiceModalOpen(true);
            }}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-purple-600/20 transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Fatura</span>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-600/20 transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Lançar Despesa / Peça</span>
          </button>
        </div>
      </div>

      {/* 2. Banner Interativo com Mascote da RAFIUSK & Chave PIX Rápida */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 rounded-3xl p-5 sm:p-6 text-white border border-purple-800/40 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-purple-600/20 backdrop-blur-md p-1 border border-purple-500/30 flex items-center justify-center overflow-hidden shadow-inner">
                <img 
                  src="/assets/mascot/mascot_thumb_up.png" 
                  alt="Mascote Rafiusk Financeiro" 
                  className="w-full h-full object-contain filter drop-shadow-md hover:scale-105 transition duration-300"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-white" title="Sistema Online">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/30 text-purple-200 border border-purple-400/30">
                <ShieldCheck className="w-3 h-3" /> Faturamento Seguro RAFIUSK
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Chave PIX Cadastrada: <span className="text-purple-300 font-mono">{company.pixKey || 'financeiro@rafiusk.shop'}</span>
              </h3>
              <p className="text-xs text-purple-200/80 max-w-xl">
                Beneficiário: <strong className="text-white">{company.pixBeneficiaryName || company.companyName}</strong> ({company.cnpj}) • Todas as faturas e cobranças automáticas via WhatsApp utilizam esta chave homologada.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleCopyPix}
              className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 rounded-2xl text-xs font-black transition flex items-center gap-2 active:scale-95 shadow-lg"
            >
              {pixCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950 stroke-[3]" />
                  <span>Chave Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Chave PIX</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Efeito decorativo sutil de fundo */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 3. Seletor de Período & Filtros Rápidos */}
      <div className="bg-white dark:bg-slate-900/90 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Pills de Período */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
              <Calendar className="w-3.5 h-3.5" /> Período:
            </span>

            {[
              { id: 'this_month', label: 'Este Mês' },
              { id: 'last_month', label: 'Mês Passado' },
              { id: 'last_30_days', label: 'Últimos 30 Dias' },
              { id: 'last_90_days', label: 'Últimos 90 Dias' },
              { id: 'this_year', label: 'Ano Atual' },
              { id: 'all', label: 'Todo o Histórico' },
              { id: 'custom', label: 'Personalizado' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as PeriodOption)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                  period === p.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Seletor Customizado de Datas (aparece quando 'custom' está ativo) */}
          {period === 'custom' && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
              <span className="text-slate-400">até</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. Grid de 6 KPIs Analíticos do Período */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* Card 1: MRR */}
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">MRR Recorrente</span>
            <span className="p-1 rounded-lg bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
            {metrics.mrr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            {contracts.filter(c => c.status === 'active').length} contrato(s) ativo(s)
          </p>
        </div>

        {/* Card 2: Total Recebido */}
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Recebido (Realizado)</span>
            <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
            {metrics.totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            {metrics.paidCount} fatura(s) liquidada(s)
          </p>
        </div>

        {/* Card 3: Pendente no Prazo */}
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">A Receber</span>
            <span className="p-1 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1.5">
            {metrics.totalPending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            {metrics.pendingCount} fatura(s) no prazo
          </p>
        </div>

        {/* Card 4: Inadimplência */}
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 tracking-wider">Inadimplência</span>
            <span className="p-1 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1.5">
            {metrics.totalOverdue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[10px] text-rose-500 mt-1 font-bold">
            {metrics.overdueCount} em atraso ({metrics.defaultRate.toFixed(1)}%)
          </p>
        </div>

        {/* Card 5: Despesas Operacionais */}
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Custos Pagos</span>
            <span className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
            {metrics.totalExpensesPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            Previstos a pagar: {metrics.totalExpensesPending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        {/* Card 6: Lucro Líquido Real */}
        <div className="bg-gradient-to-tr from-purple-900 to-indigo-900 p-4 rounded-3xl text-white shadow-md shadow-indigo-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-purple-200 tracking-wider">Lucro Líquido Real</span>
            <span className="p-1 rounded-lg bg-white/10 text-emerald-300">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className={`text-xl font-black mt-1.5 ${metrics.netProfit >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {metrics.netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[10px] text-purple-200 mt-1 font-medium">
            Margem: <strong className="text-white">{metrics.netMargin.toFixed(1)}%</strong>
          </p>
        </div>

      </div>

      {/* 5. Navegação das Abas Principais (Contas a Receber, Contas a Pagar, DRE / Fluxo) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'bg-slate-900 dark:bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Contas a Receber (Faturas) ({filteredInvoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
            activeTab === 'expenses'
              ? 'bg-slate-900 dark:bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>Contas a Pagar (Despesas & Peças) ({filteredExpenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dre')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
            activeTab === 'dre'
              ? 'bg-slate-900 dark:bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PieChartIcon className="w-4 h-4" />
          <span>DRE & Fluxo Analítico</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: CONTAS A RECEBER (FATURAS DE CLIENTES)                            */}
      {/* ========================================================================= */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          
          {/* Barra de Filtros Específicos de Faturas */}
          <div className="bg-white dark:bg-slate-900/90 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 transition-colors">
            
            {/* Campo de Busca Textual */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por fatura, cliente, mensalidade..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Filtros em Linha: Status, Método de Pagamento e Cliente */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Filtro de Status */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-xl transition ${statusFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1 rounded-xl transition ${statusFilter === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  Pendentes
                </button>
                <button
                  onClick={() => setStatusFilter('paid')}
                  className={`px-3 py-1 rounded-xl transition ${statusFilter === 'paid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  Pagas
                </button>
                <button
                  onClick={() => setStatusFilter('overdue')}
                  className={`px-3 py-1 rounded-xl transition ${statusFilter === 'overdue' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  Atrasadas
                </button>
              </div>

              {/* Filtro de Método */}
              <select
                value={paymentMethodFilter}
                onChange={e => setPaymentMethodFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-semibold"
              >
                <option value="all">Todos os Métodos</option>
                <option value="pix">PIX</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="boleto">Boleto</option>
                <option value="bank_transfer">TED / Transferência</option>
                <option value="cash">Dinheiro</option>
              </select>

              {/* Filtro de Cliente */}
              <select
                value={clientFilter}
                onChange={e => setClientFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-semibold max-w-[160px] truncate"
              >
                <option value="all">Todos os Clientes</option>
                {Array.from(new Set(initialInvoices.map(i => i.clientId))).map(cId => {
                  const clientName = initialInvoices.find(i => i.clientId === cId)?.clientName || cId;
                  return <option key={cId} value={cId}>{clientName}</option>;
                })}
              </select>
            </div>
          </div>

          {/* Tabela de Faturas */}
          <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 pl-6">Nº Fatura</th>
                    <th className="p-4">Cliente / Contato</th>
                    <th className="p-4">Descrição / Período</th>
                    <th className="p-4">Vencimento</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4 text-center">Método</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right pr-6">Ações & Cobrança</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400 dark:text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <img 
                            src="/assets/mascot/mascot_sitting.png" 
                            alt="Sem faturas" 
                            className="w-24 h-24 object-contain opacity-75"
                          />
                          <p className="font-bold text-sm text-slate-600 dark:text-slate-300">Nenhuma fatura encontrada neste período ou filtro.</p>
                          <p className="text-xs">Altere as datas do período ou clique em "Nova Fatura" para gerar cobranças.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map(inv => {
                      const isOverdue = inv.status === 'pending' && new Date(inv.dueDate) < new Date();
                      const daysDiff = Math.ceil((new Date(inv.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                          
                          {/* Nº Fatura */}
                          <td className="p-4 pl-6 font-mono font-bold text-slate-900 dark:text-white">
                            {inv.invoiceNumber}
                          </td>

                          {/* Cliente */}
                          <td className="p-4">
                            <p className="font-black text-slate-900 dark:text-white">{inv.clientName}</p>
                            <a 
                              href={`https://wa.me/55${inv.clientPhone.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
                            >
                              <Smartphone className="w-3 h-3" />
                              {inv.clientPhone}
                            </a>
                          </td>

                          {/* Descrição */}
                          <td className="p-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                            {inv.periodDescription}
                          </td>

                          {/* Vencimento */}
                          <td className="p-4">
                            <p className={`font-bold ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {new Date(inv.dueDate).toLocaleDateString('pt-BR')}
                            </p>
                            {inv.status === 'pending' && (
                              <p className={`text-[10px] font-semibold ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
                                {isOverdue ? `Vencida há ${Math.abs(daysDiff)} dia(s)` : daysDiff === 0 ? 'Vence hoje!' : `Vence em ${daysDiff} dia(s)`}
                              </p>
                            )}
                            {inv.paidDate && (
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                Pago em: {new Date(inv.paidDate).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </td>

                          {/* Valor */}
                          <td className="p-4 font-black text-slate-900 dark:text-white text-sm">
                            {inv.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>

                          {/* Método de Pagamento */}
                          <td className="p-4 text-center">
                            {getPaymentMethodBadge(inv.paymentMethod)}
                          </td>

                          {/* Status */}
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              inv.status === 'paid' 
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                                : isOverdue 
                                  ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
                                  : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            }`}>
                              {inv.status === 'paid' ? 'Pago' : isOverdue ? 'Atrasada' : 'Pendente'}
                            </span>
                          </td>

                          {/* Ações & Cobrança */}
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              {inv.status !== 'paid' ? (
                                <>
                                  <button
                                    onClick={() => handleOpenPayModal(inv)}
                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black shadow-xs transition flex items-center gap-1 active:scale-95"
                                    title="Dar Baixa / Confirmar Recebimento"
                                  >
                                    <FileCheck className="w-3.5 h-3.5" />
                                    <span>Baixar</span>
                                  </button>

                                  <button
                                    onClick={() => onSendInvoiceWhatsApp(inv, isOverdue)}
                                    className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl transition active:scale-90"
                                    title="Enviar link da fatura e chave PIX por WhatsApp"
                                  >
                                    <Smartphone className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => onSendInvoiceEmail(inv, isOverdue)}
                                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition active:scale-90"
                                    title="Enviar fatura por E-mail via Resend"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => onPrintReceipt(inv)}
                                  className="px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 active:scale-95"
                                  title="Imprimir Recibo de Pagamento Oficial"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span className="font-bold">Recibo</span>
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: CONTAS A PAGAR (DESPESAS & PEÇAS OPERACIONAIS)                     */}
      {/* ========================================================================= */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          
          {/* Barra de Filtros de Despesas */}
          <div className="bg-white dark:bg-slate-900/90 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 transition-colors">
            
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por despesa, peça, fornecedor..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={expenseCategoryFilter}
                onChange={e => setExpenseCategoryFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-semibold"
              >
                <option value="all">Todas as Categorias</option>
                <option value="hardware_parts">Peças & Hardware (SSDs/RAM)</option>
                <option value="licenses">Licenças de Software</option>
                <option value="logistics">Logística & Fretes</option>
                <option value="maintenance">Manutenção Especializada</option>
                <option value="infrastructure">Infra Cloud & Servidores</option>
                <option value="tax_accounting">Impostos & Contabilidade</option>
                <option value="marketing">Comercial & Divulgação</option>
              </select>
            </div>
          </div>

          {/* Tabela de Despesas */}
          <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 pl-6">Nº Custo</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Descrição / Finalidade</th>
                    <th className="p-4">Fornecedor</th>
                    <th className="p-4">Vencimento</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right pr-6">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400 dark:text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <PackageCheck className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                          <p className="font-bold text-sm text-slate-600 dark:text-slate-300">Nenhum custo operacional registrado neste período.</p>
                          <p className="text-xs">Cadastre compras de peças, memórias, SSDs ou licenças pelo botão "Lançar Despesa".</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                        
                        <td className="p-4 pl-6 font-mono font-bold text-slate-900 dark:text-white">
                          {exp.expenseNumber}
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Tag className="w-2.5 h-2.5" />
                            {getCategoryLabel(exp.category)}
                          </span>
                        </td>

                        <td className="p-4">
                          <p className="font-bold text-slate-900 dark:text-white">{exp.description}</p>
                          {exp.notes && <p className="text-[10px] text-slate-400">{exp.notes}</p>}
                        </td>

                        <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                          {exp.supplier}
                        </td>

                        <td className="p-4">
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {new Date(exp.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                          {exp.paidDate && (
                            <p className="text-[10px] text-emerald-600 font-medium">
                              Pago em: {new Date(exp.paidDate).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </td>

                        <td className="p-4 font-black text-rose-600 dark:text-rose-400 text-sm">
                          {exp.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>

                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            exp.status === 'paid' 
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                              : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          }`}>
                            {exp.status === 'paid' ? 'Liquidado' : 'A Pagar'}
                          </span>
                        </td>

                        <td className="p-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            {exp.status !== 'paid' && (
                              <button
                                onClick={() => handlePayExpense(exp.id)}
                                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[11px] font-bold shadow-xs transition active:scale-95"
                                title="Marcar Despesa como Paga"
                              >
                                Pagar
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                              title="Remover Despesa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: DRE & DEMONSTRATIVO ANALÍTICO DE FLUXO DE CAIXA                    */}
      {/* ========================================================================= */}
      {activeTab === 'dre' && (
        <div className="space-y-6">
          
          {/* Card DRE Consolidado */}
          <div className="bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Demonstrativo de Resultados do Exercício (DRE Sintético)
                </h3>
                <p className="text-xs text-slate-500">
                  Período: {startDate.toLocaleDateString('pt-BR')} até {endDate.toLocaleDateString('pt-BR')}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                Modelo Contábil HaaS Rafiusk
              </span>
            </div>

            {/* Linhas do DRE */}
            <div className="space-y-3 text-xs sm:text-sm font-semibold">
              
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-700 dark:text-slate-300 font-bold">(+) Receita Bruta Faturada</span>
                <span className="font-black text-slate-900 dark:text-white">
                  {metrics.totalInvoiced.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <span className="text-emerald-800 dark:text-emerald-300 font-bold">(+) Receitas Efetivamente Liquidadas (Caixa Real)</span>
                <span className="font-black text-emerald-700 dark:text-emerald-400">
                  {metrics.totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                <span className="text-rose-800 dark:text-rose-300 font-bold">(-) Custos Operacionais e Despesas Pagas (Hardware, Peças, Fretes)</span>
                <span className="font-black text-rose-700 dark:text-rose-400">
                  - {metrics.totalExpensesPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-md">
                <div>
                  <p className="text-sm font-black">(=) RESULTADO OPERACIONAL LÍQUIDO DO PERÍODO</p>
                  <p className="text-[11px] text-purple-200">Margem Líquida sobre Faturamento Recebido: {metrics.netMargin.toFixed(1)}%</p>
                </div>
                <div className={`text-xl font-black ${metrics.netProfit >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {metrics.netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>

            </div>
          </div>

          {/* Distribuição por Métodos de Pagamento e Categorias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Distribuição por Métodos de Recebimento */}
            <div className="bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-500" />
                Recebimentos por Método de Pagamento
              </h4>

              <div className="space-y-3">
                {[
                  { id: 'pix', label: 'PIX Oficial (Instantâneo)', color: 'bg-emerald-500' },
                  { id: 'boleto', label: 'Boleto Bancário', color: 'bg-amber-500' },
                  { id: 'credit_card', label: 'Cartão de Crédito Corporativo', color: 'bg-indigo-500' },
                  { id: 'bank_transfer', label: 'Transferência Bancária / TED', color: 'bg-blue-500' }
                ].map(m => {
                  const methodTotal = periodInvoices
                    .filter(i => (i.paymentMethod || 'pix') === m.id)
                    .reduce((acc, i) => acc + i.amount, 0);
                  const pct = metrics.totalInvoiced > 0 ? (methodTotal / metrics.totalInvoiced) * 100 : 0;

                  return (
                    <div key={m.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{m.label}</span>
                        <span className="font-black text-slate-900 dark:text-white">
                          {methodTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${m.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decomposição de Custos por Categoria */}
            <div className="bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Tag className="w-4 h-4 text-rose-500" />
                Decomposição de Custos por Categoria
              </h4>

              <div className="space-y-3">
                {[
                  { cat: 'hardware_parts', label: 'Peças & Upgrades (SSDs/RAM)', color: 'bg-rose-500' },
                  { cat: 'licenses', label: 'Licenças de Software (Win/Office)', color: 'bg-purple-500' },
                  { cat: 'logistics', label: 'Logística & Fretes Expressos', color: 'bg-blue-500' },
                  { cat: 'maintenance', label: 'Manutenção de Bancada', color: 'bg-amber-500' },
                  { cat: 'infrastructure', label: 'Servidores & APIs Cloud', color: 'bg-cyan-500' }
                ].map(c => {
                  const catTotal = periodExpenses
                    .filter(e => e.category === c.cat)
                    .reduce((acc, e) => acc + e.amount, 0);
                  const pct = metrics.totalExpenses > 0 ? (catTotal / metrics.totalExpenses) * 100 : 0;

                  return (
                    <div key={c.cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{c.label}</span>
                        <span className="font-black text-slate-900 dark:text-white">
                          {catTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${c.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CRIAR FATURA / LANÇAMENTO MANUAL                                 */}
      {/* ========================================================================= */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col">
            <div className="px-6 py-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-purple-400" />
                <h3 className="font-black text-sm">Gerar Nova Fatura / Cobrança HaaS</h3>
              </div>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Contrato & Cliente Vinculado *</label>
                <select
                  required
                  value={contractId}
                  onChange={e => {
                    setContractId(e.target.value);
                    const c = contracts.find(item => item.id === e.target.value);
                    if (c) {
                      setInvoiceAmount(c.monthlyTotal);
                    }
                  }}
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="">Selecione o contrato...</option>
                  {contracts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.contractNumber} - {c.clientName} ({c.monthlyTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Valor da Fatura (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={invoiceAmount}
                    onChange={e => setInvoiceAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Data de Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={invoiceDueDate}
                    onChange={e => setInvoiceDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Forma de Cobrança Preferencial *</label>
                <select
                  value={invoicePaymentMethod}
                  onChange={e => setInvoicePaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="pix">PIX (Chave Oficial {company.pixKey || 'financeiro@rafiusk.shop'})</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="bank_transfer">TED / Transferência</option>
                  <option value="cash">Dinheiro em Espécie</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Descrição / Período da Mensalidade *</label>
                <input
                  type="text"
                  required
                  value={periodDescription}
                  onChange={e => setPeriodDescription(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black shadow-md"
                >
                  Confirmar e Gerar Fatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LANÇAR NOVA DESPESA OPERACIONAL / PEÇA                           */}
      {/* ========================================================================= */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col">
            <div className="px-6 py-4 bg-rose-950 text-white flex items-center justify-between border-b border-rose-900">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
                <h3 className="font-black text-sm">Lançar Custo Operacional / Peça de TI</h3>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-rose-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpenseSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Descrição do Item / Peça / Serviço *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lote de 5 SSDs NVMe 1TB Kingston ou Troca de Teclado"
                  value={expenseDesc}
                  onChange={e => setExpenseDesc(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Categoria *</label>
                  <select
                    value={expenseCategory}
                    onChange={e => setExpenseCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="hardware_parts">Peças & Hardware (SSDs/RAM)</option>
                    <option value="licenses">Licenças de Software</option>
                    <option value="logistics">Logística & Fretes</option>
                    <option value="maintenance">Manutenção Especializada</option>
                    <option value="infrastructure">Infra Cloud & Servidores</option>
                    <option value="tax_accounting">Impostos & Contabilidade</option>
                    <option value="marketing">Comercial & Divulgação</option>
                    <option value="other">Outros Custos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Fornecedor / Loja *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Kabum, Distribuidora, Jadlog"
                    value={expenseSupplier}
                    onChange={e => setExpenseSupplier(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Valor Total (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Data de Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={expenseDueDate}
                    onChange={e => setExpenseDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Forma de Pagamento</label>
                <select
                  value={expenseMethod}
                  onChange={e => setExpenseMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="pix">PIX</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="bank_transfer">TED / Transferência</option>
                  <option value="cash">Dinheiro em Espécie</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Observações / NF-e</label>
                <input
                  type="text"
                  placeholder="Ex: NF-e 91.240 - Peças destinadas aos ThinkPads"
                  value={expenseNotes}
                  onChange={e => setExpenseNotes(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black shadow-md"
                >
                  Registrar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BAIXA DE FATURA / CONFIRMAÇÃO DE PAGAMENTO                       */}
      {/* ========================================================================= */}
      {isPayInvoiceModalOpen && selectedInvoiceToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col">
            <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-black text-sm">Confirmar Recebimento / Baixa</h3>
              </div>
              <button onClick={() => setIsPayInvoiceModalOpen(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1.5">
                <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  Fatura: <strong>{selectedInvoiceToPay.invoiceNumber}</strong>
                </p>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {selectedInvoiceToPay.clientName}
                </p>
                <p className="text-base font-black text-emerald-700 dark:text-emerald-400">
                  {selectedInvoiceToPay.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Forma Efetiva de Pagamento *</label>
                <select
                  value={selectedPaymentMethod}
                  onChange={e => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="pix">PIX (Chave Oficial {company.pixKey || 'financeiro@rafiusk.shop'})</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="bank_transfer">TED / Transferência Bancária</option>
                  <option value="cash">Dinheiro em Espécie</option>
                </select>
              </div>

              <p className="text-[11px] text-slate-500">
                Ao confirmar a baixa, a data de quitação será gravada como hoje ({new Date().toLocaleDateString('pt-BR')}) e o recibo oficial estará disponível para impressão.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPayInvoiceModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayInvoice}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Confirmar Baixa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
