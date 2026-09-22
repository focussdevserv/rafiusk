import React, { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { CompanySettings, MessageLog } from '../types';
import { getEvolutionConfig, saveEvolutionConfig, sendEvolutionWhatsAppMessage } from '../services/evolutionApi';
import { getResendConfig, saveResendConfig, sendResendEmail } from '../services/resendService';
import { QRCodeDisplay } from '../components/QRCodeDisplay';

interface Props {
  company: CompanySettings;
  onSaveCompany: (settings: CompanySettings) => void;
  onOpenWhatsAppConnect: () => void;
}

export const SettingsView: React.FC<Props> = ({ company, onSaveCompany, onOpenWhatsAppConnect }) => {
  const [activeTab, setActiveTab] = useState<'pix' | 'company' | 'integrations' | 'logs'>('pix');

  // Company / PIX Form State
  const [companyData, setCompanyData] = useState<CompanySettings>(company);
  const [companySaved, setCompanySaved] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  // Evolution Config State
  const [evoConfig, setEvoConfig] = useState(getEvolutionConfig());
  const [testPhone, setTestPhone] = useState('11999998888');
  const [evoStatusMsg, setEvoStatusMsg] = useState('');

  // Resend Config State
  const [resendConfig, setResendConfig] = useState(getResendConfig());
  const [testEmail, setTestEmail] = useState('contato@rafiusk.shop');
  const [resendStatusMsg, setResendStatusMsg] = useState('');

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

  // Gerador de código PIX Copia e Cola de teste
  const cleanPixKey = companyData.pixKey ? companyData.pixKey.replace(/\D/g, '') : '24981402000190';
  const testPixCode = `00020126580014br.gov.bcb.pix0136${cleanPixKey || 'financeiro@rafiusk.shop'}5204000053039865401.005802BR5920${(companyData.pixBeneficiaryName || companyData.tradeName || 'RAFIUSK INFORMATICA').substring(0, 25)}6009${(companyData.pixCity || 'SAO PAULO').substring(0, 15)}62070503***6304`;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Painel de Controle • RAFIUSK INFORMÁTICA</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Configurações & Chave PIX
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Cadastre sua chave PIX de recebimento, dados cadastrais e credenciais da Evolution API e Resend.
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
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'pix'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Chave PIX de Cobrança</span>
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'company'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Dados da Empresa</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'integrations'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Integrações (WhatsApp & E-mail)</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'logs'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico de Disparos ({logs.length})</span>
        </button>
      </div>

      {/* ABA 1: CHAVE PIX DE COBRANÇA */}
      {activeTab === 'pix' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Formulário de Configuração do PIX */}
          <form onSubmit={handleSaveCompany} className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6 text-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Chave PIX Oficial para Geração de Cobranças
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
                    placeholder="Ex: 48.912.873/0001-92 ou financeiro@rafiusk.shop"
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
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="cnpj">CNPJ</option>
                  <option value="cpf">CPF</option>
                  <option value="email">E-mail</option>
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

            {/* Alerta de Aplicação Automática */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-3">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-bold block">Integração Instantânea com Todo o Sistema:</span>
                <p className="text-[11px] mt-0.5 leading-relaxed">
                  Ao salvar, a nova chave PIX será imediatamente refletida no <strong>Portal do Cliente (rafiusk.shop)</strong>, nos <strong>disparos de cobrança do WhatsApp</strong> e nos recibos de quitação.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-purple-950/20 transition flex items-center gap-2 transform active:scale-95"
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

              {/* QR Code Dinâmico com a Chave Salva */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 dark:border-slate-800 mx-auto w-44 h-44 flex items-center justify-center shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(testPixCode)}&margin=8`}
                  alt="QR Code PIX RAFIUSK"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-left bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                <span className="text-slate-400 block uppercase font-bold text-[9px]">Chave Cadastrada</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white block truncate">
                  {companyData.pixKey || 'Não cadastrada'}
                </span>
                <span className="text-slate-500 text-[10px] block">
                  Beneficiário: {companyData.pixBeneficiaryName || companyData.tradeName || 'RAFIUSK INFORMÁTICA'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(testPixCode);
                  setPixCopied(true);
                  setTimeout(() => setPixCopied(false), 2000);
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition"
              >
                {pixCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{pixCopied ? 'Código PIX Copiado!' : 'Copiar PIX de Teste'}</span>
              </button>

              <span className="text-[10px] text-slate-400 block">
                Abra o app do seu banco e teste o leitor de QR Code para validar a chave.
              </span>
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
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={companyData.tradeName}
                onChange={e => setCompanyData({ ...companyData, tradeName: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
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
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Telefone Principal</label>
              <input
                type="text"
                value={companyData.phone}
                onChange={e => setCompanyData({ ...companyData, phone: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">E-mail Financeiro</label>
              <input
                type="email"
                value={companyData.email}
                onChange={e => setCompanyData({ ...companyData, email: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Endereço Completo</label>
            <input
              type="text"
              value={companyData.address}
              onChange={e => setCompanyData({ ...companyData, address: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Dados Cadastrais</span>
            </button>
          </div>
        </form>
      )}

      {/* ABA 3: INTEGRAÇÕES (WHATSAPP & E-MAIL) */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 max-w-4xl">
          {/* Card Evolution API */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Evolution API (WhatsApp Corporativo)</h3>
                  <p className="text-slate-500 dark:text-slate-400">Instância conectada: rafiusk-hardware</p>
                </div>
              </div>

              <button
                onClick={onOpenWhatsAppConnect}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition active:scale-95 text-xs"
              >
                <QrCode className="w-4 h-4" />
                <span>Escanear QR Code no WhatsApp</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">URL da Evolution API</label>
                <input
                  type="text"
                  value={evoConfig.apiUrl}
                  onChange={e => setEvoConfig({ ...evoConfig, apiUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nome da Instância</label>
                <input
                  type="text"
                  value={evoConfig.instanceName}
                  onChange={e => setEvoConfig({ ...evoConfig, instanceName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Teste de Disparo WhatsApp */}
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-auto">
                <span className="font-bold text-slate-900 dark:text-white block">Testar Disparo no WhatsApp:</span>
                <input
                  type="text"
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  placeholder="DDD + Número (ex: 11998877665)"
                  className="mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs w-full sm:w-64"
                />
              </div>

              <button
                type="button"
                onClick={handleTestWhatsApp}
                className="w-full sm:w-auto py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Teste WhatsApp</span>
              </button>
            </div>
            {evoStatusMsg && <span className="text-xs font-bold text-emerald-600 block">{evoStatusMsg}</span>}
          </div>

          {/* Card Resend */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4 text-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-300 text-indigo-600 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Resend (E-mails Transacionais)</h3>
                <p className="text-slate-500 dark:text-slate-400">Envio automático de contratos e comprovantes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">API Key do Resend</label>
                <input
                  type="password"
                  value={resendConfig.apiKey}
                  onChange={e => setResendConfig({ ...resendConfig, apiKey: e.target.value })}
                  placeholder="re_..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">E-mail Remetente</label>
                <input
                  type="email"
                  value={resendConfig.fromEmail}
                  onChange={e => setResendConfig({ ...resendConfig, fromEmail: e.target.value })}
                  placeholder="contato@rafiusk.shop"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px]"
                />
              </div>
            </div>

            {/* Teste de Disparo Email */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-auto">
                <span className="font-bold text-slate-900 dark:text-white block">Testar Disparo de E-mail:</span>
                <input
                  type="email"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  placeholder="seuemail@teste.com"
                  className="mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs w-full sm:w-64"
                />
              </div>

              <button
                type="button"
                onClick={handleTestEmail}
                className="w-full sm:w-auto py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Teste E-mail</span>
              </button>
            </div>
            {resendStatusMsg && <span className="text-xs font-bold text-indigo-600 block">{resendStatusMsg}</span>}
          </div>
        </div>
      )}

      {/* ABA 4: HISTÓRICO DE DISPAROS */}
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
    </div>
  );
};
