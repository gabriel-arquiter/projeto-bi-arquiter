import { NextResponse, type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rate limit simples em memória (por instância). Para produção séria,
// troque por Upstash/Redis ou rate limit do próprio Supabase.
const RATE_LIMIT = 10; // perguntas
const WINDOW_MS = 60_000; // por minuto
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  // 1. Exige usuário autenticado.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  // 2. Rate limit por usuário.
  if (rateLimited(user.id)) {
    return NextResponse.json(
      { error: 'Muitas perguntas em pouco tempo. Aguarde um instante.' },
      { status: 429 }
    );
  }

  // 3. Valida input.
  let question: string;
  try {
    const body = await request.json();
    question = String(body.question ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }

  if (!question || question.length > 1000) {
    return NextResponse.json(
      { error: 'A pergunta deve ter entre 1 e 1000 caracteres.' },
      { status: 400 }
    );
  }

  // 4. Busca dados reais dos últimos 30 dias (RLS aplicado).
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const [overview, ga4, sc, meta, google] = await Promise.all([
    supabase.from('monthly_overview').select('*').order('month', { ascending: false }).limit(6),
    supabase.from('ga4_metrics').select('*').gte('date', since),
    supabase.from('search_console_metrics').select('*').gte('date', since),
    supabase.from('meta_ads_metrics').select('*').gte('date', since),
    supabase.from('google_ads_metrics').select('*').gte('date', since),
  ]);

  const context = {
    visao_mensal: overview.data ?? [],
    ga4_30dias: ga4.data ?? [],
    search_console_30dias: sc.data ?? [],
    meta_ads_30dias: meta.data ?? [],
    google_ads_30dias: google.data ?? [],
  };

  // 5. Chama Claude — a chave fica no servidor.
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const systemPrompt = `Você é um analista de marketing digital da Arquiter.
Responda em PT-BR, de forma objetiva e executiva, priorizando a solução primeiro.
Baseie projeções e respostas EXCLUSIVAMENTE nos dados fornecidos em JSON.
Quando fizer projeções, deixe claras as premissas e a incerteza.
Não invente números que não estejam nos dados. Se faltar dado, diga o que falta.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Dados disponíveis (JSON):\n${JSON.stringify(context)}\n\nPergunta: ${question}`,
        },
      ],
    });

    const answer = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    // 6. Persiste no histórico (ai_analyses).
    await supabase.from('ai_analyses').insert({ question, answer });

    return NextResponse.json({ answer });
  } catch (err) {
    console.error('Erro na chamada Claude:', err);
    return NextResponse.json(
      { error: 'Falha ao gerar a análise. Tente novamente.' },
      { status: 502 }
    );
  }
}
