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

export interface WeatherStationReading {
  id: string;
  name: string;
  lat?: number;
  lon?: number;
  value: number;
  unit?: string;
}

export interface DayForecast {
  date: string;
  day: string;
  forecast: string;
  temperature: { low: number; high: number };
  relative_humidity: { low: number; high: number };
  wind: { speed: { low: number; high: number }; direction: string };
}

export interface RegionalForecast24H {
  general: {
    forecast: string;
    relative_humidity: { low: number; high: number };
    temperature: { low: number; high: number };
    wind: { speed: { low: number; high: number }; direction: string };
  };
  periods: Array<{
    time: { start: string; end: string; text?: string };
    regions: {
      west: string;
      east: string;
      central: string;
      south: string;
      north: string;
    };
  }>;
}

export interface AirQualityPsi {
  readings: {
    psi_twenty_four_hourly?: {
      west: number;
      national: number;
      east: number;
      central: number;
      south: number;
      north: number;
    };
    pm25_twenty_four_hourly?: {
      west: number;
      national: number;
      east: number;
      central: number;
      south: number;
      north: number;
    };
    pm25_one_hourly?: {
      west: number;
      national: number;
      east: number;
      central: number;
      south: number;
      north: number;
    };
    o3_eight_hour_max?: {
      west: number;
      national: number;
      east: number;
      central: number;
      south: number;
      north: number;
    };
    so2_twenty_four_hourly?: {
      west: number;
      national: number;
      east: number;
      central: number;
      south: number;
      north: number;
    };
  };
  status?: string;
  updateTimestamp?: string;
}

export interface DataGovSgData {
  forecast4Day?: DayForecast[];
  forecast24Hour?: RegionalForecast24H;
  airQuality?: AirQualityPsi;
  stationsTemperature?: WeatherStationReading[];
  stationsHumidity?: WeatherStationReading[];
  stationsWind?: WeatherStationReading[];
  stationsRainfall?: RainStation[];
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
    direction?: string;
    isHighWind: boolean;
  };
  umbrellaScore: number; // 1 - 100
  dataGovSg?: DataGovSgData;
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

