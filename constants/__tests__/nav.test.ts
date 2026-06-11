import { NAV_ITEMS } from '../nav';

describe('NAV_ITEMS', () => {
  it('contains exactly the five primary tabs', () => {
    expect(NAV_ITEMS.map((i) => i.key)).toEqual([
      'home',
      'services',
      'rentals',
      'bookings',
      'profile',
    ]);
  });

  it('every item has a unique key and a unique href', () => {
    const keys = NAV_ITEMS.map((i) => i.key);
    const hrefs = NAV_ITEMS.map((i) => i.href);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('every i18n label key sits under the tabs.* namespace', () => {
    for (const item of NAV_ITEMS) {
      expect(item.labelKey.startsWith('tabs.')).toBe(true);
    }
  });
});
