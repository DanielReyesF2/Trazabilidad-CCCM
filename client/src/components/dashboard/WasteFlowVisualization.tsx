import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
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
  // Orgánicos
  {
    id: 'organicos-comida',
    name: 'Residuos de Cocina',
    category: 'organico',
    icon: <Utensils className="w-5 h-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    destination: 'Biodegradación',
    partner: 'ORKA',
    volume: 8.5,
    description: 'Restos de comida del restaurante y eventos',
    origins: ['Restaurante', 'Cocina principal', 'Eventos especiales']
  },
  {
    id: 'organicos-jardineria',
    name: 'PODA (Residuos Jardín)',
    category: 'organico',
    icon: <TreePine className="w-5 h-5" />,
    color: 'text-green-700',
    bgColor: 'bg-green-200',
    destination: 'Compostaje',
    partner: 'Club interno',
    volume: 12.3,
    description: 'Poda de árboles y mantenimiento de áreas verdes',
    origins: ['Áreas verdes Casa Club', 'Jardines del complejo', 'Campo de golf']
  },
  {
    id: 'organicos-aceite',
    name: 'Aceite de Cocina',
    category: 'organico',
    icon: <Droplets className="w-5 h-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    destination: 'Biodiesel',
    partner: 'Reoil',
    volume: 0.8,
    description: 'Aceite usado de cocinas y restaurante',
    origins: ['Cocina principal', 'Restaurante', 'Bar y cafetería']
  },
  
  // Reciclables
  {
    id: 'reciclable-papel',
    name: 'Papel y Cartón',
    category: 'reciclable',
    icon: <Newspaper className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    destination: 'Reprocesamiento',
    partner: 'KREY',
    volume: 2.1,
    description: 'Documentos, cajas de cartón y material impreso',
    origins: ['Oficinas administrativas', 'Recepción Casa Club', 'Área de eventos']
  },
  {
    id: 'reciclable-plastico',
    name: 'Plástico PET',
    category: 'reciclable',
    icon: <Wine className="w-5 h-5" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-200',
    destination: 'Reciclaje',
    partner: 'Recupera',
    volume: 1.9,
    description: 'Botellas y envases plásticos reciclables',
    origins: ['Restaurante', 'Bar', 'Áreas comunes Casa Club']
  },
  {
    id: 'reciclable-vidrio',
    name: 'Vidrio',
    category: 'reciclable',
    icon: <Package className="w-5 h-5" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    destination: 'Refabricación',
    partner: 'Grupo eWaste',
    volume: 1.2,
    description: 'Botellas de vidrio y cristalería',
    origins: ['Bar y restaurante', 'Eventos especiales', 'Áreas de servicio']
  },
  
  // Inorgánicos
  {
    id: 'inorganico-electronicos',
    name: 'Electrónicos',
    category: 'inorganico',
    icon: <Battery className="w-5 h-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    destination: 'Recuperación de Metales',
    partner: 'Nikken',
    volume: 0.3,
    description: 'Equipos electrónicos y componentes',
    origins: ['Oficinas administrativas', 'Sistemas Casa Club', 'Equipos obsoletos']
  },
  {
    id: 'inorganico-general',
    name: 'Residuos Generales',
    category: 'inorganico',
    icon: <Trash2 className="w-5 h-5" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    destination: 'Relleno Sanitario',
    partner: 'SGA',
    volume: 5.8,
    description: 'Residuos no reciclables o contaminados',
    origins: ['Casa Club general', 'Oficinas', 'Áreas de mantenimiento']
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
        <h2 className="text-3xl font-anton text-gray-800 uppercase tracking-wide mb-3">
          Flujos de Residuos Dinámicos
        </h2>
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

        <div className="flex justify-center space-x-12 mb-8">
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
        </div>

        {/* Flow Lines - SVG Background */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" style={{ height: '400px', top: '80px' }}>
            {/* Curved flow lines from origins to categories */}
            <defs>
              <linearGradient id="greenFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#059669" stopOpacity="0.8"/>
              </linearGradient>
              <linearGradient id="blueFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.8"/>
              </linearGradient>
              <linearGradient id="grayFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6b7280" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#4b5563" stopOpacity="0.8"/>
              </linearGradient>
            </defs>
            
            {/* Animated flow lines */}
            <path
              d="M 200 50 Q 300 150 150 250"
              stroke="url(#greenFlow)"
              strokeWidth="3"
              fill="none"
              className={`transition-all duration-1000 ${animatingParticles ? 'opacity-100' : 'opacity-60'}`}
            />
            <path
              d="M 400 50 Q 450 150 380 250"
              stroke="url(#blueFlow)"
              strokeWidth="3"
              fill="none"
              className={`transition-all duration-1000 delay-300 ${animatingParticles ? 'opacity-100' : 'opacity-60'}`}
            />
            <path
              d="M 600 50 Q 650 150 750 250"
              stroke="url(#grayFlow)"
              strokeWidth="3"
              fill="none"
              className={`transition-all duration-1000 delay-600 ${animatingParticles ? 'opacity-100' : 'opacity-60'}`}
            />
          </svg>
        </div>

        {/* Category Containers */}
        <div className="flex justify-center space-x-8 relative z-10 mb-8">
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
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-2xl p-6 border border-gray-200">
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
    </div>
  );
}