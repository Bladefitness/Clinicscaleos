import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Package, Search, Users, FileText, Map, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateRequestSchema, type GenerateRequest } from "@shared/schema";
import { CLINIC_TYPES, CAMPAIGN_GOALS } from "@/lib/constants";
import { Switch } from "@/components/ui/switch";

interface OfferLabContext {
  clinicType: string;
  service: string;
  currentOffer: string;
  location: string;
  targetMarket: string;
}

interface BusinessFormProps {
  onSubmit: (data: GenerateRequest) => void;
  /** Pre-fill from Offer Lab when user navigates from there */
  offerLabContext?: OfferLabContext | null;
}

const trustBadges = [
  "15-20 creatives per run",
  "Under 60 seconds",
  "Research-backed avatars",
];

const howItWorksSteps = [
  { label: "Offer", icon: Package, desc: "Your clinic + service + offer" },
  { label: "Research", icon: Search, desc: "What makes your market convert" },
  { label: "Avatars", icon: Users, desc: "Patient personas from real psychology" },
  { label: "Creatives", icon: FileText, desc: "Scroll-stopping ads with hooks" },
  { label: "Campaign", icon: Map, desc: "Launch in Campaign HQ" },
];

export function BusinessForm({ onSubmit, offerLabContext }: BusinessFormProps) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const form = useForm<GenerateRequest>({
    resolver: zodResolver(generateRequestSchema),
    defaultValues: {
      clinicType: offerLabContext?.clinicType ?? "",
      service: offerLabContext?.service ?? "",
      location: offerLabContext?.location ?? "",
      targetAudience: offerLabContext?.targetMarket ?? "",
      offerDetails: offerLabContext?.currentOffer ?? "",
      goal: "",
      quickMode: false,
      inlineImages: 3,
    },
  });

  const goalValue = form.watch("goal");

  useEffect(() => {
    if (offerLabContext && (offerLabContext.clinicType || offerLabContext.service)) {
      form.reset({
        clinicType: offerLabContext.clinicType,
        service: offerLabContext.service,
        location: offerLabContext.location,
        targetAudience: offerLabContext.targetMarket,
        offerDetails: offerLabContext.currentOffer,
        goal: form.getValues("goal") || "",
      });
    }
  }, [offerLabContext]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Generation
        </span>
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 leading-tight" data-testid="text-factory-title">
          Creative Factory — Ads That Stop the Scroll
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
          We research your market, build avatars from real psychology, then generate creatives. You learn why each ad works.
        </p>
      </div>

      <div className="mb-8">
        <button
          type="button"
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
        >
          How it works
          {showHowItWorks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showHowItWorks && (
          <div className="flex flex-wrap items-center justify-center gap-4 py-5 px-5 rounded-xl bg-muted/50 border border-border/50 mt-2">
            {howItWorksSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex items-center gap-2 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{step.label}</span>
                  <span className="text-muted-foreground hidden sm:inline">— {step.desc}</span>
                  {i < howItWorksSteps.length - 1 && (
                    <span className="text-slate-300 dark:text-slate-600 hidden md:inline">→</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Card className="p-6 lg:p-8 shadow-md border-border/80">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="clinicType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Clinic Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-clinic-type">
                        <SelectValue placeholder="Select your clinic type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CLINIC_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Primary Service <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Botox injections, teeth whitening, IV vitamin drips..."
                      data-testid="input-service"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Location <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Miami, FL"
                      data-testid="input-location"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Women 35-55, health-conscious professionals..."
                      data-testid="input-audience"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="offerDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Details</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      rows={3}
                      placeholder="e.g., Free consultation + 20% off first treatment..."
                      data-testid="input-offer"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-lg bg-muted/50 border border-border/50">
              <FormField
                control={form.control}
                name="quickMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-3 flex-1">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Quick Mode
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">Skip research & avatars — ~20s faster</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inlineImages"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-base">Inline images</FormLabel>
                    <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">None (copy only)</SelectItem>
                        <SelectItem value="3">First 3</SelectItem>
                        <SelectItem value="6">First 6</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Campaign Goal <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-3">
                      {CAMPAIGN_GOALS.map((goal) => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => field.onChange(goal)}
                          className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors duration-200 ${
                            goalValue === goal
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                          data-testid={`button-goal-${goal.toLowerCase().replace(/\s/g, "-")}`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={!form.formState.isValid}
              className="w-full btn-primary-glow bg-primary hover:bg-primary/90 text-primary-foreground no-default-hover-elevate no-default-active-elevate"
              data-testid="button-generate"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Ad Creatives
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </Form>
      </Card>

      <div className="flex flex-wrap items-center justify-center gap-8 mt-8 pt-6 border-t border-border/50">
        {trustBadges.map((badge) => (
          <div key={badge} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
