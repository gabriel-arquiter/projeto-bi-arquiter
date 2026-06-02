'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError('E-mail ou senha inválidos.');
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background:
          'radial-gradient(120% 120% at 0% 0%, #3a3a3a 0%, #262626 55%, #1c1c1c 100%)',
        padding: 24,
      }}
    >
      <div
        className="surface"
        style={{ width: '100%', maxWidth: 380, padding: '36px 32px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span
            style={{
              width: 12,
              height: 12,
              background: 'var(--color-secondary)',
              borderRadius: 3,
            }}
          />
          <span style={{ fontWeight: 700, letterSpacing: 1, color: 'var(--color-primary)' }}>
            ARQUITER
          </span>
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            margin: '8px 0 24px',
            color: 'var(--color-primary)',
          }}
        >
          Web Analytics
        </h1>

        <label style={labelStyle}>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          autoComplete="email"
        />

        <label style={labelStyle}>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          style={inputStyle}
          autoComplete="current-password"
        />

        {error && (
          <p style={{ color: 'var(--color-negative)', fontSize: 13, marginTop: 4 }}>{error}</p>
        )}

        <button onClick={handleLogin} disabled={loading} style={buttonStyle}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  margin: '14px 0 6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px',
  border: '1px solid var(--color-border)',
  borderRadius: 10,
  fontSize: 14,
  outline: 'none',
  background: '#fff',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 22,
  padding: '12px',
  border: 'none',
  borderRadius: 10,
  background: 'var(--color-primary)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};
