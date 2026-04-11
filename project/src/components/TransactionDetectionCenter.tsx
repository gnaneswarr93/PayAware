import React, { useState } from "react";
import {
  Monitor,
  Play,
  Square,
  Settings,
  Zap,
  Shield,
  Info,
  CheckCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { useTransactionDetection, DetectedTransaction } from "../hooks/useTransactionDetection";
import AutoDetectTransactionModal from "./AutoDetectTransactionModal";
import TransactionDetectionNotification from "./TransactionDetectionNotification";
import { TransactionCategory } from "../lib/api";

const TransactionDetectionCenter: React.FC = () => {
  const {
    isMonitoring,
    detectedTransactions,
    startMonitoring,
    stopMonitoring,
    dismissTransaction,
    saveTransaction,
    listenerStatus,
  } = useTransactionDetection();

  const [showSettings, setShowSettings] = useState(false);
  const [modalTransaction, setModalTransaction] =
    useState<DetectedTransaction | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleSaveTransaction = async (
    id: string,
    additionalData: {
      purpose: string;
      location: string;
      category: TransactionCategory;
    }
  ) => {
    // Save transaction with additional data
    await saveTransaction(id, additionalData);
    setModalTransaction(null);
  };

  const handleQuickSave = (transaction: any) => {
    // Quick save with auto-detected data
    const additionalData = {
      purpose: transaction.description,
      location: transaction.merchant || "",
      category: "Other" as TransactionCategory,
    };
    saveTransaction(transaction.id, additionalData);
  };

  const openModalForTransaction = (transaction: any) => {
    setModalTransaction(transaction);
  };

  const getStatusColor = () => {
    if (!listenerStatus.isListening) return "text-gray-500";
    if (
      listenerStatus.hasClipboardAccess &&
      listenerStatus.notificationPermission === "granted"
    ) {
      return "text-green-500";
    }
    return "text-yellow-500";
  };

  const getStatusIcon = () => {
    if (!listenerStatus.isListening) return <Square className="h-5 w-5" />;
    if (
      listenerStatus.hasClipboardAccess &&
      listenerStatus.notificationPermission === "granted"
    ) {
      return <CheckCircle className="h-5 w-5" />;
    }
    return <AlertCircle className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Main Control Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-lg">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Transaction Detection Center
              </h2>
              <p className="text-gray-600">
                Monitor and auto-categorize financial transactions
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Info className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status Display */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`${getStatusColor()}`}>{getStatusIcon()}</div>
              <span className="font-medium text-gray-700">
                Monitoring Status
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {listenerStatus.isListening ? "Active" : "Inactive"}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-gray-700">Permissions</span>
            </div>
            <p className="text-sm text-gray-600">
              Clipboard:{" "}
              {listenerStatus.hasClipboardAccess ? "Granted" : "Denied"}
            </p>
            <p className="text-sm text-gray-600">
              Notifications: {listenerStatus.notificationPermission}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="font-medium text-gray-700">Detected Today</span>
            </div>
            <p className="text-sm text-gray-600">
              {
                detectedTransactions.filter(
                  (tx) =>
                    tx.timestamp.toDateString() === new Date().toDateString()
                ).length
              }{" "}
              transactions
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-4">
          {!isMonitoring ? (
            <button
              onClick={startMonitoring}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition-all duration-300 font-medium">
              <Play className="h-5 w-5" />
              <span>Start Monitoring</span>
            </button>
          ) : (
            <button
              onClick={stopMonitoring}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition-all duration-300 font-medium">
              <Square className="h-5 w-5" />
              <span>Stop Monitoring</span>
            </button>
          )}

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium">
            <Info className="h-5 w-5" />
            <span>How it Works</span>
          </button>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              How Transaction Detection Works
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Monitors system clipboard for transaction messages</li>
              <li>• Parses debit/credit notifications automatically</li>
              <li>• Categorizes transactions using AI-powered logic</li>
              <li>
                • Shows instant notifications when transactions are detected
              </li>
              <li>• Allows you to add purpose and location details</li>
              <li>
                • Works with bank SMS, UPI notifications, and payment apps
              </li>
            </ul>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">
              Detection Settings
            </h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-700">
                  Enable clipboard monitoring
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-700">
                  Show desktop notifications
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-700">
                  Auto-categorize transactions
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700">
                  Include location detection
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Detected Transactions */}
      {detectedTransactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Detections
            </h3>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {detectedTransactions.length} pending
            </span>
          </div>

          <div className="space-y-3">
            {detectedTransactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      transaction.type === "debit"
                        ? "bg-red-100"
                        : "bg-green-100"
                    }`}>
                    <Zap
                      className={`h-4 w-4 ${
                        transaction.type === "debit"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      ₹{transaction.amount.toFixed(2)} {transaction.type}
                    </p>
                    <p className="text-sm text-gray-600">
                      {transaction.merchant || transaction.description}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleQuickSave(transaction)}
                    className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors">
                    Quick Save
                  </button>
                  <button
                    onClick={() => openModalForTransaction(transaction)}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors">
                    Edit & Save
                  </button>
                  <button
                    onClick={() => dismissTransaction(transaction.id)}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Detection Notifications */}
      {detectedTransactions.map((transaction) => (
        <TransactionDetectionNotification
          key={transaction.id}
          transaction={transaction}
          onDismiss={dismissTransaction}
          onSave={handleQuickSave}
        />
      ))}

      {/* Auto-Detect Transaction Modal */}
      {modalTransaction && (
        <AutoDetectTransactionModal
          isOpen={!!modalTransaction}
          onClose={() => setModalTransaction(null)}
          detectedTransaction={modalTransaction}
          onSave={(data) => handleSaveTransaction(modalTransaction.id, data)}
        />
      )}
    </div>
  );
};

export default TransactionDetectionCenter;
