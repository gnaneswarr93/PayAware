import React, { useState } from "react";
import TransactionDetectionCenter from "../components/TransactionDetectionCenter";
import ClipboardTester from "../components/ClipboardTester";

const TransactionDetection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"detection" | "tester">(
    "detection"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Transaction Detection
          </h1>
          <p className="text-gray-600">
            Automatically detect and categorize your financial transactions from
            system notifications
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("detection")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "detection"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}>
                Detection Center
              </button>
              <button
                onClick={() => setActiveTab("tester")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "tester"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}>
                Troubleshooting Tester
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "detection" ? (
          <TransactionDetectionCenter />
        ) : (
          <ClipboardTester />
        )}

        {/* Quick Help */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Having Issues?</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              • If detection isn't working, use the "Troubleshooting Tester" tab
              above
            </p>
            <p>
              • Make sure you're using HTTPS (required for clipboard access)
            </p>
            <p>• Grant clipboard and notification permissions when prompted</p>
            <p>
              • Try copying messages that clearly contain transaction keywords
            </p>
            <p>• Check browser console for error messages (F12 → Console)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetection;
