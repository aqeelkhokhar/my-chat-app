import { useCallback, useEffect, useRef } from 'react';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { AppState } from 'react-native';

type ShowNotification = (title: string, body: string) => Promise<void>;

export function useNotifications(): { showNotification: ShowNotification } {
  const channelIdRef = useRef<string | null>(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const setupNotifications = async () => {
      const settings = await notifee.requestPermission();
      console.log('Notification permission:', settings);

      const channelId = await notifee.createChannel({
        id: 'chat-messages',
        name: 'Chat Messages',
        importance: AndroidImportance.HIGH,
      });

      channelIdRef.current = channelId;
      console.log('Notification channel created:', channelId);
    };

    setupNotifications();

    const subscription = AppState.addEventListener('change', nextAppState => {
      appStateRef.current = nextAppState;
      console.log('App state changed to:', nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const showNotification: ShowNotification = useCallback(
    async (title, body) => {
      try {
        console.log('Attempting to show notification:', {
          title,
          body,
          appState: appStateRef.current,
        });

        if (!channelIdRef.current) {
          console.log('No channel ID available');
          return;
        }

        const notificationId = await notifee.displayNotification({
          title,
          body,
          android: {
            channelId: channelIdRef.current,
            importance: AndroidImportance.HIGH,
            smallIcon: 'ic_launcher',
            pressAction: {
              id: 'default',
            },
          },
          ios: {
            sound: 'default',
            foregroundPresentationOptions: {
              alert: true,
              badge: true,
              sound: true,
            },
          },
        });

        console.log('Notification displayed with ID:', notificationId);
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    },
    [],
  );

  return { showNotification };
}
