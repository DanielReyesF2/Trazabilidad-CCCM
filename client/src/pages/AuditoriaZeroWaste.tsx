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