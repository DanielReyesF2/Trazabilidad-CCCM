import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generateTrueMonthPdfReport } from '@/lib/trueMonthReportPdf';
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
  CheckCircle,
  AlertCircle,
  Download,
  Loader2
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

// TRUE Year labels (Oct 2024 - Sep 2025) - Período de certificación TRUE
const TRUE_MONTH_LABELS = [
  'Oct 24', 'Nov 24', 'Dic 24', 
  'Ene 25', 'Feb 25', 'Mar 25', 'Abr 25', 'May 25', 'Jun 25', 'Jul 25', 'Ago 25', 'Sep 25'
];

export default function ResiduosExcel() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [isTrueMode, setIsTrueMode] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
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
    enabled: !isTrueMode
  });

  // Fetch TRUE Year data directly from API (Oct 2024 - Sep 2025)
  const { data: trueYearData, isLoading: isLoadingTrueYear } = useQuery<{
    period: string;
    months: MonthData[];
    totals: {
      totalRecycling: number;
      totalCompost: number;
      totalReuse: number;
      totalLandfill: number;
      totalDiverted: number;
      totalGenerated: number;
      diversionRate: number;
    };
    materials: {
      recycling: string[];
      compost: string[];
      reuse: string[];
      landfill: string[];
    };
  }>({
    queryKey: ['/api/waste-excel/true-year'],
    queryFn: async () => {
      const response = await fetch('/api/waste-excel/true-year');
      if (!response.ok) throw new Error('Failed to fetch TRUE year data');
      return response.json();
    },
    refetchOnWindowFocus: false,
    enabled: isTrueMode
  });

  // Transform TRUE Year data to match WasteExcelData format
  const trueDataTransformed = useMemo(() => {
    if (!isTrueMode || !trueYearData) return null;
    
    return {
      year: 'TRUE' as any,
      months: trueYearData.months.map(m => ({
        month: m.month,
        recycling: m.recycling,
        compost: m.compost,
        reuse: m.reuse,
        landfill: m.landfill
      })),
      materials: trueYearData.materials
    };
  }, [isTrueMode, trueYearData]);

  // Determine which data to use
  const currentData = isTrueMode ? trueDataTransformed : wasteData;
  const currentIsLoading = isTrueMode ? isLoadingTrueYear : isLoading;

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const response = await fetch('/api/waste-excel/batch-update', {
        method: 'POST',
        body: JSON.stringify({
          editedData: updateData,
          year: selectedYear
        }),
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
    
    if (!currentData?.months[monthIndex]) return 0;
    
    const monthData = currentData.months[monthIndex];
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
  }, [currentData, editedData]);

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
    if (!currentData) return { recyclingTotal: 0, compostTotal: 0, reuseTotal: 0, landfillTotal: 0 };
    
    let recyclingTotal = 0;
    currentData.materials.recycling.forEach(material => {
      recyclingTotal += getRowTotal('recycling', material);
    });
    
    let compostTotal = 0;
    currentData.materials.compost.forEach(category => {
      compostTotal += getRowTotal('compost', category);
    });
    
    let reuseTotal = 0;
    currentData.materials.reuse.forEach(category => {
      reuseTotal += getRowTotal('reuse', category);
    });
    
    let landfillTotal = 0;
    currentData.materials.landfill.forEach(wasteType => {
      landfillTotal += getRowTotal('landfill', wasteType);
    });
    
    return { recyclingTotal, compostTotal, reuseTotal, landfillTotal };
  }, [currentData, getRowTotal]);

  // Helper function to get total for a section in a specific month
  const getSectionTotal = useCallback((section: 'recycling' | 'compost' | 'reuse' | 'landfill', monthIndex: number): number => {
    if (!wasteData || monthIndex >= wasteData.months.length) return 0;
    
    const materials = wasteData.materials[section] || [];
    return materials.reduce((total, item) => total + getValue(section, item, monthIndex), 0);
  }, [wasteData, getValue]);

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

  // Generate Premium 3-Page PDF Report (Lead Product Designer approach)
  const generatePremiumPDF = () => {
    if (!currentData) return;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 18; // Professional margins as per guidelines
    const kpis = calculateKPIs();
    const totals = getSectionTotals();

    // Get current month (up to which month to show data)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-indexed (0 = January, 7 = August)
    const currentMonthName = MONTH_LABELS[currentMonth];
    const monthsToShow = currentMonth + 1; // +1 because months are 0-indexed

    // PAGE 1: Premium Cover + Executive Summary Dashboard
    const addPage1CoverAndExecutive = () => {
      // Premium header with gradient effect simulation
      pdf.setFillColor(39, 57, 73); // Navy
      pdf.rect(0, 0, pageWidth, 65, 'F');
      
      // Lime accent stripe
      pdf.setFillColor(181, 233, 81); // Lime  
      pdf.rect(0, 60, pageWidth, 8, 'F');
      
      // ECONOVA + Client logos section
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(255, 255, 255);
      pdf.text('ECONOVA', margin + 5, 30, { align: 'left' });
      pdf.setFontSize(12);
      pdf.text('CCCM', pageWidth - margin - 5, 30, { align: 'right' });
      
      // Report title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(39, 57, 73);
      pdf.text('REPORTE DE TRAZABILIDAD DE RESIDUOS', pageWidth / 2, 85, { align: 'center' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(`Período: Enero - ${currentMonthName} ${selectedYear}`, pageWidth / 2, 95, { align: 'center' });
      
      let yPos = 115;
      
      // DASHBOARD KPIs - 2x2 grid layout
      const kpiWidth = 85;
      const kpiHeight = 40;
      const kpiSpacing = 10;
      const gridStartX = (pageWidth - (2 * kpiWidth + kpiSpacing)) / 2;
      
      // KPI 1: Total Circular (Green - Success)
      pdf.setFillColor(76, 175, 80, 0.1); // Light green background
      pdf.roundedRect(gridStartX, yPos, kpiWidth, kpiHeight, 5, 5, 'F');
      pdf.setDrawColor(76, 175, 80);
      pdf.setLineWidth(2);
      pdf.roundedRect(gridStartX, yPos, kpiWidth, kpiHeight, 5, 5, 'D');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(76, 175, 80);
      pdf.text(`${(kpis.totalCircular / 1000).toFixed(1)}`, gridStartX + kpiWidth/2, yPos + 18, { align: 'center' });
      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      pdf.text('TON. CIRCULARES', gridStartX + kpiWidth/2, yPos + 28, { align: 'center' });
      pdf.text('(Reciclaje + Compost + Reuso)', gridStartX + kpiWidth/2, yPos + 35, { align: 'center' });
      
      // KPI 2: Total a Relleno (Red - Warning)  
      const kpi2X = gridStartX + kpiWidth + kpiSpacing;
      pdf.setFillColor(244, 67, 54, 0.1); // Light red background
      pdf.roundedRect(kpi2X, yPos, kpiWidth, kpiHeight, 5, 5, 'F');
      pdf.setDrawColor(244, 67, 54);
      pdf.roundedRect(kpi2X, yPos, kpiWidth, kpiHeight, 5, 5, 'D');
      
      pdf.setFontSize(20);
      pdf.setTextColor(244, 67, 54);
      pdf.text(`${(kpis.totalLandfill / 1000).toFixed(1)}`, kpi2X + kpiWidth/2, yPos + 18, { align: 'center' });
      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      pdf.text('TON. RELLENO SANITARIO', kpi2X + kpiWidth/2, yPos + 28, { align: 'center' });
      pdf.text('(Objetivo: minimizar)', kpi2X + kpiWidth/2, yPos + 35, { align: 'center' });
      
      yPos += kpiHeight + kpiSpacing;
      
      // KPI 3: Total Generado (Navy - Info)
      pdf.setFillColor(39, 57, 73, 0.1); // Light navy background
      pdf.roundedRect(gridStartX, yPos, kpiWidth, kpiHeight, 5, 5, 'F');
      pdf.setDrawColor(39, 57, 73);
      pdf.roundedRect(gridStartX, yPos, kpiWidth, kpiHeight, 5, 5, 'D');
      
      pdf.setFontSize(20);
      pdf.setTextColor(39, 57, 73);
      pdf.text(`${(kpis.totalWeight / 1000).toFixed(1)}`, gridStartX + kpiWidth/2, yPos + 18, { align: 'center' });
      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      pdf.text('TON. GENERADAS TOTAL', gridStartX + kpiWidth/2, yPos + 28, { align: 'center' });
      pdf.text('(Base de cálculo)', gridStartX + kpiWidth/2, yPos + 35, { align: 'center' });
      
      // KPI 4: % Desviación (Dynamic color based on performance)
      const deviationColor: [number, number, number] = kpis.deviationPercentage >= 70 ? [76, 175, 80] : 
                            kpis.deviationPercentage >= 50 ? [255, 193, 7] : [244, 67, 54];
      
      pdf.setFillColor(deviationColor[0], deviationColor[1], deviationColor[2], 0.1);
      pdf.roundedRect(kpi2X, yPos, kpiWidth, kpiHeight, 5, 5, 'F');
      pdf.setDrawColor(...deviationColor);
      pdf.roundedRect(kpi2X, yPos, kpiWidth, kpiHeight, 5, 5, 'D');
      
      pdf.setFontSize(20);
      pdf.setTextColor(...deviationColor);
      pdf.text(`${kpis.deviationPercentage.toFixed(1)}%`, kpi2X + kpiWidth/2, yPos + 18, { align: 'center' });
      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      pdf.text('ÍNDICE DESVIACIÓN', kpi2X + kpiWidth/2, yPos + 28, { align: 'center' });
      const statusText = kpis.deviationPercentage >= 70 ? 'Excelente' : kpis.deviationPercentage >= 50 ? 'Bueno' : 'Mejorar';
      pdf.text(`(Estado: ${statusText})`, kpi2X + kpiWidth/2, yPos + 35, { align: 'center' });
      
      yPos += kpiHeight + 20;
      
      // Executive interpretation text (concise)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(39, 57, 73);
      pdf.text('INTERPRETACIÓN Y OBJETIVO', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 15;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      
      const interpretation = [
        `Durante ${currentMonthName} ${selectedYear}, se generaron ${(kpis.totalWeight / 1000).toFixed(1)} toneladas de residuos,`,
        `logrando desviar ${kpis.deviationPercentage.toFixed(1)}% hacia economía circular.`,
        '',
        `Meta certificación TRUE Zero Waste: >75% desviación de relleno sanitario.`,
        `Estado actual: ${statusText.toLowerCase()}. Impacto ambiental: ${Math.round(kpis.totalCircular * 0.017)} árboles salvados.`
      ];
      
      interpretation.forEach(line => {
        pdf.text(line, pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
      });
    };

    // PAGE 2: Data & Charts (Stylized tables + Clear visualizations)
    const addPage2DataAndCharts = () => {
      // Page header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(39, 57, 73);
      pdf.text('DATOS Y GRÁFICOS', pageWidth / 2, 25, { align: 'center' });
      
      // Separator line
      pdf.setDrawColor(181, 233, 81);
      pdf.setLineWidth(2);
      pdf.line(margin, 35, pageWidth - margin, 35);
      
      let yPos = 50;
      
      // LEFT COLUMN: Consolidated Annual Totals Table
      const colWidth = 85;
      
      // Table title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(39, 57, 73);
      pdf.text('TOTALES CONSOLIDADOS 2025', margin, yPos);
      
      yPos += 15;
      
      // Stylized table
      const tableData = [
        { category: 'Reciclables', value: totals.recyclingTotal, color: [76, 175, 80] as [number, number, number] },
        { category: 'Compostables', value: totals.compostTotal, color: [255, 193, 7] as [number, number, number] },
        { category: 'Reuso', value: totals.reuseTotal, color: [33, 150, 243] as [number, number, number] },
        { category: 'Relleno Sanitario', value: totals.landfillTotal, color: [244, 67, 54] as [number, number, number] }
      ];
      
      tableData.forEach(row => {
        // Category row with color accent
        pdf.setFillColor(240, 240, 240);
        pdf.roundedRect(margin, yPos - 5, colWidth, 12, 2, 2, 'F');
        
        // Color accent bar
        pdf.setFillColor(...row.color);
        pdf.rect(margin, yPos - 5, 4, 12, 'F');
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(row.category, margin + 8, yPos + 2);
        
        // Value
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${(row.value / 1000).toFixed(2)} ton`, margin + colWidth - 5, yPos + 2, { align: 'right' });
        
        yPos += 18;
      });
      
      // Total row
      pdf.setFillColor(39, 57, 73, 0.1);
      pdf.roundedRect(margin, yPos - 5, colWidth, 15, 2, 2, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(39, 57, 73);
      pdf.text('TOTAL GENERADO', margin + 8, yPos + 3);
      pdf.text(`${(kpis.totalWeight / 1000).toFixed(2)} ton`, margin + colWidth - 5, yPos + 3, { align: 'right' });
      
      // RIGHT COLUMN: Distribution Pie Chart (simplified as bars)
      const chartStartX = margin + colWidth + 15;
      const chartWidth = pageWidth - chartStartX - margin;
      
      yPos = 65; // Reset for right column
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(39, 57, 73);
      pdf.text('DISTRIBUCIÓN POR CATEGORÍA', chartStartX, yPos);
      
      yPos += 20;
      
      // Horizontal bars showing distribution
      tableData.forEach(row => {
        const percentage = kpis.totalWeight > 0 ? (row.value / kpis.totalWeight) * 100 : 0;
        const barWidth = (percentage / 100) * (chartWidth - 30);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);
        pdf.text(row.category, chartStartX, yPos);
        
        // Bar background
        pdf.setFillColor(240, 240, 240);
        pdf.roundedRect(chartStartX, yPos + 3, chartWidth - 30, 8, 2, 2, 'F');
        
        // Actual bar
        pdf.setFillColor(...row.color);
        pdf.roundedRect(chartStartX, yPos + 3, Math.max(barWidth, 2), 8, 2, 2, 'F');
        
        // Percentage text
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        if (barWidth > 15) {
          pdf.text(`${percentage.toFixed(1)}%`, chartStartX + barWidth/2, yPos + 8, { align: 'center' });
        } else {
          pdf.setTextColor(60, 60, 60);
          pdf.text(`${percentage.toFixed(1)}%`, chartStartX + barWidth + 5, yPos + 8);
        }
        
        yPos += 20;
      });
      
      // BOTTOM SECTION: Monthly Evolution (simplified line representation)
      yPos += 20;
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(39, 57, 73);
      pdf.text('EVOLUCIÓN MENSUAL - ÍNDICE DE DESVIACIÓN', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 20;
      
      // Simple month progression chart
      const chartHeight = 40;
      const chartY = yPos;
      const monthWidth = (pageWidth - 2 * margin) / monthsToShow;
      
      // Background
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, chartY, pageWidth - 2 * margin, chartHeight, 'F');
      
      // Grid lines
      pdf.setDrawColor(230, 230, 230);
      pdf.setLineWidth(0.5);
      for (let i = 0; i <= 4; i++) {
        const gridY = chartY + (i * chartHeight / 4);
        pdf.line(margin, gridY, pageWidth - margin, gridY);
      }
      
      // Monthly bars
      for (let i = 0; i < monthsToShow; i++) {
        const monthRecycling = getSectionTotal('recycling', i) || 0;
        const monthCompost = getSectionTotal('compost', i) || 0;
        const monthReuse = getSectionTotal('reuse', i) || 0;
        const monthLandfill = getSectionTotal('landfill', i) || 0;
        const monthTotal = monthRecycling + monthCompost + monthReuse + monthLandfill;
        const monthCircular = monthRecycling + monthCompost + monthReuse;
        const monthDeviation = monthTotal > 0 ? (monthCircular / monthTotal) * 100 : 0;
        
        const x = margin + (i * monthWidth) + monthWidth * 0.2;
        const barWidth = monthWidth * 0.6;
        const barHeight = (monthDeviation / 100) * chartHeight * 0.8;
        
        // Bar color based on performance
        const barColor: [number, number, number] = monthDeviation >= 70 ? [76, 175, 80] : 
                      monthDeviation >= 50 ? [255, 193, 7] : [244, 67, 54];
        
        pdf.setFillColor(...barColor);
        pdf.rect(x, chartY + chartHeight - barHeight, barWidth, barHeight, 'F');
        
        // Month label
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(60, 60, 60);
        const monthLabel = MONTH_LABELS[i].slice(0, 3).toUpperCase();
        pdf.text(monthLabel, x + barWidth/2, chartY + chartHeight + 8, { align: 'center' });
      }
      
      // Y-axis labels
      pdf.setFontSize(7);
      for (let i = 0; i <= 4; i++) {
        const value = (i * 25).toString() + '%';
        const labelY = chartY + chartHeight - (i * chartHeight / 4);
        pdf.text(value, margin - 8, labelY + 2, { align: 'right' });
      }
    };

    // PAGE 3: Methodology & Action Plan
    const addPage3MethodologyAndPlan = () => {
      // Page header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(39, 57, 73);
      pdf.text('METODOLOGÍA Y PLAN DE ACCIÓN', pageWidth / 2, 25, { align: 'center' });
      
      // Separator line
      pdf.setDrawColor(181, 233, 81);
      pdf.setLineWidth(2);
      pdf.line(margin, 35, pageWidth - margin, 35);
      
      let yPos = 50;
      
      // SECTION 1: Formula Infographic (2-column layout)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(39, 57, 73);
      pdf.text('FÓRMULA DE CÁLCULO', margin, yPos);
      
      yPos += 20;
      
      // Formula box
      pdf.setFillColor(248, 249, 250);
      pdf.roundedRect(margin, yPos - 5, pageWidth - 2 * margin, 30, 5, 5, 'F');
      pdf.setDrawColor(181, 233, 81);
      pdf.setLineWidth(2);
      pdf.roundedRect(margin, yPos - 5, pageWidth - 2 * margin, 30, 5, 5, 'D');
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      pdf.text('Índice de Desviación = (Reciclables + Compost + Reuso) / Total Generado × 100', pageWidth / 2, yPos + 5, { align: 'center' });
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text(`Actual: ${kpis.deviationPercentage.toFixed(1)}% = (${(kpis.totalCircular/1000).toFixed(1)}t / ${(kpis.totalWeight/1000).toFixed(1)}t) × 100`, pageWidth / 2, yPos + 15, { align: 'center' });
      
      yPos += 45;
      
      // SECTION 2: Goals Progress Bar
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(39, 57, 73);
      pdf.text('METAS DE CERTIFICACIÓN', margin, yPos);
      
      yPos += 20;
      
      // Progress bar with milestones
      const progressBarWidth = pageWidth - 2 * margin;
      const progressBarHeight = 20;
      const currentProgress = kpis.deviationPercentage;
      
      // Background bar
      pdf.setFillColor(240, 240, 240);
      pdf.roundedRect(margin, yPos, progressBarWidth, progressBarHeight, 10, 10, 'F');
      
      // Progress fill
      const fillWidth = (currentProgress / 100) * progressBarWidth;
      const progressColor: [number, number, number] = currentProgress >= 75 ? [76, 175, 80] : 
                        currentProgress >= 50 ? [255, 193, 7] : [244, 67, 54];
      pdf.setFillColor(...progressColor);
      pdf.roundedRect(margin, yPos, Math.max(fillWidth, 10), progressBarHeight, 10, 10, 'F');
      
      // Milestone markers
      const milestones = [
        { value: 50, label: 'Bueno', color: [255, 193, 7] },
        { value: 75, label: 'Certificación', color: [76, 175, 80] },
        { value: 90, label: 'Excelencia', color: [33, 150, 243] },
        { value: 100, label: 'Cero Relleno', color: [156, 39, 176] }
      ];
      
      milestones.forEach(milestone => {
        const x = margin + (milestone.value / 100) * progressBarWidth;
        
        // Vertical line
        pdf.setDrawColor(...milestone.color as [number, number, number]);
        pdf.setLineWidth(2);
        pdf.line(x, yPos - 5, x, yPos + progressBarHeight + 5);
        
        // Label
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...milestone.color as [number, number, number]);
        pdf.text(`${milestone.value}%`, x, yPos + progressBarHeight + 15, { align: 'center' });
        pdf.text(milestone.label, x, yPos + progressBarHeight + 23, { align: 'center' });
      });
      
      // Current position indicator
      const currentX = margin + (currentProgress / 100) * progressBarWidth;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(...progressColor);
      pdf.text(`${currentProgress.toFixed(1)}%`, currentX, yPos + 12, { align: 'center' });
      
      yPos += 55;
      
      // SECTION 3: Next Steps (Action Plan)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(39, 57, 73);
      pdf.text('PRÓXIMOS PASOS', margin, yPos);
      
      yPos += 15;
      
      const actionPlan = [
        '1. Optimizar separación de residuos orgánicos para incrementar compostaje',
        '2. Implementar programa de capacitación para personal de áreas generadoras',
        '3. Evaluar proveedores adicionales de reciclaje especializado',
        '4. Establecer KPIs mensuales con metas trimestrales hacia 75% de desviación',
        '5. Documentar mejores prácticas para replicar en otras instalaciones'
      ];
      
      actionPlan.forEach((step, index) => {
        // Bullet point
        pdf.setFillColor(181, 233, 81);
        pdf.circle(margin + 3, yPos - 2, 2, 'F');
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(step, margin + 10, yPos);
        
        yPos += 12;
      });
      
      // Environmental Impact Summary
      yPos += 10;
      
      pdf.setFillColor(76, 175, 80, 0.1);
      pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 5, 5, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(76, 175, 80);
      pdf.text('IMPACTO AMBIENTAL ACUMULADO', pageWidth / 2, yPos + 15, { align: 'center' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      const impact = `${Math.round(kpis.totalCircular * 0.017)} árboles salvados • ${(kpis.totalCircular * 0.5).toFixed(1)} tons CO₂ evitadas • ${(kpis.totalCircular * 2.1).toFixed(1)}m³ agua conservada`;
      pdf.text(impact, pageWidth / 2, yPos + 25, { align: 'center' });
    };

    // GENERATE THE 3-PAGE REPORT
    // Page 1: Cover + Executive Summary
    addPage1CoverAndExecutive();
    
    // Page 2: Data & Charts  
    pdf.addPage();
    addPage2DataAndCharts();
    
    // Page 3: Methodology & Action Plan
    pdf.addPage();
    addPage3MethodologyAndPlan();
    
    // Professional footer for all pages
    const addFooter = (pageNum: number) => {
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text('ECONOVA © 2025 | Innovando en Gestión Ambiental', pageWidth / 2, pageHeight - 15, { align: 'center' });
      pdf.text(`Página ${pageNum} de 3`, pageWidth - margin, pageHeight - 15, { align: 'right' });
    };
    
    // Add footers to all pages
    const totalPages = pdf.internal.pages.length - 1; // -1 because first element is metadata
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(i);
    }
    
    // Save with proper filename
    pdf.save('Reporte_Trazabilidad_CCCM_2025.pdf');
  };

  // Update button click handler  
  const handlePremiumPDFDownload = () => {
    generatePremiumPDF();
  };

  // Generate Clean PDF Report (original function name for compatibility)
  const generateCleanPDF = () => {
    generatePremiumPDF();
  };

  // Generate PDF Report (original landscape function for compatibility)
  const generatePDFReport = () => {
    // For now, just call the premium version
    generatePremiumPDF();
  };

  // Generate Monthly PDF Report for TRUE Year
  const handleGenerateMonthlyPDF = async () => {
    if (!trueYearData || selectedMonthIndex === null) return;
    
    const selectedMonth = trueYearData.months[selectedMonthIndex];
    if (!selectedMonth) return;

    await generateTrueMonthPdfReport({
      month: selectedMonth,
      materials: trueYearData.materials
    });
  };

  // Chart labels based on current language
  const chartLabels = useMemo(() => ({
    recycling: t('chart.recycling'),
    compost: t('chart.compost'),
    reuse: t('chart.reuse'),
    landfill: t('chart.landfill')
  }), [t]);

  // Generate chart data for visualizations
  const generateChartData = useMemo(() => {
    if (!currentData) return [];
    
    const monthLabels = isTrueMode ? TRUE_MONTH_LABELS : MONTH_LABELS;
    
    return monthLabels.map((monthName, index) => {
      const recyclingTotal = getSectionTotal('recycling', index) || 0;
      const compostTotal = getSectionTotal('compost', index) || 0;
      const reuseTotal = getSectionTotal('reuse', index) || 0;
      const landfillTotal = getSectionTotal('landfill', index) || 0;
      
      const total = recyclingTotal + compostTotal + reuseTotal + landfillTotal;
      const monthlyDeviation = total > 0 ? ((recyclingTotal + compostTotal + reuseTotal) / total) * 100 : 0;
      
      return {
        month: monthName,
        [chartLabels.recycling]: recyclingTotal / 1000,
        [chartLabels.compost]: compostTotal / 1000,
        [chartLabels.reuse]: reuseTotal / 1000,
        [chartLabels.landfill]: landfillTotal / 1000,
        deviation: monthlyDeviation
      };
    });
  }, [currentData, getSectionTotal, isTrueMode, chartLabels]);

  // Handle save function - uses existing updateMutation
  const handleSave = () => {
    if (Object.keys(editedData).length > 0) {
      updateMutation.mutate(editedData);
    }
  };
  
  // Loading state
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
  const chartData = generateChartData;
  const hasChanges = Object.keys(editedData).length > 0;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="w-full px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-anton uppercase tracking-wide text-navy">
                  {t('traceability.title')}
                </h1>
                <p className="text-gray-600 mt-1">
                  {t('traceability.subtitle')}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">{t('common.period')}:</label>
                  {!isTrueMode ? (
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
                  ) : (
                    <div className="bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm font-medium">
                      {t('traceability.truePeriod')}
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => {
                    setIsTrueMode(!isTrueMode);
                    setEditedData({}); // Clear edits when switching modes
                    setSelectedMonthIndex(null); // Reset month selection
                  }}
                  variant={isTrueMode ? "default" : "outline"}
                  className={isTrueMode ? "bg-green-600 hover:bg-green-700 text-white" : "border-green-600 text-green-600 hover:bg-green-50"}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('common.trueYear')}
                </Button>
                
                {isTrueMode && trueYearData && (
                  <>
                    <Select 
                      value={selectedMonthIndex !== null ? selectedMonthIndex.toString() : ""} 
                      onValueChange={(value) => setSelectedMonthIndex(parseInt(value))}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={t('common.selectMonth')} />
                      </SelectTrigger>
                      <SelectContent>
                        {trueYearData.months.map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      onClick={handleGenerateMonthlyPDF}
                      disabled={selectedMonthIndex === null || !trueYearData}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        {t('common.monthlyPdf')}
                      </div>
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={generateCleanPDF}
                  disabled={!currentData}
                  className="bg-navy hover:bg-navy/90 text-white"
                >
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {t('common.downloadPdf')}
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">{t('traceability.circularTons')}</p>
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
                    <p className="text-red-100">{t('traceability.landfill')}</p>
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
                    <p className="text-blue-100">{t('traceability.totalGenerated')}</p>
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

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Waste Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-navy">{t('traceability.distributionChart')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={isTrueMode ? chartData : (selectedYear === 2025 ? chartData.slice(0, 8) : chartData)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={chartLabels.recycling} fill="#16a34a" />
                    <Bar dataKey={chartLabels.compost} fill="#ca8a04" />
                    <Bar dataKey={chartLabels.reuse} fill="#2563eb" />
                    <Bar dataKey={chartLabels.landfill} fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Deviation Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-navy">{t('traceability.evolutionChart')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={isTrueMode ? chartData : (selectedYear === 2025 ? chartData.slice(0, 8) : chartData)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="deviation" stroke="#b5e951" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Excel-style Table */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-navy">{t('traceability.interactiveTable')}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={Object.keys(editedData).length === 0 || updateMutation.isPending}
                    className="bg-lime text-navy hover:bg-lime/80 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('common.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t('common.save')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  {/* Table Header */}
                  <thead>
                    <tr className="border-b-2 border-navy">
                      <th className="text-left p-1 font-bold text-navy text-xs w-[120px]">Material</th>
                      {(isTrueMode ? TRUE_MONTH_LABELS : MONTH_LABELS).map((month, index) => (
                        <th key={index} className="text-center p-1 font-bold text-navy text-[10px] w-[52px]">
                          {month}
                        </th>
                      ))}
                      <th className="text-center p-1 font-bold text-navy text-xs w-[50px]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* RECICLAJE Section */}
                    <tr className="bg-green-50">
                      <td colSpan={14} className="p-1">
                        <button
                          onClick={() => setOpenSections(prev => ({ ...prev, recycling: !prev.recycling }))}
                          className="flex items-center gap-1 font-bold text-green-700 text-xs w-full"
                        >
                          {openSections.recycling ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          {t('categories.recycling')}
                        </button>
                      </td>
                    </tr>
                    
                    {openSections.recycling && wasteData?.materials.recycling.map((material) => (
                      <tr key={material} className="border-b hover:bg-gray-50">
                        <td className="p-1 font-medium text-[11px] truncate max-w-[120px]" title={material}>{material}</td>
                        {MONTH_LABELS.map((_, monthIndex) => {
                          const editKey = `recycling-${material}-${monthIndex}`;
                          const value = getValue('recycling', material, monthIndex);
                          const displayValue = editedData[editKey] !== undefined ? editedData[editKey] : value;
                          return (
                            <td key={monthIndex} className="p-0.5">
                              <Input
                                type="number"
                                value={displayValue === 0 ? '' : Math.round(displayValue)}
                                onChange={(e) => {
                                  const newValue = parseFloat(e.target.value) || 0;
                                  setEditedData(prev => ({ ...prev, [editKey]: newValue }));
                                }}
                                className="w-full text-center text-[10px] h-6 px-0.5"
                                min="0"
                                step="1"
                                placeholder="0"
                              />
                            </td>
                          );
                        })}
                        <td className="p-1 text-center font-bold bg-gray-100 text-[10px]">
                          {(getRowTotal('recycling', material) / 1000).toFixed(1)}t
                        </td>
                      </tr>
                    ))}

                    {/* COMPOSTA Section */}
                    <tr className="bg-amber-50">
                      <td colSpan={14} className="p-1">
                        <button
                          onClick={() => setOpenSections(prev => ({ ...prev, compost: !prev.compost }))}
                          className="flex items-center gap-1 font-bold text-amber-700 text-xs w-full"
                        >
                          {openSections.compost ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          {t('categories.compost')}
                        </button>
                      </td>
                    </tr>
                    
                    {openSections.compost && wasteData?.materials.compost.map((category) => (
                      <tr key={category} className="border-b hover:bg-gray-50">
                        <td className="p-1 font-medium text-[11px] truncate max-w-[120px]" title={category}>{category}</td>
                        {MONTH_LABELS.map((_, monthIndex) => {
                          const editKey = `compost-${category}-${monthIndex}`;
                          const value = getValue('compost', category, monthIndex);
                          const displayValue = editedData[editKey] !== undefined ? editedData[editKey] : value;
                          return (
                            <td key={monthIndex} className="p-0.5">
                              <Input
                                type="number"
                                value={displayValue === 0 ? '' : Math.round(displayValue)}
                                onChange={(e) => {
                                  const newValue = parseFloat(e.target.value) || 0;
                                  setEditedData(prev => ({ ...prev, [editKey]: newValue }));
                                }}
                                className="w-full text-center text-[10px] h-6 px-0.5"
                                min="0"
                                step="1"
                                placeholder="0"
                              />
                            </td>
                          );
                        })}
                        <td className="p-1 text-center font-bold bg-gray-100 text-[10px]">
                          {(getRowTotal('compost', category) / 1000).toFixed(1)}t
                        </td>
                      </tr>
                    ))}

                    {/* REUSO Section */}
                    <tr className="bg-blue-50">
                      <td colSpan={14} className="p-1">
                        <button
                          onClick={() => setOpenSections(prev => ({ ...prev, reuse: !prev.reuse }))}
                          className="flex items-center gap-1 font-bold text-blue-700 text-xs w-full"
                        >
                          {openSections.reuse ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          {t('categories.reuse')}
                        </button>
                      </td>
                    </tr>
                    
                    {openSections.reuse && wasteData?.materials.reuse.map((category) => (
                      <tr key={category} className="border-b hover:bg-gray-50">
                        <td className="p-1 font-medium text-[11px] truncate max-w-[120px]" title={category}>{category}</td>
                        {MONTH_LABELS.map((_, monthIndex) => {
                          const editKey = `reuse-${category}-${monthIndex}`;
                          const value = getValue('reuse', category, monthIndex);
                          const displayValue = editedData[editKey] !== undefined ? editedData[editKey] : value;
                          return (
                            <td key={monthIndex} className="p-0.5">
                              <Input
                                type="number"
                                value={displayValue === 0 ? '' : Math.round(displayValue)}
                                onChange={(e) => {
                                  const newValue = parseFloat(e.target.value) || 0;
                                  setEditedData(prev => ({ ...prev, [editKey]: newValue }));
                                }}
                                className="w-full text-center text-[10px] h-6 px-0.5"
                                min="0"
                                step="1"
                                placeholder="0"
                              />
                            </td>
                          );
                        })}
                        <td className="p-1 text-center font-bold bg-gray-100 text-[10px]">
                          {(getRowTotal('reuse', category) / 1000).toFixed(1)}t
                        </td>
                      </tr>
                    ))}

                    {/* RELLENO SANITARIO Section */}
                    <tr className="bg-red-50">
                      <td colSpan={14} className="p-1">
                        <button
                          onClick={() => setOpenSections(prev => ({ ...prev, landfill: !prev.landfill }))}
                          className="flex items-center gap-1 font-bold text-red-700 text-xs w-full"
                        >
                          {openSections.landfill ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          {t('categories.landfill')}
                        </button>
                      </td>
                    </tr>
                    
                    {openSections.landfill && wasteData?.materials.landfill.map((wasteType) => (
                      <tr key={wasteType} className="border-b hover:bg-gray-50">
                        <td className="p-1 font-medium text-[11px] truncate max-w-[120px]" title={wasteType}>{wasteType}</td>
                        {MONTH_LABELS.map((_, monthIndex) => {
                          const editKey = `landfill-${wasteType}-${monthIndex}`;
                          const value = getValue('landfill', wasteType, monthIndex);
                          const displayValue = editedData[editKey] !== undefined ? editedData[editKey] : value;
                          return (
                            <td key={monthIndex} className="p-0.5">
                              <Input
                                type="number"
                                value={displayValue === 0 ? '' : Math.round(displayValue)}
                                onChange={(e) => {
                                  const newValue = parseFloat(e.target.value) || 0;
                                  setEditedData(prev => ({ ...prev, [editKey]: newValue }));
                                }}
                                className="w-full text-center text-[10px] h-6 px-0.5"
                                min="0"
                                step="1"
                                placeholder="0"
                              />
                            </td>
                          );
                        })}
                        <td className="p-1 text-center font-bold bg-gray-100 text-[10px]">
                          {(getRowTotal('landfill', wasteType) / 1000).toFixed(1)}t
                        </td>
                      </tr>
                    ))}

                    {/* Totals Row */}
                    <tr className="bg-gray-100 border-t-2 border-navy font-bold">
                      <td className="p-1 text-navy text-[10px]">TOTALES</td>
                      {MONTH_LABELS.map((_, monthIndex) => {
                        const monthTotal = getSectionTotal('recycling', monthIndex) + 
                                         getSectionTotal('compost', monthIndex) + 
                                         getSectionTotal('reuse', monthIndex) + 
                                         getSectionTotal('landfill', monthIndex);
                        return (
                          <td key={monthIndex} className="p-1 text-center text-navy text-[9px]">
                            {(monthTotal / 1000).toFixed(1)}t
                          </td>
                        );
                      })}
                      <td className="p-1 text-center text-navy text-[10px] font-bold">
                        {(kpis.totalWeight / 1000).toFixed(1)}t
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}