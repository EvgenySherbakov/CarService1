export type NavItem = {
  key: 'home' | 'services' | 'rentals' | 'bookings' | 'profile';
  href: '/' | '/services' | '/rentals' | '/bookings' | '/profile';
  icon: string;
  labelKey: string;
};

export const NAV_ITEMS: NavItem[] = [
  { key: 'home', href: '/', icon: '🏠', labelKey: 'tabs.home' },
  { key: 'services', href: '/services', icon: '🔧', labelKey: 'tabs.services' },
  { key: 'rentals', href: '/rentals', icon: '🚗', labelKey: 'tabs.rentals' },
  { key: 'bookings', href: '/bookings', icon: '📅', labelKey: 'tabs.bookings' },
  { key: 'profile', href: '/profile', icon: '👤', labelKey: 'tabs.profile' },
];
