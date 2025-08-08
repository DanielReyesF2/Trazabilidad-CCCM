import fs from 'fs';
import path from 'path';
import { parse } from 'papaparse';
import { storage } from './storage';

export interface CSVWasteData {
  date: Date;
  organicWaste: number;
  inorganicWaste: number;
  recyclableWaste: number;
  totalWaste: number;
  deviation?: number;
}

// Función para parsear el CSV de residuos del Club Campestre
export async function processCSVDocument(filePath: string, clientId: number, documentId: number): Promise<CSVWasteData[]> {
  try {
    console.log(`Processing CSV file: ${filePath}`);
    
    // Leer el archivo CSV
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    return new Promise((resolve, reject) => {
      parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        delimiter: ',',
        encoding: 'utf-8',
        complete: async (results) => {
          try {
            const csvData = results.data as any[];
            const processedData: CSVWasteData[] = [];
            
            console.log(`Found ${csvData.length} rows in CSV`);
            console.log('First row sample:', csvData[0]);
            
            for (const row of csvData) {
              // Detectar diferentes formatos de CSV que podríamos recibir
              let date: Date;
              let organicWaste: number = 0;
              let inorganicWaste: number = 0;
              let recyclableWaste: number = 0;
              
              // Intentar parsear diferentes formatos de fecha
              if (row.Fecha) {
                date = new Date(row.Fecha);
              } else if (row.Month && row.Year) {
                // Si tenemos mes y año separados
                const month = parseInt(row.Month) - 1; // JavaScript months are 0-indexed
                const year = parseInt(row.Year);
                date = new Date(year, month, 15); // Usar el día 15 del mes
              } else if (row.Año && row.Mes) {
                // Formato en español
                const month = parseInt(row.Mes) - 1;
                const year = parseInt(row.Año);
                date = new Date(year, month, 15);
              } else {
                console.warn('Cannot parse date from row:', row);
                continue;
              }
              
              // Parsear datos de residuos - probar diferentes nombres de columnas
              organicWaste = parseFloat(row['Orgánicos'] || row['Organicos'] || row['Organic'] || row['organicWaste'] || '0') || 0;
              inorganicWaste = parseFloat(row['Inorgánicos'] || row['Inorganicos'] || row['Inorganic'] || row['inorganicWaste'] || '0') || 0;
              recyclableWaste = parseFloat(row['Reciclables'] || row['Recyclable'] || row['recyclableWaste'] || '0') || 0;
              
              // También buscar por las columnas específicas del CSV que tienen
              if (row['Orgánicos (ton)']) {
                organicWaste = parseFloat(row['Orgánicos (ton)']) || 0;
              }
              if (row['Inorgánicos (ton)']) {
                inorganicWaste = parseFloat(row['Inorgánicos (ton)']) || 0;
              }
              if (row['Reciclables (ton)']) {
                recyclableWaste = parseFloat(row['Reciclables (ton)']) || 0;
              }
              
              const totalWaste = organicWaste + inorganicWaste + recyclableWaste;
              const deviation = totalWaste > 0 ? ((recyclableWaste + organicWaste) / totalWaste) * 100 : 0;
              
              if (totalWaste > 0) { // Solo procesar filas con datos válidos
                const wasteRecord: CSVWasteData = {
                  date,
                  organicWaste,
                  inorganicWaste,
                  recyclableWaste,
                  totalWaste,
                  deviation: parseFloat(deviation.toFixed(2))
                };
                
                processedData.push(wasteRecord);
                
                // Crear registro en la base de datos
                await storage.createWasteData({
                  clientId,
                  documentId,
                  date,
                  organicWaste,
                  inorganicWaste,
                  recyclableWaste,
                  totalWaste,
                  deviation: parseFloat(deviation.toFixed(2))
                });
                
                console.log(`Processed record for ${date.toISOString().split('T')[0]}: ${totalWaste} tons total`);
              }
            }
            
            console.log(`Successfully processed ${processedData.length} waste data records`);
            resolve(processedData);
            
          } catch (error) {
            console.error('Error processing CSV data:', error);
            reject(error);
          }
        },
        error: (error: any) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        }
      });
    });
    
  } catch (error) {
    console.error('Error processing CSV file:', error);
    throw error;
  }
}

// Función para validar si un archivo es CSV válido
export function isValidCSV(filePath: string): boolean {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    return fileExtension === '.csv';
  } catch (error) {
    return false;
  }
}

// Función para limpiar el archivo después del procesamiento
export function cleanupFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error cleaning up file ${filePath}:`, error);
  }
}