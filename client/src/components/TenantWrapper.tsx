import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Client } from "@shared/schema";

interface TenantInfo {
  client: Client;
  settings: Record<string, any>;
  features: Record<string, boolean>;
}

interface TenantContextType {
  tenantInfo: TenantInfo | null;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType>({
  tenantInfo: null,
  isLoading: true,
  error: null
});

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within TenantWrapper");
  }
  return context;
};

interface TenantWrapperProps {
  clientSlug: string;
  children: ReactNode;
}

export default function TenantWrapper({ clientSlug, children }: TenantWrapperProps) {
  const [error, setError] = useState<string | null>(null);

  const { data: tenantInfo, isLoading, error: queryError } = useQuery({
    queryKey: [`/api/tenant/${clientSlug}/info`],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (queryError) {
      setError(`Error loading tenant "${clientSlug}"`);
    } else {
      setError(null);
    }
  }, [queryError, clientSlug]);

  useEffect(() => {
    if (tenantInfo?.client) {
      // Apply dynamic theming based on tenant colors
      const root = document.documentElement;
      if (tenantInfo.client.primaryColor) {
        root.style.setProperty('--tenant-primary', tenantInfo.client.primaryColor);
      }
      if (tenantInfo.client.secondaryColor) {
        root.style.setProperty('--tenant-secondary', tenantInfo.client.secondaryColor);
      }
      
      // Update document title
      document.title = `ECONOVA - ${tenantInfo.client.name}`;
    }
  }, [tenantInfo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#273949] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando {clientSlug}...</p>
        </div>
      </div>
    );
  }

  if (error || !tenantInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Cliente no encontrado
            </h1>
            <p className="text-gray-600 mb-4">
              El cliente "{clientSlug}" no existe o no está disponible.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-[#273949] text-white px-4 py-2 rounded hover:bg-[#1e2b37] transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TenantContext.Provider 
      value={{ 
        tenantInfo, 
        isLoading, 
        error 
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}