'use client';

import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number; // variação % vs período anterior
  hint?: string;
  accent?: string; // cor do filete superior (default: amarelo Arquiter)
  spark?: number[]; // série pra sparkline opcional
  icon?: React.ReactNode;
}

export function KpiCard({ label, value, delta, hint, accent, spark, icon }: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  const sparkData = spark?.map((v, i) => ({ i, v })) ?? null;
  const accentColor = accent ?? 'var(--color-secondary)';

  return (
    <div
      className="surface surface-hover kpi"
      style={{ ['--kpi-accent' as never]: accentColor }}
    >
      <p className="kpi-label">
        {icon && <span aria-hidden style={{ opacity: 0.7 }}>{icon}</span>}
        {label}
      </p>
      <p className="kpi-value">{value}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {delta !== undefined && (
          <span className={`kpi-delta ${positive ? 'up' : 'down'}`}>
            {positive ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {hint && <span className="kpi-hint">{hint}</span>}
      </div>

      {sparkData && sparkData.length > 1 && (
        <div className="kpi-spark" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`spark-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColor} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={accentColor}
                strokeWidth={1.6}
                fill={`url(#spark-${label.replace(/\s+/g, '')})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
