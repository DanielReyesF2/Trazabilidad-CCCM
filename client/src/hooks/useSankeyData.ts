import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { SankeyData } from '@/components/SankeyDiagram';
import { transformToSankeyData, validateSankeyData } from '@/lib/sankey-utils';
import { MonthlyDeviationData } from '@shared/schema';

interface UseSankeyDataOptions {
  clientId?: number;
  year: number;
  month?: number;
}

interface SankeyDataResult {
  data: SankeyData;
  isLoading: boolean;
  error: Error | null;
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    sourceTotal: number;
    destinationTotal: number;
  };
  period: string;
  diversionStats: {
    totalGenerated: number;
    totalDiverted: number;
    diversionRate: number;
    breakdown: {
      recycled: number;
      composted: number;
      reused: number;
      landfilled: number;
    };
  };
}

export function useSankeyData({
  clientId = 4, // Default to CCCM
  year,
  month
}: UseSankeyDataOptions): SankeyDataResult {
  
  // Query monthly data
  const { 
    data: monthlyData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/waste-excel', year],
  });

  // Transform and validate data
  const sankeyResult = useMemo(() => {
    let sankeyData: SankeyData = { nodes: [], links: [] };
    let period = '';

    try {
      if (monthlyData && 'months' in monthlyData && Array.isArray((monthlyData as any).months) && month) {
        // Find the specific month data
        const monthData = (monthlyData as any).months.find((m: any) => m.month?.month === month);
        if (monthData) {
          const monthlyDeviationData: MonthlyDeviationData = {
            id: 0,
            clientId,
            year,
            month,
            mixedFile: monthData.recycling?.find((r: any) => r.material === 'Papel Mixto')?.kg || 0,
            officePaper: monthData.recycling?.find((r: any) => r.material === 'Papel de oficina')?.kg || 0,
            magazine: monthData.recycling?.find((r: any) => r.material === 'Revistas')?.kg || 0,
            newspaper: monthData.recycling?.find((r: any) => r.material === 'Periódico')?.kg || 0,
            cardboard: monthData.recycling?.find((r: any) => r.material === 'Cartón')?.kg || 0,
            petPlastic: monthData.recycling?.find((r: any) => r.material === 'PET')?.kg || 0,
            hdpeBlown: monthData.recycling?.find((r: any) => r.material === 'HDPE')?.kg || 0,
            hdpeRigid: monthData.recycling?.find((r: any) => r.material === 'Plástico Duro')?.kg || 0,
            tinCan: monthData.recycling?.find((r: any) => r.material === 'Tin Can')?.kg || 0,
            aluminum: monthData.recycling?.find((r: any) => r.material === 'Aluminio')?.kg || 0,
            glass: monthData.recycling?.find((r: any) => r.material === 'Vidrio')?.kg || 0,
            totalRecyclables: monthData.totalRecycling || 0,
            organicsCompost: monthData.totalCompost || 0,
            totalOrganics: monthData.totalCompost || 0,
            glassDonation: monthData.totalReuse || 0,
            totalDiverted: (monthData.totalRecycling || 0) + (monthData.totalCompost || 0) + (monthData.totalReuse || 0),
            totalGenerated: monthData.totalWaste || 0,
            deviationPercentage: monthData.deviationPercentage || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          period = `${monthNames[month]} ${year}`;
          
          sankeyData = transformToSankeyData({
            monthlyData: monthlyDeviationData,
            period
          });
        }
      }
    } catch (error) {
      console.error('Error transforming data to Sankey format:', error);
      sankeyData = { nodes: [], links: [] };
    }

    // Validate the data
    const validation = validateSankeyData(sankeyData);

    // Calculate diversion stats
    const destinationTotals = sankeyData.links.reduce((acc, link) => {
      const target = sankeyData.nodes.find(n => n.id === link.target);
      if (!target || target.category !== 'destination') return acc;

      if (link.target.includes('recycling')) acc.recycled += link.value;
      else if (link.target.includes('composting')) acc.composted += link.value;
      else if (link.target.includes('donation')) acc.reused += link.value;
      else if (link.target.includes('landfill')) acc.landfilled += link.value;

      return acc;
    }, { recycled: 0, composted: 0, reused: 0, landfilled: 0 });

    const totalGenerated = Object.values(destinationTotals).reduce((sum, value) => sum + value, 0);
    const totalDiverted = destinationTotals.recycled + destinationTotals.composted + destinationTotals.reused;
    const diversionRate = totalGenerated > 0 ? (totalDiverted / totalGenerated) * 100 : 0;

    return {
      data: sankeyData,
      validation,
      period,
      diversionStats: {
        totalGenerated,
        totalDiverted,
        diversionRate,
        breakdown: destinationTotals
      }
    };
  }, [monthlyData, clientId, year, month]);

  return {
    data: sankeyResult.data,
    isLoading,
    error,
    validation: sankeyResult.validation,
    period: sankeyResult.period,
    diversionStats: sankeyResult.diversionStats
  };
}

// Hook for yearly aggregated Sankey data
export function useYearlySankeyData(clientId: number = 4, year: number): SankeyDataResult {
  const { data: yearlyData, isLoading, error } = useQuery({
    queryKey: ['/api/waste-excel', year],
  });

  const sankeyResult = useMemo(() => {
    if (!yearlyData || !('months' in yearlyData) || !Array.isArray((yearlyData as any).months)) {
      return {
        data: { nodes: [], links: [] },
        validation: { isValid: false, errors: [], warnings: [], sourceTotal: 0, destinationTotal: 0 },
        period: `${year}`,
        diversionStats: { totalGenerated: 0, totalDiverted: 0, diversionRate: 0, breakdown: { recycled: 0, composted: 0, reused: 0, landfilled: 0 } }
      };
    }

    // Aggregate all months data
    const yearlyAggregated = (yearlyData as any).months.reduce((acc: any, monthData: any) => {
      acc.totalRecycling += monthData.totalRecycling || 0;
      acc.totalCompost += monthData.totalCompost || 0;
      acc.totalReuse += monthData.totalReuse || 0;
      acc.totalWaste += monthData.totalWaste || 0;

      // Aggregate recycling materials
      if (monthData.recycling && Array.isArray(monthData.recycling)) {
        monthData.recycling.forEach((item: any) => {
          if (!acc.recyclingBreakdown[item.material]) {
            acc.recyclingBreakdown[item.material] = 0;
          }
          acc.recyclingBreakdown[item.material] += item.kg;
        });
      }

      return acc;
    }, {
      totalRecycling: 0,
      totalCompost: 0,
      totalReuse: 0,
      totalWaste: 0,
      recyclingBreakdown: {}
    });

    const yearlyDeviationData: MonthlyDeviationData = {
      id: 0,
      clientId,
      year,
      month: 0, // Represents yearly data
      mixedFile: yearlyAggregated.recyclingBreakdown['Papel Mixto'] || 0,
      officePaper: yearlyAggregated.recyclingBreakdown['Papel de oficina'] || 0,
      magazine: yearlyAggregated.recyclingBreakdown['Revistas'] || 0,
      newspaper: yearlyAggregated.recyclingBreakdown['Periódico'] || 0,
      cardboard: yearlyAggregated.recyclingBreakdown['Cartón'] || 0,
      petPlastic: yearlyAggregated.recyclingBreakdown['PET'] || 0,
      hdpeBlown: yearlyAggregated.recyclingBreakdown['HDPE'] || 0,
      hdpeRigid: yearlyAggregated.recyclingBreakdown['Plástico Duro'] || 0,
      tinCan: yearlyAggregated.recyclingBreakdown['Tin Can'] || 0,
      aluminum: yearlyAggregated.recyclingBreakdown['Aluminio'] || 0,
      glass: yearlyAggregated.recyclingBreakdown['Vidrio'] || 0,
      totalRecyclables: yearlyAggregated.totalRecycling,
      organicsCompost: yearlyAggregated.totalCompost,
      totalOrganics: yearlyAggregated.totalCompost,
      glassDonation: yearlyAggregated.totalReuse,
      totalDiverted: yearlyAggregated.totalRecycling + yearlyAggregated.totalCompost + yearlyAggregated.totalReuse,
      totalGenerated: yearlyAggregated.totalWaste,
      deviationPercentage: ((yearlyAggregated.totalRecycling + yearlyAggregated.totalCompost + yearlyAggregated.totalReuse) / yearlyAggregated.totalWaste) * 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const sankeyData = transformToSankeyData({
      monthlyData: yearlyDeviationData,
      period: `${year}`
    });

    const validation = validateSankeyData(sankeyData);

    // Calculate diversion stats
    const destinationTotals = sankeyData.links.reduce((acc, link) => {
      const target = sankeyData.nodes.find(n => n.id === link.target);
      if (!target || target.category !== 'destination') return acc;

      if (link.target.includes('recycling')) acc.recycled += link.value;
      else if (link.target.includes('composting')) acc.composted += link.value;
      else if (link.target.includes('donation')) acc.reused += link.value;
      else if (link.target.includes('landfill')) acc.landfilled += link.value;

      return acc;
    }, { recycled: 0, composted: 0, reused: 0, landfilled: 0 });

    const totalGenerated = Object.values(destinationTotals).reduce((sum, value) => sum + value, 0);
    const totalDiverted = destinationTotals.recycled + destinationTotals.composted + destinationTotals.reused;
    const diversionRate = totalGenerated > 0 ? (totalDiverted / totalGenerated) * 100 : 0;

    return {
      data: sankeyData,
      validation,
      period: `${year}`,
      diversionStats: {
        totalGenerated,
        totalDiverted,
        diversionRate,
        breakdown: destinationTotals
      }
    };
  }, [yearlyData, clientId, year]);

  return {
    data: sankeyResult.data,
    isLoading,
    error,
    validation: sankeyResult.validation,
    period: sankeyResult.period,
    diversionStats: sankeyResult.diversionStats
  };
}