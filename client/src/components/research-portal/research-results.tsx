import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Sparkles, Heart, Megaphone, Building2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PainPoint {
  pain_point: string;
  frequency: "high" | "medium" | "low";
  source_count: number;
  example_quotes: string[];
  source_urls: string[];
}

interface EmotionalTrigger {
  trigger: string;
  intensity: "strong" | "moderate" | "mild";
  context: string;
}

interface MessagingAngle {
  angle: string;
  target_emotion: string;
  example_hook: string;
}

interface ResearchData {
  validated_pain_points: PainPoint[];
  emotional_triggers: EmotionalTrigger[];
  messaging_angles: MessagingAngle[];
  competitor_claims: string[];
  summary: string;
  confidence: "high" | "medium" | "low";
  sources_searched?: string[];
}

interface ResearchResultsProps {
  data: ResearchData;
  source: "web_search" | "ai_synthesis";
  onUseAngle?: (angle: MessagingAngle) => void;
}

const frequencyColor = { high: "destructive", medium: "default", low: "secondary" } as const;
const intensityColor = { strong: "destructive", moderate: "default", mild: "secondary" } as const;

function PainPointCard({ point }: { point: PainPoint }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={frequencyColor[point.frequency]}>{point.frequency} frequency</Badge>
            <span className="text-xs text-muted-foreground">{point.source_count} sources</span>
          </div>
          <p className="font-medium">{point.pain_point}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>
      {expanded && (
        <div className="mt-3 space-y-2 border-t pt-3">
          {point.example_quotes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Example quotes:</p>
              {point.example_quotes.map((q, i) => (
                <blockquote key={i} className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3 mb-2">
                  "{q}"
                </blockquote>
              ))}
            </div>
          )}
          {point.source_urls.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Sources:</p>
              {point.source_urls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mb-1">
                  <ExternalLink className="w-3 h-3" />{url.length > 60 ? url.slice(0, 60) + "..." : url}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function ResearchResults({ data, source, onUseAngle }: ResearchResultsProps) {
  return (
    <div className="space-y-6">
      {/* Source badge + confidence */}
      <div className="flex items-center gap-2">
        <Badge variant={source === "web_search" ? "default" : "secondary"}>
          {source === "web_search" ? "Web-Validated Research" : "AI-Synthesized Research"}
        </Badge>
        <Badge variant={data.confidence === "high" ? "default" : data.confidence === "medium" ? "secondary" : "outline"}>
          {data.confidence} confidence
        </Badge>
      </div>

      {/* Executive Summary */}
      <Card className="p-5 bg-primary/5 border-primary/20">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Executive Summary</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-line">{data.summary}</p>
      </Card>

      {/* Pain Points */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" /> Validated Pain Points ({data.validated_pain_points?.length || 0})
        </h3>
        <div className="space-y-3">
          {data.validated_pain_points?.map((point, i) => (
            <PainPointCard key={i} point={point} />
          ))}
        </div>
      </div>

      {/* Emotional Triggers */}
      {data.emotional_triggers?.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" /> Emotional Triggers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.emotional_triggers.map((trigger, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{trigger.trigger}</span>
                  <Badge variant={intensityColor[trigger.intensity]}>{trigger.intensity}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{trigger.context}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Messaging Angles */}
      {data.messaging_angles?.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-blue-500" /> Messaging Angles
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {data.messaging_angles.map((angle, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{angle.angle}</p>
                    <p className="text-xs text-muted-foreground mt-1">Target emotion: {angle.target_emotion}</p>
                    <p className="text-sm mt-2 bg-muted/50 rounded px-3 py-2 italic">"{angle.example_hook}"</p>
                  </div>
                  {onUseAngle && (
                    <Button variant="outline" size="sm" onClick={() => onUseAngle(angle)}>
                      Use in Creative
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Claims */}
      {data.competitor_claims?.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-500" /> What Competitors Are Saying
          </h3>
          <Card className="p-4">
            <ul className="space-y-2">
              {data.competitor_claims.map((claim, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  {claim}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
