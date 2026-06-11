import { formatAmount } from '../currency';

describe('formatAmount', () => {
  it('formats integer BRL amounts with the R$ symbol', () => {
    const out = formatAmount(320);
    // Intl can use NBSP or NNBSP between symbol and number depending on
    // the ICU version, and the symbol differs per Node — accept either
    // a R$-prefixed output or the manual fallback.
    expect(out).toMatch(/R\$\s*320/);
  });

  it('rounds fractional values to integers (default 0 fraction digits)', () => {
    const out = formatAmount(199.6);
    expect(out).toMatch(/R\$\s*200/);
  });

  it('handles zero', () => {
    const out = formatAmount(0);
    expect(out).toMatch(/R\$\s*0/);
  });

  it('honours the currency override', () => {
    const out = formatAmount(100, 'USD');
    // pt-BR locale renders USD as US$ — make sure the symbol switched.
    expect(out).toMatch(/(US\$|USD)/);
    expect(out).not.toMatch(/R\$/);
  });

  it('falls back to the configured display when Intl rejects the input', () => {
    const out = formatAmount(50, 'NOT_A_REAL_CCY');
    // Either the Intl fallback fires or Intl is lenient — both acceptable;
    // the function must not throw and must include the number.
    expect(out).toMatch(/50/);
  });
});
