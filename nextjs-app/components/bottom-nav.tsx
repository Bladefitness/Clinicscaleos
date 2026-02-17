"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, Sparkles, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/offer-lab", icon: Target, label: "Offer" },
  { href: "/creative-factory", icon: Sparkles, label: "Factory" },
  { href: "/campaign-hq", icon: Map, label: "Campaign" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[rgba(56,189,248,0.1)] bg-[#0c1425]/90 backdrop-blur-lg lg:hidden"
      aria-label="Mobile navigation"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 py-3 px-4 min-w-[64px] text-xs font-medium transition-colors",
              isActive ? "text-[#c8a04a]" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
