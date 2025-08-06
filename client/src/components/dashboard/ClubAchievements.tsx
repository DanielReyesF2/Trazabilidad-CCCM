import React from 'react';
import { Award, Droplets, Leaf, Recycle, Shell } from 'lucide-react';

const achievements = [
  {
    icon: <Recycle className="h-6 w-6" />,
    name: "Economía Circular",
    description: "Implementación de principios de economía circular para maximizar el aprovechamiento de recursos",
    progress: 85,
    color: "bg-blue-500"
  },
  {
    icon: <Shell className="h-6 w-6" />,
    name: "Carbono Neutral",
    description: "Programa de reducción de emisiones de carbono",
    progress: 65,
    color: "bg-teal-500"
  },
  {
    icon: <Leaf className="h-6 w-6" />,
    name: "Ecología Regenerativa",
    description: "Prácticas que contribuyen positivamente al medio ambiente",
    progress: 50,
    color: "bg-amber-500"
  },
  {
    icon: <Droplets className="h-6 w-6" />,
    name: "Ahorro Hídrico",
    description: "Iniciativas para reducir el consumo de agua en las instalaciones",
    progress: 75,
    color: "bg-cyan-500"
  }
];

export const ClubAchievements = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-gray-900 mb-4">Certificaciones</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900">85%</div>
          <div className="text-xs text-gray-500">Economía Circular</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900">75%</div>
          <div className="text-xs text-gray-500">Ahorro Hídrico</div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 text-center">
        <span className="text-xs text-gray-500">ISO 14001 · Dic 2025</span>
      </div>
    </div>
  );
};