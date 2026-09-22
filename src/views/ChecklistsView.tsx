import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Smartphone, 
  Mail, 
  Printer, 
  X, 
  FileCheck2, 
  Laptop,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { InspectionChecklist, Contract, Equipment } from '../types';
import { PhotoCaptureModal } from '../components/PhotoCaptureModal';

interface Props {
  checklists: InspectionChecklist[];
  contracts: Contract[];
  equipments: Equipment[];
  onSaveChecklist: (data: Omit<InspectionChecklist, 'id' | 'createdAt'>) => Promise<InspectionChecklist>;
  onSendChecklistWhatsApp: (chk: InspectionChecklist) => void;
  onSendChecklistEmail: (chk: InspectionChecklist) => void;
}

export const ChecklistsView: React.FC<Props> = ({
  checklists,
  contracts,
  equipments,
  onSaveChecklist,
  onSendChecklistWhatsApp,
  onSendChecklistEmail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Form State
  const [type, setType] = useState<'delivery' | 'return'>('delivery');
  const [contractId, setContractId] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [screenCondition, setScreenCondition] = useState<'perfect' | 'scratched' | 'broken'>('perfect');
  const [caseCondition, setCaseCondition] = useState<'perfect' | 'light_scratches' | 'dents'>('perfect');
  const [keyboardCondition, setKeyboardCondition] = useState<'working' | 'keys_failing'>('working');
  const [batteryCondition, setBatteryCondition] = useState<'healthy' | 'moderate' | 'needs_replacement'>('healthy');
  const [chargerIncluded, setChargerIncluded] = useState(true);
  const [chargerWorking, setChargerWorking] = useState(true);
  const [portsWorking, setPortsWorking] = useState(true);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const selectedContract = contracts.find(c => c.id === contractId);
  const contractEquipments = selectedContract ? selectedContract.items : [];

  const handleOpenNewModal = () => {
    const firstContract = contracts[0];
    setContractId(firstContract?.id || '');
    setEquipmentId(firstContract?.items[0]?.equipmentId || '');
    setType('delivery');
    setScreenCondition('perfect');
    setCaseCondition('perfect');
    setKeyboardCondition('working');
    setBatteryCondition('healthy');
    setChargerIncluded(true);
    setChargerWorking(true);
    setPortsWorking(true);
    setAdditionalNotes('');
    setPhotos([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || !equipmentId) {
      alert('Selecione o contrato e o equipamento para vistoriar.');
      return;
    }

    const contract = contracts.find(c => c.id === contractId)!;
    const eq = equipments.find(e => e.id === equipmentId)!;

    await onSaveChecklist({
      type,
      contractId: contract.id,
      equipmentId: eq.id,
      equipmentTag: eq.tag,
      clientName: contract.clientName,
      date: new Date().toISOString().split('T')[0],
      screenCondition,
      caseCondition,
      keyboardCondition,
      batteryCondition,
      chargerIncluded,
      chargerWorking,
      portsWorking,
      photos,
      additionalNotes,
      signedByClient: true
    });

    setIsModalOpen(false);
  };

  const filteredChecklists = checklists.filter(c => 
    c.equipmentTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            Vistorias & Registro Fotográfico da Frota
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Controle fotográfico de como o aparelho saiu para locação e laudos de entrega e devolução.
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Vistoria com Fotos</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por patrimônio ou cliente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Checklists Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredChecklists.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <ClipboardCheck className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Nenhuma vistoria cadastrada</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Realize vistorias fotográficas de entrega para garantir que computadores saiam e retornem em perfeito estado.
            </p>
          </div>
        ) : (
          filteredChecklists.map(chk => (
            <div 
              key={chk.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 shadow-xs hover:shadow-lg transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    chk.type === 'delivery' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' 
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}>
                    {chk.type === 'delivery' ? 'Saída / Entrega' : 'Retorno / Devolução'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(chk.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {chk.equipmentTag}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{chk.clientName}</h3>
                  </div>
                </div>

                {/* Galeria de Fotos da Vistoria */}
                {chk.photos && chk.photos.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Fotos de Como o Aparelho Saiu ({chk.photos.length}):
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {chk.photos.map((p, idx) => (
                        <div key={idx} className="w-14 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-black">
                          <img src={p} alt={`Vistoria ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Checklist de Componentes */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${chk.screenCondition === 'perfect' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span>Tela: <strong className="capitalize">{chk.screenCondition === 'perfect' ? 'Perfeita' : chk.screenCondition}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${chk.caseCondition === 'perfect' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span>Carcaça: <strong className="capitalize">{chk.caseCondition === 'perfect' ? 'Sem riscos' : chk.caseCondition}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${chk.keyboardCondition === 'working' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>Teclado: <strong>{chk.keyboardCondition === 'working' ? '100% OK' : 'Falhando'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${chk.chargerWorking ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>Carregador: <strong>{chk.chargerWorking ? 'Testado OK' : 'Não funciona'}</strong></span>
                  </div>
                </div>

                {chk.additionalNotes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700 italic">
                    "{chk.additionalNotes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Homologado
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSendChecklistWhatsApp(chk)}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition"
                    title="Enviar Laudo e Fotos no WhatsApp"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSendChecklistEmail(chk)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                    title="Enviar Laudo por E-mail"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                    title="Imprimir Laudo de Vistoria"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Nova Vistoria com Registro Fotográfico */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-extrabold text-sm">Vistoria Física & Registro Fotográfico do Hardware</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo de Vistoria *</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="delivery">Saída / Entrega para o Cliente</option>
                    <option value="return">Retorno / Devolução da Locação</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contrato Vinculado *</label>
                  <select
                    required
                    value={contractId}
                    onChange={e => {
                      setContractId(e.target.value);
                      const ctr = contracts.find(c => c.id === e.target.value);
                      if (ctr && ctr.items[0]) {
                        setEquipmentId(ctr.items[0].equipmentId);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    {contracts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.contractNumber} - {c.clientName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Máquina Vistoriada *</label>
                <select
                  required
                  value={equipmentId}
                  onChange={e => setEquipmentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  {contractEquipments.map(item => (
                    <option key={item.equipmentId} value={item.equipmentId}>
                      [{item.tag}] {item.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seção de Fotos do Aparelho */}
              <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      Fotos de Como o Aparelho Saiu ({photos.length} foto(s))
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Tirar / Anexar Fotos</span>
                  </button>
                </div>

                {photos.length === 0 ? (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Nenhuma foto registrada ainda. Clique no botão acima para abrir a câmera ou carregar fotos da tela ligada, carcaça e etiqueta.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {photos.map((p, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden border border-purple-300 dark:border-purple-700 bg-black">
                        <img src={p} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Itens de Checagem */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estado da Tela</label>
                  <select
                    value={screenCondition}
                    onChange={e => setScreenCondition(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="perfect">Perfeita (Sem arranhões ou dead pixel)</option>
                    <option value="scratched">Com leves riscos superficiais</option>
                    <option value="broken">Avariada / Trincada</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estado da Carcaça</label>
                  <select
                    value={caseCondition}
                    onChange={e => setCaseCondition(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="perfect">Perfeita (Estado de nova)</option>
                    <option value="light_scratches">Marcas leves de uso</option>
                    <option value="dents">Amassados ou quebras</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1 text-slate-700 dark:text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={chargerIncluded}
                    onChange={e => setChargerIncluded(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-0 w-4 h-4"
                  />
                  <span>Carregador Original Incluso</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={chargerWorking}
                    onChange={e => setChargerWorking(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-0 w-4 h-4"
                  />
                  <span>Carregador Testado OK</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Observações da Vistoria</label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  placeholder="Ex: Equipamento entregue com lacre de segurança intacto..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-extrabold shadow-md"
                >
                  Salvar Laudo de Vistoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Captura de Fotos */}
      {isPhotoModalOpen && (
        <PhotoCaptureModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          onSavePhotos={(savedPhotos) => setPhotos(savedPhotos)}
          initialPhotos={photos}
          title="Fotografar Aparelho para Vistoria"
        />
      )}
    </div>
  );
};
