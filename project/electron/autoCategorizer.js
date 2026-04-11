const pythonBridge = require('./pythonBridge');

class AutoCategorizer {
  static categorizeTransaction(merchant, description, amount, type) {
    // Start the bridge if not started
    pythonBridge.start();
    
    const combinedText = `${merchant || ''} ${description || ''}`.trim();
    
    // Return the promise
    return pythonBridge.predict(combinedText);
  }
  
  // New Async method if we can modify main.js
  static async categorizeAsync(merchant, description) {
     const combinedText = `${merchant || ''} ${description || ''}`.trim();
     return await pythonBridge.predict(combinedText);
  }
}

module.exports = { AutoCategorizer };
