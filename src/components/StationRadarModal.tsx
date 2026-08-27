import React, { useState } from "react";
import { X, CloudRain, Radio, Search, MapPin, Droplets, Check } from "lucide-react";
import { RainStation } from "../types";
import { sounds } from "../lib/sound";

interface StationRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: RainStation[];
  activeStationId: string;
  onSelectStation: (st: RainStation) => void;
}

export const StationRadarModal: React.FC<StationRadarModalProps> = ({
  isOpen,
  onClose,
  stations = [],
  activeStationId,
  onSelectStation,
}) => {
  const [filter, setFilter] = useState("");

  if (!isOpen) return null;

  const filtered = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.id.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0037B8] border-4 sm:border-[6px] border-[#FFF500] p-6 text-[#FFF500] shadow-[10px_10px_0px_0px_#000000] relative max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playPop();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 bg-black text-[#FFF500] hover:bg-[#FFF500] hover:text-[#0040D6] border-2 border-[#FFF500] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b-4 border-[#FFF500]">
          <div className="p-2.5 bg-[#FFF500] text-[#0040D6] font-black border-2 border-black">
            <Radio className="w-6 h-6 animate-pulse stroke-[3]" />
          </div>
          <div>
            <h3 className="text-xl font-black font-['Outfit',sans-serif] uppercase tracking-tighter text-[#FFF500]">
              REAL-TIME RAIN RADAR SENSORS
            </h3>
            <p className="text-xs uppercase font-mono tracking-wider text-[#FFF500]/70">
              Live 5-minute telemetry feeds across all Singapore sectors
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#FFF500]/70" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search sensor (e.g. Clementi, Jurong, Bedok, Woodlands)..."
            className="w-full pl-9 pr-4 py-2.5 bg-black border-2 border-[#FFF500] text-xs font-mono font-bold text-[#FFF500] placeholder:text-[#FFF500]/50 focus:outline-hidden focus:bg-slate-950"
          />
        </div>

        {/* Station Grid List */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-[#FFF500]/60 font-mono text-xs uppercase font-bold">
              No matching rainfall sensors found.
            </div>
          ) : (
            filtered.map((st) => {
              const isSelected = st.id === activeStationId;
              return (
                <div
                  key={st.id}
                  onClick={() => {
                    onSelectStation(st);
                    sounds.playPop();
                    onClose();
                  }}
                  className={`p-3 flex items-center justify-between cursor-pointer border-2 transition-colors ${
                    isSelected
                      ? "bg-[#FFF500] text-[#0040D6] border-black shadow-[3px_3px_0px_0px_#000000]"
                      : "bg-black text-[#FFF500] border-[#FFF500]/60 hover:border-[#FFF500]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 border text-xs font-mono font-black ${
                        isSelected
                          ? "bg-black text-[#FFF500] border-black"
                          : st.rainfall > 2
                          ? "bg-rose-600 text-white border-rose-400"
                          : st.rainfall > 0
                          ? "bg-[#002FA7] text-[#FFF500] border-[#FFF500]"
                          : "bg-slate-900 text-[#FFF500]/70 border-slate-700"
                      }`}
                    >
                      <Droplets className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <span>{st.name}</span>
                        {isSelected && (
                          <span className="text-[9px] bg-black text-[#FFF500] px-1.5 py-0.2 font-black">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono opacity-80">
                        ID: {st.id} // LAT: {st.lat.toFixed(2)}, LON: {st.lon.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span
                      className={`text-sm font-black ${
                        isSelected ? "text-[#0040D6]" : st.rainfall > 0 ? "text-[#FFF500]" : "text-[#FFF500]/70"
                      }`}
                    >
                      {st.rainfall.toFixed(1)} MM
                    </span>
                    <div className="text-[9px] opacity-70">/ 5 MINS</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t-4 border-[#FFF500] flex items-center justify-between text-xs font-mono font-black uppercase text-[#FFF500]">
          <span>TELEMETRY: DATA.GOV.SG NEA API</span>
          <span>CYCLE: 60 SECONDS</span>
        </div>
      </div>
    </div>
  );
};
