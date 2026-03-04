import { Outlet } from "react-router-dom";
import BottomNav from "../ui/BottomNav";

export default function MainLayout() {
  return (
    // Hapus flex dan justify-center agar tidak mengganggu scroll
    <div className="min-h-screen bg-slate-950 text-white">
      {/* PAGE CONTENT - Pastikan ini direct parent dari Outlet */}
      <div className="pb-20">
        <Outlet />
      </div>

      {/* BOTTOM NAV - Fixed di bawah */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <BottomNav />
      </div>
    </div>
  );
}
