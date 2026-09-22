import React, { useState, useEffect } from 'react';
import { Sidebar, NavItem } from './components/Sidebar';
import { Header } from './components/Header';
import { RightSidebar } from './components/RightSidebar';
import { WhatsAppConnectModal } from './components/WhatsAppConnectModal';
import { SendActionModal, SendActionData } from './components/SendActionModal';
import { PrintTermModal } from './components/PrintTermModal';
import { ToastContainer, ToastMessage } from './components/Toast';

import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { EquipmentsView } from './views/EquipmentsView';
import { ClientsView } from './views/ClientsView';
import { ContractsView } from './views/ContractsView';
import { ChecklistsView } from './views/ChecklistsView';
import { FinancialView } from './views/FinancialView';
import { MaintenanceView } from './views/MaintenanceView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { ClientPortalView } from './views/ClientPortalView';
import { ClientPortalAdminView } from './views/ClientPortalAdminView';
import { QuickRentalView } from './views/QuickRentalView';
import { ProposalsView } from './views/ProposalsView';
import { WhatsAppBroadcastView } from './views/WhatsAppBroadcastView';

import { db } from './services/database';
import { checkEvolutionConnection } from './services/evolutionApi';
import { 
  Equipment, 
  Client, 
  Contract, 
  Invoice, 
  MaintenanceTicket, 
  InspectionChecklist, 
  CompanySettings,
  ContractTemplate,
  AuthUser,
  PaymentMethod,
  CommercialProposal,
  Expense
} from './types';

export function App() {
  // Portal do Cliente (Acesso público via CPF ou pelo Admin)
  const [isClientPortalOpen, setIsClientPortalOpen] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('portal') === 'client';
    } catch {
      return false;
    }
  });

  const [portalInitialCpf, setPortalInitialCpf] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('cpf') || '';
    } catch {
      return '';
    }
  });

  // Auth State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('rafiusk_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nextrent_theme_mode');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nextrent_theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nextrent_theme_mode', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem('rafiusk_current_user', JSON.stringify(user));
    showToast('success', `Bem-vindo(a), ${user.name}!`, 'Acesso autenticado ao sistema RAFIUSK.');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rafiusk_current_user');
    showToast('info', 'Sessão Encerrada', 'Você saiu com segurança.');
  };

  // Data States
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [checklists, setChecklists] = useState<InspectionChecklist[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [proposals, setProposals] = useState<CommercialProposal[]>([]);
  const [company, setCompany] = useState<CompanySettings>(db.getCompanySettings());

  // Mobile Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Connection & Modals
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [sendActionData, setSendActionData] = useState<SendActionData | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [printContract, setPrintContract] = useState<Contract | undefined>(undefined);
  const [printInvoice, setPrintInvoice] = useState<Invoice | undefined>(undefined);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const newToast: ToastMessage = {
      id: crypto.randomUUID(),
      type,
      title,
      description
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load Initial Data
  const loadAllData = async () => {
    const [eqs, clis, ctrs, invs, tkts, chks, tpls, props, exps] = await Promise.all([
      db.getEquipments(),
      db.getClients(),
      db.getContracts(),
      db.getInvoices(),
      db.getTickets(),
      db.getChecklists(),
      db.getContractTemplates(),
      db.getProposals(),
      db.getExpenses()
    ]);

    setEquipments(eqs);
    setClients(clis);
    setContracts(ctrs);
    setInvoices(invs);
    setExpenses(exps);
    setTickets(tkts);
    setChecklists(chks);
    setTemplates(tpls);
    setProposals(props);
    setCompany(db.getCompanySettings());
  };

  useEffect(() => {
    loadAllData();
    checkEvolutionConnection().then(status => {
      setIsWhatsAppConnected(status.state === 'open');
    });
  }, []);

  // CRUD Handlers
  const handleSaveEquipment = async (eq: Partial<Equipment> & { id?: string }) => {
    await db.saveEquipment(eq);
    await loadAllData();
    showToast('success', 'Equipamento Salvo!', `${eq.tag || 'Máquina'} gravada no estoque.`);
  };

  const handleDeleteEquipment = async (id: string) => {
    await db.deleteEquipment(id);
    await loadAllData();
    showToast('info', 'Equipamento Removido', 'Item retirado do inventário.');
  };

  const handleSaveClient = async (cli: Partial<Client> & { id?: string }) => {
    await db.saveClient(cli);
    await loadAllData();
    showToast('success', 'Cliente Salvo!', `Dados de ${cli.name} atualizados com sucesso.`);
  };

  const handleDeleteClient = async (id: string) => {
    await db.deleteClient(id);
    await loadAllData();
    showToast('info', 'Cliente Removido');
  };

  const handleCreateContract = async (data: Omit<Contract, 'id' | 'contractNumber' | 'createdAt'>): Promise<Contract> => {
    const created = await db.createContract(data);
    await loadAllData();
    showToast('success', 'Contrato Gerado com Sucesso!', `Contrato ${created.contractNumber} emitido. Abra para revisar e validar.`);
    return created;
  };

  const handleFinishContract = async (contractId: string) => {
    await db.finishContract(contractId);
    await loadAllData();
    showToast('info', 'Contrato Encerrado', 'Equipamentos liberados para o estoque.');
  };

  const handleSaveTemplate = async (template: ContractTemplate) => {
    await db.saveContractTemplate(template);
    await loadAllData();
    showToast('success', 'Modelo de Contrato Salvo!', `Modelo "${template.name}" disponível para uso.`);
  };

  const handleValidateContract = async (contractId: string, customText: string) => {
    await db.validateContract(contractId, customText);
    await loadAllData();
    showToast('success', 'Contrato Validado!', 'O contrato foi validado e está oficializado para assinatura.');
  };

  const handleMarkInvoiceAsPaid = async (invoiceId: string) => {
    await db.markInvoiceAsPaid(invoiceId);
    await loadAllData();
    showToast('success', 'Fatura Paga!', 'Baixa registrada com sucesso.');
  };

  const handleConfirmPayment = async (invoiceId: string, method: PaymentMethod, paidDate: string) => {
    await db.updateInvoicePayment(invoiceId, method, paidDate);
    await loadAllData();
    showToast('success', 'Mensalidade Baixada!', `Pagamento registrado com método ${method.toUpperCase()}.`);
  };

  const handleRevertPayment = async (invoiceId: string) => {
    await db.revertInvoicePayment(invoiceId);
    await loadAllData();
    showToast('info', 'Pagamento Desfeito', 'A fatura retornou ao status pendente.');
  };

  const handleCreateManualInvoice = async (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>): Promise<Invoice> => {
    const newInv = await db.createManualInvoice(data);
    await loadAllData();
    showToast('success', 'Fatura Criada!', `Mensalidade gerada no valor de R$ ${data.amount.toFixed(2)}.`);
    return newInv;
  };

  const handleCreateExpense = async (data: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt'>): Promise<Expense> => {
    const newExp = await db.createExpense(data);
    await loadAllData();
    showToast('success', 'Despesa Registrada!', `${newExp.expenseNumber} cadastrada no financeiro.`);
    return newExp;
  };

  const handleMarkExpenseAsPaid = async (expId: string, method?: PaymentMethod) => {
    await db.markExpenseAsPaid(expId, method);
    await loadAllData();
    showToast('success', 'Custo Liquidado!', 'Pagamento registrado no fluxo de caixa.');
  };

  const handleDeleteExpense = async (expId: string) => {
    await db.deleteExpense(expId);
    await loadAllData();
    showToast('info', 'Lançamento Removido', 'Despesa excluída com sucesso.');
  };

  const handleSaveChecklist = async (data: Omit<InspectionChecklist, 'id' | 'createdAt'>) => {
    const saved = await db.saveChecklist(data);
    await loadAllData();
    showToast('success', 'Laudo de Vistoria Concluído!', `Vistoria da máquina ${saved.equipmentTag} registrada com fotos.`);
    return saved;
  };

  const handleCreateTicket = async (data: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'createdAt'>): Promise<MaintenanceTicket> => {
    const newTicket = await db.createTicket(data);
    await loadAllData();
    showToast('info', 'Chamado Aberto', `Chamado técnico para ${data.equipmentTag} registrado.`);
    return newTicket;
  };

  const handleExecuteSwap = async (ticketId: string, newEquipmentId: string): Promise<boolean> => {
    const success = await db.executeEquipmentSwap(ticketId, newEquipmentId);
    if (success) {
      await loadAllData();
      showToast('success', 'Troca Rápida (Swap) Realizada!', 'Máquina de reserva alocada e equipamento com defeito enviado para bancada.');
      return true;
    } else {
      showToast('error', 'Erro no Swap', 'Equipamento selecionado não está disponível.');
      return false;
    }
  };

  const handleExecuteQuickRental = async (params: {
    clientId: string;
    equipmentIds: string[];
    periodMonths: number;
    monthlyTotal: number;
    billingDay: number;
    startDate: string;
    endDate: string;
  }) => {
    const result = await db.executeQuickRental(params);
    await loadAllData();
    showToast('success', 'Locação Emitida com Sucesso!', `Contrato ${result.contract.contractNumber} gerado e computadores alocados.`);
    return result;
  };

  const handleCreateProposal = async (data: Omit<CommercialProposal, 'id' | 'proposalNumber' | 'createdAt'>) => {
    const prop = await db.saveProposal(data);
    await loadAllData();
    showToast('success', 'Proposta Criada!', `Proposta ${prop.proposalNumber} emitida com sucesso.`);
    return prop;
  };

  const handleUpdateProposalStatus = async (id: string, status: CommercialProposal['status']) => {
    await db.updateProposalStatus(id, status);
    await loadAllData();
    showToast('info', 'Status Atualizado', `Proposta alterada para ${status}.`);
  };

  const handleConvertToContract = (prop: CommercialProposal) => {
    setCurrentTab('quick-rental');
    showToast('info', 'Gerando Contrato', `Iniciando emissão de locação para ${prop.clientName}.`);
  };

  // WhatsApp & E-mail Trigger Helpers
  const triggerWhatsApp = (recipientName: string, recipientPhone: string, message: string, referenceType: any, referenceId?: string, pixCode?: string) => {
    setSendActionData({
      channel: 'whatsapp',
      recipientName,
      recipientContact: recipientPhone,
      defaultMessage: message,
      referenceType,
      referenceId,
      pixKey: pixCode
    });
    setIsSendModalOpen(true);
  };

  const triggerEmail = (recipientName: string, recipientEmail: string, subject: string, message: string, referenceType: any, referenceId?: string, pixCode?: string) => {
    setSendActionData({
      channel: 'email',
      recipientName,
      recipientContact: recipientEmail,
      subject,
      defaultMessage: message,
      referenceType,
      referenceId,
      pixKey: pixCode
    });
    setIsSendModalOpen(true);
  };

  const handleSendContractWhatsApp = (c: Contract) => {
    const msg = `Olá, ${c.clientName}! Segue o Termo de Locação de Hardware nº ${c.contractNumber} com a ${company.tradeName || 'RAFIUSK INFORMÁTICA'}.\n\nItens alugados:\n${c.items.map(i => `• ${i.tag} - ${i.model}`).join('\n')}\n\nValor mensal: R$ ${c.monthlyTotal.toFixed(2)}\nVigência: ${new Date(c.startDate).toLocaleDateString('pt-BR')} até ${new Date(c.endDate).toLocaleDateString('pt-BR')}`;
    triggerWhatsApp(c.clientName, c.clientPhone, msg, 'contract', c.id);
  };

  const handleSendContractEmail = (c: Contract) => {
    const msg = `Prezado(a) ${c.clientName},\n\nConfirmamos a emissão do seu Contrato de Locação nº ${c.contractNumber}.\n\nEquipamentos Homologados:\n${c.items.map(i => `• ${i.tag} - ${i.model} (R$ ${i.monthlyRate.toFixed(2)}/mês)`).join('\n')}\n\nValor mensal consolidado: R$ ${c.monthlyTotal.toFixed(2)}\nPeríodo: ${new Date(c.startDate).toLocaleDateString('pt-BR')} até ${new Date(c.endDate).toLocaleDateString('pt-BR')}\n\nEstamos à disposição para qualquer suporte técnico.`;
    triggerEmail(c.clientName, c.clientEmail, `Contrato de Locação ${c.contractNumber} - ${company.tradeName || 'RAFIUSK INFORMÁTICA'}`, msg, 'contract', c.id);
  };

  const handleSendInvoiceWhatsApp = (inv: Invoice, isOverdueAlert = false) => {
    const msg = isOverdueAlert 
      ? `Olá, ${inv.clientName}! Notificamos que a fatura ${inv.invoiceNumber} (${inv.periodDescription}) no valor de R$ ${inv.amount.toFixed(2)} venceu em ${new Date(inv.dueDate).toLocaleDateString('pt-BR')}.\n\nFavor efetuar o pagamento via Chave PIX: ${company.pixKey || 'financeiro@rafiusk.com.br'}`
      : `Olá, ${inv.clientName}! Segue a fatura de locação de computadores ${inv.invoiceNumber}.\n\nReferência: ${inv.periodDescription}\nValor: R$ ${inv.amount.toFixed(2)}\nVencimento: ${new Date(inv.dueDate).toLocaleDateString('pt-BR')}\n\nChave PIX: ${company.pixKey || 'financeiro@rafiusk.com.br'}`;

    triggerWhatsApp(inv.clientName, inv.clientPhone, msg, 'invoice', inv.id, company.pixKey);
  };

  const handleSendInvoiceEmail = (inv: Invoice, isOverdueAlert = false) => {
    const msg = isOverdueAlert
      ? `Prezado(a) ${inv.clientName},\n\nIdentificamos a pendência da mensalidade ${inv.periodDescription} no valor de R$ ${inv.amount.toFixed(2)}, vencida em ${new Date(inv.dueDate).toLocaleDateString('pt-BR')}.\n\nSolicitamos a gentileza de efetuar o pagamento via PIX para a chave: ${company.pixKey}`
      : `Prezado(a) ${inv.clientName},\n\nEncaminhamos a fatura ${inv.invoiceNumber} referente à locação de hardware.\n\nDescrição: ${inv.periodDescription}\nValor: R$ ${inv.amount.toFixed(2)}\nVencimento: ${new Date(inv.dueDate).toLocaleDateString('pt-BR')}\n\nChave PIX: ${company.pixKey}`;

    triggerEmail(inv.clientName, inv.clientEmail, `Cobrança de Mensalidade ${inv.invoiceNumber} - ${company.tradeName}`, msg, 'invoice', inv.id, company.pixKey);
  };

  // Se o Portal do Cliente estiver aberto (acesso público via CPF ou pelo Admin)
  if (isClientPortalOpen) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        <ClientPortalView
          clients={clients}
          equipments={equipments}
          contracts={contracts}
          invoices={invoices}
          company={company}
          initialCpf={portalInitialCpf}
          onBackToAdmin={() => {
            setIsClientPortalOpen(false);
            window.history.replaceState({}, '', '/');
          }}
          onRequestTicket={handleCreateTicket}
        />
      </>
    );
  }

  // Se não estiver logado, exibe a tela de login
  if (!currentUser) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        <LoginView onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#edf2fb] dark:bg-[#070b14] flex items-center justify-center p-0 sm:p-2 lg:p-6 font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Container Principal Estilo Card Flutuante com cantos arredondados ultra-modernos e responsivo */}
      <div className="w-full max-w-[1600px] min-h-screen lg:h-[94vh] bg-white dark:bg-slate-900 rounded-none sm:rounded-[32px] shadow-2xl shadow-indigo-900/10 dark:shadow-black/70 border-0 sm:border border-slate-200/70 dark:border-slate-800/80 overflow-hidden flex flex-row transition-colors duration-300 relative">
        
        {/* 1. Sidebar Lateral Esquerda (Drawer Retrátil no Mobile, Fixa no Desktop) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isWhatsAppConnected={isWhatsAppConnected}
          onOpenWhatsAppConnect={() => setIsWhatsAppModalOpen(true)}
          pendingInvoicesCount={invoices.filter(i => i.status === 'pending').length}
          openTicketsCount={tickets.filter(t => t.status === 'open').length}
          onLogout={handleLogout}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* 2. Área Central de Conteúdo */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]/60 dark:bg-slate-950/60 overflow-hidden transition-colors">
          
          {/* Header Superior com Identidade, Hambúrguer Mobile e Dark Mode */}
          <Header
            currentTab={currentTab}
            searchTerm={searchTerm}
            isDarkMode={isDarkMode}
            currentUser={currentUser}
            onToggleDarkMode={toggleDarkMode}
            onSearchChange={setSearchTerm}
            onOpenNewContract={() => setCurrentTab('contracts')}
            onOpenNewEquipment={() => setCurrentTab('equipments')}
            onOpenNewClient={() => setCurrentTab('clients')}
            onNavigateSettings={() => setCurrentTab('settings')}
            onLogout={handleLogout}
            onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          />

          {/* Scrollable View Content */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-4">
            {currentTab === 'dashboard' && (
              <DashboardView
                equipments={equipments}
                clients={clients}
                contracts={contracts}
                invoices={invoices}
                tickets={tickets}
                onNavigate={setCurrentTab}
                onNewContract={() => setCurrentTab('contracts')}
                onNewEquipment={() => setCurrentTab('equipments')}
              />
            )}

            {currentTab === 'equipments' && (
              <EquipmentsView
                equipments={equipments}
                onSaveEquipment={handleSaveEquipment}
                onDeleteEquipment={handleDeleteEquipment}
                onSendToMaintenance={() => setCurrentTab('maintenance')}
              />
            )}

            {currentTab === 'clients' && (
              <ClientsView
                clients={clients}
                contracts={contracts}
                equipments={equipments}
                invoices={invoices}
                tickets={tickets}
                onSaveClient={handleSaveClient}
                onDeleteClient={handleDeleteClient}
                onCreateContractForClient={() => setCurrentTab('contracts')}
                onSendWhatsApp={(cli, msg) => {
                  triggerWhatsApp(cli.name, cli.phone, msg || `Olá, ${cli.name}! Como podemos auxiliar na locação de equipamentos de TI da RAFIUSK hoje?`, 'general');
                }}
                onSendEmail={(cli) => {
                  triggerEmail(cli.name, cli.email, 'Contato - Locação de Hardware', `Prezado(a) ${cli.name},\n\nEstamos à disposição para atender suas demandas de computadores e servidores.`, 'general');
                }}
                onConfirmPayment={handleConfirmPayment}
                onRevertPayment={handleRevertPayment}
                onPrintContract={(c) => {
                  setPrintContract(c);
                  setPrintInvoice(undefined);
                  setIsPrintModalOpen(true);
                }}
                onPrintInvoice={(inv) => {
                  setPrintInvoice(inv);
                  setPrintContract(undefined);
                  setIsPrintModalOpen(true);
                }}
                onSendInvoiceWhatsApp={handleSendInvoiceWhatsApp}
                onSendInvoiceEmail={handleSendInvoiceEmail}
              />
            )}

            {currentTab === 'contracts' && (
              <ContractsView
                contracts={contracts}
                clients={clients}
                equipments={equipments}
                company={company}
                templates={templates}
                onSaveTemplate={handleSaveTemplate}
                onValidateContract={handleValidateContract}
                onCreateContract={handleCreateContract}
                onFinishContract={handleFinishContract}
                onSendContractWhatsApp={handleSendContractWhatsApp}
                onSendContractEmail={handleSendContractEmail}
                onPrintContract={(c) => {
                  setPrintContract(c);
                  setPrintInvoice(undefined);
                  setIsPrintModalOpen(true);
                }}
                onStartInspection={() => setCurrentTab('checklists')}
              />
            )}

            {currentTab === 'checklists' && (
              <ChecklistsView
                checklists={checklists}
                contracts={contracts}
                equipments={equipments}
                onSaveChecklist={handleSaveChecklist}
                onSendChecklistWhatsApp={(chk) => {
                  triggerWhatsApp(chk.clientName, '11999998888', `Olá, ${chk.clientName}! O laudo de vistoria do computador ${chk.equipmentTag} foi gerado com registro fotográfico.`, 'checklist', chk.id);
                }}
                onSendChecklistEmail={(chk) => {
                  triggerEmail(chk.clientName, 'contato@cliente.com', `Laudo de Vistoria - ${chk.equipmentTag}`, `Prezado(a) ${chk.clientName},\n\nSegue o laudo de vistoria física do computador ${chk.equipmentTag}.`, 'checklist', chk.id);
                }}
              />
            )}

            {currentTab === 'financial' && (
              <FinancialView
                invoices={invoices}
                contracts={contracts}
                company={company}
                expenses={expenses}
                onMarkAsPaid={handleMarkInvoiceAsPaid}
                onCreateManualInvoice={handleCreateManualInvoice}
                onSendInvoiceWhatsApp={handleSendInvoiceWhatsApp}
                onSendInvoiceEmail={handleSendInvoiceEmail}
                onPrintReceipt={(inv) => {
                  setPrintInvoice(inv);
                  setPrintContract(undefined);
                  setIsPrintModalOpen(true);
                }}
                onCreateExpense={handleCreateExpense}
                onMarkExpenseAsPaid={handleMarkExpenseAsPaid}
                onDeleteExpense={handleDeleteExpense}
              />
            )}

            {currentTab === 'maintenance' && (
              <MaintenanceView
                tickets={tickets}
                equipments={equipments}
                contracts={contracts}
                onCreateTicket={handleCreateTicket}
                onExecuteSwap={handleExecuteSwap}
                onSendTicketWhatsApp={(t) => {
                  triggerWhatsApp(t.clientName, '11999998888', `Olá, ${t.clientName}! Atualização do chamado técnico ${t.ticketNumber}: ${t.status}.`, 'ticket', t.id);
                }}
                onSendTicketEmail={(t) => {
                  triggerEmail(t.clientName, 'contato@cliente.com', `Chamado Técnico ${t.ticketNumber}`, `Prezado(a) ${t.clientName},\n\nO chamado técnico ${t.ticketNumber} está com status: ${t.status}.`, 'ticket', t.id);
                }}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                equipments={equipments}
                contracts={contracts}
                invoices={invoices}
              />
            )}

            {currentTab === 'quick-rental' && (
              <QuickRentalView
                clients={clients}
                equipments={equipments}
                company={company}
                onExecuteQuickRental={handleExecuteQuickRental}
                onPrintContract={(c) => {
                  setPrintContract(c);
                  setPrintInvoice(undefined);
                  setIsPrintModalOpen(true);
                }}
                onSendWhatsApp={(name, phone, msg) => {
                  triggerWhatsApp(name, phone, msg, 'general');
                }}
                onSuccessNavigateToContracts={() => setCurrentTab('contracts')}
              />
            )}

            {currentTab === 'proposals' && (
              <ProposalsView
                proposals={proposals}
                clients={clients}
                company={company}
                onCreateProposal={handleCreateProposal}
                onUpdateProposalStatus={handleUpdateProposalStatus}
                onSendWhatsApp={(name, phone, msg) => {
                  triggerWhatsApp(name, phone, msg, 'general');
                }}
                onConvertToContract={handleConvertToContract}
              />
            )}

            {currentTab === 'client-portal' && (
              <ClientPortalAdminView
                clients={clients}
                company={company}
                onOpenPortal={(cpf) => {
                  setPortalInitialCpf(cpf || '');
                  setIsClientPortalOpen(true);
                }}
                onSendWhatsApp={(name, phone, link) => {
                  const msg = `Olá, ${name}! Acesse seu Portal do Cliente da RAFIUSK INFORMÁTICA pelo link abaixo informando apenas seu CPF:\n\n${link}\n\nLá você pode consultar seus computadores em locação, baixar contratos e pagar suas mensalidades via PIX instantâneo.`;
                  triggerWhatsApp(name, phone, msg, 'general');
                }}
              />
            )}

            {currentTab === 'whatsapp-center' && (
              <WhatsAppBroadcastView
                invoices={invoices}
                clients={clients}
                company={company}
                isWhatsAppConnected={isWhatsAppConnected}
                onOpenConnectModal={() => setIsWhatsAppModalOpen(true)}
                onSendWhatsApp={(name, phone, msg) => {
                  triggerWhatsApp(name, phone, msg, 'general');
                }}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                company={company}
                onSaveCompany={(newSettings) => {
                  db.saveCompanySettings(newSettings);
                  setCompany(newSettings);
                  showToast('success', 'Configurações Salvas!', 'Dados da RAFIUSK INFORMÁTICA atualizados.');
                }}
                onOpenWhatsAppConnect={() => setIsWhatsAppModalOpen(true)}
              />
            )}
          </main>
        </div>

        {/* 3. Coluna Lateral Direita (Widgets da referência) */}
        {currentTab === 'dashboard' && (
          <RightSidebar
            clients={clients}
            equipments={equipments}
            contracts={contracts}
            onOpenWhatsApp={(cli) => {
              triggerWhatsApp(cli.name, cli.phone, `Olá, ${cli.name}! Tudo bem?`, 'general');
            }}
            onOpenEmail={(cli) => {
              triggerEmail(cli.name, cli.email, 'RAFIUSK INFORMÁTICA - Atendimento', `Olá, ${cli.name}!`, 'general');
            }}
            onViewAllClients={() => setCurrentTab('clients')}
            onViewAllEquipments={() => setCurrentTab('equipments')}
          />
        )}
      </div>

      {/* Modal de Pareamento do WhatsApp (Evolution API) */}
      <WhatsAppConnectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onConnectionChange={(connected) => {
          setIsWhatsAppConnected(connected);
          if (connected) {
            showToast('success', 'WhatsApp Pareado!', 'Instância da Evolution API conectada com sucesso.');
          }
        }}
      />

      {/* Modal de Envio e Disparo de Ações (WhatsApp / E-mail) */}
      <SendActionModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        data={sendActionData}
        onSuccess={() => {
          showToast('success', 'Mensagem Enviada!', 'Disparo realizado via ' + (sendActionData?.channel === 'whatsapp' ? 'Evolution API' : 'Resend'));
        }}
      />

      {/* Modal de Impressão / PDF do Termo de Locação e Recibos */}
      <PrintTermModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        contract={printContract}
        invoice={printInvoice}
        company={company}
      />
    </div>
  );
}

export default App;
