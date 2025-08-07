import React from 'react';
import { Shield, ClipboardCheck, AlertTriangle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateAndDownloadTrueCertificationReport } from '@/lib/trueCertificationReport';

interface TrueCertificationProps {
  currentDeviation: number;
}

export const TrueCertification: React.FC<TrueCertificationProps> = ({ currentDeviation }) => {
  // Objetivo para certificación TRUE Zero Waste
  const targetDeviation = 90;
  
  // Calcular el porcentaje de progreso hacia la meta
  const progressPercentage = Math.min(100, (currentDeviation / targetDeviation) * 100);
  
  // Determinar si estamos en nivel crítico, alertante o bueno
  const getStatusColor = () => {
    if (currentDeviation < 50) return 'bg-red-500';
    if (currentDeviation < 75) return 'bg-amber-500';
    return 'bg-green-500';
  };
  
  // Acciones pendientes para alcanzar la certificación
  const pendingActions = [
    {
      id: 1,
      title: 'Priorización Directiva',
      description: 'Lograr que la alta dirección priorice el programa de gestión de residuos.',
      status: 'pending' as const,
    },
    {
      id: 2,
      title: 'Compostaje en Sitio',
      description: 'Implementar compostero para el 100% de los residuos de poda y comedor.',
      status: 'in-progress' as const,
    },
    {
      id: 3,
      title: 'Proveedor Privado',
      description: 'Invertir en un proveedor privado en lugar del municipal para asegurar destino final y trazabilidad.',
      status: 'pending' as const,
    },
    {
      id: 4,
      title: 'Brigada de Gestión',
      description: 'Conformar una brigada de mínimo 3 personas dedicadas a la gestión interna de residuos.',
      status: 'pending' as const,
    },
  ];
  
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-navy" />
          <h3 className="font-medium text-gray-900">TRUE Zero Waste</h3>
        </div>
        <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
          En proceso
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Progreso hacia 90%</span>
          <span className="text-lg font-semibold text-gray-900">{currentDeviation.toFixed(1)}%</span>
        </div>
        
        <div className="w-full h-2 bg-gray-100 rounded-full">
          <div 
            className={`h-2 rounded-full transition-all ${getStatusColor()}`} 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Meta: 90%</span>
          <Button 
            onClick={() => generateAndDownloadTrueCertificationReport('Club Campestre CDMX', currentDeviation, pendingActions)}
            className="bg-navy hover:bg-navy/90 text-white text-xs px-2 py-1"
            size="sm"
          >
            <FileDown className="h-3 w-3 mr-1" />
            Reporte
          </Button>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Acciones pendientes: {pendingActions.filter(a => a.status === 'pending').length}
          </div>
        </div>
      </div>
    </div>
  );
};