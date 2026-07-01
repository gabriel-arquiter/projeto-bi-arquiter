import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { TrendChart } from '@/components/charts/trend-chart';
import { getInstagramMetrics, getInstagramPosts } from '@/lib/queries';
import { resolvePeriod, type PageSearchParams } from '@/lib/period';

export const dynamic = 'force-dynamic';
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));
const pct = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : undefined);
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

const FORMAT_LABEL: Record<string, string> = {
  REELS: 'Reels',
  VIDEO: 'Vídeo',
  CAROUSEL_ALBUM: 'Carrossel',
  IMAGE: 'Foto',
};

type CaptionPost = { caption: string | null; engagement_rate: number | null };
type CaptionBucket = { rotulo: string; n: number; eng: number };

// Heurística: classifica as legendas por características (tamanho, CTA, pergunta)
// e compara o engajamento médio de cada grupo. Tudo determinístico, sem IA.
function analyzeCaptions(posts: CaptionPost[]) {
  const withCaption = posts.filter((p) => (p.caption ?? '').trim().length > 0);
  const engPct = (p: CaptionPost) => (p.engagement_rate ?? 0) * 100;
  const avg = (arr: CaptionPost[]) =>
    arr.length ? arr.reduce((s, p) => s + engPct(p), 0) / arr.length : 0;
  const bucket = (rotulo: string, arr: CaptionPost[]): CaptionBucket => ({
    rotulo,
    n: arr.length,
    eng: avg(arr),
  });

  const len = (c: string | null) => (c ?? '').length;
  const ctaRe = /(salv|comenta|comente|coment[áa]|marc|compartilh|link na bio|arrast|clica|clique|envia|manda)/i;
  const hasCta = (c: string | null) => ctaRe.test(c ?? '');
  const hasQ = (c: string | null) => (c ?? '').includes('?');

  return {
    total: withCaption.length,
    grupos: [
      {
        titulo: 'Por tamanho da legenda',
        buckets: [
          bucket('Curta (<100)', withCaption.filter((p) => len(p.caption) < 100)),
          bucket(
            'Média (100–300)',
            withCaption.filter((p) => len(p.caption) >= 100 && len(p.caption) <= 300),
          ),
          bucket('Longa (>300)', withCaption.filter((p) => len(p.caption) > 300)),
        ].filter((b) => b.n > 0),
      },
      {
        titulo: 'Chamada para ação (CTA)',
        buckets: [
          bucket('Com CTA', withCaption.filter((p) => hasCta(p.caption))),
          bucket('Sem CTA', withCaption.filter((p) => !hasCta(p.caption))),
        ].filter((b) => b.n > 0),
      },
      {
        titulo: 'Pergunta na legenda',
        buckets: [
          bucket('Com pergunta', withCaption.filter((p) => hasQ(p.caption))),
          bucket('Sem pergunta', withCaption.filter((p) => !hasQ(p.caption))),
        ].filter((b) => b.n > 0),
      },
    ],
  };
}

// Grid de cartões com grupos de buckets (rótulo · n · engajamento), destacando o melhor.
function BucketGrid({ grupos }: { grupos: { titulo: string; buckets: CaptionBucket[] }[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 14,
      }}
    >
      {grupos.map((grupo) => {
        const best = grupo.buckets.reduce<CaptionBucket | undefined>(
          (m, b) => (b.eng > (m?.eng ?? -1) ? b : m),
          undefined,
        );
        return (
          <div key={grupo.titulo} className="surface" style={{ padding: '16px 18px' }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: 14,
              }}
            >
              {grupo.titulo}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {grupo.buckets.map((b) => {
                const win = grupo.buckets.length > 1 && b === best;
                return (
                  <div
                    key={b.rotulo}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12.5,
                        color: win ? 'var(--color-secondary)' : 'var(--text)',
                        fontWeight: win ? 600 : 400,
                      }}
                    >
                      {b.rotulo}
                      <span style={{ color: 'var(--text-subtle)', fontSize: 11, marginLeft: 6 }}>
                        ({b.n})
                      </span>
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        color: win ? 'var(--color-secondary)' : 'var(--text-muted)',
                        fontWeight: win ? 700 : 500,
                      }}
                    >
                      {b.eng.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
  const legendas = analyzeCaptions(posts);

  // Qualidade do conteúdo: taxas por alcance dos posts
  const postsReach = sum(posts.map((p) => p.reach ?? 0));
  const saveRate = postsReach ? (savesTotal / postsReach) * 100 : 0;
  const commentRate = postsReach ? (commentsTotal / postsReach) * 100 : 0;
  const reachPerPost = posts.length ? postsReach / posts.length : 0;

  // Melhor dia/horário pra postar (horário de Brasília, UTC-3)
  const brt = (iso: string) => new Date(new Date(iso).getTime() - 3 * 3600 * 1000);
  const engOf = (p: (typeof posts)[number]) => (p.engagement_rate ?? 0) * 100;
  const avgEngOf = (ps: typeof posts) =>
    ps.length ? sum(ps.map(engOf)) / ps.length : 0;
  const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const porDia = WEEKDAYS.map((rotulo, i) => {
    const ps = posts.filter((p) => brt(p.published_at).getUTCDay() === i);
    return { rotulo, n: ps.length, eng: avgEngOf(ps) };
  }).filter((d) => d.n > 0);
  const PERIODOS = [
    { rotulo: 'Manhã (6–12h)', test: (h: number) => h >= 6 && h < 12 },
    { rotulo: 'Tarde (12–18h)', test: (h: number) => h >= 12 && h < 18 },
    { rotulo: 'Noite (18–24h)', test: (h: number) => h >= 18 },
    { rotulo: 'Madrugada (0–6h)', test: (h: number) => h < 6 },
  ];
  const porHorario = PERIODOS.map((per) => {
    const ps = posts.filter((p) => per.test(brt(p.published_at).getUTCHours()));
    return { rotulo: per.rotulo, n: ps.length, eng: avgEngOf(ps) };
  }).filter((d) => d.n > 0);
  const horarioGrupos = [
    { titulo: 'Por dia da semana', buckets: porDia },
    { titulo: 'Por período do dia', buckets: porHorario },
  ].filter((g) => g.buckets.length > 0);

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
        <h2>Alcance diário</h2>
        <span className="hint">Contas alcançadas · {period.days}d</span>
      </div>
      <TrendChart
        data={series}
        xKey="date"
        title="Alcance"
        subtitle="Tendência diária"
        lines={[{ key: 'reach', label: 'Alcance', color: '#ead32d' }]}
      />

      <div className="section-title">
        <h2>Interações no período</h2>
        <span className="hint">Soma dos posts publicados</span>
      </div>
      <section className="kpi-grid-3">
        <KpiCard label="Curtidas" value={fmt(likesTotal)} icon={KpiIcons.heart} />
        <KpiCard label="Comentários" value={fmt(commentsTotal)} icon={KpiIcons.leads} />
        <KpiCard label="Salvamentos" value={fmt(savesTotal)} icon={KpiIcons.reach} />
      </section>

      <div className="section-title">
        <h2>Qualidade do conteúdo</h2>
        <span className="hint">Taxas sobre o alcance dos posts</span>
      </div>
      <section className="kpi-grid-3">
        <KpiCard
          label="Taxa de salvamento"
          value={`${saveRate.toFixed(2)}%`}
          hint="salvamentos / alcance"
          icon={KpiIcons.reach}
        />
        <KpiCard
          label="Taxa de comentário"
          value={`${commentRate.toFixed(2)}%`}
          hint="comentários / alcance"
          icon={KpiIcons.leads}
        />
        <KpiCard
          label="Alcance médio / post"
          value={fmt(reachPerPost)}
          hint="por publicação"
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
        <h2>Legendas que engajam</h2>
        <span className="hint">
          {legendas.total} posts com legenda · engaj. médio por característica
        </span>
      </div>
      {legendas.total === 0 ? (
        <p className="empty-state">Sem legendas no período para analisar.</p>
      ) : (
        <BucketGrid grupos={legendas.grupos} />
      )}

      <div className="section-title">
        <h2>Melhor dia / horário pra postar</h2>
        <span className="hint">Engaj. médio por quando você publica · horário de Brasília</span>
      </div>
      {horarioGrupos.length === 0 ? (
        <p className="empty-state">Sem posts no período para analisar.</p>
      ) : (
        <BucketGrid grupos={horarioGrupos} />
      )}

      <div className="section-title">
        <h2>Top posts</h2>
        <span className="hint">Maior taxa de engajamento</span>
      </div>
      {topPosts.length === 0 ? (
        <p className="empty-state">
          Sem posts no período. Assim que o pipeline de posts rodar, eles aparecem aqui.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 14,
          }}
        >
          {topPosts.map((p) => (
            <div
              key={p.post_id}
              className="surface surface-hover"
              style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}
            >
              {/* Capa do post */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '4 / 5',
                  background: 'var(--surface-2)',
                }}
              >
                {(p.thumbnail_url || p.media_url) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.thumbnail_url || p.media_url || ''}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
                <span
                  className="badge"
                  style={{ position: 'absolute', top: 8, left: 8, backdropFilter: 'blur(4px)' }}
                >
                  {FORMAT_LABEL[p.media_type] ?? p.media_type}
                </span>
              </div>

              {/* Corpo */}
              <div
                style={{
                  padding: '12px 14px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--text-muted)',
                    }}
                  >
                    {shortDate(p.published_at)}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--color-secondary)',
                    }}
                  >
                    {((p.engagement_rate ?? 0) * 100).toFixed(1)}%
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 12.5,
                    lineHeight: 1.35,
                    color: 'var(--text)',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: 34,
                  }}
                >
                  {p.caption?.replace(/\s+/g, ' ').trim() || 'Sem legenda'}
                </p>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  {(
                    [
                      ['Alcance', fmt(p.reach ?? 0)],
                      ['Curtidas', fmt(p.likes ?? 0)],
                      ['Coment.', fmt(p.comments ?? 0)],
                      ['Saves', fmt(p.saves ?? 0)],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 16,
                          color: 'var(--text)',
                          fontWeight: 700,
                        }}
                      >
                        {value}
                      </span>
                      <span
                        style={{
                          fontSize: 10.5,
                          color: 'var(--text-subtle)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {p.permalink && (
                  <a
                    href={p.permalink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--color-secondary)', fontSize: 12, marginTop: 'auto' }}
                  >
                    Ver no Instagram ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
