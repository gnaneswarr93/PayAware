import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Calendar, DollarSign, Tag } from 'lucide-react';

export interface FilterOptions {
  searchQuery: string;
  dateRange: {
    start: string;
    end: string;
  };
  category: string;
  paymentMode: 'all' | 'Cash' | 'Online';
  amountRange: {
    min: number | '';
    max: number | '';
  };
  transactionType: 'all' | 'Expense' | 'Income' | 'Loan';
}

interface SearchFilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filters,
  onFilterChange,
  categories,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFilterChange({
      ...filters,
      dateRange: { ...filters.dateRange, [field]: value },
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  const handlePaymentModeChange = (mode: FilterOptions['paymentMode']) => {
    onFilterChange({ ...filters, paymentMode: mode });
  };

  const handleTypeChange = (type: FilterOptions['transactionType']) => {
    onFilterChange({ ...filters, transactionType: type });
  };

  const handleAmountChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? '' : Number(value);
    onFilterChange({
      ...filters,
      amountRange: { ...filters.amountRange, [field]: numValue },
    });
  };

  const clearFilters = () => {
    onFilterChange({
      searchQuery: '',
      dateRange: { start: '', end: '' },
      category: '',
      paymentMode: 'all',
      amountRange: { min: '', max: '' },
      transactionType: 'all',
    });
    setShowAdvanced(false);
  };

  const isFiltered = useMemo(() => {
    return (
      filters.searchQuery ||
      filters.dateRange.start ||
      filters.dateRange.end ||
      filters.category ||
      filters.paymentMode !== 'all' ||
      filters.amountRange.min !== '' ||
      filters.amountRange.max !== '' ||
      filters.transactionType !== 'all'
    );
  }, [filters]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 space-y-3">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:text-white transition-all"
          />
        </div>
        
        <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
                showAdvanced || isFiltered
                  ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {isFiltered && (
                <span className="bg-blue-600 text-white text-[10px] h-4 w-4 flex items-center justify-center rounded-full ml-1">
                  •
                </span>
              )}
            </button>
    
            {isFiltered && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-50 text-gray-500 border border-gray-200 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all whitespace-nowrap text-sm"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-3 border-t border-gray-100 dark:border-gray-700 animate-fade-in-up">
           <div className="grid grid-cols-2 gap-3">
              {/* Date Range */}
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <Calendar className="h-3 w-3" /> Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              {/* Amount Range */}
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <DollarSign className="h-3 w-3" /> Amount
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.amountRange.min}
                    onChange={(e) => handleAmountChange('min', e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="number"
                    value={filters.amountRange.max}
                    onChange={(e) => handleAmountChange('max', e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
           </div>
           
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Category */}
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <Tag className="h-3 w-3" /> Category
                </label>
                <select
                  value={filters.category}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div className="col-span-2 sm:col-span-3 space-y-1.5">
                 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                    Filters
                 </label>
                 <div className="flex flex-wrap gap-2">
                    {(['all', 'Expense', 'Income'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleTypeChange(type)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                             filters.transactionType === type 
                             ? 'bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-gray-900' 
                             : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {type === 'all' ? 'All Types' : type}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-gray-200 mx-1 self-center hidden sm:block"></div>
                    {(['Cash', 'Online'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => handlePaymentModeChange(mode)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                             filters.paymentMode === mode 
                             ? 'bg-blue-50 text-blue-600 border-blue-200' 
                             : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {mode}
                        </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

/**
 * Hook to filter transactions based on filter criteria
 */
export const useFilteredTransactions = <T extends {
  description?: string;
  category?: string;
  amount: number;
  date?: string;
  type?: string;
}>(
  transactions: T[],
  filters: FilterOptions
): T[] => {
  return useMemo(() => {
    return transactions.filter((transaction) => {
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch =
          transaction.description?.toLowerCase().includes(query) ||
          transaction.category?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Date range
      if (filters.dateRange.start || filters.dateRange.end) {
        const txDate = transaction.date ? new Date(transaction.date) : null;
        if (txDate) {
          if (filters.dateRange.start && txDate < new Date(filters.dateRange.start)) {
            return false;
          }
          if (filters.dateRange.end && txDate > new Date(filters.dateRange.end)) {
            return false;
          }
        }
      }

      // Category
      if (filters.category && transaction.category !== filters.category) {
        return false;
      }

      // Payment Mode
      if (filters.paymentMode !== 'all') {
        const isCash = transaction.description?.startsWith('[Cash]');
        if (filters.paymentMode === 'Cash' && !isCash) return false;
        if (filters.paymentMode === 'Online' && isCash) return false;
      }

      // Amount range
      if (filters.amountRange.min !== '' && transaction.amount < filters.amountRange.min) {
        return false;
      }
      if (filters.amountRange.max !== '' && transaction.amount > filters.amountRange.max) {
        return false;
      }

      // Transaction type
      if (filters.transactionType !== 'all' && transaction.type !== filters.transactionType) {
        return false;
      }

      return true;
    });
  }, [transactions, filters]);
};
