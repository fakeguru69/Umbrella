import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { UmbrellaScoreCard } from "./components/UmbrellaScoreCard";
import { TelemetryGrid } from "./components/TelemetryGrid";
import { ShelteredRoutePlanner } from "./components/ShelteredRoutePlanner";
import { SingaporeDataGovTelemetry } from "./components/SingaporeDataGovTelemetry";
import { NotificationBanner } from "./components/NotificationBanner";
import { WindPhysicsSimulator } from "./components/WindPhysicsSimulator";
import { StationRadarModal } from "./components/StationRadarModal";
import { ExcuseModal } from "./components/ExcuseModal";
import { DisqusComments } from "./components/DisqusComments";
import { WeatherData, AIAdvice, RainStation } from "./types";
import { initialWeatherData, initialAdviceData } from "./data";
import { sounds } from "./lib/sound";
import { computeSingaporeWeather, generateQuirkyRoast } from "./services/weatherService";
import { Umbrella, Sparkles, ExternalLink, ShieldCheck, Heart } from "lucide-react";

export default function App() {
  const [currentArea, setCurrentArea] = useState<string>("Jurong West");
  const [weather, setWeather] = useState<WeatherData>(initialWeatherData);
  const [advice, setAdvice] = useState<AIAdvice>(initialAdviceData);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);

  // Modals
  const [isRadarModalOpen, setIsRadarModalOpen] = useState<boolean>(false);
  const [isPhysicsModalOpen, setIsPhysicsModalOpen] = useState<boolean>(false);
  const [isExcuseModalOpen, setIsExcuseModalOpen] = useState<boolean>(false);

  // Fetch weather telemetry from server or client-side direct fallback
  const fetchWeatherTelemetry = useCallback(
    async (area: string, lat?: number, lon?: number) => {
      setIsLoading(true);
      try {
        let endpoint = `/api/weather/singapore?area=${encodeURIComponent(area)}`;
        if (lat !== undefined && lon !== undefined) {
          endpoint += `&lat=${lat}&lon=${lon}`;
        }

        let data: WeatherData | null = null;
        try {
          const res = await fetch(endpoint);
          if (res.ok) {
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              const parsed = await res.json();
              if (parsed && parsed.location && parsed.rainfall) {
                data = parsed;
              }
            }
          }
        } catch (serverErr) {
          console.warn("Backend endpoint unreachable, using client live computation:", serverErr);
        }

        // If backend wasn't available (e.g. static Vercel build / serverless coldstart), compute directly!
        if (!data) {
          data = await computeSingaporeWeather(area, lat, lon);
        }

        setWeather(data);
        if (data.location?.region) {
          setCurrentArea(data.location.region);
        }
        setBannerDismissed(false);

        // If score > 50 and notifications enabled, trigger chime/alert
        if (data.umbrellaScore > 50) {
          sounds.playAlert();
          if (notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
            new Notification(`☂️ Brolly Alert: ${data.location.region}`, {
              body: `Umbrella Index is ${data.umbrellaScore}/100! Grab your umbrella before leaving!`,
              icon: "/favicon.ico",
            });
          }
        }

        // Fetch AI roast with the fresh data
        fetchAdvice(data);
      } catch (err) {
        console.error("Telemetry error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [notificationsEnabled]
  );

  // Fetch AI roast from server with instant smart fallback
  const fetchAdvice = async (wData: WeatherData) => {
    setIsLoadingAdvice(true);
    try {
      const res = await fetch("/api/gemini/roast-and-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: `${wData.location.country} · ${wData.location.region}`,
          forecast: wData.forecast,
          rainfallMm: wData.rainfall.amountMm,
          uvIndex: wData.uvIndex.value,
          windSpeedKmH: wData.wind.speedKmH,
          umbrellaScore: wData.umbrellaScore,
        }),
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const adv: AIAdvice = await res.json();
          if (adv && adv.verdict) {
            setAdvice(adv);
            return;
          }
        }
      }

      // Fallback if AI endpoint not available
      const fallbackRoast = generateQuirkyRoast(
        wData.forecast,
        wData.rainfall.amountMm,
        wData.uvIndex.value,
        wData.wind.speedKmH,
        wData.umbrellaScore,
        wData.location.region
      );
      setAdvice(fallbackRoast);
    } catch (err) {
      console.error("AI roast fetch error:", err);
      const fallbackRoast = generateQuirkyRoast(
        wData.forecast,
        wData.rainfall.amountMm,
        wData.uvIndex.value,
        wData.wind.speedKmH,
        wData.umbrellaScore,
        wData.location.region
      );
      setAdvice(fallbackRoast);
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchWeatherTelemetry("Jurong West");
  }, []);

  // Handle Location Change
  const handleSelectLocation = (area: string, isCoord?: boolean, lat?: number, lon?: number) => {
    setCurrentArea(area);
    fetchWeatherTelemetry(area, lat, lon);
  };

  // Handle GPS Detect
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherTelemetry("Nearby GPS Sensor", latitude, longitude);
        setCurrentArea("My GPS Location");
      },
      (err) => {
        console.warn("GPS error", err);
        fetchWeatherTelemetry("Jurong West");
      }
    );
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  // Toggle Notifications
  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ("Notification" in window && Notification.permission !== "granted") {
        try {
          const perm = await Notification.requestPermission();
          if (perm === "granted") {
            setNotificationsEnabled(true);
            new Notification("☂️ Brolly Alerts Activated", {
              body: "You will be alerted whenever the Umbrella Index exceeds 50%.",
            });
            return;
          }
        } catch (e) {}
      }
      setNotificationsEnabled(true);
    } else {
      setNotificationsEnabled(false);
    }
  };

  // Extract all available forecast areas
  const allSgAreas = weather?.allForecasts?.map((f) => f.area) || [];

  return (
    <div className="min-h-screen bg-[#0040D6] text-[#FFF500] selection:bg-[#FFF500] selection:text-[#0040D6] px-3 py-6 sm:px-6 md:py-10 flex flex-col justify-between relative overflow-x-hidden border-[8px] sm:border-[12px] border-[#FFF500]">
      {/* Background Watermark Typography */}
      <div className="fixed top-12 left-4 text-[120px] sm:text-[200px] leading-none font-black italic opacity-5 uppercase pointer-events-none select-none text-[#FFF500] z-0">
        WET WET WET
      </div>
      <div className="fixed bottom-10 right-4 text-[120px] sm:text-[220px] leading-none font-black italic opacity-5 uppercase pointer-events-none select-none text-[#FFF500] z-0">
        SOAKED
      </div>

      <main className="w-full max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <Header
          currentLocationName={weather?.location.region || currentArea}
          onSelectLocation={handleSelectLocation}
          onDetectGps={handleDetectGps}
          onRefresh={() => fetchWeatherTelemetry(currentArea)}
          isLoading={isLoading}
          notificationsEnabled={notificationsEnabled}
          onToggleNotifications={handleToggleNotifications}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          allSgAreas={allSgAreas}
        />

        {/* High Umbrella Chance (>50%) Alert Banner */}
        {weather && (
          <NotificationBanner
            umbrellaScore={weather.umbrellaScore}
            locationName={weather.location.region}
            verdict={advice?.verdict || "BRING YOUR UMBRELLA!"}
            notificationsEnabled={notificationsEnabled}
            onDismiss={() => setBannerDismissed(true)}
            isDismissed={bannerDismissed}
          />
        )}

        {/* Core Wireframe ASCII Card (Matches Slide 3) */}
        {weather && (
          <UmbrellaScoreCard
            weather={weather}
            advice={advice}
            isLoadingAdvice={isLoadingAdvice}
            onRollAnotherHotTake={() => {
              setIsExcuseModalOpen(true);
              fetchAdvice(weather);
            }}
          />
        )}

        {/* Telemetry 4-Card Grid (Slide 2: UV Index, Rainfall, Wind Speed & Inversion, Forecast) */}
        {weather && (
          <TelemetryGrid
            weather={weather}
            advice={advice}
            onOpenRadarModal={() => setIsRadarModalOpen(true)}
            onOpenPhysicsModal={() => setIsPhysicsModalOpen(true)}
          />
        )}

        {/* Sheltered Route Planner (Slide 3: "Recommendation of most sheltered walking route") */}
        <ShelteredRoutePlanner
          currentArea={weather?.location.region || currentArea}
          advice={advice}
        />

        {/* data.gov.sg National Environmental & Weather Telemetry (4-Day Outlook, 24-Hr Matrix, PSI & PM2.5, Islandwide Sensors) */}
        {weather && (
          <SingaporeDataGovTelemetry
            weather={weather}
            onSelectLocation={handleSelectLocation}
          />
        )}

        {/* Disqus Community Thread */}
        <DisqusComments
          pageIdentifier="umbrella-oracle-sg"
          pageTitle="Umbrella Oracler Singapore Weather Community"
        />
      </main>

      {/* Modals & Simulators */}
      {weather && (
        <>
          <StationRadarModal
            isOpen={isRadarModalOpen}
            onClose={() => setIsRadarModalOpen(false)}
            stations={weather.rainfall.allStations || []}
            activeStationId={weather.rainfall.stationId}
            onSelectStation={(st: RainStation) => {
              handleSelectLocation(st.name, true, st.lat, st.lon);
            }}
          />

          <WindPhysicsSimulator
            isOpen={isPhysicsModalOpen}
            onClose={() => setIsPhysicsModalOpen(false)}
            currentWindKmH={weather.wind.speedKmH}
          />

          <ExcuseModal
            isOpen={isExcuseModalOpen}
            onClose={() => setIsExcuseModalOpen(false)}
            advice={advice}
            currentArea={weather.location.region}
            onRollNew={() => fetchAdvice(weather)}
            isLoading={isLoadingAdvice}
          />
        </>
      )}

      {/* Quirky Footer */}
      <footer className="w-full max-w-5xl mx-auto mt-12 pt-6 border-t-4 border-[#FFF500] text-center font-mono text-xs text-[#FFF500] space-y-2 relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-black uppercase tracking-widest">
          <span className="flex items-center gap-1.5 bg-[#FFF500] text-[#0040D6] px-2.5 py-0.5 font-black">
            <ShieldCheck className="w-4 h-4 text-[#0040D6]" /> Real-time NEA & SG Data
          </span>
          <span className="text-[#FFF500] font-black">■</span>
          <span className="tracking-wider">UV Protection Index</span>
          <span className="text-[#FFF500] font-black">■</span>
          <span className="tracking-wider">Anti-Inversion Shield</span>
          <span className="text-[#FFF500] font-black">■</span>
          <span className="flex items-center gap-1.5 bg-black text-[#FFF500] px-2.5 py-0.5 font-black border border-[#FFF500]">
            <Sparkles className="w-3.5 h-3.5 text-[#FFF500]" /> Gemini 3.7 Flash
          </span>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#FFF500]/80 mt-2">
          UMBRELLA ORACLER // NEVER GET SOAKED, NEVER GET CRISPY.
        </p>
      </footer>
    </div>
  );
}
