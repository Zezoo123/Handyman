import { Router } from "express";
import { jobsRouter } from "./jobs.js";
import { bidsRouter } from "./bids.js";
import { categoriesRouter } from "./categories.js";
import { servicesRouter } from "./services.js";
import { paymentsRouter } from "./payments.js";

export const apiRouter = Router();

apiRouter.use("/jobs", jobsRouter);
apiRouter.use("/bids", bidsRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/services", servicesRouter);
apiRouter.use("/payments", paymentsRouter);


