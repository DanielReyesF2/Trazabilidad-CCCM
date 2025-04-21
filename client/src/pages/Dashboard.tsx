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
    deviation: number;
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
    const totalRecyclable = wasteData.reduce((sum: number, item) => sum + (item.recyclableWaste || 0), 0);
    const total = totalOrganic + totalInorganic + totalRecyclable;
    
    // Calcular el porcentaje de desviación de relleno sanitario
    // La desviación es el porcentaje de residuos reciclables respecto a los residuos de relleno sanitario
    let deviation = 0;
    if (totalInorganic > 0 && totalRecyclable > 0) {
      deviation = (totalRecyclable / totalInorganic) * 100;
    }
    
    return {
      organicWaste: `${totalOrganic.toLocaleString('es-ES')} kg`,
      inorganicWaste: `${totalInorganic.toLocaleString('es-ES')} kg`,
      totalWaste: `${total.toLocaleString('es-ES')} kg`,
      deviation: `${deviation.toFixed(2)}%`
    };
  };
  
  const summaryData = getSummaryData();
  
  // Chart data from waste data
  const getChartData = () => {
    if (wasteData.length === 0) {
      // Return placeholder data if no real data exists
      return [
        { month: 'Ene 24', organicWaste: 2.1, inorganicWaste: 3.2 },
        { month: 'Feb 24', organicWaste: 1.9, inorganicWaste: 2.8 },
        { month: 'Mar 24', organicWaste: 2.3, inorganicWaste: 2.7 },
        { month: 'Abr 24', organicWaste: 2.6, inorganicWaste: 2.5 },
        { month: 'May 24', organicWaste: 2.9, inorganicWaste: 2.3 }
      ];
    }
    
    // Filtrar datos desde enero 2024 hasta ahora
    const startDate = new Date('2024-01-01');
    const filteredData = wasteData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
    
    // Mapeo de números de mes a abreviaturas en español
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    
    // Convertir a array con año y mes para poder ordenarlos
    const dataWithDates = filteredData.map(item => {
      const date = new Date(item.date);
      const monthIndex = date.getMonth();
      const yearShort = date.getFullYear().toString().substring(2);
      
      // Usar un formato consistente "Ene 24", "Feb 24", etc.
      const monthLabel = `${monthNames[monthIndex]} ${yearShort}`;
      
      return {
        ...item,
        year: date.getFullYear(),
        month: date.getMonth(),
        monthLabel
      };
    });
    
    // Ordenar por fecha
    dataWithDates.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    
    // Group data by month
    const groupedData: Record<string, { 
      organicWaste: number, 
      inorganicWaste: number, 
      recyclableWaste: number,
      sortKey: number 
    }> = {};
    
    dataWithDates.forEach((item) => {
      const sortKey = item.year * 100 + item.month; // Para mantener el orden
      
      if (!groupedData[item.monthLabel]) {
        groupedData[item.monthLabel] = { 
          organicWaste: 0, 
          inorganicWaste: 0,
          recyclableWaste: 0,
          sortKey 
        };
      }
      
      groupedData[item.monthLabel].organicWaste += item.organicWaste; // Mantener en kilogramos
      groupedData[item.monthLabel].inorganicWaste += item.inorganicWaste; // Mantener en kilogramos
      groupedData[item.monthLabel].recyclableWaste += (item.recyclableWaste || 0); // Mantener en kilogramos
    });
    
    // Convertir a array y ordenar cronológicamente
    return Object.entries(groupedData)
      .map(([month, data]) => ({
        month,
        organicWaste: Number(data.organicWaste.toFixed(1)),
        inorganicWaste: Number(data.inorganicWaste.toFixed(1)),
        recyclableWaste: Number(data.recyclableWaste.toFixed(1)),
        sortKey: data.sortKey
      }))
      .sort((a, b) => a.sortKey - b.sortKey);
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
