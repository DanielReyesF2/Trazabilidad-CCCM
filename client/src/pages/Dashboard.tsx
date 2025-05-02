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
import TrendChart from '@/components/dashboard/TrendChart';
import AlertsTable from '@/components/dashboard/AlertsTable';
import { ClubHeader } from '@/components/dashboard/ClubHeader';
import { ClubAchievements } from '@/components/dashboard/ClubAchievements';
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
  
  // Calcular datos de resumen - convertir kg a toneladas
  const summaryData = {
    organicWaste: 147.77, // Incluye PODA y orgánicos
    inorganicWaste: 61.28,
    totalWaste: 230.92,
    deviation: 37.18, // (Reciclable + PODA) / Total × 100
  };
  
  // Preparar datos para el gráfico - se espera una estructura específica
  const chartData = [
    { month: 'Ene 24', organicWaste: 5.52, podaWaste: 16.00, inorganicWaste: 4.55, recyclableWaste: 0.92 },
    { month: 'Feb 24', organicWaste: 6.19, podaWaste: 0.00, inorganicWaste: 4.06, recyclableWaste: 0.84 },
    { month: 'Mar 24', organicWaste: 5.94, podaWaste: 0.00, inorganicWaste: 4.10, recyclableWaste: 0.98 },
    { month: 'Abr 24', organicWaste: 7.42, podaWaste: 16.00, inorganicWaste: 4.39, recyclableWaste: 1.03 },
    { month: 'May 24', organicWaste: 6.61, podaWaste: 0.00, inorganicWaste: 4.17, recyclableWaste: 1.35 },
    { month: 'Jun 24', organicWaste: 4.93, podaWaste: 0.00, inorganicWaste: 4.38, recyclableWaste: 0.00 },
    { month: 'Jul 24', organicWaste: 5.05, podaWaste: 0.00, inorganicWaste: 3.34, recyclableWaste: 0.66 },
    { month: 'Ago 24', organicWaste: 5.46, podaWaste: 0.00, inorganicWaste: 5.73, recyclableWaste: 0.63 },
    { month: 'Sep 24', organicWaste: 5.67, podaWaste: 0.00, inorganicWaste: 4.69, recyclableWaste: 2.19 },
    { month: 'Oct 24', organicWaste: 6.05, podaWaste: 0.00, inorganicWaste: 4.50, recyclableWaste: 0.76 },
    { month: 'Nov 24', organicWaste: 5.86, podaWaste: 0.00, inorganicWaste: 4.71, recyclableWaste: 0.98 },
    { month: 'Dic 24', organicWaste: 6.21, podaWaste: 16.00, inorganicWaste: 5.20, recyclableWaste: 1.13 },
    { month: 'Ene 25', organicWaste: 6.87, podaWaste: 0.00, inorganicWaste: 3.75, recyclableWaste: 1.14 },
    { month: 'Feb 25', organicWaste: 5.07, podaWaste: 0.00, inorganicWaste: 2.83, recyclableWaste: 5.07 },
    { month: 'Mar 25', organicWaste: 4.52, podaWaste: 0.00, inorganicWaste: 3.56, recyclableWaste: 3.18 },
  ];
  
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-6 px-4">
          {/* Header con branding personalizado del Club Campestre */}
          <ClubHeader />
          
          {/* KPI Cards - versión más minimalista */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Índice de Desviación</p>
                  <h3 className="text-2xl font-bold text-navy mt-1">{summaryData.deviation}%</h3>
                </div>
                <div className="bg-lime/10 p-2 rounded-full">
                  <ChartPie className="h-5 w-5 text-lime" />
                </div>
              </div>
              <div className="mt-auto">
                <div className="w-full h-1 bg-gray-100 rounded-full mt-2">
                  <div className="h-1 bg-lime rounded-full" style={{ width: `${Math.min(100, summaryData.deviation)}%` }}></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-xs ${summaryData.deviation > 35 ? "text-green-600" : "text-amber-600"}`}>
                    {summaryData.deviation > 35 ? "Óptimo" : "Mejorable"}
                  </span>
                  <span className="text-xs text-gray-500">Meta: 90%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Residuos Orgánicos</p>
                  <h3 className="text-2xl font-bold text-navy mt-1">{summaryData.organicWaste} ton</h3>
                </div>
                <div className="bg-green-50 p-2 rounded-full">
                  <Leaf className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Incluye residuos de comedor y PODA</p>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center text-xs">
                  <span className={`mr-1 ${8.2 >= 0 ? "text-red-500" : "text-green-500"}`}>
                    {8.2 >= 0 ? "↑" : "↓"}
                  </span>
                  <span>{Math.abs(8.2)}% vs mes anterior</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Residuos Inorgánicos</p>
                  <h3 className="text-2xl font-bold text-navy mt-1">{summaryData.inorganicWaste} ton</h3>
                </div>
                <div className="bg-blue-50 p-2 rounded-full">
                  <Trash2 className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Residuos no reciclables</p>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center text-xs">
                  <span className={`mr-1 ${-5.1 >= 0 ? "text-red-500" : "text-green-500"}`}>
                    {-5.1 >= 0 ? "↑" : "↓"}
                  </span>
                  <span>{Math.abs(-5.1)}% vs mes anterior</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Reciclables</p>
                  <h3 className="text-2xl font-bold text-navy mt-1">21.87 ton</h3>
                </div>
                <div className="bg-amber-50 p-2 rounded-full">
                  <Recycle className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Valorización efectiva</p>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center text-xs">
                  <span className="text-green-500 mr-1">↑</span>
                  <span>12.4% vs mes anterior</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Logros de sostenibilidad del Club Campestre */}
          <ClubAchievements />
          
          {/* Gráfica de tendencias de residuos - versión minimalista */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-anton uppercase tracking-wider text-navy">Tendencia de Residuos</h2>
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Enero 2024 - Mayo 2025
                </div>
              </div>
              
              <div className="flex space-x-1">
                <select 
                  className="bg-gray-50 border border-gray-200 text-gray-700 py-1 px-3 rounded-lg text-xs"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="month">Último mes</option>
                  <option value="quarter">Último trimestre</option>
                  <option value="year">Último año</option>
                </select>
                <select 
                  className="bg-gray-50 border border-gray-200 text-gray-700 py-1 px-3 rounded-lg text-xs"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Todos los residuos</option>
                  <option value="organic">Orgánicos</option>
                  <option value="inorganic">Inorgánicos</option>
                  <option value="recyclable">Reciclables</option>
                </select>
              </div>
            </div>
            
            <div className="h-[300px]">
              <TrendChart data={chartData} />
            </div>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="flex justify-between">
                  <div className="text-xs text-gray-500">Reducción CO₂</div>
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-1"></div>
                </div>
                <div className="text-lg font-bold text-green-700 mt-1">45.2 ton</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="flex justify-between">
                  <div className="text-xs text-gray-500">Tendencia</div>
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1"></div>
                </div>
                <div className="text-lg font-bold text-blue-700 mt-1">-16.7%</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="flex justify-between">
                  <div className="text-xs text-gray-500">Árboles salvados</div>
                  <div className="h-2 w-2 rounded-full bg-lime mt-1"></div>
                </div>
                <div className="text-lg font-bold text-lime-700 mt-1">498</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="flex justify-between">
                  <div className="text-xs text-gray-500">Agua ahorrada</div>
                  <div className="h-2 w-2 rounded-full bg-cyan-500 mt-1"></div>
                </div>
                <div className="text-lg font-bold text-cyan-700 mt-1">784,205 L</div>
              </div>
            </div>
          </div>
          
          {/* Alertas y acceso rápido */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-anton uppercase tracking-wider text-navy">Acceso Rápido</h2>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-navy">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/data-entry">
                    <div className="flex p-4 bg-lime/10 rounded-lg hover:bg-lime/20 transition-colors">
                      <div className="bg-lime rounded-full p-2 mr-4">
                        <PlusCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">Registrar Residuos</h3>
                        <p className="text-sm text-gray-500 mt-1">Ingresa los datos de generación del día</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/documents">
                    <div className="flex p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="bg-gray-500 rounded-full p-2 mr-4">
                        <FileUp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">Subir Documento</h3>
                        <p className="text-sm text-gray-500 mt-1">Carga una nueva bitácora o reporte</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/clients/4">
                    <div className="flex p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="bg-navy rounded-full p-2 mr-4">
                        <BarChart2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">Ver Análisis</h3>
                        <p className="text-sm text-gray-500 mt-1">Consulta análisis detallado de datos</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/reports">
                    <div className="flex p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="bg-blue-500 rounded-full p-2 mr-4">
                        <Download className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">Exportar Reporte</h3>
                        <p className="text-sm text-gray-500 mt-1">Descarga un informe en PDF</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-anton uppercase tracking-wider text-navy">Alertas</h2>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                    {(alerts as Alert[]).length} pendientes
                  </span>
                </div>
                <AlertsTable alerts={alerts as Alert[]} />
              </div>
            </div>
          </div>
          
          {/* Historial de Registros - versión minimalista */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-anton uppercase tracking-wider text-navy">Historial de Registros</h2>
                <Link href="/clients/4?tab=wastedata">
                  <Button variant="outline" size="sm">
                    Ver todos
                  </Button>
                </Link>
              </div>
              
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Fecha</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Orgánico</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">PODA</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Inorgánico</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Reciclable</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Total</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Desviación</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(wasteData as WasteData[])
                      .sort((a: WasteData, b: WasteData) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5) // Mostrar solo los 5 más recientes para una vista minimalista
                      .map((record: WasteData, index: number) => {
                        const date = new Date(record.date);
                        const formattedDate = date.toLocaleDateString('es-MX', {
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric'
                        });
                        
                        // Convertir kg a toneladas para mostrar
                        const organicTons = (record.organicWaste || 0) / 1000;
                        const inorganicTons = (record.inorganicWaste || 0) / 1000;
                        const recyclableTons = (record.recyclableWaste || 0) / 1000;
                        const podaTons = record.rawData?.poda ? record.rawData.poda / 1000 : 0;
                        const totalTons = organicTons + inorganicTons + recyclableTons + podaTons;
                        
                        return (
                          <tr key={record.id} className="border-b border-gray-100">
                            <td className="px-4 py-3 font-medium text-gray-900">{formattedDate}</td>
                            <td className="px-4 py-3 text-gray-500">{organicTons.toFixed(2)} ton</td>
                            <td className="px-4 py-3 text-gray-500">{podaTons.toFixed(2)} ton</td>
                            <td className="px-4 py-3 text-gray-500">{inorganicTons.toFixed(2)} ton</td>
                            <td className="px-4 py-3 text-gray-500">{recyclableTons.toFixed(2)} ton</td>
                            <td className="px-4 py-3 text-gray-500">{totalTons.toFixed(2)} ton</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                (record.deviation || 0) > 30 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                              }`}>
                                {(record.deviation || 0).toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link href={`/clients/4/waste/${record.id}`}>
                                <Button variant="ghost" size="sm" className="text-navy hover:text-lime">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    {(wasteData as WasteData[]).length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                          No hay registros disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}