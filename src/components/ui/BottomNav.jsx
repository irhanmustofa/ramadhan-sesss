import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaBookOpen,
  FaCog,
  FaFingerprint,
  FaHome,
  FaMapPin,
  FaMoon,
} from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { getCityNameFromCoords } from "../../services/prayerApi";

const menus = [
  { to: "/", label: "Beranda", icon: <FaHome size={30} /> },
  { to: "/quran", label: "Al-Qur'an", icon: <FaBookOpen size={30} /> },
  {
    to: "/dashboard",
    label: "Ramadhan",
    icon: <FaMoon size={30} />,
    highlight: true,
  },
  { to: "/dzikir", label: "Dzikir", icon: <FaFingerprint size={30} /> },
  { to: "/settings", label: "Pengaturan", icon: <FaGear size={30} /> },
];

export default function BottomNav() {
  const [time, setTime] = useState("");
  const [locationAllowed, setLocationAllowed] = useState(false);

  // ✅ TAMBAH STATE INI (harus string, bukan object!)
  const [location, setLocation] = useState("CIBITUNG");

  useEffect(() => {
    // 1. Request Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLocationAllowed(true);

          const { latitude, longitude } = position.coords;

          // 2. Fetch nama kota dari coords
          try {
            const cityName = await getCityNameFromCoords(latitude, longitude);
            if (cityName) {
              // ✅ PASTIKAN SET STRING, BUKAN OBJECT
              setLocation(cityName.toUpperCase());
            }
          } catch (err) {
            console.warn("⚠️ Failed to get city name:", err);
            setLocation("LOKASI ANDA"); // Fallback string
          }
        },
        (error) => {
          console.warn("⚠️ Geolocation error:", error.message);
          setLocationAllowed(false);
          setLocation("CIBITUNG"); // Fallback string
        },
        { enableHighAccuracy: false, timeout: 5000 },
      );
    }

    // 3. Update jam tiap detik
    const interval = setInterval(() => {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setTime(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
      {/* Jam & Lokasi Floating */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-20 z-30">
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/10 shadow-lg">
          {/* Status Dot */}
          <span
            className={`w-2 h-2 rounded-full ${
              locationAllowed ? "bg-green-400 animate-pulse" : "bg-amber-400"
            }`}
          />

          {/* Location */}
          <span className="text-xs text-slate-300 max-w-[120px] truncate">
            {locationAllowed ? location : "Izinkan lokasi"}
          </span>

          {/* Separator */}
          <span className="w-px h-3 bg-slate-700" />

          {/* Time */}
          <span className="text-xs font-bold text-[#F472B6]">
            {locationAllowed ? time : "--:--"}
          </span>
        </div>
      </div>

      {/* Bottom Navigation Menu */}
      <div className="relative flex justify-around py-2 max-w-2xl mx-auto">
        {menus.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs mt-2 transition-colors ${
                isActive
                  ? "text-[#F472B6]"
                  : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            {m.icon}
            <span className="mt-1">{m.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
