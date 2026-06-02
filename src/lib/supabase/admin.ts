import { createClient } from '@supabase/supabase-js';

/**
 * Client ADMIN — usa a service_role key, ignora RLS.
 * USE COM EXTREMO CUIDADO. Apenas em código server-side
 * (Route Handlers / Server Actions) e NUNCA em Client Components.
 *
 * No fluxo atual, o dashboard só LÊ dados (anon key basta).
 * Este client existe para casos de escrita server-side que não
 * passem pelo n8n. Se não precisar escrever pelo Next.js, pode
 * remover este arquivo e manter a escrita exclusivamente no n8n.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada.');
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
