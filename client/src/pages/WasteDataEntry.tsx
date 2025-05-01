import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WasteDataForm from "@/components/wastedata/WasteDataForm";
import WasteDataHistory from "@/components/wastedata/WasteDataHistory";

export default function WasteDataEntry() {
  const [activeTab, setActiveTab] = useState("form");
  
  // Obtener lista de clientes para el formulario
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
    staleTime: 60 * 1000, // 1 minuto
  });
  
  // Cuando se registra un nuevo dato, cambiar a la pestaña de historial
  const handleFormSuccess = () => {
    setActiveTab("history");
  };
  
  return (
    <>
      <Helmet>
        <title>Registro de Residuos | Econova</title>
      </Helmet>
      
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Registro de Residuos</h1>
        
        <p className="text-gray-600 mb-6 max-w-3xl">
          Esta página permite a los operadores registrar diariamente los datos de generación de residuos
          sin necesidad de esperar la documentación formal. Los datos registrados se incorporan
          automáticamente a los reportes y análisis de tendencias.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="form">Registrar Datos</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="space-y-6">
            <WasteDataForm 
              clients={clients} 
              onSuccess={handleFormSuccess}
            />
          </TabsContent>
          
          <TabsContent value="history">
            <WasteDataHistory limit={15} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}