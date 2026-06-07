import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuthStore } from '@/store/auth';
import { signOut } from '@/lib/auth';
import { mockVehicles } from '@/lib/mock-data';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, setProfile } = useAuthStore();
  const [notif, setNotif] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    setProfile(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Palette.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl }}>
        <Text style={[Typography.h2]}>{t('profile.title')}</Text>

        <Card>
          <View style={styles.profileRow}>
            <Image
              source={{ uri: profile?.avatarUrl ?? 'https://i.pravatar.cc/100' }}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={[Typography.h4]}>{profile?.fullName}</Text>
              <Text style={[Typography.caption, { color: Palette.textSecondary }]}>
                {profile?.email}
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <View style={styles.rowBetween}>
            <Text style={[Typography.bodyBold]}>{t('profile.myVehicles')}</Text>
            <Pressable hitSlop={6}>
              <Text style={[Typography.bodyBold, { color: Palette.primary }]}>+</Text>
            </Pressable>
          </View>
          {mockVehicles.map((v) => (
            <View key={v.id} style={styles.vehicleRow}>
              <Text style={{ fontSize: 22 }}>🚙</Text>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.body]}>
                  {v.make} {v.model} · {v.year}
                </Text>
                <Text style={[Typography.small, { color: Palette.textSecondary }]}>
                  {v.plate}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={[Typography.bodyBold, { marginBottom: Spacing.sm }]}>
            {t('profile.language')}
          </Text>
          <LanguageSwitcher />
        </Card>

        <Card>
          <View style={styles.rowBetween}>
            <Text style={[Typography.body]}>{t('profile.notifications')}</Text>
            <Switch
              value={notif}
              onValueChange={setNotif}
              trackColor={{ true: Palette.primary, false: Palette.border }}
            />
          </View>
        </Card>

        <Card>
          <Pressable style={styles.rowBetween} onPress={() => router.push('/admin')}>
            <Text style={[Typography.body]}>🛠️  {t('profile.becomeAdmin')}</Text>
            <Text style={{ color: Palette.textMuted, fontSize: 18 }}>›</Text>
          </Pressable>
        </Card>

        <Button title={t('auth.signOut')} variant="outline" onPress={handleSignOut} />

        <Text style={[Typography.small, { color: Palette.textMuted, textAlign: 'center', marginTop: Spacing.md }]}>
          {t('profile.version', { version: '1.0.0' })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.surface,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
});
