import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FlowHeader } from '@/components/layout/FlowHeader';
import { Page } from '@/components/layout/Page';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { companyInfo } from '@/lib/company-data';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export default function ContactScreen() {
  const { t } = useTranslation();
  const c = companyInfo;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    c.mapQuery,
  )}`;

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background }}>
      <FlowHeader title={t('contact.title')} />
      <Page>
        <PageHeader title={t('contact.title')} subtitle={t('contact.subtitle')} />

        <Card padded={false}>
          {c.phones.map((phone, i) => (
            <ContactRow
              key={phone}
              icon="📞"
              label={t('contact.call')}
              value={phone}
              border={i > 0}
              onPress={() => Linking.openURL(`tel:${phone.replace(/[^+\d]/g, '')}`)}
            />
          ))}
          <ContactRow
            icon="💬"
            label={t('contact.whatsapp')}
            value={`+${c.whatsapp}`}
            border
            onPress={() => Linking.openURL(`https://wa.me/${c.whatsapp}`)}
          />
          <ContactRow
            icon="✉️"
            label={t('contact.email')}
            value={c.email}
            border
            onPress={() => Linking.openURL(`mailto:${c.email}`)}
          />
          <ContactRow icon="📍" label={t('contact.address')} value={c.address} border />
          <ContactRow icon="🕐" label={t('contact.hours')} value={t('contact.hoursValue')} border />
        </Card>

        <Text style={[Typography.h3, { marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
          {t('contact.howToFind')}
        </Text>
        <Card padded={false} style={{ overflow: 'hidden' }}>
          <Image source={{ uri: c.mapImageUrl }} style={styles.map} />
          <View style={{ padding: Spacing.md }}>
            <Text style={[Typography.body, { color: Palette.textSecondary, marginBottom: Spacing.sm }]}>
              {c.address}
            </Text>
            <Button
              title={t('contact.openMaps')}
              variant="primary"
              icon={<Text style={{ fontSize: 16 }}>🗺️</Text>}
              onPress={() => Linking.openURL(mapsUrl)}
            />
          </View>
        </Card>
      </Page>
    </View>
  );
}

function ContactRow({
  icon,
  label,
  value,
  onPress,
  border,
}: {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
  border?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[styles.row, border && styles.border]}
    >
      <View style={styles.iconWrap}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[Typography.small, { color: Palette.textMuted }]}>{label}</Text>
        <Text style={[Typography.body, { color: Palette.text }]}>{value}</Text>
      </View>
      {onPress && <Text style={{ color: Palette.textMuted, fontSize: 20 }}>›</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  border: { borderTopWidth: 1, borderTopColor: Palette.border },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: { width: '100%', height: 200, backgroundColor: Palette.surface },
});
