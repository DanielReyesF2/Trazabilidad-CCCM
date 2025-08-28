import { Link, useLocation } from "wouter";
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
  ClipboardCheck
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
  
  // User data
  const user = {
    name: "CCCM Sustentabilidad",
    role: "Club Campestre"
  };
  
  return (
    <div className="flex flex-col w-64 bg-navy text-white">
      {/* Logo and brand */}
      <div className="flex items-center justify-center h-24 px-4 border-b border-navy-light">
        <div className="flex items-center">
          <img 
            src={logoEconova} 
            alt="Logo ECONOVA" 
            className="h-20 w-auto" 
          />
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 pt-4 pb-4">
        <div className="px-4 py-2 text-xs uppercase tracking-wider text-gray-400">Sistema Ambiental</div>
        <SidebarItem 
          to="/" 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          isActive={location === "/"}
        >
          Dashboard General
        </SidebarItem>
        
        <div className="px-4 py-2 mt-4 text-xs uppercase tracking-wider text-gray-400">Registro</div>
        <SidebarItem 
          to="/registro-diario" 
          icon={<Save className="w-5 h-5" />} 
          isActive={location === "/registro-diario"}
        >
          Registro Diario
        </SidebarItem>
        
        <div className="px-4 py-2 mt-4 text-xs uppercase tracking-wider text-gray-400">Módulos</div>
        <SidebarItem 
          to="/trazabilidad-residuos" 
          icon={<Table className="w-5 h-5" />} 
          isActive={location === "/trazabilidad-residuos"}
        >
          Trazabilidad Residuos
        </SidebarItem>
        <SidebarItem 
          to="/flujo-materiales" 
          icon={<GitBranch className="w-5 h-5" />} 
          isActive={location === "/flujo-materiales"}
        >
          Flujo de Materiales
        </SidebarItem>
        <SidebarItem 
          to="/auditoria-zero-waste" 
          icon={<ClipboardCheck className="w-5 h-5" />} 
          isActive={location === "/auditoria-zero-waste"}
        >
          Auditoría Zero Waste
        </SidebarItem>
        <SidebarItem 
          to="/energia" 
          icon={<Zap className="w-5 h-5" />} 
          isActive={location === "/energia"}
        >
          Energía
        </SidebarItem>
        <SidebarItem 
          to="/agua" 
          icon={<Droplets className="w-5 h-5" />} 
          isActive={location === "/agua"}
        >
          Agua
        </SidebarItem>
        <SidebarItem 
          to="/economia-circular" 
          icon={<RotateCcw className="w-5 h-5" />} 
          isActive={location === "/economia-circular"}
        >
          Economía Circular
        </SidebarItem>
        
        <div className="px-4 py-2 mt-4 text-xs uppercase tracking-wider text-gray-400">Administración</div>
        <SidebarItem 
          to="/documents" 
          icon={<FileUp className="w-5 h-5" />} 
          isActive={location === "/documents"}
        >
          Documentos
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
