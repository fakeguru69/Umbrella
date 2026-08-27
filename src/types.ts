export type PersonaType =
  | "Sarcastic Singlish Auntie"
  | "British Brolly Butler"
  | "Doomsday Meteorologist"
  | "Hyper-cautious Asian Mom"
  | "Gen-Z Weather Influencer"
  | "Hardboiled Noir Detective";

export interface RainStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  rainfall: number;
}

export interface WeatherData {
  location: {
    country: string;
    region: string;
    latitude: number;
    longitude: number;
  };
  forecast: string;
  allForecasts?: Array<{ area: string; forecast: string }>;
  temperature?: number;
  humidity?: number;
  precipProbability?: number;
  rainfall: {
    amountMm: number;
    stationName: string;
    stationId: string;
    allStations?: RainStation[];
  };
  uvIndex: {
    value: number;
    category: "Low" | "Moderate" | "High" | "Very High" | "Extreme";
  };
  wind: {
    speedKmH: number;
    isHighWind: boolean;
  };
  umbrellaScore: number; // 1 - 100
  hourlyForecast?: Array<{
    hour: string;
    prob: number;
    rain: number;
    uv: number;
  }>;
  timestamp: string;
}

export interface AIAdvice {
  roast: string;
  verdict: string;
  sunscreenAdvice: string;
  shelteredRouteTip: string;
  excuseToStayHome: string;
  umbrellaArchetype: string;
  brollySurvivalProbability: number;
}
