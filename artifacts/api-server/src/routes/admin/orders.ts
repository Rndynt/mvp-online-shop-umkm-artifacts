import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import * as ordersController from "../../controllers/admin/orders.controller";

const router = Router();

router.get("/admin/orders", asyncHandler(ordersController.list));
router.get("/admin/orders/:orderCode", asyncHandler(ordersController.get));
router.patch("/admin/orders/:orderCode/status", asyncHandler(ordersController.updateStatus));

export default router;
