import { useEffect, useMemo, useState, useCallback } from "react";
import {
  getCityNameFromCoords,
  getPrayerTimes,
  searchCityInMyQuran,
} from "../../../services/prayerApi";
import {
  FaArrowLeft,
  FaBookOpen,
  FaMapMarkerAlt,
  FaSpinner,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { Link } from "react-router";

/* ======================
   Helper
====================== */
const parseTimeToDate = (time) => {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

export default function PrayerTimes() {
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");
  const [now, setNow] = useState(new Date());

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  /* ======================
     CLOCK TICK
  ====================== */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ======================
     HELPER: Fetch All Cities
  ====================== */
  const fetchAllCities = useCallback(async () => {
    try {
      const response = await fetch(
        "https://api.myquran.com/v2/sholat/kota/semua",
      );
      const data = await response.json();
      if (data?.data) {
        setCityOptions(data.data);
        setFilteredCities(data.data); // Initial filtered = all
        return data.data;
      }
    } catch (err) {
      console.error("Failed to fetch cities:", err);
    }
    return [];
  }, []);

  /* ======================
     SEARCH FUNCTIONALITY
  ====================== */
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      // If search is too short, show all cities
      setFilteredCities(cityOptions);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);

    // Debounce search
    const timer = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const filtered = cityOptions.filter(
        (city) =>
          city.lokasi.toLowerCase().includes(query) ||
          (city.daerah && city.daerah.toLowerCase().includes(query)),
      );

      setFilteredCities(filtered);
      setShowSearchResults(true);
      setIsSearching(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, cityOptions]);

  /* ======================
     INIT: Load from localStorage
  ====================== */
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const saved = localStorage.getItem("prayer_location");

        if (saved) {
          const savedData = JSON.parse(saved);

          if (savedData?.cityId && savedData?.kota) {
            console.log("✅ Loading from localStorage:", savedData);

            const prayerData = await getPrayerTimes(
              savedData.cityId,
              new Date(),
            );

            if (prayerData?.jadwal) {
              setTimes(prayerData);
              setSelectedCityId(String(savedData.cityId));
              setSelectedCityName(savedData.kota);

              await fetchAllCities();

              setLoading(false);
              return;
            }
          }
        }

        // Fallback: Auto-detect GPS
        if (!saved) throw new Error("LOCATION_NOT_SAVED");

        const { latitude, longitude } = JSON.parse(saved);
        if (!latitude || !longitude) throw new Error("INVALID_COORDS");

        const cityName = await getCityNameFromCoords(latitude, longitude);
        if (!cityName) throw new Error("CITY_NAME_NOT_FOUND");

        const cityList = await searchCityInMyQuran(cityName);
        if (!cityList?.length) throw new Error("CITY_NOT_IN_DATABASE");

        const cityId = cityList[0].id;
        const kota = cityList[0].lokasi;
        const prayerData = await getPrayerTimes(cityId, new Date());

        if (!prayerData?.jadwal) throw new Error("PRAYER_TIMES_NOT_FOUND");

        setTimes(prayerData);
        setSelectedCityId(String(cityId));
        setSelectedCityName(kota);
        setCityOptions(cityList);
        setFilteredCities(cityList);

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
      } catch (err) {
        console.error("❌ Init error:", err);
        setError("Gagal memuat jadwal. Silakan pilih kota manual.");

        await fetchAllCities();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [fetchAllCities]);

  /* ======================
     HANDLE CITY SELECT
  ====================== */
  const handleCitySelect = async (city) => {
    setLoading(true);
    setShowSearchResults(false);
    setSearchQuery("");

    try {
      const prayerData = await getPrayerTimes(city.id, new Date());
      if (!prayerData?.jadwal) throw new Error("Invalid data");

      // Update localStorage
      const saved = localStorage.getItem("prayer_location");
      const coords = saved ? JSON.parse(saved) : {};

      localStorage.setItem(
        "prayer_location",
        JSON.stringify({
          ...coords,
          cityId: String(city.id),
          kota: city.lokasi,
          lastUpdated: new Date().toISOString(),
        }),
      );

      console.log("✅ City changed to:", city.lokasi);

      // Auto reload after 100ms
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (err) {
      console.error("Failed to change city:", err);
      setError("Gagal memuat jadwal kota.");
      setLoading(false);
    }
  };

  const handleResetLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ STEP 1: Detect GPS location
      if (!navigator.geolocation) {
        throw new Error("Geolocation tidak didukung browser ini");
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      console.log("📍 GPS detected:", { latitude, longitude });

      // ✅ STEP 2: Get city name from coords
      const cityName = await getCityNameFromCoords(latitude, longitude);
      if (!cityName) {
        throw new Error("Gagal mendapatkan nama kota dari koordinat");
      }
      console.log("🏙️ City name:", cityName);

      // ✅ STEP 3: Search city in MyQuran database
      const cityList = await searchCityInMyQuran(cityName);
      if (!cityList?.length) {
        throw new Error(`Kota "${cityName}" tidak ditemukan di database`);
      }

      // Ambil kota pertama yang cocok
      const selectedCity = cityList[0];
      const cityId = selectedCity.id;
      const kota = selectedCity.lokasi;
      console.log("✅ City matched:", { cityId, kota });

      // ✅ STEP 4: Fetch prayer times for detected city
      const prayerData = await getPrayerTimes(cityId, new Date());
      if (!prayerData?.jadwal) {
        throw new Error("Gagal memuat jadwal sholat");
      }

      // ✅ STEP 5: Update state
      setTimes(prayerData);
      setSelectedCityId(String(cityId));
      setSelectedCityName(kota);

      // ✅ STEP 6: Update localStorage dengan data baru
      localStorage.setItem(
        "prayer_location",
        JSON.stringify({
          latitude,
          longitude,
          cityId: String(cityId),
          kota,
          lastUpdated: new Date().toISOString(),
        }),
      );
      console.log("💾 localStorage updated:", { cityId, kota });

      // ✅ STEP 7: Reload halaman agar data fresh
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (err) {
      console.error("❌ Reset location failed:", err);
      setError(
        err.message ||
          "Gagal mendeteksi lokasi. Pastikan GPS aktif dan izin lokasi diberikan.",
      );
      setLoading(false);

      // Optional: Fallback ke Jakarta jika gagal
      setDefaultCity();
    }
  }, []);

  const setDefaultCity = useCallback(async () => {
    try {
      const cityId = localStorage.getItem("prayer_location");
      console.log("👀 Fallback to default:", cityId);
      const prayerData = await getPrayerTimes("1203", new Date()); // Jakarta
      if (prayerData?.jadwal) {
        setTimes(prayerData);
        setSelectedCityId("1203");
        setSelectedCityName("JAKARTA PUSAT");

        localStorage.setItem(
          "prayer_location",
          JSON.stringify({
            latitude: -6.1754,
            longitude: 106.8272,
            cityId: "1203",
            kota: "JAKARTA PUSAT",
            lastUpdated: new Date().toISOString(),
          }),
        );
      }
    } catch (e) {
      console.error("Fallback failed:", e);
    }
  }, []);

  /* ======================
     PRAYER DATA
  ====================== */
  const prayers = useMemo(() => {
    if (!times?.jadwal) return [];
    return [
      ["Imsak", times.jadwal.imsak],
      ["Subuh", times.jadwal.subuh],
      ["Dzuhur", times.jadwal.dzuhur],
      ["Ashar", times.jadwal.ashar],
      ["Maghrib", times.jadwal.maghrib],
      ["Isya", times.jadwal.isya],
    ];
  }, [times]);

  const nextPrayer = useMemo(() => {
    for (const [name, time] of prayers) {
      if (parseTimeToDate(time) > now) {
        return { name, time };
      }
    }
    if (prayers.length) {
      const d = parseTimeToDate(prayers[1][1]);
      d.setDate(d.getDate() + 1);
      return { name: "Subuh", time: prayers[1][1], nextDay: true };
    }
    return null;
  }, [prayers, now]);

  const countdown = useMemo(() => {
    if (!nextPrayer) return "00:00:00";

    let target = parseTimeToDate(nextPrayer.time);
    if (nextPrayer.nextDay) target.setDate(target.getDate() + 1);

    const diff = target - now;
    if (diff <= 0) return "00:00:00";

    const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }, [nextPrayer, now]);

  /* ======================
     RENDER
  ====================== */
  if (loading && !times) {
    return (
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-center">
        <div className="flex flex-col items-center gap-2">
          <FaSpinner className="animate-spin text-[#F472B6]" size={20} />
          <p className="text-zinc-400 text-sm">Memuat jadwal sholat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-amber-300 text-sm mb-3">⚠️ {error}</p>
        <Link to="/settings" className="text-xs text-[#F472B6] hover:underline">
          Buka Pengaturan →
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* NEXT PRAYER CARD */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-[#6D1E3A] to-[#0f172a] ring-1 ring-white/10">
          <p className="text-xs text-slate-400">SELANJUTNYA</p>
          <p className="lg:text-2xl text-xl font-mono mt-1 text-[#F472B6]">
            {countdown}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {nextPrayer?.name} {nextPrayer?.time}
          </p>
        </div>

        <div className="group relative flex overflow-hidden rounded-2xl p-5 hover:ring-[#6D1E3A]/50 transition-all duration-300 bg-white/5 ring-1 ring-white/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F472B6]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <Link
            to="/quran"
            className="group relative p-4 rounded-2xl bg-gradient-to-br from-[#6D1E3A]/80 to-[#0f172a] ring-1 ring-white/10 hover:ring-[#F472B6]/50 transition-all duration-300 lg:w-full"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-[#F472B6]/20 transition-colors">
                <FaBookOpen className="text-2xl text-[#F472B6]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">Tadarus</h3>
                <p className="text-xs text-slate-300">Baca Al-Qur'an</p>
              </div>
              <div className="text-slate-500">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-white">Jadwal Sholat</h3>
            <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
              <FaMapMarkerAlt className="text-[#F472B6]" size={10} />
              <span>{selectedCityName}</span>
              <span>•</span>
              <span>{times?.jadwal?.tanggal}</span>
            </div>
          </div>
          <button
            onClick={handleResetLocation}
            className="text-xs text-zinc-500 hover:text-white p-1"
            title="Reset lokasi"
          >
            ✕
          </button>
        </div>

        {/* 🔍 SEARCH INPUT */}
        <div className="relative mb-4">
          <div className="relative">
            <FaSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={14}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() =>
                cityOptions.length > 0 && setShowSearchResults(true)
              }
              placeholder="Cari kota (min. 2 huruf)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F472B6]/50 focus:border-[#F472B6] transition"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>

          {/* SEARCH RESULTS DROPDOWN */}
          {showSearchResults &&
            (searchQuery.length >= 2 || cityOptions.length === 0) && (
              <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-center text-slate-400 text-sm">
                    <FaSpinner className="animate-spin inline mr-2" size={12} />
                    Mencari...
                  </div>
                ) : filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleCitySelect(city)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition flex items-center justify-between border-b border-slate-700/50 last:border-0"
                    >
                      <div>
                        <p className="text-sm text-white font-medium">
                          {city.lokasi}
                        </p>
                        {city.daerah && (
                          <p className="text-xs text-slate-500">
                            {city.daerah}
                          </p>
                        )}
                      </div>
                      {String(selectedCityId) === String(city.id) && (
                        <span className="text-[#F472B6] text-xs font-medium">
                          ✓ Terpilih
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-slate-400 text-sm">
                    Tidak ada kota yang cocok
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Current City Display */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 mb-4">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-[#F472B6]" size={14} />
            <span className="text-sm text-white font-medium">
              {selectedCityName || "Memuat lokasi..."}
            </span>
          </div>
          {selectedCityId && (
            <span className="text-xs text-slate-500">ID: {selectedCityId}</span>
          )}
        </div>

        {/* PRAYER TIMES TABLE */}
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <tbody>
              {prayers.map(([name, time], i) => {
                const isNext = nextPrayer?.name === name;
                return (
                  <tr
                    key={name}
                    className={`
                      border-b border-slate-800/50 last:border-0
                      ${isNext ? "bg-[#6D1E3A]/20" : i % 2 === 0 ? "bg-slate-800/40" : "bg-slate-900"}
                    `}
                  >
                    <td
                      className={`px-4 py-3 flex items-center gap-2 ${isNext ? "text-white font-semibold" : "text-zinc-300"}`}
                    >
                      {name}
                      {isNext && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#F472B6] text-white font-bold animate-pulse">
                          NEXT
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono ${isNext ? "text-[#F472B6] font-bold" : "text-zinc-200"}`}
                    >
                      {time}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-800 text-[10px] text-zinc-500 text-center flex justify-between items-center">
          <span>Data oleh MyQuran API</span>
          <span>{times?.daerah}</span>
        </div>
      </div>
    </>
  );
}
