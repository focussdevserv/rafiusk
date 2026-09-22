import React, { useState, useEffect } from 'react';
import { 
  fetchEvolutionQrCode, 
  checkEvolutionConnection, 
  disconnectEvolutionInstance, 
  getEvolutionConfig,
  saveEvolutionConfig,
  QrCodeResponse 
} from '../services/evolutionApi';
import { QrCode, Smartphone, RefreshCw, CheckCircle2, AlertTriangle, X, Settings2, Power } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange?: (connected: boolean) => void;
}

export const WhatsAppConnectModal: React.FC<Props> = ({ isOpen, onClose, onConnectionChange }) => {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<QrCodeResponse | null>(null);
  const [connected, setConnected] = useState(false);
  const [profileName, setProfileName] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState(getEvolutionConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkStatusAndLoadQr();
    }
  }, [isOpen]);

  const checkStatusAndLoadQr = async () => {
    setLoading(true);
    try {
      const status = await checkEvolutionConnection();
      if (status.state === 'open') {
        setConnected(true);
        setProfileName(status.profileName || 'WhatsApp Conectado');
        onConnectionChange?.(true);
      } else {
        setConnected(false);
        onConnectionChange?.(false);
        const qr = await fetchEvolutionQrCode();
        setQrData(qr);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    await disconnectEvolutionInstance();
    setConnected(false);
    onConnectionChange?.(false);
    const qr = await fetchEvolutionQrCode();
    setQrData(qr);
    setLoading(false);
  };

  const handleSimulateConnect = () => {
    localStorage.setItem('evolution_simulated_connected', 'true');
    setConnected(true);
    setProfileName('Locadora TI (Modo Demo)');
    onConnectionChange?.(true);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveEvolutionConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    checkStatusAndLoadQr();
    setShowConfig(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Conectar WhatsApp da Locadora</h3>
              <p className="text-xs text-slate-400">Instância Evolution API (Disparo de Cobranças e Contratos)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {connected ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">WhatsApp Conectado com Sucesso!</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Instância: <span className="font-mono font-medium text-slate-700">{config.instanceName}</span> ({profileName})
                </p>
                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 mt-3 max-w-sm mx-auto">
                  Pronto para enviar cobranças, faturas PIX e contratos de locação automaticamente para seus clientes.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition flex items-center gap-1.5"
                >
                  <Power className="w-3.5 h-3.5" />
                  Desconectar Instância
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition"
                >
                  Concluir e Fechar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  Como conectar pelo celular:
                </p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Abra o <strong>WhatsApp</strong> no celular da empresa;</li>
                  <li>Toque em <strong>Configurações</strong> ou nos <strong>três pontinhos</strong>;</li>
                  <li>Selecione <strong>Aparelhos Conectados</strong> &gt; <strong>Conectar um aparelho</strong>;</li>
                  <li>Aponte a câmera para o QR Code gerado abaixo.</li>
                </ol>
              </div>

              {/* QR Code Area */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-white relative">
                {loading ? (
                  <div className="py-12 flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                    <p className="text-xs text-slate-500">Gerando QR Code na Evolution API...</p>
                  </div>
                ) : qrData?.base64 ? (
                  <div className="flex flex-col items-center gap-3">
                    <img 
                      src={qrData.base64.startsWith('data:') ? qrData.base64 : `data:image/png;base64,${qrData.base64}`} 
                      alt="QR Code WhatsApp" 
                      className="w-56 h-56 object-contain rounded-xl shadow-md border border-slate-200"
                    />
                    {qrData.pairingCode && (
                      <p className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        Código de pareamento: <span className="font-mono text-slate-800 font-bold">{qrData.pairingCode}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-3">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                    <p className="text-xs text-slate-600">Não foi possível carregar o QR Code da Evolution API.</p>
                    <button
                      onClick={checkStatusAndLoadQr}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                )}

                {/* Simulated connect button for development and instant test */}
                <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Modo de Teste Imediato:</span>
                  <button
                    onClick={handleSimulateConnect}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                  >
                    Simular Conexão Concluída ✓
                  </button>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfig(!showConfig)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  {showConfig ? 'Ocultar Parâmetros' : 'Configurar URL & API Key'}
                </button>

                <button
                  type="button"
                  onClick={checkStatusAndLoadQr}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Recarregar QR Code
                </button>
              </div>

              {/* Formulário Colapsável de Parâmetros Evolution */}
              {showConfig && (
                <form onSubmit={handleSaveConfig} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs animate-fade-in">
                  <div className="font-semibold text-slate-700">Configuração da Evolution API</div>
                  <div>
                    <label className="block text-slate-600 mb-1">URL da Evolution API:</label>
                    <input
                      type="url"
                      value={config.apiUrl}
                      onChange={e => setConfig({ ...config, apiUrl: e.target.value })}
                      placeholder="https://sua-evolution.com"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 mb-1">API Key Global:</label>
                      <input
                        type="password"
                        value={config.apiKey}
                        onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                        placeholder="Chave da Evolution"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Nome da Instância:</label>
                      <input
                        type="text"
                        value={config.instanceName}
                        onChange={e => setConfig({ ...config, instanceName: e.target.value })}
                        placeholder="locadora-hardware"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {saveSuccess && <span className="text-emerald-600 font-medium">Salvo!</span>}
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium"
                    >
                      Salvar e Atualizar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
