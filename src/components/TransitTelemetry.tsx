import React, { useState, useEffect, useCallback } from "react";
import {
  Bus,
  Car,
  AlertTriangle,
  Train,
  RefreshCw,
  Search,
  Clock,
  Navigation,
  ShieldCheck,
  Zap,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Gauge,
  CheckCircle2,
} from "lucide-react";
import { sounds } from "../lib/sound";

interface BusNext {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: string;
  Latitude: string;
  Longitude: string;
  VisitNumber: string;
  Load: string; // "SEA" (Seats Available), "SDA" (Standing Available), "LSD" (Limited Standing)
  Feature: string; // "WAB"
  Type: string; // "SD" (Single), "DD" (Double), "BD" (Bendy)
}

interface BusService {
  ServiceNo: string;
  Operator: string;
  NextBus?: BusNext;
  NextBus2?: BusNext;
  NextBus3?: BusNext;
}

interface CarparkItem {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string;
  AvailableLots: number;
  LotType: string;
  Agency: string;
}

interface TrafficIncident {
  Type: string;
  Latitude: number;
  Longitude: number;
  Message: string;
}

interface TrainAlert {
  Status: number; // 1 = Normal, 2 = Disrupted
  Line?: string;
  Direction?: string;
  Stations?: string;
  FreePublicBus?: string;
  FreeMRTShuttle?: string;
  MRTShuttleDirection?: string;
  Message?: Array<{ Content: string; CreatedDate: string }>;
}

export const TransitTelemetry: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"bus" | "carpark" | "train" | "traffic">("bus");

  // Bus states
  const [busStopCode, setBusStopCode] = useState<string>("83139");
  const [serviceNo, setServiceNo] = useState<string>("");
  const [busData, setBusData] = useState<{ BusStopCode: string; Services: BusService[] } | null>(null);
  const [isLoadingBus, setIsLoadingBus] = useState<boolean>(false);
  const [busError, setBusError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(20);

  // Carpark states
  const [carparks, setCarparks] = useState<CarparkItem[]>([]);
  const [carparkQuery, setCarparkQuery] = useState<string>("");
  const [isLoadingCarparks, setIsLoadingCarparks] = useState<boolean>(false);
  const [carparkError, setCarparkError] = useState<string | null>(null);

  // Traffic & Train states
  const [trafficIncidents, setTrafficIncidents] = useState<TrafficIncident[]>([]);
  const [isLoadingTraffic, setIsLoadingTraffic] = useState<boolean>(false);
  const [trafficError, setTrafficError] = useState<string | null>(null);

  const [trainAlerts, setTrainAlerts] = useState<TrainAlert | null>(null);
  const [isLoadingTrain, setIsLoadingTrain] = useState<boolean>(false);
  const [trainError, setTrainError] = useState<string | null>(null);

  // 1. Fetch Buses
  const fetchBuses = useCallback(async (code: string, svc: string) => {
    setIsLoadingBus(true);
    setBusError(null);
    try {
      let url = `/api/lta/bus-arrival?BusStopCode=${encodeURIComponent(code)}`;
      if (svc.trim()) url += `&ServiceNo=${encodeURIComponent(svc.trim())}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        if (data?.error === "credential not configured") {
          setBusError("LTA_DATAMALL_ACCOUNT_KEY is not configured in secrets. Add your free key to enable live bus radar.");
        } else {
          setBusError(data?.error || `HTTP ${res.status} Error`);
        }
        setBusData(null);
      } else {
        setBusData(data);
      }
    } catch (err: any) {
      setBusError(err.message || "Failed to connect to LTA DataMall");
    } finally {
      setIsLoadingBus(false);
      setCountdown(20);
    }
  }, []);

  // 2. Fetch Carparks
  const fetchCarparks = useCallback(async () => {
    setIsLoadingCarparks(true);
    setCarparkError(null);
    try {
      const res = await fetch("/api/lta/carparks");
      const data = await res.json();
      if (!res.ok) {
        if (data?.error === "credential not configured") {
          setCarparkError("LTA_DATAMALL_ACCOUNT_KEY is not configured. Add your key to view live sheltered lots.");
        } else {
          setCarparkError(data?.error || `HTTP ${res.status} Error`);
        }
        setCarparks([]);
      } else {
        setCarparks(data.value || []);
      }
    } catch (err: any) {
      setCarparkError(err.message || "Failed to fetch carpark data");
    } finally {
      setIsLoadingCarparks(false);
    }
  }, []);

  // 3. Fetch Traffic Incidents
  const fetchTraffic = useCallback(async () => {
    setIsLoadingTraffic(true);
    setTrafficError(null);
    try {
      const res = await fetch("/api/lta/traffic-incidents");
      const data = await res.json();
      if (!res.ok) {
        if (data?.error === "credential not configured") {
          setTrafficError("LTA_DATAMALL_ACCOUNT_KEY is not configured.");
        } else {
          setTrafficError(data?.error || `HTTP ${res.status} Error`);
        }
        setTrafficIncidents([]);
      } else {
        setTrafficIncidents(data.value || []);
      }
    } catch (err: any) {
      setTrafficError(err.message || "Failed to fetch traffic incidents");
    } finally {
      setIsLoadingTraffic(false);
    }
  }, []);

  // 4. Fetch Train Alerts
  const fetchTrainAlerts = useCallback(async () => {
    setIsLoadingTrain(true);
    setTrainError(null);
    try {
      const res = await fetch("/api/lta/train-alerts");
      const data = await res.json();
      if (!res.ok) {
        if (data?.error === "credential not configured") {
          setTrainError("LTA_DATAMALL_ACCOUNT_KEY is not configured.");
        } else {
          setTrainError(data?.error || `HTTP ${res.status} Error`);
        }
        setTrainAlerts(null);
      } else {
        setTrainAlerts(data.value || { Status: 1 });
      }
    } catch (err: any) {
      setTrainError(err.message || "Failed to fetch train alerts");
    } finally {
      setIsLoadingTrain(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchBuses(busStopCode, serviceNo);
    fetchTrainAlerts();
  }, []);

  // 20s auto-refresh timer for Bus Arrival
  useEffect(() => {
    if (!autoRefresh || activeTab !== "bus") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchBuses(busStopCode, serviceNo);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, activeTab, busStopCode, serviceNo, fetchBuses]);

  // Handle Tab switch
  const handleTabChange = (tab: "bus" | "carpark" | "train" | "traffic") => {
    setActiveTab(tab);
    sounds.playPop();
    if (tab === "carpark" && carparks.length === 0) fetchCarparks();
    if (tab === "traffic" && trafficIncidents.length === 0) fetchTraffic();
    if (tab === "train") fetchTrainAlerts();
    if (tab === "bus") fetchBuses(busStopCode, serviceNo);
  };

  // Helper to format minutes from ISO timestamp
  const getArrivalMinutes = (isoTime?: string) => {
    if (!isoTime) return "-";
    const arrival = new Date(isoTime).getTime();
    const diffMin = Math.round((arrival - Date.now()) / (60 * 1000));
    if (diffMin <= 0) return "Arr";
    if (diffMin === 1) return "1 min";
    return `${diffMin} mins`;
  };

  const getLoadBadge = (load?: string) => {
    if (load === "SEA") return <span className="bg-emerald-400 text-black px-1.5 py-0.5 text-[10px] font-black font-mono">SEATS</span>;
    if (load === "SDA") return <span className="bg-amber-400 text-black px-1.5 py-0.5 text-[10px] font-black font-mono">STAND</span>;
    if (load === "LSD") return <span className="bg-rose-500 text-white px-1.5 py-0.5 text-[10px] font-black font-mono">FULL</span>;
    return null;
  };

  const getTypeIcon = (type?: string) => {
    if (type === "DD") return "🚌 [Double Deck]";
    if (type === "BD") return "🚌 [Bendy]";
    return "🚌 [Single]";
  };

  const filteredCarparks = carparks.filter((c) =>
    c.Development?.toLowerCase().includes(carparkQuery.toLowerCase()) ||
    c.Area?.toLowerCase().includes(carparkQuery.toLowerCase()) ||
    c.CarParkID?.toLowerCase().includes(carparkQuery.toLowerCase())
  );

  return (
    <div
      id="singapore-transit-telemetry"
      className="w-full max-w-5xl mx-auto mt-8 p-6 sm:p-8 border-4 sm:border-[6px] border-[#FFF500] bg-black text-[#FFF500] shadow-[10px_10px_0px_0px_#000000]"
    >
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b-4 border-[#FFF500]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#FFF500] text-[#0040D6] font-black border-2 border-black text-2xl shadow-[2px_2px_0px_0px_#0040D6]">
            <Zap className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#002FA7] text-[#FFF500] font-black text-[11px] px-2.5 py-0.5 border border-[#FFF500] font-mono uppercase">
                LTA DataMall 2.0 Live Service
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                ONLINE
              </span>
            </div>
            <h3 className="font-black text-xl sm:text-3xl uppercase tracking-tight text-white font-['Outfit',sans-serif]">
              SINGAPORE TRANSIT & SHELTER RADAR
            </h3>
          </div>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#002FA7] p-1.5 border-2 border-[#FFF500]">
          <button
            type="button"
            onClick={() => handleTabChange("bus")}
            className={`px-3 py-1.5 text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "bus"
                ? "bg-[#FFF500] text-[#0040D6] border border-black shadow-[2px_2px_0px_0px_#000000]"
                : "text-[#FFF500] hover:bg-white/10"
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>BUS ARRIVAL (V3)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("train")}
            className={`px-3 py-1.5 text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "train"
                ? "bg-[#FFF500] text-[#0040D6] border border-black shadow-[2px_2px_0px_0px_#000000]"
                : "text-[#FFF500] hover:bg-white/10"
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>MRT/LRT STATUS</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("carpark")}
            className={`px-3 py-1.5 text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "carpark"
                ? "bg-[#FFF500] text-[#0040D6] border border-black shadow-[2px_2px_0px_0px_#000000]"
                : "text-[#FFF500] hover:bg-white/10"
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>CARPARK LOTS</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("traffic")}
            className={`px-3 py-1.5 text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "traffic"
                ? "bg-[#FFF500] text-[#0040D6] border border-black shadow-[2px_2px_0px_0px_#000000]"
                : "text-[#FFF500] hover:bg-white/10"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>TRAFFIC INCIDENTS</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: BUS ARRIVAL (v3) ===================== */}
      {activeTab === "bus" && (
        <div className="space-y-5">
          {/* Query Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sounds.playPop();
              fetchBuses(busStopCode, serviceNo);
            }}
            className="p-4 bg-[#002FA7] border-3 border-[#FFF500] grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
          >
            <div>
              <label className="block text-xs font-mono font-black uppercase text-[#FFF500] mb-1">
                BUS STOP CODE (5 DIGITS)
              </label>
              <input
                type="text"
                value={busStopCode}
                onChange={(e) => setBusStopCode(e.target.value)}
                placeholder="e.g. 83139 or 28009"
                className="w-full px-3 py-2 bg-black border-2 border-[#FFF500] text-xs font-mono font-bold text-[#FFF500] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-[#FFF500] mb-1">
                SERVICE NO (OPTIONAL)
              </label>
              <input
                type="text"
                value={serviceNo}
                onChange={(e) => setServiceNo(e.target.value)}
                placeholder="e.g. 15 or 179"
                className="w-full px-3 py-2 bg-black border-2 border-[#FFF500] text-xs font-mono font-bold text-[#FFF500] focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoadingBus}
                className="flex-1 py-2 px-3 bg-[#FFF500] hover:bg-white text-[#0040D6] font-mono font-black text-xs uppercase border-2 border-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBus ? "animate-spin" : ""}`} />
                <span>QUERY BUSES</span>
              </button>
            </div>

            {/* Presets & Refresh Countdown */}
            <div className="flex items-center justify-between text-xs font-mono font-black text-[#FFF500] bg-black px-3 py-2 border border-[#FFF500]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#FFF500]" />
                {autoRefresh ? `REFRESH IN ${countdown}s` : "MANUAL"}
              </span>
              <button
                type="button"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="text-[10px] uppercase underline text-[#FFF500] hover:text-white"
              >
                {autoRefresh ? "PAUSE" : "AUTO-REFRESH"}
              </button>
            </div>
          </form>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-[#FFF500]/70 font-bold uppercase text-[11px]">POPULAR HUBS:</span>
            {[
              { name: "Bedok / Eunos (83139)", code: "83139", svc: "15" },
              { name: "Jurong East Int (28009)", code: "28009", svc: "" },
              { name: "Orchard Boulevard (09022)", code: "09022", svc: "" },
              { name: "Clementi Stn (17171)", code: "17171", svc: "" },
              { name: "Tampines Int (75009)", code: "75009", svc: "" },
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setBusStopCode(preset.code);
                  setServiceNo(preset.svc);
                  fetchBuses(preset.code, preset.svc);
                }}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-[#002FA7] border border-neutral-700 hover:border-[#FFF500] text-slate-300 hover:text-[#FFF500] text-[11px] font-mono cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Error / Credential Notice */}
          {busError && (
            <div className="p-4 bg-rose-950 border-3 border-rose-500 text-rose-200 text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 font-black uppercase text-sm text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>LTA Telemetry Notice</span>
              </div>
              <p>{busError}</p>
              <div className="pt-2 text-[11px] text-rose-300 flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5" />
                <span>
                  Configure <code className="bg-black px-1.5 py-0.5 text-yellow-300">LTA_DATAMALL_ACCOUNT_KEY</code> in project secrets. Free key available at datamall.lta.gov.sg
                </span>
              </div>
            </div>
          )}

          {/* Bus Results Grid */}
          {busData && (
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#FFF500]/30 font-mono text-xs text-[#FFF500]">
                <span>STOP CODE: #{busData.BusStopCode}</span>
                <span>{busData.Services?.length || 0} SERVICES AVAILABLE</span>
              </div>

              {busData.Services?.length === 0 ? (
                <div className="p-8 text-center bg-neutral-950 border-2 border-neutral-800 text-slate-400 font-mono text-xs">
                  No bus services currently operating at Stop #{busData.BusStopCode}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {busData.Services?.map((svc, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-neutral-950 border-3 border-[#FFF500] text-[#FFF500] shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-[#FFF500]/30 pb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl font-black bg-[#FFF500] text-[#0040D6] px-2.5 py-0.5 border border-black font-mono">
                            {svc.ServiceNo}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                            {svc.Operator}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-slate-400">
                          {getTypeIcon(svc.NextBus?.Type)}
                        </span>
                      </div>

                      {/* 3 Upcoming Buses */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-[#002FA7] border border-[#FFF500]">
                          <span className="block text-[10px] text-white/80 font-mono uppercase">NEXT BUS</span>
                          <span className="block text-base sm:text-lg font-black text-[#FFF500] my-0.5">
                            {getArrivalMinutes(svc.NextBus?.EstimatedArrival)}
                          </span>
                          <div className="flex justify-center mt-1">
                            {getLoadBadge(svc.NextBus?.Load)}
                          </div>
                        </div>

                        <div className="p-2 bg-neutral-900 border border-neutral-700">
                          <span className="block text-[10px] text-slate-400 font-mono uppercase">2ND BUS</span>
                          <span className="block text-base sm:text-lg font-black text-slate-200 my-0.5">
                            {getArrivalMinutes(svc.NextBus2?.EstimatedArrival)}
                          </span>
                          <div className="flex justify-center mt-1">
                            {getLoadBadge(svc.NextBus2?.Load)}
                          </div>
                        </div>

                        <div className="p-2 bg-neutral-900 border border-neutral-700">
                          <span className="block text-[10px] text-slate-400 font-mono uppercase">3RD BUS</span>
                          <span className="block text-base sm:text-lg font-black text-slate-200 my-0.5">
                            {getArrivalMinutes(svc.NextBus3?.EstimatedArrival)}
                          </span>
                          <div className="flex justify-center mt-1">
                            {getLoadBadge(svc.NextBus3?.Load)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: MRT & LRT STATUS ===================== */}
      {activeTab === "train" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-base uppercase font-mono text-[#FFF500]">
              MRT & LRT NETWORK STATUS
            </h4>
            <button
              type="button"
              onClick={fetchTrainAlerts}
              className="px-3 py-1.5 bg-[#FFF500] text-[#0040D6] text-xs font-mono font-black uppercase border border-black flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000000]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTrain ? "animate-spin" : ""}`} />
              <span>REFRESH TRAIN STATUS</span>
            </button>
          </div>

          {trainError && (
            <div className="p-4 bg-rose-950 border-2 border-rose-500 text-rose-200 text-xs font-mono">
              {trainError}
            </div>
          )}

          {/* Normal vs Disrupted Status Banner */}
          <div className="p-5 bg-[#002FA7] border-4 border-[#FFF500] shadow-[6px_6px_0px_0px_#000000]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-emerald-400 text-black font-black border-2 border-black">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="bg-[#FFF500] text-[#0040D6] font-mono text-xs font-black px-2 py-0.5 border border-black uppercase">
                  NETWORK DISPATCH STATUS
                </span>
                <h5 className="text-xl sm:text-2xl font-black text-white uppercase mt-1 font-['Outfit',sans-serif]">
                  {trainAlerts?.Status === 2 ? "⚠️ TRAIN DELAY / DISRUPTION REPORTED" : "ALL MRT & LRT LINES OPERATING NORMALLY"}
                </h5>
              </div>
            </div>

            {trainAlerts?.Message && trainAlerts.Message.length > 0 ? (
              <div className="space-y-2 mt-4 pt-3 border-t border-[#FFF500]/40">
                {trainAlerts.Message.map((m, idx) => (
                  <div key={idx} className="p-3 bg-black border border-[#FFF500] text-xs font-mono">
                    <span className="text-[#FFF500] font-bold">{m.Content}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-[#FFF500]/90 mt-2">
                No active train service alerts. Commuters can transfer seamlessly between train lines and sheltered linkways.
              </p>
            )}
          </div>

          {/* Lines Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: "North-South Line (NSL)", color: "border-red-500 bg-red-950/40 text-red-300" },
              { name: "East-West Line (EWL)", color: "border-emerald-500 bg-emerald-950/40 text-emerald-300" },
              { name: "Circle Line (CCL)", color: "border-amber-500 bg-amber-950/40 text-amber-300" },
              { name: "Downtown Line (DTL)", color: "border-blue-500 bg-blue-950/40 text-blue-300" },
              { name: "Thomson-East Coast (TEL)", color: "border-amber-700 bg-amber-950/40 text-amber-200" },
              { name: "Bukit Panjang / Sengkang LRT", color: "border-purple-500 bg-purple-950/40 text-purple-300" },
            ].map((line, idx) => (
              <div key={idx} className={`p-3.5 border-2 ${line.color} font-mono text-xs flex items-center justify-between`}>
                <span className="font-bold">{line.name}</span>
                <span className="text-[10px] bg-black px-2 py-0.5 border border-current font-black">GOOD</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 3: CARPARK LOTS ===================== */}
      {activeTab === "carpark" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#FFF500] absolute left-3 top-3" />
              <input
                type="text"
                value={carparkQuery}
                onChange={(e) => setCarparkQuery(e.target.value)}
                placeholder="Search carpark by Mall, HDB block, or Area (e.g. Jurong, Orchard)..."
                className="w-full pl-9 pr-3 py-2 bg-black border-2 border-[#FFF500] text-xs font-mono font-bold text-[#FFF500] focus:outline-hidden"
              />
            </div>

            <button
              type="button"
              onClick={fetchCarparks}
              className="px-3.5 py-2 bg-[#FFF500] text-[#0040D6] text-xs font-mono font-black uppercase border-2 border-black flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000000]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCarparks ? "animate-spin" : ""}`} />
              <span>REFRESH LOTS</span>
            </button>
          </div>

          {carparkError && (
            <div className="p-4 bg-rose-950 border-2 border-rose-500 text-rose-200 text-xs font-mono">
              {carparkError}
            </div>
          )}

          {/* Carparks List */}
          <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1">
            {filteredCarparks.slice(0, 30).map((cp, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-neutral-950 border-2 border-neutral-700 hover:border-[#FFF500] flex flex-wrap items-center justify-between gap-2 text-xs font-mono transition-colors"
              >
                <div>
                  <div className="font-black uppercase text-white tracking-wide flex items-center gap-2">
                    <span>{cp.Development}</span>
                    <span className="text-[10px] bg-[#002FA7] text-[#FFF500] px-1.5 py-0.2 border border-[#FFF500]">
                      {cp.Agency}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    ID: {cp.CarParkID} • Area: {cp.Area || "Singapore"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-[10px] uppercase text-slate-400">AVAILABLE LOTS</span>
                    <span
                      className={`text-base font-black ${
                        cp.AvailableLots > 50
                          ? "text-emerald-400"
                          : cp.AvailableLots > 10
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {cp.AvailableLots} LOTS
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {carparks.length === 0 && !carparkError && !isLoadingCarparks && (
              <div className="p-8 text-center bg-neutral-950 border-2 border-neutral-800 text-slate-400 font-mono text-xs">
                Click "REFRESH LOTS" to query all HDB, LTA, and URA live car parks.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 4: TRAFFIC INCIDENTS ===================== */}
      {activeTab === "traffic" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-base uppercase font-mono text-[#FFF500]">
              LIVE EXPRESSWAY & ROAD INCIDENTS (RAIN & ACCIDENTS)
            </h4>
            <button
              type="button"
              onClick={fetchTraffic}
              className="px-3 py-1.5 bg-[#FFF500] text-[#0040D6] text-xs font-mono font-black uppercase border border-black flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000000]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTraffic ? "animate-spin" : ""}`} />
              <span>REFRESH INCIDENTS</span>
            </button>
          </div>

          {trafficError && (
            <div className="p-4 bg-rose-950 border-2 border-rose-500 text-rose-200 text-xs font-mono">
              {trafficError}
            </div>
          )}

          <div className="space-y-3">
            {trafficIncidents.map((inc, idx) => (
              <div
                key={idx}
                className="p-4 bg-neutral-950 border-2 border-amber-500 text-amber-200 text-xs font-mono flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-black uppercase text-amber-300 text-xs mb-1">
                    {inc.Type}
                  </div>
                  <p className="text-slate-200 leading-relaxed">{inc.Message}</p>
                </div>
              </div>
            ))}

            {trafficIncidents.length === 0 && !trafficError && (
              <div className="p-8 text-center bg-neutral-950 border-2 border-neutral-800 text-slate-400 font-mono text-xs">
                No major traffic incidents or expressway hazards reported at this time.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
