import React, { useEffect, useState } from "react";
import {
  Umbrella,
  Sun,
  CloudRain,
  Wind,
  Sparkles,
  Dices,
  ShieldCheck,
  AlertTriangle,
  Flame,
  HelpCircle,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { WeatherData, AIAdvice, PersonaType } from "../types";
import { sounds } from "../lib/sound";

interface UmbrellaScoreCardProps {
  weather: WeatherData;
  advice: AIAdvice | null;
  isLoadingAdvice: boolean;
  onRollAnotherHotTake: () => void;
  selectedPersona: PersonaType;
}

export const UmbrellaScoreCard: React.FC<UmbrellaScoreCardProps> = ({
  weather,
  advice,
  isLoadingAdvice,
  onRollAnotherHotTake,
  selectedPersona,
}) => {
  const [copied, setCopied] = useState(false);
  const score = weather.umbrellaScore;

  // Determine color theme based on score and conditions
  let themeColor = "amber";
  let statusTag = "MODERATE RISK";
  let statusIcon = <Umbrella className="w-5 h-5 text-amber-600" />;

  if (weather.wind.isHighWind && (score > 50 || weather.rainfall.amountMm > 0)) {
    themeColor = "rose";
    statusTag = "⚠️ GALE INVERSION WARNING";
    statusIcon = <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />;
  } else if (score >= 70) {
    themeColor = "red";
    statusTag = "🌧️ DEFINITE DRENCH RISK";
    statusIcon = <CloudRain className="w-5 h-5 text-red-600" />;
  } else if (score >= 45) {
    themeColor = "amber";
    statusTag = "🌦️ STANDBY RECOMMENDED";
    statusIcon = <Umbrella className="w-5 h-5 text-amber-600" />;
  } else if (weather.uvIndex.value >= 8) {
    themeColor = "orange";
    statusTag = "☀️ UV ROAST LEVEL: HIGH";
    statusIcon = <Sun className="w-5 h-5 text-orange-600" />;
  } else {
    themeColor = "emerald";
    statusTag = "🛡️ LOW RISK (SAFE)";
    statusIcon = <ShieldCheck className="w-5 h-5 text-emerald-600" />;
  }

  // Generate ASCII Gauge String
  // Format: ===[=========|=======]===
  const generateAsciiGauge = (val: number) => {
    const totalChars = 24;
    const pos = Math.max(0, Math.min(totalChars - 1, Math.round((val / 100) * totalChars)));
    let bar = "";
    for (let i = 0; i < totalChars; i++) {
      if (i === pos) bar += "|";
      else if (i < pos) bar += "=";
      else bar += "-";
    }
    return `===[${bar}]===`;
  };

  const asciiBar = generateAsciiGauge(score);

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"],
    });
  };

  const handleShare = () => {
    const text = `☂️ Brolly Report for ${weather.location.region}: Umbrella Index ${score}/100 - "${advice?.verdict || "TAKE IT!"}"\nRoast: "${advice?.roast || ""}"`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      sounds.playPop();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      id="umbrella-score-card"
      className="w-full max-w-5xl mx-auto bg-[#0037B8] text-[#FFF500] border-4 sm:border-[6px] border-[#FFF500] shadow-[8px_8px_0px_0px_#000000] overflow-hidden relative"
    >
      {/* Background low-opacity watermark stamping */}
      <div className="absolute top-2 left-6 text-[140px] sm:text-[200px] leading-none font-black italic opacity-10 uppercase pointer-events-none select-none text-[#FFF500]">
        BRING IT
      </div>
      <div className="absolute bottom-2 right-6 text-[140px] sm:text-[200px] leading-none font-black italic opacity-10 uppercase pointer-events-none select-none text-[#FFF500]">
        VERDICT
      </div>

      {/* Header bar */}
      <div className="relative z-10 p-5 sm:p-8 border-b-4 border-[#FFF500] bg-[#002FA7]">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.25em] font-black text-[#FFF500] mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-[#FFF500] border border-black animate-ping" />
            <span className="font-black">
              LIVE TELEMETRY: {weather.location.country} // {weather.location.region}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-[0.25em] font-black bg-black text-[#FFF500] px-2.5 py-1 border border-[#FFF500]">
              HUMIDITY: {weather.humidity}%
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center my-2">
          <span className="text-xs uppercase tracking-[0.3em] font-black text-[#FFF500]/70">
            ATMOSPHERIC SENSOR REPORT
          </span>
          <div className="h-3 w-36 sm:w-60 bg-black/40 border border-[#FFF500] relative">
            <div
              className="absolute h-full bg-[#FFF500]"
              style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
            />
          </div>
        </div>

        {/* Big Score Display & Main Verdict */}
        <div className="text-center my-6 relative z-10 flex flex-col items-center">
          {/* Giant Score Number */}
          <div className="flex items-baseline justify-center gap-2">
            <span
              id="brolly-score-display"
              className="text-8xl sm:text-[140px] md:text-[170px] leading-[0.8] font-black italic uppercase font-['Outfit',sans-serif] tracking-tighter text-[#FFF500] drop-shadow-[4px_4px_0px_#000000]"
            >
              {score}
            </span>
            <span className="text-[#FFF500]/70 font-mono text-2xl sm:text-4xl font-black">/100</span>
          </div>

          {/* Punchy Dynamic Verdict */}
          <div className="mt-4 mb-3">
            <h1
              id="brolly-verdict-title"
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.85] font-black italic uppercase font-['Outfit',sans-serif] tracking-tighter text-white drop-shadow-[4px_4px_0px_#000000] text-center"
            >
              {advice?.verdict ? advice.verdict.toUpperCase() : (score > 50 ? "YES. BRING IT." : "LEAVE IT AT HOME.")}
            </h1>
          </div>

          {/* Rotated High-Contrast Statement Pill (Signature theme element) */}
          <div className="my-3">
            <p className="text-sm sm:text-lg md:text-xl font-black bg-[#FFF500] text-[#0040D6] px-6 py-2 uppercase tracking-wide transform -rotate-2 border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
              {advice?.roast || (score > 50 ? "The sky is currently throwing a tantrum." : "Clear skies, but watch the UV rays.")}
            </p>
          </div>

          {/* Subtag badges */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 font-mono">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-[#FFF500] border-2 border-[#FFF500] text-xs font-black uppercase tracking-wider">
              {statusIcon}
              {statusTag}
            </span>
            {advice?.umbrellaArchetype && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FFF500] text-[#0040D6] border-2 border-black text-xs font-black uppercase tracking-wider">
                🛡️ REC: {advice.umbrellaArchetype.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* ASCII Gauge Display */}
        <div className="max-w-2xl mx-auto my-6 p-4 bg-black border-4 border-[#FFF500] shadow-[4px_4px_0px_0px_#FFF500] font-mono">
          <div className="flex justify-between items-center text-xs uppercase tracking-wider font-black text-[#FFF500] mb-2">
            <span className="text-[#FFF500]/70">LEAVE IT [01]</span>
            <span className="bg-[#FFF500] text-black px-2 py-0.5 font-black">PROBABILITY INDEX: {score}%</span>
            <span className="text-[#FFF500]/70">TAKE IT [100]</span>
          </div>

          <div
            id="ascii-gauge-bar"
            className="text-center font-mono text-base sm:text-xl font-black tracking-widest text-[#FFF500] select-none overflow-x-auto py-1"
          >
            {asciiBar}
          </div>

          {/* Graphical bar */}
          <div className="w-full h-3 bg-slate-900 border border-[#FFF500] mt-2 relative">
            <div
              className="h-full bg-[#FFF500] transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Action Button: Roll Another Excuse / Hot Take */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            id="roll-another-hot-take-btn"
            onClick={() => {
              sounds.playPop();
              triggerConfetti();
              onRollAnotherHotTake();
            }}
            disabled={isLoadingAdvice}
            className="flex items-center gap-2 px-6 py-3 bg-[#FFF500] hover:bg-white text-[#0040D6] font-black text-xs sm:text-sm font-mono tracking-widest uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50"
          >
            <Dices className={`w-4 h-4 text-[#0040D6] ${isLoadingAdvice ? "animate-spin" : ""}`} />
            <span>[ 🎲 ROLL WEATHER EXCUSE / HOT TAKE ]</span>
          </button>

          <button
            id="share-brolly-report-btn"
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-3 bg-black hover:bg-slate-900 text-[#FFF500] border-2 border-[#FFF500] text-xs sm:text-sm font-mono font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#FFF500] transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#FFF500]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "COPIED REPORT!" : "COPY REPORT"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
