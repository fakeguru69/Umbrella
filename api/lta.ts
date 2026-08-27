import { Router, Request, Response } from "express";

export const ltaRouter = Router();

// Guardrail: Any API key, token, or credential is read ONLY inside files in the repo-root api/ directory
function getLtaAccountKey(): string | null {
  const key =
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.DATAMALL_ACCOUNT_KEY ||
    null;

  if (
    !key ||
    key.trim() === "" ||
    key.includes("MY_LTA_DATAMALL_ACCOUNT_KEY") ||
    key.startsWith("MY_") ||
    key === "your_api_key_here"
  ) {
    return null;
  }
  return key.trim();
}

// In-memory cache for LTA endpoints to respect rate limits
interface CacheItem<T> {
  timestamp: number;
  data: T;
}
const ltaCache: Record<string, CacheItem<any>> = {};

async function fetchLtaData<T>(
  cacheKey: string,
  url: string,
  ttlMs: number = 20000
): Promise<{ data?: T; status: number; error?: string }> {
  const accountKey = getLtaAccountKey();
  if (!accountKey) {
    return { status: 500, error: "credential not configured" };
  }

  const now = Date.now();
  if (ltaCache[cacheKey] && now - ltaCache[cacheKey].timestamp < ttlMs) {
    return { data: ltaCache[cacheKey].data, status: 200 };
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        AccountKey: accountKey,
        Accept: "application/json",
      },
    });

    const rawText = await res.text();

    if (!res.ok) {
      if (rawText.includes("The page cannot be displayed") || rawText.includes("<html") || rawText.includes("<!DOCTYPE")) {
        return {
          status: res.status === 200 ? 401 : res.status,
          error: `LTA DataMall rejected the request (${res.status}). Please verify that your LTA_DATAMALL_ACCOUNT_KEY is valid.`,
        };
      }
      return {
        status: res.status,
        error: `LTA DataMall API responded with status ${res.status}: ${rawText.slice(0, 200)}`,
      };
    }

    // Attempt JSON parse safely
    let json: T;
    try {
      json = JSON.parse(rawText) as T;
    } catch (parseErr: any) {
      return {
        status: 502,
        error: `LTA DataMall returned an unexpected non-JSON response. Please verify that your LTA_DATAMALL_ACCOUNT_KEY is active and valid at datamall.lta.gov.sg`,
      };
    }

    ltaCache[cacheKey] = { timestamp: now, data: json };
    return { data: json, status: 200 };
  } catch (err: any) {
    return {
      status: 502,
      error: `Failed to connect to LTA DataMall: ${err.message || err}`,
    };
  }
}

// 1. Next buses at a stop (v3 - current version; 20-second refresh)
// URL: https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=83139 (&ServiceNo=15)
ltaRouter.get("/bus-arrival", async (req: Request, res: Response) => {
  const busStopCode = (req.query.BusStopCode as string) || (req.query.busStopCode as string) || "83139";
  const serviceNo = (req.query.ServiceNo as string) || (req.query.serviceNo as string) || "";

  let url = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode)}`;
  if (serviceNo.trim()) {
    url += `&ServiceNo=${encodeURIComponent(serviceNo.trim())}`;
  }

  const cacheKey = `bus_arrival_${busStopCode}_${serviceNo}`;
  const result = await fetchLtaData(cacheKey, url, 15000); // 15-20s cache

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.json(result.data);
});

// 2. Live carpark lots (HDB + LTA + URA)
// URL: https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
ltaRouter.get("/carparks", async (req: Request, res: Response) => {
  const url = "https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2";
  const cacheKey = "lta_carparks_v2";
  const result = await fetchLtaData(cacheKey, url, 60000); // 1 minute cache

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.json(result.data);
});

// 3. Traffic Incidents
// URL: https://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents
ltaRouter.get("/traffic-incidents", async (req: Request, res: Response) => {
  const url = "https://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents";
  const cacheKey = "lta_traffic_incidents";
  const result = await fetchLtaData(cacheKey, url, 30000); // 30s cache

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.json(result.data);
});

// 4. Train Service Alerts / MRT & LRT Status
// URL: https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts
ltaRouter.get("/train-alerts", async (req: Request, res: Response) => {
  const url = "https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts";
  const cacheKey = "lta_train_alerts";
  const result = await fetchLtaData(cacheKey, url, 30000); // 30s cache

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.json(result.data);
});
