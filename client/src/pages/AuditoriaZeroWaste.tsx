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
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Definir los pasos de la auditoría
const AUDIT_STEPS = [
  { id: 1, title: 'Información General', icon: ClipboardList },
  { id: 2, title: 'Peso Total y Condiciones', icon: Scale },
  { id: 3, title: 'Metodología de Cuarteo', icon: Grid3X3 },
  { id: 4, title: 'Clasificación de Materiales', icon: Target },
  { id: 5, title: 'Documentación y Validación', icon: FileText }
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
  // Paso 1: Información General
  auditDate: string;
  auditType: 'quarterly' | 'monthly' | 'special';
  auditorName: string;
  auditorTitle: string;
  
  // Paso 2: Peso y Condiciones
  totalWeightBefore: number;
  weather: string;
  temperature: number;
  humidity: number;
  
  // Paso 3: Cuarteo
  quadrantNumber: number;
  quadrantWeight: number;
  
  // Paso 4: Materiales
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
  
  // Paso 5: Documentación
  notes: string;
  photos: string[];
}

export default function AuditoriaZeroWaste() {
  const [currentStep, setCurrentStep] = useState(1);
  const [auditData, setAuditData] = useState<AuditData>({
    auditDate: new Date().toISOString().split('T')[0],
    auditType: 'quarterly',
    auditorName: '',
    auditorTitle: '',
    totalWeightBefore: 0,
    weather: '',
    temperature: 0,
    humidity: 0,
    quadrantNumber: 1,
    quadrantWeight: 0,
    materials: [],
    notes: '',
    photos: []
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
            <div>
              <h1 className="text-2xl font-bold text-[#273949]">
                Auditoría Zero Waste
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Metodología de cuarteo según NOM - TRUE Zero Waste Certification
              </p>
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
                    {auditData.quadrantWeight > 0 && (
                      <p><strong>Cuadrante {auditData.quadrantNumber}:</strong> {auditData.quadrantWeight} kg</p>
                    )}
                    {auditData.materials.length > 0 && (
                      <>
                        <p><strong>Materiales clasificados:</strong> {auditData.materials.length}</p>
                        <p><strong>Peso clasificado:</strong> {getTotalClassified().toFixed(2)} kg</p>
                        <p><strong>Tasa de desviación:</strong> {getDiversionRate().toFixed(1)}%</p>
                      </>
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
                {/* Paso 1: Información General */}
                {currentStep === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Información General de la Auditoría
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Según la metodología TRUE Zero Waste, esta auditoría debe realizarse sobre 
                          la totalidad de residuos que van a relleno sanitario sin clasificación previa.
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
                          <Label htmlFor="auditorName">Nombre del Auditor</Label>
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
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Paso 2: Peso Total y Condiciones */}
                {currentStep === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5" />
                        Peso Total y Condiciones Ambientales
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Instrucciones:</strong><br />
                          1. Pese la totalidad de residuos antes del cuarteo<br />
                          2. Registre las condiciones climáticas actuales<br />
                          3. Tome foto del peso total en la báscula
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="totalWeight">Peso Total (kg)</Label>
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
                    </CardContent>
                  </Card>
                )}

                {/* Paso 3: Metodología de Cuarteo */}
                {currentStep === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Grid3X3 className="h-5 w-5" />
                        Metodología de Cuarteo (NOM-AA-61-1985)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Procedimiento de cuarteo:</strong><br />
                          1. Extienda todos los residuos en superficie plana<br />
                          2. Divida en 4 cuadrantes iguales usando el método de cruz<br />
                          3. Seleccione aleatoriamente uno de los 4 cuadrantes<br />
                          4. Pese únicamente el cuadrante seleccionado
                        </AlertDescription>
                      </Alert>

                      {/* Visualización de cuadrantes */}
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold mb-4 text-center">Selección de Cuadrante</h3>
                        <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                          {[1, 2, 3, 4].map((quadrant) => (
                            <button
                              key={quadrant}
                              onClick={() => setAuditData(prev => ({ ...prev, quadrantNumber: quadrant }))}
                              className={`aspect-square border-2 rounded-lg flex items-center justify-center font-bold text-lg transition-colors ${
                                auditData.quadrantNumber === quadrant
                                  ? 'border-[#b5e951] bg-[#b5e951] text-black'
                                  : 'border-gray-300 bg-white hover:bg-gray-50'
                              }`}
                            >
                              {quadrant}
                            </button>
                          ))}
                        </div>
                        <p className="text-center text-sm text-gray-600 mt-4">
                          Cuadrante seleccionado: <strong>{auditData.quadrantNumber}</strong>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quadrantWeight">Peso del Cuadrante {auditData.quadrantNumber} (kg)</Label>
                        <Input
                          id="quadrantWeight"
                          type="number"
                          step="0.1"
                          value={auditData.quadrantWeight || ''}
                          onChange={(e) => setAuditData(prev => ({ 
                            ...prev, 
                            quadrantWeight: parseFloat(e.target.value) || 0 
                          }))}
                          placeholder="0.0"
                        />
                        {auditData.totalWeightBefore > 0 && auditData.quadrantWeight > 0 && (
                          <p className="text-sm text-gray-600">
                            Representa el {((auditData.quadrantWeight / auditData.totalWeightBefore) * 100).toFixed(1)}% del total
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Paso 4: Clasificación de Materiales */}
                {currentStep === 4 && (
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

                {/* Paso 5: Documentación y Validación */}
                {currentStep === 5 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Documentación y Validación Final
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Revise todos los datos antes de finalizar la auditoría. 
                          Una vez validada, se generará el reporte oficial.
                        </AlertDescription>
                      </Alert>

                      {/* Resumen final */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold">Resumen de Auditoría</h3>
                          <div className="space-y-2 text-sm">
                            <p><strong>Fecha:</strong> {auditData.auditDate}</p>
                            <p><strong>Tipo:</strong> {auditData.auditType}</p>
                            <p><strong>Auditor:</strong> {auditData.auditorName}</p>
                            <p><strong>Peso total inicial:</strong> {auditData.totalWeightBefore} kg</p>
                            <p><strong>Cuadrante analizado:</strong> #{auditData.quadrantNumber} ({auditData.quadrantWeight} kg)</p>
                            <p><strong>Materiales clasificados:</strong> {auditData.materials.length} tipos</p>
                            <p><strong>Peso clasificado:</strong> {getTotalClassified().toFixed(2)} kg</p>
                            <p><strong>Tasa de desviación:</strong> {getDiversionRate().toFixed(1)}%</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-semibold">Notas y Observaciones</h3>
                          <Textarea
                            value={auditData.notes}
                            onChange={(e) => setAuditData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Observaciones generales, condiciones especiales, hallazgos relevantes..."
                            rows={6}
                          />
                        </div>
                      </div>

                      {/* Botón para finalizar */}
                      <div className="flex justify-center pt-6">
                        <Button 
                          size="lg"
                          className="bg-[#b5e951] text-black hover:bg-[#a5d941]"
                          disabled={auditData.materials.length === 0}
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Finalizar Auditoría
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