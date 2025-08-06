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
        <ClubHeader />
        
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Métricas principales - más compactas */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <SummaryCard
              title="Desviación Actual"
              value={`${summaryData.deviation}%`}
              change={2.3}
              progress={summaryData.deviation}
              progressLabel="Meta: 90%"
              type="deviation"
            />
            <SummaryCard
              title="Orgánicos"
              value={`${summaryData.organicWaste} ton`}
              change={-8.2}
              progress={75}
              progressLabel="Incluye PODA"
              type="organic"
            />
            <SummaryCard
              title="Inorgánicos"
              value={`${summaryData.inorganicWaste} ton`}
              change={4.1}
              progress={60}
              progressLabel="Total año"
              type="inorganic"
            />
            <SummaryCard
              title="Total"
              value={`${summaryData.totalWaste} ton`}
              change={-2.5}
              progress={85}
              progressLabel="2024"
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
            
            <div className="h-[400px]">
              <TrendChart data={chartData} />
            </div>
            
            {/* Leyenda mejorada */}
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Orgánicos</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-teal-500 rounded"></div>
                <span>PODA</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Inorgánicos</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Reciclables</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TRUE Certification - más prominente */}
            <TrueCertification currentDeviation={summaryData.deviation} />
            
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