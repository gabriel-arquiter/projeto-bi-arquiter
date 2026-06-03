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

  const sparkFollowers = ig.slice(-14).map((d) => d.followers);
  const sparkReach = ig.slice(-14).map((d) => d.reach);
  const sparkPinImpr = pin.slice(-14).map((d) => d.impressions);
  const sparkPinSaves = pin.slice(-14).map((d) => d.saves);

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Redes sociais</span>
          <h1>Social</h1>
          <p className="subtitle">
            Instagram e Pinterest — alcance, engajamento e melhores posts.
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> Últimos 30 dias
        </span>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Seguidores IG"
          value={fmt(lastIg?.followers ?? 0)}
          spark={sparkFollowers}
          accent="#e1306c"
        />
        <KpiCard
          label="Alcance IG"
          value={fmt(lastIg?.reach ?? 0)}
          spark={sparkReach}
          accent="#e1306c"
        />
        <KpiCard
          label="Impressões Pinterest"
          value={fmt(lastPin?.impressions ?? 0)}
          spark={sparkPinImpr}
          accent="#e60023"
        />
        <KpiCard
          label="Saves Pinterest"
          value={fmt(lastPin?.saves ?? 0)}
          spark={sparkPinSaves}
          accent="#e60023"
        />
      </section>

      <div className="section-title">
        <h2>Alcance Instagram</h2>
        <span className="hint">Últimos 30 dias</span>
      </div>
      <TrendChart
        data={ig as unknown as Array<Record<string, string | number>>}
        xKey="date"
        title="Alcance diário"
        subtitle="Contas alcançadas no Instagram"
        lines={[{ key: 'reach', label: 'Alcance', color: '#e1306c' }]}
      />

      <div className="section-title">
        <h2>Top posts</h2>
        <span className="hint">Maior taxa de engajamento</span>
      </div>
      <div className="surface table-wrap scroll-x">
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Alcance</th>
              <th>Likes</th>
              <th>Saves</th>
              <th>Engaj.</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td><span className="badge">{p.media_type}</span></td>
                <td className="num">{fmt(p.reach)}</td>
                <td className="num">{fmt(p.likes)}</td>
                <td className="num">{fmt(p.saves)}</td>
                <td className="num">{(p.engagement_rate * 100).toFixed(1)}%</td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
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
