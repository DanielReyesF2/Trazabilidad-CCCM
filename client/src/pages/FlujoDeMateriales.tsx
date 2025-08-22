import { useState, useMemo } from 'react';
import { SankeyDiagram } from '@/components/SankeyDiagram';
import { useSankeyData, useYearlySankeyData } from '@/hooks/useSankeyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, BarChart3, Recycle, Leaf, Gift, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FlujoDeMateriales() {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(8); // August 2025 as default
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  // Get data based on view mode
  const monthlyResult = useSankeyData({
    year: selectedYear,
    month: selectedMonth
  });

  const yearlyResult = useYearlySankeyData(4, selectedYear);

  const currentResult = viewMode === 'monthly' ? monthlyResult : yearlyResult;

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
            <div>
              <h1 className="text-2xl font-bold text-[#273949]">
                Flujo de Materiales
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Visualización Sankey del flujo de residuos desde origen hasta destino final
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'monthly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('monthly')}
                  className="h-8 px-3"
                >
                  Mensual
                </Button>
                <Button
                  variant={viewMode === 'yearly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('yearly')}
                  className="h-8 px-3"
                >
                  Anual
                </Button>
              </div>

              {/* Year Selector */}
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-24">
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

              {/* Month Selector - Only show in monthly view */}
              {viewMode === 'monthly' && (
                <Select
                  value={selectedMonth?.toString() || ''}
                  onValueChange={(value) => setSelectedMonth(value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger className="w-32">
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
            title="Diagrama de Flujo de Materiales"
            subtitle="Visualización del recorrido de residuos desde generación hasta destino final"
            period={currentResult.period}
            height={600}
            className="shadow-sm"
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