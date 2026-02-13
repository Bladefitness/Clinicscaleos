import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { campaignBlueprintRequestSchema, type CampaignBlueprintRequest } from "@shared/schema";
import {
  Map, ArrowRight, Loader2, CheckCircle2, ChevronDown, ChevronRight,
  Download, Users, DollarSign, Target, Calendar, AlertCircle
} from "lucide-react";
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

function DeploymentStep({ step, index, checked, onToggle }: { step: any; index: number; checked: boolean; onToggle: () => void }) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-md transition-colors ${checked ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-slate-50 dark:bg-slate-800/30"}`}
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
          <span className="text-xs font-mono text-muted-foreground">Step {step.step_number}</span>
          <Badge variant="outline" className="text-[10px]">{step.screen}</Badge>
        </div>
        <p className={`text-sm font-medium ${checked ? "text-muted-foreground line-through" : "text-foreground"}`}>{step.action}</p>
        <p className="text-xs text-muted-foreground mt-1">{step.details}</p>
        {step.common_mistakes && (
          <div className="flex items-start gap-1.5 mt-2">
            <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-amber-600 dark:text-amber-400">{step.common_mistakes}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CampaignHQ() {
  const [campaign, setCampaign] = useState<any>(null);
  const [expandedPhase, setExpandedPhase] = useState<number>(0);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const form = useForm<CampaignBlueprintRequest>({
    resolver: zodResolver(campaignBlueprintRequestSchema),
    defaultValues: { clinicType: "", service: "", location: "", budget: "", goal: "", audienceInfo: "", creativeCount: 6 },
  });

  const blueprintMutation = useMutation({
    mutationFn: async (data: CampaignBlueprintRequest) => {
      const res = await apiRequest("POST", "/api/campaigns/blueprint", data);
      return res.json();
    },
    onSuccess: (data) => {
      setCampaign(data.campaign);
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
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
      <div className="flex-1 p-6 lg:p-10 overflow-auto">
        <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/20 mb-8">
            <Map className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Building Your Campaign Blueprint</h2>
          <p className="text-muted-foreground text-center max-w-sm">Generating campaign structure, targeting, budget allocation, and deployment checklist...</p>
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mt-6" />
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
      <div className="flex-1 p-6 lg:p-10 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-campaign-title">{bp.campaign_name || campaign.name}</h1>
              <p className="text-muted-foreground text-sm mt-1">
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
            <h2 className="text-lg font-bold text-foreground mb-4">Campaign Structure</h2>
            <div className="space-y-3">
              {phases.map((phase: any, pi: number) => (
                <Card key={pi} className="overflow-visible">
                  <button
                    className="w-full flex items-center justify-between p-5 text-left"
                    onClick={() => setExpandedPhase(expandedPhase === pi ? -1 : pi)}
                    data-testid={`button-phase-${pi}`}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{pi + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{phase.phase_name}</p>
                        <p className="text-xs text-muted-foreground">{phase.duration} | {phase.budget_allocation}</p>
                      </div>
                    </div>
                    {expandedPhase === pi ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {expandedPhase === pi && (
                    <div className="px-5 pb-5 space-y-3">
                      {(phase.ad_sets || []).map((adSet: any, ai: number) => (
                        <div key={ai} className="bg-slate-50 dark:bg-slate-800/30 rounded-md p-4">
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <p className="text-sm font-medium text-foreground">{adSet.name}</p>
                            <Badge variant="outline" className="text-xs">{adSet.budget}/day</Badge>
                          </div>
                          {adSet.targeting && (
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{adSet.targeting.age_range} {adSet.targeting.gender}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Target className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{adSet.targeting.locations}</span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span className="text-red-500">Kill: {adSet.kill_criteria}</span>
                            <span className="text-emerald-500">Scale: {adSet.scale_criteria}</span>
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
                <h2 className="text-lg font-bold text-foreground">Deployment Checklist</h2>
                <span className="text-sm text-muted-foreground">{completedSteps}/{totalSteps} completed</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }} />
              </div>
              <div className="space-y-2">
                {steps.map((step: any, i: number) => (
                  <DeploymentStep key={i} step={step} index={i} checked={checkedSteps.has(i)} onToggle={() => toggleStep(i)} />
                ))}
              </div>
            </div>
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
            <Map className="w-3.5 h-3.5" />
            Module 3: Campaign Architect
          </span>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-campaign-hq-title">Campaign HQ</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Generate a complete Facebook Ads campaign blueprint with targeting, budget allocation, and step-by-step deployment instructions.
          </p>
        </div>

        <Card className="p-6 lg:p-8">
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

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white no-default-hover-elevate no-default-active-elevate" data-testid="button-generate-blueprint">
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
