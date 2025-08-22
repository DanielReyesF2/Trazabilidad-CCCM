import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Client {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export default function ClientSelector() {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/admin/clients'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#273949] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  const activeClients = clients?.filter((client: Client) => client.isActive) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-[#273949] rounded-lg flex items-center justify-center text-white font-bold">
                E
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ECONOVA</h1>
                <p className="text-gray-600">Gestión Ambiental Integral</p>
              </div>
            </div>
            <a
              href="/admin"
              className="text-sm text-gray-600 hover:text-[#273949] transition-colors"
            >
              Admin Panel
            </a>
          </div>
        </div>
      </div>

      {/* Client Selection */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Selecciona tu Cliente
          </h2>
          <p className="text-xl text-gray-600">
            Accede a tu dashboard ambiental personalizado
          </p>
        </div>

        {/* Client Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeClients.map((client: Client) => (
            <Card 
              key={client.id} 
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#b5e951]"
              onClick={() => window.location.href = `/${client.slug}/dashboard`}
            >
              <CardHeader className="text-center pb-4">
                {/* Client Icon/Avatar */}
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform"
                  style={{ 
                    backgroundColor: client.primaryColor || '#273949'
                  }}
                >
                  {client.name.charAt(0)}
                </div>
                
                <CardTitle className="text-xl group-hover:text-[#273949] transition-colors">
                  {client.name}
                </CardTitle>
                
                <CardDescription className="text-sm">
                  /{client.slug}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  {client.description || "Sistema de gestión ambiental integral"}
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span>Módulos Activos</span>
                    <Badge variant="secondary">4/4</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Estado</span>
                    <Badge className="bg-green-100 text-green-800">Operativo</Badge>
                  </div>
                </div>

                <button 
                  className="w-full py-3 bg-[#273949] text-white rounded-lg font-medium group-hover:bg-[#1e2b37] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/${client.slug}/dashboard`;
                  }}
                >
                  Acceder al Dashboard
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {activeClients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay clientes activos
            </h3>
            <p className="text-gray-600 mb-6">
              Los administradores pueden activar clientes desde el panel de administración.
            </p>
            <a
              href="/admin"
              className="inline-flex items-center px-4 py-2 bg-[#273949] text-white rounded-lg hover:bg-[#1e2b37] transition-colors"
            >
              Ir al Panel de Admin
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-500 text-sm">
            ECONOVA © 2025 - Sistema de Gestión Ambiental Multi-Tenant
          </p>
        </div>
      </div>
    </div>
  );
}