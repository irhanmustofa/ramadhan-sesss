import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getSurahList } from "../../services/quranApi";
import { SURAH_ID } from "../../services/surah-indonesia";

export default function SurahList() {
  const [surahs, setSurahs] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getSurahList().then((res) => {
      setSurahs(res.data.surahs.references);
    });
  }, []);

  // 🔍 Filter surah
  const filteredSurahs = useMemo(() => {
    if (!query) return surahs;

    const q = query.toLowerCase();

    return surahs.filter((s) => {
      const indo = SURAH_ID[s.number];

      return (
        s.englishName.toLowerCase().includes(q) || // Al-Fatiha
        s.name.includes(query) || // الفاتحة
        indo?.name.toLowerCase().includes(q) || // Al-Fatihah
        indo?.meaning.toLowerCase().includes(q) || // Pembuka
        String(s.number) === q // 1, 9, dll
      );
    });
  }, [query, surahs]);

  return (
    <div className="space-y-4">
      {/* SEARCH BAR */}
      <div className="sticky top-0 z-10 bg-slate-950 pb-2">
        <input
          type="text"
          placeholder="Cari surah… (Al-Fatihah / الفاتحة)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full px-4 py-3 rounded-xl
            bg-zinc-900 text-white
            placeholder:text-zinc-500
            outline-none
            focus:ring-2 focus:ring-[#6D1E3A]
          "
        />
      </div>

      {/* LIST */}
      {/* LIST */}
      {filteredSurahs.length === 0 && (
        <p className="text-center text-zinc-400 text-sm col-span-2">
          Surah tidak ditemukan
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredSurahs.map((surah) => (
          <Link
            key={surah.number}
            to={`/quran/surah/${surah.number}`}
            className="
        flex justify-between items-center
        p-4 rounded-xl
        bg-zinc-900 hover:bg-zinc-800
        transition
      "
          >
            <div>
              <p className="font-semibold">{SURAH_ID[surah.number]?.name}</p>
              <p className="text-xs text-zinc-400 arabic">{surah.name}</p>
              <p className="text-sm text-zinc-400 italic mt-3">
                "{SURAH_ID[surah.number]?.meaning}"
              </p>
            </div>

            <div className="text-end">
              <span className="text-[#F472B6] font-bold">{surah.number}</span>
              <p className="text-xs text-zinc-400 mt-1">
                {surah.numberOfAyahs} Ayat
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
