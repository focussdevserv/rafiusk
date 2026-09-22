import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Trash2, Check, RefreshCw, Image as ImageIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSavePhotos: (photos: string[]) => void;
  initialPhotos?: string[];
  title?: string;
  maxPhotos?: number;
}

export const PhotoCaptureModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSavePhotos,
  initialPhotos = [],
  title = 'Registro Fotográfico do Equipamento',
  maxPhotos = 6
}) => {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos, isOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Erro ao acessar câmera:', err);
      setCameraError('Não foi possível acessar a câmera. Verifique as permissões ou use o upload de fotos.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 800;
    canvas.height = videoRef.current.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Adicionar marca d'água de data e hora do registro
    const now = new Date();
    const dateStr = `RAFIUSK - ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, canvas.height - 35, 340, 25);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillText(dateStr, 20, canvas.height - 18);

    const base64 = canvas.toDataURL('image/jpeg', 0.82);
    if (photos.length < maxPhotos) {
      setPhotos(prev => [...prev, base64]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (photos.length >= maxPhotos) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setPhotos(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    stopCamera();
    onSavePhotos(photos);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">{title}</h3>
              <p className="text-[11px] text-slate-400">
                Tire fotos ao vivo do computador ou faça upload de arquivos ({photos.length}/{maxPhotos})
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              stopCamera();
              onClose();
            }} 
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Câmera View / Controles de Ação */}
          <div className="space-y-3">
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-lg">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={captureFrame}
                    disabled={photos.length >= maxPhotos}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 active:scale-95 transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capturar Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-bold rounded-xl backdrop-blur-md transition"
                  >
                    Pausar Câmera
                  </button>
                </div>

                <div className="absolute top-3 left-3 bg-red-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  AO VIVO
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={photos.length >= maxPhotos}
                  className="flex-1 w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Abrir Câmera para Tirar Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photos.length >= maxPhotos}
                  className="flex-1 w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Carregar da Galeria / Arquivo</span>
                </button>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                />
              </div>
            )}

            {cameraError && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                {cameraError}
              </div>
            )}
          </div>

          {/* Galeria de Fotos Capturadas */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center justify-between">
              <span>Fotos Registradas ({photos.length} de {maxPhotos})</span>
              {photos.length > 0 && (
                <button 
                  type="button" 
                  onClick={() => setPhotos([])}
                  className="text-[11px] text-rose-600 hover:underline"
                >
                  Limpar todas
                </button>
              )}
            </h4>

            {photos.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Nenhuma foto anexada ainda</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tire fotos da tela, teclado, tampa frontal e número de série para segurança patrimonial.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-950 shadow-xs">
                    <img 
                      src={photo} 
                      alt={`Foto do equipamento ${index + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                        title="Remover Foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1.5 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                      Foto {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {photos.length} foto(s) prontas para salvar
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Fotos</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
