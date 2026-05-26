import { Routes, Route } from "react-router-dom";
import "./App.css";
import { ToggleDarkMode } from "./components/ToggleDarkMode";
import { PaymentIssueBanner } from "./components/billing/PaymentIssueBanner";
import { Toaster } from "./components/ui/toaster";
import { DarkBackground, LightBackground } from "./lib/backgrounds";
import { useTheme } from "./ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { WeightUnitProvider } from "./contexts/WeightUnitContext";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import WorkoutHistoryPage from "./pages/WorkoutHistoryPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function App() {
  const { theme } = useTheme();

  return (
    <AuthProvider>
      <WeightUnitProvider>
      <div className="flex flex-col flex-grow">
        <div className="fixed left-0 top-0 -z-10 h-full w-full">
          {theme === "dark" ? <DarkBackground /> : <LightBackground />}
        </div>
        <ToggleDarkMode />
        <PaymentIssueBanner />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/history" element={<WorkoutHistoryPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Routes>
        </main>
        <Toaster />
      </div>
      </WeightUnitProvider>
    </AuthProvider>
  );
}

export default App;
