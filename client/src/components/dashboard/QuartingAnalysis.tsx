import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface QuartingAnalysisProps {
  wasteData: any[];
  clientId: number;
}

export default function QuartingAnalysis({ wasteData, clientId }: QuartingAnalysisProps) {
  // Datos del último cuarteo realizado según requerimientos del cliente
  // 70% de residuos orgánicos de comedor en la composición
  const quartingResults = [
    { name: 'Orgánico (Comedor)', value: 70.0, color: '#5f27cd' },
    { name: 'Plástico PET', value: 6.8, color: '#ff6b6b' },
    { name: 'Papel', value: 8.2, color: '#48dbfb' },
    { name: 'Cartón', value: 5.7, color: '#feca57' },
    { name: 'Metal', value: 2.4, color: '#1dd1a1' },
    { name: 'Vidrio', value: 3.1, color: '#00d2d3' },
    { name: 'No reciclable', value: 3.8, color: '#c8d6e5' }
  ];
  
  // Calcular potencial reciclable (100% - porcentaje no reciclable)
  const nonRecyclableValue = quartingResults.find(item => item.name === 'No reciclable')?.value || 0;
  const recyclablePotential = 100 - nonRecyclableValue;
  
  // Fecha de la última auditoría
  const lastAuditDate = new Date(2025, 2, 15);  // 15 de marzo de 2025
  
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white text-xl">Análisis de Cuarteo</CardTitle>
          <div className="px-2 py-1 bg-white/20 rounded-full text-xs text-white font-semibold">
            Última auditoría: {lastAuditDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-5">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Composición de Residuos</h3>
          <div className="grid grid-cols-12 h-[260px]">
            <div className="col-span-7">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie 
                    data={quartingResults} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={0}
                    outerRadius={100} 
                    paddingAngle={1} 
                    dataKey="value"
                    startAngle={180}
                    endAngle={-180}
                  >
                    {quartingResults.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Proporción']}
                    contentStyle={{
                      backgroundColor: 'white', 
                      borderRadius: '0.5rem',
                      boxShadow: '0 10px 15px -5px rgba(0, 0, 0, 0.1)',
                      border: 'none',
                      padding: '6px 8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="col-span-5 flex items-center">
              <div className="w-full">
                {quartingResults.map((item, index) => (
                  <div key={index} className="flex items-center mb-1 text-xs">
                    <div className="w-3 h-3 mr-2" style={{ backgroundColor: item.color }} />
                    <span>{item.name} {item.value}%</span>
                  </div>
                ))}
                <div className="mt-4 bg-gray-50 px-4 py-2 rounded-lg">
                  <div className="text-xs text-gray-500">Potencial Reciclable</div>
                  <div className="text-2xl font-bold text-navy">{recyclablePotential.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">Observaciones</h3>
            <div className="text-sm text-gray-700">
              <p className="mb-2">Se siguen encontrando residuos reciclables dentro de lo que va a relleno sanitario debido a un mal manejo interno.</p>
              <p>Aproximadamente el 78% de lo que va a relleno sanitario es realmente aprovechable con una correcta separación en origen.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Hallazgos principales</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
            <li>El 70% de la composición corresponde a residuos orgánicos de comedor</li>
            <li>El {recyclablePotential.toFixed(1)}% de los residuos son potencialmente aprovechables</li>
            <li>Existe una oportunidad de incrementar el índice de desviación actual (37.18%) significativamente</li>
            <li>Se requiere mejorar la capacitación del personal y la señalización de contenedores para reducir la contaminación</li>
            <li>Los residuos de Papel y Cartón (13.9% combinado) representan una importante oportunidad de captura</li>
          </ul>
        </div>
        
        <div className="mt-4 text-xs text-center text-gray-500 border-t pt-3">
          Los resultados del análisis de cuarteo proveen una caracterización detallada de residuos para optimizar estrategias de reciclaje
        </div>
      </CardContent>
    </Card>
  );
}