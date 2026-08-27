import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-memory cache for API requests to avoid rate limits
interface CacheEntry<T> {
  timestamp: number;
  data: T;
}
const cache: Record<string, CacheEntry<any>> = {};
const CACHE_TTL_MS = 60 * 1000; // 1 minute

async function fetchWithCache<T>(key: string, url: string, fallbackData: T): Promise<T> {
  const now = Date.now();
  if (cache[key] && now - cache[key].timestamp < CACHE_TTL_MS) {
    return cache[key].data as T;
  }

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      console.warn(`Fetch ${url} failed with status: ${res.status}`);
      if (cache[key]) return cache[key].data;
      return fallbackData;
    }
    const data = (await res.json()) as T;
    cache[key] = { timestamp: now, data };
    return data;
  } catch (err) {
    console.error(`Fetch error for ${url}:`, err);
    if (cache[key]) return cache[key].data;
    return fallbackData;
  }
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

    // Fetch 2-hour forecast
    const forecastRaw = await fetchWithCache(
      "sg_forecast_2h",
      "https://api.data.gov.sg/v1/environment/2-hour-weather-forecast",
      { items: [{ forecasts: defaultForecasts }] }
    );

    // Fetch rainfall
    const rainfallRaw = await fetchWithCache(
      "sg_rainfall",
      "https://api.data.gov.sg/v1/environment/rainfall",
      {
        metadata: { stations: defaultStations },
        items: [{ readings: defaultStations.map((s) => ({ station_id: s.id, value: s.rainfall })) }],
      }
    );

    // Fetch UV Index
    const uvRaw = await fetchWithCache(
      "sg_uv",
      "https://api.data.gov.sg/v1/environment/uv-index",
      { items: [{ index: [{ value: 8.4, timestamp: new Date().toISOString() }] }] }
    );

    // Fetch Wind Speed
    const windRaw = await fetchWithCache(
      "sg_wind",
      "https://api.data.gov.sg/v1/environment/wind-speed",
      {
        items: [{ readings: [{ station_id: "S109", value: 14.2 }] }],
      }
    );

    // Parse forecasts
    const forecastsList: Array<{ area: string; forecast: string }> =
      forecastRaw?.items?.[0]?.forecasts || defaultForecasts;

    let selectedForecast = forecastsList.find(
      (f) => f.area.toLowerCase() === areaQuery.toLowerCase()
    ) || forecastsList[0];

    // Stations & readings matching
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
      // match area name approximation
      const match = mappedStations.find((s: any) =>
        s.name.toLowerCase().includes(selectedForecast.area.toLowerCase())
      );
      if (match) nearestStation = match;
    }

    // UV Index calculation
    const uvRecords = uvRaw?.items?.[0]?.index || [];
    const latestUv = uvRecords.length > 0 ? uvRecords[uvRecords.length - 1].value : 8.2;

    // Wind speed reading
    const windReadings = windRaw?.items?.[0]?.readings || [];
    const windSpeedKmH = windReadings.length > 0 ? (windReadings[0].value * 1.852) : 15.0; // knots to km/h or avg

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
      umbrellaScore += 18; // Strong case for UV umbrella
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
      rainfall: {
        amountMm: nearestStation ? nearestStation.rainfall : 0.0,
        stationName: nearestStation ? nearestStation.name : "Singapore Central",
        stationId: nearestStation ? nearestStation.id : "S00",
        allStations: mappedStations.slice(0, 15),
      },
      uvIndex: {
        value: Number(latestUv.toFixed(1)),
        category: latestUv >= 11 ? "Extreme" : latestUv >= 8 ? "Very High" : latestUv >= 6 ? "High" : latestUv >= 3 ? "Moderate" : "Low",
      },
      wind: {
        speedKmH: Number(windSpeedKmH.toFixed(1)),
        isHighWind: highWindRisk,
      },
      umbrellaScore,
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

// 3. API: Gemini Quirky Hot Takes & Persona Analysis
app.post("/api/gemini/roast-and-advice", async (req, res) => {
  try {
    const {
      location = "Singapore",
      forecast = "Thundery Showers",
      rainfallMm = 0.0,
      uvIndex = 9.0,
      windSpeedKmH = 15,
      umbrellaScore = 75,
      persona = "Sarcastic Singlish Auntie",
    } = req.body;

    const ai = getAI();

    // If no Gemini API key or error, use dynamic quirky fallback generator
    if (!ai) {
      return res.json(generateFallbackQuirkyVerdict(persona, forecast, rainfallMm, uvIndex, windSpeedKmH, umbrellaScore, location));
    }

    const systemInstruction = `You are the AI brain of Brolly, the world's most delightfully quirky, brutally honest, and sharp-witted umbrella recommendation engine.
Your mission is to evaluate real-time weather telemetries (Rainfall, UV Index, Wind Speed, 2-Hour Forecast, Umbrella Index) and deliver hilarious, unforgettable verdicts.
Strictly adhere to the requested persona tone:
- "Sarcastic Singlish Auntie": uses relatable Singaporean flair (lah, leh, lor, auntie warnings, void deck ninja moves, chicken rice analogies, roasting the sun).
- "British Brolly Butler": ultra-posh, dry British humor, obsession with bespoke tweed, calling wet weather "a spot of moist unpleasantness".
- "Doomsday Meteorologist": treats every cloud as the beginning of the apocalyptic deluge, hyper-dramatic.
- "Hyper-cautious Asian Mom": worried you will get sick/fever, insists on 3 layers of SPF and an umbrella as wide as a dining table.
- "Gen-Z Weather Influencer": brainrot slang, unhinged vibes, aesthetic check, fr fr no cap.
- "Hardboiled Noir Detective": gritty 1940s monologues about rain-slicked pavement, neon puddles, and broken ribs in the gutter.

Always return valid JSON adhering strictly to the JSON schema.`;

    const prompt = `Analyze this live weather snapshot:
Location: ${location}
2-Hour Forecast: ${forecast}
Current Rainfall: ${rainfallMm} mm
UV Index: ${uvIndex}
Wind Speed: ${windSpeedKmH} km/h
Calculated Umbrella Score (1-100): ${umbrellaScore}
Persona: ${persona}

Rules:
1. "roast": 1-2 sharp, quirky, hilarious sentences summarizing whether you'll get soaked, fried, or blown away. (e.g., "UV 9! You will crisp like roasted pork out there." or "With 40km/h wind and heavy rain, your umbrella will turn into an inverted satellite dish in 3 seconds flat.")
2. "verdict": Short punchy all-caps verdict (e.g. "TAKE IT!", "LEAVE IT AT HOME", "UV PARASOL ESSENTIAL", "DEFCON 1: CARRY THE SWORD", "ABORT: GALE WARNING").
3. "sunscreenAdvice": Quirky SPF warning / skin protection roast.
4. "shelteredRouteTip": A practical and humorous sheltered walking route or survival tactic (e.g. "Stick to the five-foot-ways and MRT linkways like a gecko", "Sprint between bus stop canopies").
5. "excuseToStayHome": A funny, bulletproof excuse to cancel plans or justify carrying a giant brolly.
6. "umbrellaArchetype": The recommended weapon of choice (e.g. "Heavy-Duty 24-Rib Golf Sword", "Foldable Convenience Store Martyr", "Black UV Anti-Aging Shield", "The Plastic Bag on Head").
7. "brollySurvivalProbability": Number between 0 and 100 representing how likely an umbrella survives the wind/rain.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: any) {
    console.error("Gemini roast error:", err);
    // Return robust fallback
    const {
      location = "Singapore",
      forecast = "Cloudy",
      rainfallMm = 0,
      uvIndex = 8,
      windSpeedKmH = 12,
      umbrellaScore = 50,
      persona = "Sarcastic Singlish Auntie",
    } = req.body;
    res.json(generateFallbackQuirkyVerdict(persona, forecast, rainfallMm, uvIndex, windSpeedKmH, umbrellaScore, location));
  }
});

function generateFallbackQuirkyVerdict(
  persona: string,
  forecast: string,
  rainfallMm: number,
  uvIndex: number,
  windSpeed: number,
  score: number,
  location: string
) {
  const isWet = score >= 50 || rainfallMm > 0 || forecast.toLowerCase().includes("rain") || forecast.toLowerCase().includes("showers");
  const isSunny = uvIndex >= 8;
  const isWindy = windSpeed >= 30;

  if (persona.includes("Singlish")) {
    if (isWindy && isWet) {
      return {
        roast: `Aiyoh! Wind ${windSpeed}km/h some more got rain! Bring umbrella sure fly away to Johor Bahru!`,
        verdict: "STAY INDOORS LAH",
        sunscreenAdvice: "Sun hiding behind storm clouds, but humidity will melt your face anyway.",
        shelteredRouteTip: "Run through HDB void decks and linkways like you're chasing the last bus 179.",
        excuseToStayHome: "Boss, MRT flooded and wind too strong, my umbrella broken into chopsticks.",
        umbrellaArchetype: "Combat Windproof Heavy-Duty Golf Sword",
        brollySurvivalProbability: 25,
      };
    }
    if (isWet) {
      return {
        roast: `Sky looking like black pepper crab sauce. ${forecast}! Don't act hero without brolly ah!`,
        verdict: "TAKE IT NOW LAH!",
        sunscreenAdvice: "Rain falling, but UV still sneaking around. Put SPF 30 don't be lazy.",
        shelteredRouteTip: "Hug the covered linkway from MRT exit B all the way to Kopitiam.",
        excuseToStayHome: "Sky opening up like Niagara Falls, cannot step outside without drowning.",
        umbrellaArchetype: "Standard Unbreakable Auntie Telescopic Brolly",
        brollySurvivalProbability: 88,
      };
    }
    if (isSunny) {
      return {
        roast: `UV ${uvIndex}! You walk outside 5 minutes sure crisp like roasted pork belly (siew yuk) out there.`,
        verdict: "BRING UV BROLLY!",
        sunscreenAdvice: "Slap on SPF 50+ PA++++ unless you want to cosplay as charcoal.",
        shelteredRouteTip: "Walk on the shaded side of the street and duck into aircon malls immediately.",
        excuseToStayHome: "The sun is a deadly laser today, my dermatologist strictly forbids outdoor wandering.",
        umbrellaArchetype: "Silver-Coated UV Anti-Melanin Shield",
        brollySurvivalProbability: 99,
      };
    }
    return {
      roast: `Weather quite nice leh, but Singapore sky can flip prata in 10 minutes. Better standby.`,
      verdict: "LEAVE IT (OR MINI STANDBY)",
      sunscreenAdvice: "Slap on daily SPF 30, skin cancer does not take days off.",
      shelteredRouteTip: "Five-foot-ways are your best friend if sudden drizzle strikes.",
      excuseToStayHome: "Feeling sudden atmospheric lethargy, need teh c peng at home.",
      umbrellaArchetype: "Ultralight Pocket Featherweight",
      brollySurvivalProbability: 95,
    };
  }

  if (persona.includes("British")) {
    return {
      roast: isWet
        ? `A rather beastly downpour is brewing over ${location}. One must equip proper rain armaments or look utterly disheveled.`
        : `Splendid skies for now, though trusting the heavens without a bespoke brolly is reckless dandyism.`,
      verdict: isWet ? "TAKE THE BROLLY, CHAPS" : "LEAVE IT WITH THE BUTLER",
      sunscreenAdvice: `UV is sitting at ${uvIndex}. A touch of protective cream avoids looking like an overcooked prawn.`,
      shelteredRouteTip: "Advance along covered colonnades with dignified haste.",
      excuseToStayHome: "I am indisposed due to ungentlemanly atmospheric barometric pressure.",
      umbrellaArchetype: "Fox Umbrellas Solid Whangee Handle Masterpiece",
      brollySurvivalProbability: isWindy ? 40 : 92,
    };
  }

  // Generic quirky
  return {
    roast: isWet
      ? `Clouds are fully loaded and ready to dump metric tons of H2O over ${location}. Your hair is in immediate danger.`
      : `UV is at ${uvIndex}! The sun is taking personal revenge on your epidermis today.`,
    verdict: isWet ? "TAKE IT!" : (isSunny ? "UV SHIELD NEEDED" : "LEAVE IT AT HOME"),
    sunscreenAdvice: `UV ${uvIndex} - Apply broad spectrum sunscreen or risk glowing in the dark.`,
    shelteredRouteTip: "Chart a tactical path through connected underground concourses and canopy walks.",
    excuseToStayHome: "My Umbrella Algorithm computed a 98.4% probability of regrettable dampness.",
    umbrellaArchetype: isWet ? "Storm-Proof Fiberglass 8-Rib" : "UV 50+ Sun Parasol",
    brollySurvivalProbability: isWindy ? 35 : 90,
  };
}

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
