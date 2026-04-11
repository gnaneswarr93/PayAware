import { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
// Safely access IPC: Only works in Electron
let ipcRenderer: any = {
    invoke: () => Promise.resolve(null),
    on: () => {},
    removeAllListeners: () => {}
};

try {
    if ((window as any).require) {
        const electron = (window as any).require('electron');
        ipcRenderer = electron.ipcRenderer;
    }
} catch (e) {
    console.debug("Not running in Electron, IPC disabled");
}

interface Transaction {
    description: string;
    amount: number;
    type: string;
    merchant: string;
}

const TransactionPopup: React.FC = () => {
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [purpose, setPurpose] = useState('');
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        // Fetch data on mount
        const loadData = async () => {
            try {
                const data = await ipcRenderer.invoke('get-popup-transaction');
                if (data) {
                    setTransaction(data);
                    if (data.merchant && data.merchant !== 'Unknown') {
                        setLocation(data.merchant);
                    }
                }
            } catch (err) {
                console.error("Failed to load popup data", err);
            }
        };
        loadData();
    }, []);

    const handleSubmit = async () => {
        if (!transaction) return;
        setIsLoading(true);
        
        try {
            await transactionService.addTransaction({
                description: purpose || transaction.description,
                amount: transaction.amount,
                type: transaction.type as 'debit' | 'credit',
                merchant: location || transaction.merchant,
                purpose: purpose,
                location: location
            });

             // For Electron: Close window after save
             // For Electron: Close window after save
             if ((window as any).require) {
                // We mock a submit to let main process know to close the window
                // In a perfect world we'd have a specific 'close-me' IPC event
                await ipcRenderer.invoke('submit-transaction', {
                  transaction, purpose, location, 
                  forcedCategory: 'Already Saved' // Hack to skip logic in main process
                });
             } else {
                 alert("Saved!");
             }

        } catch (e: any) {
            console.error(e);
            if (e.message === "User not logged in") {
                alert("Please Sign In to save transactions.");
            } else {
                alert("Failed to save: " + e.message);
            }
            setIsLoading(false);
        }
    };

    if (!transaction) {
        return <div className="p-6 text-center text-gray-500">Waiting for transaction data...</div>;
    }

    const isDebit = transaction.type === 'debit';

    return (
        <div className="h-screen bg-gray-50 p-6 flex flex-col">
            <div className={`p-4 rounded-lg mb-6 ${isDebit ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <h3 className={`text-lg font-bold mb-1 ${isDebit ? 'text-red-700' : 'text-green-700'}`}>
                    {isDebit ? 'Expense Detected' : 'Income Detected'}
                </h3>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                    {isDebit ? '-' : '+'}₹{transaction.amount}
                </div>
                <div className="text-sm text-gray-600">
                    {transaction.description}
                </div>
            </div>

            <div className="space-y-4 flex-1">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose/Notes</label>
                    <input 
                        type="text" 
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder={isDebit ? "e.g., Lunch with team" : "e.g., Salary for Oct"}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location / Source</label>
                    <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Koramangala"
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                        ${isDebit ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                        disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isLoading ? 'Processing...' : (isDebit ? 'Classify & Save' : 'Save Income')}
                </button>
            </div>
        </div>
    );
};

export default TransactionPopup;
