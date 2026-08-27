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
          <div className="my-3">
            <p className="text-sm sm:text-lg md:text-xl font-black bg-[#FFF500] text-[#0040D6] px-6 py-2 uppercase tracking-wide transform -rotate-2 border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
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
          className="max-w-3xl mx-auto my-6 p-5 sm:p-6 bg-black border-4 border-[#FFF500] shadow-[6px_6px_0px_0px_#000000] text-[#FFF500]"
        >
          {/* Question Box Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b-2 border-[#FFF500]/60">
            <div className="flex items-center gap-2">
              <span className="bg-[#FFF500] text-[#0040D6] font-black text-xs px-2 py-0.5 border border-black font-mono">
                [ ? ] QUESTION
              </span>
              <h3 className="font-black text-sm sm:text-base uppercase tracking-wider font-['Outfit',sans-serif] text-white">
                UMBRELLA DECISION: LEAVE IT OR TAKE IT?
              </h3>
            </div>
            <span className="text-[11px] font-mono font-black uppercase bg-[#0040D6] text-[#FFF500] px-2 py-0.5 border border-[#FFF500]">
              CERTAINTY: {score}%
            </span>
          </div>

          {/* 2-Option Decision Cards (LEAVE IT vs TAKE IT) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* OPTION 1: LEAVE IT */}
            <button
              type="button"
              onClick={() => {
                setUserDecision("leave_it");
                sounds.playPop();
              }}
              className={`p-4 border-4 text-left transition-all relative flex flex-col justify-between ${
                userDecision === "leave_it"
                  ? "bg-[#0037B8] border-[#FFF500] text-[#FFF500] shadow-[4px_4px_0px_0px_#FFF500]"
                  : "bg-slate-950 border-slate-700 text-slate-400 hover:border-[#FFF500]/60 hover:text-white"
              }`}
            >
              {/* Badge */}
              <div className="flex justify-between items-start mb-2">
                <span className="text-3xl">🚫⛱️</span>
                {!isRecommendedTake ? (
                  <span className="bg-[#FFF500] text-[#0040D6] text-[10px] font-black font-mono uppercase px-2 py-0.5 border border-black animate-pulse">
                    ★ ORACLE PICK
                  </span>
                ) : (
                  <span className="bg-rose-900 text-rose-200 text-[10px] font-black font-mono uppercase px-2 py-0.5 border border-rose-600">
                    ⚠️ {score}% WET RISK
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-2xl font-black italic uppercase font-['Outfit',sans-serif] tracking-tight text-white mb-1">
                  LEAVE IT
                </h4>
                <p className="text-xs font-mono font-bold leading-relaxed mb-3">
                  {!isRecommendedTake
                    ? "Safe to travel light. Skies clear, no drench risk."
                    : "High risk of getting soaked! Only choose if fully sheltered."}
                </p>
              </div>

              <div className="pt-2 border-t border-current/20 flex items-center justify-between text-[11px] font-mono font-black uppercase">
                <span>Drench Chance: {100 - score}% Safe</span>
                <span className="underline">{userDecision === "leave_it" ? "SELECTED ✓" : "CHOOSE"}</span>
              </div>
            </button>

            {/* OPTION 2: TAKE IT */}
            <button
              type="button"
              onClick={() => {
                setUserDecision("take_it");
                sounds.playPop();
              }}
              className={`p-4 border-4 text-left transition-all relative flex flex-col justify-between ${
                userDecision === "take_it"
                  ? "bg-[#FFF500] border-black text-[#0040D6] shadow-[4px_4px_0px_0px_#000000]"
                  : "bg-slate-950 border-slate-700 text-slate-400 hover:border-[#FFF500]/60 hover:text-white"
              }`}
            >
              {/* Badge */}
              <div className="flex justify-between items-start mb-2">
                <span className="text-3xl">☂️⚡</span>
                {isRecommendedTake ? (
                  <span className="bg-black text-[#FFF500] text-[10px] font-black font-mono uppercase px-2 py-0.5 border border-[#FFF500] animate-pulse">
                    ★ ORACLE PICK
                  </span>
                ) : (
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-black font-mono uppercase px-2 py-0.5">
                    SUN PROTECTION ONLY
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-2xl font-black italic uppercase font-['Outfit',sans-serif] tracking-tight text-current mb-1">
                  TAKE IT
                </h4>
                <p className="text-xs font-mono font-black leading-relaxed mb-3">
                  {isRecommendedTake
                    ? "Essential shield! Tropical showers or high UV detected."
                    : "Good for high UV rays, otherwise bag space sacrificed."}
                </p>
              </div>

              <div className="pt-2 border-t border-current/20 flex items-center justify-between text-[11px] font-mono font-black uppercase">
                <span>Need Index: {score}/100</span>
                <span className="underline font-black">{userDecision === "take_it" ? "SELECTED ✓" : "CHOOSE"}</span>
              </div>
            </button>
          </div>

          {/* Clean Readable Status Bar */}
          <div className="mt-4 p-3 bg-[#002FA7] border-2 border-[#FFF500] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#FFF500]">
            <div className="flex items-center gap-2">
              <span className="font-black uppercase text-white">ORACLE REASONING:</span>
              <span className="font-bold">
                {userDecision === "take_it"
                  ? `${weather.forecast} in ${weather.location.region} + UV ${weather.uvIndex.value} index.`
                  : `Skies relatively dry in ${weather.location.region} (Rainfall: ${weather.rainfall.amountMm}mm).`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase">
              <span className="bg-black px-2 py-0.5 border border-[#FFF500]">
                RAIN: {weather.rainfall.amountMm > 0 ? `${weather.rainfall.amountMm}mm` : "0mm"}
              </span>
              <span className="bg-black px-2 py-0.5 border border-[#FFF500]">
                UV: {weather.uvIndex.value} ({weather.uvIndex.category})
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

