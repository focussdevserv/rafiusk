import React, { useState } from 'react';
import { 
  Globe, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  Smartphone, 
  Printer, 
  Users, 
  ShieldCheck, 
  Download,
  Share2,
  FileText
} from 'lucide-react';
import { Client, CompanySettings } from '../types';
import { QRCodeDisplay } from '../components/QRCodeDisplay';

interface Props {
  clients: Client[];
  company: CompanySettings;
  onOpenPortal: (cpf?: string) => void;
  onSendWhatsApp: (clientName: string, phone: string, link: string) => void;
}

export const ClientPortalAdminView: React.FC<Props> = ({
  clients,
  company,
  onOpenPortal,
  onSendWhatsApp
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [copiedGeneral, setCopiedGeneral] = useState(false);
  const [copiedPersonal, setCopiedPersonal] = useState(false);

  // Domínio oficial configurado pelo usuário
  const domain = import.meta.env.VITE_APP_URL || 'https://rafiusk.shop';
  const generalPortalUrl = `${domain}/?portal=client`;

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const cleanCpf = selectedClient ? selectedClient.document.replace(/\D/g, '') : '';
  const personalPortalUrl = selectedClient ? `${domain}/?portal=client&cpf=${cleanCpf}` : '';

  const handleCopy = (text: string, isPersonal: boolean) => {
    navigator.clipboard.writeText(text);
    if (isPersonal) {
      setCopiedPersonal(true);
      setTimeout(() => setCopiedPersonal(false), 2000);
    } else {
      setCopiedGeneral(true);
      setTimeout(() => setCopiedGeneral(false), 2000);
    }
  };

  const handlePrintCounterDisplay = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>Portal do Cliente • Acesso com CPF</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Gerador de Acesso & QR Code
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gere links e QR Codes para seus clientes consultarem máquinas alugadas, contratos e pagarem mensalidades via PIX informando apenas o CPF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenPortal()}
            className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 flex items-center gap-2 transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir Portal do Cliente</span>
          </button>
        </div>
      </div>

      {/* 2. Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Link Geral do Portal & Display de Balcão */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Link Geral do Portal
                  </h3>
                  <span className="text-xs text-slate-400">
                    O cliente acessa e digita o CPF dele
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-mono font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                rafiusk.shop
              </span>
            </div>

            {/* Input do Link */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate">
                {generalPortalUrl}
              </span>
              <button
                onClick={() => handleCopy(generalPortalUrl, false)}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0 transition"
              >
                {copiedGeneral ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedGeneral ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            {/* QR Code Centralizado */}
            <div className="flex justify-center py-2">
              <QRCodeDisplay
                value={generalPortalUrl}
                size={180}
                title="Aponte a câmera do celular para abrir o Portal"
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <button
              onClick={() => onOpenPortal()}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Testar Acesso</span>
            </button>

            <button
              onClick={handlePrintCounterDisplay}
              className="flex-1 py-2.5 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center justify-center gap-2 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Display de Balcão</span>
            </button>
          </div>
        </div>

        {/* Card 2: Link Personalizado com CPF Direto & Envio WhatsApp */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Acesso Direto por Cliente
                </h3>
                <span className="text-xs text-slate-400">
                  Gere o link já com o CPF embutido para envio rápido
                </span>
              </div>
            </div>

            {/* Seletor de Cliente */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Selecione o Cliente
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Escolha um cliente para gerar link direto --</option>
                {clients.map((cli) => (
                  <option key={cli.id} value={cli.id}>
                    {cli.name} ({cli.document})
                  </option>
                ))}
              </select>
            </div>

            {selectedClient ? (
              <div className="space-y-4">
                {/* Link Gerado */}
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200 dark:border-indigo-900 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-indigo-900 dark:text-indigo-300 truncate">
                    {personalPortalUrl}
                  </span>
                  <button
                    onClick={() => handleCopy(personalPortalUrl, true)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 shrink-0 transition"
                  >
                    {copiedPersonal ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPersonal ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                {/* QR Code Personalizado */}
                <div className="flex justify-center py-1">
                  <QRCodeDisplay
                    value={personalPortalUrl}
                    size={160}
                    title={`QR Code exclusivo para ${selectedClient.name.split(' ')[0]}`}
                  />
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                Selecione um cliente acima para gerar um QR Code e link exclusivo com o CPF pré-preenchido.
              </div>
            )}
          </div>

          {/* Botões de Envio via WhatsApp */}
          {selectedClient && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <button
                onClick={() => onOpenPortal(cleanCpf)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver como {selectedClient.name.split(' ')[0]}</span>
              </button>

              <button
                onClick={() => onSendWhatsApp(selectedClient.name, selectedClient.phone, personalPortalUrl)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Enviar no WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Display de Impressão de Balcão (Visível apenas na impressão ou pré-visualização) */}
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Printer className="w-4 h-4" />
          <span>Modelo de Display para Balcão da Loja / Recepção</span>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-black p-1.5 flex items-center justify-center">
                <img src="/assets/logo_rafiusk_web.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                RAFIUSK INFORMÁTICA
              </span>
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              Acesse o Portal do Cliente no seu Celular
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              1. Aponte a câmera do seu smartphone para o QR Code ao lado.<br />
              2. Digite seu CPF para consultar suas máquinas e pagar mensalidades via PIX.<br />
              3. Acesso rápido e seguro pelo endereço oficial: <span className="font-bold text-purple-600">rafiusk.shop</span>
            </p>
          </div>

          <div className="shrink-0">
            <QRCodeDisplay
              value={generalPortalUrl}
              size={130}
              showCopy={false}
              showDownload={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
