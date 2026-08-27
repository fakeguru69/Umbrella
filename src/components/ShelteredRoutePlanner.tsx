import React, { useState, useEffect } from "react";
import {
  Footprints,
  Navigation,
  Shield,
  Building,
  Train,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Route,
} from "lucide-react";
import { AIAdvice } from "../types";
import { sounds } from "../lib/sound";

interface ShelteredRoutePlannerProps {
  currentArea: string;
  advice: AIAdvice | null;
}

export const ShelteredRoutePlanner: React.FC<ShelteredRoutePlannerProps> = ({
  currentArea,
  advice,
}) => {
  const [fromLocation, setFromLocation] = useState(`${currentArea} MRT`);
  const [toLocation, setToLocation] = useState("Kopitiam / Mall");

  useEffect(() => {
    setFromLocation(`${currentArea} MRT`);
  }, [currentArea]);
  const [generatedRoute, setGeneratedRoute] = useState<{
    shelterCoverage: number;
    steps: Array<{ title: string; desc: string; sheltered: boolean; icon: string }>;
    secretNinjaTip: string;
  } | null>(null);

  const handlePlanRoute = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPop();

    // Generate quirky sheltered walking itinerary
    setGeneratedRoute({
      shelterCoverage: 92,
      steps: [
        {
          title: `Exit ${fromLocation} via Gate B`,
          desc: "Connect directly to the 100% sheltered high-ceiling linkway.",
          sheltered: true,
          icon: "🚇",
        },
        {
          title: "Navigate HDB Void Decks (Blocks 401 - 410)",
          desc: "Weave under the concrete stilts like a monsoon ninja. Completely dry.",
          sheltered: true,
          icon: "🏢",
        },
        {
          title: "The 3-Second Crosswalk Sprint",
          desc: "Uncovered zebra crossing (15 meters). Execute tactical light jog.",
          sheltered: false,
          icon: "⚡",
        },
        {
          title: `Arrive safely at ${toLocation}`,
          desc: "Enter air-conditioned underpass without a single raindrop on your clothes.",
          sheltered: true,
          icon: "🎯",
        },
      ],
      secretNinjaTip:
        advice?.shelteredRouteTip ||
        "Always prioritize MRT linkways and HDB five-foot ways. In Singapore, you can walk 3km across town without touching the sky if you master the void deck matrix.",
    });
  };

  return (
    <div
      id="sheltered-route-planner"
      className="w-full max-w-5xl mx-auto mt-6 p-6 sm:p-8 border-4 sm:border-[6px] border-[#FFF500] bg-[#0037B8] text-[#FFF500] shadow-[8px_8px_0px_0px_#000000]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b-4 border-[#FFF500]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#FFF500] text-[#0040D6] font-black border-2 border-black text-xl">
            <Route className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <h3 className="font-black text-xl sm:text-2xl uppercase tracking-tighter text-[#FFF500] font-['Outfit',sans-serif]">
              TACTICAL SHELTERED ROUTE PLANNER
            </h3>
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#FFF500]/70">
              Cross Singapore without touching monsoon rain or UV rays
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-black uppercase px-3 py-1.5 bg-[#FFF500] text-[#0040D6] border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-[#0040D6]" />
          90%+ DRY WALK GUARANTEE
        </span>
      </div>

      {/* Input Route Form */}
      <form onSubmit={handlePlanRoute} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div>
          <label className="block text-xs font-mono font-black text-[#FFF500] uppercase tracking-wider mb-1.5">
            START POINT
          </label>
          <input
            type="text"
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-black border-2 border-[#FFF500] text-xs font-mono font-bold text-[#FFF500] placeholder:text-[#FFF500]/50 focus:outline-hidden focus:bg-slate-950"
            placeholder="e.g. Jurong East MRT"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-black text-[#FFF500] uppercase tracking-wider mb-1.5">
            DESTINATION
          </label>
          <input
            type="text"
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-black border-2 border-[#FFF500] text-xs font-mono font-bold text-[#FFF500] placeholder:text-[#FFF500]/50 focus:outline-hidden focus:bg-slate-950"
            placeholder="e.g. Westgate / Food Centre"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            id="calculate-shelter-route-btn"
            className="w-full py-2.5 px-4 bg-[#FFF500] hover:bg-white text-[#0040D6] border-2 border-black font-mono font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Navigation className="w-4 h-4 text-[#0040D6]" />
            <span>FIND SHELTERED PATH</span>
          </button>
        </div>
      </form>

      {/* Itinerary Result or Default Guide */}
      {generatedRoute ? (
        <div className="p-5 bg-black border-4 border-[#FFF500] space-y-4 shadow-[4px_4px_0px_0px_#000000]">
          <div className="flex flex-wrap items-center justify-between border-b-2 border-[#FFF500]/40 pb-3 gap-2">
            <div className="flex items-center gap-2 font-mono text-xs font-black uppercase text-[#FFF500]">
              <span>FROM: {fromLocation}</span>
              <ArrowRight className="w-4 h-4 text-[#FFF500]" />
              <span>TO: {toLocation}</span>
            </div>
            <span className="text-xs font-mono font-black uppercase px-3 py-1 bg-[#FFF500] text-[#0040D6] border border-black">
              {generatedRoute.shelterCoverage}% SHELTER COVERAGE
            </span>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {generatedRoute.steps.map((step, idx) => (
              <div
                key={idx}
                className={`p-3.5 border-2 text-xs flex items-start gap-3 ${
                  step.sheltered
                    ? "bg-[#002FA7] border-[#FFF500] text-[#FFF500]"
                    : "bg-rose-950 border-rose-400 text-rose-200"
                }`}
              >
                <span className="text-2xl shrink-0">{step.icon}</span>
                <div>
                  <div className="font-black uppercase flex items-center gap-2 text-xs tracking-wider">
                    <span>{step.title}</span>
                    {step.sheltered ? (
                      <span className="text-[9px] bg-[#FFF500] text-[#0040D6] px-1.5 py-0.2 font-black">100% DRY</span>
                    ) : (
                      <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 font-black">SPRINT!</span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono opacity-90 mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Secret Ninja Tip from AI */}
          <div className="p-4 bg-[#FFF500] text-[#0040D6] border-2 border-black text-xs font-mono flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-[#0040D6] shrink-0 mt-0.5" />
            <div>
              <span className="font-black uppercase tracking-widest text-[#0040D6] block mb-0.5">TACTICAL PROTOCOL:</span>
              <span className="font-bold text-[#0040D6]">{generatedRoute.secretNinjaTip}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Default Quick Tips */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 bg-black border-2 border-[#FFF500] text-xs">
            <div className="text-2xl mb-1">🏢</div>
            <h4 className="font-black uppercase text-[#FFF500] mb-1 tracking-wider">HDB VOID DECK MATRIX</h4>
            <p className="text-[#FFF500]/80 font-mono text-[11px] leading-relaxed">
              Connect through ground floor void decks. Blocks with linked sheltered walkways allow cross-estate transit with 0 wetness.
            </p>
          </div>

          <div className="p-4 bg-black border-2 border-[#FFF500] text-xs">
            <div className="text-2xl mb-1">🚇</div>
            <h4 className="font-black uppercase text-[#FFF500] mb-1 tracking-wider">MRT CONCOURSE TUNNELS</h4>
            <p className="text-[#FFF500]/80 font-mono text-[11px] leading-relaxed">
              Use air-conditioned underground MRT underpasses to cross wide highways and bypass torrential monsoon downpours safely.
            </p>
          </div>

          <div className="p-4 bg-black border-2 border-[#FFF500] text-xs">
            <div className="text-2xl mb-1">🏮</div>
            <h4 className="font-black uppercase text-[#FFF500] mb-1 tracking-wider">HERITAGE FIVE-FOOT WAYS</h4>
            <p className="text-[#FFF500]/80 font-mono text-[11px] leading-relaxed">
              In Chinatown and Katong, historical shophouse five-foot ways offer continuous shelter from torrential rain and blazing UV rays.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
