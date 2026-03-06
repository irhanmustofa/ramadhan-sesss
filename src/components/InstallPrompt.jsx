// components/InstallPrompt.jsx
import { useState, useEffect } from "react";
import {
  FaDownload,
  FaTimes,
  FaStar,
  FaShare,
  FaPlus,
  FaSafari,
} from "react-icons/fa";
import { usePWAInstall } from "../hook/usePWAInstall";

export default function InstallPrompt() {
  const { isInstallable, isInstalled, isIOS, install, debug } = usePWAInstall();
  const [visible, setVisible] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    console.log("🔍 InstallPrompt state:", {
      isInstallable,
      isInstalled,
      isIOS,
      deferredPrompt: debug.deferredPrompt,
    });

    // Tampilkan prompt jika:
    // 1. Bisa di-install (Android/Chrome) ATAU
    // 2. iOS (tampilkan instruksi manual)
    if (!isInstalled && (isInstallable || isIOS)) {
      // Delay 3 detik agar user tidak kaget
      const timer = setTimeout(() => {
        setVisible(true);
        console.log("✨ InstallPrompt visible: true");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isIOS, debug]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    const success = await install();
    if (success) setVisible(false);
  };

  // Jangan render jika sudah terinstall atau tidak memenuhi syarat
  if (isInstalled || (!isInstallable && !isIOS) || !visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-slate-700 max-w-xs">
        {/* Header + Close Button */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#F472B6]/20 rounded-lg">
              <FaDownload className="text-[#F472B6]" size={16} />
            </div>
            <h4 className="text-white font-semibold text-sm">
              Pasang Aplikasi
            </h4>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="p-1 text-slate-400 hover:text-white transition"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Content: Android vs iOS */}
        {!showIOSInstructions ? (
          <>
            <p className="text-slate-300 text-xs mb-3 leading-relaxed">
              {isIOS
                ? "Untuk iPhone/iPad, gunakan menu Share untuk menambahkan ke Home Screen."
                : "Pasang aplikasi untuk akses cepat, notifikasi, dan pengalaman offline."}
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {["⚡ Cepat", "🔔 Notifikasi", "📱 Offline"].map((feat) => (
                <span
                  key={feat}
                  className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300"
                >
                  {feat}
                </span>
              ))}
            </div>

            {/* Action Button */}
            <button
              onClick={handleInstall}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                isIOS
                  ? "bg-slate-800 text-white hover:bg-slate-700"
                  : "bg-[#F472B6] text-white hover:bg-[#F472B6]/90 active:scale-95"
              }`}
            >
              {isIOS ? (
                <>
                  <FaShare size={12} />
                  Buka Menu Share
                </>
              ) : (
                <>
                  <FaStar size={12} />
                  Pasang Sekarang
                </>
              )}
            </button>
          </>
        ) : (
          // iOS Instructions
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <FaSafari className="text-blue-400" />
              <span>
                Klik ikon <FaShare size={12} className="inline" /> di Safari
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <FaPlus className="text-emerald-400" />
              <span>Pilih "Tambahkan ke Layar Utama"</span>
            </div>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition"
            >
              ← Kembali
            </button>
          </div>
        )}

        {/* Debug Info (Hanya di development) */}
        {import.meta.env.DEV && (
          <details className="mt-3 pt-3 border-t border-slate-700">
            <summary className="text-[10px] text-slate-500 cursor-pointer">
              Debug Info
            </summary>
            <pre className="text-[9px] text-slate-600 mt-1 overflow-x-auto">
              {JSON.stringify(
                {
                  isInstallable,
                  isInstalled,
                  isIOS,
                  hasPrompt: debug.deferredPrompt,
                },
                null,
                2,
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
