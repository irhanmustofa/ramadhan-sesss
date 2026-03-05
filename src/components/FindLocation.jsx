import { useState } from "react";
import { FaMosque } from "react-icons/fa";

export default function FindLocation() {
  const [isLocating, setIsLocating] = useState(false);

  const handleFindNearbyMosque = () => {
    setIsLocating(true);

    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung fitur lokasi.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const mapsUrl = `https://www.google.com/maps/search/mosque/@${latitude},${longitude},15z`;

        window.open(mapsUrl, "_blank");

        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);

        const fallbackUrl =
          "https://www.google.com/maps/search/masjid+terdekat";

        window.open(fallbackUrl, "_blank");

        setIsLocating(false);

        if (error.code === error.PERMISSION_DENIED) {
          alert(
            "Izin lokasi ditolak. Silakan izinkan akses lokasi untuk mencari masjid terdekat.",
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <button
      onClick={handleFindNearbyMosque}
      disabled={isLocating}
      className="text-xs text-slate-200 flex items-center gap-1.5 bg-[#6D1E3A] hover:bg-[#8b254a] px-3 py-1.5 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLocating ? (
        <>
          <div className="w-3 h-3 border-2 border-slate-200 border-t-transparent rounded-full animate-spin" />
          <span className="hidden sm:inline">Lokasi...</span>
        </>
      ) : (
        <>
          <FaMosque />
          <span>Cari Masjid</span>
        </>
      )}
    </button>
  );
}
