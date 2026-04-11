const { app, BrowserWindow, ipcMain, Notification, globalShortcut } = require("electron");
const path = require("path");
const { MessageParser } = require("./messageParser");
const { AutoCategorizer } = require("./autoCategorizer");
const store = require("./store");

// Keep a global reference of the window object
let mainWindow;
let visiblePopupWindows = []; // Track popup windows
const popupDataMap = new Map(); // Store data for popups: windowId -> transaction
let notificationListener;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, "../assets/icon.png"), // Add an icon file
    show: false, // Don't show until ready
  });

  // Load the index.html of the app
  // app.isPackaged is false when running 'electron .'
  const isDev = !app.isPackaged;
  
  // Try to connect to 5174 (User's active port).
  const startUrl = isDev
      ? "http://localhost:5174"
      : `file://${path.join(__dirname, "../dist/index.html")}`;

  mainWindow.loadURL(startUrl);

  // If 5173 fails, one might manually change to 5174 or implement a retry logic.
  // For now, let's assume standard Vite port 5173.

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Initialize notification listener
  initializeNotificationListener();
}

function initializeNotificationListener() {
  console.log("Initializing system notification listener...");

  // Start monitoring system notifications
  startSystemNotificationMonitoring();
}

function startSystemNotificationMonitoring() {
  // This is a simplified implementation
  // In a real implementation, you would use platform-specific APIs

  const { systemPreferences } = require("electron");

  // macOS Notification Center monitoring
  if (process.platform === "darwin") {
    // Use native APIs to monitor notifications
    monitorMacOSNotifications();
  }

  // Windows Toast notifications monitoring
  if (process.platform === "win32") {
    monitorWindowsNotifications();
  }

  // Linux notifications monitoring
  if (process.platform === "linux") {
    monitorLinuxNotifications();
  }
}

function monitorMacOSNotifications() {
  console.log("Starting macOS notification monitoring...");

  // In a real implementation, you would:
  // 1. Use Cocoa APIs to monitor notification center
  // 2. Extract notification content
  // 3. Send to renderer process for processing

  // For now, we'll simulate monitoring
  // setInterval(() => {
  //   // Simulate detecting a transaction notification
  //   const simulatedNotifications = [
  //     {
  //       title: "Bank Notification",
  //       body: "Your account xxxx1234 has been debited for Rs.150.00 at McDonald's on 15/01/2025",
  //       appIdentifier: "com.apple.MobileSMS",
  //     },
  //     {
  //       title: "Payment Alert",
  //       body: "Rs.500.00 has been credited to your account from Salary",
  //       appIdentifier: "com.apple.MobileSMS",
  //     },
  //   ];

  //   const randomNotification =
  //     simulatedNotifications[
  //       Math.floor(Math.random() * simulatedNotifications.length)
  //     ];

  //   // Process the notification
  //   processNotification(randomNotification);
  // }, 30000); // Check every 30 seconds
}

function monitorWindowsNotifications() {
  console.log("Starting Windows notification monitoring...");

  // In a real implementation, you would:
  // 1. Use Windows APIs to monitor toast notifications
  // 2. Extract notification content
  // 3. Send to renderer process for processing

  // setInterval(() => {
  //   // Simulate notification processing
  //   const simulatedNotifications = [
  //     {
  //       title: "Transaction Alert",
  //       body: "Payment of $25.99 debited from your card for Netflix subscription",
  //       appUserModelId: "com.microsoft.edge",
  //     },
  //   ];

  //   const randomNotification =
  //     simulatedNotifications[
  //       Math.floor(Math.random() * simulatedNotifications.length)
  //     ];
  //   processNotification(randomNotification);
  // }, 30000);
}

function monitorLinuxNotifications() {
  console.log("Starting Linux notification monitoring...");

  // In a real implementation, you would:
  // 1. Use libnotify or other notification systems
  // 2. Monitor notification stream
  // 3. Extract and process content

  // setInterval(() => {
  //   // Simulate notification processing
  //   const simulatedNotifications = [
  //     {
  //       summary: "Bank Alert",
  //       body: "Amount credited Rs.2000.00 from UPI transfer",
  //       appName: "notify-send",
  //     },
  //   ];

  //   const randomNotification =
  //     simulatedNotifications[
  //       Math.floor(Math.random() * simulatedNotifications.length)
  //     ];
  //   processNotification(randomNotification);
  // }, 30000);
}

async function processNotification(notification) {
  const message = notification.body || notification.summary;

  if (!message) return;

  // Parse the message using our message parser
  const result = MessageParser.parseMessage(message);

  if (result.isTransaction && result.transaction) {
    console.log(
      "Transaction detected in system notification:",
      result.transaction
    );
    
    // Open Popup
    createTransactionPopup(result.transaction);
  }
}

function createTransactionPopup(transaction) {
    // Calculate position to stack windows if multiple
    const width = 450;
    const height = 600;
    
    const popup = new BrowserWindow({
        width: width,
        height: height,
        title: "New Transaction Detected",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        autoHideMenuBar: true,
        alwaysOnTop: true,
        skipTaskbar: false,
        icon: path.join(__dirname, "../assets/icon.png")
    });
    
    // Load the app with hash route
    // In dev: localhost:5174/#/transaction-popup
    // In prod: file://.../index.html#/transaction-popup
    
    const isDev = !app.isPackaged;
    
    const loadUrl = isDev
        ? "http://localhost:5174/#/transaction-popup"
        : `file://${path.join(__dirname, "../dist/index.html")}#/transaction-popup`;

    popup.loadURL(loadUrl);
    
    // Store data for retrieval
    popupDataMap.set(popup.id, transaction);

    popup.once("ready-to-show", () => {
        popup.show();
    });
    
    popup.on('closed', () => {
        visiblePopupWindows = visiblePopupWindows.filter(w => w !== popup);
        popupDataMap.delete(popup.id);
    });
    
    visiblePopupWindows.push(popup);
}

// IPC Handlers for Transaction Logic

ipcMain.handle("get-popup-transaction", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window && popupDataMap.has(window.id)) {
        return popupDataMap.get(window.id);
    }
    return null;
});

ipcMain.handle("simulate-transaction", () => {
    processNotification({
        title: "Simulated Alert",
        body: "Payment of $15.00 debited from your account", // Generic message
        appUserModelId: "com.microsoft.edge",
    });
    return { success: true };
});

ipcMain.handle("get-balance", () => {
    return store.getBalance();
});

ipcMain.handle("get-transactions", () => {
    return store.getTransactions();
});

ipcMain.handle("submit-transaction", async (event, data) => {
    // data: { transaction, purpose, location }
    const { transaction, purpose, location } = data;
    
    let categorization = { category: "Income", confidence: 1.0 };
    
    // Logic: Debit uses model, Credit doesn't (usually)
    if (data.forcedCategory) {
        categorization = { category: data.forcedCategory, confidence: 1.0 };
    } else if (transaction.type === 'debit') {
        try {
            // detailed "Purpose" overrides generic SMS text for better classification
            const textToClassify = purpose && purpose.trim().length > 0 ? purpose : transaction.description;
            
            categorization = await AutoCategorizer.categorizeTransaction(
                transaction.merchant,
                textToClassify, 
                transaction.amount,
                transaction.type
            );
        } catch (e) {
            console.error("Categorization failed", e);
            categorization = { category: "Uncategorized", confidence: 0 };
        }
    }
    
    // Update Store
    const finalTransaction = {
        ...transaction,
        description: purpose || transaction.description, // User purpose overrides SMS text
        originalDescription: transaction.description,    // Keep original for reference
        purpose,
        location,
        category: categorization.category,
        confidence: categorization.confidence,
        confidence: categorization.confidence,
        timestamp: new Date().toISOString(),
        id: Date.now() // Ensure unique ID for React keys
    };
    
    store.addTransaction(finalTransaction);
    const newBalance = store.updateBalance(transaction.amount, transaction.type);
    
    // Notify Main Window to update UI
    if (mainWindow) {
        mainWindow.webContents.send("balance-updated", newBalance);
        mainWindow.webContents.send("transaction-history-updated", store.getTransactions());
    }
    
    // Close the sender window (popup)
    const senderWindow = BrowserWindow.fromWebContents(event.sender);
    if (senderWindow && senderWindow !== mainWindow) {
        senderWindow.close();
    }
    
    return { success: true };
});

// IPC handlers
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.handle("start-monitoring", () => {
  startSystemNotificationMonitoring();
  return { success: true };
});

ipcMain.handle("stop-monitoring", () => {
  // Stop monitoring logic would go here
  return { success: true };
});

ipcMain.handle("get-system-info", () => {
  return {
    platform: process.platform,
    version: process.version,
    electronVersion: process.versions.electron,
  };
});

// App event handlers
app.whenReady().then(() => {
    createWindow();
    
    // Register a 'CommandOrControl+Shift+D' shortcut listener.
    const ret = globalShortcut.register('CommandOrControl+Shift+D', () => {
        console.log('CommandOrControl+Shift+D is pressed: Simulating Transaction');
        processNotification({
            title: "Simulated Alert",
            body: "Payment of $15.00 debited from for Movie Ticket",
            appUserModelId: "com.microsoft.edge",
        });
    });

    if (!ret) {
        console.log('registration failed');
    }
});

app.on("window-all-closed", () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
  });
});

// Handle protocol for deep linking
app.setAsDefaultProtocolClient("payaware");

app.on("open-url", (event, url) => {
  event.preventDefault();
  // Handle deep links here
});
