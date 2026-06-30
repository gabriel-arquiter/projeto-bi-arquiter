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
import { addDays, defaultRange, monthsInRange, type DateRange } from '@/lib/period';

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

const HORIZON = 120; // dias de história usados na curva de tendência

// Offset em dias entre a data e hoje (0 = hoje, positivo = passado).
function dayOffset(iso: string): number {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const d = new Date(`${iso}T00:00:00Z`);
  return Math.round((today.getTime() - d.getTime()) / 86_400_000);
}

// PRNG determinístico por (seed, data): a mesma data sempre gera os mesmos números.
// Isso mantém o período atual e o período comparado estáveis e coerentes entre si —
// datas mais antigas ficam no passado da curva, então a comparação mostra deltas reais.
function dateRng(seed: number, iso: string) {
  return rng((((seed * 100003) >>> 0) ^ (dayOffset(iso) + 1)) >>> 0);
}

// Curva por data: tendência de alta para datas mais recentes + sazonalidade semanal.
function dayWave(iso: string, base: number, amp: number, rand: () => number, weeklyBoost = 0.15) {
  const off = dayOffset(iso);
  const recency = Math.max(0, HORIZON - Math.min(HORIZON, off)); // 0..HORIZON (maior = mais recente)
  const weekly = Math.sin((off / 7) * Math.PI * 2) * weeklyBoost;
  const trend = recency * 0.0032;
  const noise = (rand() - 0.5) * 0.16;
  return Math.max(0, base * (1 + weekly + trend + noise) + amp * (rand() - 0.5));
}

// Lista de datas ISO (inclusivas) entre range.from e range.to.
function eachDay(range: DateRange): string[] {
  const out: string[] = [];
  let cur = range.from;
  while (cur <= range.to) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

// Hash simples para variar a seed por campanha.
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
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
export function mockGa4Daily(range: DateRange = defaultRange()): Ga4Metric[] {
  return eachDay(range).map((date) => {
    const rand = dateRng(202, date);
    const sessions = Math.round(dayWave(date, 720, 90, rand, 0.22));
    const users = Math.round(sessions * (0.7 + rand() * 0.05));
    const organic = Math.round(sessions * (0.46 + rand() * 0.06));
    const paid = Math.round(sessions * (0.34 + rand() * 0.06));
    const social = Math.round(sessions * (0.12 + rand() * 0.04));
    return {
      date,
      sessions,
      users,
      bounce_rate: 0.41 + (rand() - 0.5) * 0.06,
      avg_session_duration: 92 + rand() * 48,
      organic_sessions: organic,
      paid_sessions: paid,
      social_sessions: social,
    };
  });
}

// ───────────────────────────── Search Console ─────────────────────────────
export function mockSearchConsoleDaily(range: DateRange = defaultRange()): SearchConsoleMetric[] {
  return eachDay(range).map((date) => {
    const rand = dateRng(303, date);
    const impressions = Math.round(dayWave(date, 8_200, 700, rand, 0.18));
    const ctr = 0.034 + (rand() - 0.5) * 0.012;
    return {
      date,
      clicks: Math.round(impressions * ctr),
      impressions,
      ctr,
      avg_position: 12.4 + (rand() - 0.5) * 2.6,
    };
  });
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
export function mockInstagramMetrics(range: DateRange = defaultRange()): InstagramMetric[] {
  const baseFollowers = 14_320;
  return eachDay(range).map((date) => {
    const rand = dateRng(505, date);
    const recency = Math.max(0, HORIZON - Math.min(HORIZON, dayOffset(date)));
    const reach = Math.round(dayWave(date, 4_200, 600, rand, 0.28));
    const engagement_rate = 0.054 + (rand() - 0.5) * 0.018;
    return {
      date,
      followers: baseFollowers + recency * 12 + Math.round(rand() * 8),
      reach,
      impressions: Math.round(reach * (1.15 + rand() * 0.25)),
      views: Math.round(reach * (1.3 + rand() * 0.3)),
      total_interactions: Math.round(reach * engagement_rate),
      profile_views: Math.round(reach * (0.04 + rand() * 0.02)),
      engagement_rate,
    };
  });
}

const MOCK_CAPTIONS = [
  'Antes e depois desse projeto incrível 🏡✨',
  'Qual desses ambientes você levaria pra sua casa? Comenta aqui 👇',
  'Salva esse post pra inspirar a sua próxima reforma! Link na bio com o portfólio completo, os materiais usados e cada detalhe de execução que mostramos por aqui ao longo das semanas.',
  'Detalhes que fazem toda a diferença ✨',
  'Cozinha integrada ou separada? Conta pra gente o que você prefere!',
];

const MOCK_THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Crect width='44' height='44' fill='%23222'/%3E%3Crect x='10' y='10' width='24' height='24' rx='4' fill='%23ead32d'/%3E%3C/svg%3E";
const MOCK_HOURS = [9, 14, 19, 21, 12];

export function mockInstagramPosts(range: DateRange = defaultRange()): InstagramPost[] {
  const days = eachDay(range);
  const types = ['REELS', 'CAROUSEL_ALBUM', 'IMAGE'];
  const out: InstagramPost[] = [];
  // ~1 post a cada 3 dias
  for (let i = 0; i < days.length; i += 3) {
    const date = days[i];
    const idx = i / 3;
    const rand = dateRng(606, date);
    const reach = Math.round(dayWave(date, 5_200, 800, rand, 0.3));
    const likes = Math.round(reach * (0.06 + rand() * 0.04));
    const comments = Math.round(likes * (0.05 + rand() * 0.05));
    const saves = Math.round(likes * (0.15 + rand() * 0.1));
    const hour = String(MOCK_HOURS[idx % MOCK_HOURS.length]).padStart(2, '0');
    out.push({
      post_id: `mock-${date}`,
      published_at: `${date}T${hour}:00:00+00:00`,
      caption: MOCK_CAPTIONS[idx % MOCK_CAPTIONS.length],
      media_type: types[idx % types.length],
      permalink: 'https://instagram.com',
      thumbnail_url: MOCK_THUMB,
      media_url: null,
      reach,
      likes,
      comments,
      saves,
      engagement_rate: reach ? (likes + comments + saves) / reach : 0,
    });
  }
  return out.sort((a, b) => (b.engagement_rate ?? 0) - (a.engagement_rate ?? 0));
}

// ───────────────────────────── Pinterest ─────────────────────────────
export function mockPinterestMetrics(range: DateRange = defaultRange()): PinterestMetric[] {
  return eachDay(range).map((date) => {
    const rand = dateRng(707, date);
    const impressions = Math.round(dayWave(date, 2_400, 320, rand, 0.2));
    return {
      date,
      impressions,
      saves: Math.round(impressions * (0.022 + rand() * 0.014)),
      outbound_clicks: Math.round(impressions * (0.011 + rand() * 0.006)),
    };
  });
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

function mockAds(seed: number, range: DateRange, campaigns: string[], cpl: number): AdsMetric[] {
  const out: AdsMetric[] = [];
  for (const date of eachDay(range)) {
    for (const campaign of campaigns) {
      const rand = dateRng(seed + hashStr(campaign), date);
      const spend = dayWave(date, 220, 60, rand, 0.18) * (0.7 + rand() * 0.7);
      const leadsRaw = spend / (cpl * (0.85 + rand() * 0.3));
      const leads = Math.max(0, Math.round(leadsRaw));
      const clicks = Math.round(leads / (0.06 + rand() * 0.04));
      const impressions = Math.round(clicks / (0.018 + rand() * 0.012));
      out.push({
        date,
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

export function mockMetaAds(range: DateRange = defaultRange()): AdsMetric[] {
  return mockAds(808, range, metaCampaigns, 38);
}
export function mockGoogleAds(range: DateRange = defaultRange()): AdsMetric[] {
  return mockAds(909, range, googleCampaigns, 44);
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

// Geramos sempre uma janela ampla e determinística de meses; as queries recortam
// para os meses que caem no intervalo selecionado (monthsInRange). Assim, qualquer
// período dentro dos últimos ~13 meses devolve dados estáveis.
const FIN_MONTHS = 13;

function financeBase(months = FIN_MONTHS): FinanceBase[] {
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

export function mockDre(range: DateRange = defaultRange()): DreMonth[] {
  const keep = new Set(monthsInRange(range));
  return financeBase(FIN_MONTHS)
    .map((m) => ({
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
    }))
    .filter((m) => keep.has(m.month));
}

export function mockCashFlow(range: DateRange = defaultRange()): CashFlowMonth[] {
  const keep = new Set(monthsInRange(range));
  const base = financeBase(FIN_MONTHS);
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
  return out.filter((r) => keep.has(r.month));
}

export function mockFinanceForecast(range: DateRange = defaultRange()): FinanceForecastMonth[] {
  const base = financeBase(FIN_MONTHS);
  const keep = new Set(monthsInRange(range));
  const out: FinanceForecastMonth[] = [];

  // Histórico real — recortado aos meses do período selecionado.
  for (const m of base) {
    if (!keep.has(m.month)) continue;
    out.push({
      month: m.month,
      tipo: 'real',
      receita: m.receita_bruta,
      custos: m.custos + m.despesas_operacionais,
      resultado: m.resultado_liquido,
    });
  }

  // Projeção sempre a partir do último mês real (mês corrente), horizonte fixo.
  const last = base[base.length - 1];
  const prev = base[base.length - 2] ?? base[base.length - 1];
  const growth = prev.receita_bruta ? last.receita_bruta / prev.receita_bruta : 1.05;
  const g = Math.min(1.09, Math.max(1.02, growth)); // ancorada entre 2% e 9% a.m.
  const horizon = 6;

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
