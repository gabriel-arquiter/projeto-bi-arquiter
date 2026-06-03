'use client';

import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  spark?: number[];
  icon?: React.ReactNode;
  accent?: string;
}

export function KpiCard({ label, value, delta, hint, spark, icon, accent }: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  const sparkData = spark?.map((v, i) => ({ i, v })) ?? null;
  const stroke = accent ?? 'var(--color-secondary)';
  const sparkId = `spark-${label.replace(/\s+/g, '').replace(/[^a-zA-Z0-9-]/g, '')}`;

  return (
    <div className="surface surface-hover kpi">
      <div className="kpi-head">
        <p className="kpi-label">{label}</p>
        {icon && <span className="kpi-icon" aria-hidden>{icon}</span>}
      </div>

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
                <linearGradient id={sparkId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={stroke}
                strokeWidth={1.5}
                fill={`url(#${sparkId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

