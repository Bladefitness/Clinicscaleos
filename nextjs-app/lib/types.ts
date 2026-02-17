export interface Creative {
  id: number;
  avatar: string;
  emotion: string;
  style: string;
  headline: string;
  primary_text: string;
  image_prompt: string;
  hook: string;
  category: string;
  rationale?: string;
}

export interface GenerateRequest {
  clinicType: string;
  service: string;
  location: string;
  targetAudience: string;
  offerDetails: string;
  goal: string;
}
