import { Router, Request, Response } from "express";
import { prisma } from "../prisma.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });
    return res.json(categories);
  } catch {
    return res.status(500).json({ error: "Failed to load categories" });
  }
});

// Dev convenience: seed baseline categories (only in dev)
categoriesRouter.post("/seed", async (_req: Request, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Not allowed in production" });
  }
  const baseline = [
    { name: "Plumbing", slug: "plumbing" },
    { name: "Electricity", slug: "electricity" },
    { name: "AC & Cooling", slug: "ac-cooling" },
    { name: "Installations", slug: "installations" },
    { name: "Painting", slug: "painting" },
    { name: "Cleaning", slug: "cleaning" }
  ];
  try {
    await Promise.all(
      baseline.map((c) =>
        prisma.category.upsert({
          where: { slug: c.slug },
          create: c,
          update: {}
        })
      )
    );
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return res.json({ ok: true, count: categories.length, categories });
  } catch {
    return res.status(500).json({ error: "Failed to seed categories" });
  }
});


