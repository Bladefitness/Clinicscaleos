/**
 * Meta Marketing API client for Facebook/Instagram ads
 */

export interface MetaAdCreativeOptions {
  adAccountId: string;
  pageId: string;
  message: string;
  imageUrl?: string;
  videoUrl?: string;
  link?: string;
  callToAction?: string;
}

export interface MetaAdCampaignOptions {
  adAccountId: string;
  name: string;
  objective: string;
  status?: string;
  specialAdCategories?: string[];
}

export interface MetaAdSetOptions {
  adAccountId: string;
  campaignId: string;
  name: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  billingEvent?: string;
  optimizationGoal?: string;
  targeting?: Record<string, unknown>;
  status?: string;
}

export interface MetaAdOptions {
  adAccountId: string;
  adSetId: string;
  creativeId: string;
  name: string;
  status?: string;
}

function getAccessToken(token?: string): string {
  const t = token || process.env.META_ACCESS_TOKEN;
  if (!t) {
    throw new Error("META_ACCESS_TOKEN not set. Add it to environment variables.");
  }
  return t;
}

const GRAPH_API_VERSION = "v21.0";
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

async function graphRequest(
  endpoint: string,
  method: string,
  body?: Record<string, unknown>,
  accessToken?: string
): Promise<any> {
  const token = getAccessToken(accessToken);
  const url = `${GRAPH_API_BASE}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const params = new URLSearchParams({ access_token: token });

  if (body && method === "POST") {
    Object.entries(body).forEach(([key, value]) => {
      params.append(key, typeof value === "string" ? value : JSON.stringify(value));
    });
  }

  const finalUrl = method === "GET" ? `${url}?${params}` : url;
  if (method === "POST") {
    options.body = params;
    options.headers = { "Content-Type": "application/x-www-form-urlencoded" };
  }

  const res = await fetch(finalUrl, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meta API request failed (${res.status}): ${text.slice(0, 300)}`);
  }

  return res.json();
}

export async function createAdCreative(
  options: MetaAdCreativeOptions
): Promise<{ id: string }> {
  const {
    adAccountId,
    pageId,
    message,
    imageUrl,
    videoUrl,
    link,
    callToAction = "LEARN_MORE",
  } = options;

  const objectStorySpec: Record<string, unknown> = {
    page_id: pageId,
    link_data: {
      message,
      link: link || "https://example.com",
      call_to_action: {
        type: callToAction,
      },
    },
  };

  if (imageUrl) {
    (objectStorySpec.link_data as Record<string, unknown>).picture = imageUrl;
  }

  if (videoUrl) {
    (objectStorySpec.link_data as Record<string, unknown>).video_id = videoUrl;
  }

  const body = {
    object_story_spec: objectStorySpec,
  };

  return graphRequest(`/act_${adAccountId}/adcreatives`, "POST", body);
}

export async function createCampaign(
  options: MetaAdCampaignOptions
): Promise<{ id: string }> {
  const {
    adAccountId,
    name,
    objective,
    status = "PAUSED",
    specialAdCategories = [],
  } = options;

  const body = {
    name,
    objective,
    status,
    special_ad_categories: specialAdCategories,
  };

  return graphRequest(`/act_${adAccountId}/campaigns`, "POST", body);
}

export async function createAdSet(options: MetaAdSetOptions): Promise<{ id: string }> {
  const {
    adAccountId,
    campaignId,
    name,
    dailyBudget,
    lifetimeBudget,
    billingEvent = "IMPRESSIONS",
    optimizationGoal = "REACH",
    targeting = { geo_locations: { countries: ["US"] } },
    status = "PAUSED",
  } = options;

  const body: Record<string, unknown> = {
    name,
    campaign_id: campaignId,
    billing_event: billingEvent,
    optimization_goal: optimizationGoal,
    targeting,
    status,
  };

  if (dailyBudget) {
    body.daily_budget = dailyBudget;
  }
  if (lifetimeBudget) {
    body.lifetime_budget = lifetimeBudget;
  }

  return graphRequest(`/act_${adAccountId}/adsets`, "POST", body);
}

export async function createAd(options: MetaAdOptions): Promise<{ id: string }> {
  const { adAccountId, adSetId, creativeId, name, status = "PAUSED" } = options;

  const body = {
    name,
    adset_id: adSetId,
    creative: { creative_id: creativeId },
    status,
  };

  return graphRequest(`/act_${adAccountId}/ads`, "POST", body);
}

export async function getAdInsights(
  adId: string,
  fields: string[] = ["impressions", "clicks", "spend", "cpc", "cpm", "ctr"]
): Promise<any> {
  const fieldsParam = fields.join(",");
  return graphRequest(`/${adId}/insights?fields=${fieldsParam}`, "GET");
}

export async function getAdAccountInfo(adAccountId: string): Promise<any> {
  return graphRequest(
    `/act_${adAccountId}?fields=name,account_id,account_status,currency,timezone_name`,
    "GET"
  );
}

export interface AccountInsights {
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  ctr: number;
  costPerLead: number | null;
}

export async function fetchAccountInsights(
  token?: string,
  accountId?: string
): Promise<AccountInsights | null> {
  try {
    const adAccountId = accountId || process.env.META_AD_ACCOUNT_ID;
    if (!adAccountId) {
      console.warn("META_AD_ACCOUNT_ID not configured");
      return null;
    }

    const fields = ["spend", "impressions", "clicks", "actions", "ctr"];
    const data = await graphRequest(
      `/act_${adAccountId}/insights?fields=${fields.join(",")}&time_range={"since":"7 days ago","until":"today"}`,
      "GET",
      undefined,
      token
    );

    if (!data?.data?.[0]) return null;

    const insight = data.data[0];
    const leads = insight.actions?.find((a: any) => a.action_type === "lead")?.value || 0;
    const spend = parseFloat(insight.spend || "0");
    const costPerLead = leads > 0 ? spend / leads : null;

    return {
      spend,
      impressions: parseInt(insight.impressions || "0", 10),
      clicks: parseInt(insight.clicks || "0", 10),
      leads: parseInt(leads, 10),
      ctr: parseFloat(insight.ctr || "0"),
      costPerLead,
    };
  } catch (err) {
    console.error("fetchAccountInsights error:", err);
    return null;
  }
}

export async function fetchActiveAdSetsCount(
  token?: string,
  accountId?: string
): Promise<number | null> {
  try {
    const adAccountId = accountId || process.env.META_AD_ACCOUNT_ID;
    if (!adAccountId) return null;

    const data = await graphRequest(
      `/act_${adAccountId}/adsets?filtering=[{"field":"effective_status","operator":"IN","value":["ACTIVE"]}]&fields=id`,
      "GET",
      undefined,
      token
    );

    return data?.data?.length || 0;
  } catch (err) {
    console.error("fetchActiveAdSetsCount error:", err);
    return null;
  }
}
