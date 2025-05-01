import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WasteData } from '@shared/schema';

interface WasteDataHistoryProps {
  clientId?: number;
  limit?: number;
}

export default function WasteDataHistory({ clientId, limit = 10 }: WasteDataHistoryProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>(clientId?.toString() || "");
  
  // Obtener lista de clientes
  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
    staleTime: 60 * 1000, // 1 minuto
  });
  
  // Obtener datos de residuos filtrados por cliente
  const { data: wasteData, isLoading } = useQuery({
    queryKey: ['/api/waste-data', selectedClientId],
    enabled: !clientId || !!selectedClientId,
  });
  
  // Filtrar y ordenar datos por fecha descendente (más recientes primero)
  const filteredData = wasteData
    ?.filter(data => !selectedClientId || data.clientId === parseInt(selectedClientId))
    ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    ?.slice(0, limit);
  
  // Formatear número con 2 decimales
  const formatNumber = (num: number) => (num / 1000).toFixed(2);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Registros</CardTitle>
        <CardDescription>
          Últimos {limit} registros de generación de residuos
        </CardDescription>
        
        {!clientId && (
          <div className="mt-2">
            <Select 
              value={selectedClientId} 
              onValueChange={setSelectedClientId}
            >
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los clientes</SelectItem>
                {clients?.map(client => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            {isLoading 
              ? "Cargando datos..."
              : filteredData?.length 
                ? `Mostrando los últimos ${filteredData.length} registros` 
                : "No hay registros disponibles"}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Orgánico</TableHead>
              <TableHead className="text-right">Inorgánico</TableHead>
              <TableHead className="text-right">Reciclable</TableHead>
              <TableHead className="text-right">Poda</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Desviación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Cargando...</TableCell>
              </TableRow>
            ) : filteredData?.length ? (
              filteredData.map((data: WasteData) => {
                const client = clients?.find(c => c.id === data.clientId);
                return (
                  <TableRow key={data.id}>
                    <TableCell>
                      {format(new Date(data.date), "dd MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>{client?.name || `Cliente #${data.clientId}`}</TableCell>
                    <TableCell className="text-right">{formatNumber(data.organicWaste || 0)}</TableCell>
                    <TableCell className="text-right">{formatNumber(data.inorganicWaste || 0)}</TableCell>
                    <TableCell className="text-right">{formatNumber(data.recyclableWaste || 0)}</TableCell>
                    <TableCell className="text-right">{formatNumber(data.podaWaste || 0)}</TableCell>
                    <TableCell className="text-right">{formatNumber(data.totalWaste)}</TableCell>
                    <TableCell className="text-right">{data.deviation.toFixed(1)}%</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">No hay registros disponibles</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}