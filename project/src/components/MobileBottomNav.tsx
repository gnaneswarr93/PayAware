import { LayoutDashboard, Receipt, Tags, Settings, TrendingUp } from "lucide-react";

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const menuItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "transactions", label: "Logs", icon: Receipt },
    { id: "categories", label: "Tags", icon: Tags },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-700 shadow-2xl rounded-2xl p-2 flex justify-between items-center px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50 scale-110 -translate-y-2"
                  : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              }`}>
              <Icon
                className={`h-5 w-5 transition-transform duration-300 ${
                  isActive ? "scale-110" : ""
                }`}
              />
              {isActive && (
                <span className="absolute -bottom-6 text-[10px] font-bold text-blue-600 dark:text-blue-400 opacity-0 animate-fade-in-up">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
