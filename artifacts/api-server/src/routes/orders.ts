import { Router } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import * as ordersController from "../controllers/orders.controller";

const router = Router();

router.get("/orders/:orderCode", asyncHandler(ordersController.getByCode));
router.post("/orders/:orderCode/payment-confirmation", asyncHandler(ordersController.confirmPayment));

export default router;
