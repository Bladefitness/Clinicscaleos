import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  headlineAnalyzeRequestSchema,
  adCopyToolsRequestSchema,
  type HeadlineAnalyzeRequest,
  type AdCopyToolsRequest,
} from "@shared/schema";
import { Type, Sparkles, Loader2, ArrowRight } from "lucide-react";
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
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CLINIC_TYPES } from "@/lib/constants";
import { CopyButton } from "@/components/ad-factory/copy-button";

type ToolTab = "headline" | "ad-copy";

export default function AITools() {
  const { toast } = useToast();
  const [tab, setTab] = useState<ToolTab>("headline");
  const [headlineLoading, setHeadlineLoading] = useState(false);
  const [adCopyLoading, setAdCopyLoading] = useState(false);
  const [headlineResult, setHeadlineResult] = useState<{
    score: number;
    breakdown: Record<string, number>;
    feedback: string;
    alternatives: string[];
  } | null>(null);
  const [adCopyResult, setAdCopyResult] = useState<Array<{ headline: string; primary_text: string; hook: string; style?: string }>>([]);

  const headlineForm = useForm<HeadlineAnalyzeRequest>({
    resolver: zodResolver(headlineAnalyzeRequestSchema),
    defaultValues: { headline: "", offer: "", service: "" },
  });

  const adCopyForm = useForm<AdCopyToolsRequest>({
    resolver: zodResolver(adCopyToolsRequestSchema),
    defaultValues: { service: "", offer: "", audience: "", clinicType: "" },
  });

  const onHeadlineSubmit = async (data: HeadlineAnalyzeRequest) => {
    setHeadlineLoading(true);
    setHeadlineResult(null);
    try {
      const res = await apiRequest("POST", "/api/tools/headline-analyze", data);
      const json = await res.json();
      if (json.score !== undefined) {
        setHeadlineResult({
          score: json.score,
          breakdown: json.breakdown ?? {},
          feedback: json.feedback ?? "",
          alternatives: Array.isArray(json.alternatives) ? json.alternatives : [],
        });
      } else {
        toast({ title: "Analysis failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Analysis failed", variant: "destructive" });
    } finally {
      setHeadlineLoading(false);
    }
  };

  const onAdCopySubmit = async (data: AdCopyToolsRequest) => {
    setAdCopyLoading(true);
    setAdCopyResult([]);
    try {
      const res = await apiRequest("POST", "/api/tools/ad-copy", data);
      const json = await res.json();
      const creatives = json.creatives ?? [];
      setAdCopyResult(Array.isArray(creatives) ? creatives : []);
    } catch {
      toast({ title: "Ad copy generation failed", variant: "destructive" });
    } finally {
      setAdCopyLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 lg:p-12 overflow-auto">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "AI Tools", href: "/ai-tools" }]}
        className="mb-6"
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">AI Tools</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Standalone copy tools: analyze headlines and generate ad copy on demand.
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={tab === "headline" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("headline")}
            className="gap-2"
          >
            <Type className="w-4 h-4" />
            Headline Analyzer
          </Button>
          <Button
            variant={tab === "ad-copy" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("ad-copy")}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Ad Copy Generator
          </Button>
        </div>

        {tab === "headline" && (
          <Card className="p-6 lg:p-8">
            <Form {...headlineForm}>
              <form onSubmit={headlineForm.handleSubmit(onHeadlineSubmit)} className="space-y-5">
                <FormField
                  control={headlineForm.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headline to analyze</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Your Doctor Says Your Labs Are Normal. You're Not." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={headlineForm.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Botox, Functional Medicine" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={headlineForm.control}
                  name="offer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offer (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Free consultation" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={headlineLoading} className="gap-2">
                  {headlineLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type className="w-4 h-4" />}
                  Analyze
                </Button>
              </form>
            </Form>

            {headlineResult && (
              <div className="mt-8 pt-6 border-t border-border space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-foreground">{headlineResult.score}</span>
                  <span className="text-muted-foreground">/ 10</span>
                </div>
                {Object.keys(headlineResult.breakdown).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(headlineResult.breakdown).map(([k, v]) => (
                      <span key={k} className="text-xs font-medium px-2 py-1 rounded-md bg-muted">
                        {k.replace(/_/g, " ")}: {v}
                      </span>
                    ))}
                  </div>
                )}
                {headlineResult.feedback && (
                  <p className="text-sm text-muted-foreground">{headlineResult.feedback}</p>
                )}
                {headlineResult.alternatives.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Alternative headlines</p>
                    <ul className="space-y-2">
                      {headlineResult.alternatives.map((alt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{alt}</span>
                          <CopyButton text={alt} label="Copy" className="ml-auto" />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {tab === "ad-copy" && (
          <Card className="p-6 lg:p-8">
            <Form {...adCopyForm}>
              <form onSubmit={adCopyForm.handleSubmit(onAdCopySubmit)} className="space-y-5">
                <FormField
                  control={adCopyForm.control}
                  name="clinicType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic type (optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CLINIC_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={adCopyForm.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Botox, Functional Medicine" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={adCopyForm.control}
                  name="offer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offer</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Free consultation, 20% off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={adCopyForm.control}
                  name="audience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target audience</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Women 25-40, health-conscious" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={adCopyLoading} className="gap-2">
                  {adCopyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate ad copy
                </Button>
              </form>
            </Form>

            {adCopyResult.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border space-y-6">
                <p className="text-sm font-medium text-foreground">{adCopyResult.length} concepts</p>
                {adCopyResult.map((c, i) => (
                  <Card key={i} className="p-4 space-y-3">
                    {c.style && (
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {c.style}
                      </span>
                    )}
                    <p className="font-semibold text-foreground">{c.headline}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">Hook: {c.hook}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.primary_text}</p>
                    <div className="flex gap-2 flex-wrap">
                      <CopyButton text={c.headline} label="Headline" />
                      <CopyButton text={c.primary_text} label="Copy" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
