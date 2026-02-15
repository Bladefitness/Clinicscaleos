/**
 * Meta Marketing API client for fetching ad account insights.
 * Docs: https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights/
 */

const API_VERSION = "v21.0";
const BASE = `https://graph.facebook.com/${API_VERSION}`;

export interface MetaConfig {
  token: string;
  accountId?: string | null;
}

function getConfig(override?: MetaConfig | null): MetaConfig | null {
  if (override?.token && override.token.length > 20) {
    return { token: override.token, accountId: override.accountId ?? undefined };
  }
  const token = process.env.META_ACCESS_TOKEN;
  const accountId = process.env.META_AD_ACCOUNT_ID;
  if (!token || token.length < 20) return null;
  return { token, accountId: accountId || undefined };
}

/** Fetch ad accounts for the user (when accountId not provided) */
export async function fetchAdAccounts(cfgOverride?: MetaConfig | null): Promise<string | null> {
  const cfg = getConfig(cfgOverride);
  if (!cfg) return null;
  try {
    const url = `${BASE}/me/adaccounts?fields=id,name,account_id&access_token=${encodeURIComponent(cfg.token)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.error) {
      console.warn("Meta ad accounts error:", json.error?.message);
      return null;
    }
    const accounts = json.data || [];
    return accounts.length > 0 ? accounts[0].id : null; // id is "act_123456789"
  } catch (err) {
    console.warn("Meta fetchAdAccounts error:", (err as Error).message);
    return null;
  }
}

/** Resolve ad account ID: use provided config or env, else fetch first account */
async function resolveAccountId(cfgOverride?: MetaConfig | null): Promise<string | null> {
  const cfg = getConfig(cfgOverride);
  if (!cfg) return null;
  if (cfg.accountId && String(cfg.accountId).startsWith("act_")) return cfg.accountId;
  return fetchAdAccounts(cfgOverride);
}

export interface MetaInsightsSummary {
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  leads: number;
  costPerLead: number | null;
}

/** Fetch account-level insights for the last 7 days */
export async function fetchAccountInsights(cfgOverride?: MetaConfig | null): Promise<MetaInsightsSummary | null> {
  const accountId = await resolveAccountId(cfgOverride);
  if (!accountId) return null;

  const cfg = getConfig(cfgOverride);
  if (!cfg) return null;

  try {
    const fields = [
      "spend",
      "impressions",
      "clicks",
      "ctr",
      "cpc",
      "cpm",
      "actions",
      "action_values",
    ].join(",");
    const url = `${BASE}/${accountId}/insights?fields=${fields}&time_preset=last_7d&access_token=${encodeURIComponent(cfg.token)}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.error) {
      console.warn("Meta insights error:", json.error?.message, json.error?.code);
      return null;
    }

    const data = Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];
    if (data.length === 0) {
      return {
        spend: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        leads: 0,
        costPerLead: null,
      };
    }

    // Aggregate if multiple rows (e.g. daily breakdown)
    let spend = 0;
    let impressions = 0;
    let clicks = 0;
    let leads = 0;
    for (const row of data) {
      spend += parseFloat(row.spend || "0");
      impressions += parseInt(row.impressions || "0", 10);
      clicks += parseInt(row.clicks || "0", 10);
      const actions = row.actions || [];
      const leadAction = actions.find((a: { action_type?: string }) => a.action_type === "lead");
      if (leadAction && leadAction.value) {
        leads += parseInt(String(leadAction.value), 10);
      }
    }

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const costPerLead = leads > 0 ? spend / leads : null;

    return {
      spend,
      impressions,
      clicks,
      ctr: Math.round(ctr * 100) / 100,
      cpc: Math.round(cpc * 100) / 100,
      cpm: Math.round(cpm * 100) / 100,
      leads,
      costPerLead: costPerLead != null ? Math.round(costPerLead * 100) / 100 : null,
    };
  } catch (err) {
    console.warn("Meta fetchAccountInsights error:", (err as Error).message);
    return null;
  }
}

/** Fetch active ad sets count */
export async function fetchActiveAdSetsCount(cfgOverride?: MetaConfig | null): Promise<number | null> {
  const accountId = await resolveAccountId(cfgOverride);
  if (!accountId) return null;

  const cfg = getConfig(cfgOverride);
  if (!cfg) return null;

  try {
    const url = `${BASE}/${accountId}/adsets?fields=id&filtering=[{"field":"effective_status","operator":"IN","value":["ACTIVE","PAUSED"]}]&limit=500&access_token=${encodeURIComponent(cfg.token)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.error) return null;
    const data = json.data || [];
    return data.length;
  } catch {
    return null;
  }
}
