import React, { useState } from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  RotateCcw, 
  Smartphone, 
  Printer, 
  CreditCard, 
  Banknote, 
  FileText, 
  X,
  Mail,
  Calendar
} from 'lucide-react';
import { Invoice, PaymentMethod, Client } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  client?: Client;
  onConfirmPayment: (invoiceId: string, method: PaymentMethod, paidDate: string) => Promise<void>;
  onRevertPayment: (invoiceId: string) => Promise<void>;
  onSendReceiptWhatsApp: (invoice: Invoice) => void;
  onSendReceiptEmail: (invoice: Invoice) => void;
  onPrintReceipt: (invoice: Invoice) => void;
}

export const PaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  invoice,
  client,
  onConfirmPayment,
  onRevertPayment,
  onSendReceiptWhatsApp,
  onSendReceiptEmail,
  onPrintReceipt
}) => {
  if (!isOpen || !invoice) return null;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(invoice.paymentMethod || 'pix');
  const [paidDate, setPaidDate] = useState<string>(
    invoice.paidDate ? invoice.paidDate.split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAlreadyPaid = invoice.status === 'paid';

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmPayment(invoice.id, selectedMethod, paidDate);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevert = async () => {
    if (confirm(`Deseja desfazer a baixa e reabrir a fatura ${invoice.invoiceNumber}?`)) {
      setIsSubmitting(true);
      try {
        await onRevertPayment(invoice.id);
        onClose();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const paymentOptions: { id: PaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'pix', label: 'PIX Instantâneo', icon: <DollarSign className="w-4 h-4 text-emerald-500" />, desc: 'Chave PIX ou QR Code' },
    { id: 'cash', label: 'Dinheiro em Espécie', icon: <Banknote className="w-4 h-4 text-amber-500" />, desc: 'Pagamento físico no balcão' },
    { id: 'credit_card', label: 'Cartão de Crédito', icon: <CreditCard className="w-4 h-4 text-blue-500" />, desc: 'Máquina de cartão / Link' },
    { id: 'debit_card', label: 'Cartão de Débito', icon: <CreditCard className="w-4 h-4 text-indigo-500" />, desc: 'Débito à vista' },
    { id: 'boleto', label: 'Boleto Bancário', icon: <FileText className="w-4 h-4 text-purple-500" />, desc: 'Compensação bancária' },
    { id: 'bank_transfer', label: 'Transferência / TED', icon: <DollarSign className="w-4 h-4 text-slate-500" />, desc: 'TED ou DOC em conta' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isAlreadyPaid ? 'bg-emerald-600/30 text-emerald-400' : 'bg-blue-600/30 text-blue-400'
            }`}>
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">
                {isAlreadyPaid ? 'Gestão de Pagamento Realizado' : 'Dar Baixa na Mensalidade'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Fatura {invoice.invoiceNumber} • {invoice.clientName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 space-y-5">
          {/* Card Resumo do Valor */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor da Mensalidade</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Vencimento original: {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Status Atual</span>
              <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full mt-1 ${
                isAlreadyPaid 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {isAlreadyPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                {isAlreadyPaid ? 'PAGO / QUITADO' : 'PENDENTE'}
              </span>
            </div>
          </div>

          {/* Seleção do Tipo de Pagamento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Forma de Pagamento Recebida:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {paymentOptions.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedMethod(opt.id)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                    selectedMethod === opt.id
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="mt-0.5">{opt.icon}</div>
                  <div>
                    <strong className="block text-xs font-bold leading-tight">{opt.label}</strong>
                    <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">{opt.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Data do Pagamento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Data do Pagamento:</span>
            </label>
            <input
              type="date"
              value={paidDate}
              onChange={e => setPaidDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Se já estiver pago, oferece ações de comprovante e de desfazer */}
          {isAlreadyPaid && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Comprovante & Recibo Oficial
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSendReceiptWhatsApp(invoice)}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Enviar Recibo WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSendReceiptEmail(invoice)}
                  className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>E-mail</span>
                </button>

                <button
                  type="button"
                  onClick={() => onPrintReceipt(invoice)}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {isAlreadyPaid ? (
            <button
              type="button"
              onClick={handleRevert}
              disabled={isSubmitting}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 border border-rose-200 dark:border-rose-900"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Desfazer Pagamento</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Fechar
            </button>
            {!isAlreadyPaid && (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Baixa</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
