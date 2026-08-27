import { Router, Request, Response } from "express";

export const datagovsgRouter = Router();

// Guardrail: Any API key or token is read ONLY inside files in repo-root api/ directory
function getDataGovSgApiKey(): string | null {
  return (
    process.env.DATA_GOV_SG_API_KEY ||
    process.env.DATAGOV_API_KEY ||
    null
  );
}

// In-memory cache for Data.gov.sg endpoints
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
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`[data.gov.sg] ${url} responded with status: ${res.status}`);
      if (dataGovCache[cacheKey]) return dataGovCache[cacheKey].data;
      return fallbackData;
    }
    const data = (await res.json()) as T;
    dataGovCache[cacheKey] = { timestamp: now, data };
    return data;
  } catch (err: any) {
    console.error(`[data.gov.sg] Fetch failed for ${url}:`, err.message || err);
    if (dataGovCache[cacheKey]) return dataGovCache[cacheKey].data;
    return fallbackData;
  }
}

// 1. 2-Hour Weather Forecast (47 areas)
datagovsgRouter.get("/2-hour-forecast", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_2h_forecast",
    "https://api.data.gov.sg/v1/environment/2-hour-weather-forecast",
    { items: [] }
  );
  return res.json(data);
});

// 2. 24-Hour Weather Forecast (Regional: North, South, East, West, Central + General)
datagovsgRouter.get("/24-hour-forecast", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_24h_forecast",
    "https://api.data.gov.sg/v1/environment/24-hour-weather-forecast",
    { items: [] }
  );
  return res.json(data);
});

// 3. 4-Day Weather Forecast
datagovsgRouter.get("/4-day-forecast", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_4d_forecast",
    "https://api.data.gov.sg/v1/environment/4-day-weather-forecast",
    { items: [] }
  );
  return res.json(data);
});

// 4. Air Temperature across stations (°C)
datagovsgRouter.get("/air-temperature", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_air_temp",
    "https://api.data.gov.sg/v1/environment/air-temperature",
    { metadata: { stations: [] }, items: [] }
  );
  return res.json(data);
});

// 5. Relative Humidity across stations (%)
datagovsgRouter.get("/relative-humidity", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_humidity",
    "https://api.data.gov.sg/v1/environment/relative-humidity",
    { metadata: { stations: [] }, items: [] }
  );
  return res.json(data);
});

// 6. Islandwide Rainfall readings (mm)
datagovsgRouter.get("/rainfall", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_rainfall",
    "https://api.data.gov.sg/v1/environment/rainfall",
    { metadata: { stations: [] }, items: [] }
  );
  return res.json(data);
});

// 7. Wind Speed & Wind Direction
datagovsgRouter.get("/wind", async (req: Request, res: Response) => {
  const [speedData, dirData] = await Promise.all([
    fetchDataGovSg("datagov_wind_speed", "https://api.data.gov.sg/v1/environment/wind-speed", { items: [] }),
    fetchDataGovSg("datagov_wind_dir", "https://api.data.gov.sg/v1/environment/wind-direction", { items: [] }),
  ]);
  return res.json({ speed: speedData, direction: dirData });
});

// 8. UV Index (hourly readings)
datagovsgRouter.get("/uv-index", async (req: Request, res: Response) => {
  const data = await fetchDataGovSg(
    "datagov_uv",
    "https://api.data.gov.sg/v1/environment/uv-index",
    { items: [] }
  );
  return res.json(data);
});

// 9. PSI & PM2.5 Air Quality Telemetry
datagovsgRouter.get("/psi-pm25", async (req: Request, res: Response) => {
  const [psiData, pm25Data] = await Promise.all([
    fetchDataGovSg("datagov_psi", "https://api.data.gov.sg/v1/environment/psi", { items: [], region_metadata: [] }),
    fetchDataGovSg("datagov_pm25", "https://api.data.gov.sg/v1/environment/pm25", { items: [], region_metadata: [] }),
  ]);
  return res.json({ psi: psiData, pm25: pm25Data });
});

// 10. Aggregated Complete Singapore Environmental & Weather Telemetry
datagovsgRouter.get("/all-telemetry", async (req: Request, res: Response) => {
  const [forecast2h, forecast24h, forecast4d, airTemp, humidity, rainfall, windSpeed, uv, psi] =
    await Promise.all([
      fetchDataGovSg("datagov_2h_forecast", "https://api.data.gov.sg/v1/environment/2-hour-weather-forecast", { items: [] }),
      fetchDataGovSg("datagov_24h_forecast", "https://api.data.gov.sg/v1/environment/24-hour-weather-forecast", { items: [] }),
      fetchDataGovSg("datagov_4d_forecast", "https://api.data.gov.sg/v1/environment/4-day-weather-forecast", { items: [] }),
      fetchDataGovSg("datagov_air_temp", "https://api.data.gov.sg/v1/environment/air-temperature", { metadata: { stations: [] }, items: [] }),
      fetchDataGovSg("datagov_humidity", "https://api.data.gov.sg/v1/environment/relative-humidity", { metadata: { stations: [] }, items: [] }),
      fetchDataGovSg("datagov_rainfall", "https://api.data.gov.sg/v1/environment/rainfall", { metadata: { stations: [] }, items: [] }),
      fetchDataGovSg("datagov_wind_speed", "https://api.data.gov.sg/v1/environment/wind-speed", { items: [] }),
      fetchDataGovSg("datagov_uv", "https://api.data.gov.sg/v1/environment/uv-index", { items: [] }),
      fetchDataGovSg("datagov_psi", "https://api.data.gov.sg/v1/environment/psi", { items: [] }),
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
    fetchedAt: new Date().toISOString(),
  });
});
