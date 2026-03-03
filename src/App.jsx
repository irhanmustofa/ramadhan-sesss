import AppRoutes from "./app/routes";

export default function App() {
  return (
    <div className="min-h-screen bg-black flex justify-center">
      {/* MOBILE APP FRAME */}
      <div className="relative w-full min-h-screen bg-slate-950 text-white overflow-hidden">
        <AppRoutes />
      </div>
    </div>
  );
}
