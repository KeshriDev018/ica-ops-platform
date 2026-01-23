import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import FloatingAssistant from "../chat/FloatingAssistant";
import { useState, useEffect } from "react";

const Layout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  // Handle window resize to auto-show sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    // Set initial state
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar for desktop, drawer for mobile */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        {/* Topbar with burger icon for mobile */}
        <Topbar onBurgerClick={() => setSidebarOpen((open) => !open)} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      {isAdminRoute && <FloatingAssistant />}
    </div>
  );
};

export default Layout;
