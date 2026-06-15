import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { TrendChart } from '@/components/charts/trend-chart';
import { getSearchConsoleDaily, getTopKeywords } from '@/lib/queries';
import { resolvePeriod, type PageSearchParams } from '@/lib/period';

export const dynamic = 'force-dynamic';
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));
const pct = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : undefined);

export default async function GscPage({ searchParams }: { searchParams: PageSearchParams }) {
  const period = resolvePeriod(searchParams);
  const [sc, scPrev, kw] = await Promise.all([
    getSearchConsoleDaily(period.range).catch(() => []),
    period.compare ? getSearchConsoleDaily(period.prevRange).catch(() => []) : Promise.resolve([]),
    getTopKeywords(10).catch(() => []),
  ]);

  const totalClicks = sc.reduce((s, d) => s + (d.clicks ?? 0), 0);
  const totalImpr = sc.reduce((s, d) => s + (d.impressions ?? 0), 0);
  const prevClicks = scPrev.reduce((s, d) => s + (d.clicks ?? 0), 0);
  const prevImpr = scPrev.reduce((s, d) => s + (d.impressions ?? 0), 0);
  const avgPos = sc.length
    ? sc.reduce((s, d) => s + (d.avg_position ?? 0), 0) / sc.length
    : 0;
  const avgCtr = totalImpr ? (totalClicks / totalImpr) * 100 : 0;

  const sparkClicks = sc.slice(-14).map((d) => d.clicks);
  const sparkImpr = sc.slice(-14).map((d) => d.impressions);

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Web analytics</span>
          <h1>Google Search Console</h1>
          <p className="subtitle">
            Performance orgânica nas buscas — cliques, impressões, CTR e posição.
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> {period.label}
          {period.compare && ' · comparado'}
        </span>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Cliques orgânicos"
          value={fmt(totalClicks)}
          delta={period.compare ? pct(totalClicks, prevClicks) : undefined}
          spark={sparkClicks}
          icon={KpiIcons.sessions}
        />
        <KpiCard
          label="Impressões"
          value={fmt(totalImpr)}
          delta={period.compare ? pct(totalImpr, prevImpr) : undefined}
          spark={sparkImpr}
          icon={KpiIcons.reach}
        />
        <KpiCard
          label="CTR médio"
          value={`${avgCtr.toFixed(2)}%`}
          icon={KpiIcons.roas}
        />
        <KpiCard
          label="Posição média"
          value={avgPos.toFixed(1)}
          hint="quanto menor, melhor"
          icon={KpiIcons.search}
        />
      </section>

      <div className="section-title">
        <h2>Search Console diário</h2>
        <span className="hint">{period.days} dias</span>
      </div>
      <TrendChart
        data={sc as unknown as Array<Record<string, string | number>>}
        xKey="date"
        title="Cliques × impressões"
        subtitle="Volume diário"
        lines={[
          { key: 'clicks', label: 'Cliques', color: '#ead32d' },
          { key: 'impressions', label: 'Impressões', color: '#4a90d9' },
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
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
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
