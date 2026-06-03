import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { TrendChart } from '@/components/charts/trend-chart';
import { getGoogleAds } from '@/lib/queries';
import type { AdsMetric } from '@/types/database';

export const dynamic = 'force-dynamic';
const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));

function agg(rows: AdsMetric[]) {
  const spend = rows.reduce((s, r) => s + (r.spend ?? 0), 0);
  const leads = rows.reduce((s, r) => s + (r.leads ?? 0), 0);
  const cpl = leads ? spend / leads : 0;
  const roas = rows.length
    ? rows.reduce((s, r) => s + (r.roas ?? 0), 0) / rows.length
    : 0;
  return { spend, leads, cpl, roas };
}

function byDay(rows: AdsMetric[]) {
  const map = new Map<string, { date: string; leads: number; spend: number }>();
  for (const r of rows) {
    const e = map.get(r.date) ?? { date: r.date, leads: 0, spend: 0 };
    e.leads += r.leads ?? 0;
    e.spend += r.spend ?? 0;
    map.set(r.date, e);
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function sparkBy(rows: AdsMetric[], key: 'leads' | 'spend', days = 14) {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.date, (map.get(r.date) ?? 0) + (r[key] ?? 0));
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-days)
    .map(([, v]) => v);
}

export default async function GoogleAdsPage() {
  const google = await getGoogleAds(30).catch(() => []);
  const g = agg(google);
  const series = byDay(google);
  const leadsSpark = sparkBy(google, 'leads');
  const spendSpark = sparkBy(google, 'spend');

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Mídia paga</span>
          <h1>Google Ads</h1>
          <p className="subtitle">
            Search e Performance Max — investimento, leads e retorno.
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> Últimos 30 dias
        </span>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Investimento"
          value={brl(g.spend)}
          spark={spendSpark}
          icon={KpiIcons.money}
        />
        <KpiCard
          label="Leads"
          value={fmt(g.leads)}
          spark={leadsSpark}
          icon={KpiIcons.leads}
        />
        <KpiCard label="CPL" value={brl(g.cpl)} icon={KpiIcons.cac} />
        <KpiCard
          label="ROAS médio"
          value={`${g.roas.toFixed(2)}x`}
          icon={KpiIcons.roas}
        />
      </section>

      <div className="section-title">
        <h2>Evolução diária</h2>
        <span className="hint">Leads × spend · 30d</span>
      </div>
      <TrendChart
        data={series as unknown as Array<Record<string, string | number>>}
        xKey="date"
        title="Performance Google Ads"
        subtitle="Leads e investimento"
        lines={[
          { key: 'leads', label: 'Leads', color: '#ead32d' },
          { key: 'spend', label: 'Spend', color: '#4a90d9' },
        ]}
      />
    </div>
  );
}
