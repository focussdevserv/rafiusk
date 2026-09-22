import { 
  Equipment, 
  Client, 
  Contract, 
  Invoice, 
  MaintenanceTicket, 
  InspectionChecklist, 
  CompanySettings,
  ContractTemplate,
  PaymentMethod,
  InvoiceStatus,
  CommercialProposal,
  Expense
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'RAFIUSK INFORMÁTICA LTDA',
  tradeName: 'RAFIUSK INFORMÁTICA',
  cnpj: '48.912.873/0001-92',
  email: 'contato@rafiusk.com.br',
  phone: '(11) 98844-2026',
  address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  pixKey: 'financeiro@rafiusk.shop',
  pixKeyType: 'email',
  pixBeneficiaryName: 'RAFIUSK INFORMÁTICA LTDA',
  pixCity: 'SÃO PAULO',
  logoUrl: '/assets/logo_rafiusk_web.png',
  termsTemplate: 'Contrato padrão de locação de hardware e suporte de TI conforme legislação vigente.'
};

const INITIAL_CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'tpl-default',
    name: 'Contrato Padrão de Locação Corporativa & Suporte',
    description: 'Locação com SLA de 24h, troca rápida e faturamento mensal',
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
    content: `INSTRUMENTO PARTICULAR DE LOCAÇÃO DE EQUIPAMENTOS DE TI E PRESTAÇÃO DE SERVIÇOS
Contrato nº: {{NUMERO_CONTRATO}}

LOCADORA:
Razão Social: {{LOCADORA_RAZAO}}
Nome Fantasia: {{LOCADORA_NOME}}
CNPJ: {{LOCADORA_CNPJ}}
Endereço: {{LOCADORA_ENDERECO}}

LOCATÁRIO(A):
Nome / Razão Social: {{CLIENTE_NOME}}
CNPJ / CPF: {{CLIENTE_DOCUMENTO}}
Telefone / WhatsApp: {{CLIENTE_TELEFONE}}
E-mail: {{CLIENTE_EMAIL}}

CLÁUSULA 1ª - DO OBJETO
O presente contrato tem por objeto a locação dos equipamentos de informática abaixo descritos, em perfeitas condições de funcionamento e homologados pela LOCADORA:

{{LISTA_EQUIPAMENTOS}}

CLÁUSULA 2ª - DO PRAZO E VIGÊNCIA
O presente contrato vigorará a partir de {{DATA_INICIO}} com término previsto para {{DATA_FIM}}, podendo ser prorrogado automaticamente mediante acordo entre as partes.

CLÁUSULA 3ª - DO VALOR E FORMA DE PAGAMENTO
O valor total da locação mensal é de {{VALOR_MENSAL}}, com vencimento a cada 30 dias contados do início da vigência. O não pagamento até a data do vencimento incorrerá em multa de 2% e juros de 1% ao mês.

CLÁUSULA 4ª - DA MANUTENÇÃO E SUBSTITUIÇÃO RÁPIDA (SWAP)
A LOCADORA garante a assistência técnica e o suporte para falhas de hardware no prazo de até 24 (vinte e quatro) horas úteis. Em caso de defeito impeditivo, a LOCADORA realizará a troca imediata do equipamento defeituoso por outro equivalente, sem custos adicionais ao LOCATÁRIO.

CLÁUSULA 5ª - DA GUARDA E RESPONSABILIDADE
O LOCATÁRIO compromete-se a zelar pelos equipamentos locados, utilizando-os conforme as especificações técnicas, respondendo por danos causados por dolo, negligência, quedas ou sinistros não cobertos por defeito de fabricação.

CLÁUSULA 6ª - DO FORO
Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o foro da {{FORO}}, com renúncia expressa a qualquer outro.

E por estarem justos e acordados, firmam o presente instrumento em vias de igual teor.

{{FORO}}, {{DATA_HOJE}}.

___________________________________________
{{LOCADORA_RAZAO}}
CNPJ: {{LOCADORA_CNPJ}}

___________________________________________
{{CLIENTE_NOME}}
{{CLIENTE_DOCUMENTO}}`
  },
  {
    id: 'tpl-curto-prazo',
    name: 'Locação Curto Prazo / Eventos / Projetos Especiais',
    description: 'Ideal para locações diárias ou semanais para treinamentos e feiras',
    isDefault: false,
    createdAt: '2024-01-01T00:00:00Z',
    content: `TERMO DE LOCAÇÃO TEMPORÁRIA DE EQUIPAMENTOS PARA EVENTOS
Contrato nº: {{NUMERO_CONTRATO}}

LOCADORA: {{LOCADORA_RAZAO}} (CNPJ: {{LOCADORA_CNPJ}})
LOCATÁRIO: {{CLIENTE_NOME}} (Doc: {{CLIENTE_DOCUMENTO}})

EQUIPAMENTOS DISPONIBILIZADOS:
{{LISTA_EQUIPAMENTOS}}

PERÍODO DE UTILIZAÇÃO: De {{DATA_INICIO}} até {{DATA_FIM}}.
VALOR TOTAL ACORDADO: {{VALOR_MENSAL}}.

1. Os equipamentos foram entregues testados e lacrados.
2. A devolução deverá ocorrer na data estipulada no mesmo estado de conservação.
3. É expressamente vedada a sublocação ou cessão a terceiros sem prévio consentimento.

Data de Emissão: {{DATA_HOJE}}.

Assinatura do Locatário: ____________________________________`
  }
];

const INITIAL_EQUIPMENTS: Equipment[] = [
  {
    id: 'eq-1',
    tag: 'NTB-2024-001',
    serialNumber: '5CD3289KL2',
    brand: 'Dell',
    model: 'Latitude 5440 Core i7',
    type: 'notebook',
    cpu: 'Intel Core i7-1365U 13ª Gen',
    ram: '16GB DDR5',
    storage: '512GB SSD NVMe M.2',
    screenSize: '14" Full HD Antirreflexo',
    status: 'rented',
    dailyRate: 45.00,
    monthlyRate: 320.00,
    currentClientId: 'cli-1',
    currentContractId: 'ctr-001',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'eq-2',
    tag: 'NTB-2024-002',
    serialNumber: 'PF49B901X',
    brand: 'Lenovo',
    model: 'ThinkPad T14 Gen 4',
    type: 'notebook',
    cpu: 'AMD Ryzen 7 PRO 7840U',
    ram: '32GB LPDDR5x',
    storage: '1TB SSD NVMe',
    screenSize: '14" WUXGA IPS',
    status: 'rented',
    dailyRate: 55.00,
    monthlyRate: 380.00,
    currentClientId: 'cli-1',
    currentContractId: 'ctr-001',
    createdAt: '2024-01-15T11:00:00Z'
  },
  {
    id: 'eq-3',
    tag: 'NTB-2024-003',
    serialNumber: 'C02FR0L7MD6R',
    brand: 'Apple',
    model: 'MacBook Pro 14 M3 Pro',
    type: 'notebook',
    cpu: 'Apple M3 Pro (11-core CPU, 14-core GPU)',
    ram: '18GB Unificada',
    storage: '512GB SSD Apple',
    screenSize: '14.2" Liquid Retina XDR 120Hz',
    status: 'available',
    dailyRate: 90.00,
    monthlyRate: 650.00,
    createdAt: '2024-02-01T09:00:00Z'
  },
  {
    id: 'eq-4',
    tag: 'DSK-2024-004',
    serialNumber: '8CG40109ZZ',
    brand: 'Dell',
    model: 'OptiPlex 7010 Micro',
    type: 'desktop',
    cpu: 'Intel Core i5-13500T',
    ram: '16GB DDR5',
    storage: '512GB SSD NVMe',
    status: 'available',
    dailyRate: 35.00,
    monthlyRate: 240.00,
    createdAt: '2024-02-10T14:30:00Z'
  },
  {
    id: 'eq-5',
    tag: 'WKS-2024-005',
    serialNumber: 'PREC902341M',
    brand: 'Dell',
    model: 'Precision 3660 Tower Workstation',
    type: 'workstation',
    cpu: 'Intel Core i9-13900K 24-Cores',
    ram: '64GB DDR5 4800MHz',
    storage: '2TB SSD NVMe Gen4',
    gpu: 'NVIDIA RTX A4000 16GB GDDR6',
    status: 'available',
    dailyRate: 150.00,
    monthlyRate: 980.00,
    createdAt: '2024-02-20T16:00:00Z'
  },
  {
    id: 'eq-6',
    tag: 'NTB-2024-006',
    serialNumber: '5CD3289KL9',
    brand: 'Dell',
    model: 'Latitude 3440 Core i5',
    type: 'notebook',
    cpu: 'Intel Core i5-1335U',
    ram: '16GB DDR4',
    storage: '256GB SSD NVMe',
    screenSize: '14" HD',
    status: 'maintenance',
    dailyRate: 35.00,
    monthlyRate: 250.00,
    conditionNotes: 'Teclado com 2 teclas travadas, enviado para troca de peça.',
    createdAt: '2024-01-12T08:00:00Z'
  }
];

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    type: 'PJ',
    name: 'TechFlow Soluções Digitais Ltda',
    tradeName: 'TechFlow Digital',
    document: '24.981.402/0001-90',
    email: 'financeiro@techflow.com.br',
    phone: '11998877665',
    contactPerson: 'Carlos Eduardo (Gerente de TI)',
    address: {
      street: 'Rua Funchal',
      number: '418',
      complement: 'Conjunto 81',
      neighborhood: 'Vila Olímpia',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04551-060'
    },
    notes: 'Cliente corporativo com contrato anual para equipe de desenvolvimento.',
    createdAt: '2024-01-05T10:00:00Z'
  },
  {
    id: 'cli-2',
    type: 'PJ',
    name: 'Inova Contabilidade e Auditoria S/S',
    tradeName: 'Inova Contábil',
    document: '18.324.901/0001-44',
    email: 'contato@inovacontabil.com.br',
    phone: '11981122334',
    contactPerson: 'Mariana Silveira',
    address: {
      street: 'Av. Brigadeiro Faria Lima',
      number: '2010',
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01451-000'
    },
    createdAt: '2024-02-01T14:00:00Z'
  },
  {
    id: 'cli-3',
    type: 'PF',
    name: 'Rodrigo Alcantara Martins',
    document: '345.892.118-20',
    email: 'rodrigo.alcantara@gmail.com',
    phone: '11972345678',
    address: {
      street: 'Rua Pamplona',
      number: '820',
      complement: 'Apt 42',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01405-001'
    },
    notes: 'Designer freelancer alugando estação gráfica.',
    createdAt: '2024-02-15T09:30:00Z'
  }
];

const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'ctr-001',
    contractNumber: 'CTR-2024-0089',
    clientId: 'cli-1',
    clientName: 'TechFlow Soluções Digitais Ltda',
    clientDocument: '24.981.402/0001-90',
    clientPhone: '11998877665',
    clientEmail: 'financeiro@techflow.com.br',
    startDate: '2024-01-20',
    endDate: '2025-01-20',
    billingFrequency: 'monthly',
    monthlyTotal: 700.00,
    depositAmount: 1400.00,
    status: 'active',
    items: [
      {
        equipmentId: 'eq-1',
        tag: 'NTB-2024-001',
        model: 'Dell Latitude 5440 Core i7',
        monthlyRate: 320.00
      },
      {
        equipmentId: 'eq-2',
        tag: 'NTB-2024-002',
        model: 'Lenovo ThinkPad T14 Gen 4',
        monthlyRate: 380.00
      }
    ],
    notes: 'Contrato de 12 meses com substituição garantida em até 24h em caso de falha.',
    createdAt: '2024-01-20T11:00:00Z'
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'FAT-2024-0101',
    contractId: 'ctr-001',
    clientId: 'cli-1',
    clientName: 'TechFlow Soluções Digitais Ltda',
    clientPhone: '11998877665',
    clientEmail: 'financeiro@techflow.com.br',
    amount: 700.00,
    dueDate: '2024-02-20',
    paidDate: '2024-02-19',
    status: 'paid',
    paymentMethod: 'pix',
    periodDescription: 'Mensalidade 01/12 (Ref. 20/01 a 20/02)',
    createdAt: '2024-01-20T11:30:00Z'
  },
  {
    id: 'inv-002',
    invoiceNumber: 'FAT-2024-0182',
    contractId: 'ctr-001',
    clientId: 'cli-1',
    clientName: 'TechFlow Soluções Digitais Ltda',
    clientPhone: '11998877665',
    clientEmail: 'financeiro@techflow.com.br',
    amount: 700.00,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    paymentMethod: 'pix',
    periodDescription: 'Mensalidade 02/12 (Ref. 20/02 a 20/03)',
    createdAt: '2024-02-10T09:00:00Z'
  },
  {
    id: 'inv-003',
    invoiceNumber: 'FAT-2024-0205',
    contractId: 'ctr-002',
    clientId: 'cli-2',
    clientName: 'Inova Contabilidade e Auditoria S/S',
    clientPhone: '11988334411',
    clientEmail: 'contato@inovacontab.com.br',
    amount: 1450.00,
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    paymentMethod: 'boleto',
    periodDescription: 'Locação 4x Dell Latitude 3440 + Suporte N2',
    createdAt: '2024-02-15T14:00:00Z'
  },
  {
    id: 'inv-004',
    invoiceNumber: 'FAT-2024-0092',
    contractId: 'ctr-003',
    clientId: 'cli-3',
    clientName: 'Nexus Engenharia & Projetos 3D',
    clientPhone: '11977665544',
    clientEmail: 'compras@nexuseng.com.br',
    amount: 2200.00,
    dueDate: '2024-01-28',
    paidDate: '2024-01-28',
    status: 'paid',
    paymentMethod: 'bank_transfer',
    periodDescription: 'Locação 2x Dell Precision Workstation RTX',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'inv-005',
    invoiceNumber: 'FAT-2024-0130',
    contractId: 'ctr-004',
    clientId: 'cli-4',
    clientName: 'Alpha Desenvolvimento Web e Mobile',
    clientPhone: '11966554433',
    clientEmail: 'financeiro@alphadev.com.br',
    amount: 850.00,
    dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    paymentMethod: 'pix',
    periodDescription: 'Locação 1x Apple MacBook Pro M2 Pro 16GB',
    createdAt: '2024-02-01T08:30:00Z'
  }
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-001',
    expenseNumber: 'DESP-2024-001',
    description: 'Lote de 10 SSDs NVMe Kingston NV2 1TB 3500MB/s (Upgrades de Frota)',
    category: 'hardware_parts',
    supplier: 'Distribuidora Oficial Kingston Brasil',
    amount: 3800.00,
    dueDate: '2024-02-05',
    paidDate: '2024-02-05',
    status: 'paid',
    paymentMethod: 'pix',
    notes: 'NF-e 44.912 - Peças para reposição e agilização de entregas',
    createdAt: '2024-02-01T10:00:00Z'
  },
  {
    id: 'exp-002',
    expenseNumber: 'DESP-2024-002',
    description: 'Lote de 8 Módulos de Memória RAM Kingston Fury 16GB DDR4 3200MHz',
    category: 'hardware_parts',
    supplier: 'Kabum Comércio Eletrônico S/A',
    amount: 1560.00,
    dueDate: '2024-02-12',
    paidDate: '2024-02-12',
    status: 'paid',
    paymentMethod: 'credit_card',
    notes: 'Utilizados na preparação de 4 ThinkPads para entrega corporativa',
    createdAt: '2024-02-10T14:20:00Z'
  },
  {
    id: 'exp-003',
    expenseNumber: 'DESP-2024-003',
    description: 'Licenças OEM Windows 11 Pro Corporativo (Pacote 5 Unidades)',
    category: 'licenses',
    supplier: 'Parceiro Certificado Microsoft Brasil',
    amount: 980.00,
    dueDate: '2024-02-18',
    paidDate: '2024-02-17',
    status: 'paid',
    paymentMethod: 'pix',
    notes: 'Chaves originais vinculadas à placa-mãe dos novos Dell Latitude',
    createdAt: '2024-02-15T11:00:00Z'
  },
  {
    id: 'exp-004',
    expenseNumber: 'DESP-2024-004',
    description: 'Frete e Logística Expressa Jadlog (Transporte de Lote 6 Notebooks SP -> Campinas)',
    category: 'logistics',
    supplier: 'Jadlog Logística S/A',
    amount: 280.00,
    dueDate: '2024-02-22',
    paidDate: '2024-02-22',
    status: 'paid',
    paymentMethod: 'pix',
    notes: 'Com seguro de carga e rastreamento em tempo real',
    createdAt: '2024-02-20T09:15:00Z'
  },
  {
    id: 'exp-005',
    expenseNumber: 'DESP-2024-005',
    description: 'Manutenção de Bancada Especializada - Troca de Conector de Carga e Teclado ThinkPad',
    category: 'maintenance',
    supplier: 'Laboratório Técnico Avançado de Hardware',
    amount: 420.00,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    paymentMethod: 'pix',
    notes: 'Aguardando teste de estresse de 48h para liberação ao estoque disponível',
    createdAt: '2024-02-22T16:00:00Z'
  },
  {
    id: 'exp-006',
    expenseNumber: 'DESP-2024-006',
    description: 'Servidores Cloud Supabase Pro + Evolution WhatsApp API Hospedagem Mensal',
    category: 'infrastructure',
    supplier: 'Cloudflare & Easypanel Cloud Host',
    amount: 235.00,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    paymentMethod: 'credit_card',
    notes: 'Infraestrutura de alta disponibilidade com backups automáticos',
    createdAt: '2024-02-23T08:00:00Z'
  }
];

const INITIAL_TICKETS: MaintenanceTicket[] = [
  {
    id: 'tkt-001',
    ticketNumber: 'SUP-2024-0012',
    equipmentId: 'eq-6',
    equipmentTag: 'NTB-2024-006',
    equipmentModel: 'Dell Latitude 3440 Core i5',
    clientId: 'cli-2',
    clientName: 'Inova Contabilidade e Auditoria S/S',
    issueDescription: 'Teclas "E" e "Espaço" pararam de responder após atualização de firmware.',
    priority: 'high',
    status: 'in_progress',
    isSwapRequested: true,
    createdAt: '2024-02-18T10:00:00Z'
  }
];

class DatabaseService {
  private getStorage<T>(key: string, initial: T): T {
    try {
      const data = localStorage.getItem(`db_${key}`);
      if (!data) {
        localStorage.setItem(`db_${key}`, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return initial;
    }
  }

  private setStorage<T>(key: string, data: T): void {
    localStorage.setItem(`db_${key}`, JSON.stringify(data));
  }

  // --- EQUIPMENTS ---
  async getEquipments(): Promise<Equipment[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('equipments').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            tag: d.tag,
            serialNumber: d.serial_number,
            brand: d.brand,
            model: d.model,
            type: d.type,
            cpu: d.cpu,
            ram: d.ram,
            storage: d.storage,
            gpu: d.gpu,
            screenSize: d.screen_size,
            status: d.status,
            dailyRate: Number(d.daily_rate),
            monthlyRate: Number(d.monthly_rate),
            currentClientId: d.current_client_id,
            currentContractId: d.current_contract_id,
            conditionNotes: d.condition_notes,
            imageUrl: d.image_url,
            createdAt: d.created_at
          }));
        }
      } catch (err) {
        console.warn('Fallback para armazenamento local de equipamentos', err);
      }
    }
    return this.getStorage<Equipment[]>('equipments', INITIAL_EQUIPMENTS);
  }

  async saveEquipment(equipment: Partial<Equipment> & { id?: string }): Promise<Equipment> {
    const list = await this.getEquipments();
    let saved: Equipment;

    if (equipment.id) {
      // Atualização
      const index = list.findIndex(e => e.id === equipment.id);
      if (index >= 0) {
        saved = { ...list[index], ...equipment, updatedAt: new Date().toISOString() } as Equipment;
        list[index] = saved;
      } else {
        saved = { ...equipment, id: equipment.id, createdAt: new Date().toISOString() } as Equipment;
        list.unshift(saved);
      }
    } else {
      // Criação
      saved = {
        ...equipment,
        id: `eq-${Date.now()}`,
        status: equipment.status || 'available',
        createdAt: new Date().toISOString()
      } as Equipment;
      list.unshift(saved);
    }

    this.setStorage('equipments', list);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('equipments').upsert({
          id: saved.id.includes('-') && saved.id.length > 30 ? saved.id : undefined,
          tag: saved.tag,
          serial_number: saved.serialNumber,
          brand: saved.brand,
          model: saved.model,
          type: saved.type,
          cpu: saved.cpu,
          ram: saved.ram,
          storage: saved.storage,
          gpu: saved.gpu,
          screen_size: saved.screenSize,
          status: saved.status,
          daily_rate: saved.dailyRate,
          monthly_rate: saved.monthlyRate,
          condition_notes: saved.conditionNotes
        });
      } catch (e) {
        console.warn('Erro ao sincronizar com Supabase', e);
      }
    }

    return saved;
  }

  async deleteEquipment(id: string): Promise<void> {
    const list = await this.getEquipments();
    const filtered = list.filter(e => e.id !== id);
    this.setStorage('equipments', filtered);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('equipments').delete().eq('id', id);
      } catch (e) {
        console.warn('Erro ao deletar do Supabase', e);
      }
    }
  }

  // --- CLIENTS ---
  async getClients(): Promise<Client[]> {
    return this.getStorage<Client[]>('clients', INITIAL_CLIENTS);
  }

  async saveClient(client: Partial<Client> & { id?: string }): Promise<Client> {
    const list = await this.getClients();
    let saved: Client;

    if (client.id) {
      const index = list.findIndex(c => c.id === client.id);
      if (index >= 0) {
        saved = { ...list[index], ...client } as Client;
        list[index] = saved;
      } else {
        saved = { ...client, id: client.id, createdAt: new Date().toISOString() } as Client;
        list.unshift(saved);
      }
    } else {
      saved = {
        ...client,
        id: `cli-${Date.now()}`,
        createdAt: new Date().toISOString()
      } as Client;
      list.unshift(saved);
    }

    this.setStorage('clients', list);
    return saved;
  }

  async deleteClient(id: string): Promise<void> {
    const list = await this.getClients();
    this.setStorage('clients', list.filter(c => c.id !== id));
  }

  // --- CONTRACTS ---
  async getContracts(): Promise<Contract[]> {
    return this.getStorage<Contract[]>('contracts', INITIAL_CONTRACTS);
  }

  async createContract(contractData: Omit<Contract, 'id' | 'contractNumber' | 'createdAt'>): Promise<Contract> {
    const contracts = await this.getContracts();
    const contractNumber = `CTR-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(4, '0')}`;
    const newContract: Contract = {
      ...contractData,
      id: `ctr-${Date.now()}`,
      contractNumber,
      createdAt: new Date().toISOString()
    };

    contracts.unshift(newContract);
    this.setStorage('contracts', contracts);

    // Atualizar status dos equipamentos para 'rented'
    const equipments = await this.getEquipments();
    const updatedEquipments = equipments.map(eq => {
      const isIncluded = newContract.items.some(item => item.equipmentId === eq.id);
      if (isIncluded) {
        return {
          ...eq,
          status: 'rented' as const,
          currentClientId: newContract.clientId,
          currentContractId: newContract.id
        };
      }
      return eq;
    });
    this.setStorage('equipments', updatedEquipments);

    // Gerar primeira fatura automaticamente
    const invoices = await this.getInvoices();
    const firstInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `FAT-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`,
      contractId: newContract.id,
      clientId: newContract.clientId,
      clientName: newContract.clientName,
      clientPhone: newContract.clientPhone,
      clientEmail: newContract.clientEmail,
      amount: newContract.monthlyTotal,
      dueDate: newContract.startDate,
      status: 'pending',
      periodDescription: `Mensalidade 01 (Vigência: ${newContract.startDate} a ${newContract.endDate})`,
      createdAt: new Date().toISOString()
    };
    invoices.unshift(firstInvoice);
    this.setStorage('invoices', invoices);

    return newContract;
  }

  async finishContract(contractId: string): Promise<void> {
    const contracts = await this.getContracts();
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;

    contract.status = 'completed';
    this.setStorage('contracts', contracts);

    // Liberar equipamentos de volta para 'available'
    const equipments = await this.getEquipments();
    const updatedEquipments = equipments.map(eq => {
      if (contract.items.some(item => item.equipmentId === eq.id)) {
        return {
          ...eq,
          status: 'available' as const,
          currentClientId: undefined,
          currentContractId: undefined
        };
      }
      return eq;
    });
    this.setStorage('equipments', updatedEquipments);
  }

  // --- INVOICES ---
  async getInvoices(): Promise<Invoice[]> {
    return this.getStorage<Invoice[]>('invoices', INITIAL_INVOICES);
  }

  async markInvoiceAsPaid(invoiceId: string, paymentMethod: Invoice['paymentMethod'] = 'pix'): Promise<Invoice | null> {
    const invoices = await this.getInvoices();
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return null;

    invoice.status = 'paid';
    invoice.paidDate = new Date().toISOString().split('T')[0];
    invoice.paymentMethod = paymentMethod;

    this.setStorage('invoices', invoices);
    return invoice;
  }

  async createManualInvoice(data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>): Promise<Invoice> {
    const invoices = await this.getInvoices();
    const invoiceNumber = `FAT-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;
    const newInvoice: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      invoiceNumber,
      createdAt: new Date().toISOString()
    };

    invoices.unshift(newInvoice);
    this.setStorage('invoices', invoices);
    return newInvoice;
  }

  // --- EXPENSES & FINANCIAL COSTS ---
  async getExpenses(): Promise<Expense[]> {
    return this.getStorage<Expense[]>('expenses', INITIAL_EXPENSES);
  }

  async createExpense(data: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt'>): Promise<Expense> {
    const expenses = await this.getExpenses();
    const expenseNumber = `DESP-${new Date().getFullYear()}-${String(expenses.length + 1).padStart(3, '0')}`;
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      expenseNumber,
      createdAt: new Date().toISOString()
    };

    expenses.unshift(newExpense);
    this.setStorage('expenses', expenses);
    return newExpense;
  }

  async markExpenseAsPaid(expenseId: string, paymentMethod: PaymentMethod = 'pix'): Promise<Expense | null> {
    const expenses = await this.getExpenses();
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return null;

    expense.status = 'paid';
    expense.paidDate = new Date().toISOString().split('T')[0];
    expense.paymentMethod = paymentMethod;

    this.setStorage('expenses', expenses);
    return expense;
  }

  async deleteExpense(expenseId: string): Promise<boolean> {
    const expenses = await this.getExpenses();
    const filtered = expenses.filter(e => e.id !== expenseId);
    this.setStorage('expenses', filtered);
    return true;
  }

  // --- MAINTENANCE & SWAP ---
  async getTickets(): Promise<MaintenanceTicket[]> {
    return this.getStorage<MaintenanceTicket[]>('tickets', INITIAL_TICKETS);
  }

  async createTicket(ticketData: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'createdAt'>): Promise<MaintenanceTicket> {
    const tickets = await this.getTickets();
    const ticketNumber = `SUP-${new Date().getFullYear()}-${String(tickets.length + 1).padStart(4, '0')}`;
    const newTicket: MaintenanceTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      ticketNumber,
      createdAt: new Date().toISOString()
    };

    tickets.unshift(newTicket);
    this.setStorage('tickets', tickets);

    // Mudar equipamento original para manutenção
    const equipments = await this.getEquipments();
    const updated = equipments.map(eq => {
      if (eq.id === ticketData.equipmentId) {
        return { ...eq, status: 'maintenance' as const };
      }
      return eq;
    });
    this.setStorage('equipments', updated);

    return newTicket;
  }

  // Troca expressa de máquina (Swap)
  async executeEquipmentSwap(ticketId: string, newEquipmentId: string): Promise<boolean> {
    const tickets = await this.getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return false;

    const equipments = await this.getEquipments();
    const newEq = equipments.find(e => e.id === newEquipmentId);
    if (!newEq || newEq.status !== 'available') return false;

    // Atualizar ticket
    ticket.swapEquipmentId = newEq.id;
    ticket.swapEquipmentTag = newEq.tag;
    ticket.swapDate = new Date().toISOString();
    ticket.status = 'in_progress';
    this.setStorage('tickets', tickets);

    // Se o ticket estiver ligado a um contrato, substituir o item no contrato
    if (ticket.contractId) {
      const contracts = await this.getContracts();
      const contract = contracts.find(c => c.id === ticket.contractId);
      if (contract) {
        contract.items = contract.items.map(item => {
          if (item.equipmentId === ticket.equipmentId) {
            return {
              ...item,
              equipmentId: newEq.id,
              tag: newEq.tag,
              model: newEq.model
            };
          }
          return item;
        });
        this.setStorage('contracts', contracts);
      }
    }

    // Atualizar status dos equipamentos: antigo para manutenção, novo para alugado
    const updatedEquipments = equipments.map(eq => {
      if (eq.id === ticket.equipmentId) {
        return {
          ...eq,
          status: 'maintenance' as const,
          currentContractId: undefined,
          currentClientId: undefined
        };
      }
      if (eq.id === newEq.id) {
        return {
          ...eq,
          status: 'rented' as const,
          currentContractId: ticket.contractId,
          currentClientId: ticket.clientId
        };
      }
      return eq;
    });
    this.setStorage('equipments', updatedEquipments);

    return true;
  }

  // --- CHECKLISTS ---
  async getChecklists(): Promise<InspectionChecklist[]> {
    return this.getStorage<InspectionChecklist[]>('checklists', []);
  }

  async saveChecklist(checklist: Omit<InspectionChecklist, 'id' | 'createdAt'>): Promise<InspectionChecklist> {
    const list = await this.getChecklists();
    const newChecklist: InspectionChecklist = {
      ...checklist,
      id: `chk-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    list.unshift(newChecklist);
    this.setStorage('checklists', list);
    return newChecklist;
  }

  // --- COMPANY SETTINGS ---
  getCompanySettings(): CompanySettings {
    return this.getStorage<CompanySettings>('company_settings', INITIAL_COMPANY_SETTINGS);
  }

  saveCompanySettings(settings: CompanySettings): void {
    this.setStorage('company_settings', settings);
  }

  // --- CONTRACT TEMPLATES ---
  async getContractTemplates(): Promise<ContractTemplate[]> {
    return this.getStorage<ContractTemplate[]>('contract_templates', INITIAL_CONTRACT_TEMPLATES);
  }

  async saveContractTemplate(template: ContractTemplate): Promise<ContractTemplate> {
    const list = await this.getContractTemplates();
    const existingIndex = list.findIndex(t => t.id === template.id);
    if (existingIndex >= 0) {
      list[existingIndex] = template;
    } else {
      list.push(template);
    }
    this.setStorage('contract_templates', list);
    return template;
  }

  async validateContract(contractId: string, customText: string): Promise<boolean> {
    const contracts = await this.getContracts();
    const ctr = contracts.find(c => c.id === contractId);
    if (!ctr) return false;
    ctr.customContractText = customText;
    ctr.isValidated = true;
    this.setStorage('contracts', contracts);
    return true;
  }

  // --- INVOICE PAYMENT MANAGEMENT ---
  async updateInvoicePayment(invoiceId: string, method: PaymentMethod, paidDate: string): Promise<boolean> {
    const invoices = await this.getInvoices();
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return false;
    inv.status = 'paid';
    inv.paymentMethod = method;
    inv.paidDate = paidDate;
    this.setStorage('invoices', invoices);
    return true;
  }

  async revertInvoicePayment(invoiceId: string): Promise<boolean> {
    const invoices = await this.getInvoices();
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return false;
    inv.status = 'pending';
    inv.paidDate = undefined;
    this.setStorage('invoices', invoices);
    return true;
  }

  // --- COMMERCIAL PROPOSALS (COTAÇÕES B2B) ---
  async getProposals(): Promise<CommercialProposal[]> {
    const defaultProposals: CommercialProposal[] = [
      {
        id: 'prop-1',
        proposalNumber: 'PROP-2024-001',
        clientId: 'cli-1',
        clientName: 'TechFlow Soluções Digitais Ltda',
        clientDocument: '24.981.402/0001-90',
        clientPhone: '11998877665',
        clientEmail: 'financeiro@techflow.com.br',
        contactPerson: 'Carlos Eduardo (Gerente de TI)',
        items: [
          {
            equipmentType: 'notebook',
            brandModel: 'Dell Latitude 3440 Core i5',
            cpu: 'Intel Core i5-1335U',
            ram: '16GB DDR4',
            storage: '512GB SSD NVMe',
            quantity: 5,
            unitMonthlyRate: 250.00
          },
          {
            equipmentType: 'notebook',
            brandModel: 'Dell Inspiron 15 Core i7',
            cpu: 'Intel Core i7-1255U',
            ram: '16GB DDR4',
            storage: '512GB SSD',
            quantity: 2,
            unitMonthlyRate: 320.00
          }
        ],
        monthlyTotal: 1890.00,
        rentalPeriodMonths: 12,
        slaHours: 4,
        deliveryDays: 2,
        status: 'approved',
        notes: 'Locação para expansão de squad de desenvolvedores. SLA de troca rápida (Swap) em até 4 horas úteis.',
        createdAt: '2024-02-15T10:00:00Z',
        validUntil: '2024-03-15'
      },
      {
        id: 'prop-2',
        proposalNumber: 'PROP-2024-002',
        clientId: 'cli-2',
        clientName: 'Inova Contabilidade e Auditoria S/S',
        clientDocument: '18.324.901/0001-44',
        clientPhone: '11981122334',
        clientEmail: 'contato@inovacontabil.com.br',
        contactPerson: 'Mariana Silveira',
        items: [
          {
            equipmentType: 'notebook',
            brandModel: 'Lenovo ThinkPad E14 Gen 4',
            cpu: 'AMD Ryzen 5 5625U',
            ram: '16GB DDR4',
            storage: '512GB SSD NVMe',
            quantity: 3,
            unitMonthlyRate: 270.00
          }
        ],
        monthlyTotal: 810.00,
        rentalPeriodMonths: 6,
        slaHours: 8,
        deliveryDays: 1,
        status: 'sent',
        notes: 'Período fiscal de entrega de IRPF e auditoria. Equipamentos já configurados com Windows 11 Pro.',
        createdAt: '2024-03-01T14:30:00Z',
        validUntil: '2024-03-31'
      }
    ];

    return this.getStorage<CommercialProposal[]>('proposals', defaultProposals);
  }

  async saveProposal(proposal: Omit<CommercialProposal, 'id' | 'proposalNumber' | 'createdAt'>): Promise<CommercialProposal> {
    const list = await this.getProposals();
    const proposalNumber = `PROP-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const newProposal: CommercialProposal = {
      ...proposal,
      id: `prop-${Date.now()}`,
      proposalNumber,
      createdAt: new Date().toISOString()
    };
    list.unshift(newProposal);
    this.setStorage('proposals', list);
    return newProposal;
  }

  async updateProposalStatus(proposalId: string, status: CommercialProposal['status']): Promise<boolean> {
    const list = await this.getProposals();
    const found = list.find(p => p.id === proposalId);
    if (!found) return false;
    found.status = status;
    this.setStorage('proposals', list);
    return true;
  }

  // --- LOCAÇÃO RÁPIDA / BALCÃO EXPRESS (FLUXO COMPLETO AUTOMATIZADO) ---
  async executeQuickRental(params: {
    clientId: string;
    equipmentIds: string[];
    periodMonths: number;
    monthlyTotal: number;
    billingDay: number;
    startDate: string;
    endDate: string;
  }): Promise<{ contract: Contract; invoice: Invoice }> {
    const clients = await this.getClients();
    const client = clients.find(c => c.id === params.clientId);
    if (!client) throw new Error('Cliente não localizado');

    const equipments = await this.getEquipments();
    const selectedEquipments = equipments.filter(e => params.equipmentIds.includes(e.id));
    if (selectedEquipments.length === 0) throw new Error('Nenhum equipamento selecionado');

    // 1. Criar Contrato
    const contracts = await this.getContracts();
    const contractNumber = `CTR-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(4, '0')}`;
    const newContractId = `ctr-${Date.now()}`;

    const newContract: Contract = {
      id: newContractId,
      contractNumber,
      clientId: client.id,
      clientName: client.name,
      clientDocument: client.document,
      clientPhone: client.phone,
      clientEmail: client.email,
      startDate: params.startDate,
      endDate: params.endDate,
      billingFrequency: 'monthly',
      billingDay: params.billingDay,
      monthlyTotal: params.monthlyTotal,
      depositAmount: 0,
      status: 'active',
      items: selectedEquipments.map(eq => ({
        equipmentId: eq.id,
        tag: eq.tag,
        model: eq.model,
        monthlyRate: eq.monthlyRate,
        dailyRate: eq.dailyRate
      })),
      customContractText: `CONTRATO DE LOCAÇÃO DE HARDWARE Nº ${contractNumber}\n\nLOCADORA: RAFIUSK INFORMÁTICA LTDA\nLOCATÁRIO: ${client.name} (Doc: ${client.document})\n\nEquipamentos Locados:\n${selectedEquipments.map(eq => `• [${eq.tag}] ${eq.model} (S/N: ${eq.serialNumber})`).join('\n')}\n\nValor Mensal Total: R$ ${params.monthlyTotal.toFixed(2)}\nVigência: ${params.startDate} a ${params.endDate}\n\nO locatário atesta o recebimento dos equipamentos em perfeito estado de funcionamento com garantia de substituição expressa (Swap).`,
      isValidated: true,
      createdAt: new Date().toISOString()
    };

    contracts.unshift(newContract);
    this.setStorage('contracts', contracts);

    // 2. Atualizar Status das Máquinas para Alugadas
    const updatedEquipments = equipments.map(eq => {
      if (params.equipmentIds.includes(eq.id)) {
        return {
          ...eq,
          status: 'rented' as const,
          currentContractId: newContractId,
          currentClientId: client.id
        };
      }
      return eq;
    });
    this.setStorage('equipments', updatedEquipments);

    // 3. Gerar 1ª Fatura / Mensalidade
    const invoices = await this.getInvoices();
    const invoiceNumber = `FAT-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      contractId: newContractId,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email,
      amount: params.monthlyTotal,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      periodDescription: `1ª Mensalidade (${params.periodMonths} meses) - ${selectedEquipments.length} máquina(s)`,
      createdAt: new Date().toISOString()
    };

    invoices.unshift(newInvoice);
    this.setStorage('invoices', invoices);

    return { contract: newContract, invoice: newInvoice };
  }
}

export const db = new DatabaseService();
