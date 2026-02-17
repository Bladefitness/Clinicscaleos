import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, BookOpen, Library } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchForm } from "@/components/research-portal/search-form";
import { ResearchResults } from "@/components/research-portal/research-results";
import { ResearchHistory } from "@/components/research-portal/research-history";
import { AdLibrarySearch } from "@/components/research-portal/ad-library-search";
import { SavedAdsList } from "@/components/research-portal/saved-ads-list";
import type { PainPointSearchRequest, ResearchSession, SavedAd } from "@shared/schema";

const LOADING_STAGES = [
  "Searching Reddit, forums, and review sites...",
  "Analyzing patient complaints and frustrations...",
  "Identifying emotional triggers...",
  "Synthesizing messaging angles...",
  "Compiling research report...",
];

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
      // Cycle through loading stages
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
    mutationFn: async (ad: any) => {
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
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Research Portal</h1>
              <p className="text-sm text-muted-foreground">Validate pain points from real sources & browse competitor ads</p>
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
            <>
              <Card className="p-6">
                <SearchForm onSubmit={(d) => researchMutation.mutate(d)} isLoading={researchMutation.isPending} />
              </Card>

              {/* Loading state */}
              {researchMutation.isPending ? (
                <Card className="p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
                    <Search className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <div>
                    <p className="font-medium">{LOADING_STAGES[loadingStage]}</p>
                    <p className="text-sm text-muted-foreground mt-1">This takes 15-30 seconds as we search real sources</p>
                  </div>
                  <div className="flex justify-center gap-1">
                    {LOADING_STAGES.map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i <= loadingStage ? "bg-primary" : "bg-muted"}`} />
                    ))}
                  </div>
                </Card>
              ) : null}

              {/* Results */}
              {activeSession?.results && !researchMutation.isPending ? (
                <ResearchResults
                  data={activeSession.results as any}
                  source={(activeSession.source as "web_search" | "ai_synthesis") || "ai_synthesis"}
                />
              ) : null}

              {/* History */}
              <ResearchHistory onSelect={handleSelectSession} />
            </>
          </TabsContent>

          {/* Tab 2: Ad Library */}
          <TabsContent value="ad-library" className="space-y-6">
            <Card className="p-6">
              <AdLibrarySearch onSaveAd={(ad) => saveAdMutation.mutate(ad)} savedAdIds={savedAdIds} />
            </Card>

            <SavedAdsList />
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
