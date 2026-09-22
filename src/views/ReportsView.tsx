import React from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Laptop, 
  DollarSign, 
  PieChart, 
  Printer 
} from 'lucide-react';
import { Equipment, Contract, Invoice } from '../types';

interface Props {
  equipments: Equipment[];
  contracts: Contract[];
  invoices: Invoice[];
}

export const ReportsView: React.FC<Props> = ({ equipments, contracts, invoices }) => {
  const totalEquipments = equipments.length;
  const rentedCount = equipments.filter(e => e.status === 'rented').length;
  const idleCount = equipments.filter(e => e.status === 'available').length;
  const idleRate = totalEquipments > 0 ? Math.round((idleCount / totalEquipments) * 100) : 0;

  // Valor de locação potencial parado no estoque
  const idleMonthlyValue = equipments
    .filter(e => e.status === 'available')
    .reduce((sum, e) => sum + e.monthlyRate, 0);

  // Faturamento mensal ativo
  const activeMrr = contracts
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + c.monthlyTotal, 0);

  // Distribuição por Fabricante
  const brandStats: Record<string, { total: number; rented: number; revenue: number }> = {};
  equipments.forEach(eq => {
    if (!brandStats[eq.brand]) {
      brandStats[eq.brand] = { total: 0, rented: 0, revenue: 0 };
    }
    brandStats[eq.brand].total += 1;
    if (eq.status === 'rented') {
      brandStats[eq.brand].rented += 1;
      brandStats[eq.brand].revenue += eq.monthlyRate;
    }
  });

  const exportEquipmentsCsv = () => {
    const headers = ['Patrimonio', 'Marca', 'Modelo', 'Serial', 'Status', 'Processador', 'RAM', 'SSD', 'Valor_Mensal'];
    const rows = equipments.map(e => [
      e.tag,
      e.brand,
      e.model,
      e.serialNumber,
      e.status,
      e.cpu,
      e.ram,
      e.storage,
      e.monthlyRate.toString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(r => r.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_equipamentos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportContractsCsv = () => {
    const headers = ['Numero_Contrato', 'Cliente', 'Documento', 'Data_Inicio', 'Data_Termino', 'Mensalidade', 'Qtd_Maquinas', 'Status'];
    const rows = contracts.map(c => [
      c.contractNumber,
      c.clientName,
      c.clientDocument,
      c.startDate,
      c.endDate,
      c.monthlyTotal.toString(),
      c.items.length.toString(),
      c.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(r => r.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_contratos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Relatórios & Inteligência de Negócio</h2>
          <p className="text-xs text-slate-500">Métricas financeiras, rentabilidade de ativos e exportação de dados</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Relatório
          </button>
          <button
            onClick={exportEquipmentsCsv}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Top Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MRR Ativo (Locações)</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {activeMrr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Base anual projetada: {(activeMrr * 12).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Taxa de Ociosidade</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {idleRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {idleCount} máquinas paradas no estoque
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Potencial Parado</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {idleMonthlyValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Receita que pode ser obtida ao alugar o estoque livre
          </p>
        </div>
      </div>

      {/* Tabela de Rentabilidade por Fabricante */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Rentabilidade por Fabricante</h3>
            <p className="text-xs text-slate-500">Desempenho de locação por marca de computador</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4 pl-5">Fabricante</th>
                <th className="p-4">Frota Total</th>
                <th className="p-4">Alugados</th>
                <th className="p-4">Disponíveis</th>
                <th className="p-4">Taxa de Ocupação</th>
                <th className="p-4 text-right pr-5">Receita Mensal Gerada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(brandStats).map(([brand, stats]) => {
                const brandOccupancy = stats.total > 0 ? Math.round((stats.rented / stats.total) * 100) : 0;
                return (
                  <tr key={brand} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 pl-5 font-bold text-slate-900">{brand}</td>
                    <td className="p-4 text-slate-700">{stats.total} máquinas</td>
                    <td className="p-4 font-semibold text-emerald-700">{stats.rented}</td>
                    <td className="p-4 text-slate-500">{stats.total - stats.rented}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full rounded-full" 
                            style={{ width: `${brandOccupancy}%` }} 
                          />
                        </div>
                        <span className="font-bold text-slate-800 text-[11px]">{brandOccupancy}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right pr-5 font-black text-slate-900">
                      {stats.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900">Base de Ativos e Hardware</h4>
            <p className="text-xs text-slate-500 mt-0.5">Exportar todos os computadores, números de série e especificações</p>
          </div>
          <button
            onClick={exportEquipmentsCsv}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar CSV
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900">Relatório de Contratos</h4>
            <p className="text-xs text-slate-500 mt-0.5">Exportar lista de contratos com clientes, vigências e valores</p>
          </div>
          <button
            onClick={exportContractsCsv}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar CSV
          </button>
        </div>
      </div>
    </div>
  );
};
