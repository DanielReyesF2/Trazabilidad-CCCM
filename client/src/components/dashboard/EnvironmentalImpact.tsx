import React from 'react';
import { WasteData } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TreePine, Droplets, Zap } from 'lucide-react';

interface EnvironmentalImpactProps {
  wasteData: WasteData[];
}

interface ImpactMetric {
  title: string;
  icon: React.ReactNode;
  value: number;
  unit: string;
  description: string;
  color: string;
}

export default function EnvironmentalImpact({ wasteData }: EnvironmentalImpactProps) {
  // Calcular los datos acumulados de impacto ambiental
  const totalTreesSaved = wasteData.reduce((sum, data) => sum + (data.treesSaved || 0), 0);
  const totalWaterSaved = wasteData.reduce((sum, data) => sum + (data.waterSaved || 0), 0);
  const totalEnergySaved = wasteData.reduce((sum, data) => sum + (data.energySaved || 0), 0);
  
  // Si los valores no son suficientes, calculamos basados en la cantidad de materiales reciclados y PODA
  const totalPaperCardboard = wasteData.reduce((sum, data) => {
    if (data.rawData && data.rawData.recyclableDetails && data.rawData.recyclableDetails.paperCardboard) {
      return sum + data.rawData.recyclableDetails.paperCardboard;
    }
    return sum;
  }, 0);
  
  // Calcular el total de residuos de PODA para considerarlo en el impacto ambiental
  const totalPodaWaste = wasteData.reduce((sum, data) => sum + (data.podaWaste || 0), 0);
  const totalRecyclableWaste = wasteData.reduce((sum, data) => sum + (data.recyclableWaste || 0), 0);
  
  // Residuos reciclables totales (incluye los reciclables convencionales + 50% de PODA)
  const effectiveRecyclableWaste = totalRecyclableWaste + (totalPodaWaste * 0.5);
  
  // Factor de conversión: 17 árboles por tonelada de papel + contribución de PODA (estimación: 2 árboles por tonelada)
  const calculatedTreesSaved = totalTreesSaved || Math.round((totalPaperCardboard / 1000 * 17) + (totalPodaWaste / 1000 * 2));
  
  // Factor de conversión: 26,000 litros de agua por tonelada de papel + contribución de PODA
  const calculatedWaterSaved = totalWaterSaved || Math.round((totalPaperCardboard / 1000 * 26000) + (totalPodaWaste / 1000 * 5000));
  
  // Energía conservada: calculamos en base al total efectivo de reciclables
  const calculatedEnergySaved = totalEnergySaved || Math.round(effectiveRecyclableWaste / 1000 * 500);
  
  // Métricas de impacto ambiental
  const impactMetrics: ImpactMetric[] = [
    {
      title: 'Árboles',
      icon: <TreePine className="h-5 w-5 text-green-600" />,
      value: calculatedTreesSaved,
      unit: 'salvados',
      description: 'No talados para papel',
      color: 'green'
    },
    {
      title: 'Agua',
      icon: <Droplets className="h-5 w-5 text-blue-600" />,
      value: calculatedWaterSaved,
      unit: 'L ahorrados',
      description: 'No utilizada en fabricación',
      color: 'blue'
    },
    {
      title: 'Energía',
      icon: <Zap className="h-5 w-5 text-yellow-600" />,
      value: calculatedEnergySaved,
      unit: 'kW conservados',
      description: 'Ahorrada en procesos',
      color: 'yellow'
    }
  ];

  // Si no hay datos, mostrar mensaje
  if (wasteData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impacto Ambiental</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">Sin datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-600 to-lime pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white text-xl">Impacto Ambiental</CardTitle>
          <div className="px-2 py-1 bg-white/20 rounded-full text-xs text-white font-semibold">
            Certificado Econova
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {impactMetrics.map((metric, idx) => {
            // Definir clases basadas en el color
            let bgColorClass = "bg-gray-100";
            if (metric.color === "green") bgColorClass = "bg-green-100";
            if (metric.color === "blue") bgColorClass = "bg-blue-100";
            if (metric.color === "yellow") bgColorClass = "bg-yellow-100";
            
            return (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className={`p-2 rounded-full ${bgColorClass} mb-2`}>
                  {metric.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold">{metric.value.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">{metric.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-xs text-center text-gray-500 border-t pt-3">
          El reciclaje y compostaje de residuos contribuyen significativamente a la preservación ambiental
        </div>
      </CardContent>
    </Card>
  );
}