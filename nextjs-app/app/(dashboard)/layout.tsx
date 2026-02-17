import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { ErrorBoundary } from "@/components/error-boundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden bg-[#0a1628]">
        <header className="flex items-center gap-2 p-2 border-b border-[rgba(56,189,248,0.08)] bg-[#0c1425]/80 backdrop-blur-lg lg:hidden">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
        </header>
        <main className="flex-1 overflow-y-auto flex flex-col">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
