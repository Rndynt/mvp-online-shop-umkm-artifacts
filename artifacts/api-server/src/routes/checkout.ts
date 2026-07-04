import { Router } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import * as checkoutController from "../controllers/checkout.controller";

const router = Router();

router.post("/checkout", asyncHandler(checkoutController.create));

export default router;
