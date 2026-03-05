import React, { useState, useEffect, useCallback } from "react";
import {
  FaChevronLeft,
  FaCog,
  FaChevronRight,
  FaSpinner,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import HomeHeader from "../Home/elements/HomeHeader";
import {
  getCityNameFromCoords,
  getPrayerTimes as fetchPrayerTimesAPI,
  searchCityInMyQuran,
} from "../../services/prayerApi";
import NotificationSettings from "../../components/Settings/NotificationSettings";
import LocationSelector from "../../components/Settings/LocationSelector";

export default function Setting() {
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [times, setTimes] = useState(null);
  const [selectedCityName, setSelectedCityName] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [method, setMethod] = useState("Kemenag RI");

  /* ======================
     INIT: Load saved or auto-detect
  ====================== */
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const saved = localStorage.getItem("prayer_location");

        // Priority 1: Load saved preference
        if (saved) {
          const savedData = JSON.parse(saved);
          if (savedData?.cityId) {
            const prayerData = await fetchPrayerTimesAPI(
              savedData.cityId,
              new Date(),
            );
            if (prayerData?.jadwal) {
              setTimes(prayerData);
              setSelectedCityId(savedData.cityId.toString());
              setSelectedCityName(savedData.kota || prayerData.lokasi);
              setLoading(false);
              return;
            }
          }
        }

        // Priority 2: Auto-detect via GPS
        await detectAndSetLocation();
      } catch (err) {
        console.error("❌ Init error:", err);
        setError("Gagal memuat lokasi. Silakan pilih kota manual.");
        setDefaultCity();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  /* ======================
     GPS Detection
  ====================== */
  const detectAndSetLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const cityName = await getCityNameFromCoords(latitude, longitude);
            if (!cityName) throw new Error("CITY_NAME_NOT_FOUND");

            const cityList = await searchCityInMyQuran(cityName);
            if (!cityList?.length) throw new Error("CITY_NOT_IN_DATABASE");

            const cityId = cityList[0].id;
            const kota = cityList[0].lokasi;
            const prayerData = await fetchPrayerTimesAPI(cityId, new Date());

            if (!prayerData?.jadwal) throw new Error("PRAYER_TIMES_NOT_FOUND");

            setTimes(prayerData);
            setSelectedCityId(cityId.toString());
            setSelectedCityName(kota);

            localStorage.setItem(
              "prayer_location",
              JSON.stringify({
                latitude,
                longitude,
                cityId,
                kota,
                lastUpdated: new Date().toISOString(),
              }),
            );
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        (err) => reject(err),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
      );
    });
  }, []);

  /* ======================
     Handlers
  ====================== */
  const handleResetToGPS = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await detectAndSetLocation();
      setTimeout(() => window.location.reload(), 150);
    } catch (err) {
      console.error("GPS detection failed:", err);
      setError("Gagal mendeteksi lokasi. Pastikan GPS aktif.");
      setDefaultCity();
      setLoading(false);
      setTimeout(() => window.location.reload(), 150);
    }
  }, [detectAndSetLocation]);

  const handleCitySelect = useCallback(async (city) => {
    setLoading(true);
    try {
      const prayerData = await fetchPrayerTimesAPI(city.id, new Date());
      if (!prayerData?.jadwal) throw new Error("Invalid data");

      setTimes(prayerData);
      setSelectedCityId(city.id.toString());
      setSelectedCityName(city.lokasi);

      const saved = localStorage.getItem("prayer_location");
      const existing = saved ? JSON.parse(saved) : {};

      localStorage.setItem(
        "prayer_location",
        JSON.stringify({
          ...existing,
          cityId: city.id,
          kota: city.lokasi,
          lastUpdated: new Date().toISOString(),
        }),
      );

      setTimeout(() => window.location.reload(), 150);
    } catch (err) {
      console.error("Failed to select city:", err);
      setError("Gagal memuat jadwal kota.");
      setLoading(false);
    }
  }, []);

  const setDefaultCity = useCallback(async () => {
    try {
      const prayerData = await fetchPrayerTimesAPI("1203", new Date());
      if (prayerData?.jadwal) {
        setTimes(prayerData);
        setSelectedCityId("1203");
        setSelectedCityName("JAKARTA PUSAT");
      }
    } catch (e) {
      console.error("Fallback failed:", e);
    }
  }, []);

  // Loading state
  if (loading && !times) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#F472B6] animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-4 px-4 py-4 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-800 rounded-full transition"
          >
            <FaChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">Pengaturan</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile */}
        <HomeHeader />

        {/* Location Selector (Extracted Component) */}
        <LocationSelector
          selectedCityId={selectedCityId}
          selectedCityName={selectedCityName}
          onCitySelect={handleCitySelect}
          onResetToGPS={handleResetToGPS}
          loading={loading}
          error={error}
        />

        {/* Method Selector (Simple) */}
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaCog className="text-emerald-400" size={16} />
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                METODE
              </span>
            </div>
            <button className="text-slate-500 hover:text-white transition">
              <FaChevronRight className="rotate-90" size={14} />
            </button>
          </div>
          <p className="text-sm font-semibold text-white">{method}</p>
        </div>

        {/* Notification Settings (Extracted Component) */}
        <NotificationSettings prayerTimes={times} cityId={selectedCityId} />
      </main>
    </div>
  );
}
