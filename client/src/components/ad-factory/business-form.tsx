import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
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
import { generateRequestSchema, type GenerateRequest } from "@shared/schema";
import { CLINIC_TYPES, CAMPAIGN_GOALS } from "@/lib/constants";

interface BusinessFormProps {
  onSubmit: (data: GenerateRequest) => void;
}

const trustBadges = [
  "15-20 creatives per run",
  "Under 60 seconds",
  "Ready to deploy",
];

export function BusinessForm({ onSubmit }: BusinessFormProps) {
  const form = useForm<GenerateRequest>({
    resolver: zodResolver(generateRequestSchema),
    defaultValues: {
      clinicType: "",
      service: "",
      location: "",
      targetAudience: "",
      offerDetails: "",
      goal: "",
    },
  });

  const goalValue = form.watch("goal");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Generation
        </span>
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-factory-title">
          AI Ad Creative Factory
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Enter your clinic details and our AI will generate 15-20 high-converting ad creatives in under 60 seconds.
        </p>
      </div>

      <Card className="p-6 lg:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="clinicType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Clinic Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-clinic-type">
                        <SelectValue placeholder="Select your clinic type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CLINIC_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
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
                  <FormLabel>
                    Primary Service <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Botox injections, teeth whitening, IV vitamin drips..."
                      data-testid="input-service"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Location <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Miami, FL"
                      data-testid="input-location"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Women 35-55, health-conscious professionals..."
                      data-testid="input-audience"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="offerDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Details</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      rows={3}
                      placeholder="e.g., Free consultation + 20% off first treatment..."
                      data-testid="input-offer"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Campaign Goal <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-3">
                      {CAMPAIGN_GOALS.map((goal) => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => field.onChange(goal)}
                          className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors duration-200 ${
                            goalValue === goal
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                              : "border-border bg-background text-muted-foreground hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                          data-testid={`button-goal-${goal.toLowerCase().replace(/\s/g, "-")}`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={!form.formState.isValid}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white no-default-hover-elevate no-default-active-elevate"
              data-testid="button-generate"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Ad Creatives
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </Form>
      </Card>

      <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
        {trustBadges.map((badge) => (
          <div key={badge} className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
