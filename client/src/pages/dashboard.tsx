import { Link } from "wouter";
import {
  Target, Sparkles, Map, MessageSquare, RefreshCw,
  ArrowRight, TrendingUp, Users, DollarSign, BarChart3,
  Zap, CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const moduleCards = [
  {
    module: "M1",
    title: "Offer Lab",
    description: "Score your offer, identify weaknesses, and generate higher-converting variations with AI.",
    icon: Target,
    href: "/offer-lab",
    color: "from-blue-500 to-indigo-600",
    features: ["Offer scoring (1-10)", "AI variations", "Competitor insights"],
  },
  {
    module: "M2",
    title: "Creative Factory",
    description: "Generate 15-20+ ad creatives with copy, hooks, and image prompts in under 60 seconds.",
    icon: Sparkles,
    href: "/creative-factory",
    color: "from-emerald-500 to-teal-600",
    features: ["Avatar targeting", "Emotion-based hooks", "Image prompts"],
  },
  {
    module: "M3",
    title: "Campaign HQ",
    description: "Get a complete Facebook Ads blueprint with targeting, budgets, and deployment checklist.",
    icon: Map,
    href: "/campaign-hq",
    color: "from-violet-500 to-purple-600",
    features: ["3-phase testing", "Budget allocation", "Step-by-step setup"],
  },
  {
    module: "M4",
    title: "Ad Coach",
    description: "Daily pulse, weekly briefs, and a 24/7 AI coach that knows your campaigns inside out.",
    icon: MessageSquare,
    href: "/ad-coach",
    color: "from-amber-500 to-orange-600",
    features: ["Daily pulse", "Weekly strategy", "Chat coach"],
  },
  {
    module: "M5",
    title: "Iteration Lab",
    description: "Scale winners with strategic variations and diagnose losers to fix what's broken.",
    icon: RefreshCw,
    href: "/iteration-lab",
    color: "from-rose-500 to-pink-600",
    features: ["Winner variations", "Loser diagnosis", "A/B test recs"],
  },
];

const quickStats = [
  { label: "Avg CPL", value: "$19.40", icon: DollarSign, trend: "-12%" },
  { label: "Leads This Week", value: "89", icon: Users, trend: "+18%" },
  { label: "Active Ad Sets", value: "8", icon: BarChart3, trend: null },
  { label: "Win Rate", value: "62%", icon: TrendingUp, trend: "+5%" },
];

export default function Dashboard() {
  return (
    <div className="flex-1 p-6 lg:p-10 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-welcome">
                Clinic Growth OS
              </h1>
              <p className="text-muted-foreground text-sm">
                Your complete advertising operating system
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {quickStats.map((stat) => (
            <Card key={stat.label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                {stat.trend && (
                  <span className={`text-xs font-semibold ${stat.trend.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground" data-testid={`stat-value-${stat.label}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">Modules</h2>
          <p className="text-sm text-muted-foreground mb-5">Your end-to-end advertising workflow</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {moduleCards.map((card) => (
              <Link key={card.href} href={card.href}>
                <Card
                  className="group overflow-visible p-5 cursor-pointer transition-all duration-200 hover:shadow-md h-full flex flex-col"
                  data-testid={`card-module-${card.module.toLowerCase()}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">{card.title}</h3>
                        <Badge variant="secondary" className="text-[9px] no-default-hover-elevate no-default-active-elevate">{card.module}</Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{card.description}</p>

                  <div className="space-y-1.5 mb-4">
                    {card.features.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 group-hover:gap-2 transition-all">
                    Open {card.title}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
