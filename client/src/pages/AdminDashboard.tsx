import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Client {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
}

export default function AdminDashboard() {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/admin/clients'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Administración ECONOVA
          </h1>
          <p className="text-gray-600">
            Gestión global de clientes y configuraciones
          </p>
        </div>

        {/* Client Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {clients?.map((client: Client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <Badge variant={client.isActive ? "default" : "secondary"}>
                    {client.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <CardDescription>
                  /{client.slug}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {client.description || "Sin descripción"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.location.href = `/${client.slug}/dashboard`}
                    className="flex-1 bg-[#273949] text-white px-3 py-2 rounded text-sm hover:bg-[#1e2b37] transition-colors"
                  >
                    Ver Dashboard
                  </button>
                  <button
                    onClick={() => window.location.href = `/${client.slug}`}
                    className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                  >
                    Configurar
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="font-medium">Crear Cliente</div>
              <div className="text-sm text-gray-600">Agregar nuevo tenant</div>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="font-medium">Configuración Global</div>
              <div className="text-sm text-gray-600">Settings del sistema</div>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="font-medium">Reportes Globales</div>
              <div className="text-sm text-gray-600">Analytics de todos los clientes</div>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="font-medium">Backup & Restore</div>
              <div className="text-sm text-gray-600">Gestión de datos</div>
            </button>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-[#273949]">{clients?.length || 0}</div>
            <div className="text-gray-600">Clientes Totales</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {clients?.filter((c: Client) => c.isActive).length || 0}
            </div>
            <div className="text-gray-600">Clientes Activos</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-[#b5e951]">4</div>
            <div className="text-gray-600">Módulos Disponibles</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">100%</div>
            <div className="text-gray-600">Sistema Operativo</div>
          </div>
        </div>
      </div>
    </div>
  );
}