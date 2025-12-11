import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  LayoutDashboard, 
  BarChart2, 
  FileText, 
  FileUp, 
  Users, 
  Settings, 
  LogOut,
  Trash2,
  Zap,
  Droplets,
  RotateCcw,
  Table,
  Download,
  Save,
  GitBranch,
  ClipboardCheck,
  Languages,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import logoEconova from "../../assets/Logo-ECONOVA-OF_Blanco.png";

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
}

const SidebarItem = ({ to, icon, children, isActive }: SidebarItemProps) => {
  return (
    <Link href={to} className={`flex items-center px-6 py-3 ${
      isActive 
        ? "text-gray-100 bg-navy-light" 
        : "text-gray-300 hover:bg-navy-light hover:text-white transition-colors"
    }`}>
      <span className="mr-3">{icon}</span>
      <span>{children}</span>
    </Link>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  const { t, i18n } = useTranslation();
  const [modulesOpen, setModulesOpen] = useState(true);
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };
  
  // Check if any module is active to keep dropdown open
  const isModuleActive = location === "/trazabilidad-residuos" || 
                         location === "/flujo-materiales" || 
                         location === "/auditoria-zero-waste" || 
                         location === "/energia" || 
                         location === "/agua" || 
                         location === "/economia-circular";
  
  // Auto-open modules if a module page is active
  useEffect(() => {
    if (isModuleActive) {
      setModulesOpen(true);
    }
  }, [isModuleActive]);
  
  // User data
  const user = {
    name: "CCCM Sustentabilidad",
    role: "Club Campestre"
  };
  
  return (
    <div className="flex flex-col w-64 bg-navy text-white">
      {/* Logo and brand */}
      <div className="flex flex-col items-center justify-center px-4 py-4 border-b border-navy-light">
        <img 
          src={logoEconova} 
          alt="Logo ECONOVA" 
          className="h-16 w-auto mb-3" 
        />
        {/* Language Toggle - Visible button */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-navy-light hover:bg-lime hover:text-navy transition-colors w-full"
        >
          <Languages className="w-4 h-4" />
          <span className={i18n.language === 'es' ? 'font-bold' : 'opacity-70'}>🇲🇽</span>
          <span className="text-gray-400">/</span>
          <span className={i18n.language === 'en' ? 'font-bold' : 'opacity-70'}>🇺🇸</span>
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 pt-4 pb-4">
        <div className="px-4 py-2 text-xs uppercase tracking-wider text-gray-400">{i18n.language === 'es' ? 'Sistema Ambiental' : 'Environmental System'}</div>
        <SidebarItem 
          to="/" 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          isActive={location === "/"}
        >
          {t('nav.dashboard')}
        </SidebarItem>
        
        <div className="px-4 py-2 mt-4 text-xs uppercase tracking-wider text-gray-400">{i18n.language === 'es' ? 'Registro' : 'Registry'}</div>
        <SidebarItem 
          to="/registro-diario" 
          icon={<Save className="w-5 h-5" />} 
          isActive={location === "/registro-diario"}
        >
          {t('nav.dailyRegister')}
        </SidebarItem>
        
        {/* Modules Dropdown */}
        <button
          onClick={() => setModulesOpen(!modulesOpen)}
          className="w-full flex items-center justify-between px-4 py-2 mt-4 text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
        >
          <span>{i18n.language === 'es' ? 'Módulos' : 'Modules'}</span>
          {modulesOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        
        {modulesOpen && (
          <>
            <SidebarItem 
              to="/trazabilidad-residuos" 
              icon={<Table className="w-5 h-5" />} 
              isActive={location === "/trazabilidad-residuos"}
            >
              {t('nav.wasteTraceability')}
            </SidebarItem>
            <SidebarItem 
              to="/flujo-materiales" 
              icon={<GitBranch className="w-5 h-5" />} 
              isActive={location === "/flujo-materiales"}
            >
              {t('nav.materialFlow')}
            </SidebarItem>
            <SidebarItem 
              to="/auditoria-zero-waste" 
              icon={<ClipboardCheck className="w-5 h-5" />} 
              isActive={location === "/auditoria-zero-waste"}
            >
              {t('nav.zeroWasteAudit')}
            </SidebarItem>
            <SidebarItem 
              to="/energia" 
              icon={<Zap className="w-5 h-5" />} 
              isActive={location === "/energia"}
            >
              {t('nav.energy')}
            </SidebarItem>
            <SidebarItem 
              to="/agua" 
              icon={<Droplets className="w-5 h-5" />} 
              isActive={location === "/agua"}
            >
              {t('nav.water')}
            </SidebarItem>
            <SidebarItem 
              to="/economia-circular" 
              icon={<RotateCcw className="w-5 h-5" />} 
              isActive={location === "/economia-circular"}
            >
              {t('nav.circularEconomy')}
            </SidebarItem>
          </>
        )}
        
        <div className="px-4 py-2 mt-4 text-xs uppercase tracking-wider text-gray-400">{i18n.language === 'es' ? 'Administración' : 'Administration'}</div>
        <SidebarItem 
          to="/documents" 
          icon={<FileUp className="w-5 h-5" />} 
          isActive={location === "/documents"}
        >
          {t('nav.documents')}
        </SidebarItem>
      </nav>
      
      {/* User profile */}
      <div className="flex items-center justify-between px-4 py-3 bg-navy-light">
        <div className="flex items-center">
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-400">{user.role}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
