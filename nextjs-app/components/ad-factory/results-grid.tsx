"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import JSZip from "jszip";
import Link from "next/link";
import {
  FileText,
  Users,
  Heart,
  Download,
  RotateCcw,
  X,
  Sparkles,
  ImageIcon,
  Loader2,
  Archive,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreativeCard } from "./creative-card";
import type { EditorLayer } from "@/lib/db/schema";
import { CopyButton } from "./copy-button";
import { PipelineView, type OfferSummary } from "./pipeline-view";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  research?: { summary: string } | null;
  avatars?: Array<{ name: string; situation?: string; emotions?: object }>;
  offerSummary?: OfferSummary | null;
  initialImageUrls?: Record<number, string>;
  onReplaceCreative?: (index: number, updates: Partial<DisplayCreative>) => void;
  onSaveEditedImage?: (index: number, compositeDataUrl: string, layers: EditorLayer[]) => void;
}

export function ResultsGrid({ creatives, onReset, research, avatars: avatarList, offerSummary, initialImageUrls = {}, onReplaceCreative, onSaveEditedImage }: ResultsGridProps) {
  const { toast } = useToast();
  const [avatarFilter, setAvatarFilter] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const [editorLayersByIndex, setEditorLayersByIndex] = useState<Record<number, EditorLayer[]>>({});
  const [improvingIndex, setImprovingIndex] = useState<number | null>(null);
  const [improvedResult, setImprovedResult] = useState<{ headline: string; primary_text: string; hook: string; changes_summary?: string } | null>(null);
  const [showImproveDialog, setShowImproveDialog] = useState(false);
  const [improveStep, setImproveStep] = useState<"feedback" | "result">("feedback");
  const [improveFeedback, setImproveFeedback] = useState("");
  const [improveLoading, setImproveLoading] = useState(false);
  const [animateModel, setAnimateModel] = useState<"kling" | "pika" | "minimax" | "kling3" | "veo2">("kling");

  const handleSaveEditedImage = useCallback(
    (index: number, compositeDataUrl: string, layers: EditorLayer[]) => {
      setImageUrls((prev) => ({ ...prev, [index]: compositeDataUrl }));
      setEditorLayersByIndex((prev) => ({ ...prev, [index]: layers }));
      onSaveEditedImage?.(index, compositeDataUrl, layers);
    },
    [onSaveEditedImage]
  );

  // Merge inline images from API response
  useEffect(() => {
    if (Object.keys(initialImageUrls).length > 0) {
      setImageUrls((prev) => ({ ...prev, ...initialImageUrls }));
    }
  }, [initialImageUrls]);
  const [builtPrompts, setBuiltPrompts] = useState<Record<number, string>>({});
  const [generatingImages, setGeneratingImages] = useState<Set<number>>(new Set());
  const [bulkProgress, setBulkProgress] = useState<{ total: number; done: number; failed: number } | null>(null);
  const [showWhy, setShowWhy] = useState(false);
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
        `#${i + 1} - ${c.avatar}\nHeadline: ${c.headline}\nCopy: ${c.primary_text}\nHook: ${c.hook}\nEmotion: ${c.emotion} | Style: ${c.style}\nImage Prompt (export-ready): ${builtPrompts[i] ?? c.image_prompt}\n`
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

  function sanitizeForFilename(s: string): string {
    return String(s || "")
      .replace(/[/\\?*:|<>]/g, "-")
      .replace(/\s+/g, " ")
      .trim() || "Uncategorized";
  }

  function escapeCsv(s: string): string {
    if (!s) return "";
    const t = String(s).replace(/"/g, '""');
    return t.includes(",") || t.includes('"') || t.includes("\n") ? `"${t}"` : t;
  }

  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const handleDownloadAllImages = useCallback(async () => {
    const indicesWithImages = Object.keys(imageUrls).map(Number).filter((i) => imageUrls[i]);
    if (indicesWithImages.length === 0) {
      toast({ title: "No images to download", description: "Generate images first.", variant: "destructive" });
      return;
    }
    setIsDownloadingZip(true);
    toast({
      title: "Preparing download...",
      description: `Building ZIP with ${indicesWithImages.length} images`,
    });
    try {
      const zip = new JSZip();
      const runId = new Date().toISOString().slice(0, 10);
      const root = zip.folder(`ad-creatives-${runId}`);
      if (!root) throw new Error("Could not create ZIP folder");

      const manifestRows: string[][] = [
        ["filename", "style", "avatar", "emotion", "headline", "hook", "primary_text", "image_prompt"],
      ];
      let added = 0;
      const styleCounts: Record<string, number> = {};
      const byStyle = new Map<string, { creative: DisplayCreative; index: number; url: string }[]>();
      for (const i of indicesWithImages) {
        const creative = creatives[i];
        const url = imageUrls[i];
        if (!creative || !url) continue;
        const style = sanitizeForFilename(creative.style);
        if (!byStyle.has(style)) byStyle.set(style, []);
        byStyle.get(style)!.push({ creative, index: i, url });
      }
      for (const [style, items] of Array.from(byStyle.entries())) {
        const styleFolder = root.folder(style);
        if (!styleFolder) continue;
        items.sort((a: { index: number }, b: { index: number }) => a.index - b.index);
        for (const { creative, index, url } of items) {
          const idx = (styleCounts[style] = (styleCounts[style] ?? 0) + 1);
          const pad = String(idx).padStart(2, "0");
          const name = `${pad}-${sanitizeForFilename(creative.avatar)}-${sanitizeForFilename(creative.emotion)}.png`;
          const relPath = `${style}/${name}`;
          const base64 = url.replace(/^data:image\/\w+;base64,/, "");
          try {
            styleFolder.file(name, base64, { base64: true });
            manifestRows.push([
              relPath,
              creative.style,
              creative.avatar,
              creative.emotion,
              creative.headline,
              creative.hook,
              creative.primary_text,
              builtPrompts[index] ?? creative.image_prompt,
            ].map(escapeCsv));
            added++;
          } catch {
            /* skip failed image */
          }
        }
      }
      const manifestCsv = manifestRows.map((r) => r.join(",")).join("\n");
      root.file("manifest.csv", manifestCsv);
      root.file("ad-creatives.txt", allCreativesText);
      const readme = `# Ad Creative Library

## Image Specs
- Format: PNG
- Aspect ratio: 4:5 (optimized for Facebook/Instagram feed)
- Style-aware: Pattern Interrupt, Breaking News, etc. include layout elements

## Contents
- manifest.csv — Maps each image to its copy (headline, hook, primary text, image_prompt)
- ad-creatives.txt — Full copy + export-ready image prompts for all creatives
- Folders — Images organized by style (Pattern Interrupt, Breaking News, etc.)

## Usage
1. Use manifest.csv to match images with their ad copy
2. image_prompt column contains export-ready prompts for Lovart, Midjourney, or other platforms
3. Upload images to Meta Ads Manager or your ad platform
4. Pair each image with the headline and primary text from the manifest
`;
      root.file("README.md", readme);

      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `ad-creatives-${runId}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
      const folderCount = Array.from(byStyle.keys()).length;
      toast({
        title: "Download complete",
        description: `${added} images in ${folderCount} folders`,
      });
    } catch (err) {
      console.error("ZIP download failed:", err);
      toast({
        title: "Download failed",
        description: String((err as Error)?.message || "Could not create ZIP"),
        variant: "destructive",
      });
    } finally {
      setIsDownloadingZip(false);
    }
  }, [creatives, imageUrls, builtPrompts, allCreativesText, toast]);

  const lastErrorRef = useRef<string | null>(null);

  const generateSingleImage = useCallback(async (creative: DisplayCreative, index: number) => {
    setGeneratingImages((prev) => new Set(prev).add(index));
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: creative.image_prompt,
          style: creative.style,
          avatar: creative.avatar,
          emotion: creative.emotion,
          headline: creative.headline,
          hook: creative.hook,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.imageUrl) {
        setImageUrls((prev) => ({ ...prev, [index]: data.imageUrl }));
        if (typeof data.prompt === "string") {
          setBuiltPrompts((prev) => ({ ...prev, [index]: data.prompt }));
        }
        return true;
      }
    } catch (err: any) {
      const details = err?.message || "Image generation failed";
      lastErrorRef.current = details;
      console.error(`Image generation failed for creative ${index}:`, err);
      if (!isBulkRef.current) {
        toast({
          title: "Image generation failed",
          description: typeof details === "string" && details.length < 120 ? details : "Check your Gemini API key at aistudio.google.com/apikey",
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
  }, [toast]);

  const handleBulkGenerate = useCallback(async () => {
    const BATCH_SIZE = 5; // Parallel requests per batch (Tier 1)
    const indicesToGenerate = creatives
      .map((_, i) => i)
      .filter((i) => !imageUrls[i]);

    if (indicesToGenerate.length === 0) return;

    isBulkRef.current = true;
    lastErrorRef.current = null;
    setBulkProgress({ total: indicesToGenerate.length, done: 0, failed: 0 });
    let failedCount = 0;

    for (let i = 0; i < indicesToGenerate.length; i += BATCH_SIZE) {
      const batch = indicesToGenerate.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((idx) => generateSingleImage(creatives[idx], idx)),
      );
      const batchFailures = results.filter(
        (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value),
      ).length;
      failedCount += batchFailures;
      setBulkProgress((prev) =>
        prev
          ? {
              ...prev,
              done: prev.done + batch.length,
              failed: prev.failed + batchFailures,
            }
          : null,
      );
      // Brief delay between batches to avoid rate limits
      if (i + BATCH_SIZE < indicesToGenerate.length) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    isBulkRef.current = false;
    if (failedCount > 0) {
      const msg = String(lastErrorRef.current || "");
      if (msg) {
        toast({
          title: `${failedCount} image(s) failed`,
          description: msg.slice(0, 120) + (msg.length > 120 ? "…" : ""),
          variant: "destructive",
        });
      }
    }
    setTimeout(() => setBulkProgress(null), 3000);
  }, [creatives, imageUrls, generateSingleImage, toast]);

  const handleImproveClick = useCallback((_creative: DisplayCreative, index: number) => {
    setImprovingIndex(index);
    setImproveFeedback("");
    setImproveStep("feedback");
    setImprovedResult(null);
    setShowImproveDialog(true);
  }, []);

  const handleGetImprovement = useCallback(async () => {
    if (improvingIndex === null) return;
    const creative = creatives[improvingIndex];
    if (!creative) return;
    setImproveLoading(true);
    try {
      const res = await fetch("/api/tools/improve-creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: creative.headline,
          primaryText: creative.primary_text,
          hook: creative.hook ?? "",
          clinicType: offerSummary?.clinicType ?? "",
          service: offerSummary?.service ?? "",
          direction: improveFeedback.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.headline) {
        setImprovedResult({
          headline: data.headline,
          primary_text: data.primary_text ?? creative.primary_text,
          hook: data.hook ?? creative.hook ?? "",
          changes_summary: data.changes_summary,
        });
        setImproveStep("result");
      } else {
        toast({ title: "Improve failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Improve failed", variant: "destructive" });
    } finally {
      setImproveLoading(false);
    }
  }, [improvingIndex, creatives, improveFeedback, offerSummary, toast]);

  const handleReplaceWithImproved = useCallback(() => {
    if (improvingIndex === null || !improvedResult || !onReplaceCreative) return;
    onReplaceCreative(improvingIndex, {
      headline: improvedResult.headline,
      primary_text: improvedResult.primary_text,
      hook: improvedResult.hook,
    });
    setShowImproveDialog(false);
    setImprovedResult(null);
    setImprovingIndex(null);
    setImproveStep("feedback");
    setImproveFeedback("");
    toast({ title: "Creative updated with improved copy" });
  }, [improvingIndex, improvedResult, onReplaceCreative, toast]);

  const closeImproveDialog = useCallback(() => {
    setShowImproveDialog(false);
    setImprovedResult(null);
    setImprovingIndex(null);
    setImproveStep("feedback");
    setImproveFeedback("");
  }, []);

  const generatedCount = Object.keys(imageUrls).length;
  const filteredWithImagesCount = useMemo(
    () => filtered.filter((c) => imageUrls[creatives.indexOf(c)]).length,
    [filtered, imageUrls, creatives]
  );
  const isBulkGenerating = bulkProgress !== null && bulkProgress.done < bulkProgress.total;

  const stats = [
    { label: "Total Creatives", value: creatives.length, icon: FileText, color: "text-primary" },
    { label: "Avatars", value: avatars.length, icon: Users, color: "text-blue-500" },
    { label: "Emotions", value: emotions, icon: Heart, color: "text-rose-500" },
    {
      label: "Images Generated",
      value: avatarFilter ? `${filteredWithImagesCount} / ${generatedCount}` : generatedCount,
      icon: ImageIcon,
      color: "text-[#1d4ed8]",
    },
  ];

  const offerForPipeline: OfferSummary | null = offerSummary
    ? { clinicType: offerSummary.clinicType, service: offerSummary.service, location: offerSummary.location, offerDetails: offerSummary.offerDetails }
    : null;

  const avatarCount = avatarList?.length ?? avatars.length;

  if (creatives.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No creatives yet"
          description="Generation didn't produce any creatives. Check your API keys and try again with different inputs."
          actionLabel="Try again"
          onAction={onReset}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PipelineView
        offer={offerForPipeline}
        researchSummary={research?.summary}
        avatars={avatarList || []}
        creativeCount={creatives.length}
        imageUrls={imageUrls}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 p-4 rounded-xl card-premium border border-[rgba(56,189,248,0.15)]">
        <p className="text-sm text-slate-400">
          You now have {avatarCount} avatar{avatarCount !== 1 ? "s" : ""}, {creatives.length} creatives, and research on why they convert.
        </p>
        <Link href="/campaign-hq">
          <Button variant="outline" size="sm" className="gap-1.5 text-[#38bdf8] border-[rgba(56,189,248,0.3)] hover:bg-[rgba(56,189,248,0.08)] hover:border-[rgba(56,189,248,0.5)]">
            Build campaign blueprint in Campaign HQ
            <span className="text-[#38bdf8]">→</span>
          </Button>
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-results-title">
          Your Creative Arsenal{" "}
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadAllImages}
            disabled={generatedCount === 0 || isDownloadingZip}
            className="text-xs gap-1.5"
            data-testid="button-download-all-images"
          >
            {isDownloadingZip ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Archive className="w-3 h-3" />
            )}
            {isDownloadingZip ? "Preparing…" : "Download All Images"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs gap-1.5" data-testid="button-export">
            <Download className="w-3 h-3" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onReset} className="text-xs gap-1.5" data-testid="button-new-run">
            <RotateCcw className="w-3 h-3" />
            New Run
          </Button>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Animate with:</span>
            <Select value={animateModel} onValueChange={(v) => setAnimateModel(v as typeof animateModel)}>
              <SelectTrigger className="w-[180px] h-8 text-xs" data-testid="select-animate-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kling">Kling 2.5 Turbo</SelectItem>
                <SelectItem value="pika">Pika Turbo</SelectItem>
                <SelectItem value="minimax">MiniMax Video 01</SelectItem>
                <SelectItem value="kling3">Kling 3.0 O3</SelectItem>
                <SelectItem value="veo2">Veo 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {bulkProgress && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {bulkProgress.done < bulkProgress.total ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-primary" />
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
          <div className="h-2 bg-[rgba(56,189,248,0.1)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#38bdf8] transition-all duration-500 ease-out"
              style={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }}
              data-testid="progress-bulk-images"
            />
          </div>
          {bulkProgress.failed > 0 && (
            <p className="text-xs text-amber-400 mt-2">
              {bulkProgress.failed} image{bulkProgress.failed > 1 ? "s" : ""} failed to generate. You can retry individually.
            </p>
          )}
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground" data-testid={`stat-${stat.label}`}>{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {(research || (avatarList && avatarList.length > 0)) && (
        <Card className="mb-6 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowWhy(!showWhy)}
            className="w-full flex items-center justify-between gap-2 p-4 text-left hover:bg-[#162040] transition-colors rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Why these avatars?</span>
              <span className="text-xs text-muted-foreground">Research-backed, tailored to your offer</span>
            </div>
            {showWhy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showWhy && (
            <div className="px-4 pb-4 pt-0 space-y-3 border-t border-[rgba(56,189,248,0.1)]">
              {research?.summary && (
                <p className="text-sm text-slate-400 pt-3">{research.summary}</p>
              )}
              {avatarList && avatarList.length > 0 && (
                <div className="text-sm">
                  <p className="font-medium text-white mb-2">Selected avatars for your offer:</p>
                  <ul className="space-y-1.5 text-slate-400">
                    {avatarList.map((a) => (
                      <li key={a.name}>
                        <span className="font-medium text-foreground">{a.name}</span>
                        {a.situation && <span> — {a.situation}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 flex-wrap">
        <button
          onClick={() => setAvatarFilter(null)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            !avatarFilter
              ? "bg-[#38bdf8] text-white"
              : "bg-[#162040] text-slate-400 hover:text-white"
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
                ? "bg-[#38bdf8] text-white"
                : "bg-[#162040] text-slate-400 hover:text-white"
            }`}
            data-testid={`button-filter-${avatar}`}
          >
            {avatar} ({creatives.filter((c) => c.avatar === avatar).length})
          </button>
        ))}
        {avatarFilter && (
          <button
            onClick={() => setAvatarFilter(null)}
            className="text-xs text-slate-400 hover:text-white"
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
              builtPrompt={builtPrompts[globalIndex]}
              isGeneratingImage={generatingImages.has(globalIndex)}
              onGenerateImage={isBulkGenerating ? undefined : generateSingleImage}
              onImprove={onReplaceCreative ? handleImproveClick : undefined}
              isImproving={improvingIndex === globalIndex && improveLoading}
              animateModel={animateModel}
              onSaveEditedImage={onSaveEditedImage ? handleSaveEditedImage : undefined}
              editorLayers={editorLayersByIndex[globalIndex]}
            />
          );
        })}
      </div>

      <Dialog open={showImproveDialog} onOpenChange={(open) => !open && closeImproveDialog()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{improveStep === "feedback" ? "Improve this creative" : "Improved creative"}</DialogTitle>
          </DialogHeader>
          {improveStep === "feedback" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="improve-feedback" className="text-sm text-slate-400">
                  What should we improve? (optional)
                </Label>
                <Textarea
                  id="improve-feedback"
                  placeholder="e.g. more urgency, shorter copy, stronger CTA"
                  value={improveFeedback}
                  onChange={(e) => setImproveFeedback(e.target.value)}
                  className="mt-2 min-h-[80px]"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeImproveDialog}>
                  Cancel
                </Button>
                <Button onClick={handleGetImprovement} disabled={improveLoading} className="gap-2">
                  {improveLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Get improvement
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              {improvedResult && (
                <div className="space-y-4">
                  {improvedResult.changes_summary && (
                    <p className="text-sm text-slate-400">{improvedResult.changes_summary}</p>
                  )}
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Headline</p>
                    <p className="text-base font-semibold text-foreground">{improvedResult.headline}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Hook</p>
                    <p className="text-sm text-foreground">{improvedResult.hook}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Copy</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{improvedResult.primary_text}</p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={closeImproveDialog}>
                  Cancel
                </Button>
                <Button onClick={handleReplaceWithImproved} disabled={!onReplaceCreative}>
                  Replace creative
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
