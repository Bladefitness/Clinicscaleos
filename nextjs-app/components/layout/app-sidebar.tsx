"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Sparkles,
  Map,
  MessageSquare,
  RefreshCw,
  Wrench,
  Video,
  Receipt,
  Search,
  Crown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Offer Lab", href: "/offer-lab", icon: Target },
  { title: "Creative Factory", href: "/creative-factory", icon: Sparkles },
  { title: "Campaign HQ", href: "/campaign-hq", icon: Map },
  { title: "Ad Coach", href: "/ad-coach", icon: MessageSquare },
  { title: "Iteration Lab", href: "/iteration-lab", icon: RefreshCw },
  { title: "AI Tools", href: "/ai-tools", icon: Wrench },
  { title: "Video Studio", href: "/video-studio", icon: Video },
  { title: "Receipts", href: "/receipts", icon: Receipt },
  { title: "Research Portal", href: "/research-portal", icon: Search },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar data-testid="sidebar" className="border-r border-[rgba(56,189,248,0.08)] bg-[#0c1425]">
      <SidebarHeader className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-3">
          <Image
            src="https://storage.googleapis.com/msgsndr/W7BRJwzJCvFs9r0xZHrE/media/689fb981bccb296d0b10507e.png"
            alt="Health Pro CEO Academy"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <div className="min-w-0">
            <span className="text-[14px] font-semibold text-white tracking-[-0.01em] block leading-tight">
              Health Pro CEO
            </span>
            <span className="text-[11px] text-[#c8a04a] font-medium">
              Academy
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#0c1425]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={isActive
                        ? "bg-[rgba(56,189,248,0.1)] text-white rounded-xl h-10 px-3 text-[13px] font-medium hover:bg-[rgba(56,189,248,0.15)] border border-[rgba(56,189,248,0.15)] shadow-[0_0_10px_rgba(56,189,248,0.05)]"
                        : "text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-xl h-10 px-3 text-[13px] font-normal"
                      }
                      data-testid={`nav-${item.href.replace("/", "") || "dashboard"}`}
                    >
                      <Link href={item.href}>
                        <item.icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.5} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-5 py-4 border-t border-[rgba(56,189,248,0.08)] bg-[#0c1425]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c8a04a] to-[#a07830] flex items-center justify-center shadow-[0_0_12px_rgba(200,160,74,0.3)]">
            <span className="text-white text-[11px] font-semibold">DR</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-medium truncate" data-testid="text-user-name">Dr. Blade</p>
            <p className="text-[#c8a04a] text-[11px] font-medium truncate flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Premium
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
