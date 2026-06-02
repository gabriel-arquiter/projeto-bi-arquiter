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
} from '@/types/database';

// Todas as queries rodam server-side com a sessão do usuário (RLS aplicado).

export async function getMonthlyOverview(): Promise<MonthlyOverview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('monthly_overview')
    .select('*')
    .order('month', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getGa4Daily(days = 30): Promise<Ga4Metric[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('ga4_metrics')
    .select('*')
    .gte('date', since)
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getSearchConsoleDaily(days = 30): Promise<SearchConsoleMetric[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('search_console_metrics')
    .select('*')
    .gte('date', since)
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getTopKeywords(limit = 10): Promise<SearchConsoleKeyword[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('search_console_keywords')
    .select('*')
    .order('clicks', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getInstagramMetrics(days = 30): Promise<InstagramMetric[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('instagram_metrics')
    .select('*')
    .gte('date', since)
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getTopInstagramPosts(limit = 6): Promise<InstagramPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('instagram_posts')
    .select('*')
    .order('engagement_rate', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getPinterestMetrics(days = 30): Promise<PinterestMetric[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('pinterest_metrics')
    .select('*')
    .gte('date', since)
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getMetaAds(days = 30): Promise<AdsMetric[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('meta_ads_metrics')
    .select('*')
    .gte('date', since)
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getGoogleAds(days = 30): Promise<AdsMetric[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('google_ads_metrics')
    .select('*')
    .gte('date', since)
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
