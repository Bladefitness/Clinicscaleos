"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EditorLayer } from "@shared/schema";
import { Type, Square, Circle, Trash2 } from "lucide-react";

const FONT_FAMILIES = ["Arial", "Inter", "Georgia", "Impact"] as const;
const FONT_SIZES = [14, 18, 24, 32, 48] as const;

interface EditorToolbarProps {
  selectedLayer: EditorLayer | null;
  onAddText: () => void;
  onAddRect: () => void;
  onAddRoundRect: () => void;
  onDeleteLayer: () => void;
  onUpdateLayer: (updates: Partial<EditorLayer>) => void;
}

export function EditorToolbar({
  selectedLayer,
  onAddText,
  onAddRect,
  onAddRoundRect,
  onDeleteLayer,
  onUpdateLayer,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 border-b border-border bg-muted/40">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onAddText} className="gap-1.5">
          <Type className="w-4 h-4" />
          Add text
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onAddRect} className="gap-1.5">
          <Square className="w-4 h-4" />
          Rectangle
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onAddRoundRect} className="gap-1.5">
          <Circle className="w-4 h-4" />
          Rounded
        </Button>
      </div>
      {selectedLayer && (
        <>
          <div className="h-4 w-px bg-border" />
          {selectedLayer.type === "text" && (
            <>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Text</Label>
                <Input
                  className="h-8 w-40 text-xs"
                  value={selectedLayer.text ?? ""}
                  onChange={(e) => onUpdateLayer({ text: e.target.value })}
                  placeholder="Headline or CTA"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Font</Label>
                <Select
                  value={selectedLayer.fontFamily ?? "Arial"}
                  onValueChange={(v) => onUpdateLayer({ fontFamily: v })}
                >
                  <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Size</Label>
                <Select
                  value={String(selectedLayer.fontSize ?? 24)}
                  onValueChange={(v) => onUpdateLayer({ fontSize: Number(v) })}
                >
                  <SelectTrigger className="w-[70px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_SIZES.map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Color</Label>
            <input
              type="color"
              value={selectedLayer.fill ?? "#ffffff"}
              onChange={(e) => onUpdateLayer({ fill: e.target.value })}
              className="w-8 h-8 rounded border border-input cursor-pointer bg-background"
            />
          </div>
          {(selectedLayer.type === "rect" || selectedLayer.type === "roundRect") && (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Opacity</Label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedLayer.opacity ?? 1}
                onChange={(e) => onUpdateLayer({ opacity: Number(e.target.value) })}
                className="w-20 h-2"
              />
            </div>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={onDeleteLayer} className="gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </>
      )}
    </div>
  );
}
