"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, ImageIcon, Loader2, Sparkles, Download, Info, Wand2, Video, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "./copy-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EMOTION_COLORS, STYLE_COLORS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import type { EditorLayer } from "@/lib/db/schema";
import type { DisplayCreative } from "./results-grid";
import { CreativeEditor } from "./creative-editor";

export type AnimateModel = "kling" | "pika" | "minimax" | "kling3" | "veo2";

interface CreativeCardProps {
  creative: DisplayCreative;
  index: number;
  imageUrl?: string;
  builtPrompt?: string;
  isGeneratingImage?: boolean;
  onGenerateImage?: (creative: DisplayCreative, index: number) => void;
  onImprove?: (creative: DisplayCreative, index: number) => void;
  isImproving?: boolean;
  animateModel?: AnimateModel;
  onSaveEditedImage?: (index: number, compositeDataUrl: string, layers: EditorLayer[]) => void;
  editorLayers?: EditorLayer[];
}

export function CreativeCard({ creative, index, imageUrl, builtPrompt, isGeneratingImage, onGenerateImage, onImprove, isImproving, animateModel = "kling", onSaveEditedImage, editorLayers }: CreativeCardProps) {
  const { toast } = useToast();
  const [showPrompt, setShowPrompt] = useState(false);
  const [fetchedPrompt, setFetchedPrompt] = useState<string | null>(null);
  const [fetchingPrompt, setFetchingPrompt] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showEditorDialog, setShowEditorDialog] = useState(false);
  const displayPrompt = builtPrompt || fetchedPrompt || creative.image_prompt;

  useEffect(() => {
    if (!showPrompt || builtPrompt || fetchedPrompt || fetchingPrompt) return;
    setFetchingPrompt(true);
    fetch("/api/build-image-prompt", {
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
    })
      .then((r) => r.json())
      .then((d) => d.prompt && setFetchedPrompt(d.prompt))
      .catch(() => {})
      .finally(() => setFetchingPrompt(false));
  }, [showPrompt, builtPrompt, fetchedPrompt, fetchingPrompt, creative]);

  const emotionStyle = EMOTION_COLORS[creative.emotion] || EMOTION_COLORS.trust;
  const styleStyle = STYLE_COLORS[creative.style] || STYLE_COLORS["Direct Offer"];

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const sanitize = (s: string) =>
      String(s || "")
        .replace(/[/\\?*:|<>]/g, "-")
        .replace(/\s+/g, " ")
        .trim() || "creative";
    const pad = String(index + 1).padStart(2, "0");
    const name = `${sanitize(creative.style)}_${pad}_${sanitize(creative.avatar)}_${sanitize(creative.emotion)}.png`;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = name;
    a.click();
  };

  const handleAnimate = async () => {
    if (!imageUrl) return;
    setIsAnimating(true);
    setVideoUrl(null);
    try {
      const body: { imageUrl?: string; imageBase64?: string; promptText?: string; model?: AnimateModel } = {};
      if (imageUrl.startsWith("data:")) {
        body.imageBase64 = imageUrl;
      } else if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        body.imageUrl = imageUrl;
      } else {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve((r.result as string).split(",")[1] || "");
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
        body.imageBase64 = base64;
      }
      body.promptText = "Smooth, subtle motion that brings the image to life.";
      body.model = animateModel;
      const res = await fetch("/api/tools/animate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setShowVideoDialog(true);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Animate error:", err);
      toast({ title: "Animation failed", description: (err as Error).message?.slice(0, 120) || "Check RUNWAY_API_KEY and try again.", variant: "destructive" });
      setShowVideoDialog(false);
    } finally {
      setIsAnimating(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `creative-${index + 1}-animated.mp4`;
    a.click();
  };

  return (
    <Card
      className="overflow-visible flex flex-col transition-shadow duration-200 hover:shadow-md"
      style={{
        opacity: imageUrl ? 1 : 0,
        animation: imageUrl ? undefined : `fade-in-up 0.4s ease-out ${index * 0.05}s forwards`,
      }}
      data-testid={`card-creative-${index}`}
    >
      {imageUrl && (
        <div className="relative group">
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="w-full aspect-[4/5] bg-muted rounded-t-lg flex items-center justify-center overflow-hidden cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-opacity hover:opacity-95"
                data-testid={`img-creative-${index}`}
              >
                <img
                  src={imageUrl}
                  alt={creative.headline}
                  className="w-full h-full object-contain"
                />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 sm:max-w-[90vw]">
              <DialogHeader>
                <DialogTitle className="sr-only">Full image preview</DialogTitle>
              </DialogHeader>
              <img
                src={imageUrl}
                alt={creative.headline}
                className="w-full max-h-[85vh] object-contain rounded"
              />
            </DialogContent>
          </Dialog>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            {onSaveEditedImage && (
              <Button
                size="icon"
                variant="secondary"
                onClick={(e) => { e.stopPropagation(); setShowEditorDialog(true); }}
                data-testid={`button-edit-image-${index}`}
                title="Edit image (add text & shapes)"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); handleDownloadImage(); }}
              data-testid={`button-download-image-${index}`}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); handleAnimate(); }}
              disabled={isAnimating}
              data-testid={`button-animate-${index}`}
              title="Animate image (image to video)"
            >
              {isAnimating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showEditorDialog} onOpenChange={setShowEditorDialog}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Edit creative image</DialogTitle>
          </DialogHeader>
          {imageUrl && showEditorDialog && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <CreativeEditor
                imageUrl={imageUrl}
                creative={creative}
                initialLayers={editorLayers}
                onSave={(compositeDataUrl, layers) => {
                  onSaveEditedImage?.(index, compositeDataUrl, layers);
                  setShowEditorDialog(false);
                  toast({ title: "Image updated", description: "Download or Animate will use the edited image." });
                }}
                onCancel={() => setShowEditorDialog(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Animated video</DialogTitle>
          </DialogHeader>
          {videoUrl ? (
            <div className="space-y-3">
              <video src={videoUrl} controls className="w-full rounded-lg" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadVideo}>
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button size="sm" onClick={() => setShowVideoDialog(false)}>Close</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {!imageUrl && (
        <div className="relative bg-muted/80 aspect-[4/3] rounded-t-lg flex flex-col items-center justify-center gap-3">
          {isGeneratingImage ? (
            <>
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Generating image...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
              {onGenerateImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onGenerateImage(creative, index)}
                  className="text-xs gap-1.5"
                  data-testid={`button-generate-image-${index}`}
                >
                  <Sparkles className="w-3 h-3" />
                  Generate Image
                </Button>
              )}
            </>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-3 border-b border-border flex-wrap">
        <span className="text-xs font-mono text-muted-foreground">
          #{String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${emotionStyle.bg} ${emotionStyle.text}`}
          >
            {creative.emotion}
          </span>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${styleStyle.bg} ${styleStyle.text}`}
          >
            {creative.style}
          </span>
        </div>
      </div>

      <div className="px-5 py-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2 h-2 rounded-full ${emotionStyle.dot} flex-shrink-0`} />
          <span className="text-xs font-medium text-muted-foreground">{creative.avatar}</span>
        </div>

        <h3 className="text-base font-bold text-foreground mb-3 leading-snug" data-testid={`text-headline-${index}`}>
          {creative.headline}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
          {creative.primary_text}
        </p>

        <div className="bg-amber-500/10 rounded-md px-3 py-2 mb-4">
          <p className="text-xs font-medium text-amber-400">
            Hook: {creative.hook}
          </p>
        </div>

        <details className="mb-4 group">
          <summary className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            Why this creative?
            <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-2 pl-5 text-xs text-muted-foreground leading-relaxed">
            {creative.rationale || "AI-selected based on offer and avatar."}
          </div>
        </details>

        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          data-testid={`button-toggle-prompt-${index}`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Image Prompt
          {showPrompt ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showPrompt && (
          <div className="bg-[#162040] rounded-md px-3 py-2 mb-3 text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
            {fetchingPrompt ? (
              <span className="italic">Building export-ready prompt...</span>
            ) : (
              <>
                {displayPrompt}
                {(builtPrompt || fetchedPrompt) && (
                  <p className="mt-2 text-[10px] text-emerald-400">Export-ready: Use this prompt in Lovart, Midjourney, or other platforms.</p>
                )}
              </>
            )}
          </div>
        )}

        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-3">
          {creative.category}
        </span>
      </div>

      <div className="flex items-center gap-1 px-3 py-3 border-t border-border flex-wrap">
        {onImprove && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            disabled={isImproving}
            onClick={() => onImprove(creative, index)}
            data-testid={`button-improve-${index}`}
          >
            {isImproving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
            Improve
          </Button>
        )}
        <CopyButton text={creative.headline} label="Headline" />
        <CopyButton text={creative.primary_text} label="Copy" />
        <CopyButton text={displayPrompt} label="Prompt" />
      </div>
    </Card>
  );
}
