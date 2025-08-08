import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';
import { 
  ChevronDown, 
  ChevronRight, 
  Save, 
  BarChart2, 
  TrendingUp,
  Recycle,
  Leaf,
  RotateCcw,
  Trash2
} from 'lucide-react';

// Types for the Excel replication
interface WasteEntry {
  material: string;
  months: Record<string, number>;
  total: number;
}

interface MonthData {
  month: {
    id: number;
    year: number;
    month: number;
    label: string;
  };
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

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function ResiduosExcel() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [openSections, setOpenSections] = useState({
    recycling: true,
    compost: true,
    reuse: true,
    landfill: true
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch waste data for selected year
  const { data: wasteData, isLoading } = useQuery<WasteExcelData>({
    queryKey: ['/api/waste-excel', selectedYear],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`/api/waste-excel/${selectedYear}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const response = await fetch('/api/waste-excel/batch-update', {
        method: 'POST',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to update data');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Datos actualizados",
        description: "Los datos se han guardado correctamente y los totales se han recalculado.",
      });
      setEditedData({});
      queryClient.invalidateQueries({ queryKey: ['/api/waste-excel', selectedYear] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudieron guardar los datos",
        variant: "destructive",
      });
    },
  });

  // Helper function to get value for a specific material and month
  const getValue = useCallback((section: string, material: string, monthIndex: number): number => {
    const editKey = `${section}-${material}-${monthIndex}`;
    if (editKey in editedData) {
      return editedData[editKey];
    }
    
    if (!wasteData?.months[monthIndex]) return 0;
    
    const monthData = wasteData.months[monthIndex];
    let entries: any[] = [];
    
    switch (section) {
      case 'recycling':
        entries = monthData.recycling;
        break;
      case 'compost':
        entries = monthData.compost;
        break;
      case 'reuse':
        entries = monthData.reuse;
        break;
      case 'landfill':
        entries = monthData.landfill;
        break;
    }
    
    const entry = entries.find(e => 
      (section === 'recycling' && e.material === material) ||
      (section === 'compost' && e.category === material) ||
      (section === 'reuse' && e.category === material) ||
      (section === 'landfill' && e.wasteType === material)
    );
    
    return entry?.kg || 0;
  }, [wasteData, editedData]);

  // Helper function to calculate row total
  const getRowTotal = useCallback((section: string, material: string): number => {
    let total = 0;
    for (let i = 0; i < 12; i++) {
      total += getValue(section, material, i);
    }
    return total;
  }, [getValue]);

  // Helper function to calculate section totals
  const getSectionTotals = useCallback(() => {
    if (!wasteData) return { recyclingTotal: 0, compostTotal: 0, reuseTotal: 0, landfillTotal: 0 };
    
    let recyclingTotal = 0;
    wasteData.materials.recycling.forEach(material => {
      recyclingTotal += getRowTotal('recycling', material);
    });
    
    let compostTotal = 0;
    wasteData.materials.compost.forEach(category => {
      compostTotal += getRowTotal('compost', category);
    });
    
    let reuseTotal = 0;
    wasteData.materials.reuse.forEach(category => {
      reuseTotal += getRowTotal('reuse', category);
    });
    
    let landfillTotal = 0;
    wasteData.materials.landfill.forEach(wasteType => {
      landfillTotal += getRowTotal('landfill', wasteType);
    });
    
    return { recyclingTotal, compostTotal, reuseTotal, landfillTotal };
  }, [wasteData, getRowTotal]);

  // Calculate KPIs exactly like Excel
  const calculateKPIs = useCallback(() => {
    const totals = getSectionTotals();
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
  }, [getSectionTotals]);

  // Handle cell value change
  const handleCellChange = (section: string, material: string, monthIndex: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const editKey = `${section}-${material}-${monthIndex}`;
    setEditedData(prev => ({
      ...prev,
      [editKey]: numValue >= 0 ? numValue : 0 // Prevent negative values
    }));
  };

  // Save changes
  const handleSave = () => {
    if (!wasteData || Object.keys(editedData).length === 0) return;
    
    const updateData: any = {
      year: selectedYear,
      data: []
    };
    
    // Group changes by month
    wasteData.months.forEach((monthData, monthIndex) => {
      const monthUpdates = {
        monthId: monthData.month.id,
        entries: {
          recycling: [] as { material: string; kg: number }[],
          compost: [] as { category: string; kg: number }[],
          reuse: [] as { category: string; kg: number }[],
          landfill: [] as { wasteType: string; kg: number }[]
        }
      };
      
      // Check for recycling changes
      wasteData.materials.recycling.forEach(material => {
        const editKey = `recycling-${material}-${monthIndex}`;
        if (editKey in editedData) {
          monthUpdates.entries.recycling.push({
            material,
            kg: editedData[editKey]
          });
        }
      });
      
      // Check for compost changes
      wasteData.materials.compost.forEach(category => {
        const editKey = `compost-${category}-${monthIndex}`;
        if (editKey in editedData) {
          monthUpdates.entries.compost.push({
            category,
            kg: editedData[editKey]
          });
        }
      });
      
      // Check for reuse changes
      wasteData.materials.reuse.forEach(category => {
        const editKey = `reuse-${category}-${monthIndex}`;
        if (editKey in editedData) {
          monthUpdates.entries.reuse.push({
            category,
            kg: editedData[editKey]
          });
        }
      });
      
      // Check for landfill changes
      wasteData.materials.landfill.forEach(wasteType => {
        const editKey = `landfill-${wasteType}-${monthIndex}`;
        if (editKey in editedData) {
          monthUpdates.entries.landfill.push({
            wasteType,
            kg: editedData[editKey]
          });
        }
      });
      
      // Only add months with changes
      if (monthUpdates.entries.recycling.length > 0 || 
          monthUpdates.entries.compost.length > 0 || 
          monthUpdates.entries.reuse.length > 0 || 
          monthUpdates.entries.landfill.length > 0) {
        updateData.data.push(monthUpdates);
      }
    });
    
    updateMutation.mutate(updateData);
  };

  // Generate chart data
  const generateChartData = useCallback(() => {
    if (!wasteData) return [];
    
    return MONTH_LABELS.map((monthLabel, index) => {
      let recyclingTotal = 0;
      wasteData.materials.recycling.forEach(material => {
        recyclingTotal += getValue('recycling', material, index);
      });
      
      let compostTotal = 0;
      wasteData.materials.compost.forEach(category => {
        compostTotal += getValue('compost', category, index);
      });
      
      let reuseTotal = 0;
      wasteData.materials.reuse.forEach(category => {
        reuseTotal += getValue('reuse', category, index);
      });
      
      let landfillTotal = 0;
      wasteData.materials.landfill.forEach(wasteType => {
        landfillTotal += getValue('landfill', wasteType, index);
      });
      
      const totalMonth = recyclingTotal + compostTotal + reuseTotal + landfillTotal;
      const circularMonth = recyclingTotal + compostTotal + reuseTotal;
      const monthlyDeviation = totalMonth > 0 ? (circularMonth / totalMonth) * 100 : 0;
      
      return {
        month: monthLabel,
        Reciclaje: recyclingTotal / 1000, // Convert to tons
        Composta: compostTotal / 1000,
        Reuso: reuseTotal / 1000,
        'Relleno sanitario': landfillTotal / 1000,
        deviation: monthlyDeviation
      };
    });
  }, [wasteData, getValue]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos de la tabla...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const kpis = calculateKPIs();
  const chartData = generateChartData();
  const hasChanges = Object.keys(editedData).length > 0;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-[100rem] mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-anton uppercase tracking-wide text-navy">
                  Gestión Detallada de Residuos
                </h1>
                <p className="text-gray-600 mt-1">
                  Réplica exacta de la tabla Excel con cálculos precisos
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Año:</label>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || updateMutation.isPending}
                  className="bg-lime-500 hover:bg-lime-600 text-navy"
                >
                  {updateMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-navy border-t-transparent"></div>
                      Guardando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Actualizar
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Table */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" />
                    Tabla de Residuos {selectedYear}
                    {hasChanges && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        {Object.keys(editedData).length} cambios pendientes
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200 text-xs">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 p-2 text-left font-semibold min-w-[180px]">
                            Materiales
                          </th>
                          {MONTH_LABELS.map((month) => (
                            <th key={month} className="border border-gray-200 p-2 text-center font-semibold w-20">
                              {month}
                            </th>
                          ))}
                          <th className="border border-gray-200 p-2 text-center font-semibold bg-lime-50 w-20">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Recycling Section */}
                        <tr>
                          <td colSpan={14} className="bg-green-100 border border-gray-200 p-2 font-semibold">
                            <button
                              onClick={() => setOpenSections(prev => ({ ...prev, recycling: !prev.recycling }))}
                              className="flex items-center gap-2 hover:bg-green-200 p-1 rounded w-full text-left"
                            >
                              {openSections.recycling ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              <Recycle className="h-4 w-4" />
                              Reciclaje
                            </button>
                          </td>
                        </tr>
                        {openSections.recycling && wasteData?.materials.recycling.map((material) => (
                          <tr key={material}>
                            <td className="border border-gray-200 p-2 font-medium">{material}</td>
                            {MONTH_LABELS.map((_, monthIndex) => (
                              <td key={monthIndex} className="border border-gray-200 p-1">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={getValue('recycling', material, monthIndex) || ''}
                                  onChange={(e) => handleCellChange('recycling', material, monthIndex, e.target.value)}
                                  className="w-full h-8 text-xs text-center border-0 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="0"
                                />
                              </td>
                            ))}
                            <td className="border border-gray-200 p-2 text-center font-semibold bg-lime-50">
                              {getRowTotal('recycling', material).toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        ))}
                        {openSections.recycling && (
                          <tr className="bg-green-50">
                            <td className="border border-gray-200 p-2 font-bold">Total reciclaje</td>
                            {MONTH_LABELS.map((_, monthIndex) => {
                              let monthTotal = 0;
                              wasteData?.materials.recycling.forEach(material => {
                                monthTotal += getValue('recycling', material, monthIndex);
                              });
                              return (
                                <td key={monthIndex} className="border border-gray-200 p-2 text-center font-bold">
                                  {monthTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                                </td>
                              );
                            })}
                            <td className="border border-gray-200 p-2 text-center font-bold">
                              {getSectionTotals().recyclingTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        )}

                        {/* Compost Section */}
                        <tr>
                          <td colSpan={14} className="bg-amber-100 border border-gray-200 p-2 font-semibold">
                            <button
                              onClick={() => setOpenSections(prev => ({ ...prev, compost: !prev.compost }))}
                              className="flex items-center gap-2 hover:bg-amber-200 p-1 rounded w-full text-left"
                            >
                              {openSections.compost ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              <Leaf className="h-4 w-4" />
                              Orgánicos destinados a composta
                            </button>
                          </td>
                        </tr>
                        {openSections.compost && wasteData?.materials.compost.map((category) => (
                          <tr key={category}>
                            <td className="border border-gray-200 p-2 font-medium">{category}</td>
                            {MONTH_LABELS.map((_, monthIndex) => (
                              <td key={monthIndex} className="border border-gray-200 p-1">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={getValue('compost', category, monthIndex) || ''}
                                  onChange={(e) => handleCellChange('compost', category, monthIndex, e.target.value)}
                                  className="w-full h-8 text-xs text-center border-0 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="0"
                                />
                              </td>
                            ))}
                            <td className="border border-gray-200 p-2 text-center font-semibold bg-lime-50">
                              {getRowTotal('compost', category).toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        ))}
                        {openSections.compost && (
                          <tr className="bg-amber-50">
                            <td className="border border-gray-200 p-2 font-bold">Total orgánicos</td>
                            {MONTH_LABELS.map((_, monthIndex) => {
                              let monthTotal = 0;
                              wasteData?.materials.compost.forEach(category => {
                                monthTotal += getValue('compost', category, monthIndex);
                              });
                              return (
                                <td key={monthIndex} className="border border-gray-200 p-2 text-center font-bold">
                                  {monthTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                                </td>
                              );
                            })}
                            <td className="border border-gray-200 p-2 text-center font-bold">
                              {getSectionTotals().compostTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        )}

                        {/* Reuse Section */}
                        <tr>
                          <td colSpan={14} className="bg-blue-100 border border-gray-200 p-2 font-semibold">
                            <button
                              onClick={() => setOpenSections(prev => ({ ...prev, reuse: !prev.reuse }))}
                              className="flex items-center gap-2 hover:bg-blue-200 p-1 rounded w-full text-left"
                            >
                              {openSections.reuse ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              <RotateCcw className="h-4 w-4" />
                              Reuso
                            </button>
                          </td>
                        </tr>
                        {openSections.reuse && wasteData?.materials.reuse.map((category) => (
                          <tr key={category}>
                            <td className="border border-gray-200 p-2 font-medium">{category}</td>
                            {MONTH_LABELS.map((_, monthIndex) => (
                              <td key={monthIndex} className="border border-gray-200 p-1">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={getValue('reuse', category, monthIndex) || ''}
                                  onChange={(e) => handleCellChange('reuse', category, monthIndex, e.target.value)}
                                  className="w-full h-8 text-xs text-center border-0 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="0"
                                />
                              </td>
                            ))}
                            <td className="border border-gray-200 p-2 text-center font-semibold bg-lime-50">
                              {getRowTotal('reuse', category).toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        ))}
                        {openSections.reuse && (
                          <tr className="bg-blue-50">
                            <td className="border border-gray-200 p-2 font-bold">Total reuso</td>
                            {MONTH_LABELS.map((_, monthIndex) => {
                              let monthTotal = 0;
                              wasteData?.materials.reuse.forEach(category => {
                                monthTotal += getValue('reuse', category, monthIndex);
                              });
                              return (
                                <td key={monthIndex} className="border border-gray-200 p-2 text-center font-bold">
                                  {monthTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                                </td>
                              );
                            })}
                            <td className="border border-gray-200 p-2 text-center font-bold">
                              {getSectionTotals().reuseTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        )}

                        {/* Landfill Section */}
                        <tr>
                          <td colSpan={14} className="bg-red-100 border border-gray-200 p-2 font-semibold">
                            <button
                              onClick={() => setOpenSections(prev => ({ ...prev, landfill: !prev.landfill }))}
                              className="flex items-center gap-2 hover:bg-red-200 p-1 rounded w-full text-left"
                            >
                              {openSections.landfill ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              <Trash2 className="h-4 w-4" />
                              No desvío (Relleno sanitario)
                            </button>
                          </td>
                        </tr>
                        {openSections.landfill && wasteData?.materials.landfill.map((wasteType) => (
                          <tr key={wasteType}>
                            <td className="border border-gray-200 p-2 font-medium">{wasteType}</td>
                            {MONTH_LABELS.map((_, monthIndex) => (
                              <td key={monthIndex} className="border border-gray-200 p-1">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={getValue('landfill', wasteType, monthIndex) || ''}
                                  onChange={(e) => handleCellChange('landfill', wasteType, monthIndex, e.target.value)}
                                  className="w-full h-8 text-xs text-center border-0 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="0"
                                />
                              </td>
                            ))}
                            <td className="border border-gray-200 p-2 text-center font-semibold bg-lime-50">
                              {getRowTotal('landfill', wasteType).toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        ))}
                        {openSections.landfill && (
                          <tr className="bg-red-50">
                            <td className="border border-gray-200 p-2 font-bold">Total Relleno sanitario</td>
                            {MONTH_LABELS.map((_, monthIndex) => {
                              let monthTotal = 0;
                              wasteData?.materials.landfill.forEach(wasteType => {
                                monthTotal += getValue('landfill', wasteType, monthIndex);
                              });
                              return (
                                <td key={monthIndex} className="border border-gray-200 p-2 text-center font-bold">
                                  {monthTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                                </td>
                              );
                            })}
                            <td className="border border-gray-200 p-2 text-center font-bold">
                              {getSectionTotals().landfillTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        )}

                        {/* Grand Totals */}
                        <tr className="bg-gray-100 border-t-4 border-gray-300">
                          <td className="border border-gray-200 p-3 font-bold text-lg">TOTALES FINALES</td>
                          <td colSpan={12} className="border border-gray-200"></td>
                          <td className="border border-gray-200 p-3 text-center font-bold text-lg">
                            {(kpis.totalCircular + kpis.totalLandfill).toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                          </td>
                        </tr>
                        <tr className="bg-lime-100">
                          <td className="border border-gray-200 p-2 font-bold">Total Circular:</td>
                          <td colSpan={12} className="border border-gray-200"></td>
                          <td className="border border-gray-200 p-2 text-center font-bold text-green-800">
                            {kpis.totalCircular.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                          </td>
                        </tr>
                        <tr className="bg-red-100">
                          <td className="border border-gray-200 p-2 font-bold">Total relleno sanitario:</td>
                          <td colSpan={12} className="border border-gray-200"></td>
                          <td className="border border-gray-200 p-2 text-center font-bold text-red-800">
                            {kpis.totalLandfill.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                          </td>
                        </tr>
                        <tr className="bg-blue-100">
                          <td className="border border-gray-200 p-2 font-bold">Pesos totales:</td>
                          <td colSpan={12} className="border border-gray-200"></td>
                          <td className="border border-gray-200 p-2 text-center font-bold text-blue-800">
                            {kpis.totalWeight.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                          </td>
                        </tr>
                        <tr className={`${kpis.deviationPercentage >= 70 ? 'bg-green-100' : kpis.deviationPercentage >= 50 ? 'bg-amber-100' : 'bg-red-100'}`}>
                          <td className="border border-gray-200 p-3 font-bold text-lg">% de Desviación:</td>
                          <td colSpan={12} className="border border-gray-200"></td>
                          <td className={`border border-gray-200 p-3 text-center font-bold text-2xl ${
                            kpis.deviationPercentage >= 70 ? 'text-green-800' : 
                            kpis.deviationPercentage >= 50 ? 'text-amber-800' : 'text-red-800'
                          }`}>
                            {kpis.deviationPercentage.toFixed(1)}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* KPIs Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Indicadores Clave</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-800">
                      {kpis.totalCircular.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                    </div>
                    <div className="text-sm text-green-600">Total Circular (kg)</div>
                  </div>
                  
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-800">
                      {kpis.totalLandfill.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                    </div>
                    <div className="text-sm text-red-600">Total relleno sanitario (kg)</div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">
                      {kpis.totalWeight.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                    </div>
                    <div className="text-sm text-blue-600">Pesos totales (kg)</div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${
                    kpis.deviationPercentage >= 70 ? 'bg-green-50' : 
                    kpis.deviationPercentage >= 50 ? 'bg-amber-50' : 'bg-red-50'
                  }`}>
                    <div className={`text-3xl font-bold ${
                      kpis.deviationPercentage >= 70 ? 'text-green-800' : 
                      kpis.deviationPercentage >= 50 ? 'text-amber-800' : 'text-red-800'
                    }`}>
                      {kpis.deviationPercentage.toFixed(1)}%
                    </div>
                    <div className={`text-sm ${
                      kpis.deviationPercentage >= 70 ? 'text-green-600' : 
                      kpis.deviationPercentage >= 50 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      % de Desviación
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Charts Section */}
            <div className="lg:col-span-4 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stacked Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart2 className="h-5 w-5" />
                      Generación Mensual por Categoría
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis label={{ value: 'Toneladas', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value: any) => [`${value} ton`, '']} />
                          <Legend />
                          <Bar dataKey="Reciclaje" stackId="circular" fill="#22c55e" />
                          <Bar dataKey="Composta" stackId="circular" fill="#f59e0b" />
                          <Bar dataKey="Reuso" stackId="circular" fill="#3b82f6" />
                          <Bar dataKey="Relleno sanitario" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Deviation Line Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      % Desviación Mensual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                          <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, '% Desviación']} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="deviation" 
                            stroke="#8884d8" 
                            strokeWidth={3}
                            dot={{ r: 6 }}
                            name="% Desviación"
                          />
                          {/* Target line at 70% */}
                          <Line 
                            type="monotone" 
                            dataKey={() => 70}
                            stroke="#22c55e" 
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            dot={false}
                            name="Meta 70%"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Circular Total</p>
                    <p className="text-2xl font-bold">
                      {(kpis.totalCircular / 1000).toFixed(1)} ton
                    </p>
                  </div>
                  <Recycle className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100">Relleno Sanitario</p>
                    <p className="text-2xl font-bold">
                      {(kpis.totalLandfill / 1000).toFixed(1)} ton
                    </p>
                  </div>
                  <Trash2 className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Generado</p>
                    <p className="text-2xl font-bold">
                      {(kpis.totalWeight / 1000).toFixed(1)} ton
                    </p>
                  </div>
                  <BarChart2 className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-r ${
              kpis.deviationPercentage >= 70 ? 'from-green-500 to-green-600' : 
              kpis.deviationPercentage >= 50 ? 'from-amber-500 to-amber-600' : 'from-red-500 to-red-600'
            } text-white`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${
                      kpis.deviationPercentage >= 70 ? 'text-green-100' : 
                      kpis.deviationPercentage >= 50 ? 'text-amber-100' : 'text-red-100'
                    }`}>% Desviación</p>
                    <p className="text-3xl font-bold">
                      {kpis.deviationPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className={`h-8 w-8 ${
                    kpis.deviationPercentage >= 70 ? 'text-green-200' : 
                    kpis.deviationPercentage >= 50 ? 'text-amber-200' : 'text-red-200'
                  }`} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}