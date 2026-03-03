import { useEffect, useState } from "react";
import {
  getCityNameFromCoords,
  searchCityInMyQuran,
  getPrayerTimesByCityId,
  getAllCities,
} from "../../../services/prayerApi";

export default function PrayerTimes() {
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk dropdown pilihan kota (jika ada multiple results)
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");

  // State untuk fallback manual select
  const [allCities, setAllCities] = useState([]);
  const [showManualSelect, setShowManualSelect] = useState(false);

  // Load semua kota untuk dropdown manual (sekali saja)
  useEffect(() => {
    getAllCities().then(setAllCities);
  }, []);

  // Main init: ambil dari localStorage → jadwal
  useEffect(() => {
    const init = async () => {
      try {
        // Step 1: Ambil coords dari localStorage
        const saved = localStorage.getItem("prayer_location");
        if (!saved) throw new Error("LOCATION_NOT_SAVED");

        const { latitude, longitude } = JSON.parse(saved);

        // Step 2: Reverse geocoding → nama kota
        const cityName = await getCityNameFromCoords(latitude, longitude);
        if (!cityName) throw new Error("CITY_NAME_NOT_FOUND");

        // Step 3: Ambil jadwal + opsi kota
        const result = await searchCityInMyQuran(cityName);

        // Step 4: Set state
        setTimes(result.prayerTimes.data);
        setCityOptions(result.cityOptions);
        setSelectedCityId(result.selectedCityId);
        setSelectedCityName(result.prayerTimes.meta.kota);

        // Step 5: Simpan preference ke localStorage
        localStorage.setItem(
          "prayer_location",
          JSON.stringify({
            latitude,
            longitude,
            type: "auto",
            cityId: result.selectedCityId,
            kota: result.prayerTimes.meta.kota,
            lastUpdated: new Date().toISOString(),
          }),
        );
      } catch (err) {
        console.warn("⚠️ Auto-detect failed:", err.message);
        setError(
          err.message === "LOCATION_NOT_SAVED"
            ? "Lokasi belum disimpan. Silakan pilih kota manual."
            : "Gagal memuat jadwal. Silakan pilih kota manual.",
        );
        setShowManualSelect(true);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Handle user ganti kota via dropdown
  const handleCityChange = async (e) => {
    const newCityId = e.target.value;
    console.log("🌸 User selected city:", newCityId);
    if (!newCityId) return;

    setLoading(true);
    try {
      // Ambil jadwal untuk kota baru
      const result = await getPrayerTimesByCityId(newCityId);

      // Update state
      setTimes(result.data);
      setSelectedCityId(newCityId);
      setSelectedCityName(result.meta.kota);
      setError(null);

      // Update localStorage dengan pilihan baru
      const saved = localStorage.getItem("prayer_location");
      const coords = saved ? JSON.parse(saved) : {};
      localStorage.setItem(
        "prayer_location",
        JSON.stringify({
          ...coords,
          type: "manual",
          cityId: newCityId,
          kota: result.meta.kota,
          lastUpdated: new Date().toISOString(),
        }),
      );
    } catch (err) {
      setError(err.message || "Gagal memuat jadwal kota.");
    } finally {
      setLoading(false);
    }
  };

  // Handle pilih kota dari dropdown manual
  const handleManualSelect = async (e) => {
    const cityId = e.target.value;
    const city = allCities.find((c) => c.id === cityId);
    if (city) {
      await handleCityChange({ target: { value: cityId } });
    }
  };

  // Reset lokasi
  const handleResetLocation = () => {
    localStorage.removeItem("prayer_location");
    setTimes(null);
    setCityOptions([]);
    setShowManualSelect(true);
    setLoading(false);
    setError(null);
  };

  // --- RENDER ---

  if (loading && !times) {
    return (
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm">Memuat jadwal sholat...</p>
        </div>
      </div>
    );
  }

  // Manual Select Fallback
  if (error || showManualSelect) {
    return (
      <div className="bg-slate-900 rounded-2xl p-4 space-y-4 border border-slate-800">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-white">Pilih Kota</h3>
          <button
            onClick={handleResetLocation}
            className="text-xs text-zinc-500 hover:text-white"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-3">
            <p className="text-amber-200 text-sm">⚠️ {error}</p>
          </div>
        )}

        <select
          onChange={handleManualSelect}
          defaultValue=""
          className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
        >
          <option value="" disabled>
            -- Pilih Kota --
          </option>
          {allCities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.lokasi}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Success: Display Prayer Times + Dropdown Options
  return (
    <div className="bg-slate-900 rounded-2xl p-4 space-y-3 border border-slate-800">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-white">Jadwal Sholat Hari Ini</h3>
          <p className="text-xs text-zinc-400 mt-1">
            📍 {selectedCityName} • {times?.meta?.tanggal}
          </p>
        </div>
        <button
          onClick={handleResetLocation}
          className="text-xs text-zinc-500 hover:text-white"
          title="Reset"
        >
          ✕
        </button>
      </div>

      {/* 🎯 Dropdown untuk ganti kota jika ada multiple options */}
      {cityOptions.length > 1 && (
        <div className="pb-2 border-b border-slate-800">
          <label className="text-[10px] text-zinc-500 block mb-1">
            Lokasi terdeteksi: pilih yang sesuai
          </label>
          <select
            value={selectedCityId}
            onChange={handleCityChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {cityOptions.map((city) => (
              <option key={city.id} value={city.id}>
                {city.lokasi} {city.id === selectedCityId ? "✓" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Prayer Times List */}
      <div className="space-y-2 pt-2">
        {[
          ["Imsak", times?.Imsak],
          ["Subuh", times?.Fajr],
          ["Dzuhur", times?.Dhuhr],
          ["Ashar", times?.Asr],
          ["Maghrib", times?.Maghrib],
          ["Isya", times?.Isha],
        ].map(([name, time]) => (
          <div
            key={name}
            className="flex justify-between items-center text-sm group"
          >
            <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">
              {name}
            </span>
            <span className="font-mono text-zinc-200 font-medium bg-slate-800 px-3 py-1.5 rounded-lg min-w-[60px] text-center">
              {time || "--:--"}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-800 text-[10px] text-zinc-500 text-center">
        Data oleh API MyQuran • Metode: Kemenag RI
      </div>
    </div>
  );
}
