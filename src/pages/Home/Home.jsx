import { useState } from "react";
import { FaMosque, FaFingerprint } from "react-icons/fa";
import PrayerTimes from "./elements/PrayerTimes";
import { FaStar, FaHandsPraying, FaBookQuran } from "react-icons/fa6";
import { Link } from "react-router";
import HomeHeader from "./elements/HomeHeader";
import FindLocation from "../../components/FindLocation";
export default function Home() {
  return (
    <div className="px-4 pt-6 pb-24 space-y-6 max-w-2xl mx-auto">
      {/* HEADER */}
      <HomeHeader />

      {/* PROMO CARD */}
      <div className="rounded-2xl p-4 bg-gradient-to-br from-[#6D1E3A] to-[#0f172a]">
        <p className="text-xs text-[#F472B6] font-medium">
          Menata Hati, Menguatkan Iman
        </p>
        <h2 className="font-semibold mt-1">RAMADHAN SESSS</h2>
        <p className="text-xs text-white/70 mt-1">
          Satu aplikasi, banyak kebaikan. Atur waktu ibadah, baca ayat, dan
          renungkan makna Ramadhan dengan cara yang simpel dan nyaman.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 grid-cols-2 gap-3">
        {/* ASMAUL HUSNA */}
        <Link
          to="/asmaul-husna"
          className="group relative overflow-hidden rounded-2xl p-4 ring-1 ring-white/10 hover:ring-[#F472B6]/50 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#F472B6]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:bg-[#F472B6]/20 transition-colors">
              <FaStar className="text-[#F472B6] text-lg" />
            </div>
            <h3 className="font-semibold text-white text-sm">Asmaul Husna</h3>
            <p className="text-[10px] text-slate-400 mt-1">99 Nama Allah</p>
          </div>
        </Link>

        {/* DOA-DOA PILIHAN */}
        <Link
          to="/doa"
          className="group relative overflow-hidden rounded-2xl p-4 ring-1 ring-white/10 hover:ring-[#F472B6]/50 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#F472B6]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:bg-[#F472B6]/20 transition-colors">
              <FaHandsPraying className="text-[#F472B6] text-lg" />
            </div>
            <h3 className="font-semibold text-white text-sm">Doa Pilihan</h3>
            <p className="text-[10px] text-slate-400 mt-1">Doa sehari-hari</p>
          </div>
        </Link>

        {/* DZIKIR */}
        <Link
          to="/dzikir"
          className="group relative overflow-hidden rounded-2xl p-4 ring-1 ring-white/10 hover:ring-[#F472B6]/50 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#F472B6]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:bg-[#F472B6]/20 transition-colors">
              <FaFingerprint className="text-[#F472B6] text-lg" />
            </div>
            <h3 className="font-semibold text-white text-sm">Dzikir</h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Hitung & baca dzikir
            </p>
          </div>
        </Link>

        {/* SIRAH NABAWIYAH */}
        <Link
          to="/sirah-nabi"
          className="group relative overflow-hidden rounded-2xl p-4 ring-1 ring-white/10 hover:ring-[#F472B6]/50 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#F472B6]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:bg-[#F472B6]/20 transition-colors">
              <FaBookQuran className="text-[#F472B6] text-lg" />
            </div>
            <h3 className="font-semibold text-white text-sm">Sirah Nabi</h3>
            <p className="text-[10px] text-slate-400 mt-1">Kisah Rasulullah</p>
          </div>
        </Link>
      </div>

      {/* JADWAL SHOLAT */}
      <div className="rounded-2xl p-4 bg-white/5 ring-1 ring-white/10">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Jadwal Sholat Hari Ini</h3>

          {/* Tombol Cari Masjid Terdekat */}
          <FindLocation />
        </div>

        <PrayerTimes />
      </div>
    </div>
  );
}
