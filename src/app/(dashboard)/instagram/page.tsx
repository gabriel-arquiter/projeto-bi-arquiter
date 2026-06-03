import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { TrendChart } from '@/components/charts/trend-chart';
import { getInstagramMetrics, getTopInstagramPosts } from '@/lib/queries';

export const dynamic = 'force-dynamic';
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));

export default async function InstagramPage() {
  const [ig, posts] = await Promise.all([
    getInstagramMetrics(30).catch(() => []),
    getTopInstagramPosts(6).catch(() => []),
  ]);
  const lastIg = ig.at(-1);
  const sparkFollowers = ig.slice(-14).map((d) => d.followers);
  const sparkReach = ig.slice(-14).map((d) => d.reach);
  const avgEng = ig.length
    ? (ig.reduce((s, d) => s + (d.engagement_rate ?? 0), 0) / ig.length) * 100
    : 0;

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Social analytics</span>
          <h1>Instagram</h1>
          <p className="subtitle">Alcance, seguidores, engajamento e melhores posts.</p>
        </div>
        <span className="period-chip">
          <span className="dot" /> Últimos 30 dias
        </span>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Seguidores"
          value={fmt(lastIg?.followers ?? 0)}
          spark={sparkFollowers}
          icon={KpiIcons.users}
        />
        <KpiCard
          label="Alcance"
          value={fmt(lastIg?.reach ?? 0)}
          spark={sparkReach}
          icon={KpiIcons.reach}
        />
        <KpiCard
          label="Engajamento médio"
          value={`${avgEng.toFixed(2)}%`}
          icon={KpiIcons.heart}
        />
        <KpiCard
          label="Posts no período"
          value={fmt(posts.length)}
          hint="topo de engajamento"
          icon={KpiIcons.leads}
        />
      </section>

      <div className="section-title">
        <h2>Alcance diário</h2>
        <span className="hint">Contas alcançadas · 30d</span>
      </div>
      <TrendChart
        data={ig as unknown as Array<Record<string, string | number>>}
        xKey="date"
        title="Alcance Instagram"
        subtitle="Tendência diária"
        lines={[{ key: 'reach', label: 'Alcance', color: '#ead32d' }]}
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
                <td>
                  <span className="badge">{p.media_type}</span>
                </td>
                <td className="num">{fmt(p.reach)}</td>
                <td className="num">{fmt(p.likes)}</td>
                <td className="num">{fmt(p.saves)}</td>
                <td className="num">{(p.engagement_rate * 100).toFixed(1)}%</td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
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
