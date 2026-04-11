import { useState } from 'react';
import { TrendingUp } from 'lucide-react';

const HeroChart = () => {
  const data = [
    { month: 'Jan', income: 45000, expenses: 32000 },
    { month: 'Feb', income: 48000, expenses: 29500 },
    { month: 'Mar', income: 45000, expenses: 27000 },
    { month: 'Apr', income: 52000, expenses: 31000 },
  ];

  const yAxisSteps = [0, 15000, 30000, 45000, 60000];
  const [hoveredBar, setHoveredBar] = useState<{ index: number; type: string } | null>(null);

  const avgSavings = Math.round(
    data.reduce((sum, d) => sum + (d.income - d.expenses), 0) / data.length
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Financial Overview</h3>
          <span className="inline-flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 mt-1">
            Sample Data
          </span>
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">Income</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">Expenses</span>
          </div>
        </div>
      </div>
      
      <div className="flex h-44">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between text-xs text-gray-400 dark:text-gray-500 pr-3 pb-6">
          {[...yAxisSteps].reverse().map((val) => (
            <span key={val}>₹{(val / 1000).toFixed(0)}k</span>
          ))}
        </div>
        
        {/* Chart Bars */}
        <div className="flex-1 flex items-end justify-around border-l border-b border-gray-200 dark:border-gray-600 pb-0 relative">
          {/* Grid lines */}
          {yAxisSteps.slice(1).map((val, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-dashed border-gray-100 dark:border-gray-700"
              style={{ bottom: `${(val / 60000) * 100}%` }}
            ></div>
          ))}

          {data.map((item, index) => (
            <div key={index} className="flex-1 flex items-end justify-center space-x-1.5 relative z-10">
              {/* Income bar */}
              <div className="flex flex-col items-center relative">
                {hoveredBar?.index === index && hoveredBar.type === 'income' && (
                  <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                    ₹{item.income.toLocaleString('en-IN')}
                  </div>
                )}
                <div
                  className="w-7 md:w-9 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all duration-300 hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                  style={{ height: `${(item.income / 60000) * 140}px` }}
                  onMouseEnter={() => setHoveredBar({ index, type: 'income' })}
                  onMouseLeave={() => setHoveredBar(null)}
                ></div>
              </div>
              {/* Expense bar */}
              <div className="flex flex-col items-center relative">
                {hoveredBar?.index === index && hoveredBar.type === 'expense' && (
                  <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                    ₹{item.expenses.toLocaleString('en-IN')}
                  </div>
                )}
                <div
                  className="w-7 md:w-9 bg-gradient-to-t from-rose-400 to-rose-300 rounded-t-md transition-all duration-300 hover:from-rose-500 hover:to-rose-400 cursor-pointer"
                  style={{ height: `${(item.expenses / 60000) * 140}px` }}
                  onMouseEnter={() => setHoveredBar({ index, type: 'expense' })}
                  onMouseLeave={() => setHoveredBar(null)}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex ml-10">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
            {item.month}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 py-2 px-4 rounded-lg border border-green-100 dark:border-green-800">
        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Avg. monthly savings: <span className="font-bold text-green-600 dark:text-green-400">₹{avgSavings.toLocaleString('en-IN')}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">(sample)</span>
        </p>
      </div>
    </div>
  );
};

export default HeroChart;