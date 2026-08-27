import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export const geminiRouter = Router();

// Guardrail: Any API key, token, or credential is read ONLY inside files in the repo-root api/ directory
function getGeminiClient(): GoogleGenAI | null {
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return null;
}

// In-memory cache for roast advice (15-minute TTL)
interface RoastCacheEntry {
  timestamp: number;
  data: any;
}
const roastCache = new Map<string, RoastCacheEntry>();
const ROAST_CACHE_TTL_MS = 15 * 60 * 1000;

// Rate-limiting / quota cooldown tracker to avoid repeating failing calls
let quotaExhaustedUntil: number = 0;

function getCacheKey(
  location: string,
  forecast: string,
  rainfallMm: number,
  uvIndex: number,
  windSpeedKmH: number,
  umbrellaScore: number
): string {
  const rainBucket = Math.round(rainfallMm * 2) / 2; // 0, 0.5, 1.0, etc.
  const uvBucket = Math.round(uvIndex);
  const scoreBucket = Math.floor(umbrellaScore / 10) * 10;
  const windBucket = Math.floor(windSpeedKmH / 5) * 5;
  return `${location.toLowerCase().trim()}|${forecast.toLowerCase().trim()}|${rainBucket}|${uvBucket}|${windBucket}|${scoreBucket}`;
}

geminiRouter.post("/roast-and-advice", async (req: Request, res: Response) => {
  const {
    location = "Singapore",
    forecast = "Thundery Showers",
    rainfallMm = 0.0,
    uvIndex = 9.0,
    windSpeedKmH = 15,
    umbrellaScore = 75,
  } = req.body || {};

  const cacheKey = getCacheKey(location, forecast, rainfallMm, uvIndex, windSpeedKmH, umbrellaScore);
  const cached = roastCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < ROAST_CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  // Check if we are currently in quota cooldown
  if (Date.now() < quotaExhaustedUntil) {
    const fallback = generateFallbackQuirkyVerdict(
      forecast,
      rainfallMm,
      uvIndex,
      windSpeedKmH,
      umbrellaScore,
      location
    );
    return res.json(fallback);
  }

  const ai = getGeminiClient();

  if (!ai) {
    const fallback = generateFallbackQuirkyVerdict(
      forecast,
      rainfallMm,
      uvIndex,
      windSpeedKmH,
      umbrellaScore,
      location
    );
    return res.json(fallback);
  }

  try {
    const systemInstruction = `You are the AI brain of Umbrella Oracle, the world's most delightfully quirky, brutally honest, and sharp-witted umbrella recommendation engine for Singapore commuters.
Your mission is to evaluate real-time weather telemetries (Rainfall, UV Index, Wind Speed, 2-Hour Forecast, Umbrella Index) and deliver hilarious, unforgettable verdicts.
Always return valid JSON adhering strictly to the JSON schema.`;

    const prompt = `Analyze this live weather snapshot:
Location: ${location}
2-Hour Forecast: ${forecast}
Current Rainfall: ${rainfallMm} mm
UV Index: ${uvIndex}
Wind Speed: ${windSpeedKmH} km/h
Calculated Umbrella Score (1-100): ${umbrellaScore}

Rules:
1. "roast": 1-2 sharp, quirky, hilarious sentences summarizing whether you'll get soaked, fried, or blown away. (e.g. "UV 9! You will crisp like roasted pork belly out there." or "With 40km/h wind and heavy rain, your umbrella will turn into an inverted satellite dish in 3 seconds flat.")
2. "verdict": Short punchy all-caps verdict (e.g. "TAKE IT!", "LEAVE IT AT HOME", "UV PARASOL ESSENTIAL", "DEFCON 1: CARRY THE SWORD", "ABORT: GALE WARNING").
3. "sunscreenAdvice": Quirky SPF warning / skin protection roast.
4. "shelteredRouteTip": A practical and humorous sheltered walking route or survival tactic.
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

    // Save in cache
    roastCache.set(cacheKey, {
      timestamp: Date.now(),
      data: parsed,
    });

    return res.json(parsed);
  } catch (err: any) {
    const isQuotaError =
      err?.status === 429 ||
      err?.status === "RESOURCE_EXHAUSTED" ||
      err?.message?.includes("quota") ||
      err?.message?.includes("429") ||
      err?.message?.includes("RESOURCE_EXHAUSTED");

    if (isQuotaError) {
      // Cooldown for 60 seconds before trying Gemini again
      quotaExhaustedUntil = Date.now() + 60 * 1000;
      console.warn("Gemini API quota rate limit reached, falling back to Singapore quirky advice engine for 60s.");
    } else {
      console.error("Gemini roast generation warning:", err?.message || err);
    }

    const fallback = generateFallbackQuirkyVerdict(
      forecast,
      rainfallMm,
      uvIndex,
      windSpeedKmH,
      umbrellaScore,
      location
    );

    // Cache fallback briefly (2 mins) to avoid spamming
    roastCache.set(cacheKey, {
      timestamp: Date.now(),
      data: fallback,
    });

    return res.json(fallback);
  }
});

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const {
    location = "Singapore",
    forecast = "Thundery Showers",
    rainfallMm = 0.0,
    uvIndex = 9.0,
    windSpeedKmH = 15,
    umbrellaScore = 75,
  } = body;

  const cacheKey = getCacheKey(location, forecast, rainfallMm, uvIndex, windSpeedKmH, umbrellaScore);
  const cached = roastCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ROAST_CACHE_TTL_MS) {
    return res.status(200).json(cached.data);
  }

  if (Date.now() < quotaExhaustedUntil) {
    return res.status(200).json(generateFallbackQuirkyVerdict(forecast, rainfallMm, uvIndex, windSpeedKmH, umbrellaScore, location));
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(200).json(generateFallbackQuirkyVerdict(forecast, rainfallMm, uvIndex, windSpeedKmH, umbrellaScore, location));
    }

    const systemInstruction = `You are the AI brain of Umbrella Oracle, the world's most delightfully quirky, brutally honest, and sharp-witted umbrella recommendation engine for Singapore commuters.
Your mission is to evaluate real-time weather telemetries (Rainfall, UV Index, Wind Speed, 2-Hour Forecast, Umbrella Index) and deliver hilarious, unforgettable verdicts.
Always return valid JSON adhering strictly to the JSON schema.`;

    const prompt = `Analyze this live weather snapshot:
Location: ${location}
2-Hour Forecast: ${forecast}
Current Rainfall: ${rainfallMm} mm
UV Index: ${uvIndex}
Wind Speed: ${windSpeedKmH} km/h
Calculated Umbrella Score (1-100): ${umbrellaScore}

Rules:
1. "roast": 1-2 sharp, quirky, hilarious sentences.
2. "verdict": Short punchy all-caps verdict.
3. "sunscreenAdvice": Quirky SPF warning.
4. "shelteredRouteTip": A practical and humorous sheltered walking route.
5. "excuseToStayHome": A funny excuse to stay home.
6. "umbrellaArchetype": The recommended umbrella type.
7. "brollySurvivalProbability": Number between 0 and 100.`;

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

    roastCache.set(cacheKey, {
      timestamp: Date.now(),
      data: parsed,
    });

    return res.status(200).json(parsed);
  } catch (err: any) {
    const isQuotaError =
      err?.status === 429 ||
      err?.status === "RESOURCE_EXHAUSTED" ||
      err?.message?.includes("quota") ||
      err?.message?.includes("429");

    if (isQuotaError) {
      quotaExhaustedUntil = Date.now() + 60 * 1000;
    }
    return res.status(200).json(generateFallbackQuirkyVerdict(forecast, rainfallMm, uvIndex, windSpeedKmH, umbrellaScore, location));
  }
}

function generateFallbackQuirkyVerdict(
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

  if (isWindy && isWet) {
    return {
      roast: `Aiyoh! Wind ${windSpeed}km/h some more got rain over ${location}! Bring umbrella sure fly away to Johor Bahru!`,
      verdict: "STAY INDOORS LAH",
      sunscreenAdvice: "Sun hiding behind storm clouds, but humidity will melt your face anyway.",
      shelteredRouteTip: "Run through HDB void decks and linkways like you're chasing the last bus.",
      excuseToStayHome: "Boss, MRT linkway flooded and wind too strong, my umbrella broken into chopsticks.",
      umbrellaArchetype: "Combat Windproof Heavy-Duty Golf Sword",
      brollySurvivalProbability: 25,
    };
  }
  if (isWet) {
    return {
      roast: `Sky looking like black pepper crab sauce over ${location}. ${forecast}! Don't act hero without brolly ah!`,
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
      roast: `UV ${uvIndex} over ${location}! You walk outside 5 minutes sure crisp like roasted pork belly (siew yuk).`,
      verdict: "BRING UV BROLLY!",
      sunscreenAdvice: "Slap on SPF 50+ PA++++ unless you want to cosplay as charcoal.",
      shelteredRouteTip: "Walk on the shaded side of the street and duck into aircon malls immediately.",
      excuseToStayHome: "The sun is a deadly laser today, my dermatologist strictly forbids outdoor wandering.",
      umbrellaArchetype: "Silver-Coated UV Anti-Melanin Shield",
      brollySurvivalProbability: 99,
    };
  }
  return {
    roast: `Weather quite nice over ${location}, but Singapore sky can flip prata in 10 minutes. Better standby.`,
    verdict: "LEAVE IT (OR MINI STANDBY)",
    sunscreenAdvice: "Slap on daily SPF 30, skin cancer does not take days off.",
    shelteredRouteTip: "Five-foot-ways and MRT undergrounds are your best friend if sudden drizzle strikes.",
    excuseToStayHome: "Feeling sudden atmospheric lethargy, need teh c peng at home.",
    umbrellaArchetype: "Ultralight Pocket Featherweight",
    brollySurvivalProbability: 95,
  };
}

