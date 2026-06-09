// Mock data determinístico para preview do dashboard.
// Ativado quando NEXT_PUBLIC_USE_MOCK=1 — ver lib/queries.ts.
import type {
  MonthlyOverview,
  Ga4Metric,
  SearchConsoleMetric,
  SearchConsoleKeyword,
  InstagramMetric,
  InstagramPost,
  PinterestMetric,
  AdsMetric,
  DreMonth,
  CashFlowMonth,
  FinanceForecastMonth,
  PipelineStage,
  LossReason,
  CrmSegment,
  AttributionChannel,
  PipelineNurturing,
  ProjectionPoint,
} from '@/types/database';

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

// PRNG determinístico (mulberry32) para os números não dançarem entre renders.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function daysAgo(n: number) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

// Curva suave com leve sazonalidade semanal + ruído determinístico.
function wave(
  i: number,
  base: number,
  amp: number,
  rand: () => number,
  weeklyBoost = 0.15,
) {
  const weekly = Math.sin((i / 7) * Math.PI * 2) * weeklyBoost;
  const trend = Math.sin((i / 30) * Math.PI) * 0.2;
  const noise = (rand() - 0.5) * 0.18;
  return Math.max(0, base * (1 + weekly + trend + noise) + amp * (rand() - 0.5));
}

// ───────────────────────────── Monthly overview ─────────────────────────────
export function mockMonthlyOverview(): MonthlyOverview[] {
  const rand = rng(101);
  const months = 6;
  const out: MonthlyOverview[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - i);
    const growth = 1 + (months - i) * 0.08;
    out.push({
      month: isoDate(d),
      sessions: Math.round(18_400 * growth * (0.9 + rand() * 0.2)),
      users: Math.round(13_100 * growth * (0.9 + rand() * 0.2)),
      bounce_rate: 0.42 - i * 0.012 + (rand() - 0.5) * 0.03,
      meta_spend: 8_400 * growth * (0.92 + rand() * 0.16),
      meta_leads: Math.round(186 * growth * (0.9 + rand() * 0.2)),
      meta_roas: 3.1 + rand() * 1.4,
      google_spend: 6_900 * growth * (0.92 + rand() * 0.16),
      google_leads: Math.round(142 * growth * (0.9 + rand() * 0.2)),
      google_roas: 4.2 + rand() * 1.6,
    });
  }
  return out;
}

// ───────────────────────────── GA4 diário ─────────────────────────────
export function mockGa4Daily(days = 30): Ga4Metric[] {
  const rand = rng(202);
  const out: Ga4Metric[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const sessions = Math.round(wave(days - i, 720, 90, rand, 0.22));
    const users = Math.round(sessions * (0.7 + rand() * 0.05));
    const organic = Math.round(sessions * (0.46 + rand() * 0.06));
    const paid = Math.round(sessions * (0.34 + rand() * 0.06));
    const social = Math.round(sessions * (0.12 + rand() * 0.04));
    out.push({
      date: isoDate(daysAgo(i)),
      sessions,
      users,
      bounce_rate: 0.41 + (rand() - 0.5) * 0.06,
      avg_session_duration: 92 + rand() * 48,
      organic_sessions: organic,
      paid_sessions: paid,
      social_sessions: social,
    });
  }
  return out;
}

// ───────────────────────────── Search Console ─────────────────────────────
export function mockSearchConsoleDaily(days = 30): SearchConsoleMetric[] {
  const rand = rng(303);
  const out: SearchConsoleMetric[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const impressions = Math.round(wave(days - i, 8_200, 700, rand, 0.18));
    const ctr = 0.034 + (rand() - 0.5) * 0.012;
    out.push({
      date: isoDate(daysAgo(i)),
      clicks: Math.round(impressions * ctr),
      impressions,
      ctr,
      avg_position: 12.4 + (rand() - 0.5) * 2.6,
    });
  }
  return out;
}

export function mockTopKeywords(limit = 10): SearchConsoleKeyword[] {
  const rand = rng(404);
  const kws = [
    'arquitetura residencial sp',
    'projeto arquitetônico clínica odontológica',
    'reforma comercial são paulo',
    'projeto retrofit pequeno escritório',
    'consultoria interiores corporativo',
    'arquiteto restaurante café',
    'design de interiores consultório',
    'projeto arquitetura clínica estética',
    'planta humanizada apartamento',
    'projeto fachada loja',
    'arquitetura para coworking',
    'reforma showroom imobiliária',
  ];
  return kws.slice(0, limit).map((keyword, i) => {
    const impressions = Math.round(2_200 / (i * 0.35 + 1) * (0.85 + rand() * 0.3));
    const ctr = 0.04 + rand() * 0.05;
    return {
      period: 'last_30d',
      keyword,
      clicks: Math.round(impressions * ctr),
      impressions,
      ctr,
      avg_position: 4 + i * 1.6 + (rand() - 0.5) * 2,
    };
  });
}

// ───────────────────────────── Instagram ─────────────────────────────
export function mockInstagramMetrics(days = 30): InstagramMetric[] {
  const rand = rng(505);
  const baseFollowers = 14_320;
  const out: InstagramMetric[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayIdx = days - i;
    out.push({
      date: isoDate(daysAgo(i)),
      followers: baseFollowers + dayIdx * 12 + Math.round(rand() * 8),
      reach: Math.round(wave(dayIdx, 4_200, 600, rand, 0.28)),
      engagement_rate: 0.054 + (rand() - 0.5) * 0.018,
    });
  }
  return out;
}

export function mockTopInstagramPosts(limit = 6): InstagramPost[] {
  const rand = rng(606);
  const types = ['Reel', 'Carrossel', 'Foto', 'Reel', 'Carrossel', 'Foto'];
  return types.slice(0, limit).map((t, i) => {
    const reach = Math.round(7_400 / (i * 0.18 + 1) * (0.85 + rand() * 0.3));
    const likes = Math.round(reach * (0.07 + rand() * 0.03));
    const saves = Math.round(likes * (0.18 + rand() * 0.08));
    return {
      id: `ig-post-${i + 1}`,
      posted_at: isoDate(daysAgo(i * 3 + 1)),
      reach,
      likes,
      saves,
      engagement_rate: (likes + saves) / Math.max(1, reach),
      media_type: t,
    };
  });
}

// ───────────────────────────── Pinterest ─────────────────────────────
export function mockPinterestMetrics(days = 30): PinterestMetric[] {
  const rand = rng(707);
  const out: PinterestMetric[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayIdx = days - i;
    const impressions = Math.round(wave(dayIdx, 2_400, 320, rand, 0.2));
    out.push({
      date: isoDate(daysAgo(i)),
      impressions,
      saves: Math.round(impressions * (0.022 + rand() * 0.014)),
      outbound_clicks: Math.round(impressions * (0.011 + rand() * 0.006)),
    });
  }
  return out;
}

// ───────────────────────────── Ads ─────────────────────────────
const metaCampaigns = [
  'Tráfego — Clínicas SP',
  'Conversão — Residencial Premium',
  'Remarketing — Site',
];
const googleCampaigns = [
  'Search — Arquitetura Comercial',
  'Performance Max — Reforma',
  'Search — Brand',
];

function mockAds(seed: number, days: number, campaigns: string[], cpl: number): AdsMetric[] {
  const rand = rng(seed);
  const out: AdsMetric[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = isoDate(daysAgo(i));
    for (const campaign of campaigns) {
      const spend = wave(days - i, 220, 60, rand, 0.18) * (0.7 + rand() * 0.7);
      const leadsRaw = spend / (cpl * (0.85 + rand() * 0.3));
      const leads = Math.max(0, Math.round(leadsRaw));
      const clicks = Math.round(leads / (0.06 + rand() * 0.04));
      const impressions = Math.round(clicks / (0.018 + rand() * 0.012));
      out.push({
        date: day,
        campaign,
        spend,
        impressions,
        clicks,
        leads,
        cpl: leads ? spend / leads : 0,
        roas: 3.4 + (rand() - 0.5) * 2.2,
      });
    }
  }
  return out;
}

export function mockMetaAds(days = 30): AdsMetric[] {
  return mockAds(808, days, metaCampaigns, 38);
}
export function mockGoogleAds(days = 30): AdsMetric[] {
  return mockAds(909, days, googleCampaigns, 44);
}

// ───────────────────────────── Financeiro (Conta Azul) ─────────────────────────────
// Modelo-base único: os três painéis (DRE, Cash Flow, Forecast) derivam daqui,
// garantindo que "receita" seja o mesmo número entre as telas (fonte única da verdade).

interface FinanceBase {
  month: string;
  receita_bruta: number;
  deducoes: number;
  receita_liquida: number;
  custos: number;
  lucro_bruto: number;
  despesas_marketing: number;
  despesas_pessoal: number;
  despesas_administrativas: number;
  despesas_operacionais: number;
  ebitda: number;
  resultado_liquido: number;
}

function financeBase(months = 6): FinanceBase[] {
  const rand = rng(1212);
  const out: FinanceBase[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - i);
    const growth = 1 + (months - 1 - i) * 0.055; // crescimento mês a mês
    const noise = 0.94 + rand() * 0.12;

    const receita_bruta = Math.round(148_000 * growth * noise);
    const deducoes = Math.round(receita_bruta * 0.0865); // Simples Nacional aprox.
    const receita_liquida = receita_bruta - deducoes;
    const custos = Math.round(receita_bruta * (0.205 + (rand() - 0.5) * 0.02));
    const lucro_bruto = receita_liquida - custos;

    const despesas_marketing = Math.round(receita_bruta * (0.16 + (rand() - 0.5) * 0.02));
    const despesas_pessoal = Math.round(receita_bruta * (0.285 + (rand() - 0.5) * 0.015));
    const despesas_administrativas = Math.round(receita_bruta * (0.075 + (rand() - 0.5) * 0.01));
    const despesas_operacionais =
      despesas_marketing + despesas_pessoal + despesas_administrativas;

    const ebitda = lucro_bruto - despesas_operacionais;
    const resultado_liquido = Math.round(ebitda - receita_bruta * 0.018); // dep. + financeiras

    out.push({
      month: isoDate(d),
      receita_bruta,
      deducoes,
      receita_liquida,
      custos,
      lucro_bruto,
      despesas_marketing,
      despesas_pessoal,
      despesas_administrativas,
      despesas_operacionais,
      ebitda,
      resultado_liquido,
    });
  }
  return out;
}

export function mockDre(months = 6): DreMonth[] {
  return financeBase(months).map((m) => ({
    month: m.month,
    receita_bruta: m.receita_bruta,
    deducoes: m.deducoes,
    receita_liquida: m.receita_liquida,
    custos: m.custos,
    lucro_bruto: m.lucro_bruto,
    despesas_marketing: m.despesas_marketing,
    despesas_pessoal: m.despesas_pessoal,
    despesas_administrativas: m.despesas_administrativas,
    despesas_operacionais: m.despesas_operacionais,
    ebitda: m.ebitda,
    resultado_liquido: m.resultado_liquido,
  }));
}

export function mockCashFlow(months = 6): CashFlowMonth[] {
  const base = financeBase(months);
  const rand = rng(1313);
  const out: CashFlowMonth[] = [];
  let saldo = 92_000; // saldo de caixa inicial
  for (let i = 0; i < base.length; i++) {
    const m = base[i];
    const prev = base[i - 1];
    // Regime de caixa: recebe parte do faturamento do mês + parte do mês anterior.
    const entradas = Math.round(
      m.receita_bruta * 0.62 + (prev ? prev.receita_bruta * 0.34 : m.receita_bruta * 0.3),
    );
    const saidas = Math.round(
      (m.custos + m.despesas_operacionais + m.deducoes) * (0.97 + rand() * 0.04),
    );
    const saldo_inicial = saldo;
    const saldo_final = saldo_inicial + entradas - saidas;
    saldo = saldo_final;
    out.push({
      month: m.month,
      saldo_inicial,
      entradas,
      saidas,
      saldo_final,
      a_receber: Math.round(m.receita_bruta * 0.41 * (0.9 + rand() * 0.2)),
      a_pagar: Math.round((m.custos + m.despesas_operacionais) * 0.22 * (0.9 + rand() * 0.2)),
    });
  }
  return out;
}

export function mockFinanceForecast(horizon = 6): FinanceForecastMonth[] {
  const base = financeBase(6);
  const out: FinanceForecastMonth[] = [];

  // Histórico real
  for (const m of base) {
    out.push({
      month: m.month,
      tipo: 'real',
      receita: m.receita_bruta,
      custos: m.custos + m.despesas_operacionais,
      resultado: m.resultado_liquido,
    });
  }

  // Projeção: tendência dos últimos meses + banda de confiança que alarga no tempo.
  const last = base[base.length - 1];
  const prev = base[base.length - 2] ?? base[base.length - 1];
  const growth = prev.receita_bruta ? last.receita_bruta / prev.receita_bruta : 1.05;
  const g = Math.min(1.09, Math.max(1.02, growth)); // ancorada entre 2% e 9% a.m.

  const custoRatio = (last.custos + last.despesas_operacionais) / last.receita_bruta;
  for (let k = 1; k <= horizon; k++) {
    const d = new Date(last.month);
    d.setUTCMonth(d.getUTCMonth() + k);
    const receita = Math.round(last.receita_bruta * Math.pow(g, k));
    const band = 0.05 + k * 0.025; // ±5% no 1º mês, alargando ~2,5pp/mês
    const custos = Math.round(receita * custoRatio);
    out.push({
      month: isoDate(d),
      tipo: 'previsto',
      receita,
      receita_low: Math.round(receita * (1 - band)),
      receita_high: Math.round(receita * (1 + band)),
      custos,
      resultado: Math.round(receita * 0.91 - custos),
    });
  }
  return out;
}

// ───────────────────────────── CRM (Funnels / GoHighLevel) ─────────────────────────────

// Regra de valor: projeto cobrado a R$100/m², com mínimo de aceite de R$3.500
// (equivalente a 35 m²). Em estágios iniciais não há valor fechado — ele é
// INFERIDO pela metragem média do lead, respeitando o piso de R$3.500.
const PISO_PROJETO = 3_500;
const VALOR_M2 = 100;
const inferirValor = (metragem: number) => Math.max(PISO_PROJETO, Math.round(metragem * VALOR_M2));

// Os 5 pipelines ativos no Funnels, com estágios próprios e metragem média do lead.
// conv = taxa de passagem entre estágios consecutivos.
const PIPELINES: Array<{
  nome: string;
  topo: number;
  metragem: number; // m² médio dos leads desta pipeline → base da inferência de valor
  stages: string[];
  conv: number[];
}> = [
  {
    nome: 'Comercial Inbound',
    topo: 340,
    metragem: 58,
    stages: ['Novo Lead', 'Qualificação Interna', 'SQL', 'Reunião', 'Proposta Enviada', 'Ganho'],
    conv: [0.6, 0.52, 0.66, 0.58, 0.5],
  },
  {
    nome: 'Comercial Outbound',
    topo: 520,
    metragem: 72,
    stages: [
      'Em Prospecção',
      'Relacionamento',
      'Follow-Up',
      'Qualificado',
      'Reunião Agendada',
      'Envio de Proposta',
      'Ganho',
    ],
    conv: [0.55, 0.6, 0.45, 0.62, 0.6, 0.48],
  },
  {
    nome: 'Vendas Afiliados',
    topo: 210,
    metragem: 44,
    stages: ['Lead Cadastrado', 'Relacionamento', 'Proposta Enviada', 'Fechado'],
    conv: [0.58, 0.5, 0.46],
  },
  {
    nome: 'SEBRAE',
    topo: 96,
    metragem: 38,
    stages: ['Indicação SEBRAE', 'Qualificação', 'Proposta Enviada', 'Ganho'],
    conv: [0.64, 0.55, 0.5],
  },
  {
    nome: 'Recontratação',
    topo: 72,
    metragem: 95,
    stages: ['Retorno Identificado', 'Qualificação Rápida', 'Proposta Enviada', 'Ganho'],
    conv: [0.8, 0.72, 0.68],
  },
];

export function mockCrmPipelines(): PipelineStage[] {
  const rand = rng(1414);
  const out: PipelineStage[] = [];
  for (const p of PIPELINES) {
    const ticket = inferirValor(p.metragem);
    let count = p.topo;
    for (let s = 0; s < p.stages.length; s++) {
      const oportunidades = Math.round(count * (0.95 + rand() * 0.1));
      // Estágios abertos somam pipeline (valor inferido por metragem);
      // o último estágio (Ganho/Fechado) representa receita contratada.
      const valor = Math.round(oportunidades * ticket * (0.92 + rand() * 0.16));
      out.push({ pipeline: p.nome, stage: p.stages[s], ordem: s, oportunidades, valor });
      if (s < p.conv.length) count = count * p.conv[s];
    }
  }
  return out;
}

// Perdidos por pipeline e quantos vão para a pipeline de Nutrição (nutridos via tags).
export function mockCrmNurturing(): PipelineNurturing[] {
  const rand = rng(1818);
  // % dos perdidos roteados para Nutrição (alto em Inbound/Outbound/Afiliados).
  const rota: Record<string, number> = {
    'Comercial Inbound': 0.78,
    'Comercial Outbound': 0.74,
    'Vendas Afiliados': 0.7,
    SEBRAE: 0.4,
    Recontratação: 0.35,
  };
  return PIPELINES.map((p) => {
    // Perdidos ≈ um múltiplo do topo (quem não avançou nem fechou).
    const perdidos = Math.round(p.topo * (0.28 + rand() * 0.1));
    const taxa = rota[p.nome] ?? 0.5;
    return { pipeline: p.nome, perdidos, nutridos: Math.round(perdidos * taxa) };
  });
}

export function mockLossReasons(): LossReason[] {
  const rand = rng(1515);
  const ticketMedioPerda = inferirValor(60);
  const motivos = [
    'Preço acima do orçamento',
    'Sem fit / fora do ICP',
    'Timing — projeto adiado',
    'Escolheu concorrente',
    'Sem resposta / perdeu contato',
  ];
  return motivos
    .map((motivo, i) => {
      const quantidade = Math.round((52 / (i * 0.5 + 1)) * (0.85 + rand() * 0.3));
      return {
        motivo,
        quantidade,
        valor_perdido: Math.round(quantidade * ticketMedioPerda * (0.8 + rand() * 0.4)),
      };
    })
    .sort((a, b) => b.quantidade - a.quantidade);
}

export function mockCrmSegments(): CrmSegment[] {
  const rand = rng(1616);
  const def: Array<{ dimensao: CrmSegment['dimensao']; segmentos: string[]; base: number }> = [
    { dimensao: 'temperatura', segmentos: ['Quente', 'Morno', 'Frio'], base: 1400 },
    {
      dimensao: 'vertical',
      segmentos: [
        'Clínicas & Odontologia',
        'Residencial premium',
        'Comercial & Corporativo',
        'Estética & Bem-estar',
        'Gastronomia',
        'Varejo & Franquias',
      ],
      base: 760,
    },
    {
      dimensao: 'classificacao',
      segmentos: ['Lead', 'MQL', 'SQL', 'Cliente'],
      base: 1100,
    },
  ];
  const out: CrmSegment[] = [];
  for (const d of def) {
    d.segmentos.forEach((segmento, i) => {
      const contatos = Math.round((d.base / (i * 0.45 + 1)) * (0.85 + rand() * 0.3));
      out.push({
        dimensao: d.dimensao,
        segmento,
        contatos,
        valor_pipeline: Math.round(contatos * inferirValor(60) * (0.12 + rand() * 0.1)),
      });
    });
  }
  return out;
}

export function mockAttribution(): AttributionChannel[] {
  const rand = rng(1717);
  const canais: Array<{ canal: string; source: string; medium: string; peso: number }> = [
    { canal: 'Google Ads', source: 'google', medium: 'cpc', peso: 1.0 },
    { canal: 'Meta Ads', source: 'meta', medium: 'paid_social', peso: 0.92 },
    { canal: 'Orgânico / SEO', source: 'google', medium: 'organic', peso: 0.7 },
    { canal: 'Instagram orgânico', source: 'instagram', medium: 'social', peso: 0.5 },
    { canal: 'LinkedIn', source: 'linkedin', medium: 'social', peso: 0.42 },
    { canal: 'Indicação', source: 'referral', medium: 'referral', peso: 0.6 },
    { canal: 'Direto', source: 'direct', medium: 'none', peso: 0.38 },
  ];
  return canais.map((c) => {
    const first = Math.round(120 * c.peso * (0.85 + rand() * 0.3));
    const last = Math.round(96 * c.peso * (0.85 + rand() * 0.3));
    const assist = Math.round(180 * c.peso * (0.85 + rand() * 0.3));
    return {
      canal: c.canal,
      utm_source: c.source,
      utm_medium: c.medium,
      first_touch: first,
      last_touch: last,
      assist,
      receita_atribuida: Math.round(last * inferirValor(60) * (0.85 + rand() * 0.3)),
    };
  });
}

// ───────────────────────────── Projeções (Inteligência) ─────────────────────────────

export function mockProjections(): ProjectionPoint[] {
  const rand = rng(1919);
  const out: ProjectionPoint[] = [];
  const realWeeks = 8;
  const fcWeeks = 12;

  // Histórico real (8 semanas) com leve crescimento.
  let leadsBase = 96;
  let sessoesBase = 3_900;
  let investBase = 5_400;
  for (let i = realWeeks - 1; i >= 0; i--) {
    const idx = realWeeks - i;
    const leads = Math.round(leadsBase * (1 + idx * 0.02) * (0.9 + rand() * 0.2));
    const sessoes = Math.round(sessoesBase * (1 + idx * 0.025) * (0.9 + rand() * 0.2));
    const investimento = Math.round(investBase * (1 + idx * 0.015) * (0.92 + rand() * 0.16));
    out.push({ periodo: `Sem -${i}`, tipo: 'real', leads, sessoes, investimento });
  }

  // Âncora a partir do último real.
  const ultimo = out[out.length - 1];
  leadsBase = ultimo.leads;
  sessoesBase = ultimo.sessoes;
  investBase = ultimo.investimento;

  // Projeção (12 semanas) com banda de confiança que alarga no tempo.
  const g = 1.028; // ~2,8% a.s.
  for (let k = 1; k <= fcWeeks; k++) {
    const leads = Math.round(leadsBase * Math.pow(g, k));
    const sessoes = Math.round(sessoesBase * Math.pow(1.022, k));
    const investimento = Math.round(investBase * Math.pow(1.012, k));
    const band = 0.06 + k * 0.02;
    out.push({
      periodo: `Sem +${k}`,
      tipo: 'previsto',
      leads,
      leads_low: Math.round(leads * (1 - band)),
      leads_high: Math.round(leads * (1 + band)),
      sessoes,
      investimento,
    });
  }
  return out;
}
