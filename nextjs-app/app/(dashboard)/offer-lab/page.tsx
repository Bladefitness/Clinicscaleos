"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/query-client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { offerScoreRequestSchema, type OfferScoreRequest } from "@/lib/db/schema";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Target, ArrowRight, Loader2, CheckCircle2, AlertTriangle, TrendingUp,
  Shield, Eye, Clock, Star, ChevronDown, ChevronUp, ChevronRight, Lightbulb, BarChart3,
  Plus, Gift, Percent, Timer, ShieldCheck, Gem, Sparkles, Zap
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
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ToastAction } from "@/components/ui/toast";
import { useWorkflow } from "@/context/workflow-context";
import { StickyCta } from "@/components/sticky-cta";
import { celebrate } from "@/lib/celebrate";
import { CLINIC_TYPES } from "@/lib/constants";
import { LAUNCH_PLAN_STEPS } from "@/lib/launch-plan-steps";

const SERVICES_BY_CLINIC: Record<string, string[]> = {
  "Med Spa": ["Botox", "Dermal Fillers", "Laser Hair Removal", "Chemical Peels", "Microneedling", "PRP Facial", "CoolSculpting", "IPL Photofacial"],
  "Dental Clinic": ["Teeth Whitening", "Dental Implants", "Invisalign", "Veneers", "Root Canal", "Dental Crowns", "Deep Cleaning", "All-on-4"],
  "IV Therapy Clinic": ["NAD+ IV", "Myers Cocktail", "Glutathione IV", "Vitamin C Drip", "Hydration Therapy", "Immunity Boost IV", "Athletic Recovery IV", "Beauty Drip"],
  "Wellness Clinic": ["Hormone Therapy", "Functional Medicine Consult", "Stem Cell Therapy", "Peptide Therapy", "Ozone Therapy", "Detox Program", "Anti-Aging Panel", "Gut Health Program"],
  "Weight Loss Clinic": ["Semaglutide (Ozempic)", "Tirzepatide (Mounjaro)", "Medical Weight Loss Plan", "Body Contouring", "Meal Plan + Coaching", "HCG Diet Program", "Metabolic Testing", "Lipotropic Injections"],
  "Chiropractic Office": ["Spinal Adjustment", "Decompression Therapy", "Sports Injury Rehab", "Sciatica Treatment", "Posture Correction", "Neuropathy Treatment", "Prenatal Chiropractic", "Auto Injury Care"],
  "Dermatology Clinic": ["Acne Treatment", "Eczema Management", "Skin Cancer Screening", "Psoriasis Treatment", "Mole Removal", "Anti-Aging Treatment", "Rosacea Treatment", "Hair Loss Treatment"],
  "Physical Therapy": ["Post-Surgery Rehab", "Sports Injury Therapy", "Chronic Pain Management", "Balance Training", "TMJ Therapy", "Dry Needling", "Manual Therapy", "Pelvic Floor Therapy"],
  "Other": ["Primary Service", "Consultation", "Treatment Package", "Wellness Program"],
};

const PRICE_PRESETS = [
  { label: "Free Consult", value: "Free consultation" },
  { label: "$49", value: "$49" },
  { label: "$99", value: "$99" },
  { label: "$149", value: "$149" },
  { label: "$199", value: "$199" },
  { label: "$299", value: "$299" },
  { label: "$499", value: "$499" },
  { label: "$999+", value: "$999" },
];

const TARGET_MARKET_PRESETS = [
  "Women 25-40, image-conscious",
  "Women 35-55, anti-aging focused",
  "Men 30-50, high income professionals",
  "New moms looking to feel like themselves again",
  "Brides-to-be preparing for their wedding",
  "Athletes & fitness enthusiasts",
  "Seniors 55+ with chronic pain",
  "Busy executives who want fast results",
];

const DIFFERENTIATOR_PRESETS = [
  "Board-certified specialists with 15+ years experience",
  "Luxury private suite experience",
  "Proprietary technique with faster results",
  "Only clinic in the area with this technology",
  "Over 5,000 happy patients with 5-star reviews",
  "Same-day results, no downtime",
  "All-inclusive pricing with no hidden fees",
  "Celebrity-trusted provider",
];

interface OfferBlock {
  icon: any;
  label: string;
  category: string;
  templates: string[];
}

const OFFER_BUILDING_BLOCKS: OfferBlock[] = [
  {
    icon: Percent,
    label: "Discount",
    category: "discount",
    templates: [
      "20% off your first treatment",
      "50% off for new patients",
      "Buy 2 sessions, get 1 free",
      "$100 off when you book this week",
    ],
  },
  {
    icon: Gift,
    label: "Bonus",
    category: "bonus",
    templates: [
      "Free skincare kit with your treatment ($150 value)",
      "Complimentary follow-up consultation included",
      "Free touch-up session within 30 days",
      "Bonus: personalized treatment plan included",
    ],
  },
  {
    icon: ShieldCheck,
    label: "Guarantee",
    category: "guarantee",
    templates: [
      "100% satisfaction guarantee or your money back",
      "Results guaranteed or we'll re-treat for free",
      "Love it or your next session is on us",
      "Price-match guarantee vs. any local competitor",
    ],
  },
  {
    icon: Timer,
    label: "Urgency",
    category: "urgency",
    templates: [
      "Only 10 spots available this month",
      "Offer expires this Friday",
      "First 20 patients only",
      "Limited: seasonal pricing ends soon",
    ],
  },
  {
    icon: Gem,
    label: "Premium",
    category: "premium",
    templates: [
      "VIP consultation with our lead specialist",
      "Includes private treatment suite experience",
      "Priority scheduling + concierge support",
      "Exclusive access to our new technology",
    ],
  },
];

function SuggestionChips({ options, onSelect, selectedValue, testIdPrefix }: {
  options: string[];
  onSelect: (val: string) => void;
  selectedValue?: string;
  testIdPrefix: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((opt, i) => (
        <Badge
          key={i}
          variant={selectedValue === opt ? "default" : "outline"}
          className={`cursor-pointer text-[13px] py-1.5 px-3 font-medium ${selectedValue === opt ? "btn-gold text-white" : "text-slate-300"}`}
          onClick={() => onSelect(opt)}
          data-testid={`${testIdPrefix}-${i}`}
        >
          {opt}
        </Badge>
      ))}
    </div>
  );
}

const SCORE_LABELS: Record<string, { icon: any; label: string }> = {
  clarity: { icon: Eye, label: "Clarity" },
  urgency: { icon: Clock, label: "Urgency" },
  risk_reversal: { icon: Shield, label: "Risk Reversal" },
  specificity: { icon: Target, label: "Specificity" },
  value_perception: { icon: Star, label: "Value Perception" },
};

function ScoreBar({ value, label, icon: Icon }: { value: number; label: string; icon: any }) {
  const color = value >= 7 ? "bg-[#38bdf8]" : value >= 5 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-[#162040] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-medium text-white">{label}</span>
          <span className="text-[13px] font-bold text-white">{value}/10</span>
        </div>
        <div className="h-1.5 bg-[#162040] rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${value * 10}%` }} />
        </div>
      </div>
    </div>
  );
}

const WIZARD_STEPS = [
  { title: "Clinic & Service", fields: ["clinicType", "service", "location", "price"] as const },
  { title: "Audience", fields: ["targetMarket", "differentiator"] as const },
  { title: "Build Offer", fields: ["currentOffer"] as const },
];

export default function OfferLab() {
  useEffect(() => {
    document.title = "Offer Lab | Clinic Growth OS";
  }, []);

  const { toast } = useToast();
  const { setOfferLab } = useWorkflow();
  const [result, setResult] = useState<any>(null);
  const [expandedVariation, setExpandedVariation] = useState<number | null>(null);
  const [pendingFinalize, setPendingFinalize] = useState<number | null>(null);
  const [finalOfferText, setFinalOfferText] = useState<string>("");
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [wizardStep, setWizardStep] = useState(1);
  const router = useRouter();
  const formCardRef = useRef<HTMLDivElement>(null);

  // Deep link from Launch Plan flowchart: /offer-lab?step=1|2|3
  useEffect(() => {
    if (typeof window === "undefined") return;
    const step = new URLSearchParams(window.location.search).get("step");
    const n = step ? parseInt(step, 10) : NaN;
    if (n >= 1 && n <= 3) setWizardStep(n);
  }, []);

  const form = useForm<OfferScoreRequest>({
    resolver: zodResolver(offerScoreRequestSchema) as any,
    defaultValues: { service: "", price: "", clinicType: "", location: "", currentOffer: "", differentiator: "", targetMarket: "" },
  });

  const watchedClinicType = form.watch("clinicType");
  const watchedService = form.watch("service");
  const watchedPrice = form.watch("price");
  const watchedTarget = form.watch("targetMarket");
  const watchedDiff = form.watch("differentiator");
  const watchedOffer = form.watch("currentOffer");

  const serviceOptions = SERVICES_BY_CLINIC[watchedClinicType] || [];

  const addOfferBlock = (template: string) => {
    const current = form.getValues("currentOffer");
    const separator = current.trim() ? " + " : "";
    form.setValue("currentOffer", current + separator + template, { shouldValidate: true });
    setSelectedBlocks((prev) => [...prev, template]);
  };

  const removeOfferBlock = (template: string) => {
    const current = form.getValues("currentOffer");
    const updated = current
      .split(" + ")
      .filter((part) => part.trim() !== template.trim())
      .join(" + ");
    form.setValue("currentOffer", updated, { shouldValidate: true });
    setSelectedBlocks((prev) => prev.filter((b) => b !== template));
  };

  const scoreMutation = useMutation({
    mutationFn: async (data: OfferScoreRequest) => {
      const res = await apiRequest("POST", "/api/offers/score", data);
      return res.json();
    },
    onSuccess: (data, variables) => {
      if (data.source === "error" || !data.offer?.score) {
        toast({
          title: "Scoring failed",
          description: data.error || "AI could not analyze your offer. Please try again.",
          variant: "destructive",
          action: (
            <ToastAction altText="Retry" onClick={() => scoreMutation.mutate(variables)}>
              Retry
            </ToastAction>
          ),
        });
        return;
      }
      setResult(data.offer);
      celebrate();
      setOfferLab({
        clinicType: variables.clinicType,
        service: variables.service,
        currentOffer: variables.currentOffer || "",
        location: variables.location || "",
        targetMarket: variables.targetMarket || "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
    },
    onError: (err: Error, variables) => {
      toast({
        title: "Could not score offer",
        description: err.message || "Check your connection and ANTHROPIC_API_KEY, then try again.",
        variant: "destructive",
        action: (
          <ToastAction altText="Retry" onClick={() => scoreMutation.mutate(variables)}>
            Retry
          </ToastAction>
        ),
      });
    },
  });

  const handleSubmit = (data: OfferScoreRequest) => {
    scoreMutation.mutate(data);
  };

  const validateStep = async (step: number) => {
    const fields = WIZARD_STEPS[step - 1].fields;
    const ok = await form.trigger(fields as any);
    return ok;
  };

  const goNext = async () => {
    if (wizardStep < 3) {
      const ok = await validateStep(wizardStep);
      if (ok) setWizardStep((s) => s + 1);
    }
  };

  const goBack = () => setWizardStep((s) => Math.max(1, s - 1));

  if (scoreMutation.isPending) {
    return (
      <div className="flex-1 pt-8 pb-6 px-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Offer Lab", href: "/offer-lab" }, { label: "Analyzing..." }]} className="mb-6" />
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-32 rounded-lg lg:col-span-2" />
            </div>
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
          <div className="mt-8 flex flex-col items-center">
            <Loader2 className="w-6 h-6 text-[#38bdf8] animate-spin" />
            <p className="text-sm text-slate-400 mt-3">Scoring clarity, urgency, risk reversal, and value perception...</p>
          </div>
        </div>
      </div>
    );
  }

  if (result && result.score) {
    const breakdown = result.scoreBreakdown as Record<string, number>;
    const variations = (result.variations || []) as any[];
    const competitorData = result.competitorData as any;
    const marketBenchmarks = result.marketBenchmarks as Record<string, number> | undefined;
    const scoreColor = result.score >= 7 ? "text-[#38bdf8]" : result.score >= 5 ? "text-amber-500" : "text-red-500";
    const originalOffer = result.currentOffer || "";
    const chosenIndex = pendingFinalize;
    const chosenVariation = chosenIndex !== null ? variations[chosenIndex] : null;
    const projectedScore = chosenVariation?.projected_score ?? result.score;
    const scoreDelta = projectedScore - result.score;

    if (chosenIndex !== null && chosenVariation) {
      const offerToFinalize = finalOfferText || chosenVariation.offer_text;
      return (
        <div className="flex-1 pt-8 pb-6 px-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Offer Lab", href: "/offer-lab" }, { label: "Results" }, { label: "Finalize" }]} className="mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Review & finalize your offer</h1>
            <p className="text-slate-400 text-sm mb-6">Compare your original to the chosen variation, edit if needed, then lock it in for Creative Factory.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="p-6 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Original offer</p>
                <p className="text-2xl font-bold text-slate-400 mb-2">{result.score}/10</p>
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{originalOffer}</p>
              </Card>
              <Card className="p-6 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.15)]">
                <p className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider mb-2">Your chosen offer</p>
                <p className="text-2xl font-bold text-[#38bdf8] mb-2">{projectedScore}/10</p>
                {scoreDelta > 0 && (
                  <p className="text-xs text-[#38bdf8] font-medium mb-2">+{scoreDelta} points from adding urgency, risk reversal, and specificity</p>
                )}
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{chosenVariation.offer_text}</p>
              </Card>
            </div>

            <Card className="p-6 mb-6 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
              <p className="text-sm font-semibold text-white mb-2">Final offer (edit if you like)</p>
              <p className="text-xs text-slate-400 mb-2">This text will be used in Creative Factory for your ad copy.</p>
              <Textarea
                value={offerToFinalize}
                onChange={(e) => setFinalOfferText(e.target.value)}
                className="min-h-[120px] resize-y"
                placeholder="Your finalized offer..."
              />
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => { setPendingFinalize(null); setFinalOfferText(""); }}>
                Back to results
              </Button>
              <Button
                className="btn-gold text-white gap-2"
                onClick={() => {
                  setOfferLab({
                    clinicType: result.clinicType || "",
                    service: result.service || "",
                    currentOffer: offerToFinalize.trim() || chosenVariation.offer_text,
                    location: result.location || "",
                    targetMarket: result.targetMarket || "",
                  });
                  toast({ title: "Offer finalized", description: "Create ads in Creative Factory with this offer." });
                  router.push("/creative-factory");
                }}
              >
                <Sparkles className="w-4 h-4" />
                Finalize & create ads
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 pt-8 pb-6 px-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Offer Lab", href: "/offer-lab" }, { label: "Results" }]} className="mb-6" />
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="text-offer-results">Offer Analysis</h1>
              <p className="text-slate-400 text-sm mt-1">AI-powered scoring and optimization suggestions</p>
            </div>
            <Button variant="outline" onClick={() => { setResult(null); form.reset(); setSelectedBlocks([]); setWizardStep(1); }} data-testid="button-new-offer">
              New Offer
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 flex flex-col items-center justify-center col-span-1 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Overall Score</p>
              <p className={`text-6xl font-bold ${scoreColor}`} data-testid="text-overall-score">{result.score}</p>
              <p className="text-sm text-slate-400 mt-1">/10</p>
            </Card>

            <Card className="p-6 col-span-1 lg:col-span-2 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
              <p className="text-sm font-semibold text-white mb-4">Score Breakdown</p>
              <div className="space-y-3">
                {breakdown && Object.entries(breakdown).map(([key, val]) => {
                  const meta = SCORE_LABELS[key];
                  if (!meta) return null;
                  const marketVal = marketBenchmarks?.[key];
                  return (
                    <div key={key}>
                      <ScoreBar value={val} label={meta.label} icon={meta.icon} />
                      {typeof marketVal === "number" && (
                        <p className="text-[11px] text-slate-400 mt-0.5 ml-11">
                          Market avg: {marketVal}/10 {val < marketVal && <span className="text-amber-600">(gap: {marketVal - val})</span>}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <Card className="p-6 mb-6 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
            <p className="text-sm font-semibold text-white mb-3">Verdict</p>
            <p className="text-sm text-slate-400 leading-relaxed" data-testid="text-verdict">{result.verdict}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div>
                <p className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider mb-2">Strengths</p>
                <div className="space-y-1.5">
                  {(result.strengths || []).map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-white">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider mb-2">Add these for a 9+ offer</p>
                <div className="space-y-2">
                  {[...(result.weaknesses || [])]
                    .sort((a: any, b: any) => {
                      const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
                      const ai = typeof a === "object" ? (order[a.impact] ?? 1) : 1;
                      const bi = typeof b === "object" ? (order[b.impact] ?? 1) : 1;
                      return ai - bi;
                    })
                    .map((w: any, i: number) => {
                      const issue = typeof w === "string" ? w : w?.issue ?? String(w);
                      const impact = typeof w === "object" && w?.impact ? w.impact : "medium";
                      const fixSuggestion = typeof w === "object" && w?.fix_suggestion ? w.fix_suggestion : null;
                      return (
                        <div key={i} className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-sm text-white">{issue}</span>
                            {fixSuggestion && (
                              <p className="text-xs text-[#38bdf8] mt-1 font-medium">{fixSuggestion}</p>
                            )}
                            <Badge variant={impact === "high" ? "destructive" : "secondary"} className="text-[10px] mt-1">
                              {impact} impact
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </Card>

          {(result.improvementRoadmap || []).length > 0 && (
            <Card className="p-6 mb-6 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.15)]">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                How to get to a 9+ offer
              </h2>
              <ol className="space-y-3">
                {result.improvementRoadmap.map((item: any, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[rgba(56,189,248,0.08)] text-[#38bdf8] text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {item.priority ?? i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{item.action}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant={item.impact === "quick_win" ? "default" : "outline"} className="text-[10px]">
                          {item.impact === "quick_win" ? "Quick win" : item.impact === "high_effort" ? "Bigger lift" : "Medium"}
                        </Badge>
                        {item.metric_improved && (
                          <span className="text-xs text-slate-400">Improves: {item.metric_improved}</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {variations.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Improved Offer Variations
              </h2>
              <div className="space-y-3">
                {variations.map((v: any, i: number) => (
                  <Card
                    key={i}
                    className={`p-5 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)] transition-all ${expandedVariation === i ? "ring-2 ring-[#38bdf8]/30" : ""}`}
                    data-testid={`card-variation-${i}`}
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => setExpandedVariation(expandedVariation === i ? null : i)}
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
                            {(v.weaknesses_addressed || []).length > 0 && (
                              <Badge variant="outline" className="text-xs text-[#38bdf8] border-[rgba(56,189,248,0.15)]">
                                Fixes: {(v.weaknesses_addressed as string[]).slice(0, 2).join(", ")}
                                {(v.weaknesses_addressed as string[]).length > 2 ? "..." : ""}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-white">{v.offer_text}</p>
                        </div>
                        {expandedVariation === i ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                      </div>
                    </div>
                    {expandedVariation === i && (
                      <div className="mt-3 pt-3 border-t border-[rgba(56,189,248,0.1)]">
                        <p className="text-sm text-slate-400">{v.reasoning}</p>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-[rgba(56,189,248,0.1)]">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 w-full sm:w-auto"
                        onClick={async () => {
                          if (result?.id) {
                            apiRequest("PATCH", `/api/offers/${result.id}/select-variation`, { variationIndex: i }).catch(() => {});
                          }
                          setFinalOfferText(v.offer_text);
                          setPendingFinalize(i);
                        }}
                        data-testid={`button-use-offer-${i}`}
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        Use this offer
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {competitorData && (
            <Card className="p-6 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Competitive Landscape
              </h2>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-xs text-slate-400">Market Temperature:</span>
                <Badge variant="secondary" className="text-xs capitalize">
                  {(competitorData.market_temperature || "mixed").replace("_", " ")}
                </Badge>
              </div>
              {competitorData.common_competitor_offers && competitorData.common_competitor_offers.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">What competitors typically offer</p>
                  <ul className="space-y-1.5">
                    {competitorData.common_competitor_offers.map((offer: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white">
                        <span className="text-slate-400">•</span>
                        <span>{offer}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {competitorData.differentiation_opportunities && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Differentiation Opportunities</p>
                  <div className="space-y-1.5">
                    {competitorData.differentiation_opportunities.map((d: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-[#38bdf8] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-white">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {competitorData.recommended_angles && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommended Angles</p>
                  <div className="flex flex-wrap gap-2">
                    {competitorData.recommended_angles.map((a: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          <Card className="p-6 mt-8 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.15)]">
            <h3 className="text-sm font-semibold text-white mb-2">What&apos;s next?</h3>
            <p className="text-sm text-slate-400 mb-4">Turn this offer into scroll-stopping ads.</p>
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
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Offer Lab" }]} className="mb-6" />
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(56,189,248,0.08)] text-[#38bdf8] text-[13px] font-medium mb-4">
            <Target className="w-3.5 h-3.5" />
            Module 1: Offer Intelligence
          </span>
          <h1 className="text-3xl font-bold font-sans text-white mb-2 gradient-text" data-testid="text-offer-lab-title">Offer Lab</h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Build a high-converting offer using proven templates, then let AI score and optimize it.
          </p>
          <p className="text-xs text-slate-400 max-w-lg mx-auto mt-2 italic">
            Why? {LAUNCH_PLAN_STEPS.find((s) => s.id === "offer")?.whyBullets[0]}
          </p>
        </div>

        <Card ref={formCardRef} className="p-6 lg:p-8 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
          <div className="flex items-center justify-between mb-6">
            {WIZARD_STEPS.map((s, i) => (
              <div key={s.title} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    wizardStep > i + 1 ? "btn-gold text-white" : wizardStep === i + 1 ? "bg-[rgba(56,189,248,0.08)] text-[#38bdf8] border-2 border-[#38bdf8]" : "bg-[#162040] text-slate-400"
                  }`}
                >
                  {wizardStep > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${wizardStep >= i + 1 ? "text-white" : "text-slate-400"}`}>{s.title}</span>
                {i < WIZARD_STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-slate-400 hidden md:inline" />}
              </div>
            ))}
          </div>
          <Form {...form}>
            <form id="offer-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {wizardStep === 1 && (
              <>
              <FormField control={form.control} name="clinicType" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-white">What type of clinic do you run? <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger data-testid="select-offer-clinic-type"><SelectValue placeholder="Select your clinic type" /></SelectTrigger></FormControl>
                    <SelectContent>{CLINIC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="service" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-white">What service are you promoting? <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="Type or pick a service below..." data-testid="input-offer-service" {...field} /></FormControl>
                  {serviceOptions.length > 0 && (
                    <SuggestionChips
                      options={serviceOptions}
                      onSelect={(val) => form.setValue("service", val, { shouldValidate: true })}
                      selectedValue={watchedService}
                      testIdPrefix="chip-service"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-white">Location <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g., Miami, FL" data-testid="input-offer-location" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-white">Price Point</FormLabel>
                    <FormControl><Input placeholder="Type or pick below..." data-testid="input-offer-price" {...field} /></FormControl>
                    <SuggestionChips
                      options={PRICE_PRESETS.map((p) => p.label)}
                      onSelect={(val) => {
                        const preset = PRICE_PRESETS.find((p) => p.label === val);
                        form.setValue("price", preset?.value || val, { shouldValidate: true });
                      }}
                      selectedValue={PRICE_PRESETS.find((p) => p.value === watchedPrice)?.label}
                      testIdPrefix="chip-price"
                    />
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={goNext} className="btn-gold text-white gap-2">
                  Next: Audience
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              </>
              )}

              {wizardStep === 2 && (
              <>
              <FormField control={form.control} name="targetMarket" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-white">Who is this offer for?</FormLabel>
                  <FormControl><Input placeholder="Type or pick a target audience..." data-testid="input-target-market" {...field} /></FormControl>
                  <SuggestionChips
                    options={TARGET_MARKET_PRESETS}
                    onSelect={(val) => form.setValue("targetMarket", val, { shouldValidate: true })}
                    selectedValue={watchedTarget}
                    testIdPrefix="chip-target"
                  />
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="differentiator" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-white">What makes you different?</FormLabel>
                  <FormControl><Input placeholder="Type or pick a differentiator..." data-testid="input-differentiator" {...field} /></FormControl>
                  <SuggestionChips
                    options={DIFFERENTIATOR_PRESETS}
                    onSelect={(val) => form.setValue("differentiator", val, { shouldValidate: true })}
                    selectedValue={watchedDiff}
                    testIdPrefix="chip-diff"
                  />
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={goBack}>Back</Button>
                <Button type="button" onClick={goNext} className="btn-gold text-white gap-2">
                  Next: Build Offer
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              </>
              )}

              {wizardStep === 3 && (
              <>
              <div>
                <FormField control={form.control} name="currentOffer" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-white">Build Your Offer <span className="text-red-500">*</span></FormLabel>
                    <p className="text-sm text-slate-400 mb-3">
                      Click the building blocks below to assemble your offer, or type it manually.
                    </p>
                    <FormControl>
                      <Textarea className="resize-none" rows={3} placeholder="Your offer will appear here as you click building blocks..." data-testid="input-current-offer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="mt-4 space-y-4">
                  {OFFER_BUILDING_BLOCKS.map((block) => (
                    <div key={block.category}>
                      <div className="flex items-center gap-2 mb-2">
                        <block.icon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-white uppercase tracking-wider">{block.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {block.templates.map((tmpl, ti) => {
                          const isSelected = selectedBlocks.includes(tmpl);
                          return (
                            <Badge
                              key={ti}
                              variant={isSelected ? "default" : "outline"}
                              className={`cursor-pointer text-[13px] py-1.5 px-3 font-medium ${isSelected ? "btn-gold text-white" : "text-slate-300"}`}
                              onClick={() => isSelected ? removeOfferBlock(tmpl) : addOfferBlock(tmpl)}
                              data-testid={`chip-offer-${block.category}-${ti}`}
                            >
                              {isSelected ? (
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                              ) : (
                                <Plus className="w-3 h-3 mr-1" />
                              )}
                              {tmpl}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {watchedOffer && (
                <Card className="p-4 bg-[rgba(56,189,248,0.08)] border-[rgba(56,189,248,0.15)]">
                  <p className="text-sm font-semibold text-[#38bdf8] uppercase tracking-wider mb-2">Offer Preview</p>
                  <p className="text-sm text-white leading-relaxed" data-testid="text-offer-preview">
                    {watchedService && <span className="font-semibold">{watchedService}</span>}
                    {watchedPrice && <span> at {watchedPrice}</span>}
                    {watchedService && " - "}
                    {watchedOffer}
                    {watchedDiff && <span className="text-slate-400"> ({watchedDiff})</span>}
                  </p>
                </Card>
              )}
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={goBack}>Back</Button>
                <Button type="submit" className="btn-gold text-white" data-testid="button-score-offer">
                <Target className="w-4 h-4 mr-2" />
                Score My Offer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              </div>
              </>
              )}
            </form>
          </Form>
        </Card>
        <StickyCta formRef={formCardRef}>
          <div className="flex gap-2 w-full max-w-md mx-auto">
            {wizardStep > 1 && (
              <Button variant="outline" onClick={goBack} className="flex-1">Back</Button>
            )}
            {wizardStep < 3 ? (
              <Button onClick={goNext} className="btn-gold text-white flex-1 gap-2">
                Next: {WIZARD_STEPS[wizardStep]?.title || ""}
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button form="offer-form" type="submit" className="btn-gold text-white flex-1 gap-2" data-testid="button-score-offer-sticky">
                <Target className="w-4 h-4" />
                Score My Offer
              </Button>
            )}
          </div>
        </StickyCta>
      </div>
    </div>
  );
}
