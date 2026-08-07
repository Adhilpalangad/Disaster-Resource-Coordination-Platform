import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.js";
import { AuthProvider }         from "./context/AuthContext.js";
import { NotificationProvider } from "./context/NotificationContext.js";
import { HelmetProvider }       from "react-helmet-async";
import { Toaster }              from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <NotificationProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 500,
              },
            }}
          />
        </NotificationProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>
);
