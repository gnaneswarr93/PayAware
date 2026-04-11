import { useState, useEffect } from 'react';
import { X, MapPin, DollarSign, Landmark, Sparkles, Smartphone, Banknote } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const CATEGORY_GROUPS = {
  Expense: [
    "Charity & Donations", "Childcare & Education", "Debt Payments", "Education",
    "Entertainment", "Food & Dining", "Groceries", "Healthcare", "Home Maintenance",
    "Housing & Utilities", "Insurance", "Legal & Administrative", "Miscellaneous",
    "Personal Care", "Pets", "Professional Development", "Savings & Investments",
    "Shopping", "Subscriptions & Memberships", "Taxes", "Transportation", "Travel & Vacations"
  ],
  Income: [
    "Business & Freelance", "Government Transfers", "Investment Returns",
    "Miscellaneous", "Rental Income", "Salary & Wages"
  ],
  Loan: [
    "Credit Card Dues", "Disbursement (Amount Borrowed)", "Interest Payment", "Repayment (EMI)"
  ]
};

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
      amount?: string;
      purpose?: string;
      location?: string;
  };
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, initialData }) => {
  const { user } = useAuth();
  
  // Tabs: Expense | Income | Loan
  const [activeType, setActiveType] = useState<string>('Expense');
  
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    location: '',
    category: '',
    subCategory: '',
    paymentMode: 'Online'
  });

  // Reset or Fill on Open
  useEffect(() => {
      if (isOpen) {
          if (initialData) {
              setFormData(prev => ({
                  ...prev,
                  amount: initialData.amount || '',
                  purpose: initialData.purpose || '',
                  location: initialData.location || '',
                  paymentMode: (initialData as any).paymentMode || 'Online'
              }));
          } else {
              setFormData({ amount: '', purpose: '', location: '', category: '', subCategory: '', paymentMode: 'Online' });
          }
      }
  }, [isOpen, initialData]);
  
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [debouncedPurpose, setDebouncedPurpose] = useState(formData.purpose);

  // Debounce purpose update
  useEffect(() => {
      const timer = setTimeout(() => {
          setDebouncedPurpose(formData.purpose);
      }, 400);
      return () => clearTimeout(timer);
  }, [formData.purpose]);

  // Fetch category
  useEffect(() => {
      if (!debouncedPurpose) return;

      const fetchCategory = async () => {
          setIsCategorizing(true);
          try {
              const result = await api.predictCategory(debouncedPurpose);
              if (result.category) {
                  if (result.category.includes('__')) {
                      const [pType, pCategory, pSub] = result.category.split('__');
                      if (['Expense', 'Income', 'Loan'].includes(pType)) {
                          setActiveType(pType);
                          setFormData(prev => ({ 
                              ...prev, 
                              category: pCategory,
                              subCategory: pSub || 'General'
                          }));
                      }
                  } else if (!result.category.includes('Error')) {
                      // Fallback for simple category result
                      setFormData(prev => ({ ...prev, category: result.category, subCategory: 'General' }));
                  } else {
                      // Handle API error in state
                      setFormData(prev => ({ ...prev, category: 'Uncategorized', subCategory: 'Manual Input Needed' }));
                  }
              }
          } catch (e) {
              console.error("Categorization failed", e);
              setFormData(prev => ({ ...prev, category: 'Uncategorized', subCategory: 'Server Connection Failed' }));
          } finally {
              setIsCategorizing(false);
          }
      };

      fetchCategory();
  }, [debouncedPurpose]);

  const { addTransaction } = transactionService;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Map UI Type to DB Type
    let dbType: 'debit' | 'credit' = 'debit';
    if (activeType === 'Income') dbType = 'credit';
    if (activeType === 'Loan') {
        if (formData.category === 'Lending (Given)' || formData.category === 'Debt Payment') {
            dbType = 'debit';
        } else {
            dbType = 'credit';
        }
    }
    
    let finalDescription = formData.purpose;
    if (formData.paymentMode === 'Cash') {
        finalDescription = `[Cash] ${finalDescription}`;
    }

    try {
        await addTransaction({
            amount: parseFloat(formData.amount),
            type: dbType,
            description: finalDescription,
            purpose: formData.purpose,
            location: formData.location || 'Manual Entry',
            category: `${activeType}: ${formData.category} - ${formData.subCategory}`, 
        }, user?.id);
        
        setFormData({ amount: '', purpose: '', location: '', category: '', subCategory: '', paymentMode: 'Online' });
        onClose();
    } catch (err: any) {
        console.error("Failed to add transaction", err);
        alert("Failed to save transaction: " + err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-[90%] sm:max-w-[360px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`px-5 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r ${
            activeType === 'Income' ? 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20' : 
            activeType === 'Loan' ? 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20' : 'from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg shadow-sm ${
                activeType === 'Income' ? 'bg-emerald-500 text-white' : 
                activeType === 'Loan' ? 'bg-violet-500 text-white' : 'bg-rose-500 text-white'
            }`}>
              {activeType === 'Loan' ? <Landmark className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
            </div>
            <div>
                 <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">New {activeType}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/50 dark:hover:bg-black/20 text-slate-500 dark:text-slate-400 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-none">
          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Amount (₹)</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400 group-focus-within:text-indigo-500 transition-colors">₹</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                step="0.01"
                className="w-full pl-12 pr-4 py-3 text-3xl font-bold bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
                placeholder="0"
                autoFocus
              />
            </div>
          </div>

          {/* Purpose */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Purpose</label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm font-medium transition-all outline-none"
              placeholder="e.g. Dinner, Salary..."
            />
          </div>

          {/* Auto-Categorized Chip */}
          <div className={`rounded-xl p-3 border transition-all duration-300 ${
              activeType === 'Income' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' : 
              activeType === 'Loan' ? 'bg-violet-50 dark:bg-violet-900/10 border-violet-100 dark:border-violet-800/30' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30'
          }`}>
              <div className="flex items-center gap-2 mb-1">
                 <Sparkles className={`h-3 w-3 ${isCategorizing ? 'animate-spin text-indigo-500' : 'text-amber-500'}`} />
                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                     {isCategorizing ? 'Analyzing...' : 'Auto-Categorized'}
                 </span>
              </div>
              
              <div className="pl-5 pr-2">
                  <select
                      value={formData.category}
                      onChange={(e) => {
                          const newCat = e.target.value;
                          const newType = Object.keys(CATEGORY_GROUPS).find(key => 
                              CATEGORY_GROUPS[key as keyof typeof CATEGORY_GROUPS].includes(newCat)
                          );
                          
                          if (newType && ['Expense', 'Income', 'Loan'].includes(newType)) {
                              setActiveType(newType);
                          }
                          
                          setFormData(prev => ({ 
                              ...prev, 
                              category: newCat,
                              subCategory: 'General' // Reset subcategory on manual change
                          }));
                      }}
                      className="w-full bg-transparent border-none text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-0 p-0 cursor-pointer"
                  >
                      <option value="">{isCategorizing ? "Analyzing..." : "Select Category..."}</option>
                      {Object.entries(CATEGORY_GROUPS).map(([group, options]) => (
                          <optgroup key={group} label={group}>
                              {options.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                              ))}
                          </optgroup>
                      ))}
                  </select>
                  {formData.subCategory && (
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 opacity-80 mt-0.5">
                        {formData.subCategory}
                    </p>
                  )}
              </div>
          </div>

          {/* Payment Mode */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Payment Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                  type="button"
                  onClick={() => setFormData({...formData, paymentMode: 'Online'})}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border transition-all duration-200 ${
                    formData.paymentMode === 'Online' 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
              >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span className="text-xs">Online</span>
              </button>
              <button 
                  type="button"
                  onClick={() => setFormData({...formData, paymentMode: 'Cash'})}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border transition-all duration-200 ${
                    formData.paymentMode === 'Cash' 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
              >
                  <Banknote className="h-3.5 w-3.5" />
                  <span className="text-xs">Cash</span>
              </button>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Location</label>
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm transition-all outline-none"
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
           <button
            type="submit"
            onClick={handleSubmit}
            disabled={!formData.amount || !formData.purpose}
            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                activeType === 'Income' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                activeType === 'Loan' ? 'bg-violet-600 hover:bg-violet-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {activeType === 'Income' ? 'Add Income' : activeType === 'Loan' ? 'Add Loan' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;