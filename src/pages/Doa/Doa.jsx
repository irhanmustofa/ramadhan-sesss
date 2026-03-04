import { FaCheck, FaCopy, FaHeart, FaSearch } from "react-icons/fa";
import { doa } from "../../services/doaLib";
import { useEffect, useState } from "react";

export default function Doa() {
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("doa_favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("doa_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Filter doa based on search
  const filteredDoa = doa.filter(
    (item) =>
      item.doa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.artinya.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.latin.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Toggle favorite
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  // Copy to clipboard
  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      {/* 🔍 Search Bar - Sticky */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-sm py-4 -mx-4 px-4 mb-4">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari doa..."
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
          Menampilkan {filteredDoa.length} dari {doa.length} doa
        </span>
        {favorites.length > 0 && (
          <span className="flex items-center gap-1 text-[#F472B6]">
            <FaHeart className="fill-current" /> {favorites.length} favorit
          </span>
        )}
      </div>

      {/* 📿 Doa Cards */}
      <div className="space-y-3">
        {filteredDoa.map((item) => {
          const isFavorite = favorites.includes(item.id);
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1b3a] via-[#0f172a] to-[#1e1b3a] border border-white/10 hover:border-[#F472B6]/50 transition-all duration-300"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#F472B6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Header: ID + Actions */}
              <div className="relative flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-[#6D1E3A]/30 text-[#F472B6] text-[10px] font-bold">
                    #{item.id.padStart(2, "0")}
                  </span>
                  <h3 className="text-sm font-semibold text-white">
                    {item.doa}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  {/* Copy Button */}
                  <button
                    onClick={() => copyToClipboard(item.ayat, item.id)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-white/20 hover:text-[#F472B6] transition"
                    title="Salin doa"
                  >
                    {isCopied ? (
                      <FaCheck className="text-green-400" size={12} />
                    ) : (
                      <FaCopy size={12} />
                    )}
                  </button>

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                      isFavorite
                        ? "bg-[#F472B6] text-white"
                        : "bg-white/10 text-slate-400 hover:bg-white/20 hover:text-[#F472B6]"
                    }`}
                    title="Tambah ke favorit"
                  >
                    <FaHeart
                      className={isFavorite ? "fill-current" : ""}
                      size={12}
                    />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="relative p-4 space-y-3">
                {/* Arabic Text */}
                <p className="text-right text-2xl leading-loose text-white font-arabic arabic">
                  {item.ayat}
                </p>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#F472B6]/20 to-transparent" />

                {/* Latin */}
                <p className="text-sm text-slate-300 italic leading-relaxed">
                  {item.latin}
                </p>

                {/* Artinya */}
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.artinya}
                </p>
              </div>

              {/* Bottom Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6D1E3A] via-[#F472B6] to-[#6D1E3A] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDoa.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6D1E3A]/20 flex items-center justify-center">
            <FaSearch className="text-[#F472B6]" size={24} />
          </div>
          <p className="text-slate-400 mb-2">
            Tidak ditemukan untuk "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-[#F472B6] text-sm hover:underline"
          >
            Reset pencarian
          </button>
        </div>
      )}
    </div>
  );
}
