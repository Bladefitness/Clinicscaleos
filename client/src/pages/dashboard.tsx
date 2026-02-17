import { useMemo } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Target, Sparkles, Map, MessageSquare,
  ArrowRight, TrendingUp, Users, DollarSign, BarChart3,
  Zap, CheckCircle2, Loader2, Facebook, Link2, Unlink, HelpCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LaunchPlanFlowchart } from "@/components/launch-plan";
import { TestingLoopDiagram } from "@/components/education";
import { LAUNCH_PLAN_STEPS } from "@/lib/launch-plan-steps";
import { GLOSSARY } from "@/lib/glossary";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const moduleCards = [
  {
    module: "M1",
    title: "Offer Lab",
    description: "Nail the offer — Know why yours converts (or doesn't). Score, improve, and get AI variations.",
    icon: Target,
    href: "/offer-lab",
    features: ["Offer scoring (1-10)", "AI variations", "Competitor insights"],
    accent: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    module: "M2",
    title: "Creative Factory",
    description: "Launch ads that stop the scroll — Research-backed creatives in 60 seconds.",
    icon: Sparkles,
    href: "/creative-factory",
    features: ["Avatar targeting", "Emotion-based hooks", "Image prompts"],
    accent: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  {
    module: "M3",
    title: "Campaign HQ",
    description: "Deploy with confidence — Step-by-step setup, no guesswork.",
    icon: Map,
    href: "/campaign-hq",
    features: ["3-phase testing", "Budget allocation", "Step-by-step setup"],
    accent: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  {
    module: "M4",
    title: "Ad Coach",
    description: "Stay sharp — Daily pulse + 24/7 coach that knows your campaigns.",
    icon: MessageSquare,
    href: "/ad-coach",
    features: ["Daily pulse", "Weekly strategy", "Chat coach"],
    accent: "bg-primary/10 text-primary border-primary/20",
  },
];

const MODULE_TO_STEP_ID: Record<string, string> = { M1: "offer", M2: "creatives", M3: "campaign", M4: "coach" };

function WhyThisStepPopover({ module, title }: { module: string; title: string }) {
  const stepId = MODULE_TO_STEP_ID[module];
  const step = stepId ? LAUNCH_PLAN_STEPS.find((s) => s.id === stepId) : null;
  if (!step) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Why this step?
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <p className="font-medium text-foreground mb-1">{title}</p>
        <p className="text-sm text-muted-foreground mb-2">{step.shortWhat}</p>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Why it matters</p>
        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 mb-2">
          {step.whyBullets.slice(0, 3).map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">Next: {step.nextStep}</p>
      </PopoverContent>
    </Popover>
  );
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: overview, isLoading } = useQuery<{
    source?: "meta" | "demo";
    avgCpl?: string;
    leadsThisWeek?: number;
    activeAdSets?: number;
    cplTrend?: string | null;
    leadsTrend?: string | null;
    winRateTrend?: string | null;
  }>({
    queryKey: ["/api/metrics/overview"],
  });
  const { data: metaStatus } = useQuery<{ connected: boolean; oauthAvailable: boolean }>({
    queryKey: ["/api/auth/meta/status"],
  });

  const quickStats = useMemo(
    () => [
      { label: "Avg CPL", value: isLoading ? "…" : (overview?.avgCpl ?? "—"), icon: DollarSign, trend: overview?.cplTrend ?? null, accent: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
      { label: "Leads This Week", value: isLoading ? "…" : String(overview?.leadsThisWeek ?? "—"), icon: Users, trend: overview?.leadsTrend ?? null, accent: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
      { label: "Active Ad Sets", value: isLoading ? "…" : String(overview?.activeAdSets ?? "—"), icon: BarChart3, trend: null, accent: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
      { label: "Win Rate", value: isLoading ? "…" : (overview?.source === "meta" ? "—" : "62%"), icon: TrendingUp, trend: overview?.winRateTrend ?? null, accent: "bg-primary/10 text-primary border-primary/20" },
    ],
    [isLoading, overview?.avgCpl, overview?.leadsThisWeek, overview?.activeAdSets, overview?.source, overview?.cplTrend, overview?.leadsTrend, overview?.winRateTrend]
  );
  return (
    <div className="flex-1 overflow-auto font-sans font-normal bg-background text-foreground">
      <div className="p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero — Health Pro CEO: dark depth, gold authority */}
          <div className="-mx-8 lg:-mx-12 px-8 lg:px-12 py-12 lg:py-14 mb-12 rounded-2xl hero-gradient backdrop-blur-sm">
            <div className="flex items-start gap-5 mb-3">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/25 flex-shrink-0 transition-all duration-300 hover:shadow-primary/40">
                <Zap className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight tracking-tight" data-testid="text-welcome">
                  Dominate Your Market
                </h1>
                <p className="text-muted-foreground text-base lg:text-lg mt-2 max-w-xl leading-relaxed flex items-center gap-2 flex-wrap">
                  Learn the system. Build the ads. Scale the leads.
                  {overview?.source === "meta" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                      Live data
                    </span>
                  )}
                  {metaStatus?.oauthAvailable && (
                    <span className="inline-flex items-center gap-2 ml-2">
                      {metaStatus.connected ? (
                        <>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium border border-cyan-500/20">
                            <Link2 className="w-3 h-3" /> Connected to Meta
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              await fetch("/api/auth/meta/disconnect", { method: "POST", credentials: "include" });
                              queryClient.invalidateQueries({ queryKey: ["/api/auth/meta/status"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/metrics/overview"] });
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 text-xs font-medium transition-colors"
                          >
                            <Unlink className="w-3 h-3" /> Disconnect
                          </button>
                        </>
                      ) : (
                        <a
                          href="/auth/facebook"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1877F2] text-white text-xs font-semibold hover:bg-[#166FE5] transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <Facebook className="w-4 h-4" /> Connect with Facebook
                        </a>
                      )}
                    </span>
                  )}
                </p>
                <p className="text-sm text-foreground mt-4 flex items-center gap-2 font-medium">
                  <span className="text-muted-foreground">Your journey:</span>
                  Offer → Creatives → Campaign → Coach
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mb-14">
            {quickStats.map((stat) => (
              <Card key={stat.label} className="p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 border-border bg-card hover:border-primary/30 group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300 ${stat.accent} group-hover:scale-110`}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <stat.icon className="w-5 h-5" />}
                  </div>
                  {stat.trend && (
                    <span className={`text-sm font-semibold ${stat.trend.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                      {stat.trend}
                    </span>
                  )}
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight" data-testid={`stat-value-${stat.label}`}>
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                  {stat.label === "Avg CPL" ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="border-b border-dotted border-muted-foreground cursor-help">{stat.label}</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        {GLOSSARY.CPL.definition}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    stat.label
                  )}
                </p>
              </Card>
            ))}
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">Your launch plan</h2>
            <p className="text-base text-muted-foreground mb-6">Click any step to expand and jump straight to that part of the system</p>
            <Card className="p-6 border-border bg-card shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
              <LaunchPlanFlowchart />
            </Card>
          </div>

          <div className="mb-10">
            <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">Modules</h2>
            <p className="text-base text-muted-foreground mb-8">Your end-to-end advertising workflow</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {moduleCards.map((card, i) => (
                <Link key={card.href} href={card.href}>
                  <Card
                    className="group overflow-visible p-7 cursor-pointer transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 h-full flex flex-col border-border bg-card hover:-translate-y-1"
                    style={{ animationDelay: `${i * 50}ms` }}
                    data-testid={`card-module-${card.module.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-300 group-hover:scale-110 ${card.accent}`}>
                        <card.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-foreground">{card.title}</h3>
                          <Badge variant="secondary" className="text-[10px] font-semibold bg-muted text-muted-foreground border-0">{card.module}</Badge>
                          <WhyThisStepPopover module={card.module} title={card.title} />
                        </div>
                      </div>
                    </div>

                    <p className="text-base text-muted-foreground leading-relaxed mb-5 flex-1">{card.description}</p>

                    <div className="space-y-2 mb-6">
                      {card.features.map((f) => (
                        <div key={f} className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-sm text-foreground">{f}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground group-hover:text-primary group-hover:gap-3 transition-all duration-200">
                      Open {card.title}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <TestingLoopDiagram />
          </div>
        </div>
      </div>
    </div>
  );
}
