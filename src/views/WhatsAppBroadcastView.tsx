import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  RefreshCw, 
  QrCode, 
  Users, 
  MessageSquare,
  ShieldCheck,
  Power
} from 'lucide-react';
import { Invoice, Client, CompanySettings } from '../types';
import { checkEvolutionConnection, sendEvolutionWhatsAppMessage } from '../services/evolutionApi';

interface Props {
  invoices: Invoice[];
  clients: Client[];
  company: CompanySettings;
  isWhatsAppConnected: boolean;
  onOpenConnectModal: () => void;
  onSendWhatsApp: (recipientName: string, recipientPhone: string, message: string) => void;
}

export const WhatsAppBroadcastView: React.FC<Props> = ({
  invoices,
  clients,
  company,
  isWhatsAppConnected,
  onOpenConnectModal,
  onSendWhatsApp
}) => {
  const [instanceStatus, setInstanceStatus] = useState<string>('Verificando...');
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [broadcastType, setBroadcastType] = useState<'overdue' | 'upcoming' | 'portal'>('overdue');

  const pendingInvoices = invoices.filter(i => i.status === 'pending');
  
  // Vencidas
  const today = new Date().toISOString().split('T')[0];
  const overdueInvoices = pendingInvoices.filter(i => i.dueDate < today);
  const upcomingInvoices = pendingInvoices.filter(i => i.dueDate >= today);

  useEffect(() => {
    handleCheckStatus();
  }, []);

  const handleCheckStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await checkEvolutionConnection();
      setInstanceStatus(res.state === 'open' ? 'Conectado e Operacional' : 'Desconectado');
    } catch {
      setInstanceStatus('Erro de Conexão');
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleSelectAll = (list: Invoice[]) => {
    if (selectedInvoiceIds.length === list.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(list.map(i => i.id));
    }
  };

  const handleSendOverdueBroadcast = () => {
    const targets = overdueInvoices.filter(i => selectedInvoiceIds.includes(i.id));
    if (targets.length === 0) {
      alert('Selecione ao menos uma fatura para enviar cobrança.');
      return;
    }

    targets.forEach(inv => {
      const msg = `Olá, ${inv.clientName}!\n\nIdentificamos a pendência da mensalidade de locação de computadores (${inv.invoiceNumber} - ${inv.periodDescription}) no valor de R$ ${inv.amount.toFixed(2)}, vencida em ${new Date(inv.dueDate).toLocaleDateString('pt-BR')}.\n\nPara sua comodidade, você pode efetuar o pagamento via Chave PIX:\n${company.pixKey || 'financeiro@rafiusk.com.br'}\n\nOu acesse seu autoatendimento no Portal do Cliente com seu CPF em: https://rafiusk.shop/?portal=client\n\nEquipe RAFIUSK INFORMÁTICA`;
      onSendWhatsApp(inv.clientName, inv.clientPhone, msg);
    });
  };

  const handleSendPortalBroadcast = () => {
    clients.forEach(cli => {
      const msg = `Olá, ${cli.name}!\n\nA RAFIUSK INFORMÁTICA disponibilizou seu Portal do Cliente exclusivo para consulta de computadores alugados, emissão de contratos e pagamentos via PIX.\n\nPara acessar, basta entrar no link e informar seu CPF/CNPJ:\nhttps://rafiusk.shop/?portal=client\n\nQualquer dúvida, estamos à disposição por aqui!`;
      onSendWhatsApp(cli.name, cli.phone, msg);
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header do Módulo */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Smartphone className="w-4 h-4" />
            <span>Evolution API • rafiusk-hardware</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Central de WhatsApp & Régua de Cobrança
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Automatize cobranças de mensalidades com chave PIX e envie o link do Portal do Cliente direto no WhatsApp.
          </p>
        </div>

        {/* Status da Instância */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${isWhatsAppConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Status da Instância</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isWhatsAppConnected ? 'Online (Conectado)' : 'Desconectado'}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenConnectModal}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
          >
            <Smartphone className="w-4 h-4" />
            <span>{isWhatsAppConnected ? 'Gerenciar WhatsApp' : 'Conectar WhatsApp'}</span>
          </button>
        </div>
      </div>

      {/* 2. Seleção de Régua */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => {
            setBroadcastType('overdue');
            setSelectedInvoiceIds(overdueInvoices.map(i => i.id));
          }}
          className={`p-5 rounded-3xl border text-left transition flex items-center justify-between ${
            broadcastType === 'overdue'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800 ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-600 block">Inadimplência</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Cobrança de Vencidos</h3>
            <span className="text-xs text-slate-400 mt-0.5 block">{overdueInvoices.length} faturas em atraso</span>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-500" />
        </button>

        <button
          onClick={() => {
            setBroadcastType('upcoming');
            setSelectedInvoiceIds(upcomingInvoices.map(i => i.id));
          }}
          className={`p-5 rounded-3xl border text-left transition flex items-center justify-between ${
            broadcastType === 'upcoming'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-800 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-600 block">Lembrete Amigável</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Avisos a Vencer</h3>
            <span className="text-xs text-slate-400 mt-0.5 block">{upcomingInvoices.length} faturas vigentes</span>
          </div>
          <Clock className="w-6 h-6 text-amber-500" />
        </button>

        <button
          onClick={() => setBroadcastType('portal')}
          className={`p-5 rounded-3xl border text-left transition flex items-center justify-between ${
            broadcastType === 'portal'
              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 dark:border-purple-800 ring-2 ring-purple-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-600 block">Autoatendimento</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Enviar Portal do Cliente</h3>
            <span className="text-xs text-slate-400 mt-0.5 block">{clients.length} clientes ativos</span>
          </div>
          <QrCode className="w-6 h-6 text-purple-500" />
        </button>
      </div>

      {/* 3. Tabela de Disparo */}
      {broadcastType !== 'portal' ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Faturas Selecionadas para Notificação
              </h3>
              <span className="text-xs text-slate-400">
                {selectedInvoiceIds.length} selecionada(s) para disparo via Evolution API
              </span>
            </div>

            <button
              onClick={handleSendOverdueBroadcast}
              disabled={selectedInvoiceIds.length === 0}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span>Disparar Mensagens de Cobrança ({selectedInvoiceIds.length})</span>
            </button>
          </div>

          <div className="space-y-2">
            {(broadcastType === 'overdue' ? overdueInvoices : upcomingInvoices).map((inv) => {
              const isSelected = selectedInvoiceIds.includes(inv.id);
              return (
                <div
                  key={inv.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedInvoiceIds(selectedInvoiceIds.filter(id => id !== inv.id));
                    } else {
                      setSelectedInvoiceIds([...selectedInvoiceIds, inv.id]);
                    }
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-400'
                      : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 rounded text-purple-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-xs block">
                        {inv.clientName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {inv.invoiceNumber} • Vencimento: <strong className="text-rose-500">{inv.dueDate}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white block">
                      R$ {inv.amount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">WhatsApp: {inv.clientPhone}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center mx-auto text-purple-600">
            <QrCode className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Divulgar o Portal do Cliente para Toda a Base
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Envia uma mensagem no WhatsApp de todos os clientes cadastrados com o link oficial <span className="font-bold text-purple-600">https://rafiusk.shop/?portal=client</span> convidando-os a acessar com o CPF.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSendPortalBroadcast}
              className="py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/20 flex items-center gap-2 mx-auto transition"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Link do Portal para os {clients.length} Clientes</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
