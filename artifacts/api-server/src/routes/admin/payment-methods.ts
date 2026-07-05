import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import * as ctrl from "../../controllers/admin/payment-methods.controller";

const router = Router();

router.get("/admin/payment-methods", asyncHandler(ctrl.get));
router.put("/admin/payment-methods", asyncHandler(ctrl.update));

export default router;
