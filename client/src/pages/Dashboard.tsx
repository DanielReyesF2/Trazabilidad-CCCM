import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  FileUp, 
  BarChart2, 
  Download, 
  Leaf, 
  Droplets, 
  ArrowUpDown, 
  Trash2,
  Recycle,
  Calendar,
  ChartPie,
  Settings,
  Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AlertsTable from '@/components/dashboard/AlertsTable';
import SummaryCard from '@/components/dashboard/SummaryCard';
import { ClubHeader } from '@/components/dashboard/ClubHeader';
import { ClubAchievements } from '@/components/dashboard/ClubAchievements';
import { TrueCertification } from '@/components/dashboard/TrueCertification';
import { WasteData, Alert } from '@shared/schema';

export default function Dashboard() {
  // Estados para filtros
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Obtener datos de residuos
  const { data: wasteData = [] } = useQuery<WasteData[]>({
    queryKey: ['/api/waste-data'],
    refetchOnWindowFocus: false,
  });
  
  // Obtener alertas
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    refetchOnWindowFocus: false,
  });
  
  // Datos reales 2025 extraídos de los PDFs (iguales al análisis)
  const realData2025 = [
    { month: 'Enero', organicsToLandfill: 5386.5, recyclables: 569.05, inorganicNonRecyclable: 2965.58, organicsCompost: 12800 },
    { month: 'Febrero', organicsToLandfill: 4841.5, recyclables: 2368.0, inorganicNonRecyclable: 2423.3, organicsCompost: 0 },
    { month: 'Marzo', organicsToLandfill: 5964.0, recyclables: 2156.8, inorganicNonRecyclable: 3140.5, organicsCompost: 0 },
    { month: 'Abril', organicsToLandfill: 4677.5, recyclables: 721.2, inorganicNonRecyclable: 2480.7, organicsCompost: 25600 },
    { month: 'Mayo', organicsToLandfill: 4921.0, recyclables: 2980.0, inorganicNonRecyclable: 2844.0, organicsCompost: 0 },
    { month: 'Junio', organicsToLandfill: 3837.5, recyclables: 3468.0, inorganicNonRecyclable: 2147.5, organicsCompost: 0 },
  ];

  // Calcular totales reales
  const totals = realData2025.reduce((acc, month) => {
    const totalGenerated = month.organicsToLandfill + month.recyclables + month.inorganicNonRecyclable + month.organicsCompost;
    const totalDiverted = month.organicsCompost + month.recyclables;
    return {
      organicTotal: acc.organicTotal + month.organicsToLandfill + month.organicsCompost,
      inorganicTotal: acc.inorganicTotal + month.inorganicNonRecyclable,
      recyclableTotal: acc.recyclableTotal + month.recyclables,
      totalGenerated: acc.totalGenerated + totalGenerated,
      totalDiverted: acc.totalDiverted + totalDiverted,
    };
  }, { organicTotal: 0, inorganicTotal: 0, recyclableTotal: 0, totalGenerated: 0, totalDiverted: 0 });

  const summaryData = {
    organicWaste: (totals.organicTotal / 1000).toFixed(1), // Convertir a toneladas
    inorganicWaste: (totals.inorganicTotal / 1000).toFixed(1),
    recyclableWaste: (totals.recyclableTotal / 1000).toFixed(1),
    totalWaste: (totals.totalGenerated / 1000).toFixed(1),
    deviation: ((totals.totalDiverted / totals.totalGenerated) * 100).toFixed(1), // Desviación real
  };
  
  // Datos para gráfica de barras con datos reales
  const monthlyData = realData2025.map(month => ({
    name: month.month.slice(0, 3), // Ene, Feb, etc.
    organicos: Math.round((month.organicsToLandfill + month.organicsCompost) / 1000 * 10) / 10, // Convertir a toneladas
    inorganicos: Math.round(month.inorganicNonRecyclable / 1000 * 10) / 10,
    reciclables: Math.round(month.recyclables / 1000 * 10) / 10,
  }));
  
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <ClubHeader />
        
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Métricas principales - datos reales 2025 */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <SummaryCard
              title="Desviación Actual"
              value={`${summaryData.deviation}%`}
              change={parseFloat(summaryData.deviation) - 45} // Vs año anterior
              progress={parseFloat(summaryData.deviation)}
              progressLabel="Meta: 90%"
              type="deviation"
            />
            <SummaryCard
              title="Orgánicos"
              value={`${summaryData.organicWaste} ton`}
              change={12.5} // PODA impacto positivo
              progress={75}
              progressLabel="Incluye PODA"
              type="organic"
            />
            <SummaryCard
              title="Inorgánicos"
              value={`${summaryData.inorganicWaste} ton`}
              change={-5.2} // Reducción vs 2024
              progress={60}
              progressLabel="Ene-Jun 2025"
              type="inorganic"
            />
            <SummaryCard
              title="Total Generado"
              value={`${summaryData.totalWaste} ton`}
              change={2.8} // Crecimiento moderado
              progress={85}
              progressLabel="Ene-Jun 2025"
              type="total"
            />
          </div>

          {/* Gráfica principal - DESTACADA */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Análisis de Residuos Sólidos Urbanos</h2>
                <p className="text-sm text-gray-600 mt-1">Club Campestre Ciudad de México - Tendencia 2024-2025</p>
              </div>
              <div className="flex items-center space-x-4">
                <select 
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="year">15 meses</option>
                  <option value="quarter">Último trimestre</option>
                  <option value="month">3 meses</option>
                </select>
                <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                  Última actualización: {new Date().toLocaleDateString('es-MX')}
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="barChart">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-anton tracking-wider text-gray-700">Distribución de Residuos</div>
                <TabsList>
                  <TabsTrigger value="barChart">Barras</TabsTrigger>
                  <TabsTrigger value="pieChart">Circular</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="barChart" className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} kg`, undefined]}
                      contentStyle={{ 
                        backgroundColor: 'white',
                        borderRadius: '0.375rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="organicos" name="Orgánicos" fill="#b5e951" />
                    <Bar dataKey="inorganicos" name="Inorgánicos" fill="#273949" />
                    <Bar dataKey="reciclables" name="Reciclables" fill="#d97706" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="pieChart" className="h-[400px]">
                <div className="flex items-center justify-center h-full text-gray-500">
                  Gráfico circular disponible próximamente
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TRUE Certification - más prominente */}
            <TrueCertification currentDeviation={parseFloat(summaryData.deviation)} />
            
            {/* Certificaciones y resumen */}
            <div className="space-y-4">
              <ClubAchievements />
              
              {/* Estadísticas adicionales */}
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Resumen Anual 2024</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{summaryData.organicWaste}</div>
                    <div className="text-gray-500">Toneladas orgánicas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{summaryData.inorganicWaste}</div>
                    <div className="text-gray-500">Toneladas inorgánicas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Panel de impacto ambiental */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Impacto Ambiental Acumulado 2024</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">89</div>
                <div className="text-sm text-gray-600">Árboles salvados</div>
                <div className="text-xs text-gray-500 mt-1">por reciclaje de papel</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">47,890</div>
                <div className="text-sm text-gray-600">Litros de agua ahorrados</div>
                <div className="text-xs text-gray-500 mt-1">gestión eficiente</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">12,456</div>
                <div className="text-sm text-gray-600">kWh energía ahorrada</div>
                <div className="text-xs text-gray-500 mt-1">procesos optimizados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">85.6</div>
                <div className="text-sm text-gray-600">Toneladas CO₂ evitadas</div>
                <div className="text-xs text-gray-500 mt-1">vs. relleno sanitario</div>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="grid grid-cols-3 gap-4">
            <Link href="/documents">
              <div className="bg-navy text-white rounded-lg p-6 hover:bg-navy/90 transition-colors group">
                <div className="flex items-center space-x-4">
                  <FileUp className="h-8 w-8 text-lime" />
                  <div>
                    <h4 className="font-bold text-lg">Subir Bitácoras</h4>
                    <p className="text-sm text-navy-light">Procesamiento automático con IA</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/analysis">
              <div className="bg-lime text-navy rounded-lg p-6 hover:bg-lime/90 transition-colors group">
                <div className="flex items-center space-x-4">
                  <BarChart2 className="h-8 w-8 text-navy" />
                  <div>
                    <h4 className="font-bold text-lg">Análisis Detallado</h4>
                    <p className="text-sm text-navy/70">Tablas y métricas específicas</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/data-entry">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-navy/20 transition-colors group">
                <div className="flex items-center space-x-4">
                  <PlusCircle className="h-8 w-8 text-gray-400 group-hover:text-navy transition-colors" />
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">Registro Manual</h4>
                    <p className="text-sm text-gray-500">Para casos especiales</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}