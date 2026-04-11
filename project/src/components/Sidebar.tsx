import { LayoutDashboard, Receipt, Tags, Bell, Settings, TrendingUp, LogOut, Home, Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobile = false,
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "transactions", label: "Transactions", icon: Receipt },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "reminders", label: "Reminders", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800`}>
      {/* Brand Header */}
      <div className={`${isMobile ? "p-4" : "p-6"} border-b border-slate-100 dark:border-slate-800`}>
        <Link to="/" className="flex items-center gap-3 group mb-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-transform group-hover:scale-110">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            PayAware
          </span>
        </Link>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1 mt-4">
          Dashboard Menu
        </p>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto scrollbar-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}>
              <Icon className="h-5 w-5" />
              <span className="font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <Link
          to="/"
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold"
        >
          <Home className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-semibold"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
