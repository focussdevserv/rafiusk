import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Check, 
  X, 
  Printer, 
  Smartphone, 
  Mail, 
  Edit3, 
  Plus, 
  Save, 
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { Contract, ContractTemplate, CompanySettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  company: CompanySettings;
  templates: ContractTemplate[];
  onSaveTemplate: (template: ContractTemplate) => Promise<void>;
  onValidateContract: (contractId: string, customText: string) => Promise<void>;
  onPrintContract?: (contract: Contract) => void;
  onSendWhatsApp?: (contract: Contract) => void;
  onSendEmail?: (contract: Contract) => void;
}

export const ContractEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  contract,
  company,
  templates,
  onSaveTemplate,
  onValidateContract,
  onPrintContract,
  onSendWhatsApp,
  onSendEmail
}) => {
  if (!isOpen || !contract) return null;

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || 'tpl-default'
  );
  const [contractText, setContractText] = useState<string>('');
  const [isValidated, setIsValidated] = useState<boolean>(contract.isValidated || false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState<boolean>(false);
  const [newTemplateName, setNewTemplateName] = useState<string>('');
  const [newTemplateDesc, setNewTemplateDesc] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Função para compilar e gerar o texto do contrato com dados dinâmicos
  const generateFilledText = (rawTemplate: string) => {
    const equipListText = contract.items.map((it, idx) => 
      `${idx + 1}. [${it.tag}] ${it.model} - R$ ${it.monthlyRate.toFixed(2)}/mês`
    ).join('\n');

    const startDateFormatted = new Date(contract.startDate).toLocaleDateString('pt-BR');
    const endDateFormatted = new Date(contract.endDate).toLocaleDateString('pt-BR');
    const todayFormatted = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    let text = rawTemplate;
    text = text.replace(/{{NUMERO_CONTRATO}}/g, contract.contractNumber);
    text = text.replace(/{{LOCADORA_NOME}}/g, company.tradeName || 'RAFIUSK INFORMÁTICA');
    text = text.replace(/{{LOCADORA_RAZAO}}/g, company.companyName || 'RAFIUSK INFORMÁTICA LTDA');
    text = text.replace(/{{LOCADORA_CNPJ}}/g, company.cnpj || '48.912.873/0001-92');
    text = text.replace(/{{LOCADORA_ENDERECO}}/g, company.address || 'São Paulo - SP');
    text = text.replace(/{{CLIENTE_NOME}}/g, contract.clientName);
    text = text.replace(/{{CLIENTE_DOCUMENTO}}/g, contract.clientDocument);
    text = text.replace(/{{CLIENTE_TELEFONE}}/g, contract.clientPhone);
    text = text.replace(/{{CLIENTE_EMAIL}}/g, contract.clientEmail);
    text = text.replace(/{{DATA_INICIO}}/g, startDateFormatted);
    text = text.replace(/{{DATA_FIM}}/g, endDateFormatted);
    text = text.replace(/{{VALOR_MENSAL}}/g, `R$ ${contract.monthlyTotal.toFixed(2)}`);
    text = text.replace(/{{LISTA_EQUIPAMENTOS}}/g, equipListText);
    text = text.replace(/{{DATA_HOJE}}/g, todayFormatted);
    text = text.replace(/{{FORO}}/g, 'Comarca de São Paulo / SP');

    return text;
  };

  useEffect(() => {
    if (contract.customContractText) {
      setContractText(contract.customContractText);
      setIsValidated(contract.isValidated || false);
    } else {
      const tpl = templates.find(t => t.id === selectedTemplateId) || templates[0];
      if (tpl) {
        setContractText(generateFilledText(tpl.content));
      }
    }
  }, [contract, selectedTemplateId]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tpl = templates.find(t => t.id === templateId);
    if (tpl) {
      setContractText(generateFilledText(tpl.content));
    }
  };

  const handleValidate = async () => {
    setIsSubmitting(true);
    try {
      await onValidateContract(contract.id, contractText);
      setIsValidated(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    const newTpl: ContractTemplate = {
      id: `tpl-${Date.now()}`,
      name: newTemplateName,
      description: newTemplateDesc || 'Modelo customizado de locação',
      content: contractText,
      createdAt: new Date().toISOString()
    };

    await onSaveTemplate(newTpl);
    setIsCreatingTemplate(false);
    setSelectedTemplateId(newTpl.id);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(contractText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 animate-fade-in select-none">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base">
                  Contrato de Locação #{contract.contractNumber}
                </h3>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                  isValidated 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isValidated ? 'VALIDADO & OFICIAL' : 'EM REVISÃO'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cliente: <strong className="text-white">{contract.clientName}</strong> • {contract.items.length} máquina(s) • R$ {contract.monthlyTotal.toFixed(2)}/mês
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Seleção de Modelo e Ferramentas */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Modelo de Contrato:
            </span>
            <select
              value={selectedTemplateId}
              onChange={e => handleTemplateChange(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500"
            >
              {templates.map(tpl => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setIsCreatingTemplate(!isCreatingTemplate)}
              className="px-2.5 py-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 rounded-xl flex items-center gap-1 transition"
              title="Salvar este texto como um Novo Modelo de Contrato"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Modelo</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            {onPrintContract && (
              <button
                type="button"
                onClick={() => onPrintContract(contract)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Inline para Salvar Novo Modelo */}
        {isCreatingTemplate && (
          <form onSubmit={handleCreateNewTemplate} className="p-4 bg-purple-50 dark:bg-purple-950/50 border-b border-purple-200 dark:border-purple-800 flex flex-wrap items-center gap-3 animate-fade-in text-xs">
            <input
              type="text"
              placeholder="Nome do Novo Modelo (ex: Contrato Eventos 7 Dias)"
              value={newTemplateName}
              onChange={e => setNewTemplateName(e.target.value)}
              required
              className="flex-1 min-w-[240px] px-3 py-2 bg-white dark:bg-slate-900 border border-purple-300 rounded-xl font-medium"
            />
            <input
              type="text"
              placeholder="Descrição breve"
              value={newTemplateDesc}
              onChange={e => setNewTemplateDesc(e.target.value)}
              className="flex-1 min-w-[180px] px-3 py-2 bg-white dark:bg-slate-900 border border-purple-300 rounded-xl font-medium"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Modelo</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingTemplate(false)}
              className="px-3 py-2 text-slate-500 hover:text-slate-800 font-bold"
            >
              Cancelar
            </button>
          </form>
        )}

        {/* Área de Edição do Contrato */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-slate-50/50 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Edit3 className="w-3.5 h-3.5 text-purple-600" />
              <span>Texto do Contrato (Edição Livre em Tempo Real):</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              Você pode alterar qualquer cláusula antes de validar.
            </span>
          </div>

          <textarea
            value={contractText}
            onChange={e => {
              setContractText(e.target.value);
              setIsValidated(false);
            }}
            rows={18}
            className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-[13px] font-mono leading-relaxed text-slate-800 dark:text-slate-100 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Footer com Botão de Concluir para Validar e Ações Rápidas */}
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isValidated && onSendWhatsApp && (
              <button
                type="button"
                onClick={() => onSendWhatsApp(contract)}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Enviar no WhatsApp</span>
              </button>
            )}

            {isValidated && onSendEmail && (
              <button
                type="button"
                onClick={() => onSendEmail(contract)}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Enviar E-mail</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={handleValidate}
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2 transition active:scale-95 text-white ${
                isValidated
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isValidated ? 'Contrato Validado ✓' : 'Concluir para Validar'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
