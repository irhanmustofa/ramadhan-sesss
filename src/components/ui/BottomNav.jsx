// src/components/BottomNav.jsx
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaHome,
  FaBookOpen,
  FaMoon,
  FaFingerprint,
  FaCog,
  FaMapPin,
} from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { useLocationContext } from "../../context/LocationContext";

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
  const { location, loading, error } = useLocationContext(); // Ambil dari context
  const [time, setTime] = useState("");

  // Jam hanya jalan di komponen UI ini
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
      {/* Jam & Lokasi Floating */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-20 z-30">
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/10 shadow-lg backdrop-blur-sm">
          {/* Status Dot */}
          <span
            className={`w-2 h-2 rounded-full ${loading ? "bg-amber-400 animate-pulse" : error ? "bg-red-400" : "bg-green-400"}`}
          />

          {/* Location Text */}
          <span className="text-xs text-slate-300 max-w-[120px] truncate font-medium">
            {loading ? "Mendeteksi..." : location.city}
          </span>

          {/* Separator */}
          <span className="w-px h-3 bg-slate-700 mx-1" />

          {/* Time */}
          <span className="text-xs font-bold text-[#F472B6]">{time}</span>
        </div>
      </div>

      {/* Navigation Items */}
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
