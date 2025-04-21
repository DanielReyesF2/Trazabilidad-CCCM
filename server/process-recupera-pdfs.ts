import * as fs from 'fs';
import * as path from 'path';
import { db } from './db';
import { documents, clients, wasteData, InsertDocument, InsertWasteData } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Archivos que necesitamos procesar
const recuperaFiles = [
  {
    path: 'attached_assets/2025-01 RECUPERA_Rep #17553.pdf',
    date: new Date('2025-01-18'), // Fecha del reporte
    reportNumber: '17553',
    month: 'Enero',
    year: 2025
  },
  {
    path: 'attached_assets/2025-03 RECUPERA_Rep #18106 y 18111.pdf',
    date: new Date('2025-03-31'), // Última fecha del reporte
    reportNumber: '18106 y 18111',
    month: 'Marzo',
    year: 2025
  }
];

// Datos extraídos manualmente de los PDFs de RECUPERA
const recuperaData = {
  '2025-01': {
    reportNumber: '17553',
    date: new Date('2025-01-18'),
    totalRecyclable: 569.05, // kg
    paperCardboard: 336.50, // kg
    plastics: 93.60, // kg
    aluminum: 36.40, // kg
    glass: 102.55, // kg
    // Impacto ambiental
    treesSaved: 6,
    waterSaved: 8749, // litros
    energySaved: 1380, // kW
    fuelSaved: 491, // litros
    wasteDiverted: 1.0095, // m³
    redMudAvoided: 109 // kg
  },
  '2025-03': {
    reportNumber: '18106 y 18111',
    date: new Date('2025-03-31'),
    totalRecyclable: 2156.80, // kg
    paperCardboard: 692.00, // kg
    plastics: 192.00, // kg
    aluminum: 125.60, // kg
    glass: 1130.00, // kg
    metal: 17.20, // kg fierro
    // Impacto ambiental
    treesSaved: 12,
    waterSaved: 17992, // litros
    energySaved: 2837, // kW
    fuelSaved: 1010, // litros
    wasteDiverted: 2.076, // m³
    redMudAvoided: 428 // kg
  }
};

async function processRecuperaPDFs() {
  try {
    console.log('Iniciando procesamiento de reportes RECUPERA...');
    
    // Verificar si Club Campestre existe
    const [client] = await db.select().from(clients).where(eq(clients.name, 'Club Campestre de la Ciudad de México'));
    
    if (!client) {
      console.error('Cliente "Club Campestre de la Ciudad de México" no encontrado');
      return;
    }
    
    const clientId = client.id;
    console.log(`Cliente encontrado: ${client.name} (ID: ${clientId})`);
    
    // Procesar cada archivo
    for (const file of recuperaFiles) {
      // Determinar qué conjunto de datos usar
      const month = file.month === 'Enero' ? '01' : file.month === 'Marzo' ? '03' : '';
      const dataKey = `${file.year}-${month}`;
      const data = recuperaData[dataKey];
      
      if (!data) {
        console.error(`No se encontraron datos para ${dataKey}`);
        continue;
      }
      
      // Verificar si el archivo existe
      if (!fs.existsSync(file.path)) {
        console.error(`Archivo no encontrado: ${file.path}`);
        continue;
      }
      
      const fileStat = fs.statSync(file.path);
      const fileName = path.basename(file.path);
      
      // Crear registro del documento
      const documentData: InsertDocument = {
        fileName,
        fileSize: fileStat.size,
        clientId,
        processed: true,
        uploadDate: new Date(),
      };
      
      // Insertar el documento
      const [document] = await db.insert(documents).values(documentData).returning();
      console.log(`Documento insertado: ${document.fileName} (ID: ${document.id})`);
      
      // Los datos de RECUPERA son solo materiales reciclables, no hay orgánicos o inorgánicos
      // Para los reportes de RECUPERA, consideramos que todo es desviación positiva (100%)
      const wasteDataRecord: InsertWasteData = {
        documentId: document.id,
        clientId,
        date: data.date,
        // En este caso, inorganicWaste es el total que iría a relleno sanitario si no se reciclara
        inorganicWaste: 0, // En RECUPERA todo es reciclado
        organicWaste: 0, // En RECUPERA no hay orgánicos
        recyclableWaste: data.totalRecyclable,
        totalWaste: data.totalRecyclable,
        deviation: 100, // 100% desviación positiva
        
        // Impacto ambiental
        treesSaved: data.treesSaved,
        waterSaved: data.waterSaved,
        energySaved: data.energySaved,
        fuelSaved: data.fuelSaved,
        wasteDiverted: data.wasteDiverted,
        redMudAvoided: data.redMudAvoided,
        
        notes: `Reporte RECUPERA #${data.reportNumber} - ${file.month} ${file.year}`,
        rawData: {
          paperCardboard: data.paperCardboard,
          plastics: data.plastics,
          aluminum: data.aluminum,
          glass: data.glass,
          metal: data.metal || 0,
          report: data.reportNumber
        }
      };
      
      // Insertar los datos de residuos
      const [insertedWasteData] = await db.insert(wasteData).values(wasteDataRecord).returning();
      console.log(`Datos de residuos insertados para ${file.month} ${file.year} (ID: ${insertedWasteData.id})`);
    }
    
    console.log('Procesamiento completado con éxito.');
  } catch (error) {
    console.error('Error al procesar los reportes RECUPERA:', error);
  }
}

// Ejecutar la función
processRecuperaPDFs().then(() => {
  console.log('Script terminado');
  process.exit(0);
}).catch(err => {
  console.error('Error en el script principal:', err);
  process.exit(1);
});