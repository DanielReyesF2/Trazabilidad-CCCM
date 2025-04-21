import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendChartProps {
  data: Array<{
    month: string;
    organicWaste: number;
    inorganicWaste: number;
    recyclableWaste?: number;
  }>;
}

export default function TrendChart({ data }: TrendChartProps) {
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  
  return (
    <div className="bg-white shadow rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-anton uppercase tracking-wider text-gray-800">Tendencia de Residuos</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-2 py-1 text-xs font-medium rounded ${
              period === 'monthly' 
                ? 'bg-navy text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setPeriod('monthly')}
          >
            Mensual
          </button>
          <button 
            className={`px-2 py-1 text-xs font-medium rounded ${
              period === 'quarterly' 
                ? 'bg-navy text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setPeriod('quarterly')}
          >
            Trimestral
          </button>
          <button 
            className={`px-2 py-1 text-xs font-medium rounded ${
              period === 'yearly' 
                ? 'bg-navy text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setPeriod('yearly')}
          >
            Anual
          </button>
        </div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#64748b' }}
              unit=" kg"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                borderColor: '#e5e7eb',
                borderRadius: '0.375rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' 
              }}
              formatter={(value) => [`${value.toLocaleString('es-ES')} kg`, undefined]}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value) => (
                <span style={{ color: '#64748b', fontSize: 12 }}>
                  {value === 'organicWaste' 
                    ? 'Orgánicos' 
                    : value === 'inorganicWaste' 
                      ? 'Inorgánicos' 
                      : 'Reciclables'}
                </span>
              )}
            />
            <Line 
              type="monotone" 
              dataKey="organicWaste" 
              name="organicWaste"
              stroke="#b5e951" 
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="inorganicWaste" 
              name="inorganicWaste"
              stroke="#273949" 
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="recyclableWaste" 
              name="recyclableWaste"
              stroke="#ff9933" 
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
