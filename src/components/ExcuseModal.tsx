import React, { useState } from "react";
import {
  X,
  Dices,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  Laugh,
  Send,
} from "lucide-react";
import { AIAdvice, PersonaType } from "../types";
import { sounds } from "../lib/sound";

interface ExcuseModalProps {
  isOpen: boolean;
  onClose: () => void;
  advice: AIAdvice | null;
  selectedPersona: PersonaType;
  currentArea: string;
  onRollNew: () => void;
  isLoading: boolean;
}

export const ExcuseModal: React.FC<ExcuseModalProps> = ({
  isOpen,
  onClose,
  advice,
  selectedPersona,
  currentArea,
  onRollNew,
  isLoading,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const standardExcuses = [
    {
      category: "Texting The Boss",
      text: `Hi Boss, radar shows a monsoon vortex over ${currentArea}. Atmospheric friction is threatening to compromise my umbrella integrity. Working safely from home today!`,
    },
    {
      category: "Cancelling Social Dinner",
      text: `Hey guys, UV is at critical roasted-pork level and the umbrella index is 85/100. My dermatologist strictly forbid me from crossing the road. Raincheck!`,
    },
    {
      category: "Singlish Auntie Special",
      text: `Aiyoh! Don't call me out leh. Sky so black like soya sauce, step out sure become drowned chicken (tang jia ji). Next time lah!`,
    },
    {
      category: "Bespoke AI Hot Take",
      text: advice?.excuseToStayHome || "Atmospheric barometric pressure is incompatible with my emotional wellbeing.",
    },
  ];

  const handleCopy = (text: string, idx: number) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      sounds.playPop();
      setTimeout(() => setCopiedIndex(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#0037B8] border-4 sm:border-[6px] border-[#FFF500] p-6 text-[#FFF500] shadow-[10px_10px_0px_0px_#000000] relative max-h-[85vh] flex flex-col">
        {/* Close Button */}
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
            <Laugh className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <h3 className="text-xl font-black font-['Outfit',sans-serif] uppercase tracking-tighter text-[#FFF500]">
              WEATHER EXCUSE GENERATOR
            </h3>
            <p className="text-xs uppercase font-mono tracking-wider text-[#FFF500]/70">
              Reasons to stay home or bring your mega brolly
            </p>
          </div>
        </div>

        {/* Excuses List */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1 my-2">
          {standardExcuses.map((excuse, idx) => (
            <div
              key={idx}
              className="p-4 bg-black border-2 border-[#FFF500] text-[#FFF500] shadow-[3px_3px_0px_0px_#000000]"
            >
              <div className="flex items-center justify-between text-xs font-mono font-black uppercase text-[#FFF500] mb-2">
                <span className="bg-[#FFF500] text-[#0040D6] px-2 py-0.5 font-black">{excuse.category}</span>
                <button
                  onClick={() => handleCopy(excuse.text, idx)}
                  className="flex items-center gap-1 px-3 py-1 bg-[#FFF500] hover:bg-white text-[#0040D6] border border-black text-xs font-mono font-black uppercase tracking-wider transition-colors"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY TEXT</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs font-mono leading-relaxed text-[#FFF500]/90">
                "{excuse.text}"
              </p>
            </div>
          ))}
        </div>

        {/* Footer Roll New */}
        <div className="mt-4 pt-3 border-t-4 border-[#FFF500] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-mono font-black uppercase tracking-wider text-[#FFF500]">
            PERSONA: {selectedPersona.toUpperCase()}
          </span>
          <button
            onClick={() => {
              sounds.playPop();
              onRollNew();
            }}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FFF500] hover:bg-white text-[#0040D6] font-black text-xs font-mono uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50"
          >
            <Dices className={`w-4 h-4 text-[#0040D6] ${isLoading ? "animate-spin" : ""}`} />
            <span>GENERATE FRESH HOT TAKE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
