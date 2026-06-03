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
