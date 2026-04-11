export interface PredictionResponse {
    category: string;
    confidence: number;
    input: string;
}

export type TransactionCategory =
  | "Food"
  | "Travel"
  | "Shopping"
  | "Bills"
  | "Entertainment"
  | "Health"
  | "Income"
  | "Transfer"
  | "Other"
  | "Uncategorized"
  | string;

// Use environment variable for API URL (crucial for Mobile testing)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// ── Offline rule-based categorizer (used when AI backend is unreachable) ──
// Returns format: "Type__Category__SubCategory" to match TransactionModal's CATEGORY_GROUPS
const CATEGORY_RULES: Array<{ keywords: string[]; type: string; category: string; subCategory: string }> = [
  { keywords: ['swiggy','zomato','restaurant','food','cafe','biryani','pizza','burger','meal','lunch','dinner','breakfast','dhaba','hotel','starbucks','mcdonald','kfc','domino'], type: 'Expense', category: 'Food & Dining', subCategory: 'Restaurants & Takeaway' },
  { keywords: ['grocery','supermarket','bigbasket','blinkit','zepto','dmart','reliance fresh','mart'], type: 'Expense', category: 'Groceries', subCategory: 'Grocery Store' },
  { keywords: ['uber','ola','rapido','metro','bus','train','flight','petrol','diesel','fuel','toll','parking','cab','auto','rapido','irctc','indigo','spicejet'], type: 'Expense', category: 'Transportation', subCategory: 'Cab & Fuel' },
  { keywords: ['amazon','flipkart','myntra','meesho','nykaa','shopping','mall','clothes','shoes','fashion','apparel'], type: 'Expense', category: 'Shopping', subCategory: 'Online Shopping' },
  { keywords: ['electricity','water','gas','broadband','wifi','internet','recharge','dth','airtel','jio','bsnl','act'], type: 'Expense', category: 'Housing & Utilities', subCategory: 'Utilities' },
  { keywords: ['insurance','lic','term plan','health insurance','premium'], type: 'Expense', category: 'Insurance', subCategory: 'Premium Payment' },
  { keywords: ['emi','loan repayment','credit card due','home loan','car loan'], type: 'Expense', category: 'Debt Payments', subCategory: 'EMI' },
  { keywords: ['netflix','spotify','prime','hotstar','movie','cinema','concert','game','entertainment','subscription','youtube premium'], type: 'Expense', category: 'Subscriptions & Memberships', subCategory: 'Streaming & Entertainment' },
  { keywords: ['pharmacy','hospital','doctor','medicine','clinic','apollo','health','medical','lab','test','diagnostic'], type: 'Expense', category: 'Healthcare', subCategory: 'Medical & Pharmacy' },
  { keywords: ['school','college','tuition','course','udemy','books','stationery','education','fees'], type: 'Expense', category: 'Education', subCategory: 'Tuition & Courses' },
  { keywords: ['rent','house rent','pg','paying guest','accommodation'], type: 'Expense', category: 'Housing & Utilities', subCategory: 'Rent' },
  { keywords: ['salary','income','bonus'], type: 'Income', category: 'Salary & Wages', subCategory: 'Monthly Salary' },
  { keywords: ['freelance','client payment','project payment'], type: 'Income', category: 'Business & Freelance', subCategory: 'Project Payment' },
  { keywords: ['refund','cashback','reversal'], type: 'Income', category: 'Miscellaneous', subCategory: 'Refund' },
  { keywords: ['interest','dividend','mutual fund','stocks'], type: 'Income', category: 'Investment Returns', subCategory: 'Returns' },
  { keywords: ['transfer','neft','rtgs','imps','upi','sent to','paid to','topup'], type: 'Expense', category: 'Miscellaneous', subCategory: 'Transfer' },
];

function categorizeLocally(description: string): string {
  const lower = description.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) {
      return `${rule.type}__${rule.category}__${rule.subCategory}`;
    }
  }
  return 'Expense__Miscellaneous__General';
}

export const api = {
    /**
     * Get category prediction from Python AI Backend, with offline fallback
     */
    async predictCategory(description: string): Promise<PredictionResponse> {
        // If no backend URL configured, use local rules immediately
        if (!API_BASE_URL) {
            return { category: categorizeLocally(description), confidence: 0.75, input: description };
        }

        console.log(`[API] Attempting prediction at: ${API_BASE_URL}/predict`);
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const response = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description }),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            if (!response.ok) {
                console.warn("[API] Backend error, using local categorizer");
                return { category: categorizeLocally(description), confidence: 0.75, input: description };
            }

            const data = await response.json();
            return { category: data.category, confidence: data.confidence, input: description };

        } catch (error: any) {
            // Network error or timeout — silently fall back to local rules
            console.warn("[API] Backend unreachable, using offline categorizer:", error.message);
            return { category: categorizeLocally(description), confidence: 0.75, input: description };
        }
    },

    async getForecast(transactions: { amount: number; date: string }[], period: 'W' | 'M' = 'W') {
        try {
            // Filter to ensure only simple objects are sent
            const safeTransactions = transactions.map(t => ({
                amount: t.amount,
                date: t.date 
            }));

            const response = await fetch(`${API_BASE_URL}/forecast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    transactions: safeTransactions, 
                    period, 
                    steps: 4 
                })
            });

            if (!response.ok) return { full_data: [] };
            return await response.json();
        } catch (error) {
            console.error("Forecast failed:", error);
            return { full_data: [] };
        }
    }
};
