import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { TrueYearMonthData } from '@/hooks/useTrueYearData';

interface MonthlyDeviationChartProps {
  months: TrueYearMonthData[];
}

const monthLabelsES: Record<number, string> = {
  1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun',
  7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic',
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value as number;
  return (
    <div className="bg-[#273949] text-white px-4 py-3 rounded-lg shadow-xl border border-white/10">
      <p className="text-xs text-gray-300 mb-1">{label}</p>
      <p className="text-lg font-mono font-bold">
        {value.toFixed(1)}%
        {value >= 90 && <span className="ml-2 text-[#b5e951] text-xs">✓ Meta</span>}
      </p>
    </div>
  );
}

export function MonthlyDeviationChart({ months }: MonthlyDeviationChartProps) {
  const chartData = months.map((m) => ({
    name: `${monthLabelsES[m.monthNum] || m.label} ${String(m.year).slice(2)}`,
    desviación: parseFloat(m.diversionRate.toFixed(1)),
  }));

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
            Desviación Mensual TRUE Year
          </h3>
          <p className="text-sm text-gray-500 mt-1">Oct 2024 – Sep 2025 · Meta TRUE ≥ 90%</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#b5e951]" />
            Desviación
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-8 border-t-2 border-dashed border-red-400" />
            Meta 90%
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#b5e951" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#b5e951" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[60, 100]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={90}
            stroke="#ef4444"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: 'Meta TRUE 90%',
              position: 'insideTopRight',
              fill: '#ef4444',
              fontSize: 11,
              fontWeight: 600,
            }}
          />
          <Area
            type="monotone"
            dataKey="desviación"
            stroke="#b5e951"
            strokeWidth={3}
            fill="url(#limeGrad)"
            dot={{ r: 4, fill: '#b5e951', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#b5e951', stroke: '#273949', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
