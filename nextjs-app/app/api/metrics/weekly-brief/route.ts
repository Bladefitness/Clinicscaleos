import { NextResponse } from "next/server";
import { getWeeklyBriefData } from "@/lib/seed-data";

export async function GET() {
  return NextResponse.json(getWeeklyBriefData());
}
