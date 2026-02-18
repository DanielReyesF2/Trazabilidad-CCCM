import { useState, useRef, useMemo } from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import html2canvas from 'html2canvas';
import {
  FileImage,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { TrueYearMonthData } from '@/hooks/useTrueYearData';

// ── Interfaces ──
interface SankeyNode {
  id: string;
  nodeColor?: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// ── Recycling material groups ──
const RECYCLING_GROUPS: Record<string, { materials: string[]; label: string }> = {
  papel: { materials: ['Mixed Paper', 'Office paper', 'Magazines', 'Newspaper', 'Carboard'], label: 'Papel y Carton' },
  plasticos: { materials: ['PET', 'RIgid plastic', 'HDPE'], label: 'Plasticos' },
  metales: { materials: ['Tin Can', 'Aluminium', 'Scrap metal'], label: 'Metales' },
  vidrio: { materials: ['Glass'], label: 'Vidrio' },
  ewaste: { materials: ['E Waste'], label: 'E-Waste' },
};

// ── Emoji labels (same style as Avandaro) ──
const nodeEmojis: Record<string, string> = {
  src_papel: '📄',
  src_plasticos: '🧴',
  src_metales: '🥫',
  src_vidrio: '🍾',
  src_ewaste: '💻',
  src_com_food: '🍽️',
  src_com_yard: '🌿',
  src_reuso: '♻️',
  src_relleno: '🗑️',
};

// ── Node colors (matching Avandaro palette) ──
const NODE_COLORS: Record<string, string> = {
  // Sources (LEFT)
  src_papel: '#f97316',
  src_plasticos: '#7c3aed',
  src_metales: '#1d4ed8',
  src_vidrio: '#059669',
  src_ewaste: '#dc2626',
  src_com_food: '#f97316',
  src_com_yard: '#16a34a',
  src_reuso: '#0ea5e9',
  src_relleno: '#6b7280',
  // Categories (MIDDLE)
  reciclables: '#3b82f6',
  organicos: '#22c55e',
  inorganicos: '#6b7280',
  // Destinations (RIGHT)
  dest_recupera: '#2563eb',
  dest_composta: '#16a34a',
  dest_reuso: '#0ea5e9',
  dest_tdi: '#64748b',
};

// ── Short labels ──
const NODE_LABELS: Record<string, string> = {
  src_papel: 'Papel y Carton',
  src_plasticos: 'Plasticos',
  src_metales: 'Metales',
  src_vidrio: 'Vidrio',
  src_ewaste: 'E-Waste',
  src_com_food: 'Alimentos',
  src_com_yard: 'Jardineria',
  src_reuso: 'Materiales Reuso',
  src_relleno: 'No Reciclable',
  reciclables: 'Reciclables',
  organicos: 'Organicos',
  inorganicos: 'Inorganicos',
  dest_recupera: 'Reciclaje RECUPERA',
  dest_composta: 'Composta CCCM',
  dest_reuso: 'Reuso Interno',
  dest_tdi: 'Disposicion Controlada',
};

interface WasteFlowVisualizationProps {
  months: TrueYearMonthData[];
}

export function WasteFlowVisualization({ months }: WasteFlowVisualizationProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const sankeyRef = useRef<HTMLDivElement>(null);

  // Build Sankey data from real monthly data
  const { sankeyData, totals } = useMemo(() => {
    const rm = new Map<string, number>();
    const cm = new Map<string, number>();
    const um = new Map<string, number>();
    const lm = new Map<string, number>();

    months.forEach((m) => {
      m.recycling.forEach((e) => rm.set(e.material, (rm.get(e.material) || 0) + (e.kg || 0)));
      m.compost.forEach((e) => cm.set(e.category, (cm.get(e.category) || 0) + (e.kg || 0)));
      m.reuse.forEach((e) => um.set(e.category, (um.get(e.category) || 0) + (e.kg || 0)));
      m.landfill.forEach((e) => lm.set(e.wasteType, (lm.get(e.wasteType) || 0) + (e.kg || 0)));
    });

    const nodes: SankeyNode[] = [];
    const links: SankeyLink[] = [];

    // ── LEFT COLUMN: Source nodes ──

    // Recycling source groups
    for (const [groupId, group] of Object.entries(RECYCLING_GROUPS)) {
      const total = group.materials.reduce((sum, mat) => sum + (rm.get(mat) || 0), 0);
      if (total > 0) {
        nodes.push({ id: `src_${groupId}`, nodeColor: NODE_COLORS[`src_${groupId}`] });
        links.push({ source: `src_${groupId}`, target: 'reciclables', value: total });
      }
    }

    // Compost sources — group food and yard waste
    let foodTotal = 0;
    let yardTotal = 0;
    cm.forEach((kg, name) => {
      if (name.toLowerCase().includes('food') || name.toLowerCase().includes('mess')) {
        foodTotal += kg;
      } else {
        yardTotal += kg;
      }
    });
    if (foodTotal > 0) {
      nodes.push({ id: 'src_com_food', nodeColor: NODE_COLORS.src_com_food });
      links.push({ source: 'src_com_food', target: 'organicos', value: foodTotal });
    }
    if (yardTotal > 0) {
      nodes.push({ id: 'src_com_yard', nodeColor: NODE_COLORS.src_com_yard });
      links.push({ source: 'src_com_yard', target: 'organicos', value: yardTotal });
    }

    // Reuse sources — consolidated
    const totalReuse = [...um.values()].reduce((a, b) => a + b, 0);
    if (totalReuse > 0) {
      nodes.push({ id: 'src_reuso', nodeColor: NODE_COLORS.src_reuso });
      links.push({ source: 'src_reuso', target: 'reciclables', value: totalReuse });
    }

    // Landfill sources — consolidated
    const totalLandfill = [...lm.values()].reduce((a, b) => a + b, 0);
    if (totalLandfill > 0) {
      nodes.push({ id: 'src_relleno', nodeColor: NODE_COLORS.src_relleno });
      links.push({ source: 'src_relleno', target: 'inorganicos', value: totalLandfill });
    }

    // ── MIDDLE COLUMN: Categories ──
    const tR = [...rm.values()].reduce((a, b) => a + b, 0) + totalReuse;
    const tC = foodTotal + yardTotal;
    const tL = totalLandfill;

    if (tR > 0) nodes.push({ id: 'reciclables', nodeColor: NODE_COLORS.reciclables });
    if (tC > 0) nodes.push({ id: 'organicos', nodeColor: NODE_COLORS.organicos });
    if (tL > 0) nodes.push({ id: 'inorganicos', nodeColor: NODE_COLORS.inorganicos });

    // ── RIGHT COLUMN: Final destinations ──
    if (tR > 0) {
      nodes.push({ id: 'dest_recupera', nodeColor: NODE_COLORS.dest_recupera });
      links.push({ source: 'reciclables', target: 'dest_recupera', value: tR });
    }
    if (tC > 0) {
      nodes.push({ id: 'dest_composta', nodeColor: NODE_COLORS.dest_composta });
      links.push({ source: 'organicos', target: 'dest_composta', value: tC });
    }
    if (tL > 0) {
      nodes.push({ id: 'dest_tdi', nodeColor: NODE_COLORS.dest_tdi });
      links.push({ source: 'inorganicos', target: 'dest_tdi', value: tL });
    }

    const totalGenerated = tR + tC + tL;
    const totalDiverted = tR + tC;
    const diversionRate = totalGenerated > 0 ? (totalDiverted / totalGenerated) * 100 : 0;

    return {
      sankeyData: { nodes, links },
      totals: { totalGenerated, totalDiverted, totalLandfill: tL, diversionRate },
    };
  }, [months]);

  // Filter data by selected node
  const filteredData = useMemo(() => {
    if (!selectedNode) return sankeyData;
    const filteredLinks = sankeyData.links.filter(
      (link) => link.source === selectedNode || link.target === selectedNode,
    );
    const relevantNodes = new Set<string>();
    filteredLinks.forEach((link) => {
      relevantNodes.add(link.source);
      relevantNodes.add(link.target);
    });
    return {
      nodes: sankeyData.nodes.filter((node) => relevantNodes.has(node.id)),
      links: filteredLinks,
    };
  }, [sankeyData, selectedNode]);

  // Export PNG (html2canvas like Avandaro)
  const exportToPNG = async () => {
    if (!sankeyRef.current) return;
    try {
      const canvas = await html2canvas(sankeyRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = 'flujos-materiales-cccm-2x.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error exporting PNG:', error);
    }
  };

  // Export CSV
  const exportToCSV = () => {
    const totalValue = sankeyData.links.reduce((sum, link) => sum + link.value, 0);
    const csvContent = [
      ['Origen', 'Destino', 'Volumen (kg)', 'Porcentaje (%)'],
      ...sankeyData.links.map((link) => [
        NODE_LABELS[link.source] || link.source,
        NODE_LABELS[link.target] || link.target,
        link.value.toFixed(2),
        ((link.value / totalValue) * 100).toFixed(1),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.download = 'flujos-materiales-cccm.csv';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const resetFilter = () => setSelectedNode(null);

  if (sankeyData.links.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-subtle p-8 shadow-premium-md animate-fade-in">
      {/* Header y Controles — exact same as Avandaro */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">
            Flujos de Materiales
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Visualizacion del flujo de residuos desde puntos de generacion hasta destino final
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedNode && (
            <button
              onClick={resetFilter}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Vista Completa</span>
            </button>
          )}

          <button
            onClick={exportToPNG}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm"
          >
            <FileImage className="w-4 h-4" />
            <span>PNG</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Diagrama Sankey — EXACT same props as Avandaro */}
      <div
        ref={sankeyRef}
        className="h-[500px] bg-gradient-to-br from-gray-50 to-white rounded-xl border border-subtle p-6 shadow-premium-sm"
      >
        <ResponsiveSankey
          data={filteredData}
          margin={{ top: 20, right: 160, bottom: 20, left: 160 }}
          align="justify"
          colors={(node: any) => NODE_COLORS[node.id] || '#64748b'}
          nodeOpacity={1}
          nodeHoverOpacity={0.9}
          nodeThickness={20}
          nodeSpacing={12}
          nodeBorderWidth={2}
          nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
          linkOpacity={0.6}
          linkHoverOpacity={0.9}
          linkContract={0}
          enableLinkGradient={true}
          labelPosition="outside"
          labelOrientation="horizontal"
          labelPadding={18}
          labelTextColor="#374151"
          label={(node: any) => {
            const emoji = nodeEmojis[node.id] || '';
            const shortLabel = NODE_LABELS[node.id] || node.id;
            return emoji ? `${emoji} ${shortLabel}` : shortLabel;
          }}
          animate={true}
          motionConfig="gentle"
          onClick={(data: any) => {
            if (data.id) {
              setSelectedNode(selectedNode === data.id ? null : data.id);
            }
          }}
        />
      </div>

      {/* Metricas de Resumen — same layout as Avandaro */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-subtle shadow-premium-sm">
          <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
            Total Generado
          </div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight">
            {(totals.totalGenerated / 1000).toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 mt-1">toneladas</div>
        </div>
        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-5 border border-emerald-200/50 shadow-premium-sm">
          <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
            Desviacion
          </div>
          <div className="text-3xl font-bold text-emerald-600 tracking-tight">
            {totals.diversionRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 mt-1">TRUE Zero Waste</div>
        </div>
        <div className="bg-gradient-to-br from-white to-teal-50 rounded-xl p-5 border border-teal-200/50 shadow-premium-sm">
          <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
            Desviados del Relleno
          </div>
          <div className="text-3xl font-bold text-teal-600 tracking-tight">
            {(totals.totalDiverted / 1000).toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 mt-1">toneladas</div>
        </div>
      </div>
    </div>
  );
}
