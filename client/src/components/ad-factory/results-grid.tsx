import { useState, useMemo } from "react";
import {
  FileText,
  Users,
  Heart,
  Palette,
  Copy,
  Download,
  RotateCcw,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreativeCard } from "./creative-card";
import { CopyButton } from "./copy-button";
import type { Creative } from "@shared/schema";

interface ResultsGridProps {
  creatives: Creative[];
  onReset: () => void;
}

export function ResultsGrid({ creatives, onReset }: ResultsGridProps) {
  const [avatarFilter, setAvatarFilter] = useState<string | null>(null);

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

  const stats = [
    { label: "Total Creatives", value: creatives.length, icon: FileText, color: "text-emerald-500" },
    { label: "Avatars", value: avatars.length, icon: Users, color: "text-blue-500" },
    { label: "Emotions", value: emotions, icon: Heart, color: "text-rose-500" },
    { label: "Styles", value: styles, icon: Palette, color: "text-violet-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-results-title">
          Your Ad Creatives{" "}
          <span className="text-muted-foreground font-normal text-lg">({creatives.length})</span>
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
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
        {filtered.map((creative, i) => (
          <CreativeCard key={`${creative.id}-${creative.avatar}-${i}`} creative={creative} index={i} />
        ))}
      </div>
    </div>
  );
}
