import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import Features from "./pages/Features";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { backgroundService } from "./lib/backgroundService";
import TransactionDetection from "./pages/TransactionDetection";
import TransactionPopup from "./pages/TransactionPopup";

import { useTransactionDetection } from "./hooks/useTransactionDetection";
import { useReminders } from "./hooks/useReminders";
import AutoDetectTransactionModal from "./components/AutoDetectTransactionModal";
import { useState, useEffect } from "react";
import PWAInstallBanner from "./components/PWAInstallBanner";
import Auth from "./pages/Auth";
import ErrorBoundary from "./components/ErrorBoundary";
import { NetworkStatusBanner } from "./hooks/useOffline";
import { ThemeProvider } from "./contexts/ThemeContext";

// ─── Global SMS/clipboard transaction handler ──────────────────────────────
const GlobalTransactionHandler = () => {
    const { user } = useAuth();
    const { detectedTransactions, startMonitoring, dismissTransaction, saveTransaction, isMonitoring } = useTransactionDetection();
    const [modalTransaction, setModalTransaction] = useState<any>(null);
    const [ignoredIds, setIgnoredIds] = useState<string[]>([]);

    // Run daily reminders globally so they fire on every page
    useReminders(user?.id);

    // Auto-start SMS/clipboard monitoring as soon as the component mounts
    useEffect(() => {
        if (!isMonitoring) startMonitoring();
    }, [isMonitoring, startMonitoring]);

    // When a new pending transaction appears, open the modal immediately
    useEffect(() => {
        const pending = detectedTransactions.find(
            t => t.status === 'pending' && !ignoredIds.includes(t.id)
        );
        if (pending && !modalTransaction) {
            setModalTransaction(pending);
        }
    }, [detectedTransactions, modalTransaction, ignoredIds]);

    // FIX: destructure only the fields saveTransaction expects: { purpose, location, category }
    const handleSave = (id: string, data: { purpose: string; location: string; category: any }) => {
        saveTransaction(id, {
            purpose: data.purpose,
            location: data.location,
            category: data.category,
        });
        setModalTransaction(null);
    };

    const handleDismiss = (id: string) => {
        dismissTransaction(id);
        setModalTransaction(null);
    };

    const handleClose = (id: string) => {
        // "Remind Later" — ignore for this session so the modal doesn't re-open immediately
        setIgnoredIds(prev => [...prev, id]);
        setModalTransaction(null);
    };

    return (
        <>
            {modalTransaction && (
                <AutoDetectTransactionModal
                    isOpen={!!modalTransaction}
                    onClose={() => handleClose(modalTransaction.id)}
                    onDismiss={() => handleDismiss(modalTransaction.id)}
                    detectedTransaction={modalTransaction}
                    onSave={(data) => handleSave(modalTransaction.id, data)}
                />
            )}
        </>
    );
};

// ─── Notification permission request on first load ─────────────────────────
const NotificationPermissionRequester = () => {
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(perm => {
                console.log('[PayAware] Notification permission:', perm);
            });
        }
    }, []);
    return null;
};

// ─── Root App ─────────────────────────────────────────────────────────────
const App: React.FC = () => {
    useEffect(() => {
        backgroundService.init();
    }, []);

    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <Router>
                        <NotificationPermissionRequester />
                        <NetworkStatusBanner />
                        <PWAInstallBanner />
                        <GlobalTransactionHandler />
                        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                            <Routes>
                                {/* Suppress the public Header on dashboard/app pages */}
                                <Route path="/dashboard" element={<></>} />
                                <Route path="/analytics" element={<></>} />
                                <Route path="/transactions" element={<></>} />
                                <Route path="/categories" element={<></>} />
                                <Route path="/settings" element={<></>} />
                                <Route path="/reminders" element={<></>} />
                                <Route path="/transaction-detection" element={<></>} />
                                <Route path="/transaction-popup" element={<></>} />
                                <Route path="*" element={<Header />} />
                            </Routes>

                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/features" element={<Features />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/contact" element={<Contact />} />

                                {/* Auth */}
                                <Route path="/login" element={<Auth initialMode="login" />} />
                                <Route path="/signup" element={<Auth initialMode="signup" />} />

                                {/* Protected */}
                                <Route element={<PrivateRoute />}>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/analytics" element={<Dashboard />} />
                                    <Route path="/transactions" element={<Dashboard />} />
                                    <Route path="/categories" element={<Dashboard />} />
                                    <Route path="/settings" element={<Dashboard />} />
                                    <Route path="/reminders" element={<Dashboard />} />
                                    <Route path="/transaction-detection" element={<TransactionDetection />} />
                                    <Route path="/transaction-popup" element={<TransactionPopup />} />
                                </Route>
                            </Routes>
                        </div>
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
};

export default App;
