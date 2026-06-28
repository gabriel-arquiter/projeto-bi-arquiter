import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { TrendChart } from '@/components/charts/trend-chart';
import { getInstagramMetrics, getInstagramPosts } from '@/lib/queries';
import { resolvePeriod, type PageSearchParams } from '@/lib/period';

export const dynamic = 'force-dynamic';
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));
const pct = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : undefined);
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

const FORMAT_LABEL: Record<string, string> = {
  REELS: 'Reels',
  VIDEO: 'Vídeo',
  CAROUSEL_ALBUM: 'Carrossel',
  IMAGE: 'Foto',
};

export default async function InstagramPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const period = resolvePeriod(searchParams);
  const [ig, igPrev, posts] = await Promise.all([
    getInstagramMetrics(period.range).catch(() => []),
    period.compare ? getInstagramMetrics(period.prevRange).catch(() => []) : Promise.resolve([]),
    getInstagramPosts(period.range).catch(() => []),
  ]);

  const firstIg = ig.at(0);
  const lastIg = ig.at(-1);

  // Seguidores: total atual + crescimento no período
  const followersNow = lastIg?.followers ?? 0;
  const followersStart = firstIg?.followers ?? 0;
  const followersGain = followersNow - followersStart;

  // Alcance e views totais no período
  const reachTotal = sum(ig.map((d) => d.reach ?? 0));
  const reachPrev = sum(igPrev.map((d) => d.reach ?? 0));
  const viewsTotal = sum(ig.map((d) => d.views ?? 0));

  // Engajamento médio: interações/alcance (cai pra média dos posts se faltar métrica)
  const interactionsTotal = sum(ig.map((d) => d.total_interactions ?? 0));
  const engFromMetrics = reachTotal ? (interactionsTotal / reachTotal) * 100 : 0;
  const engFromPosts = posts.length
    ? (sum(posts.map((p) => p.engagement_rate ?? 0)) / posts.length) * 100
    : 0;
  const avgEng = engFromMetrics || engFromPosts;

  // Interações dos posts no período
  const likesTotal = sum(posts.map((p) => p.likes ?? 0));
  const commentsTotal = sum(posts.map((p) => p.comments ?? 0));
  const savesTotal = sum(posts.map((p) => p.saves ?? 0));

  const sparkFollowers = ig.slice(-14).map((d) => d.followers ?? 0);
  const sparkReach = ig.slice(-14).map((d) => d.reach ?? 0);

  // Série limpa pros gráficos (nulls viram 0)
  const series = ig.map((d) => ({
    date: d.date,
    reach: d.reach ?? 0,
    views: d.views ?? 0,
    followers: d.followers ?? 0,
  }));

  // Performance por formato de post
  const fmtMap = new Map<string, { tipo: string; posts: number; reach: number; engSum: number }>();
  for (const p of posts) {
    const key = p.media_type ?? '—';
    const e = fmtMap.get(key) ?? { tipo: key, posts: 0, reach: 0, engSum: 0 };
    e.posts += 1;
    e.reach += p.reach ?? 0;
    e.engSum += (p.engagement_rate ?? 0) * 100;
    fmtMap.set(key, e);
  }
  const formatos = [...fmtMap.values()]
    .map((f) => ({ ...f, engMedio: f.posts ? f.engSum / f.posts : 0 }))
    .sort((a, b) => b.reach - a.reach);

  const topPosts = posts.slice(0, 6);

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Social analytics</span>
          <h1>Instagram</h1>
          <p className="subtitle">
            Alcance, crescimento de seguidores, engajamento e performance dos posts.
          </p>
        </div>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Seguidores"
          value={fmt(followersNow)}
          delta={pct(followersNow, followersStart)}
          spark={sparkFollowers}
          hint={`${followersGain >= 0 ? '+' : ''}${fmt(followersGain)} no período`}
          icon={KpiIcons.users}
        />
        <KpiCard
          label="Alcance"
          value={fmt(reachTotal)}
          delta={period.compare ? pct(reachTotal, reachPrev) : undefined}
          spark={sparkReach}
          hint="total no período"
          icon={KpiIcons.reach}
        />
        <KpiCard
          label="Engajamento médio"
          value={`${avgEng.toFixed(2)}%`}
          hint="interações / alcance"
          icon={KpiIcons.heart}
        />
        <KpiCard
          label="Posts no período"
          value={fmt(posts.length)}
          hint="publicações"
          icon={KpiIcons.leads}
        />
      </section>

      <div className="section-title">
        <h2>Crescimento de seguidores</h2>
        <span className="hint">{period.days}d</span>
      </div>
      <TrendChart
        data={series}
        xKey="date"
        title="Seguidores"
        subtitle="Evolução no período"
        lines={[{ key: 'followers', label: 'Seguidores', color: '#ead32d' }]}
      />

      <div className="section-title">
        <h2>Alcance × Views</h2>
        <span className="hint">Contas alcançadas e visualizações · {period.days}d</span>
      </div>
      <TrendChart
        data={series}
        xKey="date"
        title="Alcance e views"
        subtitle="Tendência diária"
        lines={[
          { key: 'reach', label: 'Alcance', color: '#ead32d' },
          { key: 'views', label: 'Views', color: '#4a90d9' },
        ]}
      />

      <div className="section-title">
        <h2>Interações no período</h2>
        <span className="hint">Soma dos posts publicados</span>
      </div>
      <section className="kpi-grid">
        <KpiCard label="Curtidas" value={fmt(likesTotal)} icon={KpiIcons.heart} />
        <KpiCard label="Comentários" value={fmt(commentsTotal)} icon={KpiIcons.leads} />
        <KpiCard label="Salvamentos" value={fmt(savesTotal)} icon={KpiIcons.reach} />
        <KpiCard
          label="Views totais"
          value={fmt(viewsTotal)}
          hint="conteúdo"
          icon={KpiIcons.sessions}
        />
      </section>

      <div className="section-title">
        <h2>Performance por formato</h2>
        <span className="hint">Alcance e engajamento por tipo de post</span>
      </div>
      <div className="surface table-wrap scroll-x">
        <table>
          <thead>
            <tr>
              <th>Formato</th>
              <th>Posts</th>
              <th>Alcance</th>
              <th>Engaj. médio</th>
            </tr>
          </thead>
          <tbody>
            {formatos.map((f) => (
              <tr key={f.tipo}>
                <td>
                  <span className="badge">{FORMAT_LABEL[f.tipo] ?? f.tipo}</span>
                </td>
                <td className="num">{fmt(f.posts)}</td>
                <td className="num">{fmt(f.reach)}</td>
                <td className="num">{f.engMedio.toFixed(1)}%</td>
              </tr>
            ))}
            {formatos.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Sem posts no período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="section-title">
        <h2>Top posts</h2>
        <span className="hint">Maior taxa de engajamento</span>
      </div>
      <div className="surface table-wrap scroll-x">
        <table>
          <thead>
            <tr>
              <th>Formato</th>
              <th>Alcance</th>
              <th>Curtidas</th>
              <th>Coment.</th>
              <th>Saves</th>
              <th>Engaj.</th>
            </tr>
          </thead>
          <tbody>
            {topPosts.map((p) => (
              <tr key={p.post_id}>
                <td>
                  <span className="badge">{FORMAT_LABEL[p.media_type] ?? p.media_type}</span>
                </td>
                <td className="num">{fmt(p.reach ?? 0)}</td>
                <td className="num">{fmt(p.likes ?? 0)}</td>
                <td className="num">{fmt(p.comments ?? 0)}</td>
                <td className="num">{fmt(p.saves ?? 0)}</td>
                <td className="num">{((p.engagement_rate ?? 0) * 100).toFixed(1)}%</td>
              </tr>
            ))}
            {topPosts.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Sem posts no período. Assim que o pipeline de posts rodar, eles aparecem aqui.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
