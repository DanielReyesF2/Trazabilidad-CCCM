import { InsertDocument, InsertWasteData } from '@shared/schema';
import { storage } from './storage';

// Información de los PDFs de 2024 para Club Campestre
const pdfData2024 = [
  {
    fileName: '2024-01 CCCM - Bitácora de RSR.pdf',
    fileSize: 344664,
    date: new Date('2024-01-01'),
    organicWaste: 6432.10,
    inorganicWaste: 3521.80,
    recyclableWaste: 780.5,
    totalWaste: 10734.4,
    month: 'Enero',
    year: '2024'
  },
  {
    fileName: '2024-02 CCCM - Bitácora de RSR.pdf',
    fileSize: 309833,
    date: new Date('2024-02-01'),
    organicWaste: 5890.45,
    inorganicWaste: 3290.75,
    recyclableWaste: 765.8,
    totalWaste: 9947.0,
    month: 'Febrero',
    year: '2024'
  },
  {
    fileName: '2024-03 CCCM - Bitácora de RSR.pdf',
    fileSize: 320154,
    date: new Date('2024-03-01'),
    organicWaste: 6123.80,
    inorganicWaste: 3678.20,
    recyclableWaste: 795.6,
    totalWaste: 10597.6,
    month: 'Marzo',
    year: '2024'
  },
  {
    fileName: '2024-04 CCCM - Bitácora de RSR.pdf',
    fileSize: 318722,
    date: new Date('2024-04-01'),
    organicWaste: 5878.45,
    inorganicWaste: 3450.20,
    recyclableWaste: 768.3,
    totalWaste: 10096.95,
    month: 'Abril',
    year: '2024'
  },
  {
    fileName: '2024-05 CCCM - Bitácora de RSR.pdf',
    fileSize: 325478,
    date: new Date('2024-05-01'),
    organicWaste: 6245.30,
    inorganicWaste: 3570.40,
    recyclableWaste: 810.2,
    totalWaste: 10625.9,
    month: 'Mayo',
    year: '2024'
  },
  {
    fileName: '2024-06 CCCM - Bitácora de RSR.pdf',
    fileSize: 322145,
    date: new Date('2024-06-01'),
    organicWaste: 6125.75,
    inorganicWaste: 3610.25,
    recyclableWaste: 805.7,
    totalWaste: 10541.7,
    month: 'Junio',
    year: '2024'
  },
  {
    fileName: '2024-07 CCCM - Bitácora de RSR.pdf',
    fileSize: 327895,
    date: new Date('2024-07-01'),
    organicWaste: 6350.40,
    inorganicWaste: 3680.90,
    recyclableWaste: 825.5,
    totalWaste: 10856.8,
    month: 'Julio',
    year: '2024'
  },
  {
    fileName: '2024-08 CCCM - Bitácora de RSR.pdf',
    fileSize: 329452,
    date: new Date('2024-08-01'),
    organicWaste: 6420.80,
    inorganicWaste: 3695.20,
    recyclableWaste: 830.9,
    totalWaste: 10946.9,
    month: 'Agosto',
    year: '2024'
  },
  {
    fileName: '2024-09 CCCM - Bitácora de RSR.pdf',
    fileSize: 324875,
    date: new Date('2024-09-01'),
    organicWaste: 6280.50,
    inorganicWaste: 3640.30,
    recyclableWaste: 815.8,
    totalWaste: 10736.6,
    month: 'Septiembre',
    year: '2024'
  },
  {
    fileName: '2024-10 CCCM - Bitácora de RSR.pdf',
    fileSize: 328945,
    date: new Date('2024-10-01'),
    organicWaste: 6340.60,
    inorganicWaste: 3670.40,
    recyclableWaste: 822.7,
    totalWaste: 10833.7,
    month: 'Octubre',
    year: '2024'
  },
  {
    fileName: '2024-11 CCCM - Bitácora de RSR.pdf',
    fileSize: 327456,
    date: new Date('2024-11-01'),
    organicWaste: 6290.30,
    inorganicWaste: 3710.80,
    recyclableWaste: 818.5,
    totalWaste: 10819.6,
    month: 'Noviembre',
    year: '2024'
  },
  {
    fileName: '2024-12 CCCM - Bitácora de RSR.pdf',
    fileSize: 334587,
    date: new Date('2024-12-01'),
    organicWaste: 6745.90,
    inorganicWaste: 3790.40,
    recyclableWaste: 835.2,
    totalWaste: 11371.5,
    month: 'Diciembre',
    year: '2024'
  }
];

// Información de los PDFs de 2025 para Club Campestre
const pdfData2025 = [
  {
    fileName: '2025-01 CCCM - Bitácora de Residuos Sólidos Urbanos.pdf',
    fileSize: 214531,
    date: new Date('2025-01-01'),
    organicWaste: 6874.20,
    inorganicWaste: 3745.18,
    recyclableWaste: 820.5,
    totalWaste: 11439.88,
    month: 'Enero',
    year: '2025'
  },
  {
    fileName: '2025-02 CCCM - Bitácora de Residuos Sólidos Urbanos.pdf',
    fileSize: 218043,
    date: new Date('2025-02-01'),
    organicWaste: 5612.10,
    inorganicWaste: 3395.00,
    recyclableWaste: 745.2,
    totalWaste: 9752.3,
    month: 'Febrero',
    year: '2025'
  },
  {
    fileName: '2025-03 CCCM - Bitácora de Residuos Sólidos Urbanos.pdf',
    fileSize: 220756,
    date: new Date('2025-03-01'),
    organicWaste: 5447.50,
    inorganicWaste: 4251.00,
    recyclableWaste: 678.3,
    totalWaste: 10376.8,
    month: 'Marzo',
    year: '2025'
  }
];

// Función principal para procesar todos los datos
async function processAllData() {
  console.log('Iniciando procesamiento de datos...');
  
  // ID del cliente Club Campestre
  const clientId = 4;
  
  // Procesar datos de 2024
  console.log('\n===== PROCESANDO DATOS DE 2024 =====');
  for (const pdfInfo of pdfData2024) {
    console.log(`\nProcesando datos de ${pdfInfo.month} ${pdfInfo.year}...`);
    
    try {
      // Crear el documento en la base de datos
      const documentData: InsertDocument = {
        fileName: pdfInfo.fileName,
        fileSize: pdfInfo.fileSize,
        clientId,
        processed: true,
        processingError: null
      };
      
      // Crear el documento
      const document = await storage.createDocument(documentData);
      console.log(`Documento creado con ID: ${document.id}`);
      
      // Calcular desviación - para 2024 es 0% según la especificación
      const deviation = 0;
      
      // Crear registro de datos de residuos
      const wasteData: InsertWasteData = {
        clientId,
        documentId: document.id,
        date: pdfInfo.date,
        organicWaste: pdfInfo.organicWaste,
        inorganicWaste: pdfInfo.inorganicWaste,
        recyclableWaste: pdfInfo.recyclableWaste,
        totalWaste: pdfInfo.totalWaste,
        deviation,
        rawData: {} as Record<string, any>,
        notes: `Datos para ${pdfInfo.month} ${pdfInfo.year}`
      };
      
      // Guardar en la base de datos
      const savedWasteData = await storage.createWasteData(wasteData);
      console.log('Datos procesados con éxito:');
      console.log(`- Residuos orgánicos: ${pdfInfo.organicWaste} kg`);
      console.log(`- Residuos inorgánicos: ${pdfInfo.inorganicWaste} kg`);
      console.log(`- Residuos reciclables: ${pdfInfo.recyclableWaste} kg`);
      console.log(`- Total: ${pdfInfo.totalWaste} kg`);
      console.log(`- Desviación de relleno sanitario: ${deviation}%`);
      console.log(`- Fecha: ${pdfInfo.date}`);
      console.log(`- ID de datos guardados: ${savedWasteData.id}`);
    } catch (error) {
      console.error(`Error al procesar datos de ${pdfInfo.month} ${pdfInfo.year}:`, error);
    }
  }
  
  // Procesar datos de 2025
  console.log('\n===== PROCESANDO DATOS DE 2025 =====');
  for (const pdfInfo of pdfData2025) {
    console.log(`\nProcesando datos de ${pdfInfo.month} ${pdfInfo.year}...`);
    
    try {
      // Crear el documento en la base de datos
      const documentData: InsertDocument = {
        fileName: pdfInfo.fileName,
        fileSize: pdfInfo.fileSize,
        clientId,
        processed: true,
        processingError: null
      };
      
      // Crear el documento
      const document = await storage.createDocument(documentData);
      console.log(`Documento creado con ID: ${document.id}`);
      
      // Calcular desviación - La desviación es el % de residuos reciclables respecto a residuos inorgánicos
      const deviation = pdfInfo.inorganicWaste > 0 ? (pdfInfo.recyclableWaste / pdfInfo.inorganicWaste) * 100 : 0;
      const roundedDeviation = Math.round(deviation * 100) / 100;
      
      // Crear registro de datos de residuos
      const wasteData: InsertWasteData = {
        clientId,
        documentId: document.id,
        date: pdfInfo.date,
        organicWaste: pdfInfo.organicWaste,
        inorganicWaste: pdfInfo.inorganicWaste,
        recyclableWaste: pdfInfo.recyclableWaste,
        totalWaste: pdfInfo.totalWaste,
        deviation: roundedDeviation,
        rawData: {} as Record<string, any>,
        notes: `Datos para ${pdfInfo.month} ${pdfInfo.year}`
      };
      
      // Guardar en la base de datos
      const savedWasteData = await storage.createWasteData(wasteData);
      console.log('Datos procesados con éxito:');
      console.log(`- Residuos orgánicos: ${pdfInfo.organicWaste} kg`);
      console.log(`- Residuos inorgánicos: ${pdfInfo.inorganicWaste} kg`);
      console.log(`- Residuos reciclables: ${pdfInfo.recyclableWaste} kg`);
      console.log(`- Total: ${pdfInfo.totalWaste} kg`);
      console.log(`- Desviación de relleno sanitario: ${roundedDeviation}%`);
      console.log(`- Fecha: ${pdfInfo.date}`);
      console.log(`- ID de datos guardados: ${savedWasteData.id}`);
    } catch (error) {
      console.error(`Error al procesar datos de ${pdfInfo.month} ${pdfInfo.year}:`, error);
    }
  }
  
  console.log('\nProcesamiento de todos los datos completado.');
}

// Ejecutar el procesamiento
processAllData()
  .then(() => {
    console.log('Procesamiento de datos completado con éxito.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en el procesamiento de datos:', error);
    process.exit(1);
  });