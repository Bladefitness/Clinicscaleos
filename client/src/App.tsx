import { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { WorkflowProvider } from "@/context/workflow-context";
import { LaunchPlanProgressProvider } from "@/context/launch-plan-progress-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { CommandPalette } from "@/components/command-palette";
import { OnboardingTour } from "@/components/onboarding-tour";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LaunchPlanRouteSync } from "@/components/LaunchPlanRouteSync";

const Dashboard = lazy(() => import("@/pages/dashboard"));
const ResearchPortal = lazy(() => import("@/pages/research-portal"));
const OfferLab = lazy(() => import("@/pages/offer-lab"));
const CreativeFactory = lazy(() => import("@/pages/creative-factory"));
const CampaignHQ = lazy(() => import("@/pages/campaign-hq"));
const AdCoach = lazy(() => import("@/pages/ad-coach"));
const NotFound = lazy(() => import("@/pages/not-found"));

const PageFallback = () => (
  <div className="flex flex-1 items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/research-portal" component={ResearchPortal} />
      <Route path="/offer-lab" component={OfferLab} />
      <Route path="/creative-factory" component={CreativeFactory} />
      <Route path="/campaign-hq" component={CampaignHQ} />
      <Route path="/ad-coach" component={AdCoach} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useKeyboardShortcuts();
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WorkflowProvider>
      <LaunchPlanProgressProvider>
      <LaunchPlanRouteSync />
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center gap-2 p-2 border-b border-border lg:hidden">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
              </header>
              <main className="flex-1 overflow-hidden flex flex-col">
                <ErrorBoundary>
                  <Suspense fallback={<PageFallback />}>
                    <Router />
                  </Suspense>
                </ErrorBoundary>
              </main>
            </div>
          </div>
          <BottomNav />
        </SidebarProvider>
        <Toaster />
        <CommandPalette />
        <OnboardingTour />
      </TooltipProvider>
      </LaunchPlanProgressProvider>
      </WorkflowProvider>
    </QueryClientProvider>
  );
}

export default App;
