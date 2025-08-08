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
  Trash2,
  Calculator,
  ArrowRight,
  Target,
  CheckCircle
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
                  Trazabilidad Residuos
                </h1>
                <p className="text-gray-600 mt-1">
                  Sistema integral de seguimiento y trazabilidad de residuos
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
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="p-3 text-left font-semibold text-gray-700 min-w-[180px]">
                            Materiales
                          </th>
                          {MONTH_LABELS.map((month) => (
                            <th key={month} className="p-3 text-center font-semibold text-gray-700 w-20">
                              {month}
                            </th>
                          ))}
                          <th className="p-3 text-center font-semibold text-navy bg-gray-50 w-20">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Recycling Section */}
                        <tr className="border-t border-gray-100">
                          <td colSpan={14} className="bg-emerald-50 p-3">
                            <button
                              onClick={() => setOpenSections(prev => ({ ...prev, recycling: !prev.recycling }))}
                              className="flex items-center gap-3 hover:text-emerald-700 transition-colors w-full text-left"
                            >
                              {openSections.recycling ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                              <Recycle className="h-5 w-5 text-emerald-600" />
                              <span className="font-semibold text-gray-800">Reciclaje</span>
                            </button>
                          </td>
                        </tr>
                        {openSections.recycling && wasteData?.materials.recycling.map((material) => (
                          <tr key={material} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3 font-medium text-gray-700 border-b border-gray-100">{material}</td>
                            {MONTH_LABELS.map((_, monthIndex) => (
                              <td key={monthIndex} className="p-2 border-b border-gray-100">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={getValue('recycling', material, monthIndex) || ''}
                                  onChange={(e) => handleCellChange('recycling', material, monthIndex, e.target.value)}
                                  className="w-full h-8 text-sm text-center bg-white border border-gray-200 rounded px-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  placeholder="0"
                                />
                              </td>
                            ))}
                            <td className="p-3 text-center font-semibold text-gray-800 bg-gray-50 border-b border-gray-100">
                              {getRowTotal('recycling', material).toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        ))}
                        {openSections.recycling && (
                          <tr className="bg-emerald-50">
                            <td className="p-3 font-bold text-emerald-800 border-b border-emerald-200">Total reciclaje</td>
                            {MONTH_LABELS.map((_, monthIndex) => {
                              let monthTotal = 0;
                              wasteData?.materials.recycling.forEach(material => {
                                monthTotal += getValue('recycling', material, monthIndex);
                              });
                              return (
                                <td key={monthIndex} className="p-3 text-center font-bold text-emerald-800 border-b border-emerald-200">
                                  {monthTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                                </td>
                              );
                            })}
                            <td className="p-3 text-center font-bold text-emerald-800 bg-emerald-100 border-b border-emerald-200">
                              {getSectionTotals().recyclingTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        )}

                        {/* Compost Section */}
                        <tr className="border-t border-gray-100">
                          <td colSpan={14} className="bg-amber-50 p-3">
                            <button
                              onClick={() => setOpenSections(prev => ({ ...prev, compost: !prev.compost }))}
                              className="flex items-center gap-3 hover:text-amber-700 transition-colors w-full text-left"
                            >
                              {openSections.compost ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                              <Leaf className="h-5 w-5 text-amber-600" />
                              <span className="font-semibold text-gray-800">Orgánicos destinados a composta</span>
                            </button>
                          </td>
                        </tr>
                        {openSections.compost && wasteData?.materials.compost.map((category) => (
                          <tr key={category} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3 font-medium text-gray-700 border-b border-gray-100">{category}</td>
                            {MONTH_LABELS.map((_, monthIndex) => (
                              <td key={monthIndex} className="p-2 border-b border-gray-100">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={getValue('compost', category, monthIndex) || ''}
                                  onChange={(e) => handleCellChange('compost', category, monthIndex, e.target.value)}
                                  className="w-full h-8 text-sm text-center bg-white border border-gray-200 rounded px-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                  placeholder="0"
                                />
                              </td>
                            ))}
                            <td className="p-3 text-center font-semibold text-gray-800 bg-gray-50 border-b border-gray-100">
                              {getRowTotal('compost', category).toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        ))}
                        {openSections.compost && (
                          <tr className="bg-amber-50">
                            <td className="p-3 font-bold text-amber-800 border-b border-amber-200">Total orgánicos</td>
                            {MONTH_LABELS.map((_, monthIndex) => {
                              let monthTotal = 0;
                              wasteData?.materials.compost.forEach(category => {
                                monthTotal += getValue('compost', category, monthIndex);
                              });
                              return (
                                <td key={monthIndex} className="p-3 text-center font-bold text-amber-800 border-b border-amber-200">
                                  {monthTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                                </td>
                              );
                            })}
                            <td className="p-3 text-center font-bold text-amber-800 bg-amber-100 border-b border-amber-200">
                              {getSectionTotals().compostTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        )}

                        {/* Reuse Section */}
                        <tr className="border-t border-gray-100">
                          <td colSpan={14} className="bg-blue-50 p-3">
                            <button
                              onClick={() => setOpenSections(prev => ({ ...prev, reuse: !prev.reuse }))}
                              className="flex items-center gap-3 hover:text-blue-700 transition-colors w-full text-left"
                            >
                              {openSections.reuse ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                              <RotateCcw className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold text-gray-800">Reuso</span>
                            </button>
                          </td>
                        </tr>
                        {openSections.reuse && wasteData?.materials.reuse.map((category) => (
                          <tr key={category} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3 font-medium text-gray-700 border-b border-gray-100">{category}</td>
                            {MONTH_LABELS.map((_, monthIndex) => (
                              <td key={monthIndex} className="p-2 border-b border-gray-100">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={getValue('reuse', category, monthIndex) || ''}
                                  onChange={(e) => handleCellChange('reuse', category, monthIndex, e.target.value)}
                                  className="w-full h-8 text-sm text-center bg-white border border-gray-200 rounded px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="0"
                                />
                              </td>
                            ))}
                            <td className="p-3 text-center font-semibold text-gray-800 bg-gray-50 border-b border-gray-100">
                              {getRowTotal('reuse', category).toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        ))}
                        {openSections.reuse && (
                          <tr className="bg-blue-50">
                            <td className="p-3 font-bold text-blue-800 border-b border-blue-200">Total reuso</td>
                            {MONTH_LABELS.map((_, monthIndex) => {
                              let monthTotal = 0;
                              wasteData?.materials.reuse.forEach(category => {
                                monthTotal += getValue('reuse', category, monthIndex);
                              });
                              return (
                                <td key={monthIndex} className="p-3 text-center font-bold text-blue-800 border-b border-blue-200">
                                  {monthTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                                </td>
                              );
                            })}
                            <td className="p-3 text-center font-bold text-blue-800 bg-blue-100 border-b border-blue-200">
                              {getSectionTotals().reuseTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        )}

                        {/* Landfill Section */}
                        <tr className="border-t border-gray-100">
                          <td colSpan={14} className="bg-red-50 p-3">
                            <button
                              onClick={() => setOpenSections(prev => ({ ...prev, landfill: !prev.landfill }))}
                              className="flex items-center gap-3 hover:text-red-700 transition-colors w-full text-left"
                            >
                              {openSections.landfill ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                              <Trash2 className="h-5 w-5 text-red-600" />
                              <span className="font-semibold text-gray-800">No desvío (Relleno sanitario)</span>
                            </button>
                          </td>
                        </tr>
                        {openSections.landfill && wasteData?.materials.landfill.map((wasteType) => (
                          <tr key={wasteType} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3 font-medium text-gray-700 border-b border-gray-100">{wasteType}</td>
                            {MONTH_LABELS.map((_, monthIndex) => (
                              <td key={monthIndex} className="p-2 border-b border-gray-100">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={getValue('landfill', wasteType, monthIndex) || ''}
                                  onChange={(e) => handleCellChange('landfill', wasteType, monthIndex, e.target.value)}
                                  className="w-full h-8 text-sm text-center bg-white border border-gray-200 rounded px-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                  placeholder="0"
                                />
                              </td>
                            ))}
                            <td className="p-3 text-center font-semibold text-gray-800 bg-gray-50 border-b border-gray-100">
                              {getRowTotal('landfill', wasteType).toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        ))}
                        {openSections.landfill && (
                          <tr className="bg-red-50">
                            <td className="p-3 font-bold text-red-800 border-b border-red-200">Total Relleno sanitario</td>
                            {MONTH_LABELS.map((_, monthIndex) => {
                              let monthTotal = 0;
                              wasteData?.materials.landfill.forEach(wasteType => {
                                monthTotal += getValue('landfill', wasteType, monthIndex);
                              });
                              return (
                                <td key={monthIndex} className="p-3 text-center font-bold text-red-800 border-b border-red-200">
                                  {monthTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                                </td>
                              );
                            })}
                            <td className="p-3 text-center font-bold text-red-800 bg-red-100 border-b border-red-200">
                              {getSectionTotals().landfillTotal.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                            </td>
                          </tr>
                        )}

                        {/* Grand Totals */}
                        <tr className="border-t-4 border-navy">
                          <td className="p-4 font-bold text-lg text-navy bg-gray-50">TOTALES FINALES</td>
                          <td colSpan={12} className="bg-gray-50"></td>
                          <td className="p-4 text-center font-bold text-lg text-navy bg-gray-100">
                            {(kpis.totalCircular + kpis.totalLandfill).toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                          </td>
                        </tr>
                        <tr className="bg-emerald-50">
                          <td className="p-3 font-bold text-emerald-800">Total Circular</td>
                          <td colSpan={12}></td>
                          <td className="p-3 text-center font-bold text-emerald-800 bg-emerald-100">
                            {kpis.totalCircular.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                          </td>
                        </tr>
                        <tr className="bg-red-50">
                          <td className="p-3 font-bold text-red-800">Total relleno sanitario</td>
                          <td colSpan={12}></td>
                          <td className="p-3 text-center font-bold text-red-800 bg-red-100">
                            {kpis.totalLandfill.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                          </td>
                        </tr>
                        <tr className="bg-blue-50">
                          <td className="p-3 font-bold text-blue-800">Pesos totales</td>
                          <td colSpan={12}></td>
                          <td className="p-3 text-center font-bold text-blue-800 bg-blue-100">
                            {kpis.totalWeight.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                          </td>
                        </tr>
                        {/* Formula explanation - Enhanced Visual Design */}
                        <tr>
                          <td colSpan={14} className="p-0">
                            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 border-t-2 border-indigo-200">
                              <div className="max-w-5xl mx-auto">
                                {/* Header */}
                                <div className="text-center mb-6">
                                  <div className="flex items-center justify-center gap-3 mb-2">
                                    <div className="p-2 bg-indigo-600 rounded-full">
                                      <Calculator className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-indigo-900">Metodología de Cálculo Certificada</h3>
                                    <div className="p-2 bg-green-600 rounded-full">
                                      <CheckCircle className="h-5 w-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-indigo-700">Certificación TRUE Zero Waste - Estándar Internacional</p>
                                </div>

                                {/* Visual Formula Flow */}
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center mb-6">
                                  {/* Step 1: Total Circular */}
                                  <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200 transform hover:scale-105 transition-transform">
                                    <div className="text-center">
                                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Recycle className="h-6 w-6 text-green-600" />
                                      </div>
                                      <div className="text-xs text-gray-600 mb-1">Total Circular</div>
                                      <div className="text-lg font-bold text-green-700">
                                        {kpis.totalCircular.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                                      </div>
                                      <div className="text-xs text-gray-500">kg</div>
                                    </div>
                                  </div>

                                  {/* Arrow 1 */}
                                  <div className="flex justify-center">
                                    <div className="text-indigo-600">
                                      <ArrowRight className="h-6 w-6" />
                                    </div>
                                  </div>

                                  {/* Step 2: Division Symbol & Total Residuos */}
                                  <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200 transform hover:scale-105 transition-transform">
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-blue-600 mb-1">÷</div>
                                      <div className="text-xs text-gray-600 mb-1">Total Residuos</div>
                                      <div className="text-lg font-bold text-blue-700">
                                        {kpis.totalWeight.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                                      </div>
                                      <div className="text-xs text-gray-500">kg</div>
                                    </div>
                                  </div>

                                  {/* Arrow 2 */}
                                  <div className="flex justify-center">
                                    <div className="text-indigo-600">
                                      <ArrowRight className="h-6 w-6" />
                                    </div>
                                  </div>

                                  {/* Step 3: Result */}
                                  <div className={`bg-white rounded-xl p-4 shadow-lg border-2 transform hover:scale-105 transition-transform ${
                                    kpis.deviationPercentage >= 70 ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' : 
                                    kpis.deviationPercentage >= 50 ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50' : 
                                    'border-red-300 bg-gradient-to-br from-red-50 to-pink-50'
                                  }`}>
                                    <div className="text-center">
                                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                                        kpis.deviationPercentage >= 70 ? 'bg-green-100' : 
                                        kpis.deviationPercentage >= 50 ? 'bg-amber-100' : 'bg-red-100'
                                      }`}>
                                        <Target className={`h-6 w-6 ${
                                          kpis.deviationPercentage >= 70 ? 'text-green-600' : 
                                          kpis.deviationPercentage >= 50 ? 'text-amber-600' : 'text-red-600'
                                        }`} />
                                      </div>
                                      <div className="text-xs text-gray-600 mb-1">% Desviación</div>
                                      <div className={`text-2xl font-bold ${
                                        kpis.deviationPercentage >= 70 ? 'text-green-700' : 
                                        kpis.deviationPercentage >= 50 ? 'text-amber-700' : 'text-red-700'
                                      }`}>
                                        {kpis.deviationPercentage.toFixed(1)}%
                                      </div>
                                      <div className={`text-xs font-medium ${
                                        kpis.deviationPercentage >= 70 ? 'text-green-600' : 
                                        kpis.deviationPercentage >= 50 ? 'text-amber-600' : 'text-red-600'
                                      }`}>
                                        {kpis.deviationPercentage >= 70 ? 'Excelente' : 
                                         kpis.deviationPercentage >= 50 ? 'Bueno' : 'Mejorable'}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Mathematical Formula Display */}
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                                  <div className="text-center">
                                    <div className="text-sm text-gray-600 mb-2">Fórmula matemática:</div>
                                    <div className="font-mono text-lg text-indigo-800 bg-indigo-50 rounded-lg p-3 inline-block">
                                      % = (Total Circular ÷ Total Residuos) × 100
                                    </div>
                                  </div>
                                  <div className="mt-3 text-center">
                                    <div className="text-sm text-gray-600">Aplicando los valores actuales:</div>
                                    <div className="font-mono text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mt-2">
                                      ({kpis.totalCircular.toLocaleString('es-ES', { maximumFractionDigits: 1 })} ÷ {kpis.totalWeight.toLocaleString('es-ES', { maximumFractionDigits: 1 })}) × 100 = <span className="font-bold text-indigo-700">{kpis.deviationPercentage.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Certification Badge */}
                                <div className="text-center mt-4">
                                  <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                                    <CheckCircle className="h-4 w-4" />
                                    Metodología Certificada TRUE Zero Waste
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr className={`${
                          kpis.deviationPercentage >= 70 ? 'bg-emerald-50' : 
                          kpis.deviationPercentage >= 50 ? 'bg-amber-50' : 'bg-red-50'
                        }`}>
                          <td className="p-4 font-bold text-xl text-navy">Resultado Final</td>
                          <td colSpan={12} className="text-center">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                              kpis.deviationPercentage >= 70 ? 'bg-emerald-100 text-emerald-800' : 
                              kpis.deviationPercentage >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              <CheckCircle className="h-4 w-4" />
                              {kpis.deviationPercentage >= 70 ? 'Certificación TRUE Zero Waste Alcanzada' : 
                               kpis.deviationPercentage >= 50 ? 'En Progreso hacia Certificación' : 'Requiere Mejoras para Certificación'}
                            </div>
                          </td>
                          <td className={`p-4 text-center font-bold text-3xl ${
                            kpis.deviationPercentage >= 70 ? 'text-emerald-800 bg-emerald-200' : 
                            kpis.deviationPercentage >= 50 ? 'text-amber-800 bg-amber-200' : 'text-red-800 bg-red-200'
                          } rounded-lg`}>
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