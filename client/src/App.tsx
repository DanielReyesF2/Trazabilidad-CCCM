import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Documents from "@/pages/documents";
import Analysis from "@/pages/analysis";
import Reports from "@/pages/reports";
import Clients from "@/pages/clients";
import Settings from "@/pages/settings";
import ClientDetail from "@/pages/ClientDetail";
import ReportGenerator from "@/pages/ReportGenerator";
import WasteDataEntry from "@/pages/WasteDataEntry";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/documents" component={Documents} />
      <Route path="/analysis" component={Analysis} />
      <Route path="/reports" component={Reports} />
      <Route path="/clients" component={Clients} />
      <Route path="/clients/:id" component={ClientDetail} />
      <Route path="/reports/:id" component={ReportGenerator} />
      <Route path="/data-entry" component={WasteDataEntry} />
      <Route path="/settings" component={Settings} />
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
