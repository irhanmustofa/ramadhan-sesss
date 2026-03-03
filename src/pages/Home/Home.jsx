import BottomNav from "../../components/ui/BottomNav";
import PrayerTimes from "./elements/PrayerTimes";

export default function Home() {
  return (
    <div className="px-4 pt-6 pb-24 space-y-6 max-w-2xl mx-auto">
      {/* HEADER */}
      <header className="space-y-1">
        <p className="text-xs text-pink-500 tracking-wide">SELAMAT PAGI</p>
        <h1 className="text-2xl font-semibold">irhan</h1>

        <div className="flex gap-2 text-xs mt-2">
          <span className="px-2 py-1 rounded-full bg-white/5">Lv 1</span>
          <span className="px-2 py-1 rounded-full bg-white/5">🔥 0</span>
          <span className="px-2 py-1 rounded-full bg-[#6D1E3A]/20 text-[#F472B6]">
            CIBITUNG
          </span>
        </div>
      </header>

      {/* PROMO CARD */}
      <div className="rounded-2xl p-4 bg-gradient-to-br from-[#6D1E3A] to-[#0f172a]">
        <p className="text-xs text-yellow-400 font-medium">
          🏆 MA’AR IMPACT INNOVATION PRIZE 2026
        </p>
        <h2 className="font-semibold mt-1">Nawaetu Masuk Shortlist! 🏆</h2>
        <p className="text-xs text-white/70 mt-1">
          Bantu kami menang dengan memberikan vote GRATIS Anda!
        </p>

        <button className="mt-3 bg-yellow-400 text-black font-medium px-4 py-2 rounded-full text-sm">
          ⭐ Vote Sekarang di GlobalSadaqah
        </button>
      </div>

      {/* NIAT HARIAN */}
      <div className="rounded-2xl p-4 bg-white/5 ring-1 ring-white/10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-slate-400">JURNAL NIAT HARIAN</p>
            <h3 className="font-medium mt-1">Luruskan Niat Hari Ini</h3>
            <p className="text-xs text-slate-400 mt-1 italic">
              “Amalan itu tergantung niatnya…”
            </p>
          </div>
          <button className="bg-[#6D1E3A] px-3 py-1.5 rounded-full text-xs">
            Mulai Niatkan
          </button>
        </div>
      </div>

      {/* NEXT PRAYER */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 bg-white/5 ring-1 ring-white/10">
          <p className="text-xs text-slate-400">SELANJUTNYA</p>
          <p className="text-2xl font-mono mt-1">02:24:44</p>
          <p className="text-xs text-slate-400 mt-1">Dzuhur 12:07</p>
        </div>

        <div className="rounded-2xl p-4 bg-white/5 ring-1 ring-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#6D1E3A]/30 flex items-center justify-center">
            📖
          </div>
          <div>
            <p className="text-sm font-medium">Mulai Tilawah</p>
            <p className="text-xs text-slate-400">Baca Al-Qur’an hari ini</p>
          </div>
        </div>
      </div>

      {/* JADWAL SHOLAT */}
      <div className="rounded-2xl p-4 bg-white/5 ring-1 ring-white/10">
        <div className="flex justify-between mb-3">
          <h3 className="font-medium">Jadwal Sholat Hari Ini</h3>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-white/5">🧭 Kiblat</span>
            <span className="px-2 py-1 rounded-full bg-white/5">
              📍 Cari Masjid
            </span>
          </div>
        </div>

        <PrayerTimes />
      </div>
      <BottomNav />
    </div>
  );
}
