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
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";
import { WeatherData, AIAdvice } from "../types";
import { sounds } from "../lib/sound";

interface UmbrellaScoreCardProps {
  weather: WeatherData;
  advice: AIAdvice | null;
  isLoadingAdvice: boolean;
  onRollAnotherHotTake: () => void;
}

export const UmbrellaScoreCard: React.FC<UmbrellaScoreCardProps> = ({
  weather,
  advice,
  isLoadingAdvice,
  onRollAnotherHotTake,
}) => {
  const [copied, setCopied] = useState(false);
  const score = weather.umbrellaScore;
  const isRecommendedTake = score >= 45;

  // User interactive decision toggle (defaulting to Oracle recommendation)
  const [userDecision, setUserDecision] = useState<"take_it" | "leave_it">(
    isRecommendedTake ? "take_it" : "leave_it"
  );

  useEffect(() => {
    setUserDecision(isRecommendedTake ? "take_it" : "leave_it");
  }, [score, isRecommendedTake]);

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

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"],
    });
  };

  const handleShare = () => {
    const text = `☂️ Umbrella Oracle Report for ${weather.location.region}: Decision: "${isRecommendedTake ? "TAKE IT" : "LEAVE IT"}" (Index ${score}/100 - "${advice?.verdict || "TAKE IT!"}")\nRoast: "${advice?.roast || ""}"`;
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
        DECISION
      </div>
      <div className="absolute bottom-2 right-6 text-[140px] sm:text-[200px] leading-none font-black italic opacity-10 uppercase pointer-events-none select-none text-[#FFF500]">
        ORACLE
      </div>

      {/* Header bar */}
      <div className="relative z-10 p-5 sm:p-8 border-b-4 border-[#FFF500] bg-[#002FA7]">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] font-black text-[#FFF500] mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-[#FFF500] border border-black animate-ping" />
            <span className="font-black">
              LIVE TELEMETRY: {weather.location.region.toUpperCase()} {weather.location.stationDistanceKm ? `· ${weather.rainfall.stationName} (${weather.location.stationDistanceKm}KM AWAY)` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 text-right">
            {weather.temperature !== undefined && (
              <span className="text-xs uppercase tracking-wider font-black bg-black text-[#FFF500] px-2.5 py-1 border border-[#FFF500]">
                TEMP: {weather.temperature}°C
              </span>
            )}
            <span className="text-xs uppercase tracking-wider font-black bg-black text-[#FFF500] px-2.5 py-1 border border-[#FFF500]">
              HUMIDITY: {weather.humidity}%
            </span>
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
              {advice?.verdict ? advice.verdict.toUpperCase() : (isRecommendedTake ? "YES. TAKE IT." : "LEAVE IT AT HOME.")}
            </h1>
          </div>

          {/* Rotated High-Contrast Statement Pill (Signature theme element) */}
          <div className="my-3 max-w-full px-2">
            <p className="text-sm sm:text-lg md:text-xl font-black bg-[#FFF500] text-[#0040D6] px-4 sm:px-6 py-2 uppercase tracking-wide transform -rotate-2 border-2 border-black shadow-[4px_4px_0px_0px_#000000] break-words text-center inline-block max-w-full">
              {advice?.roast || (isRecommendedTake ? "The sky is currently throwing a tantrum." : "Clear skies, but watch the UV rays.")}
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

        {/* --- UMBRELLA DECISION QUESTION BOX (LEAVE IT OR TAKE IT) --- */}
        <div
          id="umbrella-decision-box"
          className="max-w-4xl mx-auto my-8 p-6 sm:p-9 bg-black border-4 sm:border-[6px] border-[#FFF500] shadow-[10px_10px_0px_0px_#000000] text-[#FFF500]"
        >
          {/* Question Box Header - ULTRA BOLD & MASSIVE */}
          <div className="pb-5 mb-6 border-b-4 border-[#FFF500] text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="inline-flex items-center gap-2">
                <span className="bg-[#FFF500] text-[#0040D6] font-black text-sm sm:text-base px-3 py-1 border-2 border-black font-mono shadow-[2px_2px_0px_0px_#000000]">
                  ⚡ ACTION REQUIRED
                </span>
                <span className="text-xs sm:text-sm uppercase font-mono font-black tracking-widest text-[#FFF500]">
                  TAP TO CHOOSE YOUR MOVE
                </span>
              </div>

              <div className="inline-block bg-[#002FA7] px-3 py-1 border-2 border-[#FFF500] font-mono text-xs font-black uppercase text-[#FFF500]">
                ORACLE ACCURACY: {score}%
              </div>
            </div>

            {/* Massive Heading */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tight font-['Outfit',sans-serif] text-white leading-tight mt-2 drop-shadow-[2px_2px_0px_#0040D6]">
              UMBRELLA DECISION: <span className="text-[#FFF500] underline decoration-[#0040D6]">LEAVE IT</span> OR <span className="text-[#FFF500] underline decoration-[#0040D6]">TAKE IT</span>?
            </h2>
          </div>

          {/* 2-Option Interactive Big Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-7">
            {/* OPTION 1: LEAVE IT BUTTON */}
            <button
              type="button"
              id="btn-decision-leave-it"
              onClick={() => {
                setUserDecision("leave_it");
                sounds.playPop();
              }}
              className={`w-full text-left p-6 sm:p-7 border-4 sm:border-[5px] transition-all duration-150 relative flex flex-col justify-between cursor-pointer active:translate-x-1 active:translate-y-1 ${
                userDecision === "leave_it"
                  ? "bg-[#0037B8] border-[#FFF500] text-[#FFF500] shadow-[8px_8px_0px_0px_#FFF500] ring-4 ring-[#FFF500]/50"
                  : "bg-neutral-950 border-neutral-700 text-neutral-300 hover:border-[#FFF500] hover:bg-neutral-900 shadow-[5px_5px_0px_0px_#000000] hover:shadow-[7px_7px_0px_0px_#FFF500]"
              }`}
            >
              {/* Top Banner Row inside Button */}
              <div className="flex items-center justify-between gap-2 mb-4 w-full">
                <span className="text-4xl sm:text-5xl">🚫⛱️</span>
                {!isRecommendedTake ? (
                  <span className="bg-[#FFF500] text-[#0040D6] text-xs font-black font-mono uppercase px-3 py-1 border-2 border-black shadow-[3px_3px_0px_0px_#000000] animate-bounce">
                    ★ RECOMMENDED BY ORACLE
                  </span>
                ) : (
                  <span className="bg-rose-950 text-rose-300 text-xs font-black font-mono uppercase px-2.5 py-1 border border-rose-500">
                    ⚠️ {score}% RAIN RISK
                  </span>
                )}
              </div>

              {/* Huge Option Title */}
              <div className="my-2">
                <div className="text-3xl sm:text-5xl font-black italic uppercase font-['Outfit',sans-serif] tracking-tight text-white mb-2">
                  LEAVE IT
                </div>
                <p className="text-xs sm:text-sm font-mono font-bold leading-relaxed text-neutral-200">
                  {!isRecommendedTake
                    ? "Dry skies. Travel light without lugging extra baggage."
                    : "Caution: High wet chance! Only pick if travel is 100% sheltered."}
                </p>
              </div>

              {/* Big Selectable Action Pill inside */}
              <div
                className={`mt-5 py-3.5 px-4 border-3 font-mono font-black text-sm sm:text-base uppercase flex items-center justify-between text-center transition-all ${
                  userDecision === "leave_it"
                    ? "bg-[#FFF500] text-[#0040D6] border-black shadow-[4px_4px_0px_0px_#000000]"
                    : "bg-black text-[#FFF500] border-[#FFF500] group-hover:bg-[#FFF500] group-hover:text-black"
                }`}
              >
                <span className="flex items-center gap-2">
                  {userDecision === "leave_it" ? "✅ SELECTED (LEAVING IT)" : "👉 CLICK TO LEAVE IT"}
                </span>
                <span className="text-xs font-black">
                  {userDecision === "leave_it" ? "ACTIVE" : "CHOOSE"}
                </span>
              </div>
            </button>

            {/* OPTION 2: TAKE IT BUTTON */}
            <button
              type="button"
              id="btn-decision-take-it"
              onClick={() => {
                setUserDecision("take_it");
                sounds.playPop();
              }}
              className={`w-full text-left p-6 sm:p-7 border-4 sm:border-[5px] transition-all duration-150 relative flex flex-col justify-between cursor-pointer active:translate-x-1 active:translate-y-1 ${
                userDecision === "take_it"
                  ? "bg-[#FFF500] border-black text-[#0040D6] shadow-[8px_8px_0px_0px_#000000] ring-4 ring-[#0040D6]"
                  : "bg-neutral-950 border-neutral-700 text-neutral-300 hover:border-[#FFF500] hover:bg-neutral-900 shadow-[5px_5px_0px_0px_#000000] hover:shadow-[7px_7px_0px_0px_#FFF500]"
              }`}
            >
              {/* Top Banner Row inside Button */}
              <div className="flex items-center justify-between gap-2 mb-4 w-full">
                <span className="text-4xl sm:text-5xl">☂️⚡</span>
                {isRecommendedTake ? (
                  <span className="bg-black text-[#FFF500] text-xs font-black font-mono uppercase px-3 py-1 border-2 border-[#FFF500] shadow-[3px_3px_0px_0px_#FFF500] animate-bounce">
                    ★ RECOMMENDED BY ORACLE
                  </span>
                ) : (
                  <span className="bg-neutral-800 text-neutral-300 text-xs font-black font-mono uppercase px-2.5 py-1 border border-neutral-600">
                    SUN SHIELD ONLY
                  </span>
                )}
              </div>

              {/* Huge Option Title */}
              <div className="my-2">
                <div
                  className={`text-3xl sm:text-5xl font-black italic uppercase font-['Outfit',sans-serif] tracking-tight mb-2 ${
                    userDecision === "take_it" ? "text-[#0040D6]" : "text-white"
                  }`}
                >
                  TAKE IT
                </div>
                <p
                  className={`text-xs sm:text-sm font-mono font-bold leading-relaxed ${
                    userDecision === "take_it" ? "text-[#0040D6]/95" : "text-neutral-200"
                  }`}
                >
                  {isRecommendedTake
                    ? "Essential protection! Heavy rain, sudden squalls, or harsh UV ahead."
                    : "Sun protection ready, though rain chance is mild."}
                </p>
              </div>

              {/* Big Selectable Action Pill inside */}
              <div
                className={`mt-5 py-3.5 px-4 border-3 font-mono font-black text-sm sm:text-base uppercase flex items-center justify-between text-center transition-all ${
                  userDecision === "take_it"
                    ? "bg-black text-[#FFF500] border-black shadow-[4px_4px_0px_0px_#000000]"
                    : "bg-black text-[#FFF500] border-[#FFF500] group-hover:bg-[#FFF500] group-hover:text-black"
                }`}
              >
                <span className="flex items-center gap-2">
                  {userDecision === "take_it" ? "✅ SELECTED (TAKING IT)" : "👉 CLICK TO TAKE IT"}
                </span>
                <span className="text-xs font-black">
                  {userDecision === "take_it" ? "ACTIVE" : "CHOOSE"}
                </span>
              </div>
            </button>
          </div>

          {/* Outcome Confirmation Status Bar */}
          <div className="mt-6 p-4 sm:p-5 bg-[#002FA7] border-3 border-[#FFF500] shadow-[4px_4px_0px_0px_#000000] flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm font-mono text-[#FFF500]">
            <div className="flex items-center gap-3">
              <span className="bg-[#FFF500] text-[#0040D6] font-black px-2.5 py-1 border-2 border-black uppercase text-xs sm:text-sm shrink-0">
                LOCKED IN:
              </span>
              <span className="font-black text-white uppercase text-sm sm:text-base tracking-wide">
                YOU CHOSE: {userDecision === "take_it" ? "BRING UMBRELLA ☂️" : "LEAVE UMBRELLA AT HOME 🚫"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-black uppercase">
              <span className="bg-black px-2.5 py-1 border border-[#FFF500]">
                {weather.location.region}: {weather.forecast}
              </span>
              <span className="bg-black px-2.5 py-1 border border-[#FFF500]">
                RAIN: {weather.rainfall.amountMm}mm
              </span>
            </div>
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
            <span>{copied ? "COPIED REPORT!" : "COPY DECISION"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

