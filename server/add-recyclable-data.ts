import { db } from './db';
import { wasteData } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Datos de reciclables mensuales según la tabla proporcionada
const recyclableData = [
  {
    month: 'Enero',
    year: '2024',
    paperCardboard: 1642.00,
    plastics: 260.00,
    metalFerrous: 15.00,
    metalAluminum: 197.80,
    total: 2114.80
  },
  {
    month: 'Febrero',
    year: '2024',
    paperCardboard: 623.00,
    plastics: 165.00,
    metalFerrous: 29.00,
    metalAluminum: 107.00,
    total: 924.00
  },
  {
    month: 'Marzo',
    year: '2024',
    paperCardboard: 637.20,
    plastics: 96.80,
    metalFerrous: 0.00,
    metalAluminum: 110.20,
    total: 844.20
  },
  {
    month: 'Abril',
    year: '2024',
    paperCardboard: 851.80,
    plastics: 77.60,
    metalFerrous: 0.00,
    metalAluminum: 52.60,
    total: 982.00
  },
  {
    month: 'Mayo',
    year: '2024',
    paperCardboard: 734.20,
    plastics: 162.80,
    metalFerrous: 36.40,
    metalAluminum: 96.60,
    total: 1030.00
  },
  {
    month: 'Junio',
    year: '2024',
    paperCardboard: 1084.20,
    plastics: 111.60,
    metalFerrous: 20.60,
    metalAluminum: 138.00,
    total: 1354.40
  },
  {
    month: 'Julio',
    year: '2024',
    paperCardboard: 0.00, // No hay datos de julio en la tabla
    plastics: 0.00,
    metalFerrous: 0.00, 
    metalAluminum: 0.00,
    total: 0.00
  },
  {
    month: 'Agosto',
    year: '2024',
    paperCardboard: 374.40,
    plastics: 155.55,
    metalFerrous: 22.50,
    metalAluminum: 112.20,
    total: 664.65
  },
  {
    month: 'Septiembre',
    year: '2024',
    paperCardboard: 382.00,
    plastics: 167.00,
    metalFerrous: 12.40,
    metalAluminum: 66.20,
    total: 627.60
  },
  {
    month: 'Octubre',
    year: '2024',
    paperCardboard: 548.00,
    plastics: 243.40,
    metalFerrous: 1317.00,
    metalAluminum: 80.40,
    total: 2188.80
  },
  {
    month: 'Noviembre',
    year: '2024',
    paperCardboard: 656.00,
    plastics: 25.20,
    metalFerrous: 15.20,
    metalAluminum: 68.00,
    total: 764.40
  },
  {
    month: 'Diciembre',
    year: '2024',
    paperCardboard: 661.00,
    plastics: 198.60,
    metalFerrous: 0.00,
    metalAluminum: 122.40,
    total: 982.00
  },
  {
    month: 'Marzo',
    year: '2025',
    paperCardboard: 692.00,
    plastics: 192.00,
    metalFerrous: 17.20,
    metalAluminum: 125.60,
    total: 1026.80
  }
];

// Función para obtener el mes español a número
function getMonthNumber(month: string): number {
  const months: { [key: string]: number } = {
    'Enero': 0,
    'Febrero': 1,
    'Marzo': 2,
    'Abril': 3,
    'Mayo': 4,
    'Junio': 5,
    'Julio': 6,
    'Agosto': 7,
    'Septiembre': 8,
    'Octubre': 9,
    'Noviembre': 10,
    'Diciembre': 11
  };
  return months[month];
}

// Función para calcular el porcentaje de desviación de relleno sanitario
function calculateSanitaryLandfillDeviation(
  organicWaste: number, 
  inorganicWaste: number, 
  recyclableWaste: number
): number {
  // El cálculo correcto del índice de desviación según la definición proporcionada:
  // Índice de desviación = (Residuos reciclados / Residuos totales que van a relleno sanitario) × 100
  
  // Total de residuos enviados a relleno sanitario (orgánicos + inorgánicos)
  const totalWasteToLandfill = organicWaste + inorganicWaste;
  
  if (totalWasteToLandfill === 0) return 0;
  
  // Cálculo de la desviación
  const deviation = (recyclableWaste / totalWasteToLandfill) * 100;
  
  // Redondear a 2 decimales
  return Math.round(deviation * 100) / 100;
}

// Función principal para actualizar los datos de reciclables
async function updateRecyclableData() {
  console.log('Iniciando actualización de datos de reciclables...');
  
  // ID del cliente Club Campestre
  const clientId = 4;
  
  for (const recycleInfo of recyclableData) {
    const monthNumber = getMonthNumber(recycleInfo.month);
    const year = parseInt(recycleInfo.year);
    
    // Crear fecha para el primer día del mes
    const date = new Date(year, monthNumber, 1);
    
    console.log(`\nActualizando datos para ${recycleInfo.month} ${recycleInfo.year}...`);
    console.log(`- Fecha: ${date.toISOString()}`);
    console.log(`- Papel/Cartón: ${recycleInfo.paperCardboard} kg`);
    console.log(`- Plásticos: ${recycleInfo.plastics} kg`);
    console.log(`- Metales ferrosos: ${recycleInfo.metalFerrous} kg`);
    console.log(`- Aluminio: ${recycleInfo.metalAluminum} kg`);
    console.log(`- Total reciclables: ${recycleInfo.total} kg`);
    
    try {
      // Buscar el registro correspondiente en la base de datos
      const records = await db.select()
        .from(wasteData)
        .where(eq(wasteData.clientId, clientId));
      
      // Filtramos por año y mes
      const matchingRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === year && 
               recordDate.getMonth() === monthNumber;
      });
      
      if (matchingRecords.length > 0) {
        const record = matchingRecords[0];
        console.log(`Encontrado registro para ${recycleInfo.month} ${recycleInfo.year} con ID: ${record.id}`);
        
        // Actualizar el valor de residuos reciclables
        const totalRecyclable = recycleInfo.total;
        
        // Calcular el nuevo porcentaje de desviación
        const organicWaste = record.organicWaste || 0;
        const inorganicWaste = record.inorganicWaste || 0;
        const deviation = calculateSanitaryLandfillDeviation(
          organicWaste, 
          inorganicWaste, 
          totalRecyclable
        );
        
        // Crear objeto con categorías detalladas para rawData
        const recyclableDetails = {
          paperCardboard: recycleInfo.paperCardboard,
          plastics: recycleInfo.plastics,
          metalFerrous: recycleInfo.metalFerrous,
          metalAluminum: recycleInfo.metalAluminum
        };
        
        // Actualizar el registro
        await db.update(wasteData)
          .set({
            recyclableWaste: totalRecyclable,
            deviation: deviation,
            totalWaste: organicWaste + inorganicWaste + totalRecyclable,
            rawData: {
              ...record.rawData,
              recyclableDetails
            }
          })
          .where(eq(wasteData.id, record.id));
        
        console.log(`Actualizado registro con ID ${record.id}:`);
        console.log(`- Residuos reciclables: ${totalRecyclable} kg`);
        console.log(`- Desviación: ${deviation}%`);
        console.log(`- Total residuos: ${organicWaste + inorganicWaste + totalRecyclable} kg`);
      } else {
        console.log(`No se encontró registro para ${recycleInfo.month} ${recycleInfo.year}`);
      }
    } catch (error) {
      console.error(`Error al actualizar datos de ${recycleInfo.month} ${recycleInfo.year}:`, error);
    }
  }
  
  console.log('\nActualización de datos de reciclables completada.');
}

// Ejecutar la actualización
updateRecyclableData()
  .then(() => {
    console.log('Actualización completada con éxito.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en la actualización:', error);
    process.exit(1);
  });