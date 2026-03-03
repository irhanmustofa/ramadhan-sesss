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

const BASMALAH = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
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
    return <p className="text-center text-zinc-400 mt-10">Memuat surah...</p>;
  }

  const stripBasmallah = (text) =>
    text.replace(/^بِسْمِ\sٱ?للَّهِ\sٱ?لرَّحْمَٰنِ\sٱ?لرَّحِيمِ\s*/u, "");

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 pb-6">
      {/* HEADER */}
      <header className="items-start gap-4 mt-4 bg-[#0f172a] p-4 rounded-2xl">
        <div className="flex justify-between ">
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

          <div className="text-xs text-zinc-400 space-y-1">
            <p className="bg-[#6D1E3A] text-[#F472B6] px-2 py-1 rounded-full text-center">
              Juz {surah.ayahs[0].juz}
            </p>
            <p className="text-right">Surah ke-{surah.number}</p>
            <p className="text-right italic text-[#F472B6]">
              {surah.revelationType === "Meccan" ? "Makkiyah" : "Madaniyah"}
            </p>
            <p className="text-right ">{surah.numberOfAyahs} Ayat</p>
          </div>
        </div>
        <div className="mt-4 gap-x-5 justify-center items-center flex">
          <div>
            <button
              onClick={goPrev}
              disabled={surah.number === 1}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition pointer-events-auto ${
                surah.number === 1
                  ? "text-slate-500 cursor-not-allowed"
                  : "text-[#6D1E3A] hover:opacity-80"
              }`}
            >
              <FaArrowCircleLeft size={25} />
            </button>
            {/* spasi */}
            <span className="mx-2"></span>
            <button
              onClick={goNext}
              disabled={surah.number === 114}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                surah.number === 114
                  ? "text-slate-500 cursor-not-allowed"
                  : "text-[#6D1E3A] hover:opacity-80"
              }`}
            >
              <FaArrowCircleRight size={25} />
            </button>
          </div>
        </div>
      </header>

      {/* BASMALAH (KECUALI AL-FATIHAH & AT-TAUBAH) */}
      {surahNumber !== 1 && surahNumber !== 9 && (
        <div className="text-center arabic text-2xl text-[#F472B6] my-6">
          <p>{BASMALAH}</p>
          <span className="text-sm italic">{basmallah_indo}</span>
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
              className="p-4 bg-slate-900 rounded-xl space-y-3"
            >
              {/* Arab */}
              <p className="text-right text-2xl arabic arabic-text">{text}</p>

              {/* Terjemahan Indonesia */}
              {translation && (
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {translation}
                </p>
              )}

              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Ayat {ayah.numberInSurah}</span>

                {audioUrl && (
                  <button
                    onClick={() => toggleAudio(audioUrl, ayah.number)}
                    className={`px-2 py-2 rounded-full transition ${
                      isPlaying
                        ? "bg-red-500 text-white"
                        : "bg-[#6D1E3A] text-[#F472B6]"
                    }`}
                  >
                    {isPlaying ? <FaPause /> : <FaPlay />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
