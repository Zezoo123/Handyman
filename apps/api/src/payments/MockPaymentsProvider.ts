import {
  PaymentsProvider,
  CreatePaymentIntentInput,
  CreatePaymentIntentResult,
  CapturePaymentInput,
  RefundPaymentInput
} from "./PaymentsProvider.js";

export class MockPaymentsProvider implements PaymentsProvider {
  getProviderName(): string {
    return "mock";
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult> {
    return {
      provider: this.getProviderName(),
      intentId: `mock_intent_${input.jobId}_${Date.now()}`,
      clientSecret: "mock_secret"
    };
  }

  async capturePayment(_input: CapturePaymentInput): Promise<void> {
    return;
  }

  async refundPayment(_input: RefundPaymentInput): Promise<void> {
    return;
  }
}


