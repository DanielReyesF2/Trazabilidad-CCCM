import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LabelList,
} from "recharts";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Download, Calculator, TrendingUp, Award } from "lucide-react";

interface Material {
  id: string;
  materialType: string;
  category: string;
  weight: number;
  divertible: boolean;
  destination: 'landfill' | 'recycling' | 'composting' | 'reuse' | 'energy_recovery';
}

interface AuditData {
  auditorName: string;
  auditDate: string;
  totalWeightBefore: number;
  remainingWeight: number;
  bags: Array<{
    id: string;
    bagNumber: number;
    materialType: string;
    category: string;
    weight: number;
    divertible: boolean;
    destination: 'landfill' | 'recycling' | 'composting' | 'reuse' | 'energy_recovery';
  }>;
  weather?: string;
  temperature?: number;
  humidity?: number;
}

interface TRUEAuditDashboardProps {
  auditData: AuditData;
}

const fmt = (n: number, d = 1) =>
  new Intl.NumberFormat("es-MX", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);

function useAuditCalculations(auditData: AuditData) {
  const extrapolationFactor = useMemo(() => {
    if (auditData.remainingWeight === 0) return 1;
    return auditData.totalWeightBefore / auditData.remainingWeight;
  }, [auditData.totalWeightBefore, auditData.remainingWeight]);

  const materialAnalysis = useMemo(() => {
    return auditData.bags.map((bag) => ({
      ...bag,
      extrapolatedWeight: bag.weight * extrapolationFactor,
    }));
  }, [auditData.bags, extrapolationFactor]);

  const totals = useMemo(() => {
    const divertibleWeight = materialAnalysis
      .filter((m) => m.divertible)
      .reduce((sum, m) => sum + m.extrapolatedWeight, 0);
    const nonDivertibleWeight = auditData.totalWeightBefore - divertibleWeight;
    const diversionRate = auditData.totalWeightBefore > 0 ? (divertibleWeight / auditData.totalWeightBefore) * 100 : 0;
    
    return { 
      divertibleWeight, 
      nonDivertibleWeight, 
      diversionRate,
      sampleWeight: auditData.bags.reduce((sum, bag) => sum + bag.weight, 0)
    };
  }, [materialAnalysis, auditData.totalWeightBefore]);

  const samplePercentage = auditData.totalWeightBefore > 0 ? (totals.sampleWeight / auditData.totalWeightBefore) * 100 : 0;

  const flags = {
    smallSample: totals.sampleWeight < 50 || samplePercentage < 10,
    belowTRUE: totals.diversionRate < 90,
    achievedTRUE: totals.diversionRate >= 90,
    excellentDiversion: totals.diversionRate >= 95,
  };

  return { extrapolationFactor, materialAnalysis, totals, samplePercentage, flags };
}

function useChartData(auditData: AuditData) {
  const { materialAnalysis, totals } = useAuditCalculations(auditData);

  const diversionPieData = [
    { name: "Desviable del relleno", value: Number(totals.divertibleWeight.toFixed(2)), color: "#10b981" },
    { name: "Al relleno sanitario", value: Number(totals.nonDivertibleWeight.toFixed(2)), color: "#ef4444" },
  ];

  const materialBarData = materialAnalysis
    .slice()
    .sort((a, b) => b.extrapolatedWeight - a.extrapolatedWeight)
    .slice(0, 10) // Top 10 materials
    .map((m) => ({
      name: m.materialType || m.category || `Material ${m.bagNumber}`,
      weight: Number(m.extrapolatedWeight.toFixed(1)),
      divertible: m.divertible,
      fill: m.divertible ? "#10b981" : "#ef4444"
    }));

  const destinationData = materialAnalysis
    .reduce((acc, material) => {
      const dest = material.destination;
      if (!acc[dest]) {
        acc[dest] = { name: dest, weight: 0, count: 0 };
      }
      acc[dest].weight += material.extrapolatedWeight;
      acc[dest].count += 1;
      return acc;
    }, {} as Record<string, { name: string; weight: number; count: number }>);

  const destinationChartData = Object.values(destinationData).map(item => ({
    name: getDestinationLabel(item.name),
    weight: Number(item.weight.toFixed(1)),
    count: item.count
  }));

  return { diversionPieData, materialBarData, destinationChartData };
}

function getDestinationLabel(destination: string): string {
  const labels: Record<string, string> = {
    'landfill': 'Relleno Sanitario',
    'recycling': 'Reciclaje',
    'composting': 'Compostaje',
    'reuse': 'Reutilización',
    'energy_recovery': 'Valorización Energética'
  };
  return labels[destination] || destination;
}

export default function TRUEAuditDashboard({ auditData }: TRUEAuditDashboardProps) {
  const { extrapolationFactor, totals, samplePercentage, flags } = useAuditCalculations(auditData);
  const { diversionPieData, materialBarData, destinationChartData } = useChartData(auditData);
  const [tableMode, setTableMode] = useState<"muestra" | "extrapolado">("extrapolado");

  const progressToTRUE = Math.min((totals.diversionRate / 90) * 100, 100);

  return (
    <div className="w-full p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Award className="h-8 w-8 text-[#b5e951]" />
            Auditoría TRUE Zero Waste
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Club Campestre CDMX — {new Date(auditData.auditDate).toLocaleDateString("es-MX")}
          </p>
          <p className="text-sm text-gray-600">
            Auditor: {auditData.auditorName}
            {auditData.weather && auditData.temperature && (
              <> • Clima: {auditData.weather}, {auditData.temperature}°C</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2"/>
            Descargar Reporte
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard 
          title="Peso Total Procesado" 
          value={`${fmt(auditData.totalWeightBefore, 1)} kg`} 
          subtitle="Material previo al cuarteo" 
        />
        <KpiCard 
          title="Muestra Caracterizada" 
          value={`${fmt(totals.sampleWeight, 1)} kg`} 
          subtitle={`${fmt(samplePercentage, 1)}% del total`} 
        />
        <KpiCard 
          title="Factor de Extrapolación" 
          value={fmt(extrapolationFactor, 2)} 
          subtitle="Total / Muestra analizada" 
        />
        <KpiCard 
          title="Tasa de Desviación TRUE" 
          value={`${fmt(totals.diversionRate, 1)}%`} 
          subtitle={`Progreso a 90%: ${fmt(progressToTRUE, 1)}%`} 
          accent={flags.achievedTRUE}
        />
      </div>

      {/* Status Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flags.excellentDiversion && (
          <SuccessCard
            title="¡Excelente desempeño TRUE!"
            text={`Desviación del ${fmt(totals.diversionRate, 1)}% supera el estándar del 90% requerido para certificación TRUE Zero Waste.`}
          />
        )}
        {flags.achievedTRUE && !flags.excellentDiversion && (
          <SuccessCard
            title="Certificación TRUE Zero Waste alcanzada"
            text={`Desviación del ${fmt(totals.diversionRate, 1)}% cumple con el mínimo del 90% para certificación TRUE.`}
          />
        )}
        {flags.belowTRUE && (
          <AlertCard
            title="Desviación por debajo del objetivo TRUE"
            text={`Desviación actual: ${fmt(totals.diversionRate, 1)}%. Se requiere 90% mínimo para certificación TRUE Zero Waste.`}
          />
        )}
        {flags.smallSample && (
          <AlertCard
            title="Muestra pequeña detectada"
            text={`La muestra es de ${fmt(totals.sampleWeight, 1)} kg (${fmt(samplePercentage, 1)}% del total). Recomendado: ≥50 kg o ≥10% del total.`}
          />
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Composición por Destino (Extrapolado)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={diversionPieData} 
                  dataKey="value" 
                  nameKey="name" 
                  outerRadius={100}
                  innerRadius={40}
                >
                  {diversionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList 
                    dataKey={(v: any) => `${fmt(v.value, 1)} kg`} 
                    position="outside" 
                  />
                </Pie>
                <Tooltip formatter={(v: any) => `${fmt(Number(v), 1)} kg`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Materiales (kg extrapolados)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={materialBarData} margin={{ left: 16, right: 16, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }} 
                  interval={0} 
                  angle={-45} 
                  textAnchor="end"
                  height={80} 
                />
                <YAxis />
                <Tooltip 
                  formatter={(v: any) => `${fmt(Number(v), 1)} kg`}
                  labelFormatter={(label) => `Material: ${label}`}
                />
                <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                  <LabelList 
                    dataKey="weight" 
                    formatter={(v: any) => fmt(Number(v), 1)} 
                    position="top" 
                    fontSize={10}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Materiales Identificados</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={tableMode === "muestra" ? "default" : "outline"} 
                size="sm"
                onClick={() => setTableMode("muestra")}
              >
                Ver Muestra
              </Button>
              <Button 
                variant={tableMode === "extrapolado" ? "default" : "outline"} 
                size="sm"
                onClick={() => setTableMode("extrapolado")}
              >
                Ver Extrapolado
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-3 pr-4 font-semibold">Material</th>
                  <th className="py-3 pr-4 font-semibold">Categoría</th>
                  <th className="py-3 pr-4 font-semibold">Peso (kg)</th>
                  <th className="py-3 pr-4 font-semibold">% del total</th>
                  <th className="py-3 pr-4 font-semibold">Destino</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {getTableRows(auditData, tableMode).map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 pr-4">{row.materialType || `Material ${row.bagNumber}`}</td>
                    <td className="py-3 pr-4">{row.category}</td>
                    <td className="py-3 pr-4 font-mono">{fmt(row.weight, 1)}</td>
                    <td className="py-3 pr-4">{fmt(row.percentage, 1)}%</td>
                    <td className="py-3 pr-4">{getDestinationLabel(row.destination)}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.divertible 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {row.divertible ? 'Desviable' : 'No desviable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            <strong>Total de bolsas analizadas:</strong> {auditData.bags.length} | 
            <strong> Factor de extrapolación:</strong> {fmt(extrapolationFactor, 2)}x
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Subcomponents
function KpiCard({ title, value, subtitle, accent }: { 
  title: string; 
  value: string; 
  subtitle?: string; 
  accent?: boolean;
}) {
  return (
    <Card className={`rounded-2xl ${accent ? "border-l-4 border-l-[#b5e951] bg-green-50" : ""}`}> 
      <CardContent className="p-6">
        <p className="text-xs uppercase tracking-wider text-gray-600 font-medium">{title}</p>
        <div className={`text-2xl font-bold mt-2 ${accent ? "text-green-700" : "text-[#273949]"}`}>
          {value}
        </div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function AlertCard({ title, text }: { title: string; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 p-4 flex items-start gap-3"
    >
      <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-600" />
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm leading-relaxed mt-1">{text}</div>
      </div>
    </motion.div>
  );
}

function SuccessCard({ title, text }: { title: string; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-green-200 bg-green-50 text-green-900 p-4 flex items-start gap-3"
    >
      <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm leading-relaxed mt-1">{text}</div>
      </div>
    </motion.div>
  );
}

function getTableRows(auditData: AuditData, mode: "muestra" | "extrapolado") {
  const { extrapolationFactor } = useAuditCalculations(auditData);
  const totalWeight = mode === "muestra" 
    ? auditData.bags.reduce((sum, bag) => sum + bag.weight, 0)
    : auditData.totalWeightBefore;

  return auditData.bags
    .map((bag) => {
      const weight = mode === "muestra" ? bag.weight : bag.weight * extrapolationFactor;
      return {
        ...bag,
        weight,
        percentage: totalWeight > 0 ? (weight / totalWeight) * 100 : 0,
      };
    })
    .sort((a, b) => b.weight - a.weight);
}