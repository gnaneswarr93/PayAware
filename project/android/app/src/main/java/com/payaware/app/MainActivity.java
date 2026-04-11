package com.payaware.app;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.Telephony;
import android.telephony.SmsMessage;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

import org.json.JSONObject;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "PayAware-SMS";
    private static final String NOTIF_CHANNEL_ID = "payaware_transactions";
    private SmsReceiver smsReceiver;
    private boolean receiverRegistered = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannel();
        smsReceiver = new SmsReceiver();

        // SMS permission check — only register if already granted.
        // We no longer request aggressively on startup; the JS layer handles the UX flow.
        boolean hasSmsPermission =
            checkSelfPermission(Manifest.permission.RECEIVE_SMS) == PackageManager.PERMISSION_GRANTED &&
            checkSelfPermission(Manifest.permission.READ_SMS) == PackageManager.PERMISSION_GRANTED;

        if (hasSmsPermission) {
            registerSmsReceiver();
        }

        // Note: Notification permission POST_NOTIFICATIONS is also now requested 
        // via Capacitor JS plugins during Onboarding, not here.

        // Handle SMS body passed from SmsBackgroundReceiver (notification tap)
        handleSmsIntent(getIntent());
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == 101) {
            // Register SMS receiver now that user has responded to the permission dialog
            boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
            if (granted) {
                Log.d(TAG, "SMS permission granted — registering receiver");
                registerSmsReceiver();
            } else {
                Log.w(TAG, "SMS permission denied — auto-detection will not work");
            }
        }
    }


    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        // App brought to foreground by tapping a transaction notification
        handleSmsIntent(intent);
    }

    private void handleSmsIntent(Intent intent) {
        if (intent == null) return;
        String body = intent.getStringExtra("sms_body");
        String sender = intent.getStringExtra("sms_sender");
        String purposeReply = intent.getStringExtra("sms_purpose_reply"); // New Direct Reply String
        
        if (body != null && !body.isEmpty()) {
            Log.d(TAG, "Dispatching SMS from intent extras, sender: " + sender);
            // Small delay to let the WebView / bridge fully initialize first
            new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(
                () -> dispatchSmsToWebLayer(body, sender, purposeReply), 1500
            );
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // Re-register receiver if it was unregistered on pause
        registerSmsReceiver();
    }

    @Override
    public void onPause() {
        super.onPause();
        // Unregister to avoid memory leaks while app is in background.
        // The static receiver in AndroidManifest handles background receipt.
        unregisterSmsReceiver();
    }

    @Override
    public void onDestroy() {
        unregisterSmsReceiver();
        super.onDestroy();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    NOTIF_CHANNEL_ID,
                    "Transaction Alerts",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Auto-detected bank transaction alerts");
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(channel);
        }
    }




    private void registerSmsReceiver() {
        if (receiverRegistered || smsReceiver == null) return;
        IntentFilter filter = new IntentFilter(Telephony.Sms.Intents.SMS_RECEIVED_ACTION);
        filter.setPriority(999); // Higher priority = we get it before other apps
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(smsReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(smsReceiver, filter);
        }
        receiverRegistered = true;
        Log.d(TAG, "SMS BroadcastReceiver registered");
    }

    private void unregisterSmsReceiver() {
        if (!receiverRegistered || smsReceiver == null) return;
        try {
            unregisterReceiver(smsReceiver);
        } catch (Exception ignored) {}
        receiverRegistered = false;
        Log.d(TAG, "SMS BroadcastReceiver unregistered");
    }

    /**
     * Called by SmsReceiver (inner class) when a transaction SMS arrives.
     * Safe to call from any thread - Capacitor bridge is thread-safe.
     */
    public void dispatchSmsToWebLayer(String body, String sender, String purposeReply) {
        if (getBridge() == null) {
            Log.w(TAG, "Bridge not ready, dropping SMS event");
            return;
        }
        try {
            // Use JSONObject for safe escaping (no manual string surgery)
            JSONObject payload = new JSONObject();
            payload.put("body", body);
            payload.put("sender", sender != null ? sender : "Unknown");
            if (purposeReply != null && !purposeReply.isEmpty()) {
                payload.put("purposeReply", purposeReply);
            }
            getBridge().triggerWindowJSEvent("onSmsReceived", payload.toString());
            Log.d(TAG, "JS event fired for sender: " + sender + (purposeReply != null ? " with inline purpose" : ""));
        } catch (Exception e) {
            Log.e(TAG, "Failed to fire JS event", e);
        }
    }

    // ── SMS BroadcastReceiver ─────────────────────────────────────────────────

    public class SmsReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (!Telephony.Sms.Intents.SMS_RECEIVED_ACTION.equals(intent.getAction())) return;

            SmsMessage[] messages = Telephony.Sms.Intents.getMessagesFromIntent(intent);
            if (messages == null) return;

            // Concatenate multi-part SMS
            StringBuilder fullBody = new StringBuilder();
            String sender = null;
            for (SmsMessage msg : messages) {
                if (sender == null) sender = msg.getOriginatingAddress();
                String part = msg.getMessageBody();
                if (part != null) fullBody.append(part);
            }

            String body = fullBody.toString();
            if (body.isEmpty() || !isTransactionSms(body)) return;

            Log.d(TAG, "Transaction SMS detected from: " + sender);
            dispatchSmsToWebLayer(body, sender, null); // Normal receiver has no inline reply yet
        }

        private boolean isTransactionSms(String body) {
            String low = body.toLowerCase();
            return low.contains("debited")     || low.contains("credited")
                || low.contains("payment")     || low.contains("transaction")
                || low.contains("upi")         || low.contains("inr")
                || low.contains("rs.")         || low.contains("rs ")
                || low.contains("spent")       || low.contains("sent")
                || low.contains("received")    || low.contains("withdrawn")
                || low.contains("balance")     || low.contains("a/c");
        }
    }
}
