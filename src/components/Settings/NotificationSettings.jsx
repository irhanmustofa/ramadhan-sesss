import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaBell,
  FaSpinner,
  FaVolumeUp,
  FaVolumeMute,
  FaStop,
  FaPlay,
} from "react-icons/fa";
import { getPrayerTimes } from "../../services/prayerApi";

export default function NotificationSettings({ prayerTimes, cityId }) {
  const [permission, setPermission] = useState("default");
  // ✅ FIX 4: Load state dari localStorage agar persisten
  const [adzanEnabled, setAdzanEnabled] = useState(() => {
    const saved = localStorage.getItem("notif_adzan_enabled");
    return saved ? JSON.parse(saved) : true;
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  // ✅ FIX 5: Ref untuk menyimpan timer IDs agar bisa di-cleanup (mencegah memory leak)
  const timerRefs = useRef([]);
  const audioRef = useRef(null);

  // Cleanup timers saat komponen unmount
  useEffect(() => {
    return () => {
      timerRefs.current.forEach(clearTimeout);
      timerRefs.current = [];

      // ✅ Stop audio saat unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Simpan ke localStorage setiap ada perubahan
  useEffect(() => {
    localStorage.setItem("notif_adzan_enabled", JSON.stringify(adzanEnabled));
  }, [adzanEnabled]);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      alert("Browser Anda tidak mendukung notifikasi");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        // ✅ FIX 6: Register SW lebih awal, tidak menunggu permission
        await registerServiceWorker();
        // Kirim data ke SW segera setelah permission granted
        sendPrayerTimesToSW();
        showTestNotification();
      }
    } catch (err) {
      console.error("Permission request failed:", err);
    }
  }, []);

  const registerServiceWorker = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;
    setIsRegistering(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      // Jika SW sudah active, kirim data
      if (registration.active) {
        sendPrayerTimesToSW(registration.active);
      } else {
        // Tunggu sampai SW active
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "activated" && prayerTimes?.jadwal) {
              sendPrayerTimesToSW(newWorker);
            }
          });
        });
      }
    } catch (err) {
      console.error("❌ SW registration failed:", err);
    } finally {
      setIsRegistering(false);
    }
  }, [prayerTimes, cityId]);

  // ✅ FIX 7: Fungsi helper untuk kirim data dengan struktur yang BENAR
  const sendPrayerTimesToSW = (worker = null) => {
    const target = worker || navigator.serviceWorker.controller;
    if (target && prayerTimes?.jadwal) {
      target.postMessage({
        type: "SET_PRAYER_TIMES",
        payload: {
          cityId,
          jadwal: prayerTimes.jadwal, // Pastikan key di sini sesuai dengan yang dipakai di logic
        },
      });
    }
  };

  const showTestNotification = useCallback(() => {
    if (Notification.permission !== "granted") return;
    new Notification("Notifikasi Sholat Aktif", {
      body: "Pengaturan berhasil disimpan. Anda akan menerima pengingat waktu sholat.",
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
    });
  }, []);

  // ✅ FIX 8: Logic penjadwalan di sisi Client (React) - Lebih andal untuk PWA
  const scheduleNotifications = useCallback(async () => {
    if (permission !== "granted") return;

    // Bersihkan timer lama
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];

    const location = localStorage.getItem("app_location");
    const cityId = JSON.parse(location).cityId;

    // ambil data jadwal sholat
    const dataPrayerTimes = await getPrayerTimes(cityId, new Date());

    const prayers = [
      { name: "Subuh", key: "subuh" },
      { name: "Dzuhur", key: "dzuhur" },
      { name: "Ashar", key: "ashar" },
      { name: "Maghrib", key: "maghrib" },
      { name: "Isya", key: "isya" },
    ];

    prayers.forEach(({ name, key }) => {
      const timeStr = dataPrayerTimes.jadwal[key]; // ✅ pakai data dari API
      if (timeStr) {
        scheduleSingleNotification(name, timeStr, key);
      }
    });
  }, [permission]);

  const scheduleSingleNotification = useCallback(
    (prayerName, prayerTime, prayerKey) => {
      const [hours, minutes] = prayerTime.split(":").map(Number);
      const now = new Date();
      const prayerDate = new Date(now);
      prayerDate.setHours(hours, minutes, 0, 0);

      if (prayerDate <= now) {
        prayerDate.setDate(prayerDate.getDate() + 1);
      }

      const delay = prayerDate.getTime() - now.getTime();

      const timerId = setTimeout(() => {
        showPrayerNotification(prayerName);
        // Reschedule rekursif untuk hari berikutnya
        scheduleSingleNotification(prayerName, prayerTime, prayerKey);
      }, delay);

      timerRefs.current.push(timerId);
    },
    [adzanEnabled],
  ); // Dependency adzanEnabled agar selalu update

  const showPrayerNotification = useCallback(
    (prayerName) => {
      if (Notification.permission !== "granted") return;

      if (adzanEnabled) {
        playAdzanSound();
      }

      new Notification(`Waktu Sholat ${prayerName}`, {
        body: `Sudah masuk waktu sholat ${prayerName}. Segeralah melaksanakan sholat.`,
        icon: "/icon-192x192.png",
        badge: "/badge-72x72.png",
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        tag: `prayer-${prayerName}`, // Mencegah spam notifikasi
      });
    },
    [adzanEnabled],
  );

  const playAdzanSound = useCallback(async (isTest = false) => {
    try {
      // Stop audio sebelumnya jika ada (mencegah overlap)
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio("/adzan.mp3");
      audio.volume = 0.5;

      // ✅ SIMPAN REFERENCE KE audioRef
      audioRef.current = audio;
      setIsPlaying(true);

      // Event saat audio selesai
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      // Event saat error
      audio.onerror = () => {
        console.error("❌ Gagal memutar audio");
        setIsPlaying(false);
        audioRef.current = null;
        if (isTest) alert("File adzan.mp3 tidak ditemukan di folder public/");
      };

      await audio.play();

      // Jika bukan mode test, langsung reset state (karena notifikasi otomatis)
      if (!isTest) {
        setIsPlaying(false);
        // Jangan null-kan audioRef jika ingin bisa di-stop manual,
        // atau biarkan null jika tidak perlu kontrol manual untuk notifikasi otomatis
      }
    } catch (err) {
      console.warn("⚠️ Audio autoplay blocked:", err.message);
      setIsPlaying(false);
      audioRef.current = null;
      if (isTest) {
        alert(
          "🔇 Suara diblokir browser. Silakan interaksi dengan halaman dulu.",
        );
      }
    }
  }, []);
  const stopAdzanSound = useCallback(() => {
    // ✅ GUNAKAN audioRef.current, bukan buat instance baru
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset ke awal (opsional)
      audioRef.current = null; // Hapus reference
      setIsPlaying(false); // Update UI state
    }
  }, []);

  const toggleAdzan = useCallback(() => {
    setAdzanEnabled((prev) => !prev);
  }, []);

  // Effect: Jalankan penjadwalan setiap data prayerTimes berubah
  // Pastikan kirim data ke SW saat app aktif
  useEffect(() => {
    if (permission === "granted" && prayerTimes?.jadwal) {
      // Kirim ke SW untuk scheduling background
      sendPrayerTimesToSW();

      // Juga schedule di main thread untuk saat app terbuka
      scheduleNotifications();
    }
  }, [permission, prayerTimes]);

  return (
    <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 text-center">
      {/* ... (Bagian Header Icon sama seperti kode asli Anda) ... */}
      <div className="w-16 h-16 rounded-full bg-pink-900/30 flex items-center justify-center mx-auto mb-4">
        <FaBell className="text-pink-400" size={28} />
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
          <div className="bg-pink-900/20 border border-pink-700/30 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 text-pink-400">
              <FaBell size={16} />
              <span className="text-sm font-semibold">Notifikasi Aktif</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Anda akan menerima notifikasi setiap waktu sholat
            </p>
          </div>

          <div className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-3">
              {adzanEnabled ? (
                <FaVolumeUp className="text-pink-400" />
              ) : (
                <FaVolumeMute className="text-slate-500" />
              )}
              <span className="text-sm text-slate-300">Suara Adzan</span>
            </div>

            <div className="flex items-center gap-2">
              {/* ✅ Tombol Tes Suara (Mini) */}
              {isPlaying ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Mencegah toggle berubah saat klik test
                    stopAdzanSound(); // true = mode test
                  }}
                  className="p-2 rounded-lg text-xs text-slate-400 hover:text-[#F472B6] hover:bg-slate-700/50 transition disabled:opacity-50 flex items-center gap-1"
                  title="Hentikan suara"
                >
                  <FaStop />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Mencegah toggle berubah saat klik test
                    playAdzanSound(true); // true = mode test
                  }}
                  disabled={isPlaying}
                  className="p-2 rounded-lg text-xs text-slate-400 hover:text-[#F472B6] hover:bg-slate-700/50 transition disabled:opacity-50 flex items-center gap-1"
                  title="Dengarkan contoh suara"
                >
                  <FaPlay />
                  <span>Test</span>
                </button>
              )}

              {/* Toggle Switch */}
              <button
                onClick={toggleAdzan}
                className={`w-12 h-6 rounded-full transition ${adzanEnabled ? "bg-pink-500" : "bg-slate-600"}`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition transform mt-0.5 ${
                    adzanEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
          {/* Manual Refresh Button */}
          <button
            onClick={() => {
              sendPrayerTimesToSW();
              scheduleNotifications();
            }}
            className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition border border-slate-700"
          >
            ♻️ Sinkronkan Ulang Jadwal
          </button>
        </div>
      ) : (
        <button
          onClick={requestPermission}
          disabled={isRegistering}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-pink-700 text-white font-semibold hover:from-pink-500 hover:to-pink-600 transition shadow-lg shadow-pink-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isRegistering ? (
            <>
              <FaSpinner className="animate-spin" size={16} /> Memproses...
            </>
          ) : (
            "Izinkan Akses Notifikasi"
          )}
        </button>
      )}
    </div>
  );
}
