import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { TrendChart } from '@/components/charts/trend-chart';
import { getMonthlyOverview, getGa4Daily } from '@/lib/queries';

export const dynamic = 'force-dynamic';

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR').format(Math.round(n));
}
function brl(n: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function DashboardPage() {
  const [overview, ga4] = await Promise.all([
    getMonthlyOverview().catch(() => []),
    getGa4Daily(30).catch(() => []),
  ]);

  const last = overview.at(-1);
  const prev = overview.at(-2);
  const delta = (a?: number, b?: number) =>
    a && b ? ((a - b) / b) * 100 : undefined;

  const totalLeads = (last?.meta_leads ?? 0) + (last?.google_leads ?? 0);
  const prevLeads = (prev?.meta_leads ?? 0) + (prev?.google_leads ?? 0);
  const totalSpend = (last?.meta_spend ?? 0) + (last?.google_spend ?? 0);
  const prevSpend = (prev?.meta_spend ?? 0) + (prev?.google_spend ?? 0);

  const lastDays = ga4.slice(-14);
  const sparkSessions = lastDays.map((d) => d.sessions);
  const sparkUsers = lastDays.map((d) => d.users);
  const sparkPaid = lastDays.map((d) => d.paid_sessions);

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Visão geral</span>
          <h1>Dashboard</h1>
          <p className="subtitle">
            Tráfego, mídia paga e conversão consolidados — comparação com o mês anterior.
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> Últimos 30 dias
        </span>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Sessões"
          value={fmt(last?.sessions ?? 0)}
          delta={delta(last?.sessions, prev?.sessions)}
          spark={sparkSessions}
          icon={KpiIcons.sessions}
        />
        <KpiCard
          label="Usuários"
          value={fmt(last?.users ?? 0)}
          delta={delta(last?.users, prev?.users)}
          spark={sparkUsers}
          icon={KpiIcons.users}
        />
        <KpiCard
          label="Leads (mídia)"
          value={fmt(totalLeads)}
          delta={delta(totalLeads, prevLeads)}
          spark={sparkPaid}
          icon={KpiIcons.leads}
        />
        <KpiCard
          label="Investimento"
          value={brl(totalSpend)}
          delta={delta(prevSpend, totalSpend)}
          hint="Meta + Google"
          icon={KpiIcons.money}
        />
      </section>

      <div className="section-title">
        <h2>Tráfego diário</h2>
        <span className="hint">GA4 · últimos 30 dias</span>
      </div>
      <TrendChart
        data={ga4 as unknown as Array<Record<string, string | number>>}
        xKey="date"
        title="Sessões por canal"
        subtitle="Orgânico vs pago vs social"
        lines={[
          { key: 'sessions', label: 'Total', color: '#ead32d' },
          { key: 'organic_sessions', label: 'Orgânico', color: '#4a90d9' },
          { key: 'paid_sessions', label: 'Pago', color: 'rgba(255,255,255,0.25)' },
        ]}
      />

      {overview.length === 0 && (
        <p className="empty-state" style={{ marginTop: 18 }}>
          Nenhum dado ainda. Assim que o n8n popular as tabelas, os números aparecem
          automaticamente.
        </p>
      )}
    </div>
  );
}
