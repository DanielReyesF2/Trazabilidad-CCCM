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
        
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* TRUE Certification */}
            <TrueCertification currentDeviation={summaryData.deviation} />
            
            {/* Certificaciones */}
            <ClubAchievements />
            
            {/* Gráfico compacto */}
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Tendencia</h3>
              <div className="h-[200px]">
                <TrendChart data={chartData} />
              </div>
            </div>
          </div>
          
          {/* Acciones rápidas */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Link href="/data-entry">
              <div className="bg-white border border-gray-100 rounded-lg p-4 hover:border-navy/20 transition-colors">
                <div className="flex items-center space-x-3">
                  <PlusCircle className="h-5 w-5 text-lime" />
                  <div>
                    <h4 className="font-medium text-gray-900">Registrar Datos</h4>
                    <p className="text-xs text-gray-500">Agregar residuos</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/documents">
              <div className="bg-white border border-gray-100 rounded-lg p-4 hover:border-navy/20 transition-colors">
                <div className="flex items-center space-x-3">
                  <FileUp className="h-5 w-5 text-navy" />
                  <div>
                    <h4 className="font-medium text-gray-900">Subir PDF</h4>
                    <p className="text-xs text-gray-500">Bitácoras RSR</p>
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