import { Routes, Route } from "react-router-dom";
import "./App.css";
import { ToggleDarkMode } from "./components/ToggleDarkMode";
import { Toaster } from "./components/ui/toaster";
import { DarkBackground, LightBackground } from "./lib/backgrounds";
import { useTheme } from "./ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import WorkoutHistoryPage from "./pages/WorkoutHistoryPage";

function App() {
  const { theme } = useTheme();

  return (
    <AuthProvider>
      <div className="flex flex-col flex-grow">
        <div className="fixed left-0 top-0 -z-10 h-full w-full">
          {theme === "dark" ? <DarkBackground /> : <LightBackground />}
        </div>
        <ToggleDarkMode />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/history" element={<WorkoutHistoryPage />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
