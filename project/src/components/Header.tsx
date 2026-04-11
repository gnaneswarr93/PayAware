import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Shield } from "lucide-react";
import { transactionService } from "../services/transactionService";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  React.useEffect(() => {
      const fetchBalance = async () => {
          if (user) {
             try {
                const summary = await transactionService.getFinancialSummary(user.id);
                setBalance(summary.balance);
             } catch (e) { console.error(e); }
          }
      };
      
      fetchBalance();
      const interval = setInterval(fetchBalance, 3000);
      return () => clearInterval(interval);
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/features", label: "Features" },
    ...(user ? [
        { path: "/dashboard", label: "Dashboard" }
    ] : []),
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];
  
  const handleLogout = async () => {
      await signOut();
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-white/20 dark:border-slate-800 shadow-sm"></div>
        <div className="container mx-auto px-4 sm:px-6 py-4 relative">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
               <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 group-hover:scale-110 transition-transform duration-300">
                 <Shield className="h-5 w-5" />
               </div>
               <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                 PayAware
               </span>
            </Link>
            
            {/* Balance Display (Only if logged in) */}
            {user && (
                <div className="hidden sm:flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 pl-3 pr-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">₹{balance.toLocaleString('en-IN')}</span>
                </div>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-all duration-200 hover:text-indigo-600 dark:hover:text-indigo-400 relative group ${
                    isActive(item.path) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300"
                  }`}>
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full ${isActive(item.path) ? 'w-full' : ''}`}></span>
                </Link>
              ))}
              
              {!user ? (
                  <Link to="/login" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm">
                    Sign In
                  </Link>
              ) : (
                  <button onClick={handleLogout} className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors">
                    Sign Out
                  </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={closeMenu} />
        
        {/* Menu Panel */}
        <nav className={`absolute top-0 right-0 h-full w-[280px] bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-lg text-slate-900 dark:text-white">Menu</span>
              <button onClick={closeMenu} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-4 space-y-2 flex-1 overflow-y-auto">
              {navItems.map((item, idx) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMenu}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  style={{ animation: isMenuOpen ? `fadeInUp 0.3s ease-out forwards ${idx * 0.05}s` : 'none', opacity: 0 }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
               {!user ? (
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="flex w-full items-center justify-center bg-indigo-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                    Sign In
                  </Link>
                ) : (
                  <button
                    onClick={() => { handleLogout(); closeMenu(); }}
                    className="flex w-full items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl font-semibold"
                  >
                    Sign Out
                  </button>
                )}
            </div>
        </nav>
      </div>
    </>
  );
};

export default Header;
