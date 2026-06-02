import { KpiCard } from '@/components/ui/kpi-card';
import { TrendChart } from '@/components/charts/trend-chart';
import {
  getInstagramMetrics,
  getTopInstagramPosts,
  getPinterestMetrics,
} from '@/lib/queries';

export const dynamic = 'force-dynamic';
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));

export default async function SocialPage() {
  const [ig, posts, pin] = await Promise.all([
    getInstagramMetrics(30).catch(() => []),
    getTopInstagramPosts(6).catch(() => []),
    getPinterestMetrics(30).catch(() => []),
  ]);
  const lastIg = ig.at(-1);
  const lastPin = pin.at(-1);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--color-primary)', marginBottom: 20 }}>
        Social
      </h1>

      <section className="kpi-grid" style={{ marginBottom: 22 }}>
        <KpiCard label="Seguidores IG" value={fmt(lastIg?.followers ?? 0)} />
        <KpiCard label="Alcance IG" value={fmt(lastIg?.reach ?? 0)} />
        <KpiCard label="Impressões Pinterest" value={fmt(lastPin?.impressions ?? 0)} />
        <KpiCard label="Saves Pinterest" value={fmt(lastPin?.saves ?? 0)} />
      </section>

      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-primary)', margin: '6px 0 12px' }}>
        Alcance Instagram (30 dias)
      </h2>
      <TrendChart
        data={ig as unknown as Array<Record<string, string | number>>}
        xKey="date"
        lines={[{ key: 'reach', label: 'Alcance' }]}
      />

      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-primary)', margin: '24px 0 12px' }}>
        Top posts
      </h2>
      <div className="surface scroll-x" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--color-text-muted)' }}>
              <th style={th}>Tipo</th>
              <th style={th}>Alcance</th>
              <th style={th}>Likes</th>
              <th style={th}>Saves</th>
              <th style={th}>Engaj.</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                <td style={td}>{p.media_type}</td>
                <td style={td}>{fmt(p.reach)}</td>
                <td style={td}>{fmt(p.likes)}</td>
                <td style={td}>{fmt(p.saves)}</td>
                <td style={td}>{(p.engagement_rate * 100).toFixed(1)}%</td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td style={td} colSpan={5}>
                  Sem posts ainda.
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
