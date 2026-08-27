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

geminiRouter.post("/roast-and-advice", async (req: Request, res: Response) => {
  try {
    const {
      location = "Singapore",
      forecast = "Thundery Showers",
      rainfallMm = 0.0,
      uvIndex = 9.0,
      windSpeedKmH = 15,
      umbrellaScore = 75,
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      return res.json(generateFallbackQuirkyVerdict(forecast, rainfallMm, uvIndex, windSpeedKmH, umbrellaScore, location));
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
    return res.json(parsed);
  } catch (err: any) {
    console.error("Gemini roast error:", err);
    const {
      location = "Singapore",
      forecast = "Cloudy",
      rainfallMm = 0,
      uvIndex = 8,
      windSpeedKmH = 12,
      umbrellaScore = 50,
    } = req.body;
    return res.json(generateFallbackQuirkyVerdict(forecast, rainfallMm, uvIndex, windSpeedKmH, umbrellaScore, location));
  }
});

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
