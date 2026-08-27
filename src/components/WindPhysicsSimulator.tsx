import React, { useState } from "react";
import {
  Wind,
  ShieldAlert,
  Sparkles,
  X,
  Gauge,
  Zap,
  CheckCircle,
  AlertOctagon,
} from "lucide-react";
import { sounds } from "../lib/sound";

interface WindPhysicsSimulatorProps {
  currentWindKmH: number;
  isOpen: boolean;
  onClose: () => void;
}

interface UmbrellaModel {
  id: string;
  name: string;
  maxWindResistanceKmH: number;
  durability: number;
  icon: string;
  description: string;
}

export const WindPhysicsSimulator: React.FC<WindPhysicsSimulatorProps> = ({
  currentWindKmH,
  isOpen,
  onClose,
}) => {
  const [testWindSpeed, setTestWindSpeed] = useState<number>(Math.round(currentWindKmH || 18));
  const [selectedUmbrella, setSelectedUmbrella] = useState<string>("standard_foldable");
  const [testResult, setTestResult] = useState<{
    status: "survived" | "struggling" | "inverted" | "destroyed";
    message: string;
    physicsScore: number;
  } | null>(null);

  if (!isOpen) return null;

  const umbrellaModels: UmbrellaModel[] = [
    {
      id: "cheap_convenience",
      name: "$5 Plastic 7-Eleven Martyr",
      maxWindResistanceKmH: 22,
      durability: 30,
      icon: "☂️",
      description: "Thin metal ribs, clear plastic canopy. Folds under mild annoyance.",
    },
    {
      id: "standard_foldable",
      name: "Standard 3-Fold Compact",
      maxWindResistanceKmH: 35,
      durability: 60,
      icon: "🌂",
      description: "Everyday pocket brolly. Decent for city drizzle, sketchy in squalls.",
    },
    {
      id: "uv_silver_parasol",
      name: "Silver UV Anti-Melanin Parasol",
      maxWindResistanceKmH: 30,
      durability: 55,
      icon: "⛱️",
      description: "100% UV block layer. Super lightweight, but caught by wind like a kite.",
    },
    {
      id: "heavy_golf_sword",
      name: "24-Rib Heavy-Duty Golf Sword",
      maxWindResistanceKmH: 65,
      durability: 95,
      icon: "🗡️",
      description: "Double canopy vents and fiberglass ribs. Practically bulletproof.",
    },
    {
      id: "plastic_bag",
      name: "FairPrice Plastic Bag on Head",
      maxWindResistanceKmH: 10,
      durability: 5,
      icon: "🛍️",
      description: "Desperate times call for desperate measures. 100% waterproof for ears.",
    },
  ];

  const handleRunStressTest = () => {
    sounds.playWhoosh();
    const model = umbrellaModels.find((m) => m.id === selectedUmbrella) || umbrellaModels[1];
    const diff = testWindSpeed - model.maxWindResistanceKmH;

    if (diff > 18) {
      setTestResult({
        status: "destroyed",
        message: `💥 CATASTROPHIC FAILURE! Ribs snapped into 3 pieces at ${testWindSpeed} km/h. Canopy launched into orbit.`,
        physicsScore: 5,
      });
    } else if (diff > 0) {
      setTestResult({
        status: "inverted",
        message: `🌪️ INVERSION CONFIRMED! Your ${model.name} turned into a bowl for catching rainwater.`,
        physicsScore: 35,
      });
    } else if (diff > -8) {
      setTestResult({
        status: "struggling",
        message: `😬 STRUGGLING HARD: Intense flapping, you need two hands and a wide stance to hold it.`,
        physicsScore: 70,
      });
    } else {
      setTestResult({
        status: "survived",
        message: `✅ SOLID AS A ROCK: ${model.name} laughs at ${testWindSpeed} km/h breeze. Completely dry.`,
        physicsScore: 98,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#0037B8] border-4 sm:border-[6px] border-[#FFF500] p-6 text-[#FFF500] shadow-[10px_10px_0px_0px_#000000] relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={() => {
            sounds.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 bg-black text-[#FFF500] hover:bg-[#FFF500] hover:text-[#0040D6] border-2 border-[#FFF500] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b-4 border-[#FFF500]">
          <div className="p-2.5 bg-[#FFF500] text-[#0040D6] font-black border-2 border-black">
            <Wind className="w-6 h-6 animate-pulse stroke-[3]" />
          </div>
          <div>
            <h3 className="text-xl font-black font-['Outfit',sans-serif] uppercase tracking-tighter text-[#FFF500]">
              WIND INVERSION STRESS LAB
            </h3>
            <p className="text-xs uppercase font-mono tracking-wider text-[#FFF500]/70">
              LIVE WIND SPEED: {currentWindKmH.toFixed(1)} KM/H
            </p>
          </div>
        </div>

        {/* Wind Speed Control Slider */}
        <div className="p-4 bg-black border-2 border-[#FFF500] my-4 shadow-[4px_4px_0px_0px_#000000]">
          <div className="flex justify-between items-center text-xs font-mono font-black mb-2 uppercase text-[#FFF500]">
            <span className="opacity-80">TEST VELOCITY:</span>
            <span className="text-xl font-black text-[#FFF500] font-mono">
              {testWindSpeed} KM/H{" "}
              <span className="text-xs bg-[#FFF500] text-[#0040D6] px-1.5 py-0.5 ml-1">
                {testWindSpeed >= 40 ? "GALE" : testWindSpeed >= 25 ? "SQUALL" : "BREEZE"}
              </span>
            </span>
          </div>

          <input
            type="range"
            min="5"
            max="80"
            value={testWindSpeed}
            onChange={(e) => setTestWindSpeed(Number(e.target.value))}
            className="w-full h-3 bg-[#002FA7] appearance-none cursor-pointer accent-[#FFF500] border border-[#FFF500]"
          />

          <div className="flex justify-between text-[10px] font-mono uppercase font-bold text-[#FFF500]/70 mt-1.5">
            <span>5 KM/H (CALM)</span>
            <span className="text-[#FFF500]">35 KM/H (INVERSION POINT)</span>
            <span>80 KM/H (TYPHOON)</span>
          </div>
        </div>

        {/* Select Umbrella Model */}
        <div className="space-y-2 mb-4">
          <label className="block text-xs font-mono font-black text-[#FFF500] uppercase tracking-wider">
            SELECT CANOPY SPECIMEN
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {umbrellaModels.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedUmbrella(m.id);
                  sounds.playPop();
                }}
                className={`p-3 border-2 text-left text-xs transition-all flex items-start gap-2.5 ${
                  selectedUmbrella === m.id
                    ? "bg-[#FFF500] text-[#0040D6] border-black shadow-[3px_3px_0px_0px_#000000]"
                    : "bg-black text-[#FFF500] border-[#FFF500]/60 hover:border-[#FFF500]"
                }`}
              >
                <span className="text-2xl shrink-0">{m.icon}</span>
                <div>
                  <div className="font-black uppercase tracking-tight leading-tight">{m.name}</div>
                  <div className="text-[10px] font-mono opacity-80 mt-0.5">
                    RATING: {m.maxWindResistanceKmH} KM/H
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRunStressTest}
          className="w-full py-3.5 px-4 bg-[#FFF500] hover:bg-white text-[#0040D6] font-mono font-black text-xs sm:text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5 text-[#0040D6] stroke-[3]" />
          <span>FIRE WIND CANNON SIMULATION!</span>
        </button>

        {/* Simulation Output */}
        {testResult && (
          <div
            className={`mt-4 p-4 border-2 font-mono text-xs leading-relaxed uppercase shadow-[4px_4px_0px_0px_#000000] ${
              testResult.status === "survived"
                ? "bg-black border-[#FFF500] text-[#FFF500]"
                : testResult.status === "struggling"
                ? "bg-amber-950 border-amber-400 text-amber-200"
                : "bg-rose-950 border-rose-400 text-rose-200"
            }`}
          >
            <div className="flex items-center gap-2 font-black mb-1 text-sm">
              {testResult.status === "survived" ? (
                <CheckCircle className="w-4 h-4 text-[#FFF500]" />
              ) : (
                <AlertOctagon className="w-4 h-4 text-rose-400" />
              )}
              <span>STATUS: {testResult.status}</span>
            </div>
            <p className="font-bold">{testResult.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};
