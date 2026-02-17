"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { WorkflowProvider } from "@/context/workflow-context";
import { LaunchPlanProgressProvider } from "@/context/launch-plan-progress-context";
import { Toaster } from "@/components/ui/toaster";
import { CommandPalette } from "@/components/command-palette";
import { OnboardingTour } from "@/components/onboarding-tour";
import { LaunchPlanRouteSync } from "@/components/launch-plan-route-sync";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

const sidebarStyle = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
} as React.CSSProperties;

function KeyboardShortcutsProvider() {
  useKeyboardShortcuts();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WorkflowProvider>
        <LaunchPlanProgressProvider>
          <LaunchPlanRouteSync />
          <TooltipProvider>
            <SidebarProvider style={sidebarStyle}>
              <KeyboardShortcutsProvider />
              {children}
              <Toaster />
              <CommandPalette />
              <OnboardingTour />
            </SidebarProvider>
          </TooltipProvider>
        </LaunchPlanProgressProvider>
      </WorkflowProvider>
    </QueryClientProvider>
  );
}
