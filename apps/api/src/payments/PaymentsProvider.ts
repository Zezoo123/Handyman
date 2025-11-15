export type CreatePaymentIntentInput = {
  amountQAR: number;
  currency?: string; // defaults to QAR
  jobId: string;
  customerId: string;
  metadata?: Record<string, string>;
};

export type CreatePaymentIntentResult = {
  provider: string;
  intentId: string;
  clientSecret?: string; // if applicable
  redirectUrl?: string;  // if using hosted checkout
};

export type CapturePaymentInput = {
  intentId: string;
};

export type RefundPaymentInput = {
  paymentId: string;
  amountQAR?: number;
};

export interface PaymentsProvider {
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult>;
  capturePayment(input: CapturePaymentInput): Promise<void>;
  refundPayment(input: RefundPaymentInput): Promise<void>;
  getProviderName(): string;
}


