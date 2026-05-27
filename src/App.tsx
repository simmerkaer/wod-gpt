import { Routes, Route } from "react-router-dom";
import "./App.css";
import { ToggleDarkMode } from "./components/ToggleDarkMode";
import { PaymentIssueBanner } from "./components/billing/PaymentIssueBanner";
import { SiteFooter } from "./components/SiteFooter";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { CookieConsentProvider } from "./hooks/useCookieConsent";
import { Toaster } from "./components/ui/toaster";
import { DarkBackground, LightBackground } from "./lib/backgrounds";
import { useTheme } from "./ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { WeightUnitProvider } from "./contexts/WeightUnitContext";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import WorkoutHistoryPage from "./pages/WorkoutHistoryPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";

function App() {
  const { theme } = useTheme();

  return (
    <AuthProvider>
      <WeightUnitProvider>
      <CookieConsentProvider>
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
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
          </Routes>
        </main>
        <SiteFooter />
        <CookieConsentBanner />
        <Toaster />
      </div>
      </CookieConsentProvider>
      </WeightUnitProvider>
    </AuthProvider>
  );
}

export default App;
