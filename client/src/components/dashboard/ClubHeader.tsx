import { Leaf, Calendar, Building, Trees, Wind } from 'lucide-react';
import { Link } from 'wouter';

export const ClubHeader = () => {
  return (
    <div className="bg-navy text-white rounded-lg mb-8 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Imagen de fondo con degradado */}
        <div className="relative w-full md:w-1/3 h-40 md:h-auto bg-gradient-to-br from-blue-600 to-navy flex items-center justify-center p-8">
          <div className="absolute inset-0 opacity-20">
            {/* Patrón de golf estilizado */}
            <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full border-2 border-white"></div>
            <div className="absolute top-2/3 right-1/4 w-12 h-12 rounded-full border-2 border-white"></div>
            <div className="absolute bottom-1/4 left-1/3 w-20 h-20 rounded-full border-2 border-white"></div>
            <Trees className="absolute top-1/2 right-1/3 h-24 w-24 text-white opacity-10" />
            <Wind className="absolute bottom-1/4 right-1/4 h-16 w-16 text-white opacity-10" />
          </div>
          
          {/* Logo y nombre del club */}
          <div className="relative z-10 text-center">
            <h1 className="font-anton text-3xl md:text-4xl uppercase tracking-widest mb-2 text-white">
              Club Campestre
            </h1>
            <p className="text-white/80 text-sm md:text-base italic">
              CDMX · Est. 1929
            </p>
          </div>
        </div>
        
        {/* Información y estadísticas */}
        <div className="flex-1 p-6 bg-navy">
          <div className="flex flex-col h-full justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Centro de Gestión Ambiental</h2>
              <p className="text-white/70 text-sm mb-4">
                Plataforma exclusiva para la gestión y monitoreo de residuos del Club Campestre de la Ciudad de México. 
                Comprometidos con la sostenibilidad desde 2022.
              </p>
            </div>
            
            {/* Indicadores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div className="flex flex-col items-center bg-white/10 rounded-lg p-3">
                <Leaf className="h-5 w-5 text-lime mb-1" />
                <span className="text-xs text-white/80">Categoría</span>
                <span className="font-bold">Excelencia</span>
              </div>
              <div className="flex flex-col items-center bg-white/10 rounded-lg p-3">
                <Calendar className="h-5 w-5 text-lime mb-1" />
                <span className="text-xs text-white/80">Desde</span>
                <span className="font-bold">Ene 2024</span>
              </div>
              <div className="flex flex-col items-center bg-white/10 rounded-lg p-3">
                <Building className="h-5 w-5 text-lime mb-1" />
                <span className="text-xs text-white/80">Instalaciones</span>
                <span className="font-bold">5 Áreas</span>
              </div>
              <div className="flex flex-col items-center bg-white/10 rounded-lg p-3">
                <Trees className="h-5 w-5 text-lime mb-1" />
                <span className="text-xs text-white/80">Árboles salvados</span>
                <span className="font-bold">498</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Acciones rápidas */}
      <div className="bg-lime text-navy px-6 py-3 flex justify-between items-center">
        <div className="text-sm font-medium">
          ✅ Sistema actualizado al 02 de mayo, 2025
        </div>
        <div className="flex space-x-2">
          <Link href="/data-entry">
            <button className="bg-navy text-white text-sm px-4 py-1.5 rounded-full hover:bg-opacity-90 transition-colors">
              Registrar datos
            </button>
          </Link>
          <button className="bg-white text-navy text-sm px-4 py-1.5 rounded-full hover:bg-opacity-90 transition-colors">
            Ver informes
          </button>
        </div>
      </div>
    </div>
  );
};