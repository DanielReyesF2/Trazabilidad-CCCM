import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  BarChart2, 
  FileText, 
  FileUp, 
  Users, 
  Settings, 
  LogOut 
} from "lucide-react";

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
  
  // Mock user data (in a real app this would come from auth context)
  const user = {
    name: "Ana Rodríguez",
    role: "Administrador",
    // This would be a real image URL in production
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };
  
  return (
    <div className="flex flex-col w-64 bg-navy text-white">
      {/* Logo and brand */}
      <div className="flex items-center justify-center h-24 px-4 border-b border-navy-light">
        <div className="flex items-center">
          <img 
            src="/assets/logo.png" 
            alt="Logo ECONOVA" 
            className="h-16 w-auto" 
          />
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 pt-4 pb-4">
        <div className="px-4 py-2 text-xs uppercase tracking-wider text-gray-400">Principal</div>
        <SidebarItem 
          to="/" 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          isActive={location === "/"}
        >
          Dashboard
        </SidebarItem>
        <SidebarItem 
          to="/analysis" 
          icon={<BarChart2 className="w-5 h-5" />} 
          isActive={location === "/analysis"}
        >
          Análisis
        </SidebarItem>
        <SidebarItem 
          to="/reports" 
          icon={<FileText className="w-5 h-5" />} 
          isActive={location === "/reports"}
        >
          Reportes
        </SidebarItem>
        <SidebarItem 
          to="/documents" 
          icon={<FileUp className="w-5 h-5" />} 
          isActive={location === "/documents"}
        >
          Documentos
        </SidebarItem>
        
        <div className="px-4 py-2 mt-6 text-xs uppercase tracking-wider text-gray-400">Administración</div>
        <SidebarItem 
          to="/clients" 
          icon={<Users className="w-5 h-5" />} 
          isActive={location === "/clients"}
        >
          Clientes
        </SidebarItem>
        <SidebarItem 
          to="/settings" 
          icon={<Settings className="w-5 h-5" />} 
          isActive={location === "/settings"}
        >
          Configuración
        </SidebarItem>
      </nav>
      
      {/* User profile */}
      <div className="flex items-center justify-between px-4 py-3 bg-navy-light">
        <div className="flex items-center">
          <img className="w-8 h-8 rounded-full" src={user.avatar} alt="Foto de perfil" />
          <div className="ml-3">
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
