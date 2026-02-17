import { NextResponse } from "next/server";
import { fetchAccountInsights, fetchActiveAdSetsCount } from "@/lib/services/meta-ads";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    const token = session.metaAccessToken || undefined;
    const adAccountId = session.metaAdAccountId || undefined;

    const [insights, activeAdSets] = await Promise.all([
      fetchAccountInsights(token, adAccountId),
      fetchActiveAdSetsCount(token, adAccountId),
    ]);

    if (insights) {
      const cpl = insights.costPerLead ?? (insights.leads > 0 ? insights.spend / insights.leads : 0);
      return NextResponse.json({
        source: "meta",
        avgCpl: cpl > 0 ? `$${cpl.toFixed(2)}` : "—",
        leadsThisWeek: insights.leads,
        activeAdSets: activeAdSets ?? 0,
        spend: insights.spend,
        impressions: insights.impressions,
        clicks: insights.clicks,
        ctr: insights.ctr,
        cplTrend: null,
        leadsTrend: null,
        winRateTrend: null,
      });
    }
  } catch (err) {
    console.warn("Meta metrics overview error:", (err as Error).message);
  }

  return NextResponse.json({
    source: "demo",
    avgCpl: "$19.40",
    leadsThisWeek: 89,
    activeAdSets: 8,
    cplTrend: "-12%",
    leadsTrend: "+18%",
    winRateTrend: "+5%",
  });
}
