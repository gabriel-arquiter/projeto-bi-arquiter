'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TrendChartProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  lines: Array<{ key: string; label: string; color?: string }>;
  height?: number;
  title?: string;
  subtitle?: string;
  yFormatter?: (v: number) => string;
}

const palette = ['#2a2a2a', '#ead32d', '#7b8a93', '#2e7d4f'];

function shortDate(v: string | number) {
  const s = String(v);
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return s;
  const d = new Date(s);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function defaultY(v: number) {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
  return String(v);
}

export function TrendChart({
  data,
  xKey,
  lines,
  height = 300,
  title,
  subtitle,
  yFormatter = defaultY,
}: TrendChartProps) {
  return (
    <div className="surface-elevated chart-card">
      {(title || subtitle) && (
        <div className="chart-head">
          <div>
            {title && (
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>
                {title}
              </p>
            )}
            {subtitle && (
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="legend">
            {lines.map((l, i) => (
              <span key={l.key} className="legend-pill">
                <span
                  className="swatch"
                  style={{ background: l.color ?? palette[i % palette.length] }}
                />
                {l.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
          <defs>
            {lines.map((l, i) => {
              const c = l.color ?? palette[i % palette.length];
              return (
                <linearGradient
                  key={l.key}
                  id={`grad-${l.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={c} stopOpacity={i === 0 ? 0.28 : 0.18} />
                  <stop offset="100%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>

          <CartesianGrid stroke="var(--color-border)" vertical={false} strokeDasharray="2 4" />

          <XAxis
            dataKey={xKey}
            tickFormatter={shortDate}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            tickFormatter={yFormatter}
            tickLine={false}
            axisLine={false}
            width={42}
          />
          <Tooltip
            cursor={{ stroke: 'var(--color-border-strong)', strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)',
              fontSize: 12,
              padding: '10px 12px',
            }}
            labelFormatter={(v) => shortDate(v as string)}
            labelStyle={{
              fontSize: 11,
              color: 'var(--color-text-muted)',
              fontWeight: 600,
              marginBottom: 4,
            }}
          />
          {!title && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />}

          {lines.map((l, i) => {
            const c = l.color ?? palette[i % palette.length];
            return (
              <Area
                key={l.key}
                type="monotone"
                dataKey={l.key}
                name={l.label}
                stroke={c}
                strokeWidth={2.2}
                fill={`url(#grad-${l.key})`}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
