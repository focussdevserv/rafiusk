-- ==========================================================
-- SCHEMA SUPABASE: SISTEMA DE LOCAÇÃO DE COMPUTADORES E NOTEBOOKS
-- ==========================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Equipamentos / Ativos de Hardware
CREATE TABLE IF NOT EXISTS equipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag VARCHAR(50) UNIQUE NOT NULL, -- Número de Patrimônio
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('notebook', 'desktop', 'workstation', 'server', 'monitor', 'peripheral')),
    cpu VARCHAR(100) NOT NULL,
    ram VARCHAR(50) NOT NULL,
    storage VARCHAR(100) NOT NULL,
    gpu VARCHAR(100),
    screen_size VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'reserved')),
    daily_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    monthly_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    current_contract_id UUID,
    current_client_id UUID,
    condition_notes TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Clientes (Pessoa Física e Pessoa Jurídica)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('PJ', 'PF')),
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    document VARCHAR(30) UNIQUE NOT NULL, -- CNPJ ou CPF
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    contact_person VARCHAR(150),
    address JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Contratos de Locação
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    billing_frequency VARCHAR(50) NOT NULL DEFAULT 'monthly' CHECK (billing_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    monthly_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    deposit_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    setup_fee NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'draft')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Itens do Contrato (Equipamentos Vinculados)
CREATE TABLE IF NOT EXISTS contract_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipments(id) ON DELETE RESTRICT,
    monthly_rate NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Faturas e Cobranças
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_method VARCHAR(50) CHECK (payment_method IN ('pix', 'boleto', 'credit_card', 'bank_transfer')),
    pix_code TEXT,
    period_description VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Manutenção e Chamados Técnicos (Troca Rápida / Swap)
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    equipment_id UUID REFERENCES equipments(id) ON DELETE RESTRICT,
    client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    issue_description TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_swap', 'resolved', 'closed')),
    is_swap_requested BOOLEAN DEFAULT FALSE,
    swap_equipment_id UUID REFERENCES equipments(id) ON DELETE SET NULL,
    swap_date TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    cost NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 8. Tabela de Vistorias e Checklists (Entrega e Devolução)
CREATE TABLE IF NOT EXISTS inspection_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('delivery', 'return')),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipments(id) ON DELETE RESTRICT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    screen_condition VARCHAR(50) NOT NULL DEFAULT 'perfect',
    case_condition VARCHAR(50) NOT NULL DEFAULT 'perfect',
    keyboard_condition VARCHAR(50) NOT NULL DEFAULT 'working',
    battery_condition VARCHAR(50) NOT NULL DEFAULT 'healthy',
    charger_included BOOLEAN DEFAULT TRUE,
    charger_working BOOLEAN DEFAULT TRUE,
    ports_working BOOLEAN DEFAULT TRUE,
    additional_notes TEXT,
    signed_by_client BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tabela de Logs de Mensagens (WhatsApp Evolution API e Resend Email)
CREATE TABLE IF NOT EXISTS message_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('whatsapp', 'email')),
    recipient VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'sent',
    reference_type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Índices para Alto Desempenho
CREATE INDEX IF NOT EXISTS idx_equipments_status ON equipments(status);
CREATE INDEX IF NOT EXISTS idx_equipments_tag ON equipments(tag);
CREATE INDEX IF NOT EXISTS idx_clients_document ON clients(document);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON maintenance_tickets(status);

-- 11. Habilitar Row Level Security (RLS)
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Público para Aplicação Frontend
CREATE POLICY "Permitir leitura pública" ON equipments FOR ALL USING (true);
CREATE POLICY "Permitir leitura pública" ON clients FOR ALL USING (true);
CREATE POLICY "Permitir leitura pública" ON contracts FOR ALL USING (true);
CREATE POLICY "Permitir leitura pública" ON contract_items FOR ALL USING (true);
CREATE POLICY "Permitir leitura pública" ON invoices FOR ALL USING (true);
CREATE POLICY "Permitir leitura pública" ON maintenance_tickets FOR ALL USING (true);
CREATE POLICY "Permitir leitura pública" ON inspection_checklists FOR ALL USING (true);
CREATE POLICY "Permitir leitura pública" ON message_logs FOR ALL USING (true);
