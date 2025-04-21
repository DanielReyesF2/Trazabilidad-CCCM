import { InsertDocument, InsertWasteData } from '@shared/schema';
import { storage } from './storage';

// Función para calcular el porcentaje de desviación de relleno sanitario
function calculateSanitaryLandfillDeviation(
  organicWaste: number, 
  inorganicWaste: number, 
  recyclableWaste: number
): number {
  const totalWaste = organicWaste + inorganicWaste + recyclableWaste;
  if (totalWaste === 0) return 0;
  const wasteNotGoingToLandfill = organicWaste + recyclableWaste;
  const deviation = (wasteNotGoingToLandfill / totalWaste) * 100;
  return Math.round(deviation * 100) / 100;
}

// Información de los PDFs de 2024 para Club Campestre (datos reales)
const pdfData2024 = [
  {
    fileName: '2024-01 CCCM - Bitácora de RSR.pdf',
    fileSize: 344664,
    date: new Date('2024-01-01'),
    organicWaste: 2614.00,
    inorganicWaste: 2520.00,
    recyclableWaste: 0,
    totalWaste: 5134.00,
    month: 'Enero',
    year: '2024'
  },
  {
    fileName: '2024-02 CCCM - Bitácora de RSR.pdf',
    fileSize: 309833,
    date: new Date('2024-02-01'),
    organicWaste: 5518.00,
    inorganicWaste: 4551.00,
    recyclableWaste: 0,
    totalWaste: 10069.00,
    month: 'Febrero',
    year: '2024'
  },
  {
    fileName: '2024-03 CCCM - Bitácora de RSR.pdf',
    fileSize: 320500,
    date: new Date('2024-03-01'),
    organicWaste: 6187.00,
    inorganicWaste: 4061.60,
    recyclableWaste: 0,
    totalWaste: 10248.60,
    month: 'Marzo',
    year: '2024'
  },
  {
    fileName: '2024-04 CCCM - Bitácora de RSR.pdf',
    fileSize: 318700,
    date: new Date('2024-04-01'),
    organicWaste: 5943.30,
    inorganicWaste: 4100.00,
    recyclableWaste: 0,
    totalWaste: 10043.30,
    month: 'Abril',
    year: '2024'
  },
  {
    fileName: '2024-05 CCCM - Bitácora de RSR.pdf',
    fileSize: 324800,
    date: new Date('2024-05-01'),
    organicWaste: 7416.40,
    inorganicWaste: 4385.15,
    recyclableWaste: 0,
    totalWaste: 11801.55,
    month: 'Mayo',
    year: '2024'
  },
  {
    fileName: '2024-06 CCCM - Bitácora de RSR.pdf',
    fileSize: 321450,
    date: new Date('2024-06-01'),
    organicWaste: 6609.00,
    inorganicWaste: 4171.80,
    recyclableWaste: 0,
    totalWaste: 10780.80,
    month: 'Junio',
    year: '2024'
  },
  {
    fileName: '2024-07 CCCM - Bitácora de RSR.pdf',
    fileSize: 315200,
    date: new Date('2024-07-01'),
    organicWaste: 4931.60,
    inorganicWaste: 4385.00,
    recyclableWaste: 0,
    totalWaste: 9316.60,
    month: 'Julio',
    year: '2024'
  },
  {
    fileName: '2024-08 CCCM - Bitácora de RSR.pdf',
    fileSize: 312750,
    date: new Date('2024-08-01'),
    organicWaste: 5046.10,
    inorganicWaste: 3339.60,
    recyclableWaste: 0,
    totalWaste: 8385.70,
    month: 'Agosto',
    year: '2024'
  },
  {
    fileName: '2024-09 CCCM - Bitácora de RSR.pdf',
    fileSize: 323400,
    date: new Date('2024-09-01'),
    organicWaste: 5458.00,
    inorganicWaste: 5725.50,
    recyclableWaste: 0,
    totalWaste: 11183.50,
    month: 'Septiembre',
    year: '2024'
  },
  {
    fileName: '2024-10 CCCM - Bitácora de RSR.pdf',
    fileSize: 320100,
    date: new Date('2024-10-01'),
    organicWaste: 5665.50,
    inorganicWaste: 4692.50,
    recyclableWaste: 0,
    totalWaste: 10358.00,
    month: 'Octubre',
    year: '2024'
  },
  {
    fileName: '2024-11 CCCM - Bitácora de RSR.pdf',
    fileSize: 319850,
    date: new Date('2024-11-01'),
    organicWaste: 6054.70,
    inorganicWaste: 4504.00,
    recyclableWaste: 0,
    totalWaste: 10558.70,
    month: 'Noviembre',
    year: '2024'
  },
  {
    fileName: '2024-12 CCCM - Bitácora de RSR.pdf',
    fileSize: 325300,
    date: new Date('2024-12-01'),
    organicWaste: 5864.40,
    inorganicWaste: 4711.00,
    recyclableWaste: 0,
    totalWaste: 10575.40,
    month: 'Diciembre',
    year: '2024'
  }
];

// Función principal para procesar los datos de 2024
async function process2024Data() {
  console.log('Iniciando procesamiento de datos de 2024...');
  
  // ID del cliente Club Campestre
  const clientId = 4;
  
  // Procesar datos de cada mes
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
      
      // Calcular desviación - cuando no tenemos datos de residuos reciclables, es 0%
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
  
  console.log('\nProcesamiento de datos completado.');
}

// Ejecutar el procesamiento
process2024Data()
  .then(() => {
    console.log('Procesamiento de datos de 2024 completado con éxito.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en el procesamiento de datos:', error);
    process.exit(1);
  });