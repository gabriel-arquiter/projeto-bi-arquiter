import { KpiCard } from '@/components/ui/kpi-card';
import { TrendChart } from '@/components/charts/trend-chart';
import { getMonthlyOverview, getGa4Daily } from '@/lib/queries';

export const dynamic = 'force-dynamic';

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR').format(Math.round(n));
}
function brl(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default async function OverviewPage() {
  // Tolerante a tabela vazia: tudo retorna [] e a página renderiza zeros.
  const [overview, ga4] = await Promise.all([
    getMonthlyOverview().catch(() => []),
    getGa4Daily(30).catch(() => []),
  ]);

  const last = overview.at(-1);
  const prev = overview.at(-2);
  const delta = (a?: number, b?: number) =>
    a && b ? ((a - b) / b) * 100 : undefined;

  const totalLeads = (last?.meta_leads ?? 0) + (last?.google_leads ?? 0);
  const totalSpend = (last?.meta_spend ?? 0) + (last?.google_spend ?? 0);

  return (
    <div>
      <header style={{ marginBottom: 22 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            color: 'var(--color-primary)',
          }}
        >
          Resumo do Mês
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 2 }}>
          Visão consolidada de tráfego, mídia e conversão.
        </p>
      </header>

      <section className="kpi-grid" style={{ marginBottom: 22 }}>
        <KpiCard
          label="Sessões"
          value={fmt(last?.sessions ?? 0)}
          delta={delta(last?.sessions, prev?.sessions)}
        />
        <KpiCard
          label="Usuários"
          value={fmt(last?.users ?? 0)}
          delta={delta(last?.users, prev?.users)}
        />
        <KpiCard label="Leads (mídia)" value={fmt(totalLeads)} />
        <KpiCard label="Investimento" value={brl(totalSpend)} />
      </section>

      <h2 style={sectionTitle}>Tráfego diário (30 dias)</h2>
      <TrendChart
        data={ga4 as unknown as Array<Record<string, string | number>>}
        xKey="date"
        lines={[
          { key: 'sessions', label: 'Sessões' },
          { key: 'organic_sessions', label: 'Orgânico' },
          { key: 'paid_sessions', label: 'Pago' },
        ]}
      />

      {overview.length === 0 && (
        <p style={{ marginTop: 18, fontSize: 13, color: 'var(--color-text-muted)' }}>
          Nenhum dado ainda. Assim que o n8n popular as tabelas, os números aparecem
          automaticamente.
        </p>
      )}
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--color-primary)',
  margin: '6px 0 12px',
};
