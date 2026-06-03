import { KpiCard } from '@/components/ui/kpi-card';
import { TrendChart } from '@/components/charts/trend-chart';
import { getSearchConsoleDaily, getTopKeywords, getGa4Daily } from '@/lib/queries';

export const dynamic = 'force-dynamic';
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));

export default async function GooglePage() {
  const [sc, kw, ga4] = await Promise.all([
    getSearchConsoleDaily(30).catch(() => []),
    getTopKeywords(10).catch(() => []),
    getGa4Daily(30).catch(() => []),
  ]);

  const totalClicks = sc.reduce((s, d) => s + (d.clicks ?? 0), 0);
  const totalImpr = sc.reduce((s, d) => s + (d.impressions ?? 0), 0);
  const avgPos = sc.length ? sc.reduce((s, d) => s + (d.avg_position ?? 0), 0) / sc.length : 0;
  const lastGa4 = ga4.at(-1);

  const sparkClicks = sc.slice(-14).map((d) => d.clicks);
  const sparkImpr = sc.slice(-14).map((d) => d.impressions);

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">SEO & orgânico</span>
          <h1>Google</h1>
          <p className="subtitle">
            Performance no Search Console e comportamento dos visitantes orgânicos.
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> Últimos 30 dias
        </span>
      </header>

      <section className="kpi-grid">
        <KpiCard label="Cliques orgânicos" value={fmt(totalClicks)} spark={sparkClicks} />
        <KpiCard label="Impressões" value={fmt(totalImpr)} spark={sparkImpr} accent="#3b3b3b" />
        <KpiCard label="Posição média" value={avgPos.toFixed(1)} hint="quanto menor, melhor" accent="#2e7d4f" />
        <KpiCard
          label="Bounce rate"
          value={`${((lastGa4?.bounce_rate ?? 0) * 100).toFixed(0)}%`}
          accent="#b87f00"
        />
      </section>

      <div className="section-title">
        <h2>Search Console</h2>
        <span className="hint">Últimos 30 dias</span>
      </div>
      <TrendChart
        data={sc as unknown as Array<Record<string, string | number>>}
        xKey="date"
        title="Cliques × impressões"
        subtitle="Volume diário do Search Console"
        lines={[
          { key: 'clicks', label: 'Cliques' },
          { key: 'impressions', label: 'Impressões', color: '#ead32d' },
        ]}
      />

      <div className="section-title">
        <h2>Top keywords</h2>
        <span className="hint">Maiores volumes de clique</span>
      </div>
      <div className="surface table-wrap scroll-x">
        <table>
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Cliques</th>
              <th>Impr.</th>
              <th>CTR</th>
              <th>Pos.</th>
            </tr>
          </thead>
          <tbody>
            {kw.map((k, i) => (
              <tr key={i}>
                <td>{k.keyword}</td>
                <td className="num">{fmt(k.clicks)}</td>
                <td className="num">{fmt(k.impressions)}</td>
                <td className="num">{(k.ctr * 100).toFixed(1)}%</td>
                <td className="num">{k.avg_position.toFixed(1)}</td>
              </tr>
            ))}
            {kw.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Sem keywords ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
