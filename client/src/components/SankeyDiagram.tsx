import { ResponsiveSankey } from '@nivo/sankey';
import { useState, useMemo, useRef, useCallback } from 'react';
import { FileImage, FileText } from 'lucide-react';

export interface SankeyNode {
  id: string;
  label: string;
  category: 'source' | 'process' | 'destination';
  color?: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface SankeyDiagramProps {
  data: SankeyData;
  title?: string;
  subtitle?: string;
  period?: string;
  className?: string;
  height?: number;
  onNodeClick?: (node: SankeyNode) => void;
}

// Color map for known node IDs
const NODE_COLORS: Record<string, string> = {
  // Source
  total: '#273949',
  // Processes
  recycling: '#10b981',
  compost: '#22c55e',
  reuse: '#3b82f6',
  landfill: '#64748b',
  // Recycling materials
  recycling_Mixed_Paper: '#3b82f6',
  'recycling_Mixed Paper': '#3b82f6',
  'recycling_Office paper': '#1d4ed8',
  recycling_Magazines: '#6366f1',
  recycling_Newspaper: '#8b5cf6',
  recycling_Carboard: '#f97316',
  'recycling_Carboard': '#f97316',
  recycling_PET: '#0ea5e9',
  'recycling_RIgid plastic': '#06b6d4',
  recycling_HDPE: '#14b8a6',
  'recycling_Tin Can': '#d97706',
  recycling_Aluminium: '#9333ea',
  recycling_Glass: '#059669',
  'recycling_Scrap metal': '#64748b',
  'recycling_E Waste': '#dc2626',
  // Compost materials
  'compost_Yarde Waste': '#16a34a',
  'compost_Mulch tree brands': '#15803d',
  'compost_Food from the mess hall': '#22c55e',
  // Reuse materials
  reuse_Glass: '#2563eb',
  reuse_Food: '#0ea5e9',
  // Landfill
  landfill_Organic: '#94a3b8',
  'landfill_Non organic': '#64748b',
};

// Short labels for cleaner display
const SHORT_LABELS: Record<string, string> = {
  total: 'Total Generado',
  recycling: 'Reciclaje',
  compost: 'Composta',
  reuse: 'Reuso',
  landfill: 'Relleno',
};

function getNodeColor(node: { id: string }): string {
  if (NODE_COLORS[node.id]) return NODE_COLORS[node.id];
  // Fallback by prefix
  if (node.id.startsWith('recycling_')) return '#10b981';
  if (node.id.startsWith('compost_')) return '#22c55e';
  if (node.id.startsWith('reuse_')) return '#3b82f6';
  if (node.id.startsWith('landfill_')) return '#64748b';
  return '#6b7280';
}

export function SankeyDiagram({
  data,
  title = 'Flujo de Materiales',
  subtitle,
  period,
  className = '',
  height = 500,
  onNodeClick,
}: SankeyDiagramProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const sankeyRef = useRef<HTMLDivElement>(null);

  // Filter data based on selected node
  const filteredData = useMemo(() => {
    if (!selectedNode) return data;

    const filteredLinks = data.links.filter(
      (link) => link.source === selectedNode || link.target === selectedNode,
    );

    const connectedNodeIds = new Set<string>();
    filteredLinks.forEach((link) => {
      connectedNodeIds.add(link.source);
      connectedNodeIds.add(link.target);
    });

    return {
      nodes: data.nodes.filter((node) => connectedNodeIds.has(node.id)),
      links: filteredLinks,
    };
  }, [data, selectedNode]);

  // Calculate totals for summary cards
  const totals = useMemo(() => {
    const sourceLinks = data.links.filter(
      (link) =>
        data.nodes.find((n) => n.id === link.source)?.category === 'source',
    );
    const totalGenerated = sourceLinks.reduce(
      (sum, link) => sum + link.value,
      0,
    );
    const landfillLink = sourceLinks.find(
      (link) => link.target === 'landfill',
    );
    const landfillValue = landfillLink?.value || 0;
    const diverted = totalGenerated - landfillValue;
    const diversionRate =
      totalGenerated > 0 ? (diverted / totalGenerated) * 100 : 0;

    return { totalGenerated, diverted, landfillValue, diversionRate };
  }, [data]);

  // Export to PNG
  const exportToPNG = useCallback(async () => {
    if (!sankeyRef.current) return;
    try {
      const svg = sankeyRef.current.querySelector('svg');
      if (!svg) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = svg.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);

      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const svgBlob = new Blob([svgData], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `flujos-materiales-${period || 'export'}-2x.png`;
          link.click();
          URL.revokeObjectURL(downloadUrl);
        });

        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      console.error('Error exporting to PNG:', error);
    }
  }, [period]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const totalValue = data.links.reduce((sum, link) => sum + link.value, 0);
    const csvContent = [
      ['Origen', 'Destino', 'Volumen (kg)', 'Porcentaje (%)'],
      ...data.links.map((link) => [
        link.source,
        link.target,
        link.value.toFixed(2),
        ((link.value / totalValue) * 100).toFixed(1),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.download = `flujos-materiales-${period || 'export'}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
  }, [data.links, period]);

  const handleNodeClick = useCallback(
    (node: any) => {
      setSelectedNode(selectedNode === node.id ? null : node.id);
      onNodeClick?.(node);
    },
    [selectedNode, onNodeClick],
  );

  const resetFilter = () => setSelectedNode(null);

  const displayData =
    filteredData.nodes.length > 0 && filteredData.links.length > 0
      ? filteredData
      : { nodes: [{ id: 'no_data' }], links: [] };

  return (
    <div
      className={`bg-white rounded-xl border border-subtle p-8 shadow-premium-md animate-fade-in ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">
            {title}
            {period && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {period}
              </span>
            )}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-600 leading-relaxed">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedNode && (
            <button
              onClick={resetFilter}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
            >
              Vista Completa
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

      {/* Sankey Diagram */}
      <div
        ref={sankeyRef}
        className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-subtle p-6 shadow-premium-sm"
        style={{ height }}
      >
        <ResponsiveSankey
          data={displayData}
          margin={{ top: 20, right: 160, bottom: 20, left: 160 }}
          align="justify"
          colors={getNodeColor}
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
            return SHORT_LABELS[node.id] || node.label || node.id;
          }}
          animate={true}
          motionConfig="gentle"
          onClick={handleNodeClick}
        />
      </div>

      {/* Summary Metrics */}
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
            {(totals.diverted / 1000).toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 mt-1">toneladas</div>
        </div>
      </div>
    </div>
  );
}
