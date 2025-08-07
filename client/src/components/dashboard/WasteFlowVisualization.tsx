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
  Battery
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
    description: 'Restos de comida del restaurante y eventos'
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
    description: 'Poda de árboles y mantenimiento de áreas verdes'
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
    description: 'Aceite usado de cocinas y restaurante'
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
    description: 'Documentos, cajas de cartón y material impreso'
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
    description: 'Botellas y envases plásticos reciclables'
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
    description: 'Botellas de vidrio y cristalería'
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
    description: 'Equipos electrónicos y componentes'
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
    description: 'Residuos no reciclables o contaminados'
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
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
          <Recycle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-anton text-gray-800 uppercase tracking-wide mb-3">
          Flujos de Residuos Dinámicos
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Visualización interactiva del sistema integral de gestión de residuos
        </p>
        <div className="inline-flex items-center space-x-6 text-sm">
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

      {/* Flow Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Orgánicos */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg mb-3">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-anton text-green-700 uppercase tracking-wide">Orgánicos</h3>
            <p className="text-sm text-gray-600">
              {organicFlows.reduce((sum, flow) => sum + flow.volume, 0).toFixed(1)} ton/mes
            </p>
          </div>
          
          <div className="space-y-3">
            {organicFlows.map((flow, index) => (
              <div
                key={flow.id}
                className={`group relative cursor-pointer p-4 rounded-2xl border transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${
                  selectedFlow === flow.id 
                    ? 'bg-green-100 border-green-300 shadow-lg' 
                    : 'bg-white border-gray-200 hover:border-green-300'
                }`}
                onClick={() => setSelectedFlow(selectedFlow === flow.id ? null : flow.id)}
                style={{
                  animationDelay: `${index * 200}ms`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${flow.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className={flow.color}>{flow.icon}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{flow.name}</div>
                      <div className="text-xs text-gray-500">{flow.volume} ton/mes</div>
                    </div>
                  </div>
                  
                  {/* Animated Flow */}
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 bg-green-400 rounded-full transition-all duration-700 ${
                      animatingParticles ? 'opacity-100 scale-110' : 'opacity-50 scale-90'
                    }`}></div>
                    <div className={`w-1.5 h-1.5 bg-green-500 rounded-full transition-all duration-700 delay-150 ${
                      animatingParticles ? 'opacity-100 scale-110' : 'opacity-50 scale-90'
                    }`}></div>
                    <ArrowRight className={`w-4 h-4 text-green-500 transition-all duration-500 ${
                      animatingParticles ? 'translate-x-2 opacity-100' : 'translate-x-0 opacity-70'
                    }`} />
                  </div>
                </div>

                {/* Destination Info */}
                <div className={`mt-3 pt-3 border-t border-green-100 transition-all duration-300 ${
                  selectedFlow === flow.id ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-600 font-medium">{flow.destination}</span>
                    <span className="text-gray-500">{flow.partner}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{flow.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reciclables */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg mb-3">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-anton text-blue-700 uppercase tracking-wide">Reciclables</h3>
            <p className="text-sm text-gray-600">
              {recyclableFlows.reduce((sum, flow) => sum + flow.volume, 0).toFixed(1)} ton/mes
            </p>
          </div>
          
          <div className="space-y-3">
            {recyclableFlows.map((flow, index) => (
              <div
                key={flow.id}
                className={`group relative cursor-pointer p-4 rounded-2xl border transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${
                  selectedFlow === flow.id 
                    ? 'bg-blue-100 border-blue-300 shadow-lg' 
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedFlow(selectedFlow === flow.id ? null : flow.id)}
                style={{
                  animationDelay: `${index * 200}ms`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${flow.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className={flow.color}>{flow.icon}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{flow.name}</div>
                      <div className="text-xs text-gray-500">{flow.volume} ton/mes</div>
                    </div>
                  </div>
                  
                  {/* Animated Flow */}
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 bg-blue-400 rounded-full transition-all duration-700 ${
                      animatingParticles ? 'opacity-100 scale-110' : 'opacity-50 scale-90'
                    }`}></div>
                    <div className={`w-1.5 h-1.5 bg-blue-500 rounded-full transition-all duration-700 delay-150 ${
                      animatingParticles ? 'opacity-100 scale-110' : 'opacity-50 scale-90'
                    }`}></div>
                    <ArrowRight className={`w-4 h-4 text-blue-500 transition-all duration-500 ${
                      animatingParticles ? 'translate-x-2 opacity-100' : 'translate-x-0 opacity-70'
                    }`} />
                  </div>
                </div>

                {/* Destination Info */}
                <div className={`mt-3 pt-3 border-t border-blue-100 transition-all duration-300 ${
                  selectedFlow === flow.id ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600 font-medium">{flow.destination}</span>
                    <span className="text-gray-500">{flow.partner}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{flow.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inorgánicos */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg mb-3">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-anton text-gray-700 uppercase tracking-wide">Inorgánicos</h3>
            <p className="text-sm text-gray-600">
              {inorganicFlows.reduce((sum, flow) => sum + flow.volume, 0).toFixed(1)} ton/mes
            </p>
          </div>
          
          <div className="space-y-3">
            {inorganicFlows.map((flow, index) => (
              <div
                key={flow.id}
                className={`group relative cursor-pointer p-4 rounded-2xl border transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${
                  selectedFlow === flow.id 
                    ? 'bg-gray-100 border-gray-300 shadow-lg' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedFlow(selectedFlow === flow.id ? null : flow.id)}
                style={{
                  animationDelay: `${index * 200}ms`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${flow.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className={flow.color}>{flow.icon}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{flow.name}</div>
                      <div className="text-xs text-gray-500">{flow.volume} ton/mes</div>
                    </div>
                  </div>
                  
                  {/* Animated Flow */}
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 bg-gray-400 rounded-full transition-all duration-700 ${
                      animatingParticles ? 'opacity-100 scale-110' : 'opacity-50 scale-90'
                    }`}></div>
                    <div className={`w-1.5 h-1.5 bg-gray-500 rounded-full transition-all duration-700 delay-150 ${
                      animatingParticles ? 'opacity-100 scale-110' : 'opacity-50 scale-90'
                    }`}></div>
                    <ArrowRight className={`w-4 h-4 text-gray-500 transition-all duration-500 ${
                      animatingParticles ? 'translate-x-2 opacity-100' : 'translate-x-0 opacity-70'
                    }`} />
                  </div>
                </div>

                {/* Destination Info */}
                <div className={`mt-3 pt-3 border-t border-gray-100 transition-all duration-300 ${
                  selectedFlow === flow.id ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">{flow.destination}</span>
                    <span className="text-gray-500">{flow.partner}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{flow.description}</p>
                </div>
              </div>
            ))}
          </div>
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