import { MessageLog } from '../types';

export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
}

const STORAGE_KEY = 'resend_api_config';

export function getResendConfig(): ResendConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Erro ao ler configuração Resend', e);
  }

  return {
    apiKey: import.meta.env.VITE_RESEND_API_KEY || '',
    fromEmail: import.meta.env.VITE_RESEND_FROM_EMAIL || 'locadora@notificacoes.com.br'
  };
}

export function saveResendConfig(config: ResendConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function sendResendEmail(
  toEmail: string,
  recipientName: string,
  subject: string,
  htmlContent: string,
  referenceType: 'contract' | 'invoice' | 'ticket' | 'checklist' | 'general' = 'general',
  referenceId?: string
): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const config = getResendConfig();

  const logMessage = (status: 'sent' | 'failed' | 'simulated') => {
    try {
      const logsRaw = localStorage.getItem('system_message_logs') || '[]';
      const logs: MessageLog[] = JSON.parse(logsRaw);
      const newLog: MessageLog = {
        id: crypto.randomUUID(),
        channel: 'email',
        recipient: toEmail,
        recipientName,
        subject,
        content: htmlContent.replace(/<[^>]*>?/gm, ' ').substring(0, 180) + '...',
        status,
        referenceType,
        referenceId,
        timestamp: new Date().toISOString()
      };
      logs.unshift(newLog);
      localStorage.setItem('system_message_logs', JSON.stringify(logs.slice(0, 100)));
    } catch (e) {
      console.error('Erro ao registrar log de e-mail', e);
    }
  };

  // Se não configurado com chave válida, simula e gera log
  if (!config.apiKey || !config.apiKey.startsWith('re_')) {
    logMessage('simulated');
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: config.fromEmail,
        to: [toEmail],
        subject: subject,
        html: htmlContent
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      logMessage('failed');
      return { success: false, error: errorData.message || 'Erro ao enviar email pelo Resend' };
    }

    logMessage('sent');
    return { success: true };
  } catch (err: any) {
    logMessage('failed');
    return { success: false, error: err.message || 'Erro de conexão com o Resend' };
  }
}
