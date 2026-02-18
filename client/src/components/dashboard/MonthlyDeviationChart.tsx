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
    <div className="bg-white/95 backdrop-blur-xl px-5 py-4 rounded-2xl shadow-lg border border-gray-100/80">
      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-light text-gray-900 tracking-tight">
        {value.toFixed(1)}
        <span className="text-base text-gray-400 ml-0.5">%</span>
      </p>
      {value >= 90 && (
        <p className="text-[11px] text-emerald-500 font-medium mt-1">Cumple meta TRUE</p>
      )}
    </div>
  );
}

export function MonthlyDeviationChart({ months }: MonthlyDeviationChartProps) {
  const chartData = months.map((m) => ({
    name: monthLabelsES[m.monthNum] || m.label,
    value: parseFloat(m.diversionRate.toFixed(1)),
  }));

  return (
    <div>
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Tendencia mensual
          </h2>
          <p className="text-sm text-gray-400 mt-1">Octubre 2024 — Septiembre 2025</p>
        </div>
        <div className="flex items-center gap-5 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <span className="w-6 h-[2px] bg-emerald-400 rounded-full" />
            Desviación
          </span>
          <span className="flex items-center gap-2">
            <span className="w-6 border-t border-dashed border-gray-300" />
            Meta 90%
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            domain={[70, 100]}
            ticks={[70, 80, 90, 100]}
            tick={{ fontSize: 11, fill: '#d1d5db' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}`}
            dx={-4}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <ReferenceLine
            y={90}
            stroke="#d1d5db"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: '90%',
              position: 'insideTopLeft',
              fill: '#9ca3af',
              fontSize: 10,
              fontWeight: 500,
              offset: 8,
            }}
          />
          <Area
            type="natural"
            dataKey="value"
            stroke="#34d399"
            strokeWidth={2.5}
            fill="url(#areaGrad)"
            dot={{ r: 3.5, fill: '#fff', stroke: '#34d399', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: '#34d399', stroke: '#fff', strokeWidth: 2.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
