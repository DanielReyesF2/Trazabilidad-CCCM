import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, FileText, ChevronRight, BarChart2, AlertTriangle, RecycleIcon, Percent, FileDown } from 'lucide-react';
import { Client } from '@shared/schema';
import { Link } from 'wouter';
import { generateClientReport } from '@/lib/reportGenerator';
import { generateAndDownloadPDFReport } from '@/lib/jsPdfGenerator';

interface ClientsGridProps {
  selectedCategory?: string;
  selectedPeriod?: string;
}

export default function ClientsGrid({ selectedCategory, selectedPeriod }: ClientsGridProps) {
  // Fetch clients
  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    refetchOnWindowFocus: false
  });

  // Define interfaces for our data types
  interface Document {
    id: number;
    clientId: number;
    fileName: string;
    fileSize: number;
    processed: boolean;
    processingError?: string;
    uploadDate: Date;
  }

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

  // Get documents counts for each client
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    refetchOnWindowFocus: false
  });

  // Get alerts for each client
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    refetchOnWindowFocus: false
  });

  // Get waste data
  const { data: wasteData = [] } = useQuery<WasteData[]>({
    queryKey: ['/api/waste-data'],
    refetchOnWindowFocus: false
  });

  const getClientDocumentsCount = (clientId: number) => {
    return documents.filter((doc) => doc.clientId === clientId).length;
  };

  const getClientAlertsCount = (clientId: number) => {
    return alerts.filter((alert) => alert.clientId === clientId && !alert.resolved).length;
  };

  const getClientTotalWaste = (clientId: number) => {
    const clientWasteData = wasteData.filter((data) => data.clientId === clientId);
    return clientWasteData.reduce((sum: number, item) => sum + item.totalWaste, 0);
  };
  
  const getClientOrganicWaste = (clientId: number) => {
    const clientWasteData = wasteData.filter((data) => data.clientId === clientId);
    return clientWasteData.reduce((sum: number, item) => sum + item.organicWaste, 0);
  };
  
  const getClientInorganicWaste = (clientId: number) => {
    const clientWasteData = wasteData.filter((data) => data.clientId === clientId);
    return clientWasteData.reduce((sum: number, item) => sum + item.inorganicWaste, 0);
  };
  
  const getClientRecyclableWaste = (clientId: number) => {
    const clientWasteData = wasteData.filter((data) => data.clientId === clientId);
    return clientWasteData.reduce((sum: number, item) => sum + item.recyclableWaste, 0);
  };
  
  const getClientDeviation = (clientId: number) => {
    const clientWasteData = wasteData.filter((data) => data.clientId === clientId);
    // If no data, return null
    if (clientWasteData.length === 0) return null;
    
    // Get the latest waste data entry's deviation
    const sortedData = [...clientWasteData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedData[0].deviation;
  };
  
  // Calculate the growth percentage compared to previous period
  const calculateGrowth = (clientId: number, type: 'organic' | 'inorganic' | 'total' | 'deviation') => {
    const clientWasteData = wasteData.filter((data) => data.clientId === clientId);
    if (clientWasteData.length < 2) return { value: 0, positive: false };
    
    // Sort by date descending
    const sortedData = [...clientWasteData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const current = sortedData[0];
    const previous = sortedData[1];
    
    let currentValue = 0;
    let previousValue = 0;
    
    switch (type) {
      case 'organic':
        currentValue = current.organicWaste;
        previousValue = previous.organicWaste;
        break;
      case 'inorganic':
        currentValue = current.inorganicWaste;
        previousValue = previous.inorganicWaste;
        break;
      case 'total':
        currentValue = current.totalWaste;
        previousValue = previous.totalWaste;
        break;
      case 'deviation':
        currentValue = current.deviation;
        previousValue = previous.deviation;
        break;
    }
    
    if (previousValue === 0) return { value: 0, positive: false };
    
    const growthPercent = ((currentValue - previousValue) / previousValue) * 100;
    return {
      value: Math.abs(growthPercent).toFixed(1),
      positive: growthPercent > 0
    };
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-gray-200 rounded mb-4"></div>
            </CardContent>
            <CardFooter>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <Card className="col-span-full py-8">
        <CardContent className="text-center">
          <p className="text-gray-500 mb-4">No hay clientes registrados en la plataforma</p>
          <Button className="bg-lime hover:bg-lime-dark text-black">
            Agregar Primer Cliente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {clients.map((client: Client) => {
        const documentsCount = getClientDocumentsCount(client.id);
        const alertsCount = getClientAlertsCount(client.id);
        const totalWaste = getClientTotalWaste(client.id);
        const deviation = getClientDeviation(client.id);
        
        // Get metrics
        const organicWaste = getClientOrganicWaste(client.id);
        const inorganicWaste = getClientInorganicWaste(client.id);
        const organicGrowth = calculateGrowth(client.id, 'organic');
        const inorganicGrowth = calculateGrowth(client.id, 'inorganic');
        const totalGrowth = calculateGrowth(client.id, 'total');
        const deviationGrowth = calculateGrowth(client.id, 'deviation');
        
        return (
          <Card key={client.id} className="overflow-hidden transition-shadow hover:shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-md font-bold">{client.name}</CardTitle>
                <Badge variant={alertsCount > 0 ? "destructive" : "secondary"} className="ml-2">
                  {alertsCount > 0 ? `${alertsCount} alertas` : "Sin alertas"}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">{client.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Metric Cards Grid - Similar to screenshot */}
              <div className="grid grid-cols-2 gap-px bg-gray-200">
                {/* Organic Waste */}
                <div className="bg-white p-4">
                  <div className="text-gray-500 text-xs uppercase">Residuos Orgánicos (Comedor)</div>
                  <div className="flex items-baseline mt-1">
                    <div className="text-xl font-bold">
                      {organicWaste ? 
                        new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(organicWaste) : 
                        '0'} 
                      <span className="text-sm font-normal ml-1">kg</span>
                    </div>
                    <div className={`ml-auto text-xs ${organicGrowth.positive ? 'text-lime' : 'text-red-500'}`}>
                      {organicGrowth.positive ? '↑' : '↓'} {organicGrowth.value}%
                    </div>
                  </div>
                  <div className="mt-2 h-1 bg-gray-100 rounded-full">
                    <div 
                      className="h-1 bg-lime rounded-full" 
                      style={{ width: '78%' }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    78% de la meta mensual
                  </div>
                </div>
                
                {/* Inorganic Waste */}
                <div className="bg-white p-4">
                  <div className="text-gray-500 text-xs uppercase">Residuos Inorgánicos</div>
                  <div className="flex items-baseline mt-1">
                    <div className="text-xl font-bold">
                      {inorganicWaste ? 
                        new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(inorganicWaste) : 
                        '0'} 
                      <span className="text-sm font-normal ml-1">kg</span>
                    </div>
                    <div className={`ml-auto text-xs ${!inorganicGrowth.positive ? 'text-lime' : 'text-red-500'}`}>
                      {inorganicGrowth.positive ? '↑' : '↓'} {inorganicGrowth.value}%
                    </div>
                  </div>
                  <div className="mt-2 h-1 bg-gray-100 rounded-full">
                    <div 
                      className="h-1 bg-navy rounded-full" 
                      style={{ width: '92%' }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    92% de la meta mensual
                  </div>
                </div>
                
                {/* Total Waste */}
                <div className="bg-white p-4">
                  <div className="text-gray-500 text-xs uppercase">Total Residuos</div>
                  <div className="flex items-baseline mt-1">
                    <div className="text-xl font-bold">
                      {totalWaste ? 
                        new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(totalWaste) : 
                        '0'} 
                      <span className="text-sm font-normal ml-1">kg</span>
                    </div>
                    <div className={`ml-auto text-xs ${!totalGrowth.positive ? 'text-lime' : 'text-red-500'}`}>
                      {totalGrowth.positive ? '↑' : '↓'} {totalGrowth.value}%
                    </div>
                  </div>
                  <div className="mt-2 h-1 bg-gray-100 rounded-full">
                    <div 
                      className="h-1 bg-gray-500 rounded-full" 
                      style={{ width: '86%' }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    86% de la meta mensual
                  </div>
                </div>
                
                {/* Deviation */}
                <div className="bg-white p-4">
                  <div className="text-gray-500 text-xs uppercase">Desviación</div>
                  <div className="flex items-baseline mt-1">
                    <div className="text-xl font-bold">
                      {deviation !== null ? 
                        `${deviation}%` : 
                        '0%'}
                    </div>
                    <div className={`ml-auto text-xs ${deviationGrowth.positive ? 'text-lime' : 'text-red-500'}`}>
                      {deviationGrowth.positive ? '↑' : '↓'} {deviationGrowth.value}%
                    </div>
                  </div>
                  <div className="mt-2 h-1 bg-gray-100 rounded-full">
                    <div 
                      className="h-1 bg-orange-500 rounded-full" 
                      style={{ width: '42%' }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    42% del máximo permitido
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
              <Button variant="ghost" className="w-full justify-between" asChild>
                <Link href={`/clients/${client.id}`}>
                  <span>Ver detalles del cliente</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => {
                  // Filtrar datos de este cliente específico
                  const clientWasteData = wasteData.filter(item => item.clientId === client.id);
                  // Generar PDF
                  generateAndDownloadPDFReport(client, clientWasteData);
                }}
              >
                <FileDown className="h-4 w-4 mr-2" />
                <span>Descargar PDF</span>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}