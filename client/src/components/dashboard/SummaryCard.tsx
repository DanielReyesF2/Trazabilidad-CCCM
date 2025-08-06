import { cva, type VariantProps } from "class-variance-authority";
import { TrendingUp, TrendingDown, Scale, Trash2, BarChart, AlertTriangle } from "lucide-react";

const cardVariants = cva(
  "bg-white shadow rounded-lg p-5", {
    variants: {
      type: {
        organic: "organic-card",
        inorganic: "inorganic-card",
        total: "total-card",
        deviation: "deviation-card"
      }
    },
    defaultVariants: {
      type: "organic"
    }
  }
);

interface SummaryCardProps extends VariantProps<typeof cardVariants> {
  title: string;
  value: string;
  change: number;
  progress: number;
  progressLabel: string;
  type: "organic" | "inorganic" | "total" | "deviation";
}

export default function SummaryCard({
  title,
  value,
  change,
  progress,
  progressLabel,
  type
}: SummaryCardProps) {
  const getIcon = () => {
    switch (type) {
      case "organic": return Scale;
      case "inorganic": return Trash2;
      case "total": return BarChart;
      case "deviation": return AlertTriangle;
    }
  };

  const Icon = getIcon();

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{title}</p>
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      
      <div className="space-y-1">
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-gray-500">{progressLabel}</span>
        </div>
      </div>
    </div>
  );
}
