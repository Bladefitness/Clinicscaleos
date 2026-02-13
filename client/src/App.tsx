import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import Dashboard from "@/pages/dashboard";
import OfferLab from "@/pages/offer-lab";
import CreativeFactory from "@/pages/creative-factory";
import CampaignHQ from "@/pages/campaign-hq";
import AdCoach from "@/pages/ad-coach";
import IterationLab from "@/pages/iteration-lab";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/offer-lab" component={OfferLab} />
      <Route path="/creative-factory" component={CreativeFactory} />
      <Route path="/campaign-hq" component={CampaignHQ} />
      <Route path="/ad-coach" component={AdCoach} />
      <Route path="/iteration-lab" component={IterationLab} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center gap-2 p-2 border-b border-border lg:hidden">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
              </header>
              <main className="flex-1 overflow-hidden flex flex-col">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
