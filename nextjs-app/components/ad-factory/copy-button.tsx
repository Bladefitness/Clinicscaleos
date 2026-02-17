"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  text: string;
  label: string;
  variant?: "ghost" | "outline" | "default";
  size?: "default" | "sm" | "icon";
  className?: string;
}

export function CopyButton({ text, label, variant = "ghost", size = "sm", className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={`text-xs gap-1.5 ${className}`}
      data-testid={`button-copy-${label.toLowerCase().replace(/\s/g, "-")}`}
    >
      {copied ? (
        <Check className="w-3 h-3 text-[#38bdf8]" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      {copied ? "Copied" : label}
    </Button>
  );
}
