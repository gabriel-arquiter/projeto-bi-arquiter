# Arquiter · Web Analytics Dashboard

Dashboard Next.js 14 (App Router) com Supabase Auth, leitura via RLS e agente de IA preditiva (Claude) server-side.

## Arquitetura de segurança

| Chave | Onde vive | Exposta no client? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Sim (RLS protege leitura) |
| `SUPABASE_SERVICE_ROLE_KEY` | só server (escrita) | **Nunca** |
| `ANTHROPIC_API_KEY` | só `/api/ai-agent` | **Nunca** |

- Todo o dashboard fica atrás do `middleware.ts` → sem sessão, redireciona pra `/login`.
- A API do agente IA valida sessão, aplica rate limit (10 req/min por usuário), valida input e só então chama o Claude. A chave da Anthropic nunca sai do servidor.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha as chaves
npm run dev                  # http://localhost:3000
```

## Configurar o Supabase Auth

1. No painel Supabase → Authentication → Providers → habilite **Email**.
2. Crie o usuário do cliente em Authentication → Users → Add user.
3. (Opcional) Desative "Enable sign-ups" para que ninguém se cadastre sozinho.
4. As policies de RLS de leitura (`anon`) já existem conforme o schema documentado.

## Deploy na Hostinger (Node.js hosting)

> Requer plano com **Node.js** (VPS ou Business com Node). Static export **não** funciona aqui por causa do middleware e da API Route.

1. Suba o repositório (sem `node_modules`, `.next`, `.env`).
2. No painel Hostinger, configure a aplicação Node.js:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm run start`
   - **Node version:** 18+ (preferir 20)
3. Configure as variáveis de ambiente no painel (todas do `.env.example`).
4. A Hostinger injeta a porta via `PORT` — o `start` já respeita isso.

## Conectar o n8n (escrita)

O n8n continua sendo o único a escrever no Supabase, usando a `service_role key`.
O dashboard apenas lê. Nada a mudar no Next.js para isso funcionar — assim que as
tabelas forem populadas, as páginas mostram os números automaticamente (tratam tabela
vazia mostrando zeros).

## Próximos passos sugeridos

- Gerar tipos reais: `npx supabase gen types typescript --project-id zbtfjcgipjdvvxyozggj > src/types/database.ts`
- Trocar o rate limit em memória por Upstash/Redis se rodar em múltiplas instâncias.
- Adicionar cache (`revalidate`) nas queries que não precisam ser tempo-real.
