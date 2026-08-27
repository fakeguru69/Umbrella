import { Router, Request, Response } from "express";

export const datagovsgRouter = Router();

// Guardrail: Any API key or token is read ONLY inside files in repo-root api/ directory
function getDataGovSgApiKey(): string | null {
  const key =
    process.env.DATA_GOV_SG_API_KEY ||
    process.env.DATAGOV_API_KEY ||
    null;

  if (
    !key ||
    key.trim() === "" ||
    key.startsWith("MY_") ||
    key === "your_api_key_here"
  ) {
    return null;
  }
  return key.trim();
}

// In-memory cache for Data.gov.sg endpoints (60 seconds TTL)
interface CacheItem<T> {
  timestamp: number;
  data: T;
}
const dataGovCache: Record<string, CacheItem<any>> = {};
const DEFAULT_TTL_MS = 60 * 1000; // 1 minute cache

export async function fetchDataGovSg<T>(
  cacheKey: string,
  url: string,
  fallbackData: T,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const now = Date.now();
  if (dataGovCache[cacheKey] && now - dataGovCache[cacheKey].timestamp < ttlMs) {
    return dataGovCache[cacheKey].data as T;
  }

  const apiKey = getDataGovSgApiKey();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (apiKey) {
    headers["api-key"] = apiKey;
    headers["Authorization"] = apiKey;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`[data.gov.sg] ${url} responded with status: ${res.status}`);
      if (dataGovCache[cacheKey]) return dataGovCache[cacheKey].data;
      return fallbackData;
    }
    const rawJson = await res.json();
    
    // Check if it's a v2 rate-limit error or errorMsg
    if (rawJson?.code === 24 || (rawJson?.code !== undefined && rawJson?.code !== 0)) {
      console.warn(`[data.gov.sg] ${url} rate-limit / code: ${rawJson?.code} (${rawJson?.errorMsg || rawJson?.name})`);
      if (dataGovCache[cacheKey]) return dataGovCache[cacheKey].data;
      return fallbackData;
    }

    // Auto-unwrap v2 wrapped { code: 0, data: { ... } } responses if data exists
    let unwrapped: T;
    if (rawJson && typeof rawJson === "object" && "data" in rawJson && rawJson.data !== null && rawJson.data !== undefined) {
      unwrapped = rawJson.data as T;
    } else {
      unwrapped = rawJson as T;
    }

    dataGovCache[cacheKey] = { timestamp: now, data: unwrapped };
    return unwrapped;
  } catch (err: any) {
    console.error(`[data.gov.sg] Fetch failed for ${url}:`, err.message || err);
    if (dataGovCache[cacheKey]) return dataGovCache[cacheKey].data;
    return fallbackData;
  }
}

// 1. 2-Hour Weather Forecast (47 areas) - v2 keyless
datagovsgRouter.get("/2-hour-forecast", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_2h_forecast",
    "https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast",
    { area_metadata: [], items: [] }
  );
  return res.json(data);
});

// 2. 24-Hour Weather Forecast (Regional & General) - v2 keyless
datagovsgRouter.get("/24-hour-forecast", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_24h_forecast",
    "https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast",
    { records: [] }
  );
  return res.json(data);
});

// 3. 4-Day Weather Outlook - v2 keyless
datagovsgRouter.get("/4-day-forecast", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_4d_forecast",
    "https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook",
    { records: [] }
  );
  return res.json(data);
});

// 4. Air Temperature across stations (°C) - v2 keyless
datagovsgRouter.get("/air-temperature", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_air_temp",
    "https://api-open.data.gov.sg/v2/real-time/api/air-temperature",
    { stations: [], readings: [] }
  );
  return res.json(data);
});

// 5. Islandwide Rainfall readings (mm) - v2 keyless
datagovsgRouter.get("/rainfall", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_rainfall",
    "https://api-open.data.gov.sg/v2/real-time/api/rainfall",
    { stations: [], readings: [] }
  );
  return res.json(data);
});

// 6. PSI Telemetry - v2 keyless
datagovsgRouter.get("/psi", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_psi",
    "https://api-open.data.gov.sg/v2/real-time/api/psi",
    { regionMetadata: [], items: [] }
  );
  return res.json(data);
});

// 7. PM2.5 Telemetry - v2 keyless
datagovsgRouter.get("/pm25", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_pm25",
    "https://api-open.data.gov.sg/v2/real-time/api/pm25",
    { regionMetadata: [], items: [] }
  );
  return res.json(data);
});

// 8. UV Index (hourly readings) - v2 keyless
datagovsgRouter.get("/uv-index", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_uv",
    "https://api-open.data.gov.sg/v2/real-time/api/uv",
    { records: [] }
  );
  return res.json(data);
});

// 9. Relative Humidity across stations (%) - v2 keyless
datagovsgRouter.get("/relative-humidity", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_humidity",
    "https://api-open.data.gov.sg/v2/real-time/api/relative-humidity",
    { stations: [], readings: [] }
  );
  return res.json(data);
});

// 10. Wind Speed across stations - v2 keyless
datagovsgRouter.get("/wind-speed", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_wind_speed",
    "https://api-open.data.gov.sg/v2/real-time/api/wind-speed",
    { stations: [], readings: [] }
  );
  return res.json(data);
});

// Combined PSI & PM2.5 helper
datagovsgRouter.get("/psi-pm25", async (req: Request, res: Response) => {
  const [psi, pm25] = await Promise.all([
    fetchDataGovSg("datagov_psi", "https://api-open.data.gov.sg/v2/real-time/api/psi", { regionMetadata: [], items: [] }),
    fetchDataGovSg("datagov_pm25", "https://api-open.data.gov.sg/v2/real-time/api/pm25", { regionMetadata: [], items: [] }),
  ]);
  return res.json({ psi, pm25 });
});

// 11. Carpark Availability (v1 host ONLY - bare responses)
datagovsgRouter.get("/carpark-availability", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_carpark_v1",
    "https://api.data.gov.sg/v1/transport/carpark-availability",
    { items: [] },
    60 * 1000 // 1 min cache
  );
  return res.json(data);
});

// 12. Taxi Availability (v1 host ONLY - bare responses)
datagovsgRouter.get("/taxi-availability", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_taxi_v1",
    "https://api.data.gov.sg/v1/transport/taxi-availability",
    { type: "FeatureCollection", features: [] },
    60 * 1000 // 1 min cache
  );
  return res.json(data);
});

// 13. Aggregated Complete Singapore Environmental & Weather Telemetry
datagovsgRouter.get("/all-telemetry", async (req: Request, res: Response) => {
  const [
    forecast2h,
    forecast24h,
    forecast4d,
    airTemp,
    humidity,
    rainfall,
    windSpeed,
    uv,
    psi,
    pm25,
  ] = await Promise.all([
    fetchDataGovSg("datagov_2h_forecast", "https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast", { area_metadata: [], items: [] }),
    fetchDataGovSg("datagov_24h_forecast", "https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast", { records: [] }),
    fetchDataGovSg("datagov_4d_forecast", "https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook", { records: [] }),
    fetchDataGovSg("datagov_air_temp", "https://api-open.data.gov.sg/v2/real-time/api/air-temperature", { stations: [], readings: [] }),
    fetchDataGovSg("datagov_humidity", "https://api-open.data.gov.sg/v2/real-time/api/relative-humidity", { stations: [], readings: [] }),
    fetchDataGovSg("datagov_rainfall", "https://api-open.data.gov.sg/v2/real-time/api/rainfall", { stations: [], readings: [] }),
    fetchDataGovSg("datagov_wind_speed", "https://api-open.data.gov.sg/v2/real-time/api/wind-speed", { stations: [], readings: [] }),
    fetchDataGovSg("datagov_uv", "https://api-open.data.gov.sg/v2/real-time/api/uv", { records: [] }),
    fetchDataGovSg("datagov_psi", "https://api-open.data.gov.sg/v2/real-time/api/psi", { regionMetadata: [], items: [] }),
    fetchDataGovSg("datagov_pm25", "https://api-open.data.gov.sg/v2/real-time/api/pm25", { regionMetadata: [], items: [] }),
  ]);

  return res.json({
    forecast2h,
    forecast24h,
    forecast4d,
    airTemp,
    humidity,
    rainfall,
    windSpeed,
    uv,
    psi,
    pm25,
    fetchedAt: new Date().toISOString(),
  });
});

