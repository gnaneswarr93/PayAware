import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const notificationService = {
  /**
   * Request permissions for notifications
   */
  async requestPermissions() {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } else if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  /**
   * Schedule or trigger an immediate notification
   */
  async notify(title: string, body: string, id?: number) {
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: id || Math.floor(Math.random() * 1000000),
              schedule: { at: new Date(Date.now() + 1000) }, // 1 second delay
              sound: 'default',
              actionTypeId: '',
              extra: null
            }
          ]
        });
      } catch (error) {
        console.error("LocalNotifications error:", error);
      }
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/vite.svg' });
    } else {
      console.log(`[Notification Fallback] ${title}: ${body}`);
    }
  }
};
