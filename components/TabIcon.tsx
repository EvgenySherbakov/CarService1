import { Text, View } from 'react-native';

const icons = {
  home: '🏠',
  services: '🔧',
  rentals: '🚗',
  bookings: '📅',
  profile: '👤',
  admin: '🛠️',
} as const;

export function TabIcon({
  name,
  focused,
}: {
  name: keyof typeof icons;
  focused: boolean;
}) {
  return (
    <View style={{ opacity: focused ? 1 : 0.55, transform: [{ scale: focused ? 1.05 : 1 }] }}>
      <Text style={{ fontSize: 22 }}>{icons[name]}</Text>
    </View>
  );
}
