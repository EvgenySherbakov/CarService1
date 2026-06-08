import { Config } from '@/constants/config';

export type PaymentSheetResult =
  | { status: 'succeeded'; paymentIntentId: string }
  | { status: 'failed'; reason: string }
  | { status: 'cancelled' };

export type PaymentRequest = {
  amount: number;
  currency: string;
  description: string;
  capture?: 'immediate' | 'manual';
};

const isStripeReady = !Config.useMock && !!Config.stripePublishableKey;

/**
 * Presents the Stripe Payment Sheet. In mock mode (no Stripe key)
 * resolves with a fake `pi_mock_*` id after a short delay so the UI
 * flow can be exercised end-to-end.
 */
export async function presentPaymentSheet(req: PaymentRequest): Promise<PaymentSheetResult> {
  if (!isStripeReady) {
    await new Promise((r) => setTimeout(r, 1200));
    if (req.amount <= 0) {
      return { status: 'failed', reason: 'invalid amount' };
    }
    return {
      status: 'succeeded',
      paymentIntentId: `pi_mock_${Date.now()}`,
    };
  }

  return { status: 'failed', reason: 'Stripe backend not configured' };
}
