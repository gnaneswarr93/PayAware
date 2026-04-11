import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { notificationService } from './notificationService';

export interface Transaction {
    id?: number;
    created_at?: string;
    amount: number;
    type: 'debit' | 'credit';
    description: string;
    merchant?: string;
    category?: string;
    confidence?: number;
    date?: string;
    purpose?: string;
    location?: string;
    user_id?: string;
}

// In-memory store for demo user
const demoTransactions: Transaction[] = [];

export const transactionService = {
    /**
     * Add a new transaction (Auto-categorized if expense)
     */
    async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>, userId?: string) {
        
        let targetUserId = userId;
        if (!targetUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            targetUserId = user?.id;
        }
        
        if (!targetUserId) throw new Error("User not logged in");

        // Mock for Demo User
        if (targetUserId === 'demo-user-id') {
            let category = transaction.category || 'Income';
            let confidence = transaction.confidence || 1.0;

            if (transaction.type === 'debit' && (!transaction.category || transaction.category === 'Uncategorized')) {
                try {
                    const prediction = await api.predictCategory(transaction.description);
                    
                    if (prediction.category && prediction.category !== 'Uncategorized') {
                         category = prediction.category;
                         confidence = prediction.confidence;
                    } else {
                        // Fallback to local keywords if AI returns Uncategorized
                        category = categorizeLocal(transaction.description);
                        confidence = 0.8; 
                    }
                } catch (e) {
                    // Fallback to local keywords if AI request fails
                    console.warn("AI prediction failed, using local fallback", e);
                    category = categorizeLocal(transaction.description);
                    confidence = 0.8;
                }
            }

            const newTx = {
                ...transaction,
                id: Math.floor(Math.random() * 10000),
                created_at: new Date().toISOString(),
                user_id: targetUserId,
                category: category,
                confidence: confidence,
                date: new Date().toISOString()
            };
            demoTransactions.push(newTx);
            return newTx;
        }

        let category = transaction.category || 'Income';
        let confidence = transaction.confidence || 1.0;

        // Auto-categorize if it's an expense and no category provided
        if (transaction.type === 'debit' && (!transaction.category || transaction.category === 'Uncategorized')) {
            const prediction = await api.predictCategory(transaction.description);
            category = prediction.category;
            confidence = prediction.confidence;
        }

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                ...transaction,
                user_id: targetUserId,
                category,
                confidence,
                date: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        
        // --- BUdget Alert Logic ---
        try {
            const budget = Number(localStorage.getItem('payaware_budget')) || 20000;
            const summary = await this.getFinancialSummary(targetUserId);
            
            if (transaction.type === 'debit') {
                const percent = (summary.expense / budget) * 100;
                
                if (percent >= 100) {
                    await notificationService.notify(
                        "🚨 Budget Alert: OVER LIMIT!",
                        `You have exceeded your monthly budget of ₹${budget.toLocaleString()}. Spent: ₹${summary.expense.toLocaleString()}.`
                    );
                } else if (percent >= 85) {
                    await notificationService.notify(
                        "⚠️ Budget Alert: Critical",
                        `You have reached ${percent.toFixed(0)}% of your monthly budget (₹${budget.toLocaleString()}).`
                    );
                }
            }
        } catch (alertError) {
            console.warn("Budget alert trigger failed", alertError);
        }

        return data;
    },

    /**
     * Get all transactions for current user
     */
    async getTransactions(userId?: string) {
        let targetUserId = userId;
        if (!targetUserId) {
             const { data: { user } } = await supabase.auth.getUser();
             targetUserId = user?.id;
        }

        if (targetUserId === 'demo-user-id') {
            return demoTransactions.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
        }

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', targetUserId) // Explicitly filter by user ID (redundant with RLS but safe)
            .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Get financial summary (Balance, Income, Expense)
     */
    async getFinancialSummary(userId?: string) {
        const transactions = await this.getTransactions(userId);
        
        let income = 0;
        let expense = 0;

        transactions.forEach(tx => {
            const amount = Number(tx.amount);
            if (tx.type === 'credit') {
                income += amount;
            } else {
                expense += amount;
            }
        });

        return {
            balance: income - expense,
            income,
            expense
        };
    }
};

function categorizeLocal(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('uber') || desc.includes('ola') || desc.includes('rapido') || desc.includes('fuel') || desc.includes('petrol') || desc.includes('metro') || desc.includes('cab')) return 'Expense__Transportation__Cab & Fuel';
    if (desc.includes('swiggy') || desc.includes('zomato') || desc.includes('restaurant') || desc.includes('food') || desc.includes('burger') || desc.includes('pizza') || desc.includes('cafe') || desc.includes('mcdonald') || desc.includes('coffee')) return 'Expense__Food & Dining__Restaurants & Takeaway';
    if (desc.includes('grocery') || desc.includes('mart') || desc.includes('supermarket') || desc.includes('bigbasket') || desc.includes('blinkit') || desc.includes('zepto')) return 'Expense__Groceries__Grocery Store';
    if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('myntra') || desc.includes('shopping') || desc.includes('meesho') || desc.includes('nykaa')) return 'Expense__Shopping__Online Shopping';
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('prime') || desc.includes('hotstar') || desc.includes('movie') || desc.includes('cinema') || desc.includes('subscription')) return 'Expense__Subscriptions & Memberships__Streaming & Entertainment';
    if (desc.includes('hospital') || desc.includes('pharmacy') || desc.includes('doctor') || desc.includes('medicine') || desc.includes('medical') || desc.includes('health') || desc.includes('clinic')) return 'Expense__Healthcare__Medical & Pharmacy';
    if (desc.includes('electricity') || desc.includes('water') || desc.includes('wifi') || desc.includes('broadband') || desc.includes('recharge') || desc.includes('dth') || desc.includes('jio') || desc.includes('airtel')) return 'Expense__Housing & Utilities__Utilities';
    if (desc.includes('rent') || desc.includes('house rent') || desc.includes('pg')) return 'Expense__Housing & Utilities__Rent';
    if (desc.includes('emi') || desc.includes('loan')) return 'Expense__Debt Payments__EMI';
    if (desc.includes('salary') || desc.includes('income') || desc.includes('bonus')) return 'Income__Salary & Wages__Monthly Salary';
    if (desc.includes('refund') || desc.includes('cashback')) return 'Income__Miscellaneous__Refund';
    
    return 'Expense__Miscellaneous__General';
}
