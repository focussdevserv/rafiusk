import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Smartphone, 
  Mail, 
  Save, 
  CheckCircle, 
  QrCode, 
  Send, 
  History, 
  KeyRound,
  ShieldCheck,
  DollarSign,
  Copy,
  Check,
  CreditCard,
  HelpCircle,
  ExternalLink,
  Database,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { CompanySettings, MessageLog } from '../types';
import { getEvolutionConfig, saveEvolutionConfig, sendEvolutionWhatsAppMessage } from '../services/evolutionApi';
import { getResendConfig, saveResendConfig, sendResendEmail } from '../services/resendService';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { db } from '../services/database';

interface Props {
  company: CompanySettings;
  onSaveCompany: (settings: CompanySettings) => void;
  onOpenWhatsAppConnect: () => void;
  onRefreshData?: () => Promise<void>;
}

export const SettingsView: React.FC<Props> = ({ 
  company, 
  onSaveCompany, 
  onOpenWhatsAppConnect,
  onRefreshData 
}) => {
  const [activeTab, setActiveTab] = useState<'pix' | 'company' | 'integrations' | 'database' | 'logs'>('pix');

  // Company / PIX Form State
  const [companyData, setCompanyData] = useState<CompanySettings>(() => ({
    ...company,
    email: company.email || 'Cr.sp3ktrum@gmail.com',
    pixKey: company.pixKey || 'Cr.sp3ktrum@gmail.com'
  }));
  const [companySaved, setCompanySaved] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  // Evolution Config State
  const [evoConfig, setEvoConfig] = useState(getEvolutionConfig());
  const [testPhone, setTestPhone] = useState('11999998888');
  const [evoStatusMsg, setEvoStatusMsg] = useState('');

  // Resend Config State
  const [resendConfig, setResendConfig] = useState(getResendConfig());
  const [testEmail, setTestEmail] = useState('Cr.sp3ktrum@gmail.com');
  const [resendStatusMsg, setResendStatusMsg] = useState('');

  // Database Action State
  const [dbStatusMsg, setDbStatusMsg] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logs
  const [logs, setLogs] = useState<MessageLog[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('system_message_logs') || '[]');
    } catch {
      return [];
    }
  });

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompany(companyData);
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 2500);
  };

  const handleSaveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    saveEvolutionConfig(evoConfig);
    saveResendConfig(resendConfig);
    alert('Configurações de integração salvas com sucesso!');
  };

  const handleTestWhatsApp = async () => {
    setEvoStatusMsg('Disparando mensagem de teste...');
    const res = await sendEvolutionWhatsAppMessage(
      testPhone,
      '👋 Olá! Esta é uma mensagem de teste enviada pela Evolution API através do sistema RAFIUSK INFORMÁTICA.',
      'general',
      undefined,
      'Contato de Teste'
    );
    if (res.success) {
      setEvoStatusMsg('✓ WhatsApp enviado com sucesso!');
      setLogs(JSON.parse(localStorage.getItem('system_message_logs') || '[]'));
    } else {
      setEvoStatusMsg(`❌ Falha: ${res.error}`);
    }
    setTimeout(() => setEvoStatusMsg(''), 4000);
  };

  const handleTestEmail = async () => {
    setResendStatusMsg('Disparando e-mail de teste...');
    const res = await sendResendEmail(
      testEmail,
      'Contato de Teste',
      'Teste de E-mail - RAFIUSK INFORMÁTICA',
      '<div style="font-family: sans-serif; padding: 20px;"><h2>RAFIUSK INFORMÁTICA</h2><p>Este é um e-mail de teste do sistema de locação de hardware enviado via Resend.</p></div>',
      'general'
    );
    if (res.success) {
      setResendStatusMsg(res.simulated ? '✓ Simulado com sucesso!' : '✓ E-mail enviado via Resend!');
      setLogs(JSON.parse(localStorage.getItem('system_message_logs') || '[]'));
    } else {
      setResendStatusMsg(`❌ Falha: ${res.error}`);
    }
    setTimeout(() => setResendStatusMsg(''), 4000);
  };

  // Funções de Gestão de Banco de Dados
  const handleResetToEmpty = async () => {
    await db.resetDatabaseToEmpty();
    if (onRefreshData) await onRefreshData();
    setIsResetConfirmOpen(false);
    setDbStatusMsg('✓ Base de dados limpa com sucesso! Todos os dados de teste foram removidos.');
    setTimeout(() => setDbStatusMsg(null), 5000);
  };

  const handleExportBackup = async () => {
    const jsonString = await db.exportCompleteBackup();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_rafiusk_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDbStatusMsg('✓ Backup exportado com sucesso!');
    setTimeout(() => setDbStatusMsg(null), 4000);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await db.importCompleteBackup(content);
      if (success) {
        if (onRefreshData) await onRefreshData();
        setDbStatusMsg('✓ Backup restaurado com sucesso! Os dados foram atualizados.');
      } else {
        setDbStatusMsg('❌ Erro: Arquivo de backup inválido.');
      }
      setTimeout(() => setDbStatusMsg(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200/60 dark:border-purple-800/60">
              Painel de Controle
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Configurações & Gestão RAFIUSK
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Cadastre a chave PIX oficial, dados cadastrais da empresa e gerencie a base de dados do sistema.
          </p>
        </div>

        {companySaved && (
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 animate-bounce">
            <CheckCircle className="w-4 h-4" />
            <span>Configurações Salvas!</span>
          </span>
        )}
      </div>

      {/* Navegação por Abas */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('pix')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'pix'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Chave PIX Oficial</span>
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'company'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Dados da Empresa</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'database'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Gestão da Base de Dados</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'integrations'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Integrações (WhatsApp & E-mail)</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Logs de Disparos</span>
        </button>
      </div>

      {/* ABA 1: CONFIGURAÇÃO DE CHAVE PIX */}
      {activeTab === 'pix' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSaveCompany} className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6 text-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Chave PIX Oficial para Recebimento de Locações
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Esta chave é utilizada automaticamente para gerar as faturas, QR Codes do Portal do Cliente e mensagens do WhatsApp.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider mb-2">
                  Chave PIX Oficial *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={companyData.pixKey}
                    onChange={e => setCompanyData({ ...companyData, pixKey: e.target.value })}
                    placeholder="Ex: Cr.sp3ktrum@gmail.com ou 48.912.873/0001-92"
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <ShieldCheck className="w-4 h-4 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider mb-2">
                  Tipo da Chave
                </label>
                <select
                  value={companyData.pixKeyType}
                  onChange={e => setCompanyData({ ...companyData, pixKeyType: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="email">E-mail</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="cpf">CPF</option>
                  <option value="phone">Celular / Telefone</option>
                  <option value="random">Chave Aleatória (EVP)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider mb-2">
                  Nome do Titular da Conta (Beneficiário)
                </label>
                <input
                  type="text"
                  value={companyData.pixBeneficiaryName || companyData.tradeName}
                  onChange={e => setCompanyData({ ...companyData, pixBeneficiaryName: e.target.value })}
                  placeholder="Ex: RAFIUSK INFORMÁTICA LTDA"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider mb-2">
                  Cidade do Titular da Conta (BACEN)
                </label>
                <input
                  type="text"
                  value={companyData.pixCity || 'SÃO PAULO'}
                  onChange={e => setCompanyData({ ...companyData, pixCity: e.target.value })}
                  placeholder="Ex: SÃO PAULO"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-3">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-bold block">Integração Instantânea:</span>
                <p className="text-[11px] mt-0.5 leading-relaxed">
                  Ao salvar, a nova chave PIX será imediatamente refletida no <strong>Portal do Cliente (rafiusk.shop)</strong>, nos <strong>disparos de cobrança do WhatsApp</strong> e nos recibos de quitação.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-purple-950/20 transition flex items-center gap-2 transform active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Chave PIX</span>
              </button>
            </div>
          </form>

          {/* Card de Teste & Validação do PIX em Tempo Real */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 text-center space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <QrCode className="w-4 h-4 text-purple-600" />
                <span>Pré-visualização do PIX</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex justify-center items-center">
                <QRCodeDisplay 
                  value={companyData.pixKey || 'Cr.sp3ktrum@gmail.com'}
                  size={140}
                  showCopy={false}
                  showDownload={false}
                />
              </div>

              <div className="text-left space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/80 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Chave Configurada:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                    {companyData.pixKey || 'Não definida'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Beneficiário:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                    {companyData.pixBeneficiaryName || companyData.tradeName}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(companyData.pixKey);
                  setPixCopied(true);
                  setTimeout(() => setPixCopied(false), 2000);
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {pixCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{pixCopied ? 'Chave Copiada!' : 'Copiar Chave PIX'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: DADOS DA EMPRESA */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-5 text-xs max-w-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Identificação Cadastral da Empresa</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Razão Social *</label>
              <input
                type="text"
                required
                value={companyData.companyName}
                onChange={e => setCompanyData({ ...companyData, companyName: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={companyData.tradeName}
                onChange={e => setCompanyData({ ...companyData, tradeName: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">CNPJ *</label>
              <input
                type="text"
                required
                value={companyData.cnpj}
                onChange={e => setCompanyData({ ...companyData, cnpj: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Telefone Principal</label>
              <input
                type="text"
                value={companyData.phone}
                onChange={e => setCompanyData({ ...companyData, phone: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">E-mail Corporativo</label>
              <input
                type="email"
                value={companyData.email}
                onChange={e => setCompanyData({ ...companyData, email: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Endereço Completo</label>
            <input
              type="text"
              value={companyData.address}
              onChange={e => setCompanyData({ ...companyData, address: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Dados Cadastrais</span>
            </button>
          </div>
        </form>
      )}

      {/* ABA 3: GESTÃO DA BASE DE DADOS & BACKUP (DADOS REAIS VS TESTE) */}
      {activeTab === 'database' && (
        <div className="space-y-6 max-w-4xl">
          
          {dbStatusMsg && (
            <div className={`p-4 rounded-2xl border text-xs font-bold animate-fade-in ${
              dbStatusMsg.includes('✓') 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}>
              {dbStatusMsg}
            </div>
          )}

          {/* Card: Inicialização da Base Limpa / Produção */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-4 text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Limpeza de Dados Fictícios / Iniciar em Branco
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Limpe todas as informações de teste pré-carregadas para iniciar com a base 100% limpa para cadastros reais.
                </p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Esta ação remove do armazenamento local todos os clientes fictícios, faturas de demonstração, contratos de teste e chamados antigos. A conta do administrador e as configurações da empresa são preservadas.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-rose-600/20 transition cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Zerar Base de Dados / Iniciar em Branco</span>
              </button>
            </div>
          </div>

          {/* Card: Backup Completo e Restauração */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-4 text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Backup Completo & Restauração de Segurança
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Exporte cópias de segurança em formato JSON para arquivamento ou importe bases salvas anteriormente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Download className="w-4 h-4 text-purple-600" />
                  <span>Exportar Dados</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Gera um arquivo JSON completo contendo clientes, equipamentos, contratos, financeiro e configurações.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Backup (.JSON)</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Restaurar Dados</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Carregue um arquivo JSON de backup previamente gerado para restaurar todos os registros.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportFile}
                  accept=".json"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Selecionar Arquivo Backup</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ABA 4: INTEGRAÇÕES (WHATSAPP & E-MAIL) */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 max-w-4xl">
          {/* Card Evolution API */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Evolution API (WhatsApp Corporativo)</h3>
              </div>
              <button
                type="button"
                onClick={onOpenWhatsAppConnect}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition text-[11px] cursor-pointer"
              >
                <span>Conectar Instância QR Code</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">URL da Instância</label>
                <input
                  type="text"
                  value={evoConfig.apiUrl}
                  onChange={e => setEvoConfig({ ...evoConfig, apiUrl: e.target.value })}
                  placeholder="https://api.meuservidor.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Nome da Instância</label>
                <input
                  type="text"
                  value={evoConfig.instanceName}
                  onChange={e => setEvoConfig({ ...evoConfig, instanceName: e.target.value })}
                  placeholder="rafiusk-locacoes"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">API Key (Token Global)</label>
                <input
                  type="password"
                  value={evoConfig.apiKey}
                  onChange={e => setEvoConfig({ ...evoConfig, apiKey: e.target.value })}
                  placeholder="Chave secreta"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="text"
                value={testPhone}
                onChange={e => setTestPhone(e.target.value)}
                placeholder="11999998888 (com DDD)"
                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs w-48"
              />
              <button
                type="button"
                onClick={handleTestWhatsApp}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Teste WhatsApp</span>
              </button>
            </div>
            {evoStatusMsg && <span className="text-xs font-bold text-emerald-600 block">{evoStatusMsg}</span>}
          </div>

          {/* Card Resend */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Mail className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Resend (E-mail Transacional)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">API Key Resend (re_...)</label>
                <input
                  type="password"
                  value={resendConfig.apiKey}
                  onChange={e => setResendConfig({ ...resendConfig, apiKey: e.target.value })}
                  placeholder="re_123456789..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Remetente Oficial (From)</label>
                <input
                  type="text"
                  value={resendConfig.fromEmail}
                  onChange={e => setResendConfig({ ...resendConfig, fromEmail: e.target.value })}
                  placeholder="cobranca@rafiusk.shop"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="email"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                placeholder="seu.email@dominio.com"
                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs w-64"
              />
              <button
                type="button"
                onClick={handleTestEmail}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Teste E-mail</span>
              </button>
            </div>
            {resendStatusMsg && <span className="text-xs font-bold text-indigo-600 block">{resendStatusMsg}</span>}
          </div>
        </div>
      )}

      {/* ABA 5: HISTÓRICO DE DISPAROS */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Histórico de Mensagens Enviadas</h3>
            <span className="text-slate-400 text-[11px]">{logs.length} disparos registrados</span>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Nenhuma mensagem disparada recentemente.
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2.5">
                    {log.channel === 'whatsapp' ? (
                      <Smartphone className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Mail className="w-4 h-4 text-indigo-500" />
                    )}
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white">{log.recipientName}</span>
                      <span className="text-slate-400 block font-mono text-[10px]">{log.recipient}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {log.status}
                    </span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmação para Zerar Base de Dados */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Zerar Base de Dados?
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Você está prestes a limpar todos os registros de demonstração (clientes fictícios, faturas, contratos e chamados de teste).
              <br /><br />
              O sistema ficará <strong>100% limpo</strong> para você cadastrar seus equipamentos e clientes reais. Suas credenciais de login e dados da empresa continuarão salvos.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetToEmpty}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-md transition cursor-pointer active:scale-95"
              >
                Sim, Limpar Base Agora
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
