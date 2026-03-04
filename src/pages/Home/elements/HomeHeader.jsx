import { useEffect, useState } from "react";
import { FaGoogle, FaMapPin, FaCalendar, FaSpinner } from "react-icons/fa";
import { getCityNameFromCoords } from "../../../services/prayerApi"; // Sesuaikan path
import GoogleLoginButton from "../../../services/auth/GoogleLoginButton";

export default function HomeHeader() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState("CIBITUNG"); // Default value
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [todayDate, setTodayDate] = useState("");

  useEffect(() => {
    // 1. Cek Auth dari LocalStorage
    const savedUser = localStorage.getItem("auth");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // 2. Format Tanggal Hari Ini
    const date = new Date();
    const formattedDate = date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    setTodayDate(formattedDate);

    // 3. Fetch Lokasi dari Coordinates
    fetchUserLocation();
  }, []);

  const fetchUserLocation = async () => {
    setIsLoadingLocation(true);

    try {
      // Coba ambil dari localStorage dulu
      const saved = localStorage.getItem("prayer_location");

      if (saved) {
        const { latitude, longitude } = JSON.parse(saved);
        if (latitude && longitude) {
          const cityName = await getCityNameFromCoords(latitude, longitude);
          if (cityName) {
            setLocation(cityName.toUpperCase());
            return;
          }
        }
      }

      // Fallback: request geolocation jika belum ada coords tersimpan
      if (!saved && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const cityName = await getCityNameFromCoords(latitude, longitude);
            if (cityName) {
              setLocation(cityName.toUpperCase());
              // Simpan coords untuk penggunaan berikutnya
              localStorage.setItem(
                "prayer_location",
                JSON.stringify({
                  latitude,
                  longitude,
                  lastUpdated: new Date().toISOString(),
                }),
              );
            }
          },
          (error) => {
            console.warn("⚠️ Geolocation error:", error.message);
            // Tetap pakai default location
          },
          { enableHighAccuracy: false, timeout: 5000 },
        );
      }
    } catch (err) {
      console.error("❌ Failed to fetch location:", err);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setUser(null);
  };

  return (
    <header className="bg-gradient-to-r from-[#0f172a] to-[#1e1b3a] rounded-2xl p-4 ring-1 ring-white/10">
      {/* BARIS 1: User Info (Kiri) & Tanggal+Lokasi (Kanan) */}
      <div className="flex justify-between items-start mb-3">
        {/* KIRI: User Profile / Login Button */}
        <div className="text-right space-y-1.5">
          {/* Tanggal */}
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <FaCalendar className="text-[#F472B6] flex-shrink-0" size={10} />
            <span className="truncate max-w-[120px]">{todayDate}</span>
          </div>

          {/* Lokasi */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <FaMapPin className="text-[#F472B6] flex-shrink-0" size={10} />
            {isLoadingLocation ? (
              <FaSpinner className="animate-spin text-[#F472B6]" size={10} />
            ) : (
              <span className="truncate max-w-[120px] font-medium">
                {location}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            // ✅ SUDAH LOGIN
            <>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">
                  {user.name}
                </h1>
              </div>
            </>
          ) : (
            // ❌ BELUM LOGIN
            <>
              <GoogleLoginButton />
            </>
          )}
        </div>

        {/* KANAN: Tanggal & Lokasi */}
      </div>

      {/* BARIS 2: Badges */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
        {user && (
          <button
            onClick={handleLogout}
            className="ml-auto px-2.5 py-1 rounded-full bg-white/5 text-slate-400 text-[10px] hover:bg-red-500/20 hover:text-red-400 transition"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
