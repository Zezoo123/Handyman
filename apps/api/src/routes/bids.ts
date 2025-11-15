import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";

export const bidsRouter = Router();

const createBidSchema = z.object({
  jobId: z.string().cuid(),
  providerId: z.string().cuid(),
  amountQAR: z.number().int().positive(),
  message: z.string().optional()
});

bidsRouter.post("/", async (req: Request, res: Response) => {
  const parsed = createBidSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { jobId, providerId, amountQAR, message } = parsed.data;
  try {
    const bid = await prisma.bid.create({
      data: { jobId, providerId, amountQAR, message: message ?? null }
    });
    return res.status(201).json(bid);
  } catch {
    return res.status(500).json({ error: "Failed to create bid" });
  }
});

bidsRouter.post("/:id/accept", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const bid = await prisma.bid.update({
      where: { id },
      data: { status: "ACCEPTED" },
      include: { job: true }
    });
    // assign provider to job and set status
    await prisma.job.update({
      where: { id: bid.jobId },
      data: { providerId: bid.providerId, status: "ACCEPTED" }
    });
    return res.json(bid);
  } catch {
    return res.status(500).json({ error: "Failed to accept bid" });
  }
});


