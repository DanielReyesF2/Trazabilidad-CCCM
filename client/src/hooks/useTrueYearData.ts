import { useQuery } from '@tanstack/react-query';

export interface TrueYearMonthData {
  month: {
    id: number;
    year: number;
    month: number;
    label: string;
  };
  year: number;
  monthNum: number;
  label: string;
  recycling: Array<{ id: number; monthId: number; material: string; kg: number }>;
  compost: Array<{ id: number; monthId: number; category: string; kg: number }>;
  reuse: Array<{ id: number; monthId: number; category: string; kg: number }>;
  landfill: Array<{ id: number; monthId: number; wasteType: string; kg: number }>;
  totalRecycling: number;
  totalCompost: number;
  totalReuse: number;
  totalLandfill: number;
  totalDiverted: number;
  totalGenerated: number;
  diversionRate: number;
}

export interface TrueYearTotals {
  totalRecycling: number;
  totalCompost: number;
  totalReuse: number;
  totalLandfill: number;
  totalDiverted: number;
  totalGenerated: number;
  diversionRate: number;
}

export interface TrueYearData {
  period: string;
  months: TrueYearMonthData[];
  totals: TrueYearTotals;
  materials: {
    recycling: string[];
    compost: string[];
    reuse: string[];
    landfill: string[];
  };
}

export function useTrueYearData() {
  const { data, isLoading, error, refetch } = useQuery<TrueYearData>({
    queryKey: ['/api/waste-excel/true-year'],
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    // Convenience accessors
    months: data?.months || [],
    totals: data?.totals || {
      totalRecycling: 0,
      totalCompost: 0,
      totalReuse: 0,
      totalLandfill: 0,
      totalDiverted: 0,
      totalGenerated: 0,
      diversionRate: 0,
    },
    period: data?.period || 'TRUE Year Oct 2024 - Sep 2025',
  };
}
