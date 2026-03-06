import { useEffect, useState } from "react";
import { FaGoogle, FaSpinner } from "react-icons/fa";
import { initGoogleLogin, triggerGoogleLogin } from "./googleAuth";

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const initInterval = setInterval(() => {
      if (window.google) {
        initGoogleLogin(handleLoginSuccess);
        clearInterval(initInterval);
      }
    }, 100);

    return () => clearInterval(initInterval);
  }, []);

  const handleLoginSuccess = (user) => {
    setLoading(false);
    window.location.href = "/";
  };

  const handleGoogleClick = async () => {
    setLoading(true);
    try {
      triggerGoogleLogin();
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      disabled={loading}
      className="group relative flex items-center justify-center gap-3 px-5 py-2.5 
                 rounded-full bg-slate-800/50 border border-slate-700 
                 hover:border-[#F472B6]/50 hover:bg-slate-800 
                 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
      aria-label="Login dengan Google"
    >
      {/* Glow effect on hover */}
      <span
        className="absolute inset-0 rounded-full bg-[#F472B6]/10 opacity-0 
                       group-hover:opacity-100 transition-opacity blur-xl"
      />

      {/* Icon */}
      <span className="relative z-10">
        {loading ? (
          <FaSpinner className="animate-spin text-[#F472B6]" size={18} />
        ) : (
          <FaGoogle
            className="text-slate-300 group-hover:text-[#F472B6] transition-colors"
            size={18}
          />
        )}
      </span>

      {/* Text - opsional, bisa di-hide untuk lebih minimal */}
      <span
        className="relative z-10 text-sm font-medium text-slate-300 
                       group-hover:text-white transition-colors"
      >
        {loading ? "Memproses..." : "Google"}
      </span>
    </button>
  );
}
