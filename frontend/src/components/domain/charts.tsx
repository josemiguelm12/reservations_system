'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#7c3aed'];

/* ─── Revenue bar chart ─── */
interface RevenueChartProps {
  data: { period: string; revenue: number; count: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
        <XAxis dataKey="period" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
        <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="revenue" fill="var(--brand)" radius={[4, 4, 0, 0]} name="Ingresos ($)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ─── Top Resources pie chart ─── */
interface TopResourcesChartProps {
  data: { resourceName: string; totalReservations: number; totalRevenue: number }[];
}

export function TopResourcesChart({ data }: TopResourcesChartProps) {
  const chartData = data.map((d) => ({
    name: d.resourceName,
    value: d.totalReservations,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ─── Trend line chart ─── */
interface TrendChartProps {
  data: { date: string; count: number }[];
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
        <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="var(--brand)"
          strokeWidth={2}
          dot={{ fill: 'var(--brand)', r: 4 }}
          name="Reservas"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
