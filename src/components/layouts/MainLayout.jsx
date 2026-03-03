import { Outlet } from "react-router-dom";
import BottomNav from "../ui/BottomNav";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex justify-center">
      {/* MOBILE APP CONTAINER */}
      <div className="relative w-full min-h-screen bg-slate-950  text-white">
        {/* PAGE CONTENT */}
        <div className="pb-20">
          <Outlet />
        </div>

        {/* BOTTOM NAV */}
        <BottomNav />
      </div>
    </div>
  );
}
