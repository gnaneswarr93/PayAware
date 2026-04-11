package com.payaware.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.provider.Telephony;
import android.telephony.SmsMessage;
import android.util.Log;
import androidx.core.app.NotificationCompat;

/**
 * SmsBackgroundReceiver
 *
 * A static BroadcastReceiver declared in AndroidManifest.xml.
 * It fires even when the app is CLOSED / in background.
 *
 * When a financial SMS arrives:
 *   1. Shows a local notification: "New transaction detected – tap to open PayAware".
 *   2. When the user taps, MainActivity opens and the in-app JS listener
 *      (notificationListener.ts) will pick up the SMS body from the intent extras.
 */
public class SmsBackgroundReceiver extends BroadcastReceiver {

    private static final String TAG = "PayAware-BgSMS";
    private static final String CHANNEL_ID = "payaware_transactions";
    private static final int NOTIF_ID = 7777;

    @Override
    public void onReceive(Context context, Intent intent) {
        if ("com.payaware.app.ACTION_REPLY".equals(intent.getAction())) {
            handleReply(context, intent);
            return;
        }

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

        Log.d(TAG, "Background transaction SMS from: " + sender);

        // Show a local notification with Direct Reply action
        showTransactionNotification(context, body, sender != null ? sender : "Bank");
    }

    private boolean isTransactionSms(String body) {
        String low = body.toLowerCase();
        return low.contains("debited")  || low.contains("credited")
            || low.contains("payment") || low.contains("transaction")
            || low.contains("upi")     || low.contains("inr")
            || low.contains("rs.")     || low.contains("rs ")
            || low.contains("spent")   || low.contains("sent")
            || low.contains("received")|| low.contains("withdrawn")
            || low.contains("balance") || low.contains("a/c");
    }

    private void showTransactionNotification(Context ctx, String body, String sender) {
        ensureNotificationChannel(ctx);

        // Intent for just tapping the notification (Normal Flow)
        Intent launchIntent = new Intent(ctx, MainActivity.class);
        launchIntent.putExtra("sms_body", body);
        launchIntent.putExtra("sms_sender", sender);
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE;
        PendingIntent pi = PendingIntent.getActivity(ctx, 0, launchIntent, flags);

        // Build the Direct Reply RemoteInput
        androidx.core.app.RemoteInput remoteInput = new androidx.core.app.RemoteInput.Builder("key_text_reply")
                .setLabel("Enter Purpose (e.g. Starbucks)")
                .build();

        // Intent for clicking the "Send" button on the inline reply (Reply Flow)
        Intent replyIntent = new Intent(ctx, SmsBackgroundReceiver.class);
        replyIntent.setAction("com.payaware.app.ACTION_REPLY");
        replyIntent.putExtra("sms_body", body);
        replyIntent.putExtra("sms_sender", sender);
        
        PendingIntent replyPendingIntent = PendingIntent.getBroadcast(
                ctx, 
                body.hashCode(), // Unique request code per message
                replyIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE
        );

        NotificationCompat.Action replyAction = new NotificationCompat.Action.Builder(
                android.R.drawable.ic_menu_send, "Enter Purpose", replyPendingIntent)
                .addRemoteInput(remoteInput)
                .setAllowGeneratedReplies(true) // AI suggested replies if supported
                .build();

        String preview = body.length() > 80 ? body.substring(0, 80) + "…" : body;

        NotificationCompat.Builder builder = new NotificationCompat.Builder(ctx, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("💳 Transaction Detected")
                .setContentText(preview)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(pi)
                .addAction(replyAction); // Add the Reply Action

        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(body.hashCode(), builder.build());
    }

    private void handleReply(Context context, Intent intent) {
        // Extract the user's typed reply
        Bundle remoteInput = androidx.core.app.RemoteInput.getResultsFromIntent(intent);
        if (remoteInput != null) {
            CharSequence userPurpose = remoteInput.getCharSequence("key_text_reply");
            String body = intent.getStringExtra("sms_body");
            String sender = intent.getStringExtra("sms_sender");
            Log.d(TAG, "User sent purpose inline: " + userPurpose);

            if (userPurpose != null && body != null) {
                // Launch MainActivity with BOTH the body AND the user's replied purpose
                Intent launchIntent = new Intent(context, MainActivity.class);
                launchIntent.putExtra("sms_body", body);
                launchIntent.putExtra("sms_sender", sender);
                launchIntent.putExtra("sms_purpose_reply", userPurpose.toString());
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                context.startActivity(launchIntent);

                // Clear the notification to indicate success
                NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null) nm.cancel(body.hashCode());
            }
        }
    }

    private void ensureNotificationChannel(Context ctx) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null && nm.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel ch = new NotificationChannel(
                        CHANNEL_ID,
                        "Transaction Alerts",
                        NotificationManager.IMPORTANCE_HIGH
                );
                ch.setDescription("Auto-detected bank transaction alerts");
                nm.createNotificationChannel(ch);
            }
        }
    }
}
