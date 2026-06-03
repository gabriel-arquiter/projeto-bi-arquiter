'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

const palette = ['#ead32d', '#4a90d9', 'rgba(255,255,255,0.25)', '#00d97e'];

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
            {title && <p className="title">{title}</p>}
            {subtitle && <p className="subtitle">{subtitle}</p>}
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
                  <stop offset="0%" stopColor={c} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>

          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />

          <XAxis
            dataKey={xKey}
            tickFormatter={shortDate}
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}
            tickFormatter={yFormatter}
            tickLine={false}
            axisLine={false}
            width={42}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(234,211,45,0.3)', strokeWidth: 1, strokeDasharray: '3 3' }}
            contentStyle={{
              borderRadius: 6,
              border: '1px solid rgba(234,211,45,0.3)',
              background: '#1a1a1a',
              boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
              fontSize: 12,
              padding: '10px 12px',
              color: '#fff',
            }}
            labelFormatter={(v) => shortDate(v as string)}
            labelStyle={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 600,
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'var(--font-mono)',
            }}
            itemStyle={{ color: '#fff', fontFamily: 'var(--font-mono)' }}
          />

          {lines.map((l, i) => {
            const c = l.color ?? palette[i % palette.length];
            return (
              <Area
                key={l.key}
                type="monotone"
                dataKey={l.key}
                name={l.label}
                stroke={c}
                strokeWidth={2}
                fill={`url(#grad-${l.key})`}
                activeDot={{ r: 4, strokeWidth: 0, fill: c }}
                isAnimationActive={false}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
