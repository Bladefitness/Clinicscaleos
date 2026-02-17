import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { painPointSearchRequestSchema, type PainPointSearchRequest } from "@shared/schema";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CLINIC_TYPES } from "@/lib/constants";

const SERVICES_BY_CLINIC: Record<string, string[]> = {
  "Med Spa": ["Botox", "Dermal Fillers", "Laser Hair Removal", "Chemical Peels", "Microneedling", "CoolSculpting"],
  "Dental Clinic": ["Teeth Whitening", "Dental Implants", "Invisalign", "Veneers", "Root Canal", "All-on-4"],
  "IV Therapy Clinic": ["NAD+ IV", "Myers Cocktail", "Glutathione IV", "Vitamin C Drip", "Hydration Therapy"],
  "Wellness Clinic": ["Hormone Therapy", "Stem Cell Therapy", "Peptide Therapy", "Anti-Aging Panel", "Gut Health"],
  "Weight Loss Clinic": ["Semaglutide (Ozempic)", "Tirzepatide (Mounjaro)", "Medical Weight Loss", "Body Contouring"],
  "Chiropractic Office": ["Spinal Adjustment", "Decompression Therapy", "Sports Injury Rehab", "Sciatica Treatment"],
  "Dermatology Clinic": ["Acne Treatment", "Eczema Management", "Skin Cancer Screening", "Anti-Aging Treatment"],
  "Physical Therapy": ["Post-Surgery Rehab", "Sports Injury Therapy", "Chronic Pain Management", "Dry Needling"],
};

const SUGGESTION_CHIPS = [
  "dental implant complaints",
  "botox side effects concerns",
  "med spa bad experiences",
  "weight loss clinic scams",
  "chiropractor reviews negative",
  "IV therapy worth it",
];

interface SearchFormProps {
  onSubmit: (data: PainPointSearchRequest) => void;
  isLoading: boolean;
}

export function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const form = useForm<PainPointSearchRequest>({
    resolver: zodResolver(painPointSearchRequestSchema),
    defaultValues: { query: "", clinicType: "", service: "" },
  });

  const clinicType = form.watch("clinicType");
  const services = clinicType ? SERVICES_BY_CLINIC[clinicType] || [] : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What pain points do you want to research?</FormLabel>
              <FormControl>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder='e.g. "dental implant complaints" or "botox fears"'
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-2">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => form.setValue("query", chip)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clinicType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clinic Type (optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select clinic type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CLINIC_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
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
                <FormLabel>Service (optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!clinicType}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={clinicType ? "Select service" : "Select clinic type first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services.map((svc) => (
                      <SelectItem key={svc} value={svc}>{svc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Researching... (15-30s)
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Research Pain Points
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
