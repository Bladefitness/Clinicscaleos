import { Link } from "wouter";
import { Package, Search, Users, FileText, Map, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface OfferSummary {
  clinicType: string;
  service: string;
  location: string;
  offerDetails?: string;
}

interface PipelineViewProps {
  offer?: OfferSummary | null;
  researchSummary?: string | null;
  avatars: Array<{ name: string; situation?: string }>;
  creativeCount: number;
  imageUrls: Record<number, string>;
}

export function PipelineView({
  offer,
  researchSummary,
  avatars,
  creativeCount,
  imageUrls,
}: PipelineViewProps) {
  const thumbnails = Object.entries(imageUrls)
    .slice(0, 6)
    .map(([i, url]) => ({ index: Number(i), url }));

  return (
    <Card className="p-5 mb-6 overflow-hidden shadow-sm border-border/80">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-4">Your Launch Pipeline</p>
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-4 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
        {/* Offer */}
        <div className="flex items-start gap-2 min-w-0 sm:flex-1">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground">Offer</p>
            <p className="text-xs text-muted-foreground truncate" title={offer ? `${offer.clinicType} — ${offer.service}` : undefined}>
              {offer ? `${offer.clinicType} · ${offer.service} in ${offer.location}` : "—"}
            </p>
            {offer?.offerDetails && (
              <p className="text-[10px] text-muted-foreground/80 truncate mt-0.5" title={offer.offerDetails}>
                {offer.offerDetails}
              </p>
            )}
          </div>
          <span className="text-slate-300 dark:text-slate-600 sm:hidden">→</span>
        </div>

        <span className="hidden sm:inline text-slate-300 dark:text-slate-600 self-center flex-shrink-0">→</span>

        {/* Research */}
        <div className="flex items-start gap-2 min-w-0 sm:flex-1">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Search className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground">Research</p>
            <p className="text-xs text-muted-foreground line-clamp-2" title={researchSummary || undefined}>
              {researchSummary || "—"}
            </p>
          </div>
          <span className="text-slate-300 dark:text-slate-600 sm:hidden">→</span>
        </div>

        <span className="hidden sm:inline text-slate-300 dark:text-slate-600 self-center flex-shrink-0">→</span>

        {/* Avatars */}
        <div className="flex items-start gap-2 min-w-0 sm:flex-1">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground">Avatars</p>
            <p className="text-xs text-muted-foreground truncate" title={avatars.map((a) => a.name).join(", ") || undefined}>
              {avatars.length > 0 ? avatars.map((a) => a.name).join(", ") : "—"}
            </p>
          </div>
          <span className="text-slate-300 dark:text-slate-600 sm:hidden">→</span>
        </div>

        <span className="hidden sm:inline text-slate-300 dark:text-slate-600 self-center flex-shrink-0">→</span>

        {/* Creatives */}
        <div className="flex items-start gap-2 min-w-0 sm:flex-1">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground">Creatives</p>
            <div className="flex items-center gap-1 mt-1">
              {thumbnails.length > 0 ? (
                thumbnails.map(({ index, url }) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded overflow-hidden flex-shrink-0 border border-border"
                    title={`Creative #${index + 1}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">{creativeCount} generated</span>
              )}
            </div>
          </div>
          <span className="text-slate-300 dark:text-slate-600 sm:hidden">→</span>
        </div>

        <span className="hidden sm:inline text-slate-300 dark:text-slate-600 self-center flex-shrink-0">→</span>

        {/* Campaign */}
        <div className="flex items-start gap-2 min-w-0 sm:flex-1">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Map className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground mb-1.5">Campaign</p>
            <Link href="/campaign-hq">
              <Button variant="default" size="sm" className="text-xs gap-1.5 h-7">
                Go to Campaign HQ
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
