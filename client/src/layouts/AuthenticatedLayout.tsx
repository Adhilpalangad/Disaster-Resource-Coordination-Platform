import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.js";
import TopNavbar from "./TopNavbar.js";
import Footer from "./Footer.js";

export const AuthenticatedLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "var(--bg, #F8FAFC)",
      }}
    >
      <Sidebar
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <TopNavbar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <main style={{ flex: 1 }}>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
