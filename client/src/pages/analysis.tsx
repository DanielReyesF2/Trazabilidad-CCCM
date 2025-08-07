import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Calculator } from 'lucide-react';

interface MonthlyData {
  year: number;
  month: number;
  // Materiales Reciclables
  mixedFile: number;
  officePaper: number;
  magazine: number;
  newspaper: number;
  cardboard: number;
  petPlastic: number;
  hdpeBlown: number;
  hdpeRigid: number;
  tinCan: number;
  aluminum: number;
  glass: number;
  totalRecyclables: number;
  // Orgánicos
  organicsCompost: number;
  organicsToLandfill: number;
  totalOrganics: number;
  // Inorgánicos no reciclables
  inorganicNonRecyclable: number;
  // Reuso
  glassDonation: number;
  // Calculados
  totalDiverted: number;
  totalGenerated: number;
  deviationPercentage: number;
}

export default function Analysis() {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState('2025');
  const [data, setData] = useState<MonthlyData[]>([]);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Datos reales extraídos de los PDFs enero-junio 2025
  const realData2025 = [
    { month: 1, organicsToLandfill: 5386.5, recyclables: 569.05, inorganicNonRecyclable: 2965.58, organicsCompost: 12800 }, // Enero
    { month: 2, organicsToLandfill: 4841.5, recyclables: 2368.0, inorganicNonRecyclable: 2423.3, organicsCompost: 0 }, // Febrero
    { month: 3, organicsToLandfill: 5964.0, recyclables: 2156.8, inorganicNonRecyclable: 3140.5, organicsCompost: 0 }, // Marzo
    { month: 4, organicsToLandfill: 4677.5, recyclables: 721.2, inorganicNonRecyclable: 2480.7, organicsCompost: 25600 }, // Abril
    { month: 5, organicsToLandfill: 4921.0, recyclables: 2980.0, inorganicNonRecyclable: 2844.0, organicsCompost: 0 }, // Mayo
    { month: 6, organicsToLandfill: 3837.5, recyclables: 3468.0, inorganicNonRecyclable: 2147.5, organicsCompost: 0 }, // Junio
  ];

  const initializeYear = (year: number) => {
    const yearData: MonthlyData[] = [];
    
    for (let month = 1; month <= 12; month++) {
      // Buscar datos reales para 2025
      const realDataForMonth = year === 2025 ? realData2025.find(d => d.month === month) : null;
      
      if (realDataForMonth) {
        // Usar datos reales
        const totalGenerated = realDataForMonth.organicsToLandfill + realDataForMonth.recyclables + realDataForMonth.inorganicNonRecyclable + realDataForMonth.organicsCompost;
        const totalDiverted = realDataForMonth.organicsCompost + realDataForMonth.recyclables; // Solo orgánicos de composta + reciclables
        const deviationPercentage = (totalDiverted / totalGenerated) * 100; // Porcentaje desviado del relleno
        
        yearData.push({
          year,
          month,
          mixedFile: Math.round(realDataForMonth.recyclables * 0.3), // Distribución estimada
          officePaper: Math.round(realDataForMonth.recyclables * 0.25),
          magazine: Math.round(realDataForMonth.recyclables * 0.1),
          newspaper: Math.round(realDataForMonth.recyclables * 0.05),
          cardboard: Math.round(realDataForMonth.recyclables * 0.2),
          petPlastic: Math.round(realDataForMonth.recyclables * 0.05),
          hdpeBlown: Math.round(realDataForMonth.recyclables * 0.02),
          hdpeRigid: Math.round(realDataForMonth.recyclables * 0.02),
          tinCan: Math.round(realDataForMonth.recyclables * 0.005),
          aluminum: Math.round(realDataForMonth.recyclables * 0.005),
          glass: Math.round(realDataForMonth.recyclables * 0.01),
          totalRecyclables: realDataForMonth.recyclables,
          organicsCompost: realDataForMonth.organicsCompost,
          organicsToLandfill: realDataForMonth.organicsToLandfill,
          totalOrganics: realDataForMonth.organicsCompost,
          inorganicNonRecyclable: realDataForMonth.inorganicNonRecyclable,
          glassDonation: 0,
          totalDiverted: totalDiverted,
          totalGenerated: totalGenerated,
          deviationPercentage: deviationPercentage,
        });
      } else {
        // Datos en blanco para meses sin información
        yearData.push({
          year,
          month,
          mixedFile: 0,
          officePaper: 0,
          magazine: 0,
          newspaper: 0,
          cardboard: 0,
          petPlastic: 0,
          hdpeBlown: 0,
          hdpeRigid: 0,
          tinCan: 0,
          aluminum: 0,
          glass: 0,
          totalRecyclables: 0,
          organicsCompost: year === 2025 ? 0 : 18000, // Para 2025 usar datos reales, otros años valor por defecto
          organicsToLandfill: 0,
          totalOrganics: year === 2025 ? 0 : 18000,
          inorganicNonRecyclable: 0,
          glassDonation: 0,
          totalDiverted: 0,
          totalGenerated: 0,
          deviationPercentage: 0,
        });
      }
    }
    setData(yearData);
  };

  const updateValue = (monthIndex: number, field: keyof MonthlyData, value: number) => {
    const newData = [...data];
    newData[monthIndex] = { ...newData[monthIndex], [field]: value };
    
    // Recalcular totales automáticamente
    const monthData = newData[monthIndex];
    monthData.totalRecyclables = 
      monthData.mixedFile + monthData.officePaper + monthData.magazine + 
      monthData.newspaper + monthData.cardboard + monthData.petPlastic + 
      monthData.hdpeBlown + monthData.hdpeRigid + monthData.tinCan + 
      monthData.aluminum + monthData.glass;
    
    monthData.totalOrganics = monthData.organicsCompost;
    monthData.totalDiverted = monthData.totalRecyclables + monthData.totalOrganics + monthData.glassDonation;
    
    // Para calcular el porcentaje necesitamos el total generado
    if (monthData.totalGenerated > 0) {
      monthData.deviationPercentage = (monthData.totalDiverted / monthData.totalGenerated) * 100;
    }
    
    setData(newData);
  };

  const calculateTotals = (field: keyof MonthlyData) => {
    return data.reduce((sum, month) => sum + (month[field] as number), 0);
  };

  const averageDeviation = data.length > 0 
    ? data.reduce((sum, month) => sum + month.deviationPercentage, 0) / data.length 
    : 0;

  // Cargar datos automáticamente al entrar a la página
  useEffect(() => {
    if (data.length === 0) {
      initializeYear(2025);
    }
  }, []);

  return (
    <AppLayout>
      <div className="p-5">
        <div className="mx-auto max-w-7xl">
          {/* Header Simplificado */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-anton text-gray-800 uppercase tracking-wider mb-2">
              TRUE ZERO WASTE 2025
            </h1>
            <p className="text-gray-600 mb-6">Club Campestre Ciudad de México</p>
            
            {/* Indicador Principal */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 max-w-lg mx-auto">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-500 mb-2">Desviación Anual del Relleno</div>
                <div className={`text-4xl font-anton ${52.6 >= 90 ? 'text-green-600' : 'text-red-600'}`}>
                  52.6%
                </div>
                <div className="text-xs text-gray-500">promedio enero-junio 2025</div>
              </div>
              
              <div className="border-t pt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-500">Progreso a Meta</div>
                  <div className="text-lg font-bold text-blue-600">
                    {(52.6/90*100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Meta Requerida</div>
                  <div className="text-lg font-bold text-green-600">90%</div>
                </div>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="flex justify-center">
              <Button 
                className="bg-navy hover:bg-navy-dark text-white px-6"
                size="lg"
              >
                <Save className="w-4 h-4 mr-2" />
                Exportar Datos
              </Button>
            </div>
          </div>

          {/* Métricas de Progreso */}
          {data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-anton text-navy mb-1">
                    52.6%
                  </div>
                  <div className="text-sm text-gray-600">Desviación Anual</div>
                  <div className="text-xs text-gray-500">Enero-Junio 2025</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-anton mb-1 ${(52.6/90*100) >= 90 ? 'text-green-600' : 'text-red-600'}`}>
                    {(52.6/90*100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Progreso a Meta</div>
                  <div className="text-xs text-gray-500">Hacia certificación</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-anton text-green-600 mb-1">
                    90%
                  </div>
                  <div className="text-sm text-gray-600">Meta Requerida</div>
                  <div className="text-xs text-gray-500">TRUE ZERO WASTE</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabla de datos */}
          {data.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-center text-xl font-anton tracking-wider text-gray-800">
                  Registro Mensual de Residuos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="overflow-x-auto">
                  <Table className="text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="bg-navy text-white font-bold">Categoría</TableHead>
                        {months.map((month, index) => (
                          <TableHead key={index} className="bg-navy text-white text-center font-bold text-xs">
                            {month.slice(0,3)}
                          </TableHead>
                        ))}
                        <TableHead className="bg-lime text-black text-center font-bold">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Datos principales simplificados */}
                      <TableRow className="hover:bg-gray-50">
                        <TableCell className="font-medium text-green-700">🌱 Orgánicos (composta)</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="text-center font-medium">
                            {month.organicsCompost.toLocaleString()}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold text-green-700">
                          {calculateTotals('organicsCompost').toLocaleString()}
                        </TableCell>
                      </TableRow>
                      
                      <TableRow className="hover:bg-gray-50">
                        <TableCell className="font-medium text-orange-700">🗑️ Orgánicos (relleno)</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="text-center font-medium">
                            {month.organicsToLandfill.toLocaleString()}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold text-orange-700">
                          {calculateTotals('organicsToLandfill').toLocaleString()}
                        </TableCell>
                      </TableRow>

                      <TableRow className="hover:bg-gray-50">
                        <TableCell className="font-medium text-blue-700">♻️ Reciclables</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="text-center font-medium">
                            {month.totalRecyclables.toLocaleString()}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold text-blue-700">
                          {calculateTotals('totalRecyclables').toLocaleString()}
                        </TableCell>
                      </TableRow>

                      <TableRow className="hover:bg-gray-50">
                        <TableCell className="font-medium text-red-700">🚮 Inorgánicos (relleno)</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="text-center font-medium">
                            {month.inorganicNonRecyclable.toLocaleString()}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold text-red-700">
                          {calculateTotals('inorganicNonRecyclable').toLocaleString()}
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-green-50">
                        <TableCell className="font-bold text-green-800">✅ Total Desviado</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="text-center font-bold">
                            {month.totalDiverted.toLocaleString()}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold text-green-800">
                          {calculateTotals('totalDiverted').toLocaleString()}
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-gray-100">
                        <TableCell className="font-bold">📊 Total Generado</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="text-center font-bold">
                            {month.totalGenerated.toLocaleString()}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">
                          {calculateTotals('totalGenerated').toLocaleString()}
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-yellow-100">
                        <TableCell className="font-bold text-green-800">📊 % Desviado</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="text-center font-bold">
                            <span className={`text-lg ${month.deviationPercentage >= 90 ? 'text-green-600' : 'text-red-600'}`}>
                              {month.deviationPercentage.toFixed(1)}%
                            </span>
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">
                          <span className={`text-lg ${averageDeviation >= 90 ? 'text-green-600' : 'text-red-600'}`}>
                            {averageDeviation.toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>

                      
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}


        </div>
      </div>
    </AppLayout>
  );
}