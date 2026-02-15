import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useWorkflow } from "@/context/workflow-context";
import { celebrate } from "@/lib/celebrate";
import { BusinessForm } from "@/components/ad-factory/business-form";
import { AdCopierForm } from "@/components/ad-factory/ad-copier-form";
import { LoadingScreen } from "@/components/ad-factory/loading-screen";
import { ResultsGrid, type DisplayCreative } from "@/components/ad-factory/results-grid";
import type { GenerateRequest } from "@shared/schema";
import { LAUNCH_PLAN_STEPS } from "@/lib/launch-plan-steps";
import { Sparkles, Copy, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

type Tab = "generate" | "ad-copier";

interface CreativeRun {
  id: string;
  name: string;
  payload: {
    offerSummary: { clinicType: string; service: string; location: string; offerDetails?: string } | null;
    research: { summary: string } | null;
    avatars: Array<{ name: string; situation?: string; emotions?: object }>;
    creatives: DisplayCreative[];
    imageUrls?: Record<string, string>;
  };
  createdAt: string;
}

export default function CreativeFactory() {
  const { toast } = useToast();
  const { offerLab } = useWorkflow();
  const [tab, setTab] = useState<Tab>("generate");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [creatives, setCreatives] = useState<DisplayCreative[]>([]);

  // Deep link from Launch Plan flowchart: /creative-factory?step=1|2|3
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stepParam = new URLSearchParams(window.location.search).get("step");
    const n = stepParam ? parseInt(stepParam, 10) : NaN;
    if (n >= 1 && n <= 3) setStep(n as 1 | 2 | 3);
  }, []);
  const [research, setResearch] = useState<{ summary: string } | null>(null);
  const [avatars, setAvatars] = useState<Array<{ name: string; situation?: string; emotions?: object }>>([]);
  const [inlineImageUrls, setInlineImageUrls] = useState<Record<number, string>>({});
  const [lastFormData, setLastFormData] = useState<GenerateRequest | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval>>();
  const stageRef = useRef<ReturnType<typeof setInterval>>();

  const cleanup = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    if (stageRef.current) clearInterval(stageRef.current);
  }, []);

  useEffect(() => { return cleanup; }, [cleanup]);

  const { data: runs = [], refetch: refetchRuns, isLoading: runsLoading } = useQuery({
    queryKey: ["creative-runs"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/creative-runs");
      if (!res.ok) return [];
      const data = await res.json();
      return data as CreativeRun[];
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (formData: GenerateRequest) => {
      const res = await apiRequest("POST", "/api/generate", formData);
      return res.json();
    },
    onSuccess: async (data, variables) => {
      cleanup();
      setProgress(100);
      setActiveStage(5);
      await new Promise((r) => setTimeout(r, 800));
      setCreatives(data.creatives || []);
      setResearch(data.research || null);
      setAvatars(data.avatars || []);
      setInlineImageUrls(data.inlineImageUrls || {});
      setLastFormData(variables);
      setStep(3);
      celebrate();
      const runName = `${variables.clinicType} – ${variables.service} – ${new Date().toLocaleDateString()}`;
      const payload = {
        offerSummary: { clinicType: variables.clinicType, service: variables.service, location: variables.location, offerDetails: variables.offerDetails },
        research: data.research || null,
        avatars: data.avatars || [],
        creatives: data.creatives || [],
        imageUrls: data.inlineImageUrls || {},
      };
      try {
        await apiRequest("POST", "/api/creative-runs", { name: runName, payload });
        refetchRuns();
        toast({ title: "Run saved", description: "Find it in My runs below." });
      } catch {
        // non-blocking; run is still in state
      }
    },
    onError: async (err: Error, variables) => {
      cleanup();
      setProgress(100);
      setActiveStage(5);
      await new Promise((r) => setTimeout(r, 800));
      setCreatives([]);
      setResearch(null);
      setAvatars([]);
      setInlineImageUrls({});
      setStep(3);
      toast({
        title: "Generation failed",
        description: err?.message || "Check your Anthropic API key. Ad copy requires Anthropic.",
        variant: "destructive",
        action: (
          <ToastAction altText="Retry" onClick={() => generateMutation.mutate(variables)}>
            Retry
          </ToastAction>
        ),
      });
    },
  });

  const handleSubmit = (formData: GenerateRequest) => {
    setStep(2);
    setProgress(0);
    setActiveStage(0);
    stageRef.current = setInterval(() => {
      setActiveStage((prev) => { if (prev >= 4) { if (stageRef.current) clearInterval(stageRef.current); return prev; } return prev + 1; });
    }, 2500);
    progressRef.current = setInterval(() => {
      setProgress((prev) => prev >= 90 ? prev : prev + Math.random() * 3 + 1);
    }, 200);
    generateMutation.mutate(formData);
  };

  const handleReset = () => { setStep(1); setCreatives([]); setResearch(null); setAvatars([]); setInlineImageUrls({}); setLastFormData(null); setProgress(0); setActiveStage(0); };

  const handleAdCopierSuccess = (newCreatives: DisplayCreative[]) => {
    setCreatives(newCreatives);
    setResearch(null);
    setAvatars([]);
    setInlineImageUrls({});
    setStep(3);
    celebrate();
  };

  const handleOpenRun = useCallback(async (run: CreativeRun) => {
    const p = run.payload;
    setCreatives(p.creatives || []);
    setResearch(p.research || null);
    setAvatars(p.avatars || []);
    const urls: Record<number, string> = {};
    if (p.imageUrls && typeof p.imageUrls === "object") {
      Object.entries(p.imageUrls).forEach(([k, v]) => { urls[Number(k)] = v; });
    }
    setInlineImageUrls(urls);
    setLastFormData(p.offerSummary ? { ...p.offerSummary, goal: "", targetAudience: "", offerDetails: p.offerSummary.offerDetails ?? "" } as GenerateRequest : null);
    setStep(3);
  }, []);

  return (
    <div className="flex-1 p-8 lg:p-12 overflow-auto">
      {step === 1 && (
        <div>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Creative Factory", href: "/creative-factory" }]} className="mb-6" />
          <p className="text-xs text-muted-foreground max-w-xl mb-6 italic">
            Why? {LAUNCH_PLAN_STEPS.find((s) => s.id === "creatives")?.whyBullets[0]}
          </p>
          <div className="flex gap-2 mb-6">
            <Button
              variant={tab === "generate" ? "default" : "outline"}
              size="sm"
              onClick={() => setTab("generate")}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Ads
            </Button>
            <Button
              variant={tab === "ad-copier" ? "default" : "outline"}
              size="sm"
              onClick={() => setTab("ad-copier")}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Ad Copier
            </Button>
          </div>
          {tab === "generate" && (
            <>
              <BusinessForm onSubmit={handleSubmit} offerLabContext={offerLab} />
              <Card className="mt-8 p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  My runs
                </h2>
                {runsLoading ? (
                  <ul className="space-y-2 max-h-48">
                    {[1, 2, 3, 4].map((i) => (
                      <li key={i} className="flex items-center gap-2 px-3 py-2">
                        <Skeleton className="h-4 flex-1 rounded" />
                        <Skeleton className="h-4 w-16 rounded" />
                      </li>
                    ))}
                  </ul>
                ) : runs.length > 0 ? (
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {runs.slice(0, 20).map((run) => (
                      <li key={run.id}>
                        <button
                          type="button"
                          onClick={() => handleOpenRun(run)}
                          className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-muted transition-colors flex items-center justify-between gap-2"
                        >
                          <span className="truncate text-foreground">{run.name}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {run.payload.creatives?.length ?? 0} creatives
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon={<FolderOpen className="w-8 h-8" />}
                    title="No saved runs yet"
                    description="Generate creatives above to save them here. Your runs will appear for quick access."
                    actionLabel="Scroll to form"
                    onAction={() => document.querySelector('form')?.scrollIntoView({ behavior: "smooth" })}
                  />
                )}
              </Card>
            </>
          )}
          {tab === "ad-copier" && <AdCopierForm onSuccess={handleAdCopierSuccess} />}
        </div>
      )}
      {step === 2 && <LoadingScreen progress={progress} activeStage={activeStage} />}
      {step === 3 && (
        <ResultsGrid
          creatives={creatives}
          onReset={handleReset}
          research={research}
          avatars={avatars}
          offerSummary={lastFormData}
          initialImageUrls={inlineImageUrls}
          onReplaceCreative={(index, updates) =>
            setCreatives((prev) => {
              const next = [...prev];
              next[index] = { ...next[index], ...updates };
              return next;
            })
          }
          onSaveEditedImage={(index, compositeDataUrl) => {
            setInlineImageUrls((prev) => ({ ...prev, [index]: compositeDataUrl }));
          }}
        />
      )}
    </div>
  );
}
