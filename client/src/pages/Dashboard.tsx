import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';

import { WasteFlowVisualization } from '@/components/dashboard/WasteFlowVisualization';
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter';
import { MonthlyDeviationChart } from '@/components/dashboard/MonthlyDeviationChart';
import { useTrueYearData } from '@/hooks/useTrueYearData';
import {
  Trash2,
  Zap,
  Droplets,
  RefreshCw,
  TreePine,
  Waves,
  Bolt,
  Leaf,
  ArrowRight,
  Recycle,
  CheckCircle2,
} from 'lucide-react';

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

  const environmentalImpact = {
    trees: Math.round(totalDivertedTons * 1.2),
    waterSaved: Math.round(totalDivertedTons * 9800),
    energySaved: Math.round(totalDivertedTons * 2160),
    co2Avoided: Math.round(totalDivertedTons * 0.85 * 1000),
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">

          {/* ─── HERO ─── */}
          <section className="text-center mb-24">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 text-[11px] font-semibold uppercase tracking-[2px] px-4 py-1.5 rounded-full mb-8">
              <CheckCircle2 className="w-3.5 h-3.5" />
              TRUE Zero Waste Certified
            </div>

            <h1 className="mb-2">
              <AnimatedCounter
                end={diversionRate}
                decimals={1}
                suffix="%"
                className="text-7xl md:text-8xl lg:text-[7rem] font-semibold text-gray-900 tracking-tighter leading-none"
              />
            </h1>
            <p className="text-lg text-gray-400 font-light">
              tasa de desviación de residuos
            </p>

            <div className="flex items-center justify-center gap-12 mt-14">
              <Stat
                value={<AnimatedCounter end={totalDivertedTons} decimals={1} separator className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight" />}
                label="toneladas desviadas"
              />
              <div className="w-px h-10 bg-gray-200" />
              <Stat
                value={<><AnimatedCounter end={monthsAbove90} className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight" /><span className="text-lg text-gray-300 font-light ml-1">/12</span></>}
                label="meses sobre meta"
              />
              <div className="w-px h-10 bg-gray-200" />
              <Stat
                value={<AnimatedCounter end={peakMonth.rate} decimals={1} suffix="%" className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight" />}
                label={`mes pico · ${peakMonth.label}`}
              />
            </div>
          </section>

          {/* ─── BREAKDOWN ─── */}
          <section className="mb-24">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 rounded-2xl overflow-hidden">
              <BreakdownCell label="Reciclaje" value={totalRecyclingTons} icon={<Recycle className="w-4 h-4" />} />
              <BreakdownCell label="Composta" value={totalCompostTons} icon={<Leaf className="w-4 h-4" />} />
              <BreakdownCell label="Reuso" value={totalReuseTons} icon={<RefreshCw className="w-4 h-4" />} />
              <BreakdownCell label="Relleno sanitario" value={totalLandfillTons} icon={<Trash2 className="w-4 h-4" />} negative />
            </div>
          </section>

          {/* ─── CHART ─── */}
          <section className="mb-24">
            <MonthlyDeviationChart months={months} />
          </section>

          {/* ─── WASTE FLOW ─── */}
          <section className="mb-24">
            <WasteFlowVisualization totalWasteDiverted={totalDivertedTons} />
          </section>

          {/* ─── IMPACT ─── */}
          <section className="mb-24">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight text-center">
              Impacto ambiental
            </h2>
            <p className="text-sm text-gray-400 text-center mt-2 mb-14">
              Al desviar {totalDivertedTons.toFixed(0)} toneladas del relleno sanitario
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
              <ImpactMetric value={environmentalImpact.trees} label="árboles" sub="equivalente salvado" color="text-emerald-500" />
              <ImpactMetric value={environmentalImpact.waterSaved} label="litros de agua" sub="ahorrados" color="text-sky-500" />
              <ImpactMetric value={environmentalImpact.energySaved} label="kWh" sub="energía evitada" color="text-amber-500" />
              <ImpactMetric value={environmentalImpact.co2Avoided} label="kg CO₂" sub="emisiones evitadas" color="text-emerald-600" />
            </div>
          </section>

          {/* ─── MODULES ─── */}
          <section className="mb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ModuleCard href="/trazabilidad-residuos" icon={<Trash2 className="w-5 h-5 text-emerald-500" />} title="Residuos" subtitle="Trazabilidad completa" />
              <ModuleCard href="/energia" icon={<Zap className="w-5 h-5 text-amber-500" />} title="Energía" subtitle="Próximamente" />
              <ModuleCard href="/agua" icon={<Droplets className="w-5 h-5 text-sky-500" />} title="Agua" subtitle="Próximamente" />
            </div>
          </section>

          {/* ─── METHODOLOGY ─── */}
          <section>
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                {t('dashboard.certifiedMethodology')}
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                Factores de emisión y equivalencias basados en estándares internacionales
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[2px] text-gray-400 mb-6">
                  Factores de Emisión CO₂
                </h3>
                <div className="space-y-1">
                  <MethodRow label="Residuos Orgánicos" value="1.83 tCO₂eq/ton" source="EPA" />
                  <MethodRow label="Papel y Cartón" value="3.89 tCO₂eq/ton" source="IPCC 2023" />
                  <MethodRow label="Plásticos" value="2.14 tCO₂eq/ton" source="SEMARNAT" />
                  <MethodRow label="Metales" value="5.73 tCO₂eq/ton" source="GHG Protocol" />
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[2px] text-gray-400 mb-6">
                  Equivalencias Ambientales
                </h3>
                <div className="space-y-1">
                  <MethodRow label="Árboles Salvados" value="1.2 árboles/ton" source="CONAFOR" />
                  <MethodRow label="Agua Conservada" value="15,000 L/ton" source="UNESCO" />
                  <MethodRow label="Energía Ahorrada" value="3,200 kWh/ton" source="IEA" />
                  <MethodRow label="Combustible Fósil" value="0.89 L diesel/ton" source="CFE" />
                </div>
              </div>
            </div>

            {/* Certifications strip */}
            <div className="flex items-center justify-center gap-12 mt-16 pt-12 border-t border-gray-100">
              {['EPA', 'IPCC 2023', 'CONAFOR', 'GHG Protocol'].map((name) => (
                <span key={name} className="text-sm font-medium text-gray-300 tracking-wide">
                  {name}
                </span>
              ))}
            </div>
          </section>

        </div>
      </div>
    </AppLayout>
  );
}

/* ─── Sub-components ─── */

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="text-center">
      <div>{value}</div>
      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-[1.5px] mt-2">{label}</p>
    </div>
  );
}

function BreakdownCell({
  label,
  value,
  icon,
  negative = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  negative?: boolean;
}) {
  return (
    <div className="bg-white p-8 text-center">
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-4 ${negative ? 'bg-red-50 text-red-400' : 'bg-gray-50 text-gray-400'}`}>
        {icon}
      </div>
      <div>
        <AnimatedCounter
          end={value}
          decimals={1}
          className={`text-2xl font-semibold tracking-tight ${negative ? 'text-red-500' : 'text-gray-900'}`}
        />
        <span className={`text-sm ml-1 ${negative ? 'text-red-300' : 'text-gray-300'}`}>ton</span>
      </div>
      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-[1.5px] mt-2">{label}</p>
    </div>
  );
}

function ImpactMetric({
  value,
  label,
  sub,
  color,
}: {
  value: number;
  label: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <AnimatedCounter
        end={value}
        separator
        className={`text-4xl font-semibold tracking-tight ${color}`}
      />
      <p className="text-sm font-medium text-gray-700 mt-2">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

function ModuleCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href}>
      <div className="group cursor-pointer flex items-center gap-4 bg-white rounded-xl px-6 py-5 hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100">
        {icon}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

function MethodRow({ label, value, source }: { label: string; value: string; source: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div>
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-[10px] text-gray-300 ml-2">{source}</span>
      </div>
      <span className="text-sm font-mono text-gray-500">{value}</span>
    </div>
  );
}
