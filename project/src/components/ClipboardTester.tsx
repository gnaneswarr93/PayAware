import React, { useState } from "react";
import { Clipboard, TestTube, Zap, AlertTriangle } from "lucide-react";
import { MessageParser } from "../lib/messageParser";
import { api } from "../lib/api";

const ClipboardTester: React.FC = () => {
  const [testMessage, setTestMessage] = useState("");
  const [pasteResult, setPasteResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sampleMessages = [
    "Your account xxxx1234 has been debited for Rs.150.00 at McDonald's on 15/01/2025",
    "Rs.500.00 has been credited to your account xxxx5678 from Salary",
    "Payment of $25.99 debited from your card for Netflix subscription",
    "Amount credited Rs.2000.00 from UPI transfer",
    "Uber ride fare Rs.180 debited from your account",
  ];

  const testMessageParsing = async (message: string) => {
    setIsLoading(true);

    try {
      // Test message parsing
      const parseResult = MessageParser.parseMessage(message);

      if (parseResult.isTransaction && parseResult.transaction) {
        // Test categorization
        const prediction = await api.predictCategory(parseResult.transaction.description);
        const categorization = {
            category: prediction.category,
            confidence: prediction.confidence,
            reasoning: "AI Prediction Model"
        };

        setPasteResult({
          parseResult,
          categorization,
          success: true,
        });
      } else {
        setPasteResult({
          parseResult,
          success: false,
          error: "No transaction detected in message",
        });
      }
    } catch (error) {
      setPasteResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    setIsLoading(false);
  };

  const handlePasteTest = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTestMessage(text);
      await testMessageParsing(text);
    } catch (error) {
      setPasteResult({
        success: false,
        error:
          "Failed to read from clipboard. Please paste manually or grant clipboard permissions.",
      });
    }
  };

  const handleManualTest = async () => {
    if (testMessage.trim()) {
      await testMessageParsing(testMessage);
    }
  };

  const loadSampleMessage = (message: string) => {
    setTestMessage(message);
  };

  return (
    <div className="space-y-6">
      {/* Detection Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-blue-800">
            Message Detection Requirements
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">
              ✅ Required Elements:
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • <strong>Transaction Type:</strong> "debited", "credited",
                "spent", "charged", or "payment"
              </li>
              <li>
                • <strong>Amount:</strong> A number with currency (Rs, $, ₹)
                like "Rs.150" or "$25.99"
              </li>
              <li>
                • <strong>Context:</strong> Should indicate money movement
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-blue-800 mb-2">❌ Won't Work:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• "Got payment" (no amount)</li>
              <li>• "McDonald's: $15" (no transaction keyword)</li>
              <li>• "Transaction successful" (no amount or keywords)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Tester */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-lg">
            <TestTube className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Clipboard Detection Tester
            </h2>
            <p className="text-gray-600">
              Test if message parsing works correctly
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handlePasteTest}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-lg hover:scale-105 transition-all duration-300 font-medium disabled:opacity-50">
            <Clipboard className="h-5 w-5" />
            <span>Test Clipboard Content</span>
          </button>

          <button
            onClick={handleManualTest}
            disabled={isLoading || !testMessage.trim()}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-3 rounded-lg hover:scale-105 transition-all duration-300 font-medium disabled:opacity-50">
            <Zap className="h-5 w-5" />
            <span>Test Manual Input</span>
          </button>
        </div>

        {/* Manual Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste or type a transaction message:
          </label>
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Example: Your account has been debited for Rs.150.00 at McDonald's"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            rows={3}
          />
        </div>

        {/* Sample Messages */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Try these working sample messages:
          </h3>
          <div className="space-y-2">
            {sampleMessages.map((message, index) => (
              <button
                key={index}
                onClick={() => loadSampleMessage(message)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors border-l-4 border-blue-400">
                {message}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {pasteResult && (
          <div
            className={`p-4 rounded-lg border ${
              pasteResult.success
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}>
            <h3
              className={`font-semibold mb-3 ${
                pasteResult.success ? "text-green-800" : "text-red-800"
              }`}>
              {pasteResult.success
                ? "✅ Transaction Detected!"
                : "❌ No Transaction Found"}
            </h3>

            {pasteResult.success ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-700">Parse Result:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(pasteResult.parseResult, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Categorization:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(pasteResult.categorization, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-red-700 font-medium">{pasteResult.error}</p>

                <div className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">
                  <p className="font-medium mb-2">
                    Your message needs these elements:
                  </p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>
                      <strong>Transaction Type:</strong> "debited", "credited",
                      "spent", "charged", or "payment"
                    </li>
                    <li>
                      <strong>Amount:</strong> A number with currency (Rs, $, ₹)
                      like "Rs.150" or "$25.99"
                    </li>
                    <li>
                      <strong>Example:</strong> "Rs.150 debited at McDonald's"
                    </li>
                  </ul>
                </div>

                <p className="text-sm text-red-600">
                  Try copying one of the sample messages above to test the
                  system.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Test Messages */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="font-semibold text-yellow-800 mb-3">
          🎯 Quick Test Messages
        </h3>
        <p className="text-sm text-yellow-700 mb-4">
          Copy and paste these exact messages to test:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <button
              onClick={() => loadSampleMessage("Rs.150 debited at McDonald's")}
              className="w-full text-left p-2 bg-yellow-100 hover:bg-yellow-200 rounded text-sm font-mono">
              Rs.150 debited at McDonald's
            </button>
            <button
              onClick={() => loadSampleMessage("Payment of $25.99 for Netflix")}
              className="w-full text-left p-2 bg-yellow-100 hover:bg-yellow-200 rounded text-sm font-mono">
              Payment of $25.99 for Netflix
            </button>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => loadSampleMessage("Rs.500 credited from Salary")}
              className="w-full text-left p-2 bg-yellow-100 hover:bg-yellow-200 rounded text-sm font-mono">
              Rs.500 credited from Salary
            </button>
            <button
              onClick={() => loadSampleMessage("Uber ride Rs.180 spent")}
              className="w-full text-left p-2 bg-yellow-100 hover:bg-yellow-200 rounded text-sm font-mono">
              Uber ride Rs.180 spent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClipboardTester;
