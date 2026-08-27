import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { geminiRouter } from "./api/gemini";
import { datagovsgRouter, fetchDataGovSg } from "./api/datagovsg";

const app = express();
const PORT = 3000;

app.use(express.json());

// Mount Routers: Data.gov.sg and Gemini
app.use("/api/datagov", datagovsgRouter);
app.use("/api/environment", datagovsgRouter);
app.use("/api/gemini", geminiRouter);

// In-memory cache for API requests to avoid rate limits
interface CacheEntry<T> {
  timestamp: number;
  data: T;
}
const cache: Record<string, CacheEntry<any>> = {};
const CACHE_TTL_MS = 60 * 1000; // 1 minute

async function fetchWithCache<T>(key: string, url: string, fallbackData: T): Promise<T> {
  return fetchDataGovSg(key, url, fallbackData, CACHE_TTL_MS);
}

// Data.gov.sg Fallback structures
const defaultForecasts = [
  { area: "Jurong West", forecast: "Thundery Showers" },
  { area: "Clementi", forecast: "Moderate Rain" },
  { area: "Ang Mo Kio", forecast: "Cloudy" },
  { area: "Bedok", forecast: "Light Rain" },
  { area: "Woodlands", forecast: "Passing Showers" },
  { area: "Marina Bay", forecast: "Fair (Day)" },
  { area: "Orchard", forecast: "Cloudy" },
  { area: "Tampines", forecast: "Thundery Showers" },
  { area: "Changi", forecast: "Fair (Day)" },
  { area: "Bishan", forecast: "Partly Cloudy" },
  { area: "Sentosa", forecast: "Fair (Day)" },
  { area: "Queenstown", forecast: "Light Showers" },
];

const defaultStations = [
  { id: "S109", name: "Ang Mo Kio", lat: 1.3764, lon: 103.8492, rainfall: 0.2 },
  { id: "S117", name: "Jurong West", lat: 1.3458, lon: 103.6817, rainfall: 1.8 },
  { id: "S50", name: "Clementi", lat: 1.3337, lon: 103.7768, rainfall: 0.0 },
  { id: "S107", name: "East Coast / Bedok", lat: 1.3135, lon: 103.9619, rainfall: 0.0 },
  { id: "S104", name: "Woodlands", lat: 1.4438, lon: 103.7853, rainfall: 0.4 },
  { id: "S60", name: "Marina South", lat: 1.2745, lon: 103.8636, rainfall: 0.0 },
  { id: "S111", name: "Scotts Road / Orchard", lat: 1.3087, lon: 103.8314, rainfall: 0.0 },
  { id: "S108", name: "Tampines", lat: 1.3533, lon: 103.9452, rainfall: 2.2 },
];

// Helper: Calculate distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 1. API: Singapore Data.gov.sg aggregator
app.get("/api/weather/singapore", async (req, res) => {
  try {
    const areaQuery = (req.query.area as string) || "Jurong West";
    const userLat = parseFloat(req.query.lat as string);
    const userLon = parseFloat(req.query.lon as string);

    // Parallel fetch from all relevant Data.gov.sg v2 environment APIs
    const [
      forecastRaw,
      rainfallRaw,
      uvRaw,
      windSpeedRaw,
      tempRaw,
      humidityRaw,
      forecast24hRaw,
      forecast4dRaw,
      psiRaw,
      pm25Raw,
    ] = await Promise.all([
      fetchWithCache(
        "sg_forecast_2h",
        "https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast",
        { area_metadata: [], items: [{ forecasts: defaultForecasts }] }
      ),
      fetchWithCache(
        "sg_rainfall",
        "https://api-open.data.gov.sg/v2/real-time/api/rainfall",
        {
          stations: defaultStations,
          readings: [{ data: defaultStations.map((s) => ({ stationId: s.id, value: s.rainfall })) }],
        }
      ),
      fetchWithCache(
        "sg_uv",
        "https://api-open.data.gov.sg/v2/real-time/api/uv",
        { records: [{ index: [{ value: 7.5, hour: new Date().toISOString() }] }] }
      ),
      fetchWithCache(
        "sg_wind_speed",
        "https://api-open.data.gov.sg/v2/real-time/api/wind-speed",
        { stations: [], readings: [{ data: [{ stationId: "S109", value: 14.2 }] }] }
      ),
      fetchWithCache(
        "sg_temp",
        "https://api-open.data.gov.sg/v2/real-time/api/air-temperature",
        { stations: [], readings: [{ data: [{ stationId: "S109", value: 29.8 }] }] }
      ),
      fetchWithCache(
        "sg_humidity",
        "https://api-open.data.gov.sg/v2/real-time/api/relative-humidity",
        { stations: [], readings: [{ data: [{ stationId: "S109", value: 78 }] }] }
      ),
      fetchWithCache(
        "sg_forecast_24h",
        "https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast",
        { records: [] }
      ),
      fetchWithCache(
        "sg_forecast_4d",
        "https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook",
        { records: [] }
      ),
      fetchWithCache(
        "sg_psi",
        "https://api-open.data.gov.sg/v2/real-time/api/psi",
        { regionMetadata: [], items: [] }
      ),
      fetchWithCache(
        "sg_pm25",
        "https://api-open.data.gov.sg/v2/real-time/api/pm25",
        { regionMetadata: [], items: [] }
      ),
    ]);

    // Parse 2-hour forecasts
    const forecastsList: Array<{ area: string; forecast: string }> =
      (forecastRaw as any)?.items?.[0]?.forecasts || defaultForecasts;

    const areaMetaList: Array<{ name: string; label_location?: { latitude: number; longitude: number }; labelLocation?: { latitude: number; longitude: number } }> =
      (forecastRaw as any)?.area_metadata || [];

    let selectedForecast = forecastsList.find(
      (f) => f.area.toLowerCase() === areaQuery.toLowerCase()
    ) || forecastsList.find(
      (f) => f.area.toLowerCase().includes(areaQuery.toLowerCase()) || areaQuery.toLowerCase().includes(f.area.toLowerCase())
    ) || forecastsList[0];

    const areaMeta = areaMetaList.find(
      (a) => a.name.toLowerCase() === selectedForecast.area.toLowerCase()
    ) || areaMetaList.find(
      (a) => a.name.toLowerCase().includes(selectedForecast.area.toLowerCase()) || selectedForecast.area.toLowerCase().includes(a.name.toLowerCase())
    );

    const areaLat = areaMeta?.label_location?.latitude || areaMeta?.labelLocation?.latitude || 1.34039;
    const areaLon = areaMeta?.label_location?.longitude || areaMeta?.labelLocation?.longitude || 103.705;

    const targetLat = !isNaN(userLat) ? userLat : areaLat;
    const targetLon = !isNaN(userLon) ? userLon : areaLon;

    // Helper to extract readings map across v2 ({stationId, value} in readings[0].data) or v1 ({station_id, value} in readings[0].readings)
    const extractReadingsMap = (raw: any): Map<string, number> => {
      const map = new Map<string, number>();
      const readingObj = raw?.readings?.[0] || raw?.items?.[0]?.readings;
      const dataArr = readingObj?.data || readingObj || [];
      if (Array.isArray(dataArr)) {
        for (const item of dataArr) {
          const id = item.stationId || item.station_id;
          const val = typeof item.value === "number" ? item.value : parseFloat(item.value);
          if (id && !isNaN(val)) {
            map.set(id, val);
          }
        }
      }
      return map;
    };

    // Stations & readings matching for rainfall
    const stationsMeta = (rainfallRaw as any)?.stations || (rainfallRaw as any)?.metadata?.stations || defaultStations;
    const readingMap = extractReadingsMap(rainfallRaw);

    const mappedStations = stationsMeta.map((st: any) => ({
      id: st.id,
      name: st.name || st.id,
      lat: st.location ? (st.location.latitude ?? st.location.lat) : st.lat,
      lon: st.location ? (st.location.longitude ?? st.location.lon) : st.lon,
      rainfall: typeof readingMap.get(st.id) === "number" ? readingMap.get(st.id)! : 0,
    }));

    // Find nearest rainfall station using exact target coordinates
    let nearestStation = mappedStations[0];
    let minRainDist = Infinity;
    for (const st of mappedStations) {
      if (typeof st.lat === "number" && typeof st.lon === "number") {
        const d = getDistanceFromLatLonInKm(targetLat, targetLon, st.lat, st.lon);
        if (d < minRainDist) {
          minRainDist = d;
          nearestStation = st;
        }
      }
    }

    // Temperature & Humidity parsing across stations
    const tempStationsMeta = (tempRaw as any)?.stations || (tempRaw as any)?.metadata?.stations || [];
    const tempReadingMap = extractReadingsMap(tempRaw);
    const mappedTempStations = tempStationsMeta.map((st: any) => ({
      id: st.id,
      name: st.name || st.id,
      lat: st.location?.latitude,
      lon: st.location?.longitude,
      value: tempReadingMap.get(st.id) ?? 29.5,
      unit: "°C",
    }));

    let nearestTempStation = mappedTempStations[0];
    let minTempDist = Infinity;
    for (const st of mappedTempStations) {
      if (typeof st.lat === "number" && typeof st.lon === "number") {
        const d = getDistanceFromLatLonInKm(targetLat, targetLon, st.lat, st.lon);
        if (d < minTempDist) {
          minTempDist = d;
          nearestTempStation = st;
        }
      }
    }
    const currentTemp = nearestTempStation ? nearestTempStation.value : 30.2;

    const humStationsMeta = (humidityRaw as any)?.stations || (humidityRaw as any)?.metadata?.stations || [];
    const humReadingMap = extractReadingsMap(humidityRaw);
    const mappedHumStations = humStationsMeta.map((st: any) => ({
      id: st.id,
      name: st.name || st.id,
      lat: st.location?.latitude,
      lon: st.location?.longitude,
      value: humReadingMap.get(st.id) ?? 75,
      unit: "%",
    }));

    let nearestHumStation = mappedHumStations[0];
    let minHumDist = Infinity;
    for (const st of mappedHumStations) {
      if (typeof st.lat === "number" && typeof st.lon === "number") {
        const d = getDistanceFromLatLonInKm(targetLat, targetLon, st.lat, st.lon);
        if (d < minHumDist) {
          minHumDist = d;
          nearestHumStation = st;
        }
      }
    }
    const currentHum = nearestHumStation ? nearestHumStation.value : 78;

    // UV Index calculation
    const uvIndexList = (uvRaw as any)?.records?.[0]?.index || (uvRaw as any)?.items?.[0]?.index || [];
    const latestUv = uvIndexList.length > 0 ? (uvIndexList[uvIndexList.length - 1].value ?? 6.0) : 6.0;

    // Wind speed reading
    const windReadingMap = extractReadingsMap(windSpeedRaw);
    const nearestWindVal = nearestStation ? windReadingMap.get(nearestStation.id) : undefined;
    const firstWindVal = windReadingMap.values().next().value;
    const windSpeedKnots = nearestWindVal ?? firstWindVal ?? 8.0;
    const windSpeedKmH = windSpeedKnots * 1.852; // knots to km/h

    // 24-hour & 4-day forecast parsing (v2 records[0] or v1 items[0])
    const record24h = (forecast24hRaw as any)?.records?.[0];
    const item24h = (forecast24hRaw as any)?.items?.[0];
    const forecast24Hour = record24h
      ? {
          general: {
            forecast: record24h.general?.forecast?.text || record24h.general?.forecast || "Partly Cloudy (Day)",
            relative_humidity: record24h.general?.relativeHumidity || record24h.general?.relative_humidity || { low: 65, high: 90 },
            temperature: record24h.general?.temperature || { low: 25, high: 32 },
            wind: record24h.general?.wind || { speed: { low: 10, high: 20 }, direction: "SSW" },
          },
          periods: (record24h.periods || []).map((p: any) => ({
            time: p.timePeriod || p.time,
            regions: {
              west: p.regions?.west?.text || p.regions?.west || "Partly Cloudy",
              east: p.regions?.east?.text || p.regions?.east || "Partly Cloudy",
              central: p.regions?.central?.text || p.regions?.central || "Partly Cloudy",
              south: p.regions?.south?.text || p.regions?.south || "Partly Cloudy",
              north: p.regions?.north?.text || p.regions?.north || "Partly Cloudy",
            },
          })),
        }
      : item24h
      ? {
          general: item24h.general || {
            forecast: "Fair (Day)",
            relative_humidity: { low: 65, high: 90 },
            temperature: { low: 25, high: 32 },
            wind: { speed: { low: 10, high: 20 }, direction: "SSW" },
          },
          periods: item24h.periods || [],
        }
      : undefined;

    const forecast4dList = (forecast4dRaw as any)?.records?.[0]?.forecasts || (forecast4dRaw as any)?.items?.[0]?.forecasts || [];
    const forecast4Day = forecast4dList.map((f: any) => {
      const forecastText = typeof f.forecast === "string" ? f.forecast : f.forecast?.text || "Showers";
      const dateStr = f.date || f.timestamp || new Date().toISOString();
      return {
        date: dateStr,
        day: f.day || new Date(dateStr).toLocaleDateString("en-SG", { weekday: "short" }),
        forecast: forecastText,
        temperature: f.temperature || { low: 25, high: 32 },
        relative_humidity: f.relativeHumidity || f.relative_humidity || { low: 60, high: 90 },
        wind: f.wind || { speed: { low: 10, high: 20 }, direction: "S" },
      };
    });

    // Air Quality / PSI & PM2.5
    const psiItem = (psiRaw as any)?.items?.[0];
    const pm25Item = (pm25Raw as any)?.items?.[0];
    const airQuality = psiItem || pm25Item
      ? {
          readings: {
            ...(psiItem?.readings || {}),
            ...(pm25Item?.readings || {}),
          },
          updateTimestamp: psiItem?.updatedTimestamp || psiItem?.update_timestamp || new Date().toISOString(),
          status: "normal",
        }
      : undefined;

    // Compute Base Umbrella Index algorithm
    let umbrellaScore = 15;
    const forecastLower = selectedForecast.forecast.toLowerCase();

    if (forecastLower.includes("thundery") || forecastLower.includes("heavy rain") || forecastLower.includes("storm")) {
      umbrellaScore += 75;
    } else if (forecastLower.includes("moderate rain") || forecastLower.includes("showers")) {
      umbrellaScore += 55;
    } else if (forecastLower.includes("light rain") || forecastLower.includes("drizzle") || forecastLower.includes("passing showers")) {
      umbrellaScore += 35;
    } else if (forecastLower.includes("cloudy")) {
      umbrellaScore += 15;
    }

    if (nearestStation && nearestStation.rainfall > 0) {
      umbrellaScore += Math.min(40, nearestStation.rainfall * 12);
    }

    // High UV adds UV umbrella factor!
    if (latestUv >= 8) {
      umbrellaScore += 18;
    } else if (latestUv >= 6) {
      umbrellaScore += 10;
    }

    // High wind warning modifier
    const highWindRisk = windSpeedKmH >= 32;

    // Cap between 5 and 99
    umbrellaScore = Math.max(5, Math.min(99, Math.round(umbrellaScore)));

    res.json({
      location: {
        country: "Singapore",
        region: selectedForecast.area,
        latitude: targetLat,
        longitude: targetLon,
        stationDistanceKm: minRainDist !== Infinity ? Number(minRainDist.toFixed(1)) : 1.2,
      },
      forecast: selectedForecast.forecast,
      allForecasts: forecastsList,
      temperature: Number(currentTemp.toFixed(1)),
      humidity: Number(currentHum.toFixed(0)),
      precipProbability: umbrellaScore > 60 ? 80 : umbrellaScore > 30 ? 45 : 15,
      rainfall: {
        amountMm: nearestStation ? nearestStation.rainfall : 0.0,
        stationName: nearestStation ? nearestStation.name : "Singapore Central",
        stationId: nearestStation ? nearestStation.id : "S00",
        allStations: mappedStations.slice(0, 30),
      },
      uvIndex: {
        value: Number(latestUv.toFixed(1)),
        category: latestUv >= 11 ? "Extreme" : latestUv >= 8 ? "Very High" : latestUv >= 6 ? "High" : latestUv >= 3 ? "Moderate" : "Low",
      },
      wind: {
        speedKmH: Number(windSpeedKmH.toFixed(1)),
        direction: "SSW",
        isHighWind: highWindRisk,
      },
      umbrellaScore,
      dataGovSg: {
        forecast4Day,
        forecast24Hour,
        airQuality,
        stationsTemperature: mappedTempStations.slice(0, 20),
        stationsHumidity: mappedHumStations.slice(0, 20),
        stationsRainfall: mappedStations.slice(0, 30),
      },
    });
  } catch (error: any) {
    console.error("Error in Singapore weather aggregator:", error);
    res.status(500).json({ error: "Failed to aggregate Singapore Data.gov.sg weather", details: error?.message });
  }
});

// 2. API: Global coordinates (Open-Meteo)
app.get("/api/weather/coordinates", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 1.3521;
    const lon = parseFloat(req.query.lon as string) || 103.8198;
    const cityName = (req.query.city as string) || "Current Location";

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&hourly=precipitation_probability,precipitation,uv_index,wind_speed_10m&daily=uv_index_max,precipitation_probability_max&timezone=auto`;

    const weatherData = await fetchWithCache(`coord_${lat.toFixed(2)}_${lon.toFixed(2)}`, url, null);

    if (!weatherData || !weatherData.current) {
      throw new Error("Open-Meteo returned invalid structure");
    }

    const current = weatherData.current;
    const currentPrecipProb = weatherData.hourly?.precipitation_probability?.[0] ?? 20;
    const currentUv = weatherData.hourly?.uv_index?.[0] ?? weatherData.daily?.uv_index_max?.[0] ?? 6.0;
    const windSpeed = current.wind_speed_10m || 10;
    const rainMm = current.precipitation || current.rain || 0;

    // Map weather code to description
    const weatherCode = current.weather_code;
    let forecastText = "Partly Cloudy";
    let isRainy = false;
    if (weatherCode === 0) forecastText = "Clear Sky";
    else if (weatherCode === 1 || weatherCode === 2) forecastText = "Mainly Clear";
    else if (weatherCode === 3) forecastText = "Overcast";
    else if (weatherCode >= 51 && weatherCode <= 55) { forecastText = "Drizzle"; isRainy = true; }
    else if (weatherCode >= 61 && weatherCode <= 65) { forecastText = "Rain Showers"; isRainy = true; }
    else if (weatherCode >= 71 && weatherCode <= 77) { forecastText = "Snowfall"; isRainy = true; }
    else if (weatherCode >= 80 && weatherCode <= 82) { forecastText = "Violent Rain Showers"; isRainy = true; }
    else if (weatherCode >= 95) { forecastText = "Thunderstorm"; isRainy = true; }

    let umbrellaScore = Math.round(currentPrecipProb * 0.7 + (rainMm > 0 ? 30 : 0) + (currentUv >= 8 ? 15 : 0));
    umbrellaScore = Math.max(5, Math.min(99, umbrellaScore));

    res.json({
      location: {
        country: cityName.includes(",") ? cityName.split(",")[1].trim() : "Local",
        region: cityName.split(",")[0].trim(),
        latitude: lat,
        longitude: lon,
      },
      forecast: forecastText,
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      precipProbability: currentPrecipProb,
      rainfall: {
        amountMm: rainMm,
        stationName: cityName,
        stationId: "GEO",
      },
      uvIndex: {
        value: Number(currentUv.toFixed(1)),
        category: currentUv >= 11 ? "Extreme" : currentUv >= 8 ? "Very High" : currentUv >= 6 ? "High" : currentUv >= 3 ? "Moderate" : "Low",
      },
      wind: {
        speedKmH: Number(windSpeed.toFixed(1)),
        isHighWind: windSpeed >= 35,
      },
      umbrellaScore,
      hourlyForecast: (weatherData.hourly?.precipitation_probability || []).slice(0, 12).map((prob: number, idx: number) => ({
        hour: `${idx + 1}h`,
        prob,
        rain: weatherData.hourly?.precipitation?.[idx] || 0,
        uv: weatherData.hourly?.uv_index?.[idx] || 0,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Coordinate weather error:", err);
    res.status(500).json({ error: "Failed to fetch coordinates weather", details: err.message });
  }
});

// 4. Vite Dev & Production Fallbacks
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Brolly server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
