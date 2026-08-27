import { WeatherData, RainStation } from "../types";

export const DEFAULT_STATIONS: RainStation[] = [
  { id: "S109", name: "Ang Mo Kio", lat: 1.3764, lon: 103.8492, rainfall: 0.0 },
  { id: "S117", name: "Bantham / Jurong West", lat: 1.34039, lon: 103.705, rainfall: 4.8 },
  { id: "S50", name: "Clementi Road", lat: 1.3337, lon: 103.7768, rainfall: 3.2 },
  { id: "S107", name: "East Coast / Katong", lat: 1.3075, lon: 103.8907, rainfall: 0.0 },
  { id: "S43", name: "Kim Chuan / Tai Seng", lat: 1.3399, lon: 103.8878, rainfall: 0.0 },
  { id: "S111", name: "Newton Circus", lat: 1.31055, lon: 103.8365, rainfall: 0.0 },
  { id: "S121", name: "Choa Chu Kang (South)", lat: 1.3729, lon: 103.7485, rainfall: 1.6 },
  { id: "S104", name: "Woodlands Avenue 9", lat: 1.44387, lon: 103.78538, rainfall: 0.0 },
  { id: "S108", name: "Tampines", lat: 1.3533, lon: 103.9452, rainfall: 2.2 },
];

export const SG_POPULAR_AREAS_MAP: Record<
  string,
  { neaArea: string; lat: number; lon: number; displayName: string }
> = {
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

export function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const clientCache: Record<string, { timestamp: number; data: any }> = {};
const CACHE_TTL_MS = 60 * 1000;

async function safeFetchJson<T>(url: string, fallback: T): Promise<T> {
  const now = Date.now();
  if (clientCache[url] && now - clientCache[url].timestamp < CACHE_TTL_MS) {
    return clientCache[url].data;
  }
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return clientCache[url]?.data || fallback;
    const raw = await res.json();
    let unwrapped: any = raw;
    if (raw && typeof raw === "object" && "data" in raw && raw.data !== null && raw.data !== undefined) {
      unwrapped = raw.data;
    }
    clientCache[url] = { timestamp: now, data: unwrapped };
    return unwrapped;
  } catch {
    return clientCache[url]?.data || fallback;
  }
}

export function extractReadingsMap(raw: any): Map<string, number> {
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
}

export async function computeSingaporeWeather(
  areaQuery: string = "Jurong West",
  userLat?: number,
  userLon?: number
): Promise<WeatherData> {
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
    safeFetchJson("https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast", {
      area_metadata: [],
      items: [],
    }),
    safeFetchJson("https://api-open.data.gov.sg/v2/real-time/api/rainfall", {
      stations: [],
      readings: [],
    }),
    safeFetchJson("https://api-open.data.gov.sg/v2/real-time/api/uv", {
      records: [{ index: [{ value: 7.5, hour: new Date().toISOString() }] }],
    }),
    safeFetchJson("https://api-open.data.gov.sg/v2/real-time/api/wind-speed", {
      stations: [],
      readings: [{ data: [{ stationId: "S109", value: 14.2 }] }],
    }),
    safeFetchJson("https://api-open.data.gov.sg/v2/real-time/api/air-temperature", {
      stations: [],
      readings: [{ data: [{ stationId: "S109", value: 29.8 }] }],
    }),
    safeFetchJson("https://api-open.data.gov.sg/v2/real-time/api/relative-humidity", {
      stations: [],
      readings: [{ data: [{ stationId: "S109", value: 78 }] }],
    }),
    safeFetchJson("https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast", {
      records: [],
    }),
    safeFetchJson("https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook", {
      records: [],
    }),
    safeFetchJson("https://api-open.data.gov.sg/v2/real-time/api/psi", {
      regionMetadata: [],
      items: [],
    }),
    safeFetchJson("https://api-open.data.gov.sg/v2/real-time/api/pm25", {
      regionMetadata: [],
      items: [],
    }),
  ]);

  const defaultForecasts = [
    { area: "Jurong West", forecast: "Thundery Showers" },
    { area: "Clementi", forecast: "Moderate Rain" },
    { area: "Ang Mo Kio", forecast: "Partly Cloudy (Day)" },
    { area: "Bedok", forecast: "Light Rain" },
    { area: "Orchard", forecast: "Thundery Showers" },
    { area: "Sentosa", forecast: "Fair (Day)" },
    { area: "Changi", forecast: "Cloudy" },
  ];

  const forecastsList: Array<{ area: string; forecast: string }> =
    (forecastRaw as any)?.items?.[0]?.forecasts || defaultForecasts;

  const areaMetaList: Array<{
    name: string;
    label_location?: { latitude: number; longitude: number };
    labelLocation?: { latitude: number; longitude: number };
  }> = (forecastRaw as any)?.area_metadata || [];

  let selectedForecast = forecastsList[0];
  let displayRegion = areaQuery;
  let targetLat = 1.34039;
  let targetLon = 103.705;

  const normalizedQuery = (areaQuery || "Jurong West").trim().toLowerCase();

  // 1. If GPS coordinates provided
  if (userLat !== undefined && userLon !== undefined && !isNaN(userLat) && !isNaN(userLon)) {
    targetLat = userLat;
    targetLon = userLon;

    let closestAreaName = forecastsList[0]?.area || "Jurong West";
    let minMetaDist = Infinity;

    for (const meta of areaMetaList) {
      const mLat = meta.label_location?.latitude ?? meta.labelLocation?.latitude;
      const mLon = meta.label_location?.longitude ?? meta.labelLocation?.longitude;
      if (typeof mLat === "number" && typeof mLon === "number") {
        const dist = getDistanceFromLatLonInKm(userLat, userLon, mLat, mLon);
        if (dist < minMetaDist) {
          minMetaDist = dist;
          closestAreaName = meta.name;
        }
      }
    }

    selectedForecast =
      forecastsList.find((f) => f.area.toLowerCase() === closestAreaName.toLowerCase()) ||
      forecastsList[0];
    displayRegion =
      areaQuery && areaQuery !== "My GPS Location" && areaQuery !== "Nearby GPS Sensor"
        ? areaQuery
        : selectedForecast.area;
  }
  // 2. Popular Singapore landmarks & MRT dictionary match
  else if (SG_POPULAR_AREAS_MAP[normalizedQuery]) {
    const mapped = SG_POPULAR_AREAS_MAP[normalizedQuery];
    displayRegion = mapped.displayName;
    targetLat = mapped.lat;
    targetLon = mapped.lon;

    selectedForecast =
      forecastsList.find((f) => f.area.toLowerCase() === mapped.neaArea.toLowerCase()) ||
      forecastsList.find((f) => f.area.toLowerCase().includes(mapped.neaArea.toLowerCase())) ||
      forecastsList[0];
  }
  // 3. 47 official NEA planning areas match
  else {
    const exactMatch = forecastsList.find(
      (f) => f.area.toLowerCase() === normalizedQuery
    );
    const partialMatch = forecastsList.find(
      (f) =>
        f.area.toLowerCase().includes(normalizedQuery) ||
        normalizedQuery.includes(f.area.toLowerCase())
    );

    selectedForecast = exactMatch || partialMatch || forecastsList[0];
    displayRegion = exactMatch ? exactMatch.area : partialMatch ? partialMatch.area : areaQuery;

    const areaMeta =
      areaMetaList.find((a) => a.name.toLowerCase() === selectedForecast.area.toLowerCase()) ||
      areaMetaList.find(
        (a) =>
          a.name.toLowerCase().includes(selectedForecast.area.toLowerCase()) ||
          selectedForecast.area.toLowerCase().includes(a.name.toLowerCase())
      );

    targetLat =
      areaMeta?.label_location?.latitude || areaMeta?.labelLocation?.latitude || 1.34039;
    targetLon =
      areaMeta?.label_location?.longitude || areaMeta?.labelLocation?.longitude || 103.705;
  }

  // Stations & readings matching for rainfall
  const stationsMeta =
    (rainfallRaw as any)?.stations ||
    (rainfallRaw as any)?.metadata?.stations ||
    DEFAULT_STATIONS;
  const readingMap = extractReadingsMap(rainfallRaw);

  const mappedStations: RainStation[] = stationsMeta.map((st: any) => ({
    id: st.id,
    name: st.name || st.id,
    lat: st.location ? (st.location.latitude ?? st.location.lat) : st.lat,
    lon: st.location ? (st.location.longitude ?? st.location.lon) : st.lon,
    rainfall: typeof readingMap.get(st.id) === "number" ? readingMap.get(st.id)! : 0,
  }));

  // Nearest rainfall station to target coordinates
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

  // Temperature stations
  const tempStationsMeta =
    (tempRaw as any)?.stations || (tempRaw as any)?.metadata?.stations || [];
  const tempReadingMap = extractReadingsMap(tempRaw);
  const mappedTempStations = tempStationsMeta.map((st: any) => ({
    id: st.id,
    name: st.name || st.id,
    lat: st.location?.latitude,
    lon: st.location?.longitude,
    value: tempReadingMap.get(st.id) ?? 29.5,
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

  // Humidity stations
  const humStationsMeta =
    (humidityRaw as any)?.stations || (humidityRaw as any)?.metadata?.stations || [];
  const humReadingMap = extractReadingsMap(humidityRaw);
  const mappedHumStations = humStationsMeta.map((st: any) => ({
    id: st.id,
    name: st.name || st.id,
    lat: st.location?.latitude,
    lon: st.location?.longitude,
    value: humReadingMap.get(st.id) ?? 75,
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

  // UV index
  const uvIndexList =
    (uvRaw as any)?.records?.[0]?.index || (uvRaw as any)?.items?.[0]?.index || [];
  const latestUv =
    uvIndexList.length > 0 ? uvIndexList[uvIndexList.length - 1].value ?? 6.0 : 6.0;

  // Wind speed
  const windReadingMap = extractReadingsMap(windSpeedRaw);
  const nearestWindVal = nearestStation ? windReadingMap.get(nearestStation.id) : undefined;
  const firstWindVal = windReadingMap.values().next().value;
  const windSpeedKnots = nearestWindVal ?? firstWindVal ?? 8.0;
  const windSpeedKmH = windSpeedKnots * 1.852;

  // 24-hour & 4-day forecasts
  const record24h = (forecast24hRaw as any)?.records?.[0];
  const item24h = (forecast24hRaw as any)?.items?.[0];
  const forecast24Hour = record24h
    ? {
        general: {
          forecast:
            record24h.general?.forecast?.text ||
            record24h.general?.forecast ||
            "Partly Cloudy (Day)",
          relative_humidity:
            record24h.general?.relativeHumidity ||
            record24h.general?.relative_humidity || { low: 65, high: 90 },
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

  const forecast4dList =
    (forecast4dRaw as any)?.records?.[0]?.forecasts ||
    (forecast4dRaw as any)?.items?.[0]?.forecasts ||
    [];
  const forecast4Day = forecast4dList.map((f: any) => {
    const forecastText =
      typeof f.forecast === "string" ? f.forecast : f.forecast?.text || "Showers";
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

  // Air Quality
  const psiItem = (psiRaw as any)?.items?.[0];
  const pm25Item = (pm25Raw as any)?.items?.[0];
  const airQuality =
    psiItem || pm25Item
      ? {
          readings: {
            ...(psiItem?.readings || {}),
            ...(pm25Item?.readings || {}),
          },
          updateTimestamp:
            psiItem?.updatedTimestamp ||
            psiItem?.update_timestamp ||
            new Date().toISOString(),
          status: "normal",
        }
      : undefined;

  // Umbrella score calculation
  let umbrellaScore = 15;
  const forecastLower = selectedForecast.forecast.toLowerCase();

  if (
    forecastLower.includes("thundery") ||
    forecastLower.includes("heavy rain") ||
    forecastLower.includes("storm")
  ) {
    umbrellaScore += 75;
  } else if (
    forecastLower.includes("moderate rain") ||
    forecastLower.includes("showers")
  ) {
    umbrellaScore += 55;
  } else if (
    forecastLower.includes("light rain") ||
    forecastLower.includes("drizzle") ||
    forecastLower.includes("passing showers")
  ) {
    umbrellaScore += 35;
  } else if (forecastLower.includes("cloudy")) {
    umbrellaScore += 15;
  }

  if (nearestStation && nearestStation.rainfall > 0) {
    umbrellaScore += Math.min(40, nearestStation.rainfall * 12);
  }

  if (latestUv >= 8) {
    umbrellaScore += 18;
  } else if (latestUv >= 6) {
    umbrellaScore += 10;
  }

  const highWindRisk = windSpeedKmH >= 32;
  umbrellaScore = Math.max(5, Math.min(99, Math.round(umbrellaScore)));

  // Combine unified stations telemetry
  const allMergedSensors = mappedStations.map((st) => {
    const t = mappedTempStations.find((item: any) => item.id === st.id)?.value ?? null;
    const h = mappedHumStations.find((item: any) => item.id === st.id)?.value ?? null;
    return {
      ...st,
      temp: t,
      humidity: h,
    };
  });

  return {
    location: {
      country: "Singapore",
      region: displayRegion,
      latitude: targetLat,
      longitude: targetLon,
      stationDistanceKm:
        minRainDist !== Infinity ? Number(minRainDist.toFixed(1)) : 1.2,
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
      timestamp: new Date().toLocaleTimeString("en-SG", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      allStations: allMergedSensors,
    },
    uvIndex: {
      value: Number(latestUv.toFixed(1)),
      category:
        latestUv >= 11
          ? "Extreme"
          : latestUv >= 8
          ? "Very High"
          : latestUv >= 6
          ? "High"
          : latestUv >= 3
          ? "Moderate"
          : "Low",
      level:
        latestUv >= 11
          ? "Extreme"
          : latestUv >= 8
          ? "Very High"
          : latestUv >= 6
          ? "High"
          : latestUv >= 3
          ? "Moderate"
          : "Low",
      hour: new Date().toLocaleTimeString("en-SG", { hour: "numeric", hour12: true }),
    },
    wind: {
      speedKmH: Number(windSpeedKmH.toFixed(1)),
      direction: "SSW",
      gustsKmH: Number((windSpeedKmH * 1.35).toFixed(1)),
      isHighWind: highWindRisk,
      highWindRisk,
    },
    umbrellaScore,
    timestamp: new Date().toISOString(),
    forecast24Hour,
    forecast4Day,
    airQuality,
  };
}

export function generateQuirkyRoast(
  forecast: string,
  rainfallMm: number,
  uvIndex: number,
  windSpeed: number,
  score: number,
  location: string
) {
  const isWet =
    score >= 50 ||
    rainfallMm > 0 ||
    forecast.toLowerCase().includes("rain") ||
    forecast.toLowerCase().includes("showers");
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
