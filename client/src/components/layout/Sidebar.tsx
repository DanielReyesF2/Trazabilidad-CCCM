import React from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  LogOut,
  Table,
  Languages,
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

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };
  
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
        <SidebarItem
          to="/trazabilidad-residuos"
          icon={<Table className="w-5 h-5" />}
          isActive={location === "/trazabilidad-residuos"}
        >
          {t('nav.wasteTraceability')}
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
