import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import i18n from './i18n';
import logoPath from '@assets/Logo-ECONOVA-OF_Blanco.png';
import cccmLogo from '@assets/CCCM_1754423231662.png';
import type { TrueYearData, TrueYearMonthData } from '@/hooks/useTrueYearData';

// Get translation function
const t = (key: string): string => i18n.t(key);

const COLORS = {
  navy: '#273949',
  navyLight: '#3a556f',
  lime: '#b5e951',
  limeDark: '#9aca45',
  lightGray: '#f8f9fa',
  mediumGray: '#e9ecef',
  darkGray: '#495057',
  green: '#10b981',
  red: '#ef4444',
  blue: '#3b82f6',
};

const formatNumber = (num: number, decimals: number = 1): string => {
  return new Intl.NumberFormat('es-MX', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  }).format(num);
};

function parseHexColor(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function addHeader(doc: jsPDF, title: string = 'REPORTE AÑO TRUE') {
  doc.setFillColor(...parseHexColor(COLORS.navy));
  doc.rect(0, 0, 210, 22, 'F');
  
  doc.setFillColor(...parseHexColor(COLORS.lime));
  doc.rect(0, 22, 210, 2, 'F');
  
  try {
    doc.addImage(logoPath, 'PNG', 10, 3, 32, 16, undefined, 'FAST');
  } catch (error) {
    console.error('Error adding Econova logo:', error);
  }
  
  try {
    doc.addImage(cccmLogo, 'PNG', 168, 3, 16, 16, undefined, 'FAST');
  } catch (error) {
    console.error('Error adding CCCM logo:', error);
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(title, 105, 14, { align: 'center' });
}

function addFooter(doc: jsPDF, pageNumber: number, totalPages: number) {
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setFillColor(...parseHexColor(COLORS.navy));
  doc.rect(0, pageHeight - 12, 210, 12, 'F');
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`${t('pdf.page')} ${pageNumber} ${t('pdf.of')} ${totalPages}`, 105, pageHeight - 4, { align: 'center' });
  doc.text(t('pdf.econova'), 15, pageHeight - 4);
  doc.text(new Date().toLocaleDateString(i18n.language === 'es' ? 'es-MX' : 'en-US'), 195, pageHeight - 4, { align: 'right' });
}

export async function generateTrueYearPdfReport(data: TrueYearData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const totalPages = 4;

  // ===== PAGE 1: COVER AND SUMMARY =====
  addHeader(doc, t('pdf.trueYearReport'));
  
  let y = 32;
  
  // Title section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...parseHexColor(COLORS.navy));
  doc.text(t('pdf.trueZeroWaste'), 105, y, { align: 'center' });
  y += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(...parseHexColor(COLORS.darkGray));
  const periodText = i18n.language === 'es' ? 'Período: Octubre 2024 - Septiembre 2025' : 'Period: October 2024 - September 2025';
  doc.text(periodText, 105, y, { align: 'center' });
  y += 8;
  
  doc.setFontSize(12);
  doc.text(t('pdf.clubName'), 105, y, { align: 'center' });
  y += 15;

  // Diversion Rate Panel
  doc.setFillColor(...parseHexColor(COLORS.lightGray));
  doc.roundedRect(15, y, 180, 50, 4, 4, 'F');
  
  const diversionRate = data.totals.diversionRate;
  const isPassing = diversionRate >= 90;
  
  // Main diversion rate circle
  const circleX = 60;
  const circleY = y + 25;
  doc.setFillColor(...parseHexColor(isPassing ? COLORS.green : COLORS.red));
  doc.circle(circleX, circleY, 18, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(`${formatNumber(diversionRate)}%`, circleX, circleY + 2, { align: 'center' });
  
  doc.setFontSize(9);
  doc.text(t('pdf.diversion'), circleX, circleY + 9, { align: 'center' });
  
  // Status badge
  doc.setFontSize(11);
  doc.setTextColor(...parseHexColor(isPassing ? COLORS.green : COLORS.red));
  const statusText = isPassing ? t('pdf.certificationAchieved') : t('pdf.inProgress');
  doc.text(statusText, 140, y + 15, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setTextColor(...parseHexColor(COLORS.darkGray));
  doc.text(t('pdf.trueGoal'), 140, y + 22);
  doc.text(`${t('pdf.currentStatus')}: ${formatNumber(diversionRate)}%`, 140, y + 29);
  doc.text(`${t('pdf.difference')}: ${formatNumber(diversionRate - 90, 1)}%`, 140, y + 36);
  
  y += 58;

  // Key Metrics Grid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...parseHexColor(COLORS.navy));
  doc.text(t('pdf.materialsSummary'), 15, y);
  y += 8;

  const metricsData = [
    [t('pdf.totalRecycled'), formatNumber(data.totals.totalRecycling, 2), 'kg'],
    [t('pdf.totalComposted'), formatNumber(data.totals.totalCompost, 2), 'kg'],
    [t('pdf.totalReused'), formatNumber(data.totals.totalReuse, 2), 'kg'],
    [t('pdf.totalDiverted'), formatNumber(data.totals.totalDiverted, 2), 'kg'],
    [t('pdf.totalLandfill'), formatNumber(data.totals.totalLandfill, 2), 'kg'],
    [t('pdf.totalGenerated'), formatNumber(data.totals.totalGenerated, 2), 'kg'],
  ];

  autoTable(doc, {
    startY: y,
    head: [[t('pdf.category'), t('pdf.quantity'), t('pdf.unit')]],
    body: metricsData,
    theme: 'striped',
    headStyles: { 
      fillColor: parseHexColor(COLORS.navy),
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 60, halign: 'right' },
      2: { cellWidth: 30, halign: 'center' }
    },
    margin: { left: 15, right: 15 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Diversion breakdown pie chart representation (text-based for PDF)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...parseHexColor(COLORS.navy));
  doc.text(t('pdf.diversionComposition'), 15, y);
  y += 8;

  const totalDiverted = data.totals.totalDiverted;
  const recyclingPct = totalDiverted > 0 ? (data.totals.totalRecycling / totalDiverted) * 100 : 0;
  const compostPct = totalDiverted > 0 ? (data.totals.totalCompost / totalDiverted) * 100 : 0;
  const reusePct = totalDiverted > 0 ? (data.totals.totalReuse / totalDiverted) * 100 : 0;

  // Visual bars
  const barWidth = 160;
  const barHeight = 8;
  const barX = 25;

  // Recycling bar
  doc.setFillColor(...parseHexColor(COLORS.blue));
  doc.rect(barX, y, (barWidth * recyclingPct) / 100, barHeight, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...parseHexColor(COLORS.darkGray));
  doc.text(`${t('pdf.recyclingPercent')}: ${formatNumber(recyclingPct)}%`, barX + barWidth + 5, y + 6);
  y += 12;

  // Compost bar
  doc.setFillColor(...parseHexColor(COLORS.green));
  doc.rect(barX, y, (barWidth * compostPct) / 100, barHeight, 'F');
  doc.text(`${t('pdf.compostPercent')}: ${formatNumber(compostPct)}%`, barX + barWidth + 5, y + 6);
  y += 12;

  // Reuse bar
  doc.setFillColor(...parseHexColor(COLORS.lime));
  doc.rect(barX, y, (barWidth * reusePct) / 100, barHeight, 'F');
  doc.text(`${t('pdf.reusePercent')}: ${formatNumber(reusePct)}%`, barX + barWidth + 5, y + 6);

  addFooter(doc, 1, totalPages);

  // ===== PAGE 2: MONTHLY BREAKDOWN TABLE =====
  doc.addPage();
  addHeader(doc, t('pdf.monthlyBreakdown'));
  
  y = 32;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...parseHexColor(COLORS.navy));
  doc.text(t('pdf.monthlyData') + ' (Oct 2024 - Sep 2025)', 15, y);
  y += 10;

  // Monthly data table
  const monthlyTableData = data.months.map((m: TrueYearMonthData) => [
    m.label,
    formatNumber(m.totalRecycling, 1),
    formatNumber(m.totalCompost, 1),
    formatNumber(m.totalReuse, 1),
    formatNumber(m.totalDiverted, 1),
    formatNumber(m.totalLandfill, 1),
    formatNumber(m.totalGenerated, 1),
    `${formatNumber(m.diversionRate)}%`
  ]);

  // Add totals row
  monthlyTableData.push([
    'TOTAL',
    formatNumber(data.totals.totalRecycling, 1),
    formatNumber(data.totals.totalCompost, 1),
    formatNumber(data.totals.totalReuse, 1),
    formatNumber(data.totals.totalDiverted, 1),
    formatNumber(data.totals.totalLandfill, 1),
    formatNumber(data.totals.totalGenerated, 1),
    `${formatNumber(data.totals.diversionRate)}%`
  ]);

  const monthHeader = i18n.language === 'es' ? 'Mes' : 'Month';
  const recycleHeader = i18n.language === 'es' ? 'Reciclaje' : 'Recycling';
  const compostHeader = i18n.language === 'es' ? 'Compost' : 'Compost';
  const reuseHeader = i18n.language === 'es' ? 'Reúso' : 'Reuse';
  const divertedHeader = i18n.language === 'es' ? 'Desviado' : 'Diverted';
  const landfillHeader = i18n.language === 'es' ? 'Relleno' : 'Landfill';
  const totalHeader = 'Total';
  const rateHeader = i18n.language === 'es' ? 'Tasa' : 'Rate';

  autoTable(doc, {
    startY: y,
    head: [[monthHeader, recycleHeader, compostHeader, reuseHeader, divertedHeader, landfillHeader, totalHeader, rateHeader]],
    body: monthlyTableData,
    theme: 'grid',
    headStyles: { 
      fillColor: parseHexColor(COLORS.navy),
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7
    },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' },
      1: { cellWidth: 22, halign: 'right' },
      2: { cellWidth: 22, halign: 'right' },
      3: { cellWidth: 22, halign: 'right' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 24, halign: 'right' },
      7: { cellWidth: 18, halign: 'center' }
    },
    margin: { left: 15, right: 15 },
    didParseCell: function(data) {
      // Highlight totals row
      if (data.row.index === monthlyTableData.length - 1) {
        data.cell.styles.fillColor = parseHexColor(COLORS.lime) as [number, number, number];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  addFooter(doc, 2, totalPages);

  // ===== PAGE 3: RECYCLING DETAILS =====
  doc.addPage();
  const recycleMaterialsHeader = i18n.language === 'es' ? 'DETALLE DE MATERIALES RECICLABLES' : 'RECYCLABLE MATERIALS DETAIL';
  addHeader(doc, recycleMaterialsHeader);
  
  y = 32;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...parseHexColor(COLORS.navy));
  doc.text(t('pdf.recycleMaterials'), 15, y);
  y += 10;

  // Aggregate recycling materials across all months
  const recyclingMaterials: Record<string, number[]> = {};
  data.materials.recycling.forEach(material => {
    recyclingMaterials[material] = new Array(12).fill(0);
  });

  data.months.forEach((month, monthIdx) => {
    month.recycling.forEach(entry => {
      if (recyclingMaterials[entry.material]) {
        recyclingMaterials[entry.material][monthIdx] = entry.kg;
      }
    });
  });

  const recyclingTableData = Object.entries(recyclingMaterials).map(([material, values]) => {
    const total = values.reduce((sum, val) => sum + val, 0);
    return [material, ...values.map(v => v > 0 ? formatNumber(v, 1) : '-'), formatNumber(total, 1)];
  });

  const monthHeaders = data.months.map(m => {
    const parts = m.label.split(' ');
    return parts[0].substring(0, 3);
  });

  autoTable(doc, {
    startY: y,
    head: [['Material', ...monthHeaders, 'Total']],
    body: recyclingTableData,
    theme: 'grid',
    headStyles: { 
      fillColor: parseHexColor(COLORS.navy),
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 6
    },
    bodyStyles: {
      fontSize: 6
    },
    columnStyles: {
      0: { cellWidth: 28 },
    },
    margin: { left: 8, right: 8 },
  });

  addFooter(doc, 3, totalPages);

  // ===== PAGE 4: TRUE CERTIFICATION STATUS =====
  doc.addPage();
  addHeader(doc, t('pdf.certificationStatus'));
  
  y = 35;

  // TRUE certification explanation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...parseHexColor(COLORS.navy));
  doc.text(t('pdf.trueZeroWaste'), 105, y, { align: 'center' });
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...parseHexColor(COLORS.darkGray));
  const trueDescEs = [
    'La certificación TRUE (Total Resource Use and Efficiency) reconoce a las instalaciones',
    'que demuestran un compromiso con la minimización de residuos y la maximización de la',
    'eficiencia de recursos. El requisito mínimo es desviar el 90% de los residuos sólidos',
    'del relleno sanitario, incineración y medio ambiente.'
  ];
  const trueDescEn = [
    'TRUE (Total Resource Use and Efficiency) certification recognizes facilities',
    'that demonstrate a commitment to waste minimization and resource efficiency',
    'maximization. The minimum requirement is to divert 90% of solid waste from',
    'landfill, incineration, and the environment.'
  ];
  const trueDesc = i18n.language === 'es' ? trueDescEs : trueDescEn;
  trueDesc.forEach(line => {
    doc.text(line, 105, y, { align: 'center' });
    y += 5;
  });
  y += 10;

  // Current status
  doc.setFillColor(...parseHexColor(isPassing ? '#dcfce7' : '#fef2f2'));
  doc.roundedRect(20, y, 170, 40, 4, 4, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...parseHexColor(isPassing ? COLORS.green : COLORS.red));
  doc.text(isPassing ? t('pdf.certificationReached') : t('pdf.pendingCertification'), 105, y + 12, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...parseHexColor(COLORS.darkGray));
  doc.text(`${t('pdf.currentDiversionRate')}: ${formatNumber(diversionRate)}%`, 105, y + 22, { align: 'center' });
  doc.text(`${t('pdf.requiredGoal')}: 90%`, 105, y + 30, { align: 'center' });
  
  y += 50;

  // Performance summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...parseHexColor(COLORS.navy));
  doc.text(t('pdf.performanceSummary'), 15, y);
  y += 8;

  const performanceData = [
    [t('pdf.totalWeightGenerated'), `${formatNumber(data.totals.totalGenerated / 1000, 2)} ${t('pdf.tons')}`],
    [t('pdf.totalWeightDiverted'), `${formatNumber(data.totals.totalDiverted / 1000, 2)} ${t('pdf.tons')}`],
    [t('pdf.weightToLandfill'), `${formatNumber(data.totals.totalLandfill / 1000, 2)} ${t('pdf.tons')}`],
    [t('pdf.diversionRate'), `${formatNumber(diversionRate)}%`],
    [t('pdf.certStatus'), isPassing ? t('pdf.meetsRequirements') : t('pdf.pendingImprovement')],
  ];

  autoTable(doc, {
    startY: y,
    head: [[t('pdf.metric'), t('pdf.value')]],
    body: performanceData,
    theme: 'striped',
    headStyles: { 
      fillColor: parseHexColor(COLORS.navy),
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 80 }
    },
    margin: { left: 25, right: 25 },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Signature section
  doc.setDrawColor(...parseHexColor(COLORS.darkGray));
  doc.setLineWidth(0.5);
  doc.line(30, y + 20, 90, y + 20);
  doc.line(120, y + 20, 180, y + 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...parseHexColor(COLORS.darkGray));
  doc.text(t('pdf.environmentalManager'), 60, y + 26, { align: 'center' });
  doc.text(t('pdf.issueDate'), 150, y + 26, { align: 'center' });

  addFooter(doc, 4, totalPages);

  // Generate and download the PDF
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `Reporte_TRUE_Year_Oct2024-Sep2025_${new Date().toISOString().split('T')[0]}.pdf`;
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}
