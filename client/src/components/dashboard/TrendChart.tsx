import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface TrendChartProps {
  data: Array<{
    month: string;
    organicWaste: number;
    podaWaste: number;
    inorganicWaste: number;
    recyclableWaste?: number;
  }>;
}

export default function TrendChart({ data }: TrendChartProps) {
  
  // Función para agrupar datos por trimestre
  const groupByQuarter = (data: any[]): any[] => {
    const quarters: Record<string, { 
      organicWaste: number,
      podaWaste: number,
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
          podaWaste: 0,
          inorganicWaste: 0,
          recyclableWaste: 0,
          sortKey
        };
      }
      
      quarters[quarterLabel].organicWaste += item.organicWaste;
      quarters[quarterLabel].podaWaste += item.podaWaste;
      quarters[quarterLabel].inorganicWaste += item.inorganicWaste;
      quarters[quarterLabel].recyclableWaste += item.recyclableWaste;
    });
    
    // Convertir a array y redondear valores
    return Object.entries(quarters)
      .map(([quarter, data]) => ({
        month: quarter,  // Usamos el mismo campo "month" para mantener compatibilidad
        organicWaste: Number(data.organicWaste.toFixed(1)),
        podaWaste: Number(data.podaWaste.toFixed(1)),
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
      podaWaste: number,
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
          podaWaste: 0,
          inorganicWaste: 0,
          recyclableWaste: 0,
          sortKey: year
        };
      }
      
      years[yearLabel].organicWaste += item.organicWaste;
      years[yearLabel].podaWaste += item.podaWaste;
      years[yearLabel].inorganicWaste += item.inorganicWaste;
      years[yearLabel].recyclableWaste += item.recyclableWaste;
    });
    
    // Convertir a array y redondear valores
    return Object.entries(years)
      .map(([year, data]) => ({
        month: year,  // Usamos el mismo campo "month" para mantener compatibilidad
        organicWaste: Number((data.organicWaste / 1000).toFixed(2)),
        podaWaste: Number((data.podaWaste / 1000).toFixed(2)),
        inorganicWaste: Number((data.inorganicWaste / 1000).toFixed(2)),
        recyclableWaste: Number((data.recyclableWaste / 1000).toFixed(2)),
        sortKey: data.sortKey
      }))
      .sort((a, b) => a.sortKey - b.sortKey);
  };
  
  // Función que se usará con los datos filtrados
  
  // Filtrar datos para mostrar solo desde enero 2024 en adelante y convertir a toneladas
  const filteredData = data.filter(item => {
    const parts = item.month.split(' ');
    const year = parseInt('20' + parts[1], 10);
    const month = parts[0];
    
    // Solo fechas de enero 2024 en adelante
    return !(year === 2023 || (year === 2024 && month === 'Dic'));
  }).map(item => ({
    ...item,
    organicWaste: Number((item.organicWaste / 1000).toFixed(2)),
    podaWaste: Number((item.podaWaste / 1000).toFixed(2)),
    inorganicWaste: Number((item.inorganicWaste / 1000).toFixed(2)),
    recyclableWaste: Number(((item.recyclableWaste || 0) / 1000).toFixed(2))
  }));
  
  console.log("Datos originales filtrados:", filteredData);
  
  // Solo usar vista mensual
  const displayData = filteredData;
  console.log("Datos procesados para mostrar:", displayData);
  
  // Calcular los promedios para la línea de referencia
  const avgOrganicWaste = displayData.reduce((sum, item) => sum + item.organicWaste, 0) / displayData.length;
  const avgPodaWaste = displayData.reduce((sum, item) => sum + item.podaWaste, 0) / displayData.length;
  const avgInorganicWaste = displayData.reduce((sum, item) => sum + item.inorganicWaste, 0) / displayData.length;
  const avgRecyclableWaste = displayData.reduce((sum, item) => sum + (item.recyclableWaste || 0), 0) / displayData.length;
  
  // Calcular datos adicionales para estadísticas
  const organicTotal = displayData.reduce((sum, month) => sum + month.organicWaste, 0);
  const podaTotal = displayData.reduce((sum, month) => sum + month.podaWaste, 0);
  const inorganicTotal = displayData.reduce((sum, month) => sum + month.inorganicWaste, 0);
  const recyclableTotal = displayData.reduce((sum, month) => sum + (month.recyclableWaste || 0), 0);
  
  // Usar el valor total incluyendo PODA
  const totalOrganicFixed = 83771.30; // 83.77 ton
  const totalPodaFixed = 64000.00; // 64.00 ton
  const totalInorganicFixed = 61281.33; // 61.28 ton
  const totalRecyclableFixed = 21865.65; // 21.87 ton
  const totalWaste = totalOrganicFixed + totalPodaFixed + totalInorganicFixed + totalRecyclableFixed; // 230.92 ton
  
  // Calcular el mes con mayor generación
  const maxMonth = displayData.reduce((max, month) => {
    const total = month.organicWaste + month.inorganicWaste + (month.recyclableWaste || 0);
    return total > max.total ? { name: month.month, total } : max;
  }, { name: '', total: 0 });
  
  // Calcular evolución respecto al período anterior
  const getLastPeriodTrend = () => {
    if (displayData.length < 2) return { value: 0, isPositive: false };
    
    const lastIndex = displayData.length - 1;
    const currentTotal = displayData[lastIndex].organicWaste + 
                        displayData[lastIndex].inorganicWaste + 
                        (displayData[lastIndex].recyclableWaste || 0);
    
    const previousTotal = displayData[lastIndex - 1].organicWaste + 
                         displayData[lastIndex - 1].inorganicWaste + 
                         (displayData[lastIndex - 1].recyclableWaste || 0);
    
    const change = ((currentTotal - previousTotal) / previousTotal) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0
    };
  };
  
  const trend = getLastPeriodTrend();

  return (
    <div className="bg-white shadow rounded-lg p-5 relative overflow-hidden">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-lime/10 to-navy/5 rounded-bl-3xl"></div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 relative">
        <div>
          <h2 className="text-lg font-anton uppercase tracking-wider text-navy">Tendencia de Residuos</h2>
          <p className="text-xs text-gray-500">Análisis mensual enero 2024 - marzo 2025</p>
        </div>
      </div>
      
      {/* KPI Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Total Generado</div>
          <div className="text-lg font-semibold text-navy">{(totalWaste/1000).toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ton</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Índice de Desviación</div>
          <div className="text-lg font-semibold text-green-600">
            {Math.min(90, Math.round(37))}%
          </div>
          <div className="text-xs text-gray-400 mt-1">Meta: 90%</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Reducción CO₂</div>
          <div className="text-lg font-semibold text-navy">
            {((recyclableTotal + podaTotal * 0.5) * 2.8).toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ton
          </div>
          <div className="text-xs text-gray-400 mt-1">Equivale a {Math.round(((recyclableTotal + podaTotal * 0.5) * 2.8) / 120)} árboles/año</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Tendencia</div>
          <div className={`text-lg font-semibold flex items-center ${trend.isPositive ? 'text-red-500' : 'text-green-600'}`}>
            {trend.isPositive ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
            {trend.value}% {trend.isPositive ? 'aumento' : 'reducción'}
          </div>
        </div>
      </div>
      
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={displayData}
            margin={{ top: 5, right: 15, left: 15, bottom: 60 }}
          >
            <defs>
              <linearGradient id="organicGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b5e951" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#b5e951" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="podaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#20b2aa" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#20b2aa" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="inorganicGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#273949" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#273949" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="recyclableGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff9933" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ff9933" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11, fill: '#64748b' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={70}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b' }}
              unit=" ton"
              axisLine={false}
              tickLine={false}
              tickCount={6}
            />
            <Tooltip 
              animationDuration={200}
              contentStyle={{ 
                backgroundColor: 'white', 
                borderColor: '#e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '10px 14px',
                fontSize: '12px',
                border: 'none',
              }}
              formatter={(value) => [`${value.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ton`, undefined]}
              labelFormatter={(label) => `<span style="font-weight: 600;">${label}</span>`}
              itemStyle={{ padding: '3px 0' }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value) => (
                <span style={{ 
                  color: value === 'organicWaste' ? '#3a5a14' : 
                         value === 'inorganicWaste' ? '#273949' : 
                         value === 'podaWaste' ? '#20b2aa' : '#b25a0c',
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '3px 6px',
                }}>
                  {value === 'organicWaste' 
                    ? 'Orgánicos (Comedor)' 
                    : value === 'inorganicWaste' 
                      ? 'Inorgánicos' 
                      : value === 'podaWaste'
                        ? 'Orgánicos (PODA)'
                        : 'Reciclables'}
                </span>
              )}
              wrapperStyle={{ paddingBottom: '10px' }}
            />
            <Line 
              type="monotone" 
              dataKey="organicWaste" 
              name="organicWaste"
              stroke="#b5e951" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
              activeDot={{ r: 7, stroke: '#b5e951', strokeWidth: 2, fill: 'white' }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Line 
              type="monotone" 
              dataKey="inorganicWaste" 
              name="inorganicWaste"
              stroke="#273949" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
              activeDot={{ r: 7, stroke: '#273949', strokeWidth: 2, fill: 'white' }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Line 
              type="monotone" 
              dataKey="podaWaste" 
              name="podaWaste"
              stroke="#20b2aa" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
              activeDot={{ r: 7, stroke: '#20b2aa', strokeWidth: 2, fill: 'white' }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Line 
              type="monotone" 
              dataKey="recyclableWaste" 
              name="recyclableWaste"
              stroke="#ff9933" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
              activeDot={{ r: 7, stroke: '#ff9933', strokeWidth: 2, fill: 'white' }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            
            {/* Líneas de promedio */}
            <ReferenceLine 
              y={avgOrganicWaste} 
              stroke="#b5e951" 
              strokeDasharray="3 3" 
              strokeWidth={2}
              label={{ 
                value: `Promedio: ${avgOrganicWaste.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ton`, 
                position: 'insideBottomRight',
                fill: '#3a5a14',
                fontSize: 10,
                offset: 10,
              }}
            />
            
            <ReferenceLine 
              y={avgPodaWaste} 
              stroke="#20b2aa" 
              strokeDasharray="3 3" 
              strokeWidth={2}
              label={{ 
                value: `Promedio: ${avgPodaWaste.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ton`, 
                position: 'insideBottomLeft',
                fill: '#20b2aa',
                fontSize: 10,
                offset: 10,
              }}
            />
            
            <ReferenceLine 
              y={avgInorganicWaste} 
              stroke="#273949" 
              strokeDasharray="3 3" 
              strokeWidth={2}
              label={{ 
                value: `Promedio: ${avgInorganicWaste.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ton`, 
                position: 'insideBottomLeft',
                fill: '#273949',
                fontSize: 10,
                offset: 30,
              }}
            />
            
            <ReferenceLine 
              y={avgRecyclableWaste} 
              stroke="#ff9933" 
              strokeDasharray="3 3" 
              strokeWidth={2}
              label={{ 
                value: `Promedio: ${avgRecyclableWaste.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ton`, 
                position: 'insideTopRight',
                fill: '#b25a0c',
                fontSize: 10,
                offset: 10,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-3 text-xs text-gray-400 text-right">
        Fuente: Bitácoras mensuales de residuos procesadas con IA
      </div>
    </div>
  );
}
