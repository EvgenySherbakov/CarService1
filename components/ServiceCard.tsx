import { Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { RatingStars } from './RatingStars';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { formatAmount } from '@/lib/stripe';
import type { Service } from '@/types';

export function ServiceCard({
  service,
  onPress,
  horizontal,
}: {
  service: Service;
  onPress?: () => void;
  horizontal?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Card
      onPress={onPress}
      padded={false}
      style={[styles.card, horizontal && styles.horizontal]}
    >
      <Image source={{ uri: service.imageUrl }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.rowBetween}>
          <Badge
            label={service.type === 'wash' ? t('services.wash') : t('services.repair')}
            tone={service.type === 'wash' ? 'info' : 'brand'}
          />
          <RatingStars value={service.rating} size={14} showValue />
        </View>
        <Text style={[Typography.h4, { color: Palette.text }]} numberOfLines={1}>
          {service.name}
        </Text>
        <Text style={[Typography.caption, { color: Palette.textSecondary }]} numberOfLines={2}>
          {service.description}
        </Text>
        <View style={styles.rowBetween}>
          <Text style={[Typography.bodyBold, { color: Palette.primary }]}>
            {t('common.from')} {formatAmount(service.priceFrom)}
          </Text>
          <Text style={[Typography.small, { color: Palette.textMuted }]}>
            {service.durationMinutes} {t('common.minutes')}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  horizontal: { width: 260 },
  image: { width: '100%', height: 140, backgroundColor: Palette.surface },
  body: { padding: Spacing.md, gap: Spacing.xs },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
