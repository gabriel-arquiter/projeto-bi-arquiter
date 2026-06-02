import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Client para uso no browser (Client Components).
 * Usa APENAS a anon key — toda leitura é protegida por RLS no Supabase.
 *
 * Singleton preguiçoso: o client só é instanciado na primeira chamada
 * em runtime (no browser), nunca durante a prerenderização do build.
 */
let browserClient: SupabaseClient | undefined;

export function createClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}
