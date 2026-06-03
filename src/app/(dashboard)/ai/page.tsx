'use client';

import { useState } from 'react';

const suggestions = [
  'Se eu publicar 1 artigo de meio de funil sobre clínicas, qual o impacto em MQLs em 60 dias?',
  'Qual canal pago teve melhor ROAS no último mês?',
  'Onde estou perdendo tráfego orgânico?',
  'Comparar CPL de Meta vs Google nos últimos 30 dias.',
];

export default function AiPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer('');
    try {
      const res = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro');
      setAnswer(data.answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao consultar o agente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 820 }}>
      <header className="page-header">
        <div>
          <span className="eyebrow">Assistente</span>
          <h1>Agente de IA Preditiva</h1>
          <p className="subtitle">
            Pergunte em linguagem natural. Projeções baseadas nos dados reais dos últimos 30 dias.
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> Claude · server-side
        </span>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => {
              setQuestion(s);
              ask(s);
            }}
            style={{
              background: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 999,
              padding: '8px 14px',
              fontSize: 12.5,
              cursor: 'pointer',
              color: 'var(--color-primary)',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Faça sua pergunta…"
          rows={2}
          style={{
            flex: 1,
            padding: '12px 14px',
            borderRadius: 12,
            border: '1px solid var(--color-border)',
            fontSize: 14,
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={() => ask(question)}
          disabled={loading}
          style={{
            padding: '0 22px',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {loading ? '…' : 'Perguntar'}
        </button>
      </div>

      {error && <p style={{ color: 'var(--color-negative)', fontSize: 13 }}>{error}</p>}

      {answer && (
        <div
          className="surface"
          style={{ padding: 22, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 14.5 }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}
