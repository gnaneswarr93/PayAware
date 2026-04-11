import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  type: string; // 'debit' or 'credit'
  date: string;
  time: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

// Formats stored category strings for clean display.
// Handles formats like "Expense: Food & Dining - Restaurants & Takeaway"
// or legacy "Food" single-word categories.
function formatCategory(raw: string | undefined): string {
  if (!raw) return 'Uncategorized';
  // Handle "Type: Category - SubCategory" format (used when saving from modal)
  const colonMatch = raw.match(/^(?:Expense|Income|Loan):\s*(.+?)(?:\s+-\s+.+)?$/);
  if (colonMatch) return colonMatch[1].trim();
  // Handle "Type__Category__SubCategory" format (used by categorizeLocally)
  const underscoreMatch = raw.match(/^(?:Expense|Income|Loan)__(.+?)(?:__.+)?$/);
  if (underscoreMatch) return underscoreMatch[1].trim();
  // Fallback: Return the raw value (for simple 1-word categories from old data)
  return raw.replace(/\s+-\s+undefined$/, '');
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Activity</h3>
      </div>
      
      <div className="space-y-3">
        {transactions.map((transaction, index) => {
            const isCredit = transaction.type === 'credit';
            const dateObj = new Date(transaction.date);
            const formattedDate = dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            
            return (
          <div 
            key={transaction.id} 
            className="group relative bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-all duration-200"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg shrink-0 ${
                  isCredit 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' 
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30'
                }`}>
                  {isCredit ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </div>
                
                <div className="min-w-0 flex flex-col">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
                    {transaction.description || "Unknown"}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate">
                    {formatCategory(transaction.category)}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end shrink-0 ml-2">
                <p className={`font-bold text-sm tracking-tight ${
                  isCredit 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {isCredit ? '+' : '-'}₹{Math.abs(Number(transaction.amount)).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
                  {formattedDate}
                </p>
              </div>
            </div>
          </div>
        )})}
      </div>
      
      {transactions.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-full">
            <ArrowUpRight className="h-8 w-8 text-gray-400" />
          </div>
          <div>
             <p className="text-gray-600 dark:text-gray-300 font-medium">No transactions yet</p>
             <p className="text-sm text-gray-400">Add a new interaction to get started</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;