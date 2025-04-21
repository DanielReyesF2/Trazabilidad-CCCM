import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import SummaryCard from '@/components/dashboard/SummaryCard';
import TrendChart from '@/components/dashboard/TrendChart';
import AlertsTable from '@/components/dashboard/AlertsTable';
import ClientsGrid from '@/components/dashboard/ClientsGrid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, PlusCircle, ArrowUpDown, UserPlus, FileUp } from 'lucide-react';
import { Link } from 'wouter';

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Define interfaces for our data types
  interface Alert {
    id: number;
    clientId: number;
    type: string;
    message: string;
    resolved: boolean;
    documentId?: number;
    date: Date;
  }

  interface WasteData {
    id: number;
    clientId: number;
    documentId: number;
    date: Date;
    organicWaste: number;
    inorganicWaste: number;
    recyclableWaste: number;
    totalWaste: number;
    rawData: Record<string, any[]>;
  }

  // Fetch alerts
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    refetchOnWindowFocus: false
  });
  
  // Fetch waste data
  const { data: wasteData = [] } = useQuery<WasteData[]>({
    queryKey: ['/api/waste-data'],
    refetchOnWindowFocus: false
  });
  
  // Calculate summary data
  const getSummaryData = () => {
    const totalOrganic = wasteData.reduce((sum: number, item) => sum + item.organicWaste, 0);
    const totalInorganic = wasteData.reduce((sum: number, item) => sum + item.inorganicWaste, 0);
    const total = totalOrganic + totalInorganic;
    
    return {
      organicWaste: `${totalOrganic.toFixed(1)} ton`,
      inorganicWaste: `${totalInorganic.toFixed(1)} ton`,
      totalWaste: `${total.toFixed(1)} ton`,
      deviation: "4.2%"  // This would be calculated based on targets in a real implementation
    };
  };
  
  const summaryData = getSummaryData();
  
  // Chart data from waste data
  const getChartData = () => {
    if (wasteData.length === 0) {
      // Return placeholder data if no real data exists
      return [
        { month: 'Mayo', organicWaste: 2.1, inorganicWaste: 3.2 },
        { month: 'Junio', organicWaste: 1.9, inorganicWaste: 2.8 },
        { month: 'Julio', organicWaste: 2.3, inorganicWaste: 2.7 },
        { month: 'Agosto', organicWaste: 2.6, inorganicWaste: 2.5 },
        { month: 'Sept', organicWaste: 2.9, inorganicWaste: 2.3 },
        { month: 'Oct', organicWaste: 2.7, inorganicWaste: 2.6 },
        { month: 'Nov', organicWaste: 3.1, inorganicWaste: 2.4 }
      ];
    }
    
    // Group data by month
    const groupedData: Record<string, { organicWaste: number, inorganicWaste: number }> = {};
    
    wasteData.forEach((item) => {
      const date = new Date(item.date);
      const month = date.toLocaleString('es-ES', { month: 'short' });
      
      if (!groupedData[month]) {
        groupedData[month] = { organicWaste: 0, inorganicWaste: 0 };
      }
      
      groupedData[month].organicWaste += item.organicWaste;
      groupedData[month].inorganicWaste += item.inorganicWaste;
    });
    
    return Object.entries(groupedData).map(([month, data]) => ({
      month,
      ...data
    }));
  };
  
  const chartData = getChartData();
  
  return (
    <AppLayout>
      <div className="p-5">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-anton text-gray-800 uppercase tracking-wider">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Visualiza clientes y gestión de residuos</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 md:mt-0 md:ml-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Link href="/clients/new">
                <Button size="sm" variant="outline" className="border-green-500 text-green-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </Link>
              <Link href="/documents">
                <Button size="sm" className="bg-lime hover:bg-lime-dark text-black">
                  <FileUp className="w-4 h-4 mr-2" />
                  Cargar Documento
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="md:flex md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div>
                  <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Último mes</SelectItem>
                      <SelectItem value="quarter">Último trimestre</SelectItem>
                      <SelectItem value="year">Último año</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      <SelectItem value="organic">Residuos Orgánicos</SelectItem>
                      <SelectItem value="inorganic">Residuos Inorgánicos</SelectItem>
                      <SelectItem value="recyclable">Reciclables</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Button 
                  className="w-full md:w-auto bg-navy hover:bg-navy-light"
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Ordenar
                </Button>
              </div>
            </div>
          </div>

          {/* Clients Grid */}
          <div className="mb-8">
            <h2 className="text-lg font-anton text-gray-800 uppercase tracking-wider mb-4">Clientes</h2>
            <ClientsGrid selectedCategory={selectedCategory} selectedPeriod={selectedPeriod} />
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 my-6">
            <SummaryCard
              title="Residuos Orgánicos"
              value={summaryData.organicWaste}
              change={8.2}
              progress={78}
              progressLabel="78% de la meta mensual"
              type="organic"
            />
            
            <SummaryCard
              title="Residuos Inorgánicos"
              value={summaryData.inorganicWaste}
              change={-5.1}
              progress={92}
              progressLabel="92% de la meta mensual"
              type="inorganic"
            />
            
            <SummaryCard
              title="Total Residuos"
              value={summaryData.totalWaste}
              change={-2.8}
              progress={86}
              progressLabel="86% de la meta mensual"
              type="total"
            />
            
            <SummaryCard
              title="Desviación"
              value={summaryData.deviation}
              change={1.5}
              progress={42}
              progressLabel="42% del máximo permitido"
              type="deviation"
            />
          </div>
          
          {/* Charts and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TrendChart data={chartData} />
            </div>
            
            <div>
              <AlertsTable alerts={alerts} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
