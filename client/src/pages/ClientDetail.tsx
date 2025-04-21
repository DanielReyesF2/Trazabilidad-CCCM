import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User, FileText, BarChart2, AlertTriangle, ChevronLeft, Download, Edit, Trash2, Percent, RecycleIcon } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import TrendChart from '@/components/dashboard/TrendChart';
import { Client, Document, WasteData } from '@shared/schema';

export default function ClientDetail() {
  const [_, params] = useRoute<{ id: string }>('/clients/:id');
  const clientId = params ? parseInt(params.id) : 0;
  const [activeTab, setActiveTab] = useState('overview');
  
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
  
  // Fetch documents
  const { data: documents = [], isLoading: isDocumentsLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents', clientId],
    queryFn: async ({ queryKey }) => {
      const [_, clientId] = queryKey;
      const res = await fetch(`/api/documents?clientId=${clientId}`);
      if (!res.ok) throw new Error('Failed to fetch documents');
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
  
  // Fetch alerts
  const { data: alerts = [], isLoading: isAlertsLoading } = useQuery({
    queryKey: ['/api/alerts', clientId],
    queryFn: async ({ queryKey }) => {
      const [_, clientId] = queryKey;
      const res = await fetch(`/api/alerts?clientId=${clientId}`);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      return await res.json();
    },
    enabled: !!clientId,
    refetchOnWindowFocus: false
  });
  
  const isLoading = isClientLoading || isDocumentsLoading || isWasteDataLoading || isAlertsLoading;
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-5">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-2 mb-6">
              <ChevronLeft className="h-4 w-4" />
              <Link href="/" className="text-sm text-blue-600 hover:underline">
                Volver al Dashboard
              </Link>
            </div>
            <div className="animate-pulse bg-gray-200 h-10 w-2/3 rounded mb-4"></div>
            <div className="animate-pulse bg-gray-200 h-6 w-1/3 rounded mb-8"></div>
            <div className="grid grid-cols-1 gap-6">
              <div className="animate-pulse bg-gray-200 h-60 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-60 rounded"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (!client) {
    return (
      <AppLayout>
        <div className="p-5">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-2 mb-6">
              <ChevronLeft className="h-4 w-4" />
              <Link href="/" className="text-sm text-blue-600 hover:underline">
                Volver al Dashboard
              </Link>
            </div>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No se encontró el cliente solicitado. Por favor verifica que el ID sea correcto.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Process waste data for chart
  const chartData = processWasteDataForChart(wasteData);
  
  // Calculate summary statistics
  const totalOrganic = wasteData.reduce((sum, item) => sum + (item.organicWaste || 0), 0);
  const totalInorganic = wasteData.reduce((sum, item) => sum + (item.inorganicWaste || 0), 0);
  const totalRecyclable = wasteData.reduce((sum, item) => sum + (item.recyclableWaste || 0), 0);
  const totalWaste = wasteData.reduce((sum, item) => sum + (item.totalWaste || 0), 0);
  
  // Get the latest waste data entry's deviation
  const getLatestDeviation = () => {
    if (wasteData.length === 0) return null;
    
    const sortedData = [...wasteData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedData[0].deviation;
  };
  
  const latestDeviation = getLatestDeviation();
  const pendingAlerts = alerts.filter(alert => !alert.resolved).length;
  
  return (
    <AppLayout>
      <div className="p-5">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb and actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <ChevronLeft className="h-4 w-4" />
                <Link href="/" className="text-sm text-blue-600 hover:underline">
                  Volver al Dashboard
                </Link>
              </div>
              <h1 className="text-2xl font-anton text-gray-800 uppercase tracking-wider">{client.name}</h1>
              <p className="mt-1 text-sm text-gray-500">{client.description}</p>
            </div>
            <div className="mt-4 flex gap-2 md:mt-0">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Tarjeta principal con desviación de relleno sanitario */}
            <Card className="md:col-span-2 bg-gradient-to-r from-navy to-navy-light">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-white">
                  <Percent className="h-5 w-5 mr-2" />
                  <span className="uppercase">Desviación de Relleno Sanitario</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold text-lime">
                      {latestDeviation !== null 
                        ? `${latestDeviation}%` 
                        : 'No disponible'}
                    </div>
                    <p className="text-sm text-white mt-1">
                      Porcentaje de residuos desviados del relleno sanitario
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <RecycleIcon className="h-16 w-16 text-lime opacity-75" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500 uppercase">Residuos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatNumber(totalWaste)} kg</div>
                <p className="text-sm text-gray-500 mt-1">Gestionados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500 uppercase">Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{documents.length}</div>
                <p className="text-sm text-gray-500 mt-1">Archivos procesados</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">General</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="analysis">Análisis</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tendencias de Residuos</CardTitle>
                      <CardDescription>Análisis histórico de residuos por tipo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {chartData.length > 0 ? (
                        <TrendChart data={chartData} />
                      ) : (
                        <div className="text-center py-10 text-gray-500">
                          <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No hay datos suficientes para mostrar tendencias</p>
                          <p className="text-sm mt-2">Sube documentos para generar análisis</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Información del Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">ID</p>
                          <p>{client.id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Nombre</p>
                          <p>{client.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Descripción</p>
                          <p>{client.description || "No disponible"}</p>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Último documento</p>
                          <p>
                            {documents.length > 0 
                              ? formatDate(new Date(documents[0].uploadDate)) 
                              : "No hay documentos"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Quick Upload */}
                  <div className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Subir Documento</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FileUploader clientId={client.id} />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Documentos Procesados</CardTitle>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Nuevo Documento
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay documentos registrados para este cliente</p>
                      <p className="text-sm mt-2">Comienza subiendo archivos desde la sección "Subir Documento"</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Tamaño</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documents.map((doc) => (
                            <tr key={doc.id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium">{doc.fileName}</td>
                              <td className="px-4 py-3">{formatDate(new Date(doc.uploadDate))}</td>
                              <td className="px-4 py-3">{formatFileSize(doc.fileSize)}</td>
                              <td className="px-4 py-3">
                                {doc.processed ? (
                                  doc.processingError ? (
                                    <Badge variant="destructive">Error</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">Procesado</Badge>
                                  )
                                ) : (
                                  <Badge variant="secondary">Pendiente</Badge>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">Descargar</span>
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Eliminar</span>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analysis">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Residuos</CardTitle>
                  <CardDescription>Análisis detallado de todos los datos procesados</CardDescription>
                </CardHeader>
                <CardContent>
                  {wasteData.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay datos de residuos para este cliente</p>
                      <p className="text-sm mt-2">Sube documentos para generar análisis de residuos</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Resumen de Residuos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-500">Orgánicos</p>
                                  <p className="text-2xl font-bold">{formatNumber(totalOrganic)} kg</p>
                                </div>
                                <div className="bg-green-100 p-2 rounded-full">
                                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-500">Inorgánicos</p>
                                  <p className="text-2xl font-bold">{formatNumber(totalInorganic)} kg</p>
                                </div>
                                <div className="bg-blue-100 p-2 rounded-full">
                                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-500">Reciclables</p>
                                  <p className="text-2xl font-bold">{formatNumber(totalRecyclable)} kg</p>
                                </div>
                                <div className="bg-yellow-100 p-2 rounded-full">
                                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                      
                      {/* Waste Data Table */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Detalle de Registros</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                              <tr>
                                <th className="px-4 py-3">Fecha</th>
                                <th className="px-4 py-3">Orgánicos (kg)</th>
                                <th className="px-4 py-3">Inorgánicos (kg)</th>
                                <th className="px-4 py-3">Reciclables (kg)</th>
                                <th className="px-4 py-3">Total (kg)</th>
                                <th className="px-4 py-3 text-right">Documento</th>
                              </tr>
                            </thead>
                            <tbody>
                              {wasteData.map((data) => {
                                const doc = documents.find(d => d.id === data.documentId);
                                return (
                                  <tr key={data.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">{formatDate(new Date(data.date))}</td>
                                    <td className="px-4 py-3">{formatNumber(data.organicWaste || 0)}</td>
                                    <td className="px-4 py-3">{formatNumber(data.inorganicWaste || 0)}</td>
                                    <td className="px-4 py-3">{formatNumber(data.recyclableWaste || 0)}</td>
                                    <td className="px-4 py-3 font-medium">{formatNumber(data.totalWaste || 0)}</td>
                                    <td className="px-4 py-3 text-right">
                                      {doc ? doc.fileName : 'N/A'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="alerts">
              <Card>
                <CardHeader>
                  <CardTitle>Alertas y Notificaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  {alerts.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay alertas para este cliente</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {alerts.map((alert) => (
                        <Alert 
                          key={alert.id} 
                          variant={
                            alert.type === 'error' ? 'destructive' : 'default'
                          }
                          className={alert.resolved ? 'opacity-60' : ''}
                        >
                          <div className="flex items-start">
                            <div className="flex-1">
                              <AlertTitle className="flex items-center">
                                {alert.type === 'error' ? (
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                )}
                                {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                                {alert.resolved && (
                                  <Badge variant="outline" className="ml-2">Resuelta</Badge>
                                )}
                              </AlertTitle>
                              <AlertDescription>
                                {alert.message}
                                <div className="mt-1 text-xs text-gray-500">
                                  {formatDate(new Date(alert.date))}
                                </div>
                              </AlertDescription>
                            </div>
                            {!alert.resolved && (
                              <Button size="sm" variant="outline" className="ml-4 mt-2">
                                Marcar como resuelta
                              </Button>
                            )}
                          </div>
                        </Alert>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}

// Utility functions
function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

function formatNumber(num: number): string {
  return num.toLocaleString('es-ES', { maximumFractionDigits: 1 });
}

function processWasteDataForChart(wasteData: WasteData[]): any[] {
  if (wasteData.length === 0) return [];
  
  // Group by month
  const groupedData: Record<string, { organicWaste: number, inorganicWaste: number }> = {};
  
  wasteData.forEach((item) => {
    const date = new Date(item.date);
    const month = date.toLocaleString('es-ES', { month: 'short' });
    
    if (!groupedData[month]) {
      groupedData[month] = { organicWaste: 0, inorganicWaste: 0 };
    }
    
    groupedData[month].organicWaste += item.organicWaste || 0;
    groupedData[month].inorganicWaste += item.inorganicWaste || 0;
  });
  
  return Object.entries(groupedData).map(([month, data]) => ({
    month,
    ...data
  }));
}