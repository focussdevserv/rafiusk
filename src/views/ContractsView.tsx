import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Smartphone, 
  Mail, 
  Printer, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  X, 
  Laptop, 
  CheckSquare, 
  Square,
  ClipboardCheck,
  Edit3,
  CheckCircle2,
  FileCheck2
} from 'lucide-react';
import { Contract, Client, Equipment, ContractStatus, ContractTemplate, CompanySettings } from '../types';
import { ContractEditorModal } from '../components/ContractEditorModal';

interface Props {
  contracts: Contract[];
  clients: Client[];
  equipments: Equipment[];
  company: CompanySettings;
  templates: ContractTemplate[];
  onSaveTemplate: (template: ContractTemplate) => Promise<void>;
  onValidateContract: (contractId: string, customText: string) => Promise<void>;
  onCreateContract: (data: Omit<Contract, 'id' | 'contractNumber' | 'createdAt'>) => Promise<Contract>;
  onFinishContract: (contractId: string) => Promise<void>;
  onSendContractWhatsApp: (contract: Contract) => void;
  onSendContractEmail: (contract: Contract) => void;
  onPrintContract: (contract: Contract) => void;
  onStartInspection: (contract: Contract) => void;
}

export const ContractsView: React.FC<Props> = ({
  contracts,
  clients,
  equipments,
  company,
  templates,
  onSaveTemplate,
  onValidateContract,
  onCreateContract,
  onFinishContract,
  onSendContractWhatsApp,
  onSendContractEmail,
  onPrintContract,
  onStartInspection
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContractForEdit, setSelectedContractForEdit] = useState<Contract | null>(null);

  // Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [depositAmount, setDepositAmount] = useState(0);
  const [notes, setNotes] = useState('');

  // Equipamentos disponíveis para alugar
  const availableEquipments = equipments.filter(e => e.status === 'available');

  const toggleEquipmentSelection = (eqId: string) => {
    if (selectedEquipmentIds.includes(eqId)) {
      setSelectedEquipmentIds(selectedEquipmentIds.filter(id => id !== eqId));
    } else {
      setSelectedEquipmentIds([...selectedEquipmentIds, eqId]);
    }
  };

  const calculatedMonthlyTotal = selectedEquipmentIds.reduce((sum, id) => {
    const eq = equipments.find(e => e.id === id);
    return sum + (eq ? eq.monthlyRate : 0);
  }, 0);

  const handleOpenNewModal = () => {
    setSelectedClientId(clients[0]?.id || '');
    setSelectedEquipmentIds([]);
    setDepositAmount(0);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      alert('Selecione um cliente.');
      return;
    }
    if (selectedEquipmentIds.length === 0) {
      alert('Selecione pelo menos um equipamento disponível.');
      return;
    }

    const client = clients.find(c => c.id === selectedClientId)!;
    const items = selectedEquipmentIds.map(id => {
      const eq = equipments.find(e => e.id === id)!;
      return {
        equipmentId: eq.id,
        tag: eq.tag,
        model: `${eq.brand} ${eq.model}`,
        monthlyRate: eq.monthlyRate
      };
    });

    const created = await onCreateContract({
      clientId: client.id,
      clientName: client.name,
      clientDocument: client.document,
      clientPhone: client.phone,
      clientEmail: client.email,
      startDate,
      endDate,
      billingFrequency: 'monthly',
      monthlyTotal: calculatedMonthlyTotal,
      depositAmount,
      status: 'active',
      items,
      notes
    });

    setIsModalOpen(false);

    // Abre imediatamente o editor de contrato para revisão e validação!
    if (created) {
      setSelectedContractForEdit(created);
    }
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = 
      c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientDocument.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'all' ? 'bg-slate-900 text-white dark:bg-purple-600' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Todos ({contracts.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Vigentes ({contracts.filter(c => c.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'completed' ? 'bg-slate-700 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Encerrados ({contracts.filter(c => c.status === 'completed').length})
          </button>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Contrato de Locação</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número de contrato, cliente, CNPJ ou CPF..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Contracts Table List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 pl-5">Nº Contrato</th>
                <th className="p-4">Cliente / Documento</th>
                <th className="p-4">Equipamentos</th>
                <th className="p-4">Vigência</th>
                <th className="p-4">Mensalidade</th>
                <th className="p-4 text-center">Status / Validação</th>
                <th className="p-4 text-right pr-5">Ações & Termo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredContracts.map(contract => (
                <tr key={contract.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4 pl-5 font-mono font-extrabold text-slate-900 dark:text-white">
                    {contract.contractNumber}
                  </td>
                  <td className="p-4">
                    <p className="font-extrabold text-slate-900 dark:text-white">{contract.clientName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{contract.clientDocument}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-extrabold text-slate-900 dark:text-white">{contract.items.length} máquina(s)</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {contract.items.map((item, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    <p>{new Date(contract.startDate).toLocaleDateString('pt-BR')} até {new Date(contract.endDate).toLocaleDateString('pt-BR')}</p>
                    <span className="text-[10px] text-slate-400">Mensal</span>
                  </td>
                  <td className="p-4 font-black text-purple-600 dark:text-purple-400 text-sm">
                    R$ {contract.monthlyTotal.toFixed(2)}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        contract.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {contract.status === 'active' ? 'Vigente' : 'Encerrado'}
                      </span>
                      {contract.isValidated ? (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Validado
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-500 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          Revisar
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right pr-5">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Botão de Editar e Validar Contrato */}
                      <button
                        onClick={() => setSelectedContractForEdit(contract)}
                        className="px-2.5 py-1.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                        title="Abrir Modelo de Contrato Editável & Validar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar / Validar</span>
                      </button>

                      <button
                        onClick={() => onSendContractWhatsApp(contract)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
                        title="Enviar no WhatsApp (Evolution API)"
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onSendContractEmail(contract)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition"
                        title="Enviar por E-mail (Resend)"
                      >
                        <Mail className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onPrintContract(contract)}
                        className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Imprimir / Salvar PDF Oficial"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onStartInspection(contract)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition"
                        title="Laudo de Vistoria de Saída"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Editor e Validador de Contratos */}
      {selectedContractForEdit && (
        <ContractEditorModal
          isOpen={!!selectedContractForEdit}
          onClose={() => setSelectedContractForEdit(null)}
          contract={selectedContractForEdit}
          company={company}
          templates={templates}
          onSaveTemplate={onSaveTemplate}
          onValidateContract={onValidateContract}
          onPrintContract={onPrintContract}
          onSendWhatsApp={onSendContractWhatsApp}
          onSendEmail={onSendContractEmail}
        />
      )}

      {/* Modal de Criação de Contrato */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-extrabold text-sm">Novo Contrato de Locação de Hardware</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cliente Locatário *</label>
                <select
                  required
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                >
                  <option value="">Selecione o Cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type} - {c.document})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Início da Locação *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Término Previsto *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Seleção de Máquinas Disponíveis */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Selecionar Equipamentos Disponíveis ({selectedEquipmentIds.length} selecionados):</span>
                  <span className="text-purple-600 dark:text-purple-400 font-black">
                    Total Mensal: R$ {calculatedMonthlyTotal.toFixed(2)}/mês
                  </span>
                </label>

                {availableEquipments.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900">
                    Nenhuma máquina disponível no estoque no momento.
                  </p>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800">
                    {availableEquipments.map(eq => {
                      const isSelected = selectedEquipmentIds.includes(eq.id);
                      return (
                        <div
                          key={eq.id}
                          onClick={() => toggleEquipmentSelection(eq.id)}
                          className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                            isSelected
                              ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-900 dark:text-purple-200'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                            <div>
                              <p className="font-bold">{eq.brand} {eq.model}</p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                Tag: {eq.tag} | S/N: {eq.serialNumber} | {eq.cpu} • {eq.ram}
                              </p>
                            </div>
                          </div>
                          <span className="font-black text-purple-600 dark:text-purple-400 text-xs">
                            R$ {eq.monthlyRate.toFixed(2)}/mês
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cláusulas ou Observações Especiais</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ex: SLA de 4 horas para atendimento emergencial, entrega em 24h..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Ao criar, o contrato será aberto no editor automático para validação imediata.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-extrabold shadow-md"
                  >
                    Gerar e Validar Contrato
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
