import { useState } from "react";
import { asma } from "../../services/asmaLib";
import { FaSearch, FaStar, FaHeart } from "react-icons/fa";

export default function AsmaulHusna() {
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);

  // Filter berdasarkan pencarian
  const filteredAsma = asma.filter(
    (item) =>
      item.latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.indo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.arab.includes(searchQuery),
  );

  // Toggle favorite
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      {/* 🔍 Search Bar */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-sm py-4 -mx-4 px-4 mb-4">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari Asmaul Husna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F472B6]/50 focus:border-[#F472B6] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 📊 Stats */}
      <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
        <span>
          Menampilkan {filteredAsma.length} dari {asma.length} nama
        </span>
        {favorites.length > 0 && (
          <span className="flex items-center gap-1 text-[#F472B6]">
            <FaHeart className="fill-current" /> {favorites.length} favorit
          </span>
        )}
      </div>

      {/* 🎴 Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredAsma.map((item) => {
          const isFavorite = favorites.includes(item.id);

          return (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1b3a] via-[#0f172a] to-[#1e1b3a] border border-white/10 hover:border-[#F472B6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#6D1E3A]/20 hover:-translate-y-1"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#F472B6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Number Badge */}
              <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#6D1E3A] flex items-center justify-center text-[10px] font-bold text-[#F472B6] border border-[#F472B6]/30">
                {item.id.toString().padStart(2, "0")}
              </div>

              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(item.id)}
                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isFavorite
                    ? "bg-[#F472B6] text-white"
                    : "bg-white/10 text-slate-400 hover:bg-white/20 hover:text-[#F472B6]"
                }`}
              >
                <FaHeart
                  className={isFavorite ? "fill-current" : ""}
                  size={14}
                />
              </button>

              {/* Content */}
              <div className="p-5 pt-12">
                {/* Arabic Text */}
                <div className="text-center mb-4">
                  <p className="text-4xl font-arabic text-white leading-loose tracking-wide group-hover:text-[#F472B6] transition-colors duration-300 arabic">
                    {item.arab}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#F472B6]/30 to-transparent mb-4" />

                {/* Latin & Meaning */}
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#F472B6] transition-colors">
                    {item.latin}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.indo}
                  </p>
                </div>

                {/* Hover Reveal: Extra Info */}
                <div className="mt-4 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-[10px] text-slate-500 text-center italic">
                    "Nama ke-{item.id} dari 99 Asmaul Husna"
                  </p>
                </div>
              </div>

              {/* Bottom Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6D1E3A] via-[#F472B6] to-[#6D1E3A] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAsma.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6D1E3A]/20 flex items-center justify-center">
            <FaSearch className="text-[#F472B6]" size={24} />
          </div>
          <p className="text-slate-400">
            Tidak ditemukan untuk "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-2 text-[#F472B6] text-sm hover:underline"
          >
            Reset pencarian
          </button>
        </div>
      )}
    </div>
  );
}
