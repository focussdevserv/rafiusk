import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  Trash2, 
  Laptop, 
  FileText, 
  Smartphone,
  X,
  ExternalLink,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Client, ClientType, Contract, Equipment, Invoice, MaintenanceTicket, PaymentMethod } from '../types';
import { ClientDetailsModal } from '../components/ClientDetailsModal';
import { PaymentModal } from '../components/PaymentModal';

interface Props {
  clients: Client[];
  contracts: Contract[];
  equipments: Equipment[];
  invoices: Invoice[];
  tickets: MaintenanceTicket[];
  onSaveClient: (client: Partial<Client> & { id?: string }) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
  onCreateContractForClient: (client: Client) => void;
  onSendWhatsApp: (client: Client, customMessage?: string) => void;
  onSendEmail: (client: Client) => void;
  onConfirmPayment: (invoiceId: string, method: PaymentMethod, paidDate: string) => Promise<void>;
  onRevertPayment: (invoiceId: string) => Promise<void>;
  onPrintContract?: (contract: Contract) => void;
  onPrintInvoice?: (invoice: Invoice) => void;
  onSendInvoiceWhatsApp?: (invoice: Invoice) => void;
  onSendInvoiceEmail?: (invoice: Invoice) => void;
}

export const ClientsView: React.FC<Props> = ({
  clients,
  contracts,
  equipments,
  invoices,
  tickets,
  onSaveClient,
  onDeleteClient,
  onCreateContractForClient,
  onSendWhatsApp,
  onSendEmail,
  onConfirmPayment,
  onRevertPayment,
  onPrintContract,
  onPrintInvoice,
  onSendInvoiceWhatsApp,
  onSendInvoiceEmail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'PJ' | 'PF'>('all');
  
  // Modais de Ficha e Pagamento
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<Client | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  // Modal State de Edição / Cadastro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    type: 'PJ' as ClientType,
    name: '',
    tradeName: '',
    document: '',
    email: '',
    phone: '',
    contactPerson: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '',
    notes: ''
  });

  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
  const [cnpjLookupStatus, setCnpjLookupStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFetchCnpj = async () => {
    const cleanCnpj = formData.document.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      setCnpjLookupStatus({ type: 'error', message: 'Digite um CNPJ válido com 14 dígitos.' });
      return;
    }

    setIsFetchingCnpj(true);
    setCnpjLookupStatus(null);

    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (!res.ok) {
        throw new Error('CNPJ não encontrado na base da Receita Federal.');
      }
      const data = await res.json();

      setFormData(prev => ({
        ...prev,
        name: data.razao_social || prev.name,
        tradeName: data.nome_fantasia || prev.tradeName,
        street: [data.descricao_tipo_de_logradouro, data.logradouro].filter(Boolean).join(' ') || prev.street,
        number: data.numero || prev.number,
        complement: data.complemento || prev.complement,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.municipio || prev.city,
        state: data.uf || prev.state,
        zipCode: data.cep || prev.zipCode,
        phone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1.slice(0, 2)}) ${data.ddd_telefone_1.slice(2)}` : prev.phone,
        email: data.email ? data.email.toLowerCase() : prev.email
      }));

      setCnpjLookupStatus({
        type: 'success',
        message: `Empresa localizada: ${data.razao_social} (${data.municipio}/${data.uf})`
      });
    } catch (err: any) {
      setCnpjLookupStatus({
        type: 'error',
        message: err.message || 'Erro ao consultar CNPJ na Receita Federal.'
      });
    } finally {
      setIsFetchingCnpj(false);
    }
  };

  const handleFetchCep = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({
            ...prev,
            street: data.street || prev.street,
            neighborhood: data.neighborhood || prev.neighborhood,
            city: data.city || prev.city,
            state: data.state || prev.state
          }));
        }
      } catch (e) {
        // Ignora silenciosamente se offline ou CEP não encontrado
      }
    }
  };

  const openNewModal = () => {
    setCnpjLookupStatus(null);
    setEditingClient(null);
    setFormData({
      type: 'PJ',
      name: '',
      tradeName: '',
      document: '',
      email: '',
      phone: '',
      contactPerson: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cli: Client) => {
    setEditingClient(cli);
    setFormData({
      type: cli.type,
      name: cli.name,
      tradeName: cli.tradeName || '',
      document: cli.document,
      email: cli.email,
      phone: cli.phone,
      contactPerson: cli.contactPerson || '',
      street: cli.address.street,
      number: cli.address.number,
      complement: cli.address.complement || '',
      neighborhood: cli.address.neighborhood,
      city: cli.address.city,
      state: cli.address.state,
      zipCode: cli.address.zipCode,
      notes: cli.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveClient({
      ...(editingClient ? { id: editingClient.id } : {}),
      type: formData.type,
      name: formData.name,
      tradeName: formData.tradeName,
      document: formData.document,
      email: formData.email,
      phone: formData.phone,
      contactPerson: formData.contactPerson,
      address: {
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      },
      notes: formData.notes
    });
    setIsModalOpen(false);
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.tradeName && c.tradeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.document.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);

    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              typeFilter === 'all' 
                ? 'bg-slate-900 text-white dark:bg-purple-600' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Todos os Clientes ({clients.length})
          </button>
          <button
            onClick={() => setTypeFilter('PJ')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              typeFilter === 'PJ' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Empresas PJ ({clients.filter(c => c.type === 'PJ').length})
          </button>
          <button
            onClick={() => setTypeFilter('PF')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              typeFilter === 'PF' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Pessoas Físicas PF ({clients.filter(c => c.type === 'PF').length})
          </button>
        </div>

        <button
          onClick={openNewModal}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por razão social, nome, CNPJ, CPF, telefone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Clients Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredClients.map(client => {
          // Contratos, faturas e equipamentos em posse do cliente
          const clientContracts = contracts.filter(c => c.clientId === client.id && c.status === 'active');
          const clientEquipments = equipments.filter(e => e.currentClientId === client.id);
          const clientInvoices = invoices.filter(i => i.clientId === client.id);
          const pendingInvoices = clientInvoices.filter(i => i.status === 'pending' || i.status === 'overdue');
          const totalPending = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);

          return (
            <div 
              key={client.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              {/* Header Info - Clicável para abrir Ficha */}
              <div 
                onClick={() => setSelectedClientForDetails(client)}
                className="p-5 border-b border-slate-100 dark:border-slate-800/80 space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      client.type === 'PJ' 
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' 
                        : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {client.type === 'PJ' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                        {client.name}
                      </h3>
                      {client.tradeName && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{client.tradeName}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {client.type}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <p className="flex items-center gap-2">
                    <span className="text-[11px] font-mono bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {client.type === 'PJ' ? 'CNPJ:' : 'CPF:'} {client.document}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{client.phone}</span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span className="truncate">{client.email}</span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.address.city} - {client.address.state}</span>
                  </p>
                </div>

                {/* Status de Dispositivos e Financeiro Rápido */}
                <div className="pt-2 space-y-2">
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    clientEquipments.length > 0
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/70 dark:border-blue-900/50'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">
                        Dispositivos Alugados:
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {clientEquipments.length > 0 ? `${clientEquipments.length} máquina(s)` : 'Nenhuma'}
                    </span>
                  </div>

                  {pendingInvoices.length > 0 && (
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Fatura Pendente:</span>
                      </span>
                      <span>R$ {totalPending.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons & Botão de Ver Ficha */}
              <div className="p-3 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedClientForDetails(client)}
                  className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-black transition flex items-center gap-1.5"
                >
                  <span>Ver Ficha Completa</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSendWhatsApp(client)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition"
                    title="Contato Direto no WhatsApp"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSendEmail(client)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                    title="Enviar E-mail via Resend"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(client)}
                    className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg transition"
                    title="Editar Dados Cadastrais"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Deseja remover o cliente ${client.name}?`)) {
                        onDeleteClient(client.id);
                      }
                    }}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                    title="Excluir Cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Ficha Completa do Cliente */}
      {selectedClientForDetails && (
        <ClientDetailsModal
          isOpen={!!selectedClientForDetails}
          onClose={() => setSelectedClientForDetails(null)}
          client={selectedClientForDetails}
          contracts={contracts}
          equipments={equipments}
          invoices={invoices}
          tickets={tickets}
          onEditClient={(cli) => openEditModal(cli)}
          onCreateContract={(cli) => onCreateContractForClient(cli)}
          onSendWhatsApp={(cli, msg) => onSendWhatsApp(cli, msg)}
          onSendEmail={(cli) => onSendEmail(cli)}
          onPrintContract={onPrintContract}
          onPrintInvoice={onPrintInvoice}
        />
      )}

      {/* Modal de Gestão de Baixa / Pagamento */}
      {selectedInvoiceForPayment && (
        <PaymentModal
          isOpen={!!selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          invoice={selectedInvoiceForPayment}
          onConfirmPayment={onConfirmPayment}
          onRevertPayment={onRevertPayment}
          onSendReceiptWhatsApp={(inv) => onSendInvoiceWhatsApp && onSendInvoiceWhatsApp(inv)}
          onSendReceiptEmail={(inv) => onSendInvoiceEmail && onSendInvoiceEmail(inv)}
          onPrintReceipt={(inv) => onPrintInvoice && onPrintInvoice(inv)}
        />
      )}

      {/* Modal de Cadastro / Edição de Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-extrabold text-sm">
                {editingClient ? `Editar Cliente: ${editingClient.name}` : 'Cadastrar Novo Cliente'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Tipo de Cliente:</span>
                <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
                  <input
                    type="radio"
                    name="clientType"
                    checked={formData.type === 'PJ'}
                    onChange={() => setFormData({ ...formData, type: 'PJ' })}
                  />
                  <span>Pessoa Jurídica (Empresa / PJ)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
                  <input
                    type="radio"
                    name="clientType"
                    checked={formData.type === 'PF'}
                    onChange={() => setFormData({ ...formData, type: 'PF' })}
                  />
                  <span>Pessoa Física (PF)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {formData.type === 'PJ' ? 'Razão Social *' : 'Nome Completo *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    placeholder={formData.type === 'PJ' ? 'Ex: Tech Solutions Ltda' : 'Ex: Carlos Eduardo Silva'}
                  />
                </div>

                {formData.type === 'PJ' && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nome Fantasia</label>
                    <input
                      type="text"
                      value={formData.tradeName}
                      onChange={e => setFormData({ ...formData, tradeName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                      placeholder="Ex: Tech Sol"
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {formData.type === 'PJ' ? 'CNPJ *' : 'CPF *'}
                    </label>
                    {formData.type === 'PJ' && (
                      <button
                        type="button"
                        onClick={handleFetchCnpj}
                        disabled={isFetchingCnpj}
                        className="text-[10px] font-extrabold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800 transition disabled:opacity-50"
                      >
                        {isFetchingCnpj ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
                            <span>Consultando...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            <span>Buscar na Receita</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.document}
                    onChange={e => setFormData({ ...formData, document: e.target.value })}
                    onBlur={() => {
                      if (formData.type === 'PJ' && formData.document.replace(/\D/g, '').length === 14 && !formData.name) {
                        handleFetchCnpj();
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium font-mono"
                    placeholder={formData.type === 'PJ' ? '00.000.000/0001-00' : '000.000.000-00'}
                  />
                  {cnpjLookupStatus && (
                    <div className={`mt-1.5 p-2 rounded-lg text-[10px] flex items-center gap-1.5 font-medium ${
                      cnpjLookupStatus.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {cnpjLookupStatus.type === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      <span>{cnpjLookupStatus.message}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail Corporativo *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pessoa de Contato / TI</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    placeholder="Nome do responsável técnico"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-2">Endereço de Entrega / Instalação:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-500 mb-1">Logradouro (Rua/Av)</label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={e => setFormData({ ...formData, street: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Número</label>
                    <input
                      type="text"
                      value={formData.number}
                      onChange={e => setFormData({ ...formData, number: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">CEP (Busca automática)</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData({ ...formData, zipCode: val });
                        if (val.replace(/\D/g, '').length === 8) {
                          handleFetchCep(val);
                        }
                      }}
                      onBlur={e => handleFetchCep(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium font-mono"
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notas Internas da Locadora</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  placeholder="Ex: SLA contratado de 4h, faturamento no dia 10..."
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-extrabold shadow-md"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
