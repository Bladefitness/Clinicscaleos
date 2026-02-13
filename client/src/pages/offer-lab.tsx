import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { offerScoreRequestSchema, type OfferScoreRequest } from "@shared/schema";
import {
  Target, ArrowRight, Loader2, CheckCircle2, AlertTriangle, TrendingUp,
  Shield, Eye, Clock, Star, ChevronDown, ChevronUp, Lightbulb, BarChart3
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CLINIC_TYPES } from "@/lib/constants";

const SCORE_LABELS: Record<string, { icon: any; label: string }> = {
  clarity: { icon: Eye, label: "Clarity" },
  urgency: { icon: Clock, label: "Urgency" },
  risk_reversal: { icon: Shield, label: "Risk Reversal" },
  specificity: { icon: Target, label: "Specificity" },
  value_perception: { icon: Star, label: "Value Perception" },
};

function ScoreBar({ value, label, icon: Icon }: { value: number; label: string; icon: any }) {
  const color = value >= 7 ? "bg-emerald-500" : value >= 5 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-foreground">{label}</span>
          <span className="text-xs font-bold text-foreground">{value}/10</span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${value * 10}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function OfferLab() {
  const [result, setResult] = useState<any>(null);
  const [expandedVariation, setExpandedVariation] = useState<number | null>(null);

  const form = useForm<OfferScoreRequest>({
    resolver: zodResolver(offerScoreRequestSchema),
    defaultValues: { service: "", price: "", clinicType: "", location: "", currentOffer: "", differentiator: "", targetMarket: "" },
  });

  const scoreMutation = useMutation({
    mutationFn: async (data: OfferScoreRequest) => {
      const res = await apiRequest("POST", "/api/offers/score", data);
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data.offer);
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
    },
  });

  const handleSubmit = (data: OfferScoreRequest) => {
    scoreMutation.mutate(data);
  };

  if (scoreMutation.isPending) {
    return (
      <div className="flex-1 p-6 lg:p-10 overflow-auto">
        <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/20">
              <Target className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Analyzing Your Offer</h2>
          <p className="text-muted-foreground text-center max-w-sm">
            Scoring clarity, urgency, risk reversal, specificity, and value perception...
          </p>
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mt-6" />
        </div>
      </div>
    );
  }

  if (result && result.score) {
    const breakdown = result.scoreBreakdown as Record<string, number>;
    const variations = (result.variations || []) as any[];
    const competitorData = result.competitorData as any;
    const scoreColor = result.score >= 7 ? "text-emerald-500" : result.score >= 5 ? "text-amber-500" : "text-red-500";

    return (
      <div className="flex-1 p-6 lg:p-10 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-offer-results">Offer Analysis</h1>
              <p className="text-muted-foreground text-sm mt-1">AI-powered scoring and optimization suggestions</p>
            </div>
            <Button variant="outline" onClick={() => { setResult(null); form.reset(); }} data-testid="button-new-offer">
              New Offer
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 flex flex-col items-center justify-center col-span-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Overall Score</p>
              <p className={`text-6xl font-bold ${scoreColor}`} data-testid="text-overall-score">{result.score}</p>
              <p className="text-sm text-muted-foreground mt-1">/10</p>
            </Card>

            <Card className="p-6 col-span-1 lg:col-span-2">
              <p className="text-sm font-semibold text-foreground mb-4">Score Breakdown</p>
              <div className="space-y-3">
                {breakdown && Object.entries(breakdown).map(([key, val]) => {
                  const meta = SCORE_LABELS[key];
                  if (!meta) return null;
                  return <ScoreBar key={key} value={val} label={meta.label} icon={meta.icon} />;
                })}
              </div>
            </Card>
          </div>

          <Card className="p-6 mb-6">
            <p className="text-sm font-semibold text-foreground mb-3">Verdict</p>
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-verdict">{result.verdict}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Strengths</p>
                <div className="space-y-1.5">
                  {(result.strengths || []).map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">Weaknesses</p>
                <div className="space-y-1.5">
                  {(result.weaknesses || []).map((w: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {variations.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Improved Offer Variations
              </h2>
              <div className="space-y-3">
                {variations.map((v: any, i: number) => (
                  <Card
                    key={i}
                    className={`p-5 cursor-pointer transition-all ${expandedVariation === i ? "ring-2 ring-emerald-500/30" : ""}`}
                    onClick={() => setExpandedVariation(expandedVariation === i ? null : i)}
                    data-testid={`card-variation-${i}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            Projected: {v.projected_score}/10
                          </Badge>
                          <Badge variant={v.risk_level === "low" ? "secondary" : v.risk_level === "medium" ? "outline" : "destructive"} className="text-xs">
                            {v.risk_level} risk
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground">{v.offer_text}</p>
                      </div>
                      {expandedVariation === i ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                    </div>
                    {expandedVariation === i && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground">{v.reasoning}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {competitorData && (
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Competitive Landscape
              </h2>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-xs text-muted-foreground">Market Temperature:</span>
                <Badge variant="secondary" className="text-xs capitalize">
                  {(competitorData.market_temperature || "mixed").replace("_", " ")}
                </Badge>
              </div>
              {competitorData.differentiation_opportunities && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Differentiation Opportunities</p>
                  <div className="space-y-1.5">
                    {competitorData.differentiation_opportunities.map((d: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {competitorData.recommended_angles && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recommended Angles</p>
                  <div className="flex flex-wrap gap-2">
                    {competitorData.recommended_angles.map((a: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium mb-4">
            <Target className="w-3.5 h-3.5" />
            Module 1: Offer Intelligence
          </span>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-offer-lab-title">Offer Lab</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Score your current offer, identify weaknesses, and get AI-generated variations that convert higher.
          </p>
        </div>

        <Card className="p-6 lg:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField control={form.control} name="clinicType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Type <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-offer-clinic-type"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>{CLINIC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="service" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g., Botox, teeth whitening..." data-testid="input-offer-service" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g., Miami, FL" data-testid="input-offer-location" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Point</FormLabel>
                    <FormControl><Input placeholder="e.g., $299, $49/month..." data-testid="input-offer-price" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="currentOffer" render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Offer <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" rows={3} placeholder="Describe your current offer exactly as you'd present it to a patient..." data-testid="input-current-offer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="differentiator" render={({ field }) => (
                <FormItem>
                  <FormLabel>Differentiator</FormLabel>
                  <FormControl><Input placeholder="What makes your clinic different from competitors?" data-testid="input-differentiator" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="targetMarket" render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Market</FormLabel>
                  <FormControl><Input placeholder="e.g., Women 35-55, affluent professionals..." data-testid="input-target-market" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white no-default-hover-elevate no-default-active-elevate" data-testid="button-score-offer">
                <Target className="w-4 h-4 mr-2" />
                Score My Offer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
