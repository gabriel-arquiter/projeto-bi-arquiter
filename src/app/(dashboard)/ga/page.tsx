import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { TrendChart } from '@/components/charts/trend-chart';
import { getGa4Daily } from '@/lib/queries';

export const dynamic = 'force-dynamic';
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));

export default async function GaPage() {
  const ga4 = await getGa4Daily(30).catch(() => []);
  const totalSessions = ga4.reduce((s, d) => s + (d.sessions ?? 0), 0);
  const totalUsers = ga4.reduce((s, d) => s + (d.users ?? 0), 0);
  const lastGa4 = ga4.at(-1);
  const sparkSessions = ga4.slice(-14).map((d) => d.sessions);
  const sparkUsers = ga4.slice(-14).map((d) => d.users);
  const avgDur = ga4.length
    ? ga4.reduce((s, d) => s + (d.avg_session_duration ?? 0), 0) / ga4.length
    : 0;

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Web analytics</span>
          <h1>Google Analytics</h1>
          <p className="subtitle">
            Tráfego do site, comportamento e canais de aquisição (GA4).
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> Últimos 30 dias
        </span>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Sessões"
          value={fmt(totalSessions)}
          spark={sparkSessions}
          icon={KpiIcons.sessions}
        />
        <KpiCard
          label="Usuários"
          value={fmt(totalUsers)}
          spark={sparkUsers}
          icon={KpiIcons.users}
        />
        <KpiCard
          label="Bounce rate"
          value={`${((lastGa4?.bounce_rate ?? 0) * 100).toFixed(0)}%`}
          hint="dia mais recente"
          icon={KpiIcons.reach}
        />
        <KpiCard
          label="Duração média"
          value={`${Math.round(avgDur)}s`}
          hint="por sessão"
          icon={KpiIcons.heart}
        />
      </section>

      <div className="section-title">
        <h2>Canais de aquisição</h2>
        <span className="hint">GA4 · 30 dias</span>
      </div>
      <TrendChart
        data={ga4 as unknown as Array<Record<string, string | number>>}
        xKey="date"
        title="Sessões por canal"
        subtitle="Orgânico × pago × social"
        lines={[
          { key: 'organic_sessions', label: 'Orgânico', color: '#ead32d' },
          { key: 'paid_sessions', label: 'Pago', color: '#4a90d9' },
          { key: 'social_sessions', label: 'Social', color: 'rgba(255,255,255,0.25)' },
        ]}
      />
    </div>
  );
}
