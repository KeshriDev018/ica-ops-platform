import useAuthStore from "../../store/authStore";

const Topbar = ({ onBurgerClick }) => {
  const { user } = useAuthStore();
  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between shadow-soft">
      <div className="flex items-center space-x-3">
        {/* Burger icon for mobile */}
        <button
          className="md:hidden mr-2 text-navy text-2xl focus:outline-none"
          aria-label="Open sidebar"
          onClick={onBurgerClick}
        >
          <span className="block w-7 h-1 bg-navy mb-1 rounded"></span>
          <span className="block w-7 h-1 bg-navy mb-1 rounded"></span>
          <span className="block w-7 h-1 bg-navy rounded"></span>
        </button>
        <img
          src="/LOGO.png"
          alt="Indian Chess Academy Logo"
          className="h-[48px] w-auto"
        />
        <h1 className="text-xl md:text-2xl font-secondary font-bold text-navy">
          Indian Chess Academy
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-navy">
            {user?.email || "User"}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {user?.role || "Role"}
          </p>
        </div>
        <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center">
          <span className="text-white font-bold">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
