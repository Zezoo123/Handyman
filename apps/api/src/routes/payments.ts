import { Router, Request, Response } from "express";
import { z } from "zod";
import { MockPaymentsProvider } from "../payments/MockPaymentsProvider.js";

const provider = new MockPaymentsProvider();
export const paymentsRouter = Router();

const intentSchema = z.object({
  amountQAR: z.number().int().positive(),
  jobId: z.string().cuid(),
  customerId: z.string().cuid(),
  metadata: z.record(z.string()).optional()
});

paymentsRouter.post("/intent", async (req: Request, res: Response) => {
  const parsed = intentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  try {
    const result = await provider.createPaymentIntent(parsed.data);
    return res.status(201).json(result);
  } catch {
    return res.status(500).json({ error: "Failed to create payment intent" });
  }
});


