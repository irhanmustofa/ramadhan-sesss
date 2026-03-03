import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home/Home";
import SurahList from "../pages/Quran/SurahList";
import SurahDetail from "../pages/Quran/SurahDetail";
import QuranHome from "../pages/Quran/QuranHome";
import MainLayout from "../components/layouts/MainLayout";

export default function AppRoutes() {
  const isLoggedIn = !!localStorage.getItem("auth");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" /> : <Login />}
        />
        <Route element={isLoggedIn ? <MainLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Home />} />
          <Route path="/quran" element={<QuranHome />} />
          <Route path="/quran/surah/:number" element={<SurahDetail />} />
          {/* <Route path="/profile" element={<Profile />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
