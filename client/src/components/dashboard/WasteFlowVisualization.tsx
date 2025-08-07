import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowDown,
  Recycle, 
  Leaf, 
  Trash2, 
  Factory,
  TreePine,
  Droplets,
  Zap,
  Package,
  Coffee,
  Utensils,
  Newspaper,
  Wine,
  Battery,
  Building2,
  ChefHat,
  Users,
  MapPin,
  MoveRight
} from 'lucide-react';

interface WasteFlow {
  id: string;
  name: string;
  category: 'organico' | 'inorganico' | 'reciclable';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  destination: string;
  partner: string;
  volume: number; // toneladas mensuales promedio
  description: string;
  origins: string[]; // puntos de origen específicos
}

const wasteFlows: WasteFlow[] = [
  // ORGÁNICOS - Basado en la imagen detallada del Club
  {
    id: 'aceite-residual',
    name: 'Aceite Residual',
    category: 'organico',
    icon: <Droplets className="w-5 h-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    destination: 'Revalorización (Insumo para biodiesel)',
    partner: 'Reoil',
    volume: 0.8,
    description: 'Aceite usado de cocinas convertido a biodiesel sostenible',
    origins: ['Restaurante', 'Casa Club', 'Cocinas de eventos', 'Campo', 'Canchas de Tennis', 'Canchas de Padel']
  },
  {
    id: 'grasa-cascaras',
    name: 'Grasa y Cáscaras de Fruta',
    category: 'organico',
    icon: <Utensils className="w-5 h-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    destination: 'Recolección y disposición de grasa cocinas',
    partner: 'TEDISD Innovative Group',
    volume: 3.2,
    description: 'Grasas de cocina y cáscaras de frutas procesadas sustainably',
    origins: ['Restaurante principal', 'Cocina Casa Club', 'Área de preparación', 'Campo', 'Canchas de Tennis', 'Canchas de Padel']
  },
  {
    id: 'organicos-complejos',
    name: 'Orgánicos Diversos',
    category: 'organico',
    icon: <TreePine className="w-5 h-5" />,
    color: 'text-green-700',
    bgColor: 'bg-green-200',
    destination: 'Biodegradación mediante biodigestor ORKA',
    partner: 'ORKA',
    volume: 17.6,
    description: 'Pan, pescados, carne, huevo, queso, pollo, pasta, arroz, frutas, azúcar, salsas, papa, caña, conchas, aceites, café',
    origins: ['Restaurante', 'Casa Club', 'Eventos especiales', 'Cocinas auxiliares', 'Campo', 'Canchas de Tennis', 'Canchas de Padel']
  },

  // RECICLABLES - Clasificación profesional detallada
  {
    id: 'papel-carton-periodico',
    name: 'Papel y Cartón',
    category: 'reciclable',
    icon: <Newspaper className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    destination: 'Revalorización Reciclado Refabricación',
    partner: 'Recupera (Centros de Reciclaje)',
    volume: 2.1,
    description: 'Papel, periódico, revistas, cartón - proceso completo de refabricación',
    origins: ['Oficinas administrativas', 'Casa Club', 'Recepción', 'Campo', 'Canchas de Tennis', 'Canchas de Padel']
  },
  {
    id: 'vidrio-sat-timbrado',
    name: 'Vidrio (Timbrado SAT)',
    category: 'reciclable',
    icon: <Wine className="w-5 h-5" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-200',
    destination: 'Revalorización Proceso Refabricación',
    partner: 'Cerrando el Ciclo',
    volume: 1.2,
    description: 'Vidrio certificado SAT para proceso de refabricación industrial',
    origins: ['Bar y restaurante', 'Eventos especiales', 'Áreas VIP', 'Campo', 'Canchas de Tennis', 'Canchas de Padel']
  },
  {
    id: 'plasticos-polipropileno',
    name: 'Plásticos PET/HDPE',
    category: 'reciclable',
    icon: <Package className="w-5 h-5" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    destination: 'Donación para revalorización',
    partner: 'Verde Ciudad',
    volume: 1.9,
    description: 'Vidrio PET HDPE, plástico duro, aluminio, tapas de polipropileno',
    origins: ['Casa Club', 'Restaurante', 'Áreas comunes', 'Eventos', 'Campo', 'Canchas de Tennis', 'Canchas de Padel']
  },

  // INORGÁNICOS - Sistema completo de manejo
  {
    id: 'residuos-electronicos-complejos',
    name: 'Residuos Electrónicos',
    category: 'inorganico',
    icon: <Battery className="w-5 h-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    destination: 'Recuperación Revalorización Reciclaje',
    partner: 'eWaste Group',
    volume: 0.3,
    description: 'Blancos, losa, objetos perdidos, mobiliario, equipos electrónicos',
    origins: ['Oficinas administrativas', 'Sistemas Casa Club', 'Mantenimiento', 'Campo', 'Canchas de Tennis', 'Canchas de Padel']
  },
  {
    id: 'cartuchos-nikken-especializados',
    name: 'Cartuchos Nikken',
    category: 'inorganico',
    icon: <Factory className="w-5 h-5" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    destination: 'Donación para revalorización',
    partner: 'NIKKEN',
    volume: 0.1,
    description: 'Cartuchos de tinta y tóner para remanufactura especializada',
    origins: ['Oficinas', 'Centros de impresión', 'Administración', 'Campo', 'Canchas de Tennis', 'Canchas de Padel']
  },
  {
    id: 'residuos-generales-controlados',
    name: 'Residuos Generales',
    category: 'inorganico',
    icon: <Trash2 className="w-5 h-5" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    destination: 'Donaciones o Defensa SGA',
    partner: 'Amistad Cristiano / KREY',
    volume: 5.8,
    description: 'Reprocesamiento y Compostaje cuando es iniciado - disposición controlada',
    origins: ['Casa Club general', 'Mantenimiento', 'Áreas comunes', 'Campo', 'Canchas de Tennis', 'Canchas de Padel']
  }
];

interface WasteFlowVisualizationProps {
  totalWasteDiverted: number;
}

export function WasteFlowVisualization({ totalWasteDiverted }: WasteFlowVisualizationProps) {
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [animatingParticles, setAnimatingParticles] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatingParticles(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const organicFlows = wasteFlows.filter(flow => flow.category === 'organico');
  const recyclableFlows = wasteFlows.filter(flow => flow.category === 'reciclable');
  const inorganicFlows = wasteFlows.filter(flow => flow.category === 'inorganico');

  const totalVolume = wasteFlows.reduce((sum, flow) => sum + flow.volume, 0);
  const diversionRate = ((totalVolume - inorganicFlows.reduce((sum, flow) => sum + flow.volume, 0)) / totalVolume * 100);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-xl border border-gray-200">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-anton uppercase tracking-wide mb-3 text-[#b5e951]">Flujos de  Materiales</h2>
        <p className="text-lg text-gray-600 mb-6">
          Visualización interactiva del sistema integral de gestión de residuos
        </p>
      </div>
      {/* Flow Visualization */}
      <div className="relative">
        {/* Points of Origin */}
        <div className="flex items-center justify-center mb-4">
          <MapPin className="w-4 h-4 text-gray-600 mr-2" />
          <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">Puntos de Origen</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg mb-2 mx-auto">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-medium text-gray-800">Casa Club</div>
            <div className="text-xs text-gray-500">Oficinas & Servicios</div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg mb-2 mx-auto">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-medium text-gray-800">Restaurante</div>
            <div className="text-xs text-gray-500">Cocina & Bar</div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg mb-2 mx-auto">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-medium text-gray-800">Eventos</div>
            <div className="text-xs text-gray-500">Áreas Comunes</div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg mb-2 mx-auto">
              <TreePine className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-medium text-gray-800">Campo</div>
            <div className="text-xs text-gray-500">Golf & Jardines</div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-2 mx-auto">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-medium text-gray-800">Canchas Tennis</div>
            <div className="text-xs text-gray-500">Deportivo</div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg mb-2 mx-auto">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-medium text-gray-800">Canchas Padel</div>
            <div className="text-xs text-gray-500">Deportivo</div>
          </div>
        </div>

        {/* Flow Connections */}
        <div className="relative z-0 mb-4">
          <div className="flex justify-center items-center h-24">
            <div className="flex items-center space-x-4">
              {/* Visual flow indicators */}
              <div className={`flex items-center space-x-2 transition-all duration-1000 ${
                animatingParticles ? 'opacity-100' : 'opacity-60'
              }`}>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>

          {/* Simple animated arrows */}
          <div className="flex justify-center mb-6">
            <div className={`flex items-center space-x-8 transition-all duration-1000 ${
              animatingParticles ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-1'
            }`}>
              <ArrowDown className="w-6 h-6 text-green-500 animate-bounce" style={{ animationDelay: '0s' }} />
              <ArrowDown className="w-6 h-6 text-blue-500 animate-bounce" style={{ animationDelay: '0.5s' }} />
              <ArrowDown className="w-6 h-6 text-gray-500 animate-bounce" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>

        {/* Category Containers */}
        <div className="flex justify-center space-x-16 relative z-10 mb-8">
          <div className="text-center bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 mx-auto">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div className="text-xl font-anton text-green-700 uppercase tracking-wide mb-1">Orgánicos</div>
            <div className="text-sm text-gray-600">{organicFlows.reduce((sum, flow) => sum + flow.volume, 0).toFixed(1)} ton/mes</div>
          </div>

          <div className="text-center bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 mx-auto">
              <Recycle className="w-8 h-8 text-white" />
            </div>
            <div className="text-xl font-anton text-blue-700 uppercase tracking-wide mb-1">Reciclables</div>
            <div className="text-sm text-gray-600">{recyclableFlows.reduce((sum, flow) => sum + flow.volume, 0).toFixed(1)} ton/mes</div>
          </div>

          <div className="text-center bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 mx-auto">
              <Trash2 className="w-8 h-8 text-white" />
            </div>
            <div className="text-xl font-anton text-gray-700 uppercase tracking-wide mb-1">Inorgánicos</div>
            <div className="text-sm text-gray-600">{inorganicFlows.reduce((sum, flow) => sum + flow.volume, 0).toFixed(1)} ton/mes</div>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="flex justify-center space-x-8 text-center mb-8">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-green-600 font-medium">{diversionRate.toFixed(1)}% Desviado del relleno</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600">{totalVolume.toFixed(1)} ton/mes total</span>
          </div>
        </div>
      </div>
      {/* Detailed Flow Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Orgánicos */}
        <div className="space-y-3">
          {organicFlows.map((flow, index) => (
            <div
              key={flow.id}
              className={`group cursor-pointer p-4 rounded-xl bg-white border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300 ${
                selectedFlow === flow.id ? 'border-green-400 shadow-lg bg-green-50' : ''
              }`}
              onClick={() => setSelectedFlow(selectedFlow === flow.id ? null : flow.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${flow.bgColor} rounded-lg flex items-center justify-center`}>
                    <span className={flow.color}>{flow.icon}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{flow.name}</div>
                    <div className="text-xs text-gray-500">{flow.volume} ton/mes</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className={`w-1 h-1 bg-green-400 rounded-full transition-all duration-500 ${
                    animatingParticles ? 'opacity-100' : 'opacity-50'
                  }`}></div>
                  <div className={`w-1 h-1 bg-green-500 rounded-full transition-all duration-500 delay-200 ${
                    animatingParticles ? 'opacity-100' : 'opacity-50'
                  }`}></div>
                  <ArrowRight className={`w-3 h-3 text-green-500 transition-all duration-300 ${
                    animatingParticles ? 'translate-x-0.5 opacity-100' : 'translate-x-0 opacity-70'
                  }`} />
                </div>
              </div>

              {selectedFlow === flow.id && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="text-xs text-gray-600 mb-2">{flow.description}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-600 font-medium">{flow.destination}</span>
                    <span className="text-gray-500">{flow.partner}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reciclables */}
        <div className="space-y-3">
          {recyclableFlows.map((flow, index) => (
            <div
              key={flow.id}
              className={`group cursor-pointer p-4 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 ${
                selectedFlow === flow.id ? 'border-blue-400 shadow-lg bg-blue-50' : ''
              }`}
              onClick={() => setSelectedFlow(selectedFlow === flow.id ? null : flow.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${flow.bgColor} rounded-lg flex items-center justify-center`}>
                    <span className={flow.color}>{flow.icon}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{flow.name}</div>
                    <div className="text-xs text-gray-500">{flow.volume} ton/mes</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className={`w-1 h-1 bg-blue-400 rounded-full transition-all duration-500 ${
                    animatingParticles ? 'opacity-100' : 'opacity-50'
                  }`}></div>
                  <div className={`w-1 h-1 bg-blue-500 rounded-full transition-all duration-500 delay-200 ${
                    animatingParticles ? 'opacity-100' : 'opacity-50'
                  }`}></div>
                  <ArrowRight className={`w-3 h-3 text-blue-500 transition-all duration-300 ${
                    animatingParticles ? 'translate-x-0.5 opacity-100' : 'translate-x-0 opacity-70'
                  }`} />
                </div>
              </div>

              {selectedFlow === flow.id && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="text-xs text-gray-600 mb-2">{flow.description}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600 font-medium">{flow.destination}</span>
                    <span className="text-gray-500">{flow.partner}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Inorgánicos */}
        <div className="space-y-3">
          {inorganicFlows.map((flow, index) => (
            <div
              key={flow.id}
              className={`group cursor-pointer p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 ${
                selectedFlow === flow.id ? 'border-gray-400 shadow-lg bg-gray-50' : ''
              }`}
              onClick={() => setSelectedFlow(selectedFlow === flow.id ? null : flow.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${flow.bgColor} rounded-lg flex items-center justify-center`}>
                    <span className={flow.color}>{flow.icon}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{flow.name}</div>
                    <div className="text-xs text-gray-500">{flow.volume} ton/mes</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className={`w-1 h-1 bg-gray-400 rounded-full transition-all duration-500 ${
                    animatingParticles ? 'opacity-100' : 'opacity-50'
                  }`}></div>
                  <div className={`w-1 h-1 bg-gray-500 rounded-full transition-all duration-500 delay-200 ${
                    animatingParticles ? 'opacity-100' : 'opacity-50'
                  }`}></div>
                  <ArrowRight className={`w-3 h-3 text-gray-500 transition-all duration-300 ${
                    animatingParticles ? 'translate-x-0.5 opacity-100' : 'translate-x-0 opacity-70'
                  }`} />
                </div>
              </div>

              {selectedFlow === flow.id && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-600 mb-2">{flow.description}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">{flow.destination}</span>
                    <span className="text-gray-500">{flow.partner}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-2xl p-6 border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-anton text-green-600">{organicFlows.reduce((sum, flow) => sum + flow.volume, 0).toFixed(1)}</div>
            <div className="text-sm text-gray-600">Ton Orgánicos</div>
          </div>
          <div>
            <div className="text-2xl font-anton text-blue-600">{recyclableFlows.reduce((sum, flow) => sum + flow.volume, 0).toFixed(1)}</div>
            <div className="text-sm text-gray-600">Ton Reciclables</div>
          </div>
          <div>
            <div className="text-2xl font-anton text-gray-600">{inorganicFlows.reduce((sum, flow) => sum + flow.volume, 0).toFixed(1)}</div>
            <div className="text-sm text-gray-600">Ton Inorgánicos</div>
          </div>
          <div>
            <div className="text-2xl font-anton text-emerald-600">{diversionRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Tasa Desviación</div>
          </div>
        </div>
      </div>
      {/* Detailed Subcategory Breakdown - Professional Sales Presentation */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-anton text-gray-800 uppercase mb-6 text-center">Clasificación Detallada por Subcategorías</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inorgánicos Detallados */}
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-bold text-gray-700 uppercase">Inorgánicos</h4>
              <p className="text-sm text-gray-600">2DO. USO</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700">Blancos • Losa • Objetos Perdidos • Mobiliario</div>
                <div className="text-gray-600 mt-1">→ Donaciones o Defensa SGA</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700">Residuos Electrónicos</div>
                <div className="text-gray-600 mt-1">→ Recuperación Revalorización Reciclaje</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-semibold text-blue-700">Vidrio (Timbrado SAT) • Vidrio PET HDPE • Plástico Duro</div>
                <div className="text-blue-600 mt-1">→ Revalorización Proceso Refabricación</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-semibold text-blue-700">Tapas de polipropileno • Aluminio • Cartón • Papel • Periódico • Revistas</div>
                <div className="text-blue-600 mt-1">→ Cartuchos Nikken</div>
              </div>
            </div>
          </div>

          {/* Orgánicos Detallados */}
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-bold text-green-700 uppercase">Orgánicos</h4>
              <p className="text-sm text-gray-600">PROCESAMIENTO BIOLÓGICO</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="font-semibold text-amber-700">Aceite Residual</div>
                <div className="text-amber-600 mt-1">→ Revalorización (Insumo para biodiesel)</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-semibold text-green-700">Grasa • Fruta • Cáscaras</div>
                <div className="text-green-600 mt-1">→ Recolección y disposición de grasa cocinas</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-semibold text-green-700">Pan • Pescados • Carne • Huevo • Queso • Pollo • Pasta • Arroz</div>
                <div className="text-green-600 mt-1">→ Biodegradación mediante biodigestor</div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <div className="font-semibold text-green-800">Azúcar • Salsas • Papa • Caña • Conchas • Aceites • Café</div>
                <div className="text-green-700 mt-1">→ Reprocesamiento y Compostaje</div>
              </div>
            </div>
          </div>

          {/* Partners y Certificaciones */}
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-bold text-blue-700 uppercase">Partners Certificados</h4>
              <p className="text-sm text-gray-600">RED DE VALORIZACIÓN</p>
            </div>
            <div className="space-y-3 text-xs">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="font-bold text-blue-800">ORKA</div>
                <div className="text-blue-600">Biodigestores Avanzados</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="font-bold text-green-800">Reoil</div>
                <div className="text-green-600">Biodiesel Sustentable</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="font-bold text-purple-800">TEDISD</div>
                <div className="text-purple-600">Innovative Group</div>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg text-center">
                <div className="font-bold text-indigo-800">eWaste Group</div>
                <div className="text-indigo-600">Electrónicos Especializados</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="font-bold text-yellow-800">Cerrando el Ciclo</div>
                <div className="text-yellow-600">Vidrio Certificado</div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg text-center">
                <div className="font-bold text-emerald-800">Verde Ciudad • Recupera • NIKKEN</div>
                <div className="text-emerald-600">Red Integral de Reciclaje</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}