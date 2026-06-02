// Tipos das tabelas e views do projeto Arquiter.
// Idealmente gere automaticamente com:
//   npx supabase gen types typescript --project-id zbtfjcgipjdvvxyozggj > src/types/database.ts
// Os tipos abaixo são um esqueleto manual baseado no schema documentado.

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
