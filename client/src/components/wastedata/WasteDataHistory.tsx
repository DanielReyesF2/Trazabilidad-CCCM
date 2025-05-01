import { useQuery } from '@tanstack/react-query';
import { WasteData } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { FileText, BarChart2, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WasteDataHistoryProps {
  clientId?: number;
  limit?: number;
}

export default function WasteDataHistory({ clientId, limit = 5 }: WasteDataHistoryProps) {
  // Fetch waste data for the specified client
  const { data: wasteData = [], isLoading } = useQuery<WasteData[]>({
    queryKey: ['/api/waste-data', clientId],
    queryFn: async ({ queryKey }) => {
      const [_, clientId] = queryKey;
      const url = clientId 
        ? `/api/waste-data?clientId=${clientId}` 
        : '/api/waste-data';
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch waste data');
      return await res.json();
    },
    enabled: true,
    refetchOnWindowFocus: false
  });
  
  // Format date for display
  const formatDate = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Format number as kg
  const formatKg = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value) + ' kg';
  };
  
  // Determine waste source (manual entry or document)
  const getWasteSource = (data: WasteData): { text: string, badge: React.ReactNode } => {
    if (data.documentId) {
      return { 
        text: 'PDF', 
        badge: <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">PDF</Badge>
      };
    } else {
      return { 
        text: 'Manual', 
        badge: <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">Manual</Badge>
      };
    }
  };
  
  // Sort data by date (newest first) and limit to specified number
  const sortedData = [...wasteData]
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, limit);
  
  if (isLoading) {
    return (
      <div className="animate-pulse bg-white p-6 rounded-lg border">
        <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (sortedData.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 bg-white p-6 rounded-lg border">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">No hay registros de residuos</p>
        <p className="text-sm mt-2">Usa el formulario para agregar tus primeros datos de residuos</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-medium mb-4">Últimos registros</h3>
      
      <div className="space-y-4">
        {sortedData.map((data) => {
          const source = getWasteSource(data);
          const totalWaste = (data.organicWaste || 0) + (data.podaWaste || 0) + 
                            (data.inorganicWaste || 0) + (data.recyclableWaste || 0);
          
          return (
            <Card key={data.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-base font-medium">{formatDate(data.date)}</span>
                  </div>
                  {source.badge}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Orgánicos</p>
                    <p className="font-medium">{formatKg(data.organicWaste || 0)}</p>
                  </div>
                  
                  <div className="p-2 bg-teal-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">PODA</p>
                    <p className="font-medium">{formatKg(data.podaWaste || 0)}</p>
                  </div>
                  
                  <div className="p-2 bg-red-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Inorgánicos</p>
                    <p className="font-medium">{formatKg(data.inorganicWaste || 0)}</p>
                  </div>
                  
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Reciclables</p>
                    <p className="font-medium">{formatKg(data.recyclableWaste || 0)}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total:</span>
                  <span className="font-medium">{formatKg(totalWaste)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}