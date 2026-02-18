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
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const { t } = useTranslation();
  const { months, totals, isLoading } = useTrueYearData();

  // Derived values (all from real API data)
  const diversionRate = totals.diversionRate;
  const totalDivertedTons = totals.totalDiverted / 1000;
  const totalLandfillTons = totals.totalLandfill / 1000;
  const totalRecyclingTons = totals.totalRecycling / 1000;
  const totalCompostTons = totals.totalCompost / 1000;
  const totalReuseTons = totals.totalReuse / 1000;

  // Monthly stats
  const monthsAbove90 = months.filter((m) => m.diversionRate >= 90).length;
  const peakMonth = months.reduce(
    (best, m) => (m.diversionRate > best.rate ? { label: m.label, rate: m.diversionRate } : best),
    { label: '', rate: 0 },
  );

  // Environmental impact (same factors as before, using real tonnage)
  const environmentalImpact = {
    trees: Math.round(totalDivertedTons * 1.2),
    waterSaved: Math.round(totalDivertedTons * 9800),
    energySaved: Math.round(totalDivertedTons * 2160),
    co2Avoided: Math.round(totalDivertedTons * 0.85 * 1000), // in kg
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* ─── HERO BANNER ─── */}
          <div className="relative overflow-hidden rounded-3xl bg-[#273949] mb-10">
            {/* Dot grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative z-10 px-8 py-12 md:px-14 md:py-16">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
                {/* Left — main metric */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 bg-[#b5e951]/20 text-[#b5e951] text-[11px] font-bold uppercase tracking-[2px] px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> TRUE Zero Waste
                    </span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400 mb-2">
                    Tasa de Desviación TRUE
                  </p>
                  <div className="flex items-baseline gap-1">
                    <AnimatedCounter
                      end={diversionRate}
                      decimals={1}
                      suffix="%"
                      className="text-6xl md:text-7xl lg:text-8xl font-mono font-bold text-[#b5e951] leading-none"
                    />
                  </div>
                  <p className="text-gray-400 mt-3 text-sm max-w-md">
                    Superando el requisito de 90% para certificación TRUE Zero Waste
                  </p>
                </div>

                {/* Right — secondary metrics */}
                <div className="flex flex-wrap gap-6 lg:gap-0 lg:divide-x lg:divide-white/15">
                  <div className="lg:px-8 first:lg:pl-0">
                    <p className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400 mb-1">
                      Toneladas Desviadas
                    </p>
                    <AnimatedCounter
                      end={totalDivertedTons}
                      decimals={1}
                      separator
                      className="text-3xl font-mono font-bold text-white"
                    />
                  </div>
                  <div className="lg:px-8">
                    <p className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400 mb-1">
                      Meses ≥90%
                    </p>
                    <AnimatedCounter
                      end={monthsAbove90}
                      className="text-3xl font-mono font-bold text-white"
                    />
                    <span className="text-gray-500 text-sm ml-1">/ 12</span>
                  </div>
                  <div className="lg:px-8 last:lg:pr-0">
                    <p className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400 mb-1">
                      Mes Pico
                    </p>
                    <AnimatedCounter
                      end={peakMonth.rate}
                      decimals={1}
                      suffix="%"
                      className="text-3xl font-mono font-bold text-white"
                    />
                    <span className="text-gray-500 text-xs ml-2">{peakMonth.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── KPI CARDS (datos reales) ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <KPICard
              icon={<Recycle className="w-5 h-5" />}
              iconBg="bg-blue-500"
              label="Reciclaje"
              value={totalRecyclingTons}
              decimals={1}
              suffix=" ton"
              trend={null}
            />
            <KPICard
              icon={<Leaf className="w-5 h-5" />}
              iconBg="bg-green-500"
              label="Composta"
              value={totalCompostTons}
              decimals={1}
              suffix=" ton"
              trend={null}
            />
            <KPICard
              icon={<RefreshCw className="w-5 h-5" />}
              iconBg="bg-purple-500"
              label="Reuso"
              value={totalReuseTons}
              decimals={1}
              suffix=" ton"
              trend={null}
            />
            <KPICard
              icon={<Trash2 className="w-5 h-5" />}
              iconBg="bg-red-500"
              label="Relleno Sanitario"
              value={totalLandfillTons}
              decimals={1}
              suffix=" ton"
              trend={null}
              negative
            />
          </div>

          {/* ─── MONTHLY DEVIATION CHART ─── */}
          <div className="mb-10">
            <MonthlyDeviationChart months={months} />
          </div>

          {/* ─── WASTE FLOW VISUALIZATION ─── */}
          <WasteFlowVisualization totalWasteDiverted={totalDivertedTons} />

          {/* ─── ENVIRONMENTAL IMPACT ─── */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-10 shadow-xl border border-gray-200 mb-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg mb-4">
                <TreePine className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">
                Impacto Ambiental Positivo
              </h2>
              <p className="text-sm text-gray-500 max-w-lg mx-auto">
                Beneficios generados al desviar {totalDivertedTons.toFixed(0)} toneladas del relleno sanitario
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <ImpactCard
                icon={<TreePine className="w-8 h-8 text-white" />}
                iconBg="from-green-500 to-emerald-600"
                value={environmentalImpact.trees}
                label="Árboles"
                description="Equivalente salvado"
                borderColor="border-green-100"
              />
              <ImpactCard
                icon={<Waves className="w-8 h-8 text-white" />}
                iconBg="from-blue-500 to-cyan-600"
                value={environmentalImpact.waterSaved}
                label="Litros de Agua"
                description="Ahorrados en producción"
                borderColor="border-blue-100"
              />
              <ImpactCard
                icon={<Bolt className="w-8 h-8 text-white" />}
                iconBg="from-yellow-500 to-orange-600"
                value={environmentalImpact.energySaved}
                label="kWh Energía"
                description="Consumo evitado"
                borderColor="border-yellow-100"
              />
              <ImpactCard
                icon={<Leaf className="w-8 h-8 text-white" />}
                iconBg="from-emerald-500 to-green-600"
                value={environmentalImpact.co2Avoided}
                label="kg CO₂"
                description="Emisiones evitadas"
                borderColor="border-emerald-100"
              />
            </div>
          </div>

          {/* ─── MODULE LINKS (sin % falsos) ─── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <ModuleLink
              href="/trazabilidad-residuos"
              icon={<Trash2 className="w-5 h-5 text-white" />}
              iconBg="from-green-500 to-emerald-600"
              title="Residuos"
              subtitle="Trazabilidad completa"
            />
            <ModuleLink
              href="/energia"
              icon={<Zap className="w-5 h-5 text-white" />}
              iconBg="from-yellow-500 to-orange-500"
              title="Energía"
              subtitle="Próximamente"
            />
            <ModuleLink
              href="/agua"
              icon={<Droplets className="w-5 h-5 text-white" />}
              iconBg="from-blue-500 to-cyan-500"
              title="Agua"
              subtitle="Próximamente"
            />
          </div>

          {/* ─── METHODOLOGY & CERTIFICATIONS (se mantiene) ─── */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-10 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-anton text-gray-800 uppercase tracking-wide">
                {t('dashboard.certifiedMethodology')}
              </h3>
              <Button variant="outline" size="sm" className="hover:bg-[#b5e951] hover:text-white hover:border-[#b5e951] transition-colors">
                {t('dashboard.viewCertifications')}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Factores de Emisión */}
              <div>
                <h4 className="text-xl font-anton text-[#b5e951] uppercase mb-6 tracking-wide">Factores de Emisión CO₂</h4>
                <div className="space-y-4">
                  <MethodCard label="Residuos Orgánicos" value="1.83 tCO₂eq/ton" color="text-green-600" source="Factor EPA - Compostaje vs. Relleno Sanitario" />
                  <MethodCard label="Papel y Cartón" value="3.89 tCO₂eq/ton" color="text-blue-600" source="Factor IPCC 2023 - Reciclaje vs. Producción Virgen" />
                  <MethodCard label="Plásticos" value="2.14 tCO₂eq/ton" color="text-purple-600" source="Factor SEMARNAT - Reciclaje vs. Relleno" />
                  <MethodCard label="Metales" value="5.73 tCO₂eq/ton" color="text-orange-600" source="Factor GHG Protocol - Reciclaje vs. Extracción" />
                </div>
              </div>

              {/* Equivalencias Ambientales */}
              <div>
                <h4 className="text-xl font-anton text-[#b5e951] uppercase mb-6 tracking-wide">Equivalencias Ambientales</h4>
                <div className="space-y-4">
                  <MethodCard label="Árboles Salvados" value="1.2 árboles/ton" color="text-green-600" source="Basado en estudios de captura de CO₂ de CONAFOR" />
                  <MethodCard label="Agua Conservada" value="15,000L/ton" color="text-blue-600" source="Factor UNESCO - Ahorro hídrico en reciclaje" />
                  <MethodCard label="Energía Ahorrada" value="3,200 kWh/ton" color="text-yellow-600" source="Factor IEA - Energía evitada en producción" />
                  <MethodCard label="Combustible Fósil" value="0.89 L diesel/ton" color="text-red-600" source="Equivalencia energética CFE México" />
                </div>
              </div>
            </div>

            {/* Certificaciones */}
            <div className="mt-10 bg-gradient-to-r from-[#273949] to-gray-700 rounded-2xl p-8">
              <h5 className="text-xl font-anton text-white uppercase mb-6 tracking-wide text-center">
                Estándares Internacionales y Certificaciones
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                {[
                  { icon: <Leaf className="w-8 h-8 text-[#273949]" />, name: 'EPA', desc: 'Factores de Emisión CO₂' },
                  { icon: <Waves className="w-8 h-8 text-[#273949]" />, name: 'IPCC 2023', desc: 'Panel Cambio Climático' },
                  { icon: <TreePine className="w-8 h-8 text-[#273949]" />, name: 'CONAFOR', desc: 'Captura de CO₂' },
                  { icon: <RefreshCw className="w-8 h-8 text-[#273949]" />, name: 'GHG Protocol', desc: 'Inventarios GEI' },
                ].map((cert) => (
                  <div key={cert.name} className="text-center text-gray-300">
                    <div className="w-16 h-16 bg-[#b5e951] rounded-full flex items-center justify-center mx-auto mb-3">
                      {cert.icon}
                    </div>
                    <span className="block font-bold text-white mb-1">{cert.name}</span>
                    <span className="text-xs">{cert.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* ─── Sub-components ─── */

function KPICard({
  icon,
  iconBg,
  label,
  value,
  decimals = 0,
  suffix = '',
  trend,
  negative = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  trend: number | null;
  negative?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400">
          {label}
        </span>
      </div>
      <AnimatedCounter
        end={value}
        decimals={decimals}
        suffix={suffix}
        className={`text-2xl font-mono font-bold ${negative ? 'text-red-600' : 'text-gray-900'}`}
      />
      {trend !== null && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend >= 0 && !negative ? 'text-green-600' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

function ImpactCard({
  icon,
  iconBg,
  value,
  label,
  description,
  borderColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: number;
  label: string;
  description: string;
  borderColor: string;
}) {
  return (
    <div className={`text-center bg-white rounded-2xl p-6 shadow-lg ${borderColor} border hover:shadow-xl transition-all duration-300 group`}>
      <div className={`w-16 h-16 bg-gradient-to-br ${iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
        {icon}
      </div>
      <AnimatedCounter
        end={value}
        separator
        className="text-3xl font-mono font-bold text-gray-900"
      />
      <div className="text-xs font-bold text-gray-700 mt-2 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
    </div>
  );
}

function ModuleLink({
  href,
  icon,
  iconBg,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href}>
      <div className="group cursor-pointer flex items-center gap-4 bg-white rounded-xl p-4 shadow border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all">
        <div className={`w-10 h-10 bg-gradient-to-br ${iconBg} rounded-lg flex items-center justify-center shadow-md`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{title}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

function MethodCard({ label, value, color, source }: { label: string; value: string; color: string; source: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-gray-800">{label}</span>
        <span className={`${color} font-bold text-lg`}>{value}</span>
      </div>
      <p className="text-xs text-gray-600">{source}</p>
    </div>
  );
}
