"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { campaignBlueprintRequestSchema, type CampaignBlueprintRequest } from "@/lib/db/schema";
import Link from "next/link";
import {
  Map, ArrowRight, Loader2, CheckCircle2, ChevronDown, ChevronRight,
  Download, Users, Target, AlertCircle, Sparkles
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ToastAction } from "@/components/ui/toast";
import { celebrate } from "@/lib/celebrate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CLINIC_TYPES, CAMPAIGN_GOALS } from "@/lib/constants";
import { LAUNCH_PLAN_STEPS } from "@/lib/launch-plan-steps";

function DeploymentStep({ step, index, checked, onToggle }: { step: any; index: number; checked: boolean; onToggle: () => void }) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-md transition-colors ${checked ? "bg-[rgba(56,189,248,0.08)]" : "bg-[#162040]"}`}
      data-testid={`deployment-step-${index}`}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onToggle}
        className="mt-0.5 flex-shrink-0"
        data-testid={`checkbox-step-${index}`}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-mono text-slate-400">Step {step.step_number}</span>
          <Badge variant="outline" className="text-[10px]">{step.screen}</Badge>
        </div>
        <p className={`text-sm font-medium ${checked ? "text-slate-400 line-through" : "text-white"}`}>{step.action}</p>
        <p className="text-xs text-slate-400 mt-1">{step.details}</p>
        {step.common_mistakes && (
          <div className="flex items-start gap-1.5 mt-2">
            <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-amber-600">{step.common_mistakes}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CampaignHQ() {
  useEffect(() => {
    document.title = "Campaign HQ | Clinic Growth OS";
  }, []);

  const { toast } = useToast();
  const [campaign, setCampaign] = useState<any>(null);
  const [expandedPhase, setExpandedPhase] = useState<number>(0);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const form = useForm<CampaignBlueprintRequest>({
    resolver: zodResolver(campaignBlueprintRequestSchema) as any,
    defaultValues: { clinicType: "", service: "", location: "", budget: "", goal: "", audienceInfo: "", creativeCount: 6 },
  });

  const blueprintMutation = useMutation({
    mutationFn: async (data: CampaignBlueprintRequest) => {
      const res = await fetch("/api/campaigns/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to generate blueprint");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (!data?.campaign?.blueprint) {
        toast({
          title: "Blueprint generation failed",
          description: data?.message || data?.error || "No campaign blueprint was returned. Please try again.",
          variant: "destructive",
          action: (
            <ToastAction altText="Retry" onClick={() => form.handleSubmit((d) => blueprintMutation.mutate(d))()}>
              Retry
            </ToastAction>
          ),
        });
        return;
      }
      setCampaign(data.campaign);
      celebrate();
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
    },
    onError: (err: Error) => {
      toast({
        title: "Could not generate blueprint",
        description: err.message || "Check your connection and API keys, then try again.",
        variant: "destructive",
        action: (
          <ToastAction altText="Retry" onClick={() => form.handleSubmit((d) => blueprintMutation.mutate(d))()}>
            Retry
          </ToastAction>
        ),
      });
    },
  });

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleExport = () => {
    if (!campaign?.blueprint) return;
    const blob = new Blob([JSON.stringify(campaign.blueprint, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "campaign-blueprint.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (blueprintMutation.isPending) {
    return (
      <div className="flex-1 pt-8 pb-6 px-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Campaign HQ", href: "/campaign-hq" }, { label: "Building..." }]} className="mb-6" />
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center">
            <Loader2 className="w-6 h-6 text-[#38bdf8] animate-spin" />
            <p className="text-sm text-slate-400 mt-3">Building campaign structure, targeting, and deployment checklist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (campaign?.blueprint) {
    const bp = campaign.blueprint;
    const phases = bp.phases || [];
    const steps = bp.deployment_steps || campaign.deploymentChecklist || [];
    const completedSteps = checkedSteps.size;
    const totalSteps = steps.length;

    return (
      <div className="flex-1 pt-8 pb-6 px-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Campaign HQ", href: "/campaign-hq" }, { label: bp.campaign_name || "Blueprint" }]} className="mb-6" />
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="text-campaign-title">{bp.campaign_name || campaign.name}</h1>
              <p className="text-slate-400 text-sm mt-1">
                {bp.objective} | Budget: {bp.total_budget || campaign.budget}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" onClick={handleExport} className="gap-1.5" data-testid="button-export-blueprint">
                <Download className="w-4 h-4" />
                Export JSON
              </Button>
              <Button variant="outline" onClick={() => { setCampaign(null); form.reset(); setCheckedSteps(new Set()); }} data-testid="button-new-campaign">
                New Campaign
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4">Campaign Structure</h2>
            <div className="space-y-3">
              {phases.map((phase: any, pi: number) => (
                <Card key={pi} className="overflow-visible bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
                  <button
                    className="w-full flex items-center justify-between p-5 text-left"
                    onClick={() => setExpandedPhase(expandedPhase === pi ? -1 : pi)}
                    data-testid={`button-phase-${pi}`}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-8 h-8 rounded-md bg-[rgba(56,189,248,0.08)] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-[#38bdf8]">{pi + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{phase.phase_name}</p>
                        <p className="text-xs text-slate-400">{phase.duration} | {phase.budget_allocation}</p>
                      </div>
                    </div>
                    {expandedPhase === pi ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedPhase === pi && (
                    <div className="px-5 pb-5 space-y-3">
                      {(phase.ad_sets || []).map((adSet: any, ai: number) => (
                        <div key={ai} className="bg-[#162040] rounded-md p-4">
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <p className="text-sm font-medium text-white">{adSet.name}</p>
                            <Badge variant="outline" className="text-xs">{adSet.budget}/day</Badge>
                          </div>
                          {adSet.targeting && (
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-400">{adSet.targeting.age_range} {adSet.targeting.gender}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Target className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-400">{adSet.targeting.locations}</span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs flex-wrap">
                            <span className="text-red-500">Kill: {adSet.kill_criteria}</span>
                            <span className="text-[#38bdf8]">Scale: {adSet.scale_criteria}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {steps.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-lg font-bold text-white">Deployment Checklist</h2>
                <span className="text-sm text-slate-400">{completedSteps}/{totalSteps} completed</span>
              </div>
              <div className="w-full h-2 bg-[#162040] rounded-full overflow-hidden mb-4">
                <div className="h-full bg-[#38bdf8] rounded-full transition-all" style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }} />
              </div>
              <div className="space-y-2">
                {steps.map((step: any, i: number) => (
                  <DeploymentStep key={i} step={step} index={i} checked={checkedSteps.has(i)} onToggle={() => toggleStep(i)} />
                ))}
              </div>
            </div>
          )}

          <Card className="p-6 mt-8 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.15)]">
            <h3 className="text-sm font-semibold text-white mb-2">What&apos;s next?</h3>
            <p className="text-sm text-slate-400 mb-4">Generate ad creatives for this campaign.</p>
            <Link href="/creative-factory">
              <Button className="btn-gold text-white gap-2">
                <Sparkles className="w-4 h-4" />
                Create ads in Creative Factory
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pt-8 pb-6 px-8 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Campaign HQ" }]} className="mb-6" />
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(56,189,248,0.08)] text-[#38bdf8] text-xs font-medium mb-4">
            <Map className="w-3.5 h-3.5" />
            Module 3: Campaign Architect
          </span>
          <h1 className="text-3xl font-bold text-white mb-2 gradient-text" data-testid="text-campaign-hq-title">Campaign HQ</h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Generate a complete Facebook Ads campaign blueprint with targeting, budget allocation, and step-by-step deployment instructions.
          </p>
          <p className="text-xs text-slate-400 max-w-lg mx-auto mt-2 italic">
            Why? {LAUNCH_PLAN_STEPS.find((s) => s.id === "campaign")?.whyBullets[0]}
          </p>
        </div>

        <Card className="p-6 lg:p-8 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => blueprintMutation.mutate(data))} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField control={form.control} name="clinicType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Type <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-campaign-clinic-type"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>{CLINIC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="service" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g., Botox, teeth whitening..." data-testid="input-campaign-service" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g., Miami, FL" data-testid="input-campaign-location" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="budget" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Budget <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g., $3,000/month" data-testid="input-campaign-budget" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="goal" render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Goal <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger data-testid="select-campaign-goal"><SelectValue placeholder="Select goal" /></SelectTrigger></FormControl>
                    <SelectContent>{CAMPAIGN_GOALS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="audienceInfo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Audience Details</FormLabel>
                  <FormControl><Input placeholder="e.g., Women 35-55 interested in skincare..." data-testid="input-campaign-audience" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full btn-gold text-white" data-testid="button-generate-blueprint">
                <Map className="w-4 h-4 mr-2" />
                Generate Campaign Blueprint
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
