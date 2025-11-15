import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";

export const jobsRouter = Router();

const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  categoryId: z.string().cuid().optional(),
  subServiceId: z.string().cuid().optional(),
  customerId: z.string().cuid(),
  scheduledAt: z.string().datetime().optional(),
  locationText: z.string().optional(),
  selectedSize: z.string().optional(),
  selectedEquipment: z.array(z.string()).optional(),
  selectedAddons: z.array(z.string()).optional()
}).refine(data => data.categoryId || data.subServiceId, {
  message: "Either categoryId or subServiceId must be provided"
});

jobsRouter.post("/", async (req: Request, res: Response) => {
  const parsed = createJobSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const data = parsed.data;
  try {
    let estimatedPrice: number | null = null;

    if (data.subServiceId) {
      // Verify subService exists and calculate price if pricing options provided
      const subService = await prisma.subService.findUnique({
        where: { id: data.subServiceId },
        include: { pricingConfig: true }
      });
      if (!subService) {
        return res.status(400).json({ error: "SubService not found" });
      }

      // Calculate price if pricing config exists and selections provided
      if (subService.pricingConfig && (data.selectedSize || data.selectedEquipment || data.selectedAddons)) {
        let total = 0;
        const config = subService.pricingConfig;

        if (config.basePrice) {
          total += config.basePrice;
        }

        if (data.selectedSize && config.sizeOptions) {
          const sizeOptions = config.sizeOptions as Array<{ size: string; price: number }>;
          const sizeOption = sizeOptions.find((opt) => opt.size === data.selectedSize);
          if (sizeOption) {
            total += sizeOption.price;
          }
        }

        if (data.selectedEquipment && Array.isArray(data.selectedEquipment) && config.equipmentOptions) {
          const equipmentOptions = config.equipmentOptions as Array<{ name: string; price: number }>;
          data.selectedEquipment.forEach((selected: string) => {
            const option = equipmentOptions.find((opt) => opt.name === selected);
            if (option) {
              total += option.price;
            }
          });
        }

        if (data.selectedAddons && Array.isArray(data.selectedAddons) && config.addons) {
          const addons = config.addons as Array<{ name: string; price: number }>;
          data.selectedAddons.forEach((selected: string) => {
            const addon = addons.find((a) => a.name === selected);
            if (addon) {
              total += addon.price;
            }
          });
        }

        estimatedPrice = total;
      }
    }

    const job = await prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId ?? null,
        subServiceId: data.subServiceId ?? null,
        customerId: data.customerId,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        locationText: data.locationText ?? null,
        selectedSize: data.selectedSize ?? null,
        selectedEquipment: data.selectedEquipment ? data.selectedEquipment : null,
        selectedAddons: data.selectedAddons ? data.selectedAddons : null,
        estimatedPriceQAR: estimatedPrice
      },
      include: {
        subService: {
          include: {
            service: true
          }
        }
      }
    });
    return res.status(201).json(job);
  } catch (err) {
    console.error("Failed to create job:", err);
    return res.status(500).json({ error: "Failed to create job" });
  }
});

jobsRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        bids: true,
        payment: true,
        review: true,
        subService: {
          include: {
            service: true
          }
        }
      }
    });
    if (!job) return res.status(404).json({ error: "Not found" });
    return res.json(job);
  } catch {
    return res.status(500).json({ error: "Failed to load job" });
  }
});

const acceptJobSchema = z.object({
  providerId: z.string().cuid()
});

jobsRouter.post("/:id/accept", async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = acceptJobSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { providerId } = parsed.data;
  try {
    const updated = await prisma.job.update({
      where: { id },
      data: {
        providerId,
        status: "ACCEPTED"
      }
    });
    return res.json(updated);
  } catch {
    return res.status(500).json({ error: "Failed to accept job" });
  }
});


