import React, { useState, useEffect, useCallback } from "react";
import { FaBell, FaSpinner } from "react-icons/fa";

export default function NotificationSettings({ prayerTimes, cityId }) {
  const [permission, setPermission] = useState("default");
  const [adzanEnabled, setAdzanEnabled] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  // Check permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      alert("Browser Anda tidak mendukung notifikasi");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        await registerServiceWorker();
        showTestNotification();
      }
    } catch (err) {
      console.error("Permission request failed:", err);
    }
  }, []);

  // Register service worker for background notifications
  const registerServiceWorker = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;

    setIsRegistering(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("✅ Service Worker registered:", registration);

      // Send prayer times to SW if active
      if (registration.active && prayerTimes?.jadwal) {
        registration.active.postMessage({
          type: "SET_PRAYER_TIMES",
          payload: {
            cityId,
            jadwal: prayerTimes.jadwal,
          },
        });
      }
    } catch (err) {
      console.error("❌ Service Worker registration failed:", err);
    } finally {
      setIsRegistering(false);
    }
  }, [prayerTimes, cityId]);

  // Show test notification
  const showTestNotification = useCallback(() => {
    if (Notification.permission !== "granted") return;

    new Notification("Notifikasi Sholat Aktif", {
      body: "Anda akan menerima notifikasi waktu sholat",
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
    });
  }, []);

  // Schedule notifications for all prayers
  const scheduleNotifications = useCallback(async () => {
    if (permission !== "granted" || !prayerTimes?.jadwal) return;

    const prayers = [
      { name: "Subuh", key: "subuh" },
      { name: "Dzuhur", key: "dzuhur" },
      { name: "Ashar", key: "ashar" },
      { name: "Maghrib", key: "maghrib" },
      { name: "Isya", key: "isya" },
    ];

    prayers.forEach(({ name, key }) => {
      if (prayerTimes.jadwal[key]) {
        scheduleSingleNotification(name, prayerTimes.jadwal[key]);
      }
    });
  }, [permission, prayerTimes]);

  // Schedule single prayer notification
  const scheduleSingleNotification = useCallback((prayerName, prayerTime) => {
    const [hours, minutes] = prayerTime.split(":").map(Number);
    const now = new Date();
    const prayerDate = new Date(now);
    prayerDate.setHours(hours, minutes, 0, 0);

    if (prayerDate <= now) {
      prayerDate.setDate(prayerDate.getDate() + 1);
    }

    const delay = prayerDate.getTime() - now.getTime();

    setTimeout(() => {
      showPrayerNotification(prayerName);
      // Reschedule for next day
      scheduleSingleNotification(prayerName, prayerTime);
    }, delay);
  }, []);

  // Show prayer notification with optional adzan
  const showPrayerNotification = useCallback(
    (prayerName) => {
      if (Notification.permission !== "granted") return;

      // Play adzan if enabled
      if (adzanEnabled) {
        playAdzanSound();
      }

      new Notification(`Waktu Sholat ${prayerName}`, {
        body: `Sudah masuk waktu sholat ${prayerName}. Segeralah melaksanakan sholat.`,
        icon: "/icon-192x192.png",
        badge: "/badge-72x72.png",
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        actions: [
          { action: "snooze", title: "Snooze 5 menit" },
          { action: "dismiss", title: "Tutup" },
        ],
      });
    },
    [adzanEnabled],
  );

  // Play adzan sound
  const playAdzanSound = useCallback(() => {
    const audio = new Audio("/adzan.mp3");
    audio.play().catch((err) => {
      console.warn("⚠️ Failed to play adzan:", err.message);
    });
  }, []);

  // Toggle adzan setting
  const toggleAdzan = useCallback(() => {
    setAdzanEnabled((prev) => !prev);
  }, []);

  // Handle notification click (for service worker)
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "NOTIFICATION_CLICK") {
          // Handle action from notification
          if (event.data.action === "snooze") {
            // Snooze logic here
            console.log("🔕 Snoozed for 5 minutes");
          } else {
            // Open app
            window.focus();
          }
        }
      });
    }
  }, []);

  return (
    <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
        <FaBell className="text-emerald-400" size={28} />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">
        Aktifkan Notifikasi Sholat
      </h3>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">
        Untuk mendapatkan pengingat waktu sholat yang akurat, mohon izinkan
        akses notifikasi pada perangkat Anda.
      </p>

      {permission === "granted" ? (
        <div className="space-y-3">
          <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <FaBell size={16} />
              <span className="text-sm font-semibold">Notifikasi Aktif</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Anda akan menerima notifikasi setiap waktu sholat
            </p>
          </div>

          {/* Adzan Toggle */}
          <button
            onClick={toggleAdzan}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/30 transition"
          >
            <span className="text-sm text-slate-300">Suara Adzan</span>
            <div
              className={`w-12 h-6 rounded-full transition ${
                adzanEnabled ? "bg-emerald-500" : "bg-slate-600"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition transform mt-0.5 ${
                  adzanEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </button>

          {/* Schedule Button */}
          <button
            onClick={scheduleNotifications}
            className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition"
          >
            Jadwalkan Notifikasi
          </button>
        </div>
      ) : (
        <button
          onClick={requestPermission}
          disabled={isRegistering}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold hover:from-emerald-500 hover:to-emerald-600 transition shadow-lg shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isRegistering ? (
            <>
              <FaSpinner className="animate-spin" size={16} />
              Memproses...
            </>
          ) : (
            "Izinkan Akses Notifikasi"
          )}
        </button>
      )}
    </div>
  );
}
