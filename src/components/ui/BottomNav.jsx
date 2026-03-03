import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaBookOpen, FaFingerprint, FaHome, FaMoon } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";

const menus = [
  { to: "/", label: "Beranda", icon: <FaHome size={30} /> },
  { to: "/quran", label: "Qur'an", icon: <FaBookOpen size={30} /> },
  {
    to: "/dashboard",
    label: "Ramadhan",
    icon: <FaMoon size={30} />,
    highlight: true,
  },
  { to: "/dzikir", label: "Tasbih", icon: <FaFingerprint size={30} /> },
  { to: "/settings", label: "Pengaturan", icon: <FaGear size={30} /> },
];

export default function BottomNav() {
  const [time, setTime] = useState("");
  const [locationAllowed, setLocationAllowed] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationAllowed(true);
        },
        () => {
          setLocationAllowed(false);
        },
      );
    }

    // Update jam tiap detik
    const interval = setInterval(() => {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setTime(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
      {/* Jam kiri bawah */}

      <div className="absolute left-[5%] bottom-20 text-lg text-slate-400 max-w-3xl mx-auto bg-[#6D1E3A] px-2 py-1 rounded-full">
        {locationAllowed ? time : "Izinkan lokasi..."}
      </div>
      <div className="relative flex justify-around py-2 max-w-2xl mx-auto">
        {menus.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs mt-2 ${
                isActive ? "text-[#6D1E3A]" : "text-slate-400"
              }`
            }
          >
            {m.icon}
            <span className="mt-2">{m.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
