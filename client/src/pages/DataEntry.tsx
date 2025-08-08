import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
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
  totalOrganics: number;
  // Reuso
  glassDonation: number;
  // Calculados
  totalDiverted: number;
  totalGenerated: number;
  deviationPercentage: number;
}

export default function DataEntry() {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState('2025');
  const [data, setData] = useState<MonthlyData[]>([]);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const initializeYear = (year: number) => {
    const yearData: MonthlyData[] = [];
    for (let month = 1; month <= 12; month++) {
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
        organicsCompost: 18000, // Default como muestra la tabla
        totalOrganics: 18000,
        glassDonation: 0,
        totalDiverted: 0,
        totalGenerated: 0,
        deviationPercentage: 0,
      });
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

  return (
    <AppLayout>
      <div className="p-5">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-anton text-gray-800 uppercase tracking-wider">Datos de Desviación - Ingreso Manual</h1>
              <p className="mt-1 text-sm text-gray-500">Tabla de 12 meses como requiere la certificadora TRUE ZERO WASTE</p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => initializeYear(parseInt(selectedYear))}
                className="bg-lime hover:bg-lime-dark text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Inicializar Año
              </Button>
              <Button className="bg-navy hover:bg-navy-dark text-white">
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>

          {/* Indicador de desviación actual */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-anton">
                  Índice de Desviación Promedio: 
                  <span className={`ml-2 text-2xl ${averageDeviation >= 90 ? 'text-green-600' : 'text-red-600'}`}>
                    {averageDeviation.toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Meta TRUE ZERO WASTE: 90% mínimo
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de datos */}
          {data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-anton tracking-wider">
                  Datos de Desviación: 12 meses - {selectedYear}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="bg-gray-100 font-bold">Materiales</TableHead>
                        {months.map((month, index) => (
                          <TableHead key={index} className="bg-gray-100 text-center font-bold min-w-20">
                            {month}
                          </TableHead>
                        ))}
                        <TableHead className="bg-green-100 text-center font-bold">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Sección Reciclaje */}
                      <TableRow className="bg-green-50">
                        <TableCell colSpan={14} className="font-bold text-center bg-green-200">
                          Reciclaje
                        </TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell className="font-medium">Mixed File</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="p-1">
                            <Input
                              type="number"
                              value={month.mixedFile}
                              onChange={(e) => updateValue(index, 'mixedFile', parseFloat(e.target.value) || 0)}
                              className="w-16 h-8 text-xs"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('mixedFile')}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Office Paper</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="p-1">
                            <Input
                              type="number"
                              value={month.officePaper}
                              onChange={(e) => updateValue(index, 'officePaper', parseFloat(e.target.value) || 0)}
                              className="w-16 h-8 text-xs"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('officePaper')}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Magazine</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="p-1">
                            <Input
                              type="number"
                              value={month.magazine}
                              onChange={(e) => updateValue(index, 'magazine', parseFloat(e.target.value) || 0)}
                              className="w-16 h-8 text-xs"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('magazine')}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Newspaper</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="p-1">
                            <Input
                              type="number"
                              value={month.newspaper}
                              onChange={(e) => updateValue(index, 'newspaper', parseFloat(e.target.value) || 0)}
                              className="w-16 h-8 text-xs"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('newspaper')}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Cardboard</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="p-1">
                            <Input
                              type="number"
                              value={month.cardboard}
                              onChange={(e) => updateValue(index, 'cardboard', parseFloat(e.target.value) || 0)}
                              className="w-16 h-8 text-xs"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('cardboard')}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">PET (Polyethylene Terephthalate)</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="p-1">
                            <Input
                              type="number"
                              value={month.petPlastic}
                              onChange={(e) => updateValue(index, 'petPlastic', parseFloat(e.target.value) || 0)}
                              className="w-16 h-8 text-xs"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('petPlastic')}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">HDPE (Blown)</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="p-1">
                            <Input
                              type="number"
                              value={month.hdpeBlown}
                              onChange={(e) => updateValue(index, 'hdpeBlown', parseFloat(e.target.value) || 0)}
                              className="w-16 h-8 text-xs"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('hdpeBlown')}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">HDPE (Rigid)</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="p-1">
                            <Input
                              type="number"
                              value={month.hdpeRigid}
                              onChange={(e) => updateValue(index, 'hdpeRigid', parseFloat(e.target.value) || 0)}
                              className="w-16 h-8 text-xs"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('hdpeRigid')}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Tin Can</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="p-1">
                            <Input
                              type="number"
                              value={month.tinCan}
                              onChange={(e) => updateValue(index, 'tinCan', parseFloat(e.target.value) || 0)}
                              className="w-16 h-8 text-xs"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('tinCan')}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Aluminum</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="p-1">
                            <Input
                              type="number"
                              value={month.aluminum}
                              onChange={(e) => updateValue(index, 'aluminum', parseFloat(e.target.value) || 0)}
                              className="w-16 h-8 text-xs"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('aluminum')}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Glass</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="p-1">
                            <Input
                              type="number"
                              value={month.glass}
                              onChange={(e) => updateValue(index, 'glass', parseFloat(e.target.value) || 0)}
                              className="w-16 h-8 text-xs"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('glass')}</TableCell>
                      </TableRow>

                      <TableRow className="bg-green-100">
                        <TableCell className="font-bold">Total reciclaje</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="text-center font-bold">
                            {month.totalRecyclables}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('totalRecyclables')}</TableCell>
                      </TableRow>

                      {/* Sección Orgánicos */}
                      <TableRow className="bg-green-50">
                        <TableCell colSpan={14} className="font-bold text-center bg-green-200">
                          Orgánicos destinados a composta
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Orgánicos de comedor/jardinería</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="p-1">
                            <Input
                              type="number"
                              value={month.organicsCompost}
                              onChange={(e) => updateValue(index, 'organicsCompost', parseFloat(e.target.value) || 0)}
                              className="w-16 h-8 text-xs"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('organicsCompost')}</TableCell>
                      </TableRow>

                      <TableRow className="bg-green-100">
                        <TableCell className="font-bold">Total orgánicos</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="text-center font-bold">
                            {month.totalOrganics}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('totalOrganics')}</TableCell>
                      </TableRow>

                      {/* Sección Reuso */}
                      <TableRow className="bg-blue-50">
                        <TableCell colSpan={14} className="font-bold text-center bg-blue-200">
                          Reuso
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Vidrio donación</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="p-1">
                            <Input
                              type="number"
                              value={month.glassDonation}
                              onChange={(e) => updateValue(index, 'glassDonation', parseFloat(e.target.value) || 0)}
                              className="w-16 h-8 text-xs"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('glassDonation')}</TableCell>
                      </TableRow>

                      {/* Resumen y porcentajes */}
                      <TableRow className="bg-yellow-100">
                        <TableCell className="font-bold">Total Desviado</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="text-center font-bold">
                            {month.totalDiverted}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('totalDiverted')}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Total Generado</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="p-1">
                            <Input
                              type="number"
                              value={month.totalGenerated}
                              onChange={(e) => updateValue(index, 'totalGenerated', parseFloat(e.target.value) || 0)}
                              className="w-16 h-8 text-xs bg-yellow-50"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{calculateTotals('totalGenerated')}</TableCell>
                      </TableRow>

                      <TableRow className="bg-red-100">
                        <TableCell className="font-bold">% Desviación</TableCell>
                        {data.map((month, index) => (
                          <TableCell key={index} className="text-center font-bold">
                            <span className={month.deviationPercentage >= 90 ? 'text-green-600' : 'text-red-600'}>
                              {month.deviationPercentage.toFixed(1)}%
                            </span>
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">
                          <span className={averageDeviation >= 90 ? 'text-green-600' : 'text-red-600'}>
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

          {data.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos para {selectedYear}</h3>
                <p className="text-gray-500 mb-4">Haz clic en "Inicializar Año" para comenzar con la tabla de 12 meses</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}