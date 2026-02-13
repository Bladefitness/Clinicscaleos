import { useState, useMemo, useCallback, useRef } from "react";
import {
  FileText,
  Users,
  Heart,
  Palette,
  Download,
  RotateCcw,
  X,
  Sparkles,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreativeCard } from "./creative-card";
import { CopyButton } from "./copy-button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
export interface DisplayCreative {
  avatar: string;
  emotion: string;
  style: string;
  headline: string;
  primary_text: string;
  image_prompt: string;
  hook: string;
  category: string;
  [key: string]: any;
}

interface ResultsGridProps {
  creatives: DisplayCreative[];
  onReset: () => void;
}

export function ResultsGrid({ creatives, onReset }: ResultsGridProps) {
  const { toast } = useToast();
  const [avatarFilter, setAvatarFilter] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const [generatingImages, setGeneratingImages] = useState<Set<number>>(new Set());
  const [bulkProgress, setBulkProgress] = useState<{ total: number; done: number; failed: number } | null>(null);
  const isBulkRef = useRef(false);

  const avatars = useMemo(() => {
    const set = new Set(creatives.map((c) => c.avatar));
    return Array.from(set);
  }, [creatives]);

  const emotions = useMemo(() => new Set(creatives.map((c) => c.emotion)).size, [creatives]);
  const styles = useMemo(() => new Set(creatives.map((c) => c.style)).size, [creatives]);

  const filtered = avatarFilter
    ? creatives.filter((c) => c.avatar === avatarFilter)
    : creatives;

  const allCreativesText = creatives
    .map(
      (c, i) =>
        `#${i + 1} - ${c.avatar}\nHeadline: ${c.headline}\nCopy: ${c.primary_text}\nHook: ${c.hook}\nEmotion: ${c.emotion} | Style: ${c.style}\nImage Prompt: ${c.image_prompt}\n`
    )
    .join("\n---\n\n");

  const handleExport = () => {
    const blob = new Blob([allCreativesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ad-creatives.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateSingleImage = useCallback(async (prompt: string, index: number) => {
    setGeneratingImages((prev) => new Set(prev).add(index));
    try {
      const res = await apiRequest("POST", "/api/generate-image", { prompt });
      const data = await res.json();
      if (data.imageUrl) {
        setImageUrls((prev) => ({ ...prev, [index]: data.imageUrl }));
        return true;
      }
    } catch (err) {
      console.error(`Image generation failed for creative ${index}:`, err);
      if (!isBulkRef.current) {
        toast({
          title: "Image generation failed",
          description: "The AI couldn't generate this image. Try again or adjust the prompt.",
          variant: "destructive",
        });
      }
    } finally {
      setGeneratingImages((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
    return false;
  }, []);

  const handleBulkGenerate = useCallback(async () => {
    const indicesToGenerate = creatives
      .map((_, i) => i)
      .filter((i) => !imageUrls[i]);

    if (indicesToGenerate.length === 0) return;

    isBulkRef.current = true;
    setBulkProgress({ total: indicesToGenerate.length, done: 0, failed: 0 });

    for (const idx of indicesToGenerate) {
      const success = await generateSingleImage(creatives[idx].image_prompt, idx);
      setBulkProgress((prev) => prev ? {
        ...prev,
        done: prev.done + 1,
        failed: prev.failed + (success ? 0 : 1),
      } : null);
    }

    isBulkRef.current = false;
    setTimeout(() => setBulkProgress(null), 3000);
  }, [creatives, imageUrls, generateSingleImage]);

  const generatedCount = Object.keys(imageUrls).length;
  const isBulkGenerating = bulkProgress !== null && bulkProgress.done < bulkProgress.total;

  const stats = [
    { label: "Total Creatives", value: creatives.length, icon: FileText, color: "text-emerald-500" },
    { label: "Avatars", value: avatars.length, icon: Users, color: "text-blue-500" },
    { label: "Emotions", value: emotions, icon: Heart, color: "text-rose-500" },
    { label: "Images Generated", value: generatedCount, icon: ImageIcon, color: "text-violet-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-results-title">
          Your Ad Creatives{" "}
          <span className="text-muted-foreground font-normal text-lg">({creatives.length})</span>
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="default"
            size="sm"
            onClick={handleBulkGenerate}
            disabled={isBulkGenerating || generatedCount === creatives.length}
            className="text-xs gap-1.5"
            data-testid="button-bulk-generate"
          >
            {isBulkGenerating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {isBulkGenerating
              ? `Generating ${bulkProgress!.done}/${bulkProgress!.total}...`
              : generatedCount === creatives.length
                ? "All Images Generated"
                : `Generate All Images (${creatives.length - generatedCount})`
            }
          </Button>
          <CopyButton text={allCreativesText} label="Copy All" variant="outline" />
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs gap-1.5" data-testid="button-export">
            <Download className="w-3 h-3" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onReset} className="text-xs gap-1.5" data-testid="button-new-run">
            <RotateCcw className="w-3 h-3" />
            New Run
          </Button>
        </div>
      </div>

      {bulkProgress && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {bulkProgress.done < bulkProgress.total ? (
                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-emerald-500" />
              )}
              <span className="text-sm font-medium text-foreground">
                {bulkProgress.done < bulkProgress.total
                  ? `Generating images... ${bulkProgress.done} of ${bulkProgress.total}`
                  : `Done! ${bulkProgress.total - bulkProgress.failed} of ${bulkProgress.total} images generated`
                }
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round((bulkProgress.done / bulkProgress.total) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500 ease-out"
              style={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }}
              data-testid="progress-bulk-images"
            />
          </div>
          {bulkProgress.failed > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              {bulkProgress.failed} image{bulkProgress.failed > 1 ? "s" : ""} failed to generate. You can retry individually.
            </p>
          )}
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground" data-testid={`stat-${stat.label}`}>{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 flex-wrap">
        <button
          onClick={() => setAvatarFilter(null)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            !avatarFilter
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground"
          }`}
          data-testid="button-filter-all"
        >
          All ({creatives.length})
        </button>
        {avatars.map((avatar) => (
          <button
            key={avatar}
            onClick={() => setAvatarFilter(avatar === avatarFilter ? null : avatar)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              avatarFilter === avatar
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`button-filter-${avatar}`}
          >
            {avatar} ({creatives.filter((c) => c.avatar === avatar).length})
          </button>
        ))}
        {avatarFilter && (
          <button
            onClick={() => setAvatarFilter(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
            data-testid="button-clear-filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((creative, i) => {
          const globalIndex = creatives.indexOf(creative);
          return (
            <CreativeCard
              key={`${creative.id}-${creative.avatar}-${i}`}
              creative={creative}
              index={globalIndex}
              imageUrl={imageUrls[globalIndex]}
              isGeneratingImage={generatingImages.has(globalIndex)}
              onGenerateImage={isBulkGenerating ? undefined : generateSingleImage}
            />
          );
        })}
      </div>
    </div>
  );
}
