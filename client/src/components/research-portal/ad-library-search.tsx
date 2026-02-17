import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adLibrarySearchRequestSchema, type AdLibrarySearchRequest } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Search, Loader2, ExternalLink, Bookmark, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
];

interface AdLibrarySearchProps {
  onSaveAd: (ad: AdResult) => void;
  savedAdIds: Set<string>;
}

export function AdLibrarySearch({ onSaveAd, savedAdIds }: AdLibrarySearchProps) {
  const { toast } = useToast();
  const [results, setResults] = useState<AdSearchResponse | null>(null);

  const form = useForm<AdLibrarySearchRequest>({
    resolver: zodResolver(adLibrarySearchRequestSchema),
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
        toast({
          title: "Apify not configured",
          description: "Opening Facebook Ad Library in a new tab instead.",
        });
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

      {/* Results */}
      {results && results.source === "apify" && (
        <div>
          <p className="text-sm text-muted-foreground mb-3">{results.ads.length} ads found</p>
          {results.ads.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No ads found for this search. Try different keywords.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.ads.map((ad) => (
                <AdCard key={ad.adId || ad.advertiserName + ad.adTitle} ad={ad} onSave={onSaveAd} isSaved={savedAdIds.has(ad.adId)} />
              ))}
            </div>
          )}
        </div>
      )}

      {results && results.source === "error" && (
        <Card className="p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">{results.message}</p>
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
    <Card className="p-4 flex flex-col gap-3">
      {/* Creative preview */}
      {ad.adCreativeUrl ? (
        <div className="aspect-video bg-muted rounded-md overflow-hidden">
          <img src={ad.adCreativeUrl} alt="Ad creative" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm truncate">{ad.advertiserName}</span>
          <Badge variant={ad.isActive ? "default" : "secondary"}>{ad.isActive ? "Active" : "Inactive"}</Badge>
        </div>
        {ad.adTitle && <p className="text-sm font-medium">{ad.adTitle}</p>}
        {ad.adBody && <p className="text-xs text-muted-foreground line-clamp-3">{ad.adBody}</p>}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {ad.platform && <span>{ad.platform}</span>}
          {ad.startDate && <span>Started: {ad.startDate}</span>}
        </div>
      </div>

      {/* Actions */}
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
