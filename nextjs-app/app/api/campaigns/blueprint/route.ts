import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, campaignBlueprintRequestSchema } from "@/lib/db/schema";
import { callAI } from "@/lib/services/ai";
import { buildCampaignBlueprintPrompt } from "@/lib/prompts";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = campaignBlueprintRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const prompt = buildCampaignBlueprintPrompt(parsed.data);
    const result = await callAI(prompt);

    if (!result) {
      return NextResponse.json({ error: "Failed to generate blueprint" }, { status: 500 });
    }

    const campaignPayload = {
      name: result.campaign_name || `${parsed.data.clinicType} - ${parsed.data.service} Campaign`,
      clinicType: parsed.data.clinicType,
      service: parsed.data.service,
      location: parsed.data.location,
      budget: parsed.data.budget || "Unknown",
      goal: parsed.data.goal || "Unknown",
      objective: result.objective,
      blueprint: result,
      deploymentChecklist: result.deployment_steps,
      status: "draft" as const,
    };

    let campaign: any;
    try {
      const [result] = await db.insert(campaigns).values(campaignPayload).returning();
      campaign = result;
    } catch (dbErr) {
      console.warn("Campaign blueprint: DB unavailable:", (dbErr as Error).message);
      campaign = { id: `draft-${Date.now()}`, ...campaignPayload };
    }
    return NextResponse.json({ campaign, source: "ai" });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Campaign blueprint error:", error);
    return NextResponse.json({ error: "Campaign blueprint failed", message: err.message }, { status: 500 });
  }
}
