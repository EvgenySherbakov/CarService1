import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleBookingReminder(
  title: string,
  body: string,
  whenISO: string,
) {
  if (Platform.OS === 'web') return;
  const fireAt = new Date(whenISO).getTime() - 60 * 60 * 1000;
  if (fireAt < Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { date: new Date(fireAt) },
  });
}
