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
    <div style={{ maxWidth: 880 }}>
      <header className="page-header">
        <div>
          <span className="eyebrow">Inteligência</span>
          <h1>Agente IA Preditiva</h1>
          <p className="subtitle">
            Pergunte em linguagem natural. Projeções baseadas nos dados reais dos últimos 30 dias.
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> Claude · server-side
        </span>
      </header>

      <div className="ai-panel">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuestion(s);
                ask(s);
              }}
              className="ai-suggestion"
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Faça sua pergunta…"
            rows={2}
            className="ai-input"
          />
          <button
            onClick={() => ask(question)}
            disabled={loading}
            className="btn-exec"
            style={{ alignSelf: 'flex-start', minWidth: 120 }}
          >
            {loading ? '…' : 'Analisar'}
          </button>
        </div>

        {error && <p style={{ color: 'var(--negative)', fontSize: 13 }}>{error}</p>}

        {answer && (
          <div
            style={{
              padding: '18px 20px',
              background: 'var(--surface-2)',
              border: '1px solid var(--line-strong)',
              borderRadius: 'var(--radius-card)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              fontSize: 14.5,
              color: 'var(--text)',
            }}
          >
            {answer}
          </div>
        )}
      </div>
    </div>
  );
}
