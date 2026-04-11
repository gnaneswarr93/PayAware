const Store = require('electron-store');

const store = new Store({
  defaults: {
    balance: 0,
    transactions: []
  }
});

module.exports = {
  getBalance: () => store.get('balance'),
  setBalance: (val) => store.set('balance', val),
  updateBalance: (amount, type) => {
    let current = store.get('balance');
    if (type === 'credit') {
        current += amount;
    } else {
        current -= amount;
    }
    store.set('balance', current);
    return current;
  },
  addTransaction: (transaction) => {
    const transactions = store.get('transactions');
    transactions.push(transaction);
    store.set('transactions', transactions); // In real app, limit size or use DB
  },
  getTransactions: () => store.get('transactions')
};
