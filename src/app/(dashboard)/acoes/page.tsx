export const dynamic = 'force-dynamic';

type Priority = 'alta' | 'média' | 'baixa';
type Status = 'recomendada' | 'em andamento' | 'concluída';

interface Acao {
  titulo: string;
  area: string;
  prioridade: Priority;
  status: Status;
  contexto: string; // o sinal que disparou a ação (diagnóstico)
  recomendacao: string; // o que fazer (prescritivo)
  impacto: string; // impacto esperado
}

// Ações derivadas do nível prescritivo da ARIA: cada uma nasce de um sinal nos
// marts certificados (MMM, forecast, funil) e propõe um movimento concreto.
const acoes: Acao[] = [
  {
    titulo: 'Realocar verba de LinkedIn Ads para Google Search',
    area: 'Mídia paga',
    prioridade: 'alta',
    status: 'recomendada',
    contexto:
      'O MMM aponta LinkedIn Ads próximo da saturação (ROI marginal decrescente), enquanto o Google Search ainda tem ROI marginal maior.',
    recomendacao:
      'Mover ~R$ 8k/mês de LinkedIn para Google Search e reavaliar em 30 dias contra o CPL e a qualificação lead→MQL.',
    impacto: 'Projeção: +Y leads qualificados no mês seguinte ao mesmo budget total.',
  },
  {
    titulo: 'Publicar artigo de meio de funil sobre clínicas',
    area: 'Conteúdo / SEO',
    prioridade: 'alta',
    status: 'em andamento',
    contexto:
      'Padrões de GSC/GA4 de conteúdos similares indicam alto tráfego topo→fundo com boa conversão em lead no nicho de clínicas.',
    recomendacao:
      'Produzir 1 artigo de meio de funil com CTA→lead e link interno topo→fundo; instrumentar o evento generate_lead.',
    impacto: 'Forecast de funil: N leads qualificados no mês seguinte (intervalo A–B).',
  },
  {
    titulo: 'Reduzir CAC do Meta Ads na campanha de remarketing',
    area: 'Mídia paga',
    prioridade: 'média',
    status: 'recomendada',
    contexto:
      'O CAC consolidado subiu MoM; o cruzamento mídia × CRM mostra o remarketing do Meta acima do limite definido.',
    recomendacao:
      'Revisar criativos e audiências do remarketing; ativar conversões offline (ganhos do CRM) via CAPI para otimizar por valor real.',
    impacto: 'Meta: trazer o CAC do canal de volta abaixo do teto e melhorar o ROAS.',
  },
  {
    titulo: 'Investigar churn do Produto 2 (SaaS)',
    area: 'Produto / Receita',
    prioridade: 'média',
    status: 'recomendada',
    contexto:
      'A leitura de MRR sinaliza expansão sólida, mas o churn de início de ciclo merece diagnóstico de ativação.',
    recomendacao:
      'Cruzar uso de features × churn nos primeiros 30 dias; mapear o gargalo de ativação e priorizar onboarding.',
    impacto: 'Reduzir churn early-stage e proteger o MRR recorrente.',
  },
  {
    titulo: 'Acelerar recebíveis em aberto',
    area: 'Financeiro',
    prioridade: 'baixa',
    status: 'recomendada',
    contexto:
      'O Cash Flow mostra contas a receber em patamar elevado frente ao saldo de caixa do mês.',
    recomendacao:
      'Acionar régua de cobrança nos recebíveis vencidos e revisar prazos de pagamento dos novos contratos.',
    impacto: 'Melhorar o fluxo de caixa líquido e estender o runway.',
  },
];

const priorityTone: Record<Priority, { bg: string; color: string; border: string }> = {
  alta: { bg: 'rgba(255,77,79,0.12)', color: '#ff7a73', border: 'rgba(255,77,79,0.4)' },
  média: { bg: 'rgba(234,211,45,0.1)', color: '#ead32d', border: 'rgba(234,211,45,0.35)' },
  baixa: { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: 'var(--line-strong)' },
};

const statusTone: Record<Status, string> = {
  recomendada: 'var(--info)',
  'em andamento': 'var(--color-secondary)',
  concluída: 'var(--positive)',
};

export default function AcoesPage() {
  const porPrioridade = (p: Priority) => acoes.filter((a) => a.prioridade === p).length;

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Inteligência · Prescritivo</span>
          <h1>Ações</h1>
          <p className="subtitle">
            Movimentos recomendados pela ARIA a partir dos sinais dos marts certificados —
            cada ação parte de um diagnóstico e propõe o próximo passo concreto.
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> {acoes.length} ações ativas
        </span>
      </header>

      <section className="kpi-grid-3" style={{ marginBottom: 8 }}>
        <div className="surface kpi">
          <p className="kpi-label">Prioridade alta</p>
          <p className="kpi-value" style={{ color: '#ff7a73' }}>{porPrioridade('alta')}</p>
          <span className="kpi-hint">requerem ação imediata</span>
        </div>
        <div className="surface kpi">
          <p className="kpi-label">Prioridade média</p>
          <p className="kpi-value" style={{ color: 'var(--color-secondary)' }}>
            {porPrioridade('média')}
          </p>
          <span className="kpi-hint">no ciclo atual</span>
        </div>
        <div className="surface kpi">
          <p className="kpi-label">Em andamento</p>
          <p className="kpi-value" style={{ color: 'var(--positive)' }}>
            {acoes.filter((a) => a.status === 'em andamento').length}
          </p>
          <span className="kpi-hint">já em execução</span>
        </div>
      </section>

      <div className="section-title">
        <h2>Plano de ação</h2>
        <span className="hint">Ordenado por prioridade</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {acoes.map((a) => {
          const tone = priorityTone[a.prioridade];
          return (
            <div
              key={a.titulo}
              className="surface surface-hover"
              style={{ padding: '18px 20px' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-badge)',
                        background: tone.bg,
                        color: tone.color,
                        border: `1px solid ${tone.border}`,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {a.prioridade}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: 'var(--text-subtle)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {a.area}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
                    {a.titulo}
                  </p>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: statusTone[a.status],
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: statusTone[a.status],
                    }}
                  />
                  {a.status}
                </span>
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: 10,
                  borderTop: '1px solid var(--line)',
                  paddingTop: 14,
                }}
              >
                <ActionLine label="Sinal" text={a.contexto} />
                <ActionLine label="Recomendação" text={a.recomendacao} accent />
                <ActionLine label="Impacto esperado" text={a.impacto} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="ai-synthesis" style={{ marginTop: 24 }}>
        <span className="label">◈ Como a ARIA gera estas ações</span>
        <p>
          Cada ação parte de um número de mart certificado (MMM, forecast, funil ou
          financeiro), nunca de achismo do modelo. A ARIA encadeia diagnóstico →
          recomendação → impacto projetado, sempre com fonte e intervalo. Conforme o
          histórico cresce, as recomendações ganham precisão e os intervalos estreitam.
        </p>
      </div>
    </div>
  );
}

function ActionLine({ label, text, accent }: { label: string; text: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
      <span
        style={{
          flexShrink: 0,
          width: 130,
          fontSize: 9.5,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-subtle)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13.5,
          lineHeight: 1.6,
          color: accent ? 'var(--text)' : 'var(--text-muted)',
          fontWeight: accent ? 500 : 400,
        }}
      >
        {text}
      </span>
    </div>
  );
}
