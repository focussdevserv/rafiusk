import React, { useState } from 'react';
import { X, Printer, CheckCircle2, PenTool, ShieldCheck } from 'lucide-react';
import { Contract, CompanySettings, Invoice } from '../types';
import { DigitalSignaturePad } from './DigitalSignaturePad';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contract?: Contract;
  invoice?: Invoice;
  company: CompanySettings;
}

export const PrintTermModal: React.FC<Props> = ({ isOpen, onClose, contract, invoice, company }) => {
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signedDate, setSignedDate] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveSignature = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
    setSignedDate(new Date().toLocaleString('pt-BR'));
  };

  const getPaymentMethodName = (method?: string) => {
    switch (method) {
      case 'pix': return 'PIX Instantâneo';
      case 'cash': return 'Dinheiro em Espécie';
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit_card': return 'Cartão de Débito';
      case 'boleto': return 'Boleto Bancário';
      case 'bank_transfer': return 'Transferência / TED';
      default: return 'PIX';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Controls (Hidden in Print) */}
        <div className="print:hidden px-6 py-4 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-sm">Visualização de Impressão / Documento PDF</h3>
          </div>
          <div className="flex items-center gap-3">
            {contract && (
              <button
                onClick={() => setIsSignatureModalOpen(true)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm ${
                  signatureDataUrl
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <PenTool className="w-4 h-4" />
                {signatureDataUrl ? '✍️ Assinatura Coletada' : '✍️ Coletar Assinatura'}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              Imprimir / PDF
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 sm:p-10 overflow-y-auto font-sans text-slate-800 text-xs leading-relaxed space-y-6 bg-white">
          
          {/* Document Header com LOGO Oficial RAFIUSK */}
          <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-black p-1.5 border border-slate-800 flex items-center justify-center shrink-0">
                <img 
                  src="/assets/logo_rafiusk_web.png" 
                  alt="RAFIUSK INFORMÁTICA" 
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase leading-none">
                  {company.tradeName || 'RAFIUSK INFORMÁTICA'}
                </h1>
                <p className="text-[11px] font-bold text-purple-700 tracking-wider uppercase mt-0.5">
                  {company.companyName || 'RAFIUSK INFORMÁTICA LTDA'}
                </p>
                <p className="text-slate-600 text-[11px] mt-1">{company.address}</p>
                <p className="text-slate-600 text-[11px]">
                  CNPJ: {company.cnpj} | WhatsApp: {company.phone} | E-mail: {company.email}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-black uppercase text-white bg-slate-950 px-3 py-1.5 rounded-lg inline-block tracking-wide">
                {contract ? 'Termo de Locação de TI' : 'Recibo de Pagamento / Quitação'}
              </div>
              <p className="text-slate-900 mt-2 font-mono font-black text-sm">
                #{contract ? contract.contractNumber : invoice?.invoiceNumber}
              </p>
              <p className="text-slate-500 text-[11px]">
                Emissão: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Se for CONTRATO */}
          {contract && (
            <>
              {contract.customContractText ? (
                // Texto validado customizado
                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] leading-relaxed whitespace-pre-line text-slate-800">
                    {contract.customContractText}
                  </div>
                </div>
              ) : (
                // Layout estruturado padrão do termo
                <>
                  {/* Partes Envolvidas */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider mb-1">
                        LOCADORA (Proprietária do Hardware):
                      </h4>
                      <p className="font-bold text-slate-900">{company.companyName}</p>
                      <p className="text-slate-600">CNPJ: {company.cnpj}</p>
                      <p className="text-slate-600">Endereço: {company.address}</p>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider mb-1">
                        LOCATÁRIO(A) (Cliente):
                      </h4>
                      <p className="font-bold text-slate-900">{contract.clientName}</p>
                      <p className="text-slate-600">Documento: {contract.clientDocument}</p>
                      <p className="text-slate-600">Telefone / WhatsApp: {contract.clientPhone}</p>
                      <p className="text-slate-600">E-mail: {contract.clientEmail}</p>
                    </div>
                  </div>

                  {/* Cláusulas e Vigência */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-slate-900 uppercase text-xs border-b border-slate-200 pb-1">
                      1. Vigência e Faturamento Mensal
                    </h4>
                    <div className="grid grid-cols-3 gap-3 p-3 border border-slate-200 rounded-xl">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Início da Locação</span>
                        <strong className="text-slate-900 text-xs">{new Date(contract.startDate).toLocaleDateString('pt-BR')}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Término Previsto</span>
                        <strong className="text-slate-900 text-xs">{new Date(contract.endDate).toLocaleDateString('pt-BR')}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Mensalidade Total</span>
                        <strong className="text-purple-700 font-black text-sm">
                          R$ {contract.monthlyTotal.toFixed(2)}/mês
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Relação de Equipamentos */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-slate-900 uppercase text-xs border-b border-slate-200 pb-1">
                      2. Equipamentos e Computadores Homologados
                    </h4>
                    <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 text-[11px]">
                          <th className="p-2.5 border border-slate-200 font-extrabold">Patrimônio</th>
                          <th className="p-2.5 border border-slate-200 font-extrabold">Modelo / Especificação</th>
                          <th className="p-2.5 border border-slate-200 font-extrabold text-right">Valor Mensal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contract.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-200">
                            <td className="p-2.5 border border-slate-200 font-mono font-bold text-slate-900">{item.tag}</td>
                            <td className="p-2.5 border border-slate-200">{item.model}</td>
                            <td className="p-2.5 border border-slate-200 text-right font-bold text-purple-700">
                              R$ {item.monthlyRate.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Termo de Responsabilidade */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 space-y-2">
                    <p><strong>DECLARAÇÃO DE RECEBIMENTO:</strong> O LOCATÁRIO declara receber os computadores e periféricos relacionados em perfeito estado operacional, limpos e configurados para uso imediato.</p>
                    <p><strong>SLA E TROCA RÁPIDA:</strong> A RAFIUSK INFORMÁTICA garante assistência técnica e reposição de hardware em até 24h úteis em caso de avaria natural de peças.</p>
                  </div>

                  {/* Assinaturas */}
                  <div className="pt-8 grid grid-cols-2 gap-12 text-center">
                    <div className="flex flex-col justify-end">
                      <div className="border-t border-slate-400 pt-2">
                        <p className="font-bold text-slate-900">{company.companyName}</p>
                        <p className="text-[11px] text-slate-500">Locador Autorizado</p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-end relative">
                      {signatureDataUrl ? (
                        <div className="mb-1 flex flex-col items-center">
                          <img 
                            src={signatureDataUrl} 
                            alt="Assinatura Digital do Locatário" 
                            className="h-14 object-contain"
                          />
                          <span className="text-[9px] text-emerald-700 font-mono flex items-center gap-1 font-semibold">
                            <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                            Assinado digitalmente em {signedDate}
                          </span>
                        </div>
                      ) : (
                        <div className="h-10"></div>
                      )}
                      <div className="border-t border-slate-400 pt-2">
                        <p className="font-bold text-slate-900">{contract.clientName}</p>
                        <p className="text-[11px] text-slate-500">Locatário / Assinatura</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Modal de Captura de Assinatura na Tela */}
          {contract && (
            <DigitalSignaturePad
              isOpen={isSignatureModalOpen}
              onClose={() => setIsSignatureModalOpen(false)}
              onSaveSignature={handleSaveSignature}
              signerName={contract.clientName}
            />
          )}

          {/* Se for RECIBO / CUPOM FINANCEIRO */}
          {invoice && (
            <div className="space-y-4">
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-emerald-950 font-extrabold text-sm">Comprovante de Quitação</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold rounded-full text-[10px] uppercase">
                    {invoice.status === 'paid' ? 'QUITADO / PAGO' : 'PENDENTE'}
                  </span>
                </div>

                <div className="text-3xl font-black text-slate-950">
                  R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-200/80 text-emerald-900">
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase font-bold block">Forma de Pagamento:</span>
                    <strong>{getPaymentMethodName(invoice.paymentMethod)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase font-bold block">Data do Pagamento:</span>
                    <strong>
                      {invoice.paidDate 
                        ? new Date(invoice.paidDate).toLocaleDateString('pt-BR') 
                        : 'Pendente de quitação'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-slate-900 uppercase text-[11px]">Dados do Sacado / Cliente:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <p><strong>Nome:</strong> {invoice.clientName}</p>
                  <p><strong>Referência:</strong> {invoice.periodDescription}</p>
                  <p><strong>Telefone / WhatsApp:</strong> {invoice.clientPhone}</p>
                  <p><strong>E-mail:</strong> {invoice.clientEmail}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-[11px] text-slate-500 font-mono">
                Chave PIX da Loja: <strong>{company.pixKey || 'financeiro@rafiusk.com.br'}</strong>
              </div>

              <div className="pt-6 text-center border-t border-slate-200">
                <p className="text-[11px] text-slate-400">
                  Documento emitido eletronicamente por <strong>RAFIUSK INFORMÁTICA</strong> em {new Date().toLocaleString('pt-BR')}.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
