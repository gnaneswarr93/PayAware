/**
 * System Notification Listener
 * Monitors system notifications for debit/credit messages
 */

import { MessageParser, ParsedTransaction } from "./messageParser";

export interface NotificationListenerOptions {
  onTransactionDetected: (transaction: ParsedTransaction) => void;
  onError: (error: string) => void;
  enableClipboardMonitoring?: boolean;
  enableNotificationAPI?: boolean;
}

export class SystemNotificationListener {
  private options: NotificationListenerOptions;
  private isListening = false;
  private lastClipboardContent = "";
  private notificationObserver?: MutationObserver;
  private clipboardInterval?: NodeJS.Timeout;

  constructor(options: NotificationListenerOptions) {
    this.options = options;
  }

  /**
   * Start listening for notifications
   */
  startListening(): void {
    if (this.isListening) {
      console.warn("Notification listener is already running");
      return;
    }

    this.isListening = true;
    console.log("Starting system notification listener...");

    // Start clipboard monitoring
    if (this.options.enableClipboardMonitoring) {
      this.startClipboardMonitoring();
    }

    // Start browser notification monitoring
    if (this.options.enableNotificationAPI && "Notification" in window) {
      this.requestNotificationPermission();
    }

    // Start DOM monitoring for system pop-ups (fallback method)
    this.startDOMMonitoring();

    // Start SMS monitoring (Mobile only)
    this.startSMSMonitoring();

    console.log("System notification listener started successfully");
  }

  /**
   * Start SMS monitoring (Requires Capacitor + SMS Permission on Android)
   */
  private async startSMSMonitoring(): Promise<void> {
    try {
        const isNative = window.hasOwnProperty('Capacitor') && (window as any).Capacitor.isNativePlatform();

        if (!isNative) {
            console.log("[NotificationListener] SMS monitoring skipped: Not on native platform.");
            return;
        }

        console.log("[NotificationListener] Initializing native SMS listeners...");

        // ── Method 1: Listen for events fired by MainActivity.java via
        //              getBridge().triggerWindowJSEvent("onSmsReceived", ...)
        //              Capacitor delivers these as a CustomEvent on window.
        const handleNativeSms = (e: Event) => {
            try {
                const detail = (e as CustomEvent).detail;
                const data = typeof detail === 'string' ? JSON.parse(detail) : detail;
                if (data && data.body) {
                    console.log("[NotificationListener] Native SMS received:", data.sender);
                    this.processMessage(data.body, data.purposeReply);
                }
            } catch (err) {
                console.error("[NotificationListener] Failed to parse native SMS event:", err);
            }
        };
        window.addEventListener('onSmsReceived', handleNativeSms);

        // ── Method 2: cordova-plugin-sms fallback
        const SMS = (window as any).SMS;
        if (SMS) {
            console.log("[NotificationListener] cordova-plugin-sms detected, starting watch...");
            SMS.startWatch(
                () => console.log('[NotificationListener] SMS Watch started'),
                (err: any) => console.error('[NotificationListener] SMS Watch error:', err)
            );
            document.addEventListener('onSMSArrive', (e: any) => {
                const sms = e.data;
                if (sms && sms.body) this.processMessage(sms.body);
            });
        }

        console.log("[NotificationListener] SMS monitoring active.");
    } catch (e) {
        console.error("Failed to initialize SMS monitoring:", e);
    }
  }

  /**
   * Stop listening for notifications
   */
  stopListening(): void {
    if (!this.isListening) {
      return;
    }

    this.isListening = false;

    // Clear intervals and observers
    if (this.clipboardInterval) {
      clearInterval(this.clipboardInterval);
    }

    if (this.notificationObserver) {
      this.notificationObserver.disconnect();
    }

    console.log("System notification listener stopped");
  }

  /**
   * Start monitoring clipboard for transaction messages
   */
  private startClipboardMonitoring(): void {
    // Read initial clipboard content
    this.readClipboardContent()
      .then((content) => {
        this.lastClipboardContent = content;
      })
      .catch((error) => {
        console.warn("Failed to read initial clipboard content:", error);
      });

    // Monitor clipboard changes
    this.clipboardInterval = setInterval(async () => {
      try {
        const content = await this.readClipboardContent();
        if (content !== this.lastClipboardContent && content) {
          this.lastClipboardContent = content;
          this.processMessage(content);
        }
      } catch (error) {
        // Clipboard access might be denied, which is normal
        console.debug("Clipboard monitoring error:", error);
      }
    }, 2000); // Check every 2 seconds
  }

  /**
   * Request notification permission from user
   */
  private async requestNotificationPermission(): Promise<void> {
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.warn("Failed to request notification permission:", error);
      }
    }
  }

  /**
   * Start monitoring DOM for notification pop-ups
   */
  private startDOMMonitoring(): void {
    // Monitor for new notification elements being added to the DOM
    this.notificationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // Check if it's a notification/popup element
            if (this.isNotificationElement(element)) {
              const message = this.extractMessageFromElement(element);
              if (message) {
                this.processMessage(message);
              }
            }
          }
        });
      });
    });

    // Start observing
    this.notificationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // NOTE: If using Windows Phone Link or similar bridges:
    // These bridges often display 'Toast' notifications in Windows.
    // Web browsers running in normal mode CANNOT read system-level Windows Toasts directly due to security sandboxing.
    // However, if the bridge injects a notification into the page (rare) or if you copy the text from the toast,
    // the Clipboard Monitoring (enabled above) will catch it immediately.
  }

  /**
   * Check if an element is likely a notification
   */
  private isNotificationElement(element: Element): boolean {
    const notificationSelectors = [
      '[role="alert"]',
      ".notification",
      ".toast",
      ".popup",
      ".modal",
      ".alert",
      '[aria-live="polite"]',
      '[aria-live="assertive"]',
    ];

    // Safe type checking for className and id
    const className =
      typeof element.className === "string"
        ? element.className.toLowerCase()
        : "";
    const id = typeof element.id === "string" ? element.id.toLowerCase() : "";

    return notificationSelectors.some((selector) => {
      return (
        element.matches(selector) ||
        (className && className.includes(selector.replace(/[.#[\]]/g, ""))) ||
        (id && id.includes(selector.replace(/[.#[\]]/g, "")))
      );
    });
  }

  /**
   * Extract message text from a notification element
   */
  private extractMessageFromElement(element: Element): string | null {
    // Get text content from various possible locations
    const possibleTextSelectors = [
      "p",
      "span",
      "div",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      '[role="contentinfo"]',
      '[role="main"]',
    ];

    for (const selector of possibleTextSelectors) {
      const textElement = element.querySelector(selector);
      if (textElement && textElement.textContent) {
        const text = textElement.textContent.trim();
        if (text.length > 10) {
          // Minimum length to be considered a real message
          return text;
        }
      }
    }

    // Fallback to element's own text content
    const text = element.textContent?.trim();
    return text && text.length > 10 ? text : null;
  }

  /**
   * Process a detected message
   */
  private processMessage(message: string, purposeReply?: string): void {
    try {
      const result = MessageParser.parseMessage(message, purposeReply);

      if (result.isTransaction && result.transaction) {
        console.log("Transaction detected:", result.transaction);
        this.options.onTransactionDetected(result.transaction);

        // Show browser notification if supported
        this.showBrowserNotification(result.transaction);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error processing message:", errorMessage);
      this.options.onError(errorMessage);
    }
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(transaction: ParsedTransaction): void {
    if (Notification.permission === "granted") {
      const notification = new Notification("PayAware - Transaction Detected", {
        body: `${transaction.type === "debit" ? "Debited" : "Credited"}: ₹${
          transaction.amount
        } ${transaction.merchant ? "at " + transaction.merchant : ""}`,
        icon: "/favicon.ico",
        tag: "payaware-transaction",
        requireInteraction: true,
      });

      notification.onclick = () => {
        // Focus the main application window
        window.focus();
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
  }

  /**
   * Read clipboard content (requires permissions)
   */
  private async readClipboardContent(): Promise<string> {
    if (!navigator.clipboard) {
      throw new Error("Clipboard API not supported");
    }

    try {
      const text = await navigator.clipboard.readText();
      return text || "";
    } catch (error) {
      throw new Error(
        `Failed to read clipboard: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get listener status
   */
  getStatus(): {
    isListening: boolean;
    hasClipboardAccess: boolean;
    notificationPermission: NotificationPermission;
  } {
    return {
      isListening: this.isListening,
      hasClipboardAccess: !!navigator.clipboard,
      notificationPermission:
        "Notification" in window
          ? Notification.permission
          : ("denied" as NotificationPermission),
    };
  }
}

// Export singleton instance
export const notificationListener = new SystemNotificationListener({
  onTransactionDetected: () => {}, // Placeholder, will be overridden
  onError: console.error,
  enableClipboardMonitoring: false,  // Disabled: native SMS (Android) handles this
  enableNotificationAPI: true,
});

// Helper to inject the callback from the React Hook
export const setNotificationCallback = (callback: (tx: ParsedTransaction) => void) => {
    // We attach it to the internal options of the class. 
    // This is a bit hacky but works for the singleton pattern here.
    (notificationListener as any).options.onTransactionDetected = callback;
};
