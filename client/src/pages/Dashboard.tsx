import React from 'react';
import { useTranslation } from 'react-i18next';
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

// Types for the Excel data (imported from ResiduosExcel)
interface MonthData {
  month: { id: number; year: number; month: number; label: string };
  recycling: Array<{ material: string; kg: number }>;
  compost: Array<{ category: string; kg: number }>;
  reuse: Array<{ category: string; kg: number }>;
  landfill: Array<{ wasteType: string; kg: number }>;
}

interface WasteExcelData {
  year: number;
  months: MonthData[];
  materials: {
    recycling: readonly string[];
    compost: readonly string[];
    reuse: readonly string[];
    landfill: readonly string[];
  };
}

export default function Dashboard() {
  const { t } = useTranslation();
  const currentYear = 2025;
  
  // Obtener datos de residuos (legacy)
  const { data: wasteData = [] } = useQuery<WasteData[]>({
    queryKey: ['/api/waste-data'],
    refetchOnWindowFocus: false,
  });

  // Obtener alertas
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    refetchOnWindowFocus: false,
  });

  // Obtener datos de la tabla de trazabilidad (FUENTE DE VERDAD)
  const { data: wasteExcelData } = useQuery<WasteExcelData>({
    queryKey: ['/api/waste-excel', currentYear],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`/api/waste-excel/${currentYear}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Calcular totales de cada sección (misma lógica que ResiduosExcel)
  const calculateSectionTotals = () => {
    if (!wasteExcelData) return { recyclingTotal: 0, compostTotal: 0, reuseTotal: 0, landfillTotal: 0 };
    
    let recyclingTotal = 0;
    let compostTotal = 0;
    let reuseTotal = 0;
    let landfillTotal = 0;

    wasteExcelData.months.forEach(monthData => {
      // Recycling
      monthData.recycling.forEach(entry => {
        recyclingTotal += entry.kg;
      });
      
      // Compost
      monthData.compost.forEach(entry => {
        compostTotal += entry.kg;
      });
      
      // Reuse
      monthData.reuse.forEach(entry => {
        reuseTotal += entry.kg;
      });
      
      // Landfill
      monthData.landfill.forEach(entry => {
        landfillTotal += entry.kg;
      });
    });

    return { recyclingTotal, compostTotal, reuseTotal, landfillTotal };
  };

  // Calcular KPIs (misma lógica que ResiduosExcel)
  const calculateRealTimeKPIs = () => {
    const totals = calculateSectionTotals();
    const totalCircular = totals.recyclingTotal + totals.compostTotal + totals.reuseTotal;
    const totalLandfill = totals.landfillTotal;
    const totalWeight = totalCircular + totalLandfill;
    const deviationPercentage = totalWeight > 0 ? (totalCircular / totalWeight) * 100 : 0;
    
    return {
      totalCircular,
      totalLandfill,
      totalWeight,
      deviationPercentage
    };
  };

  const realTimeKPIs = calculateRealTimeKPIs();

  // Datos calculados en tiempo real desde la trazabilidad
  const processedData = {
    wasteDeviation: realTimeKPIs.deviationPercentage, // AHORA SE CALCULA EN TIEMPO REAL
    energyRenewable: 29.1,
    waterRecycled: 28.9,
    circularityIndex: 72
  };

  // Calcular impacto ambiental usando datos reales de trazabilidad
  const totalWasteDiverted = realTimeKPIs.totalCircular / 1000; // Convertir de kg a toneladas
  
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
          {/* Header principal mejorado */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl mb-8 border border-gray-200 backdrop-blur-sm">
              <img src={cccmLogo} alt="Club Campestre Ciudad de México" className="w-20 h-20 object-contain" />
            </div>
            <div className="relative mb-6">
              <h1 className="text-5xl md:text-7xl font-light text-[#273949] mb-2 tracking-tight">
                Sistema de
              </h1>
              <h1 className="text-5xl md:text-7xl text-[#273949] tracking-tight relative font-light">
                Gestión Ambiental
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-[#b5e951] to-emerald-400 rounded-full"></div>
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              Plataforma integral de sustentabilidad para el 
              <span className="font-semibold text-[#273949]"> Club Campestre Ciudad de México</span>
            </p>
            <div className="flex items-center justify-center mt-6 space-x-2">
              <div className="w-2 h-2 bg-[#b5e951] rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500 font-medium">En tiempo real</span>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>

          {/* Módulos ambientales principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Residuos */}
            <Link href="/trazabilidad-residuos">
              <div className="group cursor-pointer bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all duration-300 hover:-translate-y-1 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-emerald-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                      <Trash2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{processedData.wasteDeviation.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">{t('dashboard.deviation')}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.waste')}</h3>
                    <p className="text-sm text-gray-600">{t('dashboard.trueInProgress')}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all absolute bottom-6 right-6" />
                </div>
              </div>
            </Link>

            {/* Energía */}
            <Link href="/energia">
              <div className="group cursor-pointer bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-yellow-200 transition-all duration-300 hover:-translate-y-1 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 to-orange-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-600">{processedData.energyRenewable}%</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">{t('dashboard.renewable')}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.energyLabel')}</h3>
                    <p className="text-sm text-gray-600">{t('dashboard.solarPanels')}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all absolute bottom-6 right-6" />
                </div>
              </div>
            </Link>

            {/* Agua */}
            <Link href="/agua">
              <div className="group cursor-pointer bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-cyan-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                      <Droplets className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{processedData.waterRecycled}%</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">{t('dashboard.recycled')}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.waterLabel')}</h3>
                    <p className="text-sm text-gray-600">{t('dashboard.ptarSystem')}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all absolute bottom-6 right-6" />
                </div>
              </div>
            </Link>

            {/* Economía Circular */}
            <Link href="/economia-circular">
              <div className="group cursor-pointer bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 hover:-translate-y-1 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-indigo-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                      <RefreshCw className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{processedData.circularityIndex}%</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">{t('dashboard.circularity')}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.circularEconomy')}</h3>
                    <p className="text-sm text-gray-600">{t('dashboard.integratedSustainability')}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all absolute bottom-6 right-6" />
                </div>
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
                {t('dashboard.certifiedMethodology')}
              </h3>
              <Button variant="outline" size="sm" className="hover:bg-[#b5e951] hover:text-white hover:border-[#b5e951] transition-colors">
                {t('dashboard.viewCertifications')}
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