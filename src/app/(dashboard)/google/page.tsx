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

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--color-primary)', marginBottom: 20 }}>
        Google
      </h1>

      <section className="kpi-grid" style={{ marginBottom: 22 }}>
        <KpiCard label="Cliques orgânicos" value={fmt(totalClicks)} />
        <KpiCard label="Impressões" value={fmt(totalImpr)} />
        <KpiCard label="Posição média" value={avgPos.toFixed(1)} />
        <KpiCard label="Bounce rate" value={`${((lastGa4?.bounce_rate ?? 0) * 100).toFixed(0)}%`} />
      </section>

      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-primary)', margin: '6px 0 12px' }}>
        Search Console (30 dias)
      </h2>
      <TrendChart
        data={sc as unknown as Array<Record<string, string | number>>}
        xKey="date"
        lines={[
          { key: 'clicks', label: 'Cliques' },
          { key: 'impressions', label: 'Impressões' },
        ]}
      />

      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-primary)', margin: '24px 0 12px' }}>
        Top keywords
      </h2>
      <div className="surface scroll-x" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--color-text-muted)' }}>
              <th style={th}>Keyword</th>
              <th style={th}>Cliques</th>
              <th style={th}>Impr.</th>
              <th style={th}>CTR</th>
              <th style={th}>Pos.</th>
            </tr>
          </thead>
          <tbody>
            {kw.map((k, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                <td style={td}>{k.keyword}</td>
                <td style={td}>{fmt(k.clicks)}</td>
                <td style={td}>{fmt(k.impressions)}</td>
                <td style={td}>{(k.ctr * 100).toFixed(1)}%</td>
                <td style={td}>{k.avg_position.toFixed(1)}</td>
              </tr>
            ))}
            {kw.length === 0 && (
              <tr>
                <td style={td} colSpan={5}>
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

const th: React.CSSProperties = { padding: '12px 16px', fontWeight: 600, fontSize: 12 };
const td: React.CSSProperties = { padding: '12px 16px' };
