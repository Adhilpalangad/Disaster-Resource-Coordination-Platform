import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.js";
import { AuthProvider }         from "./context/AuthContext.js";
import { NotificationProvider } from "./context/NotificationContext.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>
);
