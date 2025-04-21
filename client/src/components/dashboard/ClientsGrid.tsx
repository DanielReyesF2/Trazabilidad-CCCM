import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, FileText, ChevronRight, BarChart2, AlertTriangle } from 'lucide-react';
import { Client } from '@shared/schema';
import { Link } from 'wouter';

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
            <CardContent>
              <div className="grid grid-cols-2 gap-4 my-2">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Documentos</p>
                    <p className="font-semibold">{documentsCount}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <BarChart2 className="h-4 w-4 mr-2 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Residuos</p>
                    <p className="font-semibold">{totalWaste > 0 ? `${totalWaste.toFixed(1)} ton` : 'Sin datos'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-100">
              <Link href={`/clients/${client.id}`} className="w-full">
                <Button variant="ghost" className="w-full justify-between">
                  <span>Ver detalles del cliente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}