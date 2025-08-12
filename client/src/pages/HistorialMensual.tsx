import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Upload, 
  History,
  TrendingUp,
  FileText,
  AlertCircle,
  ArrowRight,
  Package,
  MapPin,
  StickyNote
} from "lucide-react";

interface DailyEntry {
  id: number;
  date: string;
  type: string;
  material: string;
  kg: number;
  location: string;
  notes?: string;
  createdAt: string;
}

interface MonthlySummary {
  id: number;
  year: number;
  month: number;
  status: 'open' | 'closed' | 'transferred';
  totalRecycling: number;
  totalCompost: number;
  totalReuse: number;
  totalLandfill: number;
  totalWaste: number;
  dailyEntriesCount: number;
  closedAt?: string;
  closedBy?: string;
  transferredToOfficial: boolean;
  transferredAt?: string;
  recyclingBreakdown?: Record<string, number>;
  compostBreakdown?: Record<string, number>;
  reuseBreakdown?: Record<string, number>;
  landfillBreakdown?: Record<string, number>;
}

interface MonthlyData {
  summary: MonthlySummary;
  dailyEntries: DailyEntry[];
  canClose: boolean;
}

export default function HistorialMensual() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const currentDate = new Date();
  const [selectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth] = useState(currentDate.getMonth() + 1);

  // Obtener datos del mes
  const { data: monthlyData, isLoading } = useQuery<MonthlyData>({
    queryKey: [`/api/monthly-summary/${selectedYear}/${selectedMonth}`],
    queryFn: async () => {
      const response = await fetch(`/api/monthly-summary/${selectedYear}/${selectedMonth}`);
      if (!response.ok) throw new Error('Failed to fetch monthly data');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Mutación para cerrar mes
  const closeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/monthly-summary/${selectedYear}/${selectedMonth}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closedBy: 'Equipo de Seguridad' })
      });
      if (!response.ok) throw new Error('Failed to close month');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Mes cerrado correctamente",
        description: "Los datos del mes han sido cerrados y están listos para transferir",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/monthly-summary/${selectedYear}/${selectedMonth}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al cerrar mes",
        description: error.message || "No se pudo cerrar el mes",
        variant: "destructive",
      });
    },
  });

  // Mutación para transferir a trazabilidad oficial
  const transferMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/monthly-summary/${selectedYear}/${selectedMonth}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to transfer to official data');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Datos transferidos",
        description: "Los datos han sido enviados a la trazabilidad oficial",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/monthly-summary/${selectedYear}/${selectedMonth}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al transferir",
        description: error.message || "No se pudieron transferir los datos",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default" className="bg-green-100 text-green-800">🔓 Abierto</Badge>;
      case 'closed':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">🔒 Cerrado</Badge>;
      case 'transferred':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">📤 Transferido</Badge>;
      default:
        return <Badge variant="destructive">❓ Desconocido</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recycling': return '♻️';
      case 'compost': return '🌱';
      case 'reuse': return '🔄';
      case 'landfill': return '🗑️';
      default: return '📦';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recycling': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'compost': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'reuse': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'landfill': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 py-6">
          <div className="max-w-6xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
              <div className="h-64 bg-gray-300 rounded mb-6"></div>
              <div className="h-96 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6 border-l-4 border-navy">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-anton uppercase tracking-wide text-navy mb-2">
                  Historial Mensual
                </h1>
                <p className="text-lg text-gray-700 font-medium">
                  📊 Resumen de todos los registros de {monthNames[selectedMonth - 1]} {selectedYear}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Revisa, cierra y transfiere los datos mensuales a trazabilidad oficial
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                {monthlyData?.summary && getStatusBadge(monthlyData.summary.status)}
                <div className="text-xs text-gray-500 text-right">
                  {monthlyData?.summary.dailyEntriesCount || 0} registros diarios
                </div>
              </div>
            </div>
          </div>

          {monthlyData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Resumen mensual */}
              <div className="lg:col-span-1">
                <Card className="border-2 border-navy/10">
                  <CardHeader className="bg-navy text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5" />
                      Resumen del Mes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <div className="text-2xl font-bold text-emerald-700">
                          {monthlyData.summary.totalRecycling.toFixed(1)}
                        </div>
                        <div className="text-xs text-emerald-600">kg Reciclaje</div>
                      </div>
                      
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <div className="text-2xl font-bold text-amber-700">
                          {monthlyData.summary.totalCompost.toFixed(1)}
                        </div>
                        <div className="text-xs text-amber-600">kg Composta</div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-700">
                          {monthlyData.summary.totalReuse.toFixed(1)}
                        </div>
                        <div className="text-xs text-blue-600">kg Reuso</div>
                      </div>
                      
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-700">
                          {monthlyData.summary.totalLandfill.toFixed(1)}
                        </div>
                        <div className="text-xs text-red-600">kg Relleno</div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="bg-navy text-white p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold">
                          {monthlyData.summary.totalWaste.toFixed(1)}
                        </div>
                        <div className="text-sm">kg Total del Mes</div>
                      </div>
                    </div>

                    {/* Acciones del mes */}
                    <div className="border-t pt-4 space-y-3">
                      {monthlyData.summary.status === 'open' && monthlyData.canClose && (
                        <Button
                          onClick={() => closeMutation.mutate()}
                          disabled={closeMutation.isPending}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          {closeMutation.isPending ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Cerrando...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              Cerrar Mes
                            </div>
                          )}
                        </Button>
                      )}

                      {monthlyData.summary.status === 'closed' && !monthlyData.summary.transferredToOfficial && (
                        <Button
                          onClick={() => transferMutation.mutate()}
                          disabled={transferMutation.isPending}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {transferMutation.isPending ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Transfiriendo...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Upload className="h-4 w-4" />
                              Transferir a Trazabilidad
                            </div>
                          )}
                        </Button>
                      )}

                      {monthlyData.summary.status === 'open' && !monthlyData.canClose && (
                        <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 text-center">
                          <AlertCircle className="h-5 w-5 text-gray-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            Agrega registros diarios para poder cerrar el mes
                          </p>
                        </div>
                      )}

                      {monthlyData.summary.transferredToOfficial && (
                        <div className="bg-green-100 p-3 rounded-lg border border-green-200 text-center">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-2" />
                          <p className="text-sm text-green-700 font-medium">
                            Datos transferidos correctamente
                          </p>
                          {monthlyData.summary.transferredAt && (
                            <p className="text-xs text-green-600">
                              {new Date(monthlyData.summary.transferredAt).toLocaleDateString('es-MX')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de registros diarios */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Registros Diarios ({monthlyData.dailyEntries.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {monthlyData.dailyEntries.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          Sin registros este mes
                        </h3>
                        <p className="text-gray-500">
                          Los registros diarios aparecerán aquí conforme se vayan agregando
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {monthlyData.dailyEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className={`p-4 rounded-lg border-2 ${getTypeColor(entry.type)}`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="text-2xl">
                                {getTypeIcon(entry.type)}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-lg">
                                    {entry.material}
                                  </span>
                                  <Badge variant="outline" className="bg-white">
                                    {entry.kg} kg
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(entry.date).toLocaleDateString('es-MX')}
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {entry.location}
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {new Date(entry.createdAt).toLocaleTimeString('es-MX', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </div>
                                </div>

                                {entry.notes && (
                                  <div className="mt-2 flex items-start gap-1">
                                    <StickyNote className="h-4 w-4 mt-0.5" />
                                    <span className="text-sm italic">{entry.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}