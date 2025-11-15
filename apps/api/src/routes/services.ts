import { Router, Request, Response } from "express";
import { prisma } from "../prisma.js";

export const servicesRouter = Router();

// Get all services
servicesRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        subServices: {
          include: {
            pricingConfig: true
          },
          orderBy: { name: "asc" }
        }
      },
      orderBy: { name: "asc" }
    });
    return res.json(services);
  } catch (error) {
    console.error("Failed to load services:", error);
    return res.status(500).json({ error: "Failed to load services" });
  }
});

// Get a single service with its sub-services
servicesRouter.get("/:slug", async (req: Request, res: Response) => {
  try {
    const service = await prisma.service.findUnique({
      where: { slug: req.params.slug },
      include: {
        subServices: {
          include: {
            pricingConfig: true
          },
          orderBy: { name: "asc" }
        }
      }
    });
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    return res.json(service);
  } catch (error) {
    console.error("Failed to load service:", error);
    return res.status(500).json({ error: "Failed to load service" });
  }
});

// Get a sub-service by ID with pricing config
servicesRouter.get("/sub-service/:id", async (req: Request, res: Response) => {
  try {
    const subService = await prisma.subService.findUnique({
      where: { id: req.params.id },
      include: {
        service: true,
        pricingConfig: true
      }
    });
    if (!subService) {
      return res.status(404).json({ error: "Sub-service not found" });
    }
    return res.json(subService);
  } catch (error) {
    console.error("Failed to load sub-service:", error);
    return res.status(500).json({ error: "Failed to load sub-service" });
  }
});

// Calculate price for a sub-service with selected options
servicesRouter.post("/sub-service/:id/calculate-price", async (req: Request, res: Response) => {
  try {
    const subService = await prisma.subService.findUnique({
      where: { id: req.params.id },
      include: {
        pricingConfig: true
      }
    });
    if (!subService) {
      return res.status(404).json({ error: "Sub-service not found" });
    }

    const { selectedSize, selectedEquipment = [], selectedAddons = [] } = req.body;
    const config = subService.pricingConfig;

    if (!config) {
      return res.status(400).json({ error: "No pricing configuration found for this sub-service" });
    }

    let total = 0;

    // Base price
    if (config.basePrice) {
      total += config.basePrice;
    }

    // Size-based pricing
    if (selectedSize && config.sizeOptions) {
      const sizeOptions = config.sizeOptions as Array<{ size: string; price: number }>;
      const sizeOption = sizeOptions.find((opt) => opt.size === selectedSize);
      if (sizeOption) {
        total += sizeOption.price;
      }
    }

    // Equipment options
    if (Array.isArray(selectedEquipment) && config.equipmentOptions) {
      const equipmentOptions = config.equipmentOptions as Array<{ name: string; price: number }>;
      selectedEquipment.forEach((selected: string) => {
        const option = equipmentOptions.find((opt) => opt.name === selected);
        if (option) {
          total += option.price;
        }
      });
    }

    // Addons
    if (Array.isArray(selectedAddons) && config.addons) {
      const addons = config.addons as Array<{ name: string; price: number }>;
      selectedAddons.forEach((selected: string) => {
        const addon = addons.find((a) => a.name === selected);
        if (addon) {
          total += addon.price;
        }
      });
    }

    return res.json({ totalPriceQAR: total });
  } catch (error) {
    console.error("Failed to calculate price:", error);
    return res.status(500).json({ error: "Failed to calculate price" });
  }
});

// Dev convenience: seed all services and sub-services
servicesRouter.post("/seed", async (_req: Request, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Not allowed in production" });
  }

  const servicesData = [
    {
      name: "Cleaning",
      slug: "cleaning",
      subServices: [
        { name: "For rental hosts only", slug: "rental-hosts-only" },
        { name: "Hourly cleaning", slug: "hourly-cleaning" },
        { name: "Cleaning standard", slug: "cleaning-standard" },
        { name: "Deep cleaning", slug: "deep-cleaning" },
        { name: "After renovations", slug: "after-renovations" },
        { name: "Window cleaning", slug: "window-cleaning" },
        { name: "Ironing", slug: "ironing" },
        { name: "Waiter", slug: "waiter" },
        { name: "Entrance cleaning", slug: "entrance-cleaning" }
      ]
    },
    {
      name: "Plumbing",
      slug: "plumbing",
      subServices: [
        { name: "Pipe repair", slug: "pipe-repair" },
        { name: "Leak fixing", slug: "leak-fixing" },
        { name: "Installation", slug: "installation" },
        { name: "Drain cleaning", slug: "drain-cleaning" }
      ]
    },
    {
      name: "Heating & Cooling",
      slug: "heating-cooling",
      subServices: [
        { name: "AC installation", slug: "ac-installation" },
        { name: "AC repair", slug: "ac-repair" },
        { name: "AC maintenance", slug: "ac-maintenance" },
        { name: "Heating system", slug: "heating-system" }
      ]
    },
    {
      name: "Universal Handyman",
      slug: "universal-handyman",
      subServices: [
        { name: "General repairs", slug: "general-repairs" },
        { name: "Assembly", slug: "assembly" },
        { name: "Mounting", slug: "mounting" },
        { name: "Minor fixes", slug: "minor-fixes" }
      ]
    },
    {
      name: "Appliance",
      slug: "appliance",
      subServices: [
        { name: "Installation", slug: "installation" },
        { name: "Repair", slug: "repair" },
        { name: "Maintenance", slug: "maintenance" }
      ]
    },
    {
      name: "Electricity",
      slug: "electricity",
      subServices: [
        { name: "Wiring", slug: "wiring" },
        { name: "Outlet installation", slug: "outlet-installation" },
        { name: "Light fixture", slug: "light-fixture" },
        { name: "Electrical repair", slug: "electrical-repair" }
      ]
    },
    {
      name: "Doors & Locks",
      slug: "doors-locks",
      subServices: [
        { name: "Lock installation", slug: "lock-installation" },
        { name: "Lock repair", slug: "lock-repair" },
        { name: "Door installation", slug: "door-installation" },
        { name: "Door repair", slug: "door-repair" }
      ]
    },
    {
      name: "Furniture",
      slug: "furniture",
      subServices: [
        { name: "Assembly", slug: "assembly" },
        { name: "Disassembly", slug: "disassembly" },
        { name: "Moving", slug: "moving" },
        { name: "Repair", slug: "repair" }
      ]
    },
    {
      name: "Chemical Cleaning",
      slug: "chemical-cleaning",
      subServices: [
        { name: "Carpet cleaning", slug: "carpet-cleaning" },
        { name: "Upholstery cleaning", slug: "upholstery-cleaning" },
        { name: "Deep sanitization", slug: "deep-sanitization" }
      ]
    },
    {
      name: "IT Services",
      slug: "it-services",
      subServices: [
        { name: "Computer setup", slug: "computer-setup" },
        { name: "Network installation", slug: "network-installation" },
        { name: "Smart home setup", slug: "smart-home-setup" },
        { name: "IT troubleshooting", slug: "it-troubleshooting" }
      ]
    },
    {
      name: "Heavy Lifting & Loading",
      slug: "heavy-lifting-loading",
      subServices: [
        { name: "Moving", slug: "moving" },
        { name: "Loading", slug: "loading" },
        { name: "Unloading", slug: "unloading" },
        { name: "Heavy item transport", slug: "heavy-item-transport" }
      ]
    }
  ];

  try {
    for (const serviceData of servicesData) {
      const { subServices, ...serviceFields } = serviceData;
      const service = await prisma.service.upsert({
        where: { slug: serviceFields.slug },
        create: {
          ...serviceFields,
          subServices: {
            create: subServices
          }
        },
        update: {
          name: serviceFields.name
        }
      });

      // Upsert sub-services
      for (const subServiceData of subServices) {
        const subService = await prisma.subService.upsert({
          where: {
            serviceId_slug: {
              serviceId: service.id,
              slug: subServiceData.slug
            }
          },
          create: {
            ...subServiceData,
            serviceId: service.id
          },
          update: {
            name: subServiceData.name
          }
        });

        // Add pricing config for cleaning services as example
        if (serviceFields.slug === "cleaning" && ["cleaning-standard", "deep-cleaning", "hourly-cleaning"].includes(subServiceData.slug)) {
          const pricingConfigs: Record<string, any> = {
            "cleaning-standard": {
              basePrice: 100,
              sizeOptions: [
                { size: "40m²", price: 0 },
                { size: "60m²", price: 50 },
                { size: "80m²", price: 100 },
                { size: "100m²+", price: 150 }
              ],
              equipmentOptions: [
                { name: "Bring own equipment", price: 30 }
              ],
              addons: [
                { name: "Curtain cleaning", price: 50 },
                { name: "Inside cabinets", price: 30 },
                { name: "Inside fridge", price: 40 }
              ]
            },
            "deep-cleaning": {
              basePrice: 200,
              sizeOptions: [
                { size: "40m²", price: 0 },
                { size: "60m²", price: 80 },
                { size: "80m²", price: 150 },
                { size: "100m²+", price: 250 }
              ],
              equipmentOptions: [
                { name: "Bring own equipment", price: 30 }
              ],
              addons: [
                { name: "Curtain cleaning", price: 50 },
                { name: "Inside cabinets", price: 30 },
                { name: "Inside fridge", price: 40 },
                { name: "Window cleaning", price: 60 }
              ]
            },
            "hourly-cleaning": {
              basePrice: 50,
              sizeOptions: [],
              equipmentOptions: [
                { name: "Bring own equipment", price: 30 }
              ],
              addons: [
                { name: "Curtain cleaning", price: 50 }
              ]
            }
          };

          const config = pricingConfigs[subServiceData.slug];
          if (config) {
            await prisma.pricingConfig.upsert({
              where: { subServiceId: subService.id },
              create: {
                subServiceId: subService.id,
                basePrice: config.basePrice,
                sizeOptions: config.sizeOptions,
                equipmentOptions: config.equipmentOptions,
                addons: config.addons
              },
              update: {
                basePrice: config.basePrice,
                sizeOptions: config.sizeOptions,
                equipmentOptions: config.equipmentOptions,
                addons: config.addons
              }
            });
          }
        }
      }
    }

    const services = await prisma.service.findMany({
      include: {
        subServices: true
      }
    });

    return res.json({
      ok: true,
      count: services.length,
      services
    });
  } catch (error) {
    console.error("Failed to seed services:", error);
    return res.status(500).json({ error: "Failed to seed services" });
  }
});

