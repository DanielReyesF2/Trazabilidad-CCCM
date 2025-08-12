import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';
import { 
  Save, 
  Recycle,
  Leaf,
  RotateCcw,
  Trash2,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Weight,
  MapPin,
  History,
  ArrowRight
} from 'lucide-react';
import { Link } from 'wouter';

interface DailyWasteEntry {
  type: 'recycling' | 'compost' | 'reuse' | 'landfill';
  material: string;
  kg: number;
  location: string;
  notes?: string;
}

export default function RegistroDiario() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Configuración de materiales por tipo
  const materialOptions = {
    recycling: [
      'Papel Mixto',
      'Papel de oficina', 
      'Revistas',
      'Periódico',
      'Cartón',
      'PET',
      'Plástico Duro',
      'HDPE',
      'Tin Can',
      'Aluminio',
      'Vidrio',
      'Fierro',
      'Residuo electrónico'
    ],
    compost: [
      'Poda San Sebastián',
      'Jardinería',
      'Residuos de cocina',
      'Restos orgánicos'
    ],
    reuse: [
      'Vidrio donación',
      'Mobiliario',
      'Equipos reutilizables'
    ],
    landfill: [
      'Orgánico',
      'Inorgánico'
    ]
  };

  // Opciones de ubicación en el club
  const locationOptions = [
    'Comedor Principal',
    'Casa Club',
    'Casas',
    'Área de Piscinas',
    'Canchas de Tenis',
    'Campo de Golf',
    'Jardines',
    'Área Administrativa',
    'Cocina',
    'Mantenimiento',
    'Área de Servicios'
  ];

  // Obtener totales del día actual para mostrar progreso
  const today = new Date().toISOString().split('T')[0];
  const { data: dailyTotals } = useQuery({
    queryKey: ['/api/daily-totals', today],
    queryFn: async () => {
      const response = await fetch(`/api/daily-totals/${today}`);
      if (!response.ok) throw new Error('Failed to fetch daily totals');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Mutación para guardar entrada diaria
  const saveMutation = useMutation({
    mutationFn: async (entry: DailyWasteEntry) => {
      const response = await fetch('/api/daily-waste', {
        method: 'POST',
        body: JSON.stringify({
          ...entry,
          date: new Date().toISOString(),
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to save entry');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Registro guardado",
        description: "Los datos se han actualizado en tiempo real en todos los reportes",
      });
      
      // Limpiar formulario
      setSelectedType('');
      setSelectedMaterial('');
      setWeight('');
      setLocation('');
      setNotes('');
      
      // Invalidar queries para actualizar datos
      queryClient.invalidateQueries({ queryKey: ['/api/daily-totals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waste-excel'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudo guardar el registro",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedType || !selectedMaterial || !weight || !location) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    const entry: DailyWasteEntry = {
      type: selectedType as 'recycling' | 'compost' | 'reuse' | 'landfill',
      material: selectedMaterial,
      kg: parseFloat(weight),
      location,
      notes: notes || undefined
    };

    saveMutation.mutate(entry);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recycling': return <Recycle className="h-5 w-5 text-emerald-600" />;
      case 'compost': return <Leaf className="h-5 w-5 text-amber-600" />;
      case 'reuse': return <RotateCcw className="h-5 w-5 text-blue-600" />;
      case 'landfill': return <Trash2 className="h-5 w-5 text-red-600" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recycling': return 'border-emerald-200 bg-emerald-50';
      case 'compost': return 'border-amber-200 bg-amber-50';
      case 'reuse': return 'border-blue-200 bg-blue-50';
      case 'landfill': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'recycling': return '♻️ Reciclaje';
      case 'compost': return '🌱 Composta';
      case 'reuse': return '🔄 Reuso';
      case 'landfill': return '🗑️ Relleno Sanitario';
      default: return type;
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header - Simplificado y más claro */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6 border-l-4 border-lime">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-anton uppercase tracking-wide text-navy mb-2">
                  Registro de Residuos
                </h1>
                <p className="text-lg text-gray-700 font-medium">
                  📝 Registra los residuos que recolectas hoy
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Paso a paso: Tipo → Material → Peso → Ubicación → ¡Listo!
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <Link href="/historial-mensual">
                  <Button variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
                    <History className="h-4 w-4 mr-2" />
                    Historial Mensual
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3 bg-navy text-white px-6 py-3 rounded-full text-lg font-semibold">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {new Date().toLocaleDateString('es-MX', { 
                      day: 'numeric', 
                      month: 'long'
                    })}
                  </span>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  Datos en tiempo real
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario de registro */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Weight className="h-5 w-5" />
                    Nuevo Registro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tipo de residuo - Paso 1 */}
                  <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
                      <label className="text-lg font-semibold text-navy">
                        ¿Qué tipo de residuo estás registrando?
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { 
                          value: 'recycling', 
                          label: '♻️ Reciclaje', 
                          description: 'Papel, cartón, plástico, vidrio, metal',
                          icon: Recycle, 
                          bgColor: 'bg-emerald-500',
                          borderColor: 'border-emerald-500',
                          textColor: 'text-emerald-700'
                        },
                        { 
                          value: 'compost', 
                          label: '🌱 Composta', 
                          description: 'Residuos orgánicos, poda, jardinería',
                          icon: Leaf, 
                          bgColor: 'bg-amber-500',
                          borderColor: 'border-amber-500',
                          textColor: 'text-amber-700'
                        },
                        { 
                          value: 'reuse', 
                          label: '🔄 Reuso', 
                          description: 'Objetos que se pueden reutilizar',
                          icon: RotateCcw, 
                          bgColor: 'bg-blue-500',
                          borderColor: 'border-blue-500',
                          textColor: 'text-blue-700'
                        },
                        { 
                          value: 'landfill', 
                          label: '🗑️ Relleno Sanitario', 
                          description: 'Residuos que van al relleno',
                          icon: Trash2, 
                          bgColor: 'bg-red-500',
                          borderColor: 'border-red-500',
                          textColor: 'text-red-700'
                        }
                      ].map(({ value, label, description, icon: Icon, bgColor, borderColor, textColor }) => (
                        <button
                          key={value}
                          onClick={() => {
                            setSelectedType(value);
                            setSelectedMaterial('');
                          }}
                          className={`p-6 border-3 rounded-xl transition-all text-left hover:scale-[1.02] ${
                            selectedType === value 
                              ? `${borderColor} bg-white shadow-lg ring-4 ring-opacity-20 ${textColor.replace('text-', 'ring-')}` 
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`${selectedType === value ? bgColor : 'bg-gray-400'} p-3 rounded-lg`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className={`text-lg font-bold mb-1 ${
                                selectedType === value ? textColor : 'text-gray-700'
                              }`}>
                                {label}
                              </div>
                              <div className="text-sm text-gray-500">
                                {description}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Material específico - Paso 2 */}
                  {selectedType && (
                    <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
                        <label className="text-lg font-semibold text-navy">
                          ¿Qué material específico es?
                        </label>
                      </div>
                      <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                        <SelectTrigger className="h-14 text-lg border-2 bg-white">
                          <SelectValue placeholder="👆 Selecciona el material exacto" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {materialOptions[selectedType as keyof typeof materialOptions]?.map((material) => (
                            <SelectItem key={material} value={material} className="text-lg py-3">
                              {material}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Peso - Paso 3 */}
                  {selectedMaterial && (
                    <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
                        <label className="text-lg font-semibold text-navy">
                          ¿Cuántos kilogramos pesa?
                        </label>
                      </div>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="Ejemplo: 5.2"
                          className="text-2xl h-16 pl-6 pr-16 border-2 bg-white font-bold text-center"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                          kg
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        💡 Puedes usar decimales: 2.5, 10.8, etc.
                      </p>
                    </div>
                  )}

                  {/* Ubicación - Paso 4 */}
                  {weight && (
                    <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">4</div>
                        <label className="text-lg font-semibold text-navy">
                          ¿En qué área del club se generó?
                        </label>
                      </div>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger className="h-14 text-lg border-2 bg-white">
                          <SelectValue placeholder="📍 Selecciona la ubicación" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {locationOptions.map((loc) => (
                            <SelectItem key={loc} value={loc} className="text-lg py-3">
                              <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-gray-500" />
                                {loc}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Notas opcionales - Paso 5 */}
                  {location && (
                    <div className="bg-blue-50 rounded-xl p-6 border-2 border-dashed border-blue-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">5</div>
                        <label className="text-lg font-semibold text-blue-800">
                          ¿Alguna observación? (opcional)
                        </label>
                      </div>
                      <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="💬 Condiciones especiales, observaciones, etc."
                        className="h-12 text-lg border-2 bg-white"
                      />
                      <p className="text-xs text-blue-600 mt-2">
                        Este campo es opcional, puedes dejarlo vacío si no hay nada especial que reportar.
                      </p>
                    </div>
                  )}

                  {/* Botón de guardar - Paso Final */}
                  {selectedType && selectedMaterial && weight && location && (
                    <div className="bg-lime-50 rounded-xl p-6 border-2 border-lime-300">
                      <div className="text-center mb-4">
                        <div className="bg-lime-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mx-auto mb-3">
                          ✓
                        </div>
                        <h3 className="text-xl font-bold text-lime-800 mb-2">
                          ¡Listo para registrar!
                        </h3>
                        <p className="text-lime-700">
                          Revisa que todo esté correcto y haz clic para guardar
                        </p>
                      </div>
                      
                      {/* Resumen del registro */}
                      <div className="bg-white rounded-lg p-4 mb-4 border border-lime-200">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Tipo:</span>
                            <p className="font-semibold">{getTypeName(selectedType)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Material:</span>
                            <p className="font-semibold">{selectedMaterial}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Peso:</span>
                            <p className="font-semibold">{weight} kg</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Ubicación:</span>
                            <p className="font-semibold">{location}</p>
                          </div>
                        </div>
                        {notes && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <span className="text-gray-500 text-sm">Notas:</span>
                            <p className="font-semibold text-sm">{notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={handleSubmit}
                        disabled={saveMutation.isPending}
                        className="w-full bg-lime-600 hover:bg-lime-700 text-white text-xl py-8 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                      >
                        {saveMutation.isPending ? (
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                            <span>Guardando registro...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Save className="h-6 w-6" />
                            <span>💾 Guardar Registro</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Mensaje de ayuda si faltan campos */}
                  {(!selectedType || !selectedMaterial || !weight || !location) && (
                    <div className="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300 text-center">
                      <div className="text-gray-400 mb-3">
                        <Weight className="h-12 w-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Completa los pasos para continuar
                      </h3>
                      <p className="text-gray-500">
                        Sigue los pasos numerados para completar tu registro
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Panel de totales del día - Mejorado */}
            <div>
              <Card className="border-2 border-navy/10">
                <CardHeader className="bg-navy text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="bg-lime p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-navy" />
                    </div>
                    Resumen del Día
                  </CardTitle>
                  <p className="text-navy-100 text-sm">
                    {new Date().toLocaleDateString('es-MX', { 
                      weekday: 'long',
                      day: 'numeric', 
                      month: 'long'
                    })}
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  {dailyTotals ? (
                    <>
                      <div className="space-y-4 mb-6">
                        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="bg-emerald-500 p-2 rounded-lg">
                                <Recycle className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-emerald-800">♻️ Reciclaje</div>
                                <div className="text-xs text-emerald-600">Materiales recuperables</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-emerald-700">
                                {(dailyTotals.recycling || 0).toFixed(1)}
                              </div>
                              <div className="text-xs text-emerald-600">kg</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="bg-amber-500 p-2 rounded-lg">
                                <Leaf className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-amber-800">🌱 Composta</div>
                                <div className="text-xs text-amber-600">Residuos orgánicos</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-amber-700">
                                {(dailyTotals.compost || 0).toFixed(1)}
                              </div>
                              <div className="text-xs text-amber-600">kg</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-500 p-2 rounded-lg">
                                <RotateCcw className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-blue-800">🔄 Reuso</div>
                                <div className="text-xs text-blue-600">Para reutilizar</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-700">
                                {(dailyTotals.reuse || 0).toFixed(1)}
                              </div>
                              <div className="text-xs text-blue-600">kg</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="bg-red-500 p-2 rounded-lg">
                                <Trash2 className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-red-800">🗑️ Relleno</div>
                                <div className="text-xs text-red-600">No recuperable</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-red-700">
                                {(dailyTotals.landfill || 0).toFixed(1)}
                              </div>
                              <div className="text-xs text-red-600">kg</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t-2 border-gray-200 pt-4">
                        <div className="bg-navy text-white p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-lg font-bold">Total del Día</div>
                              <div className="text-xs text-navy-200">Todo lo registrado hoy</div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold">
                                {((dailyTotals.recycling || 0) + (dailyTotals.compost || 0) + (dailyTotals.reuse || 0) + (dailyTotals.landfill || 0)).toFixed(1)}
                              </div>
                              <div className="text-sm">kilogramos</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mensaje motivacional */}
                        <div className="mt-4 p-3 bg-lime-50 rounded-lg border border-lime-200">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-lime-600" />
                            <span className="text-sm font-medium text-lime-800">
                              ¡Excelente trabajo! 🎉 Cada registro ayuda al planeta
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Aún no hay registros hoy
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        ¡Haz el primer registro del día!
                      </p>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <span className="text-blue-700 text-sm font-medium">
                          💡 Tip: Completa el formulario de la izquierda para empezar
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ventajas vs proceso actual */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lime-700">
                    <CheckCircle className="h-5 w-5" />
                    Ventajas vs Proceso Actual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span>Datos en tiempo real</span>
                    </div>
                    <div className="flex items-center gap-3 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span>Sin papeles ni escaneos</span>
                    </div>
                    <div className="flex items-center gap-3 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span>Reportes automáticos</span>
                    </div>
                    <div className="flex items-center gap-3 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span>Trazabilidad completa</span>
                    </div>
                    <div className="flex items-center gap-3 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span>Alertas automáticas</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}