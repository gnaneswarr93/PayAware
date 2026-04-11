import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, income, expense }) => {
  const monthlyChange = (income - expense); // Simple diff for now
  const isPositive = monthlyChange >= 0;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1.5">
          <Wallet className="h-4 w-4 text-blue-100" />
          <h3 className="text-sm font-medium text-blue-50">Total Balance</h3>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full ${
          isPositive ? 'bg-emerald-400/20 text-emerald-100' : 'bg-rose-400/20 text-rose-100'
        }`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span className="text-xs font-medium">
            ₹{Math.abs(monthlyChange).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-2xl font-bold tracking-tight">₹{balance.toLocaleString('en-IN')}</p>
        <p className="text-blue-200 text-xs">
          {isPositive ? '+' : '-'}₹{Math.abs(monthlyChange).toLocaleString('en-IN')} this month
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
        <div>
          <p className="text-blue-200 text-[10px] uppercase tracking-wider">Income</p>
          <p className="text-sm font-semibold">₹{income.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-blue-200 text-[10px] uppercase tracking-wider">Expenses</p>
          <p className="text-sm font-semibold">₹{expense.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;