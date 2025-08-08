import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WasteData } from '@shared/schema';
import { generateAndDownloadPDFReport } from '@/lib/jsPdfGenerator';

// Define los periodos disponibles para 2025
const PREDEFINED_PERIODS = {
  '2025_FULL': { name: 'Reporte Anual 2025', filter: (data: WasteData) => {
    const date = new Date(data.date);
    return date.getFullYear() === 2025;
  }},
  '2025_Q1': { name: 'T1 2025 (Enero-Marzo)', filter: (data: WasteData) => {
    const date = new Date(data.date);
    return date.getFullYear() === 2025 && date.getMonth() <= 2;  // Enero (0), Febrero (1), Marzo (2)
  }},
  '2025_Q2': { name: 'T2 2025 (Abril-Junio)', filter: (data: WasteData) => {
    const date = new Date(data.date);
    return date.getFullYear() === 2025 && (date.getMonth() >= 3 && date.getMonth() <= 5);  // Abril, Mayo, Junio
  }},
  '2025_Q3': { name: 'T3 2025 (Julio-Agosto)', filter: (data: WasteData) => {
    const date = new Date(data.date);
    return date.getFullYear() === 2025 && (date.getMonth() >= 6 && date.getMonth() <= 7);  // Julio, Agosto
  }}
};

type Period = keyof typeof PREDEFINED_PERIODS;

interface ReportPeriodSelectorProps {
  clientId: number;
  clientName: string;
  wasteData: WasteData[];
}

export default function ReportPeriodSelector({ clientId, clientName, wasteData }: ReportPeriodSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('2025_FULL');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Filtrar datos según periodo seleccionado
      const filteredData = wasteData.filter(PREDEFINED_PERIODS[selectedPeriod].filter);
      
      if (filteredData.length === 0) {
        alert('No hay datos disponibles para el período seleccionado');
        return;
      }
      
      // Generar reporte con los datos filtrados
      await generateAndDownloadPDFReport(
        { id: clientId, name: clientName, description: '' },
        filteredData
      );
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      alert('Ocurrió un error al generar el reporte');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800">
        <CardTitle className="text-white">Reportes por Período</CardTitle>
        <CardDescription className="text-white/80">
          Selecciona un período específico para generar un reporte detallado
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-4">
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
          
          <Button 
            className="w-full" 
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generando...' : 'Generar Reporte'}
          </Button>
          
          <div className="text-xs text-gray-500 mt-2">
            <p>Los reportes incluyen:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Resumen de residuos por tipo</li>
              <li>Índice de desviación de relleno sanitario</li>
              <li>Impacto ambiental</li>
              <li>Desglose mensual detallado</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}