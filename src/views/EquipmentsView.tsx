import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Wrench, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  X,
  Cpu,
  HardDrive,
  Layers,
  Monitor,
  Camera,
  Image as ImageIcon,
  History,
  Calendar,
  DollarSign,
  Printer,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Equipment, EquipmentStatus, EquipmentType, Contract, MaintenanceTicket, Client, Invoice } from '../types';
import { PhotoCaptureModal } from '../components/PhotoCaptureModal';

interface Props {
  equipments: Equipment[];
  contracts?: Contract[];
  tickets?: MaintenanceTicket[];
  clients?: Client[];
  invoices?: Invoice[];
  onSaveEquipment: (eq: Partial<Equipment> & { id?: string }) => Promise<void>;
  onDeleteEquipment: (id: string) => Promise<void>;
  onSendToMaintenance: (equipmentId: string) => void;
}

export const EquipmentsView: React.FC<Props> = ({
  equipments,
  contracts = [],
  tickets = [],
  clients = [],
  invoices = [],
  onSaveEquipment,
  onDeleteEquipment,
  onSendToMaintenance
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<EquipmentType | 'all'>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [tagModalEquipment, setTagModalEquipment] = useState<Equipment | null>(null);
  const [historyModalEquipment, setHistoryModalEquipment] = useState<Equipment | null>(null);
  const [equipmentPhotos, setEquipmentPhotos] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    tag: '',
    serialNumber: '',
    brand: '',
    model: '',
    type: 'notebook' as EquipmentType,
    cpu: '',
    ram: '',
    storage: '',
    gpu: '',
    screenSize: '',
    dailyRate: 40,
    monthlyRate: 300,
    status: 'available' as EquipmentStatus,
    conditionNotes: ''
  });

  const openNewModal = () => {
    setEditingEquipment(null);
    setFormData({
      tag: `EQ-${new Date().getFullYear()}-${String(equipments.length + 1).padStart(3, '0')}`,
      serialNumber: '',
      brand: 'Dell',
      model: '',
      type: 'notebook',
      cpu: '',
      ram: '16GB DDR5',
      storage: '512GB SSD NVMe',
      gpu: '',
      screenSize: '14" Full HD',
      dailyRate: 40,
      monthlyRate: 300,
      status: 'available',
      conditionNotes: ''
    });
    setEquipmentPhotos([]);
    setIsModalOpen(true);
  };

  const openEditModal = (eq: Equipment) => {
    setEditingEquipment(eq);
    setFormData({
      tag: eq.tag,
      serialNumber: eq.serialNumber,
      brand: eq.brand,
      model: eq.model,
      type: eq.type,
      cpu: eq.cpu,
      ram: eq.ram,
      storage: eq.storage,
      gpu: eq.gpu || '',
      screenSize: eq.screenSize || '',
      dailyRate: eq.dailyRate,
      monthlyRate: eq.monthlyRate,
      status: eq.status,
      conditionNotes: eq.conditionNotes || ''
    });
    setEquipmentPhotos(eq.photos || (eq.imageUrl ? [eq.imageUrl] : []));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveEquipment({
      ...(editingEquipment ? { id: editingEquipment.id } : {}),
      ...formData,
      photos: equipmentPhotos,
      imageUrl: equipmentPhotos[0] || (editingEquipment?.imageUrl || undefined)
    });
    setIsModalOpen(false);
  };

  const filteredEquipments = equipments.filter(eq => {
    const matchesSearch = 
      eq.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.cpu.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;
    const matchesType = typeFilter === 'all' || eq.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const countByStatus = {
    all: equipments.length,
    available: equipments.filter(e => e.status === 'available').length,
    rented: equipments.filter(e => e.status === 'rented').length,
    maintenance: equipments.filter(e => e.status === 'maintenance').length,
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Todos ({countByStatus.all})
          </button>
          <button
            onClick={() => setStatusFilter('available')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'available'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Disponíveis ({countByStatus.available})
          </button>
          <button
            onClick={() => setStatusFilter('rented')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'rented'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Alugados ({countByStatus.rented})
          </button>
          <button
            onClick={() => setStatusFilter('maintenance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'maintenance'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Manutenção ({countByStatus.maintenance})
          </button>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Equipamento
        </button>
      </div>

      {/* Search Bar & Category Filter */}
      <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between transition-colors">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por patrimônio, serial, marca ou modelo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {(['all', 'notebook', 'desktop', 'workstation', 'server', 'monitor'] as const).map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize whitespace-nowrap ${
                typeFilter === type
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {type === 'all' ? 'Todas Categorias' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Equipments */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredEquipments.map(eq => {
          const statusBadge = {
            available: { text: 'Disponível', color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
            rented: { text: 'Alugado', color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
            maintenance: { text: 'Em Manutenção', color: 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
            reserved: { text: 'Reservado', color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
          }[eq.status];

          return (
            <div 
              key={eq.id}
              className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {eq.tag}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{eq.brand} {eq.model}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">S/N: {eq.serialNumber}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusBadge.color}`}>
                    {statusBadge.text}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate font-medium text-slate-700 dark:text-slate-300" title={eq.cpu}>{eq.cpu}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="truncate font-medium text-slate-700 dark:text-slate-300">{eq.ram}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate font-medium text-slate-700 dark:text-slate-300">{eq.storage}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <Monitor className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
                    <span className="truncate font-medium text-slate-700 dark:text-slate-300">{eq.screenSize || 'N/A'}</span>
                  </div>
                </div>

                {eq.conditionNotes && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800 mt-3">
                    Obs: {eq.conditionNotes}
                  </p>
                )}
              </div>

              <div className="p-4 bg-slate-50/70 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Locação Mensal</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {eq.monthlyRate.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    <span className="text-[10px] font-normal text-slate-400">/mês</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setHistoryModalEquipment(eq)}
                    className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition"
                    title="Ver Histórico Completo da Máquina"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTagModalEquipment(eq)}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-lg transition"
                    title="Imprimir Etiqueta com QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(eq)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                    title="Editar Equipamento"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {eq.status !== 'maintenance' && (
                    <button
                      onClick={() => onSendToMaintenance(eq.id)}
                      className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition"
                      title="Abrir Manutenção"
                    >
                      <Wrench className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Remover ${eq.tag}?`)) onDeleteEquipment(eq.id);
                    }}
                    className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Cadastro / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm">
                {editingEquipment ? `Editar Equipamento (${editingEquipment.tag})` : 'Cadastrar Novo Equipamento'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nº Patrimônio *</label>
                  <input
                    type="text"
                    required
                    value={formData.tag}
                    onChange={e => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Número de Série (S/N) *</label>
                  <input
                    type="text"
                    required
                    value={formData.serialNumber}
                    onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tipo de Máquina *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as EquipmentType })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white capitalize"
                  >
                    <option value="notebook">Notebook</option>
                    <option value="desktop">Desktop</option>
                    <option value="workstation">Workstation</option>
                    <option value="server">Servidor</option>
                    <option value="monitor">Monitor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Marca *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">CPU *</label>
                  <input
                    type="text"
                    required
                    value={formData.cpu}
                    onChange={e => setFormData({ ...formData, cpu: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">RAM *</label>
                  <input
                    type="text"
                    required
                    value={formData.ram}
                    onChange={e => setFormData({ ...formData, ram: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Armazenamento *</label>
                  <input
                    type="text"
                    required
                    value={formData.storage}
                    onChange={e => setFormData({ ...formData, storage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Valor Mensal (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.monthlyRate}
                    onChange={e => setFormData({ ...formData, monthlyRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status *</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as EquipmentStatus })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="available">Disponível</option>
                    <option value="rented">Alugado</option>
                    <option value="maintenance">Em Manutenção</option>
                  </select>
                </div>
              </div>

              {/* Seção de Fotos do Equipamento */}
              <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                      Fotos do Hardware ({equipmentPhotos.length} foto(s))
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Tirar / Carregar Fotos</span>
                  </button>
                </div>

                {equipmentPhotos.length === 0 ? (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tire fotos ao vivo da tela, teclado e número de série para comprovar o estado do computador no estoque.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {equipmentPhotos.map((p, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden border border-purple-300 dark:border-purple-700 bg-black">
                        <img src={p} alt={`Foto do hardware ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-extrabold shadow-md"
                >
                  Salvar Equipamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Captura de Fotos do Equipamento */}
      {isPhotoModalOpen && (
        <PhotoCaptureModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          onSavePhotos={(photos) => setEquipmentPhotos(photos)}
          initialPhotos={equipmentPhotos}
          title="Fotografar Equipamento para Estoque"
        />
      )}

      {/* Modal de Etiqueta de Patrimônio com QR Code */}
      {tagModalEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-100 dark:border-slate-800 print:border-none print:shadow-none print:p-0">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Etiqueta de Patrimônio</h3>
              </div>
              <button onClick={() => setTagModalEquipment(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 border-2 border-slate-950 rounded-2xl space-y-2 bg-white text-slate-950 print:border-2 print:border-black">
              <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase text-purple-700 tracking-wider">RAFIUSK INFORMÁTICA</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase">Gestão de Hardware & Locação</p>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-950 text-white rounded">
                  Patrimônio
                </span>
              </div>

              {/* QR Code Real Gerado Dinamicamente */}
              <div className="w-36 h-36 bg-white mx-auto p-1.5 border border-slate-300 rounded-xl shadow-xs flex items-center justify-center my-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `RAFIUSK INFORMÁTICA\nPATRIMÔNIO: ${tagModalEquipment.tag}\nS/N: ${tagModalEquipment.serialNumber}\nMODELO: ${tagModalEquipment.brand} ${tagModalEquipment.model}\nCONFIG: ${tagModalEquipment.cpu} / ${tagModalEquipment.ram} / ${tagModalEquipment.storage}`
                  )}`}
                  alt={`QR Code ${tagModalEquipment.tag}`}
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="font-mono font-black text-xl text-slate-950 tracking-tight leading-none">
                {tagModalEquipment.tag}
              </p>
              <p className="text-xs font-bold text-slate-800">
                {tagModalEquipment.brand} {tagModalEquipment.model}
              </p>
              <p className="text-[10px] font-mono text-slate-600">
                S/N: {tagModalEquipment.serialNumber}
              </p>
              <div className="pt-1 border-t border-slate-200 text-[9px] font-medium text-slate-500 flex justify-between">
                <span>{tagModalEquipment.cpu}</span>
                <span>{tagModalEquipment.ram}</span>
                <span>{tagModalEquipment.storage}</span>
              </div>
            </div>

            <div className="print:hidden space-y-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir Etiqueta (Térmica / Adesiva)
              </button>
              <p className="text-[10px] text-slate-400">
                Compatível com impressoras térmicas (Zebra, Elgin, Argox) e folhas adesivas A4.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Histórico Completo da Máquina */}
      {historyModalEquipment && (() => {
        const eqContracts = contracts.filter(c => 
          c.items?.some(i => i.equipmentId === historyModalEquipment.id)
        );
        const eqTickets = tickets.filter(t => t.equipmentId === historyModalEquipment.id);
        const totalRevenue = eqContracts.reduce((sum, c) => {
          const item = c.items?.find(i => i.equipmentId === historyModalEquipment.id);
          const monthly = item?.monthlyRate || historyModalEquipment.monthlyRate;
          const start = new Date(c.startDate).getTime();
          const end = c.endDate ? new Date(c.endDate).getTime() : Date.now();
          const months = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30)));
          return sum + (monthly * months);
        }, 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm">Histórico da Máquina</h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {historyModalEquipment.tag} • {historyModalEquipment.brand} {historyModalEquipment.model}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setHistoryModalEquipment(null)} 
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs">
                {/* Resumo da Máquina e Métricas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Status Atual</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 block">
                      {historyModalEquipment.status === 'available' ? '🟢 Disponível para Locação' :
                       historyModalEquipment.status === 'rented' ? '🔵 Alugado em Cliente' : '🟠 Em Manutenção'}
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">S/N: {historyModalEquipment.serialNumber}</p>
                  </div>

                  <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800">
                    <span className="text-[10px] text-purple-700 dark:text-purple-400 uppercase font-bold block">Faturamento Acumulado</span>
                    <span className="text-base font-black text-purple-950 dark:text-purple-300 mt-1 block">
                      {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <p className="text-[10px] text-purple-700/80 dark:text-purple-400/80 mt-0.5">Gerado em {eqContracts.length} contrato(s)</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Ordens de Serviço</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 block">
                      {eqTickets.length} chamado(s)
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {eqTickets.filter(t => t.status === 'resolved').length} resolvido(s)
                    </p>
                  </div>
                </div>

                {/* Especificações Técnicas */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <h4 className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider mb-2">
                    Ficha Técnica do Hardware
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Processador:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{historyModalEquipment.cpu}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Memória RAM:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{historyModalEquipment.ram}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Armazenamento:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{historyModalEquipment.storage}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Tela / Vídeo:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{historyModalEquipment.screenSize || 'N/A'}</strong>
                    </div>
                  </div>
                </div>

                {/* Linha do Tempo / Timeline */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    Linha do Tempo de Atividades
                  </h4>

                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    {/* Eventos de Contrato */}
                    {eqContracts.map(c => {
                      const client = clients.find(cl => cl.id === c.clientId);
                      return (
                        <div key={c.id} className="relative flex items-start gap-3 pl-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                            c.status === 'active' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white text-xs">
                                Locação: Contrato #{c.contractNumber}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                c.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                              }`}>
                                {c.status === 'active' ? 'Em Andamento' : 'Encerrado'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                              Cliente: <strong>{c.clientName || client?.name}</strong>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Período: {new Date(c.startDate).toLocaleDateString('pt-BR')} até {c.endDate ? new Date(c.endDate).toLocaleDateString('pt-BR') : 'Vigente'} • R$ {c.monthlyTotal.toFixed(2)}/mês
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Eventos de Manutenção */}
                    {eqTickets.map(t => (
                      <div key={t.id} className="relative flex items-start gap-3 pl-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          t.status === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                        }`}>
                          <Wrench className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                              Manutenção / OS: #{t.ticketNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                              t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {t.status === 'resolved' ? 'Reparo Concluído' : 'Em Análise'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                            {t.issueDescription}
                          </p>
                          {t.resolutionNotes && (
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              Solução: {t.resolutionNotes}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1">
                            Aberto em: {new Date(t.createdAt).toLocaleDateString('pt-BR')} • Prioridade: {t.priority.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Evento de Cadastro no Estoque */}
                    <div className="relative flex items-start gap-3 pl-1">
                      <div className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center shrink-0 z-10">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          Entrada no Inventário da Locadora
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Equipamento cadastrado e etiquetado como patrimônio <strong>{historyModalEquipment.tag}</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setHistoryModalEquipment(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                >
                  Fechar Histórico
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
