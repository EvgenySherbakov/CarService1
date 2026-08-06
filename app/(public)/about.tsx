import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { FlowHeader } from '@/components/layout/FlowHeader';
import { Page } from '@/components/layout/Page';
import { Grid } from '@/components/layout/Grid';
import { Card } from '@/components/ui/Card';
import { useResponsive } from '@/hooks/useResponsive';
import { companyInfo } from '@/lib/company-data';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import type { TeamMember } from '@/types';

export default function AboutScreen() {
  const { t } = useTranslation();
  const { isDesktop } = useResponsive();
  const c = companyInfo;

  const stats = [
    { value: `${c.stats.years}+`, label: t('about.statYears') },
    { value: `${(c.stats.clients / 1000).toFixed(0)}k+`, label: t('about.statClients') },
    { value: `${c.stats.cars}`, label: t('about.statCars') },
    { value: `${c.stats.rating}★`, label: t('about.statRating') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background }}>
      <FlowHeader title={t('about.title')} />
      <Page>
        <Card padded={false} style={{ overflow: 'hidden' }}>
          <Image source={{ uri: c.heroImageUrl }} style={styles.hero} />
          <LinearGradient
            colors={['transparent', 'rgba(11,45,110,0.9)']}
            style={styles.heroOverlay}
          />
          <View style={styles.heroText}>
            <Text style={[Typography.h1, { color: Palette.white }]}>{t('about.title')}</Text>
            <Text style={[Typography.body, { color: 'rgba(255,255,255,0.9)' }]}>
              {t('about.subtitle')}
            </Text>
          </View>
        </Card>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[Typography.h3, { color: Palette.primary }]}>{s.value}</Text>
              <Text style={[Typography.small, { color: Palette.textSecondary, textAlign: 'center' }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>{t('about.story')}</Text>
        <Card>
          <Text style={[Typography.body, { color: Palette.text, lineHeight: 24 }]}>
            {t('about.description')}
          </Text>
          <Text
            style={[
              Typography.bodyBold,
              { color: Palette.primary, marginTop: Spacing.sm, lineHeight: 24 },
            ]}
          >
            {t('about.mission')}
          </Text>
        </Card>

        <Text style={styles.section}>{t('about.team')}</Text>
        <Grid
          data={c.team}
          columns={isDesktop ? 4 : 2}
          keyExtractor={(m) => m.id}
          renderItem={(m) => <TeamCard member={m} />}
        />

        <Text style={styles.section}>{t('about.gallery')}</Text>
        <Grid
          data={c.gallery}
          columns={isDesktop ? 3 : 2}
          keyExtractor={(g, i) => `${i}`}
          gap={Spacing.sm}
          renderItem={(uri) => (
            <Image source={{ uri }} style={styles.galleryImg} />
          )}
        />
      </Page>
    </View>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  const { t } = useTranslation();
  return (
    <Card style={{ alignItems: 'center', gap: Spacing.xs }}>
      <Image source={{ uri: member.photoUrl }} style={styles.avatar} />
      <Text style={[Typography.bodyBold, { textAlign: 'center' }]} numberOfLines={1}>
        {member.name}
      </Text>
      <Text style={[Typography.small, { color: Palette.textSecondary, textAlign: 'center' }]}>
        {t(member.roleKey)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 220, backgroundColor: Palette.surface },
  heroOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 140 },
  heroText: { position: 'absolute', left: Spacing.lg, right: Spacing.lg, bottom: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: Palette.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    gap: 2,
    ...Shadow.sm,
  },
  section: {
    ...Typography.h3,
    color: Palette.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Palette.surface },
  galleryImg: {
    width: '100%',
    height: 130,
    borderRadius: Radius.md,
    backgroundColor: Palette.surface,
  },
});
