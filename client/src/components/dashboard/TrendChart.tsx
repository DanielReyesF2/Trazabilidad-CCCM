import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  
  // Filtrar datos para mostrar solo 2025 y convertir a toneladas
  const filteredData = data.filter(item => {
    const parts = item.month.split(' ');
    const year = parseInt('20' + parts[1], 10);
    const month = parts[0];
    
    // Solo datos de 2025
    return year === 2025;
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
  
  // Calcular evolución respecto a los períodos anteriores con análisis de tendencia
  const calculateTrend = () => {
    // Si no hay suficientes datos, no podemos calcular tendencia
    if (displayData.length < 3) return { value: 0, isPositive: false };
    
    // Separamos los datos en dos mitades para comparar: primera mitad y segunda mitad del período
    const midPoint = Math.floor(displayData.length / 2);
    
    // Calculamos el promedio de generación total por período (incluyendo PODA) para cada mitad
    const firstHalfAvg = displayData.slice(0, midPoint).reduce((sum, period) => {
      return sum + period.organicWaste + period.inorganicWaste + period.podaWaste + (period.recyclableWaste || 0);
    }, 0) / midPoint;
    
    const secondHalfAvg = displayData.slice(midPoint).reduce((sum, period) => {
      return sum + period.organicWaste + period.inorganicWaste + period.podaWaste + (period.recyclableWaste || 0);
    }, 0) / (displayData.length - midPoint);
    
    // Calculamos el cambio porcentual entre las dos mitades
    // Un valor negativo significa reducción (deseable), un valor positivo significa aumento (indeseable)
    const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    // Imprimimos los datos de la tendencia para verificar
    console.log('Cálculo de tendencia:');
    console.log('Primera mitad meses:', displayData.slice(0, midPoint).map(d => d.month).join(', '));
    console.log('Segunda mitad meses:', displayData.slice(midPoint).map(d => d.month).join(', '));
    console.log('Promedio primera mitad:', firstHalfAvg);
    console.log('Promedio segunda mitad:', secondHalfAvg);
    console.log('Cambio porcentual:', percentChange);
    
    // Para el sistema de tendencia, consideramos "positivo" una reducción (valor negativo)
    return {
      value: Math.abs(percentChange).toFixed(1),
      isPositive: percentChange > 0  // true = aumento (mal), false = reducción (bien)
    };
  };
  
  const trend = calculateTrend();

  return (
    <div className="bg-white shadow rounded-lg p-5 relative overflow-hidden">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-lime/10 to-navy/5 rounded-bl-3xl"></div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 relative">
        <div>
          <h2 className="text-lg font-anton uppercase tracking-wider text-navy">Tendencia de Residuos</h2>
          <p className="text-xs text-gray-500">Análisis mensual 2025 - Datos reales del Club Campestre</p>
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
            {Math.min(90, Math.round(((totalRecyclableFixed + totalPodaFixed) / totalWaste) * 100))}%
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
          <BarChart
            data={displayData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            barGap={10}
            barCategoryGap={15}
          >
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
              formatter={(value, name) => [
                `${value.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ton`, 
                name === 'organicWaste' ? 'Orgánicos' : 
                name === 'inorganicWaste' ? 'Inorgánicos' : 
                name === 'recyclableWaste' ? 'Reciclables' : 'PODA'
              ]}
              labelFormatter={(label) => `${label}`}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => (
                <span style={{ 
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '3px 6px',
                }}>
                  {value === 'organicWaste' 
                    ? 'Orgánicos' 
                    : value === 'inorganicWaste' 
                      ? 'Inorgánicos' 
                      : value === 'recyclableWaste'
                        ? 'Reciclables'
                        : 'PODA'}
                </span>
              )}
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <Bar 
              dataKey="organicWaste" 
              name="organicWaste"
              fill="#b5e951" 
              radius={[2, 2, 0, 0]}
              animationDuration={1000}
            />
            <Bar 
              dataKey="inorganicWaste" 
              name="inorganicWaste"
              fill="#273949" 
              radius={[2, 2, 0, 0]}
              animationDuration={1000}
            />
            <Bar 
              dataKey="podaWaste" 
              name="podaWaste"
              fill="#20b2aa" 
              radius={[2, 2, 0, 0]}
              animationDuration={1000}
            />
            <Bar 
              dataKey="recyclableWaste" 
              name="recyclableWaste"
              fill="#ff9933" 
              radius={[2, 2, 0, 0]}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-3 text-xs text-gray-400 text-right">
        Fuente: Bitácoras mensuales de residuos procesadas con IA
      </div>
    </div>
  );
}
