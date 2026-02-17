"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/query-client";
import { useToast } from "@/hooks/use-toast";
import {
  Search, BookOpen, Library, Loader2, Clock, Trash2, ChevronRight,
  ChevronDown, ChevronUp, ExternalLink, Sparkles, Heart, Megaphone,
  Building2, AlertCircle, Bookmark, Image as ImageIcon, Tag, StickyNote,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  painPointSearchRequestSchema, adLibrarySearchRequestSchema,
  type PainPointSearchRequest, type AdLibrarySearchRequest,
  type ResearchSession, type SavedAd,
} from "@/lib/db/schema";
import { CLINIC_TYPES } from "@/lib/constants";

// ============================================================
// Constants
// ============================================================

const LOADING_STAGES = [
  "Searching Reddit, forums, and review sites...",
  "Analyzing patient complaints and frustrations...",
  "Identifying emotional triggers...",
  "Synthesizing messaging angles...",
  "Compiling research report...",
];

const SERVICES_BY_CLINIC: Record<string, string[]> = {
  "Med Spa": ["Botox", "Dermal Fillers", "Laser Hair Removal", "Chemical Peels", "Microneedling", "CoolSculpting"],
  "Dental Clinic": ["Teeth Whitening", "Dental Implants", "Invisalign", "Veneers", "Root Canal", "All-on-4"],
  "IV Therapy Clinic": ["NAD+ IV", "Myers Cocktail", "Glutathione IV", "Vitamin C Drip", "Hydration Therapy"],
  "Wellness Clinic": ["Hormone Therapy", "Stem Cell Therapy", "Peptide Therapy", "Anti-Aging Panel", "Gut Health"],
  "Weight Loss Clinic": ["Semaglutide (Ozempic)", "Tirzepatide (Mounjaro)", "Medical Weight Loss", "Body Contouring"],
  "Chiropractic Office": ["Spinal Adjustment", "Decompression Therapy", "Sports Injury Rehab", "Sciatica Treatment"],
  "Dermatology Clinic": ["Acne Treatment", "Eczema Management", "Skin Cancer Screening", "Anti-Aging Treatment"],
  "Physical Therapy": ["Post-Surgery Rehab", "Sports Injury Therapy", "Chronic Pain Management", "Dry Needling"],
};

const SUGGESTION_CHIPS = [
  "dental implant complaints",
  "botox side effects concerns",
  "med spa bad experiences",
  "weight loss clinic scams",
  "chiropractor reviews negative",
  "IV therapy worth it",
];

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
];

// ============================================================
// Types
// ============================================================

interface PainPoint {
  pain_point: string;
  frequency: "high" | "medium" | "low";
  source_count: number;
  example_quotes: string[];
  source_urls: string[];
}

interface EmotionalTrigger {
  trigger: string;
  intensity: "strong" | "moderate" | "mild";
  context: string;
}

interface MessagingAngle {
  angle: string;
  target_emotion: string;
  example_hook: string;
}

interface ResearchData {
  validated_pain_points: PainPoint[];
  emotional_triggers: EmotionalTrigger[];
  messaging_angles: MessagingAngle[];
  competitor_claims: string[];
  summary: string;
  confidence: "high" | "medium" | "low";
  sources_searched?: string[];
}

interface AdResult {
  adId: string;
  advertiserName: string;
  pageId: string;
  adBody: string;
  adTitle: string;
  adCreativeUrl: string;
  adSnapshotUrl: string;
  platform: string;
  startDate: string;
  isActive: boolean;
  category: string;
}

interface AdSearchResponse {
  ads: AdResult[];
  source: "apify" | "unavailable" | "error";
  fallbackUrl?: string;
  message?: string;
}

const frequencyColor = { high: "destructive", medium: "default", low: "secondary" } as const;
const intensityColor = { strong: "destructive", moderate: "default", mild: "secondary" } as const;

// ============================================================
// Sub-components
// ============================================================

type PainPointSearchFormValues = { query: string; clinicType: string; service: string };

function SearchForm({ onSubmit, isLoading }: { onSubmit: (data: PainPointSearchFormValues) => void; isLoading: boolean }) {
  const form = useForm<PainPointSearchFormValues>({
    resolver: zodResolver(painPointSearchRequestSchema) as any,
    defaultValues: { query: "", clinicType: "", service: "" },
  });

  const clinicType = form.watch("clinicType");
  const services = clinicType ? SERVICES_BY_CLINIC[clinicType] || [] : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What pain points do you want to research?</FormLabel>
              <FormControl>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder='e.g. "dental implant complaints" or "botox fears"' className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-2">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => form.setValue("query", chip)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clinicType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clinic Type (optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select clinic type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CLINIC_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
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
                <FormLabel>Service (optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!clinicType}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={clinicType ? "Select service" : "Select clinic type first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services.map((svc) => (
                      <SelectItem key={svc} value={svc}>{svc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto btn-gold text-white">
          {isLoading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Researching... (15-30s)</>
          ) : (
            <><Search className="w-4 h-4 mr-2" /> Research Pain Points</>
          )}
        </Button>
      </form>
    </Form>
  );
}

function PainPointCard({ point }: { point: PainPoint }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={frequencyColor[point.frequency]}>{point.frequency} frequency</Badge>
            <span className="text-xs text-slate-400">{point.source_count} sources</span>
          </div>
          <p className="font-medium text-white">{point.pain_point}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-[rgba(56,189,248,0.1)] pt-3">
          {point.example_quotes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Example quotes:</p>
              {point.example_quotes.map((q, i) => (
                <blockquote key={i} className="text-sm italic text-slate-400 border-l-2 border-[rgba(56,189,248,0.15)] pl-3 mb-2">
                  &ldquo;{q}&rdquo;
                </blockquote>
              ))}
            </div>
          )}
          {point.source_urls.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Sources:</p>
              {point.source_urls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#38bdf8] hover:underline flex items-center gap-1 mb-1">
                  <ExternalLink className="w-3 h-3" />{url.length > 60 ? url.slice(0, 60) + "..." : url}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function ResearchResults({ data, source }: { data: ResearchData; source: "web_search" | "ai_synthesis" }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant={source === "web_search" ? "default" : "secondary"}>
          {source === "web_search" ? "Web-Validated Research" : "AI-Synthesized Research"}
        </Badge>
        <Badge variant={data.confidence === "high" ? "default" : data.confidence === "medium" ? "secondary" : "outline"}>
          {data.confidence} confidence
        </Badge>
      </div>

      <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6 border-[rgba(56,189,248,0.15)]">
        <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#38bdf8]" /> Executive Summary</h3>
        <p className="text-sm text-slate-400 whitespace-pre-line">{data.summary}</p>
      </Card>

      <div>
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" /> Validated Pain Points ({data.validated_pain_points?.length || 0})
        </h3>
        <div className="space-y-3">
          {data.validated_pain_points?.map((point, i) => (
            <PainPointCard key={i} point={point} />
          ))}
        </div>
      </div>

      {data.emotional_triggers?.length > 0 && (
        <div>
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" /> Emotional Triggers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.emotional_triggers.map((trigger, i) => (
              <Card key={i} className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">{trigger.trigger}</span>
                  <Badge variant={intensityColor[trigger.intensity]}>{trigger.intensity}</Badge>
                </div>
                <p className="text-sm text-slate-400">{trigger.context}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {data.messaging_angles?.length > 0 && (
        <div>
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#38bdf8]" /> Messaging Angles
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {data.messaging_angles.map((angle, i) => (
              <Card key={i} className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6">
                <div className="flex-1">
                  <p className="font-medium text-white">{angle.angle}</p>
                  <p className="text-xs text-slate-400 mt-1">Target emotion: {angle.target_emotion}</p>
                  <p className="text-sm text-white mt-2 bg-[#162040] rounded px-3 py-2 italic">&ldquo;{angle.example_hook}&rdquo;</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {data.competitor_claims?.length > 0 && (
        <div>
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-500" /> What Competitors Are Saying
          </h3>
          <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6">
            <ul className="space-y-2">
              {data.competitor_claims.map((claim, i) => (
                <li key={i} className="text-sm text-white flex items-start gap-2">
                  <span className="text-slate-400">&bull;</span>
                  {claim}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

function ResearchHistory({ onSelect }: { onSelect: (session: ResearchSession) => void }) {
  const { data: sessions, isLoading } = useQuery<ResearchSession[]>({
    queryKey: ["/api/research/sessions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/research/sessions?limit=10");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/research/sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research/sessions"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6 text-center text-slate-400 text-sm">
        No research sessions yet. Run your first search above.
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
        <Clock className="w-4 h-4" /> Recent Research
      </h3>
      {sessions.map((session) => (
        <Card key={session.id} className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6 flex items-center justify-between gap-3 hover:bg-[#162040] transition-colors cursor-pointer">
          <button className="flex-1 text-left flex items-center gap-3" onClick={() => onSelect(session)}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.query}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {session.clinicType && <span className="text-xs text-slate-400">{session.clinicType}</span>}
                <Badge variant={session.status === "complete" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                  {session.status}
                </Badge>
                <Badge variant={session.source === "web_search" ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
                  {session.source === "web_search" ? "Web" : "AI"}
                </Badge>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(session.id); }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-3 h-3 text-slate-400" />
          </Button>
        </Card>
      ))}
    </div>
  );
}

function AdLibrarySearch({ onSaveAd, savedAdIds }: { onSaveAd: (ad: AdResult) => void; savedAdIds: Set<string> }) {
  const { toast } = useToast();
  const [results, setResults] = useState<AdSearchResponse | null>(null);

  const form = useForm<AdLibrarySearchRequest>({
    resolver: zodResolver(adLibrarySearchRequestSchema) as any,
    defaultValues: { searchTerms: "", country: "US", adType: "all", activeStatus: "active" },
  });

  const searchMutation = useMutation({
    mutationFn: async (data: AdLibrarySearchRequest) => {
      const res = await apiRequest("POST", "/api/research/ad-library/search", data);
      return res.json() as Promise<AdSearchResponse>;
    },
    onSuccess: (data) => {
      setResults(data);
      if (data.source === "unavailable") {
        toast({ title: "Apify not configured", description: "Opening Facebook Ad Library in a new tab instead." });
        if (data.fallbackUrl) {
          window.open(data.fallbackUrl, "_blank");
        }
      }
    },
    onError: (err: Error) => {
      toast({ title: "Search failed", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((d) => searchMutation.mutate(d))} className="space-y-4">
          <FormField
            control={form.control}
            name="searchTerms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search competitor ads</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder='e.g. "dental implants near me" or competitor name' className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activeStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active only</SelectItem>
                      <SelectItem value="all">All ads</SelectItem>
                      <SelectItem value="inactive">Inactive only</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="flex items-end">
              <Button type="submit" disabled={searchMutation.isPending} className="w-full">
                {searchMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...</>
                ) : (
                  <><Search className="w-4 h-4 mr-2" /> Search Ads</>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {results && results.source === "apify" && (
        <div>
          <p className="text-sm text-slate-400 mb-3">{results.ads.length} ads found</p>
          {results.ads.length === 0 ? (
            <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-8 text-center text-slate-400">
              <p>No ads found for this search. Try different keywords.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.ads.map((ad) => (
                <AdCard key={ad.adId || ad.advertiserName + ad.adTitle} ad={ad} onSave={onSaveAd} isSaved={savedAdIds.has(ad.adId)} />
              ))}
            </div>
          )}
        </div>
      )}

      {results && results.source === "error" && (
        <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6 text-center space-y-3">
          <p className="text-sm text-slate-400">{results.message}</p>
          {results.fallbackUrl && (
            <Button variant="outline" asChild>
              <a href={results.fallbackUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" /> Open Facebook Ad Library
              </a>
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}

function AdCard({ ad, onSave, isSaved }: { ad: AdResult; onSave: (ad: AdResult) => void; isSaved: boolean }) {
  return (
    <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6 flex flex-col gap-3">
      {ad.adCreativeUrl ? (
        <div className="aspect-video bg-[#162040] rounded-lg overflow-hidden">
          <img src={ad.adCreativeUrl} alt="Ad creative" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-video bg-[#162040] rounded-lg flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-slate-400" />
        </div>
      )}

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-white truncate">{ad.advertiserName}</span>
          <Badge variant={ad.isActive ? "default" : "secondary"}>{ad.isActive ? "Active" : "Inactive"}</Badge>
        </div>
        {ad.adTitle && <p className="text-sm font-medium text-white">{ad.adTitle}</p>}
        {ad.adBody && <p className="text-xs text-slate-400 line-clamp-3">{ad.adBody}</p>}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {ad.platform && <span>{ad.platform}</span>}
          {ad.startDate && <span>Started: {ad.startDate}</span>}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onSave(ad)} disabled={isSaved}>
          <Bookmark className={`w-3 h-3 mr-1 ${isSaved ? "fill-current" : ""}`} />
          {isSaved ? "Saved" : "Save"}
        </Button>
        {ad.adSnapshotUrl && (
          <Button variant="ghost" size="sm" asChild>
            <a href={ad.adSnapshotUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        )}
      </div>
    </Card>
  );
}

function SavedAdCard({
  ad, onDelete, onUpdateNotes, onUpdateTags, isDeleting,
}: {
  ad: SavedAd;
  onDelete: () => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateTags: (tags: string[]) => void;
  isDeleting: boolean;
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(ad.notes || "");
  const [tagInput, setTagInput] = useState("");

  return (
    <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6 space-y-3">
      {ad.adCreativeUrl ? (
        <div className="aspect-video bg-[#162040] rounded-lg overflow-hidden">
          <img src={ad.adCreativeUrl} alt="Ad creative" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-video bg-[#162040] rounded-lg flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-slate-400" />
        </div>
      )}

      <div>
        <p className="font-medium text-sm text-white">{ad.advertiserName}</p>
        {ad.adTitle && <p className="text-sm text-white">{ad.adTitle}</p>}
        {ad.adBody && <p className="text-xs text-slate-400 line-clamp-3">{ad.adBody}</p>}
      </div>

      <div className="flex flex-wrap gap-1">
        {ad.tags?.map((tag) => (
          <Badge key={tag} variant="outline" className="text-[10px]">
            <Tag className="w-2.5 h-2.5 mr-1" />{tag}
          </Badge>
        ))}
        <div className="flex items-center gap-1">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tag..."
            className="h-6 text-xs w-20"
            onKeyDown={(e) => {
              if (e.key === "Enter" && tagInput.trim()) {
                e.preventDefault();
                onUpdateTags([...(ad.tags || []), tagInput.trim()]);
                setTagInput("");
              }
            }}
          />
        </div>
      </div>

      {editingNotes ? (
        <div className="space-y-2">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="text-xs" placeholder="Add notes..." />
          <div className="flex gap-2">
            <Button size="sm" variant="default" className="btn-gold text-white" onClick={() => { onUpdateNotes(notes); setEditingNotes(false); }}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingNotes(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1" onClick={() => setEditingNotes(true)}>
          <StickyNote className="w-3 h-3" /> {ad.notes ? ad.notes : "Add notes..."}
        </button>
      )}

      <Button variant="ghost" size="sm" onClick={onDelete} disabled={isDeleting} className="text-red-600 hover:text-red-700">
        <Trash2 className="w-3 h-3 mr-1" /> Remove
      </Button>
    </Card>
  );
}

function SavedAdsList() {
  const { data: ads, isLoading } = useQuery<SavedAd[]>({
    queryKey: ["/api/research/saved-ads"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/research/saved-ads");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/research/saved-ads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research/saved-ads"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, notes, tags }: { id: string; notes?: string; tags?: string[] }) => {
      const res = await apiRequest("PATCH", `/api/research/saved-ads/${id}`, { notes, tags });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research/saved-ads"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ads || ads.length === 0) {
    return (
      <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6 text-center text-slate-400 text-sm">
        No saved ads yet. Search the Ad Library and save ads you find interesting.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-slate-400">Saved Ads ({ads.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ads.map((ad) => (
          <SavedAdCard
            key={ad.id}
            ad={ad}
            onDelete={() => deleteMutation.mutate(ad.id)}
            onUpdateNotes={(notes) => updateMutation.mutate({ id: ad.id, notes })}
            onUpdateTags={(tags) => updateMutation.mutate({ id: ad.id, tags })}
            isDeleting={deleteMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function ResearchPortal() {
  const { toast } = useToast();
  const [activeSession, setActiveSession] = useState<ResearchSession | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);

  const { data: savedAds } = useQuery<SavedAd[]>({
    queryKey: ["/api/research/saved-ads"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/research/saved-ads");
      return res.json();
    },
  });

  const savedAdIds = new Set((savedAds || []).map((a) => a.adId).filter(Boolean) as string[]);

  const researchMutation = useMutation<{ session: ResearchSession; source: string }, Error, PainPointSearchRequest>({
    mutationFn: async (data) => {
      setLoadingStage(0);
      const interval = setInterval(() => {
        setLoadingStage((prev) => Math.min(prev + 1, LOADING_STAGES.length - 1));
      }, 5000);

      try {
        const res = await apiRequest("POST", "/api/research/pain-points", data);
        return res.json() as Promise<{ session: ResearchSession; source: string }>;
      } finally {
        clearInterval(interval);
      }
    },
    onSuccess: (data) => {
      setActiveSession(data.session);
      queryClient.invalidateQueries({ queryKey: ["/api/research/sessions"] });
      toast({ title: "Research complete", description: `Found ${(data.session.results as any)?.validated_pain_points?.length || 0} pain points` });
    },
    onError: (err: Error) => {
      toast({ title: "Research failed", description: err.message, variant: "destructive" });
    },
  });

  const saveAdMutation = useMutation({
    mutationFn: async (ad: AdResult) => {
      const res = await apiRequest("POST", "/api/research/saved-ads", {
        adId: ad.adId,
        advertiserName: ad.advertiserName,
        pageId: ad.pageId,
        adBody: ad.adBody,
        adTitle: ad.adTitle,
        adCreativeUrl: ad.adCreativeUrl,
        adSnapshotUrl: ad.adSnapshotUrl,
        platform: ad.platform,
        startDate: ad.startDate,
        isActive: ad.isActive,
        category: ad.category,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research/saved-ads"] });
      toast({ title: "Ad saved" });
    },
  });

  const handleSelectSession = useCallback((session: ResearchSession) => {
    setActiveSession(session);
  }, []);

  return (
    <ScrollArea className="h-full">
      <div className="max-w-5xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[rgba(56,189,248,0.08)] flex items-center justify-center">
              <Search className="w-5 h-5 text-[#38bdf8]" />
            </div>
            <div>
              <h1 className="gradient-text text-2xl font-bold tracking-tight">Research Portal</h1>
              <p className="text-sm text-slate-400">Validate pain points from real sources & browse competitor ads</p>
            </div>
            <Badge variant="outline" className="ml-auto">M0</Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pain-points" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pain-points" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Pain Point Research
            </TabsTrigger>
            <TabsTrigger value="ad-library" className="flex items-center gap-2">
              <Library className="w-4 h-4" /> Ad Library
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Pain Point Research */}
          <TabsContent value="pain-points" className="space-y-6">
            <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6">
              <SearchForm onSubmit={(d) => researchMutation.mutate(d)} isLoading={researchMutation.isPending} />
            </Card>

            {researchMutation.isPending && (
              <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-8 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[rgba(56,189,248,0.08)] mx-auto">
                  <Search className="w-8 h-8 text-[#38bdf8] animate-pulse" />
                </div>
                <div>
                  <p className="font-medium text-white">{LOADING_STAGES[loadingStage]}</p>
                  <p className="text-sm text-slate-400 mt-1">This takes 15-30 seconds as we search real sources</p>
                </div>
                <div className="flex justify-center gap-1">
                  {LOADING_STAGES.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i <= loadingStage ? "bg-[#38bdf8]" : "bg-[rgba(56,189,248,0.1)]"}`} />
                  ))}
                </div>
              </Card>
            )}

            {activeSession?.results && !researchMutation.isPending ? (
              <ResearchResults
                data={activeSession.results as unknown as ResearchData}
                source={(activeSession.source as "web_search" | "ai_synthesis") || "ai_synthesis"}
              />
            ) : null}

            <ResearchHistory onSelect={handleSelectSession} />
          </TabsContent>

          {/* Tab 2: Ad Library */}
          <TabsContent value="ad-library" className="space-y-6">
            <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6">
              <AdLibrarySearch onSaveAd={(ad) => saveAdMutation.mutate(ad)} savedAdIds={savedAdIds} />
            </Card>

            <SavedAdsList />
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
