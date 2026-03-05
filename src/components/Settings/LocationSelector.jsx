import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaSearch, FaTimes, FaSpinner, FaMapMarkerAlt } from "react-icons/fa";

export default function LocationSelector({
  selectedCityId,
  selectedCityName,
  onCitySelect,
  onResetToGPS,
  loading,
  error,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [allCities, setAllCities] = useState([]);
  const [citiesLoaded, setCitiesLoaded] = useState(false);

  // Lazy load cities only when search starts
  const loadCities = useCallback(async () => {
    if (citiesLoaded) return;

    try {
      const response = await fetch(
        "https://api.myquran.com/v2/sholat/kota/semua",
      );
      const data = await response.json();
      if (data?.data) {
        setAllCities(data.data);
        setCitiesLoaded(true);
      }
    } catch (err) {
      console.error("Failed to load cities:", err);
    }
  }, [citiesLoaded]);

  // Search with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Load cities if not loaded yet
    if (!citiesLoaded) {
      loadCities();
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const filtered = allCities.filter((city) =>
        city.lokasi.toLowerCase().includes(query),
      );
      setSearchResults(filtered.slice(0, 10));
      setShowResults(true);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, allCities, citiesLoaded, loadCities]);

  // Handle city selection
  const handleSelect = useCallback(
    (city) => {
      setSearchQuery("");
      setShowResults(false);
      onCitySelect?.(city);
    },
    [onCitySelect],
  );

  // Clear search
  const handleClear = useCallback(() => {
    setSearchQuery("");
    setShowResults(false);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".location-search-container")) {
        setShowResults(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-emerald-400" size={16} />
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">
            LOKASI
          </span>
        </div>

        {/* Reset to GPS Button */}
        <button
          onClick={onResetToGPS}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 text-xs font-medium hover:bg-emerald-600/30 transition disabled:opacity-50"
          title="Gunakan lokasi GPS saya"
        >
          <FaMapMarkerAlt size={12} />
          <span className="hidden sm:inline">Lokasi Saya</span>
        </button>
      </div>

      {/* Search Container */}
      <div className="relative mb-3 location-search-container">
        <div className="relative">
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={14}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => citiesLoaded && setShowResults(true)}
            placeholder="Cari kota (min. 2 huruf)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (searchResults.length > 0 || isSearching) && (
          <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
            {isSearching ? (
              <div className="p-3 text-center text-slate-400 text-sm">
                <FaSpinner className="animate-spin inline mr-2" />
                Mencari...
              </div>
            ) : (
              searchResults.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleSelect(city)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-white font-medium">
                      {city.lokasi}
                    </p>
                    {city.daerah && (
                      <p className="text-xs text-slate-500">{city.daerah}</p>
                    )}
                  </div>
                  {selectedCityId === city.id.toString() && (
                    <span className="text-emerald-400 text-xs">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Current Location Display */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-emerald-400" size={14} />
          <span className="text-sm text-white font-medium">
            {selectedCityName || "Memuat lokasi..."}
          </span>
        </div>
        {selectedCityId && (
          <span className="text-xs text-slate-500">ID: {selectedCityId}</span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-xs text-red-400">⚠️ {error}</p>
        </div>
      )}
    </div>
  );
}
