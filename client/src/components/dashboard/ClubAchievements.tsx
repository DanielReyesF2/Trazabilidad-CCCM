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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-anton text-gray-800 uppercase tracking-wider">Logros de Sostenibilidad</h2>
          <Award className="h-5 w-5 text-lime" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div 
              key={index} 
              className="flex p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className={`flex-shrink-0 rounded-full p-2.5 ${achievement.color} text-white mr-4`}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{achievement.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-3">
                  <div 
                    className={`h-1.5 rounded-full ${achievement.color}`}
                    style={{ width: `${achievement.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">Progreso</span>
                  <span className="text-xs font-medium">{achievement.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 text-center">
        <span className="text-sm text-gray-600">
          Certificación ISO 14001 en proceso - Estimado: Diciembre 2025
        </span>
      </div>
    </div>
  );
};