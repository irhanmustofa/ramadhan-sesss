import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSurah } from "../../services/quranApi";
import {
  FaArrowCircleLeft,
  FaArrowCircleRight,
  FaPause,
  FaPlay,
} from "react-icons/fa";
import { SURAH_ID } from "../../services/surah-indonesia";

const BASMALAH = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
const basmallah_indo =
  "Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang";

export default function SurahDetail() {
  const { number } = useParams();
  const [surah, setSurah] = useState(null);
  const surahNumber = Number(number);
  const navigate = useNavigate();
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingAyah, setPlayingAyah] = useState(null);

  const toggleAudio = (audioUrl, ayahNumber) => {
    if (playingAyah === ayahNumber) {
      currentAudio.pause();
      setPlayingAyah(null);
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(audioUrl);
    audio.play();

    audio.onended = () => {
      setPlayingAyah(null);
    };

    setCurrentAudio(audio);
    setPlayingAyah(ayahNumber);
  };

  const goPrev = () => {
    if (surah.number > 1) {
      navigate(`/quran/surah/${surah.number - 1}`);
    }
  };

  const goNext = () => {
    if (surah.number < 114) {
      navigate(`/quran/surah/${surah.number + 1}`);
    }
  };

  useEffect(() => {
    getSurah(surahNumber).then((res) => {
      const [arabic, indo, audio] = res.data;

      setSurah({
        ...arabic,
        translations: indo.ayahs,
        audios: audio.ayahs,
      });
    });
  }, [surahNumber]);

  if (!surah) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-center text-zinc-400">Memuat surah...</p>
      </div>
    );
  }

  const stripBasmallah = (text) =>
    text.replace(/^بِسْمِ\sٱ?للَّهِ\sٱ?لرَّحْمَٰنِ\sٱ?لرَّحِيمِ\s*/u, "");

  return (
    // Container utama dengan overflow-x hidden untuk mencegah scroll horizontal
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">
      {/* HEADER STICKY - Pastikan ini direct child dari container scrollable */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a] border-b border-slate-800 shadow-xl">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#6D1E3A]">
                {SURAH_ID[surah.number]?.name}
              </h1>
              <p className="arabic text-xl text-zinc-300 text-end">
                {surah.name}
              </p>
              <p className="text-sm text-zinc-400 italic mt-3">
                "{SURAH_ID[surah.number]?.meaning}"
              </p>
            </div>

            <div className="text-xs text-zinc-400 space-y-1 text-right">
              <p className="bg-[#6D1E3A] text-[#F472B6] px-2 py-1 rounded-full inline-block">
                Juz {surah.ayahs[0].juz}
              </p>
              <p>Surah ke-{surah.number}</p>
              <p className="italic text-[#F472B6]">
                {surah.revelationType === "Meccan" ? "Makkiyah" : "Madaniyah"}
              </p>
              <p>{surah.numberOfAyahs} Ayat</p>
            </div>
          </div>

          <div className="mt-4 flex justify-center items-center gap-4">
            <button
              onClick={goPrev}
              disabled={surah.number === 1}
              className={`p-2 rounded-xl transition ${
                surah.number === 1
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-[#6D1E3A] hover:bg-slate-800 hover:opacity-80"
              }`}
            >
              <FaArrowCircleLeft size={25} />
            </button>

            <button
              onClick={goNext}
              disabled={surah.number === 114}
              className={`p-2 rounded-xl transition ${
                surah.number === 114
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-[#6D1E3A] hover:bg-slate-800 hover:opacity-80"
              }`}
            >
              <FaArrowCircleRight size={25} />
            </button>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA - Dipisahkan dari header */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pt-[200px]">
        {/* BASMALAH */}
        {surahNumber !== 1 && surahNumber !== 9 && (
          <div className="text-center arabic text-2xl text-[#F472B6] my-6">
            <p>{BASMALAH}</p>
            <span className="text-sm italic text-zinc-400 block mt-2">
              {basmallah_indo}
            </span>
          </div>
        )}

        {/* AYAT */}
        <div className="space-y-4">
          {surah.ayahs.map((ayah, index) => {
            const text =
              index === 0 && surahNumber !== 1 && surahNumber !== 9
                ? stripBasmallah(ayah.text)
                : ayah.text;

            const translation = surah.translations?.[index]?.text;
            const audioUrl = surah.audios?.[index]?.audio;
            const isPlaying = playingAyah === ayah.number;

            return (
              <div
                key={ayah.number}
                className="p-4 bg-slate-900 rounded-xl space-y-3 border border-slate-800"
              >
                <p className="text-right text-2xl arabic arabic-text leading-loose text-white">
                  {text}
                </p>

                {translation && (
                  <p className="text-sm text-zinc-300 leading-relaxed border-t border-slate-800 pt-3">
                    {translation}
                  </p>
                )}

                <div className="flex justify-between items-center text-xs text-zinc-400 pt-2">
                  <span className="font-medium">Ayat {ayah.numberInSurah}</span>

                  {audioUrl && (
                    <button
                      onClick={() => toggleAudio(audioUrl, ayah.number)}
                      className={`px-3 py-1.5 rounded-full transition flex items-center gap-2 ${
                        isPlaying
                          ? "bg-red-500/20 text-red-400 border border-red-500/50"
                          : "bg-[#6D1E3A]/20 text-[#F472B6] border border-[#6D1E3A]/50 hover:bg-[#6D1E3A]/40"
                      }`}
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                      <span>{isPlaying ? "Pause" : "Putar"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
