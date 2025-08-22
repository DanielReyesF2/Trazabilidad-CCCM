import { ResponsiveSankey } from '@nivo/sankey';
import { useState, useMemo, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Download, FileImage, FileSpreadsheet, RotateCcw, Filter, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SankeyNode {
  id: string;
  label: string;
  category: 'source' | 'process' | 'destination';
  color?: string;
  x?: number;
  y?: number;
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
  onLinkClick?: (link: SankeyLink) => void;
}

// Brand colors for different waste categories
const CATEGORY_COLORS = {
  source: '#273949', // Navy blue for sources
  recyclables: '#10b981', // Green for recyclables
  organics: '#16a34a', // Darker green for organics/compost
  reuse: '#0ea5e9', // Blue for reuse
  landfill: '#dc2626', // Red for landfill
  process: '#8b5cf6', // Purple for processing
  destination: '#b5e951' // Lime for final destinations
} as const;

const GRADIENT_COLORS = {
  recyclables: ['#10b981', '#059669'],
  organics: ['#16a34a', '#15803d'],
  reuse: ['#0ea5e9', '#0284c7'],
  landfill: ['#dc2626', '#b91c1c'],
  process: ['#8b5cf6', '#7c3aed']
} as const;

export function SankeyDiagram({ 
  data, 
  title = "Flujo de Materiales",
  subtitle,
  period,
  className = "",
  height = 600,
  onNodeClick,
  onLinkClick
}: SankeyDiagramProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipData, setTooltipData] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const sankeyRef = useRef<HTMLDivElement>(null);

  // Calculate total values for percentages
  const totalValue = useMemo(() => {
    return data.links.reduce((sum, link) => sum + link.value, 0);
  }, [data]);

  // Filter data based on selected node
  const filteredData = useMemo(() => {
    if (!selectedNode) return data;
    
    const filteredLinks = data.links.filter(link => 
      link.source === selectedNode || link.target === selectedNode
    );
    
    const connectedNodeIds = new Set<string>();
    filteredLinks.forEach(link => {
      connectedNodeIds.add(link.source);
      connectedNodeIds.add(link.target);
    });
    
    const filteredNodes = data.nodes.filter(node => 
      connectedNodeIds.has(node.id)
    );
    
    return {
      nodes: filteredNodes,
      links: filteredLinks
    };
  }, [data, selectedNode]);

  // Validate data totals
  const validation = useMemo(() => {
    const sourceTotal = data.links
      .filter(link => data.nodes.find(n => n.id === link.source)?.category === 'source')
      .reduce((sum, link) => sum + link.value, 0);
    
    const destinationTotal = data.links
      .filter(link => data.nodes.find(n => n.id === link.target)?.category === 'destination')
      .reduce((sum, link) => sum + link.value, 0);
    
    const tolerance = 0.01; // 1% tolerance for rounding
    const isValid = Math.abs(sourceTotal - destinationTotal) / Math.max(sourceTotal, destinationTotal) < tolerance;
    
    return {
      isValid,
      sourceTotal,
      destinationTotal,
      difference: Math.abs(sourceTotal - destinationTotal)
    };
  }, [data]);

  // Export to PNG (2x resolution)
  const exportToPNG = useCallback(async () => {
    if (!sankeyRef.current) return;
    
    try {
      const svg = sankeyRef.current.querySelector('svg');
      if (!svg) return;

      // Create canvas for high-res export
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set 2x resolution
      const rect = svg.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
      
      // Convert SVG to image
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        
        // Download
        canvas.toBlob((blob) => {
          if (!blob) return;
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `sankey-diagram-${period || 'export'}-2x.png`;
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
    const csvData = [
      ['Source', 'Target', 'Value (kg)', 'Percentage'],
      ...data.links.map(link => [
        link.source,
        link.target,
        link.value.toFixed(2),
        ((link.value / totalValue) * 100).toFixed(2) + '%'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sankey-data-${period || 'export'}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  }, [data.links, totalValue, period]);

  // Handle node interactions
  const handleNodeClick = useCallback((node: any) => {
    const nodeId = node.id;
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
    onNodeClick?.(node);
  }, [selectedNode, onNodeClick]);

  // Handle link hover - Note: Nivo Sankey handles link hover internally
  const handleLinkMouseEnter = useCallback((link: any, event: any) => {
    setHoveredLink(`${link.source.id}-${link.target.id}`);
    setTooltipData({
      source: link.source.label,
      target: link.target.label,
      value: link.value,
      percentage: ((link.value / totalValue) * 100).toFixed(1)
    });
    setTooltipPosition({ x: event.clientX || 0, y: event.clientY || 0 });
    setShowTooltip(true);
  }, [totalValue]);

  const handleLinkMouseLeave = useCallback(() => {
    setHoveredLink(null);
    setShowTooltip(false);
  }, []);

  const resetFilter = () => {
    setSelectedNode(null);
  };

  // Custom theme for Nivo Sankey
  const theme = {
    background: 'transparent',
    text: {
      fontSize: 12,
      fill: '#374151',
      fontWeight: 500
    },
    tooltip: {
      container: {
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '12px 16px',
        fontSize: '14px'
      }
    }
  };

  return (
    <TooltipProvider>
      <Card className={`w-full ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-[#273949] flex items-center gap-2">
              {title}
              {period && <Badge variant="outline" className="text-xs">{period}</Badge>}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Validation indicator */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${validation.isValid ? 'bg-green-500' : 'bg-red-500'}`} />
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <p><strong>Validación de Totales:</strong></p>
                  <p>Origen: {validation.sourceTotal.toFixed(2)} kg</p>
                  <p>Destino: {validation.destinationTotal.toFixed(2)} kg</p>
                  <p>Diferencia: {validation.difference.toFixed(2)} kg</p>
                  <p className={validation.isValid ? 'text-green-600' : 'text-red-600'}>
                    {validation.isValid ? '✓ Válido' : '✗ Discrepancia detectada'}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Filter reset */}
            {selectedNode && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilter}
                className="h-8 px-2"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}

            {/* Filter indicator */}
            {selectedNode && (
              <Badge variant="secondary" className="text-xs">
                <Filter className="h-3 w-3 mr-1" />
                Filtrado: {data.nodes.find(n => n.id === selectedNode)?.label}
              </Badge>
            )}

            {/* Export buttons */}
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToPNG}
                    className="h-8 w-8 p-0"
                  >
                    <FileImage className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exportar PNG (2x)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCSV}
                    className="h-8 w-8 p-0"
                  >
                    <FileSpreadsheet className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Descargar CSV</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div 
            ref={sankeyRef}
            className="w-full relative"
            style={{ height }}
          >
            <ResponsiveSankey
              data={filteredData.nodes.length > 0 && filteredData.links.length > 0 ? filteredData : {
                nodes: [
                  { id: 'no_data', label: 'Sin datos disponibles', category: 'source' }
                ],
                links: []
              }}
              margin={{ top: 40, right: 160, bottom: 40, left: 160 }}
              align="justify"
              colors={{ scheme: 'category10' }}
              nodeOpacity={1}
              nodeHoverOthersOpacity={0.35}
              nodeThickness={18}
              nodeSpacing={24}
              nodeInnerPadding={3}
              nodeBorderWidth={0}
              nodeBorderColor={{
                from: 'color',
                modifiers: [['darker', 0.8]]
              }}
              linkOpacity={0.6}
              linkHoverOthersOpacity={0.1}
              linkContract={3}
              enableLinkGradient={true}
              sort="auto"
              iterations={32}
              labelPosition="outside"
              labelOrientation="vertical"
              labelPadding={16}
              labelTextColor={{
                from: 'color',
                modifiers: [['darker', 1]]
              }}
              theme={theme}
              onClick={handleNodeClick}
            />

            {/* Custom tooltip for links */}
            <AnimatePresence>
              {showTooltip && tooltipData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none"
                  style={{
                    left: tooltipPosition.x + 10,
                    top: tooltipPosition.y - 10,
                    transform: 'translateY(-100%)'
                  }}
                >
                  <div className="font-medium text-gray-900">
                    {tooltipData.source} → {tooltipData.target}
                  </div>
                  <div className="text-sm text-gray-600">
                    {tooltipData.value.toFixed(2)} kg ({tooltipData.percentage}%)
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded" />
              <span>Reciclables</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-gradient-to-r from-green-600 to-green-700 rounded" />
              <span>Orgánicos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded" />
              <span>Reutilización</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-gradient-to-r from-red-600 to-red-700 rounded" />
              <span>Relleno Sanitario</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}