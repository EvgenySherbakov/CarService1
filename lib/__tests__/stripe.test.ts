import { presentPaymentSheet } from '../stripe';

describe('presentPaymentSheet (mock mode)', () => {
  it('resolves succeeded with a pi_mock_* id for a valid amount', async () => {
    const result = await presentPaymentSheet({
      amount: 250,
      currency: 'BRL',
      description: 'test',
    });

    expect(result.status).toBe('succeeded');
    if (result.status === 'succeeded') {
      expect(result.paymentIntentId).toMatch(/^pi_mock_\d+$/);
    }
  });

  it('rejects a non-positive amount as a failed status (mock guard)', async () => {
    const result = await presentPaymentSheet({
      amount: 0,
      currency: 'BRL',
      description: 'test',
    });

    expect(result.status).toBe('failed');
    if (result.status === 'failed') {
      expect(result.reason).toBe('invalid amount');
    }
  });

  it('also rejects a negative amount', async () => {
    const result = await presentPaymentSheet({
      amount: -10,
      currency: 'BRL',
      description: 'test',
    });

    expect(result.status).toBe('failed');
  });
});
