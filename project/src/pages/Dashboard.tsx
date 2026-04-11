import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import DashboardContent from "../components/DashboardContent";
import TransactionModal from "../components/TransactionModal";
import MobileBottomNav from "../components/MobileBottomNav";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab from URL path
  const getTabFromPath = (path: string) => {
    const p = path.replace('/', '');
    return ['analytics', 'transactions', 'categories', 'settings', 'reminders'].includes(p) ? p : 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState(getTabFromPath(location.pathname));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<any>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Sync state with URL changes
  useEffect(() => {
    setActiveTabState(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const setActiveTab = (tab: string) => {
    navigate(tab === 'dashboard' ? '/dashboard' : `/${tab}`);
    setActiveTabState(tab);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleMenuItemClick = (tab: string) => {
    setActiveTab(tab);
    setShowMobileMenu(false); // Close menu when item is clicked
  };

  return (
    <div className="md:h-[calc(100vh-70px)] min-h-[calc(100vh-70px)] bg-gray-50 flex flex-col md:overflow-hidden overflow-y-auto">
      {/* Mobile Header - Always visible at top */}
      <div className="md:hidden sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent capitalize">
            {activeTab === 'dashboard' ? 'Overview' : activeTab}
          </h1>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle menu">
            {showMobileMenu ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 h-full">
        {/* Desktop Sidebar */}
        <div className="w-64 bg-white shadow-lg h-full">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        {/* Desktop Main Content - Scrollable */}
        <main className="flex-1 h-full overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <DashboardContent
              activeTab={activeTab}
              setIsModalOpen={setIsModalOpen}
              setModalInitialData={setModalInitialData}
            />
          </div>
        </main>
      </div>

      {/* Mobile Layout - With bottom navigation */}
      <div className="md:hidden min-h-screen bg-gray-50 pb-32">
        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Mobile Menu - Slide from right */}
            <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
              {/* Menu Header */}
              <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close menu">
                  <X className="h-6 w-6 text-gray-700" />
                </button>
              </div>

              {/* Menu Content */}
              <div className="h-full">
                <Sidebar
                  activeTab={activeTab}
                  setActiveTab={handleMenuItemClick}
                  isMobile={true}
                />
              </div>
            </div>
          </>
        )}

        {/* Mobile Main Content - Normal Scroll Flow */}
        <main className="w-full">
          <div className="p-3">
            <DashboardContent
              activeTab={activeTab}
              setIsModalOpen={setIsModalOpen}
              setModalInitialData={setModalInitialData}
            />
          </div>
        </main>

        {/* Mobile Bottom Navigation - Fixed at bottom */}
        <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setModalInitialData(null); }}
        initialData={modalInitialData}
      />
    </div>
  );
};

export default Dashboard;
