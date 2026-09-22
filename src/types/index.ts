export type EquipmentStatus = 'available' | 'rented' | 'maintenance' | 'reserved';
export type EquipmentType = 'notebook' | 'desktop' | 'workstation' | 'server' | 'monitor' | 'peripheral';

export interface Equipment {
  id: string;
  tag: string; // Número de Patrimônio
  serialNumber: string;
  brand: string;
  model: string;
  type: EquipmentType;
  cpu: string;
  ram: string;
  storage: string;
  gpu?: string;
  screenSize?: string;
  status: EquipmentStatus;
  dailyRate: number;
  monthlyRate: number;
  currentContractId?: string;
  currentClientId?: string;
  conditionNotes?: string;
  imageUrl?: string;
  photos?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type ClientType = 'PJ' | 'PF';

export interface Client {
  id: string;
  type: ClientType;
  name: string; // Razão Social ou Nome Completo
  tradeName?: string; // Nome Fantasia
  document: string; // CNPJ ou CPF
  email: string;
  phone: string; // WhatsApp
  contactPerson?: string; // Responsável TI / Contato
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  createdAt: string;
}

export type ContractStatus = 'active' | 'completed' | 'cancelled' | 'draft';
export type BillingFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ContractItem {
  equipmentId: string;
  tag: string;
  model: string;
  monthlyRate: number;
}

export interface Contract {
  id: string;
  contractNumber: string;
  clientId: string;
  clientName: string;
  clientDocument: string;
  clientPhone: string;
  clientEmail: string;
  startDate: string;
  endDate: string;
  billingFrequency: BillingFrequency;
  billingDay?: number;
  monthlyTotal: number;
  depositAmount: number;
  setupFee?: number;
  status: ContractStatus;
  items: ContractItem[];
  notes?: string;
  templateId?: string;
  customContractText?: string;
  isValidated?: boolean;
  createdAt: string;
}

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'pix' | 'cash' | 'credit_card' | 'debit_card' | 'boleto' | 'bank_transfer';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  contractId: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  pixCode?: string;
  periodDescription: string;
  createdAt: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'waiting_swap' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  equipmentId: string;
  equipmentTag: string;
  equipmentModel: string;
  clientId: string;
  clientName: string;
  contractId?: string;
  issueDescription: string;
  priority: TicketPriority;
  status: TicketStatus;
  isSwapRequested: boolean;
  swapEquipmentId?: string;
  swapEquipmentTag?: string;
  swapDate?: string;
  resolutionNotes?: string;
  cost?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface InspectionChecklist {
  id: string;
  type: 'delivery' | 'return';
  contractId: string;
  equipmentId: string;
  equipmentTag: string;
  clientName: string;
  date: string;
  screenCondition: 'perfect' | 'scratched' | 'broken';
  caseCondition: 'perfect' | 'light_scratches' | 'dents';
  keyboardCondition: 'working' | 'keys_failing';
  batteryCondition: 'healthy' | 'moderate' | 'needs_replacement';
  chargerIncluded: boolean;
  chargerWorking: boolean;
  portsWorking: boolean;
  photos?: string[];
  additionalNotes?: string;
  signedByClient: boolean;
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  tradeName: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  pixKey: string;
  pixKeyType: 'cnpj' | 'cpf' | 'email' | 'phone' | 'random';
  pixBeneficiaryName?: string;
  pixCity?: string;
  logoUrl?: string;
  termsTemplate?: string;
}

export interface IntegrationSettings {
  evolutionApiUrl: string;
  evolutionApiKey: string;
  evolutionInstanceName: string;
  resendApiKey: string;
  resendFromEmail: string;
}

export interface MessageLog {
  id: string;
  channel: 'whatsapp' | 'email';
  recipient: string;
  recipientName: string;
  subject?: string;
  content: string;
  status: 'sent' | 'failed' | 'simulated';
  referenceType: 'contract' | 'invoice' | 'ticket' | 'checklist' | 'general';
  referenceId?: string;
  timestamp: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  content: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'technician';
  avatarUrl?: string;
}

export interface ProposalItem {
  equipmentType: string;
  brandModel: string;
  cpu: string;
  ram: string;
  storage: string;
  quantity: number;
  unitMonthlyRate: number;
}

export interface CommercialProposal {
  id: string;
  proposalNumber: string;
  clientId?: string;
  clientName: string;
  clientDocument?: string;
  clientPhone: string;
  clientEmail: string;
  contactPerson?: string;
  items: ProposalItem[];
  monthlyTotal: number;
  rentalPeriodMonths: number;
  slaHours: number;
  deliveryDays: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  validUntil: string;
}

export type ExpenseCategory = 
  | 'hardware_parts'
  | 'licenses'
  | 'logistics'
  | 'maintenance'
  | 'infrastructure'
  | 'tax_accounting'
  | 'marketing'
  | 'other';

export type ExpenseStatus = 'pending' | 'paid' | 'cancelled';

export interface Expense {
  id: string;
  expenseNumber: string;
  description: string;
  category: ExpenseCategory;
  supplier: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: ExpenseStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export type PeriodOption = 
  | 'this_month' 
  | 'last_month' 
  | 'last_30_days' 
  | 'last_90_days' 
  | 'this_year' 
  | 'all' 
  | 'custom';

