import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid 
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart as BarIcon, Calendar } from 'lucide-react';

interface ExpenseChartProps {
    categories?: { name: string; amount: number; color?: string; percentage?: string }[];
    transactions?: any[];
    customData?: any[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ categories = [], transactions = [], customData = [] }) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'trends'>('trends');

  // Chart Colors
  const COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#6366f1', '#ec4899', '#eab308'];

  // Prepare Pie Data
  const pieData = useMemo(() => {
     return categories.map((cat, index) => ({
         name: cat.name,
         value: cat.amount,
         color: cat.color ? cat.color.replace('from-', '#').replace('to-', '') : COLORS[index % COLORS.length]
     })).filter(d => d.value > 0);
  }, [categories]);

  // Prepare Weekly Trend Data
  const trendData = useMemo(() => {
      if (customData && customData.length > 0) return customData;

      if (!transactions || transactions.length === 0) return [];
      
      const last7Days = new Array(7).fill(0).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          d.setHours(0,0,0,0);
          return d;
      });

      return last7Days.map(date => {
          const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue
          
          // Sum expenses for this day
          const total = transactions.reduce((sum, tx) => {
              if (tx.type !== 'debit') return sum;
              const txDate = new Date(tx.date);
              txDate.setHours(0,0,0,0);
              return txDate.getTime() === date.getTime() ? sum + Number(tx.amount) : sum;
          }, 0);

          return { name: dayStr, amount: total, date: date.toISOString() };
      });
  }, [transactions]);

  const totalExpense = categories.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Analytics & Insights
          </h3>
          <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
              <button 
                onClick={() => setActiveTab('trends')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'trends' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  <BarIcon className="h-4 w-4 inline mr-1" />
                  Trends
              </button>
              <button 
                onClick={() => setActiveTab('categories')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'categories' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  <PieIcon className="h-4 w-4 inline mr-1" />
                  Breakdown
              </button>
          </div>
      </div>

      <div className="w-full min-h-[350px] md:h-72 flex flex-col">
        {activeTab === 'trends' ? (
             transactions.length > 0 ? (
                <div className="h-[350px] md:h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 12, fill: '#6b7280'}} 
                                dy={10}
                            />
                            <YAxis 
                                hide={true} 
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)' }}
                                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Spent']}
                                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="amount" 
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorAmount)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Calendar className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No transaction data available for trends.</p>
                </div>
             )
        ) : (
            pieData.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center h-full gap-4 md:gap-0"> 
                    <div className="h-[200px] md:h-full w-full md:w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value: any, name: any) => [
                                        `₹${Number(value).toLocaleString()}`, 
                                        String(name).replace('Expense: ', '').replace('Income: ', '')
                                    ]} 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 pl-0 md:pl-4 overflow-y-auto max-h-[150px] md:max-h-full scrollbar-thin">
                         <ul className="space-y-3 pr-2">
                             {categories.map((cat, index) => (
                                 <li key={index} className="flex justify-between items-center text-sm group cursor-default">
                                     <div className="flex items-center min-w-0 flex-1 mr-3">
                                         <span className="w-3 h-3 rounded-full mr-2.5 shrink-0 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                         <span className="text-gray-600 truncate font-medium group-hover:text-gray-900 transition-colors">
                                            {cat.name.replace('Expense: ', '').replace('Income: ', '')}
                                         </span>
                                     </div>
                                     <span className="font-bold text-gray-800 shrink-0">₹{cat.amount.toLocaleString('en-IN')}</span>
                                 </li>
                             ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <PieIcon className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No expense categories found.</p>
                </div>
            )
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-end">
          <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Total Spent (All Time)</p>
              <p className="text-2xl font-bold text-gray-800">₹{totalExpense.toLocaleString('en-IN')}</p>
          </div>
          {activeTab === 'trends' && trendData.length > 0 && (
               <div className="text-right">
                   <p className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                       Last 7 Days Activity
                   </p>
               </div>
          )}
      </div>
    </div>
  );
};

export default ExpenseChart;