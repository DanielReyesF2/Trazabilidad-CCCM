import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileDown } from 'lucide-react';
import { Client, WasteData } from '@shared/schema';
import { generateAndDownloadPDFReport } from '@/lib/jsPdfGenerator';

// Define los periodos disponibles
const PREDEFINED_PERIODS = {
  '2025_FULL': { name: 'Reporte Anual 2025', filter: (data: WasteData) => {
    const date = new Date(data.date);
    return date.getFullYear() === 2025;
  }},
  '2025_Q1': { name: 'Reporte 2025 (Enero-Febrero)', filter: (data: WasteData) => {
    const date = new Date(data.date);
    return date.getFullYear() === 2025 && date.getMonth() <= 1;  // Enero (0) y Febrero (1)
  }},
  '2025_Q2': { name: 'Reporte 2025 (Marzo-Abril)', filter: (data: WasteData) => {
    const date = new Date(data.date);
    return date.getFullYear() === 2025 && (date.getMonth() === 2 || date.getMonth() === 3);  // Marzo (2) y Abril (3)
  }}
};

type Period = keyof typeof PREDEFINED_PERIODS;

export default function ReportGenerator() {
  const [_, params] = useRoute<{ id: string }>('/reports/:id');
  const clientId = params ? parseInt(params.id) : 0;
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('2025_FULL');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch client
  const { data: client, isLoading: isClientLoading } = useQuery<Client>({
    queryKey: ['/api/clients', clientId],
    queryFn: async ({ queryKey }) => {
      const [_, clientId] = queryKey;
      const res = await fetch(`/api/clients/${clientId}`);
      if (!res.ok) throw new Error('Failed to fetch client');
      return await res.json();
    },
    enabled: !!clientId,
    refetchOnWindowFocus: false
  });
  
  // Fetch waste data
  const { data: wasteData = [], isLoading: isWasteDataLoading } = useQuery<WasteData[]>({
    queryKey: ['/api/waste-data', clientId],
    queryFn: async ({ queryKey }) => {
      const [_, clientId] = queryKey;
      const res = await fetch(`/api/waste-data?clientId=${clientId}`);
      if (!res.ok) throw new Error('Failed to fetch waste data');
      return await res.json();
    },
    enabled: !!clientId,
    refetchOnWindowFocus: false
  });

  const isLoading = isClientLoading || isWasteDataLoading;

  const handleGenerateReport = async () => {
    if (!client) return;
    
    setIsGenerating(true);
    try {
      // Filtrar datos según periodo seleccionado
      const filteredData = wasteData.filter(PREDEFINED_PERIODS[selectedPeriod].filter);
      
      if (filteredData.length === 0) {
        alert('No hay datos disponibles para el período seleccionado');
        return;
      }
      
      // Generar reporte con los datos filtrados
      await generateAndDownloadPDFReport(client, filteredData);
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      alert('Ocurrió un error al generar el reporte');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-5">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumb and Title */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <ChevronLeft className="h-4 w-4" />
              <Link href={`/clients/${clientId}`} className="text-sm text-blue-600 hover:underline">
                Volver al Cliente
              </Link>
            </div>
            <h1 className="text-2xl font-anton text-gray-800 uppercase tracking-wider">Generador de Reportes</h1>
            {client && (
              <p className="text-gray-500 mt-1">Cliente: {client.name}</p>
            )}
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="md:col-span-2">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800">
                  <CardTitle className="text-white flex items-center">
                    <FileDown className="mr-2 h-5 w-5" />
                    Reportes por Período
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    Selecciona un período específico para generar un reporte detallado
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Período del Reporte
                      </label>
                      <Select 
                        value={selectedPeriod} 
                        onValueChange={(value) => setSelectedPeriod(value as Period)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un período" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PREDEFINED_PERIODS).map(([key, { name }]) => (
                            <SelectItem key={key} value={key}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-700 mb-2">Información del Reporte</h3>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li>• Resumen de residuos por tipo</li>
                        <li>• Índice de desviación de relleno sanitario</li>
                        <li>• Desglose mensual detallado</li>
                        <li>• Impacto ambiental estimado</li>
                      </ul>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleGenerateReport}
                      disabled={isGenerating || wasteData.length === 0}
                    >
                      {isGenerating ? 'Generando...' : 'Generar Reporte PDF'}
                    </Button>
                    
                    {wasteData.length === 0 && (
                      <p className="text-sm text-red-500 text-center">
                        No hay datos disponibles para este cliente
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}