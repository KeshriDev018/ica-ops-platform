import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getNavItems = () => {
    switch (role) {
      case "ADMIN":
        return [
          { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/admin/students", label: "Students", icon: "👥" },
          { path: "/admin/demos", label: "Demos", icon: "📅" },
          { path: "/admin/coaches", label: "Coaches", icon: "🎓" },
          { path: "/admin/coach-payouts", label: "Coach Payouts", icon: "💵" },
          { path: "/admin/batches", label: "Batches", icon: "📚" },
          { path: "/admin/subscriptions", label: "Subscriptions", icon: "💰" },
          { path: "/admin/payments", label: "Payments", icon: "💳" },
          { path: "/admin/analytics", label: "Analytics", icon: "📈" },
          { path: "/admin/intelligence", label: "Intelligence", icon: "🧠" },
          { path: "/admin/chat", label: "Chat", icon: "💬" },
          { path: "/admin/broadcasts", label: "Broadcasts", icon: "📢" },
        ];
      case "COACH":
        return [
          { path: "/coach/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/coach/profile", label: "Profile", icon: "👤" },
          { path: "/coach/demos", label: "Demos", icon: "📅" },
          { path: "/coach/batches", label: "Batches", icon: "📚" },
          { path: "/coach/classes", label: "Classes", icon: "🎓" },
          { path: "/coach/students", label: "Students", icon: "👥" },
          { path: "/coach/calendar", label: "Calendar", icon: "📅" },
          { path: "/coach/payouts", label: "Payouts", icon: "💵" },
          { path: "/coach/materials", label: "Materials", icon: "📄" },
          { path: "/coach/chat", label: "Messages", icon: "💬" },
          { path: "/coach/broadcasts", label: "Announcements", icon: "📢" },
        ];
      case "CUSTOMER":
        return [
          { path: "/customer/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/customer/classes", label: "My Classes", icon: "📚" },
          { path: "/customer/coach", label: "My Coach", icon: "🎓" },
          { path: "/customer/batch", label: "My Batch", icon: "👥" },
          { path: "/customer/schedule", label: "Schedule", icon: "📅" },
          { path: "/customer/batch-chat", label: "Batch Chat", icon: "💬" },
          { path: "/customer/broadcasts", label: "Announcements", icon: "📢" },
          { path: "/customer/materials", label: "Materials", icon: "📄" },
          { path: "/customer/payments", label: "Payments", icon: "💳" },
          { path: "/customer/profile", label: "Profile", icon: "👤" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        ></div>
      )}
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-64 bg-navy text-white min-h-screen py-6 flex flex-col transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:static md:translate-x-0 md:flex`}
        style={{ maxWidth: 256 }}
      >
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src="/LOGO.png"
              alt="Chess Academy Logo"
              className="h-[64px] w-auto"
            />
            <span className="text-xl font-secondary font-bold">
              Chess Academy
            </span>
          </div>
          {/* Close button for mobile */}
          <button
            className="md:hidden text-white text-2xl focus:outline-none"
            aria-label="Close sidebar"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <nav className="px-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-orange text-white"
                        : "text-gray-300 hover:bg-navy/80 hover:text-white"
                    }`}
                    onClick={onClose}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto pt-6 px-4 border-t border-navy/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
