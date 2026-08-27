import React, { useState, useRef, useEffect } from "react";
import {
  Umbrella,
  MapPin,
  RefreshCw,
  Volume2,
  VolumeX,
  Bell,
  BellRing,
  Search,
  Crosshair,
  Radio,
  ChevronDown,
} from "lucide-react";
import { sounds } from "../lib/sound";

interface HeaderProps {
  currentLocationName: string;
  onSelectLocation: (area: string, isCoord?: boolean, lat?: number, lon?: number) => void;
  onDetectGps: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  allSgAreas: string[];
}

export const Header: React.FC<HeaderProps> = ({
  currentLocationName,
  onSelectLocation,
  onDetectGps,
  onRefresh,
  isLoading,
  notificationsEnabled,
  onToggleNotifications,
  soundEnabled,
  onToggleSound,
  allSgAreas,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const quickTowns = [
    "Jurong West",
    "Clementi",
    "Orchard",
    "Marina Bay",
    "Ang Mo Kio",
    "Bedok",
    "Tampines",
    "Woodlands",
    "Bishan",
    "Punggol",
    "Queenstown",
    "Toa Payoh",
  ];

  const defaultAllAreas = [
    "Ang Mo Kio", "Bedok", "Bishan", "Boon Lay", "Bukit Batok", "Bukit Merah",
    "Bukit Panjang", "Bukit Timah", "Central Water Catchment", "Changi", "Choa Chu Kang",
    "City", "Clementi", "Geylang", "Hougang", "Jalan Bahar", "Jurong East",
    "Jurong Island", "Jurong West", "Kallang", "Lim Chu Kang", "Mandai", "Marine Parade",
    "Novena", "Orchard", "Pasir Ris", "Paya Lebar", "Pioneer", "Pulau Tekong",
    "Pulau Ubin", "Punggol", "Queenstown", "Seletar", "Sembawang", "Sengkang",
    "Sentosa", "Serangoon", "Southern Islands", "Sungei Kadut", "Tampines", "Tanglin",
    "Tengah", "Toa Payoh", "Tuas", "Western Islands", "Western Water Catchment",
    "Woodlands", "Yishun",
  ];

  const areaList = allSgAreas && allSgAreas.length > 0 ? allSgAreas : defaultAllAreas;

  const filteredAreas = areaList.filter((a) =>
    a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header id="app-header" className="w-full max-w-5xl mx-auto mb-6">
      {/* Top utility bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0037B8] border-4 border-[#FFF500] shadow-[6px_6px_0px_0px_#FFF500] text-[#FFF500]">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FFF500] text-[#0040D6] flex items-center justify-center font-black text-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <Umbrella className="w-7 h-7 stroke-[3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tighter uppercase font-['Outfit',sans-serif] text-[#FFF500]">
                UMBRELLA ORACLER
              </span>
              <span className="flex items-center gap-1 text-[10px] bg-[#FFF500] text-[#0040D6] px-2 py-0.5 font-mono font-black border border-black uppercase">
                <Radio className="w-3 h-3 animate-pulse text-red-600" />
                LIVE NEA FEED
              </span>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#FFF500]/80">
              Singapore Data.gov.sg & NEA Real-Time Telemetry
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            id="toggle-sound-btn"
            onClick={() => {
              onToggleSound();
              sounds.playPop();
            }}
            title={soundEnabled ? "Mute sounds" : "Enable sound effects"}
            className="p-2.5 bg-black border-2 border-[#FFF500] text-[#FFF500] hover:bg-[#FFF500] hover:text-[#0040D6] transition-colors font-bold"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
          </button>

          {/* Notifications toggle */}
          <button
            id="toggle-notifications-btn"
            onClick={() => {
              onToggleNotifications();
              sounds.playPop();
            }}
            title="Toggle Rain/UV notifications"
            className={`flex items-center gap-1.5 px-3 py-2 border-2 text-xs font-black uppercase tracking-wider transition-all ${
              notificationsEnabled
                ? "bg-[#FFF500] text-[#0040D6] border-black shadow-[2px_2px_0px_0px_#000000]"
                : "bg-black text-[#FFF500] border-[#FFF500] hover:bg-[#FFF500]/20"
            }`}
          >
            {notificationsEnabled ? (
              <>
                <BellRing className="w-4 h-4 animate-bounce" />
                <span className="hidden sm:inline">ALERTS ON</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">ALERTS OFF</span>
              </>
            )}
          </button>

          {/* Refresh button */}
          <button
            id="refresh-telemetry-btn"
            onClick={() => {
              sounds.playWhoosh();
              onRefresh();
            }}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FFF500] text-[#0040D6] border-2 border-black text-xs font-black uppercase tracking-widest hover:bg-white active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 shadow-[3px_3px_0px_0px_#000000]"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "SYNCING..." : "REFRESH"}</span>
          </button>
        </div>
      </div>

      {/* Location Selector Sub-row */}
      <div className="mt-3 flex flex-col gap-2" ref={dropdownRef}>
        <div className="relative">
          <button
            id="location-picker-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-[#0037B8] border-2 border-[#FFF500] text-[#FFF500] hover:bg-[#002FA7] text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#FFF500] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-left min-w-0">
              <MapPin className="w-4 h-4 text-[#FFF500] shrink-0" />
              <span className="text-[#FFF500]/70 shrink-0 text-xs">SELECTED SINGAPORE REGION:</span>
              <span className="font-black text-white text-sm sm:text-base uppercase tracking-wide bg-black/40 px-2 py-0.5 border border-[#FFF500]/50">
                {currentLocationName}
              </span>
              {isLoading && (
                <span className="text-[10px] font-mono text-[#FFF500] animate-pulse">
                  (UPDATING SENSORS...)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] sm:text-xs bg-[#FFF500] text-[#0040D6] px-3 py-1.5 font-black border border-black flex items-center gap-1">
                CHANGE REGION (47 AREAS)
                <ChevronDown className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-40 top-full left-0 right-0 mt-2 p-3 bg-black border-4 border-[#FFF500] shadow-[8px_8px_0px_0px_#0037B8] max-h-96 overflow-hidden flex flex-col text-[#FFF500]">
              {/* GPS Option */}
              <button
                id="use-my-gps-btn"
                onClick={() => {
                  onDetectGps();
                  setIsDropdownOpen(false);
                  sounds.playPop();
                }}
                className="flex items-center justify-center gap-2 w-full p-2.5 bg-[#FFF500] text-[#0040D6] text-xs font-black uppercase tracking-wider hover:bg-white transition-colors mb-2.5 border-2 border-black"
              >
                <Crosshair className="w-4 h-4 shrink-0" />
                <span>USE EXACT GPS TELEMETRY (AUTO-LOCATE NEAREST SENSOR)</span>
              </button>

              {/* Search */}
              <div className="relative mb-2.5">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#FFF500]" />
                <input
                  type="text"
                  placeholder="SEARCH ALL 47 SINGAPORE PLANNING AREAS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border-2 border-[#FFF500] text-xs font-mono font-bold text-[#FFF500] placeholder:text-[#FFF500]/50 focus:outline-hidden focus:bg-slate-950"
                  autoFocus
                />
              </div>

              {/* Area List */}
              <div className="overflow-y-auto flex-1 divide-y divide-[#FFF500]/20 font-mono grid grid-cols-1 sm:grid-cols-2 gap-1 pr-1">
                {filteredAreas.map((area) => {
                  const isActive = currentLocationName.toLowerCase() === area.toLowerCase() ||
                    currentLocationName.toLowerCase().includes(area.toLowerCase());
                  return (
                    <button
                      key={area}
                      onClick={() => {
                        onSelectLocation(area);
                        setIsDropdownOpen(false);
                        sounds.playPop();
                      }}
                      className={`text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#FFF500] hover:text-[#0040D6] transition-colors font-bold uppercase border border-transparent hover:border-black ${
                        isActive ? "bg-[#FFF500] text-[#0040D6] font-black border-black" : "text-[#FFF500] bg-slate-950/80"
                      }`}
                    >
                      <span>{area}</span>
                      {isActive && (
                        <span className="text-[10px] bg-black text-[#FFF500] px-1.5 py-0.5 font-mono">SELECTED</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick-Pick Region Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
          <span className="text-[11px] font-mono font-black text-[#FFF500]/70 uppercase tracking-widest shrink-0 mr-1">
            QUICK SWITCH:
          </span>
          {quickTowns.map((town) => {
            const isActive = currentLocationName.toLowerCase() === town.toLowerCase() ||
              currentLocationName.toLowerCase().includes(town.toLowerCase());
            return (
              <button
                key={town}
                onClick={() => {
                  onSelectLocation(town);
                  sounds.playPop();
                }}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase shrink-0 transition-all border ${
                  isActive
                    ? "bg-[#FFF500] text-[#0040D6] border-black font-black shadow-[2px_2px_0px_0px_#000000]"
                    : "bg-[#002FA7] text-[#FFF500] border-[#FFF500]/40 hover:bg-[#FFF500] hover:text-[#0040D6] hover:border-[#FFF500]"
                }`}
              >
                {town}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
