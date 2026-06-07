import { Platform, useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  desktop: 1000,
  wide: 1340,
};

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= BREAKPOINTS.desktop;
  const isWide = isWeb && width >= BREAKPOINTS.wide;
  return { width, height, isWeb, isDesktop, isWide };
}
