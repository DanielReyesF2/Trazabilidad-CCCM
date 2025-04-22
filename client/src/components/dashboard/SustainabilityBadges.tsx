import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SustainabilityBadgeProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  isActive: boolean;
  progress?: number;
}

const SustainabilityBadge: React.FC<SustainabilityBadgeProps> = ({ 
  icon, 
  name, 
  description, 
  isActive,
  progress = 100
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`relative flex flex-col items-center justify-center p-2 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-2 
                            ${isActive ? 'bg-gradient-to-br from-lime to-lime/60' : 'bg-gray-200'}`}>
              <div className="text-navy">
                {icon}
              </div>
            </div>
            <span className="text-xs font-semibold text-center">{name}</span>
            
            {/* Progress circle if not 100% */}
            {isActive && progress < 100 && (
              <svg className="absolute -top-1 -right-1 w-6 h-6 transform rotate-270">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#b5e951"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 0.628} 62.8`}
                  fill="none"
                  transform="rotate(-90 12 12)"
                />
              </svg>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px] p-3 text-xs">
          <p className="font-semibold mb-1">{name}</p>
          <p>{description}</p>
          {progress < 100 && isActive && (
            <p className="mt-1 text-lime font-medium">Progreso: {progress}%</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface SustainabilityBadgesProps {
  clientId: number;
}

const SustainabilityBadges: React.FC<SustainabilityBadgesProps> = ({ clientId }) => {
  // Reconocimientos ambientales basados en el cliente
  const achievements = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2Z"/>
          <path d="M14.5 8a2.5 2.5 0 0 1 5 0v10.5a2.5 2.5 0 0 1-5 0V8Z"/>
        </svg>
      ),
      name: "Triple Impacto",
      description: "Reconocimiento por equilibrar resultados económicos con impactos sociales y ambientales positivos.",
      isActive: clientId === 4, // Solo Club Campestre tiene este logro
      progress: 100,
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.44 8.49a5 5 0 0 0 7.12 0"/>
          <path d="M8.44 15.51a5 5 0 0 1 7.12 0"/>
          <path d="M2 12h1"/>
          <path d="M21 12h1"/>
          <path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10Z"/>
        </svg>
      ),
      name: "PRE Certificado True Zero Waste",
      description: "Certificación que reconoce el compromiso de reducir los residuos enviados a rellenos sanitarios a través de estrategias de reciclaje y compostaje.",
      isActive: clientId === 4, // Solo Club Campestre tiene este logro
      progress: 75,
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.33 2h9.34"/>
          <path d="M12 6v16"/>
          <path d="M5 10h14"/>
        </svg>
      ),
      name: "Carbono Neutral",
      description: "Compromiso de alcanzar cero emisiones netas de carbono para 2030.",
      isActive: false,
      progress: 0,
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16.75 2A4.29 4.29 0 0 1 21 6.25C21 12.5 12 18 12 18s-9-5.5-9-11.75A4.29 4.29 0 0 1 7.25 2a4.14 4.14 0 0 1 3.34 1.66h0a4.14 4.14 0 0 1 3.09-1.45"/> 
          <path d="m12 7 2 5h-4l2 4"/>
        </svg>
      ),
      name: "Ecología Regenerativa",
      description: "Implementación de prácticas que no solo reducen impacto, sino que contribuyen positivamente al medio ambiente.",
      isActive: clientId === 4, // Solo Club Campestre tiene este logro
      progress: 50,
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h0c-1.4 0-2.5-1.1-2.5-2.5V2"/>
          <path d="M8.5 2h7"/>
          <path d="M14.5 16h-5"/>
        </svg>
      ),
      name: "Economía Circular",
      description: "Programa de gestión de residuos que implementa principios de economía circular para maximizar el aprovechamiento de recursos.",
      isActive: clientId === 4, // Club Campestre tiene este logro
      progress: 85,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-lime" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19.2 17.8a2.7 2.7 0 0 0 0-3.81l-.83-.82a1.7 1.7 0 0 0-2.4 0l-.82.82"/>
            <path d="M7.3 7.3a2.7 2.7 0 0 0 0 3.82l.83.82a1.7 1.7 0 0 0 2.4 0l.82-.82"/>
            <path d="m15.5 11.5-3 3"/>
            <path d="M8.5 8.5a7 7 0 0 1 10 10 7 7 0 0 1-10-10Z"/>
          </svg>
          Reconocimientos Ambientales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {achievements.map((badge, index) => (
            <SustainabilityBadge 
              key={index}
              icon={badge.icon}
              name={badge.name}
              description={badge.description}
              isActive={badge.isActive}
              progress={badge.progress}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SustainabilityBadges;