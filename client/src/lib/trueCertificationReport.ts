import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logoPath from '@assets/Logo-ECONOVA-OF_Blanco.png';

// Colores corporativos
const COLORS = {
  navy: '#273949',      // Azul marino corporativo principal
  navyLight: '#3a556f', // Azul marino más claro 
  navyDark: '#1e2d3b',  // Azul marino más oscuro 
  lime: '#b5e951',      // Verde lima corporativo principal
  lightGray: '#f8f9fa', // Fondo claro
  mediumGray: '#e9ecef', // Fondo medio para paneles
  darkGray: '#495057',  // Texto secundario
};

// Función para dibujar icono de escudo para la certificación TRUE
function drawShieldIcon(doc: jsPDF, x: number, y: number, size: number = 1) {
  // Tamaño del escudo
  const shieldWidth = 10 * size;
  const shieldHeight = 12 * size;
  
  // Dibujar el contorno del escudo (forma básica)
  doc.setFillColor(39, 57, 73); // Color navy
  
  // Parte superior del escudo (rectángulo con bordes redondeados)
  doc.roundedRect(
    x - shieldWidth/2, 
    y - shieldHeight/2, 
    shieldWidth, 
    shieldHeight * 0.6, 
    1, 
    1, 
    'F'
  );
  
  // Parte inferior del escudo (forma de punta)
  doc.triangle(
    x - shieldWidth/2, 
    y - shieldHeight/2 + (shieldHeight * 0.6),
    x + shieldWidth/2, 
    y - shieldHeight/2 + (shieldHeight * 0.6),
    x, 
    y + shieldHeight/2,
    'F'
  );
  
  // Decoración interior del escudo
  doc.setFillColor(181, 233, 81); // Color lime
  doc.circle(x, y - shieldHeight/6, shieldWidth/4, 'F');
  
  // Bordes para dar profundidad
  doc.setDrawColor(20, 40, 70);
  doc.setLineWidth(0.2);
  
  // Borde parte superior
  doc.roundedRect(
    x - shieldWidth/2, 
    y - shieldHeight/2, 
    shieldWidth, 
    shieldHeight * 0.6, 
    1, 
    1, 
    'S'
  );
  
  // Borde parte inferior
  doc.line(
    x - shieldWidth/2, 
    y - shieldHeight/2 + (shieldHeight * 0.6),
    x, 
    y + shieldHeight/2
  );
  doc.line(
    x + shieldWidth/2, 
    y - shieldHeight/2 + (shieldHeight * 0.6),
    x, 
    y + shieldHeight/2
  );
}

// Función auxiliar para añadir el encabezado minimalista
function addHeader(doc: jsPDF, title: string = 'CERTIFICACIÓN TRUE ZERO WASTE') {
  // Barra superior azul 
  doc.setFillColor(parseInt(COLORS.navy.slice(1, 3), 16), parseInt(COLORS.navy.slice(3, 5), 16), parseInt(COLORS.navy.slice(5, 7), 16));
  doc.rect(0, 0, 210, 20, 'F');
  
  // Línea verde característica
  doc.setFillColor(parseInt(COLORS.lime.slice(1, 3), 16), parseInt(COLORS.lime.slice(3, 5), 16), parseInt(COLORS.lime.slice(5, 7), 16));
  doc.rect(0, 20, 210, 2, 'F');
  
  // Logo en el encabezado
  try {
    doc.addImage(logoPath, 'PNG', 10, 2, 30, 15, undefined, 'FAST');
  } catch (error) {
    console.error('Error al añadir el logo en el encabezado:', error);
  }
  
  // Título
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(title, 105, 13, { align: 'center' });
}

type ActionStatus = 'pending' | 'in-progress' | 'completed';

interface ActionItem {
  title: string;
  description: string;
  status: ActionStatus;
}

export async function generateAndDownloadTrueCertificationReport(
  clientName: string,
  currentDeviation: number,
  pendingActions: ActionItem[]
): Promise<void> {
  // Crear documento PDF 
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Añadir encabezado
  addHeader(doc);
  
  // Título principal con mayor impacto visual
  doc.setFillColor(parseInt(COLORS.navy.slice(1, 3), 16), parseInt(COLORS.navy.slice(3, 5), 16), parseInt(COLORS.navy.slice(5, 7), 16));
  doc.rect(0, 22, 210, 16, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('PLAN DE CERTIFICACIÓN TRUE ZERO WASTE', 105, 33, { align: 'center' });
  
  // Línea decorativa verde
  doc.setFillColor(parseInt(COLORS.lime.slice(1, 3), 16), parseInt(COLORS.lime.slice(3, 5), 16), parseInt(COLORS.lime.slice(5, 7), 16));
  doc.rect(0, 38, 210, 2, 'F');
  
  // Información del cliente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Cliente: ${clientName}`, 105, 50, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Fecha del reporte: ${new Date().toLocaleDateString('es-MX', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })}`, 105, 58, { align: 'center' });
  
  // Descripción de la certificación
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('La certificación TRUE (Total Resource Use and Efficiency) reconoce a las instalaciones que logran desviar al menos', 15, 75);
  doc.text('el 90% de sus residuos sólidos del relleno sanitario, incineración y medio ambiente. Este reporte presenta', 15, 82);
  doc.text('el estado actual y las acciones necesarias para alcanzar la certificación.', 15, 89);
  
  // Añadir escudo de certificación en la esquina
  drawShieldIcon(doc, 175, 80, 2);
  
  // Sección de estado actual de la certificación
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(parseInt(COLORS.navy.slice(1, 3), 16), parseInt(COLORS.navy.slice(3, 5), 16), parseInt(COLORS.navy.slice(5, 7), 16));
  doc.text('ESTADO ACTUAL', 15, 105);
  
  // Línea decorativa
  doc.setDrawColor(parseInt(COLORS.lime.slice(1, 3), 16), parseInt(COLORS.lime.slice(3, 5), 16), parseInt(COLORS.lime.slice(5, 7), 16));
  doc.setLineWidth(0.7);
  doc.line(15, 107, 80, 107);
  
  // Panel para el estado actual
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(15, 115, 180, 50, 3, 3, 'F');
  
  // Dibujar barra de progreso
  // Fondo de la barra
  doc.setFillColor(220, 220, 220);
  doc.roundedRect(30, 125, 150, 8, 4, 4, 'F');
  
  // Progreso actual
  const progressPercentage = Math.min(100, (currentDeviation / 90) * 100);
  const progressWidth = 150 * (progressPercentage / 100);
  
  // Color según el nivel de progreso
  let progressColor = '#74c278'; // Verde para nivel alto
  if (currentDeviation < 50) {
    progressColor = '#ff7f50'; // Coral para nivel crítico
  } else if (currentDeviation < 75) {
    progressColor = '#ffd166'; // Amarillo para nivel medio
  }
  
  doc.setFillColor(
    parseInt(progressColor.slice(1, 3), 16),
    parseInt(progressColor.slice(3, 5), 16),
    parseInt(progressColor.slice(5, 7), 16)
  );
  doc.roundedRect(30, 125, progressWidth, 8, 4, 4, 'F');
  
  // Marcador de meta
  const targetX = 30 + (150 * 90) / 100;
  doc.setDrawColor(39, 57, 73); // Navy
  doc.setLineWidth(1.5);
  doc.line(targetX, 120, targetX, 138);
  
  // Etiqueta de meta
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(39, 57, 73);
  doc.text('Meta 90%', targetX - 10, 117);
  
  // Indicador de desviación actual
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Índice de Desviación Actual:', 30, 150);
  
  doc.setFontSize(24);
  doc.setTextColor(39, 57, 73);
  doc.text(`${currentDeviation.toFixed(1)}%`, 160, 150, { align: 'center' });
  
  // Estado con color
  doc.setFontSize(12);
  let statusText = '';
  
  if (currentDeviation < 50) {
    statusText = 'ESTADO: CRÍTICO';
    doc.setTextColor(220, 38, 38); // Rojo
  } else if (currentDeviation < 75) {
    statusText = 'ESTADO: EN PROGRESO';
    doc.setTextColor(245, 158, 11); // Ámbar
  } else if (currentDeviation < 90) {
    statusText = 'ESTADO: CERCANO A META';
    doc.setTextColor(16, 185, 129); // Verde
  } else {
    statusText = 'ESTADO: META ALCANZADA';
    doc.setTextColor(5, 150, 105); // Verde oscuro
  }
  
  doc.text(statusText, 105, 160, { align: 'center' });
  
  // Sección de acciones pendientes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(parseInt(COLORS.navy.slice(1, 3), 16), parseInt(COLORS.navy.slice(3, 5), 16), parseInt(COLORS.navy.slice(5, 7), 16));
  doc.text('ACCIONES PENDIENTES', 15, 180);
  
  // Línea decorativa
  doc.setDrawColor(parseInt(COLORS.lime.slice(1, 3), 16), parseInt(COLORS.lime.slice(3, 5), 16), parseInt(COLORS.lime.slice(5, 7), 16));
  doc.setLineWidth(0.7);
  doc.line(15, 182, 120, 182);
  
  // Tabla de acciones pendientes
  // @ts-ignore
  (doc as any).autoTable({
    startY: 190,
    head: [['Acción', 'Descripción', 'Estado']],
    body: pendingActions.map(action => {
      let statusText = '';
      switch (action.status) {
        case 'completed':
          statusText = 'Completado';
          break;
        case 'in-progress':
          statusText = 'En progreso';
          break;
        case 'pending':
          statusText = 'Pendiente';
          break;
      }
      return [action.title, action.description, statusText];
    }),
    headStyles: {
      fillColor: [39, 57, 73], // Navy
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250]
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 100 },
      2: { cellWidth: 30 }
    }
  });
  
  // Añadir recomendaciones según el nivel actual
  // Obtener la posición Y después de la tabla
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Si hay espacio suficiente en la página actual
  if (finalY < 240) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(parseInt(COLORS.navy.slice(1, 3), 16), parseInt(COLORS.navy.slice(3, 5), 16), parseInt(COLORS.navy.slice(5, 7), 16));
    doc.text('RECOMENDACIONES', 15, finalY);
    
    // Línea decorativa
    doc.setDrawColor(parseInt(COLORS.lime.slice(1, 3), 16), parseInt(COLORS.lime.slice(3, 5), 16), parseInt(COLORS.lime.slice(5, 7), 16));
    doc.setLineWidth(0.7);
    doc.line(15, finalY + 2, 110, finalY + 2);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Recomendaciones basadas en el nivel actual de desviación
    let recommendations = [];
    
    if (currentDeviation < 50) {
      recommendations = [
        '1. Priorizar la implementación del Plan de Manejo Integral de Residuos.',
        '2. Adquirir tecnología de compostaje para aumentar la desviación de residuos orgánicos.',
        '3. Implementar sistema de trazabilidad para todos los flujos de residuos.',
        '4. Capacitar a todo el personal en separación adecuada de residuos en origen.'
      ];
    } else if (currentDeviation < 75) {
      recommendations = [
        '1. Reforzar los programas de separación en la fuente, especialmente en áreas de cocina.',
        '2. Aumentar la capacidad de procesamiento de residuos orgánicos para compostaje.',
        '3. Implementar auditorías internas mensuales para verificar la correcta separación.',
        '4. Desarrollar políticas de compras sostenibles para reducir residuos desde el origen.'
      ];
    } else {
      recommendations = [
        '1. Afinar los procesos actuales para incrementar la desviación del 37.18% al 90%.',
        '2. Completar la documentación requerida para la precertificación.',
        '3. Desarrollar campañas de comunicación para involucrar a los socios del club.',
        '4. Programar una pre-auditoría con consultores certificados en TRUE.'
      ];
    }
    
    // Escribir recomendaciones
    let yPosition = finalY + 10;
    recommendations.forEach(recommendation => {
      doc.text(recommendation, 20, yPosition);
      yPosition += 7;
    });
  }
  
  // Pie de página
  doc.setDrawColor(parseInt(COLORS.lime.slice(1, 3), 16), parseInt(COLORS.lime.slice(3, 5), 16), parseInt(COLORS.lime.slice(5, 7), 16), 0.5);
  doc.setLineWidth(0.5);
  doc.line(15, 280, 195, 280);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('ECONOVA © 2025 | Innovando en Gestión Ambiental', 105, 286, { align: 'center' });
  
  // Generar y descargar el PDF
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  
  // Crear un enlace temporal
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `Certificación_TRUE_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Simular un clic en el enlace para iniciar la descarga
  document.body.appendChild(link);
  link.click();
  
  // Limpiar
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}