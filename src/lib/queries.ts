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
import {
  mockMonthlyOverview,
  mockGa4Daily,
  mockSearchConsoleDaily,
  mockTopKeywords,
  mockInstagramMetrics,
  mockTopInstagramPosts,
  mockPinterestMetrics,
  mockMetaAds,
  mockGoogleAds,
} from '@/lib/mock-data';

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

export async function getGa4Daily(days = 30): Promise<Ga4Metric[]> {
  if (USE_MOCK) return mockGa4Daily(days);
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
  if (USE_MOCK) return mockSearchConsoleDaily(days);
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

export async function getInstagramMetrics(days = 30): Promise<InstagramMetric[]> {
  if (USE_MOCK) return mockInstagramMetrics(days);
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
  if (USE_MOCK) return mockTopInstagramPosts(limit);
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
  if (USE_MOCK) return mockPinterestMetrics(days);
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
  if (USE_MOCK) return mockMetaAds(days);
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
  if (USE_MOCK) return mockGoogleAds(days);
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
