import { Router } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import * as shippingController from "../controllers/shipping.controller";

const router = Router();

router.get("/shipping-methods", asyncHandler(shippingController.list));

export default router;
