import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NAV_ITEMS, type NavItem } from '@/constants/nav';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/store/auth';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

const SIDEBAR_WIDTH = 252;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isDesktop } = useResponsive();

  if (isDesktop) {
    return (
      <View style={styles.desktopRoot}>
        <Sidebar />
        <View style={styles.desktopMain}>{children}</View>
      </View>
    );
  }

  return (
    <View style={styles.mobileRoot}>
      <View style={{ flex: 1 }}>{children}</View>
      <BottomTabs />
    </View>
  );
}

function useActiveKey(): NavItem['key'] {
  const pathname = usePathname();
  const match = NAV_ITEMS.find((n) => n.href === pathname);
  if (match) return match.key;
  if (pathname.startsWith('/services')) return 'services';
  if (pathname.startsWith('/rentals')) return 'rentals';
  if (pathname.startsWith('/bookings')) return 'bookings';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'home';
}

function Sidebar() {
  const { t } = useTranslation();
  const router = useRouter();
  const active = useActiveKey();
  const profile = useAuthStore((s) => s.profile);

  return (
    <SafeAreaView style={styles.sidebar} edges={['top', 'bottom']}>
      <View style={styles.brandRow}>
        <View style={styles.brandLogo}>
          <Text style={{ fontSize: 24 }}>🦆</Text>
        </View>
        <View>
          <Text style={[Typography.h4, { color: Palette.white }]}>{t('brand.name')}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>AutoDuck Brasil</Text>
        </View>
      </View>

      <View style={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.href)}
              style={[styles.navItem, isActive && styles.navItemActive]}
            >
              <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              <Text
                style={[
                  Typography.bodyBold,
                  { color: isActive ? Palette.white : 'rgba(255,255,255,0.78)' },
                ]}
              >
                {t(item.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.sidebarUser} onPress={() => router.push('/profile')}>
        <View style={styles.userAvatar}>
          <Text style={{ fontSize: 16 }}>
            {profile?.fullName?.[0]?.toUpperCase() ?? '🦆'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: Palette.white, fontWeight: '600' }} numberOfLines={1}>
            {profile?.fullName ?? 'Guest'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }} numberOfLines={1}>
            {profile?.email ?? ''}
          </Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

function BottomTabs() {
  const { t } = useTranslation();
  const router = useRouter();
  const active = useActiveKey();

  return (
    <SafeAreaView edges={['bottom']} style={styles.tabBarSafe}>
      <View style={styles.tabBar}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.href)}
              style={styles.tab}
            >
              <View style={[styles.tabIconWrap, isActive && styles.tabIconWrapActive]}>
                <Text style={{ fontSize: 20, opacity: isActive ? 1 : 0.6 }}>{item.icon}</Text>
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? Palette.primary : Palette.textMuted },
                ]}
              >
                {t(item.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  desktopRoot: { flex: 1, flexDirection: 'row', backgroundColor: Palette.background },
  desktopMain: { flex: 1, backgroundColor: Palette.background },
  mobileRoot: { flex: 1, backgroundColor: Palette.background },

  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: Palette.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xs },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navList: { gap: 6, flex: 1 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.14)' },
  sidebarUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabBarSafe: { backgroundColor: Palette.card },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Palette.card,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    paddingTop: 8,
    paddingBottom: 6,
    ...Shadow.sm,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  tabIconWrap: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  tabIconWrapActive: { backgroundColor: Palette.primarySoft },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});
