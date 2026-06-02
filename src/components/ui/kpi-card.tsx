interface KpiCardProps {
  label: string;
  value: string;
  delta?: number; // variação % vs período anterior
  hint?: string;
}

export function KpiCard({ label, value, delta, hint }: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="surface" style={{ padding: '18px 20px' }}>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</p>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontWeight: 600,
          color: 'var(--color-primary)',
          margin: '6px 0 2px',
        }}
      >
        {value}
      </p>
      {delta !== undefined && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: positive ? 'var(--color-positive)' : 'var(--color-negative)',
          }}
        >
          {positive ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
        </span>
      )}
      {hint && (
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 6 }}>
          {hint}
        </span>
      )}
    </div>
  );
}
