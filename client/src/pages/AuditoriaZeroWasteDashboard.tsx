import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import AuditoriaZeroWasteForm from './AuditoriaZeroWaste';
import TRUEAuditDashboard from '@/components/TRUEAuditDashboard';
import { 
  Plus,
  FileText,
  Calendar,
  User,
  TrendingUp,
  Recycle,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Home,
  Trash2,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Gauge
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Area, AreaChart, Pie } from 'recharts';

interface ZeroWasteAudit {
  id: number;
  auditDate: string;
  auditType: string;
  auditorName: string;
  auditorTitle: string;
  totalWeightBefore: number;
  quadrantWeight: number;
  weather: string;
  temperature: number;
  humidity: number;
  status: string;
  notes: string;
  photos: string[];
  createdAt: string;
}

interface ZeroWasteMaterial {
  id: number;
  auditId: number;
  materialCategory: string;
  materialType: string;
  weight: number;
  percentage: number;
  divertible: boolean;
  diversionMethod: string;
  contamination: string;
  condition: string;
  notes: string;
}

export default function AuditoriaZeroWaste() {
  const [showNewAuditForm, setShowNewAuditForm] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<number | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const { toast } = useToast();

  const { data: audits, isLoading: auditsLoading, refetch } = useQuery<ZeroWasteAudit[]>({
    queryKey: ['/api/zero-waste-audits'],
  });

  const { data: materials } = useQuery<ZeroWasteMaterial[]>({
    queryKey: ['/api/zero-waste-audits', selectedAudit, 'materials'],
    queryFn: () => selectedAudit ? 
      fetch(`/api/zero-waste-audits/${selectedAudit}/materials`).then(res => res.json()) : 
      Promise.resolve([]),
    enabled: !!selectedAudit,
  });

  const getAuditTypeLabel = (type: string) => {
    switch (type) {
      case 'quarterly': return 'Trimestral';
      case 'monthly': return 'Mensual';
      case 'special': return 'Especial';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'validated': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in_progress': return 'En Progreso';
      case 'validated': return 'Validada';
      default: return status;
    }
  };

  const calculateDiversionRate = (materials: ZeroWasteMaterial[]) => {
    if (!materials || materials.length === 0) return 0;
    const totalWeight = materials.reduce((sum, m) => sum + m.weight, 0);
    const divertedWeight = materials.filter(m => m.divertible).reduce((sum, m) => sum + m.weight, 0);
    return totalWeight > 0 ? (divertedWeight / totalWeight) * 100 : 0;
  };

  const getMaterialsByDestination = (materials: ZeroWasteMaterial[]) => {
    const destinations = {
      'recycling': { label: 'Reciclaje', weight: 0, materials: [] as ZeroWasteMaterial[], color: 'bg-blue-500' },
      'composting': { label: 'Compostaje', weight: 0, materials: [] as ZeroWasteMaterial[], color: 'bg-green-500' },
      'reuse': { label: 'Reutilización', weight: 0, materials: [] as ZeroWasteMaterial[], color: 'bg-purple-500' },
      'energy_recovery': { label: 'Valorización Energética', weight: 0, materials: [] as ZeroWasteMaterial[], color: 'bg-orange-500' },
      'landfill': { label: 'Relleno Sanitario', weight: 0, materials: [] as ZeroWasteMaterial[], color: 'bg-red-500' }
    };

    materials?.forEach(material => {
      const destination = material.divertible ? material.diversionMethod : 'landfill';
      if (destinations[destination as keyof typeof destinations]) {
        destinations[destination as keyof typeof destinations].weight += material.weight;
        destinations[destination as keyof typeof destinations].materials.push(material);
      }
    });

    return destinations;
  };

  const handleAuditSaved = () => {
    setShowNewAuditForm(false);
    refetch();
    toast({
      title: "Auditoría Guardada",
      description: "La auditoría se ha guardado exitosamente",
    });
  };

  if (showNewAuditForm) {
    return <AuditoriaZeroWasteForm onSaved={handleAuditSaved} onCancel={() => setShowNewAuditForm(false)} />;
  }

  if (auditsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b5e951] mx-auto mb-4"></div>
          <p>Cargando auditorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#273949]">
                  Auditoría Zero Waste
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Metodología de cuarteo NMX-AA-61 para certificación TRUE Zero Waste
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowNewAuditForm(true)}
              className="bg-[#b5e951] text-black hover:bg-[#a5d941] flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva Auditoría
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Métricas generales */}
        {audits && audits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Auditorías</p>
                    <p className="text-2xl font-bold text-[#273949]">{audits.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-[#b5e951]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completadas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {audits?.filter((a: ZeroWasteAudit) => a.status === 'completed').length || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">En Progreso</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {audits?.filter((a: ZeroWasteAudit) => a.status === 'in_progress').length || 0}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Peso Total</p>
                    <p className="text-2xl font-bold text-[#b5e951]">
                      {audits?.reduce((sum: number, a: ZeroWasteAudit) => sum + a.totalWeightBefore, 0)?.toFixed(0) || '0'} kg
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-[#b5e951]" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de auditorías */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Auditorías Realizadas
                  </div>
                  <Badge variant="secondary">{audits?.length || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {audits && audits.length > 0 ? (
                  audits.map((audit: ZeroWasteAudit) => (
                    <div
                      key={audit.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedAudit === audit.id
                          ? 'border-[#b5e951] bg-[#b5e951]/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedAudit(audit.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm">
                            {new Date(audit.auditDate).toLocaleDateString('es-ES')}
                          </p>
                          <p className="text-xs text-gray-600">
                            {getAuditTypeLabel(audit.auditType)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(audit.status)}>
                          {getStatusLabel(audit.status)}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{audit.auditorName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {audit.totalWeightBefore} kg procesados
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay auditorías registradas</h3>
                    <p className="text-gray-500 mb-6">
                      Comienza creando tu primera auditoría Zero Waste con metodología de cuarteo NMX-AA-61
                    </p>
                    <Button 
                      onClick={() => setShowNewAuditForm(true)}
                      className="bg-[#b5e951] text-black hover:bg-[#a5d941] flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Crear Primera Auditoría
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detalle de auditoría seleccionada */}
          <div className="lg:col-span-2">
            {selectedAudit && audits ? (() => {
              const audit = audits.find((a: ZeroWasteAudit) => a.id === selectedAudit);
              if (!audit) return null;

              const diversionRate = calculateDiversionRate(materials || []);
              const destinationBreakdown = getMaterialsByDestination(materials || []);
              const totalCharacterizedWeight = materials?.reduce((sum: number, m: ZeroWasteMaterial) => sum + m.weight, 0) || 0;
              
              // Preparar datos para gráficos
              const chartData = Object.entries(destinationBreakdown)
                .filter(([_, data]) => data.weight > 0)
                .map(([key, data]) => ({
                  name: data.label,
                  weight: data.weight,
                  percentage: totalCharacterizedWeight > 0 ? (data.weight / totalCharacterizedWeight) * 100 : 0,
                  color: data.color.replace('bg-', '#').replace('-500', ''),
                  isSustainable: key !== 'landfill'
                }));

              const pieData = chartData.map((item, index) => ({
                ...item,
                fill: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'][index] || '#6b7280'
              }));

              const categoryBreakdown = materials?.reduce((acc: any, material) => {
                const category = material.materialCategory;
                if (!acc[category]) {
                  acc[category] = { total: 0, diverted: 0, materials: [] };
                }
                acc[category].total += material.weight;
                if (material.divertible) {
                  acc[category].diverted += material.weight;
                }
                acc[category].materials.push(material);
                return acc;
              }, {}) || {};

              const categoryChartData = Object.entries(categoryBreakdown).map(([category, data]: [string, any]) => ({
                category,
                total: data.total,
                diverted: data.diverted,
                landfill: data.total - data.diverted,
                diversionRate: data.total > 0 ? (data.diverted / data.total) * 100 : 0
              }));

              // Vista avanzada TRUE Dashboard
              if (showDetailedView && materials) {
                return (
                  <div className="bg-white rounded-lg border p-1">
                    <TRUEAuditDashboard 
                      auditData={{
                        auditorName: audit.auditorName,
                        auditDate: audit.auditDate,
                        totalWeightBefore: audit.totalWeightBefore,
                        remainingWeight: audit.quadrantWeight || (audit.totalWeightBefore * 0.25),
                        bags: materials.map((material, index) => ({
                          id: material.id.toString(),
                          bagNumber: index + 1,
                          materialType: material.materialType,
                          category: material.materialCategory,
                          weight: material.weight,
                          divertible: material.divertible,
                          destination: material.divertible ? 'recycling' : 'landfill'
                        })),
                        weather: audit.weather,
                        temperature: audit.temperature,
                        humidity: audit.humidity
                      }}
                    />
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {/* Información general */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          Detalles de Auditoría
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant={showDetailedView ? "default" : "outline"}
                            onClick={() => setShowDetailedView(!showDetailedView)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {showDetailedView ? 'Vista Simple' : 'Dashboard Avanzado'}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Descargar PDF
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-sm text-gray-600 mb-2">Información General</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Fecha:</span>
                                <span className="text-sm font-medium">
                                  {new Date(audit.auditDate).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Tipo:</span>
                                <span className="text-sm font-medium">{getAuditTypeLabel(audit.auditType)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Auditor:</span>
                                <span className="text-sm font-medium">{audit.auditorName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Cargo:</span>
                                <span className="text-sm font-medium">{audit.auditorTitle}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-sm text-gray-600 mb-2">Condiciones Ambientales</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Clima:</span>
                                <span className="text-sm font-medium">{audit.weather}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Temperatura:</span>
                                <span className="text-sm font-medium">{audit.temperature}°C</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Humedad:</span>
                                <span className="text-sm font-medium">{audit.humidity}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Métricas principales */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Métricas de Desviación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Peso Total Procesado</p>
                          <p className="text-3xl font-bold text-[#273949]">
                            {audit.totalWeightBefore} kg
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Material Caracterizado</p>
                          <p className="text-3xl font-bold text-[#b5e951]">
                            {totalCharacterizedWeight.toFixed(1)} kg
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Tasa de Desviación</p>
                          <p className="text-3xl font-bold text-green-600">
                            {diversionRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progreso hacia TRUE Zero Waste</span>
                          <span className="text-sm text-gray-600">{diversionRate.toFixed(1)}% de 90%</span>
                        </div>
                        <Progress value={Math.min(diversionRate, 100)} className="h-3" />
                        <p className="text-xs text-gray-600 mt-1">
                          TRUE Zero Waste requiere 90% de desviación del relleno sanitario
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Análisis Visual Avanzado */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfico de Barras - Distribución por Destino */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Distribución por Destino Final
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="name" 
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                fontSize={12}
                              />
                              <YAxis />
                              <Tooltip 
                                formatter={(value: any, name: string) => [
                                  `${value.toFixed(1)} kg`, 
                                  name === 'weight' ? 'Peso' : name
                                ]}
                              />
                              <Bar 
                                dataKey="weight" 
                                fill="#b5e951"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Gráfico Circular - Porcentajes */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Composición Porcentual
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percentage }: any) => `${name}: ${percentage.toFixed(1)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="percentage"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value: any) => [`${value.toFixed(1)}%`, 'Porcentaje']}
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Análisis por Categoría de Materiales */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Análisis por Categoría de Material
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={categoryChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="category"
                              angle={-45}
                              textAnchor="end"
                              height={100}
                              fontSize={12}
                            />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: any, name: string) => {
                                const labels: any = {
                                  'diverted': 'Desviado',
                                  'landfill': 'Relleno Sanitario',
                                  'total': 'Total'
                                };
                                return [`${value.toFixed(1)} kg`, labels[name] || name];
                              }}
                            />
                            <Legend />
                            <Bar 
                              dataKey="diverted" 
                              stackId="a" 
                              fill="#10b981" 
                              name="Desviado"
                              radius={[0, 0, 0, 0]}
                            />
                            <Bar 
                              dataKey="landfill" 
                              stackId="a" 
                              fill="#ef4444" 
                              name="Relleno Sanitario"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Indicadores de Rendimiento */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-700">Tasa de Desviación</p>
                            <p className="text-2xl font-bold text-green-900">
                              {diversionRate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-green-600">
                              {diversionRate >= 90 ? '🎯 Objetivo TRUE alcanzado' : `Falta ${(90 - diversionRate).toFixed(1)}% para TRUE`}
                            </p>
                          </div>
                          <Gauge className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-700">Materiales Únicos</p>
                            <p className="text-2xl font-bold text-blue-900">
                              {materials?.length || 0}
                            </p>
                            <p className="text-xs text-blue-600">
                              Tipos caracterizados
                            </p>
                          </div>
                          <Target className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-purple-700">Eficiencia del Cuarteo</p>
                            <p className="text-2xl font-bold text-purple-900">
                              {audit.totalWeightBefore > 0 ? ((totalCharacterizedWeight / audit.totalWeightBefore) * 100).toFixed(1) : '0'}%
                            </p>
                            <p className="text-xs text-purple-600">
                              del peso total procesado
                            </p>
                          </div>
                          <Activity className="h-8 w-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Resumen tabular detallado */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Resumen Detallado por Destino
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Destino Final</th>
                              <th className="text-right p-2">Peso (kg)</th>
                              <th className="text-right p-2">Porcentaje</th>
                              <th className="text-right p-2">Materiales</th>
                              <th className="text-center p-2">Impacto TRUE</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(destinationBreakdown).map(([key, data]) => {
                              if (data.weight === 0) return null;
                              return (
                                <tr key={key} className="border-b hover:bg-gray-50">
                                  <td className="p-2">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-3 h-3 rounded-full ${data.color}`}></div>
                                      <span className="font-medium">{data.label}</span>
                                    </div>
                                  </td>
                                  <td className="text-right p-2 font-semibold">
                                    {data.weight.toFixed(1)}
                                  </td>
                                  <td className="text-right p-2">
                                    {totalCharacterizedWeight > 0 
                                      ? ((data.weight / totalCharacterizedWeight) * 100).toFixed(1)
                                      : '0.0'}%
                                  </td>
                                  <td className="text-right p-2">
                                    {data.materials.length}
                                  </td>
                                  <td className="text-center p-2">
                                    {key === 'landfill' ? (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                        ❌ No cuenta
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                        ✅ Cuenta para TRUE
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lista de Materiales */}
                  {materials && materials.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Materiales Identificados ({materials.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {materials.map((material: ZeroWasteMaterial) => (
                            <div key={material.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                {material.divertible ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                )}
                                <div>
                                  <p className="text-sm font-medium">{material.materialType}</p>
                                  <p className="text-xs text-gray-600">{material.materialCategory}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">{material.weight} kg</p>
                                <p className="text-xs text-gray-600">{material.percentage?.toFixed(1) || '0.0'}%</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Observaciones */}
                  {audit.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Observaciones</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{audit.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })() : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Selecciona una auditoría para ver los detalles</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Haz clic en cualquier auditoría de la lista para ver el análisis completo
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}