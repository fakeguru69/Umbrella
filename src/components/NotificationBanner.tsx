import React from "react";
import { AlertCircle, BellRing, Umbrella, ShieldAlert, Sparkles, X } from "lucide-react";
import { sounds } from "../lib/sound";

interface NotificationBannerProps {
  umbrellaScore: number;
  locationName: string;
  verdict: string;
  notificationsEnabled: boolean;
  onDismiss: () => void;
  isDismissed: boolean;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  umbrellaScore,
  locationName,
  verdict,
  notificationsEnabled,
  onDismiss,
  isDismissed,
}) => {
  if (umbrellaScore <= 50 || isDismissed) return null;

  return (
    <div
      id="umbrella-threshold-alert-banner"
      className="w-full max-w-5xl mx-auto mb-6 p-4 sm:p-5 bg-[#FFF500] text-[#0040D6] border-4 border-black shadow-[6px_6px_0px_0px_#000000] relative animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-black text-[#FFF500] shrink-0 border-2 border-black">
            <BellRing className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-black uppercase tracking-widest bg-black text-[#FFF500] px-2.5 py-0.5">
                HIGH UMBRELLA THRESHOLD ALERT ({umbrellaScore}% &gt; 50%)
              </span>
              {notificationsEnabled && (
                <span className="text-[10px] font-mono bg-[#0040D6] text-[#FFF500] px-2 py-0.5 font-black uppercase">
                  PUSH ACTIVE
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base font-black uppercase tracking-tight text-[#0040D6] mt-1 font-['Outfit',sans-serif]">
              ⚠️ IMMEDIATE ACTION FOR {locationName.toUpperCase()}: <span className="underline decoration-2">{verdict.toUpperCase()}</span>! PROBABILITY EXCEEDS 50%. GRAB YOUR BROLLY!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playPop();
            onDismiss();
          }}
          className="p-2 bg-black text-[#FFF500] hover:bg-[#0040D6] transition-colors shrink-0 font-black border-2 border-black"
          title="Dismiss banner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
