"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  RefreshCw, TrendingUp, TrendingDown, Loader2, Sparkles, AlertTriangle,
  ChevronDown, ChevronUp, Lightbulb, Wrench, ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { LAUNCH_PLAN_STEPS } from "@/lib/launch-plan-steps";
import { GlossaryTooltip } from "@/components/glossary-tooltip";

const DEMO_WINNERS = [
  { id: "w1", name: "Aging Gracefully Seeker", headline: "What If Botox Could Turn Back Time?", copy: "Every day you look in the mirror and wonder what happened. The good news? You don't have to settle for how things are. Our Med Spa in Miami has helped hundreds of people just like you rediscover their confidence with Botox. Free consultation + 20% off first treatment. Your best days are still ahead.", cpl: "$14.20", ctr: "3.1%", leads: 34, emotion: "hope", style: "Testimonial" },
  { id: "w2", name: "Pattern Interrupt Winner", headline: "Stop Scrolling. This Changes Everything.", copy: "You've tried everything. You've spent hours researching Botox options, only to end up more confused. Your time is too valuable. Our Med Spa specializes in getting you real results fast. Book your spot today.", cpl: "$15.80", ctr: "3.4%", leads: 28, emotion: "curiosity", style: "Pattern Interrupt" },
];

const DEMO_LOSERS = [
  { id: "l1", name: "New Mom - Frustration", headline: "Your Post-Baby Body Deserves Better", copy: "You've given so much to everyone else. Your body changed. Your confidence dipped. But here's the truth - you deserve to feel like YOU again. Our Med Spa in Miami specializes in helping moms reclaim their confidence with Botox. No judgment. Just results.", cpl: "$34.00", ctr: "0.9%", leads: 8, emotion: "frustration", style: "Before/After" },
  { id: "l2", name: "Busy Professional - Envy", headline: "Why Your Colleagues Look 10 Years Younger", copy: "Your colleagues look amazing. Your competitors radiate confidence. What's their secret? Many of them quietly visit our Med Spa for Botox. No one needs to know. The results speak for themselves.", cpl: "$28.50", ctr: "1.2%", leads: 12, emotion: "envy", style: "Social Proof" },
];

interface AnalysisResult {
  type: "winner_variation" | "loser_diagnosis";
  data: any;
}

export default function IterationLab() {
  useEffect(() => {
    document.title = "Iteration Lab | Clinic Growth OS";
  }, []);

  const { toast } = useToast();
  const [selectedCreative, setSelectedCreative] = useState<any>(null);
  const [analysisType, setAnalysisType] = useState<"winner_variation" | "loser_diagnosis" | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [expandedVariation, setExpandedVariation] = useState<number | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (data: { type: string; creative: any }) => {
      const res = await fetch("/api/iterations/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: data.type,
          creativeName: data.creative.name,
          creativeHeadline: data.creative.headline,
          creativeCopy: data.creative.copy,
          performanceData: `CPL: ${data.creative.cpl}, CTR: ${data.creative.ctr}, Leads: ${data.creative.leads}`,
          clinicType: "Med Spa",
          service: "Botox",
        }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      return res.json();
    },
    onSuccess: (data) => {
      setAnalysisResult({ type: data.type, data: data.result });
    },
    onError: (err: Error, variables: { type: string; creative: any }) => {
      toast({
        title: "Analysis failed",
        description: err?.message || "Check your connection and Anthropic API key.",
        variant: "destructive",
        action: (
          <ToastAction altText="Retry" onClick={() => analyzeMutation.mutate(variables)}>
            Retry
          </ToastAction>
        ),
      });
    },
  });

  const handleAnalyze = (creative: any, type: "winner_variation" | "loser_diagnosis") => {
    setSelectedCreative(creative);
    setAnalysisType(type);
    setAnalysisResult(null);
    setExpandedVariation(null);
    analyzeMutation.mutate({ type, creative });
  };

  const handleBack = () => {
    setSelectedCreative(null);
    setAnalysisType(null);
    setAnalysisResult(null);
    setExpandedVariation(null);
  };

  if (analyzeMutation.isPending) {
    return (
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#38bdf8] to-[#0ea5e9] flex items-center justify-center animate-pulse shadow-lg shadow-[#38bdf8]/20 mb-8">
            <RefreshCw className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {analysisType === "winner_variation" ? "Generating Winner Variations" : "Diagnosing Failure Points"}
          </h2>
          <p className="text-slate-400 text-center max-w-sm">
            {analysisType === "winner_variation"
              ? "Creating 5 strategic variations to test against your winning ad..."
              : "Analyzing hook, copy, image, targeting, and offer to find the weak link..."}
          </p>
          <Loader2 className="w-6 h-6 text-[#38bdf8] animate-spin mt-6" />
        </div>
      </div>
    );
  }

  if (analysisResult) {
    const { type, data } = analysisResult;

    return (
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <Badge variant={type === "winner_variation" ? "default" : "destructive"} className="mb-2">
                {type === "winner_variation" ? "Winner Variations" : "Loser Diagnosis"}
              </Badge>
              <h1 className="text-2xl font-bold text-white" data-testid="text-analysis-title">{selectedCreative?.headline}</h1>
              <p className="text-sm text-slate-400 mt-1">{selectedCreative?.name} | {selectedCreative?.cpl} CPL | {selectedCreative?.ctr} CTR</p>
            </div>
            <Button variant="outline" onClick={handleBack} data-testid="button-back-to-lab">Back to Lab</Button>
          </div>

          {type === "loser_diagnosis" && data && (
            <div className="space-y-6 mb-6">
              <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <AlertTriangle className={`w-5 h-5 ${data.severity === "critical" ? "text-red-500" : data.severity === "moderate" ? "text-amber-500" : "text-blue-500"}`} />
                  <Badge variant={data.severity === "critical" ? "destructive" : "outline"} className="text-xs capitalize">{data.severity}</Badge>
                  <Badge variant="outline" className="text-xs">Failure: {data.likely_failure_point}</Badge>
                </div>
                <p className="text-sm text-white leading-relaxed mb-4" data-testid="text-diagnosis">{data.diagnosis}</p>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Evidence</p>
                  <div className="space-y-1.5">
                    {(data.evidence || []).map((e: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <Wrench className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-400">{e}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-red-500" /> Fix Options
              </h2>
              {(data.fix_options || []).map((fix: any, i: number) => (
                <Card
                  key={i}
                  className={`bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6 cursor-pointer transition-all ${expandedVariation === i ? "ring-2 ring-red-500/30" : ""}`}
                  onClick={() => setExpandedVariation(expandedVariation === i ? null : i)}
                  data-testid={`card-fix-${i}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">{fix.approach}</p>
                      <p className="text-xs text-red-600">{fix.expected_improvement}</p>
                    </div>
                    {expandedVariation === i ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                  </div>
                  {expandedVariation === i && (
                    <div className="mt-4 pt-4 border-t border-[rgba(56,189,248,0.1)] space-y-3">
                      <div><p className="text-xs font-semibold text-slate-400 mb-1">New Headline</p><p className="text-sm text-white font-medium">{fix.new_headline}</p></div>
                      <div><p className="text-xs font-semibold text-slate-400 mb-1">New Hook</p><p className="text-sm text-white">{fix.new_hook}</p></div>
                      <div><p className="text-xs font-semibold text-slate-400 mb-1">New Copy</p><p className="text-sm text-slate-400 leading-relaxed">{fix.new_copy}</p></div>
                      <div><p className="text-xs font-semibold text-slate-400 mb-1">Image Prompt</p><p className="text-xs text-slate-400">{fix.new_image_prompt}</p></div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {type === "winner_variation" && data && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" /> Variations to Test
              </h2>
              {(data.variations || []).map((v: any, i: number) => (
                <Card
                  key={i}
                  className={`bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6 cursor-pointer transition-all ${expandedVariation === i ? "ring-2 ring-emerald-500/30" : ""}`}
                  onClick={() => setExpandedVariation(expandedVariation === i ? null : i)}
                  data-testid={`card-variation-${i}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">V{v.variation_number || i + 1}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{v.copy_formula}</Badge>
                      </div>
                      <p className="text-sm font-semibold text-white">{v.headline}</p>
                      <p className="text-xs text-slate-400 mt-1">{v.what_changed}</p>
                    </div>
                    {expandedVariation === i ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                  </div>
                  {expandedVariation === i && (
                    <div className="mt-4 pt-4 border-t border-[rgba(56,189,248,0.1)] space-y-3">
                      <div><p className="text-xs font-semibold text-slate-400 mb-1">Hook</p><p className="text-sm text-white">{v.hook}</p></div>
                      <div><p className="text-xs font-semibold text-slate-400 mb-1">Copy</p><p className="text-sm text-slate-400 leading-relaxed">{v.primary_text}</p></div>
                      <div><p className="text-xs font-semibold text-slate-400 mb-1">Hypothesis</p><p className="text-sm text-emerald-600">{v.hypothesis}</p></div>
                      <div><p className="text-xs font-semibold text-slate-400 mb-1">Image Prompt</p><p className="text-xs text-slate-400">{v.image_prompt}</p></div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(56,189,248,0.08)] text-[#38bdf8] text-xs font-medium mb-4">
            <RefreshCw className="w-3.5 h-3.5" />
            Module 5: Iteration Engine
          </span>
          <h1 className="gradient-text text-2xl font-bold" data-testid="text-iteration-lab-title">Iteration Lab</h1>
          <p className="text-slate-400 text-sm mt-1">Scale winners and fix losers. Never stop improving your ads.</p>
          <p className="text-xs text-slate-400 mt-2 italic">Why? {LAUNCH_PLAN_STEPS.find((s) => s.id === "iterate")?.whyBullets[0]}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Winners Board
          </h2>
          <p className="text-sm text-slate-400 mb-4">Top performing creatives ready for variation testing</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEMO_WINNERS.map((w) => (
              <Card key={w.id} className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6" data-testid={`card-winner-${w.id}`}>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">{w.emotion}</Badge>
                  <Badge variant="outline" className="text-[10px]">{w.style}</Badge>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{w.headline}</h3>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{w.copy}</p>
                <div className="flex items-center gap-4 mb-4 text-xs flex-wrap">
                  <span className="text-emerald-600 font-mono font-bold">{w.cpl} <GlossaryTooltip term="CPL">CPL</GlossaryTooltip></span>
                  <span className="text-white font-mono">{w.ctr} <GlossaryTooltip term="CTR">CTR</GlossaryTooltip></span>
                  <span className="text-slate-400">{w.leads} leads</span>
                </div>
                <Button onClick={() => handleAnalyze(w, "winner_variation")} className="w-full btn-gold text-white no-default-hover-elevate no-default-active-elevate gap-2" data-testid={`button-generate-variations-${w.id}`}>
                  <Sparkles className="w-4 h-4" /> Generate 5 Variations <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" /> Losers Board
          </h2>
          <p className="text-sm text-slate-400 mb-4">Underperforming creatives that need diagnosis and fixes</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEMO_LOSERS.map((l) => (
              <Card key={l.id} className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6" data-testid={`card-loser-${l.id}`}>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">{l.emotion}</Badge>
                  <Badge variant="outline" className="text-[10px]">{l.style}</Badge>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{l.headline}</h3>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{l.copy}</p>
                <div className="flex items-center gap-4 mb-4 text-xs flex-wrap">
                  <span className="text-red-600 font-mono font-bold">{l.cpl} <GlossaryTooltip term="CPL">CPL</GlossaryTooltip></span>
                  <span className="text-white font-mono">{l.ctr} <GlossaryTooltip term="CTR">CTR</GlossaryTooltip></span>
                  <span className="text-slate-400">{l.leads} leads</span>
                </div>
                <Button onClick={() => handleAnalyze(l, "loser_diagnosis")} variant="outline" className="w-full gap-2" data-testid={`button-diagnose-${l.id}`}>
                  <AlertTriangle className="w-4 h-4" /> Diagnose & Fix <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
