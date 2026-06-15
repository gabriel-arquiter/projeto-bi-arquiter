import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { TrendChart } from '@/components/charts/trend-chart';
import { getMetaAds } from '@/lib/queries';
import { resolvePeriod, type PageSearchParams } from '@/lib/period';
import type { AdsMetric } from '@/types/database';

export const dynamic = 'force-dynamic';
const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));
const pct = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : undefined);

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

export default async function MetaAdsPage({ searchParams }: { searchParams: PageSearchParams }) {
  const period = resolvePeriod(searchParams);
  const [meta, metaPrev] = await Promise.all([
    getMetaAds(period.range).catch(() => []),
    period.compare ? getMetaAds(period.prevRange).catch(() => []) : Promise.resolve([]),
  ]);
  const m = agg(meta);
  const mPrev = agg(metaPrev);
  const series = byDay(meta);
  const leadsSpark = sparkBy(meta, 'leads');
  const spendSpark = sparkBy(meta, 'spend');

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Mídia paga</span>
          <h1>Meta Ads</h1>
          <p className="subtitle">
            Facebook e Instagram Ads — investimento, leads e retorno.
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> {period.label}
          {period.compare && ' · comparado'}
        </span>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Investimento"
          value={brl(m.spend)}
          delta={period.compare ? pct(m.spend, mPrev.spend) : undefined}
          spark={spendSpark}
          icon={KpiIcons.money}
        />
        <KpiCard
          label="Leads"
          value={fmt(m.leads)}
          delta={period.compare ? pct(m.leads, mPrev.leads) : undefined}
          spark={leadsSpark}
          icon={KpiIcons.leads}
        />
        <KpiCard
          label="CPL"
          value={brl(m.cpl)}
          delta={period.compare ? pct(mPrev.cpl, m.cpl) : undefined}
          icon={KpiIcons.cac}
        />
        <KpiCard
          label="ROAS médio"
          value={`${m.roas.toFixed(2)}x`}
          delta={period.compare ? pct(m.roas, mPrev.roas) : undefined}
          icon={KpiIcons.roas}
        />
      </section>

      <div className="section-title">
        <h2>Evolução diária</h2>
        <span className="hint">Leads × spend · {period.days}d</span>
      </div>
      <TrendChart
        data={series as unknown as Array<Record<string, string | number>>}
        xKey="date"
        title="Performance Meta Ads"
        subtitle="Leads e investimento"
        lines={[
          { key: 'leads', label: 'Leads', color: '#ead32d' },
          { key: 'spend', label: 'Spend', color: '#4a90d9' },
        ]}
      />
    </div>
  );
}
