import { SankeyData, SankeyNode, SankeyLink } from '@/components/SankeyDiagram';
import { MonthlyDeviationData } from '@shared/schema';

// Color mapping for different waste streams - Following reference design
export const WASTE_STREAM_COLORS = {
  // Sources - Orange/salmon gradient
  'generation': '#FF8C5C', 
  'club_general': '#FF9C6C', 
  'kitchen': '#FFAC7C', 
  'landscaping': '#81C784', 
  'maintenance': '#90A4AE', 
  
  // Processing/Categories - Smooth transitions
  'recyclables': '#42A5F5', // Blue like reference
  'organics': '#81C784', // Green like reference  
  'reuse': '#4FC3F7', // Light blue
  'inorganics': '#90A4AE', // Gray like reference
  
  // Specific materials - Blue spectrum
  'paper': '#42A5F5',
  'plastic': '#26C6DA',
  'metal': '#66BB6A',
  'glass': '#29B6F6',
  'cardboard': '#5DADE2',
  'compost_materials': '#81C784',
  'donations': '#4FC3F7',
  
  // Destinations - Final colors
  'recycling_center': '#42A5F5',
  'composting_facility': '#81C784',
  'donation_center': '#4FC3F7',
  'landfill': '#90A4AE',
  'specialized_processor': '#64B5F6'
} as const;

interface WasteFlowData {
  monthlyData: MonthlyDeviationData;
  period: string;
}

// Transform monthly deviation data to Sankey format
export function transformToSankeyData(data: WasteFlowData): SankeyData {
  const { monthlyData } = data;
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];

  // Validate input data
  if (!monthlyData) {
    console.warn('No monthly data provided to Sankey transformer');
    return { nodes: [], links: [] };
  }

  // Helper function to add node if it doesn't exist
  const addNode = (id: string, label: string, category: 'source' | 'process' | 'destination', color?: string) => {
    if (!nodes.find(n => n.id === id)) {
      nodes.push({ id, label, category, color });
    }
  };

  // Helper function to add link
  const addLink = (source: string, target: string, value: number, color?: string) => {
    if (value > 0 && isFinite(value) && !isNaN(value)) {
      links.push({ source, target, value, color });
    }
  };

  // Add source nodes - using Spanish labels like reference
  addNode('total_generated', 'Eventos e Instalaciones', 'source', WASTE_STREAM_COLORS.generation);

  // Add category processing nodes - like reference design
  addNode('recyclables_category', 'Reciclables', 'process', WASTE_STREAM_COLORS.recyclables);
  addNode('organics_category', 'Orgánicos', 'process', WASTE_STREAM_COLORS.organics);
  addNode('reuse_category', 'Casa Club', 'process', WASTE_STREAM_COLORS.reuse);
  addNode('inorganics_category', 'Inorgánicos', 'process', WASTE_STREAM_COLORS.inorganics);

  // Add destination nodes - like reference
  addNode('recycling_facility', 'Reciclaje Recupera', 'destination', WASTE_STREAM_COLORS.recycling_center);
  addNode('composting_facility', 'Biodegradación ORKA', 'destination', WASTE_STREAM_COLORS.composting_facility);
  addNode('donation_center', 'Reciclaje Verde Ciudad', 'destination', WASTE_STREAM_COLORS.donation_center);
  addNode('landfill', 'Disposición Controlada', 'destination', WASTE_STREAM_COLORS.landfill);

  // Calculate totals
  const recyclablesTotal = (monthlyData.mixedFile || 0) + 
                          (monthlyData.officePaper || 0) + 
                          (monthlyData.magazine || 0) + 
                          (monthlyData.newspaper || 0) + 
                          (monthlyData.cardboard || 0) + 
                          (monthlyData.petPlastic || 0) + 
                          (monthlyData.hdpeBlown || 0) + 
                          (monthlyData.hdpeRigid || 0) + 
                          (monthlyData.tinCan || 0) + 
                          (monthlyData.aluminum || 0) + 
                          (monthlyData.glass || 0);

  const organicsTotal = monthlyData.organicsCompost || 0;
  const reuseTotal = monthlyData.glassDonation || 0;
  const totalGenerated = monthlyData.totalGenerated || (recyclablesTotal + organicsTotal + reuseTotal);

  // Main flows from generation to categories - only add if there's actual data
  if (recyclablesTotal > 0) {
    addLink('total_generated', 'recyclables_category', recyclablesTotal, WASTE_STREAM_COLORS.recyclables);
  }
  if (organicsTotal > 0) {
    addLink('total_generated', 'organics_category', organicsTotal, WASTE_STREAM_COLORS.organics);
  }
  if (reuseTotal > 0) {
    addLink('total_generated', 'reuse_category', reuseTotal, WASTE_STREAM_COLORS.reuse);
  }

  // If there's waste going to landfill (not diverted)
  const landfillAmount = totalGenerated - (recyclablesTotal + organicsTotal + reuseTotal);
  if (landfillAmount > 0.1) { // Only add if significant amount
    addNode('inorganics_category', 'Inorgánicos', 'process', WASTE_STREAM_COLORS.inorganics);
    addLink('total_generated', 'inorganics_category', landfillAmount, WASTE_STREAM_COLORS.inorganics);
    addLink('inorganics_category', 'landfill', landfillAmount, WASTE_STREAM_COLORS.landfill);
  }

  // Detailed recyclables breakdown
  if (monthlyData.mixedFile && monthlyData.mixedFile > 0) {
    addNode('paper_materials', 'Papel Mixto', 'process', WASTE_STREAM_COLORS.paper);
    addLink('recyclables_category', 'paper_materials', monthlyData.mixedFile, WASTE_STREAM_COLORS.paper);
    addLink('paper_materials', 'recycling_facility', monthlyData.mixedFile, WASTE_STREAM_COLORS.paper);
  }

  if (monthlyData.officePaper && monthlyData.officePaper > 0) {
    addNode('office_paper', 'Papel de Oficina', 'process', WASTE_STREAM_COLORS.paper);
    addLink('recyclables_category', 'office_paper', monthlyData.officePaper, WASTE_STREAM_COLORS.paper);
    addLink('office_paper', 'recycling_facility', monthlyData.officePaper, WASTE_STREAM_COLORS.paper);
  }

  if (monthlyData.cardboard && monthlyData.cardboard > 0) {
    addNode('cardboard_materials', 'Cartón', 'process', WASTE_STREAM_COLORS.cardboard);
    addLink('recyclables_category', 'cardboard_materials', monthlyData.cardboard, WASTE_STREAM_COLORS.cardboard);
    addLink('cardboard_materials', 'recycling_facility', monthlyData.cardboard, WASTE_STREAM_COLORS.cardboard);
  }

  const plasticTotal = (monthlyData.petPlastic || 0) + (monthlyData.hdpeBlown || 0) + (monthlyData.hdpeRigid || 0);
  if (plasticTotal > 0) {
    addNode('plastic_materials', 'Plásticos', 'process', WASTE_STREAM_COLORS.plastic);
    addLink('recyclables_category', 'plastic_materials', plasticTotal, WASTE_STREAM_COLORS.plastic);
    addLink('plastic_materials', 'recycling_facility', plasticTotal, WASTE_STREAM_COLORS.plastic);
  }

  const metalTotal = (monthlyData.tinCan || 0) + (monthlyData.aluminum || 0);
  if (metalTotal > 0) {
    addNode('metal_materials', 'Metales', 'process', WASTE_STREAM_COLORS.metal);
    addLink('recyclables_category', 'metal_materials', metalTotal, WASTE_STREAM_COLORS.metal);
    addLink('metal_materials', 'recycling_facility', metalTotal, WASTE_STREAM_COLORS.metal);
  }

  if (monthlyData.glass && monthlyData.glass > 0) {
    addNode('glass_materials', 'Vidrio Reciclable', 'process', WASTE_STREAM_COLORS.glass);
    addLink('recyclables_category', 'glass_materials', monthlyData.glass, WASTE_STREAM_COLORS.glass);
    addLink('glass_materials', 'recycling_facility', monthlyData.glass, WASTE_STREAM_COLORS.glass);
  }

  // Organics flow
  if (organicsTotal > 0) {
    addNode('compost_materials', 'Materia Orgánica', 'process', WASTE_STREAM_COLORS.compost_materials);
    addLink('organics_category', 'compost_materials', organicsTotal, WASTE_STREAM_COLORS.compost_materials);
    addLink('compost_materials', 'composting_facility', organicsTotal, WASTE_STREAM_COLORS.compost_materials);
  }

  // Reuse flow
  if (reuseTotal > 0) {
    addNode('donation_materials', 'Vidrio Donación', 'process', WASTE_STREAM_COLORS.donations);
    addLink('reuse_category', 'donation_materials', reuseTotal, WASTE_STREAM_COLORS.donations);
    addLink('donation_materials', 'donation_center', reuseTotal, WASTE_STREAM_COLORS.donations);
  }

  // Filter out any invalid nodes or links
  const validNodes = nodes.filter(node => node.id && node.label);
  const validLinks = links.filter(link => 
    link.source && 
    link.target && 
    link.value > 0 && 
    isFinite(link.value) && 
    !isNaN(link.value) &&
    validNodes.some(n => n.id === link.source) &&
    validNodes.some(n => n.id === link.target)
  );

  console.log(`Sankey data: ${validNodes.length} nodes, ${validLinks.length} links`);
  
  // If no valid data, return sample data to prevent crashes
  if (validNodes.length === 0 || validLinks.length === 0) {
    console.warn('No valid Sankey data found, returning sample data');
    return {
      nodes: [
        { id: 'generacion', label: 'Generación Total', category: 'source', color: WASTE_STREAM_COLORS.generation },
        { id: 'reciclables', label: 'Reciclables', category: 'process', color: WASTE_STREAM_COLORS.recyclables },
        { id: 'centro_reciclaje', label: 'Centro de Reciclaje', category: 'destination', color: WASTE_STREAM_COLORS.recycling_center }
      ],
      links: [
        { source: 'generacion', target: 'reciclables', value: 100, color: WASTE_STREAM_COLORS.recyclables },
        { source: 'reciclables', target: 'centro_reciclaje', value: 100, color: WASTE_STREAM_COLORS.recyclables }
      ]
    };
  }
  
  return { nodes: validNodes, links: validLinks };
}

// Transform daily waste entries to Sankey format
export function transformDailyDataToSankey(dailyData: any[], period: string): SankeyData {
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];

  // Helper functions
  const addNode = (id: string, label: string, category: 'source' | 'process' | 'destination', color?: string) => {
    if (!nodes.find(n => n.id === id)) {
      nodes.push({ id, label, category, color });
    }
  };

  const addLink = (source: string, target: string, value: number, color?: string) => {
    const existingLink = links.find(l => l.source === source && l.target === target);
    if (existingLink) {
      existingLink.value += value;
    } else if (value > 0) {
      links.push({ source, target, value, color });
    }
  };

  // Process daily data
  const aggregatedData = dailyData.reduce((acc, entry) => {
    const key = `${entry.type}_${entry.material}`;
    if (!acc[key]) {
      acc[key] = {
        type: entry.type,
        material: entry.material,
        totalKg: 0,
        locations: new Set()
      };
    }
    acc[key].totalKg += entry.kg;
    acc[key].locations.add(entry.location);
    return acc;
  }, {});

  // Add source nodes (locations)
  const locationsSet = new Set(dailyData.map(entry => entry.location));
  const locations = Array.from(locationsSet);
  locations.forEach(location => {
    addNode(`source_${location}`, location, 'source', WASTE_STREAM_COLORS.club_general);
  });

  // Add main generation node
  addNode('daily_generation', 'Generación Diaria', 'source', WASTE_STREAM_COLORS.generation);

  // Process each aggregated entry
  Object.values(aggregatedData).forEach((entry: any) => {
    const { type, material, totalKg } = entry;
    
    // Add category nodes
    addNode(`category_${type}`, type.charAt(0).toUpperCase() + type.slice(1), 'process', WASTE_STREAM_COLORS[type as keyof typeof WASTE_STREAM_COLORS] || '#6b7280');
    
    // Add material nodes
    addNode(`material_${material}`, material, 'process', WASTE_STREAM_COLORS[type as keyof typeof WASTE_STREAM_COLORS] || '#6b7280');
    
    // Add destination nodes based on type
    let destinationId = 'unknown_destination';
    let destinationLabel = 'Destino Desconocido';
    let destinationColor = '#6b7280';

    switch (type) {
      case 'recycling':
        destinationId = 'recycling_center';
        destinationLabel = 'Centro de Reciclaje';
        destinationColor = WASTE_STREAM_COLORS.recycling_center;
        break;
      case 'compost':
        destinationId = 'composting_facility';
        destinationLabel = 'Planta de Compostaje';
        destinationColor = WASTE_STREAM_COLORS.composting_facility;
        break;
      case 'reuse':
        destinationId = 'donation_center';
        destinationLabel = 'Centro de Donación';
        destinationColor = WASTE_STREAM_COLORS.donation_center;
        break;
      case 'landfill':
        destinationId = 'landfill';
        destinationLabel = 'Relleno Sanitario';
        destinationColor = WASTE_STREAM_COLORS.landfill;
        break;
    }
    
    addNode(destinationId, destinationLabel, 'destination', destinationColor);

    // Create links
    addLink('daily_generation', `category_${type}`, totalKg, WASTE_STREAM_COLORS[type as keyof typeof WASTE_STREAM_COLORS]);
    addLink(`category_${type}`, `material_${material}`, totalKg, WASTE_STREAM_COLORS[type as keyof typeof WASTE_STREAM_COLORS]);
    addLink(`material_${material}`, destinationId, totalKg, destinationColor);
  });

  return { nodes, links };
}

// Validate Sankey data integrity
export function validateSankeyData(data: SankeyData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sourceTotal: number;
  destinationTotal: number;
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for orphaned nodes
  const linkedNodeIds = new Set([
    ...data.links.map(l => l.source),
    ...data.links.map(l => l.target)
  ]);

  const orphanedNodes = data.nodes.filter(node => !linkedNodeIds.has(node.id));
  if (orphanedNodes.length > 0) {
    warnings.push(`Nodos sin conexión: ${orphanedNodes.map(n => n.label).join(', ')}`);
  }

  // Check for missing nodes referenced in links
  const nodeIds = new Set(data.nodes.map(n => n.id));
  const missingNodes = data.links.filter(link => 
    !nodeIds.has(link.source) || !nodeIds.has(link.target)
  );

  if (missingNodes.length > 0) {
    errors.push(`Enlaces con nodos faltantes: ${missingNodes.length} enlaces`);
  }

  // Calculate source and destination totals
  const sourceNodes = data.nodes.filter(n => n.category === 'source').map(n => n.id);
  const destinationNodes = data.nodes.filter(n => n.category === 'destination').map(n => n.id);

  const sourceTotal = data.links
    .filter(link => sourceNodes.includes(link.source))
    .reduce((sum, link) => sum + link.value, 0);

  const destinationTotal = data.links
    .filter(link => destinationNodes.includes(link.target))
    .reduce((sum, link) => sum + link.value, 0);

  // Check mass balance
  const tolerance = 0.01; // 1% tolerance
  const massBalanceError = Math.abs(sourceTotal - destinationTotal) / Math.max(sourceTotal, destinationTotal);
  
  if (massBalanceError > tolerance) {
    errors.push(`Discrepancia en balance de masa: ${(massBalanceError * 100).toFixed(2)}%`);
  }

  // Check for negative values
  const negativeLinks = data.links.filter(link => link.value < 0);
  if (negativeLinks.length > 0) {
    errors.push(`Enlaces con valores negativos: ${negativeLinks.length} enlaces`);
  }

  // Check for zero values
  const zeroLinks = data.links.filter(link => link.value === 0);
  if (zeroLinks.length > 0) {
    warnings.push(`Enlaces con valor cero: ${zeroLinks.length} enlaces`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sourceTotal,
    destinationTotal
  };
}

// Format numbers for display
export function formatWasteValue(value: number, unit: string = 'kg'): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M ${unit}`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k ${unit}`;
  } else {
    return `${value.toFixed(1)} ${unit}`;
  }
}

// Calculate diversion rate
export function calculateDiversionRate(data: SankeyData): {
  totalGenerated: number;
  totalDiverted: number;
  diversionRate: number;
  breakdown: {
    recycled: number;
    composted: number;
    reused: number;
    landfilled: number;
  };
} {
  const destinationTotals = data.links.reduce((acc, link) => {
    const target = data.nodes.find(n => n.id === link.target);
    if (!target || target.category !== 'destination') return acc;

    if (link.target.includes('recycling')) acc.recycled += link.value;
    else if (link.target.includes('composting')) acc.composted += link.value;
    else if (link.target.includes('donation')) acc.reused += link.value;
    else if (link.target.includes('landfill')) acc.landfilled += link.value;

    return acc;
  }, { recycled: 0, composted: 0, reused: 0, landfilled: 0 });

  const totalGenerated = Object.values(destinationTotals).reduce((sum, value) => sum + value, 0);
  const totalDiverted = destinationTotals.recycled + destinationTotals.composted + destinationTotals.reused;
  const diversionRate = totalGenerated > 0 ? (totalDiverted / totalGenerated) * 100 : 0;

  return {
    totalGenerated,
    totalDiverted,
    diversionRate,
    breakdown: destinationTotals
  };
}