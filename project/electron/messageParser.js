class MessageParser {
  static parseMessage(message) {
    // Basic regex-based parsing simulation
    // "Debited Rs.150 at McDonald's"
    
    const isTransaction = /debited|credited/i.test(message) || /payment|transfer/i.test(message);
    
    if (!isTransaction) {
        return { isTransaction: false };
    }

    let type = 'debit';
    if (/credited|transfer/i.test(message)) {
        type = 'credit';
    }

    // Extract amount (simple regex)
    const amountMatch = message.match(/(?:Rs\.?|₹)\s*([\d,]+\.?\d*)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0;

    // Extract Merchant (very naive)
    // "at McDonald's"
    const merchantMatch = message.match(/at\s+([A-Za-z0-9'\s]+?)(?:\s+on|$)/i);
    const merchant = merchantMatch ? merchantMatch[1].trim() : "Unknown";

    return {
      isTransaction: true,
      transaction: {
        description: message,
        amount: amount,
        type: type,
        merchant: merchant,
        date: new Date()
      }
    };
  }
}

module.exports = { MessageParser };
