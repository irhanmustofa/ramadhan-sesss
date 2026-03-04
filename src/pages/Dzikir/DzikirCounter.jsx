import { useState, useEffect, useCallback } from "react";
import {
  FaSync,
  FaList,
  FaCheck,
  FaChevronLeft,
  FaViber,
} from "react-icons/fa";

// Data Dzikir
const dzikirList = [
  {
    id: "1",
    arabic: "أَسْتَغْفِرُ اللهَ",
    latin: "ASTAGHFIRULLAH",
    translation: "Aku memohon ampunan kepada Allah SWT.",
    target: 100,
    category: "Istighfar",
  },
  {
    id: "2",
    arabic: "سُبْحَانَ اللهِ",
    latin: "SUBHANALLAH",
    translation: "Maha Suci Allah.",
    target: 33,
    category: "Tasbih",
  },
  {
    id: "3",
    arabic: "اَلْحَمْدُ لِلّٰهِ",
    latin: "ALHAMDULILLAH",
    translation: "Segala puji bagi Allah.",
    target: 33,
    category: "Tahmid",
  },
  {
    id: "4",
    arabic: "اَللّٰهُ اَكْبَرُ",
    latin: "ALLAHU AKBAR",
    translation: "Allah Maha Besar.",
    target: 33,
    category: "Takbir",
  },
  {
    id: "5",
    arabic: "لَا اِلٰهَ اِلَّا اللهُ",
    latin: "LAA ILAAHA ILLALLAH",
    translation: "Tidak ada tuhan selain Allah.",
    target: 100,
    category: "Tahlil",
  },
  {
    id: "6",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ اِلَّا بِاللهِ",
    latin: "LAA HAULA WALAA QUWWATA ILLA BILLAH",
    translation: "Tiada daya dan kekuatan kecuali dengan pertolongan Allah.",
    target: 100,
    category: "Haulaqah",
  },
  {
    id: "7",
    arabic: "صَلَّى اللهُ عَلَى مُحَمَّدٍ",
    latin: "SHALALLAHU 'ALA MUHAMMAD",
    translation: "Semoga Allah memberikan shalawat kepada Nabi Muhammad.",
    target: 100,
    category: "Shalawat",
  },
  {
    id: "8",
    arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ",
    latin: "SUBHANALLAHI WA BIHAMDIH",
    translation: "Maha Suci Allah dan dengan segala pujian-Nya.",
    target: 100,
    category: "Tasbih",
  },
];

export default function DzikirCounter() {
  const [selectedDzikir, setSelectedDzikir] = useState(dzikirList[0]);
  const [count, setCount] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [lastDate, setLastDate] = useState(null);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCount = localStorage.getItem("dzikir_count");
    const savedDzikir = localStorage.getItem("dzikir_selected");
    const savedDaily = localStorage.getItem("dzikir_daily");
    const savedStreak = localStorage.getItem("dzikir_streak");
    const savedDate = localStorage.getItem("dzikir_last_date");
    const savedVibrate = localStorage.getItem("dzikir_vibrate");

    if (savedCount) setCount(parseInt(savedCount));
    if (savedDzikir) {
      const dzikir = dzikirList.find((d) => d.id === savedDzikir);
      if (dzikir) setSelectedDzikir(dzikir);
    }
    if (savedDaily) setDailyCount(parseInt(savedDaily));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedDate) setLastDate(savedDate);
    if (savedVibrate !== null) setVibrateEnabled(savedVibrate === "true");

    // Check if new day
    const today = new Date().toDateString();
    if (savedDate !== today) {
      // Reset daily count but keep streak logic
      if (savedDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (savedDate === yesterday.toDateString()) {
          // Streak continues
        } else if (savedDate !== today) {
          // Streak broken
          setStreak(1);
        }
      } else {
        setStreak(1);
      }
      setDailyCount(0);
      localStorage.setItem("dzikir_last_date", today);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("dzikir_count", count.toString());
    localStorage.setItem("dzikir_selected", selectedDzikir.id);
    localStorage.setItem("dzikir_daily", dailyCount.toString());
    localStorage.setItem("dzikir_streak", streak.toString());
    localStorage.setItem("dzikir_vibrate", vibrateEnabled.toString());
  }, [count, selectedDzikir, dailyCount, streak, vibrateEnabled]);

  // Handle tap/click
  const handleTap = useCallback(() => {
    const newCount = count + 1;
    const newDaily = dailyCount + 1;

    setCount(newCount);
    setDailyCount(newDaily);

    // Vibrate if enabled
    if (vibrateEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Check if target reached
    if (newCount === selectedDzikir.target) {
      setShowCompletion(true);
      setTimeout(() => setShowCompletion(false), 3000);
    }

    // Auto reset when reaching target
    if (newCount >= selectedDzikir.target) {
      setTimeout(() => {
        setCount(0);
      }, 1000);
    }
  }, [count, dailyCount, selectedDzikir, vibrateEnabled]);

  // Reset counter
  const handleReset = () => {
    if (window.confirm("Reset hitungan dzikir ini?")) {
      setCount(0);
    }
  };

  // Toggle vibrate
  const toggleVibrate = () => {
    setVibrateEnabled(!vibrateEnabled);
  };

  // Select dzikir
  const handleSelectDzikir = (dzikir) => {
    setSelectedDzikir(dzikir);
    setCount(0);
    setShowPicker(false);
  };

  // Calculate progress percentage
  const progress = (count / selectedDzikir.target) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col max-w-xl mx-auto">
      {/* Header */}
      <div className="pt-4 px-4 text-center">
        <h1 className="text-xl font-bold text-white m-0">Tasbih Digital</h1>
        <p className="text-xs text-slate-400 tracking-wider">
          ZIKIR PENENANG HATI
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center x-4 space-y-4">
        {/* Dzikir Text Display */}
        <div className="text-center space-y-3">
          <p className="text-5xl font-arabic arabic leading-loose text-white">
            {selectedDzikir.arabic}
          </p>
          <p className="text-lg font-bold text-pink-400 tracking-wide">
            {selectedDzikir.latin}
          </p>
          <p className="text-sm text-slate-400 italic max-w-xs mx-auto">
            {selectedDzikir.translation}
          </p>
        </div>

        {/* Circular Counter Button */}
        <div className="relative mt-8">
          {/* Progress Ring */}
          <svg className="w-72 h-72 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="144"
              cy="144"
              r="136"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-800"
            />
            {/* Progress circle */}
            <circle
              cx="144"
              cy="144"
              r="136"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 136}
              strokeDashoffset={2 * Math.PI * 136 * (1 - progress / 100)}
              className="text-[#F472B6] transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>

          {/* Tap Button */}
          <button
            onClick={handleTap}
            className="absolute inset-0 m-auto w-64 h-64 rounded-full bg-gradient-to-br from-[#F472B6]/50 to-slate-900/50 border-2 border-[#6D1E3A]/30 flex flex-col items-center justify-center active:scale-95 transition-transform hover:border-pink-500/50"
          >
            <span className="text-xs text-slate-400 mb-2 tracking-wider">
              {selectedDzikir.category.toUpperCase()}
            </span>
            <span className="text-7xl font-bold text-white">{count}</span>
            <span className="text-xs text-[#F472B6] mt-2">Tap</span>
          </button>

          {/* Target indicator */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-[#F472B6] shadow-lg shadow-[#F472B6]/50 border border-pink-400/50" />
        </div>

        {/* Completion Message */}
        {showCompletion && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-pink-500/90 text-white px-6 py-3 rounded-full text-sm font-bold animate-bounce">
            ✓ Target Tercapai!
          </div>
        )}
      </div>

      {/* Stats */}

      {/* Bottom Controls */}
      <div className="fixed bottom-18 left-0 right-0 bg-slate-950">
        {/* <div className="px-4 py-3 flex justify-center gap-3">
          <div className="px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700 flex items-center gap-2">
            <span className="text-pink-400">📅</span>
            <span className="text-xs text-slate-300">
              HARIAN: <span className="font-bold text-white">{dailyCount}</span>
            </span>
          </div>
          <div className="px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700 flex items-center gap-2">
            <span className="text-orange-400">🔥</span>
            <span className="text-xs text-slate-300">
              STREAK:{" "}
              <span className="font-bold text-white">{streak} HARI</span>
            </span>
          </div>
        </div> */}
        <div className="px-4 py-6 flex gap-3 ">
          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center justify-center gap-2"
          >
            <FaSync size={16} />
            <span className="text-sm font-medium">Reset</span>
          </button>

          {/* Pilih Zikir Button */}
          <button
            onClick={() => setShowPicker(true)}
            className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center justify-center gap-2"
          >
            <FaList size={16} />
            <span className="text-sm font-medium">Pilih Zikir</span>
          </button>

          {/* Getar/Vibrate Button */}
          <button
            onClick={toggleVibrate}
            className={`flex-1 py-3 rounded-xl border transition flex items-center justify-center gap-2 ${
              vibrateEnabled
                ? "bg-pink-900/30 border-[#6D1E3A] text-pink-400"
                : "bg-slate-900 border-slate-700 text-slate-500"
            }`}
          >
            <FaViber size={16} />
            <span className="text-sm font-medium">GETAR</span>
          </button>
        </div>
      </div>

      {/* Dzikir Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/90 z-10 flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800">
            <button
              onClick={() => setShowPicker(false)}
              className="p-2 hover:bg-slate-800 rounded-full transition"
            >
              <FaChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-bold text-white">Pilih Dzikir</h2>
          </div>

          {/* Dzikir List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {dzikirList.map((dzikir) => (
              <button
                key={dzikir.id}
                onClick={() => handleSelectDzikir(dzikir)}
                className={`w-full p-4 rounded-2xl border text-left transition ${
                  selectedDzikir.id === dzikir.id
                    ? "bg-pink-900/30 border-[#6D1E3A]"
                    : "bg-slate-900 border-slate-700 hover:border-slate-600"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-2xl font-arabic arabic text-right mb-2">
                      {dzikir.arabic}
                    </p>
                    <h3 className="font-bold text-white text-sm mb-1">
                      {dzikir.latin}
                    </h3>
                    <p className="text-xs text-slate-400 mb-2">
                      {dzikir.translation}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                        Target: {dzikir.target}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                        {dzikir.category}
                      </span>
                    </div>
                  </div>
                  {selectedDzikir.id === dzikir.id && (
                    <FaCheck className="text-emerald-400 ml-3" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
