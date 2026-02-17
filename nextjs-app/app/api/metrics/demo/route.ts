import { NextResponse } from "next/server";
import { generateDemoMetrics } from "@/lib/seed-data";

export async function GET() {
  const metrics = generateDemoMetrics();
  return NextResponse.json(metrics);
}
