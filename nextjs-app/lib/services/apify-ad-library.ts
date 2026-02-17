/**
 * Apify Facebook Ad Library scraper client.
 * Uses Apify's REST API to run the Facebook Ad Library scraper actor
 * and return structured ad results.
 */

const APIFY_BASE_URL = "https://api.apify.com/v2";
const AD_LIBRARY_ACTOR_ID = "apify~facebook-ads-scraper";

interface AdLibrarySearchParams {
  searchTerms: string;
  country?: string;
  adType?: string;
  activeStatus?: string;
}

export interface AdLibraryResult {
  adId: string;
  advertiserName: string;
  pageId: string;
  adBody: string;
  adTitle: string;
  adCreativeUrl: string;
  adSnapshotUrl: string;
  platform: string;
  startDate: string;
  isActive: boolean;
  category: string;
}

function getApifyToken(): string {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_API_TOKEN not configured. Add it to your .env file.");
  }
  return token;
}

/**
 * Search the Facebook Ad Library via Apify scraper.
 * Starts an actor run, waits for completion, then fetches results.
 */
export async function searchAdLibrary(params: AdLibrarySearchParams): Promise<AdLibraryResult[]> {
  const token = getApifyToken();

  // Start the actor run
  const runResponse = await fetch(
    `${APIFY_BASE_URL}/acts/${AD_LIBRARY_ACTOR_ID}/runs?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        search_terms: params.searchTerms,
        country: params.country || "US",
        ad_type: params.adType || "all",
        ad_active_status: params.activeStatus || "active",
        max_ads: 30,
      }),
    }
  );

  if (!runResponse.ok) {
    const errorText = await runResponse.text();
    throw new Error(`Apify actor start failed: ${runResponse.status} - ${errorText}`);
  }

  const runData = await runResponse.json() as { data: { id: string } };
  const runId = runData.data.id;

  // Poll for completion (max 2 minutes)
  const maxWait = 120_000;
  const pollInterval = 3_000;
  let elapsed = 0;

  while (elapsed < maxWait) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    elapsed += pollInterval;

    const statusResponse = await fetch(
      `${APIFY_BASE_URL}/actor-runs/${runId}?token=${token}`
    );
    const statusData = await statusResponse.json() as { data: { status: string } };

    if (statusData.data.status === "SUCCEEDED") {
      break;
    }
    if (statusData.data.status === "FAILED" || statusData.data.status === "ABORTED") {
      throw new Error(`Apify actor run ${statusData.data.status}`);
    }
  }

  if (elapsed >= maxWait) {
    throw new Error("Apify actor run timed out after 2 minutes");
  }

  // Fetch results from the dataset
  const datasetResponse = await fetch(
    `${APIFY_BASE_URL}/actor-runs/${runId}/dataset/items?token=${token}&format=json`
  );

  if (!datasetResponse.ok) {
    throw new Error(`Failed to fetch Apify results: ${datasetResponse.status}`);
  }

  const rawResults = await datasetResponse.json() as Record<string, unknown>[];

  // Normalize results to our standard format
  return rawResults.map((item): AdLibraryResult => ({
    adId: String(item.ad_id || item.id || ""),
    advertiserName: String(item.page_name || item.advertiser_name || "Unknown"),
    pageId: String(item.page_id || ""),
    adBody: String(item.ad_creative_body || item.body || ""),
    adTitle: String(item.ad_creative_link_title || item.title || ""),
    adCreativeUrl: String(item.ad_creative_link_image || item.image_url || ""),
    adSnapshotUrl: String(item.ad_snapshot_url || item.snapshot_url || ""),
    platform: String(item.publisher_platforms || "facebook"),
    startDate: String(item.ad_delivery_start_time || item.start_date || ""),
    isActive: item.ad_active_status === "ACTIVE" || item.is_active === true,
    category: String(item.ad_category || item.category || ""),
  }));
}

/**
 * Check if Apify is configured.
 */
export function isApifyConfigured(): boolean {
  return !!process.env.APIFY_API_TOKEN;
}
