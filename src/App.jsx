// src/App.jsx
import AppRoutes from "./app/routes";
import InstallPrompt from "./components/InstallPrompt";
import { LocationProvider } from "./context/LocationContext"; // Import provider

export default function App() {
  return (
    <LocationProvider>
      {" "}
      {/* Bungkus dengan Provider */}
      <div className="min-h-screen bg-black flex justify-center">
        {/* MOBILE APP FRAME */}
        <div className="relative w-full min-h-screen bg-slate-950 text-white overflow-hidden">
          <InstallPrompt />
          <AppRoutes />
        </div>
      </div>
    </LocationProvider>
  );
}
