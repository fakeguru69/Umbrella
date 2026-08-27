import React from "react";
import {
  Sun,
  CloudRain,
  Wind,
  Compass,
  Flame,
  ShieldAlert,
  Clock,
  Droplets,
  Radio,
  ExternalLink,
  Activity,
} from "lucide-react";
import { WeatherData, AIAdvice } from "../types";

interface TelemetryGridProps {
  weather: WeatherData;
  advice: AIAdvice | null;
  onOpenRadarModal: () => void;
  onOpenPhysicsModal: () => void;
}

export const TelemetryGrid: React.FC<TelemetryGridProps> = ({
  weather,
  advice,
  onOpenRadarModal,
  onOpenPhysicsModal,
}) => {
  const uvVal = weather.uvIndex.value;
  const rainMm = weather.rainfall.amountMm;
  const windKmH = weather.wind.speedKmH;

  // Calculate estimated time to sunburn (standard WHO / NEA dermatologist guideline)
  const calculateBurnTimeMins = (uv: number) => {
    if (uv <= 2) return "60+ mins";
    if (uv <= 5) return "30 - 45 mins";
    if (uv <= 7) return "20 - 30 mins";
    if (uv <= 10) return "10 - 15 mins (Crispy!)";
    return "< 10 mins (Roasted Pork alert!)";
  };

  // Inversion probability estimation
  const inversionRiskPercent = Math.min(
    95,
    Math.round(Math.max(5, (windKmH / 45) * 100))
  );

  return (
    <div
      id="telemetry-grid"
      className="w-full max-w-5xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-4 sm:border-[6px] border-[#FFF500] bg-[#0037B8] text-[#FFF500] shadow-[8px_8px_0px_0px_#000000]"
    >
      {/* 1. UV INDEX & SUNSCREEN CARD */}
      <div
        id="uv-telemetry-card"
        className="p-6 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-[#FFF500] relative overflow-hidden"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs uppercase font-black tracking-[0.2em] text-[#FFF500]/70">
              UV RADIATION INDEX
            </span>
            <span className="text-[10px] uppercase font-black bg-black text-[#FFF500] px-2 py-0.5 border border-[#FFF500]">
              LIVE UVI
            </span>
          </div>

          <div className="my-2">
            <span className="text-6xl font-black italic leading-none font-['Outfit',sans-serif] text-white">
              {uvVal.toFixed(1)}
            </span>
            <div className="mt-2">
              <span className="text-xs font-black uppercase bg-[#FFF500] text-[#0040D6] px-2.5 py-1 inline-block">
                {weather.uvIndex.category.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Burn Time & Sunscreen prompt */}
        <div className="mt-6 pt-4 border-t-2 border-[#FFF500]/30 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-[#FFF500] font-bold">
            <span className="opacity-80">BURN TIME:</span>
            <span className="text-white font-black">{calculateBurnTimeMins(uvVal).toUpperCase()}</span>
          </div>
          <p className="text-[11px] uppercase leading-tight font-bold text-[#FFF500]/90">
            {uvVal >= 6
              ? "SLAP ON SPF 50+ PA++++. UV PARASOL CRITICAL."
              : "STANDARD SUNSCREEN RECOMMENDED."}
          </p>
        </div>
      </div>

      {/* 2. NEAREST RAINFALL & RADAR CARD */}
      <div
        id="rainfall-telemetry-card"
        className="p-6 flex flex-col justify-between border-b-4 md:border-b-0 lg:border-r-4 border-[#FFF500] relative overflow-hidden"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs uppercase font-black tracking-[0.2em] text-[#FFF500]/70">
              RAIN PROBABILITY
            </span>
            <button
              onClick={onOpenRadarModal}
              className="text-[10px] uppercase font-black bg-[#FFF500] text-[#0040D6] px-2 py-0.5 border border-black hover:bg-white transition-colors"
            >
              RADAR ↗
            </button>
          </div>

          <div className="my-2">
            <span className="text-6xl font-black italic leading-none font-['Outfit',sans-serif] text-white">
              {rainMm > 0 ? `${rainMm.toFixed(1)}` : `${weather.umbrellaScore}%`}
            </span>
            <div className="mt-2 text-xs font-black uppercase text-[#FFF500] tracking-wider">
              {rainMm > 2 ? "HEAVY DOWNPOUR" : rainMm > 0 ? `${rainMm.toFixed(1)} MM / 5 MINS` : "NO RAIN DETECTED"}
            </div>
          </div>
        </div>

        {/* Station details */}
        <div className="mt-6 pt-4 border-t-2 border-[#FFF500]/30 text-xs font-mono space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-[#FFF500]/70 break-words">
            STATION: {weather.rainfall.stationName.toUpperCase()}
          </div>
          <div className="text-[11px] uppercase font-black text-[#FFF500] break-words">
            FORECAST: {weather.forecast.toUpperCase()}
          </div>
        </div>
      </div>

      {/* 3. WIND SPEED & INVERSION RISK (Highlighted yellow block from design) */}
      <div
        id="wind-telemetry-card"
        className="p-6 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-[#FFF500] bg-[#FFF500] text-[#0040D6] relative overflow-hidden"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs uppercase font-black tracking-[0.2em] text-[#0040D6]/80">
              WIND RAGE / GUSTS
            </span>
            <button
              onClick={onOpenPhysicsModal}
              className="text-[10px] uppercase font-black bg-black text-[#FFF500] px-2 py-0.5 border border-black hover:bg-[#0040D6] transition-colors cursor-pointer"
            >
              STRESS LAB 💥
            </button>
          </div>

          <div className="my-2">
            <span className="text-6xl font-black italic leading-none font-['Outfit',sans-serif] text-[#0040D6]">
              {Math.round(windKmH)}
            </span>
            <div className="mt-2 text-xs font-black uppercase text-[#0040D6] tracking-wider">
              KM/H // {weather.wind.isHighWind ? "INVERSION DANGER" : "BREEZE SAFE"}
            </div>
          </div>
        </div>

        {/* Inversion risk */}
        <div className="mt-6 pt-4 border-t-2 border-[#0040D6]/30 text-xs font-mono space-y-1">
          <div className="flex justify-between font-black uppercase text-[11px]">
            <span>INVERSION RISK:</span>
            <span>{inversionRiskPercent}%</span>
          </div>
          <p className="text-[10px] uppercase font-bold leading-tight text-[#0040D6]/90">
            {weather.wind.isHighWind
              ? "HOLD ON TO YOUR DIGNITY. STANDARD UMBRELLAS WILL INVERT."
              : "STABLE FOR STANDARD AND COMPACT POCKET BROLLIES."}
          </p>
        </div>
      </div>

      {/* 4. HOURLY TIMELINE / 2-HOUR RADAR */}
      <div
        id="forecast-timeline-card"
        className="p-6 flex flex-col justify-between relative overflow-hidden"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs uppercase font-black tracking-[0.2em] text-[#FFF500]/70">
              MOOD OF SKY
            </span>
            <span className="text-[10px] uppercase font-black bg-black text-[#FFF500] px-2 py-0.5 border border-[#FFF500]">
              2-HR TREND
            </span>
          </div>

          <div className="my-2 min-h-[4rem] flex items-center">
            <span className="text-2xl sm:text-3xl md:text-4xl font-black italic leading-tight font-['Outfit',sans-serif] text-white uppercase break-words block">
              {weather.forecast}
            </span>
          </div>
        </div>

        {/* 4 Hourly Trend Blocks */}
        <div className="mt-4 pt-4 border-t-2 border-[#FFF500]/30 grid grid-cols-4 gap-1.5 font-mono text-center">
          {[
            { label: "NOW", prob: weather.umbrellaScore, icon: "☂️" },
            { label: "+30M", prob: Math.min(99, Math.round(weather.umbrellaScore * 0.95)), icon: "🌦️" },
            { label: "+1H", prob: Math.min(99, Math.round(weather.umbrellaScore * 0.9)), icon: "☁️" },
            { label: "+2H", prob: Math.min(99, Math.round(weather.umbrellaScore * 0.85)), icon: "☀️" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-1.5 bg-black border border-[#FFF500] text-[#FFF500]"
            >
              <div className="text-[9px] uppercase font-black text-[#FFF500]/70">{item.label}</div>
              <div className="text-xs font-black text-white">{item.prob}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
