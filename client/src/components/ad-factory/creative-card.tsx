import { useState } from "react";
import { ChevronDown, ChevronUp, ImageIcon, Loader2, Sparkles, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "./copy-button";
import { EMOTION_COLORS, STYLE_COLORS } from "@/lib/constants";
import type { DisplayCreative } from "./results-grid";

interface CreativeCardProps {
  creative: DisplayCreative;
  index: number;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  onGenerateImage?: (prompt: string, index: number) => void;
}

export function CreativeCard({ creative, index, imageUrl, isGeneratingImage, onGenerateImage }: CreativeCardProps) {
  const [showPrompt, setShowPrompt] = useState(false);

  const emotionStyle = EMOTION_COLORS[creative.emotion] || EMOTION_COLORS.trust;
  const styleStyle = STYLE_COLORS[creative.style] || STYLE_COLORS["Direct Offer"];

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `ad-creative-${index + 1}.png`;
    a.click();
  };

  return (
    <Card
      className="overflow-visible flex flex-col"
      style={{
        opacity: 0,
        animation: `fade-in-up 0.4s ease-out ${index * 0.05}s forwards`,
      }}
      data-testid={`card-creative-${index}`}
    >
      {imageUrl && (
        <div className="relative group">
          <img
            src={imageUrl}
            alt={creative.headline}
            className="w-full aspect-[4/3] object-cover rounded-t-md"
            data-testid={`img-creative-${index}`}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              onClick={handleDownloadImage}
              data-testid={`button-download-image-${index}`}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {!imageUrl && (
        <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 aspect-[4/3] rounded-t-md flex flex-col items-center justify-center gap-3">
          {isGeneratingImage ? (
            <>
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <span className="text-xs text-muted-foreground">Generating image...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
              {onGenerateImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onGenerateImage(creative.image_prompt, index)}
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

        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-md px-3 py-2 mb-4">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Hook: {creative.hook}
          </p>
        </div>

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
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md px-3 py-2 mb-3 text-xs text-muted-foreground leading-relaxed">
            {creative.image_prompt}
          </div>
        )}

        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-3">
          {creative.category}
        </span>
      </div>

      <div className="flex items-center gap-1 px-3 py-3 border-t border-border flex-wrap">
        <CopyButton text={creative.headline} label="Headline" />
        <CopyButton text={creative.primary_text} label="Copy" />
        <CopyButton text={creative.image_prompt} label="Prompt" />
      </div>
    </Card>
  );
}
