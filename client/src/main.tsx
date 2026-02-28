import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";

// Initialize i18n before rendering
import "./i18n";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
