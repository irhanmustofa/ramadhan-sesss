import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home/Home";
import SurahList from "../pages/Quran/SurahList";
import SurahDetail from "../pages/Quran/SurahDetail";
import QuranHome from "../pages/Quran/QuranHome";
import MainLayout from "../components/layouts/MainLayout";
import AsmaulHusna from "../pages/AsmaulHusna/AsmaulHusna";
import Doa from "../pages/Doa/Doa";
import DzikirCounter from "../pages/Dzikir/DzikirCounter";
import SirahNabi from "../pages/Doa/SirahNabi";
import RamadhanHome from "../pages/Ramadhan/RamadhanHome";
import Setting from "../pages/Setting/Setting";

export default function AppRoutes() {
  const isLoggedIn = !!localStorage.getItem("auth");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" /> : <Login />}
        />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/quran" element={<QuranHome />} />
          <Route path="/quran/surah/:number" element={<SurahDetail />} />
          <Route path="/asmaul-husna" element={<AsmaulHusna />} />
          <Route path="/asmaul-husna" element={<AsmaulHusna />} />
          <Route path="/doa" element={<Doa />} />
          <Route path="/dzikir" element={<DzikirCounter />} />
          <Route path="/sirah-nabi" element={<SirahNabi />} />
          <Route path="/dashboard" element={<RamadhanHome />} />
          <Route path="/settings" element={<Setting />} />
          {/* <Route path="/profile" element={<Profile />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
