"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Target, Sparkles, Map, MessageSquare, RefreshCw,
  ArrowUpRight, Loader2, Facebook, Unlink, HelpCircle,
  Crown,
} from "lucide-react";
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
    description: "Score your offer, get AI variations, and understand why it converts.",
    icon: Target,
    href: "/offer-lab",
  },
  {
    module: "M2",
    title: "Creative Factory",
    description: "Research-backed ad creatives with avatar targeting and emotion hooks.",
    icon: Sparkles,
    href: "/creative-factory",
  },
  {
    module: "M3",
    title: "Campaign HQ",
    description: "Step-by-step campaign setup with budget allocation and 3-phase testing.",
    icon: Map,
    href: "/campaign-hq",
  },
  {
    module: "M4",
    title: "Ad Coach",
    description: "Daily pulse metrics and 24/7 AI coach that knows your campaigns.",
    icon: MessageSquare,
    href: "/ad-coach",
  },
  {
    module: "M5",
    title: "Iteration Lab",
    description: "Double down on winners, diagnose losers, and get A/B test recommendations.",
    icon: RefreshCw,
    href: "/iteration-lab",
  },
];

const MODULE_TO_STEP_ID: Record<string, string> = { M1: "offer", M2: "creatives", M3: "campaign", M4: "coach", M5: "iterate" };

function WhyThisStepPopover({ module, title }: { module: string; title: string }) {
  const stepId = MODULE_TO_STEP_ID[module];
  const step = stepId ? LAUNCH_PLAN_STEPS.find((s) => s.id === stepId) : null;
  if (!step) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-slate-500 hover:text-slate-300 transition-colors"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <p className="font-semibold text-white text-sm mb-1">{title}</p>
        <p className="text-[13px] text-slate-400 mb-3">{step.shortWhat}</p>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Why it matters</p>
        <ul className="text-[13px] text-slate-400 space-y-1 mb-3">
          {step.whyBullets.slice(0, 3).map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-slate-600 mt-0.5">·</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-slate-500">Next: {step.nextStep}</p>
      </PopoverContent>
    </Popover>
  );
}

export default function Dashboard() {
  useEffect(() => {
    document.title = "Dashboard | Health Pro CEO Academy";
  }, []);

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
      { label: "Avg CPL", value: isLoading ? "…" : (overview?.avgCpl ?? "—"), trend: overview?.cplTrend ?? null },
      { label: "Leads this week", value: isLoading ? "…" : String(overview?.leadsThisWeek ?? "—"), trend: overview?.leadsTrend ?? null },
      { label: "Active ad sets", value: isLoading ? "…" : String(overview?.activeAdSets ?? "—"), trend: null },
      { label: "Win rate", value: isLoading ? "…" : (overview?.source === "meta" ? "—" : "62%"), trend: overview?.winRateTrend ?? null },
    ],
    [isLoading, overview?.avgCpl, overview?.leadsThisWeek, overview?.activeAdSets, overview?.source, overview?.cplTrend, overview?.leadsTrend, overview?.winRateTrend]
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-[1040px] mx-auto px-8 py-12">

        {/* Hero */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c8a04a]/10 border border-[#c8a04a]/20 text-[#c8a04a] text-[12px] font-semibold mb-5">
            <Crown className="w-3 h-3" />
            Premium Member
          </div>
          <h1
            className="text-[42px] lg:text-[52px] font-bold text-white leading-[1.08] tracking-[-0.03em]"
            data-testid="text-welcome"
          >
            Dominate your market.
          </h1>
          <p className="text-[18px] lg:text-[20px] text-slate-400 mt-3 max-w-lg leading-relaxed font-normal tracking-[-0.01em]">
            Turn your expertise into AI-powered leverage, income, and freedom.
          </p>

          {metaStatus?.oauthAvailable && (
            <div className="mt-8 flex items-center gap-3">
              {metaStatus.connected ? (
                <>
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                    Connected to Meta
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch("/api/auth/meta/disconnect", { method: "POST", credentials: "include" });
                      queryClient.invalidateQueries({ queryKey: ["/api/auth/meta/status"] });
                      queryClient.invalidateQueries({ queryKey: ["/api/metrics/overview"] });
                    }}
                    className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <a
                  href="/api/auth/meta/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#162040] border border-[rgba(56,189,248,0.15)] text-white text-[13px] font-semibold hover:bg-[#1a2d50] transition-all shadow-sm hover:shadow-[0_0_15px_rgba(56,189,248,0.1)]"
                >
                  <Facebook className="w-4 h-4" />
                  Connect Facebook
                </a>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#111d35] rounded-2xl p-6 border border-[rgba(56,189,248,0.08)] shadow-[0_0_0_1px_rgba(56,189,248,0.04),0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(56,189,248,0.06)] transition-all duration-300"
            >
              <p className="text-[13px] text-slate-500 font-medium mb-2">
                {stat.label === "Avg CPL" ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="border-b border-dotted border-slate-600 cursor-help">{stat.label}</span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      {GLOSSARY.CPL.definition}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  stat.label
                )}
              </p>
              <div className="flex items-baseline gap-2">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <p className="text-[30px] font-bold text-white tracking-tight leading-none" data-testid={`stat-value-${stat.label}`}>
                    {stat.value}
                  </p>
                )}
                {stat.trend && (
                  <span className={`text-[13px] font-semibold ${stat.trend.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>
                    {stat.trend}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Launch Plan */}
        <div className="mb-14">
          <h2 className="text-[20px] font-bold text-white tracking-[-0.02em] mb-1">Your launch plan</h2>
          <p className="text-[15px] text-slate-500 mb-6">Click any step to jump straight in</p>
          <div className="rounded-2xl bg-[#111d35] p-6 border border-[rgba(56,189,248,0.08)] shadow-[0_0_0_1px_rgba(56,189,248,0.04),0_4px_12px_rgba(0,0,0,0.2)]">
            <LaunchPlanFlowchart />
          </div>
        </div>

        {/* Modules */}
        <div className="mb-14">
          <h2 className="text-[20px] font-bold text-white tracking-[-0.02em] mb-1">Modules</h2>
          <p className="text-[15px] text-slate-500 mb-6">Your end-to-end advertising workflow</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {moduleCards.map((card) => (
              <Link key={card.href} href={card.href}>
                <div
                  className="group bg-[#111d35] rounded-2xl p-6 pb-5 border border-[rgba(56,189,248,0.1)] shadow-[0_0_15px_rgba(56,189,248,0.04)] hover:shadow-[0_0_25px_rgba(56,189,248,0.1)] hover:border-[rgba(56,189,248,0.2)] transition-all duration-300 cursor-pointer h-full flex flex-col"
                  data-testid={`card-module-${card.module.toLowerCase()}`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[rgba(56,189,248,0.08)] flex items-center justify-center mb-5">
                    <card.icon className="w-5 h-5 text-[#38bdf8]" strokeWidth={1.5} />
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-[16px] font-bold text-white">{card.title}</h3>
                    <WhyThisStepPopover module={card.module} title={card.title} />
                  </div>

                  <p className="text-[14px] text-slate-400 leading-relaxed flex-1 mb-5">{card.description}</p>

                  <div className="w-full py-2.5 rounded-xl btn-gold text-white text-[13px] font-semibold text-center">
                    Get Started
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Testing Loop */}
        <div className="mb-8">
          <TestingLoopDiagram />
        </div>
      </div>
    </div>
  );
}
