import { pool, db } from './db';
import { sql } from 'drizzle-orm';
import { wasteData } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Script para actualizar el esquema con la nueva columna PODA
async function updateSchemaForPODA() {
  console.log('Iniciando actualización del esquema para residuos de PODA...');
  
  try {
    // 1. Añadir la columna si no existe
    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'waste_data' AND column_name = 'poda_waste'
        ) THEN 
          ALTER TABLE waste_data ADD COLUMN poda_waste REAL;
        END IF;
      END $$;
    `);
    console.log('✅ Columna poda_waste añadida a la tabla waste_data');
    
    // 2. Añadir los datos de residuos de PODA para los meses especificados
    // Febrero 2024
    await updatePodaData(new Date('2024-02-15'), 16000);
    
    // Mayo 2024
    await updatePodaData(new Date('2024-05-15'), 16000);
    
    // Noviembre 2024
    await updatePodaData(new Date('2024-11-15'), 32000);
    
    // 3. Recalcular índices de desviación para todos los registros
    await recalculateDeviationWithPoda();
    
    console.log('✅ Datos de PODA agregados correctamente');
    console.log('✅ Índices de desviación recalculados correctamente');
    
  } catch (error) {
    console.error('❌ Error al actualizar el esquema:', error);
  } finally {
    await pool.end();
  }
}

async function updatePodaData(date: Date, podaAmount: number) {
  // Obtener el mes y año para buscar registros aproximados
  const month = date.getMonth();
  const year = date.getFullYear();
  
  // Encontrar registros para ese mes/año y Cliente Campestre (ID 4)
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  
  const results = await db.select()
    .from(wasteData)
    .where(sql`client_id = 4 AND date >= ${startOfMonth.toISOString()} AND date <= ${endOfMonth.toISOString()}`);
  
  if (results.length > 0) {
    console.log(`Encontrados ${results.length} registros para ${year}-${month+1}`);
    
    // Distribuir la cantidad entre todos los registros del mes
    const amountPerRecord = podaAmount / results.length;
    
    for (const record of results) {
      await db.update(wasteData)
        .set({ podaWaste: amountPerRecord })
        .where(eq(wasteData.id, record.id));
      
      console.log(`Registro ID ${record.id} actualizado con ${amountPerRecord} kg de residuos de PODA`);
    }
  } else {
    // Si no hay registros, crear uno nuevo
    const date15 = new Date(year, month, 15); // Día medio del mes
    
    await db.insert(wasteData)
      .values({
        clientId: 4, // Club Campestre
        date: date15,
        podaWaste: podaAmount,
        organicWaste: 0,
        inorganicWaste: 0,
        recyclableWaste: 0,
        totalWaste: podaAmount,
        deviation: calculateDeviation(0, 0, 0, podaAmount),
        notes: 'Registro automático de residuos de PODA'
      });
    
    console.log(`Nuevo registro creado para ${year}-${month+1} con ${podaAmount} kg de residuos de PODA`);
  }
}

async function recalculateDeviationWithPoda() {
  const allRecords = await db.select().from(wasteData);
  
  for (const record of allRecords) {
    // Obtener valores, asegurando que no sean null
    const organic = record.organicWaste || 0;
    const inorganic = record.inorganicWaste || 0;
    const recyclable = record.recyclableWaste || 0;
    const poda = record.podaWaste || 0;
    
    // Recalcular el índice de desviación considerando los residuos de PODA
    const newDeviation = calculateDeviation(organic, inorganic, recyclable, poda);
    
    // Actualizar el registro solo si la desviación cambió
    if (newDeviation !== record.deviation) {
      await db.update(wasteData)
        .set({ deviation: newDeviation })
        .where(eq(wasteData.id, record.id));
      
      console.log(`Índice de desviación actualizado para registro ID ${record.id}: ${record.deviation || 0}% -> ${newDeviation}%`);
    }
  }
}

function calculateDeviation(organic: number, inorganic: number, recyclable: number, poda: number): number {
  // La fórmula original era: (recyclable / (organic + inorganic + recyclable)) * 100
  // Ahora la PODA cuenta como material no destinado a relleno sanitario (como recyclable)
  const total = organic + inorganic + recyclable + poda;
  
  if (total === 0) return 0;
  
  // El nuevo índice de desviación incluye PODA en el numerador junto con reciclables
  return ((recyclable + poda) / total) * 100;
}

// Ejecutar el script
updateSchemaForPODA()
  .then(() => {
    console.log('Script finalizado');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en el script principal:', error);
    process.exit(1);
  });