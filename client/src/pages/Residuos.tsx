import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import AppLayout from "../components/layout/AppLayout";
import { ClubHeader } from "../components/dashboard/ClubHeader";
import { TrueCertification } from "../components/dashboard/TrueCertification";
import { EnvironmentalImpact } from "../components/dashboard/EnvironmentalImpact";
import AlertsTable from "../components/dashboard/AlertsTable";
import SummaryCard from "../components/dashboard/SummaryCard";
import { WasteData, Alert } from '@shared/schema';
import { Trash2, Recycle, Leaf, FileUp, BarChart2, PlusCircle } from "lucide-react";
import { DocumentUpload } from "../components/DocumentUpload";

export default function Residuos() {
  // Obtener datos de residuos
  const { data: wasteData = [] } = useQuery<WasteData[]>({
    queryKey: ['/api/waste-data'],
    refetchOnWindowFocus: false,
  });

  // Obtener alertas
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    refetchOnWindowFocus: false,
  });

  if (wasteData.length === 0) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos de residuos...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Procesar datos para métricas
  const totalWaste = wasteData.reduce((sum, month) => sum + (month.organicWaste || 0) + (month.inorganicWaste || 0) + (month.recyclableWaste || 0), 0);
  const organicTotal = wasteData.reduce((sum, month) => sum + (month.organicWaste || 0), 0);
  const recyclableTotal = wasteData.reduce((sum, month) => sum + (month.recyclableWaste || 0), 0);
  const inorganicTotal = wasteData.reduce((sum, month) => sum + (month.inorganicWaste || 0), 0);
  
  // Calcular desviación del relleno sanitario
  const deviationPercentage = totalWaste > 0 ? ((organicTotal + recyclableTotal) / totalWaste * 100) : 0;

  // Datos procesados para métricas
  const summaryData = {
    deviation: Number(deviationPercentage.toFixed(1)),
    organicWaste: organicTotal,
    inorganicWaste: inorganicTotal,
    totalWaste: totalWaste,
  };

  // Datos para impacto ambiental
  const environmentalData = {
    organicWasteDiverted: organicTotal,
    recyclableWasteDiverted: recyclableTotal,
  };

  // Limpiar y procesar datos para gráficas mensuales
  const cleanedData = wasteData
    .filter(month => month.date) // Filtrar datos válidos
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Ordenar por fecha
    .reduce((acc, month) => {
      // Crear clave única por año-mes para evitar duplicados
      const date = new Date(month.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      
      // Solo conservar el último registro de cada mes
      if (!acc[key] || new Date(acc[key].date) < date) {
        acc[key] = month;
      }
      return acc;
    }, {} as Record<string, any>);

  // Convertir a array con TODOS los datos históricos (enero 2024 - agosto 2025)
  const monthlyData = Object.values(cleanedData)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    // NO limitar - mostrar todos los datos históricos
    .map((month: any) => ({
      name: new Date(month.date).toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
      organicos: Math.round((month.organicWaste || 0) * 1000), // kg
      inorganicos: Math.round((month.inorganicWaste || 0) * 1000), // kg
      reciclables: Math.round((month.recyclableWaste || 0) * 1000), // kg
      total: Math.round(((month.organicWaste || 0) + (month.inorganicWaste || 0) + (month.recyclableWaste || 0)) * 1000),
    }));

  const pieData = [
    { name: 'Orgánicos', value: organicTotal, fill: '#b5e951' },
    { name: 'Reciclables', value: recyclableTotal, fill: '#d97706' },
    { name: 'Inorgánicos', value: inorganicTotal, fill: '#273949' },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <ClubHeader />
        
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header del módulo con botones de acción */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-anton text-gray-800 uppercase tracking-wider">
                  Gestión de Residuos Sólidos
                </h1>
                <p className="text-gray-600 mt-2">
                  Seguimiento integral para certificación TRUE Zero Waste
                </p>
              </div>
              <div className="flex space-x-3">
                <Link href="/data-entry">
                  <Button className="bg-navy hover:bg-navy-light text-white">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Registrar Datos
                  </Button>
                </Link>
                <Link href="/documents">
                  <Button variant="outline">
                    <FileUp className="w-4 h-4 mr-2" />
                    Subir Documentos
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <SummaryCard
              title="Desviación del Relleno"
              value={`${summaryData.deviation}%`}
              change={summaryData.deviation >= 75 ? 5 : summaryData.deviation >= 50 ? 0 : -5}
              progress={Math.min(100, (summaryData.deviation / 90) * 100)}
              progressLabel="Meta: 90% para TRUE Zero Waste"
              type="deviation"
            />
            
            <SummaryCard
              title="Residuos Orgánicos"
              value={`${organicTotal.toFixed(1)} ton`}
              change={5}
              progress={75}
              progressLabel="Compostaje y biodigestión"
              type="organic"
            />
            
            <SummaryCard
              title="Materiales Reciclables"
              value={`${recyclableTotal.toFixed(1)} ton`}
              change={3}
              progress={80}
              progressLabel="Desviados del relleno sanitario"
              type="inorganic"
            />
            
            <SummaryCard
              title="Total Procesado"
              value={`${totalWaste.toFixed(1)} ton`}
              change={0}
              progress={100}
              progressLabel="Residuos gestionados en el período"
              type="total"
            />
          </div>

          {/* Carga de Documentos CSV/PDF */}
          <div className="mb-8">
            <DocumentUpload 
              clientId={1} 
              onUploadSuccess={() => {
                // Los datos se actualizarán automáticamente por la invalidación de queries
                console.log('Datos cargados exitosamente, refrescando visualización...');
              }}
            />
          </div>
          
          {/* Certificación TRUE Zero Waste */}
          <TrueCertification currentDeviation={summaryData.deviation} />

          {/* Impacto ambiental específico de residuos */}
          <EnvironmentalImpact 
            organicWasteDiverted={environmentalData.organicWasteDiverted}
            recyclableWasteDiverted={environmentalData.recyclableWasteDiverted}
          />

          {/* Análisis detallado */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-anton text-gray-800 mb-6 uppercase tracking-wide">
              Análisis de Residuos Sólidos
            </h2>
            
            <Tabs defaultValue="monthly" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="monthly">Tendencia Mensual</TabsTrigger>
                <TabsTrigger value="composition">Composición</TabsTrigger>
                <TabsTrigger value="diversion">Desviación</TabsTrigger>
                <TabsTrigger value="environmental">Impacto Ambiental</TabsTrigger>
              </TabsList>
              
              <TabsContent value="monthly">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                      <XAxis dataKey="name" fontSize={12} stroke="#6b7280" />
                      <YAxis fontSize={12} stroke="#6b7280" tickFormatter={(value) => `${(value/1000).toFixed(0)}t`} />
                      <Tooltip 
                        formatter={(value, name) => [`${Number(value).toLocaleString()} kg`, name]}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '2px solid #273949',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '500',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="organicos" fill="#b5e951" name="Orgánicos" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="reciclables" fill="#d97706" name="Reciclables" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="inorganicos" fill="#273949" name="Inorgánicos" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="composition">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(1)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} ton`, 'Cantidad']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Detalle por Categoría</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Orgánicos + PODA</span>
                        <span className="text-sm font-bold text-green-600">{organicTotal.toFixed(1)} ton</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Reciclables</span>
                        <span className="text-sm font-bold text-yellow-600">{recyclableTotal.toFixed(1)} ton</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Inorgánicos</span>
                        <span className="text-sm font-bold text-gray-600">{inorganicTotal.toFixed(1)} ton</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="diversion">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                        <XAxis dataKey="name" fontSize={12} stroke="#6b7280" />
                        <YAxis fontSize={12} stroke="#6b7280" tickFormatter={(value) => `${(value/1000).toFixed(0)}t`} />
                        <Tooltip 
                          formatter={(value, name) => [`${Number(value).toLocaleString()} kg`, name]}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '2px solid #22c55e',
                            borderRadius: '12px',
                          }}
                        />
                        <Bar dataKey="organicos" fill="#b5e951" name="Desviados del Relleno" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="reciclables" fill="#d97706" name="Reciclables" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Progreso TRUE Zero Waste</h3>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 mb-2">
                            {summaryData.deviation}%
                          </div>
                          <div className="text-sm text-gray-600">Desviación Actual</div>
                          <div className="w-full bg-green-200 rounded-full h-3 mt-3">
                            <div 
                              className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.min(100, (summaryData.deviation / 90) * 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0%</span>
                            <span className="font-medium">Meta: 90%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Material desviado:</span>
                            <span className="font-medium">{(organicTotal + recyclableTotal).toFixed(1)} ton</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Enviado a relleno:</span>
                            <span className="font-medium">{inorganicTotal.toFixed(1)} ton</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span>Total procesado:</span>
                            <span className="font-bold">{totalWaste.toFixed(1)} ton</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="environmental">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center bg-green-50 rounded-xl p-6 border border-green-100">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {((organicTotal + recyclableTotal) * 0.0012).toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Árboles Equivalentes</div>
                    <div className="text-xs text-gray-500">Salvados por desviación de residuos</div>
                  </div>
                  
                  <div className="text-center bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {((recyclableTotal * 15000) + (organicTotal * 8000)).toLocaleString()}L
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Agua Conservada</div>
                    <div className="text-xs text-gray-500">Por reciclaje y compostaje</div>
                  </div>
                  
                  <div className="text-center bg-purple-50 rounded-xl p-6 border border-purple-100">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {((recyclableTotal * 3200) + (organicTotal * 1800)).toLocaleString()}kWh
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Energía Ahorrada</div>
                    <div className="text-xs text-gray-500">vs. producción de materiales vírgenes</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Alertas y notificaciones */}
          {alerts.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-anton text-gray-800 mb-4 uppercase tracking-wide">
                Alertas y Notificaciones
              </h2>
              <AlertsTable alerts={alerts} />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}