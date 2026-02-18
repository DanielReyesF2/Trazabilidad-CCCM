import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
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
    <div className="bg-white/95 backdrop-blur-xl px-4 py-3 rounded-xl shadow-lg border border-gray-100/80">
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-lg font-medium text-gray-900 tracking-tight">
        {value.toFixed(1)}<span className="text-xs text-gray-400 ml-0.5">%</span>
      </p>
    </div>
  );
}

export function MonthlyDeviationChart({ months }: MonthlyDeviationChartProps) {
  const chartData = months.map((m) => ({
    name: monthLabelsES[m.monthNum] || m.label,
    value: parseFloat(m.diversionRate.toFixed(1)),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          dy={4}
        />
        <YAxis
          domain={[70, 100]}
          ticks={[80, 90, 100]}
          tick={{ fontSize: 10, fill: '#d1d5db' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <ReferenceLine
          y={90}
          stroke="#e5e7eb"
          strokeDasharray="4 4"
          strokeWidth={1}
        />
        <Area
          type="natural"
          dataKey="value"
          stroke="#34d399"
          strokeWidth={2}
          fill="url(#areaGrad)"
          dot={{ r: 2.5, fill: '#fff', stroke: '#34d399', strokeWidth: 1.5 }}
          activeDot={{ r: 4, fill: '#34d399', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
