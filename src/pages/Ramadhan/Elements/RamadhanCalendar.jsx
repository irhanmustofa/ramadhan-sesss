import React, { useState, useEffect, useCallback } from "react";
import {
  FaMoon,
  FaChevronRight,
  FaCalendar,
  FaChartBar,
  FaHistory,
  FaCheck,
  FaTimes,
  FaDiagnoses,
  FaPlane,
  FaUserClock,
  FaSpinner,
} from "react-icons/fa";
import { getPrayerTimes } from "../../../services/prayerApi";
import { puasa } from "../../../services/puasaLib";

export default function RamadhanCalendar() {
  const [method, setMethod] = useState("pemerintah");
  const [currentDay, setCurrentDay] = useState(15);
  const [fastingDays, setFastingDays] = useState([]);
  const [activeTab, setActiveTab] = useState("calendar");
  const [showNiatModal, setShowNiatModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayStatus, setDayStatus] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDoa, setSelectedDoa] = useState(null);
  const [showBaqarahModal, setShowBaqarahModal] = useState(false);
  // Countdown state
  const [countdown, setCountdown] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [maghribTime, setMaghribTime] = useState(null);
  const [countdownLoading, setCountdownLoading] = useState(true);

  // Status options - Menggunakan warna tema pink
  const statusOptions = [
    {
      id: "puasa",
      label: "Puasa",
      icon: FaCheck,
      color: "bg-[#6D1E3A]",
      textColor: "text-[#F472B6]",
      borderColor: "border-[#F472B6]",
    },
    {
      id: "tidak_puasa",
      label: "Tidak Puasa",
      icon: FaTimes,
      color: "bg-red-500",
      textColor: "text-red-400",
      borderColor: "border-red-500",
    },
    {
      id: "sakit",
      label: "Sakit",
      icon: FaDiagnoses,
      color: "bg-yellow-500",
      textColor: "text-yellow-400",
      borderColor: "border-yellow-500",
    },
    {
      id: "safar",
      label: "Safar (Perjalanan)",
      icon: FaPlane,
      color: "bg-blue-500",
      textColor: "text-blue-400",
      borderColor: "border-blue-500",
    },
    {
      id: "lansia",
      label: "Lansia / Sakit Permanen",
      icon: FaUserClock,
      color: "bg-slate-500",
      textColor: "text-slate-400",
      borderColor: "border-slate-500",
    },
  ];

  // Start dates for Ramadhan 1447H (2026)
  const getStartDate = (selectedMethod) => {
    return selectedMethod === "pemerintah"
      ? new Date("2026-02-18") // Pemerintah: 1 Ramadhan = 18 Feb 2026
      : new Date("2026-02-17"); // Muhammadiyah: 1 Ramadhan = 17 Feb 2026
  };

  // Calculate current day based on method and date
  const calculateCurrentDay = (selectedMethod) => {
    const startDate = getStartDate(selectedMethod);
    const today = new Date();

    // Reset waktu ke tengah malam untuk perhitungan akurat
    const start = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    );
    const now = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    // Hitung selisih hari (+1 karena hari pertama = day 1)
    const diffTime = now - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Clamp between 1 and 30
    return Math.max(1, Math.min(30, diffDays));
  };

  // Load from localStorage
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const saved = localStorage.getItem("ramadhan_tracking_v2");
        if (saved) {
          const data = JSON.parse(saved);
          const savedMethod = data.method || "pemerintah";
          setMethod(savedMethod);
          setDayStatus(data.dayStatus || {});
          setFastingDays(data.fastingDays || []);

          // Calculate current day based on saved method
          const calculatedDay = calculateCurrentDay(savedMethod);
          setCurrentDay(calculatedDay);
        } else {
          // First time - use default
          const defaultDay = calculateCurrentDay("pemerintah");
          setCurrentDay(defaultDay);
        }
      } catch (error) {
        console.error("Error loading from localStorage:", error);
        setCurrentDay(calculateCurrentDay("pemerintah"));
      } finally {
        setIsLoaded(true);
      }
    };
    loadFromStorage();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave = {
        method,
        currentDay,
        fastingDays,
        dayStatus,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem("ramadhan_tracking_v2", JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [method, currentDay, fastingDays, dayStatus, isLoaded]);

  // Fetch prayer times and calculate countdown
  const fetchAndCalculateCountdown = useCallback(async () => {
    try {
      setCountdownLoading(true);

      // Ambil cityId dari localStorage (handle object atau string)
      const saved = localStorage.getItem("prayer_location");
      if (!saved) {
        setCountdownLoading(false);
        return;
      }

      let cityId;
      try {
        const locationData = JSON.parse(saved);
        cityId = locationData?.cityId || locationData;
      } catch {
        cityId = saved;
      }

      if (!cityId) {
        setCountdownLoading(false);
        return;
      }

      // Fetch jadwal sholat
      const prayerData = await getPrayerTimes(cityId, new Date());
      if (!prayerData?.jadwal?.maghrib) {
        setCountdownLoading(false);
        return;
      }

      const maghribStr = prayerData.jadwal.maghrib;
      setMaghribTime(maghribStr);

      // Function to calculate countdown
      const calculate = () => {
        const now = new Date();
        const [h, m] = maghribStr.split(":").map(Number);

        const target = new Date(now);
        target.setHours(h, m, 0, 0);

        // Jika maghrib sudah lewat, target besok
        if (now > target) {
          target.setDate(target.getDate() + 1);
        }

        const diff = target - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown({ hours, minutes, seconds });
      };

      calculate();
      const interval = setInterval(calculate, 1000);

      setCountdownLoading(false);
      return () => clearInterval(interval);
    } catch (error) {
      console.error("❌ Countdown error:", error);
      setCountdownLoading(false);
    }
  }, []);

  // Run countdown on mount
  useEffect(() => {
    const cleanup = fetchAndCalculateCountdown();
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [fetchAndCalculateCountdown]);

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    const calculatedDay = calculateCurrentDay(newMethod);
    setCurrentDay(calculatedDay);
  };

  const toggleFastingDay = (day) => {
    if (day > currentDay) return;
    setFastingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const openDayDetail = (day) => {
    if (day > currentDay) return;
    setSelectedDay(day);
  };

  const saveDayStatus = (status, note = "") => {
    if (!selectedDay) return;

    setDayStatus((prev) => ({
      ...prev,
      [selectedDay]: {
        status,
        note,
        timestamp: new Date().toISOString(),
        day: selectedDay,
      },
    }));

    if (status === "puasa") {
      if (!fastingDays.includes(selectedDay)) {
        setFastingDays((prev) => [...prev, selectedDay]);
      }
    } else {
      setFastingDays((prev) => prev.filter((d) => d !== selectedDay));
    }

    setSelectedDay(null);
  };

  const getDayStatus = (day) => dayStatus[day] || null;

  // Calculate progress
  const progress = (currentDay / 30) * 100;
  const fastingProgress = (fastingDays.length / 30) * 100;

  // Get current date info
  const getCurrentDate = () => {
    const startDate = getStartDate(method);
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + currentDay - 1);

    return {
      day: currentDate.toLocaleDateString("id-ID", { weekday: "long" }),
      date: currentDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  };

  const dateInfo = getCurrentDate();

  // Get hukum based on status
  const getHukum = (status) => {
    switch (status) {
      case "puasa":
        return "WAJIB";
      case "tidak_puasa":
        return "TIDAK ADA KEWAJIBAN";
      case "sakit":
        return "QADHA (Ganti di hari lain)";
      case "safar":
        return "QADHA (Ganti di hari lain)";
      case "lansia":
        return "FIDYAH (Bayar fidyah)";
      default:
        return "TIDAK ADA KEWAJIBAN";
    }
  };

  const clearAllData = () => {
    if (window.confirm("Hapus semua data tracking?")) {
      localStorage.removeItem("ramadhan_tracking_v2");
      window.location.reload();
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#F472B6] animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  const handleOpenDoaModal = (doaItem) => {
    setSelectedDoa(doaItem);
    setShowNiatModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-2">
      {/* 🌙 TOP BAR */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 pt-6 pb-4 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Method Selector */}
          <div className="flex gap-2 mb-4 fixed bg-slate-950 top-0 left-0 right-0 max-w-xl p-2 mx-auto z-50">
            <button
              onClick={() => handleMethodChange("pemerintah")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition ${
                method === "pemerintah"
                  ? "bg-[#6D1E3A] text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Pemerintah
            </button>
            <button
              onClick={() => handleMethodChange("muhammadiyah")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition ${
                method === "muhammadiyah"
                  ? "bg-[#6D1E3A] text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Muhammadiyah
            </button>
          </div>

          {/* Header Row */}
          <div className="flex items-center justify-between mb-4 mt-10">
            <div className="flex items-center gap-2">
              <FaMoon className="text-[#F472B6]" size={18} />
              <span className="text-xs text-slate-400">
                {currentDay} RAMADAN 1447H
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 bg-[#6D1E3A] rounded-xl">
              <button
                onClick={() => setShowBaqarahModal(true)}
                className="w-full py-2 px-3 rounded-xl flex items-center justify-between hover:border-[#F472B6]/30 transition"
              >
                <div className="flex items-center gap-3  ">
                  <div className="rounded-xl flex items-center justify-center ">
                    <span className="text-xs">QS. Al-Baqarah: 183</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Main Title + Countdown */}
          <div className="flex items-end justify-between mb-2">
            {/* KIRI: Judul Hari & Tanggal */}
            <div>
              <h1 className="text-3xl font-bold text-white">
                Hari ke-<span className="text-[#F472B6]">{currentDay}</span>
              </h1>
              <p className="text-slate-400 text-sm">
                {dateInfo.day}, {dateInfo.date}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Metode:{" "}
                {method === "pemerintah" ? "Pemerintah" : "Muhammadiyah"}
              </p>
            </div>

            {/* KANAN: Countdown Buka Puasa */}
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                Buka Puasa
              </p>
              {countdownLoading ? (
                <div className="flex items-center gap-1 justify-end">
                  <FaSpinner
                    className="animate-spin text-[#F472B6]"
                    size={16}
                  />
                  <span className="text-xs text-slate-500">Memuat...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    {/* Jam */}
                    <div className="bg-slate-800/80 rounded-lg px-2 py-1.5 min-w-[42px] text-center border border-slate-700">
                      <span className="text-lg font-bold text-[#F472B6] font-mono">
                        {String(countdown.hours).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono">:</span>
                    {/* Menit */}
                    <div className="bg-slate-800/80 rounded-lg px-2 py-1.5 min-w-[42px] text-center border border-slate-700">
                      <span className="text-lg font-bold text-[#F472B6] font-mono">
                        {String(countdown.minutes).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono">:</span>
                    {/* Detik */}
                    <div className="bg-slate-800/80 rounded-lg px-2 py-1.5 min-w-[42px] text-center border border-slate-700">
                      <span className="text-lg font-bold text-[#F472B6] font-mono animate-pulse">
                        {String(countdown.seconds).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {maghribTime ? `Jam ${maghribTime} WIB` : "--:--"}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Hari 1</span>
              <span className="text-slate-400">
                {Math.round(progress)}% selesai
              </span>
              <span>Hari 30</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6D1E3A] to-[#F472B6] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 📿 INFO CARDS */}
      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-3">
        {puasa.map((p, i) => (
          <button
            key={i}
            onClick={() => handleOpenDoaModal(p)}
            className="w-full bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-between hover:border-[#F472B6]/30 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6D1E3A]/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🤲</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white text-sm">{p.doa}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
              </div>
            </div>
            <FaChevronRight className="text-slate-500" size={16} />
          </button>
        ))}

        {/* Clear Data Button */}
        <button
          onClick={clearAllData}
          className="w-full bg-slate-900/50 rounded-2xl p-3 border border-slate-800 text-xs text-slate-500 hover:text-red-400 hover:border-red-500/30 transition"
        >
          🗑️ Hapus Semua Data Tracking
        </button>
      </div>

      {/* 📅 TRACKING SECTION */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaMoon className="text-[#F472B6]" size={20} />
                <div>
                  <h2 className="font-semibold text-white">Tracking Puasa</h2>
                  <p className="text-xs text-slate-500">
                    Catat puasamu setiap hari
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">
                  {fastingDays.length}/30
                </p>
                <p className="text-sm font-bold text-[#F472B6]">
                  {Math.round(fastingProgress)}%
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-2 transition ${
                activeTab === "calendar"
                  ? "text-[#F472B6] border-b-2 border-[#6D1E3A] bg-[#6D1E3A]/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <FaCalendar size={14} />
              Calendar
            </button>
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-2 transition ${
                activeTab === "summary"
                  ? "text-[#F472B6] border-b-2 border-[#6D1E3A] bg-[#6D1E3A]/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <FaChartBar size={14} />
              Summary
            </button>
          </div>

          {/* Calendar Grid */}
          {activeTab === "calendar" && (
            <div className="p-4">
              <p className="text-xs text-slate-500 text-center mb-4">1447H</p>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                  const isFuture = day > currentDay;
                  const dayStat = getDayStatus(day);
                  const statusData = statusOptions.find(
                    (s) => s.id === dayStat?.status,
                  );

                  return (
                    <button
                      key={day}
                      onClick={() => openDayDetail(day)}
                      disabled={isFuture}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative ${
                        isFuture
                          ? "bg-slate-800/20 border border-slate-800 text-slate-600 cursor-not-allowed"
                          : dayStat
                            ? `${statusData?.color}/20 border ${statusData?.borderColor} ${statusData?.textColor}`
                            : day === currentDay
                              ? "bg-[#6D1E3A]/30 border-2 border-[#F472B6] text-[#F472B6]"
                              : "bg-slate-800/50 border border-slate-700 text-slate-400 hover:border-[#F472B6]/50"
                      }`}
                    >
                      <span className="text-sm font-semibold">{day}</span>
                      {dayStat && (
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1 ${statusData?.color}`}
                        />
                      )}
                      {isFuture && (
                        <div className="absolute inset-0 bg-slate-950/50 rounded-xl flex items-center justify-center">
                          <FaTimes className="text-slate-700" size={12} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 text-center mt-3">
                * Klik hari untuk mencatat status puasa
              </p>
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === "summary" && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#F472B6]">
                    {fastingDays.length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Hari Berpuasa</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-400">
                    {30 - currentDay}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Sisa Hari</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#F472B6]">
                    {Math.round(fastingProgress)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Progress</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-400">
                    {currentDay}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Hari Sekarang</p>
                </div>
              </div>

              {/* Status Summary */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Rincian Status
                </h3>
                {statusOptions.map((status) => {
                  const count = Object.values(dayStatus).filter(
                    (d) => d.status === status.id,
                  ).length;
                  if (count === 0) return null;
                  return (
                    <div
                      key={status.id}
                      className="flex items-center justify-between bg-slate-800/30 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2">
                        <status.icon className={status.textColor} size={16} />
                        <span className="text-xs text-slate-300">
                          {status.label}
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${status.textColor}`}>
                        {count} hari
                      </span>
                    </div>
                  );
                })}
                {Object.keys(dayStatus).length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">
                    Belum ada data yang dicatat
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DAY STATUS MODAL */}
      {selectedDay && (
        <DayStatusModal
          day={selectedDay}
          statusOptions={statusOptions}
          currentStatus={getDayStatus(selectedDay)}
          getHukum={getHukum}
          onSave={saveDayStatus}
          onClose={() => setSelectedDay(null)}
        />
      )}

      {/* NIAT MODAL */}
      {showNiatModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-800 max-h-[80vh] overflow-y-auto">
            {/* Modal Header - Dinamis */}
            <div className="sticky top-0 bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between z-10">
              <h3 className="font-bold text-white text-sm sm:text-base">
                {selectedDoa?.doa || "Niat Puasa Ramadhan"}
              </h3>
              <button
                onClick={() => {
                  setShowNiatModal(false);
                  setSelectedDoa(null); // Reset saat tutup
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Arabic Text - Dinamis */}
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-xl sm:text-2xl leading-loose text-white font-arabic arabic">
                  {selectedDoa?.ayat || "نَوَيْتُ صَوْمَ غَدٍ..."}
                </p>
              </div>

              {/* Latin - Dinamis */}
              {selectedDoa?.latin && (
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                    Latin
                  </p>
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    "{selectedDoa.latin}"
                  </p>
                </div>
              )}

              {/* Artinya - Dinamis */}
              {selectedDoa?.artinya && (
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                    Artinya
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedDoa.artinya}
                  </p>
                </div>
              )}

              {/* Keutamaan / Catatan - Dinamis */}
              {selectedDoa?.keutamaan && (
                <div className="bg-[#6D1E3A]/20 rounded-xl p-4 border border-[#F472B6]/20">
                  <p className="text-xs text-[#F472B6] font-semibold mb-2">
                    ✨ Keutamaan
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedDoa.keutamaan}
                  </p>
                </div>
              )}

              {/* Fallback jika data kosong */}
              {!selectedDoa && (
                <p className="text-center text-slate-500 text-sm py-4">
                  Memuat data doa...
                </p>
              )}
            </div>

            {/* Footer Button */}
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowNiatModal(false);
                  setSelectedDoa(null);
                }}
                className="w-full py-3 rounded-xl bg-[#6D1E3A] text-white font-medium hover:bg-[#8b254a] transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {showBaqarahModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-800 max-h-[80vh] overflow-y-auto">
            {/* Modal Header - Dinamis */}
            <div className="sticky top-0 bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between z-10">
              <h3 className="font-bold text-white text-sm sm:text-base">
                QS. Al-Baqarah: 187
              </h3>
              <button
                onClick={() => {
                  setShowBaqarahModal(false);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Arabic Text - Dinamis */}
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-xl sm:text-2xl leading-loose text-white font-arabic arabic">
                  {
                    "وَكُلُوا۟ وَٱشْرَبُوا۟ حَتَّىٰ يَتَبَيَّنَ لَكُمُ ٱلْخَيْطُ ٱلْأَبْيَضُ مِنَ ٱلْخَيْطِ ٱلْأَسْوَدِ مِنَ ٱلْفَجْرِ"
                  }
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                  Latin
                </p>
                <p className="text-sm text-slate-300 italic leading-relaxed">
                  "Wa kulū wasyrabū hattā yatabayyana lakumul khaithul abyadhu
                  minal khaithil aswadi minal fajr."
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                  Artinya
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  "Dan makan minumlah hingga terang bagimu benang putih dari
                  benang hitam, yaitu fajar."
                </p>
              </div>
            </div>

            {/* Footer Button */}
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowBaqarahModal(false);
                }}
                className="w-full py-3 rounded-xl bg-[#6D1E3A] text-white font-medium hover:bg-[#8b254a] transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Day Status Modal Component
function DayStatusModal({
  day,
  statusOptions,
  currentStatus,
  getHukum,
  onSave,
  onClose,
}) {
  const [selectedStatus, setSelectedStatus] = useState(
    currentStatus?.status || "puasa",
  );
  const [note, setNote] = useState(currentStatus?.note || "");
  const selectedStatusData = statusOptions.find((s) => s.id === selectedStatus);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white">
            Hari ke-{day} — Ramadan 1447H
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
              STATUS PUASA
            </p>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((status) => {
                const isSelected = selectedStatus === status.id;
                return (
                  <button
                    key={status.id}
                    onClick={() => setSelectedStatus(status.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `${status.borderColor} ${status.color}/20`
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? status.color : "bg-slate-700"}`}
                      >
                        <status.icon className="text-white" size={18} />
                      </div>
                      <span
                        className={`text-xs font-medium text-center ${isSelected ? "text-white" : "text-slate-400"}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div
              className={`p-3 rounded-xl border ${selectedStatus === "puasa" ? "bg-[#6D1E3A]/20 border-[#F472B6]/50" : "bg-slate-800/50 border-slate-700"}`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Hukum</span>
                <span
                  className={`text-sm font-bold ${selectedStatus === "puasa" ? "text-[#F472B6]" : "text-slate-300"}`}
                >
                  {getHukum(selectedStatus)}
                </span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
              CATATAN (OPSIONAL)
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="misal: sedang dalam perjalanan..."
              className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#F472B6] resize-none h-20"
            />
          </div>
        </div>
        <div className="p-4 border-t border-slate-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition"
          >
            Batal
          </button>
          <button
            onClick={() => onSave(selectedStatus, note)}
            className="flex-1 py-3 rounded-xl bg-[#6D1E3A] text-white font-medium hover:bg-[#8b254a] transition"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
