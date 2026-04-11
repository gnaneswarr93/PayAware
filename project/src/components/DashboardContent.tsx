import React from 'react';

import BalanceCard from './BalanceCard';
import CategoryCard from './CategoryCard';
import TransactionHistory from './TransactionHistory';
import ExpenseChart from './ExpenseChart';
import { Plus, TrendingUp, TrendingDown, DollarSign, Mic, Sparkles, Zap, ArrowUpRight } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { supabase } from '../lib/supabase';

import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { SearchFilterBar, useFilteredTransactions, FilterOptions } from './SearchFilterBar';
import { notificationService } from '../services/notificationService';
import { Capacitor } from '@capacitor/core';

interface DashboardContentProps {
  activeTab: string;
  setIsModalOpen: (open: boolean) => void;
  setModalInitialData?: (data: any) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ activeTab, setIsModalOpen, setModalInitialData }) => {
  const { user } = useAuth();
  const [isListening, setIsListening] = React.useState(false);

  /* Voice Entry Logic */
  const handleVoiceEntry = () => {
    if (!('webkitSpeechRecognition' in window)) {
         alert("Voice logging requires Chrome or Edge.");
         return;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-IN'; 
    recognition.continuous = false;
    recognition.interimResults = false;
 
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const amountMatch = transcript.match(/(\d+)/); 
        const amount = amountMatch ? amountMatch[0] : '';
        const isCash = transcript.toLowerCase().includes('cash');
        
        if (setModalInitialData) {
            setModalInitialData({
                amount: amount,
                purpose: transcript,
                location: '',
                paymentMode: isCash ? 'Cash' : 'Online'
            });
            setIsModalOpen(true);
        }
    };
    
    recognition.onerror = () => {
        setIsListening(false);
        alert("Voice recognition failed. Please try again.");
    };
    
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
 };

/* ... existing logic ... */




  /* IPC Removed: Fetched from Supabase now */
  /*
  const ipcRenderer = window.require ? window.require('electron').ipcRenderer : {
      invoke: () => Promise.resolve([]),
      on: () => {},
      removeAllListeners: () => {}
  };
  */

  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [summary, setSummary] = React.useState({ balance: 0, income: 0, expense: 0 });

  const [forecastData, setForecastData] = React.useState<any[]>([]);
  const [forecastPeriod, setForecastPeriod] = React.useState<'W' | 'M'>('W');

  // Load Forecast
  React.useEffect(() => {
      if (activeTab === 'analytics' && transactions.length > 0) {
          api.getForecast(transactions.map(t => ({ amount: Number(t.amount), date: t.date })), forecastPeriod)
             .then(data => {
                 if (data && data.full_data) setForecastData(data.full_data);
             });
      }
  }, [activeTab, transactions, forecastPeriod]);

  const [remindersEnabled, setRemindersEnabled] = React.useState(() => {
      return localStorage.getItem('payaware_reminders') === 'true';
  });

  const [reminderTime, setReminderTime] = React.useState<string>(() => {
      return localStorage.getItem('reminder_time') || '12:05';
  });

  const handleReminderTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = e.target.value;
      setReminderTime(newTime);
      localStorage.setItem('reminder_time', newTime);
  };

  const [monthlyBudget, setMonthlyBudget] = React.useState(() => {
    return Number(localStorage.getItem('payaware_budget')) || 20000;
  });

  const [hasSmsPermission, setHasSmsPermission] = React.useState<boolean | null>(null);

  // Check SMS permission on mount if on native
  React.useEffect(() => {
      const isNative = Capacitor.isNativePlatform();
      const smsObj = (window as any).SMS;
      if (isNative && smsObj) {
          if (typeof smsObj.hasPermission === 'function') {
              smsObj.hasPermission((hasPerm: boolean) => {
                  setHasSmsPermission(hasPerm);
              }, () => {
                  setHasSmsPermission(false);
              });
          } else {
              // If hasPermission doesn't exist on this fork of the plugin, assume null or handle gracefully
              setHasSmsPermission(null);
          }
      }
  }, []);

  const requestSmsPermission = () => {
      const smsObj = (window as any).SMS;
      if (smsObj) {
          if (typeof smsObj.requestPermission === 'function') {
              smsObj.requestPermission(() => {
                  setHasSmsPermission(true);
                  alert("SMS Auto-Detection Enabled!");
              }, () => {
                  setHasSmsPermission(false);
                  alert("SMS Permission Denied. Auto-Detection will not work.");
              });
          } else {
              alert("Your device doesn't support interactive SMS permission requests. Please enable it in Settings.");
          }
      }
  };

  const handleBudgetChange = (amount: number) => {
    setMonthlyBudget(amount);
    localStorage.setItem('payaware_budget', String(amount));
  };

  // Search & Filter State
  const [filters, setFilters] = React.useState<FilterOptions>({
    searchQuery: '',
    dateRange: { start: '', end: '' },
    category: '',
    paymentMode: 'all',
    amountRange: { min: '', max: '' },
    transactionType: 'all',
  });

  // Reminder scheduling is now handled globally in App.tsx via useReminders hook.
  // This UI just controls the localStorage flag.
  const toggleReminders = () => {
      const newState = !remindersEnabled;
      setRemindersEnabled(newState);
      localStorage.setItem('payaware_reminders', String(newState));
      if (newState && Notification.permission !== 'granted') {
          notificationService.requestPermissions();
      }
  };
  
  // Calculate monthly expense for Budget Alert
  const currentMonthExpense = React.useMemo(() => {
    const now = new Date();
    return transactions.reduce((acc, tx) => {
        if (!tx.date || !tx.amount) return acc;
        const d = new Date(tx.date);
        const amount = Number(tx.amount);
        if (isNaN(amount)) return acc;

        return (tx.type === 'debit' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear())
             ? acc + amount
             : acc;
    }, 0);
  }, [transactions]);

  // Calculate real category totals from transactions
  const categories = React.useMemo(() => {
    const totals: Record<string, number> = {};
    
    // Group expenses by category
    transactions.forEach(tx => {
        // Only count Debits (Expenses)
        if (tx.type === 'debit') {
            const rawCat = tx.category || 'Uncategorized';
            const cat = rawCat.replace(/\s+-\s+undefined$/, '');
            if (!cat.startsWith("Conn Error") && !cat.includes("Failed to fetch")) {
                 totals[cat] = (totals[cat] || 0) + Number(tx.amount);
            }
        }
    });

    const totalExpense = Object.values(totals).reduce((a, b) => a + b, 0);

    // Color palette for categories
    const colors = [
        'from-orange-500 to-red-500', 
        'from-blue-500 to-cyan-500', 
        'from-purple-500 to-pink-500', 
        'from-green-500 to-teal-500', 
        'from-indigo-500 to-purple-500',
        'from-pink-500 to-rose-500',
        'from-yellow-400 to-orange-400',
        'from-teal-400 to-cyan-500'
    ];

    return Object.entries(totals)
        .sort(([, a], [, b]) => b - a) // Sort by highest spend
        .map(([name, amount], index) => {
            // Extract clean category name from stored format
            // e.g. "Expense: Food & Dining - Restaurants & Takeaway" → "Food & Dining"
            // or "Expense__Food & Dining__Restaurants & Takeaway" → "Food & Dining"
            let displayName = name;
            const colonMatch = name.match(/^(?:Expense|Income|Loan):\s*(.+?)(?:\s+-\s+.+)?$/);
            if (colonMatch) displayName = colonMatch[1].trim();
            const underscoreMatch = name.match(/^(?:Expense|Income|Loan)__(.+?)(?:__.+)?$/);
            if (underscoreMatch) displayName = underscoreMatch[1].trim();

            return {
                name: displayName,
                amount,
                color: colors[index % colors.length],
                icon: getCategoryIcon(displayName),
                percentage: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : "0"
            };
        });
  }, [transactions]);

  function getCategoryIcon(name: string) {
      const lower = name.toLowerCase();
      if (lower.includes('food') || lower.includes('dining')) return '🍽️';
      if (lower.includes('grocery') || lower.includes('groceries')) return '🛒';
      if (lower.includes('travel') || lower.includes('transport') || lower.includes('vacation')) return '✈️';
      if (lower.includes('shopping')) return '🛍️';
      if (lower.includes('bill') || lower.includes('utility') || lower.includes('rent') || lower.includes('housing')) return '🏠';
      if (lower.includes('entertainment') || lower.includes('movie')) return '🎬';
      if (lower.includes('health') || lower.includes('medical')) return '🏥';
      if (lower.includes('investment') || lower.includes('saving')) return '📈';
      if (lower.includes('education') || lower.includes('childcare')) return '🎓';
      if (lower.includes('salary') || lower.includes('wages') || lower.includes('income')) return '💰';
      if (lower.includes('loan') || lower.includes('debt') || lower.includes('emi') || lower.includes('card')) return '🏦';
      if (lower.includes('insurance')) return '🛡️';
      if (lower.includes('tax')) return '🧾';
      if (lower.includes('pet')) return '🐾';
      if (lower.includes('charity') || lower.includes('donation')) return '💝';
      if (lower.includes('personal care')) return '💆';
      return '📝';
  }
  
  const fetchDashboardData = async () => {
      try {
          if (!user) return;
          const txs = await transactionService.getTransactions(user.id);
          const summ = await transactionService.getFinancialSummary(user.id);
          setTransactions(txs);
          setSummary(summ);
      } catch (e: any) {
          console.error("Failed to load dashboard data", e);
          if (e.message && e.message.includes("Failed to fetch")) {
              // Only alert once to avoid spamming on recurring fetches
              if (!document.getElementById("network-error-toast")) {
                  // Simple alert for now, or could use a toast
                  // alert("Network Error: Could not fetch transactions. Please check your internet connection.");
                  console.warn("Network Error: Offline mode or Supabase unreachable.");
              }
          }
      }
  };

  // Ref lock — prevents re-running on every 2-second polling cycle
  const initialBalanceProcessed = React.useRef(false);

  // Process initial balance: runs once per login, NOT on every transaction update
  React.useEffect(() => {
    if (!user || !user.user_metadata || user.user_metadata.initial_balance === undefined) return;
    if (initialBalanceProcessed.current) return;

    const initialBalance = Number(user.user_metadata.initial_balance);
    if (isNaN(initialBalance) || initialBalance === 0) return;

    // Fast-path: skip DB call if already processed in this browser
    const processedKey = `initial_balance_processed_${user.id}`;
    if (localStorage.getItem(processedKey)) {
      initialBalanceProcessed.current = true;
      return;
    }

    initialBalanceProcessed.current = true; // Lock immediately to prevent duplicate async calls

    const addInitialBalance = async () => {
      try {
        // Always verify against DB — local state may not be loaded yet
        const existingTxs = await transactionService.getTransactions(user.id);
        const alreadyAdded = existingTxs.some(
          tx => tx.description === 'Initial Balance' && tx.type === 'credit'
        );
        if (alreadyAdded) {
          localStorage.setItem(processedKey, 'true');
          return;
        }

        await transactionService.addTransaction({
          amount: initialBalance,
          type: 'credit',
          description: 'Initial Balance',
          category: 'Income',
          date: new Date().toISOString(),
        }, user.id);

        localStorage.setItem(processedKey, 'true');
        fetchDashboardData();
      } catch (e) {
        console.error('Failed to process initial balance', e);
        initialBalanceProcessed.current = false; // Allow retry if it errored
      }
    };

    addInitialBalance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // ← NOT [user, transactions] — transactions changes every 2s and caused repeated adds

  React.useEffect(() => {
      fetchDashboardData();

      // Listen for updates (Simple polling or subscription could be better, 
      // but for now we rely on re-renders or manual refresh if needed)
      
      // Ideally we would set up a Supabase Realtime subscription here
      const channel = supabase
        .channel('public:transactions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
            fetchDashboardData();
        })
        .subscribe();

      // Refresh data periodically to catch local updates as well
      const interval = setInterval(fetchDashboardData, 2000);

      return () => {
          supabase.removeChannel(channel);
          clearInterval(interval);
      };
  }, [user]);

  // Apply filters (must be at top level, not inside conditional)
  const filteredTransactions = useFilteredTransactions(transactions, filters);
  
  // Get unique categories for filter dropdown
  const uniqueCategories = React.useMemo(() => 
    Array.from(new Set(transactions.map(t => t.category).filter(Boolean))),
    [transactions]
  );

  if (activeTab === 'analytics') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-2xl font-bold text-gray-800">Analytics & Forecast (ARIMA)</h1>
            <div className="flex mt-4 sm:mt-0 bg-white rounded-lg shadow-sm p-1 border border-gray-200">
                <button 
                  onClick={() => setForecastPeriod('W')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${forecastPeriod === 'W' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => setForecastPeriod('M')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${forecastPeriod === 'M' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Monthly
                </button>
            </div>
        </div>
        
        {/* Main Chart Section */}
        <div className="w-full">
            <ExpenseChart 
                categories={categories} 
                transactions={transactions} 
                customData={forecastData} 
            />
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
                 <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                 <p className="text-sm font-semibold text-blue-900">AI-Powered Forecasting</p>
                 <p className="text-xs text-blue-700">Using the ARIMA model to analyze your {forecastPeriod === 'W' ? 'Weekly' : 'Monthly'} spending patterns and predict future expenses.</p>
            </div>
        </div>

        {/* Forecast Section */}
        <div className="grid md:grid-cols-2 gap-6">
             {/* Projected Spend - Enhanced Logic if Forecast Data Exists */}
             <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center mb-4">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                         {forecastPeriod === 'W' ? 'Next 4 Weeks' : 'Next 4 Months'} Projection
                      </h3>
                  </div>
                  <p className="text-gray-600 mb-2">Estimated Total Spending:</p>
                  <p className="text-3xl font-bold text-purple-600">
                      ₹{Math.round(
                          forecastData.filter(d => d.isForecast).reduce((acc, curr) => acc + curr.amount, 0) || 
                          (summary.expense / (new Date().getDate() || 1)) * 30
                      ).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                      {forecastData.some(d => d.isForecast) ? "Sum of next 4 periods based on ARIMA forecast." : "Projected total based on linear rate."}
                  </p>
             </div>
             
             {/* Savings Potential */}
             <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center mb-4">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <TrendingDown className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Savings Potential</h3>
                  </div>
                  <p className="text-gray-600 mb-2">Projected Savings:</p>
                   <p className="text-3xl font-bold text-green-600">
                      ₹{Math.max(0, summary.income - Math.round(
                          forecastData.filter(d => d.isForecast).reduce((acc, curr) => acc + curr.amount, 0) || 
                          (summary.expense / (new Date().getDate() || 1)) * 30
                      )).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Estimated savings if forecast holds true.</p>
             </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'transactions') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Transaction History</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="sticky top-0 z-10 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm py-2 -mx-4 px-4 md:mx-0 md:px-0">
          <SearchFilterBar
            filters={filters}
            onFilterChange={setFilters}
            categories={uniqueCategories}
          />
        </div>

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <TransactionHistory transactions={filteredTransactions} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {transactions.length === 0
                ? 'No transactions yet. Add your first transaction!'
                : 'No transactions match your filters.'}
            </p>
            {transactions.length > 0 && (
              <button
                onClick={() => setFilters({
                  searchQuery: '',
                  dateRange: { start: '', end: '' },
                  category: '',
                  paymentMode: 'all',
                  amountRange: { min: '', max: '' },
                  transactionType: 'all',
                })}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'categories') {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Expense Categories</h1>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {categories.map((category, index) => (
            <CategoryCard key={index} category={category} />
          ))}
        </div>
      </div>
    );
  }



  if (activeTab === 'reminders') {
    return (
      <div className="p-6 space-y-8 animate-fade-in-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Reminders & Notifications</span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your daily alerts and system notifications.</p>
            </div>
        </div>

        <div className="grid gap-6">
          
          {/* Main Status Card */}
          <div className={`relative overflow-hidden rounded-2xl p-1 transition-all duration-500 ${remindersEnabled ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-emerald-200/50 dark:shadow-emerald-900/20 shadow-lg' : 'bg-gradient-to-r from-slate-200 to-gray-300 dark:from-slate-700 dark:to-slate-600'}`}>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 relative z-10 h-full flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full shrink-0 ${remindersEnabled ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        {remindersEnabled ? <Sparkles className="h-6 w-6 animate-pulse-slow" /> : <Mic className="h-6 w-6" />} {/* Reusing Mic as placeholder generic off icon or BellOff if available */}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            System Status: <span className={remindersEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}>{remindersEnabled ? 'Active' : 'Inactive'}</span>
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-md">
                            {remindersEnabled 
                                ? 'You are all set! We will notify you nightly at 9:00 PM about your daily spending summary.' 
                                : 'Reminders are currently disabled. Enable them to stay on top of your finances without opening the app.'}
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={toggleReminders}
                    className={`px-6 py-3 rounded-xl text-sm font-bold text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                        remindersEnabled 
                        ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-200 dark:shadow-rose-900/30' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-200 dark:shadow-emerald-900/30'
                    }`}
                >
                    {remindersEnabled ? 'Deactivate System' : 'Activate Now'}
                </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
              {/* Daily Schedule Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover-card">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="h-24 w-24 text-amber-500" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                            <Zap className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-white">Daily Summary</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Schedule</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-600 px-2 py-1 rounded shadow-sm">{
                                new Date(`2000-01-01T${reminderTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                            } daily</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Automatically checks your transaction history for the day. If you haven't logged anything, we'll gently remind you.
                        </p>
                    </div>
                </div>
              </div>

              {/* Pro Tip Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden hover-card">
                  <div className="absolute -bottom-4 -right-4 bg-white/10 rounded-full w-32 h-32 blur-2xl"></div>
                  <div className="absolute top-4 right-4 bg-white/10 rounded-lg p-2">
                       <TrendingUp className="h-5 w-5 text-indigo-100" />
                  </div>

                  <div className="relative z-10">
                      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                          Pro Tip <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full font-medium">NEW</span>
                      </h3>
                      <p className="text-indigo-100 text-sm leading-relaxed mb-6 opacity-90">
                          "Enable notifications to get a daily summary of your spending. This helps you stay aware of your outflow without opening the app constantly."
                      </p>
                      
                      <button onClick={toggleReminders} className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors flex items-center gap-2">
                          {remindersEnabled ? 'Manage Settings' : 'Enable Now'} <ArrowUpRight className="h-3 w-3" />
                      </button>
                  </div>
              </div>
          </div>

        </div>
      </div>
    );
  }

  if (activeTab === 'settings') {
    const downloadCSV = () => {
       if (!transactions.length) {
           alert("No transactions to export.");
           return;
       }
       const headers = ["Date", "Description", "Amount", "Type", "Category"];
       const rows = transactions.map(t => [
           t.date ? new Date(t.date).toLocaleDateString() : '',
           `"${(t.description || '').replace(/"/g, '""')}"`,
           t.amount,
           t.type,
           t.category
       ]);
       const csvContent = "data:text/csv;charset=utf-8," 
           + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
       const encodedUri = encodeURI(csvContent);
       const link = document.createElement("a");
       link.setAttribute("href", encodedUri);
       link.setAttribute("download", "payaware_transactions.csv");
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
    };

    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
        
        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Notification Preferences</h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={remindersEnabled}
                onChange={toggleReminders}
                className="rounded h-5 w-5 text-blue-600" 
              />
              <span className="text-gray-700 font-medium">Enable Daily Summary Reminders</span>
            </label>
            {remindersEnabled && (
                <div className="ml-8 mt-2 flex items-center gap-3">
                    <label className="text-sm text-gray-600">Notify me at:</label>
                    <input 
                        type="time" 
                        value={reminderTime}
                        onChange={handleReminderTimeChange}
                        className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-32 bg-gray-50 bg-white"
                    />
                </div>
            )}
            <div className="ml-8 text-xs text-gray-500">
                You will receive a notification checking your daily spending status.
            </div>
          </div>
        </div>

        {/* Mobile-Only Settings */}
        {hasSmsPermission !== null && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-500" />
                Device Permissions
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-700">SMS Auto-Detection</h3>
                  <p className="text-sm text-gray-500 max-w-sm">Allow PayAware to read incoming bank messages and automatically log transactions.</p>
                </div>
                <button
                    onClick={hasSmsPermission ? () => alert("Permission already granted. If you wish to revoke, please do so in Android System Settings.") : requestSmsPermission}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        hasSmsPermission 
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                    }`}
                >
                    {hasSmsPermission ? 'Granted ✓' : 'Allow Access'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Budget Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Financial Settings</h2>
            <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">Monthly Budget Limit:</span>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input 
                        type="number" 
                        value={monthlyBudget}
                        onChange={(e) => handleBudgetChange(Number(e.target.value))}
                        className="pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-40"
                    />
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Alerts are automatically triggered when you exceed 85% and 100% of this limit.</p>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Appearance</h2>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-200">Theme</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred color scheme</p>
                </div>
                <ThemeToggle />
            </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Data Management</h2>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-gray-700">Export Data</h3>
                    <p className="text-sm text-gray-500">Download your transaction history as a CSV file.</p>
                </div>
                <button 
                    onClick={downloadCSV}
                    className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <DollarSign className="h-4 w-4" /> {/* Reusing DollarSign as generic icon or use generic */}
                    <span>Download CSV</span>
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-xs md:text-base text-gray-600">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
           <button
             onClick={handleVoiceEntry}
             className={`p-2 md:p-3 rounded-xl transition-all duration-300 shadow-sm border ${
                 isListening 
                 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse ring-2 ring-red-400' 
                 : 'bg-white border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300'
             }`}
             title="Voice Logging"
           >
             <Mic className={`h-5 w-5 ${isListening ? 'animate-bounce' : ''}`} />
           </button>
           
           <button
             onClick={() => setIsModalOpen(true)}
             className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 md:px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 text-sm md:text-base"
           >
             <Plus className="h-4 w-4" />
             <span className="hidden sm:inline">Add Transaction</span>
             <span className="inline sm:hidden">Add</span>
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      {/* Stats Cards - Horizontal Scroll on Mobile */}
      {/* Stats Cards - Horizontal Scroll on Mobile */}
      <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-none">
        
        <div className="min-w-[140px] snap-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Balance</span>
              <div className={`p-1.5 rounded-lg ${summary.balance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                 <DollarSign className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className={`text-lg font-bold ${summary.balance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              ₹{summary.balance.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        
        <div className="min-w-[140px] snap-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 hover:shadow-md transition-all duration-300">
           <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Income</span>
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                 <TrendingUp className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-lg font-bold text-indigo-700 dark:text-indigo-400">
              ₹{summary.income.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        
        <div className="min-w-[140px] snap-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 hover:shadow-md transition-all duration-300">
           <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Expense</span>
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                 <TrendingDown className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-lg font-bold text-rose-700 dark:text-rose-400">
              ₹{summary.expense.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        
        <div className="min-w-[140px] snap-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 hover:shadow-md transition-all duration-300">
           <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Savings</span>
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                 <TrendingUp className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
               {summary.income > 0 ? ((summary.balance / summary.income) * 100).toFixed(0) : '0'}%
            </p>
          </div>
        </div>
      </div>


      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Balance and Categories */}
        <div className="lg:col-span-2 space-y-6">
          <BalanceCard balance={summary.balance} income={summary.income} expense={summary.expense} />
          
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Expense Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
              {categories.slice(0, 4).map((category, index) => (
                <CategoryCard key={index} category={category} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Budget, Quick Actions, Dev Tools */}
        <div className="space-y-6">
          
          {/* Monthly Budget Tracker - High Priority */}
          <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border-l-4 transition-all duration-300 ${
              currentMonthExpense > monthlyBudget ? 'border-l-rose-500 bg-rose-50/50 dark:bg-rose-900/10' : 'border-l-indigo-500 bg-white/50 dark:bg-slate-800/50'
          }`}>
              <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-bold flex items-center gap-2 ${currentMonthExpense > monthlyBudget ? 'text-rose-800 dark:text-rose-400' : 'text-slate-800 dark:text-white'}`}>
                      <TrendingUp className={`h-5 w-5 ${currentMonthExpense > monthlyBudget ? 'text-rose-600' : 'text-indigo-600'}`} />
                      Monthly Budget
                  </h3>
                  <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600">
                       <span className={`text-[10px] font-bold uppercase tracking-wider ${currentMonthExpense > monthlyBudget ? 'text-rose-500' : 'text-slate-400'}`}>Limit:</span>
                       <div className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-200">
                           <span className="mr-0.5">₹</span>
                           <input 
                              type="number" 
                              value={monthlyBudget || ''}
                              onChange={(e) => handleBudgetChange(Math.max(0, Number(e.target.value)))}
                              className="w-16 bg-transparent border-none focus:outline-none focus:ring-0 text-right p-0"
                              placeholder="0"
                           />
                       </div>
                  </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
                  <div 
                      className={`h-3 rounded-full transition-all duration-1000 ease-out shadow-sm ${
                          monthlyBudget === 0 ? 'bg-slate-300' :
                          currentMonthExpense > monthlyBudget ? 'bg-gradient-to-r from-rose-500 to-red-600' :
                          currentMonthExpense > monthlyBudget * 0.85 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                          'bg-gradient-to-r from-emerald-400 to-indigo-500'
                      }`}
                      style={{ width: `${monthlyBudget > 0 ? Math.min((currentMonthExpense / monthlyBudget) * 100, 100) : 0}%` }}
                  ></div>
              </div>
              
              <div className="flex justify-between items-end">
                  <div>
                     <p className="text-[10px] items-center font-bold text-slate-400 uppercase tracking-widest mb-0.5">Spent so far</p>
                     <p className={`text-2xl font-black ${currentMonthExpense > monthlyBudget ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                        ₹{currentMonthExpense.toLocaleString()}
                     </p>
                  </div>
                  <div className="text-right">
                      <span className={`text-xs font-black px-3 py-1 rounded-full shadow-sm ${
                          monthlyBudget === 0 ? 'bg-slate-100 text-slate-400' :
                          currentMonthExpense > monthlyBudget ? 'bg-rose-100 text-rose-700 animate-pulse' : 
                          'bg-emerald-100 text-emerald-700'
                      }`}>
                          {monthlyBudget > 0 ? Math.round((currentMonthExpense / monthlyBudget) * 100) : 0}% Used
                      </span>
                  </div>
              </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                    if (setModalInitialData) setModalInitialData({ paymentMode: 'Cash' });
                    setIsModalOpen(true);
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 shadow-emerald-200 shadow-md"
              >
                <span>💵 Add Cash Entry</span>
              </button>

              <button
                onClick={async () => {
                    const sample = "Debited Rs. 2500 from HDFC Bank at Starbucks for coffee on 14-02-2026. Ref 99543.";
                    try {
                        const { notificationListener } = await import('../lib/notificationListener');
                        // Use casting to access internal method if needed
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (notificationListener as any).processMessage(sample);
                        alert("Simulated incoming SMS:\n\n" + sample + "\n\nWaiting for popup...");
                    } catch (e) {
                        alert("Simulation failed: " + e);
                    }
                }}
                className="w-full bg-blue-50 text-blue-600 border border-blue-200 py-3 rounded-lg hover:bg-blue-100 transition-all duration-300 flex items-center justify-center space-x-2 text-sm font-medium"
              >
                <span>🔔 Simulate Incoming SMS</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
        <TransactionHistory transactions={transactions.slice(0, 5)} />
      </div>
    </div>
  );
};

export default DashboardContent;