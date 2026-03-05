import React, { useState, useEffect } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// ✅ Import CSS
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

export default function SirahNabi() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // ✅ Gunakan PDF yang valid
  const pdfUrl = "/pdf/sirah-nabi.pdf";

  const handleDocumentLoad = () => setIsLoading(false);
  const handleDocumentError = (err) => {
    console.error("PDF Error:", err);
    setError("Gagal memuat dokumen");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col max-w-xl mx-auto">
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0f172a] via-[#1e1b3a] to-[#0f172a] border-b border-[#F472B6]/20 backdrop-blur-md shadow-lg shadow-[#6D1E3A]/10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Back Button + Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="w-8 h-8 rounded-full bg-[#6D1E3A]/30 flex items-center justify-center text-[#F472B6] hover:bg-[#6D1E3A]/50 transition"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              <div>
                <h1 className="text-lg font-bold text-white leading-tight">
                  Sirah Nabawiyah
                </h1>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F472B6] animate-pulse" />
                  Kisah Hidup Rasulullah ﷺ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#F472B6]/50 to-transparent" />
      </header>

      <div className="flex-1 relative mt-[100px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-[#F472B6] rounded-full animate-spin" />
          </div>
        )}

        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
        </Worker>
      </div>
    </div>
  );
}
