import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/useResponsive';
import { Palette, Spacing } from '@/constants/theme';

const MAX_CONTENT = 1080;

/**
 * Standard scrollable page body. Centres content with a max width on
 * desktop so screens read as one clean column instead of a stretched row.
 */
export function Page({
  children,
  scroll = true,
  maxWidth = MAX_CONTENT,
  pad = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  maxWidth?: number;
  pad?: boolean;
}) {
  const { isDesktop } = useResponsive();

  const inner = (
    <View
      style={[
        { width: '100%', alignSelf: 'center' },
        { maxWidth },
        pad && { padding: isDesktop ? Spacing.xl : Spacing.lg },
      ]}
    >
      {children}
    </View>
  );

  if (!scroll) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        {inner}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Spacing.xxl, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {inner}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.background },
});
