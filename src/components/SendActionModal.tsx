import React, { useState } from 'react';
import { Smartphone, Mail, Send, X, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { sendEvolutionWhatsAppMessage } from '../services/evolutionApi';
import { sendResendEmail } from '../services/resendService';

export interface SendActionData {
  channel: 'whatsapp' | 'email';
  recipientName: string;
  recipientContact: string; // Telefone WhatsApp ou E-mail
  subject?: string;
  defaultMessage: string;
  referenceType: 'contract' | 'invoice' | 'ticket' | 'checklist' | 'general';
  referenceId?: string;
  pixKey?: string;
  pixAmount?: number;
}

interface Props {
  isOpen: boolean;
  data: SendActionData | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SendActionModal: React.FC<Props> = ({ isOpen, data, onClose, onSuccess }) => {
  if (!isOpen || !data) return null;

  const [message, setMessage] = useState(data.defaultMessage);
  const [subject, setSubject] = useState(data.subject || '');
  const [contact, setContact] = useState(data.recipientContact);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; simulated?: boolean; error?: string } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  const handleSend = async () => {
    setSending(true);
    setResult(null);

    try {
      if (data.channel === 'whatsapp') {
        const res = await sendEvolutionWhatsAppMessage(
          contact,
          message,
          data.referenceType,
          data.referenceId,
          data.recipientName
        );
        setResult(res);
        if (res.success) {
          onSuccess?.();
        }
      } else {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #0f172a; margin: 0;">Locadora de Equipamentos de TI</h2>
              <p style="color: #64748b; font-size: 14px; margin: 4px 0;">Notificação Oficial</p>
            </div>
            <div style="white-space: pre-wrap; color: #334155; line-height: 1.6; font-size: 14px;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
            ${data.pixKey ? `
              <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;">
                <p style="margin: 0 0 8px; font-weight: bold; color: #0f172a;">Chave PIX para Pagamento:</p>
                <code style="background: #ffffff; padding: 6px 10px; border-radius: 4px; border: 1px solid #e2e8f0; display: inline-block;">${data.pixKey}</code>
              </div>
            ` : ''}
            <div style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
              Mensagem enviada automaticamente pelo sistema NextRent.
            </div>
          </div>
        `;

        const res = await sendResendEmail(
          contact,
          data.recipientName,
          subject || 'Notificação de Locação',
          html,
          data.referenceType,
          data.referenceId
        );
        setResult(res);
        if (res.success) {
          onSuccess?.();
        }
      }
    } catch (err: any) {
      setResult({ success: false, error: err.message || 'Erro inesperado' });
    } finally {
      setSending(false);
    }
  };

  const copyPixToClipboard = () => {
    if (data.pixKey) {
      navigator.clipboard.writeText(data.pixKey);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${
          data.channel === 'whatsapp' ? 'bg-emerald-700' : 'bg-blue-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              {data.channel === 'whatsapp' ? <Smartphone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-base">
                {data.channel === 'whatsapp' ? 'Disparo via WhatsApp (Evolution API)' : 'Disparo por E-mail (Resend)'}
              </h3>
              <p className="text-xs text-white/80">Destinatário: {data.recipientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {result?.success ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                {data.channel === 'whatsapp' ? 'Mensagem de WhatsApp enviada com sucesso!' : 'E-mail disparado com sucesso!'}
              </h4>
              {result.simulated && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 max-w-sm mx-auto">
                  ℹ️ Modo Demonstração: O envio foi registrado com sucesso no log de mensagens. Configure as credenciais no menu Configurações para disparar para o WhatsApp/E-mail real.
                </p>
              )}
              <div className="pt-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-md transition"
                >
                  Fechar Janela
                </button>
              </div>
            </div>
          ) : (
            <>
              {result?.error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{result.error}</span>
                </div>
              )}

              {/* Contato do Destinatário */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {data.channel === 'whatsapp' ? 'Número WhatsApp com DDD:' : 'E-mail do Destinatário:'}
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Assunto (apenas E-mail) */}
              {data.channel === 'email' && (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Assunto do E-mail:</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Chave Pix (se houver cobrança) */}
              {data.pixKey && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Chave PIX inclusa na mensagem:</span>
                    <span className="font-mono font-bold text-slate-800">{data.pixKey}</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyPixToClipboard}
                    className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-white flex items-center gap-1 transition"
                  >
                    {copiedPix ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPix ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              )}

              {/* Pré-visualização e Edição da Mensagem */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 font-semibold">Texto da Mensagem:</label>
                  <span className="text-[11px] text-slate-400">Você pode editar antes de enviar</span>
                </div>
                <textarea
                  rows={8}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs font-sans focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !contact}
                  className={`px-5 py-2 text-white font-semibold rounded-xl flex items-center gap-2 shadow-md transition disabled:opacity-50 ${
                    data.channel === 'whatsapp' 
                      ? 'bg-emerald-600 hover:bg-emerald-500' 
                      : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  <Send className={`w-4 h-4 ${sending ? 'animate-pulse' : ''}`} />
                  {sending ? 'Disparando...' : data.channel === 'whatsapp' ? 'Enviar WhatsApp Agora' : 'Disparar E-mail Agora'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
