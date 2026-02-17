"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GLOSSARY } from "@/lib/glossary";

type GlossaryKey = keyof typeof GLOSSARY;

interface GlossaryTooltipProps {
  term: GlossaryKey;
  children: React.ReactNode;
  className?: string;
}

export function GlossaryTooltip({ term, children, className }: GlossaryTooltipProps) {
  const entry = GLOSSARY[term];
  if (!entry) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className ?? "border-b border-dotted border-[#1d4ed8]/40 text-[#1d4ed8] cursor-help"}>{children}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        {entry.definition}
      </TooltipContent>
    </Tooltip>
  );
}
