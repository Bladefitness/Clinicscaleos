import { Link, useLocation } from "wouter";
import { LayoutDashboard, Target, Sparkles, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/offer-lab", icon: Target, label: "Offer" },
  { href: "/creative-factory", icon: Sparkles, label: "Factory" },
  { href: "/campaign-hq", icon: Map, label: "Campaign" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
      aria-label="Mobile navigation"
    >
      {navItems.map((item) => {
        const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-4 min-w-[64px] text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </a>
          </Link>
        );
      })}
    </nav>
  );
}
