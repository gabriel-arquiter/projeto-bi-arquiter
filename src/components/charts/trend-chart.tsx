'use client';

import {
  LineChart,
  Line,
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
}

const palette = ['#333333', '#ead32d', '#9aa0a6', '#2e7d4f'];

export function TrendChart({ data, xKey, lines, height = 280 }: TrendChartProps) {
  return (
    <div className="surface" style={{ padding: 20 }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#eee" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: '#6b6b6b' }}
            tickLine={false}
            axisLine={{ stroke: '#e4e4e0' }}
          />
          <YAxis tick={{ fontSize: 11, fill: '#6b6b6b' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: '1px solid #e4e4e0',
              fontSize: 12,
            }}
          />
          {lines.map((l, i) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.label}
              stroke={l.color ?? palette[i % palette.length]}
              strokeWidth={2.2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
