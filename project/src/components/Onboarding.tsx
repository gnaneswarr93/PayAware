import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Mic, Bell, Zap, Shield, TrendingUp, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [budget, setBudget] = useState('20000');

  const steps = [
    {
      title: 'Welcome to Payaware! 👋',
      description: 'Your intelligent expense tracking companion that helps you take control of your finances.',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Mic className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Voice Logging</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Just speak: "500 rupees for coffee" and we'll log it!
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Auto-Detection</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Automatically categorizes transactions from SMS
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">AI Forecasting</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Predict future expenses with machine learning
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Smart Reminders</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Daily summaries to keep you on track
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-lg text-white">
            <p className="text-lg font-semibold mb-2">Why Payaware?</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Simple, fast, and completely FREE</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Your data stays private and secure</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Powered by AI for smart insights</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'Set Your Monthly Budget 💰',
      description: "We'll help you stay within your spending limits",
      icon: TrendingUp,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-8 rounded-xl">
            <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What's your monthly budget?
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-500 dark:text-gray-400">
                ₹
              </span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-12 pr-6 py-4 text-3xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-300 dark:bg-gray-700 dark:text-white transition-all"
                placeholder="20000"
              />
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Don't worry, you can always change this later in Settings
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              We'll help you by:
            </h4>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>Showing a progress bar as you spend</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>Alerting you when you reach 85% of your budget</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>Warning you before you exceed your limit</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'Enable Notifications 🔔',
      description: 'Get daily summaries and important alerts (optional but recommended)',
      icon: Bell,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <Bell className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Stay Informed, Stay in Control
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We'll send you a friendly reminder with your spending summary, and instant alerts for your budget limits.
            </p>
            <button
              onClick={async () => {
                const isNative = Capacitor.isNativePlatform();
                if (isNative) {
                    try {
                        const { LocalNotifications } = await import('@capacitor/local-notifications');
                        const permStatus = await LocalNotifications.requestPermissions();
                        if (permStatus.display === 'granted') {
                            setCurrentStep(currentStep + 1);
                            return;
                        }
                    } catch (e) {
                        console.error("Capacitor local notifications permission failed:", e);
                    }
                } 
                
                // Fallback to Web Notification API
                if ('Notification' in window) {
                    Notification.requestPermission().then(() => {
                        setCurrentStep(currentStep + 1);
                    });
                } else {
                    setCurrentStep(currentStep + 1); // Unsupported device
                }
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
            >
              Enable Notifications
            </button>
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="block w-full mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Skip for now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="font-medium text-gray-900 dark:text-white mb-1">🎯 Budget Alerts</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Know when you're close to your budget limit
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="font-medium text-gray-900 dark:text-white mb-1">📊 Daily Summary</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review your spending at noon each day
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Enable SMS Auto-Detection 📱',
      description: 'Automatically log expenses when you receive a bank SMS (Android only)',
      icon: Zap,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 p-8 rounded-xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
              <Zap className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Magic Expense Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              When your bank sends a "₹500 Debited" text, PayAware reads it, uses AI to categorize it, and saves it automatically. Zero manual entry!
            </p>
            <button
              onClick={async () => {
                const isNative = Capacitor.isNativePlatform();
                const smsObj = (window as any).SMS;
                if (isNative && smsObj) {
                    try {
                        const smsPlugin = smsObj;
                        if (typeof smsPlugin.hasPermission === 'function') {
                            smsPlugin.hasPermission((hasPermission: boolean) => {
                                if (hasPermission) {
                                    setCurrentStep(currentStep + 1);
                                } else {
                                    if (typeof smsPlugin.requestPermission === 'function') {
                                        smsPlugin.requestPermission(() => {
                                            setCurrentStep(currentStep + 1); // Success
                                        }, () => {
                                            setCurrentStep(currentStep + 1); // Error/Denied
                                        });
                                    } else {
                                        setCurrentStep(currentStep + 1); // Missing function
                                    }
                                }
                            }, () => {
                                setCurrentStep(currentStep + 1); // Error checking
                            });
                        } else {
                            // Method missing, skip nicely
                            setCurrentStep(currentStep + 1);
                        }
                    } catch (e) {
                        console.error("SMS permission failed:", e);
                        setCurrentStep(currentStep + 1);
                    }
                } else {
                    setCurrentStep(currentStep + 1); // Not supported (Web/iOS)
                }
              }}
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
            >
              Allow SMS Access
            </button>
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="block w-full mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Skip for now
            </button>
            <p className="text-xs text-gray-500 mt-4 opacity-70">
              Your SMS data never leaves your device. Local AI logic is used to ensure maximum privacy.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "You're All Set! 🎉",
      description: 'Time to start tracking your expenses',
      icon: CheckCircle,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 rounded-xl text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <CheckCircle className="h-14 w-14 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Aboard!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Your financial journey starts now
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quick Start Tips:
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Try Voice Logging
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click the mic icon and say your expense
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Add Your First Transaction
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click "+ Add Transaction" to log manually
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Explore Analytics
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check forecasts and spending insights
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save budget and mark onboarding complete
      localStorage.setItem('payaware_budget', budget);
      localStorage.setItem('payaware_onboarding_complete', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('payaware_budget', budget);
    localStorage.setItem('payaware_onboarding_complete', 'true');
    onComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 z-50 overflow-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{step.title}</h2>
                  <p className="text-blue-100">{step.description}</p>
                </div>
              </div>
              {currentStep > 0 && (
                <button
                  onClick={handleSkip}
                  className="text-white/80 hover:text-white"
                  title="Skip onboarding"
                >
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    idx <= currentStep
                      ? 'bg-white'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {step.content}
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 flex items-center justify-between">
            {currentStep > 0 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
            >
              <span>{currentStep === steps.length - 1 ? "Let's Go!" : 'Continue'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
