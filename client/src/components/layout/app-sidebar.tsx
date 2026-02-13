import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Sparkles,
  Target,
  Map,
  MessageSquare,
  RefreshCw,
  Zap,
} from "lucide-react";
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
  { title: "Offer Lab", href: "/offer-lab", icon: Target, badge: "M1" },
  { title: "Creative Factory", href: "/creative-factory", icon: Sparkles, badge: "M2" },
  { title: "Campaign HQ", href: "/campaign-hq", icon: Map, badge: "M3" },
  { title: "Ad Coach", href: "/ad-coach", icon: MessageSquare, badge: "M4" },
  { title: "Iteration Lab", href: "/iteration-lab", icon: RefreshCw, badge: "M5" },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar data-testid="sidebar">
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sidebar-foreground font-semibold text-sm leading-tight">Clinic Growth OS</h1>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider mt-0.5">Advertising OS</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider">Modules</SidebarGroupLabel>
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
                      <SidebarMenuBadge className="text-[9px] font-semibold bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border-0">
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
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-semibold">
              DR
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sidebar-foreground text-sm font-medium truncate" data-testid="text-user-name">Dr. Blade</p>
            <p className="text-muted-foreground text-xs truncate">Premium Plan</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
