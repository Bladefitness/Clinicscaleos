import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Target,
  Map,
  MessageSquare,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard, badge: null },
  { title: "Research Portal", href: "/research-portal", icon: Search, badge: "M0" },
  { title: "Offer Lab", href: "/offer-lab", icon: Target, badge: "M1" },
  { title: "Creative Factory", href: "/creative-factory", icon: Sparkles, badge: "M2" },
  { title: "Campaign HQ", href: "/campaign-hq", icon: Map, badge: "M3" },
  { title: "Ad Coach", href: "/ad-coach", icon: MessageSquare, badge: "M4" },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar data-testid="sidebar">
      <SidebarHeader className="p-4 pb-3">
        <div className="flex items-center gap-3">
          <img
            src="https://storage.googleapis.com/msgsndr/W7BRJwzJCvFs9r0xZHrE/media/689fb981bccb296d0b10507e.png"
            alt="Clinic Growth OS"
            className="w-10 h-10 rounded-xl flex-shrink-0 shadow-sm object-cover"
          />
          <div className="min-w-0">
            <h1 className="text-sidebar-foreground font-bold text-sm leading-tight truncate">Clinic Growth OS</h1>
            <p className="text-sidebar-foreground/90 text-xs uppercase tracking-wider mt-0.5">Dominate your market</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground uppercase tracking-wider">Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={`nav-${item.href.replace("/", "") || "dashboard"}`}
                    >
                      <Link href={item.href}>
                        <item.icon className="w-[18px] h-[18px]" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className="text-[9px] font-semibold bg-primary/10 text-primary border-0">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <p className="text-[11px] text-muted-foreground mb-2 space-y-0.5">
          <span className="block"><kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">⌘K</kbd> search</span>
          <span className="block"><kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">⌘1–6</kbd> jump</span>
        </p>
        <div className="flex items-center justify-end mb-3">
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              DR
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sidebar-foreground text-sm font-medium truncate" data-testid="text-user-name">Dr. Blade</p>
            <p className="text-sidebar-foreground/90 text-xs truncate">Premium Plan</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
