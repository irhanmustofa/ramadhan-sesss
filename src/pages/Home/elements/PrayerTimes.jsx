import { useEffect, useMemo, useState } from "react";
import {
  getCityNameFromCoords,
  getPrayerTimes,
  searchCityInMyQuran,
} from "../../../services/prayerApi";
import { FaArrowLeft, FaBookOpen, FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router";

/* ======================
   Helper
====================== */
const getTodayDate = () => {
  const date = new Date();
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

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
  const [showManualSelect, setShowManualSelect] = useState(false);

  const [now, setNow] = useState(new Date());

  /* ======================
     CLOCK TICK
  ====================== */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ======================
     INIT AUTO DETECT
  ====================== */
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const saved = localStorage.getItem("prayer_location");
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
        setSelectedCityId(cityId.toString());
        setSelectedCityName(kota);
        setCityOptions(cityList);

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
        let message = "Gagal memuat jadwal sholat.";
        if (err.message === "LOCATION_NOT_SAVED")
          message = "Lokasi belum disimpan. Silakan pilih kota manual.";
        if (err.message === "CITY_NAME_NOT_FOUND")
          message = "Nama kota tidak ditemukan. Pilih manual.";
        if (err.message === "CITY_NOT_IN_DATABASE")
          message = "Kota tidak tersedia di database.";

        setError(message);
        setShowManualSelect(true);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /* ======================
     CHANGE CITY (KEEP!)
  ====================== */
  const handleCityChange = async (e) => {
    const cityId = e.target.value;
    if (!cityId) return;

    setLoading(true);
    try {
      const prayerData = await getPrayerTimes(cityId, new Date());
      setTimes(prayerData);
      setSelectedCityId(cityId);
      setSelectedCityName(prayerData.lokasi);

      const saved = localStorage.getItem("prayer_location");
      const coords = saved ? JSON.parse(saved) : {};

      localStorage.setItem(
        "prayer_location",
        JSON.stringify({
          ...coords,
          cityId,
          kota: prayerData.lokasi,
          lastUpdated: new Date().toISOString(),
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetLocation = () => {
    localStorage.removeItem("prayer_location");
    setTimes(null);
    setCityOptions([]);
    setSelectedCityId("");
    setSelectedCityName("");
    setShowManualSelect(true);
    setError(null);
  };

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
    // lewat Isya → Subuh besok
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
        <p className="text-zinc-400 text-sm">Memuat jadwal sholat...</p>
      </div>
    );
  }

  if (error || showManualSelect) {
    return (
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-amber-300 text-sm">{error}</p>
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

        <div className="group relative flex overflow-hidden rounded-2xl p-5 hover:ring-[#6D1E3A]/50 transition-all duration-300  bg-white/5 ring-1 ring-white/10">
          {/* Background Pattern/Overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F472B6]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <Link
            to="/quran"
            className="group relative p-4 rounded-2xl bg-gradient-to-br from-[#6D1E3A]/80 to-[#0f172a] ring-1 ring-white/10 hover:ring-[#F472B6]/50 transition-all duration-300 lg:w-full"
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-[#F472B6]/20 transition-colors">
                <FaBookOpen className="text-2xl text-[#F472B6]" />
              </div>

              {/* Text - Lebih ringkas untuk mobile */}
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">Tadarus</h3>
                <p className="text-xs text-slate-300">Baca Al-Qur'an</p>
              </div>

              {/* Chevron */}
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
        <div className="flex justify-between mb-3">
          <div className="">
            <h3 className="font-semibold text-white">Jadwal Sholat</h3>
            <div className="text-xs text-zinc-400 flex flex-row">
              <FaMapMarkerAlt /> {selectedCityName} • {times?.jadwal?.tanggal}
            </div>
          </div>
          <button
            onClick={handleResetLocation}
            className="text-xs text-zinc-500 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* DROPDOWN TETAP ADA */}
        {cityOptions.length > 1 && (
          <select
            value={selectedCityId}
            onChange={handleCityChange}
            className="w-full mb-5 px-3 py-3 rounded-lg bg-slate-800 text-xs"
          >
            {cityOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.lokasi}
              </option>
            ))}
          </select>
        )}

        {/* STRIPED TABLE */}
        <table className="w-full text-sm overflow-hidden rounded-xl">
          <tbody>
            {prayers.map(([name, time], i) => {
              const isNext = nextPrayer?.name === name;
              return (
                <tr
                  key={name}
                  className={`
                    ${i % 2 === 0 ? "bg-slate-800/40" : "bg-slate-900"} {isNext ? "bg-[#6D1E3A]" : ""}
                  `}
                >
                  <td
                    className={`px-4 py-3 text-zinc-300 ${isNext ? "bg-[#6D1E3A]" : ""}`}
                  >
                    {name}
                    {/* {isNext && (
                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-[#F472B6] text-white">
                        Selanjutnya
                      </span>
                    )} */}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono text-zinc-200 ${isNext ? "bg-[#6D1E3A]" : ""}`}
                  >
                    {time}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="pt-3 mt-3 border-t border-slate-800 text-[10px] text-zinc-500 text-center">
          Data oleh MyQuran API • {times?.daerah}
        </div>
      </div>
    </>
  );
}
