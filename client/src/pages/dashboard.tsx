import { Link } from "wouter";
import {
  Sparkles,
  DollarSign,
  Calculator,
  BookOpen,
  ArrowRight,
  FileText,
  TrendingUp,
  Users,
  BarChart3,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const featureCards = [
  {
    title: "AI Ad Creative Factory",
    description: "Generate 15-20 high-converting ad creatives in under 60 seconds using AI.",
    icon: Sparkles,
    href: "/ad-factory",
    gradient: true,
    badge: null,
  },
  {
    title: "Cash Injection Generator",
    description: "Discover proven strategies to generate immediate revenue for your clinic.",
    icon: DollarSign,
    href: "/cash-injection",
    gradient: false,
    badge: "Coming Soon",
  },
  {
    title: "ROI Calculator",
    description: "Calculate your expected return on investment for different marketing campaigns.",
    icon: Calculator,
    href: "/roi-calculator",
    gradient: false,
    badge: "Coming Soon",
  },
  {
    title: "Resource Vault",
    description: "Access templates, guides, and proven frameworks for clinic marketing.",
    icon: BookOpen,
    href: "/resources",
    gradient: false,
    badge: "Coming Soon",
  },
];

const quickStats = [
  { label: "Creatives Generated", value: "0", icon: FileText },
  { label: "Campaigns Active", value: "\u2014", icon: TrendingUp },
  { label: "Leads This Month", value: "0", icon: Users },
  { label: "Avg. ROI", value: "\u2014", icon: BarChart3 },
];

export default function Dashboard() {
  return (
    <div className="flex-1 p-6 lg:p-10 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-welcome">
            Welcome back, Dr. Blade
          </h1>
          <p className="text-muted-foreground mt-1">
            Your clinic growth command center. Choose a tool to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {featureCards.map((card) => (
            <Link key={card.href} href={card.href}>
              <Card
                className={`group relative overflow-visible p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  card.gradient
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white"
                    : ""
                }`}
                data-testid={`card-${card.href.replace("/", "")}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <div
                        className={`w-10 h-10 rounded-md flex items-center justify-center ${
                          card.gradient
                            ? "bg-white/20"
                            : "bg-slate-100 dark:bg-slate-800"
                        }`}
                      >
                        <card.icon
                          className={`w-5 h-5 ${
                            card.gradient ? "text-white" : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        />
                      </div>
                      {card.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground">
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <h3
                      className={`text-lg font-semibold mb-1 ${
                        card.gradient ? "text-white" : "text-foreground"
                      }`}
                    >
                      {card.title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        card.gradient ? "text-emerald-100" : "text-muted-foreground"
                      }`}
                    >
                      {card.description}
                    </p>
                  </div>
                  <ArrowRight
                    className={`w-5 h-5 mt-1 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${
                      card.gradient ? "text-emerald-200" : "text-slate-300 dark:text-slate-600"
                    }`}
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat) => (
              <Card key={stat.label} className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground" data-testid={`stat-value-${stat.label}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
