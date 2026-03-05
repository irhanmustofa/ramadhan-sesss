import { useState, useEffect, useCallback } from "react";
import {
  FaMoon,
  FaChevronRight,
  FaSun,
  FaStar,
  FaSpinner,
  FaHandHoldingHeart,
  FaInfoCircle,
  FaCalculator,
} from "react-icons/fa";
import { FaUtensils } from "react-icons/fa6";
import { zakat } from "../../../services/puasaLib";

export default function RamadhanToday() {
  const [countdown, setCountdown] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showModalLailatul, setShowModalLailatul] = useState(false);
  const [showModalDalil, setShowModalDalil] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [familyCount, setFamilyCount] = useState(1);
  const [pricePerPerson, setPricePerPerson] = useState(50000);
  const totalZakat = familyCount * pricePerPerson;
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* 🤲 DOA MALAM LAILATUL QADR */}
      <div className="max-w-2xl mx-auto px-4 mt-4">
        <button
          onClick={() => setShowModalLailatul(true)}
          className="w-full bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-between hover:border-[#F472B6]/30 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6D1E3A]/30 flex items-center justify-center">
              <span className="text-xl">🤲</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white text-sm">
                Doa Malam Lailatul Qadr
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Doa di malam yang mulia
              </p>
            </div>
          </div>
          <FaChevronRight className="text-slate-500" size={16} />
        </button>
      </div>

      {/* 💰 ZAKAT FITRAH SECTION */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <FaHandHoldingHeart className="text-[#F472B6]" size={20} />
            <h2 className="text-xl font-bold text-white">Zakat Fitrah</h2>
          </div>
          <p className="text-sm text-slate-400">
            Tunaikan kewajibannya sebelum shalat Idul Fitri
          </p>
        </div>

        {/* Kewajiban Zakat Card */}
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FaInfoCircle className="text-pink-400" size={16} />
            <h3 className="font-semibold text-white text-sm">
              Kewajiban Zakat
            </h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Zakat fitrah wajib bagi setiap muslim yang merdeka dan memiliki
            kelebihan makanan untuk dirinya dan keluarganya pada hari raya Idul
            Fitri. Besaran zakat adalah 1 sha' (kurang lebih 2,5 kg atau 3,5
            liter) makanan pokok.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModalDalil(true)}
              className="px-2 py-1 rounded bg-[#6D1E3A] text-white text-[10px] font-medium cursor-pointer hover:bg-[#6D1E3A]/80 transition"
            >
              Dalil Zakat Fitrah
            </button>
          </div>
        </div>

        {/* Two Cards Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Bentuk Makanan */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 hover:border-amber-500/30 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3">
              <FaUtensils className="text-amber-400" size={18} />
            </div>
            <h3 className="font-semibold text-white text-sm mb-2">
              Bentuk Makanan
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zakat dibayarkan berupa makanan pokok yang menyenangi menurut
              kebiasaan masyarakat setempat (seperti beras, gandum, kurma, dll).
            </p>
          </div>

          {/* Membayar dengan Uang */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 hover:border-[#6D1E3A] transition">
            <div className="w-10 h-10 rounded-xl bg-[#6D1E3A] flex items-center justify-center mb-3">
              <FaCalculator className="text-pink-400" size={18} />
            </div>
            <h3 className="font-semibold text-white text-sm mb-2">
              Membayar dengan Uang
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Menurut mazhab Hanafi, diperbolehkan membayar zakat fitrah dengan
              uang yang senilai dengan harga makanan pokok pembayar.
            </p>
          </div>
        </div>

        {/* Kalkulator Zakat Button */}
        <button
          onClick={() => setShowCalculator(true)}
          className="w-full bg-[#6D1E3A] rounded-2xl p-4 border border-[#6D1E3A] flex items-center justify-center gap-2 hover:border-[#6D1E3A] transition cursor-pointer"
        >
          <FaCalculator className="text-pink-500" size={18} />
          <span className="font-semibold text-white text-sm">
            Kalkulator Zakat
          </span>
        </button>
      </div>
      {showModalLailatul && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-800 max-h-[80vh] overflow-y-auto">
            {/* Modal Header - Dinamis */}
            <div className="sticky top-0 bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between z-10">
              <h3 className="font-bold text-white text-sm sm:text-base">
                Doa Malam Lailatul Qadr
              </h3>
              <button
                onClick={() => {
                  setShowModalLailatul(false);
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
                    "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي"
                  }
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                  Latin
                </p>
                <p className="text-sm text-slate-300 italic leading-relaxed">
                  “Allāhumma innaka 'afuwwun tuhibbul 'afwa fa''fu 'annī.”
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                  Artinya
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  “Ya Allah, sesungguhnya Engkau Maha Pemaaf dan menyukai
                  pemaafan, maka maafkanlah aku.”
                </p>
              </div>
            </div>

            {/* Footer Button */}
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowModalLailatul(false);
                }}
                className="w-full py-3 rounded-xl bg-[#6D1E3A] text-white font-medium hover:bg-[#8b254a] transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {showModalDalil && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-800 max-h-[80vh] overflow-y-auto">
            {/* Modal Header - Dinamis */}
            <div className="sticky top-0 bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between z-10">
              <h3 className="font-bold text-white text-sm sm:text-base">
                Dalil Zakat Fitrah
              </h3>
              <button
                onClick={() => {
                  setShowModalDalil(false);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {zakat.map((item, index) => (
              <div key={index} className="p-4 space-y-4">
                {/* Arabic Text - Dinamis */}
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-xl sm:text-2xl leading-loose text-white font-arabic arabic">
                    {item.arab}
                  </p>
                </div>
                {item.latin && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                      Latin
                    </p>
                    <p className="text-sm text-slate-300 italic leading-relaxed">
                      {item.latin}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
                    Artinya
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {item.artinya}
                  </p>
                </div>
              </div>
            ))}

            {/* Footer Button */}
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowModalDalil(false);
                }}
                className="w-full py-3 rounded-xl bg-[#6D1E3A] text-white font-medium hover:bg-[#8b254a] transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {showCalculator && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl w-full max-w-md border border-slate-800 overflow-hidden shadow-2xl shadow-emerald-900/20">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6D1E3A] flex items-center justify-center">
                  <FaCalculator className="text-pink-400" size={20} />
                </div>
                <h3 className="font-bold text-white text-lg">
                  Kalkulator Zakat Fitrah
                </h3>
              </div>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Jumlah Anggota Keluarga */}
              <div>
                <label className="block text-sm text-slate-400 mb-3">
                  Jumlah Anggota Keluarga
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFamilyCount(Math.max(1, familyCount - 1))}
                    className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white hover:border-[#F472B6] transition"
                  >
                    −
                  </button>
                  <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 py-3 text-center">
                    <span className="text-2xl font-bold text-white">
                      {familyCount}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      orang
                    </span>
                  </div>
                  <button
                    onClick={() => setFamilyCount(familyCount + 1)}
                    className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white hover:border-[#F472B6] transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Harga Beras per 2.5 kg */}
              <div>
                <label className="block text-sm text-slate-400 mb-3">
                  Harga Beras/Makanan Pokok per 2.5 kg (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={pricePerPerson}
                    onChange={(e) => setPricePerPerson(Number(e.target.value))}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#F472B6] focus:ring-1 focus:ring-pink-500/50 transition"
                    placeholder="50000"
                  />
                </div>
              </div>

              {/* Total Zakat */}
              <div className="bg-gradient-to-br from-[#6D1E3A]/30 to-[#F472B6]/30 shadow-2xl shadow-emerald800/20 rounded-2xl p-6 border border-[#F472B6]/30">
                <p className="text-sm text-slate-400 text-center mb-2">
                  Total Zakat Fitrah Anda
                </p>
                <p className="text-4xl font-bold text-white text-center">
                  Rp {totalZakat.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-slate-500 text-center mt-2">
                  {familyCount} orang × Rp{" "}
                  {pricePerPerson.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Catatan */}
              <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-800">
                <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                  Catatan: Harga tiap makanan pokok bisa berbeda tergantung
                  kualitas yang biasa Anda konsumsi.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => setShowCalculator(false)}
                className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition"
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
