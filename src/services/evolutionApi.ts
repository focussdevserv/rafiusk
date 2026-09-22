import { MessageLog } from '../types';

export interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
}

const STORAGE_KEY = 'evolution_api_config';

export function getEvolutionConfig(): EvolutionConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Erro ao ler configuração Evolution API', e);
  }

  return {
    apiUrl: import.meta.env.VITE_EVOLUTION_API_URL || 'https://evolutions-evolution-api.fcoipz.easypanel.host',
    apiKey: import.meta.env.VITE_EVOLUTION_API_KEY || '429683C4C977415CAAFCCE10F7D57E11',
    instanceName: import.meta.env.VITE_EVOLUTION_INSTANCE_NAME || 'rafiusk-hardware'
  };
}

export function saveEvolutionConfig(config: EvolutionConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export interface ConnectionStateResponse {
  state: 'open' | 'connecting' | 'close' | 'disconnected' | 'unknown';
  instance?: string;
  profileName?: string;
  profilePictureUrl?: string;
}

export interface QrCodeResponse {
  pairingCode?: string;
  code?: string;
  base64?: string;
  count?: number;
}

export async function checkEvolutionConnection(): Promise<ConnectionStateResponse> {
  const config = getEvolutionConfig();
  if (!config.apiUrl || !config.apiKey || !config.instanceName) {
    return { state: 'disconnected' };
  }

  // Se for URL de exemplo/teste, checamos se há conexão simulada ativa
  const localSimulated = localStorage.getItem('evolution_simulated_connected');
  if (config.apiUrl.includes('exemplo.com')) {
    return {
      state: localSimulated === 'true' ? 'open' : 'disconnected',
      instance: config.instanceName,
      profileName: 'Locadora TI Oficial'
    };
  }

  try {
    const cleanUrl = config.apiUrl.replace(/\/+$/, '');
    const res = await fetch(`${cleanUrl}/instance/connectionState/${config.instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': config.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      return { state: 'disconnected' };
    }

    const data = await res.json();
    return {
      state: data.instance?.state || (data.state === 'open' ? 'open' : 'close'),
      instance: config.instanceName,
      profileName: data.instance?.profileName,
      profilePictureUrl: data.instance?.profilePictureUrl
    };
  } catch (err) {
    console.warn('Falha ao checar status da Evolution API:', err);
    return { state: 'disconnected' };
  }
}

export async function fetchEvolutionQrCode(): Promise<QrCodeResponse | null> {
  const config = getEvolutionConfig();
  if (!config.apiUrl || !config.apiKey || !config.instanceName) {
    return null;
  }

  // Fallback de demonstração visual se a API ainda não estiver conectada a um servidor real
  if (config.apiUrl.includes('exemplo.com') || !config.apiKey) {
    // Retorna QR code demonstrativo em SVG Data URL estilizado
    const demoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" fill="#ffffff" rx="12"/>
      <path d="M20,20 h60 v60 h-60 z M35,35 v30 h30 v-30 z" fill="#0f172a"/>
      <path d="M120,20 h60 v60 h-60 z M135,35 v30 h30 v-30 z" fill="#0f172a"/>
      <path d="M20,120 h60 v60 h-60 z M35,135 v30 h30 v-30 z" fill="#0f172a"/>
      <rect x="90" y="20" width="15" height="15" fill="#0f172a"/>
      <rect x="90" y="45" width="15" height="15" fill="#2563eb"/>
      <rect x="90" y="70" width="15" height="15" fill="#0f172a"/>
      <rect x="20" y="90" width="15" height="15" fill="#0f172a"/>
      <rect x="45" y="90" width="15" height="15" fill="#2563eb"/>
      <rect x="70" y="90" width="15" height="15" fill="#0f172a"/>
      <rect x="120" y="90" width="15" height="15" fill="#0f172a"/>
      <rect x="145" y="90" width="15" height="15" fill="#0f172a"/>
      <rect x="165" y="90" width="15" height="15" fill="#2563eb"/>
      <rect x="95" y="120" width="20" height="20" fill="#0f172a"/>
      <rect x="130" y="125" width="15" height="15" fill="#0f172a"/>
      <rect x="155" y="140" width="25" height="25" fill="#2563eb"/>
      <rect x="95" y="150" width="25" height="30" fill="#0f172a"/>
    </svg>`;
    return {
      base64: `data:image/svg+xml;utf8,${encodeURIComponent(demoSvg)}`,
      pairingCode: '7823-9104',
      count: 1
    };
  }

  try {
    const cleanUrl = config.apiUrl.replace(/\/+$/, '');
    let res = await fetch(`${cleanUrl}/instance/connect/${config.instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': config.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (res.status === 404 || res.status === 400) {
      // Se não existir, cria a instância automaticamente
      res = await fetch(`${cleanUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'apikey': config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instanceName: config.instanceName,
          token: config.apiKey,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS'
        })
      });
    }

    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }

    const data = await res.json();
    return {
      base64: data.base64 || (data.qrcode?.base64 ? data.qrcode.base64 : undefined),
      code: data.code || data.qrcode?.code,
      pairingCode: data.pairingCode
    };
  } catch (err) {
    console.error('Erro ao buscar QR code na Evolution API:', err);
    return null;
  }
}

export async function disconnectEvolutionInstance(): Promise<boolean> {
  const config = getEvolutionConfig();
  localStorage.removeItem('evolution_simulated_connected');

  if (config.apiUrl.includes('exemplo.com')) {
    return true;
  }

  try {
    const cleanUrl = config.apiUrl.replace(/\/+$/, '');
    await fetch(`${cleanUrl}/instance/logout/${config.instanceName}`, {
      method: 'DELETE',
      headers: {
        'apikey': config.apiKey
      }
    });
    return true;
  } catch (err) {
    console.error('Erro ao desconectar instância:', err);
    return false;
  }
}

// Formatar número de telefone para o padrão WhatsApp internacional (Ex: 5511999998888)
export function sanitizeWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('55') && cleaned.length >= 10 && cleaned.length <= 11) {
    cleaned = `55${cleaned}`;
  }
  return cleaned;
}

export async function sendEvolutionWhatsAppMessage(
  recipientPhone: string,
  messageText: string,
  referenceType: 'contract' | 'invoice' | 'ticket' | 'checklist' | 'general' = 'general',
  referenceId?: string,
  recipientName: string = 'Cliente'
): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const config = getEvolutionConfig();
  const sanitizedPhone = sanitizeWhatsAppNumber(recipientPhone);

  const logMessage = (status: 'sent' | 'failed' | 'simulated') => {
    try {
      const logsRaw = localStorage.getItem('system_message_logs') || '[]';
      const logs: MessageLog[] = JSON.parse(logsRaw);
      const newLog: MessageLog = {
        id: crypto.randomUUID(),
        channel: 'whatsapp',
        recipient: sanitizedPhone,
        recipientName,
        content: messageText,
        status,
        referenceType,
        referenceId,
        timestamp: new Date().toISOString()
      };
      logs.unshift(newLog);
      localStorage.setItem('system_message_logs', JSON.stringify(logs.slice(0, 100)));
    } catch (e) {
      console.error('Erro ao salvar log de mensagem', e);
    }
  };

  // Se não configurado ou em modo simulação
  if (!config.apiKey || config.apiUrl.includes('exemplo.com')) {
    logMessage('simulated');
    return { success: true, simulated: true };
  }

  try {
    const cleanUrl = config.apiUrl.replace(/\/+$/, '');
    const payload = {
      number: sanitizedPhone,
      text: messageText,
      options: {
        delay: 1200,
        presence: 'composing',
        linkPreview: true
      }
    };

    const res = await fetch(`${cleanUrl}/message/sendText/${config.instanceName}`, {
      method: 'POST',
      headers: {
        'apikey': config.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      logMessage('failed');
      return { success: false, error: errorText };
    }

    logMessage('sent');
    return { success: true };
  } catch (err: any) {
    logMessage('failed');
    return { success: false, error: err.message || 'Erro de rede ao conectar com a Evolution API' };
  }
}
