import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  DollarSign,
  Zap,
  Loader2,
  Trash2,
  Sparkles
} from "lucide-react";
import { ParsedTransaction } from "../lib/messageParser";
import { api, TransactionCategory } from "../lib/api";

interface AutoDetectTransactionModalProps {
  isOpen: boolean;
  onClose: () => void; // Remind Later
  onDismiss?: () => void; // Permanent Delete
  detectedTransaction: ParsedTransaction | null;
  onSave: (transactionData: {
    amount: number;
    purpose: string;
    location: string;
    category: TransactionCategory;
    autoDetected: boolean;
    originalData: ParsedTransaction;
  }) => void;
}

const AutoDetectTransactionModal: React.FC<AutoDetectTransactionModalProps> = ({
  isOpen,
  onClose,
  onDismiss,
  detectedTransaction,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    location: "",
    date: "",
  });

  const [aiResult, setAiResult] = useState({
      type: 'Expense',
      category: 'Uncategorized',
      subCategory: 'General'
  });
  
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [debouncedPurpose, setDebouncedPurpose] = useState("");

  // Categories from Backend Model
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

  // Initialize form
  useEffect(() => {
    if (detectedTransaction) {
      const dateObj = new Date(detectedTransaction.timestamp || Date.now());
      const tzOffset = dateObj.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(dateObj.getTime() - tzOffset)).toISOString().slice(0, 16);

      setFormData({
        amount: detectedTransaction.amount.toString(),
        purpose: detectedTransaction.description,
        location: detectedTransaction.merchant || "",
        date: localISOTime,
      });
      setDebouncedPurpose(detectedTransaction.description);
    }
  }, [detectedTransaction]);

  // Debounce Purpose
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPurpose(formData.purpose);
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.purpose]);

  // AI Prediction
  useEffect(() => {
    if (!debouncedPurpose) return;

    const fetchCategory = async () => {
      setIsCategorizing(true);
      try {
        const result = await api.predictCategory(debouncedPurpose);
        if (result.category) {
            if (result.category.includes('__')) {
                const [pType, pCategory, pSub] = result.category.split('__');
                setAiResult({ type: pType, category: pCategory, subCategory: pSub || 'General' });
            } else if (!result.category.includes('Error')) {
                // Fallback for simple category response
                setAiResult(prev => ({ ...prev, category: result.category, subCategory: 'General' }));
            } else {
                // API Error
                 setAiResult(prev => ({ ...prev, category: 'Uncategorized', subCategory: 'Manual Input Needed' }));
            }
        }
      } catch (e) {
        console.error("Auto-categorization failed", e);
        setAiResult(prev => ({ ...prev, category: 'Uncategorized', subCategory: 'Offline' }));
      } finally {
        setIsCategorizing(false);
      }
    };

    fetchCategory();
  }, [debouncedPurpose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detectedTransaction) return;

    const fullCategoryString = `${aiResult.type}: ${aiResult.category} - ${aiResult.subCategory}`;

    const transactionData = {
      amount: parseFloat(formData.amount),
      purpose: formData.purpose,
      location: formData.location || "Manual Entry",
      category: fullCategoryString as TransactionCategory,
      autoDetected: true,
      originalData: detectedTransaction,
    };

    onSave(transactionData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen || !detectedTransaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-[90%] sm:max-w-[380px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg text-white shadow-sm ${detectedTransaction.type === 'credit' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">New Transaction</h2>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Detected via SMS/Email</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
             {onDismiss && (
               <button 
                 onClick={onDismiss} 
                 className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500 transition-colors"
                 title="Discard"
               >
                 <Trash2 className="h-4 w-4" />
               </button>
             )}
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/50 dark:hover:bg-black/20 text-slate-500 dark:text-slate-400 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-none">
          
          {/* Amount & Date Grid */}
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Amount</label>
               <div className="relative group">
                 <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                 <input
                   type="number"
                   name="amount"
                   value={formData.amount}
                   onChange={handleChange}
                   required
                   step="0.01"
                   className="w-full pl-8 pr-3 py-2 text-xl font-bold bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all outline-none"
                 />
               </div>
             </div>
             
             <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Date</label>
               <input
                 type="datetime-local"
                 name="date"
                 value={formData.date}
                 onChange={handleChange}
                 required
                 className="w-full px-2 py-2 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all outline-none font-medium"
               />
             </div>
          </div>

          {/* Purpose Input - Triggers AI */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Purpose / Description</label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="e.g. Starbucks Coffee"
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm font-medium transition-all outline-none"
              autoFocus
            />
          </div>

          {/* AI Prediction Card / Manual Override */}
          <div className={`rounded-xl p-3 border transition-all duration-300 ${
              isCategorizing ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' : 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/30'
          }`}>
              <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Category Detection
                  </span>
                  {isCategorizing && <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />}
              </div>
              
              <div className="flex flex-col gap-2">
                  {/* Category Display or Dropdown */}
                  {/* Category Display or Dropdown */}
                  <select
                      value={aiResult.category}
                      onChange={(e) => {
                          const newCat = e.target.value;
                          const newType = Object.keys(CATEGORY_GROUPS).find(key => 
                              CATEGORY_GROUPS[key as keyof typeof CATEGORY_GROUPS].includes(newCat)
                          );
                          setAiResult({ 
                              ...aiResult, 
                              category: newCat, 
                              type: newType || aiResult.type 
                          });
                      }}
                      className="w-full bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                      <option value="Uncategorized">Select Category...</option>
                      {Object.entries(CATEGORY_GROUPS).map(([group, options]) => (
                          <optgroup key={group} label={group}>
                              {options.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                              ))}
                          </optgroup>
                      ))}
                  </select>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          aiResult.type === 'Income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                          {aiResult.type}
                      </span>
                      <span>•</span>
                      <span>{aiResult.subCategory}</span>
                  </div>
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
                placeholder="e.g. Starbucks NY"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all text-sm"
            >
              Remind Later
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
            >
              Save Transaction
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AutoDetectTransactionModal;
