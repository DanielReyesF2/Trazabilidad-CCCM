import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  Home
} from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// Definir los pasos de la auditoría según NOM
const AUDIT_STEPS = [
  { id: 1, title: 'Información General y Equipo', icon: ClipboardList },
  { id: 2, title: 'Preparación del Área (4m x 4m)', icon: Scale },
  { id: 3, title: 'Homogeneización y Primer Cuarteo', icon: Grid3X3 },
  { id: 4, title: 'Eliminación de Partes Opuestas', icon: Target },
  { id: 5, title: 'Muestra Final y Análisis', icon: FileText }
];

// Categorías de materiales según NOM y TRUE Zero Waste
const MATERIAL_CATEGORIES = {
  'reciclables': {
    label: 'Reciclables',
    icon: Recycle,
    color: 'bg-blue-100 text-blue-800',
    types: [
      'PET (#1)', 'HDPE (#2)', 'PVC (#3)', 'LDPE (#4)', 'PP (#5)', 'PS (#6)',
      'Cartón', 'Papel mixto', 'Papel de oficina', 'Periódico', 'Revistas',
      'Aluminio', 'Lata', 'Vidrio transparente', 'Vidrio de color', 'Fierro'
    ]
  },
  'organicos': {
    label: 'Orgánicos',
    icon: Leaf,
    color: 'bg-green-100 text-green-800',
    types: [
      'Restos de comida', 'Residuos de jardinería', 'Papel y cartón sucios',
      'Madera', 'Textiles naturales', 'Residuos de poda'
    ]
  },
  'no_reciclables': {
    label: 'No Reciclables',
    icon: Trash2,
    color: 'bg-red-100 text-red-800',
    types: [
      'Pañales', 'Toallas sanitarias', 'Colillas de cigarro', 'Chicles',
      'Papel metalizado', 'Tetra pak contaminado', 'Plástico mezclado contaminado'
    ]
  },
  'peligrosos': {
    label: 'Peligrosos',
    icon: AlertCircle,
    color: 'bg-orange-100 text-orange-800',
    types: [
      'Pilas', 'Baterías', 'Medicamentos', 'Productos químicos',
      'Aerosoles', 'Pintura', 'Aceites', 'Electrónicos'
    ]
  }
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
  
  // Paso 5: Muestra Final
  finalSampleWeight: number;
  materials: Array<{
    category: string;
    type: string;
    weight: number;
    divertible: boolean;
    diversionMethod?: string;
    contamination?: string;
    condition?: string;
    notes?: string;
  }>;
  
  // Documentación
  notes: string;
  photos: string[];
  transportTime: number; // Máximo 8 horas según NOM
}

export default function AuditoriaZeroWaste() {
  const [currentStep, setCurrentStep] = useState(1);
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
    materials: [],
    notes: '',
    photos: [],
    transportTime: 0
  });
  
  const [currentMaterial, setCurrentMaterial] = useState({
    category: '',
    type: '',
    weight: 0,
    divertible: true,
    diversionMethod: '',
    contamination: '',
    condition: '',
    notes: ''
  });
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNextStep = () => {
    if (currentStep < AUDIT_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addMaterial = () => {
    if (!currentMaterial.category || !currentMaterial.type || currentMaterial.weight <= 0) {
      toast({
        title: "Error",
        description: "Complete todos los campos del material",
        variant: "destructive"
      });
      return;
    }

    const percentage = (currentMaterial.weight / auditData.quadrantWeight) * 100;
    
    setAuditData(prev => ({
      ...prev,
      materials: [...prev.materials, { 
        ...currentMaterial, 
        percentage 
      } as any]
    }));

    setCurrentMaterial({
      category: '',
      type: '',
      weight: 0,
      divertible: true,
      diversionMethod: '',
      contamination: '',
      condition: '',
      notes: ''
    });

    toast({
      title: "Material agregado",
      description: `${currentMaterial.type} (${currentMaterial.weight} kg)`,
    });
  };

  const calculateProgress = () => {
    return (currentStep / AUDIT_STEPS.length) * 100;
  };

  const getTotalClassified = () => {
    return auditData.materials.reduce((sum, material) => sum + material.weight, 0);
  };

  const getDiversionRate = () => {
    const totalDivertible = auditData.materials
      .filter(m => m.divertible)
      .reduce((sum, m) => sum + m.weight, 0);
    const total = getTotalClassified();
    return total > 0 ? (totalDivertible / total) * 100 : 0;
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
                  Metodología de cuarteo según NOM - TRUE Zero Waste Certification
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
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      step.id === currentStep
                        ? 'bg-[#273949] text-white'
                        : step.id < currentStep
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{step.title}</p>
                    </div>
                    {step.id < currentStep && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Resumen de datos */}
            {currentStep > 1 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Resumen</CardTitle>
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
                    {auditData.finalSampleWeight > 0 && (
                      <p><strong>Muestra final:</strong> {auditData.finalSampleWeight} kg</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
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

                {/* Paso 5: Muestra Final y Análisis */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Clasificación de Materiales del Cuadrante
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Separe y pese cada tipo de material encontrado en el cuadrante seleccionado.
                            La suma de todos los materiales debe coincidir con el peso del cuadrante.
                          </AlertDescription>
                        </Alert>

                        {/* Formulario para agregar materiales */}
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <h3 className="font-semibold mb-4">Agregar Material</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Categoría</Label>
                              <Select
                                value={currentMaterial.category}
                                onValueChange={(value) => setCurrentMaterial(prev => ({ ...prev, category: value, type: '' }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(MATERIAL_CATEGORIES).map(([key, category]) => (
                                    <SelectItem key={key} value={key}>
                                      {category.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {currentMaterial.category && (
                              <div className="space-y-2">
                                <Label>Tipo de Material</Label>
                                <Select
                                  value={currentMaterial.type}
                                  onValueChange={(value) => setCurrentMaterial(prev => ({ ...prev, type: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {MATERIAL_CATEGORIES[currentMaterial.category as keyof typeof MATERIAL_CATEGORIES]?.types.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label>Peso (kg)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={currentMaterial.weight || ''}
                                onChange={(e) => setCurrentMaterial(prev => ({ 
                                  ...prev, 
                                  weight: parseFloat(e.target.value) || 0 
                                }))}
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <Button 
                            onClick={addMaterial}
                            className="mt-4"
                            disabled={!currentMaterial.category || !currentMaterial.type || currentMaterial.weight <= 0}
                          >
                            Agregar Material
                          </Button>
                        </div>

                        {/* Lista de materiales agregados */}
                        {auditData.materials.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold">Materiales Clasificados</h3>
                              <div className="text-sm text-gray-600">
                                <span>Total: {getTotalClassified().toFixed(2)} kg</span>
                                <span className="ml-4">Meta: {auditData.quadrantWeight} kg</span>
                                <span className="ml-4">
                                  Progreso: {auditData.quadrantWeight > 0 ? ((getTotalClassified() / auditData.quadrantWeight) * 100).toFixed(1) : 0}%
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {auditData.materials.map((material, index) => {
                                const category = MATERIAL_CATEGORIES[material.category as keyof typeof MATERIAL_CATEGORIES];
                                return (
                                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                    <div className="flex items-center gap-3">
                                      <category.icon className="h-5 w-5" />
                                      <div>
                                        <p className="font-medium">{material.type}</p>
                                        <Badge className={category.color}>
                                          {category.label}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold">{material.weight} kg</p>
                                      <p className="text-sm text-gray-600">
                                        {((material.weight / auditData.quadrantWeight) * 100).toFixed(1)}%
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Paso 5: Muestra Final y Análisis */}
                {currentStep === 5 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Muestra Final y Documentación (NMX-AA-61)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Requisitos finales según NOM:</strong><br />
                          • Clasificación de subproductos según NMX-AA-22<br />
                          • Transporte al laboratorio máximo 8 horas<br />
                          • Bolsas selladas e identificadas correctamente<br />
                          • Evitar exposición al sol durante transporte
                        </AlertDescription>
                      </Alert>

                      {/* Resumen metodológico */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold">Resumen Metodológico</h3>
                          <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                            <p><strong>Fecha:</strong> {auditData.auditDate}</p>
                            <p><strong>Equipo:</strong> {auditData.teamMembers || 'No especificado'}</p>
                            <p><strong>Bolsas procesadas:</strong> {auditData.numberOfBags} (máx. 250)</p>
                            <p><strong>Área:</strong> {auditData.areaLength}m × {auditData.areaWidth}m</p>
                            <p><strong>Superficie:</strong> {auditData.surfaceType}</p>
                            <p><strong>Bajo techo:</strong> {auditData.underRoof ? 'Sí' : 'No'}</p>
                            <p><strong>Peso total inicial:</strong> {auditData.totalWeightBefore} kg</p>
                            <p><strong>Cuadrantes eliminados:</strong> {auditData.eliminatedQuadrants.join(' y ') || 'No seleccionado'}</p>
                            <p><strong>Peso restante:</strong> {auditData.remainingWeight} kg</p>
                            <p><strong>Muestra laboratorio:</strong> {auditData.laboratoryWeight} kg</p>
                            <p><strong>Muestra final:</strong> {auditData.finalSampleWeight} kg</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-semibold">Condiciones de Transporte</h3>
                          
                          <div className="space-y-2">
                            <Label htmlFor="transportTime">Tiempo de Transporte (horas)</Label>
                            <Input
                              id="transportTime"
                              type="number"
                              step="0.5"
                              max="8"
                              value={auditData.transportTime}
                              onChange={(e) => setAuditData(prev => ({ 
                                ...prev, 
                                transportTime: parseFloat(e.target.value) || 0 
                              }))}
                              placeholder="0.0"
                            />
                            {auditData.transportTime > 8 && (
                              <p className="text-sm text-red-600">
                                ¡Atención! Máximo 8 horas según NOM
                              </p>
                            )}
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium">Lista de verificación:</h4>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" id="sealed" className="rounded" />
                                <Label htmlFor="sealed" className="text-sm">
                                  Bolsas selladas correctamente
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" id="identified" className="rounded" />
                                <Label htmlFor="identified" className="text-sm">
                                  Muestras identificadas (véase marcado)
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" id="noSun" className="rounded" />
                                <Label htmlFor="noSun" className="text-sm">
                                  Evitada exposición al sol
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" id="noBreakage" className="rounded" />
                                <Label htmlFor="noBreakage" className="text-sm">
                                  Sin roturas en bolsas
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Validación de peso según NOM */}
                      {auditData.remainingWeight < 50 && auditData.remainingWeight > 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Recomendación NOM:</strong> El peso restante ({auditData.remainingWeight} kg) 
                            es menor a 50 kg. Se recomienda repetir la operación de cuarteo según NMX-AA-61.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Notas finales */}
                      <div className="space-y-2">
                        <Label htmlFor="finalNotes">Observaciones y Notas Finales</Label>
                        <Textarea
                          id="finalNotes"
                          value={auditData.notes}
                          onChange={(e) => setAuditData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Condiciones especiales, hallazgos relevantes, desviaciones del procedimiento estándar..."
                          rows={4}
                        />
                      </div>

                      {/* Botón para finalizar */}
                      <div className="flex justify-center pt-6">
                        <Button 
                          size="lg"
                          className="bg-[#b5e951] text-black hover:bg-[#a5d941]"
                          disabled={auditData.remainingWeight === 0 || auditData.transportTime > 8}
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Completar Auditoría NMX-AA-61
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navegación */}
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={handlePrevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              
              <Button 
                onClick={handleNextStep}
                disabled={currentStep === AUDIT_STEPS.length}
              >
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}