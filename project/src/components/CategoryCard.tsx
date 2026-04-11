import React from 'react';

interface Category {
  name: string;
  amount: number;
  color: string;
  icon: string;
}

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  // Simulate a budget (Actual spent + 25% buffer for visual logic)
  const syntheticBudget = Math.ceil((category.amount * 1.25) / 100) * 100; // Round up to nearest 100
  const progress = Math.min((category.amount / syntheticBudget) * 100, 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <div className={`bg-gradient-to-r ${category.color} text-white p-2.5 rounded-xl group-hover:scale-105 transition-transform shadow-sm`}>
          <span className="text-lg">{category.icon}</span>
        </div>
        <div className="text-right min-w-0 flex-1 ml-3">
          <p className="text-lg font-bold text-gray-800 dark:text-white truncate">
            ₹{category.amount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{category.name}</p>
        </div>
      </div>
      
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-2">
        <div
          className={`bg-gradient-to-r ${category.color} h-1.5 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 font-medium">
        <span>Target: ₹{syntheticBudget.toLocaleString('en-IN')}</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export default CategoryCard;