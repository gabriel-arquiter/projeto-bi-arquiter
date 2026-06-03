import { KpiCard } from '@/components/ui/kpi-card';
import { TrendChart } from '@/components/charts/trend-chart';
import { getMetaAds, getGoogleAds } from '@/lib/queries';
import type { AdsMetric } from '@/types/database';

export const dynamic = 'force-dynamic';
const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);
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

function sparkBy(rows: AdsMetric[], key: 'leads' | 'spend', days = 14) {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.date, (map.get(r.date) ?? 0) + (r[key] ?? 0));
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-days).map(([, v]) => v);
}

export default async function AdsPage() {
  const [meta, google] = await Promise.all([
    getMetaAds(30).catch(() => []),
    getGoogleAds(30).catch(() => []),
  ]);
  const m = agg(meta);
  const g = agg(google);
  const series = byDay(meta, google);

  const metaLeadsSpark = sparkBy(meta, 'leads');
  const metaSpendSpark = sparkBy(meta, 'spend');
  const gLeadsSpark = sparkBy(google, 'leads');
  const gSpendSpark = sparkBy(google, 'spend');

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Mídia</span>
          <h1>Mídia Paga</h1>
          <p className="subtitle">
            Meta Ads e Google Ads — investimento, leads e retorno consolidados.
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> Últimos 30 dias
        </span>
      </header>

      <div className="section-title">
        <h2>Meta Ads</h2>
        <span className="hint">Facebook & Instagram</span>
      </div>
      <section className="kpi-grid" style={{ marginBottom: 8 }}>
        <KpiCard label="Investimento" value={brl(m.spend)} spark={metaSpendSpark} accent="#1877f2" />
        <KpiCard label="Leads" value={fmt(m.leads)} spark={metaLeadsSpark} accent="#1877f2" />
        <KpiCard label="CPL" value={brl(m.cpl)} accent="#1877f2" />
        <KpiCard label="ROAS médio" value={`${m.roas.toFixed(2)}x`} accent="#1877f2" />
      </section>

      <div className="section-title">
        <h2>Google Ads</h2>
        <span className="hint">Search + Performance Max</span>
      </div>
      <section className="kpi-grid" style={{ marginBottom: 8 }}>
        <KpiCard label="Investimento" value={brl(g.spend)} spark={gSpendSpark} accent="#ea4335" />
        <KpiCard label="Leads" value={fmt(g.leads)} spark={gLeadsSpark} accent="#ea4335" />
        <KpiCard label="CPL" value={brl(g.cpl)} accent="#ea4335" />
        <KpiCard label="ROAS médio" value={`${g.roas.toFixed(2)}x`} accent="#ea4335" />
      </section>

      <div className="section-title">
        <h2>Leads por dia</h2>
        <span className="hint">Meta vs Google</span>
      </div>
      <TrendChart
        data={series as unknown as Array<Record<string, string | number>>}
        xKey="date"
        title="Volume de leads"
        subtitle="Comparação direta entre canais pagos"
        lines={[
          { key: 'meta', label: 'Meta', color: '#1877f2' },
          { key: 'google', label: 'Google', color: '#ea4335' },
        ]}
      />
    </div>
  );
}
