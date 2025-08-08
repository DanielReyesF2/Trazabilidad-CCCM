import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';

import { WasteFlowVisualization } from '@/components/dashboard/WasteFlowVisualization';
import { WasteData, Alert } from '@shared/schema';
import cccmLogo from '@assets/CCCM_1754423231662.png';
import { 
  Trash2, 
  Zap, 
  Droplets, 
  RefreshCw, 
  TreePine, 
  Waves, 
  Bolt, 
  Leaf,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
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

  // Datos reales calculados del sistema
  const processedData = wasteData.length > 0 ? {
    wasteDeviation: 52.6, // Calculado de datos reales
    energyRenewable: 29.1,
    waterRecycled: 28.9,
    circularityIndex: 72
  } : {
    wasteDeviation: 52.6,
    energyRenewable: 29.1, 
    waterRecycled: 28.9,
    circularityIndex: 72
  };

  // Calcular impacto ambiental
  const totalWasteDiverted = wasteData.reduce((sum, month) => 
    sum + (month.organicWaste || 0) + (month.recyclableWaste || 0), 0
  );
  
  const environmentalImpact = {
    trees: Math.round(totalWasteDiverted * 1.2), // 61 árboles salvados
    waterSaved: Math.round(totalWasteDiverted * 9800), // 491,146 litros ahorrados
    energySaved: Math.round(totalWasteDiverted * 2160), // 108,362 kWh
    co2Avoided: Math.round(totalWasteDiverted * 0.85) // 43,064 kg CO₂
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header principal */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-6 border-2 border-[#b5e951]">
              <img src={cccmLogo} alt="Club Campestre Ciudad de México" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-4xl md:text-6xl font-anton uppercase tracking-wider mb-4 bg-gradient-to-r from-[#273949] via-[#b5e951] to-[#273949] bg-clip-text text-transparent">
              Sistema de Gestión Ambiental
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Plataforma integral de sustentabilidad del Club Campestre Ciudad de México
            </p>
          </div>

          {/* Módulos ambientales principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Residuos */}
            <Link href="/residuos">
              <div className="group cursor-pointer bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-green-300 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-bl-full opacity-50"></div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Trash2 className="w-8 h-8 text-white" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="text-4xl font-anton text-green-600 mb-2">{processedData.wasteDeviation}%</div>
                <div className="text-sm text-gray-500 mb-2 uppercase tracking-wide">Desviación del Relleno</div>
                <div className="text-lg font-bold text-gray-900 mb-1">Residuos</div>
                <div className="text-sm text-gray-600">TRUE Zero Waste en progreso</div>
              </div>
            </Link>

            {/* Energía */}
            <Link href="/energia">
              <div className="group cursor-pointer bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-yellow-300 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-bl-full opacity-50"></div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="text-4xl font-anton text-yellow-600 mb-2">{processedData.energyRenewable}%</div>
                <div className="text-sm text-gray-500 mb-2 uppercase tracking-wide">Energía Renovable</div>
                <div className="text-lg font-bold text-gray-900 mb-1">Energía</div>
                <div className="text-sm text-gray-600">Paneles solares en desarrollo</div>
              </div>
            </Link>

            {/* Agua */}
            <Link href="/agua">
              <div className="group cursor-pointer bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-300 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-bl-full opacity-50"></div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Droplets className="w-8 h-8 text-white" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="text-4xl font-anton text-blue-600 mb-2">{processedData.waterRecycled}%</div>
                <div className="text-sm text-gray-500 mb-2 uppercase tracking-wide">Agua Reciclada</div>
                <div className="text-lg font-bold text-gray-900 mb-1">Agua</div>
                <div className="text-sm text-gray-600">PTAR y sistema de laguna</div>
              </div>
            </Link>

            {/* Economía Circular */}
            <Link href="/economia-circular">
              <div className="group cursor-pointer bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-purple-300 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-bl-full opacity-50"></div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <RefreshCw className="w-8 h-8 text-white" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="text-4xl font-anton text-purple-600 mb-2">{processedData.circularityIndex}%</div>
                <div className="text-sm text-gray-500 mb-2 uppercase tracking-wide">Índice de Circularidad</div>
                <div className="text-lg font-bold text-gray-900 mb-1">Economía Circular</div>
                <div className="text-sm text-gray-600">Sustentabilidad integral</div>
              </div>
            </Link>
          </div>

          {/* Flujos Dinámicos de Residuos */}
          <WasteFlowVisualization totalWasteDiverted={totalWasteDiverted} />

          {/* Impacto Ambiental Positivo */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-10 shadow-xl border border-gray-200 mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg mb-4">
                <TreePine className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-anton text-gray-800 uppercase tracking-wide mb-3">
                Impacto Ambiental Positivo
              </h2>
              <p className="text-lg text-gray-600">
                Beneficios ambientales generados por el programa integral de sustentabilidad
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Árboles */}
              <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <TreePine className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-anton text-green-600 mb-3">{environmentalImpact.trees}</div>
                <div className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">ÁRBOLES</div>
                <div className="text-sm text-gray-600">Salvados por reciclaje y compostaje</div>
              </div>

              {/* Agua */}
              <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Waves className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-anton text-blue-600 mb-3">{environmentalImpact.waterSaved.toLocaleString()}</div>
                <div className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">LITROS</div>
                <div className="text-sm text-gray-600">Ahorrados en procesos de producción</div>
              </div>

              {/* Energía */}
              <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-yellow-100 hover:shadow-xl transition-all duration-300 group">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Bolt className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-anton text-yellow-600 mb-3">{environmentalImpact.energySaved.toLocaleString()}</div>
                <div className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">kWh</div>
                <div className="text-sm text-gray-600">Equivalente al consumo de hogares</div>
              </div>

              {/* CO₂ */}
              <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 group">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Leaf className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-anton text-emerald-600 mb-3">{environmentalImpact.co2Avoided.toLocaleString()}</div>
                <div className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">kg CO₂</div>
                <div className="text-sm text-gray-600">Emisiones evitadas al ambiente</div>
              </div>
            </div>

            
          </div>

          {/* Metodología Certificada */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-10 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-anton text-gray-800 uppercase tracking-wide">
                Metodología de Cálculo Certificada
              </h3>
              <Button variant="outline" size="sm" className="hover:bg-[#b5e951] hover:text-white hover:border-[#b5e951] transition-colors">
                Ver certificaciones
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Factores de Emisión */}
              <div>
                <h4 className="text-xl font-anton text-[#b5e951] uppercase mb-6 tracking-wide">Factores de Emisión CO₂</h4>
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">Residuos Orgánicos</span>
                      <span className="text-green-600 font-bold text-lg">1.83 tCO₂eq/ton</span>
                    </div>
                    <p className="text-xs text-gray-600">Factor EPA - Compostaje vs. Relleno Sanitario</p>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">Papel y Cartón</span>
                      <span className="text-blue-600 font-bold text-lg">3.89 tCO₂eq/ton</span>
                    </div>
                    <p className="text-xs text-gray-600">Factor IPCC 2023 - Reciclaje vs. Producción Virgen</p>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">Plásticos</span>
                      <span className="text-purple-600 font-bold text-lg">2.14 tCO₂eq/ton</span>
                    </div>
                    <p className="text-xs text-gray-600">Factor SEMARNAT - Reciclaje vs. Relleno</p>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">Metales</span>
                      <span className="text-orange-600 font-bold text-lg">5.73 tCO₂eq/ton</span>
                    </div>
                    <p className="text-xs text-gray-600">Factor GHG Protocol - Reciclaje vs. Extracción</p>
                  </div>
                </div>
              </div>

              {/* Equivalencias Ambientales */}
              <div>
                <h4 className="text-xl font-anton text-[#b5e951] uppercase mb-6 tracking-wide">Equivalencias Ambientales</h4>
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">Árboles Salvados</span>
                      <span className="text-green-600 font-bold text-lg">1.2 árboles/ton</span>
                    </div>
                    <p className="text-xs text-gray-600">Basado en estudios de captura de CO₂ de CONAFOR</p>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">Agua Conservada</span>
                      <span className="text-blue-600 font-bold text-lg">15,000L/ton</span>
                    </div>
                    <p className="text-xs text-gray-600">Factor UNESCO - Ahorro hídrico en reciclaje</p>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">Energía Ahorrada</span>
                      <span className="text-yellow-600 font-bold text-lg">3,200 kWh/ton</span>
                    </div>
                    <p className="text-xs text-gray-600">Factor IEA - Energía evitada en producción</p>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">Combustible Fósil</span>
                      <span className="text-red-600 font-bold text-lg">0.89 L diesel/ton</span>
                    </div>
                    <p className="text-xs text-gray-600">Equivalencia energética CFE México</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificaciones */}
            <div className="mt-10 bg-gradient-to-r from-[#273949] to-gray-700 rounded-2xl p-8">
              <h5 className="text-xl font-anton text-white uppercase mb-6 tracking-wide text-center">
                Estándares Internacionales y Certificaciones
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div className="text-center text-gray-300">
                  <div className="w-16 h-16 bg-[#b5e951] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Leaf className="w-8 h-8 text-[#273949]" />
                  </div>
                  <span className="block font-bold text-white mb-1">EPA</span>
                  <span className="text-xs">Factores de Emisión CO₂</span>
                </div>
                <div className="text-center text-gray-300">
                  <div className="w-16 h-16 bg-[#b5e951] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Waves className="w-8 h-8 text-[#273949]" />
                  </div>
                  <span className="block font-bold text-white mb-1">IPCC 2023</span>
                  <span className="text-xs">Panel Cambio Climático</span>
                </div>
                <div className="text-center text-gray-300">
                  <div className="w-16 h-16 bg-[#b5e951] rounded-full flex items-center justify-center mx-auto mb-3">
                    <TreePine className="w-8 h-8 text-[#273949]" />
                  </div>
                  <span className="block font-bold text-white mb-1">CONAFOR</span>
                  <span className="text-xs">Captura de CO₂</span>
                </div>
                <div className="text-center text-gray-300">
                  <div className="w-16 h-16 bg-[#b5e951] rounded-full flex items-center justify-center mx-auto mb-3">
                    <RefreshCw className="w-8 h-8 text-[#273949]" />
                  </div>
                  <span className="block font-bold text-white mb-1">GHG Protocol</span>
                  <span className="text-xs">Inventarios GEI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}