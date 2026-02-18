import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import AppLayout from '@/components/layout/AppLayout';

import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter';
import { MonthlyDeviationChart } from '@/components/dashboard/MonthlyDeviationChart';
import { SankeyDiagram, SankeyData } from '@/components/SankeyDiagram';
import { useTrueYearData, TrueYearMonthData } from '@/hooks/useTrueYearData';
import {
  Trash2,
  Zap,
  Droplets,
  RefreshCw,
  TreePine,
  Leaf,
  Recycle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

// Material name translations
const MATERIAL_LABELS: Record<string, string> = {
  'Mixed Paper': 'Papel Mixto',
  'Office paper': 'Papel Oficina',
  'Magazines': 'Revistas',
  'Newspaper': 'Periódico',
  'Carboard': 'Cartón',
  'PET': 'PET',
  'RIgid plastic': 'Plástico Rígido',
  'HDPE': 'HDPE',
  'Tin Can': 'Lata',
  'Aluminium': 'Aluminio',
  'Glass': 'Vidrio',
  'Scrap metal': 'Metal',
  'E Waste': 'E-Waste',
  'Yarde Waste': 'Poda y Jardín',
  'Mulch tree brands': 'Mulch / Ramas',
  'Food from the mess hall': 'Alimentos Cocina',
  'Food': 'Alimentos',
  'Organic': 'Orgánico',
  'Non organic': 'No Orgánico',
};

function buildSankeyData(months: TrueYearMonthData[]): SankeyData {
  // Aggregate kg by material across all months
  const recyclingMap = new Map<string, number>();
  const compostMap = new Map<string, number>();
  const reuseMap = new Map<string, number>();
  const landfillMap = new Map<string, number>();

  months.forEach((m) => {
    m.recycling.forEach((e) => recyclingMap.set(e.material, (recyclingMap.get(e.material) || 0) + (e.kg || 0)));
    m.compost.forEach((e) => compostMap.set(e.category, (compostMap.get(e.category) || 0) + (e.kg || 0)));
    m.reuse.forEach((e) => reuseMap.set(e.category, (reuseMap.get(e.category) || 0) + (e.kg || 0)));
    m.landfill.forEach((e) => landfillMap.set(e.wasteType, (landfillMap.get(e.wasteType) || 0) + (e.kg || 0)));
  });

  // Build nodes
  const nodes: SankeyData['nodes'] = [
    { id: 'total', label: 'Residuos Generados', category: 'source' },
    { id: 'recycling', label: 'Reciclaje', category: 'process' },
    { id: 'compost', label: 'Composta', category: 'process' },
    { id: 'reuse', label: 'Reuso', category: 'process' },
    { id: 'landfill', label: 'Relleno Sanitario', category: 'process' },
  ];

  const links: SankeyData['links'] = [];

  // Helper to add material nodes + links
  const addMaterials = (map: Map<string, number>, processId: string) => {
    map.forEach((kg, name) => {
      if (kg <= 0) return;
      const nodeId = `${processId}_${name}`;
      nodes.push({ id: nodeId, label: MATERIAL_LABELS[name] || name, category: 'destination' });
      links.push({ source: processId, target: nodeId, value: kg });
    });
  };

  // Source → process links
  const totalRecycling = Array.from(recyclingMap.values()).reduce((a, b) => a + b, 0);
  const totalCompost = Array.from(compostMap.values()).reduce((a, b) => a + b, 0);
  const totalReuse = Array.from(reuseMap.values()).reduce((a, b) => a + b, 0);
  const totalLandfill = Array.from(landfillMap.values()).reduce((a, b) => a + b, 0);

  if (totalRecycling > 0) links.push({ source: 'total', target: 'recycling', value: totalRecycling });
  if (totalCompost > 0) links.push({ source: 'total', target: 'compost', value: totalCompost });
  if (totalReuse > 0) links.push({ source: 'total', target: 'reuse', value: totalReuse });
  if (totalLandfill > 0) links.push({ source: 'total', target: 'landfill', value: totalLandfill });

  // Process → material links
  addMaterials(recyclingMap, 'recycling');
  addMaterials(compostMap, 'compost');
  addMaterials(reuseMap, 'reuse');
  addMaterials(landfillMap, 'landfill');

  return { nodes, links };
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { months, totals } = useTrueYearData();

  const diversionRate = totals.diversionRate;
  const totalDivertedTons = totals.totalDiverted / 1000;
  const totalLandfillTons = totals.totalLandfill / 1000;
  const totalRecyclingTons = totals.totalRecycling / 1000;
  const totalCompostTons = totals.totalCompost / 1000;
  const totalReuseTons = totals.totalReuse / 1000;

  const monthsAbove90 = months.filter((m) => m.diversionRate >= 90).length;
  const peakMonth = months.reduce(
    (best, m) => (m.diversionRate > best.rate ? { label: m.label, rate: m.diversionRate } : best),
    { label: '', rate: 0 },
  );

  const impact = {
    trees: Math.round(totalDivertedTons * 1.2),
    water: Math.round(totalDivertedTons * 9800),
    energy: Math.round(totalDivertedTons * 2160),
    co2: Math.round(totalDivertedTons * 0.85 * 1000),
  };

  const sankeyData = useMemo(() => buildSankeyData(months), [months]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* ─── ROW 1: Hero ─── */}
          <section className="flex items-center justify-between mb-12">
            <div className="flex items-baseline gap-5">
              <AnimatedCounter
                end={diversionRate}
                decimals={1}
                suffix="%"
                className="text-5xl md:text-6xl font-semibold text-gray-900 tracking-tight leading-none"
              />
              <div>
                <p className="text-sm text-gray-400">tasa de desviación</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] text-emerald-600 font-medium">TRUE Zero Waste</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <MiniStat label="Desviadas" value={`${totalDivertedTons.toFixed(1)} ton`} />
              <div className="w-px h-8 bg-gray-200" />
              <MiniStat label="Sobre meta" value={`${monthsAbove90}/12`} />
              <div className="w-px h-8 bg-gray-200" />
              <MiniStat label="Mes pico" value={`${peakMonth.rate.toFixed(1)}%`} />
            </div>
          </section>

          {/* ─── ROW 2: KPIs left + Chart right ─── */}
          <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 mb-12">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-px bg-gray-100 rounded-xl overflow-hidden">
              <KPICell icon={<Recycle className="w-3.5 h-3.5" />} label="Reciclaje" value={totalRecyclingTons} />
              <KPICell icon={<Leaf className="w-3.5 h-3.5" />} label="Composta" value={totalCompostTons} />
              <KPICell icon={<RefreshCw className="w-3.5 h-3.5" />} label="Reuso" value={totalReuseTons} />
              <KPICell icon={<Trash2 className="w-3.5 h-3.5" />} label="Relleno" value={totalLandfillTons} negative />
            </div>
            {/* Chart */}
            <div className="bg-white rounded-xl p-5 min-h-[260px]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 font-medium">Tendencia mensual</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-300">
                  <span className="flex items-center gap-1"><span className="w-4 h-[1.5px] bg-emerald-400 rounded-full" />Desviación</span>
                  <span className="flex items-center gap-1"><span className="w-4 border-t border-dashed border-gray-300" />Meta 90%</span>
                </div>
              </div>
              <div className="h-[220px]">
                <MonthlyDeviationChart months={months} />
              </div>
            </div>
          </section>

          {/* ─── ROW 3: Sankey — Flujo de materiales ─── */}
          {sankeyData.links.length > 0 && (
            <section className="mb-12">
              <SankeyDiagram
                data={sankeyData}
                title="Flujo de Materiales"
                subtitle="Trazabilidad completa de residuos por categoría y destino"
                period="TRUE Year Oct 2024 – Sep 2025"
                height={420}
              />
            </section>
          )}

          {/* ─── ROW 4: Impact + Modules side by side ─── */}
          <section className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4 mb-12">
            {/* Impact */}
            <div className="bg-white rounded-xl px-8 py-6">
              <p className="text-xs text-gray-400 font-medium mb-5">Impacto ambiental</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <ImpactItem value={impact.trees} label="árboles" color="text-emerald-500" />
                <ImpactItem value={impact.water} label="litros agua" color="text-sky-500" />
                <ImpactItem value={impact.energy} label="kWh" color="text-amber-500" />
                <ImpactItem value={impact.co2} label="kg CO₂" color="text-emerald-600" />
              </div>
            </div>
            {/* Module links */}
            <div className="flex flex-col gap-px bg-gray-100 rounded-xl overflow-hidden">
              <NavLink href="/trazabilidad-residuos" icon={<Trash2 className="w-4 h-4 text-emerald-500" />} label="Residuos" />
              <NavLink href="/energia" icon={<Zap className="w-4 h-4 text-amber-500" />} label="Energía" sub="Próximamente" />
              <NavLink href="/agua" icon={<Droplets className="w-4 h-4 text-sky-500" />} label="Agua" sub="Próximamente" />
            </div>
          </section>

          {/* ─── ROW 5: Methodology (compact) ─── */}
          <section className="bg-white rounded-xl px-8 py-6">
            <p className="text-xs text-gray-400 font-medium mb-4">{t('dashboard.certifiedMethodology')}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16">
              <div>
                {[
                  ['Residuos Orgánicos', '1.83', 'EPA'],
                  ['Papel y Cartón', '3.89', 'IPCC'],
                  ['Plásticos', '2.14', 'SEMARNAT'],
                  ['Metales', '5.73', 'GHG'],
                ].map(([mat, val, src]) => (
                  <div key={mat} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{mat}</span>
                    <span className="text-xs font-mono text-gray-400">{val} <span className="text-gray-300">tCO₂eq/ton</span></span>
                  </div>
                ))}
              </div>
              <div>
                {[
                  ['Árboles', '1.2 /ton', 'CONAFOR'],
                  ['Agua', '15,000 L/ton', 'UNESCO'],
                  ['Energía', '3,200 kWh/ton', 'IEA'],
                  ['Combustible', '0.89 L/ton', 'CFE'],
                ].map(([mat, val]) => (
                  <div key={mat} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{mat}</span>
                    <span className="text-xs font-mono text-gray-400">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </div>
    </AppLayout>
  );
}

/* ─── Sub-components ─── */

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="text-lg font-semibold text-gray-900 tracking-tight">{value}</p>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function KPICell({
  icon,
  label,
  value,
  negative = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  negative?: boolean;
}) {
  return (
    <div className="bg-white px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className={`${negative ? 'text-red-400' : 'text-gray-400'}`}>{icon}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="text-right">
        <AnimatedCounter
          end={value}
          decimals={1}
          className={`text-base font-semibold tracking-tight ${negative ? 'text-red-500' : 'text-gray-900'}`}
        />
        <span className="text-[10px] text-gray-300 ml-1">ton</span>
      </div>
    </div>
  );
}

function ImpactItem({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div>
      <AnimatedCounter end={value} separator className={`text-2xl font-semibold tracking-tight ${color}`} />
      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function NavLink({ href, icon, label, sub }: { href: string; icon: React.ReactNode; label: string; sub?: string }) {
  return (
    <Link href={href}>
      <div className="group cursor-pointer bg-white flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
        {icon}
        <span className="text-sm text-gray-700 flex-1">{label}</span>
        {sub && <span className="text-[10px] text-gray-300">{sub}</span>}
        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    </Link>
  );
}
