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
  
  // Función para agrupar datos por trimestre
  const groupByQuarter = (data: any[]): any[] => {
    const quarters: Record<string, { 
      organicWaste: number,
      inorganicWaste: number,
      recyclableWaste: number,
      sortKey: number
    }> = {};

    // Array de nombres de meses en español
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    
    data.forEach(item => {
      // Extraer año y mes desde la etiqueta "Ene 24"
      const parts = item.month.split(' ');
      const monthShort = parts[0];
      const year = parseInt('20' + parts[1], 10);
      
      // Determinar el trimestre basado en el mes
      let quarter = 0;
      const monthMap: Record<string, number> = {
        'Ene': 0, 'Feb': 0, 'Mar': 0,
        'Abr': 1, 'May': 1, 'Jun': 1,
        'Jul': 2, 'Ago': 2, 'Sep': 2,
        'Oct': 3, 'Nov': 3, 'Dic': 3
      };
      
      quarter = monthMap[monthShort] || 0;
      
      const quarterLabel = `T${quarter + 1} ${year}`;
      const sortKey = year * 10 + quarter;
      
      if (!quarters[quarterLabel]) {
        quarters[quarterLabel] = {
          organicWaste: 0,
          inorganicWaste: 0,
          recyclableWaste: 0,
          sortKey
        };
      }
      
      quarters[quarterLabel].organicWaste += item.organicWaste;
      quarters[quarterLabel].inorganicWaste += item.inorganicWaste;
      quarters[quarterLabel].recyclableWaste += item.recyclableWaste;
    });
    
    // Convertir a array y redondear valores
    return Object.entries(quarters)
      .map(([quarter, data]) => ({
        month: quarter,  // Usamos el mismo campo "month" para mantener compatibilidad
        organicWaste: Number(data.organicWaste.toFixed(1)),
        inorganicWaste: Number(data.inorganicWaste.toFixed(1)),
        recyclableWaste: Number(data.recyclableWaste.toFixed(1)),
        sortKey: data.sortKey
      }))
      .sort((a, b) => a.sortKey - b.sortKey);
  };
  
  // Función para agrupar datos por año
  const groupByYear = (data: any[]): any[] => {
    const years: Record<string, { 
      organicWaste: number,
      inorganicWaste: number,
      recyclableWaste: number,
      sortKey: number
    }> = {};
    
    data.forEach(item => {
      // Extraer año desde la etiqueta "Ene 24"
      const parts = item.month.split(' ');
      const year = parseInt('20' + parts[1], 10);
      const yearLabel = `${year}`;
      
      if (!years[yearLabel]) {
        years[yearLabel] = {
          organicWaste: 0,
          inorganicWaste: 0,
          recyclableWaste: 0,
          sortKey: year
        };
      }
      
      years[yearLabel].organicWaste += item.organicWaste;
      years[yearLabel].inorganicWaste += item.inorganicWaste;
      years[yearLabel].recyclableWaste += item.recyclableWaste;
    });
    
    // Convertir a array y redondear valores
    return Object.entries(years)
      .map(([year, data]) => ({
        month: year,  // Usamos el mismo campo "month" para mantener compatibilidad
        organicWaste: Number(data.organicWaste.toFixed(1)),
        inorganicWaste: Number(data.inorganicWaste.toFixed(1)),
        recyclableWaste: Number(data.recyclableWaste.toFixed(1)),
        sortKey: data.sortKey
      }))
      .sort((a, b) => a.sortKey - b.sortKey);
  };
  
  // Determinar qué datos mostrar según el período seleccionado
  const getDisplayData = () => {
    switch (period) {
      case 'quarterly':
        return groupByQuarter(data);
      case 'yearly':
        return groupByYear(data);
      case 'monthly':
      default:
        return data;
    }
  };
  
  const displayData = getDisplayData();
  
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
            data={displayData}
            margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11, fill: '#64748b' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={70}
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
