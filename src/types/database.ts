// Tipos das tabelas e views do projeto Arquiter.
// Idealmente gere automaticamente com:
//   npx supabase gen types typescript --project-id zbtfjcgipjdvvxyozggj > src/types/database.ts
// Os tipos abaixo sÃ£o um esqueleto manual baseado no schema documentado.

export interface MonthlyOverview {
  month: string; // 'YYYY-MM-01'
  sessions: number;
  users: number;
  bounce_rate: number;
  meta_spend: number;
  meta_leads: number;
  meta_roas: number;
  google_spend: number;
  google_leads: number;
  google_roas: number;
}

export interface Ga4Metric {
  date: string;
  sessions: number;
  users: number;
  bounce_rate: number;
  avg_session_duration: number;
  organic_sessions: number;
  paid_sessions: number;
  social_sessions: number;
}

export interface SearchConsoleMetric {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avg_position: number;
}

export interface SearchConsoleKeyword {
  period: string;
  keyword: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avg_position: number;
}

export interface InstagramMetric {
  date: string;
  followers: number;
  reach: number;
  engagement_rate: number;
}

export interface InstagramPost {
  id: string;
  posted_at: string;
  reach: number;
  likes: number;
  saves: number;
  engagement_rate: number;
  media_type: string;
}

export interface PinterestMetric {
  date: string;
  impressions: number;
  saves: number;
  outbound_clicks: number;
}

export interface AdsMetric {
  date: string;
  campaign: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  cpl: number;
  roas: number;
}

export interface AiAnalysis {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

// ───────────────────────────── Financeiro (Conta Azul) ─────────────────────────────

export interface DreMonth {
  month: string; // 'YYYY-MM-01'
  receita_bruta: number;
  deducoes: number; // impostos sobre receita
  receita_liquida: number;
  custos: number; // custo dos serviços prestados
  lucro_bruto: number;
  despesas_marketing: number;
  despesas_pessoal: number;
  despesas_administrativas: number;
  despesas_operacionais: number;
  ebitda: number;
  resultado_liquido: number;
}

export interface CashFlowMonth {
  month: string; // 'YYYY-MM-01'
  saldo_inicial: number;
  entradas: number;
  saidas: number;
  saldo_final: number;
  a_receber: number; // contas a receber (saldo)
  a_pagar: number; // contas a pagar (saldo)
}

export interface FinanceForecastMonth {
  month: string; // 'YYYY-MM-01'
  tipo: 'real' | 'previsto';
  receita: number;
  receita_low?: number; // banda inferior do intervalo de previsão
  receita_high?: number; // banda superior
  custos: number;
  resultado: number;
}

// ───────────────────────────── CRM (Funnels / GoHighLevel) ─────────────────────────────

export interface PipelineStage {
  pipeline: string; // Inbound | Outbound | Recontratação | Nutrição
  stage: string;
  ordem: number;
  oportunidades: number;
  valor: number; // R$ em aberto no estágio (ou ganho, no último)
}

export interface LossReason {
  motivo: string;
  quantidade: number;
  valor_perdido: number;
}

export interface CrmSegment {
  dimensao: 'temperatura' | 'vertical' | 'classificacao';
  segmento: string;
  contatos: number;
  valor_pipeline: number; // R$ em pipeline associado ao segmento
}

export interface AttributionChannel {
  canal: string;
  utm_source: string;
  utm_medium: string;
  first_touch: number; // toques de primeiro contato
  last_touch: number; // toques de fechamento
  assist: number; // toques de apoio
  receita_atribuida: number;
}


