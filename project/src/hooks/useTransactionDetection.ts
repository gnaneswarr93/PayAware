import { useState, useEffect, useCallback } from "react";
import { notificationListener, setNotificationCallback } from "../lib/notificationListener";
import { ParsedTransaction } from "../lib/messageParser";
import { api, TransactionCategory } from "../lib/api";

export interface DetectedTransaction extends ParsedTransaction {
  id: string;
  timestamp: Date;
  status: "pending" | "saved" | "dismissed";
}

export interface UseTransactionDetectionReturn {
  isMonitoring: boolean;
  detectedTransactions: DetectedTransaction[];
  startMonitoring: () => void;
  stopMonitoring: () => void;
  dismissTransaction: (id: string) => void;
  saveTransaction: (
    id: string,
    additionalData: {
      purpose: string;
      location: string;
      category: TransactionCategory;
    }
  ) => void;
  listenerStatus: {
    isListening: boolean;
    hasClipboardAccess: boolean;
    notificationPermission: NotificationPermission;
  };
}

export const useTransactionDetection = (): UseTransactionDetectionReturn => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [detectedTransactions, setDetectedTransactions] = useState<DetectedTransaction[]>(() => {
      try {
          const saved = localStorage.getItem('pending_transactions');
          return saved ? JSON.parse(saved).map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) })) : [];
      } catch (e) {
          console.error("Failed to load transactions", e);
          return [];
      }
  });

  // Persist pending transactions
  useEffect(() => {
     const pending = detectedTransactions.filter(t => t.status === 'pending');
     localStorage.setItem('pending_transactions', JSON.stringify(pending));
  }, [detectedTransactions]);
  const [listenerStatus, setListenerStatus] = useState({
    isListening: false,
    hasClipboardAccess: false,
    notificationPermission: "denied" as NotificationPermission,
  });

  // Update listener status
  const updateListenerStatus = useCallback(() => {
    const status = notificationListener.getStatus();
    setListenerStatus(status);
  }, []);

  // Handle new transaction detection
  const handleTransactionDetected = useCallback(
    async (transaction: ParsedTransaction) => {
      
      // Fast path: Android Direct Reply ("Inline Purpose" entered from notification shade)
      if (transaction.purposeReply) {
          console.log("Inline Purpose Reply received:", transaction.purposeReply);
          try {
              // 1. Get AI categorization using the typed purpose
              const prediction = await api.predictCategory(transaction.purposeReply);
              const category = String(prediction.category) as TransactionCategory;
              
              // 2. Load the transactionService
              const { transactionService } = await import("../services/transactionService");
              
              // 3. Save silently — no modal needed
              await transactionService.addTransaction({
                  amount: transaction.amount,
                  type: transaction.type,
                  description: transaction.purposeReply,
                  merchant: transaction.merchant || transaction.account || "Manual Entry",
                  category: category,
                  confidence: prediction.confidence || 1.0,
                  date: new Date().toISOString(),
                  purpose: transaction.purposeReply,
                  location: transaction.merchant || "SMS Auto"
              });

              console.log("Inline replied transaction auto-saved to Supabase successfully");
              return; // Skip putting it in the 'detected' queue
          } catch (e) {
              console.error("Failed to auto-save inline reply transaction", e);
              // Fall back to showing the modal if save fails
          }
      }

      // Normal path: Queue it up to show the modal
      const detectedTransaction: DetectedTransaction = {
        ...transaction,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        status: "pending",
      };

      setDetectedTransactions((prev) => [detectedTransaction, ...prev]);

      // Pre-fetch Category for when the user opens the modal
      const prediction = await api.predictCategory(transaction.description);
      const categorization = {
          category: prediction.category as TransactionCategory,
          confidence: prediction.confidence,
          reasoning: "AI Prediction"
      };

      console.log("New transaction detected (queued for manual confirmation):", {
        transaction: detectedTransaction,
        categorization,
      });
    },
    []
  );



  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    // Connect the hook's callback to the listener
    setNotificationCallback(handleTransactionDetected);

    // Start listening
    notificationListener.startListening();
    setIsMonitoring(true);
    updateListenerStatus();

    console.log("Transaction detection started");
  }, [
    isMonitoring,
    handleTransactionDetected,
    updateListenerStatus,
  ]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    notificationListener.stopListening();
    setIsMonitoring(false);
    updateListenerStatus();

    console.log("Transaction detection stopped");
  }, [isMonitoring, updateListenerStatus]);

  // Dismiss transaction
  const dismissTransaction = useCallback((id: string) => {
    setDetectedTransactions((prev) =>
      prev.map((tx) =>
        tx.id === id ? { ...tx, status: "dismissed" as const } : tx
      )
    );

    // Remove dismissed transactions after a delay
    setTimeout(() => {
      setDetectedTransactions((prev) => prev.filter((tx) => tx.id !== id));
    }, 1000);
  }, []);

  // Save transaction with additional data
  const saveTransaction = useCallback(
    async (
      id: string,
      additionalData: {
        purpose: string;
        location: string;
        category: TransactionCategory;
      }
    ) => {
      // Find the transaction first
      let transactionToSave: DetectedTransaction | undefined;
      setDetectedTransactions((prev) => {
        const tx = prev.find((t) => t.id === id);
        if (tx) transactionToSave = tx;
        return prev; 
      });

      if (!transactionToSave) return;

      try {
        const { transactionService } = await import("../services/transactionService");
        
        await transactionService.addTransaction({
            amount: transactionToSave.amount,
            type: transactionToSave.type,
            description: additionalData.purpose, // Use purpose as main description
            merchant: additionalData.location,   // Use location as merchant/location
            category: additionalData.category,
            confidence: 1.0, // Manual/Verified
            date: transactionToSave.timestamp.toISOString(),
            purpose: additionalData.purpose,
            location: additionalData.location
        });

        console.log("Transaction saved to Supabase successfully");

        // Remove from detected list after saving
        setDetectedTransactions((prev) => prev.filter((tx) => tx.id !== id));
      } catch (error) {
        console.error("Failed to save transaction:", error);
        alert("Failed to save transaction to backend. Please check your connection.");
      }
    },
    []
  );

  // Initialize listener status on mount
  useEffect(() => {
    updateListenerStatus();
  }, [updateListenerStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isMonitoring) {
        notificationListener.stopListening();
      }
    };
  }, [isMonitoring]);

  return {
    isMonitoring,
    detectedTransactions,
    startMonitoring,
    stopMonitoring,
    dismissTransaction,
    saveTransaction,
    listenerStatus,
  };
};
