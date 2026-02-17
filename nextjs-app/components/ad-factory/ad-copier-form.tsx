"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CLINIC_TYPES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import type { DisplayCreative } from "./results-grid";

interface AdCopierFormData {
  headline: string;
  primaryText: string;
  cta: string;
  clinicType: string;
  service: string;
  location: string;
  offer: string;
  targetAudience: string;
}

interface AdCopierFormProps {
  onSuccess: (creatives: DisplayCreative[]) => void;
}

export function AdCopierForm({ onSuccess }: AdCopierFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<AdCopierFormData>({
    mode: "onChange",
    defaultValues: {
      headline: "",
      primaryText: "",
      cta: "",
      clinicType: "",
      service: "",
      location: "",
      offer: "",
      targetAudience: "",
    },
  });

  const onSubmit = async (data: AdCopierFormData) => {
    if (!data.clinicType || !data.service) {
      toast({ title: "Clinic type and service are required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ad-copier/replicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const creatives = (json.creatives || []) as DisplayCreative[];
      if (creatives.length > 0) {
        onSuccess(creatives);
        toast({ title: `${creatives.length} variations generated`, description: "Apply your branding to the winning ad structure." });
      } else {
        toast({ title: "No variations generated", description: "Try again with different inputs.", variant: "destructive" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ad Copier failed";
      toast({ title: "Failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(56,189,248,0.08)] text-[#38bdf8] text-xs font-semibold uppercase tracking-wider mb-5">
          <Copy className="w-3.5 h-3.5" />
          Ad Copier
        </span>
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 leading-tight">
          Copy Any Ad You Love
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
          Paste headline and copy from a winning ad. AI recreates 5 unique variations with your branding.
        </p>
      </div>

      <Card className="p-6 lg:p-8 shadow-[0_0_15px_rgba(56,189,248,0.04)] border-[rgba(56,189,248,0.1)]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference headline (from winning ad)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Your Doctor Says Your Labs Are Normal. You're Not."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="primaryText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference copy (from winning ad)</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      rows={4}
                      placeholder="Paste the main ad copy here..."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CTA (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Book Now, Learn More" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="h-px bg-[rgba(56,189,248,0.1)]" />

            <p className="text-sm font-medium text-foreground">Your branding</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="clinicType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic type <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select clinic type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CLINIC_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Botox, Functional Medicine" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Miami, FL" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="offer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your offer</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Free consultation, 20% off first treatment" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target audience</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Women 25-40, health-conscious" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading || !form.formState.isValid}
              className="w-full btn-primary-glow btn-gold text-white gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              Generate 5 Variations
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </Form>
      </Card>

      <p className="text-xs text-slate-400 text-center mt-6">
        Tip: Copy headline and body from Meta Ad Library or any ad you want to replicate.
      </p>
    </div>
  );
}
