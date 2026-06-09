import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { TrendChart } from '@/components/charts/trend-chart';
import { getDre } from '@/lib/queries';
import type { DreMonth } from '@/types/database';

export const dynamic = 'force-dynamic';

const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);
const pct = (n: number) => `${n.toFixed(1)}%`;

function delta(a?: number, b?: number) {
  if (a === undefined || b === undefined || !b) return undefined;
  return ((a - b) / Math.abs(b)) * 100;
}

function monthLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

// Linhas da DRE, na ordem contábil. negative = subtrai do acumulado.
function dreLines(m: DreMonth) {
  return [
    { label: 'Receita bruta', value: m.receita_bruta, kind: 'header' as const },
    { label: '(–) Deduções e impostos', value: -m.deducoes, kind: 'minus' as const },
    { label: '(=) Receita líquida', value: m.receita_liquida, kind: 'subtotal' as const },
    { label: '(–) Custos dos serviços', value: -m.custos, kind: 'minus' as const },
    { label: '(=) Lucro bruto', value: m.lucro_bruto, kind: 'subtotal' as const },
    { label: '(–) Marketing', value: -m.despesas_marketing, kind: 'minus' as const },
    { label: '(–) Pessoal', value: -m.despesas_pessoal, kind: 'minus' as const },
    { label: '(–) Administrativas', value: -m.despesas_administrativas, kind: 'minus' as const },
    { label: '(=) EBITDA', value: m.ebitda, kind: 'subtotal' as const },
    { label: '(=) Resultado líquido', value: m.resultado_liquido, kind: 'total' as const },
  ];
}

export default async function DrePage() {
  const dre = await getDre(6).catch(() => []);
  const last = dre.at(-1);
  const prev = dre.at(-2);

  const margemBruta = last && last.receita_liquida
    ? (last.lucro_bruto / last.receita_liquida) * 100
    : 0;
  const margemEbitda = last && last.receita_liquida
    ? (last.ebitda / last.receita_liquida) * 100
    : 0;
  const margemLiquida = last && last.receita_liquida
    ? (last.resultado_liquido / last.receita_liquida) * 100
    : 0;

  const series = dre.map((m) => ({
    month: monthLabel(m.month),
    receita: m.receita_liquida,
    ebitda: m.ebitda,
    resultado: m.resultado_liquido,
  }));

  const monthName = last
    ? new Date(last.month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Financeiro · Conta Azul</span>
          <h1>DRE</h1>
          <p className="subtitle">
            Demonstração de Resultado do Exercício — receita, custos, despesas e margens
            reconciliados com o ERP.
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> {monthName}
        </span>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Receita líquida"
          value={brl(last?.receita_liquida ?? 0)}
          delta={delta(last?.receita_liquida, prev?.receita_liquida)}
          icon={KpiIcons.money}
          hint="mês corrente"
        />
        <KpiCard
          label="Lucro bruto"
          value={brl(last?.lucro_bruto ?? 0)}
          delta={delta(last?.lucro_bruto, prev?.lucro_bruto)}
          icon={KpiIcons.roas}
          hint={`margem ${pct(margemBruta)}`}
        />
        <KpiCard
          label="EBITDA"
          value={brl(last?.ebitda ?? 0)}
          delta={delta(last?.ebitda, prev?.ebitda)}
          icon={KpiIcons.roas}
          hint={`margem ${pct(margemEbitda)}`}
        />
        <KpiCard
          label="Resultado líquido"
          value={brl(last?.resultado_liquido ?? 0)}
          delta={delta(last?.resultado_liquido, prev?.resultado_liquido)}
          icon={KpiIcons.cac}
          hint={`margem ${pct(margemLiquida)}`}
        />
      </section>

      <div className="section-title">
        <h2>Evolução do resultado</h2>
        <span className="hint">Receita líquida · EBITDA · resultado · 6m</span>
      </div>
      <TrendChart
        data={series}
        xKey="month"
        title="Resultado mensal"
        subtitle="Em R$"
        lines={[
          { key: 'receita', label: 'Receita líquida', color: '#ead32d' },
          { key: 'ebitda', label: 'EBITDA', color: '#4a90d9' },
          { key: 'resultado', label: 'Resultado', color: '#00d97e' },
        ]}
      />

      <div className="section-title">
        <h2>DRE detalhada</h2>
        <span className="hint">Estrutura mês a mês</span>
      </div>
      <div className="surface table-wrap scroll-x">
        <table>
          <thead>
            <tr>
              <th>Linha</th>
              {dre.map((m) => (
                <th key={m.month} style={{ textAlign: 'right' }}>
                  {monthLabel(m.month)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {last &&
              dreLines(last).map((line, idx) => {
                const isResult = line.kind === 'total';
                const isSub = line.kind === 'subtotal';
                return (
                  <tr key={line.label}>
                    <td
                      style={{
                        fontWeight: isResult || isSub ? 700 : 500,
                        color: isResult ? 'var(--color-secondary)' : 'var(--text)',
                      }}
                    >
                      {line.label}
                    </td>
                    {dre.map((m) => {
                      const v = dreLines(m)[idx].value;
                      return (
                        <td
                          key={m.month}
                          className="num"
                          style={{
                            textAlign: 'right',
                            fontWeight: isResult || isSub ? 700 : 400,
                            color: isResult
                              ? 'var(--color-secondary)'
                              : v < 0
                                ? 'var(--text-muted)'
                                : 'var(--text)',
                          }}
                        >
                          {brl(v)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {dre.length === 0 && (
        <p className="empty-state" style={{ marginTop: 18 }}>
          Sem dados financeiros ainda. Assim que o extrator da Conta Azul popular o
          mart.financeiro, a DRE aparece automaticamente.
        </p>
      )}
    </div>
  );
}
