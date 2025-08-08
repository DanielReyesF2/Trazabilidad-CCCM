
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  FileDown, 
  Calendar, 
  Filter, 
  Eye, 
  Download, 
  Loader2,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { WasteData, Client } from '@shared/schema';
import { downloadCSV, downloadExcel } from '@/lib/fileExport';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DataExport() {
  // State for filters
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [wasteTypes, setWasteTypes] = useState({
    organic: true,
    inorganic: true,
    recyclable: true
  });
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch clients
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Fetch waste data with filters
  const { data: wasteData = [], isLoading, refetch } = useQuery<WasteData[]>({
    queryKey: ['/api/waste-data', selectedClient, fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedClient !== 'all') params.append('clientId', selectedClient);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      
      const response = await fetch(`/api/waste-data?${params}`);
      if (!response.ok) throw new Error('Failed to fetch waste data');
      return response.json();
    }
  });

  // Filter waste data by selected waste types
  const filteredWasteData = useMemo(() => {
    if (!wasteData) return [];
    
    return wasteData.filter(record => {
      // If no waste types are selected, return no data
      if (!wasteTypes.organic && !wasteTypes.inorganic && !wasteTypes.recyclable) {
        return false;
      }
      
      // Include record if it has data for any selected waste type
      return (
        (wasteTypes.organic && (record.organicWaste || 0) > 0) ||
        (wasteTypes.inorganic && (record.inorganicWaste || 0) > 0) ||
        (wasteTypes.recyclable && (record.recyclableWaste || 0) > 0)
      );
    });
  }, [wasteData, wasteTypes]);

  // Handle waste type filter changes
  const handleWasteTypeChange = (type: keyof typeof wasteTypes, checked: boolean) => {
    setWasteTypes(prev => ({
      ...prev,
      [type]: checked
    }));
  };

  // Handle export
  const handleExport = async () => {
    if (filteredWasteData.length === 0) {
      alert('No hay datos para exportar con los filtros seleccionados');
      return;
    }

    setIsExporting(true);
    try {
      // Prepare data for export
      const exportData = filteredWasteData.map(record => {
        const client = clients.find(c => c.id === record.clientId);
        return {
          'Fecha': format(new Date(record.date), 'dd/MM/yyyy', { locale: es }),
          'Cliente': client?.name || 'N/A',
          ...(wasteTypes.organic && { 'Residuos Orgánicos (kg)': record.organicWaste || 0 }),
          ...(wasteTypes.inorganic && { 'Residuos Inorgánicos (kg)': record.inorganicWaste || 0 }),
          ...(wasteTypes.recyclable && { 'Residuos Reciclables (kg)': record.recyclableWaste || 0 }),
          'Total Residuos (kg)': record.totalWaste || 0,
          'Desviación de Relleno Sanitario (%)': record.deviation || 0,
          'Raw Data': record.rawData ? JSON.stringify(record.rawData) : 'N/A'
        };
      });

      // Generate filename
      const dateRange = fromDate && toDate 
        ? `_${fromDate}_${toDate}` 
        : fromDate 
        ? `_desde_${fromDate}`
        : toDate 
        ? `_hasta_${toDate}`
        : '';
      
      const clientName = selectedClient !== 'all' 
        ? `_${clients.find(c => c.id.toString() === selectedClient)?.name || 'cliente'}`
        : '';
      
      const filename = `datos_residuos${clientName}${dateRange}`;

      // Download file
      if (exportFormat === 'csv') {
        downloadCSV(exportData, filename);
      } else {
        downloadExcel(exportData, filename);
      }
      
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error al exportar los datos. Intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate statistics for preview
  const stats = useMemo(() => {
    if (filteredWasteData.length === 0) return null;
    
    const totalOrganic = filteredWasteData.reduce((sum, record) => sum + (record.organicWaste || 0), 0);
    const totalInorganic = filteredWasteData.reduce((sum, record) => sum + (record.inorganicWaste || 0), 0);
    const totalRecyclable = filteredWasteData.reduce((sum, record) => sum + (record.recyclableWaste || 0), 0);
    const totalWaste = totalOrganic + totalInorganic + totalRecyclable;
    const avgDeviation = filteredWasteData.reduce((sum, record) => sum + (record.deviation || 0), 0) / filteredWasteData.length;
    
    return {
      recordCount: filteredWasteData.length,
      totalOrganic,
      totalInorganic,
      totalRecyclable,
      totalWaste,
      avgDeviation
    };
  }, [filteredWasteData]);

  return (
    <AppLayout>
      <div className="p-5">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-anton text-gray-800 uppercase tracking-wider">
              Exportación de Datos
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Exporta datos de residuos en formato CSV o Excel con filtros personalizados
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Filters Panel */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filtros de Exportación
                  </CardTitle>
                  <CardDescription>
                    Configura los filtros para seleccionar los datos a exportar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Client Filter */}
                  <div>
                    <Label htmlFor="client-select">Cliente</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los clientes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los clientes</SelectItem>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="from-date">Fecha desde</Label>
                      <Input
                        id="from-date"
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="to-date">Fecha hasta</Label>
                      <Input
                        id="to-date"
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Waste Type Filters */}
                  <div>
                    <Label className="text-base font-medium">Tipos de Residuos</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="organic"
                          checked={wasteTypes.organic}
                          onCheckedChange={(checked) => 
                            handleWasteTypeChange('organic', checked as boolean)
                          }
                        />
                        <Label htmlFor="organic">Residuos Orgánicos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inorganic"
                          checked={wasteTypes.inorganic}
                          onCheckedChange={(checked) => 
                            handleWasteTypeChange('inorganic', checked as boolean)
                          }
                        />
                        <Label htmlFor="inorganic">Residuos Inorgánicos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recyclable"
                          checked={wasteTypes.recyclable}
                          onCheckedChange={(checked) => 
                            handleWasteTypeChange('recyclable', checked as boolean)
                          }
                        />
                        <Label htmlFor="recyclable">Residuos Reciclables</Label>
                      </div>
                    </div>
                  </div>

                  {/* Export Format */}
                  <div>
                    <Label>Formato de Exportación</Label>
                    <Select value={exportFormat} onValueChange={(value: 'csv' | 'excel') => setExportFormat(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            CSV
                          </div>
                        </SelectItem>
                        <SelectItem value="excel">
                          <div className="flex items-center">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Excel (XLSX)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Export Actions */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Ocultar' : 'Mostrar'} Vista Previa
                  </Button>
                  
                  <Button
                    onClick={handleExport}
                    className="w-full"
                    disabled={isExporting || filteredWasteData.length === 0}
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {isExporting ? 'Exportando...' : `Exportar ${exportFormat.toUpperCase()}`}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Cargando datos...</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="h-5 w-5 mr-2" />
                      Vista Previa de Datos
                    </CardTitle>
                    <CardDescription>
                      Resumen de los datos que se exportarán
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats ? (
                      <div className="space-y-4">
                        {/* Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{stats.recordCount}</div>
                            <div className="text-sm text-blue-600">Registros</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {stats.totalOrganic.toFixed(1)}
                            </div>
                            <div className="text-sm text-green-600">kg Orgánicos</div>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                              {stats.totalInorganic.toFixed(1)}
                            </div>
                            <div className="text-sm text-orange-600">kg Inorgánicos</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {stats.totalRecyclable.toFixed(1)}
                            </div>
                            <div className="text-sm text-purple-600">kg Reciclables</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-600">
                              {stats.totalWaste.toFixed(1)} kg
                            </div>
                            <div className="text-sm text-gray-600">Total de Residuos</div>
                          </div>
                          <div className="text-center p-3 bg-indigo-50 rounded-lg">
                            <div className="text-2xl font-bold text-indigo-600">
                              {stats.avgDeviation.toFixed(1)}%
                            </div>
                            <div className="text-sm text-indigo-600">Desviación Promedio</div>
                          </div>
                        </div>

                        {showPreview && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              <h3 className="font-medium">Muestra de Datos (primeros 5 registros):</h3>
                              <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left py-2">Fecha</th>
                                      <th className="text-left py-2">Cliente</th>
                                      {wasteTypes.organic && <th className="text-left py-2">Orgánicos</th>}
                                      {wasteTypes.inorganic && <th className="text-left py-2">Inorgánicos</th>}
                                      {wasteTypes.recyclable && <th className="text-left py-2">Reciclables</th>}
                                      <th className="text-left py-2">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {filteredWasteData.slice(0, 5).map((record, index) => {
                                      const client = clients.find(c => c.id === record.clientId);
                                      return (
                                        <tr key={index} className="border-b">
                                          <td className="py-2">
                                            {format(new Date(record.date), 'dd/MM/yyyy', { locale: es })}
                                          </td>
                                          <td className="py-2">{client?.name || 'N/A'}</td>
                                          {wasteTypes.organic && (
                                            <td className="py-2">{record.organicWaste || 0} kg</td>
                                          )}
                                          {wasteTypes.inorganic && (
                                            <td className="py-2">{record.inorganicWaste || 0} kg</td>
                                          )}
                                          {wasteTypes.recyclable && (
                                            <td className="py-2">{record.recyclableWaste || 0} kg</td>
                                          )}
                                          <td className="py-2">{record.totalWaste || 0} kg</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                              {filteredWasteData.length > 5 && (
                                <p className="text-sm text-gray-500 text-center">
                                  ... y {filteredWasteData.length - 5} registros más
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {filteredWasteData.length === 0 && wasteData.length > 0 
                            ? "No hay datos que coincidan con los filtros seleccionados."
                            : "No hay datos de residuos disponibles para exportar."
                          }
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
