import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ltaRouter } from "./api/lta";
import { geminiRouter } from "./api/gemini";
import { datagovsgRouter, fetchDataGovSg } from "./api/datagovsg";

const app = express();
const PORT = 3000;

app.use(express.json());

// Mount Routers: LTA DataMall 2.0, Data.gov.sg, and Gemini
app.use("/api/lta", ltaRouter);
app.use("/api/transport", ltaRouter);
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

    // Parallel fetch from all relevant Data.gov.sg environment APIs
    const [
      forecastRaw,
      rainfallRaw,
      uvRaw,
      windSpeedRaw,
      windDirRaw,
      tempRaw,
      humidityRaw,
      forecast24hRaw,
      forecast4dRaw,
      psiRaw,
    ] = await Promise.all([
      fetchWithCache(
        "sg_forecast_2h",
        "https://api.data.gov.sg/v1/environment/2-hour-weather-forecast",
        { items: [{ forecasts: defaultForecasts }] }
      ),
      fetchWithCache(
        "sg_rainfall",
        "https://api.data.gov.sg/v1/environment/rainfall",
        {
          metadata: { stations: defaultStations },
          items: [{ readings: defaultStations.map((s) => ({ station_id: s.id, value: s.rainfall })) }],
        }
      ),
      fetchWithCache(
        "sg_uv",
        "https://api.data.gov.sg/v1/environment/uv-index",
        { items: [{ index: [{ value: 8.4, timestamp: new Date().toISOString() }] }] }
      ),
      fetchWithCache(
        "sg_wind_speed",
        "https://api.data.gov.sg/v1/environment/wind-speed",
        { items: [{ readings: [{ station_id: "S109", value: 14.2 }] }] }
      ),
      fetchWithCache(
        "sg_wind_dir",
        "https://api.data.gov.sg/v1/environment/wind-direction",
        { items: [{ readings: [{ station_id: "S109", value: 180 }] }] }
      ),
      fetchWithCache(
        "sg_temp",
        "https://api.data.gov.sg/v1/environment/air-temperature",
        { metadata: { stations: [] }, items: [{ readings: [{ station_id: "S109", value: 29.8 }] }] }
      ),
      fetchWithCache(
        "sg_humidity",
        "https://api.data.gov.sg/v1/environment/relative-humidity",
        { metadata: { stations: [] }, items: [{ readings: [{ station_id: "S109", value: 78 }] }] }
      ),
      fetchWithCache(
        "sg_forecast_24h",
        "https://api.data.gov.sg/v1/environment/24-hour-weather-forecast",
        { items: [] }
      ),
      fetchWithCache(
        "sg_forecast_4d",
        "https://api.data.gov.sg/v1/environment/4-day-weather-forecast",
        { items: [] }
      ),
      fetchWithCache(
        "sg_psi",
        "https://api.data.gov.sg/v1/environment/psi",
        { items: [] }
      ),
    ]);

    // Parse 2-hour forecasts
    const forecastsList: Array<{ area: string; forecast: string }> =
      forecastRaw?.items?.[0]?.forecasts || defaultForecasts;

    let selectedForecast = forecastsList.find(
      (f) => f.area.toLowerCase() === areaQuery.toLowerCase()
    ) || forecastsList[0];

    // Stations & readings matching for rainfall
    const stationsMeta = rainfallRaw?.metadata?.stations || defaultStations;
    const readings = rainfallRaw?.items?.[0]?.readings || [];
    const readingMap = new Map(readings.map((r: any) => [r.station_id, r.value]));

    const mappedStations = stationsMeta.map((st: any) => ({
      id: st.id,
      name: st.name || st.id,
      lat: st.location ? st.location.latitude : st.lat,
      lon: st.location ? st.location.longitude : st.lon,
      rainfall: typeof readingMap.get(st.id) === "number" ? readingMap.get(st.id) : 0,
    }));

    // Find nearest station if coordinates provided
    let nearestStation = mappedStations[0];
    if (!isNaN(userLat) && !isNaN(userLon)) {
      let minDist = Infinity;
      for (const st of mappedStations) {
        const d = getDistanceFromLatLonInKm(userLat, userLon, st.lat, st.lon);
        if (d < minDist) {
          minDist = d;
          nearestStation = st;
        }
      }
    } else {
      const match = mappedStations.find((s: any) =>
        s.name.toLowerCase().includes(selectedForecast.area.toLowerCase())
      );
      if (match) nearestStation = match;
    }

    // Temperature & Humidity parsing across stations
    const tempStationsMeta = tempRaw?.metadata?.stations || [];
    const tempReadings = tempRaw?.items?.[0]?.readings || [];
    const tempReadingMap = new Map(tempReadings.map((r: any) => [r.station_id, r.value]));
    const mappedTempStations = tempStationsMeta.map((st: any) => ({
      id: st.id,
      name: st.name || st.id,
      lat: st.location?.latitude,
      lon: st.location?.longitude,
      value: tempReadingMap.get(st.id) ?? 29.5,
      unit: "°C",
    }));

    const currentTemp = mappedTempStations.length > 0 ? (tempReadingMap.get(nearestStation?.id) ?? mappedTempStations[0].value) : 30.2;

    const humStationsMeta = humidityRaw?.metadata?.stations || [];
    const humReadings = humidityRaw?.items?.[0]?.readings || [];
    const humReadingMap = new Map(humReadings.map((r: any) => [r.station_id, r.value]));
    const mappedHumStations = humStationsMeta.map((st: any) => ({
      id: st.id,
      name: st.name || st.id,
      lat: st.location?.latitude,
      lon: st.location?.longitude,
      value: humReadingMap.get(st.id) ?? 75,
      unit: "%",
    }));

    const currentHum = mappedHumStations.length > 0 ? (humReadingMap.get(nearestStation?.id) ?? mappedHumStations[0].value) : 78;

    // UV Index calculation
    const uvRecords = uvRaw?.items?.[0]?.index || [];
    const latestUv = uvRecords.length > 0 ? uvRecords[uvRecords.length - 1].value : 8.2;

    // Wind speed & direction reading
    const windReadings = windSpeedRaw?.items?.[0]?.readings || [];
    const windSpeedKmH = windReadings.length > 0 ? windReadings[0].value * 1.852 : 15.0; // knots to km/h or avg

    const windDirReadings = windDirRaw?.items?.[0]?.readings || [];
    const windDirDeg = windDirReadings.length > 0 ? windDirReadings[0].value : 180;
    const compassDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const compassIndex = Math.round(windDirDeg / 45) % 8;
    const windDirection = compassDirections[compassIndex] || "S";

    // 24-hour & 4-day forecast parsing
    const forecast24hItem = forecast24hRaw?.items?.[0];
    const forecast24Hour = forecast24hItem
      ? {
          general: forecast24hItem.general || {
            forecast: "Fair (Day)",
            relative_humidity: { low: 65, high: 90 },
            temperature: { low: 25, high: 32 },
            wind: { speed: { low: 10, high: 20 }, direction: "SSW" },
          },
          periods: forecast24hItem.periods || [],
        }
      : undefined;

    const forecast4Day = forecast4dRaw?.items?.[0]?.forecasts?.map((f: any) => ({
      date: f.date,
      day: new Date(f.date).toLocaleDateString("en-SG", { weekday: "short" }),
      forecast: f.forecast,
      temperature: f.temperature || { low: 25, high: 32 },
      relative_humidity: f.relative_humidity || { low: 60, high: 90 },
      wind: f.wind || { speed: { low: 10, high: 20 }, direction: "S" },
    })) || [];

    // Air Quality / PSI
    const psiItem = psiRaw?.items?.[0];
    const airQuality = psiItem
      ? {
          readings: psiItem.readings || {},
          updateTimestamp: psiItem.update_timestamp || new Date().toISOString(),
          status: (psiRaw as any)?.api_info?.status || "normal",
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

    // Cap between 1 and 99
    umbrellaScore = Math.max(5, Math.min(99, Math.round(umbrellaScore)));

    res.json({
      location: {
        country: "Singapore",
        region: selectedForecast.area,
        latitude: nearestStation?.lat || 1.3521,
        longitude: nearestStation?.lon || 103.8198,
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
        direction: windDirection,
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
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Singapore weather endpoint error:", err);
    res.status(500).json({ error: "Failed to fetch Singapore weather", details: err.message });
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
