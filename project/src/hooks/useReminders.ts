/**
 * useReminders - Global daily reminder & budget alert hook.
 * Designed to be called once from App.tsx so it runs across all pages.
 */
import { useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { notificationService } from '../services/notificationService';

export const useReminders = (userId?: string) => {
  useEffect(() => {
    // Only run if reminders are enabled by the user
    const isEnabled = localStorage.getItem('payaware_reminders') === 'true';
    if (!isEnabled || !userId) return;

    const checkReminder = async () => {
      const now = new Date();

      // Fetch user-configured time (format "HH:MM", default "12:05")
      const configTime = localStorage.getItem('reminder_time') || "12:05";
      const [hourStr, minStr] = configTime.split(':');
      const targetHour = parseInt(hourStr, 10) || 12;
      const targetMinute = parseInt(minStr, 10) || 5;

      const isAfterTarget =
        now.getHours() > targetHour ||
        (now.getHours() === targetHour && now.getMinutes() >= targetMinute);

      if (!isAfterTarget) return;

      // Only fire once per calendar day
      const key = `reminder_${now.toDateString()}`;
      if (localStorage.getItem(key)) return;

      try {
        const transactions = await transactionService.getTransactions(userId);
        const monthlyBudget = Number(localStorage.getItem('payaware_budget')) || 20000;

        // Calculate month-to-date spend
        const activeMonthSpent = transactions.reduce((acc, tx) => {
          const d = new Date(tx.date!);
          return tx.type === 'debit' &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
            ? acc + Number(tx.amount)
            : acc;
        }, 0);

        // Count today's transactions
        const todayTxs = transactions.filter(tx => {
          if (!tx.date) return false;
          const d = new Date(tx.date);
          return (
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        });

        let title = 'Daily Check-in 💰';
        let body = '';

        if (activeMonthSpent > monthlyBudget) {
          title = '🚨 Budget Alert: OVER LIMIT!';
          body = `You've exceeded your monthly budget of ₹${monthlyBudget.toLocaleString('en-IN')}. Current spend: ₹${activeMonthSpent.toLocaleString('en-IN')}.`;
        } else if (activeMonthSpent >= monthlyBudget * 0.9) {
          const pct = ((activeMonthSpent / monthlyBudget) * 100).toFixed(0);
          title = '⚠️ Budget Alert: Critical';
          body = `You have used ${pct}% of your monthly budget (₹${monthlyBudget.toLocaleString('en-IN')}). Spend wisely!`;
        } else if (todayTxs.length === 0) {
          title = 'Missing Activity? 📋';
          body = "You have no recorded transactions today. Did you miss any?";
        } else {
          const todayExpense = todayTxs.reduce(
            (sum, tx) => sum + (tx.type === 'debit' ? Number(tx.amount) : 0),
            0
          );
          body = `You spent ₹${todayExpense.toLocaleString('en-IN')} today across ${todayTxs.length} transaction(s). All good!`;
        }

        await notificationService.notify(title, body);
        localStorage.setItem(key, 'true');
      } catch (err) {
        console.warn('[useReminders] Failed to send reminder:', err);
      }
    };

    // Check immediately on hook mount (catches tabs reopened after target time)
    checkReminder();

    // Then check every minute
    const timer = setInterval(checkReminder, 60_000);
    return () => clearInterval(timer);
  }, [userId]);
};
