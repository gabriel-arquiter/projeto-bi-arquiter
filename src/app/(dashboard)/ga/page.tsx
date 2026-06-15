import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { TrendChart } from '@/components/charts/trend-chart';
import { getGa4Daily } from '@/lib/queries';
import { resolvePeriod, type PageSearchParams } from '@/lib/period';

export const dynamic = 'force-dynamic';
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));
const pct = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : undefined);

export default async function GaPage({ searchParams }: { searchParams: PageSearchParams }) {
  const period = resolvePeriod(searchParams);
  const [ga4, ga4Prev] = await Promise.all([
    getGa4Daily(period.range).catch(() => []),
    period.compare ? getGa4Daily(period.prevRange).catch(() => []) : Promise.resolve([]),
  ]);

  const totalSessions = ga4.reduce((s, d) => s + (d.sessions ?? 0), 0);
  const totalUsers = ga4.reduce((s, d) => s + (d.users ?? 0), 0);
  const prevSessions = ga4Prev.reduce((s, d) => s + (d.sessions ?? 0), 0);
  const prevUsers = ga4Prev.reduce((s, d) => s + (d.users ?? 0), 0);
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
          <span className="dot" /> {period.label}
          {period.compare && ' · comparado'}
        </span>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Sessões"
          value={fmt(totalSessions)}
          delta={period.compare ? pct(totalSessions, prevSessions) : undefined}
          spark={sparkSessions}
          icon={KpiIcons.sessions}
        />
        <KpiCard
          label="Usuários"
          value={fmt(totalUsers)}
          delta={period.compare ? pct(totalUsers, prevUsers) : undefined}
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
        <span className="hint">GA4 · {period.days} dias</span>
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
