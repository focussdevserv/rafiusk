import React, { useState } from 'react';
import { QrCode, Download, Copy, Check } from 'lucide-react';

interface Props {
  value: string;
  size?: number;
  title?: string;
  showDownload?: boolean;
  showCopy?: boolean;
}

export const QRCodeDisplay: React.FC<Props> = ({
  value,
  size = 200,
  title,
  showDownload = true,
  showCopy = true
}) => {
  const [copied, setCopied] = useState(false);

  // URL do QR Code gerado em alta resolução
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodeURIComponent(value)}&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qrcode-rafiusk-${Date.now()}.png`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
      {title && (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
          {title}
        </span>
      )}

      {/* Moldura elegante com a identidade visual da RAFIUSK */}
      <div className="relative p-3 bg-white rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800 flex items-center justify-center">
        <img
          src={qrUrl}
          alt={`QR Code para ${value}`}
          style={{ width: size, height: size }}
          className="rounded-lg object-contain"
          onError={(e) => {
            // Fallback caso a rede esteja totalmente offline
            const target = e.currentTarget;
            target.style.display = 'none';
            const fallback = target.parentElement?.querySelector('.qr-fallback');
            if (fallback) (fallback as HTMLElement).style.display = 'flex';
          }}
        />
        
        {/* Fallback offline com ícone e texto */}
        <div 
          className="qr-fallback hidden flex-col items-center justify-center text-slate-400 p-4"
          style={{ width: size, height: size }}
        >
          <QrCode className="w-12 h-12 text-purple-600 mb-2" />
          <span className="text-[11px] font-mono break-all line-clamp-3">{value}</span>
        </div>
      </div>

      {/* Ações: Copiar Link e Baixar QR Code */}
      {(showCopy || showDownload) && (
        <div className="flex items-center gap-2 mt-3 w-full">
          {showCopy && (
            <button
              onClick={handleCopyLink}
              className="flex-1 py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>
          )}

          {showDownload && (
            <button
              onClick={handleDownload}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 text-[11px] font-semibold text-purple-700 dark:text-purple-300 flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar QR</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
