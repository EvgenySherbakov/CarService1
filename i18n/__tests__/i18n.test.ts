import en from '../en.json';
import ru from '../ru.json';
import ptBR from '../pt-BR.json';

type Json = Record<string, unknown>;

function collectKeys(obj: Json, prefix = ''): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...collectKeys(v as Json, key));
    } else {
      out.push(key);
    }
  }
  return out.sort();
}

const enKeys = collectKeys(en as Json);
const ruKeys = collectKeys(ru as Json);
const ptKeys = collectKeys(ptBR as Json);

describe('i18n bundles', () => {
  it('English and Russian have exactly the same key set', () => {
    expect(ruKeys).toEqual(enKeys);
  });

  it('English and pt-BR have exactly the same key set', () => {
    expect(ptKeys).toEqual(enKeys);
  });

  it('every leaf is a non-empty string', () => {
    function check(obj: Json, prefix = ''): void {
      for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          check(v as Json, key);
        } else {
          expect(typeof v).toBe('string');
          expect((v as string).length).toBeGreaterThan(0);
        }
      }
    }
    check(en as Json);
    check(ru as Json);
    check(ptBR as Json);
  });

  it('exposes the booking namespace introduced for the dual payment flow', () => {
    expect(enKeys).toEqual(expect.arrayContaining([
      'booking.payAtOffice',
      'booking.payNow',
      'booking.confirmBooking',
      'booking.confirmRental',
      'booking.successTitle',
    ]));
  });
});
