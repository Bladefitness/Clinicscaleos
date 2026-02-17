import { NextResponse } from "next/server";
import { getDailyPulseData } from "@/lib/seed-data";

export async function GET() {
  return NextResponse.json(getDailyPulseData());
}
