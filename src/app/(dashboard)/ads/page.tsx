import { KpiCard } from '@/components/ui/kpi-card';
import { TrendChart } from '@/components/charts/trend-chart';
import { getMetaAds, getGoogleAds } from '@/lib/queries';
import type { AdsMetric } from '@/types/database';

export const dynamic = 'force-dynamic';
const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));

function agg(rows: AdsMetric[]) {
  const spend = rows.reduce((s, r) => s + (r.spend ?? 0), 0);
  const leads = rows.reduce((s, r) => s + (r.leads ?? 0), 0);
  const cpl = leads ? spend / leads : 0;
  const roas = rows.length ? rows.reduce((s, r) => s + (r.roas ?? 0), 0) / rows.length : 0;
  return { spend, leads, cpl, roas };
}

// Soma por dia para o gráfico (Meta vs Google)
function byDay(meta: AdsMetric[], google: AdsMetric[]) {
  const map = new Map<string, { date: string; meta: number; google: number }>();
  for (const r of meta) {
    const e = map.get(r.date) ?? { date: r.date, meta: 0, google: 0 };
    e.meta += r.leads ?? 0;
    map.set(r.date, e);
  }
  for (const r of google) {
    const e = map.get(r.date) ?? { date: r.date, meta: 0, google: 0 };
    e.google += r.leads ?? 0;
    map.set(r.date, e);
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export default async function AdsPage() {
  const [meta, google] = await Promise.all([
    getMetaAds(30).catch(() => []),
    getGoogleAds(30).catch(() => []),
  ]);
  const m = agg(meta);
  const g = agg(google);
  const series = byDay(meta, google);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--color-primary)', marginBottom: 20 }}>
        Mídia Paga
      </h1>

      <h2 style={st}>Meta Ads</h2>
      <section className="kpi-grid" style={{ marginBottom: 20 }}>
        <KpiCard label="Investimento" value={brl(m.spend)} />
        <KpiCard label="Leads" value={fmt(m.leads)} />
        <KpiCard label="CPL" value={brl(m.cpl)} />
        <KpiCard label="ROAS médio" value={`${m.roas.toFixed(2)}x`} />
      </section>

      <h2 style={st}>Google Ads</h2>
      <section className="kpi-grid" style={{ marginBottom: 24 }}>
        <KpiCard label="Investimento" value={brl(g.spend)} />
        <KpiCard label="Leads" value={fmt(g.leads)} />
        <KpiCard label="CPL" value={brl(g.cpl)} />
        <KpiCard label="ROAS médio" value={`${g.roas.toFixed(2)}x`} />
      </section>

      <h2 style={st}>Leads por dia — Meta vs Google</h2>
      <TrendChart
        data={series as unknown as Array<Record<string, string | number>>}
        xKey="date"
        lines={[
          { key: 'meta', label: 'Meta' },
          { key: 'google', label: 'Google' },
        ]}
      />
    </div>
  );
}

const st: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--color-primary)',
  margin: '6px 0 12px',
};
