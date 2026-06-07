import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Page } from '@/components/layout/Page';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/store/auth';
import { signOut } from '@/lib/auth';
import { mockVehicles } from '@/lib/mock-data';
import { Config } from '@/constants/config';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { profile, setProfile } = useAuthStore();
  const [notif, setNotif] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    setProfile(null);
  };

  const left = (
    <View style={styles.col}>
      <Card variant="elevated">
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 28 }}>
              {profile?.fullName?.[0]?.toUpperCase() ?? '🦆'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.h3]}>{profile?.fullName}</Text>
            <Text style={[Typography.caption, { color: Palette.textSecondary }]}>
              {profile?.email}
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={[Typography.h4]}>{t('profile.myVehicles')}</Text>
          <Pressable hitSlop={8}>
            <Text style={[Typography.h4, { color: Palette.primary }]}>＋</Text>
          </Pressable>
        </View>
        {mockVehicles.map((v, i) => (
          <View key={v.id} style={[styles.vehicleRow, i > 0 && styles.divider]}>
            <View style={styles.vehicleIcon}>
              <Text style={{ fontSize: 20 }}>🚙</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.body]}>
                {v.make} {v.model} · {v.year}
              </Text>
              <Text style={[Typography.small, { color: Palette.textSecondary }]}>{v.plate}</Text>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );

  const right = (
    <View style={styles.col}>
      <Card>
        <Text style={[Typography.h4, { marginBottom: Spacing.sm }]}>{t('profile.language')}</Text>
        <LanguageSwitcher />
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={[Typography.body]}>🔔  {t('profile.notifications')}</Text>
          <Switch
            value={notif}
            onValueChange={setNotif}
            trackColor={{ true: Palette.primary, false: Palette.border }}
          />
        </View>
      </Card>

      <Card padded={false}>
        <MenuRow icon="🛠️" label={t('profile.becomeAdmin')} onPress={() => router.push('/admin')} />
        <MenuRow
          icon="💬"
          label={t('profile.support')}
          onPress={() => Linking.openURL(`mailto:${Config.supportEmail}`)}
          border
        />
        <MenuRow icon="ℹ️" label={t('profile.about')} onPress={() => {}} border />
      </Card>

      <Button title={t('auth.signOut')} variant="outline" onPress={handleSignOut} />
      <Text style={[Typography.small, { color: Palette.textMuted, textAlign: 'center' }]}>
        {t('profile.version', { version: '1.0.0' })}
      </Text>
    </View>
  );

  return (
    <Page>
      <PageHeader title={t('profile.title')} />
      {isDesktop ? (
        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>{left}</View>
          <View style={{ flex: 1 }}>{right}</View>
        </View>
      ) : (
        <View style={styles.col}>
          {left}
          {right}
        </View>
      )}
    </Page>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  border,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  border?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.menuRow, border && styles.divider]}
    >
      <Text style={[Typography.body, { flex: 1 }]}>
        {icon}  {label}
      </Text>
      <Text style={{ color: Palette.textMuted, fontSize: 20 }}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  twoCol: { flexDirection: 'row', gap: Spacing.lg, alignItems: 'flex-start' },
  col: { gap: Spacing.md },
  profileRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  divider: { borderTopWidth: 1, borderTopColor: Palette.border },
});
