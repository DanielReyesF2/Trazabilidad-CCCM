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
import FlujoDeMateriales from "@/pages/FlujoDeMateriales";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/registro-diario" component={RegistroDiario} />
      <Route path="/historial-mensual" component={HistorialMensual} />
      <Route path="/trazabilidad-residuos" component={ResiduosExcel} />
      <Route path="/energia" component={Energia} />
      <Route path="/agua" component={Agua} />
      <Route path="/economia-circular" component={EconomiaCircular} />
      <Route path="/documents" component={Documents} />
      <Route path="/analysis" component={Analysis} />
      <Route path="/data-entry" component={DataEntry} />
      <Route path="/export" component={DataExport} />
      <Route path="/flujo-materiales" component={FlujoDeMateriales} />
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
