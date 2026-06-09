import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { getCrmPipelines, getLossReasons, getCrmNurturing } from '@/lib/queries';
import type { PipelineStage } from '@/types/database';

export const dynamic = 'force-dynamic';

const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));

function byPipeline(rows: PipelineStage[]) {
  const map = new Map<string, PipelineStage[]>();
  for (const r of rows) {
    const arr = map.get(r.pipeline) ?? [];
    arr.push(r);
    map.set(r.pipeline, arr);
  }
  for (const arr of map.values()) arr.sort((a, b) => a.ordem - b.ordem);
  return map;
}

// O estágio "ganho" é sempre o último (maior ordem) de cada pipeline — o nome varia
// (Ganho / Fechado) conforme a pipeline.
const wonStage = (stages: PipelineStage[]) => stages[stages.length - 1];

export default async function FunisPage() {
  const [pipelines, losses, nurturing] = await Promise.all([
    getCrmPipelines().catch(() => []),
    getLossReasons().catch(() => []),
    getCrmNurturing().catch(() => []),
  ]);

  const grouped = byPipeline(pipelines);

  // KPIs consolidados
  let topo = 0;
  let ganhos = 0;
  let valorGanho = 0;
  let pipelineAberto = 0;
  for (const stages of grouped.values()) {
    const won = wonStage(stages);
    topo += stages[0]?.oportunidades ?? 0;
    ganhos += won?.oportunidades ?? 0;
    valorGanho += won?.valor ?? 0;
    pipelineAberto += stages.filter((s) => s !== won).reduce((sum, s) => sum + s.valor, 0);
  }
  const winRate = topo ? (ganhos / topo) * 100 : 0;
  const ticketMedio = ganhos ? valorGanho / ganhos : 0;

  const totalPerdas = losses.reduce((s, l) => s + l.quantidade, 0);
  const totalNutridos = nurturing.reduce((s, n) => s + n.nutridos, 0);
  const totalPerdidos = nurturing.reduce((s, n) => s + n.perdidos, 0);

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">CRM · Funnels</span>
          <h1>Funis de venda</h1>
          <p className="subtitle">
            As pipelines ativas — Comercial Inbound, Comercial Outbound, Vendas Afiliados,
            SEBRAE e Recontratação — por estágio, com win rate, nutrição e motivos de perda.
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> Pipeline ao vivo
        </span>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Oportunidades no topo"
          value={fmt(topo)}
          icon={KpiIcons.leads}
          hint="entradas nas pipelines"
        />
        <KpiCard
          label="Pipeline em aberto"
          value={brl(pipelineAberto)}
          icon={KpiIcons.money}
          hint="valor estimado por m²"
        />
        <KpiCard
          label="Win rate"
          value={`${winRate.toFixed(1)}%`}
          icon={KpiIcons.roas}
          hint="ganho / topo"
        />
        <KpiCard
          label="Ticket médio"
          value={brl(ticketMedio)}
          icon={KpiIcons.cac}
          hint="por contrato ganho"
        />
      </section>

      <div className="section-title">
        <h2>Pipelines por estágio</h2>
        <span className="hint">Volume e valor em cada etapa</span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 14,
        }}
      >
        {[...grouped.entries()].map(([pipeline, stages]) => {
          const topoStage = stages[0]?.oportunidades ?? 1;
          const won = wonStage(stages);
          const pwr = topoStage ? ((won?.oportunidades ?? 0) / topoStage) * 100 : 0;
          return (
            <div key={pipeline} className="surface" style={{ padding: '18px 20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 14,
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                  {pipeline}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-secondary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  win {pwr.toFixed(1)}%
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stages.map((s) => {
                  const w = topoStage ? Math.max(4, (s.oportunidades / topoStage) * 100) : 0;
                  const isWon = s === won;
                  return (
                    <div key={s.stage}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 11.5,
                          marginBottom: 4,
                          gap: 8,
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span style={{ color: isWon ? 'var(--color-secondary)' : undefined }}>
                          {s.stage}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {fmt(s.oportunidades)} · {brl(s.valor)}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 3,
                          background: 'var(--surface-2)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${w}%`,
                            height: '100%',
                            borderRadius: 3,
                            background: isWon
                              ? 'var(--color-secondary)'
                              : 'rgba(234,211,45,0.35)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="ai-synthesis" style={{ marginTop: 20 }}>
        <span className="label">◈ Como o valor é estimado</span>
        <p>
          Nos estágios iniciais (Novo Lead, Qualificação, Em Prospecção…) ainda não há
          proposta — o valor é <strong>inferido pela metragem do projeto</strong>, a
          R$ 100/m², respeitando o <strong>mínimo de aceite de R$ 3.500</strong> (≈ 35 m²).
          Quando a proposta é enviada, o valor real substitui a estimativa.
        </p>
      </div>

      <div className="section-title">
        <h2>Nutrição</h2>
        <span className="hint">Perdidos roteados para a pipeline de Nutrição</span>
      </div>
      <section className="kpi-grid-3">
        <KpiCard
          label="Total perdidos"
          value={fmt(totalPerdidos)}
          icon={KpiIcons.users}
          hint="todas as pipelines"
        />
        <KpiCard
          label="Enviados p/ Nutrição"
          value={fmt(totalNutridos)}
          icon={KpiIcons.leads}
          hint={
            totalPerdidos ? `${((totalNutridos / totalPerdidos) * 100).toFixed(0)}% dos perdidos` : '—'
          }
        />
        <KpiCard
          label="Nutridos via tags"
          value={fmt(totalNutridos)}
          icon={KpiIcons.heart}
          hint="reativação por conteúdo"
        />
      </section>
      <div className="surface table-wrap scroll-x" style={{ marginTop: 14 }}>
        <table>
          <thead>
            <tr>
              <th>Pipeline de origem</th>
              <th style={{ textAlign: 'right' }}>Perdidos</th>
              <th style={{ textAlign: 'right' }}>→ Nutrição</th>
              <th style={{ textAlign: 'right' }}>% roteado</th>
            </tr>
          </thead>
          <tbody>
            {nurturing.map((n) => (
              <tr key={n.pipeline}>
                <td style={{ fontWeight: 600 }}>{n.pipeline}</td>
                <td className="num" style={{ textAlign: 'right' }}>
                  {fmt(n.perdidos)}
                </td>
                <td className="num" style={{ textAlign: 'right', color: 'var(--color-secondary)' }}>
                  {fmt(n.nutridos)}
                </td>
                <td className="num" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                  {n.perdidos ? ((n.nutridos / n.perdidos) * 100).toFixed(0) : '0'}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-title">
        <h2>Motivos de perda</h2>
        <span className="hint">{fmt(totalPerdas)} deals · campo do Funnels</span>
      </div>
      <div className="surface table-wrap scroll-x">
        <table>
          <thead>
            <tr>
              <th>Motivo principal</th>
              <th style={{ textAlign: 'right' }}>Deals</th>
              <th style={{ textAlign: 'right' }}>% do total</th>
              <th style={{ textAlign: 'right' }}>Valor perdido</th>
            </tr>
          </thead>
          <tbody>
            {losses.map((l) => (
              <tr key={l.motivo}>
                <td style={{ fontWeight: 600 }}>{l.motivo}</td>
                <td className="num" style={{ textAlign: 'right' }}>
                  {fmt(l.quantidade)}
                </td>
                <td className="num" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                  {totalPerdas ? ((l.quantidade / totalPerdas) * 100).toFixed(1) : '0.0'}%
                </td>
                <td className="num" style={{ textAlign: 'right', color: 'var(--negative)' }}>
                  {brl(l.valor_perdido)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pipelines.length === 0 && (
        <p className="empty-state" style={{ marginTop: 18 }}>
          Sem dados de pipeline ainda. Assim que os webhooks do Funnels populam
          fct_oportunidades, os funis aparecem automaticamente.
        </p>
      )}
    </div>
  );
}
