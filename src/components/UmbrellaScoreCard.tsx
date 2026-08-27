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
          className="max-w-3xl mx-auto my-6 p-5 sm:p-7 bg-black border-4 sm:border-[5px] border-[#FFF500] shadow-[8px_8px_0px_0px_#000000] text-[#FFF500]"
        >
          {/* Question Box Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b-4 border-[#FFF500]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#FFF500] text-[#0040D6] font-black text-xs px-2.5 py-0.5 border-2 border-black font-mono">
                  STEP 1
                </span>
                <span className="text-xs uppercase font-mono font-black tracking-widest text-[#FFF500]/80">
                  YOUR CALL
                </span>
              </div>
              <h3 className="font-black text-lg sm:text-2xl uppercase tracking-tight font-['Outfit',sans-serif] text-white">
                UMBRELLA DECISION: LEAVE IT OR TAKE IT?
              </h3>
            </div>

            {/* Quick Segment Switcher Pill */}
            <div className="flex items-center bg-[#002FA7] p-1 border-2 border-[#FFF500] gap-1">
              <button
                type="button"
                onClick={() => {
                  setUserDecision("leave_it");
                  sounds.playPop();
                }}
                className={`px-3 py-1.5 text-xs font-mono font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  userDecision === "leave_it"
                    ? "bg-[#FFF500] text-[#0040D6] border border-black shadow-[2px_2px_0px_0px_#000000]"
                    : "text-[#FFF500] hover:bg-white/10"
                }`}
              >
                <span>🚫 LEAVE IT</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserDecision("take_it");
                  sounds.playPop();
                }}
                className={`px-3 py-1.5 text-xs font-mono font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  userDecision === "take_it"
                    ? "bg-[#FFF500] text-[#0040D6] border border-black shadow-[2px_2px_0px_0px_#000000]"
                    : "text-[#FFF500] hover:bg-white/10"
                }`}
              >
                <span>☂️ TAKE IT</span>
              </button>
            </div>
          </div>

          {/* Prompt instruction for user */}
          <div className="flex items-center justify-between text-xs font-mono font-black uppercase text-[#FFF500] mb-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#FFF500] animate-ping" />
              CLICK EITHER BUTTON BELOW TO LOCK IN YOUR CHOICE:
            </span>
            <span className="hidden sm:inline-block bg-black px-2 py-0.5 border border-[#FFF500] text-[10px]">
              {userDecision === (isRecommendedTake ? "take_it" : "leave_it")
                ? "AGREE WITH ORACLE"
                : "OVERRULING ORACLE"}
            </span>
          </div>

          {/* 2-Option Interactive Big Buttons (LEAVE IT vs TAKE IT) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* OPTION 1: LEAVE IT */}
            <div
              onClick={() => {
                setUserDecision("leave_it");
                sounds.playPop();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setUserDecision("leave_it");
                  sounds.playPop();
                }
              }}
              className={`group p-5 border-4 cursor-pointer text-left transition-all duration-150 relative flex flex-col justify-between select-none ${
                userDecision === "leave_it"
                  ? "bg-[#0037B8] border-[#FFF500] text-[#FFF500] shadow-[6px_6px_0px_0px_#FFF500] scale-[1.01]"
                  : "bg-slate-950 border-slate-700 text-slate-300 hover:border-[#FFF500] hover:bg-slate-900 shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#FFF500]"
              }`}
            >
              {/* Top Row: Radio circle + Oracle badge */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      userDecision === "leave_it"
                        ? "border-black bg-[#FFF500] text-[#0040D6]"
                        : "border-slate-500 bg-black text-transparent group-hover:border-[#FFF500]"
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[4]" />
                  </div>
                  <span className="text-2xl">🚫⛱️</span>
                </div>

                {!isRecommendedTake ? (
                  <span className="bg-[#FFF500] text-[#0040D6] text-[11px] font-black font-mono uppercase px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000] animate-pulse">
                    ★ ORACLE CHOICE
                  </span>
                ) : (
                  <span className="bg-rose-900/90 text-rose-200 text-[10px] font-black font-mono uppercase px-2 py-0.5 border border-rose-500">
                    ⚠️ {score}% RAIN RISK
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <div>
                <h4 className="text-3xl sm:text-4xl font-black italic uppercase font-['Outfit',sans-serif] tracking-tight text-white mb-1.5">
                  LEAVE IT
                </h4>
                <p className="text-xs font-mono font-bold leading-relaxed mb-4 text-slate-200">
                  {!isRecommendedTake
                    ? "Skies are clear. Enjoy travel without carrying extra weight."
                    : "Warning: High risk of getting wet unless using 100% sheltered walkways!"}
                </p>
              </div>

              {/* Action Button Strip */}
              <div
                className={`mt-2 py-2.5 px-3 border-2 font-mono font-black text-xs uppercase flex items-center justify-between transition-all ${
                  userDecision === "leave_it"
                    ? "bg-[#FFF500] text-[#0040D6] border-black shadow-[2px_2px_0px_0px_#000000]"
                    : "bg-black text-[#FFF500] border-slate-700 group-hover:border-[#FFF500] group-hover:bg-[#FFF500] group-hover:text-black"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {userDecision === "leave_it" ? "✓ SELECTED" : "SELECT OPTION"}
                </span>
                <span className="text-[10px] opacity-80">
                  {100 - score}% DRY CHANCE
                </span>
              </div>
            </div>

            {/* OPTION 2: TAKE IT */}
            <div
              onClick={() => {
                setUserDecision("take_it");
                sounds.playPop();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setUserDecision("take_it");
                  sounds.playPop();
                }
              }}
              className={`group p-5 border-4 cursor-pointer text-left transition-all duration-150 relative flex flex-col justify-between select-none ${
                userDecision === "take_it"
                  ? "bg-[#FFF500] border-black text-[#0040D6] shadow-[6px_6px_0px_0px_#000000] scale-[1.01]"
                  : "bg-slate-950 border-slate-700 text-slate-300 hover:border-[#FFF500] hover:bg-slate-900 shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#FFF500]"
              }`}
            >
              {/* Top Row: Radio circle + Oracle badge */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      userDecision === "take_it"
                        ? "border-black bg-black text-[#FFF500]"
                        : "border-slate-500 bg-black text-transparent group-hover:border-[#FFF500]"
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[4]" />
                  </div>
                  <span className="text-2xl">☂️⚡</span>
                </div>

                {isRecommendedTake ? (
                  <span className="bg-black text-[#FFF500] text-[11px] font-black font-mono uppercase px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000] animate-pulse">
                    ★ ORACLE CHOICE
                  </span>
                ) : (
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-black font-mono uppercase px-2 py-0.5">
                    SUN SHIELD ONLY
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <div>
                <h4 className="text-3xl sm:text-4xl font-black italic uppercase font-['Outfit',sans-serif] tracking-tight mb-1.5 text-current">
                  TAKE IT
                </h4>
                <p className="text-xs font-mono font-bold leading-relaxed mb-4 text-current/90">
                  {isRecommendedTake
                    ? "Essential protection! Heavy rain, sudden squalls, or harsh UV ahead."
                    : "Protects against UV sunburn, but drench chance is low."}
                </p>
              </div>

              {/* Action Button Strip */}
              <div
                className={`mt-2 py-2.5 px-3 border-2 font-mono font-black text-xs uppercase flex items-center justify-between transition-all ${
                  userDecision === "take_it"
                    ? "bg-black text-[#FFF500] border-black shadow-[2px_2px_0px_0px_#000000]"
                    : "bg-black text-[#FFF500] border-slate-700 group-hover:border-[#FFF500] group-hover:bg-[#FFF500] group-hover:text-black"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {userDecision === "take_it" ? "✓ SELECTED" : "SELECT OPTION"}
                </span>
                <span className="text-[10px] opacity-80">
                  SCORE: {score}/100
                </span>
              </div>
            </div>
          </div>

          {/* Outcome Confirmation Banner */}
          <div className="mt-5 p-3.5 bg-[#002FA7] border-2 border-[#FFF500] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#FFF500]">
            <div className="flex items-center gap-2">
              <span className="bg-[#FFF500] text-[#0040D6] font-black px-2 py-0.5 border border-black uppercase text-[11px]">
                CONFIRMED:
              </span>
              <span className="font-bold text-white uppercase text-xs sm:text-sm">
                YOU CHOSE TO {userDecision === "take_it" ? "TAKE YOUR UMBRELLA ☂️" : "LEAVE YOUR UMBRELLA 🚫"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-black uppercase">
              <span className="bg-black px-2 py-0.5 border border-[#FFF500]">
                {weather.location.region}: {weather.forecast}
              </span>
              <span className="bg-black px-2 py-0.5 border border-[#FFF500]">
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

