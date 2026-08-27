import React, { useState, useEffect } from "react";
import {
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  ShieldCheck,
  Calendar,
  Layers,
  Search,
  Activity,
  Compass,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Info,
  Car,
  Navigation,
  RefreshCw,
} from "lucide-react";
import { WeatherData, DayForecast, RegionalForecast24H, AirQualityPsi } from "../types";
import { sounds } from "../lib/sound";

interface SingaporeDataGovTelemetryProps {
  weather: WeatherData;
}

export const SingaporeDataGovTelemetry: React.FC<SingaporeDataGovTelemetryProps> = ({ weather }) => {
  const [activeSection, setActiveSection] = useState<"4day" | "24hour" | "psi" | "stations" | "transport">("4day");
  const [stationSearch, setStationSearch] = useState<string>("");
  
  // Transport live states
  const [taxiData, setTaxiData] = useState<{ totalTaxis: number; timestamp?: string } | null>(null);
  const [carparkData, setCarparkData] = useState<Array<{ carparkNumber: string; totalLots: number; availableLots: number; updateTime: string }>>([]);
  const [carparkSearch, setCarparkSearch] = useState<string>("");
  const [transportLoading, setTransportLoading] = useState<boolean>(false);

  const dataGov = weather.dataGovSg;
  const forecast4d = dataGov?.forecast4Day || [];
  const forecast24h = dataGov?.forecast24Hour;
  const psiData = dataGov?.airQuality;
  const tempStations = dataGov?.stationsTemperature || [];
  const humStations = dataGov?.stationsHumidity || [];
  const rainStations = dataGov?.stationsRainfall || weather.rainfall.allStations || [];

  // Fetch transport data on demand
  const loadTransportData = async () => {
    setTransportLoading(true);
    try {
      const [taxiRes, carparkRes] = await Promise.all([
        fetch("/api/datagov/taxi-availability"),
        fetch("/api/datagov/carpark-availability"),
      ]);

      if (taxiRes.ok) {
        const tJson = await taxiRes.json();
        const coords = tJson.features?.[0]?.geometry?.coordinates || [];
        setTaxiData({
          totalTaxis: coords.length,
          timestamp: tJson.features?.[0]?.properties?.timestamp || new Date().toISOString(),
        });
      }

      if (carparkRes.ok) {
        const cJson = await carparkRes.json();
        const rawItems = cJson.items?.[0]?.carpark_data || [];
        const parsed = rawItems.slice(0, 150).map((cp: any) => {
          const info = cp.carpark_info?.[0] || {};
          return {
            carparkNumber: cp.carpark_number,
            totalLots: parseInt(info.total_lots || "0", 10),
            availableLots: parseInt(info.lots_available || "0", 10),
            updateTime: cp.update_datetime || "",
          };
        });
        setCarparkData(parsed);
      }
    } catch (e) {
      console.error("Failed to load transport telemetry:", e);
    } finally {
      setTransportLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "transport" && !taxiData) {
      loadTransportData();
    }
  }, [activeSection]);

  // PSI status indicator
  const getPsiRating = (psiVal: number) => {
    if (psiVal <= 50) return { label: "GOOD", color: "bg-emerald-400 text-black", border: "border-emerald-500", desc: "Air quality is healthy. Ideal for outdoor umbrella walks." };
    if (psiVal <= 100) return { label: "MODERATE", color: "bg-amber-400 text-black", border: "border-amber-500", desc: "Normal outdoor activity can be continued." };
    if (psiVal <= 200) return { label: "UNHEALTHY", color: "bg-orange-500 text-white", border: "border-orange-500", desc: "Reduce prolonged or strenuous outdoor exertion." };
    return { label: "VERY UNHEALTHY", color: "bg-rose-600 text-white", border: "border-rose-600", desc: "Wear N95 masks; avoid unnecessary outdoor walks." };
  };

  const nationalPsi = psiData?.readings?.psi_twenty_four_hourly?.national || 42;
  const psiStatus = getPsiRating(nationalPsi);

  const getForecastIconEmoji = (forecast: string) => {
    const f = forecast.toLowerCase();
    if (f.includes("thundery") || f.includes("storm")) return "⛈️";
    if (f.includes("heavy rain")) return "🌧️";
    if (f.includes("showers") || f.includes("rain")) return "🌦️";
    if (f.includes("cloudy")) return "⛅";
    if (f.includes("fair") || f.includes("sunny")) return "☀️";
    if (f.includes("wind")) return "💨";
    return "🌤️";
  };

  // Merge station data for station table
  const mergedStations = rainStations.map((r) => {
    const tempMatch = tempStations.find((t) => t.id === r.id || t.name.toLowerCase() === r.name.toLowerCase());
    const humMatch = humStations.find((h) => h.id === r.id || h.name.toLowerCase() === r.name.toLowerCase());
    return {
      id: r.id,
      name: r.name,
      rainfall: r.rainfall,
      temperature: tempMatch?.value ?? null,
      humidity: humMatch?.value ?? null,
    };
  }).filter((s) => s.name.toLowerCase().includes(stationSearch.toLowerCase()) || s.id.toLowerCase().includes(stationSearch.toLowerCase()));

  const filteredCarparks = carparkData.filter((c) =>
    c.carparkNumber.toLowerCase().includes(carparkSearch.toLowerCase())
  );

  return (
    <div
      id="datagovsg-telemetry-hub"
      className="w-full max-w-5xl mx-auto mt-8 p-6 sm:p-8 border-4 sm:border-[6px] border-[#FFF500] bg-black text-[#FFF500] shadow-[10px_10px_0px_0px_#000000]"
    >
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b-4 border-[#FFF500]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#FFF500] text-[#0040D6] font-black border-2 border-black text-2xl shadow-[2px_2px_0px_0px_#0040D6]">
            <Layers className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#002FA7] text-[#FFF500] font-black text-[11px] px-2.5 py-0.5 border border-[#FFF500] font-mono uppercase">
                data.gov.sg • NEA Open Environmental Telemetry
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                SYNCED
              </span>
            </div>
            <h3 className="font-black text-xl sm:text-3xl uppercase tracking-tight text-white font-['Outfit',sans-serif]">
              SINGAPORE NATIONAL ENVIRONMENTAL RADAR
            </h3>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#002FA7] p-1.5 border-2 border-[#FFF500]">
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setActiveSection("4day");
            }}
            className={`px-3 py-1.5 text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === "4day"
                ? "bg-[#FFF500] text-[#0040D6] border border-black shadow-[2px_2px_0px_0px_#000000]"
                : "text-[#FFF500] hover:bg-white/10"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>4-DAY OUTLOOK</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setActiveSection("24hour");
            }}
            className={`px-3 py-1.5 text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === "24hour"
                ? "bg-[#FFF500] text-[#0040D6] border border-black shadow-[2px_2px_0px_0px_#000000]"
                : "text-[#FFF500] hover:bg-white/10"
            }`}
          >
            <CloudSun className="w-3.5 h-3.5" />
            <span>24-HR REGIONAL MATRIX</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setActiveSection("psi");
            }}
            className={`px-3 py-1.5 text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === "psi"
                ? "bg-[#FFF500] text-[#0040D6] border border-black shadow-[2px_2px_0px_0px_#000000]"
                : "text-[#FFF500] hover:bg-white/10"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>PSI & PM2.5 AIR QUALITY</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setActiveSection("stations");
            }}
            className={`px-3 py-1.5 text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === "stations"
                ? "bg-[#FFF500] text-[#0040D6] border border-black shadow-[2px_2px_0px_0px_#000000]"
                : "text-[#FFF500] hover:bg-white/10"
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>ISLANDWIDE SENSORS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setActiveSection("transport");
            }}
            className={`px-3 py-1.5 text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === "transport"
                ? "bg-[#FFF500] text-[#0040D6] border border-black shadow-[2px_2px_0px_0px_#000000]"
                : "text-[#FFF500] hover:bg-white/10"
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>RAIN COMMUTE (LTA)</span>
          </button>
        </div>
      </div>

      {/* ===================== SECTION 1: 4-DAY FORECAST ===================== */}
      {activeSection === "4day" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-black uppercase text-[#FFF500]/80">
              NATIONAL 4-DAY SYNOPTIC METEOROLOGICAL OUTLOOK
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Updated from NEA Automated Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {forecast4d.length > 0 ? (
              forecast4d.map((day, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-neutral-950 border-3 border-[#FFF500] flex flex-col justify-between shadow-[4px_4px_0px_0px_#000000]"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#FFF500]/30 font-mono">
                      <span className="text-sm font-black text-white uppercase">{day.day}</span>
                      <span className="text-[11px] text-[#FFF500]">{day.date}</span>
                    </div>

                    <div className="text-center my-3">
                      <span className="text-4xl">{getForecastIconEmoji(day.forecast)}</span>
                      <span className="block mt-2 font-black text-xs uppercase text-[#FFF500] leading-tight">
                        {day.forecast}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-[#FFF500]/30 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">TEMP:</span>
                      <span className="text-white font-bold">
                        {day.temperature.low}°C - {day.temperature.high}°C
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">HUMIDITY:</span>
                      <span className="text-[#FFF500] font-bold">
                        {day.relative_humidity.low}% - {day.relative_humidity.high}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">WIND:</span>
                      <span className="text-slate-300 font-bold">
                        {day.wind.direction} {day.wind.speed.low}-{day.wind.speed.high} km/h
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 p-8 text-center bg-neutral-950 border-2 border-neutral-800 text-slate-400 font-mono text-xs">
                Syncing 4-day outlook telemetry from data.gov.sg...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== SECTION 2: 24-HOUR REGIONAL MATRIX ===================== */}
      {activeSection === "24hour" && (
        <div className="space-y-5">
          {/* General 24H Summary */}
          {forecast24h?.general && (
            <div className="p-4 bg-[#002FA7] border-3 border-[#FFF500] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getForecastIconEmoji(forecast24h.general.forecast)}</span>
                <div>
                  <span className="bg-[#FFF500] text-[#0040D6] text-[10px] font-black px-2 py-0.5 uppercase font-mono">
                    24-HR GENERAL FORECAST
                  </span>
                  <h4 className="text-lg font-black text-white uppercase font-mono mt-0.5">
                    {forecast24h.general.forecast}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono font-bold text-[#FFF500]">
                <div className="text-right">
                  <span className="block text-[10px] text-slate-300">TEMPERATURE</span>
                  <span className="text-white text-sm font-black">
                    {forecast24h.general.temperature.low}°C - {forecast24h.general.temperature.high}°C
                  </span>
                </div>

                <div className="text-right border-l border-[#FFF500]/40 pl-4">
                  <span className="block text-[10px] text-slate-300">HUMIDITY</span>
                  <span className="text-white text-sm font-black">
                    {forecast24h.general.relative_humidity.low}% - {forecast24h.general.relative_humidity.high}%
                  </span>
                </div>

                <div className="text-right border-l border-[#FFF500]/40 pl-4">
                  <span className="block text-[10px] text-slate-300">WIND</span>
                  <span className="text-white text-sm font-black">
                    {forecast24h.general.wind.direction} ({forecast24h.general.wind.speed.low}-{forecast24h.general.wind.speed.high} km/h)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Regional Periods Matrix */}
          <div className="space-y-3">
            <h5 className="font-mono font-black text-xs uppercase text-[#FFF500]/80">
              REGIONAL TIME-SLOT BREAKDOWN (WEST, EAST, CENTRAL, SOUTH, NORTH)
            </h5>

            {forecast24h?.periods && forecast24h.periods.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {forecast24h.periods.map((period, idx) => (
                  <div key={idx} className="p-4 bg-neutral-950 border-2 border-[#FFF500] font-mono">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#FFF500]/40 text-xs font-black text-white">
                      <span>TIME INTERVAL</span>
                      <span className="bg-black text-[#FFF500] px-2 py-0.5 border border-[#FFF500] text-[10px]">
                        {new Date(period.time.start).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" })} -{" "}
                        {new Date(period.time.end).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {Object.entries(period.regions).map(([region, cond], rIdx) => (
                        <div key={rIdx} className="flex items-center justify-between py-1 border-b border-neutral-800">
                          <span className="uppercase text-slate-400 font-bold">{region}:</span>
                          <span className="font-black text-[#FFF500] text-right">{cond}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-neutral-950 border-2 border-neutral-800 text-slate-400 font-mono text-xs">
                Synchronizing 24-hour regional time slots...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== SECTION 3: PSI & PM2.5 AIR QUALITY ===================== */}
      {activeSection === "psi" && (
        <div className="space-y-5">
          {/* Main PSI Banner */}
          <div className={`p-5 bg-neutral-950 border-4 ${psiStatus.border} flex flex-wrap items-center justify-between gap-4 shadow-[6px_6px_0px_0px_#000000]`}>
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-[#FFF500] text-[#0040D6] font-black border-2 border-black">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-black font-mono uppercase ${psiStatus.color}`}>
                    {psiStatus.label}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    24-HR NATIONAL PSI
                  </span>
                </div>
                <h4 className="text-2xl sm:text-3xl font-black text-white font-mono mt-0.5">
                  PSI {nationalPsi}
                </h4>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-300 max-w-md">
              {psiStatus.desc}
            </p>
          </div>

          {/* Regional PSI & PM2.5 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { region: "WEST", psi: psiData?.readings?.psi_twenty_four_hourly?.west ?? 42, pm25: psiData?.readings?.pm25_one_hourly?.west ?? 12 },
              { region: "EAST", psi: psiData?.readings?.psi_twenty_four_hourly?.east ?? 40, pm25: psiData?.readings?.pm25_one_hourly?.east ?? 11 },
              { region: "CENTRAL", psi: psiData?.readings?.psi_twenty_four_hourly?.central ?? 45, pm25: psiData?.readings?.pm25_one_hourly?.central ?? 14 },
              { region: "SOUTH", psi: psiData?.readings?.psi_twenty_four_hourly?.south ?? 44, pm25: psiData?.readings?.pm25_one_hourly?.south ?? 13 },
              { region: "NORTH", psi: psiData?.readings?.psi_twenty_four_hourly?.north ?? 39, pm25: psiData?.readings?.pm25_one_hourly?.north ?? 10 },
            ].map((r, idx) => (
              <div key={idx} className="p-3.5 bg-neutral-950 border-2 border-[#FFF500] font-mono text-center">
                <span className="block text-[11px] font-black text-white uppercase mb-1">{r.region}</span>
                <div className="my-1">
                  <span className="text-2xl font-black text-[#FFF500]">{r.psi}</span>
                  <span className="block text-[9px] uppercase text-slate-400">24H PSI</span>
                </div>
                <div className="pt-2 border-t border-[#FFF500]/30 text-[10px] text-slate-300">
                  <span>1H PM2.5: </span>
                  <span className="text-white font-bold">{r.pm25} µg/m³</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== SECTION 4: ISLANDWIDE SENSORS TABLE ===================== */}
      {activeSection === "stations" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#FFF500] absolute left-3 top-3" />
              <input
                type="text"
                value={stationSearch}
                onChange={(e) => setStationSearch(e.target.value)}
                placeholder="Search 60+ NEA stations (e.g. Clementi, Ang Mo Kio, Changi)..."
                className="w-full pl-9 pr-3 py-2 bg-black border-2 border-[#FFF500] text-xs font-mono font-bold text-[#FFF500] focus:outline-hidden"
              />
            </div>
            <span className="text-xs font-mono text-[#FFF500] font-bold">
              SHOWING {mergedStations.length} SENSOR STATIONS
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto border-2 border-[#FFF500]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#002FA7] text-[#FFF500] uppercase sticky top-0 border-b-2 border-[#FFF500]">
                <tr>
                  <th className="p-2.5">STATION ID & NAME</th>
                  <th className="p-2.5 text-right">RAINFALL (5-MIN)</th>
                  <th className="p-2.5 text-right">TEMPERATURE</th>
                  <th className="p-2.5 text-right">HUMIDITY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 bg-neutral-950">
                {mergedStations.map((st, idx) => (
                  <tr key={idx} className="hover:bg-[#002FA7]/30 transition-colors">
                    <td className="p-2.5">
                      <span className="font-bold text-white uppercase">{st.name}</span>
                      <span className="block text-[10px] text-slate-400">#{st.id}</span>
                    </td>
                    <td className="p-2.5 text-right font-black">
                      <span className={st.rainfall > 0 ? "text-cyan-300" : "text-slate-400"}>
                        {st.rainfall.toFixed(1)} mm
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-bold text-white">
                      {st.temperature !== null ? `${st.temperature.toFixed(1)}°C` : "-"}
                    </td>
                    <td className="p-2.5 text-right font-bold text-[#FFF500]">
                      {st.humidity !== null ? `${st.humidity.toFixed(0)}%` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== SECTION 5: RAIN COMMUTE (LTA TAXIS & CARPARKS) ===================== */}
      {activeSection === "transport" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#002FA7] border-3 border-[#FFF500]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#FFF500] text-[#0040D6] font-black border border-black text-xl">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="bg-black text-[#FFF500] text-[10px] font-black px-2 py-0.5 uppercase font-mono">
                  LTA TRANSPORT TELEMETRY (v1 LIVE)
                </span>
                <h4 className="text-base sm:text-lg font-black text-white uppercase font-mono mt-0.5">
                  WET-WEATHER COMMUTE & SHELTERED PARKING
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={loadTransportData}
              disabled={transportLoading}
              className="px-3 py-1.5 bg-[#FFF500] text-[#0040D6] font-mono font-black text-xs border border-black hover:bg-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${transportLoading ? "animate-spin" : ""}`} />
              <span>REFRESH TRANSPORT</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Taxis Box */}
            <div className="p-4 bg-neutral-950 border-2 border-[#FFF500] font-mono">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#FFF500]/30">
                <span className="font-black text-white text-xs uppercase flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#FFF500]" />
                  ACTIVE ISLANDWIDE TAXIS
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">LIVE GPS FEED</span>
              </div>
              <div className="text-center my-3">
                <span className="text-4xl sm:text-5xl font-black text-[#FFF500] tracking-tight">
                  {taxiData ? taxiData.totalTaxis.toLocaleString() : "..."}
                </span>
                <span className="block mt-1 text-xs uppercase text-slate-300 font-bold">
                  Available Taxis on Singapore Roads
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-[#FFF500]/30">
                Live stream from Land Transport Authority (LTA) taxi location feeds. During heavy rain and thundery showers, taxi availability drops rapidly near transit hubs.
              </p>
            </div>

            {/* Carparks Box Overview */}
            <div className="p-4 bg-neutral-950 border-2 border-[#FFF500] font-mono">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#FFF500]/30">
                <span className="font-black text-white text-xs uppercase flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#FFF500]" />
                  SHELTERED / HDB CARPARKS
                </span>
                <span className="text-[10px] text-[#FFF500] font-bold">
                  {carparkData.length} ACTIVE LOTS
                </span>
              </div>

              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-[#FFF500] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={carparkSearch}
                  onChange={(e) => setCarparkSearch(e.target.value)}
                  placeholder="Filter carpark code (e.g. HE12, HLM, BL1)..."
                  className="w-full pl-8 pr-2 py-1.5 bg-black border border-[#FFF500] text-xs font-mono text-[#FFF500] focus:outline-hidden"
                />
              </div>

              <div className="max-h-40 overflow-y-auto border border-[#FFF500]/40 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#002FA7] text-[#FFF500] text-[10px] uppercase sticky top-0">
                    <tr>
                      <th className="p-1.5">CARPARK</th>
                      <th className="p-1.5 text-right">AVAILABLE</th>
                      <th className="p-1.5 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900 bg-black">
                    {filteredCarparks.slice(0, 20).map((cp, idx) => (
                      <tr key={idx} className="hover:bg-[#002FA7]/30">
                        <td className="p-1.5 font-bold text-white">{cp.carparkNumber}</td>
                        <td className="p-1.5 text-right font-black text-emerald-400">
                          {cp.availableLots}
                        </td>
                        <td className="p-1.5 text-right text-slate-400">{cp.totalLots}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
