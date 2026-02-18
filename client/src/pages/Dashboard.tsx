import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter';
import { MonthlyDeviationChart } from '@/components/dashboard/MonthlyDeviationChart';
import { WasteFlowVisualization } from '@/components/dashboard/WasteFlowVisualization';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { useTrueYearData, TrueYearMonthData } from '@/hooks/useTrueYearData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Recycle,
  Leaf,
  Award,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Trophy,
  TreePine,
  Droplets,
  Zap,
  Wind,
  Calendar,
  DollarSign,
  MinusCircle,
  PlusCircle,
  Save,
} from 'lucide-react';
import { Link } from 'wouter';


/* ── RECUPERA Real Market Prices (MXN per kg) — Jan & Mar 2025 bitácoras ── */
const PRECIO_RECUPERA: Record<string, number> = {
  'Mixed Paper': 1.50,
  'Office paper': 1.50,
  'Magazines': 1.50,
  'Newspaper': 1.50,
  'Carboard': 0.50,
  'PET': 3.00,
  'RIgid plastic': 0.80,
  'HDPE': 0.80,
  'Tin Can': 2.00,
  'Aluminium': 12.00,
  'Glass': 0.00,
  'Scrap metal': 2.00,
  'E Waste': 0.00,
};
/* ── TDI Recolección RSU — Real invoice data (Jan–Oct 2024, Feb 2025) ── */
// $1,312.50/servicio semanal × 4-5 servicios/mes
// Promedio mensual (10 facturas): $5,775 subtotal sin IVA
const COSTO_SERVICIO_TDI = 1312.50; // MXN por servicio semanal
const COSTO_MENSUAL_TDI = 5775;     // MXN promedio mensual (subtotal)

/* ── Dashboard ── */
export default function Dashboard() {
  const { months, totals, isLoading } = useTrueYearData();

  const divTon = totals.totalDiverted / 1000;
  const recTon = totals.totalRecycling / 1000;
  const comTon = totals.totalCompost / 1000;
  const reuTon = totals.totalReuse / 1000;

  const lanTon = totals.totalLandfill / 1000;
  const genTon = totals.totalGenerated / 1000;

  // TRUE Year = 12 months of TDI service
  const numMeses = months.length || 12;
  const costoRellenoAnual = numMeses * COSTO_MENSUAL_TDI;
  const costoRellenoMensual = COSTO_MENSUAL_TDI;

  // Real income from RECUPERA — per-material prices
  const ingresosReciclables = useMemo(() => {
    let total = 0;
    months.forEach((m) => {
      m.recycling.forEach((item) => {
        total += (item.kg || 0) * (PRECIO_RECUPERA[item.material] || 0);
      });
    });
    return total;
  }, [months]);

  // Impact equivalences — per-category factors (EPA WARM model based)
  // Recycling: mixed paper/plastic/metal/glass avg
  // Composting: methane avoidance from organic diversion
  // Reuse: highest impact — avoids both extraction and reprocessing
  const co2Recycling = totals.totalRecycling * 1.1;  // kg CO2e per kg recycled
  const co2Compost = totals.totalCompost * 0.5;      // kg CO2e per kg composted (methane avoidance)
  const co2Reuse = totals.totalReuse * 1.5;          // kg CO2e per kg reused
  const co2Avoided = co2Recycling + co2Compost + co2Reuse;

  const treesEquivalent = Math.round(co2Avoided / 22); // 1 mature tree absorbs ~22 kg CO2/year

  const waterRecycling = totals.totalRecycling * 7;    // liters saved per kg recycled
  const waterCompost = totals.totalCompost * 2;        // liters saved per kg composted
  const waterReuse = totals.totalReuse * 10;           // liters saved per kg reused
  const waterSaved = waterRecycling + waterCompost + waterReuse;

  const energyRecycling = totals.totalRecycling * 3;   // kWh saved per kg recycled
  const energyCompost = totals.totalCompost * 0.5;     // kWh saved per kg composted
  const energyReuse = totals.totalReuse * 4;           // kWh saved per kg reused
  const energySaved = energyRecycling + energyCompost + energyReuse;

  // Hero metric cards
  const mainMetrics = [
    {
      label: 'Desviacion TRUE',
      value: totals.diversionRate,
      suffix: '%',
      target: 90,
      icon: Recycle,
      gradient: 'from-emerald-400 to-teal-500',
      description: 'Certificacion Zero Waste',
    },
    {
      label: 'Reciclaje',
      value: recTon,
      suffix: ' ton',
      target: null,
      icon: Recycle,
      gradient: 'from-teal-400 to-cyan-500',
      description: 'Materiales reciclados',
    },
    {
      label: 'Composta',
      value: comTon,
      suffix: ' ton',
      target: null,
      icon: Leaf,
      gradient: 'from-amber-400 to-orange-500',
      description: 'Organicos procesados',
    },
    {
      label: 'Reuso',
      value: reuTon,
      suffix: ' ton',
      target: null,
      icon: Recycle,
      gradient: 'from-violet-400 to-purple-500',
      description: 'Materiales reutilizados',
    },
  ];

  // Impact equivalences cards — use readable units
  const co2Tons = co2Avoided / 1000; // convert kg to tons
  const waterThousands = waterSaved / 1000; // convert liters to thousands
  const energyMwh = energySaved / 1000; // convert kWh to MWh

  const impactCards = [
    {
      icon: Wind,
      value: co2Tons,
      label: 'ton CO2e',
      description: 'emisiones evitadas',
      decimals: 1,
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
    {
      icon: TreePine,
      value: treesEquivalent,
      label: 'arboles',
      description: 'equivalentes plantados por año',
      decimals: 0,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      icon: Droplets,
      value: waterThousands,
      label: 'miles de litros',
      description: 'de agua ahorrados',
      decimals: 1,
      color: 'from-sky-500 to-blue-600',
      bgColor: 'bg-sky-50',
      iconColor: 'text-sky-600',
    },
    {
      icon: Zap,
      value: energyMwh,
      label: 'MWh',
      description: 'de energia ahorrados',
      decimals: 1,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  // Monthly composition data for stacked bar chart
  const monthLabelsES: Record<number, string> = {
    1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun',
    7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic',
  };

  const monthlyBarData = months.map((m) => ({
    month: monthLabelsES[m.monthNum] || m.label,
    recycling: m.totalRecycling,
    compost: m.totalCompost,
    reuse: m.totalReuse,
    landfill: m.totalLandfill,
  }));

  // Data for AI Insights — includes diversionRate per month
  const monthlyInsightData = months.map((m) => ({
    month: monthLabelsES[m.monthNum] || m.label,
    recycling: m.totalRecycling,
    compost: m.totalCompost,
    reuse: m.totalReuse,
    landfill: m.totalLandfill,
    diversionRate: m.diversionRate,
  }));



  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ═══ 1. HERO SECTION ═══ */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30 p-8 border border-gray-200 shadow-premium-xl">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-3xl rounded-full"
              />
              <motion.div
                animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-violet-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-full"
              />
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mb-2"
                  >
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      </motion.div>
                      <span className="text-sm font-medium text-emerald-400">
                        En vivo
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      Actualizado ahora
                    </span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                  >
                    Panel de Sustentabilidad
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-600 text-lg"
                  >
                    Club Campestre Ciudad de Mexico &middot; Compromiso ambiental
                    en tiempo real
                  </motion.p>
                </div>

                {/* Certification badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
                >
                  <Trophy className="w-6 h-6 text-emerald-400" />
                  <div>
                    <div className="text-sm font-semibold text-emerald-400">
                      TRUE Zero Waste
                    </div>
                    <div className="text-xs text-emerald-400/70">
                      91.1% desviacion alcanzada
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Central metric */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8 py-6"
              >
                <div className="text-gray-600 text-sm uppercase tracking-wider mb-2">
                  Residuos desviados del relleno sanitario
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-6xl md:text-7xl font-bold text-gray-900">
                    <AnimatedCounter
                      end={divTon}
                      decimals={1}
                      duration={2500}
                    />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-emerald-600">
                      toneladas
                    </div>
                    <div className="text-gray-600">este periodo</div>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-3 text-center"
                >
                  <div className="text-lg font-semibold text-gray-700">
                    Costo actual TDI:{' '}
                    <span className="text-emerald-600 font-bold">
                      ${costoRellenoMensual.toLocaleString('es-MX')}/mes
                    </span>{' '}
                    por recoleccion
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${COSTO_SERVICIO_TDI.toLocaleString('es-MX')}/servicio semanal — Facturas TDI reales
                  </div>
                </motion.div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
                  className="h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto max-w-md mt-4 rounded-full"
                />
              </motion.div>

              {/* Grid of metric cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mainMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-5 hover:border-gray-300 hover:shadow-lg transition-all">
                      {/* Icon with gradient */}
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-r ${metric.gradient} flex items-center justify-center mb-4 shadow-lg`}
                      >
                        <metric.icon className="w-5 h-5 text-white" />
                      </div>

                      {/* Value */}
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-bold text-gray-900">
                          <AnimatedCounter
                            end={metric.value}
                            decimals={1}
                            duration={2000}
                          />
                        </span>
                        <span className="text-lg text-gray-600">
                          {metric.suffix}
                        </span>
                      </div>

                      {/* Label */}
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {metric.label}
                      </div>
                      <div className="text-xs text-gray-600">
                        {metric.description}
                      </div>

                      {/* Progress toward target (only if target exists) */}
                      {metric.target !== null && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progreso</span>
                            <span>Meta: {metric.target}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                              }}
                              transition={{
                                delay: 0.5 + index * 0.1,
                                duration: 1,
                              }}
                              className={`h-full bg-gradient-to-r ${metric.gradient} rounded-full`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Trend indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-200"
              >
                <div className="flex items-center gap-2 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">
                    {totals.diversionRate.toFixed(1)}% tasa de desviacion
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-300" />
                <div className="flex items-center gap-2 text-gray-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm">Superando meta TRUE 90%</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ═══ QUICK ACTION: Registro Diario ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Link
              href="/registro-diario"
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200"
            >
              <Save className="w-5 h-5" />
              <span className="text-base font-semibold">Registro Diario</span>
              <ArrowUpRight className="w-4 h-4 ml-auto opacity-70" />
            </Link>
          </motion.div>

          {/* ═══ 2. IMPACT EQUIVALENCES ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {impactCards.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.4 + index * 0.1,
                    type: 'spring',
                    stiffness: 100,
                    damping: 15,
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    transition: { type: 'spring', stiffness: 400 },
                  }}
                  className={`relative overflow-hidden rounded-2xl p-5 ${item.bgColor} border border-white/50 shadow-sm hover:shadow-xl transition-shadow duration-300`}
                >
                  {/* Subtle background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5`}
                  />

                  {/* Icon */}
                  <div className={`${item.iconColor} mb-3`}>
                    <item.icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>

                  {/* Animated value */}
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    <AnimatedCounter
                      end={item.value}
                      duration={2500}
                      decimals={item.decimals}
                      separator={true}
                    />
                  </div>

                  {/* Labels */}
                  <div className="text-sm font-semibold text-gray-700">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </div>

                  {/* Glow effect */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/30 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ═══ 3. FINANCIAL ANALYSIS ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <GlassCard variant="default" hover={false}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Analisis Financiero de Residuos</h3>
                  <p className="text-sm text-gray-500">Impacto economico de tu gestion actual</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Costos TDI recolección */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border-2 border-red-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <MinusCircle className="w-8 h-8 text-red-600" />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Costo Recoleccion TDI</h4>
                      <p className="text-sm text-gray-600">{numMeses} meses de servicio</p>
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-red-600 mb-4">
                    ${costoRellenoAnual.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-gray-500 bg-white/50 rounded-lg p-3 border border-red-100">
                    ${COSTO_SERVICIO_TDI.toLocaleString('es-MX')}/servicio × ~4.4/mes — Facturas TDI reales
                  </div>
                </div>

                {/* Ingresos RECUPERA */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <PlusCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Ingresos RECUPERA</h4>
                      <p className="text-sm text-gray-600">Venta de reciclables</p>
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-green-600 mb-4">
                    ${ingresosReciclables.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-gray-500 bg-white/50 rounded-lg p-3 border border-green-100">
                    Precios reales: Aluminio $12/kg, PET $3/kg, Papel $1.50/kg, Carton $0.50/kg
                  </div>
                </div>

                {/* Balance neto */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Balance Neto</h4>
                      <p className="text-sm text-gray-600">Ingresos reciclaje − costo TDI</p>
                    </div>
                  </div>
                  <div className={`text-5xl font-bold mb-4 ${ingresosReciclables - costoRellenoAnual >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                    {ingresosReciclables - costoRellenoAnual >= 0 ? '' : '-'}${Math.abs(ingresosReciclables - costoRellenoAnual).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-gray-500 bg-white/50 rounded-lg p-3 border border-blue-100">
                    Recuperacion de {((ingresosReciclables / costoRellenoAnual) * 100).toFixed(0)}% del costo de recoleccion
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* ═══ 4. SANKEY DIAGRAM (Avandaro style) ═══ */}
          {months.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <WasteFlowVisualization months={months} />
            </motion.div>
          )}

          {/* ═══ 4. TWO-COLUMN GRID: Monthly Deviation + Stacked Bar ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Monthly Deviation Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassCard variant="default" hover={false} className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Tendencia de Desviacion
                      </h3>
                      <p className="text-sm text-gray-500">
                        Evolucion mensual TRUE Year
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
                    <Recycle className="w-4 h-4" />
                    <span>Meta: 90%</span>
                  </div>
                </div>

                <div style={{ height: '280px' }}>
                  <MonthlyDeviationChart months={months} />
                </div>
              </GlassCard>
            </motion.div>

            {/* Right: Stacked Bar Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <GlassCard variant="default" hover={false} className="h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Composicion por Mes
                      </h3>
                      <p className="text-sm text-gray-500">
                        Desglose de residuos por categoria
                      </p>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="hidden md:flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-teal-500" />
                      <span className="text-gray-600">Reciclaje</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-gray-600">Composta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-violet-500" />
                      <span className="text-gray-600">Reuso</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <span className="text-gray-600">Relleno</span>
                    </div>
                  </div>
                </div>

                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyBarData} barCategoryGap="15%">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: number) => [
                          `${value.toLocaleString()} kg`,
                          '',
                        ]}
                      />
                      <Bar
                        dataKey="recycling"
                        fill="#14b8a6"
                        radius={[4, 4, 0, 0]}
                        stackId="a"
                        name="Reciclaje"
                      />
                      <Bar
                        dataKey="compost"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        stackId="a"
                        name="Composta"
                      />
                      <Bar
                        dataKey="reuse"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                        stackId="a"
                        name="Reuso"
                      />
                      <Bar
                        dataKey="landfill"
                        fill="#9ca3af"
                        radius={[4, 4, 0, 0]}
                        stackId="a"
                        name="Relleno"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* ═══ 6. AI INSIGHTS ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <AIInsights
              deviationRate={totals.diversionRate}
              totalDiverted={totals.totalDiverted}
              totalLandfill={totals.totalLandfill}
              totalRecycling={totals.totalRecycling}
              totalCompost={totals.totalCompost}
              totalReuse={totals.totalReuse}
              monthlyData={monthlyInsightData}
            />
          </motion.div>

          {/* ═══ 7. FOOTER ═══ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-8 py-6 border-t border-gray-200"
          >
            <div className="flex items-center gap-2 text-gray-500">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium">
                Certificacion TRUE Zero Waste
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-500">
              <Leaf className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium">
                Compromiso Sustentable CCCM
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
