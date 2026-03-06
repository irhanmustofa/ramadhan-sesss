// src/context/LocationContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
// Import service API Anda
import {
  getCityNameFromCoords,
  searchCityInMyQuran,
} from "../services/prayerApi";

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [location, setLocation] = useState({
    city: "", // Default value
    cityId: "",
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Cek LocalStorage dulu (Cache)
    const cached = localStorage.getItem("app_location");
    if (cached) {
      const parsed = JSON.parse(cached);
      // Jika data masih segar (opsional: tambahkan cek timestamp jika perlu)
      setLocation(parsed);
      setLoading(false);
      return;
    }

    // 2. Jika tidak ada cache, request Geolocation
    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Fetch nama kota
          const cityName = await getCityNameFromCoords(latitude, longitude);
          const cityIdGet = await searchCityInMyQuran(cityName);
          const cityId = cityIdGet?.[0].id;
          const newLocation = {
            city: cityName ? cityName.toUpperCase() : "LOKASI ANDA",
            cityId,
            latitude,
            longitude,
          };

          // Update State & LocalStorage
          setLocation(newLocation);
          localStorage.setItem("app_location", JSON.stringify(newLocation));
        } catch (err) {
          console.warn("⚠️ Failed to get city name:", err);
          // Fallback
          setLocation((prev) => ({ ...prev, city: "" }));
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.warn("⚠️ Geolocation error:", err.message);
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  // Fungsi manual untuk refresh lokasi
  const refreshLocation = () => {
    setLoading(true);
    localStorage.removeItem("app_location"); // Hapus cache lama
    window.location.reload(); // Reload sederhana atau panggil ulang logika geolocation
  };

  return (
    <LocationContext.Provider
      value={{ location, loading, error, refreshLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context)
    throw new Error("useLocationContext must be used within LocationProvider");
  return context;
}
