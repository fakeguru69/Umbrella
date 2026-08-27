import { computeSingaporeWeather } from "../../src/services/weatherService";

export default async function handler(req: any, res: any) {
  // Support CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const areaQuery = (req.query?.area as string) || "Jurong West";
    const userLat = req.query?.lat ? parseFloat(req.query.lat as string) : undefined;
    const userLon = req.query?.lon ? parseFloat(req.query.lon as string) : undefined;

    const weather = await computeSingaporeWeather(areaQuery, userLat, userLon);
    return res.status(200).json(weather);
  } catch (err: any) {
    console.error("Vercel /api/weather/singapore error:", err);
    return res.status(500).json({ error: "Failed to compute Singapore weather", details: err.message });
  }
}
