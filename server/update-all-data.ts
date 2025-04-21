import { db } from './db';
import { wasteData, documents } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { storage } from './storage';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Función para limpiar la base de datos (solo los datos del cliente 4 - Club Campestre)
async function cleanClientData() {
  console.log('Limpiando datos existentes para Club Campestre...');
  
  // ID del cliente Club Campestre
  const clientId = 4;
  
  try {
    // Obtener todos los documentos del cliente
    const clientDocuments = await db.select()
      .from(documents)
      .where(eq(documents.clientId, clientId));
    
    // Eliminar los datos de residuos asociados a esos documentos
    for (const document of clientDocuments) {
      await db.delete(wasteData)
        .where(eq(wasteData.documentId, document.id));
      console.log(`Eliminados datos de residuos para documento ID: ${document.id}`);
    }
    
    // Eliminar los documentos del cliente
    await db.delete(documents)
      .where(eq(documents.clientId, clientId));
    console.log(`Eliminados todos los documentos del cliente ID: ${clientId}`);
    
    console.log('Limpieza completada con éxito.');
  } catch (error) {
    console.error('Error al limpiar datos:', error);
    throw error;
  }
}

// Función principal para actualizar todos los datos
async function updateAllData() {
  try {
    // Paso 1: Limpiar datos existentes
    await cleanClientData();
    
    // Paso 2: Ejecutar el procesamiento de datos de 2024
    console.log('\nEjecutando procesamiento de datos de 2024...');
    await execPromise('npx tsx server/process-2024-data.ts');
    
    // Paso 3: Ejecutar el procesamiento de datos de RECUPERA 2025
    console.log('\nEjecutando procesamiento de datos de RECUPERA 2025...');
    await execPromise('npx tsx server/process-recupera-pdfs.ts');
    
    console.log('\nTodos los datos han sido actualizados correctamente.');
  } catch (error) {
    console.error('Error al actualizar datos:', error);
    process.exit(1);
  }
}

// Ejecutar la actualización
updateAllData()
  .then(() => {
    console.log('Proceso de actualización completado.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en el proceso de actualización:', error);
    process.exit(1);
  });