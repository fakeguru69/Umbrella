import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { geminiRouter } from "./api/gemini";
import { datagovsgRouter, fetchDataGovSg } from "./api/datagovsg";
import { computeSingaporeWeather } from "./src/services/weatherService";

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

const SG_POPULAR_AREAS_MAP: Record<string, { neaArea: string; lat: number; lon: number; displayName: string }> = {
  "marina bay": { neaArea: "City", lat: 1.2838, lon: 103.8591, displayName: "Marina Bay" },
  "orchard": { neaArea: "Tanglin", lat: 1.3048, lon: 103.8318, displayName: "Orchard" },
  "somerset": { neaArea: "Tanglin", lat: 1.3003, lon: 103.8385, displayName: "Somerset" },
  "dhoby ghaut": { neaArea: "City", lat: 1.2989, lon: 103.8457, displayName: "Dhoby Ghaut" },
  "raffles place": { neaArea: "City", lat: 1.2830, lon: 103.8519, displayName: "Raffles Place" },
  "bugis": { neaArea: "City", lat: 1.3006, lon: 103.8558, displayName: "Bugis" },
  "chinatown": { neaArea: "City", lat: 1.2843, lon: 103.8437, displayName: "Chinatown" },
  "tanjong pagar": { neaArea: "City", lat: 1.2764, lon: 103.8456, displayName: "Tanjong Pagar" },
  "harbourfront": { neaArea: "Bukit Merah", lat: 1.2653, lon: 103.8219, displayName: "HarbourFront" },
  "sentosa": { neaArea: "Sentosa", lat: 1.2494, lon: 103.8303, displayName: "Sentosa" },
  "east coast": { neaArea: "Marine Parade", lat: 1.3048, lon: 103.9200, displayName: "East Coast" },
  "katong": { neaArea: "Marine Parade", lat: 1.3020, lon: 103.9070, displayName: "Katong" },
  "joo chiat": { neaArea: "Marine Parade", lat: 1.3120, lon: 103.9020, displayName: "Joo Chiat" },
  "holland village": { neaArea: "Queenstown", lat: 1.3113, lon: 103.7961, displayName: "Holland Village" },
  "buona vista": { neaArea: "Queenstown", lat: 1.3073, lon: 103.7900, displayName: "Buona Vista" },
  "one-north": { neaArea: "Queenstown", lat: 1.2996, lon: 103.7874, displayName: "One-North" },
  "kent ridge": { neaArea: "Queenstown", lat: 1.2934, lon: 103.7845, displayName: "Kent Ridge" },
  "nus": { neaArea: "Clementi", lat: 1.2966, lon: 103.7764, displayName: "NUS" },
  "west coast": { neaArea: "Clementi", lat: 1.2931, lon: 103.7663, displayName: "West Coast" },
  "jurong point": { neaArea: "Jurong West", lat: 1.3400, lon: 103.7060, displayName: "Jurong Point" },
  "boon lay": { neaArea: "Boon Lay", lat: 1.3040, lon: 103.7010, displayName: "Boon Lay" },
  "ntu": { neaArea: "Jurong West", lat: 1.3483, lon: 103.6831, displayName: "NTU" },
  "jurong east": { neaArea: "Jurong East", lat: 1.3329, lon: 103.7436, displayName: "Jurong East" },
  "changi airport": { neaArea: "Changi", lat: 1.3644, lon: 103.9915, displayName: "Changi Airport" },
  "jewel": { neaArea: "Changi", lat: 1.3602, lon: 103.9898, displayName: "Jewel Changi" },
  "simei": { neaArea: "Tampines", lat: 1.3431, lon: 103.9533, displayName: "Simei" },
  "newton": { neaArea: "Novena", lat: 1.3129, lon: 103.8380, displayName: "Newton" },
  "balestier": { neaArea: "Novena", lat: 1.3262, lon: 103.8519, displayName: "Balestier" },
  "macritchie": { neaArea: "Central Water Catchment", lat: 1.3424, lon: 103.8344, displayName: "MacRitchie" },
  "upper thomson": { neaArea: "Bishan", lat: 1.3544, lon: 103.8338, displayName: "Upper Thomson" },
  "khatib": { neaArea: "Yishun", lat: 1.4172, lon: 103.8329, displayName: "Khatib" },
  "potong pasir": { neaArea: "Toa Payoh", lat: 1.3314, lon: 103.8690, displayName: "Potong Pasir" },
  "bidadari": { neaArea: "Toa Payoh", lat: 1.3370, lon: 103.8680, displayName: "Bidadari" },
  "kaki bukit": { neaArea: "Bedok", lat: 1.3353, lon: 103.9080, displayName: "Kaki Bukit" },
  "ubi": { neaArea: "Geylang", lat: 1.3298, lon: 103.8994, displayName: "Ubi" },
  "macpherson": { neaArea: "Geylang", lat: 1.3260, lon: 103.8890, displayName: "MacPherson" },
  "sports hub": { neaArea: "Kallang", lat: 1.3032, lon: 103.8749, displayName: "Sports Hub" },
  "stadium": { neaArea: "Kallang", lat: 1.3028, lon: 103.8753, displayName: "Stadium" },
  "waterway point": { neaArea: "Punggol", lat: 1.4067, lon: 103.9022, displayName: "Waterway Point" },
  "compassvale": { neaArea: "Sengkang", lat: 1.3917, lon: 103.8974, displayName: "Compassvale" },
  "buangkok": { neaArea: "Sengkang", lat: 1.3829, lon: 103.8931, displayName: "Buangkok" },
  "kovan": { neaArea: "Hougang", lat: 1.3601, lon: 103.8850, displayName: "Kovan" },
  "bukit gombak": { neaArea: "Bukit Batok", lat: 1.3587, lon: 103.7519, displayName: "Bukit Gombak" },
  "hillview": { neaArea: "Bukit Batok", lat: 1.3623, lon: 103.7674, displayName: "Hillview" },
};

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

    const weatherData = await computeSingaporeWeather(
      areaQuery,
      !isNaN(userLat) ? userLat : undefined,
      !isNaN(userLon) ? userLon : undefined
    );

    res.json(weatherData);
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
