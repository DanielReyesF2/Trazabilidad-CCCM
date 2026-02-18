import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Zap,
  BarChart3,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

interface Insight {
  id: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'achievement';
  title: string;
  description: string;
  metric?: string;
  trend?: 'up' | 'down' | 'stable';
  confidence?: number;
  priority: 'high' | 'medium' | 'low';
  actionable?: string;
}

interface AIInsightsProps {
  deviationRate: number;
  totalDiverted: number; // kg
  totalLandfill: number; // kg
  totalRecycling: number; // kg
  totalCompost: number; // kg
  totalReuse: number; // kg
  monthlyData: Array<{
    month: string;
    recycling: number;
    compost: number;
    reuse: number;
    landfill: number;
    diversionRate: number;
  }>;
}

export function AIInsights({
  deviationRate,
  totalDiverted,
  totalLandfill,
  totalRecycling,
  totalCompost,
  totalReuse,
  monthlyData,
}: AIInsightsProps) {
  const [activeInsight, setActiveInsight] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnalyzing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    if (monthlyData.length === 0) return insights;

    // Compute real trends from monthly data
    const lastThree = monthlyData.slice(-3);
    const firstThree = monthlyData.slice(0, 3);

    const avgDeviationRecent =
      lastThree.reduce((s, m) => s + m.diversionRate, 0) / lastThree.length;
    const avgDeviationEarly =
      firstThree.reduce((s, m) => s + m.diversionRate, 0) / firstThree.length;
    const trendDelta = avgDeviationRecent - avgDeviationEarly;

    // Best and worst months
    const sortedByDeviation = [...monthlyData].sort(
      (a, b) => b.diversionRate - a.diversionRate,
    );
    const bestMonth = sortedByDeviation[0];
    const worstMonth = sortedByDeviation[sortedByDeviation.length - 1];

    // Total monthly landfill trend
    const avgLandfillRecent =
      lastThree.reduce((s, m) => s + m.landfill, 0) / lastThree.length;
    const avgLandfillEarly =
      firstThree.reduce((s, m) => s + m.landfill, 0) / firstThree.length;
    const landfillTrendPct =
      avgLandfillEarly > 0
        ? ((avgLandfillRecent - avgLandfillEarly) / avgLandfillEarly) * 100
        : 0;

    // Projected deviation (linear extrapolation)
    const projectedDeviation = Math.min(
      Math.max(deviationRate + trendDelta * 0.5, 0),
      100,
    );

    // Material composition analysis
    const totalProcessed = totalRecycling + totalCompost + totalReuse;
    const recyclingPct =
      totalProcessed > 0 ? (totalRecycling / totalProcessed) * 100 : 0;
    const compostPct =
      totalProcessed > 0 ? (totalCompost / totalProcessed) * 100 : 0;

    // Cost savings from diversion (MXN)
    const COSTO_RELLENO = 850; // $/ton
    const ahorroAnual = (totalDiverted / 1000) * COSTO_RELLENO;

    // ── Insight 1: Projection ──
    insights.push({
      id: '1',
      type: 'prediction',
      title: 'Proyeccion Proximo Trimestre',
      description: `Basado en ${monthlyData.length} meses de datos, la tendencia ${trendDelta >= 0 ? 'positiva' : 'a la baja'} (${trendDelta >= 0 ? '+' : ''}${trendDelta.toFixed(1)}pp) proyecta ${projectedDeviation.toFixed(1)}% de desviacion.`,
      metric: `${projectedDeviation.toFixed(1)}%`,
      trend: trendDelta >= 0 ? 'up' : 'down',
      confidence: Math.round(85 + Math.min(monthlyData.length, 12)),
      priority: 'high',
    });

    // ── Insight 2: TRUE achievement or gap ──
    if (deviationRate >= 90) {
      insights.push({
        id: '2',
        type: 'achievement',
        title: 'Meta TRUE Zero Waste Superada',
        description: `Con ${deviationRate.toFixed(1)}% de desviacion, el CCCM supera el umbral de 90% por ${(deviationRate - 90).toFixed(1)} puntos. Mejor mes: ${bestMonth.month} con ${bestMonth.diversionRate.toFixed(1)}%.`,
        metric: `${deviationRate.toFixed(1)}%`,
        priority: 'high',
      });
    } else {
      insights.push({
        id: '2',
        type: 'alert',
        title: `Faltan ${(90 - deviationRate).toFixed(1)} puntos para TRUE`,
        description: `La desviacion actual es ${deviationRate.toFixed(1)}%. Se necesita llegar a 90% para certificacion TRUE Zero Waste.`,
        metric: `${(90 - deviationRate).toFixed(1)} pts`,
        trend: 'up',
        priority: 'high',
      });
    }

    // ── Insight 3: Landfill trend ──
    insights.push({
      id: '3',
      type:
        landfillTrendPct <= 0 ? 'recommendation' : 'alert',
      title:
        landfillTrendPct <= 0
          ? 'Relleno sanitario en descenso'
          : 'Aumento en relleno sanitario',
      description:
        landfillTrendPct <= 0
          ? `El relleno sanitario bajo ${Math.abs(landfillTrendPct).toFixed(0)}% vs los primeros 3 meses. Promedio reciente: ${(avgLandfillRecent / 1000).toFixed(1)} ton/mes.`
          : `El relleno sanitario subio ${landfillTrendPct.toFixed(0)}% vs los primeros 3 meses. Promedio reciente: ${(avgLandfillRecent / 1000).toFixed(1)} ton/mes. Revisar separacion.`,
      metric: `${landfillTrendPct <= 0 ? '' : '+'}${landfillTrendPct.toFixed(0)}%`,
      trend: landfillTrendPct <= 0 ? 'down' : 'up',
      priority: landfillTrendPct > 10 ? 'high' : 'medium',
      actionable:
        landfillTrendPct > 0
          ? 'Reforzar programa de separacion en fuente'
          : undefined,
    });

    // ── Insight 4: Composition balance ──
    insights.push({
      id: '4',
      type: 'recommendation',
      title: 'Composicion de residuos desviados',
      description: `Reciclaje representa ${recyclingPct.toFixed(0)}% y composta ${compostPct.toFixed(0)}% del material desviado. ${recyclingPct > compostPct ? 'El programa de reciclaje es el pilar principal.' : 'La composta es la mayor via de desviacion.'} Mes con menor desviacion: ${worstMonth.month} (${worstMonth.diversionRate.toFixed(1)}%).`,
      metric: `${recyclingPct.toFixed(0)}% rec`,
      priority: 'medium',
    });

    // ── Insight 5: Economic savings ──
    insights.push({
      id: '5',
      type: 'recommendation',
      title: 'Ahorro acumulado en el periodo',
      description: `Al desviar ${(totalDiverted / 1000).toFixed(1)} toneladas del relleno sanitario, el CCCM evito ~$${(ahorroAnual / 1000).toFixed(0)}K MXN en costos de disposicion. Cada tonelada adicional desviada ahorra $${COSTO_RELLENO} MXN.`,
      metric: `$${(ahorroAnual / 1000).toFixed(0)}K`,
      priority: 'medium',
      actionable: 'Reducir ${(totalLandfill / 1000).toFixed(0)} ton restantes en relleno',
    });

    return insights;
  };

  const insights = generateInsights();

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'prediction':
        return <BarChart3 className="w-5 h-5" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5" />;
      case 'achievement':
        return <Target className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'prediction':
        return 'from-blue-500 to-indigo-600';
      case 'recommendation':
        return 'from-emerald-500 to-teal-600';
      case 'alert':
        return 'from-amber-500 to-orange-600';
      case 'achievement':
        return 'from-violet-500 to-purple-600';
    }
  };

  const getBgColor = (type: Insight['type']) => {
    switch (type) {
      case 'prediction':
        return 'bg-blue-50 border-blue-100';
      case 'recommendation':
        return 'bg-emerald-50 border-emerald-100';
      case 'alert':
        return 'bg-amber-50 border-amber-100';
      case 'achievement':
        return 'bg-violet-50 border-violet-100';
    }
  };

  if (isAnalyzing) {
    return (
      <GlassCard variant="primary" className="min-h-[300px]">
        <div className="flex flex-col items-center justify-center h-full py-12">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mb-4"
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-600 font-medium"
          >
            Analizando patrones ambientales...
          </motion.p>
          <div className="flex gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 bg-blue-500 rounded-full"
              />
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  if (insights.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Insights Inteligentes
            </h2>
            <p className="text-sm text-gray-500">
              Analisis basado en {monthlyData.length} meses de datos reales
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>{insights.length} insights activos</span>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Insight Principal */}
        <motion.div layout className="lg:row-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeInsight}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={`h-full rounded-2xl p-6 border ${getBgColor(insights[activeInsight].type)}`}
            >
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium mb-4 bg-gradient-to-r ${getInsightColor(insights[activeInsight].type)}`}
              >
                {getInsightIcon(insights[activeInsight].type)}
                <span className="capitalize">
                  {insights[activeInsight].type === 'prediction'
                    ? 'Prediccion'
                    : insights[activeInsight].type === 'recommendation'
                      ? 'Recomendacion'
                      : insights[activeInsight].type === 'alert'
                        ? 'Alerta'
                        : 'Logro'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {insights[activeInsight].title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {insights[activeInsight].description}
              </p>

              {insights[activeInsight].metric && (
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {insights[activeInsight].metric}
                  </div>
                  {insights[activeInsight].trend && (
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        insights[activeInsight].trend === 'up'
                          ? 'text-emerald-600'
                          : insights[activeInsight].trend === 'down'
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }`}
                    >
                      {insights[activeInsight].trend === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>Tendencia</span>
                    </div>
                  )}
                  {insights[activeInsight].confidence && (
                    <div className="text-sm text-gray-500">
                      {insights[activeInsight].confidence}% confianza
                    </div>
                  )}
                </div>
              )}

              {insights[activeInsight].actionable && (
                <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  <span>{insights[activeInsight].actionable}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Lista de insights */}
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <motion.button
              key={insight.id}
              onClick={() => setActiveInsight(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                activeInsight === index
                  ? `${getBgColor(insight.type)} ring-2 ring-offset-2 ${
                      insight.type === 'prediction'
                        ? 'ring-blue-400'
                        : insight.type === 'recommendation'
                          ? 'ring-emerald-400'
                          : insight.type === 'alert'
                            ? 'ring-amber-400'
                            : 'ring-violet-400'
                    }`
                  : 'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-r ${getInsightColor(insight.type)}`}
                  >
                    {getInsightIcon(insight.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {insight.title}
                    </h4>
                    {insight.metric && (
                      <span className="text-xs text-gray-500">
                        {insight.metric}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    activeInsight === index
                      ? 'rotate-90 text-gray-900'
                      : 'text-gray-400'
                  }`}
                />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
