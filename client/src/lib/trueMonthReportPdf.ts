import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import i18n from './i18n';
import logoPath from '@assets/Logo-ECONOVA-OF_Blanco.png';
import cccmLogo from '@assets/CCCM_1754423231662.png';
import type { TrueYearMonthData } from '@/hooks/useTrueYearData';

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
  return new Intl.NumberFormat(i18n.language === 'es' ? 'es-MX' : 'en-US', { 
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

function addHeader(doc: jsPDF, title: string = 'REPORTE MENSUAL TRUE') {
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

interface MonthReportData {
  month: TrueYearMonthData;
  materials: {
    recycling: string[];
    compost: string[];
    reuse: string[];
    landfill: string[];
  };
}

export async function generateTrueMonthPdfReport(data: MonthReportData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const totalPages = 3;
  const month = data.month;
  
  // Calculate monthly KPIs
  const totalRecycling = month.recycling.reduce((sum, e) => sum + e.kg, 0);
  const totalCompost = month.compost.reduce((sum, e) => sum + e.kg, 0);
  const totalReuse = month.reuse.reduce((sum, e) => sum + e.kg, 0);
  const totalLandfill = month.landfill.reduce((sum, e) => sum + e.kg, 0);
  const totalDiverted = totalRecycling + totalCompost + totalReuse;
  const totalGenerated = totalDiverted + totalLandfill;
  const diversionRate = totalGenerated > 0 ? (totalDiverted / totalGenerated) * 100 : 0;
  const isPassing = diversionRate >= 90;

  // ===== PAGE 1: COVER AND SUMMARY =====
  const monthReportTitle = i18n.language === 'es' ? 'REPORTE MENSUAL TRUE ZERO WASTE' : 'TRUE ZERO WASTE MONTHLY REPORT';
  addHeader(doc, monthReportTitle);
  
  let y = 32;
  
  // Title section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...parseHexColor(COLORS.navy));
  doc.text(t('pdf.trueZeroWaste'), 105, y, { align: 'center' });
  y += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(...parseHexColor(COLORS.darkGray));
  doc.text(month.label, 105, y, { align: 'center' });
  y += 8;
  
  doc.setFontSize(12);
  doc.text(t('pdf.clubName'), 105, y, { align: 'center' });
  y += 15;

  // Diversion Rate Panel
  doc.setFillColor(...parseHexColor(COLORS.lightGray));
  doc.roundedRect(15, y, 180, 50, 4, 4, 'F');
  
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
  const summaryTitle = i18n.language === 'es' ? 'RESUMEN DEL MES (kg)' : 'MONTHLY SUMMARY (kg)';
  doc.text(summaryTitle, 15, y);
  y += 8;

  const metricsData = [
    [t('pdf.totalRecycled'), formatNumber(totalRecycling, 2), 'kg'],
    [t('pdf.totalComposted'), formatNumber(totalCompost, 2), 'kg'],
    [t('pdf.totalReused'), formatNumber(totalReuse, 2), 'kg'],
    [t('pdf.totalDiverted'), formatNumber(totalDiverted, 2), 'kg'],
    [t('pdf.totalLandfill'), formatNumber(totalLandfill, 2), 'kg'],
    [t('pdf.totalGenerated'), formatNumber(totalGenerated, 2), 'kg'],
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

  // Diversion breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...parseHexColor(COLORS.navy));
  doc.text(t('pdf.diversionComposition'), 15, y);
  y += 8;

  const recyclingPct = totalDiverted > 0 ? (totalRecycling / totalDiverted) * 100 : 0;
  const compostPct = totalDiverted > 0 ? (totalCompost / totalDiverted) * 100 : 0;
  const reusePct = totalDiverted > 0 ? (totalReuse / totalDiverted) * 100 : 0;

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

  // ===== PAGE 2: DETAILED MATERIALS BY CATEGORY =====
  doc.addPage();
  const materialsTitle = i18n.language === 'es' ? 'DETALLE DE MATERIALES POR CATEGORÍA' : 'MATERIALS DETAIL BY CATEGORY';
  addHeader(doc, materialsTitle);
  
  y = 32;

  // RECYCLING Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...parseHexColor(COLORS.blue));
  const recyclingTitle = i18n.language === 'es' ? 'RECICLAJE' : 'RECYCLING';
  doc.text(recyclingTitle, 15, y);
  y += 8;

  if (month.recycling.length > 0) {
    const recyclingData = month.recycling.map(entry => [
      entry.material,
      formatNumber(entry.kg, 1),
      'kg'
    ]);

    autoTable(doc, {
      startY: y,
      head: [[i18n.language === 'es' ? 'Material' : 'Material', i18n.language === 'es' ? 'Cantidad' : 'Quantity', 'kg']],
      body: recyclingData,
      theme: 'striped',
      headStyles: { 
        fillColor: parseHexColor(COLORS.blue),
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 20, halign: 'center' }
      },
      margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...parseHexColor(COLORS.darkGray));
    doc.text(i18n.language === 'es' ? 'Sin datos' : 'No data', 15, y);
    y += 10;
  }

  // COMPOST Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...parseHexColor(COLORS.green));
  const compostTitle = i18n.language === 'es' ? 'COMPOSTA / ORGÁNICOS' : 'COMPOST / ORGANICS';
  doc.text(compostTitle, 15, y);
  y += 8;

  if (month.compost.length > 0) {
    const compostData = month.compost.map(entry => [
      entry.category,
      formatNumber(entry.kg, 1),
      'kg'
    ]);

    autoTable(doc, {
      startY: y,
      head: [[i18n.language === 'es' ? 'Categoría' : 'Category', i18n.language === 'es' ? 'Cantidad' : 'Quantity', 'kg']],
      body: compostData,
      theme: 'striped',
      headStyles: { 
        fillColor: parseHexColor(COLORS.green),
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 20, halign: 'center' }
      },
      margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...parseHexColor(COLORS.darkGray));
    doc.text(i18n.language === 'es' ? 'Sin datos' : 'No data', 15, y);
    y += 10;
  }

  // REUSE Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...parseHexColor(COLORS.lime));
  const reuseTitle = i18n.language === 'es' ? 'REÚSO' : 'REUSE';
  doc.text(reuseTitle, 15, y);
  y += 8;

  if (month.reuse.length > 0) {
    const reuseData = month.reuse.map(entry => [
      entry.category,
      formatNumber(entry.kg, 1),
      'kg'
    ]);

    autoTable(doc, {
      startY: y,
      head: [[i18n.language === 'es' ? 'Categoría' : 'Category', i18n.language === 'es' ? 'Cantidad' : 'Quantity', 'kg']],
      body: reuseData,
      theme: 'striped',
      headStyles: { 
        fillColor: parseHexColor(COLORS.lime),
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 20, halign: 'center' }
      },
      margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...parseHexColor(COLORS.darkGray));
    doc.text(i18n.language === 'es' ? 'Sin datos' : 'No data', 15, y);
    y += 10;
  }

  // LANDFILL Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...parseHexColor(COLORS.red));
  const landfillTitle = i18n.language === 'es' ? 'RELLENO SANITARIO' : 'LANDFILL';
  doc.text(landfillTitle, 15, y);
  y += 8;

  if (month.landfill.length > 0) {
    const landfillData = month.landfill.map(entry => [
      entry.wasteType,
      formatNumber(entry.kg, 1),
      'kg'
    ]);

    autoTable(doc, {
      startY: y,
      head: [[i18n.language === 'es' ? 'Tipo' : 'Type', i18n.language === 'es' ? 'Cantidad' : 'Quantity', 'kg']],
      body: landfillData,
      theme: 'striped',
      headStyles: { 
        fillColor: parseHexColor(COLORS.red),
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 20, halign: 'center' }
      },
      margin: { left: 15, right: 15 },
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...parseHexColor(COLORS.darkGray));
    doc.text(i18n.language === 'es' ? 'Sin datos' : 'No data', 15, y);
  }

  addFooter(doc, 2, totalPages);

  // ===== PAGE 3: CERTIFICATION STATUS AND SUMMARY =====
  doc.addPage();
  addHeader(doc, t('pdf.certificationStatus'));
  
  y = 35;

  // Monthly certification status
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
    [t('pdf.totalWeightGenerated'), `${formatNumber(totalGenerated / 1000, 2)} ${t('pdf.tons')}`],
    [t('pdf.totalWeightDiverted'), `${formatNumber(totalDiverted / 1000, 2)} ${t('pdf.tons')}`],
    [t('pdf.weightToLandfill'), `${formatNumber(totalLandfill / 1000, 2)} ${t('pdf.tons')}`],
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

  addFooter(doc, 3, totalPages);

  // Generate and download the PDF
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = blobUrl;
  const monthLabel = month.label.replace(/\s+/g, '_');
  link.download = `Reporte_TRUE_Mensual_${monthLabel}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}

