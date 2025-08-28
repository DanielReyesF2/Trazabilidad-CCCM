import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ClipboardList, 
  Scale, 
  Grid3X3, 
  Thermometer, 
  Cloud, 
  Camera, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Target,
  Recycle,
  Leaf,
  Trash2,
  Home,
  Plus,
  Edit,
  X
} from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// Definir los pasos de la auditoría según NOM
const AUDIT_STEPS = [
  { id: 1, title: 'Información General y Equipo', icon: ClipboardList },
  { id: 2, title: 'Preparación del Área (4m x 4m)', icon: Scale },
  { id: 3, title: 'Homogeneización y Primer Cuarteo', icon: Grid3X3 },
  { id: 4, title: 'Eliminación de Partes Opuestas', icon: Target },
  { id: 5, title: 'Segundo Cuarteo y Caracterización', icon: Recycle },
  { id: 6, title: 'Documentación Final', icon: FileText }
];

// Tipos de materiales para caracterización detallada
const MATERIAL_TYPES = {
  'Papel y Cartón': [
    'Papel blanco de oficina',
    'Papel periódico', 
    'Papel mixto',
    'Cartón corrugado',
    'Cartón liso',
    'Papel kraft',
    'Papel sucio/contaminado'
  ],
  'Plásticos': [
    'PET (#1)',
    'HDPE (#2)', 
    'PVC (#3)',
    'LDPE (#4)',
    'PP (#5)',
    'PS (#6)',
    'Otros plásticos (#7)',
    'Bolsas plásticas',
    'Plástico film',
    'Poliestireno expandido'
  ],
  'Vidrio': [
    'Vidrio claro',
    'Vidrio ámbar',
    'Vidrio verde',
    'Vidrio plano',
    'Cristal roto'
  ],
  'Metales': [
    'Aluminio (latas)',
    'Aluminio (otros)',
    'Acero (latas)',
    'Acero (otros)',
    'Cobre',
    'Metales mixtos'
  ],
  'Orgánicos': [
    'Restos de comida',
    'Residuos de jardín',
    'Madera',
    'Papel sucio orgánico',
    'Textiles naturales'
  ],
  'Otros': [
    'Textiles sintéticos',
    'Cuero',
    'Caucho',
    'Materiales compuestos',
    'Residuos sanitarios',
    'Pañales',
    'Productos de higiene'
  ]
};

const DESTINATIONS = {
  'landfill': 'Relleno Sanitario',
  'recycling': 'Reciclaje', 
  'composting': 'Compostaje',
  'reuse': 'Reutilización',
  'energy_recovery': 'Valorización Energética'
};

interface AuditData {
  // Paso 1: Información General y Equipo
  auditDate: string;
  auditType: 'quarterly' | 'monthly' | 'special';
  auditorName: string;
  auditorTitle: string;
  teamMembers: string; // Mínimo 3 personas según NOM
  numberOfBags: number; // Máximo 250 bolsas según NOM
  
  // Paso 2: Preparación del Área
  areaLength: number; // 4m x 4m según NOM
  areaWidth: number;
  surfaceType: string; // Cemento pulido o similar
  underRoof: boolean; // Debe estar bajo techo
  totalWeightBefore: number;
  weather: string;
  temperature: number;
  humidity: number;
  
  // Paso 3: Homogeneización y Primer Cuarteo
  homogenizationComplete: boolean;
  quadrantsCreated: boolean;
  quadrantWeights: { A: number; B: number; C: number; D: number };
  
  // Paso 4: Eliminación de Partes Opuestas
  eliminatedQuadrants: string[]; // A y C ó B y D
  remainingWeight: number; // Debe ser mínimo 50 kg
  laboratoryWeight: number; // Aproximadamente 10 kg para análisis
  
  // Paso 5: Segundo Cuarteo y Caracterización
  finalSampleWeight: number;
  bags: Array<{
    id: string;
    bagNumber: number;
    materialType: string;
    category: string;
    weight: number;
    volume?: number;
    condition: string;
    contamination: string;
    divertible: boolean;
    diversionMethod?: string;
    destination: 'landfill' | 'recycling' | 'composting' | 'reuse' | 'energy_recovery';
    notes?: string;
  }>;
  
  // Paso 6: Documentación
  notes: string;
  photos: string[];
  transportTime: number; // Máximo 8 horas según NOM
}

export default function AuditoriaZeroWaste() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showBagForm, setShowBagForm] = useState(false);
  const [editingBag, setEditingBag] = useState<string | null>(null);
  const { toast } = useToast();

  const [auditData, setAuditData] = useState<AuditData>({
    auditDate: new Date().toISOString().split('T')[0],
    auditType: 'quarterly',
    auditorName: '',
    auditorTitle: '',
    teamMembers: '',
    numberOfBags: 0,
    areaLength: 4,
    areaWidth: 4,
    surfaceType: 'Cemento pulido',
    underRoof: true,
    totalWeightBefore: 0,
    weather: '',
    temperature: 0,
    humidity: 0,
    homogenizationComplete: false,
    quadrantsCreated: false,
    quadrantWeights: { A: 0, B: 0, C: 0, D: 0 },
    eliminatedQuadrants: [],
    remainingWeight: 0,
    laboratoryWeight: 10,
    finalSampleWeight: 0,
    bags: [],
    notes: '',
    photos: [],
    transportTime: 0
  });

  const nextStep = () => {
    if (currentStep < AUDIT_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addNewBag = () => {
    const newBag = {
      id: Date.now().toString(),
      bagNumber: auditData.bags.length + 1,
      materialType: '',
      category: '',
      weight: 0,
      volume: 0,
      condition: 'Bueno',
      contamination: 'Limpio',
      divertible: false,
      destination: 'landfill' as const,
      notes: ''
    };
    setAuditData(prev => ({
      ...prev,
      bags: [...prev.bags, newBag]
    }));
    setEditingBag(newBag.id);
  };

  const updateBag = (bagId: string, updates: Partial<typeof auditData.bags[0]>) => {
    setAuditData(prev => ({
      ...prev,
      bags: prev.bags.map(bag => 
        bag.id === bagId ? { ...bag, ...updates } : bag
      )
    }));
  };

  const deleteBag = (bagId: string) => {
    setAuditData(prev => ({
      ...prev,
      bags: prev.bags.filter(bag => bag.id !== bagId)
    }));
  };

  const getTotalCharacterizedWeight = () => {
    return auditData.bags.reduce((total, bag) => total + bag.weight, 0);
  };

  const getBagsByDestination = () => {
    const grouped = auditData.bags.reduce((acc, bag) => {
      if (!acc[bag.destination]) {
        acc[bag.destination] = [];
      }
      acc[bag.destination].push(bag);
      return acc;
    }, {} as Record<string, typeof auditData.bags>);
    
    return grouped;
  };

  const calculateProgress = () => {
    return (currentStep / AUDIT_STEPS.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
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
                  Metodología de cuarteo según NMX-AA-61 - TRUE Zero Waste Certification
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              Paso {currentStep} de {AUDIT_STEPS.length}
            </Badge>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar con pasos */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pasos de Auditoría</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {AUDIT_STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      currentStep === step.id
                        ? 'bg-[#b5e951] text-black'
                        : currentStep > step.id
                        ? 'bg-green-100 text-green-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <step.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{step.title}</span>
                    {currentStep > step.id && <CheckCircle className="h-4 w-4 ml-auto" />}
                  </div>
                ))}
              </CardContent>

              {/* Resumen actual */}
              <CardHeader>
                <CardTitle className="text-sm">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p><strong>Auditor:</strong> {auditData.auditorName}</p>
                  <p><strong>Fecha:</strong> {auditData.auditDate}</p>
                  {auditData.totalWeightBefore > 0 && (
                    <p><strong>Peso total:</strong> {auditData.totalWeightBefore} kg</p>
                  )}
                  {auditData.numberOfBags > 0 && (
                    <p><strong>Bolsas:</strong> {auditData.numberOfBags}</p>
                  )}
                  {auditData.remainingWeight > 0 && (
                    <p><strong>Peso restante:</strong> {auditData.remainingWeight.toFixed(1)} kg</p>
                  )}
                  {auditData.eliminatedQuadrants.length > 0 && (
                    <p><strong>Eliminados:</strong> {auditData.eliminatedQuadrants.join(' y ')}</p>
                  )}
                  {auditData.bags.length > 0 && (
                    <p><strong>Bolsas caracterizadas:</strong> {auditData.bags.length}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3 space-y-6">
            <div className="min-h-[600px]">
              {/* Paso 1: Información General y Equipo */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      Información General y Equipo (NMX-AA-61)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Requisitos NOM:</strong><br />
                        • Mínimo 3 personas para efectuar el cuarteo<br />
                        • Máximo 250 bolsas de polietileno<br />
                        • Residuos resultado del estudio de generación según NMX-AA-61
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="auditDate">Fecha de Auditoría</Label>
                        <Input
                          id="auditDate"
                          type="date"
                          value={auditData.auditDate}
                          onChange={(e) => setAuditData(prev => ({ ...prev, auditDate: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="auditType">Tipo de Auditoría</Label>
                        <Select
                          value={auditData.auditType}
                          onValueChange={(value) => setAuditData(prev => ({ ...prev, auditType: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quarterly">Trimestral</SelectItem>
                            <SelectItem value="monthly">Mensual</SelectItem>
                            <SelectItem value="special">Especial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="auditorName">Auditor Responsable</Label>
                        <Input
                          id="auditorName"
                          value={auditData.auditorName}
                          onChange={(e) => setAuditData(prev => ({ ...prev, auditorName: e.target.value }))}
                          placeholder="Nombre completo del responsable"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="auditorTitle">Cargo/Título</Label>
                        <Input
                          id="auditorTitle"
                          value={auditData.auditorTitle}
                          onChange={(e) => setAuditData(prev => ({ ...prev, auditorTitle: e.target.value }))}
                          placeholder="Especialista en Sostenibilidad, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teamMembers">Equipo de Trabajo (mín. 3 personas)</Label>
                        <Textarea
                          id="teamMembers"
                          value={auditData.teamMembers}
                          onChange={(e) => setAuditData(prev => ({ ...prev, teamMembers: e.target.value }))}
                          placeholder="Nombre de los 3 participantes mínimo..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="numberOfBags">Número de Bolsas (máx. 250)</Label>
                        <Input
                          id="numberOfBags"
                          type="number"
                          max="250"
                          value={auditData.numberOfBags || ''}
                          onChange={(e) => setAuditData(prev => ({ 
                            ...prev, 
                            numberOfBags: parseInt(e.target.value) || 0 
                          }))}
                          placeholder="Cantidad de bolsas de polietileno"
                        />
                        {auditData.numberOfBags > 250 && (
                          <p className="text-sm text-red-600">
                            Máximo 250 bolsas según NMX-AA-61
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Paso 2: Preparación del Área */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="h-5 w-5" />
                      Preparación del Área de Trabajo (NMX-AA-61)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Requisitos de Área según NOM:</strong><br />
                        • Área plana horizontal de 4m x 4m<br />
                        • Superficie de cemento pulido o similar<br />
                        • Debe estar bajo techo<br />
                        • Vaciar contenido de bolsas formando un montón
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Especificaciones del Área</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="areaLength">Largo (m)</Label>
                            <Input
                              id="areaLength"
                              type="number"
                              step="0.1"
                              value={auditData.areaLength}
                              onChange={(e) => setAuditData(prev => ({ 
                                ...prev, 
                                areaLength: parseFloat(e.target.value) || 4 
                              }))}
                              placeholder="4.0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="areaWidth">Ancho (m)</Label>
                            <Input
                              id="areaWidth"
                              type="number"
                              step="0.1"
                              value={auditData.areaWidth}
                              onChange={(e) => setAuditData(prev => ({ 
                                ...prev, 
                                areaWidth: parseFloat(e.target.value) || 4 
                              }))}
                              placeholder="4.0"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="surfaceType">Tipo de Superficie</Label>
                          <Select
                            value={auditData.surfaceType}
                            onValueChange={(value) => setAuditData(prev => ({ ...prev, surfaceType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cemento pulido">Cemento pulido</SelectItem>
                              <SelectItem value="Concreto">Concreto</SelectItem>
                              <SelectItem value="Asfalto">Asfalto</SelectItem>
                              <SelectItem value="Otro similar">Otro similar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="underRoof"
                            checked={auditData.underRoof}
                            onChange={(e) => setAuditData(prev => ({ ...prev, underRoof: e.target.checked }))}
                            className="rounded"
                          />
                          <Label htmlFor="underRoof">Área bajo techo (requerido)</Label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">Condiciones Ambientales</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="totalWeight">Peso Total de Residuos (kg)</Label>
                          <Input
                            id="totalWeight"
                            type="number"
                            step="0.1"
                            value={auditData.totalWeightBefore || ''}
                            onChange={(e) => setAuditData(prev => ({ 
                              ...prev, 
                              totalWeightBefore: parseFloat(e.target.value) || 0 
                            }))}
                            placeholder="0.0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="weather">Condiciones Climáticas</Label>
                          <Select
                            value={auditData.weather}
                            onValueChange={(value) => setAuditData(prev => ({ ...prev, weather: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar clima" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sunny">Soleado</SelectItem>
                              <SelectItem value="cloudy">Nublado</SelectItem>
                              <SelectItem value="rainy">Lluvioso</SelectItem>
                              <SelectItem value="overcast">Parcialmente nublado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="temperature">Temperatura (°C)</Label>
                            <Input
                              id="temperature"
                              type="number"
                              value={auditData.temperature || ''}
                              onChange={(e) => setAuditData(prev => ({ 
                                ...prev, 
                                temperature: parseFloat(e.target.value) || 0 
                              }))}
                              placeholder="25"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="humidity">Humedad (%)</Label>
                            <Input
                              id="humidity"
                              type="number"
                              min="0"
                              max="100"
                              value={auditData.humidity || ''}
                              onChange={(e) => setAuditData(prev => ({ 
                                ...prev, 
                                humidity: parseFloat(e.target.value) || 0 
                              }))}
                              placeholder="60"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Visualización del área */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <h4 className="font-semibold mb-2">Vista del Área de Trabajo</h4>
                        <div 
                          className="mx-auto border-2 border-dashed border-gray-400 bg-gray-200 relative"
                          style={{ width: '200px', height: '200px' }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                            {auditData.areaLength}m × {auditData.areaWidth}m<br/>
                            {auditData.surfaceType}<br/>
                            {auditData.underRoof ? '✓ Bajo techo' : '✗ Sin techo'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Paso 3: Homogeneización y Primer Cuarteo */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Grid3X3 className="h-5 w-5" />
                      Homogeneización y Primer Cuarteo (NMX-AA-61)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Procedimiento según NOM:</strong><br />
                        1. Traspalear con pala y/o bieldo hasta homogeneizar<br />
                        2. Dividir en 4 partes aproximadamente iguales (A, B, C, D)<br />
                        3. Pesar cada cuadrante por separado<br />
                        4. Preparar para eliminación de partes opuestas
                      </AlertDescription>
                    </Alert>

                    {/* Proceso de homogeneización */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="homogenization"
                          checked={auditData.homogenizationComplete}
                          onChange={(e) => setAuditData(prev => ({ 
                            ...prev, 
                            homogenizationComplete: e.target.checked 
                          }))}
                          className="rounded"
                        />
                        <Label htmlFor="homogenization">
                          Homogeneización completada (traspaleo con pala/bieldo)
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="quadrantsCreated"
                          checked={auditData.quadrantsCreated}
                          onChange={(e) => setAuditData(prev => ({ 
                            ...prev, 
                            quadrantsCreated: e.target.checked 
                          }))}
                          className="rounded"
                          disabled={!auditData.homogenizationComplete}
                        />
                        <Label htmlFor="quadrantsCreated">
                          División en 4 partes aproximadamente iguales
                        </Label>
                      </div>
                    </div>

                    {/* Visualización de cuadrantes con pesos */}
                    {auditData.quadrantsCreated && (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold mb-4 text-center">
                          Cuadrantes A, B, C, D (Primer Cuarteo)
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                          {/* Cuadrante A */}
                          <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                            <div className="text-center font-bold text-lg mb-2">A</div>
                            <div className="space-y-2">
                              <Label htmlFor="weightA" className="text-sm">Peso (kg)</Label>
                              <Input
                                id="weightA"
                                type="number"
                                step="0.1"
                                value={auditData.quadrantWeights.A || ''}
                                onChange={(e) => setAuditData(prev => ({ 
                                  ...prev, 
                                  quadrantWeights: {
                                    ...prev.quadrantWeights,
                                    A: parseFloat(e.target.value) || 0
                                  }
                                }))}
                                placeholder="0.0"
                              />
                            </div>
                          </div>

                          {/* Cuadrante B */}
                          <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                            <div className="text-center font-bold text-lg mb-2">B</div>
                            <div className="space-y-2">
                              <Label htmlFor="weightB" className="text-sm">Peso (kg)</Label>
                              <Input
                                id="weightB"
                                type="number"
                                step="0.1"
                                value={auditData.quadrantWeights.B || ''}
                                onChange={(e) => setAuditData(prev => ({ 
                                  ...prev, 
                                  quadrantWeights: {
                                    ...prev.quadrantWeights,
                                    B: parseFloat(e.target.value) || 0
                                  }
                                }))}
                                placeholder="0.0"
                              />
                            </div>
                          </div>

                          {/* Cuadrante C */}
                          <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                            <div className="text-center font-bold text-lg mb-2">C</div>
                            <div className="space-y-2">
                              <Label htmlFor="weightC" className="text-sm">Peso (kg)</Label>
                              <Input
                                id="weightC"
                                type="number"
                                step="0.1"
                                value={auditData.quadrantWeights.C || ''}
                                onChange={(e) => setAuditData(prev => ({ 
                                  ...prev, 
                                  quadrantWeights: {
                                    ...prev.quadrantWeights,
                                    C: parseFloat(e.target.value) || 0
                                  }
                                }))}
                                placeholder="0.0"
                              />
                            </div>
                          </div>

                          {/* Cuadrante D */}
                          <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                            <div className="text-center font-bold text-lg mb-2">D</div>
                            <div className="space-y-2">
                              <Label htmlFor="weightD" className="text-sm">Peso (kg)</Label>
                              <Input
                                id="weightD"
                                type="number"
                                step="0.1"
                                value={auditData.quadrantWeights.D || ''}
                                onChange={(e) => setAuditData(prev => ({ 
                                  ...prev, 
                                  quadrantWeights: {
                                    ...prev.quadrantWeights,
                                    D: parseFloat(e.target.value) || 0
                                  }
                                }))}
                                placeholder="0.0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Resumen de pesos */}
                        <div className="mt-6 text-center">
                          <p className="text-sm text-gray-600">
                            <strong>Total cuadrantes:</strong> {' '}
                            {(auditData.quadrantWeights.A + auditData.quadrantWeights.B + 
                              auditData.quadrantWeights.C + auditData.quadrantWeights.D).toFixed(1)} kg
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Peso original:</strong> {auditData.totalWeightBefore} kg
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Paso 4: Eliminación de Partes Opuestas */}
              {currentStep === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Eliminación de Partes Opuestas (NMX-AA-61)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Procedimiento según NOM:</strong><br />
                        • Eliminar partes opuestas: A y C ó B y D<br />
                        • Repetir operación hasta dejar mínimo 50 kg<br />
                        • Tomar 10 kg aprox. para análisis de laboratorio<br />
                        • Resto para análisis físicos, químicos y biológicos
                      </AlertDescription>
                    </Alert>

                    {/* Selección de partes a eliminar */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Seleccionar partes opuestas a eliminar:</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-4">
                              <input
                                type="radio"
                                id="elimateAC"
                                name="elimination"
                                checked={JSON.stringify(auditData.eliminatedQuadrants) === JSON.stringify(['A', 'C'])}
                                onChange={() => setAuditData(prev => ({ 
                                  ...prev, 
                                  eliminatedQuadrants: ['A', 'C'],
                                  remainingWeight: prev.quadrantWeights.B + prev.quadrantWeights.D
                                }))}
                              />
                              <Label htmlFor="elimateAC">Eliminar A y C</Label>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="bg-red-100 p-2 rounded text-center">
                                A: {auditData.quadrantWeights.A} kg
                              </div>
                              <div className="bg-green-100 p-2 rounded text-center">
                                B: {auditData.quadrantWeights.B} kg
                              </div>
                              <div className="bg-red-100 p-2 rounded text-center">
                                C: {auditData.quadrantWeights.C} kg
                              </div>
                              <div className="bg-green-100 p-2 rounded text-center">
                                D: {auditData.quadrantWeights.D} kg
                              </div>
                            </div>
                            <p className="text-sm text-center mt-2">
                              <strong>Quedan:</strong> {(auditData.quadrantWeights.B + auditData.quadrantWeights.D).toFixed(1)} kg
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-4">
                              <input
                                type="radio"
                                id="eliminateBD"
                                name="elimination"
                                checked={JSON.stringify(auditData.eliminatedQuadrants) === JSON.stringify(['B', 'D'])}
                                onChange={() => setAuditData(prev => ({ 
                                  ...prev, 
                                  eliminatedQuadrants: ['B', 'D'],
                                  remainingWeight: prev.quadrantWeights.A + prev.quadrantWeights.C
                                }))}
                              />
                              <Label htmlFor="eliminateBD">Eliminar B y D</Label>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="bg-green-100 p-2 rounded text-center">
                                A: {auditData.quadrantWeights.A} kg
                              </div>
                              <div className="bg-red-100 p-2 rounded text-center">
                                B: {auditData.quadrantWeights.B} kg
                              </div>
                              <div className="bg-green-100 p-2 rounded text-center">
                                C: {auditData.quadrantWeights.C} kg
                              </div>
                              <div className="bg-red-100 p-2 rounded text-center">
                                D: {auditData.quadrantWeights.D} kg
                              </div>
                            </div>
                            <p className="text-sm text-center mt-2">
                              <strong>Quedan:</strong> {(auditData.quadrantWeights.A + auditData.quadrantWeights.C).toFixed(1)} kg
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Validación de peso mínimo */}
                      {auditData.remainingWeight > 0 && (
                        <div className={`p-4 rounded-lg ${
                          auditData.remainingWeight >= 50 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            {auditData.remainingWeight >= 50 ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            )}
                            <p className="font-semibold">
                              Peso restante: {auditData.remainingWeight.toFixed(1)} kg
                            </p>
                          </div>
                          {auditData.remainingWeight < 50 ? (
                            <p className="text-sm text-red-600 mt-2">
                              <strong>¡Atención!</strong> Peso insuficiente. Se requiere mínimo 50 kg según NOM.
                              Debe repetir la operación de cuarteo.
                            </p>
                          ) : (
                            <p className="text-sm text-green-600 mt-2">
                              ✓ Peso suficiente para continuar con la selección de subproductos.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Muestra para laboratorio */}
                      {auditData.remainingWeight >= 50 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="laboratoryWeight">Muestra para Laboratorio (kg)</Label>
                            <Input
                              id="laboratoryWeight"
                              type="number"
                              step="0.1"
                              value={auditData.laboratoryWeight}
                              onChange={(e) => setAuditData(prev => ({ 
                                ...prev, 
                                laboratoryWeight: parseFloat(e.target.value) || 10 
                              }))}
                              placeholder="10.0"
                            />
                            <p className="text-xs text-gray-600">
                              Aproximadamente 10 kg según NOM
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="finalSample">Muestra Final para Análisis (kg)</Label>
                            <Input
                              id="finalSample"
                              type="number"
                              step="0.1"
                              value={auditData.finalSampleWeight}
                              onChange={(e) => setAuditData(prev => ({ 
                                ...prev, 
                                finalSampleWeight: parseFloat(e.target.value) || 0 
                              }))}
                              placeholder={(auditData.remainingWeight - auditData.laboratoryWeight).toFixed(1)}
                            />
                            <p className="text-xs text-gray-600">
                              Resto para selección de subproductos según NMX-AA-22
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Paso 5: Segundo Cuarteo y Caracterización */}
              {currentStep === 5 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Recycle className="h-5 w-5" />
                      Segundo Cuarteo y Caracterización de Materiales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Segundo cuarteo según NMX-AA-22:</strong><br />
                        • Separar material por material de la muestra final<br />
                        • Registrar cada bolsa con su contenido específico<br />
                        • Pesar y caracterizar cada tipo de material<br />
                        • Determinar destino final (relleno sanitario, reciclaje, etc.)
                      </AlertDescription>
                    </Alert>

                    {/* Botón para agregar nueva bolsa */}
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Bolsas Caracterizadas</h3>
                      <Button 
                        onClick={addNewBag}
                        className="bg-[#b5e951] text-black hover:bg-[#a5d941]"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Bolsa
                      </Button>
                    </div>

                    {/* Lista de bolsas */}
                    <div className="space-y-4">
                      {auditData.bags.map((bag) => (
                        <Card key={bag.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            {editingBag === bag.id ? (
                              // Formulario de edición
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-semibold">Bolsa #{bag.bagNumber}</h4>
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      onClick={() => setEditingBag(null)}
                                      variant="outline"
                                    >
                                      Guardar
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => deleteBag(bag.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label>Categoría de Material</Label>
                                    <Select
                                      value={bag.category}
                                      onValueChange={(value) => updateBag(bag.id, { category: value, materialType: '' })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar categoría" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.keys(MATERIAL_TYPES).map((category) => (
                                          <SelectItem key={category} value={category}>
                                            {category}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Tipo Específico</Label>
                                    <Select
                                      value={bag.materialType}
                                      onValueChange={(value) => updateBag(bag.id, { materialType: value })}
                                      disabled={!bag.category}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar tipo" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {bag.category && MATERIAL_TYPES[bag.category as keyof typeof MATERIAL_TYPES]?.map((type) => (
                                          <SelectItem key={type} value={type}>
                                            {type}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Peso (kg)</Label>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      value={bag.weight || ''}
                                      onChange={(e) => updateBag(bag.id, { weight: parseFloat(e.target.value) || 0 })}
                                      placeholder="0.0"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Condición</Label>
                                    <Select
                                      value={bag.condition}
                                      onValueChange={(value) => updateBag(bag.id, { condition: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Excelente">Excelente</SelectItem>
                                        <SelectItem value="Bueno">Bueno</SelectItem>
                                        <SelectItem value="Regular">Regular</SelectItem>
                                        <SelectItem value="Malo">Malo</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Contaminación</Label>
                                    <Select
                                      value={bag.contamination}
                                      onValueChange={(value) => updateBag(bag.id, { contamination: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Limpio">Limpio</SelectItem>
                                        <SelectItem value="Ligeramente sucio">Ligeramente sucio</SelectItem>
                                        <SelectItem value="Moderadamente sucio">Moderadamente sucio</SelectItem>
                                        <SelectItem value="Muy sucio">Muy sucio</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Destino Final</Label>
                                    <Select
                                      value={bag.destination}
                                      onValueChange={(value) => updateBag(bag.id, { 
                                        destination: value as any,
                                        divertible: value !== 'landfill'
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.entries(DESTINATIONS).map(([key, label]) => (
                                          <SelectItem key={key} value={key}>
                                            {label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Notas</Label>
                                  <Textarea
                                    value={bag.notes || ''}
                                    onChange={(e) => updateBag(bag.id, { notes: e.target.value })}
                                    placeholder="Observaciones sobre esta bolsa..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                            ) : (
                              // Vista de solo lectura
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">Bolsa #{bag.bagNumber}</h4>
                                    <Badge variant={bag.divertible ? "default" : "destructive"}>
                                      {DESTINATIONS[bag.destination]}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-600">Material:</p>
                                      <p className="font-medium">{bag.materialType || 'No especificado'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Peso:</p>
                                      <p className="font-medium">{bag.weight} kg</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Condición:</p>
                                      <p className="font-medium">{bag.condition}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Contaminación:</p>
                                      <p className="font-medium">{bag.contamination}</p>
                                    </div>
                                  </div>
                                  {bag.notes && (
                                    <p className="text-sm text-gray-600 mt-2">{bag.notes}</p>
                                  )}
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => setEditingBag(bag.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Resumen de caracterización */}
                    {auditData.bags.length > 0 && (
                      <Card className="bg-blue-50">
                        <CardHeader>
                          <CardTitle className="text-lg">Resumen de Caracterización</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Total de bolsas:</p>
                              <p className="text-2xl font-bold">{auditData.bags.length}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Peso total caracterizado:</p>
                              <p className="text-2xl font-bold">{getTotalCharacterizedWeight().toFixed(1)} kg</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Material desviado:</p>
                              <p className="text-2xl font-bold">
                                {((auditData.bags.filter(b => b.divertible).reduce((s, b) => s + b.weight, 0) / 
                                   getTotalCharacterizedWeight()) * 100 || 0).toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          <Separator className="my-4" />

                          <div>
                            <h4 className="font-semibold mb-2">Por destino final:</h4>
                            <div className="space-y-2">
                              {Object.entries(getBagsByDestination()).map(([destination, bags]) => (
                                <div key={destination} className="flex justify-between">
                                  <span>{DESTINATIONS[destination as keyof typeof DESTINATIONS]}</span>
                                  <span className="font-medium">
                                    {bags.reduce((s, b) => s + b.weight, 0).toFixed(1)} kg ({bags.length} bolsas)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Botones de navegación */}
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <Button 
                onClick={nextStep}
                disabled={currentStep === AUDIT_STEPS.length}
                className="flex items-center gap-2 bg-[#b5e951] text-black hover:bg-[#a5d941]"
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}