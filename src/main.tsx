import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./ThemeProvider.tsx";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://50c74c2d19378cb18730c082d919ecca@o4509627268988928.ingest.de.sentry.io/4509627274887248",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </StrictMode>,
);
