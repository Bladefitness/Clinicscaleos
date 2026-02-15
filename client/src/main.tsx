import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" attribute="class" storageKey="clinic-growth-theme">
    <App />
  </ThemeProvider>
);
