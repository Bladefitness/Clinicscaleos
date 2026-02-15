export const CLINIC_TYPES = [
  "Med Spa",
  "Dental Clinic",
  "IV Therapy Clinic",
  "Wellness Clinic",
  "Weight Loss Clinic",
  "Chiropractic Office",
  "Dermatology Clinic",
  "Physical Therapy",
  "Other",
] as const;

export const CAMPAIGN_GOALS = [
  "Generate Leads",
  "Book Appointments",
  "Build Awareness",
] as const;

export const EMOTION_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  frustration: { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
  hope: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  envy: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  fear: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500" },
  empowerment: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  curiosity: { bg: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-700 dark:text-cyan-400", dot: "bg-cyan-500" },
  urgency: { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-700 dark:text-orange-400", dot: "bg-orange-500" },
  trust: { bg: "bg-teal-50 dark:bg-teal-950/30", text: "text-teal-700 dark:text-teal-400", dot: "bg-teal-500" },
};

export const STYLE_COLORS: Record<string, { bg: string; text: string }> = {
  "Pattern Interrupt": { bg: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-700 dark:text-violet-400" },
  "Native Social": { bg: "bg-sky-50 dark:bg-sky-950/30", text: "text-sky-700 dark:text-sky-400" },
  "Breaking News": { bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-700 dark:text-rose-400" },
  "Testimonial": { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-400" },
  "Before/After": { bg: "bg-lime-50 dark:bg-lime-950/30", text: "text-lime-700 dark:text-lime-400" },
  "Educational": { bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-700 dark:text-indigo-400" },
  "Social Proof": { bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-700 dark:text-pink-400" },
  "Direct Offer": { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400" },
};

export const LOADING_STAGES = [
  { label: "Discovering what makes your market convert...", icon: "Target" },
  { label: "Creating avatars that mirror your best patients...", icon: "Users" },
  { label: "Crafting scroll-stopping creatives...", icon: "Sparkles" },
  { label: "Sharpening hooks that trigger action...", icon: "TrendingUp" },
  { label: "Your creative library is ready. Next: launch in Campaign HQ.", icon: "CheckCircle2" },
] as const;
