import { WeatherData, AIAdvice } from "./types";

export const initialWeatherData: WeatherData = {
  location: {
    country: "Singapore",
    region: "Jurong West",
    latitude: 1.3458,
    longitude: 103.6817,
  },
  forecast: "Thundery Showers",
  allForecasts: [
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
  ],
  humidity: 84,
  rainfall: {
    amountMm: 1.8,
    stationName: "Jurong West Sensor",
    stationId: "S117",
    allStations: [
      { id: "S117", name: "Jurong West", lat: 1.3458, lon: 103.6817, rainfall: 1.8 },
      { id: "S109", name: "Ang Mo Kio", lat: 1.3764, lon: 103.8492, rainfall: 0.2 },
      { id: "S50", name: "Clementi", lat: 1.3337, lon: 103.7768, rainfall: 0.0 },
      { id: "S107", name: "East Coast / Bedok", lat: 1.3135, lon: 103.9619, rainfall: 0.0 },
      { id: "S104", name: "Woodlands", lat: 1.4438, lon: 103.7853, rainfall: 0.4 },
      { id: "S60", name: "Marina South", lat: 1.2745, lon: 103.8636, rainfall: 0.0 },
      { id: "S111", name: "Scotts Road / Orchard", lat: 1.3087, lon: 103.8314, rainfall: 0.0 },
      { id: "S108", name: "Tampines", lat: 1.3533, lon: 103.9452, rainfall: 2.2 },
    ],
  },
  uvIndex: {
    value: 8.4,
    category: "Very High",
  },
  wind: {
    speedKmH: 26.5,
    isHighWind: false,
  },
  umbrellaScore: 88,
  timestamp: new Date().toISOString(),
};

export const initialAdviceData: AIAdvice = {
  roast: "The sky is currently throwing a tantrum. Don't be a hero, bring the brolly!",
  verdict: "YES. BRING IT.",
  sunscreenAdvice: "Slap on SPF 50+ PA++++. UV is blazing behind those thunder clouds.",
  shelteredRouteTip: "Connect via Jurong West void decks to MRT concourse without touching the rain.",
  excuseToStayHome: "Flash flood alert in my vicinity, safety officer recommended WFH.",
  umbrellaArchetype: "Tough Double-Canopy Golf Umbrella",
  brollySurvivalProbability: 85,
};
