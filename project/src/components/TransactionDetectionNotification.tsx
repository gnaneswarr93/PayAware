import React, { useState, useEffect } from "react";
import {
  X,
  DollarSign,
  MapPin,
  Tag,
  Check,
  Zap,
} from "lucide-react";
import { DetectedTransaction } from "../hooks/useTransactionDetection";
import { api, TransactionCategory } from "../lib/api";


interface TransactionDetectionNotificationProps {
  transaction: DetectedTransaction;
  onDismiss: (id: string) => void;
  onSave: (id: string) => void;
}

const TransactionDetectionNotification: React.FC<
  TransactionDetectionNotificationProps
> = ({ transaction, onDismiss, onSave }) => {
  const [showDetails, setShowDetails] = useState(false);

  const [categorization, setCategorization] = useState<{
    category: TransactionCategory | string;
    confidence: number;
    reasoning: string;
  }>({
    category: "Other",
    confidence: 0,
    reasoning: "Loading...",
  });

  useEffect(() => {
    const fetchCategory = async () => {
      const prediction = await api.predictCategory(transaction.description);
      setCategorization({
          category: prediction.category,
          confidence: prediction.confidence,
          reasoning: "AI Prediction Model"
      });
    };
    fetchCategory();
  }, [transaction]);

  const getTransactionTypeIcon = () => {
    return transaction.type === "debit" ? (
      <div className="bg-red-100 p-2 rounded-lg">
        <DollarSign className="h-5 w-5 text-red-600" />
      </div>
    ) : (
      <div className="bg-green-100 p-2 rounded-lg">
        <DollarSign className="h-5 w-5 text-green-600" />
      </div>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: "bg-orange-100 text-orange-800",
      Travel: "bg-blue-100 text-blue-800",
      Shopping: "bg-purple-100 text-purple-800",
      Bills: "bg-green-100 text-green-800",
      Entertainment: "bg-indigo-100 text-indigo-800",
      Health: "bg-pink-100 text-pink-800",
      Income: "bg-emerald-100 text-emerald-800",
      Transfer: "bg-gray-100 text-gray-800",
      Other: "bg-slate-100 text-slate-800",
    };
    return colors[category] || colors["Other"];
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 w-96 transform transition-all duration-300 ${
        showDetails ? "scale-105" : "scale-100"
      }`}>
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-2 rounded-lg">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                Transaction Detected
              </h3>
              <p className="text-sm text-gray-600">
                {transaction.type === "debit"
                  ? "Money spent"
                  : "Money received"}
              </p>
            </div>
          </div>
          <button
            onClick={() => onDismiss(transaction.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            {getTransactionTypeIcon()}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-800">
                  ₹{transaction.amount.toFixed(2)}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === "debit"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                  {transaction.type}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {transaction.merchant || transaction.description}
              </p>
            </div>
          </div>

          {/* Auto-categorization */}
          <div className="flex items-center space-x-2 mb-3">
            <Tag className="h-4 w-4 text-gray-500" />
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                categorization.category
              )}`}>
              {categorization.category}
            </span>
            <span className="text-xs text-gray-500">
              ({(categorization.confidence * 100).toFixed(0)}% confidence)
            </span>
          </div>

          {/* Location if available */}
          {transaction.merchant && (
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {transaction.merchant}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => onSave(transaction.id)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 px-4 rounded-lg hover:scale-105 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-1">
              <Check className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm">
              {showDetails ? "Hide" : "Details"}
            </button>
          </div>

          {/* Details */}
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Description
                </p>
                <p className="text-sm text-gray-800">
                  {transaction.description}
                </p>
              </div>

              {transaction.account && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Account
                  </p>
                  <p className="text-sm text-gray-800">{transaction.account}</p>
                </div>
              )}

              {transaction.balance && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Balance
                  </p>
                  <p className="text-sm text-gray-800">
                    ₹{transaction.balance.toFixed(2)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Time
                </p>
                <p className="text-sm text-gray-800">
                  {transaction.timestamp.toLocaleTimeString()}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Categorization
                </p>
                <p className="text-sm text-gray-600">
                  {categorization.reasoning}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetectionNotification;
