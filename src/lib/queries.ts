import { createClient } from '@/lib/supabase/server';
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
import {
  mockMonthlyOverview,
  mockGa4Daily,
  mockSearchConsoleDaily,
  mockTopKeywords,
  mockInstagramMetrics,
  mockInstagramPosts,
  mockPinterestMetrics,
  mockMetaAds,
  mockGoogleAds,
  mockDre,
  mockCashFlow,
  mockFinanceForecast,
  mockCrmPipelines,
  mockLossReasons,
  mockCrmSegments,
  mockAttribution,
  mockCrmNurturing,
  mockProjections,
} from '@/lib/mock-data';
import { defaultRange, monthStart, monthsInRange, type DateRange } from '@/lib/period';

// Todas as queries rodam server-side com a sessão do usuário (RLS aplicado).
// Com NEXT_PUBLIC_USE_MOCK=1 retornamos mock data, sem tocar no Supabase.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === '1';

export async function getMonthlyOverview(): Promise<MonthlyOverview[]> {
  if (USE_MOCK) return mockMonthlyOverview();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('monthly_overview')
    .select('*')
    .order('month', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getGa4Daily(range: DateRange = defaultRange()): Promise<Ga4Metric[]> {
  if (USE_MOCK) return mockGa4Daily(range);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ga4_metrics')
    .select('*')
    .gte('date', range.from)
    .lte('date', range.to)
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getSearchConsoleDaily(
  range: DateRange = defaultRange(),
): Promise<SearchConsoleMetric[]> {
  if (USE_MOCK) return mockSearchConsoleDaily(range);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('search_console_metrics')
    .select('*')
    .gte('date', range.from)
    .lte('date', range.to)
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getTopKeywords(limit = 10): Promise<SearchConsoleKeyword[]> {
  if (USE_MOCK) return mockTopKeywords(limit);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('search_console_keywords')
    .select('*')
    .order('clicks', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getInstagramMetrics(
  range: DateRange = defaultRange(),
): Promise<InstagramMetric[]> {
  if (USE_MOCK) return mockInstagramMetrics(range);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('instagram_metrics')
    .select('*')
    .gte('date', range.from)
    .lte('date', range.to)
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getInstagramPosts(
  range: DateRange = defaultRange(),
  limit = 100,
): Promise<InstagramPost[]> {
  if (USE_MOCK) return mockInstagramPosts(range);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('instagram_posts')
    .select('*')
    .gte('published_at', range.from)
    .lte('published_at', `${range.to}T23:59:59`)
    .order('engagement_rate', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getPinterestMetrics(
  range: DateRange = defaultRange(),
): Promise<PinterestMetric[]> {
  if (USE_MOCK) return mockPinterestMetrics(range);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('pinterest_metrics')
    .select('*')
    .gte('date', range.from)
    .lte('date', range.to)
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getMetaAds(range: DateRange = defaultRange()): Promise<AdsMetric[]> {
  if (USE_MOCK) return mockMetaAds(range);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('meta_ads_metrics')
    .select('*')
    .gte('date', range.from)
    .lte('date', range.to)
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getGoogleAds(range: DateRange = defaultRange()): Promise<AdsMetric[]> {
  if (USE_MOCK) return mockGoogleAds(range);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('google_ads_metrics')
    .select('*')
    .gte('date', range.from)
    .lte('date', range.to)
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ───────────────────────────── Financeiro / CRM / Projeções ─────────────────────────────
// Domínios ainda sem tabelas reais no Supabase: enquanto o pipeline (Conta Azul, Funnels,
// jobs de forecast) não popula os marts, caímos em mock determinístico para que as
// visualizações apareçam com números fictícios. Quando a tabela existir e tiver linhas,
// passa a usar o dado real automaticamente.
async function withMockFallback<T>(
  query: () => Promise<{ data: T[] | null; error: unknown }>,
  mock: () => T[],
): Promise<T[]> {
  try {
    const { data, error } = await query();
    if (error || !data || data.length === 0) return mock();
    return data;
  } catch {
    return mock();
  }
}

export async function getDre(range: DateRange = defaultRange()): Promise<DreMonth[]> {
  if (USE_MOCK) return mockDre(range);
  return withMockFallback<DreMonth>(async () => {
    const supabase = await createClient();
    return supabase
      .from('finance_dre')
      .select('*')
      .gte('month', monthStart(range.from))
      .lte('month', monthStart(range.to))
      .order('month', { ascending: true });
  }, () => mockDre(range));
}

export async function getCashFlow(range: DateRange = defaultRange()): Promise<CashFlowMonth[]> {
  if (USE_MOCK) return mockCashFlow(range);
  return withMockFallback<CashFlowMonth>(async () => {
    const supabase = await createClient();
    return supabase
      .from('finance_cash_flow')
      .select('*')
      .gte('month', monthStart(range.from))
      .lte('month', monthStart(range.to))
      .order('month', { ascending: true });
  }, () => mockCashFlow(range));
}

export async function getFinanceForecast(
  range: DateRange = defaultRange(),
): Promise<FinanceForecastMonth[]> {
  if (USE_MOCK) return mockFinanceForecast(range);
  return withMockFallback<FinanceForecastMonth>(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('finance_forecast')
      .select('*')
      .order('month', { ascending: true });
    // Mantém toda a projeção (previsto) e recorta o histórico (real) ao período.
    const keep = new Set(monthsInRange(range));
    const filtered =
      data?.filter(
        (r: FinanceForecastMonth) => r.tipo === 'previsto' || keep.has(monthStart(r.month)),
      ) ?? null;
    return { data: filtered, error };
  }, () => mockFinanceForecast(range));
}

export async function getCrmPipelines(): Promise<PipelineStage[]> {
  if (USE_MOCK) return mockCrmPipelines();
  return withMockFallback<PipelineStage>(async () => {
    const supabase = await createClient();
    return supabase
      .from('crm_pipeline_stages')
      .select('*')
      .order('pipeline', { ascending: true })
      .order('ordem', { ascending: true });
  }, () => mockCrmPipelines());
}

export async function getCrmNurturing(): Promise<PipelineNurturing[]> {
  if (USE_MOCK) return mockCrmNurturing();
  return withMockFallback<PipelineNurturing>(async () => {
    const supabase = await createClient();
    return supabase.from('crm_nurturing').select('*');
  }, () => mockCrmNurturing());
}

export async function getLossReasons(): Promise<LossReason[]> {
  if (USE_MOCK) return mockLossReasons();
  return withMockFallback<LossReason>(async () => {
    const supabase = await createClient();
    return supabase.from('crm_loss_reasons').select('*').order('quantidade', { ascending: false });
  }, () => mockLossReasons());
}

export async function getCrmSegments(): Promise<CrmSegment[]> {
  if (USE_MOCK) return mockCrmSegments();
  return withMockFallback<CrmSegment>(async () => {
    const supabase = await createClient();
    return supabase.from('crm_segments').select('*');
  }, () => mockCrmSegments());
}

export async function getAttribution(): Promise<AttributionChannel[]> {
  if (USE_MOCK) return mockAttribution();
  return withMockFallback<AttributionChannel>(async () => {
    const supabase = await createClient();
    return supabase
      .from('crm_attribution')
      .select('*')
      .order('receita_atribuida', { ascending: false });
  }, () => mockAttribution());
}

export async function getProjections(): Promise<ProjectionPoint[]> {
  if (USE_MOCK) return mockProjections();
  return withMockFallback<ProjectionPoint>(async () => {
    const supabase = await createClient();
    return supabase.from('projections').select('*');
  }, () => mockProjections());
}
