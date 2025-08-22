import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Documents from "@/pages/documents";
import Analysis from "@/pages/analysis";
import DataEntry from "@/pages/DataEntry";
import ResiduosExcel from "@/pages/ResiduosExcel";
import RegistroDiario from "@/pages/RegistroDiario";
import HistorialMensual from "@/pages/HistorialMensual";
import Energia from "@/pages/Energia";
import Agua from "@/pages/Agua";
import EconomiaCircular from "@/pages/EconomiaCircular";
import DataExport from "@/pages/DataExport";
import AdminDashboard from "@/pages/AdminDashboard";
import ClientSelector from "@/pages/ClientSelector";
import TenantWrapper from "@/components/TenantWrapper";

function Router() {
  return (
    <Switch>
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      
      {/* Client Selector (landing page) */}
      <Route path="/" component={ClientSelector} />
      
      {/* Tenant Routes */}
      <Route path="/:clientSlug">
        {(params: { clientSlug: string }) => (
          <TenantWrapper clientSlug={params.clientSlug}>
            <Switch>
              <Route path="/:clientSlug" component={Dashboard} />
              <Route path="/:clientSlug/dashboard" component={Dashboard} />
              <Route path="/:clientSlug/registro-diario" component={RegistroDiario} />
              <Route path="/:clientSlug/historial-mensual" component={HistorialMensual} />
              <Route path="/:clientSlug/trazabilidad-residuos" component={ResiduosExcel} />
              <Route path="/:clientSlug/energia" component={Energia} />
              <Route path="/:clientSlug/agua" component={Agua} />
              <Route path="/:clientSlug/economia-circular" component={EconomiaCircular} />
              <Route path="/:clientSlug/documents" component={Documents} />
              <Route path="/:clientSlug/analysis" component={Analysis} />
              <Route path="/:clientSlug/data-entry" component={DataEntry} />
              <Route path="/:clientSlug/export" component={DataExport} />
              <Route component={NotFound} />
            </Switch>
          </TenantWrapper>
        )}
      </Route>
      
      {/* Legacy routes for backwards compatibility (redirect to CCCM) */}
      <Route path="/registro-diario">
        {() => {
          window.location.href = "/cccm/registro-diario";
          return null;
        }}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
