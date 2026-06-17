import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { TrendChart } from '@/components/charts/trend-chart';
import { getCashFlow } from '@/lib/queries';
import { resolvePeriod, type PageSearchParams } from '@/lib/period';

export const dynamic = 'force-dynamic';

const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);

function delta(a?: number, b?: number) {
  if (a === undefined || b === undefined || !b) return undefined;
  return ((a - b) / Math.abs(b)) * 100;
}

function monthLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

export default async function CashFlowPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const period = resolvePeriod(searchParams);
  const cf = await getCashFlow(period.range).catch(() => []);
  const last = cf.at(-1);
  const prev = cf.at(-2);

  const fluxoLiquido = last ? last.entradas - last.saidas : 0;
  const fluxoPrev = prev ? prev.entradas - prev.saidas : 0;

  // Runway: meses de caixa cobrindo o burn médio (quando o fluxo é negativo).
  const burnMeses = cf.filter((m) => m.entradas - m.saidas < 0);
  const burnMedio = burnMeses.length
    ? burnMeses.reduce((s, m) => s + (m.saidas - m.entradas), 0) / burnMeses.length
    : 0;
  const runway = burnMedio > 0 && last ? last.saldo_final / burnMedio : null;

  const series = cf.map((m) => ({
    month: monthLabel(m.month),
    entradas: m.entradas,
    saidas: m.saidas,
    saldo: m.saldo_final,
  }));

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Financeiro · Conta Azul</span>
          <h1>Cash Flow</h1>
          <p className="subtitle">
            Fluxo de caixa em regime de caixa — entradas, saídas, saldo e posição de
            contas a pagar/receber.
          </p>
        </div>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Saldo de caixa"
          value={brl(last?.saldo_final ?? 0)}
          delta={delta(last?.saldo_final, prev?.saldo_final)}
          icon={KpiIcons.money}
          hint="fim do mês"
        />
        <KpiCard
          label="Fluxo líquido"
          value={brl(fluxoLiquido)}
          delta={delta(fluxoLiquido, fluxoPrev)}
          icon={KpiIcons.roas}
          hint="entradas − saídas"
        />
        <KpiCard
          label="A receber"
          value={brl(last?.a_receber ?? 0)}
          icon={KpiIcons.leads}
          hint="saldo em aberto"
        />
        <KpiCard
          label={runway !== null ? 'Runway' : 'A pagar'}
          value={runway !== null ? `${runway.toFixed(1)} meses` : brl(last?.a_pagar ?? 0)}
          icon={KpiIcons.cac}
          hint={runway !== null ? 'sobre burn médio' : 'saldo em aberto'}
        />
      </section>

      <div className="section-title">
        <h2>Movimentação de caixa</h2>
        <span className="hint">Entradas · saídas · saldo · {cf.length}m</span>
      </div>
      <TrendChart
        data={series}
        xKey="month"
        title="Fluxo de caixa mensal"
        subtitle="Em R$"
        lines={[
          { key: 'entradas', label: 'Entradas', color: '#00d97e' },
          { key: 'saidas', label: 'Saídas', color: '#ff4d4f' },
          { key: 'saldo', label: 'Saldo final', color: '#ead32d' },
        ]}
      />

      <div className="section-title">
        <h2>Detalhamento mensal</h2>
        <span className="hint">Posição de caixa</span>
      </div>
      <div className="surface table-wrap scroll-x">
        <table>
          <thead>
            <tr>
              <th>Mês</th>
              <th style={{ textAlign: 'right' }}>Saldo inicial</th>
              <th style={{ textAlign: 'right' }}>Entradas</th>
              <th style={{ textAlign: 'right' }}>Saídas</th>
              <th style={{ textAlign: 'right' }}>Fluxo líquido</th>
              <th style={{ textAlign: 'right' }}>Saldo final</th>
            </tr>
          </thead>
          <tbody>
            {cf.map((m) => {
              const fluxo = m.entradas - m.saidas;
              return (
                <tr key={m.month}>
                  <td style={{ fontWeight: 600 }}>{monthLabel(m.month)}</td>
                  <td className="num" style={{ textAlign: 'right' }}>
                    {brl(m.saldo_inicial)}
                  </td>
                  <td className="num" style={{ textAlign: 'right', color: 'var(--positive)' }}>
                    {brl(m.entradas)}
                  </td>
                  <td className="num" style={{ textAlign: 'right', color: 'var(--negative)' }}>
                    {brl(m.saidas)}
                  </td>
                  <td
                    className="num"
                    style={{
                      textAlign: 'right',
                      fontWeight: 600,
                      color: fluxo >= 0 ? 'var(--positive)' : 'var(--negative)',
                    }}
                  >
                    {brl(fluxo)}
                  </td>
                  <td
                    className="num"
                    style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-secondary)' }}
                  >
                    {brl(m.saldo_final)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {cf.length === 0 && (
        <p className="empty-state" style={{ marginTop: 18 }}>
          Sem dados de fluxo de caixa ainda. Assim que o extrator da Conta Azul rodar, o
          Cash Flow aparece automaticamente.
        </p>
      )}
    </div>
  );
}
