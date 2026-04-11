/**
 * Message Parser Service
 * Parses debit/credit messages from system notifications
 */

export interface ParsedTransaction {
  amount: number;
  type: "debit" | "credit";
  account: string;
  balance?: number;
  description: string;
  merchant?: string;
  timestamp?: Date;
  rawMessage: string;
  purposeReply?: string; // Captures Android Notification Inline Reply
}

export interface ParsedMessageResult {
  isTransaction: boolean;
  transaction?: ParsedTransaction;
  error?: string;
}

export class MessageParser {
  // Common patterns for debit/credit messages
  // Expanded Regex Patterns for Indian & International Banking SMS
  private static readonly DEBIT_PATTERNS = [
    /debited\s+(?:by|with|for)?\s*(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /spent\s+(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /sent\s+(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /paid\s+(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /transfer\s+of\s+(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /txn\s+of\s+(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /withdrawn\s+(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /purchase\s+of\s+(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /charge\s+of\s+(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /(?:rs\.?|inr|\$)\s*([\d,]+(?:\.\d{2})?)\s+(?:debited|spent|sent|paid|withdrawn)/i,
    /transaction\s+alert.*(?:rs\.?|inr|\$)\.?\s*([\d,]+(?:\.\d{2})?)/i,
    /thank\s+you\s+for\s+using.*card.*for\s+(?:rs\.?|inr|\$)\s*([\d,]+(?:\.\d{2})?)/i
  ];

  private static readonly CREDIT_PATTERNS = [
    /credited\s+(?:with|by|for)?\s*(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /received\s+(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /deposited\s+(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /added\s+(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /refund\s+of\s+(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /salary\s+(?:of\s+)?(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /(?:rs\.?|inr|\$)\s*([\d,]+(?:\.\d{2})?)\s+(?:credited|received|deposited|added)/i
  ];

  // Regex to find "Merchant" or "Beneficiary" name
  private static readonly MERCHANT_PATTERNS = [
    /(?:at|to|from)\s+([a-zA-Z0-9\s&]+?)(?:\s+on|\s+using|\s+via|\s+through|\s+available|\s+balance|\s+ending|\.|\n|$)/i,
    /(?:vpa|upi\s+id)\s+([a-zA-Z0-9.\-_@]+)/i, // UPI IDs
    /merchant\s+([a-zA-Z0-9\s&]+?)(?:\s+on|\.|$)/i,
    /info:\s+([a-zA-Z0-9\s&]+?)(?:\.|$)/i,
  ];

  private static readonly ACCOUNT_PATTERNS = [
    /(?:a\/c|acct|account|card|credit\s+card|debit\s+card|wallet)\s*(?:no\.?|ending)?\s*[:\s-]?\s*([x*]*\d{3,})/i,
    /ending\s+(?:with)?\s*([x*]*\d{4})/i
  ];

  private static readonly BALANCE_PATTERNS = [
    /(?:bal|balance|avbl|available)\s*(?:is|:)?\s*(?:rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
    /(?:rs\.?|inr|\$)\s*([\d,]+(?:\.\d{2})?)\s*(?:remaining|available)/i
  ];

  /**
   * Parse a message to check if it contains transaction information
   */
  static parseMessage(message: string, purposeReply?: string): ParsedMessageResult {
    try {
      // Check if message contains transaction keywords
      const hasTransactionKeywords =
        /debit|credit|amount|spent|received|credited|debited/i.test(message);

      if (!hasTransactionKeywords) {
        return { isTransaction: false };
      }

      // Extract amount and type
      const transactionInfo = this.extractAmountAndType(message);
      if (!transactionInfo) {
        return {
          isTransaction: false,
          error: "Could not extract amount or transaction type",
        };
      }

      // Extract other details
      const merchant = this.extractMerchant(message);
      const account = this.extractAccount(message);
      const balance = this.extractBalance(message);
      const timestamp = new Date();

      const parsedTransaction: ParsedTransaction = {
        amount: transactionInfo.amount,
        type: transactionInfo.type,
        account: account || "Unknown",
        balance: balance || undefined,
        description: this.generateDescription(message, merchant),
        merchant: merchant || undefined,
        timestamp: timestamp,
        rawMessage: message,
        purposeReply: purposeReply, // Attach the user's inline reply
      };

      return {
        isTransaction: true,
        transaction: parsedTransaction,
      };
    } catch (error) {
      return {
        isTransaction: false,
        error: `Parsing error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Extract amount and transaction type from message
   */
  private static extractAmountAndType(
    message: string
  ): { amount: number; type: "debit" | "credit" } | null {
    // Check for debit patterns first
    for (const pattern of this.DEBIT_PATTERNS) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const amount = this.parseAmount(match[1]);
        return { amount, type: "debit" };
      }
    }

    // Check for credit patterns
    for (const pattern of this.CREDIT_PATTERNS) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const amount = this.parseAmount(match[1]);
        return { amount, type: "credit" };
      }
    }

    return null;
  }

  /**
   * Extract merchant information
   */
  private static extractMerchant(message: string): string | null {
    for (const pattern of this.MERCHANT_PATTERNS) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  /**
   * Extract account information
   */
  private static extractAccount(message: string): string | null {
    for (const pattern of this.ACCOUNT_PATTERNS) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  /**
   * Extract balance information
   */
  private static extractBalance(message: string): number | null {
    for (const pattern of this.BALANCE_PATTERNS) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return this.parseAmount(match[1]);
      }
    }
    return null;
  }

  /**
   * Parse amount string to number
   */
  private static parseAmount(amountStr: string): number {
    // Remove commas, 'rs', 'rs.', '$', whitespace and convert to number
    const cleaned = amountStr.toLowerCase().replace(/,/g, "").replace(/rs\.?\s*/g, "").replace(/\$\s*/g, "");
    return parseFloat(cleaned);
  }

  /**
   * Generate description from message and merchant
   */
  private static generateDescription(
    message: string,
    merchant: string | null
  ): string {
    if (merchant) {
      return `Transaction at ${merchant}`;
    }

    // Try to extract description from common patterns
    const descPatterns = [
      /for\s+([a-zA-Z\s&]+?)(?:\s+on|\s+available|\s+balance|\.|\n|$)/i,
      /purchase\s+([a-zA-Z\s&]+?)(?:\s+on|\s+available|\s+balance|\.|\n|$)/i,
      /payment\s+to\s+([a-zA-Z\s&]+?)(?:\s+on|\s+available|\s+balance|\.|\n|$)/i,
    ];

    for (const pattern of descPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Fallback to first 50 characters of message
    return message.substring(0, 50).trim();
  }

  /**
   * Test parser with sample messages
   */
  static testParser(): void {
    const testMessages = [
      "Your account xxxx1234 has been debited for Rs.150.00 at McDonald's on 15/01/2025. Available balance: Rs.1,250.50",
      "Rs.500.00 has been credited to your account xxxx5678 from Salary on 15/01/2025. Current balance: Rs.5,750.00",
      "Payment of $25.99 debited from your card for Netflix subscription",
      "Amount credited Rs.2000.00 from UPI transfer",
      "Sent Rs. 1,000 to 9876543210@upi via PhonePe. Txn ID: 123456789",
      "Paid Rs 240 at Starbucks using Debit Card ending 8812. Bal: Rs 12000",
      "Cash withdrawl of Rs. 2,000 from SBI ATM. Avbl Bal: 5000",
      "Thank you for using HDFC Credit Card xxxx1122 for Rs. 12900.00 at Amazon India."
    ];

    testMessages.forEach((message, index) => {
      console.log(`\n--- Test Message ${index + 1} ---`);
      console.log(`Original: ${message}`);
      const result = this.parseMessage(message);
      console.log(`Parsed:`, result);
    });
  }
}

// Auto-test when module loads (remove in production)
if (import.meta.env.DEV) {
  MessageParser.testParser();
}
