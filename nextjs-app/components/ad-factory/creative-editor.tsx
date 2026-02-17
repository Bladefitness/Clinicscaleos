"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Rect } from "react-konva";
import Konva from "konva";
import type { EditorLayer } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { EditorToolbar } from "./editor-toolbar";
import type { DisplayCreative } from "./results-grid";

const STAGE_WIDTH = 600;
const STAGE_HEIGHT = 750;

function generateId() {
  return `layer-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface CreativeEditorProps {
  imageUrl: string;
  creative: DisplayCreative;
  initialLayers?: EditorLayer[];
  onSave: (compositeDataUrl: string, layers: EditorLayer[]) => void;
  onCancel: () => void;
}

export function CreativeEditor({
  imageUrl,
  creative,
  initialLayers = [],
  onSave,
  onCancel,
}: CreativeEditorProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState({ width: STAGE_WIDTH, height: STAGE_HEIGHT });
  const [layers, setLayers] = useState<any[]>(() => {
    if (initialLayers.length > 0) return initialLayers;
    const headline = (creative.headline || "").trim();
    if (headline) {
      return [
        {
          id: generateId(),
          type: "text",
          startTime: 0,
          duration: 5,
          track: 0,
          properties: {
            x: 40,
            y: 40,
            width: 320,
            height: 80,
            text: headline,
            fontSize: 28,
            fontFamily: "Arial",
            fill: "#ffffff",
          },
        },
      ];
    }
    return [];
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      const scale = Math.min(STAGE_WIDTH / img.width, STAGE_HEIGHT / img.height);
      setImageSize({
        width: img.width * scale,
        height: img.height * scale,
      });
    };
    img.onerror = () => setImage(null);
    if (imageUrl.startsWith("data:") || imageUrl.startsWith("http")) {
      img.src = imageUrl;
    }
  }, [imageUrl]);

  const selectedLayer = layers.find((l) => l.id === selectedId) ?? null;

  const handleAddText = useCallback(() => {
    setLayers((prev) => [
      ...prev,
      {
        id: generateId(),
        type: "text",
        startTime: 0,
        duration: 5,
        track: 0,
        properties: {
          x: 80,
          y: 100,
          width: 200,
          height: 40,
          text: "New text",
          fontSize: 24,
          fontFamily: "Arial",
          fill: "#ffffff",
        },
      },
    ]);
  }, []);

  const handleAddRect = useCallback(() => {
    setLayers((prev) => [
      ...prev,
      {
        id: generateId(),
        type: "rect",
        x: 80,
        y: 200,
        width: 200,
        height: 48,
        fill: "#000000",
        opacity: 0.6,
      },
    ]);
  }, []);

  const handleAddRoundRect = useCallback(() => {
    setLayers((prev) => [
      ...prev,
      {
        id: generateId(),
        type: "roundRect",
        x: 80,
        y: 280,
        width: 200,
        height: 48,
        fill: "#2563eb",
        opacity: 0.9,
        cornerRadius: 12,
      },
    ]);
  }, []);

  const handleDeleteLayer = useCallback(() => {
    if (!selectedId) return;
    setLayers((prev) => prev.filter((l) => l.id !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  const handleUpdateLayer = useCallback((updates: Partial<EditorLayer>) => {
    if (!selectedId) return;
    setLayers((prev) =>
      prev.map((l) => (l.id === selectedId ? { ...l, ...updates } : l))
    );
  }, [selectedId]);

  const handleExport = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const dataUrl = stage.toDataURL({
      pixelRatio: 2,
      mimeType: "image/png",
    });
    onSave(dataUrl, layers);
  }, [layers, onSave]);

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, x, y } : l))
    );
  }, []);

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar
        selectedLayer={selectedLayer}
        onAddText={handleAddText}
        onAddRect={handleAddRect}
        onAddRoundRect={handleAddRoundRect}
        onDeleteLayer={handleDeleteLayer}
        onUpdateLayer={handleUpdateLayer}
      />
      <div className="flex-1 overflow-auto p-4 bg-[#162040] flex justify-center items-start">
        <Stage
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          ref={stageRef}
          onClick={(e) => {
            const target = e.target as Konva.Node;
            const id = (typeof target.name === "function" ? target.name() : "") || (target.getAttr?.("data-layer-id") ?? "");
            setSelectedId(id || null);
          }}
          onTap={(e) => {
            const target = e.target as Konva.Node;
            const id = (typeof target.name === "function" ? target.name() : "") || (target.getAttr?.("data-layer-id") ?? "");
            setSelectedId(id || null);
          }}
        >
          <Layer>
            {image && (
              <KonvaImage
                image={image}
                x={0}
                y={0}
                width={imageSize.width}
                height={imageSize.height}
                listening={false}
              />
            )}
            {!image && (
              <Rect
                x={0}
                y={0}
                width={STAGE_WIDTH}
                height={STAGE_HEIGHT}
                fill="#e5e7eb"
                listening={false}
              />
            )}
            {layers.map((layer) => {
              if (layer.type === "text") {
                return (
                  <KonvaText
                    key={layer.id}
                    name={layer.id}
                    x={layer.x}
                    y={layer.y}
                    width={layer.width}
                    height={layer.height}
                    text={layer.text ?? ""}
                    fontSize={layer.fontSize ?? 24}
                    fontFamily={layer.fontFamily ?? "Arial"}
                    fill={layer.fill ?? "#ffffff"}
                    draggable
                    onDragEnd={(e) =>
                      handleDragEnd(layer.id, e.target.x(), e.target.y())
                    }
                    stroke={selectedId === layer.id ? "#38bdf8" : undefined}
                    strokeWidth={selectedId === layer.id ? 2 : 0}
                    listening={true}
                  />
                );
              }
              if (layer.type === "rect" || layer.type === "roundRect") {
                return (
                  <Rect
                    key={layer.id}
                    name={layer.id}
                    x={layer.x}
                    y={layer.y}
                    width={layer.width}
                    height={layer.height}
                    fill={layer.fill ?? "#000000"}
                    opacity={layer.opacity ?? 0.8}
                    cornerRadius={layer.type === "roundRect" ? (layer.cornerRadius ?? 8) : 0}
                    draggable
                    onDragEnd={(e) =>
                      handleDragEnd(layer.id, e.target.x(), e.target.y())
                    }
                    stroke={selectedId === layer.id ? "#38bdf8" : undefined}
                    strokeWidth={selectedId === layer.id ? 2 : 0}
                    listening={true}
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>
      </div>
      <div className="flex justify-end gap-2 p-3 border-t border-[rgba(56,189,248,0.1)]">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleExport}>
          Save & use this image
        </Button>
      </div>
    </div>
  );
}
