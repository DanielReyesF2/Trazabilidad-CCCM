import { useState, useMemo } from 'react';
import { SankeyDiagram, SankeyData, SankeyNode, SankeyLink } from '@/components/SankeyDiagram';
import { useSankeyData, useYearlySankeyData } from '@/hooks/useSankeyData';
import { useTrueYearData } from '@/hooks/useTrueYearData';
import { generateTrueYearPdfReport } from '@/lib/trueYearReportPdf';
import { WASTE_STREAM_COLORS } from '@/lib/sankey-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, BarChart3, Recycle, Leaf, Gift, Trash2, AlertTriangle, Home, Download, Award, FileText } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

// Transform TRUE Year totals to Sankey data
function transformTrueYearToSankey(totals: {
  totalRecycling: number;
  totalCompost: number;
  totalReuse: number;
  totalLandfill: number;
  totalDiverted: number;
  totalGenerated: number;
}): SankeyData {
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];

  // Helper functions
  const addNode = (id: string, label: string, category: 'source' | 'process' | 'destination', color?: string) => {
    if (!nodes.find(n => n.id === id)) {
      nodes.push({ id, label, category, color });
    }
  };

  const addLink = (source: string, target: string, value: number, color?: string) => {
    if (value > 0 && isFinite(value) && !isNaN(value)) {
      links.push({ source, target, value, color });
    }
  };

  // Source node
  addNode('total_generated', 'Eventos e Instalaciones', 'source', WASTE_STREAM_COLORS.generation);

  // Category nodes
  addNode('recyclables_category', 'Reciclables', 'process', WASTE_STREAM_COLORS.recyclables);
  addNode('organics_category', 'Orgánicos', 'process', WASTE_STREAM_COLORS.organics);
  addNode('reuse_category', 'Casa Club', 'process', WASTE_STREAM_COLORS.reuse);
  addNode('inorganics_category', 'Inorgánicos', 'process', WASTE_STREAM_COLORS.inorganics);

  // Destination nodes
  addNode('recycling_facility', 'Reciclaje Recupera', 'destination', WASTE_STREAM_COLORS.recycling_center);
  addNode('composting_facility', 'Biodegradación ORKA', 'destination', WASTE_STREAM_COLORS.composting_facility);
  addNode('donation_center', 'Reciclaje Verde Ciudad', 'destination', WASTE_STREAM_COLORS.donation_center);
  addNode('landfill', 'Disposición Controlada', 'destination', WASTE_STREAM_COLORS.landfill);

  // Links from source to categories
  if (totals.totalRecycling > 0) {
    addLink('total_generated', 'recyclables_category', totals.totalRecycling, WASTE_STREAM_COLORS.recyclables);
    addLink('recyclables_category', 'recycling_facility', totals.totalRecycling, WASTE_STREAM_COLORS.recycling_center);
  }

  if (totals.totalCompost > 0) {
    addLink('total_generated', 'organics_category', totals.totalCompost, WASTE_STREAM_COLORS.organics);
    addLink('organics_category', 'composting_facility', totals.totalCompost, WASTE_STREAM_COLORS.composting_facility);
  }

  if (totals.totalReuse > 0) {
    addLink('total_generated', 'reuse_category', totals.totalReuse, WASTE_STREAM_COLORS.reuse);
    addLink('reuse_category', 'donation_center', totals.totalReuse, WASTE_STREAM_COLORS.donation_center);
  }

  if (totals.totalLandfill > 0) {
    addLink('total_generated', 'inorganics_category', totals.totalLandfill, WASTE_STREAM_COLORS.inorganics);
    addLink('inorganics_category', 'landfill', totals.totalLandfill, WASTE_STREAM_COLORS.landfill);
  }

  return { nodes, links };
}

export default function FlujoDeMateriales() {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(8); // August 2025 as default
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly' | 'trueYear'>('monthly');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Get data based on view mode
  const monthlyResult = useSankeyData({
    year: selectedYear,
    month: selectedMonth
  });

  const yearlyResult = useYearlySankeyData(4, selectedYear);
  
  // TRUE Year data (Oct 2024 - Sep 2025)
  const trueYearResult = useTrueYearData();

  // Transform TRUE Year data to Sankey format
  const trueYearSankeyData = useMemo(() => {
    if (!trueYearResult.data) {
      return { nodes: [], links: [] };
    }
    return transformTrueYearToSankey(trueYearResult.totals);
  }, [trueYearResult.data, trueYearResult.totals]);

  // Select appropriate result based on view mode
  const currentResult = viewMode === 'trueYear' 
    ? {
        data: trueYearSankeyData,
        isLoading: trueYearResult.isLoading,
        error: trueYearResult.error,
        validation: { isValid: true, errors: [], warnings: [], sourceTotal: trueYearResult.totals.totalGenerated, destinationTotal: trueYearResult.totals.totalGenerated },
        period: trueYearResult.period,
        diversionStats: {
          totalGenerated: trueYearResult.totals.totalGenerated,
          totalDiverted: trueYearResult.totals.totalDiverted,
          diversionRate: trueYearResult.totals.diversionRate,
          breakdown: {
            recycled: trueYearResult.totals.totalRecycling,
            composted: trueYearResult.totals.totalCompost,
            reused: trueYearResult.totals.totalReuse,
            landfilled: trueYearResult.totals.totalLandfill,
          }
        }
      }
    : viewMode === 'monthly' ? monthlyResult : yearlyResult;

  const handleDownloadTrueYearPdf = async () => {
    if (!trueYearResult.data) return;
    setIsGeneratingPdf(true);
    try {
      await generateTrueYearPdfReport(trueYearResult.data);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const monthNames = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Available years and months (based on your data)
  const availableYears = [2024, 2025];
  const availableMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Generado',
      value: currentResult.diversionStats.totalGenerated.toFixed(0),
      unit: 'kg',
      icon: BarChart3,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Total Desviado',
      value: currentResult.diversionStats.totalDiverted.toFixed(0),
      unit: 'kg',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Tasa de Desviación',
      value: currentResult.diversionStats.diversionRate.toFixed(1),
      unit: '%',
      icon: currentResult.diversionStats.diversionRate >= 50 ? TrendingUp : TrendingDown,
      color: currentResult.diversionStats.diversionRate >= 50 ? 'text-green-600' : 'text-orange-600',
      bgColor: currentResult.diversionStats.diversionRate >= 50 ? 'bg-green-50' : 'bg-orange-50'
    }
  ];

  const breakdownCards = [
    {
      title: 'Reciclado',
      value: currentResult.diversionStats.breakdown.recycled.toFixed(0),
      unit: 'kg',
      icon: Recycle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      percentage: currentResult.diversionStats.totalGenerated > 0 
        ? (currentResult.diversionStats.breakdown.recycled / currentResult.diversionStats.totalGenerated * 100).toFixed(1)
        : '0'
    },
    {
      title: 'Compostado',
      value: currentResult.diversionStats.breakdown.composted.toFixed(0),
      unit: 'kg',
      icon: Leaf,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      percentage: currentResult.diversionStats.totalGenerated > 0 
        ? (currentResult.diversionStats.breakdown.composted / currentResult.diversionStats.totalGenerated * 100).toFixed(1)
        : '0'
    },
    {
      title: 'Reutilizado',
      value: currentResult.diversionStats.breakdown.reused.toFixed(0),
      unit: 'kg',
      icon: Gift,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      percentage: currentResult.diversionStats.totalGenerated > 0 
        ? (currentResult.diversionStats.breakdown.reused / currentResult.diversionStats.totalGenerated * 100).toFixed(1)
        : '0'
    },
    {
      title: 'Relleno Sanitario',
      value: currentResult.diversionStats.breakdown.landfilled.toFixed(0),
      unit: 'kg',
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      percentage: currentResult.diversionStats.totalGenerated > 0 
        ? (currentResult.diversionStats.breakdown.landfilled / currentResult.diversionStats.totalGenerated * 100).toFixed(1)
        : '0'
    }
  ];

  if (currentResult.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white rounded-lg shadow-sm"></div>
              ))}
            </div>
            <div className="h-96 bg-white rounded-lg shadow-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#b5e951]">
                  FLUJOS DE MATERIALES
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Diagrama Sankey Interactivo - Club Campestre Ciudad de México
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'monthly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('monthly')}
                  className="h-8 px-3"
                  data-testid="btn-monthly-view"
                >
                  Mensual
                </Button>
                <Button
                  variant={viewMode === 'yearly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('yearly')}
                  className="h-8 px-3"
                  data-testid="btn-yearly-view"
                >
                  Anual
                </Button>
                <Button
                  variant={viewMode === 'trueYear' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('trueYear')}
                  className="h-8 px-3 flex items-center gap-1"
                  data-testid="btn-true-year-view"
                >
                  <Award className="h-3 w-3" />
                  Año TRUE
                </Button>
              </div>

              {/* Year Selector - Hide in TRUE Year mode */}
              {viewMode !== 'trueYear' && (
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-24" data-testid="select-year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Month Selector - Only show in monthly view */}
              {viewMode === 'monthly' && (
                <Select
                  value={selectedMonth?.toString() || ''}
                  onValueChange={(value) => setSelectedMonth(value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger className="w-32" data-testid="select-month">
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map(month => (
                      <SelectItem key={month} value={month.toString()}>
                        {monthNames[month]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* TRUE Year PDF Download Button */}
              {viewMode === 'trueYear' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTrueYearPdf}
                  disabled={isGeneratingPdf || !trueYearResult.data}
                  className="h-8 flex items-center gap-2 border-[#b5e951] text-[#273949] hover:bg-[#b5e951]/10"
                  data-testid="btn-download-true-year-pdf"
                >
                  <FileText className="h-4 w-4" />
                  {isGeneratingPdf ? 'Generando...' : 'Reporte PDF'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Validation Alerts */}
        {!currentResult.validation.isValid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-orange-900">Validación de Datos</h3>
                    <div className="text-sm text-orange-700 mt-1">
                      {currentResult.validation.errors.map((error, i) => (
                        <div key={i}>• {error}</div>
                      ))}
                      {currentResult.validation.warnings.map((warning, i) => (
                        <div key={i} className="text-orange-600">⚠ {warning}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* TRUE Year Summary Banner */}
        {viewMode === 'trueYear' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className={`border-2 ${currentResult.diversionStats.diversionRate >= 90 ? 'border-green-400 bg-green-50' : 'border-amber-400 bg-amber-50'}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${currentResult.diversionStats.diversionRate >= 90 ? 'bg-green-100' : 'bg-amber-100'}`}>
                    <Award className={`h-8 w-8 ${currentResult.diversionStats.diversionRate >= 90 ? 'text-green-600' : 'text-amber-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      Año TRUE Zero Waste
                      <Badge className={currentResult.diversionStats.diversionRate >= 90 ? 'bg-green-600' : 'bg-amber-600'}>
                        {currentResult.diversionStats.diversionRate >= 90 ? 'Certificación Alcanzada' : 'En Proceso'}
                      </Badge>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Período: Octubre 2024 - Septiembre 2025 (12 meses)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{currentResult.diversionStats.diversionRate.toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">Tasa de Desviación</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{(currentResult.diversionStats.totalGenerated / 1000).toFixed(1)}</p>
                        <p className="text-xs text-gray-500">Toneladas Totales</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{(currentResult.diversionStats.totalDiverted / 1000).toFixed(1)}</p>
                        <p className="text-xs text-gray-500">Toneladas Desviadas</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{(currentResult.diversionStats.breakdown.landfilled / 1000).toFixed(1)}</p>
                        <p className="text-xs text-gray-500">Toneladas a Relleno</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {stat.value}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          {stat.unit}
                        </span>
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Sankey Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <SankeyDiagram
            data={currentResult.data}
            title="FLUJOS DE MATERIALES"
            subtitle={`Diagrama Sankey Interactivo - Club Campestre Ciudad de México`}
            period={currentResult.period}
            height={500}
            className="shadow-sm bg-white rounded-lg"
            onNodeClick={(node) => {
              console.log('Node clicked:', node);
            }}
            onLinkClick={(link) => {
              console.log('Link clicked:', link);
            }}
          />
        </motion.div>

        {/* Breakdown by Destination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#273949]">
                Desglose por Destino Final
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {breakdownCards.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`inline-flex p-3 rounded-lg ${item.bgColor} mb-3`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {item.value}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        {item.unit}
                      </span>
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      {item.percentage}% del total
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}